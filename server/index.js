require('dotenv').config();
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const pool = require('./db');
const { requireAuth, signToken } = require('./auth');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

function asyncHandler(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

function mapCategoryRow(row) {
  return { id: row.id, name: row.name, color: row.color };
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
    clientId: row.client_id,
    dueDate: row.due_date,
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
    const { email, password } = req.body || {};
    if (!email || !password || password.length < 6) {
      return res.status(400).json({ error: 'invalid_input' });
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

// --- Initial load ---

app.get(
  '/sync',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { userId } = req;
    const [categories] = await pool.query('SELECT * FROM categories WHERE user_id = ?', [userId]);
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
    await pool.query('INSERT INTO categories (id, user_id, name, color) VALUES (?, ?, ?, ?)', [
      id,
      req.userId,
      name,
      color,
    ]);
    res.json({ id, name, color });
  }),
);

app.put(
  '/categories/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { name, color } = req.body || {};
    await pool.query(
      'UPDATE categories SET name = COALESCE(?, name), color = COALESCE(?, color) WHERE id = ? AND user_id = ?',
      [name ?? null, color ?? null, req.params.id, req.userId],
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
      `INSERT INTO tasks (id, user_id, title, notes, category_ids, client_id, due_date, recurrence, completed, pinned, attachments)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        req.userId,
        t.title,
        t.notes ?? null,
        JSON.stringify(t.categoryIds ?? []),
        t.clientId ?? null,
        t.dueDate,
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
    setIfDefined('client_id', t.clientId);
    setIfDefined('due_date', t.dueDate);
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
    for (const category of categories) {
      const id = crypto.randomUUID();
      categoryIdMap.set(category.id, id);
      await pool.query('INSERT INTO categories (id, user_id, name, color) VALUES (?, ?, ?, ?)', [
        id,
        userId,
        category.name,
        category.color,
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
      const remappedClientId = task.clientId ? (clientIdMap.get(task.clientId) ?? null) : null;

      await pool.query(
        `INSERT INTO tasks (id, user_id, title, notes, category_ids, client_id, due_date, recurrence, completed, pinned, attachments)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          userId,
          task.title,
          task.notes ?? null,
          JSON.stringify(remappedCategoryIds),
          remappedClientId,
          task.dueDate,
          task.recurrence ?? 'none',
          !!task.completed,
          !!task.pinned,
          JSON.stringify(task.attachments ?? []),
        ],
      );
    }

    const [dbCategories] = await pool.query('SELECT * FROM categories WHERE user_id = ?', [userId]);
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

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API listening on port ${port}`));
