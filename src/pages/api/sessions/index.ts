import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/src/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { supervisor_id, fellow_id } = req.query;

  try {
    let sql = `
      SELECT s.*, u.name AS fellow_name
      FROM sessions s
      JOIN users u ON s.fellow_id = u.id
    `;
    const values: any[] = [];

    if (supervisor_id) {
      sql += `
        JOIN supervisor_fellows sf ON s.fellow_id = sf.fellow_id
        WHERE sf.supervisor_id = $1
      `;
      values.push(supervisor_id);
    } else if (fellow_id) {
      sql += ` WHERE s.fellow_id = $1`;
      values.push(fellow_id);
    }

    sql += ` ORDER BY s.created_at DESC`;

    const result = await query(sql, values);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
}
