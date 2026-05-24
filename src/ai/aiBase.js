// AI基类
import { sortTiles, isSameTileType } from '../core/tiles.js';
import { detectWin, detectTing } from '../core/winDetector.js';
import { canPong, canOpenKong, canConcealedKong, canChi } from '../core/meldDetector.js';

export class AIBase {
  constructor(difficulty) {
    this.difficulty = difficulty;
  }

  // 选择要打出的牌 - 子类重写
  selectDiscard(hand, melds, context) {
    throw new Error('子类必须实现 selectDiscard');
  }

  // 决定是否碰
  shouldPong(hand, tile, context) {
    return canPong(hand, tile);
  }

  // 决定是否杠
  shouldKong(hand, tile, context) {
    return canOpenKong(hand, tile);
  }

  // 决定是否吃
  shouldChi(hand, tile, chiOptions, context) {
    return chiOptions.length > 0 ? chiOptions[0] : null;
  }

  // 决定是否胡（放炮）
  shouldWin(hand, tile, context) {
    return true; // 一般都会胡
  }

  // 决定是否自摸
  shouldSelfDrawWin(hand, context) {
    return true;
  }

  // 处理暗杠
  shouldConcealedKong(hand, concealedKongKeys, context) {
    return concealedKongKeys.length > 0 ? concealedKongKeys[0] : null;
  }

  // 处理加杠
  shouldUpgradeKong(hand, upgradeOptions, context) {
    return upgradeOptions.length > 0 ? upgradeOptions[0] : null;
  }
}
