import { useState, useCallback, useRef } from 'react'
import { useSpeechRecognition, scoreAttempt } from '../hooks/useSpeechRecognition'

const XP_MAP = { perfect: 30, good: 15, retry: 5 }
const BONUS_XP = 50

function HighlightedPhrase({ phrase, pattern }) {
  if (!pattern) return <span>{phrase}</span>

  let regex
  try {
    regex = new RegExp(`(${pattern})`, 'gi')
  } catch {
    return <span>{phrase}</span>
  }

  const parts = []
  let lastIndex = 0
  let match
  regex.lastIndex = 0

  while ((match = regex.exec(phrase)) !== null) {
    if (match.index > lastIndex) parts.push({ text: phrase.slice(lastIndex, match.index), hi: false })
    parts.push({ text: match[0], hi: true })
    lastIndex = match.index + match[0].length
    if (match[0].length === 0) { regex.lastIndex++; continue }
  }
  if (lastIndex < phrase.length) parts.push({ text: phrase.slice(lastIndex), hi: false })

  return (
    <>
      {parts.map((p, i) =>
        p.hi ? (
          <span key={i} className="text-on-primary-fixed-variant bg-primary-fixed rounded-md px-0.5 mx-px">{p.text}</span>
        ) : (
          <span key={i}>{p.text}</span>
        )
      )}
    </>
  )
}

function ResultBadge({ result }) {
  if (!result) return null
  const styles = {
    perfect: 'bg-primary-fixed text-on-primary-fixed border-primary-container',
    good: 'bg-tertiary-fixed text-on-tertiary-fixed border-tertiary-container',
    retry: 'bg-secondary-fixed text-on-secondary-fixed border-secondary-container',
  }
  return (
    <div className={`mt-space-lg px-space-lg py-space-md rounded-2xl border-2 ${styles[result.level]} flex flex-col items-center gap-1`}>
      <span className="text-headline-sm font-bold">{result.message}</span>
      <span className="text-label-sm font-bold text-primary">+{XP_MAP[result.level]} XP</span>
      {result.transcript && (
        <span className="text-body-sm opacity-70">I heard: "<em>{result.transcript}</em>"</span>
      )}
    </div>
  )
}

function CompletionScreen({ exercise, sessionResults, totalXp, onRestart, onBack }) {
  const counts = { perfect: 0, good: 0, retry: 0 }
  Object.values(sessionResults).forEach((r) => { if (r) counts[r.level]++ })

  return (
    <div className="flex flex-col items-center justify-center py-space-xxl text-center gap-space-xl">
      {/* Big celebration */}
      <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center shadow-[0_12px_40px_rgba(99,14,212,0.3)]">
        <span className="material-symbols-outlined text-on-primary text-[52px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          emoji_events
        </span>
      </div>

      <div>
        <p className="text-label-lg text-primary font-bold uppercase tracking-wider mb-space-sm">Exercise Complete!</p>
        <h2 className="text-display-lg text-on-surface font-extrabold tracking-tight">{exercise.title}</h2>
        <p className="text-body-lg text-on-surface-variant mt-2">You finished all {exercise.phrases.length} phrases.</p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-space-md flex-wrap justify-center">
        <div className="flex flex-col items-center px-space-xl py-space-md bg-primary-fixed rounded-2xl shadow-sm">
          <span className="text-display-lg text-primary font-extrabold">{counts.perfect}</span>
          <span className="text-label-md text-on-primary-fixed font-bold">Perfect 🎉</span>
        </div>
        <div className="flex flex-col items-center px-space-xl py-space-md bg-tertiary-fixed rounded-2xl shadow-sm">
          <span className="text-display-lg text-tertiary font-extrabold">{counts.good}</span>
          <span className="text-label-md text-on-tertiary-fixed font-bold">Good 👍</span>
        </div>
        <div className="flex flex-col items-center px-space-xl py-space-md bg-secondary-fixed rounded-2xl shadow-sm">
          <span className="text-display-lg text-secondary font-extrabold">{counts.retry}</span>
          <span className="text-label-md text-on-secondary-fixed font-bold">Retry 🎯</span>
        </div>
      </div>

      {/* XP earned */}
      <div className="flex items-center gap-space-sm px-space-xl py-space-md bg-surface-container-lowest rounded-full shadow-[0_8px_24px_rgba(124,58,237,0.1)]">
        <span className="material-symbols-outlined text-tertiary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
        <span className="text-headline-lg text-on-surface font-extrabold">+{totalXp} XP earned!</span>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-space-md">
        <button
          onClick={onRestart}
          className="flex items-center gap-space-sm px-space-xl py-space-md rounded-full bg-primary-container text-on-primary-container text-label-lg font-bold shadow-[0_4px_0_0_#5a00c6] active:translate-y-1 active:shadow-none transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">replay</span>
          Train Again
        </button>
        <button
          onClick={onBack}
          className="flex items-center gap-space-sm px-space-xl py-space-md rounded-full bg-surface-container-high text-on-surface text-label-lg font-bold shadow-[0_4px_0_0_#ccc3d8] active:translate-y-1 active:shadow-none transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">grid_view</span>
          Choose Another
        </button>
      </div>
    </div>
  )
}

export default function Training({ exercise, streak, todayTrained, onBack, addXp, markTrained, markComplete }) {
  const [mode, setMode] = useState('free')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [result, setResult] = useState(null)
  const [speaking, setSpeaking] = useState(false)
  const [sessionResults, setSessionResults] = useState({})
  const [sessionXp, setSessionXp] = useState(0)
  const [completed, setCompleted] = useState(false)

  const { isRecording, start, stop, supported } = useSpeechRecognition()
  const phrase = exercise.phrases[phraseIndex]
  const total = exercise.phrases.length
  const phraseXpRef = useRef({}) // tracks XP already awarded per phrase index

  const handleRecord = useCallback(() => {
    if (isRecording) { stop(); return }
    setResult(null)
    start((transcript, confidence) => {
      const scored = { ...scoreAttempt(transcript, phrase, { confidence, targetSounds: exercise.targetSounds ?? [] }), transcript }
      setResult(scored)
      const earned = XP_MAP[scored.level]
      const prevEarned = phraseXpRef.current[phraseIndex] ?? 0
      const delta = earned - prevEarned
      if (delta > 0) {
        phraseXpRef.current[phraseIndex] = earned
        setSessionXp((prev) => prev + delta)
        addXp(delta)
      }
      setSessionResults((prev) => ({ ...prev, [phraseIndex]: scored }))
      markTrained()
    })
  }, [isRecording, phrase, phraseIndex, start, stop, addXp, markTrained])

  const goTo = (idx) => {
    if (idx < 0) return
    if (idx >= total) {
      addXp(BONUS_XP)
      setSessionXp((prev) => prev + BONUS_XP)
      markComplete(exercise.id)
      setCompleted(true)
      return
    }
    setPhraseIndex(idx)
    setResult(null)
  }

  const restart = () => {
    window.speechSynthesis?.cancel()
    phraseXpRef.current = {}
    setPhraseIndex(0)
    setResult(null)
    setSpeaking(false)
    setSessionResults({})
    setSessionXp(0)
    setCompleted(false)
  }

  const listenDemo = () => {
    if (!('speechSynthesis' in window) || !phrase) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(phrase)
    utterance.lang = 'en-US'
    utterance.rate = 0.82
    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    try {
      window.speechSynthesis.speak(utterance)
    } catch {
      setSpeaking(false)
    }
  }

  const progressPct = Math.round(((phraseIndex + 1) / total) * 100)

  if (completed) {
    return (
      <CompletionScreen
        exercise={exercise}
        sessionResults={sessionResults}
        totalXp={sessionXp}
        onRestart={restart}
        onBack={onBack}
      />
    )
  }

  return (
    <div className="flex flex-col w-full py-space-md md:py-space-xl">
      {/* Back button */}
      <div className="mb-space-md">
        <button
          onClick={onBack}
          className="flex items-center gap-space-xs px-space-md py-space-xs rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high text-label-lg transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Catalog
        </button>
      </div>

      {/* Mode selector */}
      <div className="flex flex-col items-center justify-center gap-space-md mb-space-xl text-center">
        <div className="inline-flex items-center p-1.5 rounded-full bg-surface-container shadow-[0_4px_16px_rgba(124,58,237,0.08)]">
          <button
            onClick={() => setMode('free')}
            className={`flex items-center gap-space-sm px-space-xl py-space-md rounded-full text-headline-sm transition-all ${
              mode === 'free'
                ? 'bg-primary-container text-on-primary-container shadow-[0_4px_0_0_#5a00c6] scale-105'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">sentiment_very_satisfied</span>
            Free Speech
          </button>
          <button
            onClick={() => setMode('cork')}
            className={`flex items-center gap-space-sm px-space-xl py-space-md rounded-full text-headline-sm transition-all ${
              mode === 'cork'
                ? 'bg-secondary-container text-on-secondary-container shadow-[0_4px_0_0_#862208] scale-105'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">sports_bar</span>
            Cork Mode 🍷
          </button>
        </div>

        {mode === 'cork' && (
          <div className="flex items-center gap-space-xs px-space-lg py-space-xs rounded-full bg-secondary-fixed text-on-secondary-fixed shadow-sm">
            <span className="material-symbols-outlined text-[20px] text-secondary">tips_and_updates</span>
            <span className="text-label-lg font-bold">Cork gently between front teeth — breathe deep and let go!</span>
          </div>
        )}
      </div>

      {/* 12-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
        {/* Main exercise card */}
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          <div className="relative bg-surface-container-lowest rounded-xl p-space-xl shadow-[0_12px_36px_rgba(124,58,237,0.12)] flex flex-col items-center text-center overflow-hidden">
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-primary-fixed-dim/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-secondary-fixed/40 rounded-full blur-3xl pointer-events-none" />

            {/* Meta chips */}
            <div className="flex flex-wrap items-center justify-center gap-space-sm z-10 mb-space-lg">
              <span className="px-space-md py-space-xs rounded-full bg-primary-fixed text-on-primary-fixed text-label-md">
                {exercise.targetSounds.join(' & ')} Sounds
              </span>
              <span className="px-space-md py-space-xs rounded-full bg-surface-container-high text-on-surface-variant text-label-md">
                {exercise.difficulty}
              </span>
            </div>

            {/* Phrase */}
            <div className="z-10 py-space-md max-w-2xl">
              <p className="text-display-lg text-on-surface leading-tight font-extrabold tracking-tight select-none">
                <HighlightedPhrase phrase={phrase} pattern={exercise.highlightPattern} />
              </p>
            </div>

            {/* Sound chips */}
            <div className="flex items-center justify-center gap-space-xs mt-space-sm mb-space-xl z-10">
              <span className="text-label-md text-on-surface-variant">Focus sounds:</span>
              {exercise.targetSounds.map((s) => (
                <span key={s} className="w-10 h-10 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center text-headline-sm font-bold">
                  {s}
                </span>
              ))}
            </div>

            {/* Listen demo */}
            <div className="z-10">
              <button
                onClick={listenDemo}
                className={`flex items-center gap-space-sm px-space-xl py-space-md rounded-full text-primary text-headline-sm shadow-[0_3px_0_0_#ccc3d8] active:translate-y-0.5 transition-all ${
                  speaking ? 'bg-primary-fixed scale-95' : 'bg-surface-container-high hover:bg-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {speaking ? 'graphic_eq' : 'volume_up'}
                </span>
                {speaking ? 'Playing...' : 'Hear correct pronunciation'}
              </button>
            </div>

            {/* Result / status */}
            <div className="z-10 w-full">
              <ResultBadge result={result} />
              {!result && !isRecording && (
                <p className="mt-space-lg text-body-md text-on-surface-variant">
                  Tap the microphone below when ready! 👇
                </p>
              )}
              {isRecording && (
                <p className="mt-space-lg text-body-md text-secondary font-bold animate-pulse">
                  Listening with care... speak now! ✨
                </p>
              )}
            </div>
          </div>

          {/* Controls bar */}
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-space-md bg-surface-container-lowest rounded-xl p-space-md sm:p-space-lg shadow-[0_8px_24px_rgba(124,58,237,0.06)]">
            <button
              onClick={() => goTo(phraseIndex - 1)}
              disabled={phraseIndex === 0}
              className="order-2 sm:order-1 flex items-center gap-space-xs px-space-lg py-space-md rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-label-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              Previous
            </button>

            {/* Mic button */}
            <div className="order-1 sm:order-2 relative flex flex-col items-center">
              {isRecording && (
                <div className="absolute inset-0 -m-3 rounded-full bg-secondary-container/30 blur-md pointer-events-none" />
              )}
              {supported ? (
                <button
                  onClick={handleRecord}
                  className={`relative flex items-center justify-center gap-space-md px-space-xl py-space-lg rounded-full text-label-lg font-bold transition-all ${
                    isRecording
                      ? 'bg-secondary-container text-on-secondary-container shadow-[0_6px_0_0_#862208] animate-pulse scale-105'
                      : 'bg-primary-container text-on-primary-container shadow-[0_6px_0_0_#5a00c6] hover:brightness-105'
                  } active:translate-y-1 active:shadow-[0_2px_0_0_#5a00c6]`}
                >
                  <span className="material-symbols-outlined text-[32px]">
                    {isRecording ? 'graphic_eq' : 'mic'}
                  </span>
                  <span className="text-headline-md tracking-tight">
                    {isRecording ? "I'm listening... tap to stop" : 'Tap to Speak'}
                  </span>
                </button>
              ) : (
                <div className="px-space-xl py-space-lg rounded-full bg-surface-container text-on-surface-variant text-label-lg text-center">
                  <span className="material-symbols-outlined text-[32px] block mb-1">mic_off</span>
                  Recording requires Chrome browser
                </div>
              )}
            </div>

            <button
              onClick={() => goTo(phraseIndex + 1)}
              className="order-3 flex items-center gap-space-xs px-space-lg py-space-md rounded-full text-label-lg font-bold transition-all active:translate-y-1 active:shadow-none bg-primary-fixed hover:bg-primary-container text-on-primary-fixed hover:text-on-primary shadow-[0_4px_0_0_#ccc3d8]"
            >
              {phraseIndex === total - 1 ? 'Finish' : 'Next'}
              <span className="material-symbols-outlined text-[20px]">
                {phraseIndex === total - 1 ? 'check_circle' : 'arrow_forward'}
              </span>
            </button>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-center gap-space-md">
            <span className="text-label-lg text-on-surface-variant font-bold">
              Phrase {phraseIndex + 1} of {total}
            </span>
            <div className="w-36 h-3 rounded-full bg-surface-container overflow-hidden">
              <div
                className="h-full bg-primary-container rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-space-md">
          {/* Cork tips */}
          <div className={`bg-surface-container-lowest rounded-xl p-space-lg shadow-[0_8px_24px_rgba(124,58,237,0.06)] flex flex-col gap-space-md transition-opacity duration-300 ${mode !== 'cork' ? 'opacity-40' : ''}`}>
            <div className="flex items-center gap-space-sm">
              <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[28px]">wine_bar</span>
              </div>
              <div>
                <h3 className="text-headline-sm text-on-surface font-bold">Cork Tips</h3>
                <p className="text-body-sm text-on-surface-variant">Unlock your articulation</p>
              </div>
            </div>
            <div className="flex flex-col gap-space-sm">
              {[
                { n: 1, cls: 'bg-primary-fixed text-on-primary-fixed', text: "<strong>Place gently</strong> between your front teeth — don't bite down." },
                { n: 2, cls: 'bg-secondary-fixed text-on-secondary-fixed', text: '<strong>Exaggerate</strong> your mouth movement — force your tongue around the obstacle!' },
              ].map((step) => (
                <div key={step.n} className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-low">
                  <div className={`w-7 h-7 rounded-full ${step.cls} flex items-center justify-center font-bold text-label-md shrink-0 mt-0.5`}>
                    {step.n}
                  </div>
                  <p className="text-body-sm text-on-surface leading-snug" dangerouslySetInnerHTML={{ __html: step.text }} />
                </div>
              ))}
            </div>
            <div className="rounded-lg bg-tertiary-fixed/30 p-space-md flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-tertiary text-[24px]">mood</span>
              <p className="text-label-sm text-tertiary font-bold">Smile and have fun! Laughing is facial training too.</p>
            </div>
          </div>

          {/* Streak card */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-[0_8px_24px_rgba(124,58,237,0.06)] flex items-center justify-between">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[24px]">local_fire_department</span>
              </div>
              <div>
                <span className="text-label-md text-on-surface-variant">Daily Streak</span>
                <h4 className="text-headline-sm text-on-surface font-bold">
                  {todayTrained
                    ? `Day ${streak} in a row ✓`
                    : streak > 0
                      ? `Keep your ${streak}-day streak!`
                      : 'Start your streak today!'}
                </h4>
              </div>
            </div>
            <span className="px-space-md py-space-xs rounded-full bg-primary-fixed text-on-primary-fixed text-label-sm font-bold">
              +{sessionXp} XP
            </span>
          </div>

          {/* Exercise info */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-[0_8px_24px_rgba(124,58,237,0.06)]">
            <h4 className="text-headline-sm text-on-surface font-bold mb-space-sm">{exercise.title}</h4>
            <p className="text-body-sm text-on-surface-variant mb-space-md">{exercise.description}</p>
            <div className="flex flex-wrap gap-2">
              {exercise.targetSounds.map((s) => (
                <span key={s} className="px-space-md py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-label-sm font-bold">
                  {s} sound
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
