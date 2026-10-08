import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPortraitBindings } from '../family-source-import/portrait-bindings.mjs';
await createPortraitBindings(path.dirname(fileURLToPath(import.meta.url)));
