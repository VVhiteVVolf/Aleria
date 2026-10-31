import { normalizeLayout } from './board-composition-model.mjs?v=20261029-performance-v1';

// Catalog and layout are a matched pair of changing documents. A stale catalog
// must never reject a newly added paper in a fresh layout.
export async function loadBoardCompositionSources(config, request = fetch) {
  const paths = ['assets/data/board-art-catalog.json', ...(config.presetPath ? [config.presetPath] : [])];
  const responses = await Promise.all(paths.map(path => request(path, { cache: 'no-store' })));
  if (responses.some(response => !response.ok)) throw Error('Plakatbibliothek oder Tafelanordnung fehlt.');
  const sources = await Promise.all(responses.map(response => response.json()));
  const assets = sources[0].posters;
  const preset = sources[1] || { layout: { version: 1, posters: [] } };
  if (!assets?.length || !normalizeLayout(preset.layout, assets)) throw Error('Ungültige Tafelanordnung.');
  return { assets, preset };
}
