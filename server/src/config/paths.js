import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const projectRoot = path.resolve(__dirname, '../../');
const preferredDataRoot = process.env.DATA_DIR || projectRoot;
const fallbackDataRoot = '/tmp/complaint-tracker-data';

function resolveWritableDataRoot() {
  try {
    fs.mkdirSync(preferredDataRoot, { recursive: true });
    fs.accessSync(preferredDataRoot, fs.constants.W_OK);
    return preferredDataRoot;
  } catch (error) {
    fs.mkdirSync(fallbackDataRoot, { recursive: true });
    console.warn(
      `DATA_DIR "${preferredDataRoot}" is not writable, using "${fallbackDataRoot}" instead.`,
      error?.code || error?.message || error,
    );
    return fallbackDataRoot;
  }
}

const dataRoot = resolveWritableDataRoot();

export const uploadsDir = path.join(dataRoot, 'uploads');
export const dbFile = path.join(dataRoot, 'complaints.sqlite');
export const clientDistDir = path.resolve(projectRoot, '../client/dist');
