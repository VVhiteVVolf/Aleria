// Revisions of already authored non-Cenyr attacks. Shared by import, sheets and
// server validation so old Firestore records cannot revive superseded damage.
import { hasRhiannonSpellEconomy, reconcileRhiannonSpellEconomy } from './magier/rhiannon-spell-economy.js';
import { FENRIR_WEAPON_TECHNIQUE_IDS, reconcileFenrirWeaponTechnique } from './aldrimar/fenrir-weapon-techniques.js';

const FORMULA_REVISIONS = Object.freeze({
  'rhiannon-magisches-geschoss': ['2d4+2', '1d4+1'],
  'rhiannon-windklinge': ['2d6', '1d8'],
  'rhiannon-druckstoss': ['2d6', '1d6'],
  'rhiannon-sichelwind': ['3d6', '2d6'],
  'rhiannon-berstende-boe': ['3d6', '2d4'],
  'rhiannon-hundert-klingen-sturm': ['6d6', '3d4'],
  'rhiannon-blitzfunken': ['4d8', '3d6']
});

function replaceFormula(value, from, to) {
  if (Array.isArray(value)) return value.map(entry => replaceFormula(entry, from, to));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, replaceFormula(entry, from, to)]));
  if (typeof value !== 'string') return value;
  const pattern = from.replace(/\+/g, '\\s*\\+\\s*').replace(/d/g, '[dDwW]');
  return value.replace(new RegExp(`(?<![\\d])${pattern}(?![\\d])`, 'g'), match => /W/.test(match) ? to.toUpperCase().replace(/D/g, 'W') : to);
}

function reviseEntry(entry) {
  if (FENRIR_WEAPON_TECHNIQUE_IDS.has(entry?.id)) return reconcileFenrirWeaponTechnique(entry);
  const formula = FORMULA_REVISIONS[entry?.id];
  if (formula) {
    const revised = replaceFormula(entry, ...formula);
    // Rhiannon's authored damage spells add her current INT modifier, including
    // older saved copies. Keep an explicitly chosen bonus attribute intact.
    return { ...revised, effects: revised.effects?.map(effect => effect.type === 'damage' && effect.target !== 'self'
      ? { ...effect, bonusAttribute: effect.bonusAttribute || 'intelligence' } : effect) };
  }
  return entry;
}

export function reconcileClassDamageCondition(condition = {}) {
  return !condition.berserk && String(condition.id || '').startsWith('fenrir-berserkergang-state')
    ? replaceFormula(condition, '1d6', '1d4') : condition;
}

export function reconcileClassDamageRevisions(profile = {}) {
  const collections = [profile.techniques, profile.abilities, profile.magic?.spells];
  const hasCondition = profile.conditions?.some(condition => String(condition.id || '').startsWith('fenrir-berserkergang-state'));
  const hasSpellEconomy = profile.magic?.spells?.some(hasRhiannonSpellEconomy);
  if (!hasCondition && !hasSpellEconomy && !collections.some(entries => entries?.some(entry => FORMULA_REVISIONS[entry?.id] || FENRIR_WEAPON_TECHNIQUE_IDS.has(entry?.id)))) return profile;
  return { ...profile,
    techniques: profile.techniques?.map(reviseEntry), abilities: profile.abilities?.map(reviseEntry),
    ...(profile.conditions ? { conditions: profile.conditions.map(reconcileClassDamageCondition) } : {}),
    ...(profile.magic ? { magic: { ...profile.magic, spells: profile.magic.spells?.map(entry => reconcileRhiannonSpellEconomy(reviseEntry(entry))) } } : {})
  };
}
