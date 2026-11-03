import { getCulturalOriginTemplate } from '../character-origins/cultural-origin-catalog.js';
import { COMBAT_ATTRIBUTE_DEFINITIONS } from '../combat/combat-profile-model.js';
import { getSkillIdentity, SKILL_DEFINITIONS } from '../skill-checks/skill-definitions.js';

function originFor(entry) {
  return entry?.kind === 'ancestry'
    ? getCulturalOriginTemplate(entry.data?.id) || getCulturalOriginTemplate(entry.name)
    : null;
}

export function getCharacterArchiveOriginMeta(entry = {}) {
  if (entry.kind !== 'ancestry') return [];
  const data = entry.data || {}, origin = originFor(entry);
  const bonuses = data.attributeBonuses || origin?.attributeBonuses || {};
  const attributes = COMBAT_ATTRIBUTE_DEFINITIONS.flatMap(attribute => {
    const value = Number(bonuses[attribute.key]);
    return Number.isFinite(value) && value !== 0 ? [`${attribute.label} ${value > 0 ? '+' : ''}${value}`] : [];
  });
  const skillSuggestions = data.skillProficiencies ?? origin?.skillProficiencies ?? [];
  const skills = (Array.isArray(skillSuggestions) ? skillSuggestions : []).map(name =>
    SKILL_DEFINITIONS.find(skill => skill.id === getSkillIdentity(name))?.label || String(name)
  );
  return [...attributes, ...(skills.length ? [`Fertigkeitsvorschläge: ${skills.join(' · ')}`] : [])];
}

export function getCharacterArchiveOriginLinks(entry = {}) {
  const origin = originFor(entry);
  // Read only the authored catalog's existing local destination. An edited
  // archive record cannot inject a URL through data.pagePath or sourcePaths.
  return origin?.pagePath ? [{ href: `..${origin.pagePath}`, label: 'Zur Herkunftsseite ↗' }] : [];
}
