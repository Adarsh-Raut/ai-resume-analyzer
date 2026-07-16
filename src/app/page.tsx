"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileUpload } from "@/components/file-upload"
import { AnalysisCard } from "@/components/analysis-card"
import { ThemeToggle } from "@/components/theme-toggle"
import { HiBriefcase, HiChevronDown } from "react-icons/hi2"
import type { ResumeAnalysis } from "@/lib/types"

export default function Home() {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [jobDescription, setJobDescription] = useState("")
  const [showJdInput, setShowJdInput] = useState(false)

  async function handleAnalyze(file: File) {
    setLoading(true)
    setError(null)
    setAnalysis(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      if (jobDescription.trim()) {
        formData.append("jobDescription", jobDescription)
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? "Analysis failed")
      }

      setAnalysis(data.analysis)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-950">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="relative max-w-3xl mx-auto px-4 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl font-heading font-bold text-white">
              <span className="bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
                AI Resume Analyzer
              </span>
            </h1>
            <p className="mt-3 text-lg text-indigo-200/80 max-w-lg mx-auto">
              Upload your resume and get instant AI-powered feedback to land more interviews
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />
      </section>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 pb-12 -mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <FileUpload onAnalyze={handleAnalyze} loading={loading} jobDescription={jobDescription} showJdInput={showJdInput} onToggleJd={() => setShowJdInput(!showJdInput)} onJdChange={setJobDescription} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {error && (
            <div className="mt-6 rounded-xl bg-red-50/90 backdrop-blur border border-red-200/50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
        </motion.div>

        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6"
          >
            <AnalysisCard analysis={analysis} />
          </motion.div>
        )}
      </main>
    </div>
  )
}
