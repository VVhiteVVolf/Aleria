// Pure import of reviewed coordinates. The caller owns snapshot/revision guards.
export function createReviewedPins(source, { catalog, presets, describePlace, region }) {
  if (source.coordinateOrigin !== 'bottom-left') throw new Error('Nicht unterstützter Koordinatenursprung');
  const [width, height] = source.imageSize;
  if (!(width > 0 && height > 0)) throw new Error('Ungültige Kartengröße');
  const pins = source.markers.map(marker => {
    const category = catalog.definition({ label: marker.category });
    if (!category) throw new Error(`Unbekannte Ortsart: ${marker.category}`);
    if (![marker.x, marker.y].every(Number.isFinite) || marker.x < 0 || marker.x > width || marker.y < 0 || marker.y > height) {
      throw new Error(`Koordinate außerhalb der Karte: ${marker.id}`);
    }
    const details = describePlace(marker);
    const fields = { Name: marker.title, Typ: marker.category, ...details.fields, Lehensherr: details.fields?.Lehensherr ?? details.house };
    if (details.trade) fields.Gewerbe = details.trade;
    const table = presets.createTable(marker.templateId, category).map(row => ({ ...row, v: fields[row.k] || '' }));
    for (const [k, v] of Object.entries(fields)) if (!table.some(row => row.k === k)) table.push({ k, v });
    return {
      id: marker.id, title: marker.title, x: marker.x / width, y: 1 - marker.y / height,
      cat: category.id, templateId: marker.templateId, kind: 'place', pinMarker: marker.icon,
      img: '', imgLink: '', crest: details.crest, crestLink: details.houseHref,
      banner: details.banner, bannerLink: details.bannerHref || details.territory.href, region, house: details.house,
      faction: details.faction, table, text: details.text, secret: false, dominionId: details.territory.id,
      ...(marker.sourceRef ? { sourceRef: structuredClone(marker.sourceRef) } : {}),
      ...(Array.isArray(marker.residentFamilyIds) ? { residentFamilyIds: [...marker.residentFamilyIds] } : {}),
      ...(Number.isFinite(marker.pinMarkerScale) && marker.pinMarkerScale > 0 ? { pinMarkerScale: marker.pinMarkerScale } : {}),
      ...(details.coRulers?.length ? { coRulers: details.coRulers } : {}),
    };
  });
  if (new Set(pins.map(pin => pin.id)).size !== pins.length) throw new Error('Doppelte Marker-ID');
  return pins;
}
