"use client"

import { motion } from "framer-motion"
import type { ResumeAnalysis } from "@/lib/types"
import {
  scoreColor,
  scoreRingColor,
  scoreLabel,
  scoreBadgeClass,
  sectionLabel,
  sectionIcon,
} from "@/lib/score-utils"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { HiExclamationTriangle, HiLightBulb, HiChevronDown, HiBriefcase } from "react-icons/hi2"

interface AnalysisCardProps {
  analysis: ResumeAnalysis
}

function ScoreGauge({ score }: { score: number }) {
  const radius = 56
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="oklch(0.92 0.01 280)"
          strokeWidth="8"
        />
        <motion.circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke={scoreRingColor(score)}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          className={`text-3xl font-bold font-heading ${scoreColor(score)}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {score}
        </motion.span>
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
          {scoreLabel(score)}
        </span>
      </div>
    </div>
  )
}

function matchScoreColor(score: number) {
  if (score >= 80) return "text-emerald-600"
  if (score >= 60) return "text-amber-600"
  return "text-rose-600"
}

function matchScoreBadge(score: number) {
  if (score >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-200"
  if (score >= 60) return "bg-amber-50 text-amber-700 border-amber-200"
  return "bg-rose-50 text-rose-700 border-rose-200"
}

function SectionCard({
  name,
  section,
  index,
}: {
  name: string
  section: { score: number; issues: string[]; suggestions: string[] }
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
      className="group rounded-xl border border-slate-100 bg-white shadow-sm shadow-slate-200/50 transition-all duration-200 hover:shadow-md hover:border-indigo-100 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none dark:hover:border-indigo-700"
    >
      <details className="group [&:not([open])]:[&_.chevron]:rotate-0 [&[open]]:[&_.chevron]:rotate-180">
        <summary className="flex items-center gap-3 px-5 py-4 cursor-pointer list-none select-none">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 text-sm font-bold font-heading shrink-0 dark:bg-indigo-900 dark:text-indigo-300">
            {sectionIcon(name)}
          </span>
          <span className="flex-1 font-medium text-slate-800 dark:text-slate-200">{sectionLabel(name)}</span>
          <Badge
            variant="outline"
            className={`${scoreBadgeClass(section.score)} font-mono text-xs border`}
          >
            {section.score}/100
          </Badge>
          <HiChevronDown className="chevron h-4 w-4 text-slate-300 transition-transform duration-200 dark:text-slate-600" />
        </summary>
        <div className="px-5 pb-5 space-y-4">
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden dark:bg-slate-800">
            <motion.div
              className="h-full rounded-full transition-colors"
              style={{
                background:
                  section.score >= 80
                    ? "linear-gradient(90deg, #059669, #34d399)"
                    : section.score >= 60
                      ? "linear-gradient(90deg, #d97706, #fbbf24)"
                      : "linear-gradient(90deg, #e11d48, #fb7185)",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${section.score}%` }}
              transition={{ duration: 1, delay: 0.6 + index * 0.1, ease: "easeOut" }}
            />
          </div>

          {section.issues.length > 0 && (
            <div>
              <h4 className="flex items-center gap-1.5 text-sm font-semibold text-rose-600 mb-2">
                <HiExclamationTriangle className="h-3.5 w-3.5" /> Issues
              </h4>
              <ScrollArea className="h-28">
                <ul className="space-y-1.5">
                  {section.issues.map((issue, i) => (
                    <li key={i} className="text-sm text-slate-600 flex gap-2 leading-relaxed dark:text-slate-400">
                      <span className="text-rose-400 mt-1 shrink-0">•</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          )}

          {section.suggestions.length > 0 && (
            <div>
              <h4 className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 mb-2">
                <HiLightBulb className="h-3.5 w-3.5" /> Suggestions
              </h4>
              <ScrollArea className="h-28">
                <ul className="space-y-1.5">
                  {section.suggestions.map((suggestion, i) => (
                    <li key={i} className="text-sm text-slate-600 flex gap-2 leading-relaxed dark:text-slate-400">
                      <span className="text-emerald-400 mt-1 shrink-0">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          )}
        </div>
      </details>
    </motion.div>
  )
}

export function AnalysisCard({ analysis }: AnalysisCardProps) {
  const hasJdMatch = analysis.job_match_score !== undefined

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl bg-white/90 backdrop-blur border border-indigo-100/50 shadow-lg shadow-indigo-500/5 p-8 dark:bg-slate-900/90 dark:border-indigo-800/50 dark:shadow-indigo-900/10"
      >
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          <ScoreGauge score={analysis.overall_score} />
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-heading font-bold text-slate-800 dark:text-slate-100">
              Resume Analysis
            </h2>
            <p className="text-sm text-slate-400 mt-1 dark:text-slate-500">
              AI-powered breakdown of your resume
            </p>
            <div className="mt-4 space-y-2">
              {analysis.top_improvements.map((item, i) => (
                <div key={i} className="flex gap-2.5 text-sm">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold shrink-0 mt-0.5 font-heading dark:bg-indigo-900 dark:text-indigo-300">
                    {i + 1}
                  </span>
                  <span className="text-slate-600 leading-relaxed dark:text-slate-400">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {hasJdMatch && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6 dark:border-indigo-800/50 dark:bg-indigo-900/20"
        >
          <div className="flex items-center gap-2 mb-4">
            <HiBriefcase className="h-5 w-5 text-indigo-500" />
            <h3 className="font-heading font-bold text-slate-800 dark:text-slate-100">Job Match Analysis</h3>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 dark:text-slate-400">Match score:</span>
              <Badge className={`${matchScoreBadge(analysis.job_match_score!)} font-mono text-sm px-3 py-1`}>
                {analysis.job_match_score}%
              </Badge>
            </div>
          </div>

          {analysis.missing_keywords && analysis.missing_keywords.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-2 dark:text-slate-300">Missing Keywords</h4>
              <div className="flex flex-wrap gap-1.5">
                {analysis.missing_keywords.map((kw, i) => (
                  <span key={i} className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {analysis.tailored_suggestions && analysis.tailored_suggestions.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2 dark:text-slate-300">Tailored Suggestions</h4>
              <ul className="space-y-1.5">
                {analysis.tailored_suggestions.map((s, i) => (
                  <li key={i} className="text-sm text-slate-600 flex gap-2 leading-relaxed dark:text-slate-400">
                    <span className="text-indigo-400 mt-1 shrink-0">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}

      <div className="space-y-3">
        {Object.entries(analysis.sections).map(([key, section], i) => (
          <SectionCard key={key} name={key} section={section} index={i} />
        ))}
      </div>
    </div>
  )
}
