import { buildTerritoryRegion } from './territory-region-build.mjs';

await buildTerritoryRegion({
  slug: 'kraehenmoor', region: 'Krähenmoor', kingdom: 'Aldrimar',
  version: 'kraehenmoor-20261022b', check: process.argv.includes('--check'),
});
