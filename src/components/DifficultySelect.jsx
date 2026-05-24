export default function DifficultySelect({ selected, onSelect }) {
  const difficulties = [
    { id: 'beginner', name: '新手', desc: 'AI较弱，有详细提示引导', color: '#4caf50' },
    { id: 'intermediate', name: '初级', desc: 'AI有一定策略，关键提示', color: '#2196f3' },
    { id: 'advanced', name: '中级', desc: 'AI会防守做牌，仅听牌提示', color: '#ff9800' },
  ]

  return (
    <div style={{
      display: 'flex',
      gap: '16px',
      justifyContent: 'center',
      flexWrap: 'wrap',
    }}>
      {difficulties.map(d => (
        <div
          key={d.id}
          onClick={() => onSelect(d.id)}
          style={{
            background: selected === d.id
              ? `linear-gradient(135deg, ${d.color}33, ${d.color}11)`
              : 'rgba(255,255,255,0.05)',
            border: selected === d.id
              ? `2px solid ${d.color}`
              : '2px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '20px 28px',
            cursor: 'pointer',
            textAlign: 'center',
            minWidth: '140px',
            transition: 'all 0.2s ease',
            transform: selected === d.id ? 'scale(1.05)' : 'scale(1)',
          }}
        >
          <div style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: selected === d.id ? d.color : '#fff',
            marginBottom: '8px',
          }}>
            {d.name}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.6)',
          }}>
            {d.desc}
          </div>
        </div>
      ))}
    </div>
  )
}
