import { useState } from 'react'
import { exercises } from './data/index'
import { useProgress } from './hooks/useProgress'
import Header from './components/Header'
import InstallPrompt from './components/InstallPrompt'
import StatsModal from './components/StatsModal'
import Catalog from './pages/Catalog'
import Training from './pages/Training'
import './App.css'

export default function App() {
  const [page, setPage] = useState('catalog')
  const [currentExercise, setCurrentExercise] = useState(exercises[0])
  const [statsOpen, setStatsOpen] = useState(false)
  const { xp, streak, todayTrained, completedIds, addXp, markTrained, markComplete } = useProgress()

  const handleStartExercise = (exercise) => {
    setCurrentExercise(exercise)
    setPage('training')
  }

  const handleNavigate = (target) => {
    if (target === 'training') {
      const random = exercises[Math.floor(Math.random() * exercises.length)]
      setCurrentExercise(random)
      setPage('training')
    } else {
      setPage('catalog')
    }
  }

  return (
    <div className="bg-surface font-sans text-body-md text-on-surface antialiased min-h-screen w-full flex flex-col">
      <Header page={page} onNavigate={handleNavigate} xp={xp} streak={streak} onOpenStats={() => setStatsOpen(true)} />
      <main className="w-full pt-20 flex-1 max-w-7xl mx-auto px-margin md:px-8 lg:px-margin-desktop">
        {page === 'catalog' ? (
          <Catalog onStart={handleStartExercise} streak={streak} completedIds={completedIds} />
        ) : (
          <Training
            exercise={currentExercise}
            streak={streak}
            todayTrained={todayTrained}
            onBack={() => setPage('catalog')}
            addXp={addXp}
            markTrained={markTrained}
            markComplete={markComplete}
          />
        )}
      </main>
      <footer className="w-full bg-surface-container-low py-space-lg shadow-[0_-1px_6px_rgba(124,58,237,0.03)]">
        <div className="max-w-7xl mx-auto px-margin md:px-8 lg:px-margin-desktop flex flex-col sm:flex-row items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs">
            <span className="text-label-md text-primary font-bold">SayIt</span>
            <span className="text-body-sm text-on-surface-variant">• English pronunciation made fun</span>
          </div>
          <div className="text-label-sm text-on-surface-variant">© 2025 SayIt. Train your voice every day.</div>
        </div>
      </footer>
      <InstallPrompt />
      {statsOpen && (
        <StatsModal
          xp={xp}
          streak={streak}
          completedIds={completedIds}
          onClose={() => setStatsOpen(false)}
        />
      )}
    </div>
  )
}
