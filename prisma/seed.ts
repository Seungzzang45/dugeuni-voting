import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const members = [
  "신승우", "전계훈", "홍경택", "신광덕", "윤민환",
  "안황기", "신세휘", "이호겸", "김덕겸", "김상훈",
  "나인철", "김현진", "양성철", "엄민영", "이원중", "배성권", "김학래", "이광석", "문대웅"
]

const games = [
  { date: "2026-02-27T22:00:00+09:00", title: "02/27(금) 22:00 vs R2B 바이퍼즈", opponent: "R2B 바이퍼즈", homeAway: "3루 선공" },
  { date: "2026-03-13T19:50:00+09:00", title: "03/13(금) 19:50 vs 인천하이에나", opponent: "인천하이에나", homeAway: "1루 후공" },
  { date: "2026-03-26T22:00:00+09:00", title: "03/26(목) 22:00 vs 겸손", opponent: "겸손", homeAway: "3루 선공" },
  { date: "2026-04-06T19:50:00+09:00", title: "04/06(월) 19:50 vs Bullies", opponent: "Bullies", homeAway: "1루 후공" },
  { date: "2026-04-23T22:00:00+09:00", title: "04/23(목) 22:00 vs 미쁘다디자인", opponent: "미쁘다디자인", homeAway: "3루 선공" },
  { date: "2026-05-04T22:00:00+09:00", title: "05/04(월) 22:00 vs 겸손", opponent: "겸손", homeAway: "1루 후공" },
  { date: "2026-05-11T19:50:00+09:00", title: "05/11(월) 19:50 vs Bullies", opponent: "Bullies", homeAway: "3루 선공" },
  { date: "2026-05-19T19:50:00+09:00", title: "05/19(화) 19:50 vs 미쁘다디자인", opponent: "미쁘다디자인", homeAway: "1루 후공" },
  { date: "2026-05-29T22:00:00+09:00", title: "05/29(금) 22:00 vs 다크나이츠", opponent: "다크나이츠", homeAway: "3루 선공" },
  { date: "2026-06-25T22:00:00+09:00", title: "06/25(목) 22:00 vs R2B 바이퍼즈", opponent: "R2B 바이퍼즈", homeAway: "1루 후공" }
]

// 날짜/제목이 변경된 경우 기존 레코드를 업데이트하는 마이그레이션 목록
const migrations = [
  {
    oldTitle: "04/21(화) 22:00 vs 미쁘다디자인",
    newTitle: "04/23(목) 22:00 vs 미쁘다디자인",
    newDate: "2026-04-23T22:00:00+09:00",
    newOpponent: "미쁘다디자인",
  },
  {
    oldTitle: "05/29(금) 22:00 vs 인천하이에나",
    newTitle: "05/29(금) 22:00 vs 다크나이츠",
    newDate: "2026-05-29T22:00:00+09:00",
    newOpponent: "다크나이츠",
  }
]

async function main() {
  console.log('Seeding Database...')

  // 멤버 upsert
  for (const name of members) {
    await prisma.member.upsert({
      where: { name },
      update: {},
      create: { name }
    })
  }

  // 날짜/제목 변경 마이그레이션
  for (const migration of migrations) {
    const game = await prisma.poll.findFirst({
      where: { title: migration.oldTitle, type: "GAME" }
    })
    if (game) {
      await prisma.poll.update({
        where: { id: game.id },
        data: {
          title: migration.newTitle,
          startTime: new Date(migration.newDate),
          opponent: migration.newOpponent ?? game.opponent,
        }
      })
      console.log(`Updated: "${migration.oldTitle}" → "${migration.newTitle}"`)
    }
  }

  // 중복된 GAME 투표 제거 (같은 title이 여러 개면 투표 수 많은 것 유지, 나머지 삭제)
  for (const game of games) {
    const dupes = await prisma.poll.findMany({
      where: { title: game.title, type: "GAME" },
      include: { _count: { select: { votes: true } } },
      orderBy: { createdAt: 'asc' }
    })
    if (dupes.length > 1) {
      const sorted = [...dupes].sort((a, b) => b._count.votes - a._count.votes)
      for (const dupe of sorted.slice(1)) {
        await prisma.poll.delete({ where: { id: dupe.id } })
        console.log(`중복 삭제: "${game.title}"`)
      }
    }
  }

  // 게임 생성 (title 기준으로 없으면 생성)
  for (const game of games) {
    const existing = await prisma.poll.findFirst({
      where: { title: game.title, type: "GAME" }
    })

    if (!existing) {
      await prisma.poll.create({
        data: {
          title: game.title,
          opponent: game.opponent,
          homeAway: game.homeAway,
          startTime: new Date(game.date),
          type: "GAME"
        }
      })
    }
  }

  console.log('Seed successful.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
