import source from './placements.source.json' with { type: 'json' };

const placementsById = new Map(source.placements.map(entry => [entry.familyId, entry]));
const managedFields = ['seat', 'barony', 'county', 'kingdom', 'folderPath', 'folderIcons', 'regionEmblems'];

// This boundary changes territorial metadata only. Genealogy, ranks and IDs
// remain owned by the original family sources.
export function withReviewedAlbicPlacement(family) {
  const placement = placementsById.get(family.document.id);
  if (!placement) return family;
  return Object.freeze({ ...family, document: { ...family.document,
    houseProfile: { ...family.document.houseProfile, ...placement.profile } },
    extensions: { ...family.extensions,
      albicTerritorialReview: 1,
      registryManagedHouseProfileFields: [...new Set([
        ...(family.extensions?.registryManagedHouseProfileFields || []), ...managedFields,
      ])],
      registryManagedRecordFields: [...new Set([
        ...(family.extensions?.registryManagedRecordFields || []), 'folderPath',
      ])] } });
}

export function reviewedAlbicAdditionalPlacements(familyId, placements) {
  return placements.map(placement => {
    const reviewed = source.secondaryPlacements?.find(entry => entry.familyId === familyId
      && entry.kingdom === placement.houseProfile?.kingdom);
    return reviewed ? { ...placement, folderPath: reviewed.profile.folderPath,
      houseProfile: { ...placement.houseProfile, ...reviewed.profile } } : placement;
  });
}

export function withReviewedAlbicFolders(folders) {
  const renamed = folders.map(folder => ({ ...folder, path: folder.path.map((part, index) =>
    index ? source.aliases.find(alias => alias.realm === folder.path[0] && alias.from === part)?.to || part : part) }));
  const currentPaths = new Set(source.folders.map(folder => JSON.stringify(folder.path)));
  const reviewedSeats = new Set([...source.placements, ...(source.secondaryPlacements || [])]
    .flatMap(placement => [placement.profile.seat,
      ...source.folders.filter(folder => JSON.stringify(folder.path) === JSON.stringify(placement.profile.folderPath))
        .flatMap(folder => folder.searchTerms || [])]
      .map(seat => placement.profile.kingdom + '\0' + seat)));
  const retained = renamed.filter(folder => !(folder.path.length === 3
    && reviewedSeats.has(folder.path[0] + '\0' + folder.path[2])
    && !currentPaths.has(JSON.stringify(folder.path))));
  const byPath = new Map(retained.map(folder => [JSON.stringify(folder.path), folder]));
  for (const folder of source.folders) {
    const key = JSON.stringify(folder.path), previous = byPath.get(key);
    const seatAliases = renamed.filter(old => old.path[0] === folder.path[0]
      && old.path.length >= 3 && old.path.at(-1) === folder.path.at(-1));
    byPath.set(key, { ...previous, ...folder,
      description: previous?.description || folder.description,
      searchTerms: [...new Set([...(previous?.searchTerms || []), ...(folder.searchTerms || []),
        ...seatAliases.flatMap(old => old.searchTerms || [])])] });
  }
  return Object.freeze([...byPath.values()]);
}
