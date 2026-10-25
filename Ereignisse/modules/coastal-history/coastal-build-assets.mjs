import { cp, copyFile, mkdir, readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { COASTAL_EVENT_PAGES } from './coastal-events.mjs';
import { PIRATES } from '../../../shared/coastal-history/pirates.mjs';

export function coastalPageInputs(workspaceRoot) {
  const files = [...COASTAL_EVENT_PAGES.map(page => page.file), 'Piraterie/index.html', ...PIRATES.flatMap(entry => [entry.profileHref, entry.factionHref]), 'shared/coastal-history/redaktion.html'];
  return Object.fromEntries(files.map((file, index) => [`coastal-${index}`, resolve(workspaceRoot, file)]));
}
export async function copyCoastalAssets({ workspaceRoot, buildRoot }) {
  // These paths are also consumed by classic Almanach data strings and source links.
  for (const directory of ['Archiv/Quellen/kuestenchroniken-2026-10-24']) {
    await cp(resolve(workspaceRoot, directory), resolve(buildRoot, directory), { recursive: true, force: true });
  }
  const evidence = 'shared/coastal-history';
  await mkdir(resolve(buildRoot, evidence), { recursive: true });
  for (const file of await readdir(resolve(workspaceRoot, evidence))) {
    if (/\.(json|md)$/.test(file)) await copyFile(resolve(workspaceRoot, evidence, file), resolve(buildRoot, evidence, file));
  }
  const art = 'Ereignisse/assets/coastal-history';
  await mkdir(resolve(buildRoot, art), { recursive: true });
  for (const file of await readdir(resolve(workspaceRoot, art))) {
    if (/\.(webp|json)$/.test(file)) await copyFile(resolve(workspaceRoot, art, file), resolve(buildRoot, art, file));
  }
  await cp(resolve(workspaceRoot, art, 'markers'), resolve(buildRoot, art, 'markers'), { recursive: true, force: true });
  for (const entry of PIRATES.filter(entry => entry.tier === 'great')) {
    await mkdir(dirname(resolve(buildRoot, entry.symbol)), { recursive: true });
    await copyFile(resolve(workspaceRoot, entry.symbol), resolve(buildRoot, entry.symbol));
  }
}
