import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/src/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const result = await query(
          `SELECT s.*, u.name AS fellow_name
           FROM sessions s
           JOIN users u ON s.fellow_id = u.id
           WHERE s.id = $1`,
          [id]
        );

        if (!result.rows.length) {
          return res.status(404).json({ error: 'Session not found' });
        }

        res.status(200).json(result.rows[0]);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch session' });
      }
      break;

    case 'PUT':
      try {
        const { assigned_concept, transcript, status } = req.body;

        const result = await query(
          `UPDATE sessions
           SET assigned_concept = COALESCE($1, assigned_concept),
               transcript = COALESCE($2, transcript),
               status = COALESCE($3, status)
           WHERE id = $4
           RETURNING *`,
          [assigned_concept, transcript, status, id]
        );

        if (!result.rows.length) {
          return res.status(404).json({ error: 'Session not found' });
        }

        res.status(200).json(result.rows[0]);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update session' });
      }
      break;

    case 'DELETE':
      try {
        const result = await query(
          'DELETE FROM sessions WHERE id = $1 RETURNING id',
          [id]
        );

        if (!result.rows.length) {
          return res.status(404).json({ error: 'Session not found' });
        }

        res.status(200).json({ message: 'Session deleted' });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete session' });
      }
      break;

    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}
