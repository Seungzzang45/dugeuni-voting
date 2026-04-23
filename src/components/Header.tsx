import Image from 'next/image'
import { Shield, ShieldAlert, Trophy } from 'lucide-react'
import styles from './Header.module.css'

interface HeaderProps {
  isAdmin: boolean
  onToggleAdmin: () => void
  onOpenRankings: () => void
}

export default function Header({ isAdmin, onToggleAdmin, onOpenRankings }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Image
          src="/dugeunii_logo.png"
          alt="Dugeunii Baseball Logo"
          width={50}
          height={50}
          style={{ objectFit: 'contain', borderRadius: '50%' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 className={styles.logoText} style={{ lineHeight: 1 }}>두근이 야구단</h1>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '1px' }}>
            DUGEUNII BASEBALL
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <button
          onClick={onOpenRankings}
          className={styles.rankingsButton}
          title="팀 & 선수 기록 보기"
        >
          <Trophy size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
          기록보기
        </button>

        <button
          onClick={onToggleAdmin}
          className={`${styles.authButton} ${isAdmin ? styles.adminActive : ''}`}
        >
          {isAdmin ? (
            <><Shield size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} /> 관리자 모드 On</>
          ) : (
            <><ShieldAlert size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} /> 관리자 접속</>
          )}
        </button>
      </div>
    </header>
  )
}
