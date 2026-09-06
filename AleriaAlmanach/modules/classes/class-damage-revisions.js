// Revisions of already authored non-Cenyr attacks. Shared by import, sheets and
// server validation so old Firestore records cannot revive superseded damage.
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

const FENRIR_TECHNIQUE_REVISIONS = Object.freeze({
  'fenrir-crushing-blow': { previousFormula: '1d12+1d4', damageFormula: '1d12+1d6' },
  'fenrir-shield-bash': { previousFormula: '1d4', damageFormula: '1d6' },
  'fenrir-spinning-throw': { previousFormula: '1d6+1d4', damageFormula: '2d6+1', activationType: 'reaction', costs: [
    { id: 'fenrir-throw-reaction', resourceId: 'reaction', name: 'Reaktion', amount: 1, scope: 'comment' },
    { id: 'fenrir-throw-special', resourceId: 'special-action', name: 'Besondere Aktion', amount: 1, scope: 'persistent' }
  ] }
});

function reviseEntry(entry) {
  if (FENRIR_TECHNIQUE_REVISIONS[entry?.id]) {
    const { previousFormula, ...revision } = FENRIR_TECHNIQUE_REVISIONS[entry.id];
    return { ...replaceFormula(entry, previousFormula, revision.damageFormula), ...structuredClone(revision) };
  }
  const formula = FORMULA_REVISIONS[entry?.id];
  if (formula) return replaceFormula(entry, ...formula);
  if (entry?.id !== 'fenrir-twin-axe-flurry') return entry;
  return {
    ...entry,
    damageFormula: '1d6+1',
    description: 'Zwei getrennte Hiebe: ein Hauptangriff und bei dessen Treffer ein kurzer Folgeangriff mit der zweiten Axt.',
    effect: 'Hauptangriff: 1W6 +1 plus die üblichen Boni. Ein Folgeangriff: 1W4 ohne erneuten Attribut-, Waffen- oder Berserker-Schadensbonus. Jeder Hieb hat einen eigenen Trefferwurf.',
    aiInstructions: 'Genau zwei Trefferwürfe insgesamt; der Folgeangriff erfolgt nur nach einem Haupttreffer. Feste eigene Schadensboni und zusätzliche Schadenswürfel gelten nur beim Hauptangriff.',
    followUpAttack: { ...entry.followUpAttack, repeatCount: 1, damageFormula: '1d4', damageBonus: 0,
      inheritDamageModifier: false, inheritBonusDamage: false, repeatPerAttackRules: false }
  };
}

export function reconcileClassDamageCondition(condition = {}) {
  return !condition.berserk && String(condition.id || '').startsWith('fenrir-berserkergang-state')
    ? replaceFormula(condition, '1d6', '1d4') : condition;
}

export function reconcileClassDamageRevisions(profile = {}) {
  const collections = [profile.techniques, profile.abilities, profile.magic?.spells];
  const hasCondition = profile.conditions?.some(condition => String(condition.id || '').startsWith('fenrir-berserkergang-state'));
  if (!hasCondition && !collections.some(entries => entries?.some(entry => FORMULA_REVISIONS[entry?.id] || FENRIR_TECHNIQUE_REVISIONS[entry?.id] || entry?.id === 'fenrir-twin-axe-flurry'))) return profile;
  return { ...profile,
    techniques: profile.techniques?.map(reviseEntry), abilities: profile.abilities?.map(reviseEntry),
    ...(profile.conditions ? { conditions: profile.conditions.map(reconcileClassDamageCondition) } : {}),
    ...(profile.magic ? { magic: { ...profile.magic, spells: profile.magic.spells?.map(reviseEntry) } } : {})
  };
}
