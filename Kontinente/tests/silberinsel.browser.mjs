import { checkReviewedTerritory } from './support/reviewed-territory.browser.mjs';

await checkReviewedTerritory({
  county:'Silberinsel', mapId:'cenyr-silberinsel',
  houseCounts:[18,1,1,1,1,2], pinCount:32,
});
