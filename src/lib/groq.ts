import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"
import { z } from "zod"

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

export async function generateInterviewQuestions(text: string, jobDescription?: string) {
  const jdSection = jobDescription?.trim()
    ? `Tailor the questions to the following job description (focus on skills, responsibilities, and challenges mentioned):
${jobDescription}`
    : ""

  const { text: content } = await generateText({
    model: groq("llama-3.3-70b-versatile"),
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

  const object = interviewQuestionsSchema.parse(JSON.parse(content))
  return object
}

export async function analyzeResume(text: string, jobDescription?: string) {
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
    model: groq("llama-3.3-70b-versatile"),
    prompt: `You are a professional resume reviewer. Analyze this resume text and return ONLY valid JSON (no markdown, no code fences) with this exact structure:
${schemaPrompt}

Resume text:
${text}
${jdSection}`,
  })

  const schema = withJd ? analysisWithJdSchema : analysisSchema
  const object = schema.parse(JSON.parse(content))
  return object
}
