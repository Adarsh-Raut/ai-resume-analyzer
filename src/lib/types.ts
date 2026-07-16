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
}
