import test from 'node:test';
import assert from 'node:assert/strict';
import {access} from 'node:fs/promises';
import {HOUSES} from '../house-data.mjs';
import {ESTATES} from '../estate-data.mjs';
import {CLASS_PROTOTYPES,HOUSE_WARRIORS} from '../warrior-data.mjs';
import {REGION_SHIELDS} from '../region-shield-data.mjs';
import {REGIONS} from '../territory-data.mjs';

test('singular house and estate labels retain the existing placement identities',() => {
  assert.deepEqual(HOUSES.map(house => [house.id,house.name]),[
    ['house-oresthiden','Oresthid'],['house-therakiden','Therakid'],['house-daskyren','Daskyr'],
    ['house-pherakides','Pherakid'],['house-melyrion','Melyrion'],['house-nerathen','Nerath'],
    ['house-kallorys','Kallorys'],['house-erythaden','Erythad'],['house-theskariden','Theskarid'],
  ]);
  assert.deepEqual(ESTATES.map(estate => [estate.id,estate.name]),[
    ['basileis','Basileus'],['perioeken','Periöke'],['kriegeradel','Doryade'],
    ['freie-buerger','Eleuther'],['heloten','Helot'],['gaeste','Xenos'],
  ]);
});

test('all nine houses have a distinct prepared house warrior and the Toxot uses its corrected drawing',async () => {
  assert.equal(HOUSE_WARRIORS.length,9);
  assert.deepEqual(new Set(HOUSE_WARRIORS.map(warrior => warrior.houseId)),new Set(HOUSES.map(house => house.id)));
  assert.equal(new Set(HOUSE_WARRIORS.map(warrior => warrior.image)).size,9);
  const prototypeIds = new Set(CLASS_PROTOTYPES.map(prototype => prototype.id));
  for (const warrior of HOUSE_WARRIORS) {
    assert(prototypeIds.has(warrior.prototypeId));
    assert.equal(warrior.prototypeId,HOUSES.find(house => house.id === warrior.houseId).prototypeId);
    assert.equal(warrior.ready,true,warrior.houseId);
    await access(new URL('../'+warrior.image,import.meta.url));
    await access(new URL('../'+warrior.fullsize,import.meta.url));
  }
  const toxot = CLASS_PROTOTYPES.find(prototype => prototype.id === 'prototype-05');
  assert.equal(toxot.image,'assets/warriors/previews/prototype-05-v2.webp');
  assert.equal(toxot.fullsize,'assets/warriors/production/prototype-05-v2.png');
});

test('Hoplon region shields cover the eight seat regions without creating borders or new seats',async () => {
  assert.equal(REGION_SHIELDS.length,8);
  assert.deepEqual(new Set(REGION_SHIELDS.map(shield => shield.regionId)),new Set(REGIONS.map(region => region.id)));
  for (const shield of REGION_SHIELDS) {
    assert.equal(shield.ready,true,shield.id);
    assert.equal(shield.kind,'region');
    await access(new URL('../'+shield.image,import.meta.url));
    await access(new URL('../'+shield.fullsize,import.meta.url));
  }
});
