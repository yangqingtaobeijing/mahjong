import TileComponent from './TileComponent'

export default function MeldArea({ melds, small }) {
  if (!melds || melds.length === 0) return null

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      padding: '4px',
      flexWrap: 'wrap',
    }}>
      {melds.map((meld, i) => (
        <div key={i} style={{
          display: 'flex',
          gap: '2px',
          background: 'rgba(255,255,255,0.1)',
          padding: '4px',
          borderRadius: '4px',
        }}>
          {meld.tiles.map((tile, j) => (
            <TileComponent
              key={tile.id}
              tile={tile}
              size={small ? 'mini' : 'small'}
            />
          ))}
          <div style={{
            fontSize: '10px',
            color: 'rgba(255,255,255,0.6)',
            marginLeft: '4px',
            alignSelf: 'center',
          }}>
            {meld.type === 'chi' ? '吃' :
              meld.type === 'pong' ? '碰' :
                meld.type === 'open_kong' ? '杠' :
                  meld.type === 'concealed_kong' ? '暗杠' : '加杠'}
          </div>
        </div>
      ))}
    </div>
  )
}
