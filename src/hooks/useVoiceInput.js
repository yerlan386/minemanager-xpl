import { useState, useRef, useCallback } from 'react'

export function useVoiceInput(onResult) {
  const [listening, setListening] = useState(false)
  const recRef = useRef(null)

  const supported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const start = useCallback(() => {
    if (!supported) return
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    recRef.current = new SR()
    recRef.current.lang = 'en-ZW'
    recRef.current.interimResults = false
    recRef.current.maxAlternatives = 1
    recRef.current.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      onResult(transcript)
    }
    recRef.current.onend = () => setListening(false)
    recRef.current.onerror = () => setListening(false)
    recRef.current.start()
    setListening(true)
  }, [supported, onResult])

  const stop = useCallback(() => {
    recRef.current?.stop()
    setListening(false)
  }, [])

  return { listening, start, stop, supported }
}
