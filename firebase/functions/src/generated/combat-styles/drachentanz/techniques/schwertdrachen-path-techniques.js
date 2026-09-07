import { DRACHENTANZ_FORM_IDS as F } from '../drachentanz-ids.js?v=20260908-cenyr-paths-v1';
import {
  createDrachentanzTechnique,
  movementEffect,
  secondarySave,
  temporaryCondition
} from './drachentanz-technique-factory.js?v=20260908-cenyr-paths-v1';

const CLASS_WEAPONS = Object.freeze({
  teulu: ['sword'],
  cantref: ['spear', 'lance', 'partisan', 'trident', 'halberd'],
  uchelwyr: ['lance', 'sword'],
  helwyr: ['sword'],
  arthwyr: ['greatsword', 'axe', 'battleaxe', 'club', 'mace'],
  barddwyr: ['sword']
});

const CLASS_IDS = Object.freeze(Object.keys(CLASS_WEAPONS));

function duel(spec) {
  return createDrachentanzTechnique({
    formId: F.schwertdrache,
    slotBands: ['expert'],
    tier: spec.minimumLevel >= 17 ? 'Meisterduell' : 'Duellpfad',
    allowedClassIds: CLASS_IDS,
    classWeaponProfiles: CLASS_WEAPONS,
    weaponTypes: ['sword', 'spear', 'polearm', 'axe', 'mace'],
    weaponRuleSetId: 'cantref-polearm',
    uchelwyrCompatible: true,
    singleTargetOnly: true,
    maximumTargets: 1,
    target: 'Ein Duellgegner',
    requirements: 'Eine zum Klassenweg passende, geführte Waffe; niemals gegen mehrere Ziele zugleich.',
    tags: ['Duell', 'Einzelziel'],
    ...spec
  });
}

export const SCHWERTDRACHEN_PATH_TECHNIQUES = Object.freeze([
  duel({ slug: 'schwertdrache-eroeffnung-des-einen', name: 'Eröffnung des Einen', minimumLevel: 9, costs: ['action', 'reaction'],
    description: 'Die Waffe zeichnet eine klare Einladung, die nur dem einen Gegenüber gilt.', effect: 'Verursacht Technikschaden und erhält +1 Angriff.', attackBonus: 1 }),
  duel({ slug: 'schwertdrache-gebundene-spitze', name: 'Gebundene Spitze', minimumLevel: 10, costs: ['reaction', 'special-action'], activationType: 'reaction',
    description: 'Die gegnerische Waffe wird kurz gebunden und auf derselben Linie beantwortet.', effect: 'Reaktionsangriff mit Technikschaden; bis zum nächsten eigenen Beitrag +1 Rüstungsklasse.',
    effects: [temporaryCondition('schwertdrache-gebundene-spitze', 'Gebundene Spitze', 'Die gegnerische Angriffslinie bleibt an der eigenen Waffe gebunden.', { armorClass: 1 }, { target: 'self', on: 'always' })] }),
  duel({ slug: 'schwertdrache-antwort-der-krone', name: 'Antwort der Krone', minimumLevel: 11, costs: ['action', 'special-action'],
    description: 'Ein hoher Scheinhieb zwingt die Parade nach oben, ehe die Antwort unter ihr hindurchgeht.', effect: 'Verursacht Technikschaden und behandelt die Zielverteidigung als 1 Punkt niedriger.', targetDefenseModifier: -1 }),
  duel({ slug: 'schwertdrache-halbmondfinte', name: 'Halbmondfinte', minimumLevel: 12, costs: ['bonus-action', 'reaction', 'special-action'],
    description: 'Ein kleiner Bogen täuscht einen Rückzug vor und kehrt als schneller Schnitt zurück.', effect: 'Verursacht Technikschaden, erhält +1 Angriff und erlaubt 2 Meter Eigenbewegung.', attackBonus: 1,
    effects: [movementEffect('schwertdrache-halbmondfinte', 2, 'move', 'self')] }),
  duel({ slug: 'schwertdrache-abgezaehlter-atem', name: 'Abgezählter Atem', minimumLevel: 13, costs: ['action', 'reaction'],
    description: 'Der Ritter liest Atem und Schwerpunkt des Gegners, bevor er in dessen nächsten Takt schlägt.', effect: 'Verursacht Technikschaden; ein misslungener Weisheitsrettungswurf gibt dem Ziel −1 Angriff bis zum Ende seines nächsten Beitrags.',
    secondarySave: secondarySave('schwertdrache-atem', 'Gelesener Takt', 'Der eigene Rhythmus ist für einen Augenblick durchschaut.', { attack: -1 }, { attributeKey: 'wisdom' }) }),
  duel({ slug: 'schwertdrache-tiefe-bindung', name: 'Tiefe Bindung', minimumLevel: 14, costs: ['action', 'bonus-action', 'reaction'],
    description: 'Die Waffe nimmt die gegnerische Klinge tief auf und dreht sie aus der stärksten Linie.', effect: 'Verursacht Technikschaden; ein misslungener Stärkerettungswurf senkt den nächsten Angriff des Ziels um 2.',
    secondarySave: secondarySave('schwertdrache-tiefe-bindung', 'Aus der Linie gedreht', 'Die Waffenführung muss nach der tiefen Bindung neu geordnet werden.', { attack: -2 }) }),
  duel({ slug: 'schwertdrache-siebter-wechsel', name: 'Siebter Wechsel', minimumLevel: 15, costs: ['action', 'special-action'],
    description: 'Sechs sichtbare Wechsel verbergen einen siebten, der durch die letzte Deckung stößt.', effect: 'Verursacht Technikschaden, erhält +1 Angriff und behandelt die Zielverteidigung als 1 Punkt niedriger.', attackBonus: 1, targetDefenseModifier: -1 }),
  duel({ slug: 'schwertdrache-richtertritt', name: 'Richtertritt', minimumLevel: 16, costs: ['reaction', 'bonus-action', 'special-action'], activationType: 'reaction',
    description: 'Ein kurzer Seittritt nimmt die Angriffslinie auf und setzt die Antwort aus dem blinden Winkel.', effect: 'Reaktionsangriff mit Technikschaden, 3 Meter Eigenbewegung und +2 Rüstungsklasse bis zum nächsten eigenen Beitrag.',
    effects: [movementEffect('schwertdrache-richtertritt', 3, 'move', 'self'), temporaryCondition('schwertdrache-richtertritt', 'Seitliche Duellwacht', 'Der neue Winkel deckt die unmittelbare Antwort.', { armorClass: 2 }, { target: 'self', on: 'always' })] }),
  duel({ slug: 'schwertdrache-auraeid', name: 'Auraeid der Klinge', minimumLevel: 17, costs: ['action', 'reaction', 'special-action', 'aura-focus'],
    description: 'Der Eid an das eine Gegenüber bündelt Aura und Waffe in einem geraden Urteil.', effect: 'Verursacht Technikschaden, erhält +2 Angriff und ist bei natürlicher 19–20 kritisch.', attackBonus: 2, criticalThreshold: 19 }),
  duel({ slug: 'schwertdrache-ungebrochener-blick', name: 'Ungebrochener Blick', minimumLevel: 18, costs: ['action', 'bonus-action', 'reaction'],
    description: 'Der Ritter verweigert jede Ablenkung und verfolgt nur Haltung, Blick und Klinge des Gegenübers.', effect: 'Verursacht Technikschaden und gewährt bis zum nächsten eigenen Beitrag +2 Rüstungsklasse und +1 Angriff.',
    effects: [temporaryCondition('schwertdrache-blick', 'Ungebrochener Blick', 'Der Duellant hält die eine gegnerische Linie vollständig im Blick.', { armorClass: 2, attack: 1 }, { target: 'self', on: 'always' })] }),
  duel({ slug: 'schwertdrache-gnadenloses-mass', name: 'Gnadenloses Maß', minimumLevel: 19, costs: ['action', 'reaction', 'special-action', 'aura-focus'],
    description: 'Jeder Abstand wird auf die eine tödliche Reichweite verkürzt.', effect: 'Verursacht Technikschaden, erhält +2 Angriff und behandelt die Zielverteidigung als 2 Punkte niedriger.', attackBonus: 2, targetDefenseModifier: -2 }),
  duel({ slug: 'schwertdrache-letztes-urteil', name: 'Letztes Urteil des Schwertdrachen', minimumLevel: 20,
    costs: ['action', 'bonus-action', 'reaction', { resourceId: 'special-action', amount: 2 }, { resourceId: 'aura-focus', amount: 2 }],
    description: 'Die gesamte Duelllehre endet in einem einzigen, vollkommen gesetzten Abschluss gegen das erwählte Gegenüber.',
    effect: 'Verursacht Technikschaden, erhält +3 Angriff, behandelt die Zielverteidigung als 2 Punkte niedriger und ist bei natürlicher 19–20 kritisch.',
    attackBonus: 3, targetDefenseModifier: -2, criticalThreshold: 19 })
]);
