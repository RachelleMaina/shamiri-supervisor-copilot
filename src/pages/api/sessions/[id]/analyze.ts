import { query } from '@/src/lib/db';
import { openai } from '@/src/lib/openai';
import type { NextApiRequest, NextApiResponse } from "next";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: "Invalid session ID" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 1️⃣ Fetch session
    const sessionResult = await query(
      "SELECT * FROM sessions WHERE id = $1",
      [id]
    );

    if (!sessionResult.rows.length) {
      return res.status(404).json({ error: "Session not found" });
    }

    const session = sessionResult.rows[0];

    // Call OpenAI for analysis
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
    You are the Shamiri Supervisor Copilot AI.
    
    Analyze the therapy session transcript using the rubric below.
    
    ========================
    PART 1: SESSION SUMMARY
    ========================
    Write exactly 3 professional sentences summarizing:
    - What was taught
    - How students engaged
    - Any notable moments
    
    ========================
    PART 2: QUALITY INDEX (3-Point Scale)
    ========================
    
    Metric 1: Content Coverage (Growth Mindset)
    1 = Missed
    2 = Partial
    3 = Complete
    
    Metric 2: Facilitation Quality
    1 = Poor
    2 = Adequate
    3 = Excellent
    
    Metric 3: Protocol Safety
    1 = Violation
    2 = Minor Drift
    3 = Adherent
    
    Compute:
    overallquality_index = average of the three scores (rounded to 2 decimals).
    
    Provide brief reasoning for each metric.
    
    ========================
    PART 3: RISK DETECTION (CRITICAL)
    ========================
    
    If the transcript contains:
    - Self-harm ideation
    - Suicide references
    - Severe emotional crisis
    
    Then:
    - status = "RISK"
    - Extract the exact concerning quote
    - Provide brief reasoning
    
    Otherwise:
    - status = "SAFE"
    - quote = null
    
    ========================
    Return ONLY valid JSON in this exact structure:
    
    {
      "summary": string,
      "quality_index": {
        "content_coverage": { "score": number, "reasoning": string },
        "facilitation_quality": { "score": number, "reasoning": string },
        "protocol_safety": { "score": number, "reasoning": string },
        "overallquality_index": number
      },
      "risk_assessment": {
        "status": "SAFE" | "RISK",
        "quote": string | null,
        "reasoning": string
      }
    }
    `
        },
        {
          role: "user",
          content: session.transcript
        }
      ]
    });
    

    const aiRaw = completion.choices[0].message.content;

    if (!aiRaw) {
      throw new Error("OpenAI returned empty response");
    }


    let ai;

    try {
      ai = JSON.parse(aiRaw);
      console.log(ai)
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      console.log("Raw string was:", aiRaw);
      throw new Error("Invalid JSON from OpenAI");
    }



    // 3️⃣ Insert AI analysis into DB
    const analysisResult = await query(
      `INSERT INTO ai_analyses
        (session_id, summary, quality_index, risk_assessment)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        id,   
        ai.summary,  
        ai.quality_index, 
        ai.risk_assessment 
      ]
    );
    

    // 4️⃣ Update session status
    const newStatus = 'ANALYZED';

    await query(
      "UPDATE sessions SET status = $1 WHERE id = $2",
      [newStatus, id]
    );
    

    return res.status(200).json({
      message: "AI analysis completed successfully",
      sessionStatus: newStatus,
      analysis: analysisResult.rows[0],
    });

  } catch (error: any) {
    console.error("AI Analysis Error:", error);

    return res.status(500).json({
      error: "AI analysis failed",
      details: error.message,
    });
  }
}
