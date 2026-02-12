import { query } from '@/src/lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';


const createTables = async () => {
  // 1️⃣ Users table
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('fellow','supervisor','expert')) NOT NULL,
      created_at TIMESTAMP DEFAULT now()
    );
  `);

  // 2️⃣ Supervisor-Fellow assignments
  await query(`
    CREATE TABLE IF NOT EXISTS supervisor_fellows (
      id SERIAL PRIMARY KEY,
      supervisor_id INT REFERENCES users(id) ON DELETE CASCADE,
      fellow_id INT REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(supervisor_id, fellow_id)
    );
  `);

  // 3️⃣ Sessions
  await query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id SERIAL PRIMARY KEY,
      fellow_id INT REFERENCES users(id) ON DELETE CASCADE,
      session_date DATE NOT NULL,
      group_id TEXT,
      assigned_concept TEXT,
      transcript TEXT,
      status TEXT CHECK(status IN ('CREATED','AI_PROCESSED','FLAGGED','SAFE','ESCALATED')) DEFAULT 'CREATED',
      created_at TIMESTAMP DEFAULT now()
    );
  `);

  // 4️⃣ AI Analyses
  await query(`
    CREATE TABLE IF NOT EXISTS ai_analyses (
      id SERIAL PRIMARY KEY,
      session_id INT REFERENCES sessions(id) ON DELETE CASCADE,
      summary TEXT,
      quality_index JSONB,
      risk_assessment JSONB,
      created_at TIMESTAMP DEFAULT now()
    );
  `);

  // 5️⃣ Supervisor Reviews
  await query(`
    CREATE TABLE IF NOT EXISTS supervisor_reviews (
      id SERIAL PRIMARY KEY,
      session_id INT REFERENCES sessions(id) ON DELETE CASCADE,
      supervisor_id INT REFERENCES users(id) ON DELETE CASCADE,
      action TEXT CHECK(action IN ('VALIDATED','OVERRIDDEN','ESCALATED')) NOT NULL,
      updated_quality_index JSONB,
      notes TEXT,
      created_at TIMESTAMP DEFAULT now()
    );
  `);

  // 6️⃣ Escalations
  await query(`
    CREATE TABLE IF NOT EXISTS escalations (
      id SERIAL PRIMARY KEY,
      session_id INT REFERENCES sessions(id) ON DELETE CASCADE,
      expert_id INT REFERENCES users(id) ON DELETE CASCADE,
      triggered_by TEXT CHECK(triggered_by IN ('AI','SUPERVISOR')) NOT NULL,
      reason TEXT NOT NULL,
      status TEXT CHECK(status IN ('PENDING','RESOLVED')) DEFAULT 'PENDING',
      supervisor_note TEXT,
      expert_note TEXT,
      created_at TIMESTAMP DEFAULT now(),
      resolved_at TIMESTAMP
    );
  `);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await createTables();
    res.status(200).json({ message: 'All tables created successfully' });
  } catch (err) {
    console.error('DB init error:', err);
    res.status(500).json({ error: 'Failed to create tables' });
  }
}
