"use client"

import { useState, useEffect, useCallback } from "react"
import type { HistoryEntry } from "@/lib/types"

const STORAGE_KEY = "resume-history"
const MAX_ENTRIES = 10

function loadEntries(): HistoryEntry[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as HistoryEntry[]
  } catch {
    return []
  }
}

function saveEntries(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // localStorage full or unavailable
  }
}

export function useAnalysisHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([])

  useEffect(() => {
    setEntries(loadEntries())
  }, [])

  const addEntry = useCallback((entry: HistoryEntry) => {
    setEntries((prev) => {
      const next = [entry, ...prev].slice(0, MAX_ENTRIES)
      saveEntries(next)
      return next
    })
  }, [])

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id)
      saveEntries(next)
      return next
    })
  }, [])

  const clearHistory = useCallback(() => {
    setEntries([])
    saveEntries([])
  }, [])

  return { entries, addEntry, removeEntry, clearHistory }
}
