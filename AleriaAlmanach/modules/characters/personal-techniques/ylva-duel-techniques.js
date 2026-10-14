// Personal training, deliberately absent from every class and form catalog.
import { createYlvaWeaponTechniques } from './ylva-weapon-techniques.js';
import { YLVA_DUEL_OWNER_ID, describeYlvaTechniques } from './ylva-technique-prose.js';
export { YLVA_DUEL_OWNER_ID } from './ylva-technique-prose.js';
const cost = (resourceId, name) => ({ resourceId, name, amount: 1, scope: resourceId === 'special-action' ? 'persistent' : 'comment' });
const action = cost('action', 'Aktion'), reaction = cost('reaction', 'Reaktion'), special = cost('special-action', 'Besondere Aktion');
const duration = 'Bis zum Ende des nächsten eigenen Beitrags';
const base = { active: true, minimumLevel: 7, status: 'confirmed', trainingForm: 'Persönliche Techniken · Ylva Wolfshorn',
  category: 'technique', weaponTypes: ['spear'], maximumTargets: 1, damageFormula: '',
  damageModel: { mode: 'none' }, auraBypass: { allowed: false },
  tags: 'Persönlich · Ylva Wolfshorn · Kontrolle · Kein Schaden' };
const evadeId = 'ylva-aus-der-angriffslinie';

export function createYlvaDuelTechniques() {
  return describeYlvaTechniques([{ ...base, id: 'ylva-schafthebel', name: 'Schafthebel', activationType: 'action', costs: [action, reaction],
    description: 'Ylva hebelt mit ihrem Speerschaft die geführte Waffe aus dem Griff. Ein normaler Speer-Angriffswurf, aber kein Schaden. Nur nach Treffer: KRF-Rettungswurf SG 14. Bei Scheitern fällt die Waffe aufnehmbar in die Szene. Körperwaffen bleiben erhalten und erhalten stattdessen −1 Angriff im nächsten eigenen Beitrag.',
    effect: 'Kein Schaden. Nach Treffer KRF SG 14 oder Entwaffnung; Aufheben und Waffenwechsel kosten ihre regulären Ressourcen.',
    target: 'Ein Gegner', range: 'Waffenreichweite', requirements: 'Ylvas persönliche Ausbildung; geführter Speer.', effects: [],
    secondarySave: { enabled: true, attributeKey: 'strength', fixedDc: 14, addProficiency: false,
      failureCondition: { id: 'ylva-schafthebel-entwaffnet', name: 'Entwaffnet', description: 'Die geführte Waffe liegt aufnehmbar in der Szene.', duration: '1 eigener Beitrag', disarm: true, mechanics: {} } }
  }, { ...base, id: evadeId, name: 'Aus der Angriffslinie', activationType: 'reaction', costs: [reaction, special],
    description: 'Ylva bereitet mit dem Speer eine ausweichende Abwehr vor. Der nächste gegen sie gerichtete Waffen- oder Technikangriff erhält Nachteil. Einmalig, auch bei Fehlschlag verbraucht; verfällt spätestens am Ende ihres nächsten eigenen Beitrags. Kein Schaden, keine freie Bewegung und keine rückwirkende Änderung eines Wurfs.',
    effect: 'Einmal Nachteil auf den nächsten eingehenden Waffenangriff.', target: 'Selbst', range: 'Selbst', duration,
    requirements: 'Ylvas persönliche Ausbildung; geführter Speer. Vor dem gegnerischen Angriff vorbereiten.',
    effects: [{ type: 'buff', target: 'self', on: 'always', condition: { id: evadeId, name: 'Aus der Angriffslinie',
      description: 'Der nächste eingehende Waffen-/Technikangriff hat Nachteil; einmalig, auch bei Fehlschlag verbraucht.',
      duration, durationModel: { kind: 'actor-comments', remainingActorComments: 1 }, stanceGroup: 'ylva-speerabwehr', mechanics: {},
      triggerRules: [{ id: `${evadeId}-once`, name: 'Aus der Angriffslinie', phase: 'pre-roll', recipient: 'target',
        sourceRelation: 'self', activation: 'passive', frequency: 'comment', condition: 'always',
        actionKinds: ['weapon', 'technique'], weaponAttackOnly: true, effects: { rollMode: 'disadvantage' },
        resultEffects: [{ id: `${evadeId}-consume`, type: 'remove-condition', target: 'target', conditionId: evadeId, on: 'always' }] }]
    } }]
  }, ...createYlvaWeaponTechniques()]);
}

export function addYlvaDuelTechniques(character) {
  if (character.id !== YLVA_DUEL_OWNER_ID || !character.combatProfile) return character;
  const additions = createYlvaDuelTechniques();
  const ids = new Set(additions.map(t => t.id));
  return { ...character, combatProfile: { ...character.combatProfile,
    techniques: describeYlvaTechniques([...(character.combatProfile.techniques || []).filter(t => !ids.has(t.id)), ...additions]) } };
}
