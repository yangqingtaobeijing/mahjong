import { useState } from 'react'
import HomePage from './pages/HomePage'
import GamePage from './pages/GamePage'
import TutorialPage from './pages/TutorialPage'

export default function App() {
  const [page, setPage] = useState('home')
  const [gameConfig, setGameConfig] = useState(null)

  const startGame = (config) => {
    setGameConfig(config)
    setPage('game')
  }

  const goHome = () => {
    setPage('home')
    setGameConfig(null)
  }

  const startTutorial = () => {
    setPage('tutorial')
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {page === 'home' && (
        <HomePage onStartGame={startGame} onStartTutorial={startTutorial} />
      )}
      {page === 'game' && gameConfig && (
        <GamePage config={gameConfig} onGoHome={goHome} />
      )}
      {page === 'tutorial' && (
        <TutorialPage onGoHome={goHome} onStartGame={startGame} />
      )}
    </div>
  )
}
