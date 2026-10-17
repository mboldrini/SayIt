import { exercises, CATEGORIES } from '../data/index'

const CAT_COLORS = {
  'tongue-twisters': 'bg-primary-container',
  'short-words': 'bg-tertiary-fixed',
  'daily-phrases': 'bg-secondary-fixed',
  'cork': 'bg-primary-fixed',
}

export default function StatsModal({ xp, streak, completedIds, onClose }) {
  const total = exercises.length
  const doneCount = completedIds.size
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0

  const catStats = CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
    const catExs = exercises.filter((ex) => ex.categories.includes(cat.id))
    const catDone = catExs.filter((ex) => completedIds.has(ex.id)).length
    return { ...cat, total: catExs.length, done: catDone }
  })

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-space-md font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-on-surface/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-md bg-surface-container-lowest sm:rounded-2xl rounded-t-3xl shadow-[0_-8px_64px_rgba(99,14,212,0.18)] p-space-xl flex flex-col gap-space-xl overflow-y-auto max-h-[90vh]">
        {/* Handle (mobile) */}
        <div className="sm:hidden w-12 h-1.5 rounded-full bg-outline-variant mx-auto -mt-space-sm mb-0" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span
                className="material-symbols-outlined text-on-primary text-[22px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                leaderboard
              </span>
            </div>
            <h2 className="text-headline-md text-on-surface font-bold">Your Progress</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-container-high text-on-surface-variant transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* XP & Streak */}
        <div className="grid grid-cols-2 gap-space-md">
          <div className="bg-primary-fixed rounded-2xl p-space-lg flex flex-col items-center gap-1 shadow-sm">
            <span
              className="material-symbols-outlined text-tertiary text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
            <span className="text-display-lg text-primary font-extrabold">{xp.toLocaleString()}</span>
            <span className="text-label-md text-on-primary-fixed font-bold">Total XP</span>
          </div>
          <div className="bg-secondary-fixed rounded-2xl p-space-lg flex flex-col items-center gap-1 shadow-sm">
            <span
              className="material-symbols-outlined text-secondary text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_fire_department
            </span>
            <span className="text-display-lg text-secondary font-extrabold">{streak}</span>
            <span className="text-label-md text-on-secondary-fixed font-bold">Day Streak</span>
          </div>
        </div>

        {/* Overall completion */}
        <div>
          <div className="flex items-center justify-between mb-space-sm">
            <span className="text-label-lg text-on-surface font-bold">Exercises Completed</span>
            <span className="text-label-lg text-primary font-bold">{doneCount} / {total}</span>
          </div>
          <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-label-sm text-on-surface-variant">{pct}% complete</span>
            {pct === 100 && (
              <span className="text-label-sm text-primary font-bold">🏆 All done!</span>
            )}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="flex flex-col gap-space-md">
          <span className="text-label-lg text-on-surface font-bold">By Category</span>
          {catStats.map((cat) => {
            const catPct = cat.total > 0 ? Math.round((cat.done / cat.total) * 100) : 0
            return (
              <div key={cat.id} className="flex items-center gap-space-md">
                <div className={`w-9 h-9 rounded-full ${CAT_COLORS[cat.id] ?? 'bg-surface-container'} flex items-center justify-center shrink-0`}>
                  <span className="material-symbols-outlined text-primary text-[18px]">{cat.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-label-md text-on-surface truncate">{cat.label}</span>
                    <span className="text-label-sm text-on-surface-variant shrink-0 ml-2">
                      {cat.done}/{cat.total}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-container rounded-full transition-all duration-700"
                      style={{ width: `${catPct}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
