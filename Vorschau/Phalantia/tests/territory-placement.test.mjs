import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {HOUSES} from '../house-data.mjs';
import {SETTLEMENTS,REGIONS,MAP_VARIANTS,MAP_CONTEXT} from '../territory-data.mjs';
import {createMapProposal} from '../map-data.mjs';
import {createHousePlacementState,PLACEMENT_STORAGE_KEY} from '../placement-state.mjs';

test('the source map supplies eight Phalantian seats; Alantaic remains outside the realm',() => {
  assert.equal(SETTLEMENTS.length,8);
  assert.equal(SETTLEMENTS.filter(city => city.capital).length,1);
  assert.equal(SETTLEMENTS.find(city => city.capital).id,'lysandreia');
  assert(!SETTLEMENTS.some(city => /alantaic/i.test(city.id+' '+city.name)));
  assert.equal(REGIONS.length,8);
  assert.deepEqual(REGIONS.flatMap(region => region.cityIds),SETTLEMENTS.map(city => city.id));
  assert.equal(MAP_CONTEXT.bordersDrawn,false);
  assert.equal(MAP_CONTEXT.outsidePlaces[0].name,'Alantaic');
  assert.deepEqual(MAP_VARIANTS[0].imageSize,[1281,925]);
  assert.equal(MAP_VARIANTS[0].bakedNames,true);
  for (const city of SETTLEMENTS) {
    assert([...city.pin,...city.point].every(value => value > 0 && value < 100));
    for (const [axis,value] of city.point.entries()) {
      assert(Math.abs(value*MAP_CONTEXT.sourceImageSize[axis]/100-city.sourcePixelCentre[axis]) < .01);
    }
  }
});

test('two royal houses share Lysandreia and seven hereditary Perioikic houses cover the other seats',() => {
  assert.equal(HOUSES.length,9);
  assert.equal(new Set(HOUSES.map(house => house.id)).size,9);
  const royal = HOUSES.filter(house => house.royal);
  assert.equal(royal.length,2);
  assert(royal.every(house => house.rank === 'König' && house.sourceSeat === 'lysandreia' && house.prototypeId === 'prototype-07'));
  const perioikic = HOUSES.filter(house => !house.royal);
  assert.equal(perioikic.length,7);
  assert(perioikic.every(house => house.rank === 'Periökenhaus' && house.prototypeId !== 'prototype-07'));
  assert.deepEqual(new Set(perioikic.map(house => house.sourceSeat)),new Set(SETTLEMENTS.filter(city => !city.capital).map(city => city.id)));
});

test('seat drafts preserve hereditary identity and reject invalid imports atomically',() => {
  const state = createHousePlacementState({houses:HOUSES,settlements:SETTLEMENTS});
  const initial = state.current(),housesBefore = structuredClone(HOUSES);
  const household = HOUSES.find(house => !house.royal);
  assert(state.move(household.id,'lysandreia'));
  const modified = state.current(),hasUndo = state.canUndo();
  const foreign = {schemaVersion:1,realm:'solestia',placements:modified};
  const incomplete = {schemaVersion:1,realm:'phalantia',placements:Object.fromEntries(Object.entries(modified).slice(1))};
  const unknownSeat = {schemaVersion:1,realm:'phalantia',placements:{...modified,[household.id]:'alantaic'}};
  for (const invalid of [foreign,incomplete,unknownSeat]) {
    assert.throws(() => state.restore(invalid));
    assert.deepEqual(state.current(),modified);
    assert.equal(state.canUndo(),hasUndo);
  }
  assert.deepEqual(HOUSES,housesBefore);
  assert(state.undo());
  assert.deepEqual(state.current(),initial);
  assert(state.move(household.id,null));
  const exported = JSON.parse(state.serialize());
  assert(state.reset());
  assert.deepEqual(state.current(),initial);
  state.restore(exported);
  assert.equal(state.current()[household.id],null);
  const proposal = createMapProposal({houses:HOUSES,placements:state.current()});
  assert.equal(proposal.clans.find(house => house.id === household.id).seat,null);
  assert.equal(PLACEMENT_STORAGE_KEY,'aleria:proposal:phalantia:placements:v1');
});

test('both supplied source PNGs are retained byte for byte',async () => {
  const root = new URL('../',import.meta.url);
  const sources = JSON.parse(await readFile(new URL('assets.source.json',root),'utf8'));
  assert.equal(sources.length,2);
  for (const item of sources) {
    const bytes = await readFile(new URL('../../'+item.original,root));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256);
  }
});
