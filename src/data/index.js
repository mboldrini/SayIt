const modules = import.meta.glob('./exercises/*.json', { eager: true })

export const exercises = Object.values(modules).map((m) => m.default)

export const CATEGORIES = [
  { id: 'all', label: 'All Exercises', icon: 'apps' },
  { id: 'tongue-twisters', label: 'Tongue Twisters', icon: 'record_voice_over' },
  { id: 'short-words', label: 'Word Power', icon: 'bolt' },
  { id: 'daily-phrases', label: 'Daily Phrases', icon: 'forum' },
  { id: 'cork', label: 'Cork Training', icon: 'wine_bar' },
]
