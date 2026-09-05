import { DRACHENTANZ_FORM_IDS } from '../drachentanz-ids.js?v=20260905-cenyr-character-training-v1';
import { movementEffect, secondarySave, temporaryCondition } from './drachentanz-technique-factory.js?v=20260905-damage-balance-v1';
import { createExpertPathTechnique } from './expert-path-helpers.js?v=20260905-damage-balance-v1';

const F = DRACHENTANZ_FORM_IDS.zorniger;
const make = spec => createExpertPathTechnique(F, 'zorniger', { attackBonus: -1, ...spec });
const exposed = (id, penalty = -1) => temporaryCondition(id, 'Offene Zorneshaltung', 'Der ungezügelte Angriff lässt die eigene Deckung offen.', { armorClass: penalty }, { target: 'self', on: 'always' });

export const ZORNIGER_TECHNIQUES = Object.freeze([
  make({ slug: 'erster-zornausbruch', name: 'Erster Zornausbruch', minimumLevel: 9, costs: ['action', 'bonus-action'], uchelwyrLance: true,
    description: 'Der Ritter löst die erste kurze Folge ungezügelter Schläge, bevor der Gegner den Rhythmus erkennt.', effect: 'Verursacht Technikschaden; bis zum nächsten eigenen Beitrag −1 Rüstungsklasse.', effects: [exposed('zorniger-ausbruch')] }),
  make({ slug: 'unruhige-klaue', name: 'Unruhige Klaue', minimumLevel: 10, costs: ['action', 'reaction'],
    description: 'Ein abgebrochener Schlag kehrt sofort aus einem zweiten Winkel zurück.', effect: 'Verursacht Technikschaden und erhält +1 Angriff, öffnet aber die eigene Deckung um 1.', attackBonus: 1, effects: [exposed('zorniger-klaue')] }),
  make({ slug: 'kampfschrei-der-unruhe', name: 'Kampfschrei der Unruhe', minimumLevel: 11, costs: ['action', 'reaction'], uchelwyrLance: true,
    description: 'Ein plötzlicher Schrei bricht Erwartung und Atemrhythmus des Gegners.', effect: 'Verursacht Technikschaden; ein misslungener Weisheitsrettungswurf gibt dem Ziel −2 Angriff.', secondarySave: secondarySave('zorniger-kampfschrei', 'Vom Schrei gebrochen', 'Der unerwartete Schrei stört den nächsten Angriff.', { attack: -2 }, { attributeKey: 'wisdom', dcAttributeKey: 'charisma' }) }),
  make({ slug: 'rasende-folge', name: 'Rasende Folge', minimumLevel: 12, costs: ['action', 'bonus-action', 'reaction'], maximumTargets: 2, target: 'Bis zu zwei Gegner',
    description: 'Die Waffe wechselt ohne erkennbare Ordnung zwischen zwei Zielen.', effect: 'Trifft bis zu zwei Gegner mit je Technikschaden; anschließend −1 Rüstungsklasse.', effects: [exposed('zorniger-folge')] }),
  make({ slug: 'aurafieber', name: 'Aurafieber', minimumLevel: 13, costs: ['action', 'aura-focus'], uchelwyrLance: true,
    description: 'Unruhige Aura beschleunigt den Angriff, ohne ihn vollkommen zu kontrollieren.', effect: 'Verursacht Technikschaden und erhält +1 Angriff; anschließend −1 Rüstungsklasse.', attackBonus: 1, effects: [exposed('zorniger-aurafieber')] }),
  make({ slug: 'beissender-grimm', name: 'Beißender Grimm', minimumLevel: 14, costs: ['action', 'bonus-action', 'reaction'],
    description: 'Jeder abgewehrte Schlag wird sofort mit größerer Kraft wiederholt.', effect: 'Verursacht Technikschaden und behandelt die Zielverteidigung als 1 Punkt niedriger; anschließend −1 Rüstungsklasse.', targetDefenseModifier: -1, effects: [exposed('zorniger-grimm')] }),
  make({ slug: 'zwei-herzschlaege-zorn', name: 'Zwei Herzschläge Zorn', minimumLevel: 15, costs: ['action', 'bonus-action', 'reaction'], uchelwyrLance: true,
    description: 'Zwei kurze Ausbrüche folgen einander, ehe der Körper zur Ruhe zurückfinden kann.', effect: 'Verursacht Technikschaden und erhält +1 Angriff; anschließend −2 Rüstungsklasse.', attackBonus: 1, effects: [exposed('zorniger-herzschlaege', -2)] }),
  make({ slug: 'sturm-ohne-richtung', name: 'Sturm ohne Richtung', minimumLevel: 16, costs: ['action', 'bonus-action', 'reaction', 'special-action'], maximumTargets: 3, target: 'Bis zu drei Gegner',
    description: 'Der Ritter wirft sich in eine unberechenbare Folge aus Schritten und Schlägen.', effect: 'Trifft bis zu drei Gegner mit je Technikschaden und erlaubt 3 Meter Eigenbewegung; anschließend −2 Rüstungsklasse.', effects: [movementEffect('zorniger-sturm', 3, 'move', 'self'), exposed('zorniger-sturm', -2)] }),
  make({ slug: 'rote-schuppe', name: 'Rote Schuppe', minimumLevel: 17, costs: ['action', 'reaction', 'special-action', 'aura-focus'], uchelwyrLance: true,
    description: 'Schmerz und Zorn werden in eine einzige harte Angriffslinie gepresst.', effect: 'Verursacht Technikschaden, erhält +1 Angriff und senkt die Zielverteidigung um 1; anschließend −2 Rüstungsklasse.', attackBonus: 1, targetDefenseModifier: -1, effects: [exposed('zorniger-rote-schuppe', -2)] }),
  make({ slug: 'entfesselter-drache', name: 'Entfesselter Drache', minimumLevel: 18, costs: ['action', 'bonus-action', 'reaction'],
    description: 'Der Ritter gibt jede Vorsicht auf und jagt den Gegner mit einer verheerenden Schlagfolge.', effect: 'Verursacht Technikschaden und erhält +2 Angriff; anschließend −3 Rüstungsklasse.', attackBonus: 2, effects: [exposed('zorniger-entfesselt', -3)] }),
  make({ slug: 'zornbrand', name: 'Zornbrand', minimumLevel: 19, costs: ['action', 'bonus-action', 'reaction', 'special-action', 'aura-focus'], maximumTargets: 3, target: 'Bis zu drei Gegner', uchelwyrLance: true,
    description: 'Die überladene Aura bricht in einer Kette roher Angriffe aus dem Körper.', effect: 'Trifft bis zu drei Gegner mit je Technikschaden, behandelt ihre Verteidigung als 2 Punkte niedriger und senkt die eigene Rüstungsklasse um 3.', targetDefenseModifier: -2, effects: [exposed('zorniger-zornbrand', -3)] }),
  make({ slug: 'letzter-zorn-des-drachen', name: 'Letzter Zorn des Drachen', minimumLevel: 20, costs: ['action', 'bonus-action', 'reaction', { resourceId: 'special-action', amount: 2 }, { resourceId: 'aura-focus', amount: 2 }],
    description: 'Der Meister entlädt jeden Rest von Kraft und Aura in einer letzten, erschreckend unruhigen Folge.', effect: 'Verursacht Technikschaden, erhält +2 Angriff und senkt die Zielverteidigung um 2; anschließend −4 Rüstungsklasse.', attackBonus: 2, targetDefenseModifier: -2, effects: [exposed('zorniger-letzter-zorn', -4)] })
]);
