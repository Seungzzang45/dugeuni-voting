'use client'

import React, { useState } from 'react'
import Header from './Header'
import PollCard from './PollCard'
import styles from './Dashboard.module.css'
import { createCustomPoll, deletePollAndRevalidate } from '@/app/actions'
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react'

interface DashboardProps {
  members: any[]
  initialPolls: any[]
  pastPolls?: any[] // Optional for backward compatibility during transitions
}

export default function Dashboard({ members, initialPolls, pastPolls = [] }: DashboardProps) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  
  // Create Poll Form State
  const [newPollTitle, setNewPollTitle] = useState('')

  // Accordion state - default to first active poll
  const [expandedPollId, setExpandedPollId] = useState<string | null>(initialPolls.length > 0 ? initialPolls[0].id : null)
  const togglePoll = (id: string) => {
    setExpandedPollId(prev => (prev === id ? null : id))
  }

  const handleAdminAuth = () => {
    if (isAdmin) {
      setIsAdmin(false)
      setAdminPassword('')
      return
    }
    
    if (adminPassword === '0070') {
      setIsAdmin(true)
    } else {
      const pwd = prompt('관리자 비밀번호를 입력하세요:')
      if (pwd === '0070') {
        setIsAdmin(true)
      } else if (pwd !== null) {
        alert('비밀번호가 틀렸습니다.')
      }
    }
  }

  const handleCreateCustomPoll = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPollTitle.trim()) return
    await createCustomPoll(newPollTitle)
    setNewPollTitle('')
    alert('새로운 투표가 추가되었습니다.')
  }

  const renderPollAccordion = (poll: any, isExpanded: boolean) => {
    return (
      <div key={poll.id} style={{ marginBottom: isExpanded ? '2rem' : '0' }}>
        {!isExpanded && (
          <div className={styles.accordionHeader} onClick={() => togglePoll(poll.id)}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ChevronRight size={20} style={{ marginRight: '8px' }} />
              {poll.title}
              {poll.homeAway && <span className={styles.badge}>{poll.homeAway}</span>}
              <span style={{ marginLeft: '1rem', color: 'var(--accent-gold)', fontSize: '0.9rem' }}>
                투표자: {poll.votes.length}명
              </span>
            </div>
            {isAdmin && (
              <button 
                onClick={(e) => { e.stopPropagation(); deletePollAndRevalidate(poll.id); }}
                style={{ background: 'transparent', color: '#ff4d4f', border: 'none', cursor: 'pointer' }}
                title="투표 삭제"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        )}
        
        {isExpanded && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
              <button 
                onClick={() => togglePoll(poll.id)}
                style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', background: 'transparent' }}
              >
                접기 <ChevronDown size={16} />
              </button>
            </div>
            <PollCard poll={poll} members={members} isAdmin={isAdmin} />
            {isAdmin && (
              <div style={{ textAlign: 'right', marginTop: '-1rem', marginBottom: '2rem' }}>
                <button 
                  onClick={() => deletePollAndRevalidate(poll.id)}
                  style={{ background: '#ffeeee', color: '#ff4d4f', border: '1px solid #ff4d4f', padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
                >
                  이 투표 전체 삭제
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={styles.dashboard}>
      <Header isAdmin={isAdmin} onToggleAdmin={handleAdminAuth} />

      {isAdmin && (
        <div className={styles.adminPanel}>
          <div className={styles.adminPanelTitle}>🛡️ 커스텀 투표 생성</div>
          <form onSubmit={handleCreateCustomPoll}>
            <div className={styles.formGroup}>
              <input 
                type="text" 
                className={styles.input} 
                placeholder="예: 회식 장소 투표, 긴급 훈련 참석 조사 등"
                value={newPollTitle}
                onChange={e => setNewPollTitle(e.target.value)}
              />
            </div>
            <button type="submit" className={styles.button}>투표 만들기</button>
          </form>
        </div>
      )}

      {initialPolls.length === 0 && pastPolls.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          현재 등록된 투표가 없습니다.
        </div>
      )}

      {initialPolls.length > 0 && (
        <div>
          <div className={styles.sectionTitle}>🔥 진행 중인 투표</div>
          {initialPolls.map(poll => renderPollAccordion(poll, expandedPollId === poll.id))}
        </div>
      )}

      {pastPolls.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <div className={styles.sectionTitle} style={{ color: 'var(--text-secondary)', borderBottomColor: 'var(--text-secondary)' }}>
            📁 지난 투표 목록
          </div>
          {pastPolls.map(poll => renderPollAccordion(poll, expandedPollId === poll.id))}
        </div>
      )}
    </div>
  )
}
