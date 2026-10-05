import { createSourceHouseFamily } from './source-house-family-builder.js';
import { CEITHEACH_SOURCE_CATALOG } from './ceitheach-source-catalog.js';
import { CEITHEACH_CLAN_DEFINITIONS, CEITHEACH_HOUSE_PROFILES, CEITHEACH_MANAGED_PROFILE_FIELDS, getCeitheachDependentHouseProfile } from './ceitheach-house-profiles.js';
import { CEITHEACH_DEPENDENT_CLANS } from './ceitheach-territorial-catalog.js';
import { normalizeHouseBiographyModule } from '../modules/house-biography/house-biography-model.js';

function sourceBiography(title, emblem, profile, description) {
  return normalizeHouseBiographyModule({
    pageTitle: title, image: emblem, description,
    stats: [['Sitz', profile.seat], ['Oberherrschaft', profile.county], ['Fürstentum', profile.kingdom], ['Lehensherr', profile.liegeHouseName], ['Religion', 'Alerische Kirche']],
    quote: '', quoteBy: '',
    house: {
      crestImage: emblem, biographyTitle: 'Übersicht', biographyText: description,
      extraSections: [{
        title: 'Tiarnatum',
        text: 'Der Tiarna ist das albenische Gegenstück zum Ritter und verkörpert Ehre, Tapferkeit und Schutzpflicht sowie die alten Ideale der Clans. Er gilt als Vorstufe zum Fianna, den größten Helden des albenischen Volkes, und soll sich dieser höchsten Ehre würdig erweisen.'
      }]
    }
  });
}

export function createCeitheachSourceFamily(slug, source, catalog = CEITHEACH_SOURCE_CATALOG) {
  const id = `haus-${slug}`;
  const main = CEITHEACH_CLAN_DEFINITIONS.find(clan => clan.slug === slug);
  const dependent = CEITHEACH_DEPENDENT_CLANS.find(clan => clan.familyId === id);
  if (!main && !dependent) throw new Error(`Keine territoriale Ceitheach-Akte für ${id}.`);
  const houseId = main?.primaryHouseId || dependent.houseId;
  const house = catalog.houses.find(record => record.id === houseId);
  const title = (main || dependent).title;
  const profile = main ? CEITHEACH_HOUSE_PROFILES[slug] : getCeitheachDependentHouseProfile(id);
  const description = `${title} mit Sitz in ${profile.seat}, ${profile.county}, Ceitheach. Die überlieferte Genealogie, Herkunfts- und Heiratslinien folgen der Familienquelle; nicht einzeln bekannte Generationen bleiben als Überlieferungslücken sichtbar.`;
  const tombstones = main ? {
    persons: [`${id}-gruender`, `${id}-gruenderin`],
    partnerships: [`marriage-${id}-founders`]
  } : {};
  return createSourceHouseFamily({
    id, houseId, title, source, catalog, houseProfile: profile,
    description, emblem: house.emblem, biography: sourceBiography(title, house.emblem, profile, description),
    territorialSource: main ? { source: 'Ceitheach-Verwaltungsübersicht', territory: main.territory } : {
      attachmentId: dependent.attachmentId, row: dependent.sourceNameRow, column: dependent.sourceColumn
    },
    titleForPerson: personId => source.titles[personId] || '',
    crestSubtitle: main ? `${main.rankId === 'ard-tiarna' ? 'Ard Tiarnatum Ceitheach' : `Mor Tiarnatum ${profile.county}`} · ${profile.seat}` : '',
    extensions: {
      preparedMainLine: false,
      principality: 'Ceitheach', territory: profile.county,
      albicRank: profile.rankId,
      ...(main ? {
        administrativeRole: main.rankId === 'ard-tiarna'
          ? 'Fürstenclan und Ard Tiarna von Ceitheach' : `Mor Tiarna von ${profile.county}`
      } : {}),
      ...(profile.liegeHouseId ? {
        immediateLiegeHouseId: profile.liegeHouseId,
        immediateLiegeHouseName: profile.liegeHouseName
      } : {}),
      historicalWards: source.historicalWards || [],
      registryManagedDocumentFields: ['description', 'emblem'],
      registryManagedHouseProfileFields: CEITHEACH_MANAGED_PROFILE_FIELDS,
      registryManagedRecordFields: ['folderPath'],
      registryManagedExtensionFields: ['blankFamily', 'preparedMainLine', 'chartLayoutPolicy', 'sourceNote', 'sourceInventory', 'warriorReference', 'houseBiographyModule', 'historicalWards'],
      registryTombstones: tombstones
    }
  });
}
