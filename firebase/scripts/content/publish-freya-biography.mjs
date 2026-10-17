import { runBiographyPublication } from './biography-content-publication.mjs';
import { planFreyaBiography, FREYA_CHARACTER_ID, FREYA_BIOGRAPHY_FIELDS } from './freya-biography-plan.mjs';
console.log(JSON.stringify(await runBiographyPublication({ characterId: FREYA_CHARACTER_ID, buildPlan: planFreyaBiography,
  exportName: 'freya', label: 'freya-biography', allowedFields: FREYA_BIOGRAPHY_FIELDS,
  directory: new URL('../../../AleriaAlmanach/assets/biographies/freya-skald/2026-10-17/', import.meta.url),
  exportsDirectory: new URL('../../../Charakter Archiv Exporte/Biographien/freya-skald-2026-10-17/', import.meta.url)
})));
