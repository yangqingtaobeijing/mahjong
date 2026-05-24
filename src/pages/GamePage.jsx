import { useState, useEffect, useCallback, useRef } from 'react'
import { GameEngine, GAME_STATE } from '../core/gameEngine'
import { detectTing, detectWin } from '../core/winDetector'
import { createAI } from '../ai'
import { calculateScore } from '../core/scorer'
import GameBoard from '../components/GameBoard'
import PlayerHand from '../components/PlayerHand'
import MeldArea from '../components/MeldArea'
import ActionPanel from '../components/ActionPanel'
import HintSystem from '../components/HintSystem'
import WinModal from '../components/WinModal'

export default function GamePage({ config, onGoHome }) {
  const engineRef = useRef(null)
  const aiRef = useRef([null, null, null])
  const [gameState, setGameState] = useState(null)
  const [playerView, setPlayerView] = useState(null)
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [selectedTile, setSelectedTile] = useState(null)
  const [actions, setActions] = useState(null)
  const [showActions, setShowActions] = useState(false)
  const [hint, setHint] = useState(null)
  const [showHint, setShowHint] = useState(false)
  const [winInfo, setWinInfo] = useState(null)
  const [scoreResult, setScoreResult] = useState(null)
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [drawnTile, setDrawnTile] = useState(null)
  const isProcessing = useRef(false)

  // 初始化游戏
  const initGame = useCallback(() => {
    const engine = new GameEngine()
    engineRef.current = engine

    // 创建AI
    const diff = config.difficulty || 'beginner'
    aiRef.current = [
      null, // 玩家
      createAI(diff),
      createAI(diff),
      createAI(diff),
    ]

    const result = engine.initGame(['human', 'ai', 'ai', 'ai'])
    updateUI(engine)
    setIsPlayerTurn(true)

    // 新手模式提示
    if (diff === 'beginner') {
      showHintMessage('游戏开始！你是庄家，请选择一张牌打出。点击手牌选中后再点击出牌。')
    }
  }, [config])

  const updateUI = (engine) => {
    const state = engine.getState()
    const view = engine.getPlayerView(0)
    setGameState(state)
    setPlayerView(view)
    setCurrentPlayer(state.currentPlayer)
    setDrawnTile(view.drawnTile)

    // 检测听牌
    if (view.hand.length === 13) {
      const ting = detectTing(view.hand)
      if (ting.length > 0 && config.difficulty !== 'beginner') {
        showHintMessage(`听牌了！可以胡：${ting.map(t => `${t.rank}${t.isZi ? '' : t.suit === 'wan' ? '万' : t.suit === 'tiao' ? '条' : '筒'}`).join('、')}`)
      }
    }
  }

  const showHintMessage = (msg) => {
    setHint(msg)
    setShowHint(true)
    setTimeout(() => setShowHint(false), 5000)
  }

  // 处理玩家出牌
  const handleTileClick = useCallback((tile) => {
    if (!isPlayerTurn || isProcessing.current) return
    if (gameState?.state !== GAME_STATE.DISCARDING || gameState.currentPlayer !== 0) return

    if (selectedTile?.id === tile.id) {
      // 双击出牌
      handleDiscard(tile)
    } else {
      setSelectedTile(tile)
    }
  }, [isPlayerTurn, gameState, selectedTile])

  const handleDiscard = useCallback((tile) => {
    if (!engineRef.current || isProcessing.current) return

    const result = engineRef.current.discardTile(0, tile.id)
    setSelectedTile(null)

    if (result.type === 'action_needed') {
      setActions(result.actions)
      setShowActions(true)
    } else {
      processNextTurn()
    }
  }, [])

  // 处理操作（吃碰杠胡）
  const handleAction = useCallback((actionType) => {
    if (!engineRef.current) return

    setShowActions(false)
    setActions(null)

    switch (actionType) {
      case 'win': {
        const result = engineRef.current.executeWin(0, false)
        const hand = engineRef.current.players[0].hand
        const melds = engineRef.current.melds[0]
        const score = calculateScore(hand, melds, 'discard')
        setWinInfo(result)
        setScoreResult(score)
        break;
      }
      case 'pong': {
        engineRef.current.executePong(0)
        updateUI(engineRef.current)
        setIsPlayerTurn(true)
        showHintMessage('你碰了！请打出一张牌。')
        break;
      }
      case 'kong': {
        engineRef.current.executeKong(0)
        updateUI(engineRef.current)
        setIsPlayerTurn(true)
        break;
      }
      case 'chi': {
        const chiOption = actions?.[0]?.chiOptions?.[0]
        if (chiOption) {
          engineRef.current.executeChi(0, chiOption)
          updateUI(engineRef.current)
          setIsPlayerTurn(true)
          showHintMessage('你吃了！请打出一张牌。')
        }
        break;
      }
      case 'pass': {
        processNextTurn()
        break;
      }
    }
  }, [actions])

  // AI回合
  const processNextTurn = useCallback(() => {
    if (isProcessing.current) return
    isProcessing.current = true
    setIsPlayerTurn(false)

    const processAI = () => {
      if (!engineRef.current) {
        isProcessing.current = false
        return
      }

      const engine = engineRef.current
      const state = engine.getState()

      if (state.state === GAME_STATE.ENDED) {
        isProcessing.current = false
        return
      }

      const cp = state.currentPlayer

      // 摸牌
      const drawResult = engine.drawTile(cp)

      if (drawResult.type === 'draw_end') {
        // 流局
        setWinInfo({ winner: -2 })
        isProcessing.current = false
        return
      }

      if (drawResult.type === 'self_draw_win') {
        // 自摸
        if (cp === 0) {
          const result = engine.executeWin(0, true)
          const hand = engine.players[0].hand
          const melds = engine.melds[0]
          const score = calculateScore(hand, melds, 'self_draw')
          setWinInfo(result)
          setScoreResult(score)
        } else {
          engine.executeWin(cp, true)
          setWinInfo({ winner: cp, winType: 'self_draw' })
        }
        isProcessing.current = false
        return
      }

      // AI选择出牌
      if (cp !== 0) {
        const ai = aiRef.current[cp]
        const hand = engine.players[cp].hand
        const melds = engine.melds[cp]

        // 处理暗杠
        if (drawResult.concealedKong) {
          const shouldKong = ai.shouldConcealedKong(hand, drawResult.concealedKong)
          if (shouldKong) {
            engine.executeKong(cp, true)
            updateUI(engine)
            setTimeout(processAI, 500)
            return
          }
        }

        const tile = ai.selectDiscard(hand, melds, {})
        const discardResult = engine.discardTile(cp, tile.id)

        updateUI(engine)

        if (discardResult.type === 'action_needed') {
          // 检查玩家是否可以操作
          const playerAction = discardResult.actions.find(a => a.playerIndex === 0)
          if (playerAction && (playerAction.canWin || playerAction.canPong || playerAction.canKong || playerAction.canChi)) {
            setActions(discardResult.actions)
            setShowActions(true)
            isProcessing.current = false
            return
          }

          // AI自动处理
          for (const act of discardResult.actions) {
            if (act.playerIndex === 0) continue
            if (act.canWin) {
              engine.executeWin(act.playerIndex, false)
              setWinInfo({ winner: act.playerIndex, winType: 'discard' })
              isProcessing.current = false
              return
            }
            if (act.canPong) {
              engine.executePong(act.playerIndex)
              // 碰的AI要出牌
              const pongAI = aiRef.current[act.playerIndex]
              const pongHand = engine.players[act.playerIndex].hand
              const pongTile = pongAI.selectDiscard(pongHand, engine.melds[act.playerIndex], {})
              engine.discardTile(act.playerIndex, pongTile.id)
              break;
            }
          }
        }

        updateUI(engine)

        // 下一个玩家
        const nextState = engine.getState()
        if (nextState.currentPlayer === 0) {
          setIsPlayerTurn(true)
          isProcessing.current = false
          if (config.difficulty === 'beginner') {
            showHintMessage('轮到你了，请摸牌后选择一张牌打出。')
          }
          return
        }

        setTimeout(processAI, 800)
      } else {
        // 玩家摸牌
        updateUI(engine)
        setIsPlayerTurn(true)
        isProcessing.current = false

        if (config.difficulty === 'beginner') {
          showHintMessage('你摸了一张牌，请选择一张牌打出。')
        }
      }
    }

    setTimeout(processAI, 500)
  }, [config])

  // 开始新游戏
  const handleNewGame = useCallback(() => {
    setWinInfo(null)
    setScoreResult(null)
    initGame()
  }, [initGame])

  useEffect(() => {
    initGame()
  }, [initGame])

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#071a0c',
    }}>
      {/* 顶部信息栏 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 16px',
        background: 'rgba(0,0,0,0.5)',
      }}>
        <button className="btn btn-secondary" style={{ padding: '6px 16px', fontSize: '14px' }} onClick={onGoHome}>
          退出
        </button>
        <div style={{ color: '#aaa', fontSize: '14px' }}>
          {config.difficulty === 'beginner' ? '新手模式' :
            config.difficulty === 'intermediate' ? '初级模式' : '中级模式'}
        </div>
        <button className="btn btn-secondary" style={{ padding: '6px 16px', fontSize: '14px' }} onClick={handleNewGame}>
          重新开始
        </button>
      </div>

      {/* 牌桌区域 */}
      <div style={{ flex: 1, padding: '8px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1 }}>
          <GameBoard
            gameState={gameState}
            playerView={playerView}
            currentPlayer={currentPlayer}
          />
        </div>

        {/* 玩家手牌区域 */}
        <div style={{
          background: 'rgba(0,0,0,0.4)',
          borderRadius: '12px',
          padding: '8px',
          marginTop: '8px',
        }}>
          {/* 副露区 */}
          {playerView?.melds?.length > 0 && (
            <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
              <MeldArea melds={playerView.melds} />
            </div>
          )}

          {/* 手牌 */}
          <PlayerHand
            tiles={playerView?.hand}
            onTileClick={handleTileClick}
            selectedTile={selectedTile}
            isCurrentPlayer={isPlayerTurn}
            drawnTile={drawnTile}
          />

          {/* 出牌按钮 */}
          {selectedTile && isPlayerTurn && gameState?.state === GAME_STATE.DISCARDING && gameState.currentPlayer === 0 && (
            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <button
                className="btn btn-action"
                onClick={() => handleDiscard(selectedTile)}
              >
                出牌
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 操作面板 */}
      <ActionPanel
        actions={actions}
        onAction={handleAction}
        visible={showActions}
      />

      {/* 提示系统 */}
      <HintSystem hint={hint} visible={showHint} />

      {/* 胡牌弹窗 */}
      {winInfo && (
        <WinModal
          winner={winInfo.winner}
          winType={winInfo.winType}
          hand={winInfo.winner === 0 ? playerView?.hand : undefined}
          melds={winInfo.winner === 0 ? playerView?.melds : undefined}
          scoreResult={scoreResult}
          onNewGame={handleNewGame}
          onGoHome={onGoHome}
        />
      )}
    </div>
  )
}
