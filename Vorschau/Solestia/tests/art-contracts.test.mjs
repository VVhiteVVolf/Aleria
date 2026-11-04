import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile,access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HOUSES } from '../house-data.mjs';
import { ARTWORKS } from '../art-data.mjs';
import { CLASS_PROTOTYPES,WARRIORS } from '../warrior-data.mjs';
import { REALM_CONTEXT } from '../realm-context.mjs';
import { MAP_VARIANTS,REGIONS,SETTLEMENTS,SOURCE_HOUSE_SEATS } from '../territory-data.mjs';
import { createHousePlacementState } from '../placement-state.mjs';
import { createMapProposal } from '../map-data.mjs';
import { createArtDialogs } from '../art-dialogs.mjs';
import { renderSolestiaPage } from '../proposal-render.mjs';
import { shouldPublish } from '../../../netlify/build/site-publish.mjs';

const country = new URL('../',import.meta.url);
const workspace = new URL('../../../',import.meta.url);
const json = async file => JSON.parse(await readFile(new URL(file,country),'utf8'));
const digest = data => createHash('sha256').update(data).digest('hex');
const publicPath = url => relative(fileURLToPath(workspace),fileURLToPath(url)).replaceAll('\\','/');
const equipmentText = figure => figure.equipment.join(' · ');

test('all twelve named houses and ten named cities retain the requested ranks and editable starting residences',async () => {
  const names = await json('sources/name-assignments.json');
  assert.equal(HOUSES.length,12);
  assert.equal(WARRIORS.length,12);
  assert.equal(SETTLEMENTS.length,10);
  assert.equal(new Set(HOUSES.map(house => house.id)).size,12);
  assert.equal(new Set(HOUSES.map(house => house.name)).size,12);
  assert.equal(new Set(SETTLEMENTS.map(city => city.name)).size,10);
  assert.equal(names.houses.length,12);
  assert.equal(names.settlements.length,10);
  for (const assigned of names.houses) {
    assert.equal(HOUSES.find(house => house.id === assigned.houseId)?.name,`Haus ${assigned.name}`);
  }
  for (const assigned of names.settlements) {
    const city = SETTLEMENTS.find(item => item.id === assigned.settlementId);
    assert.equal(city?.name,assigned.name);
    assert.equal(city.nameStatus,'proposal');
  }
  const state = createHousePlacementState({ houses:HOUSES,settlements:SETTLEMENTS });
  const placements = state.current();
  for (const variant of MAP_VARIANTS) {
    const map = createMapProposal({ houses:HOUSES,placements,variant });
    assert.equal(map.bakedNames,false,'the assigned city names must remain an overlay on either source map');
    assert.deepEqual(map.settlements.map(city => city.name),names.settlements.map(assigned => assigned.name));
  }
  assert.deepEqual(Object.keys(placements).filter(id => placements[id] === 'ort-01').sort(),['house-ducal','pool-10','pool-11']);
  for (const city of SETTLEMENTS.slice(1)) assert.equal(Object.values(placements).filter(id => id === city.id).length,1);
  for (const house of HOUSES) {
    const expected = house.id === 'house-ducal' ? 'Herzog' : Number(house.id.slice(-2)) <= 9 ? 'Baron' : 'Ritterfürst';
    assert.equal(house.rank,expected,house.id);
    assert.equal(house.sourceSeat,SOURCE_HOUSE_SEATS.find(seat => seat.houseId === house.id).settlementId);
  }
  const before = structuredClone(HOUSES);
  assert(state.move('house-ducal','ort-02'));
  assert.deepEqual(HOUSES,before,'a draft move must not change the house identity or rank');
});

test('each of the seventeen active figures has a unique original, production and preview; both retired house versions remain preserved',async () => {
  assert.equal(CLASS_PROTOTYPES.length,5);
  assert.deepEqual(new Set(WARRIORS.map(figure => figure.houseId)),new Set(HOUSES.map(house => house.id)));
  const figures = [...CLASS_PROTOTYPES,...WARRIORS];
  assert.equal(new Set(figures.map(figure => figure.fullsize)).size,17);
  assert.equal(new Set(figures.map(figure => figure.image)).size,17);
  const manifest = await json('assets/warriors/manifest.json');
  assert.equal(manifest.entries.length,19,'seventeen initial sources and the two retained house corrections');
  const sourceHashes = new Set(),productionHashes = new Set();
  for (const figure of figures) {
    assert.equal(figure.ready,true,figure.id);
    const matching = manifest.entries.filter(receipt => receipt.production === figure.fullsize && receipt.preview === figure.image);
    assert.equal(matching.length,1,figure.id);
    const receipt = matching[0];
    for (const key of ['source','production','preview']) {
      assert.equal(digest(await readFile(new URL(receipt[key],country))),receipt[`${key}Sha256`],`${figure.id}: ${key}`);
    }
    assert.equal(receipt.proof.rgbUnchanged,true,figure.id);
    assert.equal(receipt.proof.originalUnchanged,true,figure.id);
    assert.equal(receipt.proof.sourceTransparentPixelsExposed,0,figure.id);
    assert.equal(receipt.proof.corePixelsNotOpaque,0,figure.id);
    assert.equal(receipt.alpha.touchesCanvas,false,figure.id);
    sourceHashes.add(receipt.sourceSha256); productionHashes.add(receipt.productionSha256);
  }
  assert.equal(sourceHashes.size,17,'house figures cannot reuse a prototype original');
  assert.equal(productionHashes.size,17);
  for (const stem of ['house-pool-04','house-pool-07']) {
    const receipt = manifest.entries.find(item => item.id === stem);
    assert(receipt,stem);
    for (const key of ['source','production','preview']) {
      assert.equal(digest(await readFile(new URL(receipt[key],country))),receipt[`${key}Sha256`],`${stem}: ${key}`);
    }
  }
});

test('five class roles keep the specified weapons and instruments, with Equo assigned only to cavalry',async () => {
  const roles = ['Schwertmeister','Ritter','Pikenier','Mariner','Kavallerist'];
  assert.deepEqual(CLASS_PROTOTYPES.map(item => item.role),roles);
  const equo = { name:'Equo',href:'../../Bestiarium/tiere/pferde/equo/index.html' };
  await access(new URL(equo.href,country));
  for (const figure of [...CLASS_PROTOTYPES,...WARRIORS]) {
    const role = figure.prototypeId || figure.id;
    const weapons = equipmentText(figure);
    assert(!/Säbel|Muskete|Pistole/.test(weapons),figure.id);
    if (role === 'prototype-01') {
      assert.match(weapons,/Degen/); assert.match(weapons,/Laute/); assert.match(weapons,/Federhut/);
    } else if (role === 'prototype-02') assert.match(weapons,/Großschwert/);
    else if (role === 'prototype-03') assert.match(weapons,/Pike|Hellebarde/);
    else if (role === 'prototype-04') {
      assert.match(weapons,/Degen/); assert.match(weapons,/Rückenköcher/);
    } else assert.equal(role,'prototype-05',figure.id);
    if (role === 'prototype-05') {
      assert.match(weapons,/Lanze/); assert.deepEqual(figure.mount,equo,figure.id);
    } else assert.equal(figure.mount,null,figure.id);
  }
});

test('the silver rearing house pig on purple and its matching pike fighter replace the retired stirrup version; Bota keeps its helmet correction',async () => {
  const pigHouse = HOUSES.find(item => item.id === 'pool-04');
  assert.match(pigHouse.motif,/Hausschwein/i);
  assert(!/Steigbügel|Greif/.test(pigHouse.motif));
  assert.match(pigHouse.palette.join(' '),/Silber/);
  assert.match(pigHouse.palette.join(' '),/Purpur/i);
  assert.equal(pigHouse.fullsize,'assets/emblems/production/pool-04-v2.png');
  const pigFigure = WARRIORS.find(item => item.houseId === 'pool-04');
  assert.equal(pigFigure.fullsize,'assets/warriors/production/house-pool-04-v2.png');
  assert.equal(pigFigure.prototypeId,'prototype-03');
  assert.match(pigFigure.palette.join(' '),/Purpur/i);
  assert(!/Steigbügel|Greif/.test(pigFigure.description));
  assert.equal(WARRIORS.find(item => item.houseId === 'pool-07').fullsize,'assets/warriors/production/house-pool-07-v2.png');
  for (const previous of ['assets/emblems/generated/pool-04.png','assets/warriors/generated/house-pool-04.png',
    'assets/warriors/generated/house-pool-07.png']) await access(new URL(previous,country));
});

test('the ducal house and land share the unchanged supplied emblem while the ancient Grianeach bull has its own verified artwork',async () => {
  const source = (await json('sources/supplied-emblems.json')).suppliedEmblems[0];
  const ducal = HOUSES.find(house => house.id === 'house-ducal');
  const realm = ARTWORKS.find(item => item.id === 'realm-solestia');
  for (const item of [ducal,realm]) {
    assert.equal(item.original,source.original);
    assert.equal(item.fullsize,source.original);
    assert.equal(digest(await readFile(new URL(item.original,country))),source.originalSha256);
  }
  const ancient = ARTWORKS.find(item => item.id === 'ancient-grianeach');
  assert.equal(ancient.kind,'ancient');
  assert.match(ancient.motif,/SCHWARZER STIER/);
  assert.notEqual(ancient.fullsize,realm.fullsize);
  const receipts = (await json('sources/emblem-asset-receipts.json')).entries;
  assert.equal(receipts.length,12);
  for (const receipt of receipts) {
    assert.equal(receipt.originalUnchanged,true,receipt.id);
    assert.equal(receipt.rgbUnchanged,true,receipt.id);
    for (const key of ['source','production','preview']) {
      assert.equal(digest(await readFile(new URL(receipt[key],country))),receipt[`${key}Sha256`],`${receipt.id}: ${key}`);
    }
  }
});

test('Solestian history retains its confirmed cultural sequence and trade wealth without inheriting Argentum offices',() => {
  assert.deepEqual(REALM_CONTEXT.history.map(item => item.id),['tarranath','zarakhul','imperial-trade','after-empire']);
  const lore = JSON.stringify(REALM_CONTEXT);
  for (const name of ['Tarranath','Felsalben','Grianeach','Zarakhul','Venalys','Leukonia','Sylvarant','Weisenfluh']) assert(lore.includes(name),name);
  assert.match(REALM_CONTEXT.title,/Herzogtum Solestia/);
  assert.match(REALM_CONTEXT.subtitle,/reiche/);
  for (const key of ['offices','institutions','government','castes','socialCastes']) assert.equal(REALM_CONTEXT[key],undefined,key);
  assert(!/Prokonsul|Archonat|ann?ektier|unterwarf|verarmt/i.test(lore));
});

test('the page, house dossier and cavalry prototype use current public images and the existing bestiary entry without authoring data',async () => {
  const html = renderSolestiaPage({ context:REALM_CONTEXT,houses:HOUSES,warriors:WARRIORS,prototypes:CLASS_PROTOTYPES,
    artworks:ARTWORKS,regions:REGIONS,settlements:SETTLEMENTS,variants:MAP_VARIANTS });
  assert(!/C:[/\\]|generated_images|"prompt"|sources\/|on(?:click|input|change)=/.test(html));
  assert.match(html,/5 Kriegerklassen/);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size,ids.length);
  const images = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(match => match[1]);
  assert(images.length >= 40,'the realm, historical emblem, regions, twelve pairs and five classes must render');
  for (const file of new Set([...images,...MAP_VARIANTS.map(map => map.map),
    ...[...HOUSES,...CLASS_PROTOTYPES,...WARRIORS,...ARTWORKS].map(item => item.fullsize)])) {
    const url = new URL(file,country); await access(url); assert(shouldPublish(publicPath(url)),file);
  }
  const content = { innerHTML:'',scrollTop:0 };
  const dialog = { open:false,scrollTop:0,ownerDocument:{ activeElement:null },querySelector:() => content,
    addEventListener() {},removeEventListener() {},showModal() { this.open = true; } };
  const placements = Object.fromEntries(SOURCE_HOUSE_SEATS.map(seat => [seat.houseId,seat.settlementId]));
  const dialogs = createArtDialogs({ dialog,houses:HOUSES,warriors:WARRIORS,prototypes:CLASS_PROTOTYPES,
    artworks:ARTWORKS,settlements:SETTLEMENTS,getPlacements:() => placements,onChoose() {} });
  for (const house of HOUSES) { dialogs.showHouse(house.id); assert(content.innerHTML.includes(house.name),house.id); }
  dialogs.showHouse('pool-09');
  assert(content.innerHTML.includes('Berittener Entwurf'));
  assert(content.innerHTML.includes('href="../../Bestiarium/tiere/pferde/equo/index.html"'));
  dialogs.show('prototype','prototype-05');
  assert(content.innerHTML.includes('Equo im Bestiarium'));
  dialogs.destroy();
});
