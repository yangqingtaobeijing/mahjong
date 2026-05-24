import TileComponent from './TileComponent'

export default function DiscardPool({ tiles, position }) {
  if (!tiles || tiles.length === 0) return null

  return (
    <div style={{
      display: 'flex',
      gap: '2px',
      flexWrap: 'wrap',
      maxWidth: '200px',
      padding: '4px',
    }}>
      {tiles.map((tile, i) => (
        <TileComponent key={`${tile.id}-${i}`} tile={tile} size="mini" />
      ))}
    </div>
  )
}
