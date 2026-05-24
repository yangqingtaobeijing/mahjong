import { useState } from 'react'
import DifficultySelect from '../components/DifficultySelect'

export default function HomePage({ onStartGame, onStartTutorial }) {
  const [difficulty, setDifficulty] = useState('beginner')

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at center, #1a5c2a 0%, #0d3318 60%, #071a0c 100%)',
      padding: '20px',
    }}>
      {/* 标题 */}
      <div style={{
        textAlign: 'center',
        marginBottom: '48px',
      }}>
        <h1 style={{
          fontSize: '64px',
          color: '#f9a825',
          textShadow: '0 4px 12px rgba(0,0,0,0.5)',
          marginBottom: '8px',
          letterSpacing: '12px',
        }}>
          国标麻将
        </h1>
        <p style={{
          fontSize: '18px',
          color: 'rgba(255,255,255,0.6)',
          letterSpacing: '4px',
        }}>
          Chinese Official Mahjong
        </p>
      </div>

      {/* 难度选择 */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{
          fontSize: '20px',
          color: '#aaa',
          textAlign: 'center',
          marginBottom: '20px',
        }}>
          选择难度
        </h2>
        <DifficultySelect selected={difficulty} onSelect={setDifficulty} />
      </div>

      {/* 操作按钮 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        alignItems: 'center',
      }}>
        <button
          className="btn btn-primary"
          style={{ fontSize: '20px', padding: '14px 48px', minWidth: '220px' }}
          onClick={() => onStartGame({ difficulty })}
        >
          开始游戏
        </button>
        <button
          className="btn btn-secondary"
          style={{ fontSize: '16px', padding: '12px 40px', minWidth: '220px' }}
          onClick={onStartTutorial}
        >
          新手教程
        </button>
      </div>

      {/* 底部信息 */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        color: 'rgba(255,255,255,0.3)',
        fontSize: '12px',
      }}>
        单人模式 · 对战3个AI · 国标88番
      </div>
    </div>
  )
}
