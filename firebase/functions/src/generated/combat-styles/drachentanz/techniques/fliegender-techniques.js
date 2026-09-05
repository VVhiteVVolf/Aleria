import { DRACHENTANZ_FORM_IDS } from '../drachentanz-ids.js?v=20260905-cenyr-character-training-v1';
import { movementEffect, secondarySave, temporaryCondition } from './drachentanz-technique-factory.js?v=20260905-damage-balance-v1';
import { createExpertPathTechnique } from './expert-path-helpers.js?v=20260905-damage-balance-v1';

const F = DRACHENTANZ_FORM_IDS.fliegender;
const make = spec => createExpertPathTechnique(F, 'fliegender', spec);

export const FLIEGENDER_TECHNIQUES = Object.freeze([
  make({ slug: 'aufwindtritt', name: 'Aufwindtritt', minimumLevel: 9, costs: ['bonus-action'], activationType: 'bonus-action', uchelwyrLance: true,
    description: 'Ein federnder Schritt trägt den Ritter aus der gegnerischen Linie und unmittelbar in den eigenen Angriff.', effect: 'Verursacht Technikschaden und erlaubt 3 Meter Eigenbewegung.', effects: [movementEffect('fliegender-aufwind', 3, 'move', 'self')] }),
  make({ slug: 'fluegelwechsel', name: 'Flügelwechsel', minimumLevel: 10, costs: ['action', 'bonus-action'],
    description: 'Der Ritter wechselt während des Hiebs die Seite und entzieht sich dem erwarteten Gegenstoß.', effect: 'Verursacht Technikschaden; bis zum nächsten eigenen Beitrag +1 Rüstungsklasse.', effects: [temporaryCondition('fliegender-fluegelwechsel', 'Flügelwechsel', 'Der schnelle Seitenwechsel erschwert Gegenangriffe.', { armorClass: 1 }, { target: 'self', on: 'always' })] }),
  make({ slug: 'sturzlinie', name: 'Sturzlinie', minimumLevel: 11, costs: ['action', 'reaction'], uchelwyrLance: true,
    description: 'Aus einem Sprung oder Gefälle fällt die Waffe auf die kürzeste Linie zum Ziel.', effect: 'Verursacht Technikschaden und erhält +1 Angriff.', attackBonus: 1 }),
  make({ slug: 'doppelschwinge', name: 'Doppelschwinge', minimumLevel: 12, costs: ['action', 'bonus-action', 'reaction'], maximumTargets: 2, target: 'Bis zu zwei Gegner',
    description: 'Zwei gegenläufige Bewegungen treffen Gegner auf beiden Seiten der Flugbahn.', effect: 'Trifft bis zu zwei Gegner mit je Technikschaden; beide Angriffe werden einzeln ausgewertet.' }),
  make({ slug: 'aurasprung', name: 'Aurasprung', minimumLevel: 13, costs: ['action', 'aura-focus'], uchelwyrLance: true,
    description: 'Ein kurzer Aurastoß hebt Schritt und Angriff über die natürliche Reichweite hinaus.', effect: 'Verursacht Technikschaden und erlaubt 5 Meter Eigenbewegung.', effects: [movementEffect('fliegender-aurasprung', 5, 'move', 'self')] }),
  make({ slug: 'wirbelpfad', name: 'Wirbelpfad', minimumLevel: 14, costs: ['action', 'bonus-action', 'reaction'], maximumTargets: 2, target: 'Bis zu zwei Gegner',
    description: 'Die Waffe zeichnet zwei schnelle Kreise entlang einer wechselnden Laufbahn.', effect: 'Trifft bis zu zwei Gegner mit je Technikschaden.' }),
  make({ slug: 'himmelsschnitt', name: 'Himmelsschnitt', minimumLevel: 15, costs: ['action', 'bonus-action', 'reaction'], uchelwyrLance: true,
    description: 'Der Ritter steigt unter die Deckung und führt die Waffe in einer steilen Linie nach oben.', effect: 'Verursacht Technikschaden und behandelt die Zielverteidigung als 1 Punkt niedriger.', targetDefenseModifier: -1 }),
  make({ slug: 'tanz-ueber-klingen', name: 'Tanz über Klingen', minimumLevel: 16, costs: ['action', 'bonus-action', 'reaction'],
    description: 'Der Ritter durchquert die gegnerische Reichweite, ohne an einer einzigen Angriffslinie zu verweilen.', effect: 'Verursacht Technikschaden, erlaubt 4 Meter Eigenbewegung und gewährt +2 Rüstungsklasse.', effects: [movementEffect('fliegender-klingen', 4, 'move', 'self'), temporaryCondition('fliegender-klingen', 'Tanz über Klingen', 'Ständige Bewegung verwischt die eigene Angriffslinie.', { armorClass: 2 }, { target: 'self', on: 'always' })] }),
  make({ slug: 'drachenflug', name: 'Drachenflug', minimumLevel: 17, costs: ['action', 'reaction', 'special-action', 'aura-focus'], uchelwyrLance: true,
    description: 'Aura, Körper und Waffe verschmelzen zu einem einzigen beschleunigten Vorstoß.', effect: 'Verursacht Technikschaden und wird mit Vorteil gewürfelt.', rollMode: 'advantage', effects: [movementEffect('fliegender-drachenflug', 6, 'move', 'self')] }),
  make({ slug: 'sturmkranz', name: 'Sturmkranz', minimumLevel: 18, costs: ['action', 'bonus-action', 'reaction', 'special-action'], maximumTargets: 3, target: 'Bis zu drei Gegner',
    description: 'Der Meister umkreist die Front wie ein Sturm und setzt aus drei Winkeln nacheinander an.', effect: 'Trifft bis zu drei Gegner mit je Technikschaden.' }),
  make({ slug: 'grenzenloser-aufstieg', name: 'Grenzenloser Aufstieg', minimumLevel: 19, costs: ['action', 'bonus-action', 'reaction', 'special-action', 'aura-focus'], uchelwyrLance: true,
    description: 'Jeder Schritt beschleunigt den nächsten, bis die letzte Linie die Wahrnehmung des Gegners übersteigt.', effect: 'Verursacht Technikschaden, erhält +2 Angriff und erlaubt 6 Meter Eigenbewegung.', attackBonus: 2, effects: [movementEffect('fliegender-aufstieg', 6, 'move', 'self')] }),
  make({ slug: 'fallender-sternendrache', name: 'Fallender Sternendrache', minimumLevel: 20, costs: ['action', 'bonus-action', 'reaction', { resourceId: 'special-action', amount: 2 }, { resourceId: 'aura-focus', amount: 2 }],
    description: 'Der Meister steigt mit reiner Aurakraft aus jeder festen Linie und fällt als leuchtender Endhieb zurück.', effect: 'Verursacht Technikschaden, wird mit Vorteil gewürfelt und erlaubt 8 Meter Eigenbewegung.', rollMode: 'advantage', effects: [movementEffect('fliegender-sternendrache', 8, 'move', 'self')] })
]);
