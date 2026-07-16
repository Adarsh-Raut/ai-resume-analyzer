"use client"

import { motion } from "framer-motion"
import type { InterviewQuestion } from "@/lib/types"
import { HiChevronDown } from "react-icons/hi2"

interface InterviewQuestionsCardProps {
  questions: InterviewQuestion[]
}

const categoryColors: Record<string, string> = {
  Technical: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
  Behavioral: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700",
  Experience: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700",
  Leadership: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
  "Problem-solving": "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700",
}

function categoryBadge(category: string) {
  const base = "text-xs font-medium px-2.5 py-0.5 rounded-full border shrink-0"
  const color = categoryColors[category] || "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
  return `${base} ${color}`
}

export function InterviewQuestionsCard({ questions }: InterviewQuestionsCardProps) {
  return (
    <div className="space-y-3">
      {questions.map((q, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.06 }}
          className="group rounded-xl border border-slate-100 bg-white shadow-sm shadow-slate-200/50 transition-all duration-200 hover:shadow-md hover:border-indigo-100 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none dark:hover:border-indigo-700"
        >
          <details className="group [&:not([open])]:[&_.chevron]:rotate-0 [&[open]]:[&_.chevron]:rotate-180">
            <summary className="flex items-start gap-3 px-5 py-4 cursor-pointer list-none select-none">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold font-heading shrink-0 mt-0.5 dark:bg-indigo-900 dark:text-indigo-300">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 leading-relaxed dark:text-slate-200">
                  {q.question}
                </p>
              </div>
              <span className={categoryBadge(q.category)}>
                {q.category}
              </span>
              <HiChevronDown className="chevron mt-1 h-4 w-4 shrink-0 text-slate-300 transition-transform duration-200 dark:text-slate-600" />
            </summary>
            <div className="px-5 pb-5">
              <div className="rounded-lg bg-indigo-50/50 p-4 dark:bg-indigo-900/20">
                <p className="text-sm text-indigo-700 leading-relaxed dark:text-indigo-300">
                  {q.suggested_approach}
                </p>
              </div>
            </div>
          </details>
        </motion.div>
      ))}
    </div>
  )
}
