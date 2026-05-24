// 洗牌和发牌
import { createFullTileSet } from './tiles.js';

// Fisher-Yates 洗牌算法
export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 发牌：返回 { walls, players, dealerDraw }
// walls: 剩余的牌墙
// players: 4个玩家的手牌（每人13张）
// dealerDraw: 庄家额外摸的第14张牌
export function deal() {
  const allTiles = shuffle(createFullTileSet());

  const players = [[], [], [], []];

  // 每人发13张
  for (let round = 0; round < 13; round++) {
    for (let p = 0; p < 4; p++) {
      players[p].push(allTiles[round * 4 + p]);
    }
  }

  // 庄家（玩家0）再摸一张
  const dealerDraw = allTiles[52];
  const walls = allTiles.slice(53);

  return { walls, players, dealerDraw };
}
