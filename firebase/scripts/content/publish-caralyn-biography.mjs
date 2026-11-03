import { readFile } from 'node:fs/promises';
import { runBiographyPublication } from './biography-content-publication.mjs';
import { planCaralynBiography } from '../../../AleriaAlmanach/modules/gwynthor-seven/caralyn-biography-import.mjs';
import { CARALYN_CHARACTER_ID } from '../../../AleriaAlmanach/modules/gwynthor-seven/caralyn-companion.js';
const source = JSON.parse(await readFile(new URL('../../../AleriaAlmanach/modules/gwynthor-seven/source/caralyn-biography-20261102.json', import.meta.url), 'utf8'));
console.log(JSON.stringify(await runBiographyPublication({
  characterId: CARALYN_CHARACTER_ID, buildPlan: current => planCaralynBiography(current, source, new Date().toISOString()),
  exportName: 'caralyn', label: 'caralyn-biography-20261102', allowedFields: ['biography', 'inventory', 'updatedAt'],
  directory: new URL('../../../diagnostics/caralyn-biography-20261102/', import.meta.url),
  exportsDirectory: new URL('../../../Charakter Archiv Exporte/Biographien/caralyn-chwedonol-2026-11-02/', import.meta.url)
})));
