import { createPositionCondition, POSITION_PENALTY_TEXT } from '../../combat-styles/martial-position-effects.js';

const critical = (id, name, effects, resultEffects = []) => ({ id, name, phase: 'pre-damage',
  description: resultEffects.length ? `Bei kritischem Treffer: ${POSITION_PENALTY_TEXT}`
    : 'Bei kritischem Treffer: +2 zusätzlicher Schaden, auch bei passenden Waffentechniken. Dieser Zusatz wird nicht verdoppelt.',
  recipient: 'actor', sourceRelation: 'self', activation: 'passive', frequency: 'always', condition: 'critical-hit',
  actionKinds: ['weapon', 'technique'], effects, resultEffects });

export function upgradeWolfshornEquipment(profile, kind) {
  const weapons = (profile.weapons || []).map(w => {
    if (kind === 'ylva') {
      if (w.id === 'ylva-speer') return { ...w, name: 'Dornwacht · Wolfshorn-Jagdspeer', damageFormula: '1d8',
        versatileDamageFormula: '1d10', damageBonus: 1,
        notes: 'Sorgfältig ausbalancierter Grenzerspeer. +1 Waffenschaden. Ylvas persönliche Speerausbildung erlaubt ihr Geschicklichkeit.' };
      if (w.id === 'ylva-handaxt') return { ...w, attackBonus: 1, notes: 'Griffige, ausgewogene Grenzeraxt. +1 Angriff.' };
      if (w.id === 'ylva-langbogen') return { ...w, damageBonus: 1, notes: `+1 Waffenschaden. Festnagelnder Schuss bei kritischem Treffer: ${POSITION_PENALTY_TEXT}`,
        triggerRules: [critical('wolfshorn-pinning-shot', 'Festnagelnder Schuss', {}, [{ type: 'debuff', target: 'target', on: 'always',
          condition: createPositionCondition(false, { name: 'Festnagelnder Schuss' }) }])] };
    } else {
      if (['asgeir-axt-rechts', 'asgeir-axt-links'].includes(w.id)) return { ...w, attackBonus: 1, damageBonus: 1,
        notes: 'Erprobte Wolfshorn-Schmiedearbeit: +1 Angriff und +1 Schaden mit dieser Axt.' };
      if (w.id === 'asgeir-grossaxt') return { ...w, damageBonus: 1, notes: '+1 Waffenschaden. Bei kritischem Treffer +2 weiterer Schaden, nicht nochmals verdoppelt.',
        triggerRules: [critical('wolfshorn-heavy-critical', 'Schwerer Wolfshieb', { damageModifier: 2 })] };
    }
    return w;
  });
  const armorItems = (profile.armorItems || []).map(a => {
    if (a.id === 'ylva-leder') return { ...a, damageProtection: { amount: 1, damageTypes: ['hieb', 'stich'], name: 'Grenzerleder' },
      mechanics: { ...a.mechanics, saveModifiers: [{ kind: 'poison', bonus: 2 }] },
      notes: 'Angelegt: −1 Hieb-/Stichschaden je Treffer und +2 auf Rettungswürfe gegen Gift. Kein zusätzlicher RK-Bonus.' };
    if (a.id === 'asgeir-schuppen') return { ...a, damageProtection: { amount: 2, damageTypes: ['hieb', 'wucht'], name: 'Wolfshorn-Schuppen' },
      notes: 'Angelegt: −2 Hieb-/Wuchtschaden je Treffer. Kein zusätzlicher RK-Bonus.' };
    if (a.id === 'asgeir-rundschild') return { ...a, notes: 'Abfangen: Der erste körperliche Treffer pro gegnerischem Beitrag verursacht 2 Schaden weniger. Nur solange geführt.',
      triggerRules: [{ id: 'wolfshorn-shield-catch', name: 'Abfangen', phase: 'pre-damage', recipient: 'target', sourceRelation: 'self',
        description: 'Der erste körperliche Treffer pro gegnerischem Beitrag verursacht 2 Schaden weniger. Nur solange der Schild geführt wird.',
        activation: 'passive', frequency: 'comment', condition: 'would-hit', damageTypes: ['hieb', 'stich', 'wucht', 'physisch'],
        effects: { damageReduction: 2 } }] };
    return a;
  });
  return { ...profile, weapons, armorItems };
}
