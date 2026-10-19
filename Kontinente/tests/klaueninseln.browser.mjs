import { checkReviewedTerritory } from './support/reviewed-territory.browser.mjs';

await checkReviewedTerritory({
  county:'Klaueninsel',mapId:'cenyr-klaueninseln',
  houseCounts:[36,1,1,1,2,1,5,1,1,1,1,1,1,1],pinCount:46,
});
