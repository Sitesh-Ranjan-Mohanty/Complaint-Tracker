import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'fs';
import { env } from './config/env.js';
import { initDb } from './db/init.js';
import authRoutes from './routes/auth.routes.js';
import complaintsRoutes from './routes/complaints.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import metaRoutes from './routes/meta.routes.js';
import path from 'path';
import { clientDistDir, uploadsDir } from './config/paths.js';

const app = express();
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/meta', metaRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientDistDir));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(clientDistDir, 'index.html'));
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

initDb().then(() => {
  app.listen(env.port, () => {
    console.log(`Server listening on http://localhost:${env.port}`);
  });
});
