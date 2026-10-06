import { createBlankHouseFamily } from './blank-house-family-factory.js';
import { createFamilyPerson } from './family-record-builders.js';
import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import { KLAUENINSEL_REGION_EMBLEMS } from './klaueninseln-house-profiles.js';

const base = createBlankHouseFamily({
  id: 'haus-gwyllt', title: 'Haus Gwyllt',
  emblem: 'assets/images/houses/Klaueninsel/haus-gwyllt.png',
  description: 'Familie aus Talgarth. Deiniol Gwyllt dient als Schiffskaplan auf der Dychwelyd.',
  houseProfile: createHouseProfileFromFolderPath(['Cenyr', 'Klaueninsel', 'Sturmklaue', 'Talgarth'], {
    rankId: 'unknown',
    regionEmblems: { kingdom: KLAUENINSEL_REGION_EMBLEMS.cenyr,
      county: KLAUENINSEL_REGION_EMBLEMS.county,
      barony: KLAUENINSEL_REGION_EMBLEMS.lordships.Sturmklaue }
  })
});

export const HOUSE_GWYLLT_FAMILY = Object.freeze({
  ...base,
  persons: [createFamilyPerson({
    id: 'deiniol-gwyllt', name: 'Deiniol Gwyllt', sex: 'male', birth: '1682',
    houseId: 'house-gwyllt', title: 'Schiffskaplan der Dychwelyd',
    portrait: '../AleriaAlmanach/assets/ship-crews/parzifals-schiffsmannschaft/corrected-2026-10-06/deiniol-gwyllt.png',
    notes: 'Streiter Baldrans; ruhig, väterlich und trocken-humorig.',
    tags: ['Dychwelyd', 'Parzifals Schiffsmannschaft']
  })],
  lineage: { ...base.lineage, crestSubtitle: 'Talgarth · Klaueninseln' },
  extensions: { ...base.extensions, blankFamily: false, sourceRevision: 1,
    sourceNote: 'Nutzerkorrektur vom 06.10.2026: Schiffskaplan Deiniol Gwyllt; eigenständiges Haus. Keine belegte Verwandtschaft mit Prys.',
    heraldryDescription: 'Auf Dunkelblau ein silbernes, spitzarmiges Zierkreuz mit eingezogenen Flanken; goldener Rundrand. Motiv dem Mantel Deiniol Gwyllts entnommen.',
    pendingFamilySituation: { openQuestions: ['Weitere Angehörige und Abstammung', 'Hausrang und Hausoberhaupt'] }
  }
});
