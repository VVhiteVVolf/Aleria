import { checkReviewedTerritory } from './support/reviewed-territory.browser.mjs';

await checkReviewedTerritory({
  county: 'Ährental', mapId: 'cenyr-aehrental',
  houseCounts: [12,2,2,1,2,2], pinCount: 61,
});
