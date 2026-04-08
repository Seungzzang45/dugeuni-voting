'use client'

import React from 'react'
import styles from './BaseballField.module.css'

interface LineupEntry {
  order: number
  position: string | null
  member: { name: string } | null
}

interface BaseballFieldProps {
  lineup: LineupEntry[]
}

const POSITIONS = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF']

export default function BaseballField({ lineup }: BaseballFieldProps) {
  const getPlayerAtPos = (pos: string) => lineup.find(l => l.position === pos)
  
  return (
    <div className={styles.fieldContainer}>
      <div className={styles.infield}>
        <div className={styles.infieldGrass}></div>
        <div className={`${styles.base} ${styles.baseHome}`}></div>
        <div className={`${styles.base} ${styles.base1}`}></div>
        <div className={`${styles.base} ${styles.base2}`}></div>
        <div className={`${styles.base} ${styles.base3}`}></div>
        <div className={styles.mound}>
          <div className={styles.pitcherPlate}></div>
        </div>
      </div>

      {POSITIONS.map(pos => {
        const player = getPlayerAtPos(pos)
        // We only render a tag if someone is assigned, or perhaps we render empty tags?
        // Let's render empty tags so the admin can see holes
        
        let positionClass = ''
        if (pos === 'C') positionClass = styles.posC
        if (pos === 'P') positionClass = styles.posP
        if (pos === '1B') positionClass = styles.pos1B
        if (pos === '2B') positionClass = styles.pos2B
        if (pos === '3B') positionClass = styles.pos3B
        if (pos === 'SS') positionClass = styles.posSS
        if (pos === 'LF') positionClass = styles.posLF
        if (pos === 'CF') positionClass = styles.posCF
        if (pos === 'RF') positionClass = styles.posRF

        return (
          <div key={pos} className={`${styles.playerTag} ${positionClass}`}>
            {player && <div className={styles.orderLabel}>{player.order}</div>}
            <span className={styles.posLabel}>{pos}</span>
            <span>{player?.member?.name || '-'}</span>
          </div>
        )
      })}
      
      {/* Rendering Designated Hitter (DH) */}
      {(() => {
        const dhPlayer = getPlayerAtPos('DH')
        if (dhPlayer) {
          return (
            <div className={`${styles.playerTag} ${styles.posDH}`}>
              <div className={styles.orderLabel}>{dhPlayer.order}</div>
              <span className={styles.posLabel}>DH</span>
              <span>{dhPlayer.member?.name || '-'}</span>
            </div>
          )
        }
        return null
      })()}
    </div>
  )
}
