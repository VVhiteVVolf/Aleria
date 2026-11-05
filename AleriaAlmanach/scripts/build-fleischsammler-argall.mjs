import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { createFamilyCandidates } from '../modules/character-genealogy/genealogy-mapping.js';
import { importAuthoredCharacters } from '../../CharakterDatenbank/scripts/import-authored-characters.mjs';
import { ARGALL_CAPTAIN_FEATURE, buildArgallHouseholdExports } from '../modules/fleischsammler-argall/character-content.mjs';

const root = new URL('../../', import.meta.url);
const family = FAMILY_REGISTRY.find(record => record.id === 'haus-argall');
const exports = buildArgallHouseholdExports(family);
const check = process.argv.includes('--check');
for (const entry of exports) {
  const url = new URL(entry.sourcePath, root);
  const text = JSON.stringify(entry, null, 2) + '\n';
  if (check) {
    if (await readFile(url, 'utf8') !== text) throw Error(`Veraltete Figurenquelle: ${entry.sourcePath}`);
  } else {
    await mkdir(new URL('.', url), { recursive: true });
    await writeFile(url, text);
  }
}
console.log(JSON.stringify(await importAuthoredCharacters({
  sources: exports.map(entry => entry.sourcePath), feature: ARGALL_CAPTAIN_FEATURE,
  familyCandidates: createFamilyCandidates(family), check
})));
