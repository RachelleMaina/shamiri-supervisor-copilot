import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/src/lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) return res.status(400).json({ error: 'Invalid ID' });

  switch (req.method) {
    case 'GET':
      try {
        const result = await query('SELECT id, name, email, role, created_at FROM users WHERE id=$1', [id]);
        if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
        res.status(200).json(result.rows[0]);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch user' });
      }
      break;

    case 'PUT':
      try {
        const { name, email, password, role } = req.body;
        const updates: string[] = [];
        const values: any[] = [];
        let idx = 1;

        if (name) { updates.push(`name=$${idx++}`); values.push(name); }
        if (email) { updates.push(`email=$${idx++}`); values.push(email); }
        if (password) { 
          const hash = await bcrypt.hash(password, 10);
          updates.push(`password_hash=$${idx++}`);
          values.push(hash);
        }
        if (role) { updates.push(`role=$${idx++}`); values.push(role); }

        if (!updates.length) return res.status(400).json({ error: 'Nothing to update' });

        values.push(id); // last parameter
        const sql = `UPDATE users SET ${updates.join(', ')} WHERE id=$${idx} RETURNING id, name, email, role, created_at`;
        const result = await query(sql, values);
        if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
        res.status(200).json(result.rows[0]);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update user' });
      }
      break;

    case 'DELETE':
      try {
        const result = await query('DELETE FROM users WHERE id=$1 RETURNING id', [id]);
        if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
        res.status(200).json({ message: 'User deleted' });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete user' });
      }
      break;

    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}
