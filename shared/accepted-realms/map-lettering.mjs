// Code-native cartographic lettering over the preserved source raster. No
// geography or pixels of the original map are edited or resampled.
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);
export function renderLabelledMap(realm, dimensions, sourceBytes) {
  const [width, height] = dimensions;
  const names = realm.settlements.filter(s => s.overlayLabel && s.label).map(s => ({
    id: `place-${s.id}`, text: s.name,
    position: realm.id === 'talyndor' ? [s.label[0], s.label[1] + (s.principal && s.id !== realm.capital ? 1 : .7)] : s.label,
    width: realm.id === 'aeldrunmar' ? 8.5 : realm.id === 'talyndor' ? s.id === realm.capital ? 15 : s.principal ? 9.2 : 8.2 : 11,
    height: realm.id === 'talyndor' && s.principal && s.id !== realm.capital ? 2.8 : 2.1,
  }));
  const labels = [...names, ...(realm.mapAnnotations || [])].map(label => {
    const x = label.position[0] / 100 * width, y = label.position[1] / 100 * height;
    const boxWidth = label.width / 100 * width, boxHeight = label.height / 100 * height;
    const fontSize = Math.min(width * .012, boxHeight * .57);
    return `<g id="${escape(label.id)}"><rect x="${x - boxWidth / 2}" y="${y - boxHeight / 2}" width="${boxWidth}" height="${boxHeight}" rx="${fontSize * .18}" fill="#eee2bd" stroke="#5d4936" stroke-width="${width * .0003}"/><text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" fill="#30251c" font-family="Georgia,serif" font-weight="bold" font-size="${fontSize}">${escape(label.text)}</text></g>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="map-title"><title id="map-title">${escape(realm.title)} · bestätigte Orts- und Gebietsbezeichnungen</title><image width="${width}" height="${height}" href="data:image/webp;base64,${sourceBytes.toString('base64')}"/>${labels.join('')}</svg>\n`;
}
