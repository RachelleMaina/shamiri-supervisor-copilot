import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/src/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid session ID' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { supervisor_id, decision, comments } = req.body;

  if (!supervisor_id || !decision) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1️⃣ Validate supervisor role
    const supervisor = await query(
      'SELECT role FROM users WHERE id = $1',
      [supervisor_id]
    );

    if (!supervisor.rows.length || supervisor.rows[0].role !== 'SUPERVISOR') {
      return res.status(403).json({ error: 'User is not a supervisor' });
    }

    // 2️⃣ Insert review
    const reviewResult = await query(
      `INSERT INTO supervisor_reviews
       (session_id, supervisor_id, decision, comments)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, supervisor_id, decision, comments || null]
    );

    // 3️⃣ Determine new session status
    let newStatus = 'REVIEWED';

    if (decision === 'ESCALATED') {
      newStatus = 'ESCALATED';
    }

    await query(
      'UPDATE sessions SET status = $1 WHERE id = $2',
      [newStatus, id]
    );

    // 4️⃣ Return updated session
    const sessionResult = await query(
      'SELECT * FROM sessions WHERE id = $1',
      [id]
    );

    res.status(200).json({
      message: 'Review submitted',
      sessionStatus: newStatus,
      review: reviewResult.rows[0],
      session: sessionResult.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit review' });
  }
}
