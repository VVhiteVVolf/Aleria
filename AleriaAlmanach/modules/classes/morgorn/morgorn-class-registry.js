export const MORGORN_CLASS_IDS = Object.freeze([
  'karnach',
  'haldr',
  'zernach',
  'wairg',
  'dornach',
  'skarrach',
  'rheach',
  'garnach'
]);

const TRAINING_PHASES = Object.freeze([
  Object.freeze({ id: 'foundation', name: 'Grundausbildung der Kaste', minimumLevel: 1, maximumLevel: 6, kind: 'foundation', detail: 'Grundlagen der Kaste' }),
  Object.freeze({ id: 'free-training', name: 'Freie Vertiefung', minimumLevel: 7, maximumLevel: 8, kind: 'free-training', detail: 'Raum für individuelle Vertiefung' }),
  Object.freeze({ id: 'specializations', name: 'Kastenpfade', minimumLevel: 9, maximumLevel: 20, kind: 'pending', detail: 'Formen und Pfade noch festzulegen' })
]);

const BLUEPRINTS = Object.freeze({
  karnach: Object.freeze({
    name: 'Karnach', focus: 'Gebirge, Engstellen und gemeinsamer Linienhalt', trainingFocus: 'Bergkampf und Hallenwehr', affiliation: 'Kriegerkaste der Bergknechte',
    weaponTraining: Object.freeze({ primary: Object.freeze(['Kurzwaffe', 'Schild', 'Werkzeugwaffe']), secondary: Object.freeze(['Speer']), note: 'Die endgültigen Waffenfolgen für Stollen, Geröll und Engstellen bleiben offen.' })
  }),
  haldr: Object.freeze({
    name: 'Haldr', focus: 'Persönlicher Schutz und gebundene Obhut', trainingFocus: 'Hüterdienst und Schildkampf', affiliation: 'Kriegerkaste der Hüter',
    weaponTraining: Object.freeze({ primary: Object.freeze(['Axt', 'Hammer', 'Schwert', 'Schild']), secondary: Object.freeze([]), note: 'Schutzreaktionen und Waffenformen werden gemeinsam mit der späteren Kampfkunst ausgearbeitet.' })
  }),
  zernach: Object.freeze({
    name: 'Zernach', focus: 'Tore, Mauern und standhafte Verteidigung', trainingFocus: 'Festungswacht und schwerer Linienkampf', affiliation: 'Kriegerkaste der Wächter',
    weaponTraining: Object.freeze({ primary: Object.freeze(['Hammer', 'Langwaffe']), secondary: Object.freeze(['Schild']), note: 'Die spätere Ausbildung soll Wachstellung, Reichweite und schwere Rüstung verbinden.' })
  }),
  wairg: Object.freeze({
    name: 'Wairg', focus: 'Herden, Wildnis und Kampf auf weitem Gelände', trainingFocus: 'Hirtenwacht und Stangenwaffen', affiliation: 'Kriegerkaste der Hirten',
    weaponTraining: Object.freeze({ primary: Object.freeze(['Speer', 'Stangenwaffe']), secondary: Object.freeze(['Schwert']), note: 'Geländearbeit, Tierführung und Waffenpfade erhalten später eigene Regeln.' })
  }),
  dornach: Object.freeze({
    name: 'Dornach', focus: 'Grenzpatrouille, Fährten und Gebirgskampf', trainingFocus: 'Grenzdienst und bewegliche Jagd', affiliation: 'Kriegerkaste der Grenzer',
    weaponTraining: Object.freeze({ primary: Object.freeze(['Bogen', 'Speer']), secondary: Object.freeze(['Schwert', 'Axt']), note: 'Fernkampf, Nahkampf und Gebirgsbewegung bleiben als getrennte Ausbildungszweige vorgemerkt.' })
  }),
  skarrach: Object.freeze({
    name: 'Skarrach', focus: 'Berittener Durchbruch und schwere Stoßangriffe', trainingFocus: 'Anritt, Sturm und Widderreiterei', affiliation: 'Kriegerkaste der Stürmer',
    weaponTraining: Object.freeze({ primary: Object.freeze(['Lanze', 'Schwert']), secondary: Object.freeze(['Bogen', 'Axt']), note: 'Berittene und abgesessene Angriffe werden später in eigenen Zweigen getrennt.' })
  }),
  rheach: Object.freeze({
    name: 'Rheach', focus: 'Weihe, Schutz und Dienst an Rhea', trainingFocus: 'Gesalbtes Kriegertum und Klerus', affiliation: 'Religiöse Kriegerkaste Rheas',
    weaponTraining: Object.freeze({ primary: Object.freeze(['Hammer', 'Schwert', 'Schild']), secondary: Object.freeze(['Geweihte Zeichen']), note: 'Kampfkunst, Weihen und Klerikerentwicklung bleiben bis zur religiösen Ausarbeitung getrennt offen.' })
  }),
  garnach: Object.freeze({
    name: 'Garnach', focus: 'Luntenschloss, Konstruktion und alchemistische Feldarbeit', trainingFocus: 'Schwarzpulver und technische Waffenführung', affiliation: 'Kriegerkaste der Luntierer',
    weaponTraining: Object.freeze({ primary: Object.freeze(['Luntenschloss', 'Armbrust']), secondary: Object.freeze(['Haken', 'Axt']), note: 'Munition, Fehlzündungen, Apparaturen und Alchemie erhalten später eigene Systemmodule.' })
  })
});

const definitions = createStructureOnlyClassDefinitions({
  cultureId: 'morgorn',
  culture: 'Morgorn',
  folder: 'Morgorn',
  classIds: MORGORN_CLASS_IDS,
  blueprints: BLUEPRINTS,
  trainingPhases: TRAINING_PHASES
});

export function getMorgornClassDefinition(id) {
  const aliases = {
    bergknecht: 'karnach',
    bergknechte: 'karnach',
    huter: 'haldr',
    wachter: 'zernach',
    hirte: 'wairg',
    hirten: 'wairg',
    grenzer: 'dornach',
    sturmer: 'skarrach',
    'rheas-junger': 'rheach',
    'diener-rheas': 'rheach',
    luntierer: 'garnach'
  };
  return findStructureOnlyClassDefinition(definitions, id, { cultureId: 'morgorn', aliases });
}

export function getMorgornClassDefinitions() {
  return structuredClone(definitions);
}
import {
  createStructureOnlyClassDefinitions,
  findStructureOnlyClassDefinition
} from '../structure-only-class.js';
