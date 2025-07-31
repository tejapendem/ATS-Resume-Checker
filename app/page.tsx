"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"
import { AnimatedBackground } from "@/components/animated-background"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const router = useRouter()

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile)
      }
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)

    // Simulate upload and processing
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Store file data in sessionStorage for the next page
    const reader = new FileReader()
    reader.onload = () => {
      sessionStorage.setItem(
        "uploadedResume",
        JSON.stringify({
          name: file.name,
          size: file.size,
          data: reader.result,
        }),
      )
      router.push("/ats-checker")
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">ATS Resume Checker</h1>
            <p className="text-xl text-white/80 mb-2">Optimize your resume for Applicant Tracking Systems</p>
            <p className="text-white/60">
              Upload your PDF resume and get instant feedback to improve your chances of getting hired
            </p>
          </div>

          <Card className="backdrop-blur-sm bg-white/10 border-white/20">
            <CardHeader className="text-center">
              <CardTitle className="text-white text-2xl">Upload Your Resume</CardTitle>
              <CardDescription className="text-white/70">
                Upload a PDF file to analyze your resume against ATS requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? "border-blue-400 bg-blue-400/10" : "border-white/30 hover:border-white/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 rounded-full bg-white/10">
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-white text-lg font-medium">Drag and drop your PDF resume here</p>
                    <p className="text-white/60 text-sm mt-1">or click to browse files</p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    aria-label="Upload resume PDF file"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-white/30 rounded-md text-white hover:bg-white/10 transition-colors"
                  >
                    Browse Files
                  </label>
                </div>
              </div>

              {file && (
                <div className="flex items-center space-x-3 p-4 bg-white/10 rounded-lg">
                  <FileText className="h-5 w-5 text-green-400" />
                  <div className="flex-1">
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-white/60 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
              )}

              <div className="space-y-3 text-sm text-white/70">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Upload PDF files only (max 10MB)</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Get instant ATS compatibility score</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Receive detailed improvement suggestions</span>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <span>Your resume data is processed securely and not stored</span>
                </div>
              </div>

              <Button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
                aria-label="Analyze resume for ATS compatibility"
              >
                {isUploading ? (
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner />
                    <span>Analyzing Resume...</span>
                  </div>
                ) : (
                  "Analyze Resume"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
