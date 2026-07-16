# ResumeAI — Smart Resume Analyzer

Upload your resume (PDF) and get instant AI-powered feedback to improve it.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui + Framer Motion
- **AI:** Groq (Llama 3.3 70B) via Vercel AI SDK
- **PDF parsing:** pdfjs-dist

## Setup

1. Clone the repo:
   ```bash
   git clone <repo-url>
   cd ai-resume-anylyser
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Get a free Groq API key from [console.groq.com](https://console.groq.com)

4. Create `.env.local`:
   ```bash
   GROQ_API_KEY=your_key_here
   ```

5. Run the dev server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Usage

1. Drag and drop your PDF resume onto the upload zone
2. Click "Analyze Resume"
3. View your overall score, section breakdowns, issues, and suggestions

## API

`POST /api/analyze` — accepts a multipart form with a `file` field (PDF). Returns JSON with scores and feedback.
