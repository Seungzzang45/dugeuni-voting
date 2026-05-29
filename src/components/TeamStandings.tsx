'use client'

import React from 'react'
import styles from './RankingsModal.module.css'

export interface TeamStanding {
  rank: number
  team: string
  games: number
  points: number
  win: number
  loss: number
  draw: number
  rate: number
  gap: number
  highlight?: boolean
}

// 팀 순위 (승점제) — RankingsModal과 공유
export const teamStandings: TeamStanding[] = [
  { rank: 1, team: '겸손', games: 6, points: 18, win: 6, loss: 0, draw: 0, rate: 1.00, gap: 0.00 },
  { rank: 2, team: 'Bullies', games: 7, points: 15, win: 5, loss: 2, draw: 0, rate: 0.71, gap: 1.50 },
  { rank: 3, team: '두근이', games: 8, points: 12, win: 4, loss: 4, draw: 0, rate: 0.50, gap: 3.00, highlight: true },
  { rank: 4, team: 'R2B 바이퍼즈', games: 6, points: 9, win: 3, loss: 3, draw: 0, rate: 0.50, gap: 3.00 },
  { rank: 4, team: '미쁘다디자인', games: 7, points: 9, win: 3, loss: 4, draw: 0, rate: 0.43, gap: 3.50 },
  { rank: 6, team: '다크나이츠', games: 8, points: 0, win: 0, loss: 8, draw: 0, rate: 0.00, gap: 7.00 },
]

export const standingsUpdatedAt = '2026년 5월 29일'

interface TeamStandingsProps {
  showTitle?: boolean
}

export default function TeamStandings({ showTitle = true }: TeamStandingsProps) {
  return (
    <section className={styles.section}>
      {showTitle && (
        <div className={styles.sectionTitle}>⚾ 팀 순위 (평일야간 챌린저B · 승점제)</div>
      )}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>순위</th>
              <th style={{ textAlign: 'left' }}>팀명</th>
              <th>게임수</th>
              <th>승점</th>
              <th>승</th>
              <th>패</th>
              <th>무</th>
              <th>승률</th>
              <th>게임차</th>
            </tr>
          </thead>
          <tbody>
            {teamStandings.map((t, i) => (
              <tr key={i} className={t.highlight ? styles.highlight : ''}>
                <td>{t.rank}</td>
                <td style={{ textAlign: 'left', fontWeight: t.highlight ? 800 : 600 }}>{t.team}</td>
                <td>{t.games}</td>
                <td className={styles.pointCol}>{t.points}</td>
                <td>{t.win}</td>
                <td>{t.loss}</td>
                <td>{t.draw}</td>
                <td>{t.rate.toFixed(2)}</td>
                <td>{t.gap.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
