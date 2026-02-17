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

  if (!supervisor_id || !decision || !['VALIDATE', 'REJECT'].includes(decision)) {
    return res.status(400).json({ error: 'Missing or invalid required fields' });
  }

  try {
    // Validate supervisor role
    const supervisorRes = await query('SELECT role FROM users WHERE id = $1', [supervisor_id]);
    if (!supervisorRes.rows.length || supervisorRes.rows[0].role !== 'supervisor') {
      return res.status(403).json({ error: 'User is not a supervisor' });
    }

    // Fetch current AI analysis
    const aiRes = await query('SELECT * FROM ai_analyses WHERE session_id = $1', [id]);
    if (!aiRes.rows.length) {
      return res.status(404).json({ error: 'AI analysis not found for this session' });
    }
    const aiAnalysis = aiRes.rows[0];

    // Determine new risk assessment & session status

  
    const originalStatus: 'SAFE' | 'RISK' = aiAnalysis.risk_assessment?.status;

    let newRiskStatus: 'SAFE' | 'RISK' = originalStatus;

    if (decision === 'VALIDATE') {
      // Keep AI's original decision
      newRiskStatus = originalStatus;
    } else if (decision === 'REJECT') {
      // Flip AI's original decision
      newRiskStatus = originalStatus === 'SAFE' ? 'RISK' : 'SAFE';
    }

    let sessionStatus = 'REVIEWED';

    if (newRiskStatus === 'RISK') {
      sessionStatus = 'ESCALATED';

      // Create escalation
      await query(
        `INSERT INTO escalations (session_id, expert_id, triggered_by, reason, status)
         VALUES ($1, NULL, 'SUPERVISOR', 'Supervisor marked as RISK', 'PENDING')`,
        [id]
      );
    }

    const newRiskAssessment = {
      ...aiAnalysis.risk_assessment,
      status: newRiskStatus,
    };

    // Insert supervisor review
    const reviewResult = await query(
      `INSERT INTO supervisor_reviews
       (session_id, supervisor_id, action, updated_quality_index, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        id,
        supervisor_id,
        decision,
        aiAnalysis.quality_index,
        comments || null
      ]
    );

    // Update AI analysis
    await query(
      `UPDATE ai_analyses
       SET risk_assessment = $1
       WHERE session_id = $2`,
      [newRiskAssessment, id]
    );

    // Update session status
    await query(
      `UPDATE sessions
       SET status = $1
       WHERE id = $2`,
      [sessionStatus, id]
    );

    // Return updated session
    const sessionResult = await query(`SELECT * FROM sessions WHERE id = $1`, [id]);

    res.status(200).json({
      message: 'Supervisor review submitted',
      sessionStatus,
      ai_analysis: { ...aiAnalysis, risk_assessment: newRiskAssessment },
      review: reviewResult.rows[0],
      session: sessionResult.rows[0],
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit review' });
  }
}
