import { checkReviewedTerritory } from './support/reviewed-territory.browser.mjs';

await checkReviewedTerritory({
  county:'Graue Weite',mapId:'cenyr-graue-weite',
  houseCounts:[15,1,1,2,1,2,1,1,1,1,1],pinCount:102,
});
