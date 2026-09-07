import { DRACHENTANZ_FORM_IDS as F } from '../drachentanz-ids.js?v=20260908-cenyr-paths-v1';
import { createDrachentanzTechnique, movementEffect, secondarySave, temporaryCondition } from './drachentanz-technique-factory.js?v=20260908-cenyr-paths-v1';

function lance(spec) {
  return createDrachentanzTechnique({
    formId: F.lanzendrache,
    slotBands: ['expert'],
    tier: spec.minimumLevel >= 17 ? 'Meistertechnik des Lanzendrachen' : 'Cantref-Pfad',
    allowedClassIds: ['cantref'],
    classWeaponProfiles: { cantref: ['lance'] },
    weaponTypes: ['spear', 'polearm'],
    weaponRuleSetId: 'cantref-polearm',
    branchId: 'cantref-lance-path',
    maximumTargets: 1,
    requirements: 'Eine geführte Lanze; ein genannter Anritt benötigt mindestens 3 Meter geraden Bewegungsraum.',
    tags: ['Cantref', 'Lanze'],
    ...spec
  });
}

function bow(spec) {
  const profiles = spec.profiles || ['longbow', 'shortbow'];
  return createDrachentanzTechnique({
    formId: F.bogendrache,
    slotBands: ['expert'],
    tier: spec.minimumLevel >= 17 ? 'Meisterschuss des Bogendrachen' : 'Helwyr-Pfad',
    allowedClassIds: ['helwyr'],
    classWeaponProfiles: { helwyr: profiles },
    weaponTypes: ['bow'],
    branchId: profiles.length === 1 && profiles[0] === 'shortbow' ? 'helwyr-shortbow' : 'helwyr-longbow',
    range: 'Fernkampf',
    requirements: `Ein geführter ${profiles.length === 1 && profiles[0] === 'shortbow' ? 'Kurzbogen' : profiles.length === 1 ? 'Langbogen' : 'Lang- oder Kurzbogen'} und passende Munition.`,
    tags: ['Helwyr', 'Bogen'],
    ...spec
  });
}

export const LANZENDRACHEN_TECHNIQUES = Object.freeze([
  lance({ slug: 'lanzendrache-erste-bahn', name: 'Erste Bahn der Lanze', minimumLevel: 9, costs: ['action', 'reaction'],
    description: 'Der Cantref setzt Spitze, Schaft und Körper auf eine einzige, gerade Angriffsbahn.', effect: 'Verursacht Technikschaden und erhält +1 Angriff.', attackBonus: 1 }),
  lance({ slug: 'lanzendrache-ruecklaufende-spitze', name: 'Rücklaufende Spitze', minimumLevel: 11, costs: ['reaction', 'bonus-action', 'special-action'], activationType: 'reaction',
    description: 'Nach der Parade gleitet die Lanze am gegnerischen Angriff zurück und stößt aus dem Rücklauf.', effect: 'Reaktionsangriff mit Technikschaden und 2 Metern Eigenbewegung.',
    effects: [movementEffect('lanzendrache-ruecklauf', 2, 'move', 'self')] }),
  lance({ slug: 'lanzendrache-schafttor', name: 'Schafttor', minimumLevel: 13, costs: ['action', 'bonus-action', 'reaction'],
    description: 'Ein harter Schaftschlag öffnet die Deckung für die nachsetzende Spitze.', effect: 'Verursacht Technikschaden; ein misslungener Stärkerettungswurf gibt dem Ziel −2 Angriff.',
    secondarySave: secondarySave('lanzendrache-schafttor', 'Geöffnete Deckung', 'Der Schaftschlag hat Griff und Deckung auseinandergetrieben.', { attack: -2 }) }),
  lance({ slug: 'lanzendrache-weite-nadel', name: 'Weite Nadel', minimumLevel: 15, costs: ['action', 'special-action'],
    description: 'Die Spitze nutzt die ganze Reichweite der Lanze, ohne die eigene Mitte preiszugeben.', effect: 'Verursacht Technikschaden, erhält +1 Angriff und gewährt +1 Rüstungsklasse bis zum nächsten eigenen Beitrag.', attackBonus: 1,
    effects: [temporaryCondition('lanzendrache-weite-nadel', 'Weite Nadel', 'Die lange Waffenlinie hält die unmittelbare Antwort fern.', { armorClass: 1 }, { target: 'self', on: 'always' })] }),
  lance({ slug: 'lanzendrache-aura-an-der-spitze', name: 'Aura an der Spitze', minimumLevel: 17, costs: ['action', 'reaction', 'special-action', 'aura-focus'],
    description: 'Die gesamte Aura wird bis in den äußersten Punkt der Lanze geführt.', effect: 'Verursacht Technikschaden, erhält +2 Angriff und behandelt die Zielverteidigung als 2 Punkte niedriger.', attackBonus: 2, targetDefenseModifier: -2 }),
  lance({ slug: 'lanzendrache-durchgehender-anritt', name: 'Durchgehender Anritt', minimumLevel: 18, costs: ['action', 'bonus-action', 'reaction'],
    description: 'Ein gerader Anlauf trägt die Spitze durch die gegnerische Linie und den Cantref wieder hinaus.', effect: 'Verursacht Technikschaden und erlaubt 6 Meter Eigenbewegung.',
    effects: [movementEffect('lanzendrache-anritt', 6, 'move', 'self')] }),
  lance({ slug: 'lanzendrache-koenigliche-schranke', name: 'Königliche Schranke', minimumLevel: 19, costs: ['reaction', 'special-action', 'aura-focus'], activationType: 'reaction',
    description: 'Lanze und Aura bilden eine lange Schranke, an der der gegnerische Angriff zerbricht.', effect: 'Reaktionsangriff mit Technikschaden; bis zum nächsten eigenen Beitrag +3 Rüstungsklasse.',
    effects: [temporaryCondition('lanzendrache-schranke', 'Königliche Schranke', 'Die lange Wehrlinie schützt den Raum vor dem Cantref.', { armorClass: 3 }, { target: 'self', on: 'always' })] }),
  lance({ slug: 'lanzendrache-horizontstich', name: 'Horizontstich des Lanzendrachen', minimumLevel: 20,
    costs: ['action', 'bonus-action', 'reaction', { resourceId: 'special-action', amount: 2 }, { resourceId: 'aura-focus', amount: 2 }],
    description: 'Der Meister legt Körper, Anlauf, Lanze und Aura auf eine Linie, die scheinbar bis zum Horizont reicht.',
    effect: 'Verursacht Technikschaden, erhält +3 Angriff und behandelt die Zielverteidigung als 3 Punkte niedriger.', attackBonus: 3, targetDefenseModifier: -3 })
]);

export const BOGENDRACHEN_TECHNIQUES = Object.freeze([
  bow({ slug: 'bogendrache-ruhige-sehne', name: 'Ruhige Sehne', minimumLevel: 9, profiles: ['longbow'], costs: ['action', 'reaction'],
    description: 'Der Helwyr hält Atem und Sehne, bis nur noch ein sauberer Schussweg bleibt.', effect: 'Verursacht Technikschaden und erhält +1 Angriff.', attackBonus: 1 }),
  bow({ slug: 'bogendrache-flinker-nachschuss', name: 'Flinker Nachschuss', minimumLevel: 10, profiles: ['shortbow'], costs: ['bonus-action', 'special-action'],
    description: 'Ein kurzer Pfeil folgt sofort auf die Bewegung der gegnerischen Deckung.', effect: 'Verursacht Technikschaden und erlaubt 2 Meter Eigenbewegung.',
    effects: [movementEffect('bogendrache-nachschuss', 2, 'move', 'self')] }),
  bow({ slug: 'bogendrache-sehnenantwort', name: 'Sehnenantwort', minimumLevel: 11, profiles: ['longbow'], costs: ['reaction', 'special-action'], activationType: 'reaction',
    description: 'Der Pfeil löst sich als unmittelbare Antwort auf einen sichtbaren Angriff.', effect: 'Reaktionsschuss mit Technikschaden und +1 Angriff.', attackBonus: 1 }),
  bow({ slug: 'bogendrache-wandernder-halbmond', name: 'Wandernder Halbmond', minimumLevel: 12, profiles: ['shortbow'], costs: ['bonus-action', 'reaction', 'special-action'],
    description: 'Ein Seitenschritt und ein schneller Schuss beschreiben gemeinsam einen Halbkreis.', effect: 'Verursacht Technikschaden, erlaubt 4 Meter Eigenbewegung und gewährt +1 Rüstungsklasse.',
    effects: [movementEffect('bogendrache-halbmond', 4, 'move', 'self'), temporaryCondition('bogendrache-halbmond', 'Wandernde Deckung', 'Der Helwyr bleibt nach dem Schuss in Bewegung.', { armorClass: 1 }, { target: 'self', on: 'always' })] }),
  bow({ slug: 'bogendrache-nadel-im-wind', name: 'Nadel im Wind', minimumLevel: 13, profiles: ['longbow'], costs: ['action', 'aura-focus'],
    description: 'Aura stabilisiert einen langen Schuss gegen Wind und Bewegung.', effect: 'Verursacht Technikschaden und behandelt die Zielverteidigung als 2 Punkte niedriger.', targetDefenseModifier: -2 }),
  bow({ slug: 'bogendrache-doppelter-jagdschritt', name: 'Doppelter Jagdschritt', minimumLevel: 14, profiles: ['shortbow'], costs: ['action', 'bonus-action', 'reaction'],
    description: 'Zwei schnelle Schüsse begleiten zwei gegenläufige Schritte.', effect: 'Verursacht Technikschaden, erhält +1 Angriff und erlaubt 4 Meter Eigenbewegung.', attackBonus: 1,
    effects: [movementEffect('bogendrache-jagdschritt', 4, 'move', 'self')] }),
  bow({ slug: 'bogendrache-auge-der-lichtung', name: 'Auge der Lichtung', minimumLevel: 15, profiles: ['longbow'], costs: ['action', 'special-action'],
    description: 'Der Helwyr findet selbst zwischen Verbündeten und Hindernissen ein schmales Schussfenster.', effect: 'Verursacht Technikschaden, erhält +2 Angriff und behandelt die Zielverteidigung als 1 Punkt niedriger.', attackBonus: 2, targetDefenseModifier: -1 }),
  bow({ slug: 'bogendrache-rueckwaertsfeder', name: 'Rückwärtsfeder', minimumLevel: 16, profiles: ['shortbow'], costs: ['reaction', 'bonus-action', 'special-action'], activationType: 'reaction',
    description: 'Der Helwyr weicht aus und schießt noch während des Rückschritts.', effect: 'Reaktionsschuss mit Technikschaden, 5 Meter Eigenbewegung und +2 Rüstungsklasse.',
    effects: [movementEffect('bogendrache-rueckwaertsfeder', 5, 'move', 'self'), temporaryCondition('bogendrache-rueckwaertsfeder', 'Rückwärtsfeder', 'Der Abstand und die laufende Bewegung erschweren die Antwort.', { armorClass: 2 }, { target: 'self', on: 'always' })] }),
  bow({ slug: 'bogendrache-aura-pfeil', name: 'Aura-Pfeil des fernen Auges', minimumLevel: 17, profiles: ['longbow'], costs: ['action', 'reaction', 'special-action', 'aura-focus'],
    description: 'Sehne, Pfeil und Aura werden zu einer einzigen geraden Flugbahn.', effect: 'Verursacht Technikschaden, erhält +2 Angriff und ist bei natürlicher 19–20 kritisch.', attackBonus: 2, criticalThreshold: 19 }),
  bow({ slug: 'bogendrache-federkreis', name: 'Fester Federkreis', minimumLevel: 18, profiles: ['shortbow'], costs: ['action', 'bonus-action', 'reaction'], maximumTargets: 3, target: 'Bis zu drei Gegner',
    description: 'Drei Pfeile halten drei Gegner in einer eng begrenzten Schussfolge unter Druck.', effect: 'Trifft bis zu drei Gegner mit je Technikschaden.' }),
  bow({ slug: 'bogendrache-schwarzer-horizont', name: 'Schwarzer Horizont', minimumLevel: 19, profiles: ['longbow'], costs: ['action', 'reaction', 'special-action', 'aura-focus'],
    description: 'Ein kaum sichtbarer Pfeil zieht über die ganze offene Linie des Schlachtfeldes.', effect: 'Verursacht Technikschaden, erhält +3 Angriff und behandelt die Zielverteidigung als 2 Punkte niedriger.', attackBonus: 3, targetDefenseModifier: -2 }),
  bow({ slug: 'bogendrache-letzte-feder', name: 'Letzte Feder des Bogendrachen', minimumLevel: 20, profiles: ['longbow'],
    costs: ['action', 'bonus-action', 'reaction', { resourceId: 'special-action', amount: 2 }, { resourceId: 'aura-focus', amount: 2 }],
    description: 'Der Meister setzt sein ganzes Repertoire in einen einzigen vollkommenen Fernschuss.',
    effect: 'Verursacht Technikschaden, erhält +3 Angriff, behandelt die Zielverteidigung als 3 Punkte niedriger und ist bei natürlicher 19–20 kritisch.', attackBonus: 3, targetDefenseModifier: -3, criticalThreshold: 19 })
]);
