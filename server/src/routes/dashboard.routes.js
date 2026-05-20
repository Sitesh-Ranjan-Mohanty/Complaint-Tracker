import { Router } from 'express';
import { all, get } from '../db/database.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/admin', authenticate, authorize('admin'), async (_req, res) => {
  const counts = await get(`SELECT
    SUM(CASE WHEN status IN ('open', 'in_progress') THEN 1 ELSE 0 END) as pending,
    SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
    SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue,
    COUNT(*) as total
    FROM complaints`);

  const byPriority = await all('SELECT priority, COUNT(*) as count FROM complaints GROUP BY priority');
  const byAgent = await all(
    `SELECT u.name as agent_name, COUNT(c.id) as assigned_count
     FROM users u
     LEFT JOIN complaints c ON c.assigned_agent_id = u.id
     WHERE u.role = 'agent'
     GROUP BY u.id`,
  );

  return res.json({ counts, byPriority, byAgent });
});

export default router;
