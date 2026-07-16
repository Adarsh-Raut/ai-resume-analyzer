"use client"

import { useState, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { FileUpload } from "@/components/file-upload"
import { AnalysisCard } from "@/components/analysis-card"
import { InterviewQuestionsCard } from "@/components/interview-questions-card"
import { ThemeToggle } from "@/components/theme-toggle"
import { HistoryPanel } from "@/components/history-panel"
import { ModelSelector, loadAIConfig } from "@/components/model-selector"
import { useAnalysisHistory } from "@/lib/use-analysis-history"
import type { ResumeAnalysis, InterviewQuestion } from "@/lib/types"
import type { AIConfig } from "@/lib/ai"
import { toast } from "sonner"
import { HiSparkles } from "react-icons/hi2"

let idCounter = 0
function nextId() {
  return `${Date.now()}-${++idCounter}`
}

export default function Home() {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null)
  const [resumeText, setResumeText] = useState("")
  const [loading, setLoading] = useState(false)
  const [jobDescription, setJobDescription] = useState("")
  const [showJdInput, setShowJdInput] = useState(false)
  const [questions, setQuestions] = useState<InterviewQuestion[] | null>(null)
  const [questionsLoading, setQuestionsLoading] = useState(false)
  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null)
  const { entries, addEntry, removeEntry, clearHistory } = useAnalysisHistory()

  useEffect(() => {
    setAiConfig(loadAIConfig())
  }, [])

  const handleAnalyze = useCallback(
    async (file: File) => {
      setLoading(true)
      setAnalysis(null)
      setResumeText("")
      setQuestions(null)

      try {
        const formData = new FormData()
        formData.append("file", file)
        if (jobDescription.trim()) {
          formData.append("jobDescription", jobDescription)
        }
        if (aiConfig) {
          formData.append("provider", aiConfig.provider)
          formData.append("apiKey", aiConfig.apiKey)
          formData.append("model", aiConfig.model)
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
        setResumeText(data.text ?? "")

        addEntry({
          id: nextId(),
          fileName: file.name,
          timestamp: Date.now(),
          analysis: data.analysis,
          jobDescription: jobDescription.trim() || undefined,
        })
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong")
      } finally {
        setLoading(false)
      }
    },
    [jobDescription, addEntry, aiConfig]
  )

  const handleGenerateQuestions = useCallback(async () => {
    if (!resumeText.trim()) return
    setQuestionsLoading(true)
    setQuestions(null)

    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescription: jobDescription.trim() || undefined,
          provider: aiConfig?.provider,
          apiKey: aiConfig?.apiKey,
          model: aiConfig?.model,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to generate questions")
      }

      setQuestions(data.questions)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setQuestionsLoading(false)
    }
  }, [resumeText, jobDescription, aiConfig])

  function handleSelectHistory(entry: { analysis: ResumeAnalysis }) {
    setAnalysis(entry.analysis)
    setQuestions(null)
    setTimeout(() => {
      document.getElementById("analysis-results")?.scrollIntoView({ behavior: "smooth" })
    }, 0)
  }

  return (
    <div className="flex-1 flex flex-col">
      <section className="relative bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-950">
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1">
          <ModelSelector
            config={aiConfig}
            onChange={setAiConfig}
            onClear={() => setAiConfig(null)}
          />
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="mt-4"
        >
          <HistoryPanel
            entries={entries}
            onSelect={handleSelectHistory}
            onDelete={removeEntry}
            onClear={clearHistory}
          />
        </motion.div>

        {analysis && (
          <motion.div
            id="analysis-results"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6"
          >
            <AnalysisCard analysis={analysis} />
          </motion.div>
        )}

        {analysis && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="mt-4"
          >
            <button
              onClick={handleGenerateQuestions}
              disabled={questionsLoading}
              className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/30 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none"
            >
              <span className="relative inline-flex items-center gap-2">
                <HiSparkles className="h-4 w-4" />
                {questionsLoading ? "Generating interview questions..." : "Generate Interview Questions"}
              </span>
            </button>
          </motion.div>
        )}

        {questions && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6"
          >
            <div className="rounded-2xl bg-white/90 backdrop-blur border border-indigo-100/50 shadow-lg shadow-indigo-500/5 p-6 dark:bg-slate-900/90 dark:border-indigo-800/50 dark:shadow-indigo-900/10">
              <div className="flex items-center gap-2 mb-5">
                <HiSparkles className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-heading font-bold text-slate-800 dark:text-slate-100">
                  Interview Questions
                </h2>
                {jobDescription.trim() && (
                  <span className="text-xs text-slate-400 ml-1 dark:text-slate-500">
                    (tailored to job)
                  </span>
                )}
              </div>
              <InterviewQuestionsCard questions={questions} />
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
