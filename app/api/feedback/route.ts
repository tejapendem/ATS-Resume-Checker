import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { rating, comments, userEmail } = await request.json()

    if (!rating) {
      return NextResponse.json({ error: "Rating is required" }, { status: 400 })
    }

    const db = await getDatabase()

    await db.run(`INSERT INTO feedback (user_email, rating, comments) VALUES (?, ?, ?)`, [
      userEmail || null,
      rating,
      comments || null,
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Feedback submission error:", error)
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const db = await getDatabase()

    const feedback = await db.all(`
      SELECT rating, comments, created_at 
      FROM feedback 
      ORDER BY created_at DESC 
      LIMIT 100
    `)

    // Calculate statistics
    const stats = await db.get(`
      SELECT 
        COUNT(*) as total_feedback,
        AVG(CASE 
          WHEN rating = 'excellent' THEN 5
          WHEN rating = 'good' THEN 4
          WHEN rating = 'fair' THEN 3
          WHEN rating = 'poor' THEN 2
          ELSE 1
        END) as average_rating
      FROM feedback
    `)

    return NextResponse.json({
      success: true,
      feedback,
      stats,
    })
  } catch (error) {
    console.error("Feedback retrieval error:", error)
    return NextResponse.json({ error: "Failed to retrieve feedback" }, { status: 500 })
  }
}
