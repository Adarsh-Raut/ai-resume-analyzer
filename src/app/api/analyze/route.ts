import { NextRequest, NextResponse } from "next/server"
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs"
import { analyzeResume } from "@/lib/ai"
import type { AIConfig } from "@/lib/ai"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const jobDescription = formData.get("jobDescription") as string | null
    const provider = formData.get("provider") as string | null
    const apiKey = formData.get("apiKey") as string | null
    const model = formData.get("model") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    let text: string
    try {
      const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise
      const pages: string[] = []
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i)
        const tc = await page.getTextContent()
        pages.push(tc.items.map((item) => "str" in item ? (item as { str: string }).str : "").join(" "))
      }
      text = pages.join("\n\n")
    } catch (error) {
      console.error("PDF parse error:", error)
      return NextResponse.json({ error: "Failed to parse PDF" }, { status: 400 })
    }

    if (!text.trim()) {
      return NextResponse.json({ error: "No text found in PDF" }, { status: 400 })
    }

    let aiConfig: AIConfig | undefined
    if (provider && apiKey && model) {
      aiConfig = { provider: provider as AIConfig["provider"], apiKey, model }
    }

    const analysis = await analyzeResume(text, jobDescription || undefined, aiConfig)

    return NextResponse.json({ analysis, text })
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}
