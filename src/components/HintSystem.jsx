export default function HintSystem({ hint, visible }) {
  if (!visible || !hint) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '120px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.85)',
      padding: '16px 24px',
      borderRadius: '12px',
      border: '1px solid #f9a825',
      maxWidth: '400px',
      zIndex: 100,
      animation: 'slideUp 0.3s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '24px' }}>💡</span>
        <div>
          <div style={{ fontWeight: 'bold', color: '#f9a825', marginBottom: '4px' }}>
            提示
          </div>
          <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
            {hint}
          </div>
        </div>
      </div>
    </div>
  )
}
