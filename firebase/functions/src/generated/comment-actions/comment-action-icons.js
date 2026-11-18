import { SKILL_DEFINITIONS } from '../skill-checks/skill-definitions.js';

const assetRoot = '/AleriaAlmanach/public/assets/comment-icons/';
const makeIcon = (id, label, groups = ['interact']) => Object.freeze({
  id, label, groups: Object.freeze(groups),
  image: `${assetRoot}actions/${id}.png?v=20261117-action-icons-v1`
});
export const COMMENT_ACTION_ICONS = Object.freeze([
  Object.freeze({ id: 'interact', label: 'Allgemeine Interaktion', groups: Object.freeze(['interact']), image: `${assetRoot}interact.png` }),
  ...SKILL_DEFINITIONS.map(skill => makeIcon(skill.id, skill.label)),
  makeIcon('eat', 'Essen', ['consume']),
  makeIcon('drink', 'Trinken', ['consume']),
  makeIcon('take', 'Einnehmen', ['consume']),
  makeIcon('use', 'Benutzen', ['interact', 'consume'])
]);
const byId = new Map(COMMENT_ACTION_ICONS.map(icon => [icon.id, icon]));
const attributeIcons = Object.freeze({ strength: 'athletics', dexterity: 'acrobatics', constitution: 'body-control', intelligence: 'investigation', wisdom: 'perception', charisma: 'persuasion' });

export function normalizeActionIconId(value) {
  return typeof value === 'string' && byId.has(value) ? value : '';
}

export function getActionIcons(kind = 'interact') {
  return COMMENT_ACTION_ICONS.filter(icon => icon.groups.includes(kind === 'consume' ? 'consume' : 'interact'));
}

export function getActionIcon(source = {}) {
  const explicit = normalizeActionIconId(source.actionIconId);
  const kind = source.commentKind || source.kind;
  if (explicit && byId.get(explicit).groups.includes(kind === 'consume' ? 'consume' : 'interact')) return byId.get(explicit);
  const skillId = String(source.skillResolution?.skillId || source.skillId || source.preferredSkills?.[0] || '');
  const skillIcon = normalizeActionIconId(skillId) || attributeIcons[skillId.replace(/^(?:save|attribute):/, '')];
  if (kind !== 'consume' && skillIcon) return byId.get(skillIcon);
  if (kind === 'consume') {
    const use = source.inventoryUse || source.storedInventoryUse || {};
    const category = String(use.item?.category || use.item?.type || '').toLocaleLowerCase('de');
    const id = /trank|elixier|medizin|alchem/.test(category) ? 'take'
      : /getränk|drink|wein|bier|wasser/.test(category) ? 'drink'
      : /essen|food|nahrung|speis|lebensmittel/.test(category) ? 'eat' : 'use';
    return byId.get(id);
  }
  return byId.get('interact');
}
