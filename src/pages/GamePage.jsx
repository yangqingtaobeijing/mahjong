import { useState, useEffect, useCallback, useRef } from 'react'
import { GameEngine, GAME_STATE } from '../core/gameEngine'
import { detectTing } from '../core/winDetector'
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
  const timeoutRef = useRef(null)

  const updateUI = useCallback((engine) => {
    const state = engine.getState()
    const view = engine.getPlayerView(0)
    setGameState({ ...state })
    setPlayerView({ ...view })
    setCurrentPlayer(state.currentPlayer)
    setDrawnTile(view.drawnTile)
  }, [])

  const showHintMessage = useCallback((msg) => {
    setHint(msg)
    setShowHint(true)
    setTimeout(() => setShowHint(false), 5000)
  }, [])

  const clearAllTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  // 初始化游戏
  const initGame = useCallback(() => {
    clearAllTimeouts()
    const engine = new GameEngine()
    engineRef.current = engine
    const diff = config.difficulty || 'beginner'
    aiRef.current = [null, createAI(diff), createAI(diff), createAI(diff)]
    engine.initGame(['human', 'ai', 'ai', 'ai'])
    updateUI(engine)
    setIsPlayerTurn(true)
    setSelectedTile(null)
    setActions(null)
    setShowActions(false)
    setWinInfo(null)
    setScoreResult(null)
    if (diff === 'beginner') {
      showHintMessage('游戏开始！你是庄家，点击手牌选中后再点击"出牌"按钮。')
    }
  }, [config, updateUI, showHintMessage, clearAllTimeouts])

  // 处理玩家出牌
  const handleTileClick = useCallback((tile) => {
    if (!isPlayerTurn) return
    if (gameState?.state !== GAME_STATE.DISCARDING || gameState.currentPlayer !== 0) return
    if (selectedTile?.id === tile.id) {
      handleDiscard(tile)
    } else {
      setSelectedTile(tile)
    }
  }, [isPlayerTurn, gameState, selectedTile])

  const handleDiscard = useCallback((tile) => {
    if (!engineRef.current) return
    const result = engineRef.current.discardTile(0, tile.id)
    setSelectedTile(null)
    updateUI(engineRef.current)
    if (result.type === 'action_needed') {
      setActions(result.actions)
      setShowActions(true)
    } else {
      setIsPlayerTurn(false)
      timeoutRef.current = setTimeout(() => runAILoop(), 600)
    }
  }, [updateUI])

  // AI 主循环 - 简单可靠
  const runAILoop = useCallback(() => {
    if (!engineRef.current) return
    const engine = engineRef.current
    const state = engine.getState()

    if (state.state === GAME_STATE.ENDED) return

    const cp = state.currentPlayer

    // 轮到玩家了
    if (cp === 0) {
      updateUI(engine)
      setIsPlayerTurn(true)
      if (config.difficulty === 'beginner') {
        showHintMessage('轮到你了，请选择一张牌打出。')
      }
      return
    }

    // AI 摸牌
    const drawResult = engine.drawTile(cp)

    if (drawResult.type === 'draw_end') {
      updateUI(engine)
      setWinInfo({ winner: -2 })
      return
    }

    if (drawResult.type === 'self_draw_win') {
      engine.executeWin(cp, true)
      updateUI(engine)
      setWinInfo({ winner: cp, winType: 'self_draw' })
      return
    }

    // 更新 UI 显示摸牌
    updateUI(engine)

    // 延迟后 AI 出牌
    timeoutRef.current = setTimeout(() => {
      if (!engineRef.current) return

      const ai = aiRef.current[cp]
      const hand = engine.players[cp].hand
      const melds = engine.melds[cp]

      // AI 选择出牌
      const tile = ai.selectDiscard(hand, melds, {})
      const discardResult = engine.discardTile(cp, tile.id)
      updateUI(engine)

      if (discardResult.type === 'action_needed') {
        // 检查玩家是否可以操作
        const playerAction = discardResult.actions.find(a => a.playerIndex === 0)
        if (playerAction && (playerAction.canWin || playerAction.canPong || playerAction.canKong || playerAction.canChi)) {
          setActions(discardResult.actions)
          setShowActions(true)
          return
        }

        // AI 自动处理
        for (const act of discardResult.actions) {
          if (act.playerIndex === 0) continue
          if (act.canWin) {
            engine.executeWin(act.playerIndex, false)
            updateUI(engine)
            setWinInfo({ winner: act.playerIndex, winType: 'discard' })
            return
          }
          if (act.canPong) {
            engine.executePong(act.playerIndex)
            updateUI(engine)
            // 碰的 AI 延迟后出牌
            timeoutRef.current = setTimeout(() => {
              if (!engineRef.current) return
              const pongAI = aiRef.current[act.playerIndex]
              const pongHand = engine.players[act.playerIndex].hand
              const pongTile = pongAI.selectDiscard(pongHand, engine.melds[act.playerIndex], {})
              engine.discardTile(act.playerIndex, pongTile.id)
              updateUI(engine)
              // 继续循环
              timeoutRef.current = setTimeout(() => runAILoop(), 600)
            }, 600)
            return
          }
        }
      }

      // 没有操作，继续下一个 AI
      timeoutRef.current = setTimeout(() => runAILoop(), 600)
    }, 600)
  }, [config, updateUI, showHintMessage])

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
        updateUI(engineRef.current)
        setWinInfo(result)
        setScoreResult(score)
        break
      }
      case 'pong': {
        engineRef.current.executePong(0)
        updateUI(engineRef.current)
        setIsPlayerTurn(true)
        showHintMessage('你碰了！请打出一张牌。')
        break
      }
      case 'kong': {
        engineRef.current.executeKong(0)
        updateUI(engineRef.current)
        setIsPlayerTurn(true)
        break
      }
      case 'chi': {
        const chiOption = actions?.[0]?.chiOptions?.[0]
        if (chiOption) {
          engineRef.current.executeChi(0, chiOption)
          updateUI(engineRef.current)
          setIsPlayerTurn(true)
          showHintMessage('你吃了！请打出一张牌。')
        }
        break
      }
      case 'pass': {
        setIsPlayerTurn(false)
        timeoutRef.current = setTimeout(() => runAILoop(), 400)
        break
      }
    }
  }, [actions, updateUI, showHintMessage, runAILoop])

  const handleNewGame = useCallback(() => {
    initGame()
  }, [initGame])

  useEffect(() => {
    initGame()
    return () => clearAllTimeouts()
  }, [initGame, clearAllTimeouts])

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
          {!isPlayerTurn && ' - AI思考中...'}
        </div>
        <button className="btn btn-secondary" style={{ padding: '6px 16px', fontSize: '14px' }} onClick={handleNewGame}>
          重新开始
        </button>
      </div>

      {/* 牌桌区域 */}
      <div style={{ flex: 1, padding: '8px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1 }}>
          <GameBoard gameState={gameState} playerView={playerView} currentPlayer={currentPlayer} />
        </div>

        {/* 玩家手牌区域 */}
        <div style={{
          background: 'rgba(0,0,0,0.4)',
          borderRadius: '12px',
          padding: '8px',
          marginTop: '8px',
        }}>
          {playerView?.melds?.length > 0 && (
            <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
              <MeldArea melds={playerView.melds} />
            </div>
          )}
          <PlayerHand
            tiles={playerView?.hand}
            onTileClick={handleTileClick}
            selectedTile={selectedTile}
            isCurrentPlayer={isPlayerTurn}
            drawnTile={drawnTile}
          />
          {selectedTile && isPlayerTurn && gameState?.state === GAME_STATE.DISCARDING && gameState.currentPlayer === 0 && (
            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <button className="btn btn-action" onClick={() => handleDiscard(selectedTile)}>
                出牌
              </button>
            </div>
          )}
        </div>
      </div>

      <ActionPanel actions={actions} onAction={handleAction} visible={showActions} />
      <HintSystem hint={hint} visible={showHint} />

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
