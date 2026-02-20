import { getDb, saveDb } from './connection';

export interface Flashcard {
  id: number;
  question: string;
  answer: string;
  source: string;
  created_at: string;
}

export interface Session {
  id: number;
  started_at: string;
  finished_at: string | null;
  provider: string | null;
  model: string | null;
}

export interface Interaction {
  id: number;
  session_id: number;
  flashcard_id: number;
  user_answer: string;
  slm_verdict: string | null;
  slm_comment: string | null;
  slm_raw_response: string | null;
  provider: string | null;
  model: string | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  latency_ms: number | null;
  claude_verdict: string | null;
  claude_comment: string | null;
  claude_explanation: string | null;
  claude_raw_response: string | null;
  claude_latency_ms: number | null;
  teacher_override: string | null;
  prompt_sent: string | null;
  created_at: string;
}

export interface PromptExample {
  id: number;
  question: string;
  reference_answer: string;
  user_answer: string;
  expected_verdict: string;
  reason: string | null;
  active: number;
  created_at: string;
}

export interface FlashcardAnswer {
  id: number;
  flashcard_id: number;
  answer: string;
  label: string;
  created_at: string;
}

export interface ProviderConfig {
  provider: string;
  model: string;
  base_url: string;
}

// Helper to convert sql.js result rows to objects
function rowsToObjects<T>(result: ReturnType<Awaited<ReturnType<typeof getDb>>['exec']>): T[] {
  if (!result.length || !result[0]) return [];
  const { columns, values } = result[0];
  return values.map((row) => {
    const obj: any = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj as T;
  });
}

function firstRow<T>(result: ReturnType<Awaited<ReturnType<typeof getDb>>['exec']>): T | undefined {
  const rows = rowsToObjects<T>(result);
  return rows[0];
}

// Flashcards
export async function getAllFlashcards(): Promise<Flashcard[]> {
  const db = await getDb();
  return rowsToObjects<Flashcard>(db.exec('SELECT id, question, source, created_at FROM flashcards'));
}

export async function getFlashcardById(id: number): Promise<Flashcard | undefined> {
  const db = await getDb();
  const stmt = db.prepare('SELECT * FROM flashcards WHERE id = ?');
  stmt.bind([id]);
  const rows: Flashcard[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as unknown as Flashcard);
  }
  stmt.free();
  return rows[0];
}

export async function getRandomFlashcard(): Promise<Flashcard | undefined> {
  const db = await getDb();
  return firstRow<Flashcard>(db.exec('SELECT id, question, source, created_at FROM flashcards ORDER BY RANDOM() LIMIT 1'));
}

export async function getFlashcardWithAnswer(id: number): Promise<Flashcard | undefined> {
  return getFlashcardById(id);
}

// Sessions
export async function createSession(provider?: string, model?: string): Promise<Session> {
  const db = await getDb();
  db.run('INSERT INTO sessions (provider, model) VALUES (?, ?)', [provider || null, model || null]);
  const id = db.exec('SELECT last_insert_rowid() as id')[0]?.values[0]?.[0] as number;
  saveDb();
  return firstRow<Session>(db.exec(`SELECT * FROM sessions WHERE id = ${id}`))!;
}

export async function getAllSessions(): Promise<Session[]> {
  const db = await getDb();
  return rowsToObjects<Session>(db.exec('SELECT * FROM sessions ORDER BY started_at DESC'));
}

export async function getSessionById(id: number): Promise<Session | undefined> {
  const db = await getDb();
  const stmt = db.prepare('SELECT * FROM sessions WHERE id = ?');
  stmt.bind([id]);
  const rows: Session[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as unknown as Session);
  }
  stmt.free();
  return rows[0];
}

export async function getSessionInteractions(sessionId: number): Promise<Interaction[]> {
  const db = await getDb();
  const stmt = db.prepare('SELECT * FROM interactions WHERE session_id = ? ORDER BY created_at ASC');
  stmt.bind([sessionId]);
  const rows: Interaction[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as unknown as Interaction);
  }
  stmt.free();
  return rows;
}

// Interactions
export async function createInteraction(data: {
  session_id: number;
  flashcard_id: number;
  user_answer: string;
  slm_verdict?: string;
  slm_comment?: string;
  slm_raw_response?: string;
  provider?: string;
  model?: string;
  prompt_tokens?: number;
  completion_tokens?: number;
  latency_ms?: number;
  claude_verdict?: string;
  claude_comment?: string;
  claude_explanation?: string;
  claude_raw_response?: string;
  claude_latency_ms?: number;
  prompt_sent?: string;
}): Promise<Interaction> {
  const db = await getDb();
  db.run(
    `INSERT INTO interactions (session_id, flashcard_id, user_answer, slm_verdict, slm_comment, slm_raw_response, provider, model, prompt_tokens, completion_tokens, latency_ms, claude_verdict, claude_comment, claude_explanation, claude_raw_response, claude_latency_ms, prompt_sent)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.session_id,
      data.flashcard_id,
      data.user_answer,
      data.slm_verdict || null,
      data.slm_comment || null,
      data.slm_raw_response || null,
      data.provider || null,
      data.model || null,
      data.prompt_tokens || null,
      data.completion_tokens || null,
      data.latency_ms || null,
      data.claude_verdict || null,
      data.claude_comment || null,
      data.claude_explanation || null,
      data.claude_raw_response || null,
      data.claude_latency_ms || null,
      data.prompt_sent || null,
    ]
  );
  const id = db.exec('SELECT last_insert_rowid() as id')[0]?.values[0]?.[0] as number;
  saveDb();

  const stmt = db.prepare('SELECT * FROM interactions WHERE id = ?');
  stmt.bind([id]);
  const rows: Interaction[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as unknown as Interaction);
  }
  stmt.free();
  return rows[0]!;
}

export async function updateTeacherOverride(interactionId: number, verdict: string): Promise<void> {
  const db = await getDb();
  db.run('UPDATE interactions SET teacher_override = ? WHERE id = ?', [verdict, interactionId]);
  saveDb();
}

export async function getInteractionById(id: number): Promise<Interaction | undefined> {
  const db = await getDb();
  const stmt = db.prepare('SELECT * FROM interactions WHERE id = ?');
  stmt.bind([id]);
  const rows: Interaction[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as unknown as Interaction);
  }
  stmt.free();
  return rows[0];
}

// Prompt Examples
export async function createPromptExample(data: {
  question: string;
  reference_answer: string;
  user_answer: string;
  expected_verdict: string;
  reason?: string;
}): Promise<PromptExample> {
  const db = await getDb();
  db.run(
    `INSERT INTO prompt_examples (question, reference_answer, user_answer, expected_verdict, reason)
     VALUES (?, ?, ?, ?, ?)`,
    [data.question, data.reference_answer, data.user_answer, data.expected_verdict, data.reason || null]
  );
  const id = db.exec('SELECT last_insert_rowid() as id')[0]?.values[0]?.[0] as number;
  saveDb();
  return firstRow<PromptExample>(db.exec(`SELECT * FROM prompt_examples WHERE id = ${id}`))!;
}

const MAX_FEW_SHOT_EXAMPLES = 10;

export async function getActivePromptExamples(): Promise<PromptExample[]> {
  const db = await getDb();
  return rowsToObjects<PromptExample>(
    db.exec(`SELECT * FROM prompt_examples WHERE active = 1 ORDER BY created_at DESC LIMIT ${MAX_FEW_SHOT_EXAMPLES}`)
  );
}

export async function getActivePromptExamplesCount(): Promise<number> {
  const db = await getDb();
  const result = db.exec('SELECT COUNT(*) as count FROM prompt_examples WHERE active = 1');
  return (result[0]?.values[0]?.[0] as number) || 0;
}

// Alternative answers
export async function getFlashcardAnswers(flashcardId: number): Promise<FlashcardAnswer[]> {
  const db = await getDb();
  const stmt = db.prepare('SELECT * FROM flashcard_answers WHERE flashcard_id = ? ORDER BY id ASC');
  stmt.bind([flashcardId]);
  const rows: FlashcardAnswer[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as unknown as FlashcardAnswer);
  }
  stmt.free();
  return rows;
}

export async function addFlashcardAnswer(flashcardId: number, answer: string, label: string = ''): Promise<FlashcardAnswer> {
  const db = await getDb();
  db.run(
    'INSERT INTO flashcard_answers (flashcard_id, answer, label) VALUES (?, ?, ?)',
    [flashcardId, answer, label]
  );
  const id = db.exec('SELECT last_insert_rowid() as id')[0]?.values[0]?.[0] as number;
  saveDb();
  return firstRow<FlashcardAnswer>(db.exec(`SELECT * FROM flashcard_answers WHERE id = ${id}`))!;
}

export async function getAllAnswersForFlashcard(flashcardId: number): Promise<string[]> {
  const flashcard = await getFlashcardById(flashcardId);
  if (!flashcard) return [];
  const altAnswers = await getFlashcardAnswers(flashcardId);
  return [flashcard.answer, ...altAnswers.map(a => a.answer)];
}

// Provider Config
export async function getProviderConfig(): Promise<ProviderConfig> {
  const db = await getDb();
  return firstRow<ProviderConfig>(db.exec('SELECT provider, model, base_url FROM provider_config WHERE id = 1'))!;
}

export async function updateProviderConfig(data: { provider: string; model: string; base_url: string }): Promise<void> {
  const db = await getDb();
  db.run('UPDATE provider_config SET provider = ?, model = ?, base_url = ? WHERE id = 1', [data.provider, data.model, data.base_url]);
  saveDb();
}

// Logs export
export async function getAllInteractionsWithDetails(): Promise<(Interaction & { question: string; reference_answer: string })[]> {
  const db = await getDb();
  return rowsToObjects<Interaction & { question: string; reference_answer: string }>(
    db.exec(`
      SELECT i.*, f.question, f.answer as reference_answer
      FROM interactions i
      JOIN flashcards f ON i.flashcard_id = f.id
      ORDER BY i.created_at DESC
    `)
  );
}
