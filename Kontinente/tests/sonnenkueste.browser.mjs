import { checkReviewedTerritory } from './support/reviewed-territory.browser.mjs';

await checkReviewedTerritory({
  county: 'Sonnenküste', mapId: 'cenyr-sonnenkueste',
  houseCounts: [24,3,2,1,1,1], pinCount: 68,
});
