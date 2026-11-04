import { buildTerritoryRegion } from './territory-region-build.mjs';

await buildTerritoryRegion({
  slug: 'leitheach', region: 'Leitheach', kingdom: 'Leitheach',
  mapFolder: 'Leitheach', version: '20261104-lore-fixes-v1',
  check: process.argv.includes('--check'),
});
