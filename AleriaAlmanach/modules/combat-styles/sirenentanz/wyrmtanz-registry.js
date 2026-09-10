import { getDerwynForms } from './sirenentanz-forms.js?v=20260909-dragon-parent-v2';
import { getDerwynBasicTechniques, getDerwynExpertTechniques } from './derwyn-techniques.js?v=20260909-dragon-parent-v2';

const techniques = [...getDerwynBasicTechniques(), ...getDerwynExpertTechniques()];

// The saved style ID is retained; all public names use Wyrmtanz.
export const WYRMTANZ_COMBAT_STYLE = Object.freeze({
  id: 'sirenentanz', name: 'Wyrmtanz', culture: 'Cenyr und Vennyr', schemaVersion: 2,
  description: 'Die gemeinsame Waffenüberlieferung der Derwyn verbindet ein gewähltes Grundfundament mit vier eigenen Wyrmformen.',
  forms: getDerwynForms().map((form, index) => ({
    ...form, sequence: index + 1, status: 'confirmed',
    trainingTier: form.kind === 'foundation' ? 'Grundform' : form.kind === 'path' ? 'Derwyn-Pfad' : 'Freie Vertiefung',
    techniqueLevelBand: { minimum: form.minimumLevel, maximum: form.maximumTrainingLevel },
    techniques: techniques.filter(technique => technique.combatStyleFormId === form.id)
  }))
});
