import { runBiographyPublication } from './biography-content-publication.mjs';
import { planEinionBiography } from '../../../AleriaAlmanach/modules/einion-biography/einion-biography-plan.mjs';
import { EINION_CHARACTER_ID } from '../../../AleriaAlmanach/modules/einion-biography/einion-biography.js';

console.log(JSON.stringify(await runBiographyPublication({
  characterId: EINION_CHARACTER_ID, buildPlan: current => planEinionBiography(current),
  exportName: 'einion', label: 'einion-biography-20261114', allowedFields: ['biography', 'inventory', 'updatedAt'],
  directory: new URL('../../../diagnostics/einion-biography-20261114/', import.meta.url),
  exportsDirectory: new URL('../../../Charakter Archiv Exporte/Biographien/einion-draig-2026-11-14/', import.meta.url)
})));
