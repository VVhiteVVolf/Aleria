import { buildTerritoryRegion } from './territory-region-build.mjs';

await buildTerritoryRegion({
  slug: 'ivarsheim', region: 'Ivarsheim', kingdom: 'Aldrimar',
  version: 'ivarsheim-20261021c', check: process.argv.includes('--check'),
});
