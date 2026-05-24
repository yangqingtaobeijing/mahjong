// 副露检测：吃、碰、杠
import { SUIT, isSameTileType } from './tiles.js';
import { detectWin } from './winDetector.js';

// 检测是否可以碰
// handTiles: 当前玩家手牌
// discardedTile: 别人打出的牌
export function canPong(handTiles, discardedTile) {
  return handTiles.filter(t => isSameTileType(t, discardedTile)).length >= 2;
}

// 检测是否可以明杠
// handTiles: 当前玩家手牌
// discardedTile: 别人打出的牌
export function canOpenKong(handTiles, discardedTile) {
  return handTiles.filter(t => isSameTileType(t, discardedTile)).length >= 3;
}

// 检测是否可以暗杠（自己手上有4张相同的牌）
export function canConcealedKong(handTiles) {
  const countMap = {};
  for (const tile of handTiles) {
    const key = tile.isZi ? `zi_${tile.rank}` : `${tile.suit}_${tile.rank}`;
    countMap[key] = (countMap[key] || 0) + 1;
  }

  const kongTiles = [];
  for (const [key, count] of Object.entries(countMap)) {
    if (count === 4) {
      kongTiles.push(key);
    }
  }
  return kongTiles.length > 0 ? kongTiles : null;
}

// 检测是否可以加杠（已碰的牌，自己又摸到第4张）
export function canUpgradeKong(handTiles, pongMelds) {
  const results = [];
  for (const meld of pongMelds) {
    const matchTile = handTiles.find(t => isSameTileType(t, meld.tiles[0]));
    if (matchTile) {
      results.push({ meld, tile: matchTile });
    }
  }
  return results.length > 0 ? results : null;
}

// 检测是否可以吃（只有下家可以吃）
// handTiles: 当前玩家手牌
// discardedTile: 上家打出的牌
export function canChi(handTiles, discardedTile) {
  if (discardedTile.isZi) return []; // 字牌不能吃

  const results = [];
  const suit = discardedTile.suit;
  const rank = discardedTile.rank;

  // 获取手牌中同花色的牌
  const suitTiles = handTiles.filter(t => t.suit === suit && !t.isZi);
  const ranks = suitTiles.map(t => t.rank);

  // 吃的三种组合
  // 1. [rank-2, rank-1, rank] - 被吃的牌在末尾
  if (rank >= 3 && ranks.includes(rank - 2) && ranks.includes(rank - 1)) {
    results.push({
      type: 'chi',
      tiles: [
        suitTiles.find(t => t.rank === rank - 2),
        suitTiles.find(t => t.rank === rank - 1),
        discardedTile,
      ],
      display: `${rank - 2}${rank - 1}${rank}`,
    });
  }

  // 2. [rank-1, rank, rank+1] - 被吃的牌在中间
  if (rank >= 2 && rank <= 8 && ranks.includes(rank - 1) && ranks.includes(rank + 1)) {
    results.push({
      type: 'chi',
      tiles: [
        suitTiles.find(t => t.rank === rank - 1),
        discardedTile,
        suitTiles.find(t => t.rank === rank + 1),
      ],
      display: `${rank - 1}${rank}${rank + 1}`,
    });
  }

  // 3. [rank, rank+1, rank+2] - 被吃的牌在开头
  if (rank <= 7 && ranks.includes(rank + 1) && ranks.includes(rank + 2)) {
    results.push({
      type: 'chi',
      tiles: [
        discardedTile,
        suitTiles.find(t => t.rank === rank + 1),
        suitTiles.find(t => t.rank === rank + 2),
      ],
      display: `${rank}${rank + 1}${rank + 2}`,
    });
  }

  return results;
}

// 获取所有可能的操作
// 返回: { canWin, canPong, canKong, canChi, chiOptions }
export function getAvailableActions(handTiles, discardedTile, isNextPlayer, tingTiles) {
  const actions = {
    canWin: false,
    canPong: false,
    canKong: false,
    canChi: false,
    chiOptions: [],
    pongTiles: [],
    kongTile: null,
  };

  // 检测是否可以胡（放炮）
  const testHand = [...handTiles, discardedTile];
  const winResult = detectWin(testHand);
  actions.canWin = winResult.canWin;

  // 检测碰
  if (canPong(handTiles, discardedTile)) {
    actions.canPong = true;
    actions.pongTiles = handTiles.filter(t => isSameTileType(t, discardedTile)).slice(0, 2);
  }

  // 检测明杠
  if (canOpenKong(handTiles, discardedTile)) {
    actions.canKong = true;
    actions.kongTile = discardedTile;
  }

  // 检测吃（只有下家可以）
  if (isNextPlayer) {
    const chiOptions = canChi(handTiles, discardedTile);
    if (chiOptions.length > 0) {
      actions.canChi = true;
      actions.chiOptions = chiOptions;
    }
  }

  return actions;
}
