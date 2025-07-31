import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import { getDatabase } from "@/lib/database"
import { processPDFFile, extractResumeInfo } from "@/lib/pdf-processor"
import { analyzeResumeForATS } from "@/lib/ats-analyzer"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      return NextResponse.json({ error: "File size too large" }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "uploads")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const fileId = uuidv4()
    const filename = `${fileId}.pdf`
    const filepath = path.join(uploadsDir, filename)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Process PDF
    const parsedData = await processPDFFile(filepath)
    const extractedInfo = extractResumeInfo(parsedData)
    const atsAnalysis = analyzeResumeForATS(extractedInfo)

    // Save to database
    const db = await getDatabase()

    // Insert resume record
    const resumeResult = await db.run(
      `INSERT INTO resumes (filename, original_filename, file_path, file_size) 
       VALUES (?, ?, ?, ?)`,
      [filename, file.name, filepath, file.size],
    )

    const resumeId = resumeResult.lastID

    // Insert analysis record
    await db.run(
      `INSERT INTO resume_analyses (resume_id, ats_score, grade, total_words, readability_score, analysis_data) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        resumeId,
        atsAnalysis.score,
        atsAnalysis.grade,
        extractedInfo.totalWords,
        extractedInfo.readabilityScore,
        JSON.stringify({
          extractedInfo,
          atsAnalysis,
          parsedData: {
            pages: parsedData.pages,
            info: parsedData.info,
          },
        }),
      ],
    )

    return NextResponse.json({
      success: true,
      resumeId,
      filename,
      extractedInfo,
      atsAnalysis,
      parsedData: {
        pages: parsedData.pages,
        info: parsedData.info,
      },
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 })
  }
}
