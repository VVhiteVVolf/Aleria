import { buildTerritoryRegion } from './territory-region-build.mjs';

await buildTerritoryRegion({
  slug: 'heldenwacht', region: 'Heldenwacht', kingdom: 'Aldrimar',
  version: 'heldenwacht-20261022b', check: process.argv.includes('--check'),
});
