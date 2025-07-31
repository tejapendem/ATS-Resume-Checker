import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/database"

export async function GET() {
  try {
    const db = await getDatabase()

    // Get overall statistics
    const stats = await db.get(`
      SELECT 
        COUNT(DISTINCT r.id) as total_resumes,
        AVG(ra.ats_score) as average_ats_score,
        COUNT(DISTINCT DATE(r.upload_date)) as active_days,
        AVG(ra.total_words) as average_word_count
      FROM resumes r
      LEFT JOIN resume_analyses ra ON r.id = ra.resume_id
    `)

    // Get score distribution
    const scoreDistribution = await db.all(`
      SELECT 
        CASE 
          WHEN ats_score >= 90 THEN 'A+'
          WHEN ats_score >= 80 THEN 'A'
          WHEN ats_score >= 70 THEN 'B'
          WHEN ats_score >= 60 THEN 'C'
          ELSE 'D'
        END as grade,
        COUNT(*) as count
      FROM resume_analyses
      GROUP BY grade
      ORDER BY grade
    `)

    // Get recent activity
    const recentActivity = await db.all(`
      SELECT 
        DATE(upload_date) as date,
        COUNT(*) as uploads
      FROM resumes
      WHERE upload_date >= datetime('now', '-30 days')
      GROUP BY DATE(upload_date)
      ORDER BY date DESC
    `)

    // Get common issues
    const commonIssues = await db.all(`
      SELECT 
        json_extract(analysis_data, '$.atsAnalysis.issues') as issues
      FROM resume_analyses
      WHERE issues IS NOT NULL
      LIMIT 100
    `)

    return NextResponse.json({
      success: true,
      stats: {
        totalResumes: stats.total_resumes || 0,
        averageAtsScore: Math.round(stats.average_ats_score || 0),
        activeDays: stats.active_days || 0,
        averageWordCount: Math.round(stats.average_word_count || 0),
      },
      scoreDistribution,
      recentActivity,
      commonIssues: commonIssues.length,
    })
  } catch (error) {
    console.error("Stats retrieval error:", error)
    return NextResponse.json({ error: "Failed to retrieve statistics" }, { status: 500 })
  }
}
