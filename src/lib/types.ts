export interface HistoryEntry {
  id: string
  fileName: string
  timestamp: number
  analysis: ResumeAnalysis
  jobDescription?: string
}

export interface SectionAnalysis {
  score: number
  issues: string[]
  suggestions: string[]
}

export interface ResumeAnalysis {
  overall_score: number
  sections: {
    formatting: SectionAnalysis
    summary: SectionAnalysis
    experience: SectionAnalysis
    skills: SectionAnalysis
    education: SectionAnalysis
  }
  top_improvements: string[]
  job_match_score?: number
  missing_keywords?: string[]
  tailored_suggestions?: string[]
}
