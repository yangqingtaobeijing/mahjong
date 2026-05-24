export default function ActionPanel({ actions, onAction, visible }) {
  if (!visible || !actions) return null

  const buttons = []

  if (actions.canWin) {
    buttons.push({ label: '胡', type: 'win', className: 'btn-danger' })
  }
  if (actions.canPong) {
    buttons.push({ label: '碰', type: 'pong', className: 'btn-action' })
  }
  if (actions.canKong) {
    buttons.push({ label: '杠', type: 'kong', className: 'btn-action' })
  }
  if (actions.canChi) {
    buttons.push({ label: '吃', type: 'chi', className: 'btn-action' })
  }
  buttons.push({ label: '过', type: 'pass', className: 'btn-secondary' })

  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      justifyContent: 'center',
      padding: '16px',
      background: 'rgba(0,0,0,0.5)',
      borderRadius: '12px',
      animation: 'slideUp 0.3s ease',
    }}>
      {buttons.map(btn => (
        <button
          key={btn.type}
          className={`btn ${btn.className}`}
          onClick={() => onAction(btn.type)}
          style={{ minWidth: '60px', fontSize: '18px' }}
        >
          {btn.label}
        </button>
      ))}
    </div>
  )
}
