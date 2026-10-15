import { copyFile, link, lstat, mkdir, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { BUILD_RECEIPT_PATH } from './site-build-receipt.mjs';

export const PUBLISH_DIRECTORY = '.site-publish';
const OWNER_FILE = '.aleria-publish-stage';
const OWNER = 'aleria-site-build-v1\n';
const PRIVATE_ROOTS = ['firebase/', 'netlify/'];
const AUTHORING_DIRECTORIES = ['AleriaAlmanach/scripts/', 'AleriaAlmanach/tools/',
  'Stammbäume/tools/', 'Stammbäume/scripts/', 'Karten/tools/',
  'Gameplay Guide/scripts/', 'Klassenordner/scripts/', 'Bestiarium/scripts/'];

export function shouldPublish(file) {
  if (!file || file.startsWith('/') || file.includes('\\') || file.split('/').some(part => part === '..')) return false;
  if (file.split('/').some(part => part === 'node_modules' || (part.startsWith('.') && part !== '.well-known'))) return false;
  if (file.split('/').includes('tests')) return false;
  if (PRIVATE_ROOTS.some(root => file.startsWith(root)) || AUTHORING_DIRECTORIES.some(root => file.startsWith(root))) return false;
  if (file === 'netlify.toml' || file === 'firebase.json' || /(?:^|\/)AGENTS\.md$/.test(file) || file === 'CODEX_BRIEFING.md') return false;
  // This Node-only data builder imports fs/assert and the Rossmarkt extractor.
  // The browser consumes its generated horse-breeding-registry.mjs instead.
  if (file === 'Bestiarium/modules/horse-breeding/horse-breeding-data.mjs') return false;
  return !/\.(?:log|pyc|pyo)$/.test(file);
}

async function prepareStage(root) {
  const resolvedRoot = await realpath(root);
  const stage = path.resolve(resolvedRoot, PUBLISH_DIRECTORY);
  if (path.dirname(stage) !== resolvedRoot || path.basename(stage) !== PUBLISH_DIRECTORY) throw Error('Invalid publication stage path.');
  const existing = await lstat(stage).catch(error => { if (error.code !== 'ENOENT') throw error; return null; });
  if (existing) {
    if (!existing.isDirectory() || existing.isSymbolicLink()) throw Error('Publication stage must be an owned directory.');
    if (await readFile(path.join(stage, OWNER_FILE), 'utf8').catch(() => '') !== OWNER) throw Error('Refusing to replace an unowned publication directory.');
    await rm(stage, { recursive: true, force: true });
  }
  await mkdir(stage);
  await writeFile(path.join(stage, OWNER_FILE), OWNER);
  return { root: resolvedRoot, stage };
}

export async function preparePublication(root, sourceTree, { log = console.log } = {}) {
  const prepared = await prepareStage(root);
  const files = [...new Set([...sourceTree.map(entry => entry.file).filter(shouldPublish), BUILD_RECEIPT_PATH])];
  const directories = new Set();
  let linked = 0;
  for (const file of files) {
    if (!shouldPublish(file)) throw Error(`Invalid publication path: ${file}`);
    const source = path.resolve(prepared.root, file);
    const target = path.resolve(prepared.stage, file);
    const relativeTarget = path.relative(prepared.stage, target);
    if (relativeTarget.startsWith('..') || path.isAbsolute(relativeTarget)) throw Error(`Publication target escapes stage: ${file}`);
    const relativeSource = path.relative(prepared.root, await realpath(source));
    if (relativeSource.startsWith('..') || path.isAbsolute(relativeSource)) throw Error(`Publication source escapes repository: ${file}`);
    const directory = path.dirname(target);
    if (!directories.has(directory)) { await mkdir(directory, { recursive: true }); directories.add(directory); }
    const stat = await lstat(source);
    try {
      if (!stat.isFile()) throw Object.assign(Error('Copy symlink contents'), { code: 'EXDEV' });
      await link(source, target);
      linked++;
    } catch (error) {
      if (!['EXDEV', 'EPERM', 'EACCES', 'ENOTSUP'].includes(error.code)) throw error;
      await copyFile(source, target);
    }
  }
  log(`[site-build] Publication: ${files.length} files, ${linked} hard links; authoring tools excluded.`);
  return { files: files.length, linked, directory: prepared.stage };
}
