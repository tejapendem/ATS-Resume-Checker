"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, ArrowLeft, AlertTriangle, CheckCircle, XCircle, Star } from "lucide-react"
import { AnimatedBackground } from "@/components/animated-background"
import { ResumePreview } from "@/components/resume-preview"
import { FeedbackForm } from "@/components/feedback-form"

interface ResumeData {
  name: string
  size: number
  data: string
}

interface ATSResult {
  score: number
  grade: string
  issues: Array<{
    type: "error" | "warning" | "suggestion"
    category: string
    message: string
    impact: "high" | "medium" | "low"
  }>
  strengths: string[]
  keywords: {
    found: string[]
    missing: string[]
  }
}

export default function ATSCheckerPage() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [atsResult, setATSResult] = useState<ATSResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [showFeedback, setShowFeedback] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const storedData = sessionStorage.getItem("uploadedResume")
    if (!storedData) {
      router.push("/")
      return
    }

    const data = JSON.parse(storedData)
    setResumeData(data)

    // Simulate ATS analysis
    setTimeout(() => {
      const mockResult: ATSResult = {
        score: 78,
        grade: "B+",
        issues: [
          {
            type: "error",
            category: "Formatting",
            message: "Complex formatting detected that may not parse correctly",
            impact: "high",
          },
          {
            type: "warning",
            category: "Keywords",
            message: "Missing industry-specific keywords",
            impact: "medium",
          },
          {
            type: "suggestion",
            category: "Structure",
            message: "Consider adding a skills section",
            impact: "low",
          },
        ],
        strengths: [
          "Clear contact information",
          "Consistent date formatting",
          "Professional email address",
          "Quantified achievements",
        ],
        keywords: {
          found: ["JavaScript", "React", "Node.js", "Project Management"],
          missing: ["TypeScript", "AWS", "Agile", "Leadership"],
        },
      }
      setATSResult(mockResult)
      setIsAnalyzing(false)
    }, 2000)
  }, [router])

  const handleDownload = () => {
    // Simulate PDF download
    const link = document.createElement("a")
    link.href = "#"
    link.download = "optimized-resume.pdf"
    link.click()
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getIssueIcon = (type: string) => {
    switch (type) {
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Star className="h-4 w-4 text-blue-500" />
    }
  }

  if (!resumeData) {
    return null
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="text-white hover:bg-white/10"
              aria-label="Go back to upload page"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Upload
            </Button>
            <div className="flex space-x-2">
              <Button
                onClick={handleDownload}
                className="bg-green-600 hover:bg-green-700 text-white"
                aria-label="Download optimized resume"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Optimized Resume
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFeedback(true)}
                className="border-white/30 text-white hover:bg-white/10"
              >
                Provide Feedback
              </Button>
            </div>
          </div>

          {isAnalyzing ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Card className="backdrop-blur-sm bg-white/10 border-white/20 p-8">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                  <h2 className="text-2xl font-bold text-white">Analyzing Your Resume</h2>
                  <p className="text-white/70">This may take a few moments...</p>
                </div>
              </Card>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Resume Preview */}
              <div className="lg:col-span-1">
                <ResumePreview resumeData={resumeData} />
              </div>

              {/* Right Column - ATS Results */}
              <div className="lg:col-span-2 space-y-6">
                {/* ATS Score */}
                <Card className="backdrop-blur-sm bg-white/10 border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white text-2xl">ATS Compatibility Score</CardTitle>
                    <CardDescription className="text-white/70">
                      How well your resume performs with Applicant Tracking Systems
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className={`text-6xl font-bold ${getScoreColor(atsResult!.score)}`}>
                          {atsResult!.score}
                        </div>
                        <div className="text-white/70">out of 100</div>
                        <Badge variant="secondary" className="mt-2">
                          Grade: {atsResult!.grade}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <Progress value={atsResult!.score} className="h-3 mb-2" />
                        <p className="text-white/70 text-sm">
                          {atsResult!.score >= 80
                            ? "Excellent! Your resume is highly ATS-friendly."
                            : atsResult!.score >= 60
                              ? "Good score, but there's room for improvement."
                              : "Your resume needs significant optimization for ATS systems."}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Issues and Suggestions */}
                <Card className="backdrop-blur-sm bg-white/10 border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">Issues & Suggestions</CardTitle>
                    <CardDescription className="text-white/70">
                      Areas that need attention to improve your ATS score
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {atsResult!.issues.map((issue, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-white/5">
                        {getIssueIcon(issue.type)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-white font-medium">{issue.category}</span>
                            <Badge
                              variant={
                                issue.impact === "high"
                                  ? "destructive"
                                  : issue.impact === "medium"
                                    ? "default"
                                    : "secondary"
                              }
                              className="text-xs"
                            >
                              {issue.impact} impact
                            </Badge>
                          </div>
                          <p className="text-white/70 text-sm">{issue.message}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Strengths */}
                <Card className="backdrop-blur-sm bg-white/10 border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                      Strengths
                    </CardTitle>
                    <CardDescription className="text-white/70">What your resume does well</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      {atsResult!.strengths.map((strength, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                          <span className="text-white/80">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Keywords Analysis */}
                <Card className="backdrop-blur-sm bg-white/10 border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">Keywords Analysis</CardTitle>
                    <CardDescription className="text-white/70">
                      Keywords found and missing from your resume
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-white font-medium mb-2">Found Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {atsResult!.keywords.found.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="bg-green-600/20 text-green-300">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Separator className="bg-white/20" />
                    <div>
                      <h4 className="text-white font-medium mb-2">Missing Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {atsResult!.keywords.missing.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="border-red-400/50 text-red-300">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {showFeedback && <FeedbackForm onClose={() => setShowFeedback(false)} />}
    </div>
  )
}
