import { getTileDisplayText, SUIT } from '../core/tiles'

const suitClass = {
  [SUIT.WAN]: 'wan',
  [SUIT.TIAO]: 'tiao',
  [SUIT.TONG]: 'tong',
  [SUIT.ZI]: 'zi',
}

export default function TileComponent({ tile, size = 'normal', selected, highlight, onClick, faceDown }) {
  if (!tile) return null

  const sizeClass = size === 'small' ? 'small' : size === 'mini' ? 'mini' : ''
  const classes = [
    'tile',
    suitClass[tile.suit] || '',
    sizeClass,
    selected ? 'selected' : '',
    highlight ? 'highlight' : '',
    faceDown ? 'face-down' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={classes} onClick={onClick} title={faceDown ? '' : getTileDisplayText(tile)}>
      {faceDown ? '' : getTileDisplayText(tile)}
    </div>
  )
}
