import TileComponent from './TileComponent'
import MeldArea from './MeldArea'
import DiscardPool from './DiscardPool'

export default function GameBoard({ gameState, playerView, currentPlayer }) {
  if (!gameState || !playerView) return null

  const { players, discardPools, wallsCount } = gameState

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      background: 'radial-gradient(ellipse at center, #1a5c2a 0%, #0d3318 60%, #071a0c 100%)',
      borderRadius: '20px',
      overflow: 'hidden',
    }}>
      {/* 中央信息 */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        zIndex: 10,
      }}>
        <div style={{
          background: 'rgba(0,0,0,0.6)',
          borderRadius: '12px',
          padding: '16px 24px',
        }}>
          <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '4px' }}>
            余牌
          </div>
          <div style={{ fontSize: '28px', color: '#f9a825', fontWeight: 'bold' }}>
            {wallsCount}
          </div>
        </div>
      </div>

      {/* 对家（顶部）牌河 */}
      <div style={{
        position: 'absolute',
        top: '60px',
        left: '50%',
        transform: 'translateX(-50%)',
      }}>
        <DiscardPool tiles={discardPools?.[1]} />
      </div>

      {/* 对家（顶部）手牌 */}
      <div style={{
        position: 'absolute',
        top: '8px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{
          fontSize: '12px',
          color: currentPlayer === 1 ? '#f9a825' : '#888',
          marginBottom: '4px',
        }}>
          对家 {currentPlayer === 1 ? '⏳' : ''}
        </div>
        <div style={{ display: 'flex', gap: '2px' }}>
          {Array.from({ length: players[1]?.handCount || 0 }).map((_, i) => (
            <TileComponent key={i} tile={{ id: `back-${i}` }} size="mini" faceDown />
          ))}
        </div>
        <MeldArea melds={players[1]?.melds || []} small />
      </div>

      {/* 右家（右侧）牌河 */}
      <div style={{
        position: 'absolute',
        right: '60px',
        top: '50%',
        transform: 'translateY(-50%)',
      }}>
        <div style={{ transform: 'rotate(90deg)' }}>
          <DiscardPool tiles={discardPools?.[2]} />
        </div>
      </div>

      {/* 右家 */}
      <div style={{
        position: 'absolute',
        right: '8px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{
          fontSize: '12px',
          color: currentPlayer === 2 ? '#f9a825' : '#888',
          marginBottom: '4px',
          writingMode: 'vertical-rl',
        }}>
          下家 {currentPlayer === 2 ? '⏳' : ''}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {Array.from({ length: players[2]?.handCount || 0 }).map((_, i) => (
            <TileComponent key={i} tile={{ id: `back-${i}` }} size="mini" faceDown />
          ))}
        </div>
        <div style={{ transform: 'rotate(90deg)', marginTop: '8px' }}>
          <MeldArea melds={players[2]?.melds || []} small />
        </div>
      </div>

      {/* 左家（左侧）牌河 */}
      <div style={{
        position: 'absolute',
        left: '60px',
        top: '50%',
        transform: 'translateY(-50%)',
      }}>
        <div style={{ transform: 'rotate(-90deg)' }}>
          <DiscardPool tiles={discardPools?.[3]} />
        </div>
      </div>

      {/* 左家 */}
      <div style={{
        position: 'absolute',
        left: '8px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{
          fontSize: '12px',
          color: currentPlayer === 3 ? '#f9a825' : '#888',
          marginBottom: '4px',
          writingMode: 'vertical-rl',
        }}>
          上家 {currentPlayer === 3 ? '⏳' : ''}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {Array.from({ length: players[3]?.handCount || 0 }).map((_, i) => (
            <TileComponent key={i} tile={{ id: `back-${i}` }} size="mini" faceDown />
          ))}
        </div>
        <div style={{ transform: 'rotate(-90deg)', marginTop: '8px' }}>
          <MeldArea melds={players[3]?.melds || []} small />
        </div>
      </div>

      {/* 玩家自己（底部）牌河 */}
      <div style={{
        position: 'absolute',
        bottom: '140px',
        left: '50%',
        transform: 'translateX(-50%)',
      }}>
        <DiscardPool tiles={discardPools?.[0]} />
      </div>
    </div>
  )
}
