import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/src/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fellow_id, session_date, group_id, assigned_concept, transcript } = req.body;

  if (!fellow_id || !session_date || !assigned_concept || !transcript) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Validate Fellow role
    const fellow = await query(
      'SELECT role FROM users WHERE id = $1',
      [fellow_id]
    );

    if (!fellow.rows.length || fellow.rows[0].role !== 'fellow') {
      return res.status(400).json({ error: 'Invalid fellow (must be fellow)' });
    }

    const result = await query(
      `INSERT INTO sessions 
       (fellow_id, session_date, group_id, assigned_concept, transcript)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [fellow_id, session_date, group_id, assigned_concept, transcript]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create session' });
  }
}
