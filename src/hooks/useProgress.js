import { useState, useEffect } from 'react'

const KEYS = {
  xp: 'sayit_xp',
  streak: 'sayit_streak',
  lastTrain: 'sayit_last_train',
  completed: 'sayit_completed',
}

function load(key, fallback = 0) {
  const v = localStorage.getItem(key)
  if (v === null) return fallback
  const n = parseInt(v, 10)
  return isNaN(n) ? fallback : n
}

export function useProgress() {
  const [xp, setXp] = useState(() => load(KEYS.xp))
  const [streak, setStreak] = useState(() => load(KEYS.streak, 0))
  const [todayTrained, setTodayTrained] = useState(
    () => localStorage.getItem(KEYS.lastTrain) === new Date().toDateString()
  )
  const [completedIds, setCompletedIds] = useState(
    () => new Set(JSON.parse(localStorage.getItem(KEYS.completed) || '[]'))
  )

  useEffect(() => {
    const lastTrain = localStorage.getItem(KEYS.lastTrain)
    if (!lastTrain) return
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    if (lastTrain !== today && lastTrain !== yesterday) {
      localStorage.setItem(KEYS.streak, '0')
      setStreak(0)
    }
  }, [])

  const addXp = (amount) => {
    setXp((prev) => {
      const next = prev + amount
      localStorage.setItem(KEYS.xp, String(next))
      return next
    })
  }

  const markTrained = () => {
    const today = new Date().toDateString()
    if (localStorage.getItem(KEYS.lastTrain) === today) return
    setStreak((prev) => {
      const next = prev + 1
      localStorage.setItem(KEYS.streak, String(next))
      return next
    })
    localStorage.setItem(KEYS.lastTrain, today)
    setTodayTrained(true)
  }

  const markComplete = (id) => {
    setCompletedIds((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      localStorage.setItem(KEYS.completed, JSON.stringify([...next]))
      return next
    })
  }

  return { xp, streak, todayTrained, completedIds, addXp, markTrained, markComplete }
}
