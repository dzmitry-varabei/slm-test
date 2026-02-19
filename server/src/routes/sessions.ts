import { Router } from 'express';
import { createSession, getAllSessions, getSessionById, getSessionInteractions } from '../db/queries';

export const sessionsRouter = Router();

sessionsRouter.post('/', async (req, res) => {
  const { provider, model } = req.body;
  const session = await createSession(provider, model);
  res.status(201).json(session);
});

sessionsRouter.get('/', async (_req, res) => {
  const sessions = await getAllSessions();
  res.json(sessions);
});

sessionsRouter.get('/:id', async (req, res) => {
  const session = await getSessionById(Number(req.params.id));
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  const interactions = await getSessionInteractions(session.id);
  res.json({ ...session, interactions });
});
