import { checkReviewedTerritory } from './support/reviewed-territory.browser.mjs';

await checkReviewedTerritory({
  county: 'Weidebucht', mapId: 'cenyr-weidebucht',
  houseCounts: [20,2,2,1,2,1], pinCount: 81,
});
