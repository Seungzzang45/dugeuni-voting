'use client'

import React, { useState } from 'react'
import styles from './LineupBuilder.module.css'
import BaseballField from './BaseballField'
import { saveLineup } from '@/app/actions'

interface LineupBuilderProps {
  pollId: string
  initialLineup: any[]
  members: any[]
  attendVotes: any[]
}

const POSITIONS = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH', 'BENCH']

export default function LineupBuilder({ pollId, initialLineup, members, attendVotes }: LineupBuilderProps) {
  const [lineup, setLineup] = useState(() => {
    const defaultData = Array.from({ length: 10 }, (_, i) => ({
      order: i + 1,
      memberId: '',
      position: ''
    }))

    initialLineup.forEach(l => {
      if (l.order >= 1 && l.order <= 10) {
        defaultData[l.order - 1] = {
          order: l.order,
          memberId: l.memberId || '',
          position: l.position || ''
        }
      }
    })
    return defaultData
  })

  // Prepare view format for BaseballField
  const fieldLineup = lineup.map(l => ({
    order: l.order,
    position: l.position || null,
    member: l.memberId ? { name: members.find(m => m.id === l.memberId)?.name || '' } : null
  }))

  const handleChange = (order: number, field: 'memberId' | 'position', value: string) => {
    setLineup(prev => prev.map(item => 
      item.order === order ? { ...item, [field]: value } : item
    ))
  }

  const handleSave = async () => {
    const payload = lineup.map(l => ({
      order: l.order,
      memberId: l.memberId || null,
      position: l.position || null
    }))
    await saveLineup(pollId, payload)
    alert('라인업이 저장되었습니다.')
  }

  return (
    <div className={styles.builderContainer}>
      <div className={styles.title}>⚾ 관리자 라인업 작성 (1~9타순)</div>
      
      <div className={styles.grid}>
        {/* Left/Top: The Baseball Field Viewer */}
        <div>
          <BaseballField lineup={fieldLineup} />
          
          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: 'bold', color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>✅ 현재 참석자 명단 ({attendVotes.length}명)</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {attendVotes.length === 0 && <span style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>참석자가 없습니다.</span>}
              {attendVotes.map((v: any) => (
                <span key={v.id} style={{ padding: '0.25rem 0.5rem', backgroundColor: 'var(--attend-color)', color: 'white', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                  {v.member.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right/Bottom: The Form */}
        <div>
          <div className={styles.tableContainer}>
            <div className={styles.tableRow}>
              <div className={styles.tableHeader} style={{textAlign: 'center'}}>타순</div>
              <div className={styles.tableHeader}>선수</div>
              <div className={styles.tableHeader}>포지션</div>
            </div>
            {lineup.map(row => (
              <div className={styles.tableRow} key={row.order}>
                <div className={`${styles.cell} ${styles.orderNumber}`}>
                  {row.order === 10 ? '투수' : row.order}
                </div>
                <div className={styles.cell}>
                  <select 
                    className={styles.select} 
                    value={row.memberId} 
                    onChange={e => handleChange(row.order, 'memberId', e.target.value)}
                  >
                    <option value="">- 선택 -</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.cell}>
                  <select 
                    className={styles.select} 
                    value={row.position} 
                    onChange={e => handleChange(row.order, 'position', e.target.value)}
                  >
                    <option value="">- 포지션 -</option>
                    {POSITIONS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
          <button onClick={handleSave} className={styles.saveButton}>저장하기</button>
        </div>
      </div>
    </div>
  )
}
