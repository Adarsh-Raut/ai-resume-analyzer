import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"
import { z } from "zod"

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
  top_improvements: z.array(z.string()).length(3),
})

export async function analyzeResume(text: string) {
  const { text: content } = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    prompt: `You are a professional resume reviewer. Analyze this resume text and return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "overall_score": 0-100,
  "sections": {
    "formatting": { "score": 0-100, "issues": [...], "suggestions": [...] },
    "summary": { "score": 0-100, "issues": [...], "suggestions": [...] },
    "experience": { "score": 0-100, "issues": [...], "suggestions": [...] },
    "skills": { "score": 0-100, "issues": [...], "suggestions": [...] },
    "education": { "score": 0-100, "issues": [...], "suggestions": [...] }
  },
  "top_improvements": ["...", "...", "..."]
}

Resume text:
${text}`,
  })

  const object = analysisSchema.parse(JSON.parse(content))
  return object
}
