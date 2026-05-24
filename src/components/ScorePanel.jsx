export default function ScorePanel({ scoreResult, onClose }) {
  if (!scoreResult) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a3a1a, #0d1f0d)',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '500px',
        width: '90%',
        border: '2px solid #4caf50',
        animation: 'scaleIn 0.3s ease',
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#f9a825' }}>
          计分结果
        </h2>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '48px', color: '#f9a825', fontWeight: 'bold' }}>
            {scoreResult.totalFan}
          </span>
          <span style={{ fontSize: '20px', marginLeft: '8px' }}>番</span>
        </div>

        <div style={{ marginBottom: '20px' }}>
          {scoreResult.results.map((r, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}>
              <span>{r.name}</span>
              <span style={{ color: '#f9a825' }}>{r.fan}番</span>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <button className="btn btn-primary" onClick={onClose}>
            确定
          </button>
        </div>
      </div>
    </div>
  )
}
