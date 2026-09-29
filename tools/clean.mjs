import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT, output } from './lib.mjs';
await fs.rm(output, { recursive: true, force: true });
await fs.rm(path.join(ROOT, '.cache/build'), { recursive: true, force: true });
