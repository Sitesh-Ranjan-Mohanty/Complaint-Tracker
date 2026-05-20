import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const projectRoot = path.resolve(__dirname, '../../');
const dataRoot = process.env.DATA_DIR || projectRoot;

export const uploadsDir = path.join(dataRoot, 'uploads');
export const dbFile = path.join(dataRoot, 'complaints.sqlite');
export const clientDistDir = path.resolve(projectRoot, '../client/dist');
