import { Database } from 'sql.js';

export function createSchema(db: Database): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS flashcards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      source TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      started_at TEXT DEFAULT (datetime('now')),
      finished_at TEXT,
      provider TEXT,
      model TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS interactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL REFERENCES sessions(id),
      flashcard_id INTEGER NOT NULL REFERENCES flashcards(id),
      user_answer TEXT NOT NULL,
      slm_verdict TEXT,
      slm_comment TEXT,
      slm_raw_response TEXT,
      provider TEXT,
      model TEXT,
      prompt_tokens INTEGER,
      completion_tokens INTEGER,
      latency_ms INTEGER,
      claude_verdict TEXT,
      claude_comment TEXT,
      claude_explanation TEXT,
      claude_raw_response TEXT,
      claude_latency_ms INTEGER,
      teacher_override TEXT,
      prompt_sent TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS flashcard_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      flashcard_id INTEGER NOT NULL REFERENCES flashcards(id),
      answer TEXT NOT NULL,
      label TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS prompt_examples (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      reference_answer TEXT NOT NULL,
      user_answer TEXT NOT NULL,
      expected_verdict TEXT NOT NULL,
      reason TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS provider_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      provider TEXT NOT NULL DEFAULT 'groq',
      model TEXT NOT NULL DEFAULT 'llama-3.1-8b-instant',
      base_url TEXT NOT NULL DEFAULT 'https://api.groq.com/openai/v1'
    )
  `);

  const row = db.exec('SELECT COUNT(*) as count FROM provider_config');
  const count = row[0]?.values[0]?.[0] as number;
  if (count === 0) {
    db.run(
      "INSERT INTO provider_config (id, provider, model, base_url) VALUES (1, 'groq', 'llama-3.1-8b-instant', 'https://api.groq.com/openai/v1')"
    );
  }
}
