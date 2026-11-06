import { EXPANSION_TALENT_DEFINITIONS } from './development-expansion-talents.js';
import { EXPANSION_QUIRK_DEFINITIONS } from './development-expansion-quirks.js';
import { EXPANSION_ABILITY_DEFINITIONS } from './development-expansion-abilities.js';

// Category metadata is presentation only; all choices share the established
// passive development-trait contract and its reversible profile projection.
export const EXPANSION_TRAIT_GROUPS = Object.freeze({
  'expansion-talents': Object.freeze({ label: 'Talente', tag: 'Talent',
    note: 'Allgemeine RPG-Talente mit breiten, dauerhaft nutzbaren Vorteilen. Kosten und vollständige Wirkung stehen beim jeweiligen Talent.', definitions: EXPANSION_TALENT_DEFINITIONS }),
  'expansion-quirks': Object.freeze({ label: 'Marotten', tag: 'Marotte',
    note: 'Gewohnheiten mit kleinen Vor- und Nachteilen. Die angegebenen Abzüge gelten im jeweils beschriebenen Regelbereich.', definitions: EXPANSION_QUIRK_DEFINITIONS }),
  'expansion-abilities': Object.freeze({ label: 'Erlernte passive Fähigkeiten', tag: 'Erlernte Fähigkeit',
    note: 'Klassenfreie passive Fertigkeiten. Bedingte Boni gelten bei ihrem angegebenen Auslöser; sie benötigen keine zusätzliche Aktivierung.', definitions: EXPANSION_ABILITY_DEFINITIONS })
});
export const EXPANSION_TRAIT_DEFINITIONS = Object.freeze(Object.values(EXPANSION_TRAIT_GROUPS).flatMap(group => group.definitions));
const categories = new Map(Object.entries(EXPANSION_TRAIT_GROUPS).flatMap(([id, group]) =>
  group.definitions.map(([traitId]) => [`development-trait-${traitId}`, Object.freeze({ id, label: group.label, tag: group.tag })])));
export function getExpansionTraitCategory(entry) {
  return categories.get(typeof entry === 'string' ? entry : entry?.developmentTraitId || entry?.id) || null;
}
