import { Router } from 'express';
import { getAllInteractionsWithDetails } from '../db/queries';

export const logsRouter = Router();

logsRouter.get('/export', async (req, res) => {
  const format = req.query.format || 'json';
  const interactions = await getAllInteractionsWithDetails();

  if (format === 'csv') {
    const header = 'id,session_id,question,reference_answer,user_answer,verdict,comment,provider,model,latency_ms,created_at';
    const rows = interactions.map(i =>
      [i.id, i.session_id, `"${i.question}"`, `"${i.reference_answer}"`, `"${i.user_answer}"`, i.slm_verdict, `"${i.slm_comment}"`, i.provider, i.model, i.latency_ms, i.created_at].join(',')
    );
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=ai-trainer-logs.csv');
    res.send([header, ...rows].join('\n'));
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=ai-trainer-logs.json');
    res.json(interactions);
  }
});
