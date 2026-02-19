import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { config } from '../config';
import { initDb, getDb, saveDb } from './connection';

async function seed(): Promise<void> {
  await initDb();
  const db = await getDb();

  const csvPath = path.join(config.dataPath, 'flashcards.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');

  const records: string[][] = parse(csvContent, {
    columns: false,
    skip_empty_lines: true,
    relax_column_count: true,
  });

  const result = db.exec('SELECT COUNT(*) as count FROM flashcards');
  const count = result[0]?.values[0]?.[0] as number;
  if (count > 0) {
    console.log(`Flashcards table already has ${count} records. Skipping seed.`);
    return;
  }

  for (const row of records) {
    db.run('INSERT INTO flashcards (question, answer) VALUES (?, ?)', [row[0], row[1]]);
  }

  saveDb();
  console.log(`Seeded ${records.length} flashcards into database.`);
}

seed().catch(console.error);
