import { memo } from 'react'

const themes = {
  primary: {
    iconBg: 'bg-primary-fixed',
    iconColor: 'text-primary',
    subtitleColor: 'text-primary',
    button: 'bg-primary-container hover:bg-primary text-on-primary shadow-[0_4px_0_0_#5a00c6]',
    infoBox: 'bg-surface-container-low text-on-surface-variant',
    glow: true,
  },
  secondary: {
    iconBg: 'bg-secondary-fixed',
    iconColor: 'text-secondary',
    subtitleColor: 'text-secondary',
    button: 'bg-primary-fixed hover:bg-primary-container text-on-primary-fixed hover:text-on-primary shadow-[0_3px_0_0_#ccc3d8]',
    infoBox: 'bg-surface-container-low text-on-surface-variant',
    glow: false,
  },
  tertiary: {
    iconBg: 'bg-tertiary-fixed',
    iconColor: 'text-tertiary',
    subtitleColor: 'text-tertiary',
    button: 'bg-primary-fixed hover:bg-primary-container text-on-primary-fixed hover:text-on-primary shadow-[0_3px_0_0_#ccc3d8]',
    infoBox: 'bg-surface-container-low text-on-surface-variant',
    glow: false,
  },
  cork: {
    iconBg: 'bg-secondary-container/20',
    iconColor: 'text-secondary',
    subtitleColor: 'text-secondary',
    button: 'bg-secondary-container hover:bg-secondary text-on-primary shadow-[0_4px_0_0_#a7391e]',
    infoBox: 'bg-secondary-fixed/40 text-on-secondary-fixed',
    glow: false,
  },
}

function ExerciseCard({ exercise, onStart, completed }) {
  const t = themes[exercise.colorTheme] || themes.primary
  const isCork = exercise.categories.includes('cork') || exercise.isCorkFriendly

  return (
    <div className="group bg-surface-container-lowest rounded-lg p-space-lg shadow-[0_12px_32px_rgba(124,58,237,0.07)] hover:shadow-[0_16px_40px_rgba(124,58,237,0.14)] transition-all flex flex-col justify-between relative overflow-hidden transform hover:-translate-y-1">
      {completed && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-on-primary text-label-sm font-bold shadow-md">
          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          Done
        </div>
      )}
      {t.glow && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
      )}

      <div>
        <div className="flex items-center justify-between mb-space-md flex-wrap gap-2">
          {isCork ? (
            <span className="inline-flex items-center gap-1.5 px-space-md py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-label-sm font-bold shadow-sm">
              🍷 Great with Cork
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-space-md py-1 rounded-full bg-surface-container-high text-on-surface text-label-sm font-bold">
              <span className="material-symbols-outlined text-[16px] text-primary">psychology</span>
              {exercise.difficulty}
            </span>
          )}
          <span className="text-label-md text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px] text-primary">format_quote</span>
            {exercise.phraseCount} phrases
          </span>
        </div>

        <div className="flex items-start gap-space-md mb-space-sm">
          <div className={`w-14 h-14 rounded-2xl ${t.iconBg} flex items-center justify-center ${t.iconColor} shadow-sm shrink-0`}>
            <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {exercise.icon}
            </span>
          </div>
          <div>
            <span className={`text-label-sm font-extrabold uppercase ${t.subtitleColor} tracking-wider`}>
              {exercise.subtitle}
            </span>
            <h3 className="text-headline-md text-on-surface font-bold leading-tight">{exercise.title}</h3>
          </div>
        </div>

        <p className="text-body-md text-on-surface-variant mb-space-md pl-1">{exercise.description}</p>

        <div className={`${t.infoBox} rounded-xl p-space-sm mb-space-lg flex items-center gap-space-sm text-label-sm`}>
          <span className="material-symbols-outlined text-primary text-[20px]">lightbulb</span>
          <span>{exercise.tip}</span>
        </div>
      </div>

      <button
        onClick={() => onStart(exercise)}
        className={`w-full py-space-md px-space-lg rounded-full ${t.button} text-label-lg font-bold active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-space-sm`}
      >
        <span>Start Training</span>
        <span className="material-symbols-outlined text-[20px]">play_arrow</span>
      </button>
    </div>
  )
}

export default memo(ExerciseCard)
