"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { HistoryEntry } from "@/lib/types"
import { scoreLabel, scoreColor } from "@/lib/score-utils"
import { Badge } from "@/components/ui/badge"
import {
  HiClock,
  HiDocumentText,
  HiTrash,
  HiChevronDown,
  HiXMark,
} from "react-icons/hi2"

interface HistoryPanelProps {
  entries: HistoryEntry[]
  onSelect: (entry: HistoryEntry) => void
  onDelete: (id: string) => void
  onClear: () => void
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(ts).toLocaleDateString()
}

export function HistoryPanel({ entries, onSelect, onDelete, onClear }: HistoryPanelProps) {
  const [open, setOpen] = useState(false)

  if (entries.length === 0) return null

  return (
    <div className="rounded-2xl bg-white/90 backdrop-blur border border-indigo-100/50 shadow-lg shadow-indigo-500/5 dark:bg-slate-900/90 dark:border-indigo-800/50 dark:shadow-indigo-900/10">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-6 py-4 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors dark:text-slate-400 dark:hover:text-indigo-400"
      >
        <HiClock className="h-4 w-4" />
        <span>Previous Analyses</span>
        <Badge variant="secondary" className="ml-1 text-xs font-mono">
          {entries.length}
        </Badge>
        <HiChevronDown
          className={`ml-auto h-4 w-4 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4 space-y-1.5">
              {entries.map((entry) => (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.2 }}
                  className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm cursor-pointer transition-all duration-200 hover:border-indigo-100 hover:bg-indigo-50/50 dark:hover:border-indigo-800 dark:hover:bg-indigo-900/20"
                  onClick={() => onSelect(entry)}
                >
                  <HiDocumentText className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-700 truncate dark:text-slate-300">
                      {entry.fileName}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {relativeTime(entry.timestamp)}
                      {entry.jobDescription && " · with job match"}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-xs font-semibold font-mono ${scoreColor(
                      entry.analysis.overall_score
                    )}`}
                  >
                    {entry.analysis.overall_score}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(entry.id)
                    }}
                    className="shrink-0 rounded-lg p-1 text-slate-300 opacity-0 transition-all duration-200 hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100 dark:text-slate-600 dark:hover:bg-rose-900/30 dark:hover:text-rose-400"
                  >
                    <HiTrash className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ))}
              {entries.length > 0 && (
                <button
                  onClick={onClear}
                  className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-500 transition-colors px-3 py-1.5 dark:text-slate-500 dark:hover:text-rose-400"
                >
                  <HiXMark className="h-3 w-3" />
                  Clear all history
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
