import { useState, useMemo } from 'react'
import { CATEGORIES, exercises } from '../data/index'
import ExerciseCard from '../components/ExerciseCard'

const DIFFICULTIES = [
  { id: 'all', label: 'All Levels', icon: 'filter_list' },
  { id: 'easy', label: 'Easy', icon: 'sentiment_satisfied' },
  { id: 'medium', label: 'Medium', icon: 'sentiment_neutral' },
  { id: 'hard', label: 'Hard', icon: 'sentiment_very_dissatisfied' },
]

export default function Catalog({ onStart, streak, completedIds }) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeDifficulty, setActiveDifficulty] = useState('all')
  const [showUnfinished, setShowUnfinished] = useState(false)

  const unfinishedCount = useMemo(
    () => exercises.filter((ex) => !completedIds?.has(ex.id)).length,
    [completedIds]
  )

  const visible = useMemo(
    () =>
      exercises.filter((ex) => {
        const catOk = activeCategory === 'all' || ex.categories.includes(activeCategory)
        const diffOk = activeDifficulty === 'all' || ex.difficulty.toLowerCase().startsWith(activeDifficulty)
        const doneOk = !showUnfinished || !completedIds?.has(ex.id)
        return catOk && diffOk && doneOk
      }),
    [activeCategory, activeDifficulty, showUnfinished, completedIds]
  )

  const clearAll = () => { setActiveCategory('all'); setActiveDifficulty('all'); setShowUnfinished(false) }
  const hasActiveFilter = activeCategory !== 'all' || activeDifficulty !== 'all' || showUnfinished

  return (
    <div className="flex flex-col w-full pb-space-xxl">
      {/* Ambient blobs */}
      <div className="relative w-full">
        <div className="absolute -top-24 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-0 w-80 h-80 bg-secondary-container/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="pt-space-lg pb-space-md flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div>
            <div className="inline-flex items-center gap-space-xs bg-primary-fixed px-space-md py-1 rounded-full mb-space-sm shadow-sm">
              <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                sentiment_very_satisfied
              </span>
              <span className="text-label-md text-on-primary-fixed uppercase tracking-wider font-bold">
                Fun Pronunciation Training
              </span>
            </div>
            <h1 className="text-headline-xl md:text-display-lg text-on-surface tracking-tight font-extrabold">
              What do you want to practice?
            </h1>
            <p className="text-body-lg text-on-surface-variant max-w-2xl mt-1">
              Tap a category to start training. Easy, quick and at your own pace!
            </p>
          </div>

          {/* Streak pill */}
          <div className="flex items-center gap-space-md bg-surface-container-lowest p-space-sm pr-space-md rounded-full shadow-[0_8px_24px_rgba(124,58,237,0.08)] self-start md:self-auto">
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary shadow-inner">
              <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_fire_department
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-label-sm uppercase text-secondary font-bold">Active Streak</span>
              <span className="text-headline-sm text-on-surface font-extrabold leading-none">{streak} days in a row!</span>
            </div>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="mt-space-md mb-space-xl flex flex-col gap-space-sm">
          <div className="flex items-center gap-space-sm overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`shrink-0 px-space-lg py-3 rounded-full text-label-lg font-bold transition-all transform active:translate-y-1 flex items-center gap-space-xs ${
                    active
                      ? 'bg-primary-container text-on-primary shadow-[0_4px_0_0_#5a00c6]'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface shadow-[0_4px_0_0_#ccc3d8]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                  {cat.label}
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-space-sm overflow-x-auto pb-1">
            {DIFFICULTIES.map((diff) => {
              const active = activeDifficulty === diff.id
              return (
                <button
                  key={diff.id}
                  onClick={() => setActiveDifficulty(diff.id)}
                  className={`shrink-0 px-space-md py-2 rounded-full text-label-md font-bold transition-all transform active:translate-y-0.5 flex items-center gap-1.5 ${
                    active
                      ? 'bg-tertiary-fixed text-on-surface shadow-[0_3px_0_0_#7b5ea7]'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface shadow-[0_3px_0_0_#ccc3d8]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{diff.icon}</span>
                  {diff.label}
                </button>
              )
            })}

            {/* Not Done toggle */}
            <button
              onClick={() => setShowUnfinished((v) => !v)}
              className={`shrink-0 px-space-md py-2 rounded-full text-label-md font-bold transition-all transform active:translate-y-0.5 flex items-center gap-1.5 ${
                showUnfinished
                  ? 'bg-secondary-container text-on-secondary-container shadow-[0_3px_0_0_#862208]'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface shadow-[0_3px_0_0_#ccc3d8]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {showUnfinished ? 'radio_button_checked' : 'radio_button_unchecked'}
              </span>
              Not Done
              {!showUnfinished && unfinishedCount < exercises.length && (
                <span className="text-label-sm opacity-70">({unfinishedCount})</span>
              )}
            </button>

            {hasActiveFilter && (
              <button
                onClick={clearAll}
                className="shrink-0 px-space-md py-2 rounded-full text-label-md font-bold text-secondary hover:bg-secondary-fixed/30 flex items-center gap-1.5 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Result count */}
        <div className="flex items-center justify-between mb-space-md">
          <span className="text-label-md text-on-surface-variant">
            {visible.length} exercise{visible.length !== 1 ? 's' : ''}
            {(activeCategory !== 'all' || activeDifficulty !== 'all') && ` of ${exercises.length}`}
          </span>
          {completedIds && completedIds.size > 0 && (
            <span className="flex items-center gap-1.5 text-label-md text-primary font-bold">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              {completedIds.size} completed
            </span>
          )}
        </div>

        {/* Cards grid */}
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-space-xxl text-center gap-space-md">
            <span className="material-symbols-outlined text-[56px] text-on-surface-variant/40">search_off</span>
            <p className="text-body-lg text-on-surface-variant">No exercises match these filters.</p>
            <button
              onClick={clearAll}
              className="px-space-lg py-space-sm rounded-full bg-primary-container text-on-primary text-label-lg font-bold"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
            {visible.map((ex) => (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                onStart={onStart}
                completed={completedIds?.has(ex.id) ?? false}
              />
            ))}
          </div>
        )}

        {/* Motivational banner */}
        <div className="mt-space-xxl bg-primary-fixed p-space-lg rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-space-md shadow-sm">
          <div className="flex items-center gap-space-md text-center sm:text-left">
            <div className="w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-md">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                emoji_objects
              </span>
            </div>
            <div>
              <h4 className="text-headline-sm text-on-primary-fixed font-bold">Remember your posture!</h4>
              <p className="text-body-md text-on-surface-variant">
                Keep your shoulders relaxed and hold your device at eye level for the best voice training results.
              </p>
            </div>
          </div>
          <div className="shrink-0 px-space-lg py-2.5 bg-surface-container-lowest text-primary text-label-lg font-bold rounded-full shadow-sm">
            💡 Pro tip
          </div>
        </div>
      </div>
    </div>
  )
}
