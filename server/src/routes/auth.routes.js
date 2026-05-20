import { Router } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { get } from '../db/database.js';
import { validate } from '../middleware/validate.js';
import { env } from '../config/env.js';

const router = Router();

router.post('/login', [body('email').isEmail(), body('password').isLength({ min: 6 }), validate], async (req, res) => {
  const { email, password } = req.body;
  const user = await get('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, env.jwtSecret, { expiresIn: '8h' });
  return res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
});

export default router;
