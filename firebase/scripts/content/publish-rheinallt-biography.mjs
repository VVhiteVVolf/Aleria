import { runBiographyPublication } from './biography-content-publication.mjs';
import { planRheinalltBiography } from '../../../AleriaAlmanach/modules/rheinallt-biography/rheinallt-biography-plan.mjs';
import { RHEINALLT_CHARACTER_ID } from '../../../AleriaAlmanach/modules/rheinallt-biography/rheinallt-biography.js';

console.log(JSON.stringify(await runBiographyPublication({
  characterId: RHEINALLT_CHARACTER_ID, buildPlan: current => planRheinalltBiography(current),
  exportName: 'rheinallt', label: 'rheinallt-biography-20261115',
  allowedFields: ['biography', 'inventory', 'title', 'role', 'origin', 'currentLocation', 'emotes', 'imageSets', 'updatedAt'],
  directory: new URL('../../../diagnostics/rheinallt-gafyr-20261115/', import.meta.url),
  exportsDirectory: new URL('../../../Charakter Archiv Exporte/Biographien/rheinallt-gafyr-2026-11-15/', import.meta.url)
})));
