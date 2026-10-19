import { checkReviewedTerritory } from './support/reviewed-territory.browser.mjs';

await checkReviewedTerritory({
  county: 'Tal der Milane', mapId: 'cenyr-tal-der-milane',
  houseCounts: [19,2,2,2,2,1,1], pinCount: 83,
});
