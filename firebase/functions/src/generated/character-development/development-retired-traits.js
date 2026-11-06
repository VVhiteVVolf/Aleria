import { getDevelopmentTraitId } from './development-entry-reference.js';

// Retirement metadata from the exact thirty rejected entries in before.json.
// No effects or new selectable definitions live here: owned copies stay owned.
const metadata = [
  {
    "id": "development-trait-talent-knotengefuehl",
    "name": "Knotengefühl",
    "cost": 1
  },
  {
    "id": "development-trait-talent-gestensicherheit",
    "name": "Gestensicherheit",
    "cost": 1
  },
  {
    "id": "development-trait-talent-materialgefuehl",
    "name": "Materialgefühl",
    "cost": 1
  },
  {
    "id": "development-trait-talent-beschwerdegespuer",
    "name": "Beschwerdegespür",
    "cost": 1
  },
  {
    "id": "development-trait-talent-haltungslesen",
    "name": "Haltungslesen",
    "cost": 1
  },
  {
    "id": "development-trait-talent-tierlautgefuehl",
    "name": "Tierlautgefühl",
    "cost": 1
  },
  {
    "id": "development-trait-talent-spurenverknuepfung",
    "name": "Spurenverknüpfung",
    "cost": 1
  },
  {
    "id": "development-trait-talent-wegerinnerung",
    "name": "Wegerinnerung",
    "cost": 1
  },
  {
    "id": "development-trait-talent-gelaendevorstellung",
    "name": "Geländevorstellung",
    "cost": 1
  },
  {
    "id": "development-trait-talent-gesangsatem",
    "name": "Gesangsatem",
    "cost": 1
  },
  {
    "id": "development-trait-talent-verborgene-aufmerksamkeit",
    "name": "Verborgene Aufmerksamkeit",
    "cost": 1
  },
  {
    "id": "development-trait-talent-hebelgefuehl",
    "name": "Hebelgefühl",
    "cost": 1
  },
  {
    "id": "development-trait-talent-koerperliche-selbstsicherheit",
    "name": "Körperliche Selbstsicherheit",
    "cost": 2
  },
  {
    "id": "development-trait-talent-fallinstinkt",
    "name": "Fallinstinkt",
    "cost": 2
  },
  {
    "id": "development-trait-talent-gedankendisziplin",
    "name": "Gedankendisziplin",
    "cost": 2
  },
  {
    "id": "development-trait-faehigkeit-kontrolliertes-abfangen",
    "name": "Kontrolliertes Abfangen",
    "cost": 1
  },
  {
    "id": "development-trait-faehigkeit-verankerter-stand",
    "name": "Verankerter Stand",
    "cost": 1
  },
  {
    "id": "development-trait-faehigkeit-druckverbandroutine",
    "name": "Druckverbandroutine",
    "cost": 2
  },
  {
    "id": "development-trait-faehigkeit-schmerzatmung",
    "name": "Schmerzatmung",
    "cost": 0
  },
  {
    "id": "development-trait-faehigkeit-saeureflucht",
    "name": "Säureflucht",
    "cost": 1
  },
  {
    "id": "development-trait-faehigkeit-splitterabwehr",
    "name": "Splitterabwehr",
    "cost": 2
  },
  {
    "id": "development-trait-faehigkeit-wuchtrollen",
    "name": "Wuchtrollen",
    "cost": 1
  },
  {
    "id": "development-trait-faehigkeit-klingenabstand",
    "name": "Klingenabstand",
    "cost": 2
  },
  {
    "id": "development-trait-faehigkeit-lueckenlesen",
    "name": "Lückenlesen",
    "cost": 3
  },
  {
    "id": "development-trait-faehigkeit-pruefende-befragung",
    "name": "Prüfende Befragung",
    "cost": 3
  },
  {
    "id": "development-trait-faehigkeit-verbindliche-argumentation",
    "name": "Verbindliche Argumentation",
    "cost": 3
  },
  {
    "id": "development-trait-faehigkeit-ruhige-untersuchung",
    "name": "Ruhige Untersuchung",
    "cost": 3
  },
  {
    "id": "development-trait-faehigkeit-sorgfaeltige-beweisfuehrung",
    "name": "Sorgfältige Beweisführung",
    "cost": 3
  },
  {
    "id": "development-trait-faehigkeit-oekologischer-vergleich",
    "name": "Ökologischer Vergleich",
    "cost": 3
  },
  {
    "id": "development-trait-faehigkeit-praktische-wegsuche",
    "name": "Praktische Wegsuche",
    "cost": 3
  }
];
const retired = new Map(metadata.map(entry => [entry.id, Object.freeze(entry)]));
export const RETIRED_DEVELOPMENT_TRAIT_IDS = Object.freeze([...retired.keys()]);
export function getRetiredDevelopmentTrait(entry) {
  return retired.get(typeof entry === 'string' ? entry : getDevelopmentTraitId(entry)) || null;
}
export function getOwnedRetiredDevelopmentTraits(profile = {}) {
  return (profile.quirks || []).flatMap(entry => {
    const definition = getRetiredDevelopmentTrait(entry);
    if (!definition) return [];
    const ownCost = entry.cost != null && entry.cost !== '' && Number.isFinite(Number(entry.cost));
    return [{ ...entry, id: definition.id, name: entry.name || definition.name,
      icon: entry.icon || `/AleriaAlmanach/assets/development-traits/web/${definition.id.replace('development-trait-', '')}.webp`,
      cost: ownCost ? Number(entry.cost) : definition.cost }];
  });
}
