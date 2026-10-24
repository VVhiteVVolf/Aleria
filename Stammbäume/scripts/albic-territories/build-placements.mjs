import { territoryChain, reviewedFief } from '../../assets/js/modules/albic-territories/fief-catalog.js';

const relative = value => value?.replace(/^\/Stammbäume\//, '') || '';
const folderName = territory => territory.name.replace(/^Oberherrschaft\s+/, '');

function placementProfile(realm, territory, territories, previous) {
  const chain = territoryChain(territory, territories), seat = territory.seat || previous.seat;
  const folderPath = [...chain.map((t, index) => index ? folderName(t) : realm), seat].filter(Boolean);
  const folderIcons = [...chain.map(t => relative(t.banner || t.crest)), ''];
  return { kingdom: realm, county: chain[1] ? folderName(chain[1]) : '',
    barony: chain.length > 2 ? territory.name : '', seat, folderPath, folderIcons,
    regionEmblems: { kingdom: folderIcons[0], county: folderIcons[1] || '',
      barony: chain.length > 2 ? relative(territory.banner || territory.crest) : '',
      seat: previous.regionEmblems?.seat || '' } };
}

export function buildAlbicPlacements(catalogs, registry, aliases) {
  const placements = [], secondaryPlacements = [], folders = new Map();
  const addFolder = (path, icon, description = '', searchTerms = []) => folders.set(JSON.stringify(path), { path, icon: relative(icon), description, searchTerms });
  for (const { realm, territories } of catalogs) {
    for (const territory of territories.filter(t => t.href && !t.pending)) {
      const chain = territoryChain(territory, territories);
      const path = chain.map((t, index) => index ? folderName(t) : realm);
      addFolder(path, territory.banner || territory.crest, `${territory.type} · ${territory.seat || realm}`);
    }
    for (const family of registry.filter(record => record.houseProfile.kingdom === realm)) {
      const owned = territories.filter(t => t.familyId === family.id && t.type !== 'Fürstentum' && !t.pending)
        .sort((a,b) => territoryChain(b, territories).length - territoryChain(a, territories).length);
      // An extinct predecessor is not given a new contemporary fief.
      const territory = owned[0] || territories.find(t => reviewedFief(t.id)?.formerFamilyIds?.includes(family.id));
      if (!territory) continue;
      const profile = placementProfile(realm, territory, territories, family.houseProfile);
      placements.push({ familyId: family.id, territoryId: territory.id, profile });
      addFolder(profile.folderPath, profile.regionEmblems.seat, `Sitz ${profile.seat}`, reviewedFief(territory.id)?.seatAliases || []);
    }
    // A displaced clan may have a separately ranked, already documented fief
    // elsewhere. Update that placement without changing its historical main line.
    for (const territory of territories.filter(t => t.familyId && reviewedFief(t.id))) {
      const family = registry.find(record => record.id === territory.familyId);
      if (!family || family.houseProfile.kingdom === realm) continue;
      const local = family.additionalPlacements.find(p => p.houseProfile?.kingdom === realm);
      if (!local) continue;
      const profile = placementProfile(realm, territory, territories, local.houseProfile);
      secondaryPlacements.push({ familyId: family.id, territoryId: territory.id,
        kingdom: realm, profile });
      addFolder(profile.folderPath, profile.regionEmblems.seat, `Sitz ${profile.seat}`);
    }
  }
  return { schemaVersion: 1, placements, secondaryPlacements, folders: [...folders.values()], aliases };
}
