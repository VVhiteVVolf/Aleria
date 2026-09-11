import test from 'node:test';
import assert from 'node:assert/strict';
import { HOUSE_RANKS } from '../../Familien Häuser und Clans/modules/house-content/house-ranks.generated.mjs';
import { houseRankLabel } from '../modules/territory-directory/house-rank.mjs';

test('Hausränge entsprechen den vorhandenen Hausakten', () => {
  for (const [id, label] of [
    ['draig','Grafenhaus'], ['gafyr','Ritterfürstenhaus'], ['arwydd','Ritterfürstenhaus'],
    ['gwyvern','Baronenhaus'], ['gelyn','Ritterherrenhaus'], ['gwyllach','Bürgerliches Haus'],
    ['illysywen','Ritterfürstenhaus'], ['ui-talamh','Ard Tiarna (Fürst)'],
  ]) assert.equal(houseRankLabel(HOUSE_RANKS['haus-'+id]), label, id);
});
test('Ein unbekannter Rang wird nicht aus Wappen oder Position abgeleitet', () => {
  assert.equal(houseRankLabel(HOUSE_RANKS['haus-ard-conbhron']), 'Offen');
  assert.equal(houseRankLabel(undefined), 'Offen');
  assert.equal(houseRankLabel('Eigenständiger Rang'), 'Eigenständiger Rang');
});
