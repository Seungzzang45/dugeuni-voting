'use client'

import React, { useState } from 'react'
import styles from './PollCard.module.css'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { castVote, cancelVote, addComment, updateManager } from '@/app/actions'
import LineupBuilder from './LineupBuilder'
import BaseballField from './BaseballField'

interface PollCardProps {
  poll: any
  members: any[]
  isAdmin: boolean
}

export default function PollCard({ poll, members, isAdmin }: PollCardProps) {
  const [selectedMember, setSelectedMember] = useState<{id: string, name: string} | null>(null)
  
  const [commentName, setCommentName] = useState('')
  const [commentText, setCommentText] = useState('')

  const votes = poll.votes || []
  const attendVotes = votes.filter((v: any) => v.status === 'ATTEND')
  const absentVotes = votes.filter((v: any) => v.status === 'ABSENT')
  const spectateVotes = votes.filter((v: any) => v.status === 'SPECTATE')

  const votedMemberIds = new Set(votes.map((v: any) => v.memberId))
  const nonVoters = members.filter(m => !votedMemberIds.has(m.id))

  const handleVoteSubmit = async (status: string) => {
    if (!selectedMember) return
    await castVote(poll.id, selectedMember.id, status)
    setSelectedMember(null)
  }

  const handleCancelLineupOrVote = async (memberId: string) => {
    if (confirm('투표를 취소하시겠습니까?')) {
      await cancelVote(poll.id, memberId)
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentName) return alert('작성자를 선택해주세요.')
    if (!commentText.trim()) return alert('댓글 내용을 입력해주세요.')
    
    await addComment(poll.id, commentName, commentText)
    setCommentText('')
  }

  const handleManagerChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await updateManager(poll.id, e.target.value)
  }

  const renderVoterList = (title: string, colorClass: string, voters: any[]) => (
    <div style={{ marginBottom: '2rem' }}>
      <div className={`${styles.sectionTitle} ${colorClass}`}>
        {title} ({voters.length})
      </div>
      <div className={styles.votersList} style={{ gap: '0.5rem' }}>
        {voters.length === 0 && <p className={styles.voterNone}>해당자가 없습니다.</p>}
        {voters.map((v: any) => (
          <button 
            key={v.id} 
            className={`${styles.voterBadge} ${styles.voterBadgeSmall} ${colorClass}`}
            onClick={() => handleCancelLineupOrVote(v.memberId)}
            title="클릭하여 투표 취소"
          >
            {v.member.name}
          </button>
        ))}
      </div>
    </div>
  )

  const fieldLineup = poll.lineups?.map((l:any) => ({
    order: l.order,
    position: l.position || null,
    member: l.member ? { name: l.member.name } : null
  })) || []

  const hasLineup = fieldLineup.length > 0

  return (
    <div className={`${styles.card} animate-fade-in`}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span>{poll.title}</span>
          {poll.homeAway && <span className={styles.homeAwayBadge}>{poll.homeAway}</span>}
        </div>
        <div className={styles.managerInfo}>
          {isAdmin ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
              <span>감독: </span>
              <select className={styles.managerSelect} value={poll.managerId || ''} onChange={handleManagerChange}>
                <option value="">-- 미정 --</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          ) : (
            <span style={{ fontSize: '1.1rem' }}>이번 게임 감독: <strong style={{ fontSize: '1.15rem', backgroundColor: 'var(--accent-blue)', color: '#ffffff', padding: '0.25rem 0.75rem', borderRadius: '6px', marginLeft: '6px', display: 'inline-block' }}>{poll.manager ? poll.manager.name : '미정'}</strong></span>
          )}
        </div>
      </div>

      <div className={styles.body}>
        {/* NON-VOTERS UP TOP FOR EASY MOBILE TAP */}
        <div className={styles.sectionTitle} style={{ color: 'var(--accent-gold)' }}>
          미투표자 목록 <span style={{fontSize: '0.8rem', fontWeight: 'normal'}}>(이름을 터치하세요!)</span>
        </div>
        <div className={styles.votersList}>
          {nonVoters.length === 0 && <p className={styles.voterNone}>모든 인원이 투표를 완료했습니다.</p>}
          {nonVoters.map(m => (
             <button 
               key={m.id} 
               className={styles.voterBadge}
               onClick={() => setSelectedMember(m)}
             >
               {m.name}
             </button>
          ))}
        </div>

        {/* VERTICAL LISTING OF VOTERS */}
        <div style={{ marginTop: '3rem' }}>
          {renderVoterList('참가', styles.voterAttend, attendVotes)}
          {renderVoterList('불참', styles.voterAbsent, absentVotes)}
          {renderVoterList('구경', styles.voterSpectate, spectateVotes)}
        </div>
        
        {/* LINEUP VIEWER / BUILDER */}
        <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          {isAdmin ? (
            <LineupBuilder pollId={poll.id} initialLineup={poll.lineups || []} members={members} attendVotes={attendVotes} />
          ) : hasLineup ? (
            <>
              <div className={styles.sectionTitle} style={{ color: 'var(--accent-gold)' }}>야구장 오더 보드</div>
              <BaseballField lineup={fieldLineup} />
            </>
          ) : (
            <div className={styles.sectionTitle} style={{ color: 'var(--text-secondary)' }}>라인업 대기 중...</div>
          )}
        </div>

        {/* COMMENTS */}
        <div className={styles.comments}>
          <div className={styles.sectionTitle}>댓글 ({poll.comments.length})</div>
          <div>
            {poll.comments.map((c: any) => (
              <div key={c.id} className={styles.commentItem}>
                <div className={styles.commentHeader}>
                  <span className={styles.commentName}>{c.member.name}</span>
                  <span className={styles.commentDate}>{format(new Date(c.createdAt), 'MM월 dd일 HH:mm', { locale: ko })}</span>
                </div>
                <div>{c.content}</div>
              </div>
            ))}
          </div>

          <form className={styles.commentForm} onSubmit={handleComment}>
            <select className={styles.commentSelect} value={commentName} onChange={e => setCommentName(e.target.value)}>
              <option value="">이름 선택</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <input 
              type="text" 
              className={styles.commentInput} 
              placeholder="댓글을 남겨주세요"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
            />
            <button type="submit" className={styles.commentButton}>등록</button>
          </form>
        </div>
      </div>

      {/* BOTTOM SHEET FOR VOTING */}
      {selectedMember && (
        <div className={styles.bottomSheetOverlay} onClick={() => setSelectedMember(null)}>
          <div className={`${styles.bottomSheet} animate-slide-up`} onClick={e => e.stopPropagation()}>
            <div className={styles.sheetTitle}>
              <span style={{color: 'var(--accent-gold)'}}>{selectedMember.name}</span> 님, <br/>투표 상태를 선택해주세요.
            </div>
            <div className={styles.sheetButtons}>
              <button className={`${styles.sheetBtn} ${styles.btnAttend}`} onClick={() => handleVoteSubmit('ATTEND')}>참석</button>
              <button className={`${styles.sheetBtn} ${styles.btnAbsent}`} onClick={() => handleVoteSubmit('ABSENT')}>불참</button>
              <button className={`${styles.sheetBtn} ${styles.btnSpectate}`} onClick={() => handleVoteSubmit('SPECTATE')}>구경</button>
              <button className={`${styles.sheetBtn} ${styles.btnCancelSheet}`} onClick={() => setSelectedMember(null)}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
