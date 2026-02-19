import { Router } from 'express';
import { getAllFlashcards, getRandomFlashcard, getFlashcardById } from '../db/queries';

export const flashcardsRouter = Router();

flashcardsRouter.get('/', async (_req, res) => {
  const flashcards = await getAllFlashcards();
  res.json(flashcards);
});

flashcardsRouter.get('/random', async (_req, res) => {
  const flashcard = await getRandomFlashcard();
  if (!flashcard) {
    return res.status(404).json({ error: 'No flashcards found. Run npm run seed first.' });
  }
  res.json(flashcard);
});

flashcardsRouter.get('/:id', async (req, res) => {
  const flashcard = await getFlashcardById(Number(req.params.id));
  if (!flashcard) {
    return res.status(404).json({ error: 'Flashcard not found' });
  }
  res.json(flashcard);
});
