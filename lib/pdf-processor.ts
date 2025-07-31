import pdf from "pdf-parse"
import fs from "fs"

export interface ParsedResumeData {
  text: string
  pages: number
  info: {
    title?: string
    author?: string
    creator?: string
    producer?: string
    creationDate?: Date
    modificationDate?: Date
  }
  metadata: any
}

export interface ExtractedResumeInfo {
  personalInfo: {
    name?: string
    email?: string
    phone?: string
    location?: string
    linkedin?: string
    github?: string
  }
  sections: {
    summary?: string
    experience: Array<{
      title: string
      company: string
      duration: string
      description: string[]
    }>
    education: Array<{
      degree: string
      institution: string
      year: string
      gpa?: string
    }>
    skills: string[]
    certifications: string[]
    projects: Array<{
      name: string
      description: string
      technologies: string[]
    }>
  }
  keywords: string[]
  totalWords: number
  readabilityScore: number
}

export async function processPDFFile(filePath: string): Promise<ParsedResumeData> {
  try {
    const dataBuffer = fs.readFileSync(filePath)

    const data = await pdf(dataBuffer, {
      normalizeWhitespace: true,
      disableCombineTextItems: false,
    })

    return {
      text: data.text,
      pages: data.numpages,
      info: data.info || {},
      metadata: data.metadata || {},
    }
  } catch (error) {
    console.error("PDF processing error:", error)
    throw new Error("Failed to process PDF file")
  }
}

export function extractResumeInfo(parsedData: ParsedResumeData): ExtractedResumeInfo {
  const text = parsedData.text
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  // Extract personal information
  const personalInfo = extractPersonalInfo(text)

  // Extract sections
  const sections = extractSections(text, lines)

  // Extract keywords
  const keywords = extractKeywords(text)

  // Calculate metrics
  const totalWords = text.split(/\s+/).filter((word) => word.length > 0).length
  const readabilityScore = calculateReadabilityScore(text)

  return {
    personalInfo,
    sections,
    keywords,
    totalWords,
    readabilityScore,
  }
}

function extractPersonalInfo(text: string) {
  const personalInfo: any = {}

  // Extract email
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
  const emailMatch = text.match(emailRegex)
  if (emailMatch) {
    personalInfo.email = emailMatch[0]
  }

  // Extract phone number
  const phoneRegex = /(\+?1[-.\s]?)?([0-9]{3})[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
  const phoneMatch = text.match(phoneRegex)
  if (phoneMatch) {
    personalInfo.phone = phoneMatch[0]
  }

  // Extract LinkedIn
  const linkedinRegex = /(linkedin\.com\/in\/[A-Za-z0-9-]+)/g
  const linkedinMatch = text.match(linkedinRegex)
  if (linkedinMatch) {
    personalInfo.linkedin = linkedinMatch[0]
  }

  // Extract GitHub
  const githubRegex = /(github\.com\/[A-Za-z0-9-]+)/g
  const githubMatch = text.match(githubRegex)
  if (githubMatch) {
    personalInfo.github = githubMatch[0]
  }

  // Extract name (first non-empty line that's not an email/phone)
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  for (const line of lines.slice(0, 5)) {
    if (!emailRegex.test(line) && !phoneRegex.test(line) && line.length > 2 && line.length < 50) {
      if (/^[A-Za-z\s.'-]+$/.test(line) && line.split(" ").length <= 4) {
        personalInfo.name = line
        break
      }
    }
  }

  return personalInfo
}

function extractSections(text: string, lines: string[]) {
  const sections: any = {
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    projects: [],
  }

  // Common section headers
  const sectionHeaders = {
    experience: /^(experience|work experience|professional experience|employment|career|work history)$/i,
    education: /^(education|academic background|qualifications)$/i,
    skills: /^(skills|technical skills|core competencies|expertise|technologies)$/i,
    summary: /^(summary|profile|objective|about|overview)$/i,
    certifications: /^(certifications|certificates|licenses)$/i,
    projects: /^(projects|portfolio|notable projects)$/i,
  }

  let currentSection = ""
  let currentContent: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Check if this line is a section header
    let foundSection = ""
    for (const [section, regex] of Object.entries(sectionHeaders)) {
      if (regex.test(line)) {
        foundSection = section
        break
      }
    }

    if (foundSection) {
      // Process previous section
      if (currentSection && currentContent.length > 0) {
        processSectionContent(sections, currentSection, currentContent)
      }

      currentSection = foundSection
      currentContent = []
    } else if (currentSection) {
      currentContent.push(line)
    }
  }

  // Process the last section
  if (currentSection && currentContent.length > 0) {
    processSectionContent(sections, currentSection, currentContent)
  }

  // Extract skills from the entire text if not found in dedicated section
  if (sections.skills.length === 0) {
    sections.skills = extractSkillsFromText(text)
  }

  return sections
}

function processSectionContent(sections: any, sectionType: string, content: string[]) {
  const contentText = content.join(" ")

  switch (sectionType) {
    case "summary":
      sections.summary = contentText
      break

    case "experience":
      sections.experience = parseExperience(content)
      break

    case "education":
      sections.education = parseEducation(content)
      break

    case "skills":
      sections.skills = parseSkills(content)
      break

    case "certifications":
      sections.certifications = content.filter((line) => line.length > 3)
      break

    case "projects":
      sections.projects = parseProjects(content)
      break
  }
}

function parseExperience(content: string[]) {
  const experiences = []
  let currentExp: any = {}

  for (const line of content) {
    // Check if line looks like a job title/company
    if (line.length > 5 && !line.includes("•") && !line.includes("-")) {
      if (currentExp.title) {
        experiences.push(currentExp)
      }

      // Try to parse "Title at Company" or "Title | Company" format
      const titleCompanyMatch = line.match(/^(.+?)\s+(?:at|@|\|)\s+(.+)$/)
      if (titleCompanyMatch) {
        currentExp = {
          title: titleCompanyMatch[1].trim(),
          company: titleCompanyMatch[2].trim(),
          duration: "",
          description: [],
        }
      } else {
        currentExp = {
          title: line,
          company: "",
          duration: "",
          description: [],
        }
      }
    } else if (line.match(/\d{4}/) && (line.includes("-") || line.includes("to"))) {
      // Looks like a date range
      currentExp.duration = line
    } else if (line.includes("•") || line.includes("-") || line.length > 20) {
      // Looks like a description
      if (!currentExp.description) currentExp.description = []
      currentExp.description.push(line.replace(/^[•\-*]\s*/, ""))
    }
  }

  if (currentExp.title) {
    experiences.push(currentExp)
  }

  return experiences
}

function parseEducation(content: string[]) {
  const education = []
  let currentEdu: any = {}

  for (const line of content) {
    if (line.match(/bachelor|master|phd|doctorate|associate|diploma|certificate/i)) {
      if (currentEdu.degree) {
        education.push(currentEdu)
      }
      currentEdu = { degree: line, institution: "", year: "" }
    } else if (line.match(/university|college|institute|school/i)) {
      currentEdu.institution = line
    } else if (line.match(/\d{4}/)) {
      currentEdu.year = line
    } else if (line.match(/gpa|grade/i)) {
      currentEdu.gpa = line
    }
  }

  if (currentEdu.degree) {
    education.push(currentEdu)
  }

  return education
}

function parseSkills(content: string[]) {
  const skills = []
  const skillText = content.join(" ")

  // Split by common delimiters
  const skillItems = skillText
    .split(/[,;•\-\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1)

  for (const skill of skillItems) {
    if (skill.length > 1 && skill.length < 30) {
      skills.push(skill)
    }
  }

  return skills
}

function parseProjects(content: string[]) {
  const projects = []
  let currentProject: any = {}

  for (const line of content) {
    if (line.length > 5 && !line.includes("•") && !line.includes("-")) {
      if (currentProject.name) {
        projects.push(currentProject)
      }
      currentProject = {
        name: line,
        description: "",
        technologies: [],
      }
    } else {
      if (!currentProject.description) {
        currentProject.description = line
      } else {
        currentProject.description += " " + line
      }
    }
  }

  if (currentProject.name) {
    projects.push(currentProject)
  }

  return projects
}

function extractSkillsFromText(text: string) {
  const commonSkills = [
    // Programming Languages
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "C++",
    "C#",
    "PHP",
    "Ruby",
    "Go",
    "Rust",
    "Swift",
    "Kotlin",
    // Web Technologies
    "React",
    "Angular",
    "Vue.js",
    "Node.js",
    "Express",
    "Next.js",
    "HTML",
    "CSS",
    "SASS",
    "LESS",
    // Databases
    "MySQL",
    "PostgreSQL",
    "MongoDB",
    "Redis",
    "SQLite",
    "Oracle",
    "SQL Server",
    // Cloud & DevOps
    "AWS",
    "Azure",
    "Google Cloud",
    "Docker",
    "Kubernetes",
    "Jenkins",
    "Git",
    "GitHub",
    "GitLab",
    // Frameworks & Libraries
    "Spring",
    "Django",
    "Flask",
    "Laravel",
    "Rails",
    "jQuery",
    "Bootstrap",
    "Tailwind",
    // Tools & Methodologies
    "Agile",
    "Scrum",
    "Kanban",
    "CI/CD",
    "TDD",
    "REST",
    "GraphQL",
    "Microservices",
  ]

  const foundSkills = []
  const lowerText = text.toLowerCase()

  for (const skill of commonSkills) {
    if (lowerText.includes(skill.toLowerCase())) {
      foundSkills.push(skill)
    }
  }

  return foundSkills
}

function extractKeywords(text: string) {
  const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || []
  const wordCount: { [key: string]: number } = {}

  // Count word frequency
  for (const word of words) {
    if (!isStopWord(word)) {
      wordCount[word] = (wordCount[word] || 0) + 1
    }
  }

  // Return top keywords
  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([word]) => word)
}

function isStopWord(word: string) {
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "up",
    "about",
    "into",
    "through",
    "during",
    "before",
    "after",
    "above",
    "below",
    "between",
    "among",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "must",
    "can",
    "this",
    "that",
    "these",
    "those",
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
    "me",
    "him",
    "her",
    "us",
    "them",
    "my",
    "your",
    "his",
    "her",
    "its",
    "our",
    "their",
  ])

  return stopWords.has(word)
}

function calculateReadabilityScore(text: string) {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  const words = text.split(/\s+/).filter((w) => w.length > 0)
  const syllables = words.reduce((count, word) => count + countSyllables(word), 0)

  if (sentences.length === 0 || words.length === 0) return 0

  // Flesch Reading Ease Score
  const avgWordsPerSentence = words.length / sentences.length
  const avgSyllablesPerWord = syllables / words.length

  const score = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord

  return Math.max(0, Math.min(100, Math.round(score)))
}

function countSyllables(word: string) {
  word = word.toLowerCase()
  if (word.length <= 3) return 1

  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
  word = word.replace(/^y/, "")

  const matches = word.match(/[aeiouy]{1,2}/g)
  return matches ? matches.length : 1
}
