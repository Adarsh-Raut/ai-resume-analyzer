import { generateText } from "ai"
import { createGroq } from "@ai-sdk/groq"
import { createOpenAI } from "@ai-sdk/openai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createAnthropic } from "@ai-sdk/anthropic"
import { z } from "zod"

export type AIProvider = "groq" | "openai" | "google" | "anthropic"

export interface AIConfig {
  provider: AIProvider
  apiKey: string
  model: string
}

const interviewQuestionSchema = z.object({
  question: z.string(),
  category: z.string(),
  suggested_approach: z.string(),
})

const interviewQuestionsSchema = z.object({
  questions: z.array(interviewQuestionSchema).min(1),
})

const sectionSchema = z.object({
  score: z.number().min(0).max(100),
  issues: z.array(z.string()),
  suggestions: z.array(z.string()),
})

const analysisSchema = z.object({
  overall_score: z.number().min(0).max(100),
  sections: z.object({
    formatting: sectionSchema,
    summary: sectionSchema,
    experience: sectionSchema,
    skills: sectionSchema,
    education: sectionSchema,
  }),
  top_improvements: z.array(z.string()),
})

const analysisWithJdSchema = analysisSchema.extend({
  job_match_score: z.number().min(0).max(100),
  missing_keywords: z.array(z.string()),
  tailored_suggestions: z.array(z.string()),
})

function sanitizeJsonStrings(str: string): string {
  let out = ""
  let inString = false
  let escaped = false
  for (const ch of str) {
    if (inString && !escaped && ch === '"') {
      inString = false
      out += ch
      continue
    }
    if (inString && !escaped && ch === "\\") {
      escaped = true
      out += ch
      continue
    }
    escaped = false
    if (!inString && ch === '"') {
      inString = true
      out += ch
      continue
    }
    if (inString && ch < " ") {
      if (ch === "\n") out += "\\n"
      else if (ch === "\r") out += "\\r"
      else if (ch === "\t") out += "\\t"
      continue
    }
    out += ch
  }
  return out
}

function parseModelJson(str: string): unknown {
  const trimmed = str.trim()
  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed)
    return typeof parsed === "string" ? parseModelJson(parsed) : parsed
  } catch {
    // fall through to cleanup heuristics
  }

  let cleaned = trimmed
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "")
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    try {
      parsed = JSON.parse(JSON.parse(cleaned))
      return typeof parsed === "string" ? parseModelJson(parsed) : parsed
    } catch {
      cleaned = cleaned.slice(1, -1)
    }
  }
  return JSON.parse(sanitizeJsonStrings(cleaned))
}

function getModel(config?: AIConfig) {
  const provider = config?.provider || "groq"
  const apiKey = config?.apiKey || undefined
  const model = config?.model || ""

  if (model && apiKey) {
    // Use user-provided config
    switch (provider) {
      case "openai":
        return createOpenAI({ apiKey })(model)
      case "google":
        return createGoogleGenerativeAI({ apiKey })(model)
      case "anthropic":
        return createAnthropic({ apiKey })(model)
      case "groq":
        return createGroq({ apiKey })(model)
    }
  }

  // Default: Groq with env var
  return createGroq({ apiKey: process.env.GROQ_API_KEY })("openai/gpt-oss-120b")
}

export const PROVIDER_DEFAULTS: Record<AIProvider, { models: string[]; defaultModel: string; label: string }> = {
  groq: {
    models: ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.6-27b"],
    defaultModel: "openai/gpt-oss-120b",
    label: "Groq",
  },
  openai: {
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
    defaultModel: "gpt-4o",
    label: "OpenAI",
  },
  google: {
    models: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
    defaultModel: "gemini-2.0-flash",
    label: "Google",
  },
  anthropic: {
    models: ["claude-3-5-sonnet-latest", "claude-3-5-haiku-latest", "claude-3-opus-latest"],
    defaultModel: "claude-3-5-sonnet-latest",
    label: "Anthropic",
  },
}

export async function generateInterviewQuestions(text: string, jobDescription?: string, aiConfig?: AIConfig) {
  const jdSection = jobDescription?.trim()
    ? `Tailor the questions to the following job description (focus on skills, responsibilities, and challenges mentioned):
${jobDescription}`
    : ""

  const { text: content } = await generateText({
    model: getModel(aiConfig),
    prompt: `You are an interview coach. Based on the following resume, generate a diverse set of interview questions that the candidate should prepare for. Include a mix of behavioral, experience-based, and skill-focused questions.

Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "questions": [
    {
      "question": "the interview question",
      "category": "category label (e.g. Technical, Behavioral, Experience, Leadership, Problem-solving)",
      "suggested_approach": "concise talking points or framework for answering"
    }
  ]
}

Generate 6-10 questions.
${jdSection}

Resume:
${text}`,
  })

  const object = interviewQuestionsSchema.parse(parseModelJson(content))
  return object
}

export async function analyzeResume(text: string, jobDescription?: string, aiConfig?: AIConfig) {
  const withJd = !!jobDescription?.trim()

  const schemaPrompt = withJd
    ? `{
  "overall_score": 0-100,
  "sections": {
    "formatting": { "score": 0-100, "issues": [...], "suggestions": [...] },
    "summary": { "score": 0-100, "issues": [...], "suggestions": [...] },
    "experience": { "score": 0-100, "issues": [...], "suggestions": [...] },
    "skills": { "score": 0-100, "issues": [...], "suggestions": [...] },
    "education": { "score": 0-100, "issues": [...], "suggestions": [...] }
  },
  "top_improvements": ["...", "...", "..."],
  "job_match_score": 0-100,
  "missing_keywords": ["...", "..."],
  "tailored_suggestions": ["...", "...", "..."]
}`
    : `{
  "overall_score": 0-100,
  "sections": {
    "formatting": { "score": 0-100, "issues": [...], "suggestions": [...] },
    "summary": { "score": 0-100, "issues": [...], "suggestions": [...] },
    "experience": { "score": 0-100, "issues": [...], "suggestions": [...] },
    "skills": { "score": 0-100, "issues": [...], "suggestions": [...] },
    "education": { "score": 0-100, "issues": [...], "suggestions": [...] }
  },
  "top_improvements": ["...", "...", "..."]
}`

  const jdSection = withJd
    ? `Also analyze how well this resume matches the following job description. Include:
- job_match_score: 0-100 score of how well the resume fits this specific role
- missing_keywords: array of important skills or keywords from the job description that are missing from the resume
- tailored_suggestions: array of specific changes to make the resume more competitive for this role

Job description:
${jobDescription}`
    : ""

  const { text: content } = await generateText({
    model: getModel(aiConfig),
    prompt: `You are a professional resume reviewer. Analyze this resume text and return ONLY valid JSON (no markdown, no code fences) with this exact structure:
${schemaPrompt}

Resume text:
${text}
${jdSection}`,
  })

  const schema = withJd ? analysisWithJdSchema : analysisSchema
  const object = schema.parse(parseModelJson(content))
  return object
}
