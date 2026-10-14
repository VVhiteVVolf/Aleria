import { createWeaponTechniqueDamageProfile } from '../../combat-styles/weapon-technique-budget.js';
import { createPositionCondition } from '../../combat-styles/martial-position-effects.js';

const names = { action: 'Aktion', 'bonus-action': 'Bonusaktion', reaction: 'Reaktion', 'special-action': 'Besondere Aktion' };
const costs = ids => ids.map(resourceId => ({ resourceId, name: names[resourceId], amount: 1,
  scope: resourceId === 'special-action' ? 'persistent' : 'comment' }));
const A = 'action', B = 'bonus-action', R = 'reaction', S = 'special-action';
const startDuration = { kind: 'actor-comments', remainingActorComments: 1, expiresAt: 'actor-start' };
const nextDuration = { kind: 'actor-comments', remainingActorComments: 1 };
const damageEffect = { type: 'damage', target: 'target', on: 'hit' };
const penalty = amount => {
  const condition = createPositionCondition(false);
  return { ...condition, description: `Der nächste eigene Waffen-/Technikangriff erhält −${amount} Angriff; auch bei Fehlschlag verbraucht. Verfällt am Ende des nächsten eigenen Beitrags.`,
    triggerRules: condition.triggerRules.map(rule => ({ ...rule, effects: { attackModifier: -amount } })) };
};
const lock = { id: 'ylva-reaktion-gebunden', name: 'Waffenarm gebunden', blockedResource: R,
  description: 'Keine Reaktion bis zum Ende des nächsten eigenen Beitrags.', duration: 'Bis zum Ende des nächsten eigenen Beitrags', durationModel: nextDuration, mechanics: {} };
const save = (dc, failureCondition) => ({ enabled: true, attributeKey: 'strength', fixedDc: dc, addProficiency: false, failureCondition });

function technique(id, name, resources, narrative, rules, spec = {}) {
  const payment = costs(resources);
  const { sidearm, ...mechanics } = spec;
  return { id: `ylva-${id}`, name, active: true, minimumLevel: 7, status: 'confirmed', category: 'technique',
    trainingForm: 'Persönliche Techniken · Ylva Wolfshorn', weaponTypes: sidearm ? ['dagger', 'axe'] : ['spear'],
    maximumTargets: 1, target: 'Ein Gegner', range: 'Waffenreichweite',
    activationType: resources.includes(A) ? A : resources.includes(B) ? B : R, costs: payment,
    description: `${narrative} (${rules})`, effect: `(${rules})`,
    requirements: `Ylvas persönliche Ausbildung; geführter ${sidearm ? 'Sax oder geführte Handaxt' : 'Speer'}.`,
    tags: 'Persönlich · Ylva Wolfshorn', auraBypass: { allowed: false }, effects: [damageEffect],
    ...createWeaponTechniqueDamageProfile({ damageControl: true }, payment), ...mechanics };
}

export function createYlvaWeaponTechniques() {
  return [
    technique('streifender-dorn', 'Streifender Dorn', [B],
      'Ylva lässt Dornwacht an der Deckung entlanggleiten und streift die Waffenhand, um den nächsten Hieb aus der Bahn zu bringen.',
      'Trefferwurf −2; leichter Schaden: 1W4 + halber positiver Schadensbonus, abgerundet. Bei Treffer einmal −1 auf den nächsten Waffen-/Technikangriff des Ziels, spätestens bis Ende seines nächsten Beitrags.',
      { attackBonus: -2, effects: [damageEffect, { type: 'debuff', target: 'target', on: 'hit', condition: penalty(1) }] }),
    technique('kurzer-jagdstoss', 'Kurzer Jagdstoß', [B],
      'Aus der ruhenden Deckung schnellt Ylvas Speerspitze vor und kehrt sofort an ihre Seite zurück.',
      'Leichter Angriff: 1W4 + halber positiver Schadensbonus, abgerundet. Kein zusätzlicher Effekt.'),
    technique('schaftfang-und-stoss', 'Schaftfang und Stoß', [B, R],
      'Ylva fängt die gegnerische Waffenführung am Schaft ab und stößt durch die entstandene Lücke.',
      '1× Waffenwürfel + Ausbildungswürfel + Schadensbonus. Nach Treffer KRF SG 14: bei Scheitern einmal −2 auf den nächsten Waffen-/Technikangriff, spätestens bis Ende des nächsten eigenen Beitrags.',
      { secondarySave: save(14, penalty(2)) }),
    technique('brechender-dorn', 'Brechender Dorn', [B, R, S],
      'Mit einem tiefen Stoß treibt Ylva die Deckung auf, hakt den Schaft hinter die geführte Waffe und reißt sie mit einer Drehung aus dem Griff.',
      '2× Waffenwürfel + Ausbildungswürfel + Schadensbonus. Nach Treffer KRF SG 14: bei Scheitern Entwaffnung. Körperwaffen bleiben erhalten und erhalten stattdessen −1 Angriff bis Ende des nächsten eigenen Beitrags.',
      { secondarySave: save(14, { id: 'ylva-brechender-dorn-entwaffnet', name: 'Entwaffnet', disarm: true,
        description: 'Die geführte Waffe fällt aufnehmbar in die Szene.', duration: '1 eigener Beitrag', mechanics: {} }) }),
    technique('zwei-dornen', 'Zwei Dornen', [A, R],
      'Ylva stößt kurz zur Mitte, zieht Dornwacht zurück und setzt einen zweiten Stoß aus einem anderen Winkel nach.',
      'Zwei getrennte Trefferwürfe; je 1× Waffenwürfel + Schadensbonus, ohne Ausbildungswürfel. Der zweite Angriff folgt auch nach einem Fehlschlag.',
      { damageModel: { mode: 'weapon-dice', weaponDiceMultiplier: 1, scalingSteps: [] },
        followUpAttack: { enabled: true, afterMiss: true, inheritWeapon: true, repeatCount: 1 } }),
    technique('niederhaltender-stoss', 'Niederhaltender Stoß', [A, B],
      'Ylva setzt die Spitze an und hält den Waffenarm unter Druck, ehe der Gegner zu einer schnellen Antwort ansetzen kann.',
      '1× Waffenwürfel + Ausbildungswürfel + Schadensbonus. Nach Treffer KRF SG 14: bei Scheitern keine Reaktion bis Ende des nächsten eigenen Beitrags.',
      { secondarySave: save(14, lock) }),
    technique('kurzer-schneidenzug', 'Kurzer Schneidenzug', [B],
      'Ylva zieht die kurze Schneide knapp über die offene Flanke und nimmt die Hand wieder in Deckung.',
      'Sax und Handaxt: 1W4 + halber positiver Schadensbonus, abgerundet. Kein zusätzlicher Effekt.', { sidearm: true }),
    technique('rueckschnitt', 'Rückschnitt', [R],
      'Ylva führt die zurückgezogene Klinge in einem engen Bogen erneut gegen den Gegner.',
      'Sax oder Handaxt: 1× Waffenwürfel + Ausbildungswürfel + Schadensbonus. Eigenständiger Reaktionsangriff; kein vorausgehender gegnerischer Treffer nötig.', { sidearm: true }),
    technique('wolfsgriff', 'Wolfsgriff', [B, R, S],
      'Ylva bindet mit der freien Hand den Waffenarm und treibt ihre kurze Schneide in die ungeschützte Seite.',
      'Sax oder Handaxt: 2× Waffenwürfel + Ausbildungswürfel + Schadensbonus. Nach Treffer KRF SG 12: bei Scheitern keine Reaktion bis Ende des nächsten eigenen Beitrags.',
      { sidearm: true, secondarySave: save(12, lock) }),
    technique('drei-dornen-ein-sturz', 'Drei Dornen, ein Sturz', [B, A, R],
      'Ylva stößt mit Dornwacht zu, setzt aus der Gegenrichtung nach und täuscht mit der freien Hand einen Griff nach dem Gegner an. Während dessen Deckung der Hand folgt, schwingt sie den Speerschaft tief herum und versucht, ihm die Füße unter dem Körper wegzufegen.',
      'Drei getrennte Trefferwürfe, auch nach Fehlschlägen: 1W4; 1W8; 1W6 + voller Schadensbonus. Kein Ausbildungswürfel. Danach immer GES SG 18. Bei Scheitern: zu Boden gefegt; Ylva hat gegen dieses Ziel Vorteil bis zum Ende ihres nächsten Beitrags, das Ziel keine Reaktion bis zum Beginn seines nächsten Beitrags. Kein zusätzlicher Bonusaktionsentzug.',
      { damageFormula: '1d4', damageModel: { mode: 'fixed', inheritDamageModifier: false, inheritBonusDamage: false, scalingSteps: [] },
        followUpAttack: { enabled: true, afterMiss: true, repeatCount: 2, steps: [
          { damageFormula: '1d8', inheritDamageModifier: false, inheritBonusDamage: false },
          { damageFormula: '1d6', inheritDamageModifier: true, inheritBonusDamage: false }
        ] },
        secondarySave: { ...save(18, { ...lock, id: 'ylva-zu-boden-gefegt', name: 'Zu Boden gefegt',
          description: 'Keine Reaktion bis zum Beginn des nächsten eigenen Beitrags. Kein zusätzlicher Bonusaktionsentzug.',
          duration: 'Bis zum Beginn des nächsten eigenen Beitrags', durationModel: startDuration }),
          attributeKey: 'dexterity', timing: 'after-sequence', requiresHit: false,
          actorFailureCondition: { id: 'ylva-feger-oeffnung', name: 'Öffnung nach dem Feger',
            description: 'Vorteil ausschließlich gegen das gefegte Ziel bis zum Ende von Ylvas nächstem Beitrag.',
            duration: 'Bis zum Ende des nächsten eigenen Beitrags', durationModel: nextDuration, mechanics: {},
            triggerRules: [{ id: 'ylva-feger-vorteil', name: 'Öffnung nach dem Feger', phase: 'pre-roll', recipient: 'actor',
              sourceRelation: 'self', activation: 'passive', frequency: 'always', condition: 'always',
              actionKinds: ['weapon', 'technique'], effects: { rollMode: 'advantage' } }] }
        } })
  ];
}
