import TileComponent from './TileComponent'

export default function PlayerHand({ tiles, onTileClick, selectedTile, highlightTiles, isCurrentPlayer, drawnTile }) {
  if (!tiles) return null

  return (
    <div style={{
      display: 'flex',
      gap: '4px',
      padding: '8px',
      justifyContent: 'center',
      flexWrap: 'wrap',
    }}>
      {tiles.map((tile, i) => {
        const isDrawn = drawnTile && tile.id === drawnTile.id
        const isHighlighted = highlightTiles?.some(t => t.id === tile.id)
        return (
          <TileComponent
            key={tile.id}
            tile={tile}
            selected={selectedTile?.id === tile.id}
            highlight={isHighlighted}
            onClick={() => onTileClick?.(tile)}
          />
        )
      })}
      {drawnTile && !tiles.some(t => t.id === drawnTile.id) && (
        <div style={{ marginLeft: '12px' }}>
          <TileComponent
            tile={drawnTile}
            highlight
            onClick={() => onTileClick?.(drawnTile)}
          />
        </div>
      )}
    </div>
  )
}
