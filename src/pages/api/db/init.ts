import { query } from '@/src/lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { assignments, users, sessions } from './data';

async function createTables() {
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

  await query(`
    CREATE TABLE IF NOT EXISTS supervisor_fellows (
      id SERIAL PRIMARY KEY,
      supervisor_id INT REFERENCES users(id) ON DELETE CASCADE,
      fellow_id INT REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(supervisor_id, fellow_id)
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id SERIAL PRIMARY KEY,
      fellow_id INT REFERENCES users(id) ON DELETE CASCADE,
      session_date DATE NOT NULL,
      group_id TEXT,
      assigned_concept TEXT,
      transcript TEXT,
      status TEXT CHECK(status IN ('CREATED', 'ANALYZED', 'REVIEWED', 'ESCALATED')) DEFAULT 'CREATED',
      created_at TIMESTAMP DEFAULT now()
    );
  `);

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

  await query(`
    CREATE TABLE IF NOT EXISTS supervisor_reviews (
      id SERIAL PRIMARY KEY,
      session_id INT REFERENCES sessions(id) ON DELETE CASCADE,
      supervisor_id INT REFERENCES users(id) ON DELETE CASCADE,
      action TEXT CHECK(action IN ('VALIDATE','REJECT')) NOT NULL,
      updated_quality_index JSONB,
      notes TEXT,
      created_at TIMESTAMP DEFAULT now()
    );
  `);

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
}

async function seedUsers() {
 

  for (const user of users) {
    const password_hash = await bcrypt.hash(user.password, 10);
    await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      [user.name, user.email, password_hash, user.role]
    );
  }
}

async function seedAssignments() {


  for (const a of assignments) {
    await query(
      `INSERT INTO supervisor_fellows (supervisor_id, fellow_id)
       VALUES ($1, $2)
       ON CONFLICT (supervisor_id, fellow_id) DO NOTHING`,
      [a.supervisor_id, a.fellow_id]
    );
  }
}

async function seedSessions() {

  for (const session of sessions) {
    await query(
      `INSERT INTO sessions (fellow_id, session_date, group_id, assigned_concept, transcript, status)
       VALUES ($1, $2, $3, $4, $5, 'CREATED')
       ON CONFLICT DO NOTHING`,
      [session.fellow_id, session.session_date, session.group_id, session.assigned_concept, session.transcript]
    );
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 1. Create tables
    await createTables();

    // 2. Seed users (1 supervisor + 4 fellows)
    await seedUsers();

    // 3. Seed supervisor-fellow assignments
    await seedAssignments();

    // 4. Seed 15 sessions
    await seedSessions();

    res.status(200).json({ message: 'Database fully seeded: tables created, users, assignments, and 15 sessions inserted.' });
  } catch (err) {
    console.error('Seeding error:', err);
    res.status(500).json({ error: 'Failed to seed database', details: err.message });
  }
}