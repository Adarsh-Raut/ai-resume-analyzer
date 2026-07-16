"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HiCog6Tooth, HiCheck, HiExclamationTriangle } from "react-icons/hi2"
import { PROVIDER_DEFAULTS } from "@/lib/ai"
import type { AIProvider, AIConfig } from "@/lib/ai"

interface ModelSelectorProps {
  config: AIConfig | null
  onChange: (config: AIConfig) => void
  onClear: () => void
}

const STORAGE_KEY = "ai-config"

export function loadAIConfig(): AIConfig | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AIConfig) : null
  } catch {
    return null
  }
}

function saveAIConfig(config: AIConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export function ModelSelector({ config, onChange, onClear }: ModelSelectorProps) {
  const [open, setOpen] = useState(false)
  const [provider, setProvider] = useState<AIProvider>(config?.provider || "groq")
  const [model, setModel] = useState(config?.model || PROVIDER_DEFAULTS[config?.provider || "groq"].defaultModel)
  const [apiKey, setApiKey] = useState(config?.apiKey || "")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (config) {
      setProvider(config.provider)
      setModel(config.model)
      setApiKey(config.apiKey)
    }
  }, [config])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleProviderChange(newProvider: AIProvider) {
    setProvider(newProvider)
    const defaults = PROVIDER_DEFAULTS[newProvider]
    setModel(defaults.defaultModel)
  }

  function handleApply() {
    const cfg: AIConfig = { provider, apiKey, model }
    saveAIConfig(cfg)
    onChange(cfg)
    setOpen(false)
  }

  function handleClear() {
    localStorage.removeItem(STORAGE_KEY)
    onClear()
    setOpen(false)
  }

  const isGroqDefault = !config && provider === "groq"

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center gap-1.5 rounded-lg p-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        title="AI Model Settings"
      >
        <HiCog6Tooth className="h-5 w-5" />
        {config && (
          <span className="hidden sm:inline text-xs">
            {PROVIDER_DEFAULTS[config.provider]?.label || config.provider}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 origin-top-right rounded-xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-800"
          >
            <h3 className="text-sm font-semibold text-slate-800 mb-4 dark:text-slate-100">
              AI Model Settings
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5 dark:text-slate-400">
                  Provider
                </label>
                <select
                  value={provider}
                  onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                >
                  {Object.entries(PROVIDER_DEFAULTS).map(([key, p]) => (
                    <option key={key} value={key}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5 dark:text-slate-400">
                  Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                >
                  {PROVIDER_DEFAULTS[provider].models.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5 dark:text-slate-400">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={provider === "groq" ? "Optional — uses GROQ_API_KEY env var" : "sk-..."}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder:text-slate-500"
                />
                {isGroqDefault && !apiKey && (
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    Leave empty to use the server&apos;s default key
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2">
              <button
                onClick={handleApply}
                className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
              >
                Apply
              </button>
              {config && (
                <button
                  onClick={handleClear}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-500 transition-colors hover:border-rose-200 hover:text-rose-600 dark:border-slate-600 dark:text-slate-400 dark:hover:border-rose-700 dark:hover:text-rose-400"
                >
                  Reset
                </button>
              )}
            </div>

            {config && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                <HiCheck className="h-3.5 w-3.5" />
                Using {PROVIDER_DEFAULTS[config.provider]?.label || config.provider} · {config.model}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
