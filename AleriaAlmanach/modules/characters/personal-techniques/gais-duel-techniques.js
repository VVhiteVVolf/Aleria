export const GAIS_DUEL_OWNER_ID = 'person--haus-wyrm--gais-wyrm';

export function createGaisDuelTechniques() {
  const names = { action: 'Aktion', 'bonus-action': 'Bonusaktion', reaction: 'Reaktion', 'special-action': 'Besondere Aktion' };
  const rules = 'Ein Trefferwurf mit +2; 3× Waffenwürfel + voller Schadensbonus. Keine zusätzliche Entwaffnung oder Betäubung. Aktion + Bonusaktion + Reaktion + 1 Besondere Aktion. Zu Fuß und beritten; kein zusätzlicher Reittierschaden.';
  return [{ id: 'gais-wyrmsbrecher', name: 'Wyrmsbrecher', active: true, minimumLevel: 5, status: 'confirmed',
    trainingForm: 'Persönliche Techniken · Gais Wyrm', category: 'technique', weaponTypes: ['sword', 'spear'],
    description: `Gais lässt die gegnerische Waffe an seiner eigenen abgleiten, tritt in die geöffnete Linie und legt sein ganzes Gewicht in einen einzigen entschlossenen Stoß. (${rules})`,
    effect: `(${rules})`, requirements: 'Gais’ persönliche Ausbildung; geführte Lanze oder geführtes Schwert.',
    target: 'Ein Gegner', range: 'Waffenreichweite', maximumTargets: 1, activationType: 'action', attackBonus: 2,
    damageModel: { mode: 'weapon-dice', weaponDiceMultiplier: 3, scalingSteps: [] },
    effects: [{ type: 'damage', target: 'target', on: 'hit' }], auraBypass: { allowed: false }, tags: 'Persönlich · Gais Wyrm',
    costs: Object.entries(names).map(([resourceId, name]) => ({ resourceId, name, amount: 1,
      scope: resourceId === 'special-action' ? 'persistent' : 'comment' })) }];
}

export function addGaisDuelTechniques(character) {
  if (character.id !== GAIS_DUEL_OWNER_ID || !character.combatProfile) return character;
  const additions = createGaisDuelTechniques();
  const ids = new Set(additions.map(t => t.id));
  return { ...character, combatProfile: { ...character.combatProfile,
    techniques: [...(character.combatProfile.techniques || []).filter(t => !ids.has(t.id)), ...additions] } };
}
