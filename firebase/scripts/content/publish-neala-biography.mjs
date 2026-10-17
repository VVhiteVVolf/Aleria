import { runBiographyPublication } from './biography-content-publication.mjs';
import { planNealaBiography, NEALA_CHARACTER_ID } from './neala-biography-plan.mjs';

console.log(JSON.stringify(await runBiographyPublication({
  characterId: NEALA_CHARACTER_ID, buildPlan: planNealaBiography, exportName: 'neala', label: 'neala-biography',
  allowedFields: ['biography', 'inventory', 'updatedAt'],
  directory: new URL('../../../AleriaAlmanach/assets/biographies/neala-wylan/2026-10-17/', import.meta.url),
  exportsDirectory: new URL('../../../Charakter Archiv Exporte/Biographien/neala-wylan-2026-10-17/', import.meta.url)
})));
