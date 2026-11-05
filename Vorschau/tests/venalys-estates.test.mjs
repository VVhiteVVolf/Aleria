import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { ESTATES,ESTATE_CONTEXT } from '../Venalys/estate-data.mjs';
import { houses } from '../Venalys/house-data.mjs';
import { warriors } from '../Venalys/warrior-data.mjs';
import { context } from '../Venalys/realm-context.mjs';
import { districts,pointsOfInterest } from '../Venalys/territory-data.mjs';
import { renderVenalysPage } from '../Venalys/page-render.mjs';
import { createVenalysHouseDialogs } from '../Venalys/house-dialogs.mjs';
import { renderHouseGroups } from '../Venalys/assignment-view.mjs';
import { shouldPublish } from '../../netlify/build/site-publish.mjs';

test('Venalys keeps its five confirmed estates and the Advena outside a fixed social rank',() => {
  assert.deepEqual(ESTATES.map(estate => estate.id),['patrizier','magnarier','mercantier','plebejer','advena']);
  assert(ESTATES.every(estate => estate.present));
  const mercantier = ESTATES.find(estate => estate.id === 'mercantier');
  for (const word of ['nicht adlig','wohlhabend','einflussreich','Magnariern','Patriziern']) assert(mercantier.description.includes(word),word);
  const advena = ESTATES.find(estate => estate.id === 'advena');
  for (const word of ['Partner','Geschäftsleute','Händler','Shirazad','Ishtaran','Kemetara','Norden','beweisen']) assert(advena.description.includes(word),word);
  assert(!/unterste|Unterschicht|Leibeigene/.test(advena.description));
  assert(!/Illustris|Servi|Kaiserliche Linie|Sobirà|Regulo/.test(JSON.stringify(ESTATES)));
  assert.equal(houses.length,22,'stand illustrations must not add family records');
});

test('all five comic cards are present once and their large views cannot assign a social type to a place',() => {
  const html = renderVenalysPage({ context,houses,warriors,districts,pointsOfInterest,estates:ESTATES,estateContext:ESTATE_CONTEXT });
  assert.equal([...html.matchAll(/id="staende"/g)].length,1);
  assert.equal([...html.matchAll(/data-art-kind="estate"/g)].length,5);
  assert(html.includes('href="#staende"'));
  assert.equal([...html.matchAll(/class="country-warrior-card"/g)].length,22);
  const patrons = houses.filter(house => house.rank === 'patrician');
  const groups = renderHouseGroups(houses,null);
  for (const house of patrons) {
    assert(groups.includes(`data-action="show-house" data-house="${house.id}"`),house.id);
    assert(html.includes(`src="assets/warriors/previews/${house.id}.webp"`),house.id);
  }
  assert(!html.includes('St?nde'));
  assert(!/on(?:click|input|change)=/.test(html));
  const content = { innerHTML:'',scrollTop:20 };
  const dialog = { open:false,scrollTop:20,ownerDocument:{ activeElement:null },querySelector:() => content,
    addEventListener() {},removeEventListener() {},showModal() { this.open = true; } };
  let placements = 0;
  const dialogs = createVenalysHouseDialogs({ dialog,houses,warriors,estates:ESTATES,
    targets:[...districts,...pointsOfInterest],getDraft:() => ({ assignments:{} }),onChoose:() => placements++ });
  for (const estate of ESTATES) {
    dialogs.showEstate(estate.id);
    assert(content.innerHTML.includes(`<h2 id="art-title">${estate.name}</h2>`));
    assert(content.innerHTML.includes(`href="${estate.fullsize}"`));
    assert(!content.innerHTML.includes('select-from-dialog'));
  }
  for (const house of patrons) {
    dialogs.showHouse(house.id);
    assert(content.innerHTML.includes(`<h2 id="art-title">Haus ${house.name}</h2>`));
    assert(content.innerHTML.includes(`src="assets/warriors/previews/${house.id}.webp"`));
    assert(content.innerHTML.includes(`href="assets/warriors/production/${house.id}.png"`));
    assert(content.innerHTML.includes(`src="${house.crest}"`));
    assert(content.innerHTML.includes(`href="${house.original}"`));
    assert(content.innerHTML.includes(`data-action="select-from-dialog" data-house="${house.id}"`),
      'existing house placement action remains available');
  }
  assert.equal(placements,0);
  dialogs.destroy();
});

test('all selected social images are public while originals, prompts and receipts stay outside the upload',async () => {
  const root = new URL('../Venalys/',import.meta.url);
  for (const estate of ESTATES) {
    assert.equal(estate.ready,true,estate.id);
    for (const path of [estate.image,estate.fullsize]) {
      await access(new URL(path,root));
      assert.equal(shouldPublish('Vorschau/Venalys/'+path),true,path);
    }
    assert.equal(shouldPublish(`Vorschau/Venalys/assets/estates/generated/${estate.id}.png`),false);
  }
  for (const path of ['assets/estates/manifest.json','sources/estates-a-jobs.json','sources/estates-b-results.json',
    'sources/estate-facts.json','scripts/build-estate-catalog.mjs','scripts/prepare-estates.py']) {
    assert.equal(shouldPublish('Vorschau/Venalys/'+path),false,path);
  }
  for (const path of ['Vorschau/shared/country-workbench/estate-view.mjs','Vorschau/shared/country-workbench/estate-cards.css']) assert.equal(shouldPublish(path),true,path);
});
