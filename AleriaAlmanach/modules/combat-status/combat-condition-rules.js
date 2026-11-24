const advantage = { attackRollMode: 'advantage', skillRollMode: 'advantage' };
const disadvantage = { attackRollMode: 'disadvantage', skillRollMode: 'disadvantage' };
const immobile = { blocksMovement: true };
const incapacitated = { ...immobile, mechanics: { blocksActions: true } };

// A preset is a rule identifier. A display name or an icon can belong to a
// different, source-specific effect and does not select rules.
export const COMBAT_CONDITION_RULES = Object.freeze({
  advantage: { name: 'Vorteil', kind: 'buff', mechanics: advantage, description: 'Vorteil auf Angriffe und Fertigkeitsproben. Gleichzeitig aktiver Nachteil hebt ihn auf.' },
  disadvantage: { name: 'Nachteil', kind: 'debuff', mechanics: disadvantage, description: 'Nachteil auf Angriffe und Fertigkeitsproben. Gleichzeitig aktiver Vorteil hebt ihn auf.' },
  blessed: { name: 'Gesegnet', kind: 'buff', mechanics: { attack: 1, savingThrow: 1 }, description: '+1 auf Angriffe und Rettungswürfe.' },
  protected: { name: 'Geschützt', kind: 'buff', mechanics: { armorClass: 1 }, description: '+1 RK.' },
  bane: { name: 'Verflucht', kind: 'debuff', mechanics: { attack: -1, savingThrow: -1 }, tags: 'fluch', description: '−1 auf Angriffe und Rettungswürfe.' },
  poisoned: { name: 'Vergiftet', kind: 'debuff', mechanics: disadvantage, tags: 'gift', description: 'Nachteil auf Angriffe und Fertigkeitsproben.' },
  burning: { name: 'Brennend', kind: 'debuff', periodicDamage: { amount: 2, damageType: 'Feuer', group: 'burning' }, tags: 'brennend, feuer', description: 'Feuerschaden zu Beginn jedes eigenen Beitrags. Feuerresistenz und temporäre TP werden eingerechnet.' },
  bleeding: { name: 'Blutend', kind: 'debuff', periodicDamage: { amount: 1, group: 'bleeding' }, endsOnHealing: true, tags: 'blutend, blutung', description: 'TP-Verlust zu Beginn jedes eigenen Beitrags. Tatsächliche Heilung beendet die Blutung.' },
  burned: { name: 'Verbrannt', mechanics: { attack: -1 }, tags: 'verbrennung', description: '−1 auf Angriffe durch die Verbrennung.' },
  frostburn: { name: 'Frostbrand', mechanics: { movement: -3, saveAttributeModifiers: [{ attributeKey: 'dexterity', bonus: -1 }] }, tags: 'frostbrand, kälte', description: '−3 m Bewegung und −1 auf Geschicklichkeitsrettungen.' },
  chilled: { name: 'Unterkühlt', mechanics: { movement: -2 }, tags: 'kälte', description: '−2 m Bewegung.' },
  frozen: { name: 'Gefroren', ...immobile, blockedResource: 'reaction', tags: 'kälte', description: 'Eigenständige Bewegung und Reaktionen sind gesperrt.' },
  blinded: { name: 'Geblendet', blockedSense: 'vision', mechanics: { attackRollMode: 'disadvantage' }, tags: 'blendung', description: 'Nachteil auf Angriffe. Aufgaben, die ausdrücklich Sicht erfordern, sind gesperrt.' },
  deafened: { name: 'Taub', blockedSense: 'hearing', description: 'Aufgaben, die ausdrücklich Gehör erfordern, sind gesperrt.' },
  silenced: { name: 'Verstummt', blocksVoice: true, description: 'Handlungen mit verbindlicher Stimmvoraussetzung sind gesperrt.' },
  prone: { name: 'Liegend', blockedResource: 'bonus-action', description: 'Die Bonusaktion ist gesperrt. Bewegung und Angriffswerte bleiben erhalten.' },
  restrained: { name: 'Festgesetzt', ...immobile, description: 'Eigenständige Bewegung ist gesperrt. Befreiung und weitere Folgen richten sich nach der Quelle.' },
  festgehalten: { name: 'Festgehalten', ...incapacitated, mechanics: { ...incapacitated.mechanics, attackRollMode: 'disadvantage' }, description: 'Freiwillige Handlungen, Reaktionen und eigenständige Bewegung sind gesperrt. Angriffe haben Nachteil.' },
  paralyzed: { name: 'Gelähmt', ...incapacitated, description: 'Eigenständige Bewegung, freiwillige Handlungen und Reaktionen sind gesperrt. Rettungswürfe und Abwarten bleiben möglich.' },
  stunned: { name: 'Betäubt', mechanics: { blocksActions: true }, description: 'Freiwillige Handlungen und Reaktionen sind gesperrt. Rettungswürfe und Abwarten bleiben möglich.' },
  dazed: { name: 'Benommen', blockedResource: 'action', description: 'Die Hauptaktion ist gesperrt. Bonusaktion und Reaktion bleiben verfügbar.' },
  sleeping: { name: 'Schlafend', mechanics: { blocksActions: true }, tags: 'schlaf', description: 'Freiwillige Handlungen und Reaktionen sind gesperrt. Rettungswürfe und Abwarten bleiben möglich. Die Quelle bestimmt das Aufwecken.' },
  unconscious: { name: 'Bewusstlos', ...incapacitated, description: 'Freiwillige Handlungen, Reaktionen und eigenständige Bewegung sind gesperrt.' },
  petrified: { name: 'Versteinert', ...incapacitated, description: 'Freiwillige Handlungen, Reaktionen und eigenständige Bewegung sind gesperrt.' },
  fear: { name: 'Verängstigt', mechanics: { attackRollMode: 'disadvantage' }, tags: 'furcht', description: 'Nachteil auf Angriffe.' },
  exhausted: { name: 'Erschöpft', mechanics: { movement: -2, skill: -1 }, description: '−2 m Bewegung und −1 auf Fertigkeitsproben.' },
  surprised: { name: 'Überrascht', blockedResource: 'reaction', description: 'Reaktionen sind gesperrt.' },
  entangled: { name: 'Verstrickt', mechanics: { movement: -3, savingThrowDisadvantageAttributes: ['dexterity'] }, description: '−3 m Bewegung und Nachteil auf Geschicklichkeitsrettungen.' },
  slowed: { name: 'Verlangsamt', mechanics: { movement: -3, initiative: -1 }, description: '−3 m Bewegung und −1 Initiative.' },
  weakened: { name: 'Geschwächt', mechanics: { damage: -2 }, description: '−2 Waffenschaden.' },
  wet: { name: 'Nass', mechanics: { damageAffinities: [{ damageType: 'Feuer', response: 'resistant' }, { damageType: 'Blitz', response: 'vulnerable' }] }, tags: 'nass', description: 'Halber Feuerschaden und doppelter Blitzschaden.' }
});

export function getCombatConditionRule(presetId) {
  return Object.hasOwn(COMBAT_CONDITION_RULES, presetId) ? COMBAT_CONDITION_RULES[presetId] : null;
}

export function getPeriodicConditionDamage(condition = {}) {
  const amount = Math.min(999, Math.trunc(Number(condition.periodicDamage?.amount)));
  if (!(amount > 0)) return null;
  return { amount, damageType: String(condition.periodicDamage.damageType || '').trim().slice(0, 100),
    group: String(condition.periodicDamage.group || '').trim().slice(0, 80) };
}

export function withCombatConditionRules(condition = {}, { scene = true } = {}) {
  const rule = getCombatConditionRule(condition.presetId);
  // Fire exposure on a regenerating creature is a separate, authored rule.
  if (!rule || condition.id === 'regeneration-fire-exposure') return condition;
  const { name, description, kind, tags, mechanics, periodicDamage, ...capabilities } = rule;
  const combinedTags = [...new Set([condition.tags, tags].filter(Boolean).join(',').split(',').map(tag => tag.trim()).filter(Boolean))];
  return { ...capabilities, ...condition,
    name: condition.name || name, description: condition.description || description, statusKind: condition.statusKind || kind || 'condition',
    ...(combinedTags.length ? { tags: combinedTags.join(', ') } : {}),
    ...(scene && periodicDamage && !Object.hasOwn(condition, 'periodicDamage') && !(condition.criticalPeriodicLoss > 0) ? { periodicDamage } : {}),
    mechanics: { ...mechanics, ...condition.mechanics }
  };
}
