import { createHash } from 'node:crypto';

export const reviewHash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

export function protectedAlbicFamilies(records) {
  return records.map(record => {
    const copy = structuredClone(record);
    delete copy.folderPath; delete copy.hierarchy;
    const omitLocation = profile => {
      if (!profile) return;
      for (const field of ['seat', 'barony', 'county', 'kingdom', 'folderPath', 'folderIcons', 'regionEmblems']) delete profile[field];
    };
    copy.houseProfile = { ...copy.houseProfile };
    copy.family.document.houseProfile = { ...copy.family.document.houseProfile };
    omitLocation(copy.houseProfile);
    omitLocation(copy.family.document.houseProfile);
    copy.additionalPlacements = (copy.additionalPlacements || []).map(placement => {
      const projected = { ...placement, houseProfile: { ...placement.houseProfile } };
      delete projected.folderPath;
      omitLocation(projected.houseProfile);
      return projected;
    });
    // Biography defaults and their migration versions belong to the biography
    // feature. They can change while every person and relationship stays intact.
    for (const field of ['albicTerritorialReview', 'registryManagedHouseProfileFields', 'registryManagedRecordFields',
      'houseBiographyModule', 'registryManagedEntitySourceRevision', 'sourceRevision']) delete copy.family.extensions[field];
    return copy;
  });
}

export function protectedAlbicMap(state) {
  return { pins: state.pins.map(pin => ({ id: pin.id, title: pin.title, x: pin.x, y: pin.y,
    cat: pin.cat, templateId: pin.templateId, pinMarker: pin.pinMarker, text: pin.text,
    sourceId: pin.sourceRef?.markerId || pin.sourceRef?.settlementId,
    residentFamilyIds: pin.residentFamilyIds })),
    geometry: state.regions.map(region => ({ id: region.id, kind: region.kind, paths: region.paths,
      source: region.source, parentId: region.parentId, dominionId: region.dominionId,
      familyId: region.familyId })), mapImages: state.mapImages };
}
