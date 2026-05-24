// 新手AI - 随机出牌为主，不会做大牌
import { AIBase } from './aiBase.js';
import { isSameTileType } from '../core/tiles.js';
import { detectTing } from '../core/winDetector.js';

export class AIBeginner extends AIBase {
  constructor() {
    super('beginner');
  }

  selectDiscard(hand, melds, context) {
    // 新手AI：随机打一张，但避免打出手牌中3张以上的牌
    const countMap = {};
    for (const tile of hand) {
      const key = tile.isZi ? `zi_${tile.rank}` : `${tile.suit}_${tile.rank}`;
      countMap[key] = (countMap[key] || 0) + 1;
    }

    // 找出孤张（只有一张的牌）
    const singleTiles = hand.filter(tile => {
      const key = tile.isZi ? `zi_${tile.rank}` : `${tile.suit}_${tile.rank}`;
      return countMap[key] === 1;
    });

    if (singleTiles.length > 0) {
      // 优先打孤张
      return singleTiles[Math.floor(Math.random() * singleTiles.length)];
    }

    // 没有孤张就随机打
    return hand[Math.floor(Math.random() * hand.length)];
  }

  shouldPong(hand, tile, context) {
    // 新手AI 50%概率碰
    return Math.random() > 0.5;
  }

  shouldChi(hand, tile, chiOptions, context) {
    // 新手AI 30%概率吃
    if (Math.random() > 0.7 && chiOptions.length > 0) {
      return chiOptions[Math.floor(Math.random() * chiOptions.length)];
    }
    return null;
  }
}
