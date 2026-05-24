import TileComponent from './TileComponent'
import MeldArea from './MeldArea'

export default function WinModal({ winner, winType, hand, melds, scoreResult, onNewGame, onGoHome }) {
  if (winner === undefined || winner === -1) return null

  const isDraw = winner === -2

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a3a1a, #0d1f0d)',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '600px',
        width: '90%',
        border: '3px solid #f9a825',
        animation: 'scaleIn 0.4s ease',
      }}>
        {isDraw ? (
          <>
            <h1 style={{ textAlign: 'center', color: '#aaa', fontSize: '36px', marginBottom: '20px' }}>
              流局
            </h1>
            <p style={{ textAlign: 'center', color: '#888', marginBottom: '30px' }}>
              牌墙已摸完，无人胡牌
            </p>
          </>
        ) : (
          <>
            <h1 style={{ textAlign: 'center', color: '#f9a825', fontSize: '42px', marginBottom: '10px' }}>
              {winner === 0 ? '你赢了！' : `玩家${winner + 1}胡牌`}
            </h1>
            <p style={{ textAlign: 'center', color: '#aaa', marginBottom: '20px' }}>
              {winType === 'self_draw' ? '自摸' : '点炮'}
            </p>

            {scoreResult && (
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '56px', color: '#f9a825', fontWeight: 'bold' }}>
                  {scoreResult.totalFan}
                </span>
                <span style={{ fontSize: '24px', marginLeft: '8px', color: '#aaa' }}>番</span>
              </div>
            )}

            {scoreResult?.results?.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                justifyContent: 'center',
                marginBottom: '24px',
              }}>
                {scoreResult.results.map((r, i) => (
                  <span key={i} style={{
                    background: 'rgba(249,168,37,0.2)',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    color: '#f9a825',
                  }}>
                    {r.name} {r.fan}番
                  </span>
                ))}
              </div>
            )}

            {hand && (
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ marginBottom: '8px', color: '#888' }}>胡牌手牌：</div>
                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {hand.map(tile => (
                    <TileComponent key={tile.id} tile={tile} size="small" />
                  ))}
                </div>
                {melds?.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <MeldArea melds={melds} small />
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '30px' }}>
          <button className="btn btn-primary" onClick={onNewGame}>
            再来一局
          </button>
          <button className="btn btn-secondary" onClick={onGoHome}>
            返回主页
          </button>
        </div>
      </div>
    </div>
  )
}
