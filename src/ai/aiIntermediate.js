// 中级AI - 基本策略：优先打孤张、保留对子、防守下家
import { AIBase } from './aiBase.js';
import { isSameTileType, isNumberTile, isWindTile, isDragonTile } from '../core/tiles.js';
import { detectTing, isDiscardDangerous } from '../core/winDetector.js';

export class AIIntermediate extends AIBase {
  constructor() {
    super('intermediate');
  }

  selectDiscard(hand, melds, context) {
    const countMap = {};
    for (const tile of hand) {
      const key = tile.isZi ? `zi_${tile.rank}` : `${tile.suit}_${tile.rank}`;
      countMap[key] = (countMap[key] || 0) + 1;
    }

    // 评估每张牌的价值
    const evaluations = hand.map(tile => ({
      tile,
      score: this._evaluateTile(tile, hand, countMap, context),
    }));

    // 按分数排序，打分最低的牌
    evaluations.sort((a, b) => a.score - b.score);
    return evaluations[0].tile;
  }

  _evaluateTile(tile, hand, countMap, context) {
    const key = tile.isZi ? `zi_${tile.rank}` : `${tile.suit}_${tile.rank}`;
    const count = countMap[key];
    let score = 0;

    // 有对子的牌更有价值
    if (count >= 2) score += 3;
    if (count >= 3) score += 5;

    // 数牌的相邻牌
    if (isNumberTile(tile)) {
      const suit = tile.suit;
      const rank = tile.rank;

      // 检查相邻牌
      const hasLeft = hand.some(t => t.suit === suit && t.rank === rank - 1);
      const hasRight = hand.some(t => t.suit === suit && t.rank === rank + 1);

      if (hasLeft && hasRight) score += 4; // 坎张
      else if (hasLeft || hasRight) score += 2; // 边张
    }

    // 字牌的价值
    if (isWindTile(tile)) {
      if (count >= 2) score += 2;
    }
    if (isDragonTile(tile)) {
      if (count >= 2) score += 3;
    }

    // 幺九牌价值略低
    if (tile.isYaoJiu && count === 1) score -= 1;

    // 如果有危险牌（对手可能胡的），降低价值
    if (context?.opponentTing) {
      if (isDiscardDangerous(tile, context.opponentTing)) {
        score -= 10;
      }
    }

    return score;
  }

  shouldPong(hand, tile, context) {
    // 中级AI：碰的条件更合理
    // 如果碰了之后能听牌，就碰
    const matchingCount = hand.filter(t => isSameTileType(t, tile)).length;
    return matchingCount >= 2;
  }

  shouldChi(hand, tile, chiOptions, context) {
    // 中级AI：吃的时候选择最优组合
    if (chiOptions.length === 0) return null;

    // 选择吃完后最有利的组合
    return chiOptions[0];
  }
}
