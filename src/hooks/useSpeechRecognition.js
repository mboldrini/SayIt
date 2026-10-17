import { useRef, useState } from 'react'

export function useSpeechRecognition() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef(null)

  const supported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const start = (onResult) => {
    if (!supported) return

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SR()
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (e) => {
      const result = e.results[0][0]
      const text = result.transcript
      const confidence = Math.min(1, Math.max(0, result.confidence ?? 0.8))
      setTranscript(text)
      setIsRecording(false)
      onResult?.(text, confidence)
    }

    recognition.onerror = () => {
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognitionRef.current = recognition
    setTranscript('')
    setIsRecording(true)
    recognition.start()
  }

  const stop = () => {
    recognitionRef.current?.stop()
    setIsRecording(false)
  }

  return { isRecording, transcript, start, stop, supported }
}

export function scoreAttempt(transcript, target, { confidence = 1, targetSounds = [] } = {}) {
  const norm = (s) =>
    s
      .toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .trim()

  const targetWords = norm(target).split(/\s+/)
  const spokenWords = norm(transcript).split(/\s+/)
  const normalizedTranscript = norm(transcript)

  let matches = 0
  targetWords.forEach((word) => {
    if (spokenWords.includes(word)) matches++
  })
  const wordRatio = matches / targetWords.length

  // Approach 1: confidence as soft penalty — max 20% reduction at confidence=0
  const confidenceWeight = 0.8 + 0.2 * confidence

  // Approach 2: bonus for hitting target sounds (up to +0.10)
  let soundBonus = 0
  if (targetSounds.length > 0) {
    const hits = targetSounds.filter((s) => normalizedTranscript.includes(s)).length
    soundBonus = (hits / targetSounds.length) * 0.10
  }

  const ratio = Math.min(1, wordRatio * confidenceWeight + soundBonus)

  if (ratio >= 0.85) return { level: 'perfect', ratio, message: "Perfect! Great pronunciation! 🎉" }
  if (ratio >= 0.55) return { level: 'good', ratio, message: "Good try! Almost there! 👍" }
  return { level: 'retry', ratio, message: "Try again! You've got this! 🎯" }
}
