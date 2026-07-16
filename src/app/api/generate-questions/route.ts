import { NextRequest, NextResponse } from "next/server"
import { generateInterviewQuestions } from "@/lib/groq"

export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobDescription } = await request.json()

    if (!resumeText?.trim()) {
      return NextResponse.json({ error: "Resume text is required" }, { status: 400 })
    }

    const result = await generateInterviewQuestions(resumeText, jobDescription || undefined)
    return NextResponse.json(result)
  } catch (error) {
    console.error("generate-questions error:", error)
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 })
  }
}
