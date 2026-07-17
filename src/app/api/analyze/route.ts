import { NextRequest, NextResponse } from "next/server"
import PDFParser from "pdf2json"
import { analyzeResume } from "@/lib/ai"
import type { AIConfig } from "@/lib/ai"

function parsePdf(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const parser = new PDFParser()
    parser.on("pdfParser_dataReady", (data: { Pages: { Texts: { R: { T: string }[] }[] }[] }) => {
      const text = data.Pages.map((page) =>
        page.Texts.map((t) => decodeURIComponent(t.R[0].T)).join(" ")
      ).join("\n\n")
      resolve(text)
    })
    parser.on("pdfParser_dataError", (errMsg: Error | { parserError: Error }) => reject("parserError" in errMsg ? errMsg.parserError : errMsg))
    parser.parseBuffer(buffer)
  })
}

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
      text = await parsePdf(buffer)
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
