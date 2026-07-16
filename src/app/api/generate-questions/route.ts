import { NextRequest, NextResponse } from "next/server"
import { generateInterviewQuestions } from "@/lib/ai"
import type { AIConfig } from "@/lib/ai"

export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobDescription, provider, apiKey, model } = await request.json()

    if (!resumeText?.trim()) {
      return NextResponse.json({ error: "Resume text is required" }, { status: 400 })
    }

    let aiConfig: AIConfig | undefined
    if (provider && apiKey && model) {
      aiConfig = { provider: provider as AIConfig["provider"], apiKey, model }
    }

    const result = await generateInterviewQuestions(resumeText, jobDescription || undefined, aiConfig)
    return NextResponse.json(result)
  } catch (error) {
    console.error("generate-questions error:", error)
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 })
  }
}
