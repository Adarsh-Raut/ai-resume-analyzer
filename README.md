# 📄 AI Resume Analyzer

> Upload your resume (PDF) and get instant AI-powered feedback to land more interviews.

**[Live Demo](https://ai-resume-analyzer-flame-six.vercel.app/)** · **Built with Next.js 16, Tailwind CSS, shadcn/ui, and the Vercel AI SDK**

---

## Overview

AI Resume Analyzer parses your PDF resume, runs it through an LLM, and returns structured feedback across five sections — formatting, summary, experience, skills, and education. You also get an overall score, top improvement priorities, job description matching, and a generated set of interview questions.

---

## Features

- 📤 **Drag-and-Drop Upload** — PDF files via react-dropzone
- 🎯 **Score Gauge** — animated circular progress with score labels
- 📋 **Section Analysis** — expandable cards with issues and suggestions per section
- 💼 **Job Description Matching** — paste a JD to get a match score, missing keywords, and tailored suggestions
- ❓ **Interview Question Generator** — AI-generated questions with category badges and talking points
- 🧠 **Multi-Model AI** — switch between Groq, OpenAI GPT, Google Gemini, or Anthropic Claude with your own API key
- 📜 **Analysis History** — last 10 analyses saved to localStorage, click to revisit
- 🌙 **Dark Mode** — system-aware with no-flash inline script

---

## Tech Stack

| Layer      | Technology                                                                              |
| ---------- | --------------------------------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack)                                                      |
| Language   | TypeScript (strict mode)                                                                |
| AI SDK     | Vercel AI SDK (`@ai-sdk/groq`, `@ai-sdk/openai`, `@ai-sdk/google`, `@ai-sdk/anthropic`) |
| PDF        | pdfjs-dist (legacy build, no native modules)                                            |
| Styling    | Tailwind CSS + shadcn/ui + Framer Motion                                                |
| Icons      | react-icons (Heroicons v2)                                                              |
| Validation | Zod                                                                                     |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Groq API key (free) from [console.groq.com](https://console.groq.com)

### 1. Clone and install

```bash
git clone https://github.com/Adarsh-Raut/ai-resume-analyzer.git
cd ai-resume-anylyzer
npm install
```

### 2. Environment variables

Create `.env.local`:

```env
GROQ_API_KEY="your_groq_api_key_here"
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

> **Note:** Groq works out of the box with the env var. To use OpenAI, Gemini, or Claude, open the model settings (gear icon in the top bar) and paste your own API key.

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/            # POST — parses PDF, returns analysis JSON
│   │   └── generate-questions/ # POST — returns interview questions
│   ├── globals.css
│   ├── layout.tsx              # Root layout with theme/no-flash script
│   └── page.tsx                # Main page: hero, upload, results
├── components/
│   ├── ui/                     # shadcn/ui primitives
│   ├── analysis-card.tsx       # Score gauge + section accordions + JD match
│   ├── file-upload.tsx         # Drag-and-drop zone + JD textarea toggle
│   ├── history-panel.tsx       # Collapsible localStorage history list
│   ├── interview-questions-card.tsx  # Question list with categories
│   ├── model-selector.tsx      # Provider/API-key settings popover
│   └── theme-toggle.tsx        # Dark/light mode toggle
├── lib/
│   ├── ai.ts                   # Provider-agnostic AI functions (analyzeResume, generateInterviewQuestions)
│   ├── score-utils.ts          # Score color/label/icon helpers
│   ├── types.ts                # Shared TypeScript interfaces
│   ├── use-analysis-history.ts # localStorage history hook
│   └── utils.ts                # cn() utility
```

---

## API

### `POST /api/analyze`

Accepts a multipart form with a `file` field (PDF). Optional fields: `jobDescription` (string), `provider`, `apiKey`, `model` (for custom AI models).

Returns:

```json
{
  "analysis": {
    "overall_score": 78,
    "sections": { "formatting": { "score": 65, "issues": [...], "suggestions": [...] }, ... },
    "top_improvements": ["..."],
    "job_match_score": 82,
    "missing_keywords": ["React", "TypeScript"],
    "tailored_suggestions": ["..."]
  },
  "text": "extracted PDF text"
}
```

### `POST /api/generate-questions`

Accepts JSON: `{ resumeText, jobDescription?, provider?, apiKey?, model? }`

Returns:

```json
{
  "questions": [
    { "question": "...", "category": "Behavioral", "suggested_approach": "..." }
  ]
}
```

---

## Architecture Notes

### PDF Text Extraction

Uses `pdfjs-dist/legacy/build/pdf.mjs` to extract text page-by-page. The package is externalized in `serverExternalPackages` to avoid Turbopack bundling issues with its legacy module format.

### Model-Agnostic AI Layer

The `lib/ai.ts` module abstracts all provider differences behind a `getModel(config)` factory. Each provider SDK is lazy-created with the user's API key. Fallback to Groq + `GROQ_API_KEY` env var when no custom config is set.

### History Persistence

Analysis results are stored in `localStorage` (key `resume-history`, capped at 10 entries). The `use-analysis-history` hook handles loading, saving, and FIFO eviction.

### No-Flash Dark Mode

An inline `<script>` in `layout.tsx` reads `localStorage` before React hydrates, applying the `.dark` class to `<html>` immediately. This prevents the white flash on page load.

---

## Scripts

```bash
npm run dev       # Start development server (Turbopack)
npm run build     # Production build
npm run start     # Start production server
```

---

## License

MIT
