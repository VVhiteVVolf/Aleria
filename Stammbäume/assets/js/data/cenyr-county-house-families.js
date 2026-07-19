import { CENYR_COUNTY_HOUSE_PROFILES } from './cenyr-county-house-profiles.js';
import { createFounderPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { HOUSE_PENDRAG_FAMILY } from './house-pendrag-family.js';

// Vorbereitete Leerakten (Juli 2026) für die 8 übrigen großen Grafenhäuser Cenyrs
// (Celtigerns Wacht/Haus Draig ist bereits ausgearbeitet). Anders als die Vasallenhaus-
// Batches (z. B. RHONWENS_TRAENEN_HOUSE_DEFINITIONS) sind diese Häuser Grafen- bzw. für
// Pendrag Königsrang — createFounderPlaceholderHouseFamily setzt den Wappenrahmen sonst
// auf Silber (für Ritterherrenhäuser gedacht); hier wird er auf Gold überschrieben, wie
// bei den bereits ausgearbeiteten Grafen-/Baronenhäusern (Draig, Gwefrydd, Gwyvern, ...).
//
// WICHTIG: Für jedes dieser 8 Häuser existieren bereits verstreute Personen-Stubs in
// sieben anderen Hausakten (siehe ausführliche Fundliste in
// cenyr-county-house-profiles.js) — die Platzhalter-Gründerpaare hier sind bewusst noch
// NICHT damit verknüpft. Beim späteren Ausarbeiten jedes einzelnen Hauses zuerst diese
// Fundliste konsultieren, statt neue Personen zu erfinden.
//
// Bereits ausgearbeitete Häuser ersetzen ihre vorbereitete Leerakte — analog zu
// ELABORATED_RHONWENS_TRAENEN_FAMILIES in rhonwens-traenen-house-families.js.
const ELABORATED_CENYR_COUNTY_FAMILIES = Object.freeze({
  pendrag: HOUSE_PENDRAG_FAMILY
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
