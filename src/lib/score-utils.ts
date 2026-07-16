export function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-600"
  if (score >= 60) return "text-amber-600"
  return "text-rose-600"
}

export function scoreRingColor(score: number) {
  if (score >= 80) return "#059669"
  if (score >= 60) return "#d97706"
  return "#e11d48"
}

export function scoreLabel(score: number) {
  if (score >= 90) return "Excellent"
  if (score >= 80) return "Great"
  if (score >= 70) return "Good"
  if (score >= 60) return "Fair"
  return "Needs Work"
}

export function scoreBadgeClass(score: number) {
  if (score >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-200"
  if (score >= 60) return "bg-amber-50 text-amber-700 border-amber-200"
  return "bg-rose-50 text-rose-700 border-rose-200"
}

export function sectionLabel(key: string) {
  const labels: Record<string, string> = {
    formatting: "Formatting & Layout",
    summary: "Professional Summary",
    experience: "Work Experience",
    skills: "Skills",
    education: "Education",
  }
  return labels[key] ?? key
}

export function sectionIcon(key: string) {
  const icons: Record<string, string> = {
    formatting: "⊞",
    summary: "✦",
    experience: "⚑",
    skills: "⚡",
    education: "◈",
  }
  return icons[key] ?? "•"
}
