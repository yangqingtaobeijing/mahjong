// 国标麻将牌定义 - 136张牌
// 万子(1-9) × 4, 条子(1-9) × 4, 筒子(1-9) × 4, 字牌(7种) × 4

export const SUIT = {
  WAN: 'wan',   // 万
  TIAO: 'tiao', // 条
  TONG: 'tong', // 筒
  ZI: 'zi',     // 字
};

export const ZI_TYPE = {
  DONG: 'dong', // 东
  NAN: 'nan',   // 南
  XI: 'xi',     // 西
  BEI: 'bei',   // 北
  ZHONG: 'zhong', // 中
  FA: 'fa',     // 发
  BAI: 'bai',   // 白
};

export const SUIT_NAMES = {
  [SUIT.WAN]: '万',
  [SUIT.TIAO]: '条',
  [SUIT.TONG]: '筒',
  [SUIT.ZI]: '字',
};

export const ZI_NAMES = {
  [ZI_TYPE.DONG]: '东',
  [ZI_TYPE.NAN]: '南',
  [ZI_TYPE.XI]: '西',
  [ZI_TYPE.BEI]: '北',
  [ZI_TYPE.ZHONG]: '中',
  [ZI_TYPE.FA]: '发',
  [ZI_TYPE.BAI]: '白',
};

// 创建一张牌的唯一ID
function makeTileId(suit, rank, index) {
  if (suit === SUIT.ZI) {
    return `zi_${rank}_${index}`;
  }
  return `${suit}_${rank}_${index}`;
}

// 创建一副完整的136张牌
export function createFullTileSet() {
  const tiles = [];

  // 万、条、筒各1-9，每种4张
  for (const suit of [SUIT.WAN, SUIT.TIAO, SUIT.TONG]) {
    for (let rank = 1; rank <= 9; rank++) {
      for (let i = 0; i < 4; i++) {
        tiles.push({
          id: makeTileId(suit, rank, i),
          suit,
          rank,
          isZi: false,
          isYaoJiu: rank === 1 || rank === 9, // 幺九牌
        });
      }
    }
  }

  // 字牌：东南西北中发白，每种4张
  const ziTypes = Object.values(ZI_TYPE);
  for (const ziType of ziTypes) {
    for (let i = 0; i < 4; i++) {
      tiles.push({
        id: makeTileId(SUIT.ZI, ziType, i),
        suit: SUIT.ZI,
        rank: ziType,
        isZi: true,
        isYaoJiu: true, // 字牌都是幺九牌
      });
    }
  }

  return tiles; // 共136张
}

// 获取牌的显示文字
export function getTileDisplayText(tile) {
  if (tile.isZi) {
    return ZI_NAMES[tile.rank] || '?';
  }
  return `${tile.rank}${SUIT_NAMES[tile.suit]}`;
}

// 获取牌的排序权重（用于手牌排序）
export function getTileSortWeight(tile) {
  if (tile.isZi) {
    const ziOrder = {
      [ZI_TYPE.DONG]: 31, [ZI_TYPE.NAN]: 32, [ZI_TYPE.XI]: 33, [ZI_TYPE.BEI]: 34,
      [ZI_TYPE.ZHONG]: 35, [ZI_TYPE.FA]: 36, [ZI_TYPE.BAI]: 37,
    };
    return ziOrder[tile.rank] || 99;
  }
  const suitOrder = { [SUIT.WAN]: 0, [SUIT.TIAO]: 10, [SUIT.TONG]: 20 };
  return (suitOrder[tile.suit] || 0) + tile.rank;
}

// 排序手牌
export function sortTiles(tiles) {
  return [...tiles].sort((a, b) => getTileSortWeight(a) - getTileSortWeight(b));
}

// 判断两张牌是否相同（花色+点数）
export function isSameTileType(a, b) {
  return a.suit === b.suit && a.rank === b.rank;
}

// 判断是否为数牌
export function isNumberTile(tile) {
  return !tile.isZi;
}

// 判断是否为风牌
export function isWindTile(tile) {
  return tile.isZi && [ZI_TYPE.DONG, ZI_TYPE.NAN, ZI_TYPE.XI, ZI_TYPE.BEI].includes(tile.rank);
}

// 判断是否为箭牌（中发白）
export function isDragonTile(tile) {
  return tile.isZi && [ZI_TYPE.ZHONG, ZI_TYPE.FA, ZI_TYPE.BAI].includes(tile.rank);
}
