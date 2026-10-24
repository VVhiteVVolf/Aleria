import { buildTerritoryRegion } from './territory-region-build.mjs';

await buildTerritoryRegion({
  slug: 'leitheach', region: 'Leitheach', kingdom: 'Leitheach',
  mapFolder: 'Leitheach', version: 'albic-fiefs-20261024',
  check: process.argv.includes('--check'),
});
