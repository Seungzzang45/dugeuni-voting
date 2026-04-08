'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function getMembers() {
  return await prisma.member.findMany({
    orderBy: { name: 'asc' }
  })
}

export async function getPolls() {
  const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000)

  // Fetch all games
  const allGames = await prisma.poll.findMany({
    where: { type: 'GAME' },
    orderBy: { startTime: 'asc' },
    include: {
      manager: true,
      votes: { include: { member: true } },
      comments: { include: { member: true }, orderBy: { createdAt: 'asc' } },
      lineups: { include: { member: true }, orderBy: { order: 'asc' } }
    }
  })

  const customPolls = await prisma.poll.findMany({
    where: { type: 'CUSTOM' },
    orderBy: { createdAt: 'desc' },
    include: {
      manager: true,
      votes: { include: { member: true } },
      comments: { include: { member: true }, orderBy: { createdAt: 'asc' } },
      lineups: { include: { member: true }, orderBy: { order: 'asc' } }
    }
  })

  // Separate active and past
  // Active means game hasn't happened yet + the active ones.
  // We want the strictly NEXT upcoming game and all future games as 'active'? 
  // No, the prompt says "투표가 2개가 진행되는 경우에는... 지난투표목록도 보일수 있도록"
  // So all games strictly BEFORE threeHoursAgo are past. The rest are active.
  const pastPolls = allGames.filter(g => g.startTime < threeHoursAgo)
  const activePolls = allGames.filter(g => g.startTime >= threeHoursAgo)

  // Custom polls without a clear startTime expiry can be active, 
  // or maybe we add them all to active polls.
  activePolls.push(...customPolls)

  return { activePolls, pastPolls }
}

export async function castVote(pollId: string, memberId: string, status: string) {
  await prisma.vote.upsert({
    where: {
      pollId_memberId: {
        pollId,
        memberId
      }
    },
    update: {
      status
    },
    create: {
      pollId,
      memberId,
      status
    }
  })
  revalidatePath('/')
}

export async function cancelVote(pollId: string, memberId: string) {
  await prisma.vote.delete({
    where: {
      pollId_memberId: {
        pollId,
        memberId
      }
    }
  }).catch(() => {}) // ignore if not found
  revalidatePath('/')
}

export async function addComment(pollId: string, memberId: string, content: string) {
  if (!content.trim()) return

  await prisma.comment.create({
    data: {
      pollId,
      memberId,
      content: content.trim()
    }
  })
  revalidatePath('/')
}

export async function updateManager(pollId: string, managerId: string) {
  await prisma.poll.update({
    where: { id: pollId },
    data: { managerId }
  })
  revalidatePath('/')
}

export async function createCustomPoll(title: string) {
  await prisma.poll.create({
    data: {
      title,
      type: 'CUSTOM',
      startTime: new Date(), // Just current time for custom
    }
  })
  revalidatePath('/')
}

export async function deletePollAndRevalidate(pollId: string) {
  await prisma.poll.delete({
    where: { id: pollId }
  })
  revalidatePath('/')
}

export async function saveLineup(pollId: string, lineup: { order: number; memberId: string | null; position: string | null }[]) {
  // We use a transaction to delete old lineups and insert new ones
  await prisma.$transaction([
    prisma.lineupEntry.deleteMany({ where: { pollId } }),
    prisma.lineupEntry.createMany({
      data: lineup.map(entry => ({
        pollId,
        order: entry.order,
        memberId: entry.memberId,
        position: entry.position
      }))
    })
  ])
  revalidatePath('/')
}
