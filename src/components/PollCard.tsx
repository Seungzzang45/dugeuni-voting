'use client'

import React, { useState } from 'react'
import styles from './PollCard.module.css'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { castVote, cancelVote, addComment, updateManager, deleteComment, updatePoll } from '@/app/actions'
import LineupBuilder from './LineupBuilder'
import BaseballField from './BaseballField'
import TeamStandings, { standingsUpdatedAt } from './TeamStandings'
import { Pencil, Check, X } from 'lucide-react'

interface PollCardProps {
  poll: any
  members: any[]
  isAdmin: boolean
}

export default function PollCard({ poll, members, isAdmin }: PollCardProps) {
  const [selectedMember, setSelectedMember] = useState<{id: string, name: string} | null>(null)

  const [commentName, setCommentName] = useState('')
  const [commentText, setCommentText] = useState('')

  const toLocalInputValue = (d: Date) => {
    const offset = d.getTimezoneOffset() * 60000
    return new Date(d.getTime() - offset).toISOString().slice(0, 16)
  }

  const [isEditingMatch, setIsEditingMatch] = useState(false)
  const [matchDraft, setMatchDraft] = useState({
    startTime: toLocalInputValue(new Date(poll.startTime)),
    opponent: poll.opponent || '',
    homeAway: poll.homeAway || '',
  })

  const startEditMatch = () => {
    setMatchDraft({
      startTime: toLocalInputValue(new Date(poll.startTime)),
      opponent: poll.opponent || '',
      homeAway: poll.homeAway || '',
    })
    setIsEditingMatch(true)
  }

  const saveMatch = async () => {
    if (!matchDraft.startTime) {
      alert('날짜/시간을 입력해주세요.')
      return
    }
    const newDate = new Date(matchDraft.startTime)
    const opp = matchDraft.opponent.trim()
    const datePart = format(newDate, 'MM/dd(eee) HH:mm', { locale: ko })
    const newTitle = opp ? `${datePart} vs ${opp}` : datePart
    await updatePoll(poll.id, {
      title: newTitle,
      opponent: opp,
      homeAway: matchDraft.homeAway.trim(),
      startTime: newDate.toISOString(),
    })
    setIsEditingMatch(false)
  }

  const votes = poll.votes || []
  const attendVotes = votes.filter((v: any) => v.status === 'ATTEND')
  const absentVotes = votes.filter((v: any) => v.status === 'ABSENT')
  const waitVotes = votes.filter((v: any) => v.status === 'WAIT')
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
          {isAdmin && !isEditingMatch && (
            <button
              type="button"
              onClick={startEditMatch}
              title="경기 정보 수정"
              style={{ background: 'transparent', color: 'var(--accent-gold)', border: 'none', cursor: 'pointer', marginLeft: '0.25rem', display: 'inline-flex', alignItems: 'center' }}
            >
              <Pencil size={14} />
            </button>
          )}
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

      {isAdmin && isEditingMatch && (
        <div style={{ background: 'rgba(17,40,23,0.95)', border: '1px solid var(--accent-gold)', borderRadius: '8px', padding: '0.75rem', margin: '0.5rem 0.75rem 0' }}>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              날짜 / 시간
              <input
                type="datetime-local"
                value={matchDraft.startTime}
                onChange={e => setMatchDraft(d => ({ ...d, startTime: e.target.value }))}
                style={{ display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
              />
            </label>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              상대팀
              <input
                type="text"
                value={matchDraft.opponent}
                onChange={e => setMatchDraft(d => ({ ...d, opponent: e.target.value }))}
                placeholder="예: 겸손"
                style={{ display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
              />
            </label>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              선/후공
              <input
                type="text"
                value={matchDraft.homeAway}
                onChange={e => setMatchDraft(d => ({ ...d, homeAway: e.target.value }))}
                placeholder="예: 1루 후공"
                style={{ display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
              />
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              <button
                type="button"
                onClick={saveMatch}
                style={{ flex: 1, padding: '0.5rem', background: 'var(--accent-gold)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
              >
                <Check size={16} /> 저장
              </button>
              <button
                type="button"
                onClick={() => setIsEditingMatch(false)}
                style={{ flex: 1, padding: '0.5rem', background: 'transparent', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
              >
                <X size={16} /> 취소
              </button>
            </div>
          </div>
        </div>
      )}

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
          {renderVoterList('참석', styles.voterAttend, attendVotes)}
          {renderVoterList('불참', styles.voterAbsent, absentVotes)}
          {renderVoterList('대기', styles.voterWait, waitVotes)}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={styles.commentDate}>{format(new Date(c.createdAt), 'MM월 dd일 HH:mm', { locale: ko })}</span>
                    {isAdmin && (
                      <button
                        onClick={() => deleteComment(c.id)}
                        style={{ background: 'transparent', color: '#ff4d4f', border: 'none', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: '0 2px' }}
                        title="댓글 삭제"
                      >
                        ✕
                      </button>
                    )}
                  </div>
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

        {/* TEAM STANDINGS (always visible below comments) */}
        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <TeamStandings />
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', textAlign: 'right' }}>
            수동 업데이트: {standingsUpdatedAt} 기준
          </div>
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
              <button className={`${styles.sheetBtn} ${styles.btnWait}`} onClick={() => handleVoteSubmit('WAIT')}>대기</button>
              <button className={`${styles.sheetBtn} ${styles.btnSpectate}`} onClick={() => handleVoteSubmit('SPECTATE')}>구경</button>
              <button className={`${styles.sheetBtn} ${styles.btnCancelSheet}`} onClick={() => setSelectedMember(null)}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
