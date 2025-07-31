import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const resumeId = Number.parseInt(params.id)

    if (isNaN(resumeId)) {
      return NextResponse.json({ error: "Invalid resume ID" }, { status: 400 })
    }

    const db = await getDatabase()

    // Get resume and analysis data
    const result = await db.get(
      `
      SELECT 
        r.id,
        r.filename,
        r.original_filename,
        r.file_size,
        r.upload_date,
        ra.ats_score,
        ra.grade,
        ra.total_words,
        ra.readability_score,
        ra.analysis_data,
        ra.created_at as analysis_date
      FROM resumes r
      LEFT JOIN resume_analyses ra ON r.id = ra.resume_id
      WHERE r.id = ?
    `,
      [resumeId],
    )

    if (!result) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    // Parse analysis data
    const analysisData = result.analysis_data ? JSON.parse(result.analysis_data) : null

    return NextResponse.json({
      success: true,
      resume: {
        id: result.id,
        filename: result.filename,
        originalFilename: result.original_filename,
        fileSize: result.file_size,
        uploadDate: result.upload_date,
      },
      analysis: {
        atsScore: result.ats_score,
        grade: result.grade,
        totalWords: result.total_words,
        readabilityScore: result.readability_score,
        analysisDate: result.analysis_date,
        ...analysisData,
      },
    })
  } catch (error) {
    console.error("Analysis retrieval error:", error)
    return NextResponse.json({ error: "Failed to retrieve analysis" }, { status: 500 })
  }
}
