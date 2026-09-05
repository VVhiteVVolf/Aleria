import { DRACHENTANZ_FORM_IDS } from '../drachentanz-ids.js?v=20260905-cenyr-character-training-v1';
import { createDrachentanzTechnique, movementEffect, secondarySave, temporaryCondition } from './drachentanz-technique-factory.js?v=20260905-damage-balance-v1';

const WEAPONS = { milwr: ['sword', 'spear', 'axe', 'battleaxe', 'club', 'mace'] };
const make = spec => createDrachentanzTechnique({
  formId: DRACHENTANZ_FORM_IDS.drachling,
  slotBands: ['drachling'],
  tier: 'Drachling-Attacke',
  allowedClassIds: ['milwr'],
  classWeaponProfiles: WEAPONS,
  weaponTypes: ['sword', 'spear', 'axe', 'mace'],
  branchId: 'milwr-drachling',
  ...spec
});

export const DRACHLING_TECHNIQUES = Object.freeze([
  make({ slug: 'drachling-soldnerkeil', name: 'Söldnerkeil', minimumLevel: 6, costs: ['action', 'special-action'],
    description: 'Ein kurzer Antritt und ein schwerer Feldhieb bilden den einfachen Eintritt in den Drachling.', effect: 'Verursacht Technikschaden und drängt das Ziel bei misslungenem Stärkerettungswurf aus der Linie.', secondarySave: secondarySave('drachling-keil', 'Aus der Linie gedrängt', 'Der Söldnerkeil bricht den festen Stand.', { armorClass: -1 }) }),
  make({ slug: 'drachling-schildgassenhieb', name: 'Schildgassenhieb', minimumLevel: 8, costs: ['action', 'reaction'],
    description: 'Der Milwr schlägt aus einer engen Lücke zwischen Verbündeten, Schild oder Deckung.', effect: 'Verursacht Technikschaden und gewährt bis zum nächsten Beitrag +1 Rüstungsklasse.', effects: [temporaryCondition('drachling-schildgasse', 'Schildgasse', 'Der Milwr kehrt nach dem Hieb in die enge Deckung zurück.', { armorClass: 1 }, { target: 'self', on: 'always' })] }),
  make({ slug: 'drachling-harter-wechsel', name: 'Harter Wechsel', minimumLevel: 10, costs: ['action', 'bonus-action', 'special-action'],
    description: 'Der Milwr wechselt Griff oder Richtung mitten im Schlag und setzt mit Körpergewicht nach.', effect: 'Verursacht Technikschaden und erlaubt 2 Meter Eigenbewegung.', effects: [movementEffect('drachling-wechsel', 2, 'move', 'self')] }),
  make({ slug: 'drachling-reihenbrecher', name: 'Reihenbrecher', minimumLevel: 12, costs: ['action', 'bonus-action', 'reaction'], maximumTargets: 2, target: 'Bis zu zwei Gegner',
    description: 'Ein breiter Angriff reißt eine Lücke für die eigene Reihe.', effect: 'Trifft bis zu zwei Gegner mit je Technikschaden.' }),
  make({ slug: 'drachling-letzter-sold', name: 'Letzter Sold', minimumLevel: 15, costs: ['action', 'bonus-action', 'reaction', 'special-action'],
    description: 'Der vollendete Drachling setzt alle praktische Erfahrung in einen einzigen entschlossenen Abschluss.', effect: 'Verursacht Technikschaden, erhält +1 Angriff und gewährt bis zum nächsten Beitrag +1 Rüstungsklasse.', attackBonus: 1, effects: [temporaryCondition('drachling-letzter-sold', 'Stand des Veteranen', 'Der Veteran bleibt nach dem Abschluss kampfbereit gedeckt.', { armorClass: 1 }, { target: 'self', on: 'always' })] })
]);
