import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/database"
import { readFile } from "fs/promises"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const resumeId = Number.parseInt(params.id)

    if (isNaN(resumeId)) {
      return NextResponse.json({ error: "Invalid resume ID" }, { status: 400 })
    }

    const db = await getDatabase()

    // Get resume file path
    const result = await db.get(
      `
      SELECT filename, original_filename, file_path 
      FROM resumes 
      WHERE id = ?
    `,
      [resumeId],
    )

    if (!result) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    // Read file
    const fileBuffer = await readFile(result.file_path)

    // Return file with proper headers
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${result.original_filename}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "Failed to download file" }, { status: 500 })
  }
}
