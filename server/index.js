require('dotenv').config();
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const pool = require('./db');
const { requireAuth, signToken } = require('./auth');
const { scheduleBackups } = require('./backup');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

function asyncHandler(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

function mapCategoryRow(row) {
  return { id: row.id, name: row.name, color: row.color };
}

function mapUserRow(row) {
  return { id: row.id, email: row.email, name: row.name, avatar: row.avatar };
}

function mapClientRow(row) {
  return { id: row.id, name: row.name };
}

function mapTaskRow(row) {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes ?? undefined,
    categoryIds: typeof row.category_ids === 'string' ? JSON.parse(row.category_ids) : row.category_ids,
    clientIds: typeof row.client_ids === 'string' ? JSON.parse(row.client_ids) : (row.client_ids ?? []),
    dueDate: row.due_date,
    dueTime: row.due_time ?? undefined,
    dueTimeLabel: row.due_time_label ?? undefined,
    recurrence: row.recurrence,
    completed: !!row.completed,
    pinned: !!row.pinned,
    attachments: typeof row.attachments === 'string' ? JSON.parse(row.attachments) : row.attachments,
    createdAt: typeof row.created_at === 'string' ? row.created_at.slice(0, 10) : row.created_at,
  };
}

// --- Auth ---

app.post(
  '/auth/signup',
  asyncHandler(async (req, res) => {
    const { email, password, signupCode } = req.body || {};
    if (!email || !password || password.length < 6) {
      return res.status(400).json({ error: 'invalid_input' });
    }
    if (process.env.SIGNUP_CODE && signupCode !== process.env.SIGNUP_CODE) {
      return res.status(403).json({ error: 'invalid_signup_code' });
    }
    const normalizedEmail = String(email).trim().toLowerCase();

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'email_taken' });
    }

    const id = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)', [
      id,
      normalizedEmail,
      passwordHash,
    ]);

    res.json({ token: signToken(id), userId: id });
  }),
);

app.post(
  '/auth/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'invalid_input' });
    const normalizedEmail = String(email).trim().toLowerCase();

    const [rows] = await pool.query('SELECT id, password_hash FROM users WHERE email = ?', [normalizedEmail]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'invalid_credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' });

    res.json({ token: signToken(user.id), userId: user.id });
  }),
);

// --- Profile ---

app.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query('SELECT id, email, name, avatar FROM users WHERE id = ?', [req.userId]);
    if (rows.length === 0) return res.status(404).json({ error: 'not_found' });
    res.json(mapUserRow(rows[0]));
  }),
);

app.put(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { name, avatar } = req.body || {};
    const fields = [];
    const values = [];
    if (name !== undefined) {
      fields.push('name = ?');
      values.push(name);
    }
    if (avatar !== undefined) {
      fields.push('avatar = ?');
      values.push(avatar);
    }
    if (fields.length > 0) {
      values.push(req.userId);
      await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    }
    const [rows] = await pool.query('SELECT id, email, name, avatar FROM users WHERE id = ?', [req.userId]);
    res.json(mapUserRow(rows[0]));
  }),
);

app.put(
  '/me/email',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { newEmail, currentPassword } = req.body || {};
    if (!newEmail || !currentPassword) return res.status(400).json({ error: 'invalid_input' });
    const normalizedEmail = String(newEmail).trim().toLowerCase();

    const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [req.userId]);
    const ok = rows.length > 0 && (await bcrypt.compare(currentPassword, rows[0].password_hash));
    if (!ok) return res.status(401).json({ error: 'incorrect_password' });

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [
      normalizedEmail,
      req.userId,
    ]);
    if (existing.length > 0) return res.status(409).json({ error: 'email_taken' });

    await pool.query('UPDATE users SET email = ? WHERE id = ?', [normalizedEmail, req.userId]);
    const [updated] = await pool.query('SELECT id, email, name, avatar FROM users WHERE id = ?', [req.userId]);
    res.json(mapUserRow(updated[0]));
  }),
);

app.put(
  '/me/password',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'invalid_input' });
    }

    const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [req.userId]);
    const ok = rows.length > 0 && (await bcrypt.compare(currentPassword, rows[0].password_hash));
    if (!ok) return res.status(401).json({ error: 'incorrect_password' });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, req.userId]);
    res.json({ ok: true });
  }),
);

app.delete(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { password } = req.body || {};
    if (!password) return res.status(400).json({ error: 'invalid_input' });

    const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [req.userId]);
    const ok = rows.length > 0 && (await bcrypt.compare(password, rows[0].password_hash));
    if (!ok) return res.status(401).json({ error: 'incorrect_password' });

    // categories, clients and tasks are all removed automatically via
    // ON DELETE CASCADE on their user_id foreign key.
    await pool.query('DELETE FROM users WHERE id = ?', [req.userId]);
    res.json({ ok: true });
  }),
);

// --- Initial load ---

app.get(
  '/sync',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { userId } = req;
    const [categories] = await pool.query(
      'SELECT * FROM categories WHERE user_id = ? ORDER BY position ASC, created_at ASC',
      [userId],
    );
    const [clients] = await pool.query('SELECT * FROM clients WHERE user_id = ?', [userId]);
    const [tasks] = await pool.query('SELECT * FROM tasks WHERE user_id = ?', [userId]);

    res.json({
      categories: categories.map(mapCategoryRow),
      clients: clients.map(mapClientRow),
      tasks: tasks.map(mapTaskRow),
    });
  }),
);

// --- Categories ---

app.post(
  '/categories',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { id: clientProvidedId, name, color } = req.body || {};
    if (!name || !color) return res.status(400).json({ error: 'invalid_input' });
    const id = clientProvidedId || crypto.randomUUID();
    // MySQL rejects a subquery that reads from the same table an INSERT
    // targets ("You can't specify target table ... for update in FROM
    // clause"), so the next position has to be resolved as a separate query.
    const [[{ nextPosition }]] = await pool.query(
      'SELECT COALESCE(MAX(position), -1) + 1 AS nextPosition FROM categories WHERE user_id = ?',
      [req.userId],
    );
    await pool.query('INSERT INTO categories (id, user_id, name, color, position) VALUES (?, ?, ?, ?, ?)', [
      id,
      req.userId,
      name,
      color,
      nextPosition,
    ]);
    res.json({ id, name, color });
  }),
);

app.put(
  '/categories/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { name, color, position } = req.body || {};
    await pool.query(
      'UPDATE categories SET name = COALESCE(?, name), color = COALESCE(?, color), position = COALESCE(?, position) WHERE id = ? AND user_id = ?',
      [name ?? null, color ?? null, position ?? null, req.params.id, req.userId],
    );
    res.json({ ok: true });
  }),
);

app.delete(
  '/categories/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await pool.query('DELETE FROM categories WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    res.json({ ok: true });
  }),
);

// --- Clients ---

app.post(
  '/clients',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { id: clientProvidedId, name } = req.body || {};
    if (!name) return res.status(400).json({ error: 'invalid_input' });
    const id = clientProvidedId || crypto.randomUUID();
    await pool.query('INSERT INTO clients (id, user_id, name) VALUES (?, ?, ?)', [id, req.userId, name]);
    res.json({ id, name });
  }),
);

app.put(
  '/clients/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { name } = req.body || {};
    await pool.query('UPDATE clients SET name = ? WHERE id = ? AND user_id = ?', [name, req.params.id, req.userId]);
    res.json({ ok: true });
  }),
);

app.delete(
  '/clients/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await pool.query('DELETE FROM clients WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    res.json({ ok: true });
  }),
);

// --- Tasks ---

app.post(
  '/tasks',
  requireAuth,
  asyncHandler(async (req, res) => {
    const t = req.body || {};
    const id = t.id || crypto.randomUUID();
    await pool.query(
      `INSERT INTO tasks (id, user_id, title, notes, category_ids, client_ids, due_date, due_time, due_time_label, recurrence, completed, pinned, attachments)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        req.userId,
        t.title,
        t.notes ?? null,
        JSON.stringify(t.categoryIds ?? []),
        JSON.stringify(t.clientIds ?? []),
        t.dueDate,
        t.dueTime || null,
        t.dueTimeLabel || null,
        t.recurrence ?? 'none',
        !!t.completed,
        !!t.pinned,
        JSON.stringify(t.attachments ?? []),
      ],
    );
    res.json({ id });
  }),
);

app.put(
  '/tasks/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const t = req.body || {};
    const fields = [];
    const values = [];

    const setIfDefined = (column, value, transform = (v) => v) => {
      if (value !== undefined) {
        fields.push(`${column} = ?`);
        values.push(transform(value));
      }
    };

    setIfDefined('title', t.title);
    setIfDefined('notes', t.notes);
    setIfDefined('category_ids', t.categoryIds, JSON.stringify);
    setIfDefined('client_ids', t.clientIds, JSON.stringify);
    setIfDefined('due_date', t.dueDate);
    setIfDefined('due_time', t.dueTime, (v) => v || null);
    setIfDefined('due_time_label', t.dueTimeLabel, (v) => v || null);
    setIfDefined('recurrence', t.recurrence);
    setIfDefined('completed', t.completed, (v) => !!v);
    setIfDefined('pinned', t.pinned, (v) => !!v);
    setIfDefined('attachments', t.attachments, JSON.stringify);

    if (fields.length === 0) return res.json({ ok: true });

    values.push(req.params.id, req.userId);
    await pool.query(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`, values);
    res.json({ ok: true });
  }),
);

app.delete(
  '/tasks/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await pool.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    res.json({ ok: true });
  }),
);

// --- One-time migration of data that was only stored in the browser's localStorage ---

app.post(
  '/migrate',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { categories = [], clients = [], tasks = [] } = req.body || {};
    const { userId } = req;

    const categoryIdMap = new Map();
    for (const [index, category] of categories.entries()) {
      const id = crypto.randomUUID();
      categoryIdMap.set(category.id, id);
      await pool.query('INSERT INTO categories (id, user_id, name, color, position) VALUES (?, ?, ?, ?, ?)', [
        id,
        userId,
        category.name,
        category.color,
        index,
      ]);
    }

    const clientIdMap = new Map();
    for (const client of clients) {
      const id = crypto.randomUUID();
      clientIdMap.set(client.id, id);
      await pool.query('INSERT INTO clients (id, user_id, name) VALUES (?, ?, ?)', [id, userId, client.name]);
    }

    for (const task of tasks) {
      const id = crypto.randomUUID();
      const remappedCategoryIds = (task.categoryIds ?? []).map((cid) => categoryIdMap.get(cid)).filter(Boolean);
      const remappedClientIds = (task.clientIds ?? []).map((cid) => clientIdMap.get(cid)).filter(Boolean);

      await pool.query(
        `INSERT INTO tasks (id, user_id, title, notes, category_ids, client_ids, due_date, due_time, due_time_label, recurrence, completed, pinned, attachments)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          userId,
          task.title,
          task.notes ?? null,
          JSON.stringify(remappedCategoryIds),
          JSON.stringify(remappedClientIds),
          task.dueDate,
          task.dueTime || null,
          task.dueTimeLabel || null,
          task.recurrence ?? 'none',
          !!task.completed,
          !!task.pinned,
          JSON.stringify(task.attachments ?? []),
        ],
      );
    }

    const [dbCategories] = await pool.query(
      'SELECT * FROM categories WHERE user_id = ? ORDER BY position ASC, created_at ASC',
      [userId],
    );
    const [dbClients] = await pool.query('SELECT * FROM clients WHERE user_id = ?', [userId]);
    const [dbTasks] = await pool.query('SELECT * FROM tasks WHERE user_id = ?', [userId]);

    res.json({
      categories: dbCategories.map(mapCategoryRow),
      clients: dbClients.map(mapClientRow),
      tasks: dbTasks.map(mapTaskRow),
    });
  }),
);

app.get('/health', (req, res) => res.json({ ok: true }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'internal_error' });
});

async function columnExists(table, column) {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?',
    [table, column],
  );
  return rows[0].cnt > 0;
}

async function ensureColumn(table, column, definition) {
  if (!(await columnExists(table, column))) {
    await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

async function runMigrations() {
  await ensureColumn('users', 'name', 'VARCHAR(255)');
  await ensureColumn('users', 'avatar', 'MEDIUMTEXT');
  await ensureColumn('categories', 'position', 'INT NOT NULL DEFAULT 0');
  await ensureColumn('tasks', 'due_time', 'VARCHAR(5)');
  await ensureColumn('tasks', 'due_time_label', 'VARCHAR(255)');

  const hadClientIds = await columnExists('tasks', 'client_ids');
  await ensureColumn('tasks', 'client_ids', 'JSON');
  if (!hadClientIds) {
    // Backfill from the old single-client column (if present) into the new array column.
    if (await columnExists('tasks', 'client_id')) {
      await pool.query(
        'UPDATE tasks SET client_ids = IF(client_id IS NULL, JSON_ARRAY(), JSON_ARRAY(client_id)) WHERE client_ids IS NULL',
      );
    } else {
      await pool.query('UPDATE tasks SET client_ids = JSON_ARRAY() WHERE client_ids IS NULL');
    }
  }
}

const port = process.env.PORT || 3001;
runMigrations()
  .catch((err) => console.error('Migration failed:', err))
  .finally(() => {
    app.listen(port, () => console.log(`API listening on port ${port}`));
    scheduleBackups();
  });
