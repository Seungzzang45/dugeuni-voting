import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()


const members = [
  "신승우", "전계훈", "홍경택", "신광덕", "윤민환",
  "안황기", "신세휘", "이호겸", "김덕겸", "김상훈",
  "나인철", "김현진", "양성철", "엄민영", "이원중", "배성권"
]

const games = [
  { date: "2026-02-27T22:00:00+09:00", title: "02/27(금) 22:00 vs R2B 바이퍼즈", opponent: "R2B 바이퍼즈", homeAway: "3루 선공" },
  { date: "2026-03-13T19:50:00+09:00", title: "03/13(금) 19:50 vs 인천하이에나", opponent: "인천하이에나", homeAway: "1루 후공" },
  { date: "2026-03-26T22:00:00+09:00", title: "03/26(목) 22:00 vs 겸손", opponent: "겸손", homeAway: "3루 선공" },
  { date: "2026-04-06T19:50:00+09:00", title: "04/06(월) 19:50 vs Bullies", opponent: "Bullies", homeAway: "1루 후공" },
  { date: "2026-04-21T22:00:00+09:00", title: "04/21(화) 22:00 vs 미쁘다디자인", opponent: "미쁘다디자인", homeAway: "3루 선공" },
  { date: "2026-05-04T22:00:00+09:00", title: "05/04(월) 22:00 vs 겸손", opponent: "겸손", homeAway: "1루 후공" },
  { date: "2026-05-11T19:50:00+09:00", title: "05/11(월) 19:50 vs Bullies", opponent: "Bullies", homeAway: "3루 선공" },
  { date: "2026-05-19T19:50:00+09:00", title: "05/19(화) 19:50 vs 미쁘다디자인", opponent: "미쁘다디자인", homeAway: "1루 후공" },
  { date: "2026-05-29T22:00:00+09:00", title: "05/29(금) 22:00 vs 인천하이에나", opponent: "인천하이에나", homeAway: "3루 선공" },
  { date: "2026-06-25T22:00:00+09:00", title: "06/25(목) 22:00 vs R2B 바이퍼즈", opponent: "R2B 바이퍼즈", homeAway: "1루 후공" }
]

async function main() {
  console.log('Seeding Database...')

  for (const name of members) {
    await prisma.member.upsert({
      where: { name },
      update: {},
      create: { name }
    })
  }

  for (const game of games) {
    // Only create if we don't have a game with exact same start time and opponent
    const existing = await prisma.poll.findFirst({
      where: { 
        opponent: game.opponent, 
        startTime: new Date(game.date),
        type: "GAME"
      }
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
