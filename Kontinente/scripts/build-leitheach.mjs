import { buildTerritoryRegion } from './territory-region-build.mjs';

await buildTerritoryRegion({
  slug: 'leitheach', region: 'Leitheach', kingdom: 'Leitheach',
  mapFolder: 'Leitheach', version: 'leitheach-20261024c',
  check: process.argv.includes('--check'),
});
