import { getDevelopmentTraitId, getDevelopmentTechniqueId } from '../character-development/development-entry-reference.js';
import { getSkillIdentity, SKILL_DEFINITIONS } from '../skill-checks/skill-definitions.js';

const skillIds = new Set(SKILL_DEFINITIONS.map(skill => skill.id));

// Catalogue identity is independent of labels. Offers and physical possessions
// retain their own register IDs even when their template/breed is the same.
export function getCharacterArchiveCanonicalKey(kind, data = {}, name = '') {
  if (['standard', 'offer', 'owned'].includes(data.section) && data.id) {
    if (data.section === 'standard' && ['register-pferde', 'register-vieh'].includes(kind) && data.mountId) return `mount::${data.mountId}`;
    return `item-register::${data.id}`;
  }
  if (['register-pferde', 'register-vieh'].includes(kind) && data.archiveMountId) return `mount::${data.archiveMountId}`;
  if (kind === 'attack' && data.archiveStandardWeaponId) return `standard-weapon::${data.archiveStandardWeaponId}`;
  if (kind === 'technique') {
    const id = getDevelopmentTechniqueId(data);
    if (id.startsWith('combat-style-')) return `technique::catalog::${id}`;
  }
  if (kind === 'combat-style' && data.id) return `combat-style::catalog::${data.id}`;
  if (kind === 'ability') {
    const id = String(data.catalogAbilityId || data.sourceAbilityId || data.id || '').trim();
    if (id) return `ability::catalog::${id}`;
  }
  if (kind === 'trait') {
    const id = getDevelopmentTraitId(data);
    if (id) return `trait::catalog::${id}`;
  }
  if (kind === 'skill') {
    const id = getSkillIdentity(name || data.name);
    if (skillIds.has(id)) return `skill::catalog::${id}`;
  }
  return '';
}
