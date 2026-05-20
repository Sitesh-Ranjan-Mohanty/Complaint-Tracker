import { Router } from 'express';
import { all } from '../db/database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/categories', authenticate, async (_req, res) => {
  const rows = await all('SELECT * FROM complaint_categories ORDER BY name');
  res.json(rows);
});

router.get('/agents', authenticate, async (_req, res) => {
  const rows = await all("SELECT id, name FROM users WHERE role = 'agent' ORDER BY name");
  res.json(rows);
});

export default router;
