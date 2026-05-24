import { Router } from 'express';
import { body, param, query } from 'express-validator';
import multer from 'multer';
import dayjs from 'dayjs';
import fs from 'fs';
import { all, get, run } from '../db/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createIssueSignature } from '../utils/signature.js';
import { env } from '../config/env.js';
import { uploadsDir } from '../config/paths.js';

const upload = multer({ dest: uploadsDir });
const router = Router();

router.post(
  '/',
  authenticate,
  authorize('customer', 'admin'),
  upload.array('attachments', 3),
  [
    body('title').trim().isLength({ min: 5 }),
    body('description').trim().isLength({ min: 10 }),
    body('priority').isIn(['low', 'medium', 'high', 'critical']),
    body('categoryId').optional().isInt({ min: 1 }),
    validate,
  ],
  async (req, res) => {
    const { title, description, priority, categoryId } = req.body;
    const signature = createIssueSignature(title, description, categoryId);
    const windowStart = dayjs().subtract(env.duplicateWindowMinutes, 'minute').toISOString();

    const duplicate = await get(
      `SELECT id FROM complaints WHERE customer_id = ? AND issue_signature = ? AND created_at >= ?`,
      [req.user.id, signature, windowStart],
    );
    if (duplicate) {
      return res.status(409).json({ message: 'Duplicate complaint detected in recent window', duplicateId: duplicate.id });
    }

    const dueAt = dayjs().add(priority === 'critical' ? 8 : priority === 'high' ? 24 : 48, 'hour').toISOString();
    const inserted = await run(
      `INSERT INTO complaints (customer_id, category_id, title, description, issue_signature, priority, due_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, categoryId || null, title, description, signature, priority, dueAt],
    );

    for (const file of req.files || []) {
      await run(
        `INSERT INTO attachments (complaint_id, file_name, file_path, mime_type) VALUES (?, ?, ?, ?)`,
        [inserted.id, file.originalname, file.path, file.mimetype],
      );
    }

    return res.status(201).json({ id: inserted.id, message: 'Complaint created' });
  },
);

router.put(
  '/:id/status',
  authenticate,
  authorize('agent', 'admin'),
  [param('id').isInt({ min: 1 }), body('status').isIn(['open', 'in_progress', 'resolved', 'closed', 'overdue']), body('resolutionNotes').optional().isString(), validate],
  async (req, res) => {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;
    const complaint = await get('SELECT * FROM complaints WHERE id = ?', [id]);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    await run('UPDATE complaints SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);
    if (status === 'resolved' && resolutionNotes) {
      await run(
        `INSERT OR REPLACE INTO resolutions (complaint_id, resolved_by, resolution_notes) VALUES (?, ?, ?)`,
        [id, req.user.id, resolutionNotes],
      );
    }
    return res.json({ message: 'Status updated' });
  },
);

router.post('/:id/comment', authenticate, [param('id').isInt({ min: 1 }), body('comment').trim().isLength({ min: 2 }), validate], async (req, res) => {
  const { id } = req.params;
  const complaint = await get('SELECT id FROM complaints WHERE id = ?', [id]);
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

  await run('INSERT INTO complaint_comments (complaint_id, user_id, comment) VALUES (?, ?, ?)', [id, req.user.id, req.body.comment]);
  return res.status(201).json({ message: 'Comment added' });
});

router.get(
  '/',
  authenticate,
  [
    query('status').optional().isString(),
    query('priority').optional().isString(),
    query('assignedAgentId').optional({ values: 'falsy' }).isInt({ min: 1 }),
    query('categoryId').optional({ values: 'falsy' }).isInt({ min: 1 }),
    query('search').optional({ values: 'falsy' }).isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 5000 }),
    validate,
  ],
  async (req, res) => {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const offset = (page - 1) * limit;

    const filters = [];
    const params = [];

    if (req.query.status) {
      filters.push('c.status = ?');
      params.push(req.query.status);
    }
    if (req.query.priority) {
      filters.push('c.priority = ?');
      params.push(req.query.priority);
    }
    if (req.query.assignedAgentId) {
      filters.push('c.assigned_agent_id = ?');
      params.push(req.query.assignedAgentId);
    }
    if (req.query.categoryId) {
      filters.push('c.category_id = ?');
      params.push(req.query.categoryId);
    }
    if (req.query.search) {
      filters.push('(c.title LIKE ? OR c.description LIKE ?)');
      params.push(`%${req.query.search}%`, `%${req.query.search}%`);
    }
    if (req.user.role === 'customer') {
      filters.push('c.customer_id = ?');
      params.push(req.user.id);
    }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const rows = await all(
      `SELECT c.*, u.name as customer_name, a.name as agent_name, cc.name as category_name
       FROM complaints c
       JOIN users u ON u.id = c.customer_id
       LEFT JOIN users a ON a.id = c.assigned_agent_id
       LEFT JOIN complaint_categories cc ON cc.id = c.category_id
       ${where}
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    const totalRow = await get(`SELECT COUNT(*) as count FROM complaints c ${where}`, params);
    return res.json({ data: rows, page, limit, total: totalRow.count });
  },
);

router.get('/:id', authenticate, [param('id').isInt({ min: 1 }), validate], async (req, res) => {
  const complaint = await get(
    `SELECT c.*, u.name as customer_name, a.name as agent_name, cc.name as category_name
     FROM complaints c
     JOIN users u ON u.id = c.customer_id
     LEFT JOIN users a ON a.id = c.assigned_agent_id
     LEFT JOIN complaint_categories cc ON cc.id = c.category_id
     WHERE c.id = ?`,
    [req.params.id],
  );
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

  const comments = await all(
    `SELECT cm.*, u.name, u.role FROM complaint_comments cm JOIN users u ON u.id = cm.user_id WHERE cm.complaint_id = ? ORDER BY cm.created_at ASC`,
    [req.params.id],
  );
  const attachments = await all('SELECT * FROM attachments WHERE complaint_id = ?', [req.params.id]);
  const escalations = await all('SELECT * FROM escalations WHERE complaint_id = ? ORDER BY created_at DESC', [req.params.id]);
  const resolution = await get('SELECT * FROM resolutions WHERE complaint_id = ?', [req.params.id]);

  return res.json({ complaint, comments, attachments, escalations, resolution });
});

router.post('/:id/escalate', authenticate, authorize('agent', 'admin'), [param('id').isInt({ min: 1 }), body('reason').isLength({ min: 3 }), validate], async (req, res) => {
  const complaint = await get('SELECT id FROM complaints WHERE id = ?', [req.params.id]);
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

  const previous = await get('SELECT MAX(level) as max_level FROM escalations WHERE complaint_id = ?', [req.params.id]);
  const level = (previous?.max_level || 0) + 1;

  await run('INSERT INTO escalations (complaint_id, escalated_by, reason, level) VALUES (?, ?, ?, ?)', [req.params.id, req.user.id, req.body.reason, level]);
  await run('UPDATE complaints SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['overdue', req.params.id]);

  return res.status(201).json({ message: 'Escalated', level });
});

router.put('/:id/assign', authenticate, authorize('admin'), [param('id').isInt({ min: 1 }), body('assignedAgentId').isInt({ min: 1 }), validate], async (req, res) => {
  const { id } = req.params;
  const { assignedAgentId } = req.body;
  const agent = await get('SELECT id FROM users WHERE id = ? AND role = ?', [assignedAgentId, 'agent']);
  if (!agent) return res.status(400).json({ message: 'Invalid agent' });

  await run('UPDATE complaints SET assigned_agent_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [assignedAgentId, id]);
  return res.json({ message: 'Assigned successfully' });
});

router.delete('/:id', authenticate, authorize('customer', 'admin'), [param('id').isInt({ min: 1 }), validate], async (req, res) => {
  const complaint = await get('SELECT id, customer_id FROM complaints WHERE id = ?', [req.params.id]);
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

  const isAdmin = req.user.role === 'admin';
  const isOwner = req.user.id === complaint.customer_id;
  if (!isAdmin && !isOwner) {
    return res.status(403).json({ message: 'You can only delete your own complaint' });
  }

  const files = await all('SELECT file_path FROM attachments WHERE complaint_id = ?', [req.params.id]);
  await run('BEGIN TRANSACTION');
  try {
    await run('DELETE FROM complaint_comments WHERE complaint_id = ?', [req.params.id]);
    await run('DELETE FROM escalations WHERE complaint_id = ?', [req.params.id]);
    await run('DELETE FROM resolutions WHERE complaint_id = ?', [req.params.id]);
    await run('DELETE FROM attachments WHERE complaint_id = ?', [req.params.id]);
    await run('DELETE FROM complaints WHERE id = ?', [req.params.id]);
    await run('COMMIT');
  } catch (error) {
    await run('ROLLBACK');
    throw error;
  }

  for (const row of files) {
    if (row?.file_path && fs.existsSync(row.file_path)) {
      fs.unlinkSync(row.file_path);
    }
  }

  return res.json({ message: `Complaint #${req.params.id} deleted successfully` });
});

async function clearAllComplaintData(_req, res) {
  const files = await all('SELECT file_path FROM attachments');
  await run('BEGIN TRANSACTION');
  try {
    // Only delete tracker workflow data. Do not touch users/accounts tables.
    await run('DELETE FROM complaint_comments');
    await run('DELETE FROM escalations');
    await run('DELETE FROM resolutions');
    await run('DELETE FROM attachments');
    await run('DELETE FROM complaints');
    await run('COMMIT');
  } catch (error) {
    await run('ROLLBACK');
    throw error;
  }

  for (const row of files) {
    if (row?.file_path && fs.existsSync(row.file_path)) {
      fs.unlinkSync(row.file_path);
    }
  }

  return res.json({ message: 'Complaint tracker records cleared. User accounts are unchanged.' });
}

router.delete('/clear/all', authenticate, authorize('admin'), clearAllComplaintData);
router.delete('/clear-all', authenticate, authorize('admin'), clearAllComplaintData);

export default router;
