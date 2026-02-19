import express from 'express';
import cors from 'cors';
import { config } from './config';
import { initDb } from './db/connection';
import { flashcardsRouter } from './routes/flashcards';
import { sessionsRouter } from './routes/sessions';
import { quizRouter } from './routes/quiz';
import { logsRouter } from './routes/logs';
import { settingsRouter } from './routes/settings';

async function main() {
  await initDb();

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api/flashcards', flashcardsRouter);
  app.use('/api/sessions', sessionsRouter);
  app.use('/api/quiz', quizRouter);
  app.use('/api/logs', logsRouter);
  app.use('/api/settings', settingsRouter);

  app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
  });
}

main().catch(console.error);
