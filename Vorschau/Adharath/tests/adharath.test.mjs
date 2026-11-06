import test from 'node:test';
import assert from 'node:assert/strict';
import {access} from 'node:fs/promises';
import {HOUSES} from '../house-data.mjs';
import {REALM_CONTEXT} from '../realm-context.mjs';
import {ESTATES} from '../estate-data.mjs';
import {WARRIOR_PROTOTYPES} from '../warrior-data.mjs';
import {REALM_ARTWORK,displayArtwork} from '../artwork-data.mjs';
import {filterClans,renderPreparation} from '../proposal-render.mjs';

const realm=new URL('../',import.meta.url);

test('the twelve nomadic clans use distinct new unprefixed draft names and no fixed seats',()=>{
  assert.equal(HOUSES.length,12);
  assert.equal(new Set(HOUSES.map(house=>house.id)).size,12);
  assert.equal(new Set(HOUSES.map(house=>house.name.normalize('NFD').toLowerCase())).size,12);
  assert.equal(new Set(HOUSES.map(house=>house.crest)).size,12);
  assert(HOUSES.every(house=>house.sourceSeat===null));
  assert(HOUSES.every(house=>!/^(?:Mac|Nic|Ó|Ua)\s/.test(house.name)));
  assert(HOUSES.every(house=>WARRIOR_PROTOTYPES.some(prototype=>prototype.id===house.prototypeId)));
  assert.equal(HOUSES.filter(house=>house.source).length,2);
});

test('Dúinreach remains the lost principality while the people retain their Adharath name',()=>{
  assert.equal(REALM_CONTEXT.name,'Adharath');
  const history=REALM_CONTEXT.history.map(item=>item.text).join(' ');
  assert.match(history,/Ebenen des heutigen Shirazad/);
  assert.match(history,/Morgorn/);
  assert.match(history,/Zarakhul/);
  assert.match(history,/Phalantia und Klythesia/);
  const extinct=ESTATES.filter(estate=>!estate.present);
  assert.equal(extinct.length,1);
  assert.equal(extinct[0].id,'stammesfuerst');
  assert.match(extinct[0].description,/ausrotten/);
  assert.deepEqual(ESTATES.map(estate=>estate.name),['Flaith','Taoiseach','Ceann']);
});

test('the original four warrior roles retain their distinct equipment and mounts beside the fifth role',()=>{
  assert.equal(WARRIOR_PROTOTYPES.length,5);
  const byId=Object.fromEntries(WARRIOR_PROTOTYPES.map(item=>[item.id,item]));
  assert.match(byId['mounted-archer'].mount.name,/Nebtu/);
  assert.match(byId['desert-druchtan-rider'].mount.name,/Drúchtán/);
  assert.match(byId['desert-druchtan-rider'].mount.name,/Wüstenläufer/);
  assert.equal(byId['heavy-warrior'].mounted,false);
  assert.match(byId['heavy-warrior'].equipment,/Streitaxt/);
  assert.equal(byId['giant-eagle-rider'].mount.name,'Riesenadler');
  assert.match(byId['giant-eagle-rider'].equipment,/Bogen|bogen/);
});

test('the additional Schwertsängerin carries two sabres as an unmounted female role',()=>{
  const singer=WARRIOR_PROTOTYPES.find(item=>item.id==='schwertsaengerin');
  assert(singer);
  assert.equal(singer.name,'Schwertsängerin');
  assert.equal(singer.mounted,false);
  assert.match(singer.equipment,/[Zz]wei Säbel/);
  assert.match(singer.description,/Schwertsängerin|Kriegerin/);
});

test('clan search handles accents, combined terms, empty queries and no result',()=>{
  const accents=[{id:'test',name:'Dúinreach',motif:'Weißer Wüstenfuchs',palette:['Grün']}];
  assert.equal(filterClans(accents,'duinreach GRUN')[0].id,'test');
  assert.equal(filterClans(HOUSES,'').length,12);
  assert.equal(filterClans(HOUSES,'ein nichtvorhandener clan').length,0);
  assert.equal(filterClans(HOUSES,'Dornuaith Antilope')[0].id,'dornuaith');
});

test('all twenty-one active artwork pairs exist and public catalogs expose no private generator paths',async()=>{
  const items=[...HOUSES,...ESTATES,...WARRIOR_PROTOTYPES,REALM_ARTWORK];
  assert.equal(items.length,21);
  for(const item of items){
    const view=displayArtwork(item);
    assert(!view.fullsize.includes('/generated/'));
    assert(!view.image.includes('/generated/'));
    await access(new URL(view.fullsize,realm));
    await access(new URL(view.image,realm));
  }
});

test('the preparation shows a nomadic clan gallery and escapes all supplied content',()=>{
  const houses=HOUSES.map(displayArtwork),prototypes=WARRIOR_PROTOTYPES.map(displayArtwork),estates=ESTATES.map(displayArtwork);
  const context={...REALM_CONTEXT,subtitle:'<script>unsafe</script>'};
  const html=renderPreparation({context,houses,prototypes,estates,realmArtwork:REALM_ARTWORK});
  assert(html.includes('&lt;script&gt;unsafe&lt;/script&gt;'));
  assert(!html.includes('<script>unsafe'));
  assert.doesNotMatch(html,/<[^>]+\son(?:click|input|change)=/i);
  assert.equal((html.match(/data-clan=/g)||[]).length,12);
  assert.equal((html.match(/data-prototype=/g)||[]).length,5);
  assert(html.includes('5 eigenständige Klassenentwürfe'));
  assert(!html.includes('data-map'));
  assert(html.includes('keine zwölf Provinzen'));
  assert(html.includes('https://www.teanglann.ie/en/fgb/flaith'));
});
