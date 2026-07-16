"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { HiArrowPath, HiDocumentText, HiCloudArrowUp, HiBriefcase, HiChevronDown } from "react-icons/hi2"

interface FileUploadProps {
  onAnalyze: (file: File) => Promise<void>
  loading: boolean
  jobDescription: string
  showJdInput: boolean
  onToggleJd: () => void
  onJdChange: (value: string) => void
}

export function FileUpload({ onAnalyze, loading, jobDescription, showJdInput, onToggleJd, onJdChange }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: loading,
  })

  return (
    <div className="rounded-2xl bg-white/90 backdrop-blur border border-indigo-100/50 shadow-lg shadow-indigo-500/5 p-8">
      <div className="space-y-6">
        <div
          {...getRootProps()}
          className={cn(
            "relative rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-300",
            isDragActive
              ? "border-indigo-400 bg-indigo-50/60 shadow-[0_0_20px_rgba(99,102,241,0.1)]"
              : "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30",
            loading && "pointer-events-none opacity-60"
          )}
        >
          <input {...getInputProps()} />
          {file ? (
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-full bg-indigo-50 p-3">
                <HiDocumentText className="h-8 w-8 text-indigo-500" />
              </div>
              <p className="font-medium text-slate-800">{file.name}</p>
              <p className="text-sm text-slate-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className={cn(
                "rounded-full p-3 transition-all duration-300",
                isDragActive ? "bg-indigo-100 scale-110" : "bg-slate-50"
              )}>
                <HiCloudArrowUp className={cn(
                  "h-8 w-8 transition-colors duration-300",
                  isDragActive ? "text-indigo-500" : "text-slate-400"
                )} />
              </div>
              <div>
                <p className="font-medium text-slate-700">
                  {isDragActive ? "Drop your resume here" : "Drop your resume PDF here"}
                </p>
                <p className="text-sm text-slate-400 mt-1">or click to browse files</p>
              </div>
            </div>
          )}
        </div>

        <div>
          <button
            type="button"
            onClick={onToggleJd}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <HiBriefcase className="h-4 w-4" />
            <span>Match to a specific job?</span>
            <HiChevronDown className={cn(
              "h-3 w-3 transition-transform duration-200",
              showJdInput && "rotate-180"
            )} />
          </button>

          <AnimatePresence>
            {showJdInput && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <textarea
                  value={jobDescription}
                  onChange={(e) => onJdChange(e.target.value)}
                  placeholder="Paste the job description here to see how well your resume matches..."
                  rows={5}
                  className="mt-3 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-300 resize-none transition-all"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={() => file && onAnalyze(file)}
          disabled={!file || loading}
          className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/30 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none"
        >
          <span className="relative inline-flex items-center gap-2">
            {loading && <HiArrowPath className="h-4 w-4 animate-spin" />}
            {loading ? "Analyzing your resume..." : "Analyze Resume"}
          </span>
        </button>
      </div>
    </div>
  )
}
