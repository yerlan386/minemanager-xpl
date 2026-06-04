import { useEffect, useRef } from 'react'

export function useAutoSave(key, data, interval = 30000) {
  const timer = useRef(null)
  useEffect(() => {
    timer.current = setInterval(() => {
      try {
        localStorage.setItem(`mm_draft_${key}`, JSON.stringify({ data, savedAt: new Date().toISOString() }))
      } catch {}
    }, interval)
    return () => clearInterval(timer.current)
  }, [key, data, interval])

  function saveDraft() {
    localStorage.setItem(`mm_draft_${key}`, JSON.stringify({ data, savedAt: new Date().toISOString() }))
  }
  function loadDraft() {
    try { return JSON.parse(localStorage.getItem(`mm_draft_${key}`)) } catch { return null }
  }
  function clearDraft() {
    localStorage.removeItem(`mm_draft_${key}`)
  }
  return { saveDraft, loadDraft, clearDraft }
}
