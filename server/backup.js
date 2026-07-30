const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = process.env.BACKUP_DIR || '/app/backups';
const KEEP_DAYS = 14;
const INTERVAL_MS = 24 * 60 * 60 * 1000;

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

function runBackup() {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const file = path.join(BACKUP_DIR, `backup-${timestamp()}.sql`);
    const args = [
      '-h',
      process.env.DB_HOST,
      '-P',
      process.env.DB_PORT || '3306',
      '-u',
      process.env.DB_USER,
      '--single-transaction',
      '--routines',
      process.env.DB_NAME,
    ];

    execFile(
      'mysqldump',
      args,
      { env: { ...process.env, MYSQL_PWD: process.env.DB_PASSWORD }, maxBuffer: 1024 * 1024 * 200 },
      (err, stdout) => {
        if (err) return reject(err);
        fs.writeFileSync(file, stdout);
        resolve(file);
      },
    );
  });
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
