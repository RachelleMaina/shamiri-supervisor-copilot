import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/src/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await query(`
      SELECT 
        sf.id,
        sf.supervisor_id,
        sup.name AS supervisor_name,
        sf.fellow_id,
        fel.name AS fellow_name
      FROM supervisor_fellows sf
      JOIN users sup ON sf.supervisor_id = sup.id
      JOIN users fel ON sf.fellow_id = fel.id
      ORDER BY sf.id ASC
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
}
