import { buildTerritoryRegion } from './territory-region-build.mjs';

await buildTerritoryRegion({
  slug: 'roriksheim', region: 'Roriksheim', kingdom: 'Aldrimar',
  version: 'roriksheim-20261020d', check: process.argv.includes('--check'),
});
