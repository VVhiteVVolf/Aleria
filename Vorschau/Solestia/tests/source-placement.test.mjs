import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile,access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { MAP_VARIANTS,REGIONS,BARONIES,DUCAL_DOMAIN,SETTLEMENTS,SOURCE_HOUSE_SEATS } from '../territory-data.mjs';
import { createHousePlacementState } from '../placement-state.mjs';
import { createMapProposal } from '../map-data.mjs';
import { PLACEMENT_STORAGE_KEY } from '../house-placement.mjs';

const root = new URL('../',import.meta.url);
const json = async path => JSON.parse(await readFile(new URL(path,root),'utf8'));
const digest = data => createHash('sha256').update(data).digest('hex');
const houses = SOURCE_HOUSE_SEATS.map(seat => ({ id:seat.houseId,name:seat.houseId,
  rank:seat.houseId === 'house-ducal' ? 'Herzog' : seat.regionId === 'ducal-domain' ? null : 'Baron',
  sourceSeat:seat.settlementId,ready:true,crest:'assets/originals/previews/solestia.webp' }));

test('the supplied Solestia emblem is copied byte-for-byte with separate preview and untouched alpha',async () => {
  const sources = await json('sources/supplied-emblems.json');
  assert.equal(sources.suppliedEmblems.length,1);
  const emblem = sources.suppliedEmblems[0];
  const source = new URL(emblem.sourceFile,pathToFileURL(sources.sourceDirectory + '/'));
  assert.deepEqual(emblem.dimensions,[479,483]);
  assert.equal(emblem.id,'realm-solestia');
  assert.equal(emblem.alphaChanged,false);
  assert.equal(emblem.originalUnchanged,true);
  assert.equal(digest(await readFile(source)),emblem.sourceSha256);
  assert.equal(digest(await readFile(new URL(emblem.original,root))),emblem.sourceSha256);
  assert.equal(digest(await readFile(new URL(emblem.preview,root))),emblem.previewSha256);
});

test('two aligned maps share the ten measured source anchors without inventing marks on the normal map',async () => {
  const source = await json('sources/map-sources.json');
  assert.equal(MAP_VARIANTS.length,2);
  assert.equal(source.maps[0].markersDrawnInSource,false);
  assert.equal(source.maps[1].markersDrawnInSource,true);
  assert.deepEqual(source.maps[0].sourceMarkers,source.maps[1].sourceMarkers);
  assert.equal(source.maps[1].sourceMarkers.length,10);
  for (const map of source.maps) {
    assert.deepEqual(map.sourceImageSize,[3605,4097]);
    assert.deepEqual(map.imageSize,[3604,4096]);
    assert.equal(map.noGeometryEdits,true);
    assert.equal(digest(await readFile(new URL(map.map,root))),map.sha256);
    assert.equal(digest(await readFile(pathToFileURL(map.sourcePath))),map.sourceSha256);
  }
  for (const [index,city] of SETTLEMENTS.entries()) {
    const marker = source.maps[1].sourceMarkers[index];
    assert.deepEqual(city.sourcePixelCentre,marker.centre);
    for (const [axis,value] of city.point.entries()) {
      assert(Math.abs(value*source.maps[1].sourceImageSize[axis]/100-marker.centre[axis]) < .01);
    }
    assert([...city.pin,...city.label].every(value => value > 0 && value < 100));
  }
});

test('nine baronies and one ducal domain cover each source city once; the diamond is the capital',() => {
  assert.equal(SETTLEMENTS.length,10);
  assert.equal(BARONIES.length,9);
  assert.equal(REGIONS.length,10);
  assert.equal(SETTLEMENTS.filter(city => city.sourceMarkerShape === 'square').length,9);
  const capital = SETTLEMENTS.find(city => city.sourceMarkerShape === 'diamond');
  assert.equal(capital.id,'ort-01');
  assert.equal(DUCAL_DOMAIN.capitalId,capital.id);
  assert.equal(DUCAL_DOMAIN.houseId,'house-ducal');
  assert.deepEqual(new Set(REGIONS.flatMap(region => region.cityIds)),new Set(SETTLEMENTS.map(city => city.id)));
  assert.equal(REGIONS.flatMap(region => region.cityIds).length,10);
  assert(BARONIES.every(region => region.kindLabel === 'Baronie' && !region.ducalDomain));
});

test('the twelve-house proposal starts three houses in the capital and one at each barony, while every seat stays editable',() => {
  const state = createHousePlacementState({ houses,settlements:SETTLEMENTS });
  const initial = state.current(),before = structuredClone(houses);
  assert.equal(houses.length,12);
  assert.deepEqual(Object.keys(initial).filter(id => initial[id] === 'ort-01').sort(),['house-ducal','pool-10','pool-11']);
  for (const city of SETTLEMENTS.slice(1)) assert.equal(Object.values(initial).filter(id => id === city.id).length,1);
  assert(state.move('house-ducal','ort-02'),'the starting ducal seat is not silently locked');
  assert(state.move('pool-01','ort-01'));
  assert.deepEqual(houses,before,'seat changes cannot change house ranks or their source proposal');
  assert(state.undo());
  assert(state.reset());
  assert.deepEqual(state.current(),initial);
  assert.equal(PLACEMENT_STORAGE_KEY,'aleria:proposal:solestia:placements:v1');
});

test('foreign, incomplete or invalid imports are atomic and both map views retain the same assignments',() => {
  const state = createHousePlacementState({ houses,settlements:SETTLEMENTS });
  state.move('pool-10','ort-05');
  const before = state.current(),undo = state.canUndo();
  for (const invalid of [
    { schemaVersion:1,realm:'sylvarant',placements:before },
    { schemaVersion:1,realm:'solestia',placements:{ ...before,'pool-11':'unknown' } },
    { schemaVersion:1,realm:'solestia',placements:Object.fromEntries(Object.entries(before).slice(1)) },
    { schemaVersion:1,realm:'solestia',placements:{ ...before,'foreign-house':null } },
  ]) {
    assert.throws(() => state.restore(invalid));
    assert.deepEqual(state.current(),before); assert.equal(state.canUndo(),undo);
  }
  for (const variant of MAP_VARIANTS) {
    const map = createMapProposal({ houses,placements:before,variant });
    assert.equal(map.id,variant.id);
    assert.equal(map.clans.find(house => house.id === 'pool-10').seat,'ort-05');
    assert(map.clans.every(house => house.crest === 'originals/previews/solestia.webp'));
  }
  assert.equal(JSON.parse(state.serialize()).realm,'solestia');
});
