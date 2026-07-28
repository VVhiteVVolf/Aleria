import { CENYR_COUNTY_HOUSE_PROFILES } from './cenyr-county-house-profiles.js';
import { createFounderPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { HOUSE_PENDRAG_FAMILY } from './house-pendrag-family.js';
import { HOUSE_ILLEWOD_FAMILY } from './house-illewod-family.js';
import { HOUSE_NEIDR_FAMILY } from './house-neidr-family.js';
import { HOUSE_GRAWN_FAMILY } from './house-grawn-family.js';
import { HOUSE_ADERYN_FAMILY } from './house-aderyn-family.js';
import { HOUSE_PYSGOD_FAMILY } from './house-pysgod-family.js';
import { HOUSE_ARTH_FAMILY } from './house-arth-family.js';
import { HOUSE_WYLAN_FAMILY } from './house-wylan-family.js';

// Zentrales Register für die 8 weiteren großen Häuser Cenyrs
// (Celtigerns Wacht/Haus Draig ist separat ausgearbeitet). Noch nicht ausgearbeitete
// Einträge erhalten eine vorbereitete Leerakte. Anders als die Vasallenhaus-Batches
// sind diese Häuser von Grafen- beziehungsweise im Fall Pendrags von Königsrang;
// createFounderPlaceholderHouseFamily würde sonst den silbernen Ritterherrenrahmen
// setzen, weshalb die verbleibenden Leerakten hier einen Goldrahmen erhalten.
//
// WICHTIG: Für diese Häuser existieren verstreute Weltpersonen in anderen Hausakten
// (siehe Fundliste in cenyr-county-house-profiles.js). Beim Ausarbeiten werden deren
// stabile Personen-, Beziehungs- und Portrait-IDs wiederverwendet; Leerakten werden
// nicht parallel weitergeführt.
//
// Bereits ausgearbeitete Häuser ersetzen ihre vorbereitete Leerakte — analog zu
// ELABORATED_RHONWENS_TRAENEN_FAMILIES in rhonwens-traenen-house-families.js.
const ELABORATED_CENYR_COUNTY_FAMILIES = Object.freeze({
  wylan: HOUSE_WYLAN_FAMILY,
  pendrag: HOUSE_PENDRAG_FAMILY,
  illewod: HOUSE_ILLEWOD_FAMILY,
  neidr: HOUSE_NEIDR_FAMILY,
  grawn: HOUSE_GRAWN_FAMILY,
  aderyn: HOUSE_ADERYN_FAMILY,
  pysgod: HOUSE_PYSGOD_FAMILY,
  arth: HOUSE_ARTH_FAMILY
});

const CENYR_COUNTY_HOUSE_DEFINITIONS = Object.freeze([
  Object.freeze({ slug: 'wylan', title: 'Wylan', folder: 'Weidebucht' }),
  Object.freeze({ slug: 'illewod', title: 'Illewod', folder: 'Sonnenküste' }),
  Object.freeze({ slug: 'pendrag', title: 'Pendrag', folder: 'Vortigerns Ruh' }),
  Object.freeze({ slug: 'grawn', title: 'Grawn', folder: 'Ährental' }),
  Object.freeze({ slug: 'neidr', title: 'Neidr', folder: 'Silberinsel' }),
  Object.freeze({ slug: 'pysgod', title: 'Pysgod', folder: 'Graue Weite' }),
  Object.freeze({ slug: 'arth', title: 'Arth', folder: 'Klaueninsel' }),
  Object.freeze({ slug: 'aderyn', title: 'Aderyn', folder: 'Tal der Milane' })
]);

function countyFounderPlaceholder(definition) {
  const houseProfile = CENYR_COUNTY_HOUSE_PROFILES[definition.slug];
  const base = createFounderPlaceholderHouseFamily({
    id: `haus-${definition.slug}`,
    title: `Haus ${definition.title}`,
    emblem: `assets/images/houses/${definition.folder}/haus-${definition.slug}.png`,
    houseProfile,
    description: houseProfile.rankId === 'royal'
      ? `Vorbereitete Familienakte des königlichen Hauses ${definition.title}.`
      : `Vorbereitete Familienakte des Grafenhauses ${definition.title}.`
  });
  return Object.freeze({
    ...base,
    lineage: Object.freeze({ ...base.lineage, crestFrame: 'gold' })
  });
}

export const CENYR_COUNTY_HOUSE_FAMILIES = Object.freeze(
  CENYR_COUNTY_HOUSE_DEFINITIONS.map(definition => (
    ELABORATED_CENYR_COUNTY_FAMILIES[definition.slug] || countyFounderPlaceholder(definition)
  ))
);
