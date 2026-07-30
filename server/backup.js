const fs = require('fs');
const path = require('path');
const pool = require('./db');

const BACKUP_DIR = process.env.BACKUP_DIR || '/app/backups';
const KEEP_DAYS = 14;
const INTERVAL_MS = 24 * 60 * 60 * 1000;
const TABLES = ['users', 'categories', 'clients', 'tasks'];

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

async function runBackup() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const dump = {};
  for (const table of TABLES) {
    const [rows] = await pool.query(`SELECT * FROM ${table}`);
    dump[table] = rows;
  }
  const file = path.join(BACKUP_DIR, `backup-${timestamp()}.json`);
  fs.writeFileSync(file, JSON.stringify(dump, null, 2));
  return file;
}

function pruneOldBackups() {
  if (!fs.existsSync(BACKUP_DIR)) return;
  const cutoff = Date.now() - KEEP_DAYS * 24 * 60 * 60 * 1000;
  for (const name of fs.readdirSync(BACKUP_DIR)) {
    const full = path.join(BACKUP_DIR, name);
    if (fs.statSync(full).mtimeMs < cutoff) fs.unlinkSync(full);
  }
}

function scheduleBackups() {
  const run = async () => {
    try {
      const file = await runBackup();
      pruneOldBackups();
      console.log(`Backup completed: ${file}`);
    } catch (err) {
      console.error('Backup failed:', err);
    }
  };
  run();
  setInterval(run, INTERVAL_MS);
}

module.exports = { scheduleBackups };
