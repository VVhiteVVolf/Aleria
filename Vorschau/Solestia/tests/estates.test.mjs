import test from 'node:test';
import assert from 'node:assert/strict';
import { access,readFile } from 'node:fs/promises';
import { ESTATES,ESTATE_CONTEXT } from '../estate-data.mjs';
import { HOUSES } from '../house-data.mjs';
import { ARTWORKS } from '../art-data.mjs';
import { CLASS_PROTOTYPES,WARRIORS } from '../warrior-data.mjs';
import { REALM_CONTEXT } from '../realm-context.mjs';
import { MAP_VARIANTS,REGIONS,SETTLEMENTS,SOURCE_HOUSE_SEATS } from '../territory-data.mjs';
import { createHousePlacementState } from '../placement-state.mjs';
import { renderSolestiaPage } from '../proposal-render.mjs';
import { createArtDialogs } from '../art-dialogs.mjs';
import { shouldPublish } from '../../../netlify/build/site-publish.mjs';

const root = new URL('../',import.meta.url);
const expected = [['sobira','Sobirà','Herzog'],['conde','Conde','Graf'],['regulo','Regulo','Baron'],
  ['hidalgo','Hidalgo','Ritterfürst'],['senor','Señor','Ritterherr'],['caballero','Caballero','Ritter'],
  ['escudero','Escudero','Knappe'],['paje','Paje','Page'],['pechero','Pechero','Gemeines Volk']];

test('the nine Solestian estate semantics preserve written titles, personal forms of address and freedom without inventing counts',() => {
  assert.deepEqual(ESTATES.map(estate => [estate.id,estate.name,estate.commonTitle]),expected);
  assert.deepEqual(ESTATES.filter(estate => !estate.present).map(estate => estate.id),['conde']);
  const conde = ESTATES.find(estate => estate.id === 'conde');
  assert.equal(conde.statusLabel,'In Solestia nicht vorhanden');
  assert.match(conde.description,/hypothetischen Rang/);
  assert.match(ESTATE_CONTEXT.introduction,/Schriftstücken/);
  assert.match(ESTATE_CONTEXT.introduction,/Gemeine Zunge/);
  const addresses = ESTATE_CONTEXT.addresses.map(item => item.text).join(' ');
  for (const text of ['Don','Doña','Vornamen','Infant','Infanta','herzoglichen Familie','keine Leibeigenschaft','albische']) assert(addresses.includes(text),text);
  const senor = ESTATES.find(estate => estate.id === 'senor').description;
  for (const text of ['Landbesitz','Burg','Ritter schlagen und führen','Nachkommen','Ritterstand']) assert(senor.includes(text),text);
  const all = JSON.stringify({ ESTATES,ESTATE_CONTEXT });
  assert(!/Illustris|Patrizier|Magnarier|Mercantrier|Plebejer|Servi|Prokonsul|Archonat|erblich/i.test(all));
});

test('Meroval and Zerain become the two capital Hidalgo houses without adding a count, barony, lord or fixed seat',() => {
  assert.equal(HOUSES.length,12);
  assert.deepEqual(HOUSES.filter(house => house.estateId === 'hidalgo').map(house => [house.id,house.name,house.rank,house.localTitle,house.sourceSeat]),
    [['pool-10','Haus Meroval','Ritterfürst','Hidalgo','ort-01'],['pool-11','Haus Zerain','Ritterfürst','Hidalgo','ort-01']]);
  assert.equal(HOUSES.filter(house => house.estateId === 'regulo').length,9);
  assert(HOUSES.filter(house => house.estateId === 'regulo').every(house => house.rank === 'Baron' && house.localTitle === 'Regulo' && house.sourceSeat !== 'ort-01'));
  assert.deepEqual(HOUSES.filter(house => house.estateId === 'sobira').map(house => [house.id,house.rank,house.localTitle]),[['house-ducal','Herzog','Sobirà']]);
  assert(!HOUSES.some(house => house.estateId === 'conde' || house.rank === 'Graf'));
  assert(HOUSES.every(house => !house.liege));
  const placements = createHousePlacementState({ houses:HOUSES,settlements:SETTLEMENTS });
  for (const house of HOUSES) assert.equal(placements.current()[house.id],SOURCE_HOUSE_SEATS.find(seat => seat.houseId === house.id).settlementId);
  assert(placements.move('pool-10','ort-08'));
  assert.equal(HOUSES.find(house => house.id === 'pool-10').rank,'Ritterfürst');
});

test('estate cards and all nine large views expose the absent Conde and keep social illustrations separate from house placement',() => {
  const illustrated = ESTATES.map(estate => ({ ...estate,ready:true,
    image:`assets/estates/previews/${estate.id}.webp`,fullsize:`assets/estates/production/${estate.id}.png` }));
  const html = renderSolestiaPage({ context:REALM_CONTEXT,houses:HOUSES,warriors:WARRIORS,
    prototypes:CLASS_PROTOTYPES,artworks:ARTWORKS,estates:illustrated,estateContext:ESTATE_CONTEXT,
    regions:REGIONS,settlements:SETTLEMENTS,variants:MAP_VARIANTS });
  assert.equal([...html.matchAll(/data-art-kind="estate"/g)].length,9);
  assert(html.includes('href="#staende"'));
  assert(html.includes('id="staende"'));
  assert(html.includes('In Solestia nicht vorhanden'));
  assert(!/on(?:click|input|change)=/.test(html));
  const content = { innerHTML:'',scrollTop:12 };
  const dialog = { open:false,scrollTop:12,ownerDocument:{ activeElement:null },querySelector:() => content,
    addEventListener() {},removeEventListener() {},showModal() { this.open = true; } };
  const dialogs = createArtDialogs({ dialog,houses:HOUSES,warriors:WARRIORS,prototypes:CLASS_PROTOTYPES,
    artworks:ARTWORKS,estates:illustrated,settlements:SETTLEMENTS,getPlacements:() => ({}),onChoose() {} });
  for (const estate of illustrated) {
    dialogs.show('estate',estate.id);
    assert(content.innerHTML.includes(`<h2 id="art-title">${estate.name}</h2>`));
    assert(content.innerHTML.includes(`href="${estate.fullsize}"`));
    assert(content.innerHTML.includes(`src="${estate.image}"`));
    assert(content.innerHTML.includes(estate.commonTitle));
    assert(!content.innerHTML.includes('select-from-dialog'));
    assert.equal(content.scrollTop,0);
  }
  dialogs.show('estate','conde');
  assert(content.innerHTML.includes('In Solestia nicht vorhanden'));
  assert(content.innerHTML.includes('hypothetischen Rang'));
  dialogs.showHouse('pool-10');
  assert(content.innerHTML.includes('Hidalgo (Ritterfürst)'));
  dialogs.destroy();
});

test('all nine final social illustrations are present and publishable while their factual sources and builder remain private',async () => {
  for (const estate of ESTATES) {
    assert.equal(estate.ready,true,estate.id);
    assert.equal(estate.image,`assets/estates/previews/${estate.id}.webp`);
    assert.equal(estate.fullsize,`assets/estates/production/${estate.id}.png`);
    for (const path of [estate.image,estate.fullsize]) {
      await access(new URL(path,root));
      assert.equal(shouldPublish(`Vorschau/Solestia/${path}`),true,path);
    }
  }
  for (const file of ['sources/estate-facts.json','sources/ESTATES_SOURCE_DECISIONS.md','scripts/build-estate-catalog.mjs']) {
    await access(new URL(file,root));
    assert.equal(shouldPublish(`Vorschau/Solestia/${file}`),false,file);
  }
  const catalog = await readFile(new URL('estate-data.mjs',root),'utf8');
  assert(!/"prompt"|generated_images|C:[/\\]|"sourceFile"/.test(catalog));
});
