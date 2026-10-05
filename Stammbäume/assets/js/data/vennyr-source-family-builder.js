import { createSourceHouseFamily } from './source-house-family-builder.js';
import { getVennyrHouseProfile, getVennyrTerritorialHouse } from './vennyr-house-profiles.js';
import { VENNYR_BLUETENLAND_PERSONS, VENNYR_BLUETENLAND_PARTNERSHIPS, VENNYR_BLUETENLAND_HOUSES } from './vennyr-bluetenland-source-records.js';
import { VENNYR_BLUETENLAND_PORTRAITS } from './vennyr-bluetenland-portraits.js';
import { normalizeHouseBiographyModule } from '../modules/house-biography/house-biography-model.js';

const DEFAULT_SOURCE_CATALOG = Object.freeze({
  persons: VENNYR_BLUETENLAND_PERSONS, partnerships: VENNYR_BLUETENLAND_PARTNERSHIPS,
  houses: VENNYR_BLUETENLAND_HOUSES, portraits: VENNYR_BLUETENLAND_PORTRAITS,
  inventory: 'assets/data/source-inventories/vennyr-bluetenland-families-2026-10-05.json'
});

function sourceBiography(house, description) {
  const ritual = 'Das Rittertum Vennyrs hat seinen Ursprung in Avallorn. Bei der Schwertleite an einem See oder Gewässer wird der Knappe zum Ritter geschlagen und gesalbt. Er schwört auf jeden der neun Göttlichen und ihre Tugenden; ein zusätzlicher zehnter Eid gilt der Dame des Sees, der Schutzgöttin Cenyrs und Vennyrs.';
  return normalizeHouseBiographyModule({
    pageTitle: `Haus ${house.name}`, image: house.emblemPath, description,
    stats: [['Sitz', house.seat], ['Oberherrschaft', house.region], ['Herrschaft', house.lordship], ['Lehensherr', house.liegeHouseName], ['Religion', 'Alerische Kirche']],
    quote: '', quoteBy: '',
    house: { crestImage: house.emblemPath, biographyTitle: 'Übersicht', biographyText: description,
      extraSections: [{ title: 'Religion und Schwertleite', text: ritual }] }
  });
}

export function createVennyrSourceFamily(slug, source, catalog = DEFAULT_SOURCE_CATALOG) {
  const id = `haus-${slug}`;
  const houseId = `house-${slug}`;
  const house = getVennyrTerritorialHouse(id);
  const houseProfile = getVennyrHouseProfile(id);
  const description = `Haus ${house.name} mit Sitz in ${house.seat}, ${house.region}, Vennyr, unter ${house.lordship}. Die überlieferte Genealogie verbindet das Haus mit seinen Herkunfts- und Heiratslinien; nicht einzeln bekannte Generationen bleiben als Überlieferungslücken sichtbar.`;
  return createSourceHouseFamily({
    id, houseId, title: `Haus ${house.name}`, source, catalog, houseProfile, description, emblem: house.emblemPath,
    biography: sourceBiography(house, description),
    territorialSource: { attachmentId: house.attachmentId, row: house.sourceRow, column: house.sourceColumn },
    titleForPerson: (personId, founderId) => source.headTerms?.[personId]
      ? `Oberhaupt des Hauses ${source.headTerms[personId]}` : personId === founderId ? 'Gründer des Hauses' : ''
  });
}
