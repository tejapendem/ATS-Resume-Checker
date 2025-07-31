import sqlite3 from "sqlite3"
import { open, type Database } from "sqlite"
import path from "path"

let db: Database | null = null

export async function getDatabase(): Promise<Database> {
  if (db) return db

  db = await open({
    filename: path.join(process.cwd(), "database.sqlite"),
    driver: sqlite3.Database,
  })

  // Initialize tables
  await initializeTables()
  return db
}

async function initializeTables() {
  if (!db) return

  // Users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Resumes table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS resumes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      filename TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `)

  // Resume analysis table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS resume_analyses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resume_id INTEGER NOT NULL,
      ats_score INTEGER NOT NULL,
      grade TEXT NOT NULL,
      total_words INTEGER,
      readability_score INTEGER,
      analysis_data TEXT, -- JSON string
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (resume_id) REFERENCES resumes (id)
    )
  `)

  // Feedback table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT,
      rating TEXT NOT NULL,
      comments TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Job descriptions table (for keyword matching)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS job_descriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      company TEXT,
      description TEXT NOT NULL,
      keywords TEXT, -- JSON array
      industry TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

export interface User {
  id: number
  email: string
  password_hash: string
  name?: string
  created_at: string
  updated_at: string
}

export interface Resume {
  id: number
  user_id?: number
  filename: string
  original_filename: string
  file_path: string
  file_size: number
  upload_date: string
}

export interface ResumeAnalysis {
  id: number
  resume_id: number
  ats_score: number
  grade: string
  total_words: number
  readability_score: number
  analysis_data: string
  created_at: string
}

export interface Feedback {
  id: number
  user_email?: string
  rating: string
  comments?: string
  created_at: string
}
