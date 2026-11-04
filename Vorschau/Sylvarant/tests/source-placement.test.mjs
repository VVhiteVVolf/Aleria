import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { MAP_VARIANTS, REGIONS, ARCHONATES, IMPERIAL_DOMAIN, SETTLEMENTS, SOURCE_HOUSE_SEATS } from '../territory-data.mjs';
import { createHousePlacementState } from '../placement-state.mjs';
import { createMapProposal } from '../map-data.mjs';

const root = new URL('../', import.meta.url);
const supplied = JSON.parse(await readFile(new URL('sources/supplied-emblems.json', root), 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const houses = [
  ...supplied.suppliedEmblems.filter(item => item.kind === 'house').map(item => ({ id:item.id,name:item.name,
    crest:item.preview,rank:item.id === 'house-mede' ? 'Kaiserliche Linie' : null,
    sourceSeat:item.id === 'house-mede' ? SOURCE_HOUSE_SEATS[0].settlementId : null })),
  ...Array.from({length:13},(_,index) => ({id:`pool-${String(index+1).padStart(2,'0')}`,name:`Entwurf ${index+1}`,rank:null,sourceSeat:null,ready:false,crest:null})),
];
const state = () => createHousePlacementState({houses,settlements:SETTLEMENTS});

test('Alle siebzehn Hauswappen und das Reichswappen bleiben byteidentisch zu den gelieferten Originalen', async () => {
  assert.equal(supplied.suppliedEmblems.filter(item => item.kind === 'house').length,17);
  assert.equal(supplied.suppliedEmblems.filter(item => item.kind === 'realm').length,1);
  for(const item of supplied.suppliedEmblems) {
    const original = await readFile(new URL(item.original,root));
    const source = await readFile(new URL(item.sourceFile+'',pathToFileURL(supplied.sourceDirectory+'/')));
    assert.equal(hash(original),item.originalSha256);
    assert.equal(hash(source),item.sourceSha256);
    assert.equal(hash(original),hash(source));
    assert.equal(hash(await readFile(new URL(item.preview,root))),item.previewSha256);
    assert.equal(item.alphaChanged,false);
  }
});

test('Die gemessene Karte bleibt eine Quelle mit 26 Ortsmarkern und unveränderten Prozentankern', async () => {
  const source = JSON.parse(await readFile(new URL('sources/map-sources.json',root),'utf8')).maps[0];
  assert.equal(MAP_VARIANTS.length,1);
  assert.equal(source.sourceMarkers.length,26);
  assert.deepEqual(source.sourceImageSize,[8126,8192]);
  assert.deepEqual(MAP_VARIANTS[0].imageSize,[4063,4096]);
  assert.equal(hash(await readFile(new URL(MAP_VARIANTS[0].map,root))),source.sha256);
  await access(new URL(MAP_VARIANTS[0].map,root));
  for(const [index,city] of SETTLEMENTS.entries()) {
    assert.deepEqual(city.sourcePixelCentre,source.sourceMarkers[index].centre);
    for(const [axis,value] of city.point.entries()) {
      assert.ok(Math.abs(value*source.sourceImageSize[axis]/100-city.sourcePixelCentre[axis])<.01);
    }
    assert.ok([...city.pin,...city.label].every(value => value>0&&value<100));
  }
});

test('Sieben Archonate und die getrennte Domäne decken alle 26 Orte einmal ab; die Raute ist Mede zugeordnet', () => {
  assert.equal(ARCHONATES.length,7);
  assert.equal(REGIONS.length,8);
  assert.equal(SETTLEMENTS.length,26);
  assert.equal(SETTLEMENTS.filter(city => city.sourceMarkerShape==='circle').length,18);
  assert.equal(SETTLEMENTS.filter(city => city.sourceMarkerShape==='square').length,7);
  assert.equal(SETTLEMENTS.filter(city => city.sourceMarkerShape==='diamond').length,1);
  const coverage=REGIONS.flatMap(region=>region.cityIds);
  assert.equal(coverage.length,26);assert.equal(new Set(coverage).size,26);
  assert.ok(SETTLEMENTS.every(city=>coverage.includes(city.id)));
  assert.ok(ARCHONATES.every(region=>region.houseId===null&&region.capitalId===null));
  const capital=SETTLEMENTS.find(city=>city.sourceMarkerShape==='diamond');
  assert.equal(IMPERIAL_DOMAIN.houseId,'house-mede');
  assert.equal(IMPERIAL_DOMAIN.capitalId,capital.id);
  assert.equal(SOURCE_HOUSE_SEATS[0].settlementId,capital.id);
  assert.ok(SETTLEMENTS.every(city=>city.nameStatus==='open'));
});

test('Der 30er-Sitzentwurf beginnt mit Mede in der Hauptstadt, erhält Hausdaten und weist fremde Importe atomar ab', () => {
  const draft=state(),initial=draft.current(),before=structuredClone(houses);
  assert.equal(houses.length,30);
  assert.equal(initial['house-mede'],IMPERIAL_DOMAIN.capitalId);
  assert.equal(Object.values(initial).filter(Boolean).length,1);
  assert.ok(draft.move('pool-01',IMPERIAL_DOMAIN.capitalId));
  assert.deepEqual(houses,before);
  const current=draft.current(),canUndo=draft.canUndo();
  for(const invalid of [
    {schemaVersion:1,realm:'calidaria',placements:current},
    {schemaVersion:1,realm:'sylvarant',placements:{...current,'pool-01':'foreign-seat'}},
    {schemaVersion:1,realm:'sylvarant',placements:{...current,unknown:null}},
    {schemaVersion:1,realm:'sylvarant',placements:Object.fromEntries(Object.entries(current).slice(1))},
  ]) {
    assert.throws(()=>draft.restore(invalid));
    assert.deepEqual(draft.current(),current);assert.equal(draft.canUndo(),canUndo);
  }
  assert.ok(draft.undo());assert.deepEqual(draft.current(),initial);
  assert.equal(JSON.parse(draft.serialize()).realm,'sylvarant');
  const map=createMapProposal({houses,placements:initial});
  assert.ok(map.clans.every(house=>house.crest&&house.ready!==false));
  assert.equal(map.clans.find(house=>house.id==='house-mede').seat,IMPERIAL_DOMAIN.capitalId);
});
