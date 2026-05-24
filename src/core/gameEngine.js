// 游戏引擎 - 状态机
import { sortTiles, isSameTileType } from './tiles.js';
import { deal } from './shuffle.js';
import { detectWin, detectTing, tilesToCountMap } from './winDetector.js';
import { canPong, canOpenKong, canConcealedKong, canUpgradeKong, canChi } from './meldDetector.js';

export const GAME_STATE = {
  WAITING: 'waiting',       // 等待开始
  DRAWING: 'drawing',       // 摸牌
  DISCARDING: 'discarding', // 出牌（玩家选择打出哪张）
  ACTION: 'action',         // 其他玩家选择是否吃碰杠胡
  ENDED: 'ended',           // 游戏结束
};

export const PLAYER_TYPE = {
  HUMAN: 'human',
  AI: 'ai',
};

export class GameEngine {
  constructor() {
    this.state = GAME_STATE.WAITING;
    this.players = [];
    this.walls = [];
    this.discardPools = [[], [], [], []]; // 4个玩家的牌河
    this.melds = [[], [], [], []]; // 4个玩家的副露（吃碰杠）
    this.currentPlayer = 0; // 当前轮到的玩家
    this.dealer = 0; // 庄家
    this.lastDiscard = null; // 最后打出的牌
    this.lastDiscardPlayer = -1; // 最后打出牌的玩家
    this.turnActions = null; // 当前可执行的操作
    this.winner = -1;
    this.winType = '';
    this.scoreResult = null;
    this.history = []; // 操作历史
    this.drawnTile = null; // 刚摸到的牌
  }

  // 初始化游戏
  initGame(playerTypes) {
    const { walls, players, dealerDraw } = deal();

    this.players = playerTypes.map((type, i) => ({
      type,
      hand: sortTiles(players[i]),
      melds: [],
      discards: [],
      isDealer: i === 0,
      score: 0,
    }));

    this.walls = walls;
    this.discardPools = [[], [], [], []];
    this.melds = [[], [], [], []];
    this.dealer = 0;
    this.currentPlayer = 0;
    this.winner = -1;
    this.winType = '';
    this.scoreResult = null;
    this.history = [];

    // 庄家摸第14张牌
    this.players[0].hand = sortTiles([...players[0], dealerDraw]);
    this.drawnTile = dealerDraw;

    this.state = GAME_STATE.DISCARDING;

    return {
      players: this.players.map(p => ({ ...p })),
      state: this.state,
      currentPlayer: this.currentPlayer,
      drawnTile: this.drawnTile,
    };
  }

  // 摸牌
  drawTile(playerIndex) {
    if (this.walls.length === 0) {
      this.state = GAME_STATE.ENDED;
      this.winner = -2; // 流局
      return { type: 'draw_end' };
    }

    const tile = this.walls.pop();
    this.players[playerIndex].hand = sortTiles([...this.players[playerIndex].hand, tile]);
    this.drawnTile = tile;
    this.currentPlayer = playerIndex;
    this.state = GAME_STATE.DISCARDING;

    // 检查自摸
    const winResult = detectWin(this.players[playerIndex].hand);
    if (winResult.canWin) {
      return { type: 'self_draw_win', tile, winType: winResult.winType };
    }

    // 检查暗杠
    const concealedKong = canConcealedKong(this.players[playerIndex].hand);

    // 检查加杠
    const upgradeKong = canUpgradeKong(this.players[playerIndex].hand, this.melds[playerIndex]);

    return {
      type: 'draw',
      tile,
      playerIndex,
      canSelfDrawWin: winResult.canWin,
      concealedKong,
      upgradeKong,
    };
  }

  // 出牌
  discardTile(playerIndex, tileId) {
    const player = this.players[playerIndex];
    const tileIndex = player.hand.findIndex(t => t.id === tileId);
    if (tileIndex === -1) return { type: 'error', message: '没有这张牌' };

    const tile = player.hand[tileIndex];
    player.hand = sortTiles(player.hand.filter((_, i) => i !== tileIndex));
    player.discards.push(tile);
    this.discardPools[playerIndex].push(tile);
    this.lastDiscard = tile;
    this.lastDiscardPlayer = playerIndex;

    this.history.push({ type: 'discard', player: playerIndex, tile });

    // 检测其他玩家的操作
    const actions = this._checkActionsAfterDiscard(playerIndex, tile);

    if (actions.some(a => a.canWin || a.canPong || a.canKong || a.canChi)) {
      this.state = GAME_STATE.ACTION;
      this.turnActions = actions;
      return { type: 'action_needed', actions, discardedTile: tile, discardedBy: playerIndex };
    }

    // 没人要，下一家摸牌
    const nextPlayer = (playerIndex + 1) % 4;
    this.state = GAME_STATE.DRAWING;
    return {
      type: 'next_turn',
      nextPlayer,
      discardedTile: tile,
      discardedBy: playerIndex,
    };
  }

  // 检测出牌后其他玩家的操作
  _checkActionsAfterDiscard(discardPlayer, tile) {
    const actions = [];

    for (let i = 0; i < 4; i++) {
      if (i === discardPlayer) continue;

      const player = this.players[i];
      const isNextPlayer = (i === (discardPlayer + 1) % 4);

      const canWin = detectWin([...player.hand, tile]).canWin;
      const canPongResult = canPong(player.hand, tile);
      const canKongResult = canOpenKong(player.hand, tile);
      const canChiResult = isNextPlayer ? canChi(player.hand, tile) : [];

      actions.push({
        playerIndex: i,
        canWin,
        canPong: canPongResult,
        canKong: canKongResult,
        canChi: canChiResult.length > 0,
        chiOptions: canChiResult,
      });
    }

    return actions;
  }

  // 执行碰
  executePong(playerIndex) {
    const tile = this.lastDiscard;
    const player = this.players[playerIndex];

    // 从手牌中移除两张相同的牌
    const matchingTiles = player.hand.filter(t => isSameTileType(t, tile));
    const pongTiles = matchingTiles.slice(0, 2);
    const remainingHand = [...player.hand];
    for (const pt of pongTiles) {
      const idx = remainingHand.findIndex(t => t.id === pt.id);
      if (idx !== -1) remainingHand.splice(idx, 1);
    }

    player.hand = sortTiles(remainingHand);
    this.melds[playerIndex].push({
      type: 'pong',
      tiles: [...pongTiles, tile],
      from: this.lastDiscardPlayer,
    });

    this.lastDiscard = null;
    this.currentPlayer = playerIndex;
    this.state = GAME_STATE.DISCARDING;

    this.history.push({ type: 'pong', player: playerIndex, tiles: pongTiles });
    return { type: 'pong', playerIndex, tiles: pongTiles };
  }

  // 执行吃
  executeChi(playerIndex, chiOption) {
    const player = this.players[playerIndex];
    const tile = this.lastDiscard;

    // 从手牌中移除吃用到的牌
    const chiHandTiles = chiOption.tiles.filter(t => t.id !== tile.id);
    const remainingHand = [...player.hand];
    for (const ct of chiHandTiles) {
      const idx = remainingHand.findIndex(t => t.id === ct.id);
      if (idx !== -1) remainingHand.splice(idx, 1);
    }

    player.hand = sortTiles(remainingHand);
    this.melds[playerIndex].push({
      type: 'chi',
      tiles: chiOption.tiles,
      from: this.lastDiscardPlayer,
    });

    this.lastDiscard = null;
    this.currentPlayer = playerIndex;
    this.state = GAME_STATE.DISCARDING;

    this.history.push({ type: 'chi', player: playerIndex, tiles: chiOption.tiles });
    return { type: 'chi', playerIndex, tiles: chiOption.tiles };
  }

  // 执行杠
  executeKong(playerIndex, isConcealed = false, upgradeTile = null) {
    const player = this.players[playerIndex];

    if (isConcealed) {
      // 暗杠
      const kongType = canConcealedKong(player.hand);
      if (!kongType) return { type: 'error', message: '无法暗杠' };

      const kongKey = kongType[0];
      const [suit, rank] = kongKey.startsWith('zi_')
        ? ['zi', kongKey.slice(3)]
        : kongKey.split('_');

      const matchingTiles = player.hand.filter(t =>
        t.isZi ? `zi_${t.rank}` === kongKey : `${t.suit}_${t.rank}` === kongKey
      );
      const kongTiles = matchingTiles.slice(0, 4);
      const remainingHand = player.hand.filter(t => !kongTiles.some(kt => kt.id === t.id));

      player.hand = sortTiles(remainingHand);
      this.melds[playerIndex].push({
        type: 'concealed_kong',
        tiles: kongTiles,
        from: -1,
      });

      this.history.push({ type: 'concealed_kong', player: playerIndex });

      // 暗杠后需要再摸一张
      const drawResult = this.drawTile(playerIndex);
      return { type: 'concealed_kong', playerIndex, drawResult };
    }

    if (upgradeTile) {
      // 加杠
      const pongMeld = this.melds[playerIndex].find(
        m => m.type === 'pong' && isSameTileType(m.tiles[0], upgradeTile)
      );
      if (!pongMeld) return { type: 'error', message: '无法加杠' };

      const idx = player.hand.findIndex(t => t.id === upgradeTile.id);
      if (idx === -1) return { type: 'error', message: '没有这张牌' };

      player.hand = sortTiles(player.hand.filter((_, i) => i !== idx));
      pongMeld.type = 'upgrade_kong';
      pongMeld.tiles.push(upgradeTile);

      this.history.push({ type: 'upgrade_kong', player: playerIndex });

      // 加杠后需要再摸一张
      const drawResult = this.drawTile(playerIndex);
      return { type: 'upgrade_kong', playerIndex, drawResult };
    }

    // 明杠
    const tile = this.lastDiscard;
    const matchingTiles = player.hand.filter(t => isSameTileType(t, tile));
    const kongTiles = matchingTiles.slice(0, 3);
    const remainingHand = player.hand.filter(t => !kongTiles.some(kt => kt.id === t.id));

    player.hand = sortTiles(remainingHand);
    this.melds[playerIndex].push({
      type: 'open_kong',
      tiles: [...kongTiles, tile],
      from: this.lastDiscardPlayer,
    });

    this.lastDiscard = null;
    this.history.push({ type: 'open_kong', player: playerIndex });

    // 明杠后需要再摸一张
    const drawResult = this.drawTile(playerIndex);
    return { type: 'open_kong', playerIndex, drawResult };
  }

  // 执行胡牌
  executeWin(playerIndex, isSelfDraw = false) {
    const player = this.players[playerIndex];
    this.winner = playerIndex;
    this.state = GAME_STATE.ENDED;

    if (isSelfDraw) {
      this.winType = 'self_draw';
    } else {
      this.winType = 'discard';
      // 从最后一张打出的牌加入手牌
      player.hand = sortTiles([...player.hand, this.lastDiscard]);
    }

    this.history.push({
      type: 'win',
      player: playerIndex,
      winType: this.winType,
      hand: [...player.hand],
      melds: [...this.melds[playerIndex]],
    });

    return {
      type: 'win',
      winner: playerIndex,
      winType: this.winType,
      hand: player.hand,
      melds: this.melds[playerIndex],
    };
  }

  // 获取当前状态
  getState() {
    return {
      state: this.state,
      players: this.players.map(p => ({
        ...p,
        handCount: p.hand.length,
      })),
      currentPlayer: this.currentPlayer,
      wallsCount: this.walls.length,
      discardPools: this.discardPools,
      lastDiscard: this.lastDiscard,
      winner: this.winner,
      winType: this.winType,
    };
  }

  // 获取玩家可见的信息（隐藏其他玩家手牌）
  getPlayerView(playerIndex) {
    const player = this.players[playerIndex];
    return {
      hand: player.hand,
      melds: this.melds[playerIndex],
      discards: player.discards,
      handCount: player.hand.length,
      drawnTile: this.drawnTile,
    };
  }
}
