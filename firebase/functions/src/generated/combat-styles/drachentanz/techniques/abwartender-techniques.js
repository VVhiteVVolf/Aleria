import { DRACHENTANZ_FORM_IDS } from '../drachentanz-ids.js?v=20260905-cenyr-character-training-v1';
import { movementEffect, secondarySave, temporaryCondition } from './drachentanz-technique-factory.js?v=20260905-damage-balance-v1';
import { createExpertPathTechnique } from './expert-path-helpers.js?v=20260905-damage-balance-v1';

const F = DRACHENTANZ_FORM_IDS.abwartender;
const make = spec => createExpertPathTechnique(F, 'abwartender', { activationType: 'reaction', ...spec });

export const ABWARTENDER_TECHNIQUES = Object.freeze([
  make({ slug: 'rueckschritt-des-waechters', name: 'Rückschritt des Wächters', minimumLevel: 9, costs: ['reaction'], uchelwyrLance: true,
    description: 'Der Ritter entzieht dem Angriff genau einen Schritt und antwortet in die entstandene Lücke.', effect: 'Reaktionsangriff mit Technikschaden und anschließend bis zu 2 Metern Eigenbewegung.', effects: [movementEffect('abwartender-rueckschritt', 2, 'move', 'self')] }),
  make({ slug: 'stille-schuppe', name: 'Stille Schuppe', minimumLevel: 10, costs: ['reaction', 'special-action'],
    description: 'Waffe und Körper bleiben eng geschlossen, bis der gegnerische Schlag an der Haltung abgleitet.', effect: 'Verursacht Technikschaden und gewährt bis zum nächsten eigenen Beitrag +1 Rüstungsklasse.', effects: [temporaryCondition('abwartender-stille-schuppe', 'Stille Schuppe', 'Die körpernahe Deckung lässt kaum eine neue Öffnung.', { armorClass: 1 }, { target: 'self', on: 'always' })] }),
  make({ slug: 'falsche-oeffnung', name: 'Falsche Öffnung', minimumLevel: 11, costs: ['bonus-action', 'reaction'], uchelwyrLance: true,
    description: 'Eine absichtlich schwache Haltung lenkt den Gegner in den vorbereiteten Konter.', effect: 'Reaktionsangriff mit Technikschaden und +1 Angriff.', attackBonus: 1 }),
  make({ slug: 'gebrochener-ansturm', name: 'Gebrochener Ansturm', minimumLevel: 12, costs: ['reaction', 'special-action'],
    description: 'Der Ritter nimmt dem Ansturm seine Richtung und schlägt gegen den verlorenen Schwerpunkt.', effect: 'Verursacht Technikschaden. Misslingt ein Stärkerettungswurf, erhält das Ziel −1 Angriff und −1 Rüstungsklasse.', secondarySave: secondarySave('abwartender-ansturm', 'Gebrochener Ansturm', 'Der verlorene Schwerpunkt schwächt Angriff und Deckung.', { attack: -1, armorClass: -1 }) }),
  make({ slug: 'spiegelzahn', name: 'Spiegelzahn', minimumLevel: 13, costs: ['reaction', 'aura-focus'], uchelwyrLance: true,
    description: 'Aura und Waffe spiegeln den gegnerischen Kraftweg und senden ihn als Gegenstoß zurück.', effect: 'Verursacht Technikschaden; bis zum nächsten Beitrag +1 Rüstungsklasse.', effects: [temporaryCondition('abwartender-spiegelzahn', 'Spiegelnde Haltung', 'Die Aura hält den nächsten Kraftweg in der Parade.', { armorClass: 1 }, { target: 'self', on: 'always' })] }),
  make({ slug: 'atemlose-mauer', name: 'Atemlose Mauer', minimumLevel: 14, costs: ['reaction', 'bonus-action'],
    description: 'Für einen Herzschlag werden Atem, Aura und Deckung vollkommen unbeweglich.', effect: 'Verursacht Technikschaden und gewährt +2 Rüstungsklasse bis zum nächsten eigenen Beitrag.', effects: [temporaryCondition('abwartender-mauer', 'Atemlose Mauer', 'Eine verdichtete Aurahaltung schützt den gesamten Körper.', { armorClass: 2 }, { target: 'self', on: 'always' })] }),
  make({ slug: 'wendepunkt', name: 'Wendepunkt', minimumLevel: 15, costs: ['action', 'bonus-action', 'reaction'], uchelwyrLance: true,
    description: 'Der Ritter wartet bis zum letzten sicheren Augenblick und kehrt dann Richtung und Initiative des Duells um.', effect: 'Verursacht Technikschaden und gibt dem Ziel bei misslungenem Geschicklichkeitsrettungswurf −2 Angriff.', secondarySave: secondarySave('abwartender-wendepunkt', 'Umgekehrte Initiative', 'Der Gegner muss seine Angriffsfolge neu ordnen.', { attack: -2 }, { attributeKey: 'dexterity' }) }),
  make({ slug: 'kreis-der-stillen-schuppen', name: 'Kreis der stillen Schuppen', minimumLevel: 16, costs: ['reaction', 'bonus-action', 'special-action'], maximumTargets: 2, target: 'Bis zu zwei Gegner',
    description: 'Zwei Angriffe werden in einem engen Verteidigungskreis nacheinander aufgenommen und beantwortet.', effect: 'Trifft bis zu zwei Gegner mit je Technikschaden.' }),
  make({ slug: 'hunger-des-wartenden', name: 'Hunger des Wartenden', minimumLevel: 17, costs: ['action', 'reaction', 'special-action', 'aura-focus'], uchelwyrLance: true,
    description: 'Jede verstrichene Sekunde verdichtet die Aura, bis der erste Fehler des Gegners den gesamten Konter entfesselt.', effect: 'Verursacht Technikschaden und behandelt die Zielverteidigung als 1 Punkt niedriger.', targetDefenseModifier: -1 }),
  make({ slug: 'unbewegtes-herz', name: 'Unbewegtes Herz', minimumLevel: 18, costs: ['action', 'reaction', 'special-action'],
    description: 'Der Meister bleibt im Zentrum des Kampfes vollkommen ruhig und lässt Angriff um Angriff an seiner Aura brechen.', effect: 'Verursacht Technikschaden und gewährt +3 Rüstungsklasse bis zum nächsten eigenen Beitrag.', effects: [temporaryCondition('abwartender-herz', 'Unbewegtes Herz', 'Vollkommene Ruhe verdichtet die Verteidigung.', { armorClass: 3 }, { target: 'self', on: 'always' })] }),
  make({ slug: 'letzte-oeffnung', name: 'Letzte Öffnung', minimumLevel: 19, costs: ['action', 'bonus-action', 'reaction', 'special-action', 'aura-focus'], uchelwyrLance: true,
    description: 'Der Meister bietet eine einzige, tödlich überzeugende Öffnung und schließt sie hinter dem eindringenden Gegner.', effect: 'Verursacht Technikschaden, erhält +1 Angriff und senkt die Zielverteidigung für diesen Angriff um 2.', attackBonus: 1, targetDefenseModifier: -2 }),
  make({ slug: 'urteil-des-alten-drachen', name: 'Urteil des alten Drachen', minimumLevel: 20, costs: ['action', 'bonus-action', 'reaction', { resourceId: 'special-action', amount: 2 }, { resourceId: 'aura-focus', amount: 2 }],
    description: 'Der Meister nimmt den vollständigen Angriff des Gegners auf und beantwortet ihn mit der über Jahre gesammelten Ruhe des Pfades.', effect: 'Verursacht Technikschaden; bis zum nächsten eigenen Beitrag +3 Rüstungsklasse und +2 Angriff.', effects: [temporaryCondition('abwartender-urteil', 'Ruhe des alten Drachen', 'Nach dem vollkommenen Konter bleibt die Meisterhaltung bestehen.', { armorClass: 3, attack: 2 }, { target: 'self', on: 'always' })] })
]);
