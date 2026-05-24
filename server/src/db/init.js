import bcrypt from 'bcryptjs';
import { db, run } from './database.js';

export async function initDb() {
  db.serialize();
  await run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('customer','agent','admin')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS complaint_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  )`);

  await run(`CREATE TABLE IF NOT EXISTS support_agents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,
    active INTEGER DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    category_id INTEGER,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    issue_signature TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('low','medium','high','critical')) DEFAULT 'medium',
    status TEXT NOT NULL CHECK (status IN ('open','in_progress','resolved','closed','overdue')) DEFAULT 'open',
    assigned_agent_id INTEGER,
    due_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES complaint_categories(id),
    FOREIGN KEY (assigned_agent_id) REFERENCES users(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS complaint_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    complaint_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    comment TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS escalations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    complaint_id INTEGER NOT NULL,
    escalated_by INTEGER NOT NULL,
    reason TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id),
    FOREIGN KEY (escalated_by) REFERENCES users(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    complaint_id INTEGER NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    mime_type TEXT,
    uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS resolutions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    complaint_id INTEGER UNIQUE NOT NULL,
    resolved_by INTEGER NOT NULL,
    resolution_notes TEXT NOT NULL,
    resolved_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id),
    FOREIGN KEY (resolved_by) REFERENCES users(id)
  )`);

  await run(`INSERT OR IGNORE INTO complaint_categories (id, name) VALUES
    (1, 'Billing'), (2, 'Technical'), (3, 'Delivery'), (4, 'Account'), (5, 'General')`);

  const seedUsers = [
    { name: 'Customer One', email: 'customer@example.com', password: 'password123', role: 'customer' },
    { name: 'Agent One', email: 'agent@example.com', password: 'password123', role: 'agent' },
    { name: 'Admin One', email: 'admin@example.com', password: 'password123', role: 'admin' },
  ];

  for (const user of seedUsers) {
    const hash = await bcrypt.hash(user.password, 10);
    await run(
      `INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
      [user.name, user.email, hash, user.role],
    );
  }

  await run(`INSERT OR IGNORE INTO support_agents (user_id, active)
    SELECT id, 1 FROM users WHERE role='agent'`);
}
