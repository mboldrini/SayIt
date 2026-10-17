import { useState, useEffect } from 'react'

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState(null)
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('sayit_pwa_dismissed') === '1'
  )

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!prompt || dismissed) return null

  const install = async () => {
    try {
      prompt.prompt()
      const { outcome } = await prompt.userChoice
      if (outcome === 'accepted' || outcome === 'dismissed') setPrompt(null)
    } catch {
      setPrompt(null)
    }
  }

  const dismiss = () => {
    localStorage.setItem('sayit_pwa_dismissed', '1')
    setDismissed(true)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-margin pb-4 pb-[max(16px,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-[0_-4px_40px_rgba(99,14,212,0.2)] border border-primary-fixed/50 p-space-md flex items-center gap-space-md">
        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-md">
          <span
            className="material-symbols-outlined text-on-primary text-[26px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            install_mobile
          </span>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-label-lg font-bold text-on-surface leading-tight">Add SayIt to your home screen</p>
          <p className="text-body-sm text-on-surface-variant">Train offline, anytime — no browser needed.</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-space-sm shrink-0">
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
          <button
            onClick={install}
            className="px-space-lg py-space-sm rounded-full bg-primary-container text-on-primary text-label-lg font-bold shadow-[0_4px_0_0_#5a00c6] active:translate-y-1 active:shadow-none transition-all"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  )
}
