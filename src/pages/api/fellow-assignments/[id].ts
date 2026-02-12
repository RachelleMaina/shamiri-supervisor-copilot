import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/src/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await query(
      'DELETE FROM supervisor_fellows WHERE id = $1 RETURNING id',
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.status(200).json({ message: 'Assignment removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
}
