"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Mail, Phone, MapPin } from "lucide-react"

interface ResumeData {
  name: string
  size: number
  data: string
}

interface ResumePreviewProps {
  resumeData: ResumeData
}

export function ResumePreview({ resumeData }: ResumePreviewProps) {
  return (
    <Card className="backdrop-blur-sm bg-white/10 border-white/20 h-fit sticky top-4">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Resume Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-white rounded-lg p-6 text-black min-h-[600px] shadow-lg">
          {/* Mock Resume Content */}
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center border-b pb-4">
              <h1 className="text-2xl font-bold">John Doe</h1>
              <div className="flex justify-center items-center space-x-4 text-sm text-gray-600 mt-2">
                <div className="flex items-center">
                  <Mail className="h-3 w-3 mr-1" />
                  john.doe@email.com
                </div>
                <div className="flex items-center">
                  <Phone className="h-3 w-3 mr-1" />
                  (555) 123-4567
                </div>
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  New York, NY
                </div>
              </div>
            </div>

            {/* Professional Summary */}
            <div>
              <h2 className="text-lg font-semibold border-b border-gray-300 pb-1 mb-2">Professional Summary</h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                Experienced software developer with 5+ years of expertise in React, Node.js, and cloud technologies.
                Proven track record of delivering scalable web applications and leading cross-functional teams.
              </p>
            </div>

            {/* Experience */}
            <div>
              <h2 className="text-lg font-semibold border-b border-gray-300 pb-1 mb-2">Professional Experience</h2>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Senior Software Developer</h3>
                      <p className="text-sm text-gray-600">Tech Solutions Inc.</p>
                    </div>
                    <span className="text-sm text-gray-500">2021 - Present</span>
                  </div>
                  <ul className="text-sm text-gray-700 mt-1 space-y-1 list-disc list-inside">
                    <li>Led development of React-based dashboard increasing user engagement by 40%</li>
                    <li>Implemented CI/CD pipelines reducing deployment time by 60%</li>
                  </ul>
                </div>

                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Software Developer</h3>
                      <p className="text-sm text-gray-600">StartupXYZ</p>
                    </div>
                    <span className="text-sm text-gray-500">2019 - 2021</span>
                  </div>
                  <ul className="text-sm text-gray-700 mt-1 space-y-1 list-disc list-inside">
                    <li>Developed RESTful APIs serving 10,000+ daily active users</li>
                    <li>Collaborated with design team to implement responsive UI components</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h2 className="text-lg font-semibold border-b border-gray-300 pb-1 mb-2">Technical Skills</h2>
              <div className="text-sm text-gray-700">
                <p>
                  <strong>Languages:</strong> JavaScript, TypeScript, Python, Java
                </p>
                <p>
                  <strong>Frameworks:</strong> React, Node.js, Express, Next.js
                </p>
                <p>
                  <strong>Tools:</strong> Git, Docker, AWS, MongoDB, PostgreSQL
                </p>
              </div>
            </div>

            {/* Education */}
            <div>
              <h2 className="text-lg font-semibold border-b border-gray-300 pb-1 mb-2">Education</h2>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">Bachelor of Science in Computer Science</h3>
                  <p className="text-sm text-gray-600">University of Technology</p>
                </div>
                <span className="text-sm text-gray-500">2015 - 2019</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-white/60 text-sm">
            File: {resumeData.name} ({(resumeData.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
