import { createBlankHouseFamily } from './blank-house-family-factory.js';
import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import { structure, clansById, settlementsById, territoriesById } from './uathneach-territorial-catalog.js';

export const UATHNEACH_HOUSE_FAMILIES = Object.freeze(structure.clans.map(clan => {
  const region = territoriesById.get(clan.regionId), territory = territoriesById.get(clan.territoryId);
  const liege = clansById.get(clan.liege), seat = settlementsById.get(clan.seat);
  const fief = territory.id !== region.id ? territory : null;
  const houseProfile = createHouseProfileFromFolderPath(['Uathneach', region.name], {
    rankId: clan.rankId, seat: seat.name, barony: fief?.name || '',
    liegeHouseId: liege?.familyId || '', liegeHouseName: liege?.name || '',
    folderIcons: [structure.realm.banner, region.banner, ...(fief ? [clan.crest] : []), ''],
    regionEmblems: { kingdom: structure.realm.banner, county: region.banner, barony: fief ? clan.crest : '', seat: '' },
  });
  const family = createBlankHouseFamily({ id: clan.familyId, title: `Clan ${clan.name}`,
    emblem: clan.crest.replace('/Stammbäume/', ''), houseProfile,
    description: `${clan.name} haben ihren Sitz in ${seat.name}, Uathneach.${liege ? ` Sie dienen unmittelbar den ${liege.name}.` : ' Sie führen das Fürstentum als Ard Tiarna.'}${clan.id === 'muirin' ? ` Broch an Reithe ist ein fürstliches Sonderlehen innerhalb der Kartenfläche von ${territoriesById.get('uathneach-tir-na-taoide').name}.` : ''}${clan.rankId === 'unknown' ? ' Der Rang ist noch nicht festgelegt.' : ''} Die Familiengeschichte wird gesondert ergänzt.` });
  return Object.freeze({ ...family,
    lineage: Object.freeze({ ...family.lineage, crestFrame: clan.rankId === 'laird' ? 'silver' : 'gold' }),
    extensions: Object.freeze({ ...family.extensions, sourceRevision: 2, principality: 'Uathneach',
      territorialSource: 'Stammbäume/assets/js/data/uathneach-territories.source.json', acceptedVariant: 'original',
      sourceNote: 'Freigegebene Variante 1. Namen, Sitze und unmittelbare Lehnsherren nach Nutzervorgabe; keine genealogischen Personen ergänzt.' }),
  });
}));
