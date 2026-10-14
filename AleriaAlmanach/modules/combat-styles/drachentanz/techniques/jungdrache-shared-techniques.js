import { DRACHENTANZ_FORM_IDS as F } from '../drachentanz-ids.js';
import { createWeaponTechniqueSave } from '../../weapon-technique-control.js';
import { createWeaponTechniqueDamageProfile } from '../../weapon-technique-budget.js';
import { createDrachentanzTechnique, temporaryCondition } from './drachentanz-technique-factory.js';

const DURATION = 'Bis zum Ende des nächsten eigenen Beitrags';
const GUARD = 'jungdrache-guard';
const CONDITION_PREFIX = 'jungdrache-shared-';

function make(spec) {
  const technique = createDrachentanzTechnique({ formId: F.jungdrache, status: 'confirmed', tier: 'Gemeinsame Grundform',
    slotBands: ['foundation'], weaponTypes: [], allowedClassIds: [], classWeaponProfiles: {},
    requirements: 'Waffe: Beliebig. Geführte Waffe, ihre Reichweite und gegebenenfalls Munition beachten.',
    auraBypassAllowed: false, ...spec, slug: `jungdrache-${spec.slug}` });
  // Control trades the usual bonus technique dice for a single normal weapon hit.
  if (!spec.noPrimaryDamage && !spec.fullTechniqueDamage && !spec.damageModel) technique.damageModel = {
    mode: 'weapon-dice', weaponDiceMultiplier: 1, bonusWeaponDice: 0, bonusFormula: '', scalingSteps: []
  };
  return technique;
}

function stance(slug, name, description, extra = {}, mechanics = {}) {
  const effect = temporaryCondition(CONDITION_PREFIX + slug, name, description, mechanics, { target: 'self', on: 'always', duration: DURATION });
  Object.assign(effect.condition, { stanceGroup: GUARD, ...extra });
  return effect;
}

function once(slug, name, effects, { recipient = 'actor', phase = 'pre-roll', condition = 'always' } = {}) {
  const conditionId = `${CONDITION_PREFIX}${slug}-condition`;
  return { id: `${slug}-once`, name, phase, recipient, sourceRelation: 'self', activation: 'passive',
    frequency: 'comment', actionKinds: ['weapon', 'technique'], weaponAttackOnly: true, condition, effects,
    resultEffects: [{ id: `${slug}-consume`, type: 'remove-condition', target: recipient === 'actor' ? 'self' : 'target',
      conditionId, on: 'always', notes: `${name} ist aufgebraucht.` }] };
}

function hindrance(slug, name, { blockedResource = '', prone = false, disarm = false } = {}) {
  return { id: `${CONDITION_PREFIX}${slug}`, name, duration: '1 eigener Beitrag',
    description: disarm ? 'Die geführte Waffe wird entwaffnet und liegt aufnehmbar in der Szene.'
      : prone ? 'Liegend: Die Bonusaktion entfällt im nächsten eigenen Beitrag. Kein Bewegungsabzug und kein Angriffsnachteil.'
        : `Im nächsten eigenen Beitrag ist ${blockedResource === 'action' ? 'die Aktion' : blockedResource === 'reaction' ? 'die Reaktion' : 'die Bonusaktion'} gesperrt.`,
    ...(blockedResource ? { blockedResource } : {}), ...(disarm ? { disarm: true } : {}),
    mechanics: {}, ...(prone ? { blockedResource: 'bonus-action' } : {}) };
}

function save(failureCondition, attributeKey = 'strength', strong = false) {
  return createWeaponTechniqueSave(failureCondition, { attributeKey, strong });
}

function damage(extraCap = 0) {
  const model = createWeaponTechniqueDamageProfile({}, [{ resourceId: 'action', amount: 1 }]).damageModel;
  return { ...model, weaponBonuses: extraCap ? [{ diceCount: 1, dieCap: extraCap }] : [] };
}

function counter(slug, name, minimumLevel, costs, consequence = null, saveAttribute = 'strength', enhanced = false) {
  const extra = consequence ? ` Bei Treffer: ${saveAttribute === 'constitution' ? 'KON' : saveAttribute === 'dexterity' ? 'GES' : 'KRF'}-Rettung SG 11 + Waffenattribut + Kompetenz; bei Scheitern ${consequence.description}` : '';
  const description = `Nach dem nächsten verfehlten Waffen- oder Technikangriff folgt einmal ein automatischer Gegenangriff mit Vorteil: ${enhanced ? 'Waffenbasis + 1 zusätzlicher Waffenwürfel + Ausbildungswürfel' : 'normaler Waffenschaden'} + Schadensbonus der dann geführten Waffe.${extra} Bis zum Ende des nächsten eigenen Beitrags; keine Konterketten. Treffer des Gegners lösen den Konter nicht aus.`;
  return make({ slug, name, minimumLevel, costs, noPrimaryDamage: true, target: 'Selbst', duration: DURATION,
    description: 'Der Jungdrache lässt dem Gegner eine scheinbare Lücke und hält die Antwort bereit.', effect: description,
    effects: [stance(slug, name, description, { counterAttack: { enabled: true,
      ...(enhanced ? { damageModel: damage(12) } : {}), secondarySave: consequence ? save(consequence, saveAttribute, true) : null } })] });
}

export const JUNGDRACHE_SHARED_TECHNIQUES = Object.freeze([
  make({ slug: 'sicherer-drachenhieb', name: 'Sicherer Drachenhieb', minimumLevel: 1, costs: ['action'], fullTechniqueDamage: true,
    description: 'Ein ruhiger Angriff entlang der kürzesten offenen Linie.', effect: 'Einzelangriff mit gewöhnlichem Technikschaden, ohne weiteren Zusatzeffekt.' }),
  make({ slug: 'geschuppte-deckung', name: 'Geschuppte Deckung', minimumLevel: 2, costs: ['reaction', 'bonus-action'],
    noPrimaryDamage: true, target: 'Selbst', duration: DURATION, description: 'Waffe und Körper schließen beide Seiten.',
    effect: '+2 RK bis zum Ende des nächsten eigenen Beitrags. Ersetzt andere Jungdrachen-Schutzhaltungen.',
    effects: [stance('geschuppte-deckung', 'Geschuppte Deckung', '+2 RK; ersetzt andere Jungdrachen-Schutzhaltungen.', {}, { armorClass: 2 })] }),
  make({ slug: 'verwurzelte-schuppe', name: 'Verwurzelte Schuppe', minimumLevel: 2, costs: ['bonus-action'],
    noPrimaryDamage: true, target: 'Selbst', duration: DURATION, description: 'Die Füße greifen den Boden; der Körper nimmt den bevorstehenden Treffer abgefedert auf.',
    effect: 'Der nächste schädigende Treffer verursacht 4 Schaden weniger. Einmalig; ersetzt andere Jungdrachen-Schutzhaltungen.',
    effects: [stance('verwurzelte-schuppe', 'Verwurzelte Schuppe', '−4 Schaden beim nächsten schädigenden Treffer.', { damageGuard: { reduction: 4, charges: 1 } })] }),
  make({ slug: 'gesammelter-blick', name: 'Gesammelter Blick', minimumLevel: 2, costs: ['bonus-action'],
    noPrimaryDamage: true, target: 'Selbst', duration: DURATION, description: 'Der Blick folgt der gegnerischen Deckung, bis sich die passende Angriffslinie öffnet.',
    effect: '+2 auf den nächsten Waffen- oder Technikangriff; auch ein Fehlschlag verbraucht die Vorbereitung.',
    effects: [stance('gesammelter-blick', 'Gesammelter Blick', '+2 auf den nächsten Angriff.', { stanceGroup: 'jungdrache-preparation',
      triggerRules: [once('gesammelter-blick', 'Gesammelter Blick', { attackModifier: 2 })] })] }),
  make({ slug: 'taeuschende-klaue', name: 'Täuschende Klaue', minimumLevel: 2, costs: ['action', 'bonus-action'],
    description: 'Ein knapper Treffer zieht die gegnerische Deckung aus ihrer Linie.', effect: 'Normaler Waffenschaden. Bei Treffer erhält der eigene nächste Waffen- oder Technikangriff Vorteil; einmalig.',
    effects: [{ ...stance('offene-linie', 'Offene Linie', 'Vorteil auf den nächsten Angriff.', { stanceGroup: 'jungdrache-preparation',
      triggerRules: [once('offene-linie', 'Offene Linie', { rollMode: 'advantage' })] }), on: 'hit' }] }),
  make({ slug: 'staubende-schwinge', name: 'Stäubende Schwinge', minimumLevel: 3, costs: ['action', 'reaction'],
    description: 'Ein präziser Treffer kippt den Gegner aus seinem sicheren Stand.', effect: 'Normaler Waffenschaden; GES-Rettung SG 10 + Waffenattribut + Kompetenz, bei Scheitern Liegend: keine Bonusaktion im nächsten eigenen Beitrag.',
    secondarySave: save(hindrance('liegend', 'Liegend', { prone: true }), 'dexterity') }),
  make({ slug: 'gebundene-klaue', name: 'Gebundene Klaue', minimumLevel: 3, costs: ['action', 'bonus-action'],
    description: 'Die Waffe bindet die gegnerische Gegenwehr, während der Treffer seinen Griff erschüttert.', effect: 'Normaler Waffenschaden; KRF-Rettung SG 10 + Waffenattribut + Kompetenz, bei Scheitern keine Reaktion im nächsten eigenen Beitrag.',
    secondarySave: save(hindrance('gebundene-klaue', 'Gebundene Klaue', { blockedResource: 'reaction' })) }),
  make({ slug: 'unruhiger-griff', name: 'Unruhiger Griff', minimumLevel: 4, costs: ['action', 'reaction'],
    description: 'Ein gezielter Treffer stört die schnelle Folgebewegung des Gegners.', effect: 'Normaler Waffenschaden; KRF-Rettung SG 10 + Waffenattribut + Kompetenz, bei Scheitern keine Bonusaktion im nächsten eigenen Beitrag.',
    secondarySave: save(hindrance('unruhiger-griff', 'Unruhiger Griff', { blockedResource: 'bonus-action' })) }),
  make({ slug: 'gleitende-schuppe', name: 'Gleitende Schuppe', minimumLevel: 4, costs: ['reaction'],
    noPrimaryDamage: true, target: 'Selbst', duration: DURATION, description: 'Eine fließende Haltung lässt die nächste gegnerische Angriffslinie ins Leere gleiten.',
    effect: 'Der nächste gegen dich gerichtete Waffen- oder Technikangriff hat Nachteil. Einmalig; ersetzt andere Jungdrachen-Schutzhaltungen.',
    effects: [stance('gleitende-schuppe', 'Gleitende Schuppe', 'Nachteil auf den nächsten eingehenden Waffenangriff.', {
      triggerRules: [once('gleitende-schuppe', 'Gleitende Schuppe', { rollMode: 'disadvantage' }, { recipient: 'target' })] })] }),
  counter('lauernde-klaue', 'Lauernde Klaue', 3, ['bonus-action', 'reaction']),
  counter('entwaffnende-klaue', 'Entwaffnende Klaue', 4, ['bonus-action', 'reaction', 'special-action'], hindrance('entwaffnet', 'Entwaffnet', { disarm: true }), 'strength', true),
  make({ slug: 'fallende-schwinge', name: 'Fallende Schwinge', minimumLevel: 5, costs: ['action', 'bonus-action', 'special-action'],
    damageModel: damage(12), description: 'Die Waffe trifft hoch, bevor ein tiefer Schaftzug den gegnerischen Stand öffnet.',
    effect: 'Direkter Angriff: Waffenbasis + 1 Waffenwürfel + Ausbildungswürfel + Schadensbonus. Nach Treffer GES-Rettung SG 11 + Waffenattribut + Kompetenz; bei Scheitern Liegend: keine Bonusaktion im nächsten eigenen Beitrag.',
    secondarySave: save(hindrance('liegend', 'Liegend', { prone: true }), 'dexterity', true) }),
  make({ slug: 'erstickte-antwort', name: 'Erstickte Antwort', minimumLevel: 5, costs: ['action', 'reaction'],
    damageModel: damage(4), description: 'Der Treffer drückt den Waffenarm zur Seite und unterbricht den angesetzten Gegenschlag.',
    effect: 'Direkter Angriff: Waffenbasis + 1 Waffen-Zusatzwürfel (höchstens W4) + Ausbildungswürfel + Schadensbonus. Nach Treffer KRF-Rettung SG 10 + Waffenattribut + Kompetenz; bei Scheitern keine Reaktion im nächsten eigenen Beitrag.',
    secondarySave: save(hindrance('erstickte-antwort', 'Erstickte Antwort', { blockedResource: 'reaction' })) }),
  make({ slug: 'drachenklammer', name: 'Drachenklammer', minimumLevel: 6, costs: ['action', 'reaction', 'special-action'],
    description: 'Ein schwer gesetzter Treffer nimmt dem Gegner für einen Augenblick jede klare Angriffslinie.', effect: 'Normaler Waffenschaden; KON-Rettung SG 11 + Waffenattribut + Kompetenz, bei Scheitern Benommen: im nächsten eigenen Beitrag keine Aktion. Bonusaktion und Reaktion bleiben verfügbar.',
    secondarySave: save(hindrance('benommen', 'Benommen', { blockedResource: 'action' }), 'constitution', true) }),
  counter('brechender-widerhall', 'Brechender Widerhall', 6, ['action', 'bonus-action', 'reaction', 'special-action'], hindrance('benommen', 'Benommen', { blockedResource: 'action' }), 'constitution', true),
  make({ slug: 'kurze-drachenspur', name: 'Kurze Drachenspur', minimumLevel: 1, costs: ['bonus-action'], fullTechniqueDamage: true,
    description: 'Ein schneller Angriff prüft die gegnerische Deckung.', effect: 'Leichter Einzelangriff mit dem Schaden einer schnellen Grundtechnik; kein kostenloser Folgeangriff.' })
]);
