import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInitialDatabase } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../data/db.json');

async function ensureDatabase() {
  try {
    await fs.access(dbPath);
  } catch {
    await fs.mkdir(path.dirname(dbPath), { recursive: true });
    const initialDb = createInitialDatabase();
    await fs.writeFile(dbPath, JSON.stringify(initialDb, null, 2), 'utf8');
  }
}

export async function readDb() {
  await ensureDatabase();
  const raw = await fs.readFile(dbPath, 'utf8');
  return JSON.parse(raw);
}

export async function writeDb(db) {
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf8');
}

export async function withDb(mutator) {
  const db = await readDb();
  const result = await mutator(db);
  await writeDb(db);
  return result;
}
