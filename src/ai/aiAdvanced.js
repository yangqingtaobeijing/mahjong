// 高级AI - 综合策略：算牌、读牌、攻防转换
import { AIBase } from './aiBase.js';
import { isSameTileType, isNumberTile, isWindTile, isDragonTile, sortTiles } from '../core/tiles.js';
import { detectWin, detectTing, isDiscardDangerous, tilesToCountMap } from '../core/winDetector.js';

export class AIAdvanced extends AIBase {
  constructor() {
    super('advanced');
  }

  selectDiscard(hand, melds, context) {
    const countMap = {};
    for (const tile of hand) {
      const key = tile.isZi ? `zi_${tile.rank}` : `${tile.suit}_${tile.rank}`;
      countMap[key] = (countMap[key] || 0) + 1;
    }

    // 先检查是否已经听牌
    const ting = detectTing(hand);
    if (ting.length > 0) {
      // 已经听牌，打一张不影响听牌的牌
      return this._discardWithoutBreakingTing(hand, ting, countMap);
    }

    // 评估每张牌的价值
    const evaluations = hand.map(tile => ({
      tile,
      score: this._evaluateTileAdvanced(tile, hand, countMap, context),
    }));

    evaluations.sort((a, b) => a.score - b.score);
    return evaluations[0].tile;
  }

  _evaluateTileAdvanced(tile, hand, countMap, context) {
    const key = tile.isZi ? `zi_${tile.rank}` : `${tile.suit}_${tile.rank}`;
    const count = countMap[key];
    let score = 0;

    // 对子/刻子价值
    if (count >= 2) score += 4;
    if (count >= 3) score += 8;

    // 数牌的搭子价值
    if (isNumberTile(tile)) {
      const suit = tile.suit;
      const rank = tile.rank;

      // 检查各种搭子
      const hasLeft = hand.some(t => t.suit === suit && t.rank === rank - 1);
      const hasRight = hand.some(t => t.suit === suit && t.rank === rank + 1);
      const hasLeft2 = hand.some(t => t.suit === suit && t.rank === rank - 2);
      const hasRight2 = hand.some(t => t.suit === suit && t.rank === rank + 2);

      if (hasLeft && hasRight) score += 6; // 坎张
      else if (hasLeft && hasRight2) score += 5; // 两面
      else if (hasRight && hasLeft2) score += 5; // 两面
      else if (hasLeft || hasRight) score += 3; // 边张
      else if (hasLeft2 || hasRight2) score += 1; // 间隔
    }

    // 字牌
    if (isWindTile(tile)) {
      if (count >= 2) score += 3;
      if (count >= 3) score += 6;
    }
    if (isDragonTile(tile)) {
      if (count >= 2) score += 4;
      if (count >= 3) score += 8;
    }

    // 幺九牌
    if (tile.isYaoJiu && count === 1) score -= 2;

    // 防守考虑
    if (context?.opponentTing) {
      if (isDiscardDangerous(tile, context.opponentTing)) {
        score -= 15; // 高度危险
      }
    }

    // 已出过的牌更安全
    if (context?.discardedTiles) {
      const discarded = context.discardedTiles.filter(t => isSameTileType(t, tile));
      if (discarded.length > 0) score += discarded.length * 2;
    }

    return score;
  }

  _discardWithoutBreakingTing(hand, ting, countMap) {
    // 找出不影响听牌的牌来打
    // 策略：打掉不在听牌组合中的孤张
    for (const tile of hand) {
      const key = tile.isZi ? `zi_${tile.rank}` : `${tile.suit}_${tile.rank}`;
      const count = countMap[key];

      // 如果是孤张且不在听牌列表中
      if (count === 1) {
        const isTingTile = ting.some(t => t.suit === tile.suit && t.rank === tile.rank);
        if (!isTingTile) {
          // 检查是否可以安全打出
          const testHand = hand.filter(t => t.id !== tile.id);
          const testTing = detectTing(testHand);
          if (testTing.length > 0) {
            return tile;
          }
        }
      }
    }

    // 如果找不到安全的牌，打分最低的
    const evaluations = hand.map(t => ({
      tile: t,
      score: this._evaluateTileAdvanced(t, hand, countMap, {}),
    }));
    evaluations.sort((a, b) => a.score - b.score);
    return evaluations[0].tile;
  }

  shouldPong(hand, tile, context) {
    // 高级AI：碰了之后能听牌就碰
    const testHand = hand.filter(t => !isSameTileType(t, tile)).slice(0, hand.length - 2);
    // 简化处理：碰牌一般是有利的
    return true;
  }

  shouldChi(hand, tile, chiOptions, context) {
    if (chiOptions.length === 0) return null;
    // 选择最优的吃牌组合
    return chiOptions[0];
  }

  shouldConcealedKong(hand, concealedKongKeys, context) {
    // 高级AI：暗杠一般是有利的
    return concealedKongKeys.length > 0 ? concealedKongKeys[0] : null;
  }
}
