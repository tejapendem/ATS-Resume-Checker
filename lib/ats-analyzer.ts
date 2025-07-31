import type { ExtractedResumeInfo } from "./pdf-processor"

export interface ATSAnalysis {
  score: number
  grade: string
  issues: Array<{
    type: "error" | "warning" | "suggestion"
    category: string
    message: string
    impact: "high" | "medium" | "low"
    suggestion?: string
  }>
  strengths: string[]
  keywords: {
    found: string[]
    missing: string[]
    density: number
  }
  sections: {
    present: string[]
    missing: string[]
  }
  formatting: {
    score: number
    issues: string[]
  }
  readability: {
    score: number
    level: string
  }
}

export function analyzeResumeForATS(resumeInfo: ExtractedResumeInfo, jobKeywords: string[] = []): ATSAnalysis {
  const analysis: ATSAnalysis = {
    score: 0,
    grade: "",
    issues: [],
    strengths: [],
    keywords: {
      found: [],
      missing: [],
      density: 0,
    },
    sections: {
      present: [],
      missing: [],
    },
    formatting: {
      score: 0,
      issues: [],
    },
    readability: {
      score: resumeInfo.readabilityScore,
      level: getReadabilityLevel(resumeInfo.readabilityScore),
    },
  }

  // Analyze sections
  analyzeSections(resumeInfo, analysis)

  // Analyze keywords
  analyzeKeywords(resumeInfo, analysis, jobKeywords)

  // Analyze formatting
  analyzeFormatting(resumeInfo, analysis)

  // Analyze content quality
  analyzeContentQuality(resumeInfo, analysis)

  // Calculate overall score
  calculateOverallScore(analysis)

  // Determine grade
  analysis.grade = getGrade(analysis.score)

  return analysis
}

function analyzeSections(resumeInfo: ExtractedResumeInfo, analysis: ATSAnalysis) {
  const requiredSections = ["experience", "education", "skills"]
  const recommendedSections = ["summary", "certifications", "projects"]

  // Check required sections
  for (const section of requiredSections) {
    if (hasSection(resumeInfo, section)) {
      analysis.sections.present.push(section)
      analysis.strengths.push(`${section.charAt(0).toUpperCase() + section.slice(1)} section present`)
    } else {
      analysis.sections.missing.push(section)
      analysis.issues.push({
        type: "error",
        category: "Structure",
        message: `Missing ${section} section`,
        impact: "high",
        suggestion: `Add a dedicated ${section} section to your resume`,
      })
    }
  }

  // Check recommended sections
  for (const section of recommendedSections) {
    if (hasSection(resumeInfo, section)) {
      analysis.sections.present.push(section)
      analysis.strengths.push(`${section.charAt(0).toUpperCase() + section.slice(1)} section included`)
    } else {
      analysis.sections.missing.push(section)
      analysis.issues.push({
        type: "suggestion",
        category: "Structure",
        message: `Consider adding ${section} section`,
        impact: "low",
        suggestion: `A ${section} section can strengthen your resume`,
      })
    }
  }
}

function hasSection(resumeInfo: ExtractedResumeInfo, section: string): boolean {
  switch (section) {
    case "experience":
      return resumeInfo.sections.experience.length > 0
    case "education":
      return resumeInfo.sections.education.length > 0
    case "skills":
      return resumeInfo.sections.skills.length > 0
    case "summary":
      return !!resumeInfo.sections.summary
    case "certifications":
      return resumeInfo.sections.certifications.length > 0
    case "projects":
      return resumeInfo.sections.projects.length > 0
    default:
      return false
  }
}

function analyzeKeywords(resumeInfo: ExtractedResumeInfo, analysis: ATSAnalysis, jobKeywords: string[]) {
  const resumeKeywords = resumeInfo.keywords.map((k) => k.toLowerCase())
  const allSkills = resumeInfo.sections.skills.map((s) => s.toLowerCase())
  const combinedKeywords = [...new Set([...resumeKeywords, ...allSkills])]

  // Industry-standard keywords
  const industryKeywords = [
    "leadership",
    "management",
    "communication",
    "teamwork",
    "problem-solving",
    "analytical",
    "strategic",
    "innovative",
    "collaborative",
    "results-driven",
    "agile",
    "scrum",
    "project management",
    "data analysis",
    "customer service",
  ]

  const targetKeywords = jobKeywords.length > 0 ? jobKeywords : industryKeywords

  for (const keyword of targetKeywords) {
    const found = combinedKeywords.some((k) => k.includes(keyword.toLowerCase()))
    if (found) {
      analysis.keywords.found.push(keyword)
    } else {
      analysis.keywords.missing.push(keyword)
    }
  }

  // Calculate keyword density
  analysis.keywords.density = (analysis.keywords.found.length / targetKeywords.length) * 100

  // Add keyword-related issues and strengths
  if (analysis.keywords.density < 30) {
    analysis.issues.push({
      type: "error",
      category: "Keywords",
      message: "Low keyword density - may not pass ATS filters",
      impact: "high",
      suggestion: "Include more industry-relevant keywords throughout your resume",
    })
  } else if (analysis.keywords.density < 50) {
    analysis.issues.push({
      type: "warning",
      category: "Keywords",
      message: "Moderate keyword density - room for improvement",
      impact: "medium",
      suggestion: "Consider adding more relevant keywords to improve ATS compatibility",
    })
  } else {
    analysis.strengths.push("Good keyword density for ATS systems")
  }
}

function analyzeFormatting(resumeInfo: ExtractedResumeInfo, analysis: ATSAnalysis) {
  let formatScore = 100

  // Check for contact information
  if (!resumeInfo.personalInfo.email) {
    analysis.issues.push({
      type: "error",
      category: "Contact Info",
      message: "Email address not found",
      impact: "high",
      suggestion: "Include a professional email address",
    })
    formatScore -= 20
  } else {
    analysis.strengths.push("Email address present")
  }

  if (!resumeInfo.personalInfo.phone) {
    analysis.issues.push({
      type: "warning",
      category: "Contact Info",
      message: "Phone number not found",
      impact: "medium",
      suggestion: "Include a phone number for easy contact",
    })
    formatScore -= 10
  } else {
    analysis.strengths.push("Phone number present")
  }

  if (!resumeInfo.personalInfo.name) {
    analysis.issues.push({
      type: "error",
      category: "Contact Info",
      message: "Name not clearly identified",
      impact: "high",
      suggestion: "Ensure your name is prominently displayed at the top",
    })
    formatScore -= 15
  } else {
    analysis.strengths.push("Name clearly identified")
  }

  // Check resume length
  if (resumeInfo.totalWords < 200) {
    analysis.issues.push({
      type: "warning",
      category: "Content Length",
      message: "Resume appears too short",
      impact: "medium",
      suggestion: "Consider adding more detail to your experience and achievements",
    })
    formatScore -= 15
  } else if (resumeInfo.totalWords > 800) {
    analysis.issues.push({
      type: "suggestion",
      category: "Content Length",
      message: "Resume may be too lengthy",
      impact: "low",
      suggestion: "Consider condensing content to 1-2 pages for better readability",
    })
    formatScore -= 5
  } else {
    analysis.strengths.push("Appropriate resume length")
  }

  analysis.formatting.score = Math.max(0, formatScore)
}

function analyzeContentQuality(resumeInfo: ExtractedResumeInfo, analysis: ATSAnalysis) {
  // Check for quantified achievements
  const hasNumbers = resumeInfo.sections.experience.some((exp) => exp.description.some((desc) => /\d+/.test(desc)))

  if (hasNumbers) {
    analysis.strengths.push("Quantified achievements present")
  } else {
    analysis.issues.push({
      type: "suggestion",
      category: "Content Quality",
      message: "Add quantified achievements to demonstrate impact",
      impact: "medium",
      suggestion: "Include numbers, percentages, or metrics to show your accomplishments",
    })
  }

  // Check for action verbs
  const actionVerbs = [
    "achieved",
    "managed",
    "led",
    "developed",
    "implemented",
    "created",
    "improved",
    "increased",
    "reduced",
    "optimized",
    "designed",
    "built",
    "launched",
    "delivered",
  ]

  const hasActionVerbs = resumeInfo.sections.experience.some((exp) =>
    exp.description.some((desc) => actionVerbs.some((verb) => desc.toLowerCase().includes(verb))),
  )

  if (hasActionVerbs) {
    analysis.strengths.push("Strong action verbs used")
  } else {
    analysis.issues.push({
      type: "suggestion",
      category: "Content Quality",
      message: "Use more action verbs to describe your experience",
      impact: "low",
      suggestion: 'Start bullet points with strong action verbs like "achieved," "managed," or "developed"',
    })
  }

  // Check skills section quality
  if (resumeInfo.sections.skills.length < 5) {
    analysis.issues.push({
      type: "warning",
      category: "Skills",
      message: "Limited skills listed",
      impact: "medium",
      suggestion: "Include more relevant technical and soft skills",
    })
  } else if (resumeInfo.sections.skills.length > 20) {
    analysis.issues.push({
      type: "suggestion",
      category: "Skills",
      message: "Too many skills listed",
      impact: "low",
      suggestion: "Focus on the most relevant skills for your target role",
    })
  } else {
    analysis.strengths.push("Appropriate number of skills listed")
  }
}

function calculateOverallScore(analysis: ATSAnalysis) {
  let score = 100

  // Deduct points for issues
  for (const issue of analysis.issues) {
    switch (issue.impact) {
      case "high":
        score -= 15
        break
      case "medium":
        score -= 8
        break
      case "low":
        score -= 3
        break
    }
  }

  // Bonus for strengths
  score += Math.min(20, analysis.strengths.length * 2)

  // Factor in keyword density
  score = score * (0.7 + (analysis.keywords.density / 100) * 0.3)

  // Factor in formatting score
  score = score * (0.8 + (analysis.formatting.score / 100) * 0.2)

  analysis.score = Math.max(0, Math.min(100, Math.round(score)))
}

function getGrade(score: number): string {
  if (score >= 90) return "A+"
  if (score >= 85) return "A"
  if (score >= 80) return "A-"
  if (score >= 75) return "B+"
  if (score >= 70) return "B"
  if (score >= 65) return "B-"
  if (score >= 60) return "C+"
  if (score >= 55) return "C"
  if (score >= 50) return "C-"
  if (score >= 45) return "D+"
  if (score >= 40) return "D"
  return "F"
}

function getReadabilityLevel(score: number): string {
  if (score >= 90) return "Very Easy"
  if (score >= 80) return "Easy"
  if (score >= 70) return "Fairly Easy"
  if (score >= 60) return "Standard"
  if (score >= 50) return "Fairly Difficult"
  if (score >= 30) return "Difficult"
  return "Very Difficult"
}
