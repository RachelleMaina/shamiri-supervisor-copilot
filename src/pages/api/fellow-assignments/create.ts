import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/src/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { supervisor_id, fellow_id } = req.body;

  if (!supervisor_id || !fellow_id) {
    return res.status(400).json({ error: 'Missing supervisor_id or fellow_id' });
  }

  try {
    // 1️⃣ Validate roles
    const supervisor = await query(
      'SELECT role FROM users WHERE id = $1',
      [supervisor_id]
    );

    const fellow = await query(
      'SELECT role FROM users WHERE id = $1',
      [fellow_id]
    );

    if (!supervisor.rows.length || supervisor.rows[0].role !== 'supervisor') {
      return res.status(400).json({ error: 'Invalid supervisor (must be TIER2)' });
    }

    if (!fellow.rows.length || fellow.rows[0].role !== 'fellow') {
      return res.status(400).json({ error: 'Invalid fellow (must be TIER1)' });
    }

    // 2️⃣ Insert assignment
    const result = await query(
      `INSERT INTO supervisor_fellows (supervisor_id, fellow_id)
       VALUES ($1, $2)
       RETURNING *`,
      [supervisor_id, fellow_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Assignment already exists' });
    }

    console.error(err);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
}
