// Registry membership and image production are independent. A newly registered
// family needs a catalogue entry, but only an explicitly reviewed image manifest
// may make its armor ready. Existing image choices and source archives stay intact.
export function projectHouseArmorSources(galleryHouses, imageHouses) {
  const registered = galleryHouses.filter(house => house.location.includes('Celtigerns Wacht'));
  const byId = new Map(registered.map(house => [house.id, house]));
  if (byId.size !== registered.length || new Set(imageHouses.map(house => house.id)).size !== imageHouses.length) {
    throw Error('Doppelte Haus-ID im Hausrüstungsregister oder Bildmanifest.');
  }
  const orphaned = imageHouses.filter(house => !byId.has(house.id));
  if (orphaned.length) throw Error(`Hausrüstungs-Bildzuordnungen ohne Registerhaus prüfen: ${orphaned.map(house => house.id).join(', ')}. Quellen und Bilder erhalten.`);
  const knownImages = new Set(imageHouses.map(house => house.id));
  return [
    ...imageHouses.map(house => ({ ...house, name: byId.get(house.id).name,
      location: byId.get(house.id).location, tree: byId.get(house.id).tree })),
    ...registered.filter(house => !knownImages.has(house.id)).map(house => ({
      id: house.id, name: house.name, regionId: 'celtigerns-wacht', region: 'Celtigerns Wacht',
      location: house.location, tree: house.tree, sourceIllustrationId: '', sourceImage: '', generated: false
    }))
  ];
}
