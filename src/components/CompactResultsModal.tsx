'use client'

/**
 * Compact Results Modal
 * COMPACT: Tabbed interface for diagnostic results
 * CLEAN: Minimal design, focused metrics
 */

import React, { useState } from 'react'
import { MODAL_SIZES, MODAL_STYLES } from '../lib/styles/modalSystem'

interface CompactResultsModalProps {
  score: number
  conditionsFound: number
  timeUsed: string
  accuracy: number
  efficiency: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  onPracticeAgain: () => void
  onClose: () => void
}

type Tab = 'summary' | 'performance' | 'next'

export const CompactResultsModal: React.FC<CompactResultsModalProps> = ({
  score,
  conditionsFound,
  timeUsed,
  accuracy,
  efficiency,
  difficulty,
  onPracticeAgain,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('summary')

  const renderSummaryTab = () => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏰</div>
      <h2 style={{ margin: '0 0 1.5rem 0', color: '#00d4ff', fontSize: '1.5rem' }}>
        Time's Up!
      </h2>
      
      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{
          background: 'rgba(0, 212, 255, 0.1)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          borderRadius: '8px',
          padding: '1rem'
        }}>
          <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.5rem' }}>Score</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#00d4ff' }}>{score}</div>
        </div>
        
        <div style={{
          background: 'rgba(0, 212, 255, 0.1)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          borderRadius: '8px',
          padding: '1rem'
        }}>
          <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.5rem' }}>Found</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#00d4ff' }}>{conditionsFound}</div>
        </div>
        
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{
            background: 'rgba(0, 212, 255, 0.1)',
            border: '1px solid rgba(0, 212, 255, 0.2)',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.5rem' }}>Time</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00d4ff' }}>{timeUsed}</div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderPerformanceTab = () => (
    <div>
      <h3 style={{ margin: '0 0 1rem 0', color: '#00d4ff', fontSize: '1.1rem' }}>📊 Performance</h3>
      
      {/* Metrics with bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <span>🎯 Accuracy</span>
            <span style={{ color: '#00d4ff', fontWeight: 'bold' }}>{accuracy}%</span>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            height: '6px',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(90deg, #00d4ff, #0099cc)',
              height: '100%',
              width: `${accuracy}%`,
              transition: 'width 0.5s ease'
            }} />
          </div>
          {accuracy < 50 && <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.25rem' }}>Practice more</div>}
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <span>⚡ Efficiency</span>
            <span style={{ color: '#00d4ff', fontWeight: 'bold' }}>{efficiency}%</span>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            height: '6px',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(90deg, #00d4ff, #0099cc)',
              height: '100%',
              width: `${efficiency}%`,
              transition: 'width 0.5s ease'
            }} />
          </div>
          {efficiency < 50 && <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.25rem' }}>Scan faster</div>}
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <span>🛡️ Difficulty</span>
            <span style={{ color: difficulty === 'Hard' ? '#ff6b6b' : difficulty === 'Medium' ? '#ffaa00' : '#00ff88' }}>
              {difficulty}
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderNextTab = () => (
    <div>
      <h3 style={{ margin: '0 0 1rem 0', color: '#00d4ff', fontSize: '1.1rem' }}>🎯 Tips</h3>
      
      <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem', lineHeight: '1.6' }}>
        <li>🔍 Focus on glowing markers</li>
        <li>🖱️ Use investigation tools</li>
        <li>🎙️ Press 'V' for Nurse Amy</li>
        <li>⌨️ Use shortcuts [C], [E]</li>
      </ul>
    </div>
  )

  return (
    <div style={MODAL_STYLES.overlay(10000)}>
      <div style={{
        ...MODAL_STYLES.container('SMALL'),
        animation: 'modalFadeIn 0.3s ease-out'
      }}>
        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid rgba(0, 212, 255, 0.2)'
        }}>
          {(['summary', 'performance', 'next'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #00d4ff' : '2px solid transparent',
                color: activeTab === tab ? '#00d4ff' : 'rgba(255, 255, 255, 0.5)',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: activeTab === tab ? 'bold' : 'normal',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {tab === 'summary' && '📊 Summary'}
              {tab === 'performance' && '📈 Performance'}
              {tab === 'next' && '🎯 Tips'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ minHeight: '200px', marginBottom: '1.5rem' }}>
          {activeTab === 'summary' && renderSummaryTab()}
          {activeTab === 'performance' && renderPerformanceTab()}
          {activeTab === 'next' && renderNextTab()}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onPracticeAgain}
            style={{
              flex: 1,
              background: 'linear-gradient(45deg, #00d4ff, #0099cc)',
              color: 'white',
              border: 'none',
              padding: '0.75rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(0, 212, 255, 0.25)'
            }}
          >
            🔄 Again
          </button>
          
          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '0.75rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.2s ease'
            }}
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}
