import { DRACHENTANZ_FORM_IDS as F } from '../drachentanz-ids.js?v=20260908-cenyr-paths-v1';
import { createDrachentanzTechnique, movementEffect, secondarySave, temporaryCondition } from './drachentanz-technique-factory.js?v=20260908-cenyr-paths-v1';

const CLASS_WEAPONS = Object.freeze({
  teulu: ['sword'],
  cantref: ['spear', 'lance', 'partisan', 'trident', 'halberd'],
  uchelwyr: ['sword', 'lance'],
  arthwyr: ['greatsword', 'axe', 'battleaxe', 'club', 'mace'],
  helwyr: ['sword', 'dual-swords', 'dual-daggers']
});

function rise(spec) {
  return createDrachentanzTechnique({
    formId: F.aufsteigender,
    slotBands: ['expert'],
    tier: spec.minimumLevel >= 17 ? 'Meistertechnik des Aufstiegs' : 'Unterpfad des Fliegenden Drachen',
    allowedClassIds: Object.keys(CLASS_WEAPONS),
    classWeaponProfiles: CLASS_WEAPONS,
    weaponTypes: ['sword', 'spear', 'polearm', 'dagger', 'axe', 'mace'],
    weaponRuleSetId: 'cantref-polearm',
    uchelwyrCompatible: true,
    maximumTargets: 1,
    target: 'Ein Gegner',
    tags: ['Akrobatik', 'Geheimhaltung', 'Kritischer Treffer'],
    ...spec
  });
}

export const AUFSTEIGENDER_TECHNIQUES = Object.freeze([
  rise({ slug: 'aufsteigender-schattenanstieg', name: 'Schattenanstieg', minimumLevel: 9, costs: ['bonus-action', 'reaction'],
    description: 'Ein geduckter Schritt verschwindet unter der gegnerischen Blicklinie und steigt als Schnitt wieder auf.',
    effect: 'Verursacht Technikschaden, erlaubt 3 Meter Eigenbewegung und ist bei natürlicher 19–20 kritisch.', criticalThreshold: 19,
    effects: [movementEffect('aufsteigender-schattenanstieg', 3, 'move', 'self')] }),
  rise({ slug: 'aufsteigender-klaue-aus-dem-nichts', name: 'Klaue aus dem Nichts', minimumLevel: 11, costs: ['action', 'reaction'],
    description: 'Die Waffe bleibt bis zum letzten Schritt hinter Körper und Gelände verborgen.',
    effect: 'Verursacht Technikschaden, erhält +1 Angriff und ist bei natürlicher 19–20 kritisch.', attackBonus: 1, criticalThreshold: 19 }),
  rise({ slug: 'aufsteigender-stummer-absprung', name: 'Stummer Absprung', minimumLevel: 13, costs: ['reaction', 'special-action'], activationType: 'reaction',
    description: 'Der Ritter löst sich lautlos aus der bedrohten Linie und kehrt aus erhöhter Stellung zurück.',
    effect: 'Reaktionsangriff mit Technikschaden, 5 Meter Eigenbewegung und +2 Rüstungsklasse bis zum nächsten eigenen Beitrag.', criticalThreshold: 19,
    effects: [movementEffect('aufsteigender-absprung', 5, 'move', 'self'), temporaryCondition('aufsteigender-absprung', 'Stummer Absprung', 'Die neue Höhe und der verdeckte Winkel erschweren die Antwort.', { armorClass: 2 }, { target: 'self', on: 'always' })] }),
  rise({ slug: 'aufsteigender-verdeckter-gelenkschnitt', name: 'Verdeckter Gelenkschnitt', minimumLevel: 15, costs: ['action', 'bonus-action', 'reaction'],
    description: 'Ein kurzer Schnitt trifft aus der verdeckten Seite auf Knie, Ellenbogen oder Waffenhand.',
    effect: 'Verursacht Technikschaden; misslingt ein Geschicklichkeitsrettungswurf, verliert das Ziel bis zum Ende seines nächsten Beitrags 2 Meter Bewegung.', criticalThreshold: 19,
    secondarySave: secondarySave('aufsteigender-gelenkschnitt', 'Gebremster Schritt', 'Das getroffene Gelenk verkürzt den nächsten Stellungswechsel.', { movement: -2 }, { attributeKey: 'dexterity' }) }),
  rise({ slug: 'aufsteigender-drachensturz', name: 'Drachensturz aus schwarzem Himmel', minimumLevel: 17,
    costs: ['action', 'reaction', 'special-action', 'aura-focus'],
    description: 'Aura verschluckt den Ansatz der Bewegung, bis die Waffe aus einem hohen Winkel herabfällt.',
    effect: 'Verursacht Technikschaden, erhält +2 Angriff, erlaubt 6 Meter Eigenbewegung und ist bei natürlicher 18–20 kritisch.', attackBonus: 2, criticalThreshold: 18,
    effects: [movementEffect('aufsteigender-drachensturz', 6, 'move', 'self')] }),
  rise({ slug: 'aufsteigender-gipfel-ohne-schatten', name: 'Gipfel ohne Schatten', minimumLevel: 20,
    costs: ['action', 'bonus-action', 'reaction', { resourceId: 'special-action', amount: 2 }, { resourceId: 'aura-focus', amount: 2 }],
    description: 'Der Meister steigt durch jeden bewachten Winkel und beendet die Bewegung dort, wo kein Blick ihm folgen konnte.',
    effect: 'Verursacht Technikschaden, erhält +3 Angriff, behandelt die Zielverteidigung als 2 Punkte niedriger, erlaubt 8 Meter Eigenbewegung und ist bei natürlicher 18–20 kritisch.',
    attackBonus: 3, targetDefenseModifier: -2, criticalThreshold: 18, effects: [movementEffect('aufsteigender-gipfel', 8, 'move', 'self')] })
]);
