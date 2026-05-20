import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const projectRoot = path.resolve(__dirname, '../../');
export const uploadsDir = path.join(projectRoot, 'uploads');
export const dbFile = path.join(projectRoot, 'complaints.sqlite');
