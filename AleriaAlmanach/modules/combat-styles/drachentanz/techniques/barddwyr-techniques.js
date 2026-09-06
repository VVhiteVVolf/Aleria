import { DRACHENTANZ_FORM_IDS as F } from '../drachentanz-ids.js?v=20260905-cenyr-character-training-v1';
import { createDrachentanzTechnique, movementEffect, secondarySave, temporaryCondition } from './drachentanz-technique-factory.js?v=20260905-damage-balance-v1';

const RAPIER = { barddwyr: ['rapier'] };
const SWORD = { barddwyr: ['sword'] };

function bard(formId, branchId, profiles, spec) {
  return createDrachentanzTechnique({
    formId,
    slug: `barddwyr-${spec.slug}`,
    allowedClassIds: ['barddwyr'],
    classWeaponProfiles: profiles,
    weaponTypes: ['sword'],
    branchId,
    criticalThreshold: profiles === RAPIER ? 19 : 20,
    ...spec
  });
}

export const TRAELLERNDER_TECHNIQUES = Object.freeze([
  bard(F.traellernder, 'barddwyr-rapier', RAPIER, { slug: 'traellernder-auftakt-der-lerche', name: 'Auftakt der Lerche', minimumLevel: 7, slotBands: ['duelist'], tier: 'Trällernder Drache', costs: ['bonus-action'], activationType: 'bonus-action',
    description: 'Ein heller Auftakt setzt zwei schnelle Rapierlinien in Bewegung.', effect: 'Verursacht Technikschaden und erlaubt 2 Meter Eigenbewegung.', effects: [movementEffect('barddwyr-lerche', 2, 'move', 'self')] }),
  bard(F.traellernder, 'barddwyr-rapier', RAPIER, { slug: 'traellernder-gegenton', name: 'Gegenton', minimumLevel: 7, slotBands: ['duelist'], tier: 'Trällernder Drache', costs: ['reaction'], activationType: 'reaction',
    description: 'Der Barddwyr antwortet auf den gegnerischen Klingenklang mit einem punktgenauen Gegenstoß.', effect: 'Reaktionsangriff mit Technikschaden und +1 Angriff.', attackBonus: 1 }),
  bard(F.traellernder, 'barddwyr-rapier', RAPIER, { slug: 'traellernder-dreifache-kadenz', name: 'Dreifache Kadenz', minimumLevel: 8, slotBands: ['duelist'], tier: 'Trällernder Drache', costs: ['action', 'bonus-action', 'special-action'],
    description: 'Drei Stöße steigen in Tempo und Höhe, bis die Parade den Takt verliert.', effect: 'Verursacht Technikschaden und erlaubt 3 Meter Eigenbewegung.', effects: [movementEffect('barddwyr-kadenz', 3, 'move', 'self')] }),
  bard(F.traellernder, 'barddwyr-rapier', RAPIER, { slug: 'traellernder-schlussnote', name: 'Schlussnote des Silberstichs', minimumLevel: 8, slotBands: ['duelist'], tier: 'Trällernder Drache', costs: ['action', 'reaction', 'special-action'],
    description: 'Eine täuschend leise Parade endet in einem einzigen klaren Stich.', effect: 'Verursacht Technikschaden, erhält +1 Angriff und gewährt bis zum nächsten Beitrag +1 Rüstungsklasse.', attackBonus: 1, effects: [temporaryCondition('barddwyr-schlussnote', 'Silberne Schlussstellung', 'Die Rapierlinie bleibt nach dem Stich geschlossen.', { armorClass: 1 }, { target: 'self', on: 'always' })] })
]);

export const KREISCHENDER_TECHNIQUES = Object.freeze([
  bard(F.kreischender, 'barddwyr-kreischender', RAPIER, { slug: 'kreischender-schneidender-ton', name: 'Schneidender Ton', minimumLevel: 9, slotBands: ['expert'], tier: 'Kreischender Drache', costs: ['action', 'bonus-action'],
    description: 'Ein hoher Laut zerreißt den gegnerischen Rhythmus, während das Rapier die Öffnung nimmt.', effect: 'Verursacht Technikschaden und erhält +1 Angriff.', attackBonus: 1 }),
  bard(F.kreischender, 'barddwyr-kreischender', RAPIER, { slug: 'kreischender-flirrstich', name: 'Flirrstich', minimumLevel: 10, slotBands: ['expert'], tier: 'Kreischender Drache', costs: ['bonus-action', 'reaction'], activationType: 'reaction',
    description: 'Die Spitze flirrt zwischen zwei nur angedeuteten Linien und trifft aus der dritten.', effect: 'Reaktionsangriff mit Technikschaden; bis zum nächsten Beitrag +1 Rüstungsklasse.', effects: [temporaryCondition('barddwyr-flirrstich', 'Flirrende Linie', 'Die vibrierende Spitze erschwert den Gegenangriff.', { armorClass: 1 }, { target: 'self', on: 'always' })] }),
  bard(F.kreischender, 'barddwyr-kreischender', RAPIER, { slug: 'kreischender-sprungrefrain', name: 'Sprungrefrain', minimumLevel: 11, slotBands: ['expert'], tier: 'Kreischender Drache', costs: ['action', 'bonus-action'],
    description: 'Ein wiederkehrender Sprungschritt trägt den Barddwyr um die gegnerische Seite.', effect: 'Verursacht Technikschaden und erlaubt 4 Meter Eigenbewegung.', effects: [movementEffect('barddwyr-sprungrefrain', 4, 'move', 'self')] }),
  bard(F.kreischender, 'barddwyr-kreischender', RAPIER, { slug: 'kreischender-zerbrochener-takt', name: 'Zerbrochener Takt', minimumLevel: 12, slotBands: ['expert'], tier: 'Kreischender Drache', costs: ['bonus-action', 'special-action'],
    description: 'Der Barddwyr unterbricht die eigene Folge genau dort, wo die Parade sie fortgesetzt erwartet.', effect: 'Verursacht Technikschaden und ist bei einer natürlichen 18–20 kritisch.', criticalThreshold: 18 }),
  bard(F.kreischender, 'barddwyr-kreischender', RAPIER, { slug: 'kreischender-auravibrato', name: 'Auravibrato', minimumLevel: 13, slotBands: ['expert'], tier: 'Kreischender Drache', costs: ['action', 'aura-focus'],
    description: 'Feine Aurawellen lassen Spitze und Stimme zugleich vibrieren.', effect: 'Verursacht Technikschaden; ein misslungener Weisheitsrettungswurf gibt dem Ziel −2 Angriff.', secondarySave: secondarySave('barddwyr-vibrato', 'Zerschnittener Rhythmus', 'Das Auravibrato stört Konzentration und Angriffstakt.', { attack: -2 }, { attributeKey: 'wisdom', dcAttributeKey: 'charisma' }) }),
  bard(F.kreischender, 'barddwyr-kreischender', RAPIER, { slug: 'kreischender-echoschritt', name: 'Echoschritt', minimumLevel: 14, slotBands: ['expert'], tier: 'Kreischender Drache', costs: ['action', 'bonus-action', 'reaction'],
    description: 'Der Barddwyr verlässt seinen Stand, während ein Echo die alte Angriffsrichtung vortäuscht.', effect: 'Verursacht Technikschaden, erlaubt 5 Meter Eigenbewegung und gewährt +2 Rüstungsklasse.', effects: [movementEffect('barddwyr-echoschritt', 5, 'move', 'self'), temporaryCondition('barddwyr-echoschritt', 'Nachhallendes Abbild', 'Ein akustisches Echo verschleiert den neuen Stand.', { armorClass: 2 }, { target: 'self', on: 'always' })] }),
  bard(F.kreischender, 'barddwyr-kreischender', RAPIER, { slug: 'kreischender-kritische-kadenz', name: 'Kritische Kadenz', minimumLevel: 15, slotBands: ['expert'], tier: 'Kreischender Drache', costs: ['action', 'bonus-action', 'reaction'],
    description: 'Jeder Ton markiert einen verwundbaren Punkt, bis der Schlussstich genau zwischen zwei Atemzüge fällt.', effect: 'Verursacht Technikschaden, erhält +1 Angriff und ist bei natürlicher 18–20 kritisch.', attackBonus: 1, criticalThreshold: 18 }),
  bard(F.kreischender, 'barddwyr-kreischender', RAPIER, { slug: 'kreischender-tanzende-fermate', name: 'Tanzende Fermate', minimumLevel: 16, slotBands: ['expert'], tier: 'Kreischender Drache', costs: ['reaction', 'bonus-action', 'special-action'],
    description: 'Für einen gedehnten Augenblick scheint der Kampf stillzustehen, nur der Barddwyr bewegt sich weiter.', effect: 'Verursacht Technikschaden, erlaubt 6 Meter Eigenbewegung und gewährt +2 Rüstungsklasse.', effects: [movementEffect('barddwyr-fermate', 6, 'move', 'self'), temporaryCondition('barddwyr-fermate', 'Tanzende Fermate', 'Die gedehnte Bewegung macht den Barddwyr schwer erreichbar.', { armorClass: 2 }, { target: 'self', on: 'always' })] }),
  bard(F.kreischender, 'barddwyr-kreischender', RAPIER, { slug: 'kreischender-scherbe-des-hohen-c', name: 'Scherbe des hohen C', minimumLevel: 17, slotBands: ['expert'], tier: 'Kreischender Drache', costs: ['action', 'reaction', 'special-action', 'aura-focus'],
    description: 'Ein scharf gebündelter Ton und ein Stoß treffen denselben Punkt der Deckung.', effect: 'Verursacht Technikschaden, senkt die Zielverteidigung um 1 und ist bei natürlicher 18–20 kritisch.', targetDefenseModifier: -1, criticalThreshold: 18 }),
  bard(F.kreischender, 'barddwyr-kreischender', RAPIER, { slug: 'kreischender-chor-der-spitzen', name: 'Chor der Spitzen', minimumLevel: 18, slotBands: ['expert'], tier: 'Kreischender Drache', costs: ['action', 'bonus-action', 'reaction', 'special-action'], maximumTargets: 3, target: 'Bis zu drei Gegner',
    description: 'Mehrere Rapierlinien erscheinen wie Stimmen eines einzigen schneidenden Chores.', effect: 'Trifft bis zu drei Gegner mit je Technikschaden und erlaubt 4 Meter Eigenbewegung.', effects: [movementEffect('barddwyr-chor', 4, 'move', 'self')] }),
  bard(F.kreischender, 'barddwyr-kreischender', RAPIER, { slug: 'kreischender-atemlose-arie', name: 'Atemlose Arie', minimumLevel: 19, slotBands: ['expert'], tier: 'Kreischender Drache', costs: ['action', 'bonus-action', 'reaction', 'special-action', 'aura-focus'],
    description: 'Eine ununterbrochene Folge aus Stimme, Schritt und Spitze lässt dem Gegner keinen eigenen Takt.', effect: 'Verursacht Technikschaden, erhält +2 Angriff, gewährt +2 Rüstungsklasse und ist bei natürlicher 18–20 kritisch.', attackBonus: 2, criticalThreshold: 18, effects: [temporaryCondition('barddwyr-arie', 'Atemlose Arie', 'Die ununterbrochene Bewegung erschwert jede Antwort.', { armorClass: 2 }, { target: 'self', on: 'always' })] }),
  bard(F.kreischender, 'barddwyr-kreischender', RAPIER, { slug: 'kreischender-letzter-schrei', name: 'Letzter Schrei des Silberdrachen', minimumLevel: 20, slotBands: ['expert'], tier: 'Kreischender Drache', costs: ['action', 'bonus-action', 'reaction', { resourceId: 'special-action', amount: 2 }, { resourceId: 'aura-focus', amount: 2 }],
    description: 'Der Meister verdichtet Stimme, Aura und Rapier in einen einzigen blendend schnellen Schlussstoß.', effect: 'Verursacht Technikschaden, erhält +2 Angriff, senkt die Zielverteidigung um 2 und ist bei natürlicher 17–20 kritisch.', attackBonus: 2, targetDefenseModifier: -2, criticalThreshold: 17, effects: [movementEffect('barddwyr-letzter-schrei', 8, 'move', 'self')] })
]);

const STANDARD_PATH_SERIES = Object.freeze([
  {
    formId: F.abwartender, path: 'abwartender', entries: [
      [9, 'pausenparade', 'Pausenparade', 'Eine bewusste Pause fängt den Angriff und setzt den Gegenhieb.', 'Reaktionsangriff mit Technikschaden.'],
      [13, 'stiller-vers', 'Stiller Vers', 'Ein nahezu lautloser Vers hält Atem und Deckung geschlossen.', 'Verursacht Technikschaden und gewährt +2 Rüstungsklasse.'],
      [17, 'wortlose-antwort', 'Wortlose Antwort', 'Die Klinge beantwortet den Gegner ohne Stimme und ohne überflüssige Bewegung.', 'Reaktionsangriff mit Technikschaden.'],
      [20, 'schluss-des-schweigens', 'Schluss des Schweigens', 'Vollkommene Ruhe endet in einem einzigen meisterlichen Gegenhieb.', 'Verursacht Technikschaden und gewährt +3 Rüstungsklasse.']
    ]
  },
  {
    formId: F.fliegender, path: 'fliegender', entries: [
      [9, 'sprungvers', 'Sprungvers', 'Ein leichter Sprung trägt den Schwertreim über die gegnerische Linie.', 'Verursacht Technikschaden und erlaubt 3 Meter Eigenbewegung.'],
      [13, 'tanzende-strophe', 'Tanzende Strophe', 'Schritt und Schwert bilden eine kreisende Strophe.', 'Verursacht Technikschaden und gewährt +1 Rüstungsklasse.'],
      [17, 'lied-der-hohen-klinge', 'Lied der hohen Klinge', 'Die Klinge steigt mit einem tragenden Ton durch die Deckung.', 'Verursacht Technikschaden und wird mit Vorteil gewürfelt.'],
      [20, 'himmelsballade', 'Himmelsballade', 'Der Meister lässt Stimme und Schwert in einer grenzenlosen Bewegungsfolge aufsteigen.', 'Verursacht Technikschaden und erlaubt 8 Meter Eigenbewegung.']
    ]
  },
  {
    formId: F.ausgeglichener, path: 'ausgeglichener', entries: [
      [9, 'vers-und-antwort', 'Vers und Antwort', 'Ein Angriff geht in eine sichere Antwortstellung über.', 'Verursacht Technikschaden und gewährt +1 Rüstungsklasse.'],
      [13, 'harmonie-der-mitte', 'Harmonie der Mitte', 'Stimme, Schritt und Klinge bleiben im gleichen Maß.', 'Verursacht Technikschaden und erhält +1 Angriff.'],
      [17, 'vierstimmige-klinge', 'Vierstimmige Klinge', 'Vier Grundrichtungen werden zu einer ausgewogenen Folge verbunden.', 'Verursacht Technikschaden und gewährt +2 Rüstungsklasse.'],
      [20, 'vollendete-harmonie', 'Vollendete Harmonie', 'Der Meister vereint Klang und Schwert zu einer vollkommen ausgeglichenen Schlussform.', 'Verursacht Technikschaden, erhält +2 Angriff und gewährt +2 Rüstungsklasse.']
    ]
  }
]);

export const BARDDWYR_STANDARD_PATH_TECHNIQUES = Object.freeze(STANDARD_PATH_SERIES.flatMap(series => series.entries.map(([level, slug, name, description, effect]) => bard(series.formId, 'barddwyr-sword', SWORD, {
  slug: `${series.path}-${slug}`, name, minimumLevel: level, slotBands: ['expert'], tier: 'Barddwyr-Schwertpfad',
  activationType: series.path === 'abwartender' ? 'reaction' : 'action',
  costs: level === 9 ? ['action', 'reaction'] : (level === 13 ? ['action', 'bonus-action', 'reaction'] : (level === 17 ? ['action', 'reaction', 'special-action', 'aura-focus'] : ['action', 'bonus-action', 'reaction', { resourceId: 'special-action', amount: 2 }, { resourceId: 'aura-focus', amount: 2 }])),
  description, effect,
  rollMode: name === 'Lied der hohen Klinge' ? 'advantage' : 'normal',
  attackBonus: ['Harmonie der Mitte', 'Vollendete Harmonie'].includes(name) ? (level === 20 ? 2 : 1) : 0,
  effects: name.includes('Sprung') || name === 'Himmelsballade' ? [movementEffect(`barddwyr-${slug}`, level === 20 ? 8 : 3, 'move', 'self')]
    : (effect.includes('Rüstungsklasse') ? [temporaryCondition(`barddwyr-${slug}`, name, effect, { armorClass: level === 20 || level === 17 || name === 'Stiller Vers' ? 2 : 1 }, { target: 'self', on: 'always' })] : [])
}))));

export const BARDDWYR_TECHNIQUES = Object.freeze([
  ...TRAELLERNDER_TECHNIQUES,
  ...KREISCHENDER_TECHNIQUES,
  ...BARDDWYR_STANDARD_PATH_TECHNIQUES
]);
