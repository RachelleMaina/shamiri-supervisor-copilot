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
          `
          SELECT 
            s.*,
            u.name AS fellow_name,
            a.summary AS ai_summary,
            a.quality_index AS ai_quality_index,
            a.risk_assessment AS ai_risk_assessment,
            r.action AS review_action,
            r.updated_quality_index AS review_quality_index,
            r.notes AS review_notes,
            r.created_at AS review_created_at
          FROM sessions s
          JOIN users u ON s.fellow_id = u.id
          LEFT JOIN ai_analyses a ON a.session_id = s.id
          LEFT JOIN supervisor_reviews r ON r.session_id = s.id
          WHERE s.id = $1
          `,
          [id]
        );

        if (!result.rows.length) {
          return res.status(404).json({ error: 'Session not found' });
        }

        const row = result.rows[0];

        // Map ai_analysis to frontend expected structure
        let ai_analysis = undefined;
        if (row.ai_summary) {
 
          const riskFlag = row.ai_risk_assessment?.status;
          const q = row.ai_quality_index || {};
          ai_analysis = {
            risk_flag: riskFlag,
            overall_quality: q.overallquality_index || 0,
            content_coverage: q.content_coverage || { score: 0, rating: "N/A" },
            facilitation_quality: q.facilitation_quality || { score: 0, rating: "N/A" },
            protocol_safety: q.protocol_safety || { score: 0, rating: "N/A" },
            summary: row.ai_summary,
            risk_quote: row.ai_risk_assessment?.quote || undefined,
          };
        }

        const session = {
          id: row.id,
          fellow_id: row.fellow_id,
          fellow_name: row.fellow_name,
          session_date: row.session_date,
          group_id: row.group_id,
          assigned_concept: row.assigned_concept,
          transcript: row.transcript,
          status: row.status,
          created_at: row.created_at,
          ai_analysis,
          supervisor_review: row.review_action
            ? {
                action: row.review_action,
                updated_quality_index: row.review_quality_index,
                notes: row.review_notes,
                created_at: row.review_created_at,
              }
            : null,
        };

        res.status(200).json(session);
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
