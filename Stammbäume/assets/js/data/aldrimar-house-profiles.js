import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';

export const ALDRIMAR_REGION_EMBLEMS = Object.freeze({
  aldrimar: 'assets/images/regions/aldrimar.png',
  kronental: 'assets/images/regions/aldrimar-kronental.png',
  ivarsheim: 'assets/images/regions/aldrimar-ivarsheim.png',
  schwarzfenn: 'assets/images/regions/aldrimar-schwarzfenn.png',
  kraehenmoor: 'assets/images/regions/aldrimar-kraehenmoor.png',
  roriksheim: 'assets/images/regions/aldrimar-roriksheim.png'
});

export const ALDRIMAR_HOUSE_EMBLEMS = Object.freeze({
  vaeren: 'assets/images/houses/Aldrimar/clan-vaeren.png',
  wargh: 'assets/images/houses/Aldrimar/clan-wargh.png',
  ragnulf: 'assets/images/houses/Aldrimar/clan-ragnulf.png',
  varangr: 'assets/images/houses/Aldrimar/clan-varangr.png',
  varulv: 'assets/images/houses/Aldrimar/clan-varulv.png'
});

const JARL_CLAN_DEFINITIONS = Object.freeze({
  vaeren: Object.freeze({ jarltum: 'Kronental', jarltumEmblem: ALDRIMAR_REGION_EMBLEMS.kronental, rankId: 'royal' }),
  wargh: Object.freeze({ jarltum: 'Ivarsheim', jarltumEmblem: ALDRIMAR_REGION_EMBLEMS.ivarsheim, rankId: 'jarl' }),
  ragnulf: Object.freeze({ jarltum: 'Schwarzfenn', jarltumEmblem: ALDRIMAR_REGION_EMBLEMS.schwarzfenn, rankId: 'jarl' }),
  varangr: Object.freeze({ jarltum: 'Krähenmoor', jarltumEmblem: ALDRIMAR_REGION_EMBLEMS.kraehenmoor, rankId: 'jarl' }),
  varulv: Object.freeze({
    jarltum: 'Roriksheim',
    jarltumEmblem: ALDRIMAR_REGION_EMBLEMS.roriksheim,
    rankId: 'jarl',
    folderPath: Object.freeze(['Aldrimar', 'Roriksheim', 'Rorikstal', 'Rorikshall']),
    baronyEmblem: 'assets/images/regions/aldrimar-rorikstal.png',
    seatEmblem: 'assets/images/regions/aldrimar-roriksheim-stadt.png'
  })
});

function createJarlClanProfile(definition) {
  return createHouseProfileFromFolderPath(
    definition.folderPath || ['Aldrimar', definition.jarltum],
    {
      rankId: definition.rankId,
      ...(definition.rankId === 'royal'
        ? {}
        : {
            liegeHouseId: 'house-vaeren',
            liegeHouseName: 'Clan Vaeren'
          }),
      regionEmblems: {
        kingdom: ALDRIMAR_REGION_EMBLEMS.aldrimar,
        county: definition.jarltumEmblem,
        barony: definition.baronyEmblem || '',
        seat: definition.seatEmblem || ''
      }
    }
  );
}

export const ALDRIMAR_HOUSE_PROFILES = Object.freeze(
  Object.fromEntries(
    Object.entries(JARL_CLAN_DEFINITIONS).map(([slug, definition]) => [
      slug,
      createJarlClanProfile(definition)
    ])
  )
);
