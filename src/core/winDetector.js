// 胡牌检测
import { SUIT, isSameTileType, sortTiles } from './tiles.js';

// 将手牌转换为计数map，用于算法处理
export function tilesToCountMap(tiles) {
  const map = {};
  for (const tile of tiles) {
    const key = tile.isZi ? `zi_${tile.rank}` : `${tile.suit}_${tile.rank}`;
    map[key] = (map[key] || 0) + 1;
  }
  return map;
}

// 从countMap获取牌的数量
function getCount(map, suit, rank) {
  const key = suit === SUIT.ZI ? `zi_${rank}` : `${suit}_${rank}`;
  return map[key] || 0;
}

// 设置countMap中牌的数量
function setCount(map, suit, rank, count) {
  const key = suit === SUIT.ZI ? `zi_${rank}` : `${suit}_${rank}`;
  if (count <= 0) {
    delete map[key];
  } else {
    map[key] = count;
  }
}

// 检测基本胡牌：4面子 + 1雀头
function canWinBasic(countMap) {
  const suits = [SUIT.WAN, SUIT.TIAO, SUIT.TONG];

  // 尝试每种牌作为雀头
  for (const suit of suits) {
    for (let rank = 1; rank <= 9; rank++) {
      if (getCount(countMap, suit, rank) >= 2) {
        const copy = { ...countMap };
        setCount(copy, suit, rank, getCount(copy, suit, rank) - 2);
        if (canFormMelds(copy, suits, SUIT.ZI)) {
          return true;
        }
      }
    }
  }

  // 字牌雀头
  for (const rank of ['dong', 'nan', 'xi', 'bei', 'zhong', 'fa', 'bai']) {
    if (getCount(countMap, SUIT.ZI, rank) >= 2) {
      const copy = { ...countMap };
      setCount(copy, SUIT.ZI, rank, getCount(copy, SUIT.ZI, rank) - 2);
      if (canFormMelds(copy, suits, SUIT.ZI)) {
        return true;
      }
    }
  }

  return false;
}

// 检测剩余的牌能否全部组成面子（顺子或刻子）
function canFormMelds(countMap, suits, ziSuit) {
  // 先处理字牌（只能组成刻子）
  const ziTypes = ['dong', 'nan', 'xi', 'bei', 'zhong', 'fa', 'bai'];
  for (const rank of ziTypes) {
    const count = getCount(countMap, ziSuit, rank);
    if (count % 3 !== 0) return false;
  }

  // 处理数牌
  for (const suit of suits) {
    if (!canFormMeldsForSuit(countMap, suit)) {
      return false;
    }
  }

  return true;
}

// 检测某一花色的牌能否全部组成面子
function canFormMeldsForSuit(countMap, suit) {
  // 找到该花色中还有牌的最小位置
  let startRank = 1;
  while (startRank <= 9) {
    if (getCount(countMap, suit, startRank) > 0) break;
    startRank++;
  }

  if (startRank > 9) return true; // 该花色没有牌了

  const count = getCount(countMap, suit, startRank);

  // 尝试组成刻子
  if (count >= 3) {
    const copy = { ...countMap };
    setCount(copy, suit, startRank, getCount(copy, suit, startRank) - 3);
    if (canFormMeldsForSuit(copy, suit)) return true;
  }

  // 尝试组成顺子
  if (startRank <= 7 &&
    getCount(countMap, suit, startRank) > 0 &&
    getCount(countMap, suit, startRank + 1) > 0 &&
    getCount(countMap, suit, startRank + 2) > 0) {
    const copy = { ...countMap };
    setCount(copy, suit, startRank, getCount(copy, suit, startRank) - 1);
    setCount(copy, suit, startRank + 1, getCount(copy, suit, startRank + 1) - 1);
    setCount(copy, suit, startRank + 2, getCount(copy, suit, startRank + 2) - 1);
    if (canFormMeldsForSuit(copy, suit)) return true;
  }

  return false;
}

// 检测七对子
function canWinSevenPairs(tiles) {
  if (tiles.length !== 14) return false;

  const countMap = tilesToCountMap(tiles);
  let pairs = 0;

  for (const count of Object.values(countMap)) {
    if (count % 2 !== 0) return false;
    pairs += count / 2;
  }

  return pairs === 7;
}

// 检测十三幺
function canWinThirteenOrphans(tiles) {
  if (tiles.length !== 14) return false;

  const requiredTiles = [
    'wan_1', 'wan_9', 'tiao_1', 'tiao_9', 'tong_1', 'tong_9',
    'zi_dong', 'zi_nan', 'zi_xi', 'zi_bei', 'zi_zhong', 'zi_fa', 'zi_bai'
  ];

  const countMap = tilesToCountMap(tiles);

  // 必须包含所有13种幺九牌
  for (const key of requiredTiles) {
    if (!countMap[key] || countMap[key] < 1) return false;
  }

  // 其中必须有一种出现两次（作为雀头）
  let hasPair = false;
  for (const key of requiredTiles) {
    if (countMap[key] === 2) {
      hasPair = true;
      break;
    }
  }

  // 总数必须是14
  const total = Object.values(countMap).reduce((s, c) => s + c, 0);
  return hasPair && total === 14;
}

// 主函数：检测是否能胡牌
// tiles: 手牌数组（14张）
// 返回: { canWin, winType, details }
export function detectWin(tiles) {
  if (tiles.length !== 14) {
    return { canWin: false };
  }

  // 检测十三幺
  if (canWinThirteenOrphans(tiles)) {
    return { canWin: true, winType: 'thirteen_orphans' };
  }

  // 检测七对子
  if (canWinSevenPairs(tiles)) {
    return { canWin: true, winType: 'seven_pairs' };
  }

  // 检测基本胡牌
  const countMap = tilesToCountMap(tiles);
  if (canWinBasic(countMap)) {
    return { canWin: true, winType: 'basic' };
  }

  return { canWin: false };
}

// 检测听牌：给定13张手牌，返回能胡哪些牌
export function detectTing(tiles) {
  if (tiles.length !== 13) return [];

  const tingTiles = [];
  // 尝试添加每种可能的牌
  const allSuits = [SUIT.WAN, SUIT.TIAO, SUIT.TONG];

  for (const suit of allSuits) {
    for (let rank = 1; rank <= 9; rank++) {
      const testTile = { id: `test_${suit}_${rank}`, suit, rank, isZi: false, isYaoJiu: rank === 1 || rank === 9 };
      const result = detectWin([...tiles, testTile]);
      if (result.canWin) {
        tingTiles.push({ suit, rank, isZi: false });
      }
    }
  }

  const ziRanks = ['dong', 'nan', 'xi', 'bei', 'zhong', 'fa', 'bai'];
  for (const rank of ziRanks) {
    const testTile = { id: `test_zi_${rank}`, suit: SUIT.ZI, rank, isZi: true, isYaoJiu: true };
    const result = detectWin([...tiles, testTile]);
    if (result.canWin) {
      tingTiles.push({ suit: SUIT.ZI, rank, isZi: true });
    }
  }

  return tingTiles;
}

// 检测某张打出的牌是否放炮
export function isDiscardDangerous(discardedTile, opponentTingList) {
  return opponentTingList.some(
    t => t.suit === discardedTile.suit && t.rank === discardedTile.rank
  );
}
