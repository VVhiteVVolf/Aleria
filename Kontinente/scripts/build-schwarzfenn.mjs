import { buildTerritoryRegion } from './territory-region-build.mjs';

await buildTerritoryRegion({
  slug: 'schwarzfenn', region: 'Schwarzfenn', kingdom: 'Aldrimar',
  version: 'schwarzfenn-20261022', check: process.argv.includes('--check'),
});
