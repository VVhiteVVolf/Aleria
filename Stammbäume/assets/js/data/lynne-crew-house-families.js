import { createBlankHouseFamily } from './blank-house-family-factory.js';
import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import { KLAUENINSEL_REGION_EMBLEMS } from './klaueninseln-house-profiles.js';
import { LYNNE_CREW_MEMBERS, createLynneCrewPerson } from './lynne-crew-family-members.js?v=lynne-20261005';

function createCrewHouse(member) {
  const slug = member.surname.toLowerCase();
  const folderPath = member.seat === 'Talgarth'
    ? ['Cenyr', 'Klaueninsel', 'Sturmklaue', 'Talgarth']
    : ['Cenyr', 'Klaueninsel'];
  const houseProfile = createHouseProfileFromFolderPath(folderPath, {
    rankId: member.rankId,
    regionEmblems: {
      kingdom: KLAUENINSEL_REGION_EMBLEMS.cenyr,
      county: KLAUENINSEL_REGION_EMBLEMS.county,
      ...(member.seat === 'Talgarth'
        ? { barony: KLAUENINSEL_REGION_EMBLEMS.lordships.Sturmklaue }
        : {})
    }
  });
  const base = createBlankHouseFamily({
    id: `haus-${slug}`,
    title: `Haus ${member.surname}`,
    emblem: member.emblem || `assets/images/houses/Klaueninsel/lynne-crew/haus-${slug}.png`,
    houseProfile,
    description: member.houseDescription
  });
  return Object.freeze({
    ...base,
    houses: member.emblem ? base.houses.map(house => ({
      ...house, extensions: { registryManagedFields: ['emblem'] }
    })) : base.houses,
    persons: Object.freeze([createLynneCrewPerson(member.id)]),
    lineage: Object.freeze({
      ...base.lineage,
      crestFrame: member.rankId === 'knight' ? 'silver' : member.rankId === 'commoner' ? 'iron' : 'gold',
      crestSubtitle: member.rankId === 'knight' ? 'Niederes Ritterhaus der Klaueninseln'
        : member.rankId === 'commoner' ? 'Bürgerfamilie der Klaueninseln' : 'Klaueninseln · Hausrang offen'
    }),
    view: Object.freeze({ ...base.view, focusPersonId: member.id }),
    extensions: Object.freeze({
      ...base.extensions,
      blankFamily: false,
      sourceRevision: member.sourceRevision || 1,
      ...(member.emblem ? { registryManagedDocumentFields: ['emblem'] } : {}),
      ...(member.seat ? {
        registryManagedHouseProfileFields: ['seat', 'barony', 'county', 'kingdom', 'regionEmblems'],
        registryManagedRecordFields: ['folderPath']
      } : {}),
      sourceNote: 'Nutzervorlage vom 04.10.2026. Nur belegte Angehörige; keine erfundenen Gründer, Eltern, Ehen oder Lehensverhältnisse.',
      pendingFamilySituation: Object.freeze({
        openQuestions: Object.freeze(['Weitere Angehörige und Abstammung', 'Hausoberhaupt', ...(member.seat ? [] : ['Genauer Familiensitz'])])
      })
    })
  });
}

export const LYNNE_CREW_HOUSE_FAMILIES = Object.freeze(
  LYNNE_CREW_MEMBERS.filter(member => !member.existingHouse).map(createCrewHouse)
);
