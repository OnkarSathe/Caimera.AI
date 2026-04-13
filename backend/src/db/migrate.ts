import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';

export async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    if (!file.endsWith('.sql')) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    try {
      await pool.query(sql);
      console.log(`[DB] Migration applied: ${file}`);
    } catch (err) {
      console.error(`[DB] Migration failed: ${file}`, err);
      throw err;
    }
  }
}
