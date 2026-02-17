import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/src/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { supervisor_id, fellow_id, status } = req.query;

  try {
    let sql = `
      SELECT s.*, u.name AS fellow_name
      FROM sessions s
      JOIN users u ON s.fellow_id = u.id
    `;

    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Supervisor filter
    if (supervisor_id) {
      sql += ` JOIN supervisor_fellows sf ON s.fellow_id = sf.fellow_id `;
      conditions.push(`sf.supervisor_id = $${paramIndex++}`);
      values.push(supervisor_id);
    }

    // Fellow filter
    if (fellow_id) {
      conditions.push(`s.fellow_id = $${paramIndex++}`);
      values.push(fellow_id);
    }

    // Status filter
    if (status) {
      conditions.push(`s.status = $${paramIndex++}`);
      values.push(status);
    }

    // Add WHERE if needed
    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(' AND ');
    }

    sql += ` ORDER BY s.created_at DESC`;

    const result = await query(sql, values);

    res.status(200).json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
}
