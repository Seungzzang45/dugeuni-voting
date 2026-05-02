'use client'

import React from 'react'
import styles from './RankingsModal.module.css'
import { X } from 'lucide-react'

interface RankingsModalProps {
  onClose: () => void
}

// 팀 순위 (승점제)
const teamStandings = [
  { rank: 1, team: '겸손', games: 4, points: 12, win: 4, loss: 0, draw: 0, rate: 1.00, gap: 0.00 },
  { rank: 1, team: '두근이', games: 5, points: 12, win: 4, loss: 1, draw: 0, rate: 0.80, gap: 0.50, highlight: true },
  { rank: 3, team: 'Bullies', games: 5, points: 9, win: 3, loss: 2, draw: 0, rate: 0.60, gap: 1.50 },
  { rank: 4, team: '미쁘다디자인', games: 5, points: 6, win: 2, loss: 3, draw: 0, rate: 0.40, gap: 2.50 },
  { rank: 4, team: 'R2B 바이퍼즈', games: 5, points: 6, win: 2, loss: 3, draw: 0, rate: 0.40, gap: 2.50 },
  { rank: 6, team: '다크나이츠', games: 6, points: 0, win: 0, loss: 6, draw: 0, rate: 0.00, gap: 5.00 },
]

// 타자 순위 (타율)
const battingRankings = [
  { rank: 1, name: '김덕겸', avg: 0.800 },
  { rank: 2, name: '안황기', avg: 0.600 },
  { rank: 2, name: '신세휘', avg: 0.600 },
  { rank: 4, name: '신승우', avg: 0.545 },
  { rank: 5, name: '엄민영', avg: 0.500 },
  { rank: 5, name: '이호겸', avg: 0.500 },
  { rank: 5, name: '이광석', avg: 0.500 },
  { rank: 5, name: '양성철', avg: 0.500 },
  { rank: 9, name: '전계훈', avg: 0.455 },
  { rank: 10, name: '나인철', avg: 0.444 },
  { rank: 10, name: '윤민환', avg: 0.444 },
  { rank: 12, name: '홍경택', avg: 0.429 },
  { rank: 12, name: '김상훈', avg: 0.429 },
  { rank: 14, name: '문대웅', avg: 0.364 },
  { rank: 14, name: '김학래', avg: 0.364 },
  { rank: 16, name: '김현진', avg: 0.250 },
  { rank: 17, name: '이원중', avg: 0.000 },
]

// 투수 순위 (다승, 방어율)
const pitchingRankings = [
  { rank: 1, name: '이광석', wins: 2, era: 2.10 },
  { rank: 2, name: '문대웅', wins: 2, era: 11.31 },
  { rank: 3, name: '신승우', wins: 0, era: 49.00 },
  { rank: 3, name: '김현진', wins: 0, era: 49.00 },
]

export default function RankingsModal({ onClose }: RankingsModalProps) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <div className={styles.title}>🏆 팀 & 선수 기록</div>
            <div className={styles.updateNote}>수동 업데이트: 2026년 5월 2일 기준</div>
          </div>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={22} />
          </button>
        </div>

        <div className={styles.content}>
          {/* 팀 순위 */}
          <section className={styles.section}>
            <div className={styles.sectionTitle}>⚾ 팀 순위 (평일야간 챌린저B · 승점제)</div>
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

          {/* 타자 순위 */}
          <section className={styles.section}>
            <div className={styles.sectionTitle}>🏏 두근이 타자 순위 (타율)</div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>순위</th>
                    <th style={{ textAlign: 'left' }}>선수</th>
                    <th>타율</th>
                  </tr>
                </thead>
                <tbody>
                  {battingRankings.map((p, i) => (
                    <tr key={i}>
                      <td>{p.rank}</td>
                      <td style={{ textAlign: 'left', fontWeight: 600 }}>{p.name}</td>
                      <td className={styles.statCol}>{p.avg.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 투수 순위 */}
          <section className={styles.section}>
            <div className={styles.sectionTitle}>🥎 두근이 투수 순위 (다승 · 방어율)</div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>순위</th>
                    <th style={{ textAlign: 'left' }}>선수</th>
                    <th>다승</th>
                    <th>방어율</th>
                  </tr>
                </thead>
                <tbody>
                  {pitchingRankings.map((p, i) => (
                    <tr key={i}>
                      <td>{p.rank}</td>
                      <td style={{ textAlign: 'left', fontWeight: 600 }}>{p.name}</td>
                      <td className={styles.statCol}>{p.wins}</td>
                      <td className={styles.statCol}>{p.era.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
