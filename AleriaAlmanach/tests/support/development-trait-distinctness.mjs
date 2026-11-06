import { sanitizeCharacterCombatProfile } from '../../modules/combat/combat-profile-model.js';
import { getSkillIdentity } from '../../modules/skill-checks/skill-definitions.js';

const canonical = value => {
  if (Array.isArray(value)) return value.map(canonical).filter(entry => entry !== undefined)
    .sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
  if (value && typeof value === 'object') {
    const entries = Object.keys(value).sort().map(key => [key, canonical(value[key])])
      .filter(([, entry]) => entry !== undefined && (!Array.isArray(entry) || entry.length));
    return entries.length ? Object.fromEntries(entries) : undefined;
  }
  return value === false || value == null || value === '' || value === 0 || value === 'normal' ? undefined : value;
};

export function developmentTraitEffectSignature(entry) {
  const normalized = sanitizeCharacterCombatProfile({ quirks: [{ ...entry, active: true }] }).quirks[0];
  const mechanics = { ...normalized.mechanics };
  for (const key of ['skillModifiers', 'skillProficiencies']) if (mechanics[key]) mechanics[key] = mechanics[key].map(modifier => ({
    ...modifier, name: getSkillIdentity(modifier.name) || modifier.name.toLocaleLowerCase('de')
  }));
  const rules = normalized.triggerRules.map(({ id, name, description, ...rule }) => rule);
  const activation = entry.activationType && entry.activationType !== 'passive' ? entry.activationType : undefined;
  return JSON.stringify(canonical({ activation, mechanics, rules }) || {});
}

export const developmentTraitNameKey = name => String(name).normalize('NFKD').replace(/\p{M}/gu, '')
  .toLocaleLowerCase('de').replace(/ß/g, 'ss').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
