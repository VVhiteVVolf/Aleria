import {
  createExtinctPlaceholderHouseFamily,
  createFounderPlaceholderHouseFamily
} from './blank-house-family-factory.js';
import {
  GRAUE_WEITE_HOUSE_EMBLEMS,
  GRAUE_WEITE_HOUSE_PROFILES,
  GRAUE_WEITE_ORIGIN_HOUSE_PROFILES
} from './graue-weite-house-profiles.js';
import { HOUSE_BRITHYLL_FAMILY } from './house-brithyll-family.js';
import { HOUSE_GWIALEN_FAMILY } from './house-gwialen-family.js';

export const GRAUE_WEITE_DEPENDENT_HOUSE_DEFINITIONS = Object.freeze([
  Object.freeze({ slug: 'blaidd', familySlug: 'blaidd-tredegar', title: "Haus Blaidd O'Tredegar" }),
  Object.freeze({ slug: 'brithyll', title: 'Haus Brithyll' }),
  Object.freeze({ slug: 'gwialen', title: 'Haus Gwialen' }),
  Object.freeze({ slug: 'illygoden', familySlug: 'illygoden-tredegar', title: "Haus Illygoden O'Tredegar" }),
  Object.freeze({ slug: 'gwaedlyd', familySlug: 'gwaedlyd-tredegar', title: "Haus Gwaedlyd O'Tredegar" }),
  Object.freeze({ slug: 'draenog', title: 'Haus Draenog' }),
  Object.freeze({ slug: 'coedwig', title: 'Haus Coedwig' }),
  Object.freeze({ slug: 'wivern', title: 'Haus Wivern' }),
  Object.freeze({ slug: 'morfil', title: 'Haus Morfil' }),
  Object.freeze({ slug: 'lyfant', familySlug: 'lyfant-caer-asgwrn', title: "Haus Lyfant O'Caer Asgwrn" }),
  Object.freeze({ slug: 'dornach', title: 'Clan Dornach', ancient: true }),
  Object.freeze({ slug: 'brathaireann', title: 'Clan Brathaireann', ancient: true }),
  Object.freeze({ slug: 'tonnmharra', title: 'Clan Tonnmharra', ancient: true }),
  Object.freeze({ slug: 'tanwyn', title: 'Haus Tanwyn', extinct: true })
]);

export const GRAUE_WEITE_ORIGIN_HOUSE_DEFINITIONS = Object.freeze([
  Object.freeze({
    slug: 'blaidd-branon',
    familySlug: 'blaidd',
    emblemSlug: 'blaidd',
    title: "Haus Blaidd O'Branon",
    origin: 'Branon',
    successorTitle: "Haus Blaidd O'Tredegar",
    successorFamilyId: 'haus-blaidd-tredegar'
  }),
  Object.freeze({
    slug: 'illygoden-tirwedd',
    familySlug: 'illygoden',
    emblemSlug: 'illygoden',
    title: "Haus Illygoden O'Tirwedd",
    origin: 'Tirwedd',
    successorTitle: "Haus Illygoden O'Tredegar",
    successorFamilyId: 'haus-illygoden-tredegar'
  }),
  Object.freeze({
    slug: 'gwaedlyd-caer-gorwel',
    familySlug: 'gwaedlyd',
    emblemSlug: 'gwaedlyd',
    title: "Haus Gwaedlyd O'Caer Gorwel",
    origin: 'Caer Gorwel',
    successorTitle: "Haus Gwaedlyd O'Tredegar",
    successorFamilyId: 'haus-gwaedlyd-tredegar'
  }),
  Object.freeze({
    slug: 'lyfant-derwyddion',
    familySlug: 'lyfant',
    emblemSlug: 'lyfant',
    title: "Haus Lyfant O'Derwyddion",
    origin: 'Derwyddion',
    successorTitle: "Haus Lyfant O'Caer Asgwrn",
    successorFamilyId: 'haus-lyfant-caer-asgwrn'
  })
]);

const COMPLETED_CURRENT_HOUSE_FAMILIES = Object.freeze({
  brithyll: HOUSE_BRITHYLL_FAMILY,
  gwialen: HOUSE_GWIALEN_FAMILY
});

function currentPlaceholder(definition) {
  const completedFamily = COMPLETED_CURRENT_HOUSE_FAMILIES[definition.slug];
  if (completedFamily) return completedFamily;
  const profile = GRAUE_WEITE_HOUSE_PROFILES[definition.slug];
  const factory = definition.extinct
    ? createExtinctPlaceholderHouseFamily
    : createFounderPlaceholderHouseFamily;
  const base = factory({
    id: `haus-${definition.familySlug || definition.slug}`,
    title: definition.title,
    emblem: GRAUE_WEITE_HOUSE_EMBLEMS[definition.slug],
    houseProfile: profile,
    description: definition.extinct
      ? 'Vorbereitete Familienakte des erloschenen Magiergeschlechts Tanwyn aus Llanfyn.'
      : definition.ancient
        ? `Vorbereitete Familienakte des antiken Crannath-Geschlechts ${definition.title.replace(/^Clan /, '')} aus der Grauen Weite.`
        : `Vorbereitete Familienakte des ${definition.title} aus der Grauen Weite.`
  });
  return Object.freeze({
    ...base,
    lineage: Object.freeze({ ...base.lineage, crestFrame: 'gold' })
  });
}

function originPlaceholder(definition) {
  const base = createFounderPlaceholderHouseFamily({
    id: `haus-${definition.familySlug}`,
    title: definition.title,
    emblem: GRAUE_WEITE_HOUSE_EMBLEMS[definition.emblemSlug],
    houseProfile: GRAUE_WEITE_ORIGIN_HOUSE_PROFILES[definition.slug],
    description: `Alte vennyrianische Herkunftslinie aus ${definition.origin}. Nur die später nach Cenyr geflüchteten Angehörigen werden in der getrennten Nachfolgeakte ${definition.successorTitle} fortgeführt.`
  });
  const originHouses = definition.familySlug === 'lyfant'
    ? Object.freeze([
        ...base.houses,
        Object.freeze({
          id: 'house-llyfant',
          name: definition.title,
          motto: '',
          emblem: GRAUE_WEITE_HOUSE_EMBLEMS.lyfant,
          status: 'active'
        })
      ])
    : base.houses;
  return Object.freeze({
    ...base,
    houses: originHouses,
    lineage: Object.freeze({ ...base.lineage, crestFrame: 'gold' }),
    extensions: Object.freeze({
      ...base.extensions,
      originLine: true,
      successorFamilyId: definition.successorFamilyId
    })
  });
}

// Haus Pysgod bleibt als ausgearbeitete Grafenakte im zentralen Cenyr-Aggregat.
// Dieses Modul registriert seine Vasallen, Barone, antiken Häuser und Tanwyn.
export const GRAUE_WEITE_DEPENDENT_HOUSE_FAMILIES = Object.freeze(
  GRAUE_WEITE_DEPENDENT_HOUSE_DEFINITIONS.map(currentPlaceholder)
);

// Die vier Herkunftsakten bleiben bewusst eigenständige Vennyr-Stammbäume. Spätere
// Quellen können in jeder Akte einen konkreten Flüchtlingsknoten zum Cenyr-Zweig ergänzen.
export const GRAUE_WEITE_ORIGIN_HOUSE_FAMILIES = Object.freeze(
  GRAUE_WEITE_ORIGIN_HOUSE_DEFINITIONS.map(originPlaceholder)
);
