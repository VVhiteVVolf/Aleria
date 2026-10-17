import { runBiographyPublication } from './biography-content-publication.mjs';
import { planSleipnirBiography, SLEIPNIR_VARULV_ID } from './sleipnir-biography-plan.mjs';

console.log(JSON.stringify(await runBiographyPublication({
  characterId: SLEIPNIR_VARULV_ID, buildPlan: planSleipnirBiography, exportName: 'sleipnir', label: 'sleipnir-biography',
  allowedFields: ['biography', 'updatedAt'],
  directory: new URL('../../../AleriaAlmanach/assets/biographies/sleipnir-varulv/2026-10-17/', import.meta.url),
  exportsDirectory: new URL('../../../Charakter Archiv Exporte/Biographien/sleipnir-varulv-2026-10-17/', import.meta.url)
})));
