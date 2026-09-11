import {
  createStructureOnlyClassDefinitions,
  findStructureOnlyClassDefinition
} from '../structure-only-class.js';

export const VENALYS_CLASS_IDS = Object.freeze([
  'limita',
  'condottieri',
  'gondoleri',
  'lancieri',
  'stralieri'
]);

const TRAINING_PHASES = Object.freeze([
  Object.freeze({ id: 'foundation', name: 'Grundausbildung des Dienstes', minimumLevel: 1, maximumLevel: 6, kind: 'foundation', detail: 'Waffe, Haltung und republikanischer Dienst' }),
  Object.freeze({ id: 'free-training', name: 'Freie Vertiefung', minimumLevel: 7, maximumLevel: 8, kind: 'free-training', detail: 'Raum für individuelle Techniken' }),
  Object.freeze({ id: 'specializations', name: 'Berufspfade', minimumLevel: 9, maximumLevel: 20, kind: 'pending', detail: 'Formen und Pfade noch festzulegen' })
]);

const BLUEPRINTS = Object.freeze({
  limita: Object.freeze({
    name: 'Limita', focus: 'Verlässlicher Linien- und Wachdienst der Republik', trainingFocus: 'Soldatendienst und geschlossene Ordnung', affiliation: 'Waffenknecht und einfacher Soldat',
    weaponTraining: Object.freeze({ primary: Object.freeze(['Dienstwaffe', 'Speer', 'Schild']), secondary: Object.freeze(['Kurzwaffe']), note: 'Die genaue venalische Grundform und ihre Waffenfolgen bleiben bis zur Kampftechnik-Ausarbeitung offen.' })
  }),
  condottieri: Object.freeze({
    name: 'Condottieri', focus: 'Berufskriegertum, Führung und wechselnde Einsatzorte', trainingFocus: 'Kommando, Klinge und Seefahrt', affiliation: 'Cavaliere und professioneller Kriegsmann',
    weaponTraining: Object.freeze({ primary: Object.freeze(['Schwert', 'Säbel']), secondary: Object.freeze(['Dolch', 'Armbrust']), note: 'Land- und Seekampf werden später als getrennte, aber kompatible Ausbildungszweige entworfen.' })
  }),
  gondoleri: Object.freeze({
    name: 'Gondoleri', focus: 'Beweglicher Kampf auf Schiffen, Booten und an Ufern', trainingFocus: 'Seefahrt und bewaffneter Borddienst', affiliation: 'Seefahrender Edelmann Venalys\'',
    weaponTraining: Object.freeze({ primary: Object.freeze(['Säbel', 'Dolch']), secondary: Object.freeze(['Stangenhaken', 'Armbrust']), note: 'Manöver auf engem Deck und im Boot erhalten später eigene Formen und Voraussetzungen.' })
  }),
  lancieri: Object.freeze({
    name: 'Lancieri', focus: 'Speerkampf zu Fuß und die seltene Reiterei Venalys\'', trainingFocus: 'Lanze, Speer und flexibler Antritt', affiliation: 'Speerträger zu Fuß oder zu Pferd',
    weaponTraining: Object.freeze({ primary: Object.freeze(['Speer', 'Lanze']), secondary: Object.freeze(['Säbel', 'Schild']), note: 'Berittene und abgesessene Techniken bleiben als getrennte Einsatzweisen derselben Klasse vorgemerkt.' })
  }),
  stralieri: Object.freeze({
    name: 'Stralieri', focus: 'Gezielter Armbrustkampf mit verlässlicher Seitenwaffe', trainingFocus: 'Armbrust, Stellung und Säbel', affiliation: 'Armbrustschütze aus dem venalischen Edelstand',
    weaponTraining: Object.freeze({ primary: Object.freeze(['Armbrust']), secondary: Object.freeze(['Säbel']), note: 'Fernkampf, Nachladen und der Wechsel zum Säbel werden erst mit der späteren Kampftechnik verbindlich geregelt.' })
  })
});

const definitions = createStructureOnlyClassDefinitions({
  cultureId: 'venalys',
  culture: 'Venalys',
  folder: 'Venalys',
  classIds: VENALYS_CLASS_IDS,
  blueprints: BLUEPRINTS,
  trainingPhases: TRAINING_PHASES,
  pathRule: 'Berufspfade, Wahlrhythmus und Zugangsvoraussetzungen werden später für Venalys festgelegt.'
});

export function getVenalysClassDefinition(id) {
  const aliases = {
    waffenknecht: 'limita',
    soldat: 'limita',
    condottiere: 'condottieri',
    kavallier: 'condottieri',
    cavaliere: 'condottieri',
    gondoliere: 'gondoleri',
    gondolieri: 'gondoleri',
    lanciere: 'lancieri',
    straliere: 'stralieri',
    armbrustschutze: 'stralieri'
  };
  return findStructureOnlyClassDefinition(definitions, id, { cultureId: 'venalys', aliases });
}

export function getVenalysClassDefinitions() {
  return structuredClone(definitions);
}
