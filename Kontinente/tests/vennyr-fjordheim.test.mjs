import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {FAMILY_REGISTRY} from '../../Stammbäume/assets/js/data/families.registry.js';
import {FAMILY_REGISTRY_FOLDERS} from '../../Stammbäume/assets/js/data/family-registry-folders.js';
import {createRegistryBrowserIndex} from '../../Stammbäume/assets/js/modules/family-registry/registry-browser-model.js';
import {VENNYR_TERRITORIAL_HOUSES} from '../../Stammbäume/assets/js/data/vennyr-territorial-catalog.js';
import {VENNYR_PREPARED_LORDSHIPS} from '../../Stammbäume/assets/js/data/vennyr-lordship-preparation.js';
import {createTerritory as vennyr} from '../modules/vennyr/territory-page.mjs';
import {createTerritory as fjordheim} from '../modules/fjordheim/territory-page.mjs';
import {stateHash} from '../../Karten/tools/generated-map-output.mjs';

const root=new URL('../../',import.meta.url);
const read=p=>JSON.parse(fs.readFileSync(new URL(p,root),'utf8'));
const local=p=>new URL(p.replace(/^\//,''),root);
const regions=['Vennyr','Fjordheim'].map(name=>({name,
  pages:read(`Kontinente/modules/${name.toLowerCase()}/pages.source.json`).pages,
  territories:read(`Karten/${name}/territories.import.json`).territories,
  places:read(`Kontinente/modules/${name.toLowerCase()}/places.source.json`).places}));
const context=vm.createContext({window:{}});
vm.runInContext(fs.readFileSync(new URL('Kontinente/assets/js/herrschaft-data.js',root),'utf8'),context);
const data=context.window.ALERIA_HERRSCHAFT_DATA;

test('30 Seiten bilden nur unmittelbare Lehen ab, mit konsistenter Rücknavigation und ohne Zyklen',()=>{
  assert.deepEqual(regions.map(r=>r.pages.length),[13,17]);
  for(const r of regions) {
    const byId=new Map(r.territories.map(t=>[t.id,t]));
    assert.equal(byId.size,r.pages.length);
    assert.equal(r.pages[0].territoryLinks.length,r.name==='Vennyr'?6:5);
    assert.deepEqual(r.pages[0].aliases,[r.name.toLowerCase()]);
    assert.ok(r.pages.slice(1).every(p=>p.aliases.length===0));
    for(const p of r.pages) {
      const t=byId.get(p.id),parent=byId.get(t.parentId);
      assert.ok(fs.existsSync(local(t.href)),t.href);
      assert.equal(p.parentHref,parent?.href||'/Kontinente/Estryll/Estryll.html');
      assert.deepEqual(p.territoryLinks,r.territories.filter(c=>c.parentId===p.id).map(c=>c.id));
      assert.equal(new Set(p.hierarchy.map(h=>h.slug)).size,p.hierarchy.length);
      if(parent)assert.ok(t.href.startsWith(parent.href.slice(0,parent.href.lastIndexOf('/'))+'/'));
    }
  }
});

test('alle 25 Vennyr-Häuser haben belegte Ränge und unmittelbare Lehnsherren; Ortsregister werden nicht hochgezogen',()=>{
  const r=regions[0],cards=r.pages.flatMap(p=>p.families.flatMap(g=>g.houses));
  assert.equal(new Set(cards.map(c=>c.familyId)).size,25);
  for(const h of VENNYR_TERRITORIAL_HOUSES) {
    const own=cards.filter(c=>c.familyId===h.familyId);
    assert.ok(own.length,h.name);
    for(const c of own){assert.equal(c.liege,h.liegeHouseName);if(h.rankId==='unknown')assert.equal(c.rank,'Offen');}
  }
  assert.equal(r.pages[0].domains.length,0);
  const crown=r.pages.find(p=>p.id==='koenigliche-grafschaft-bluetenland');
  assert.ok(!crown.families.some(g=>g.houses.some(h=>h.familyId==='haus-morgant')));
  assert.ok(r.pages.find(p=>p.id==='baronie-hoyers-krone').families.some(g=>g.houses.some(h=>h.familyId==='haus-morgant')));
});

test('Fjordheim enthält 15 Clans ohne fingierte Familienlinks; Rangkonflikte und Llyndor bleiben offen',()=>{
  const r=regions[1],cards=r.pages.flatMap(p=>p.families.flatMap(g=>g.houses));
  assert.equal(new Set(cards.map(c=>c.name)).size,15);
  assert.ok(cards.every(c=>!c.familyId));
  assert.equal(r.pages.find(p=>p.id==='thanentum-llyndor').families.length,0);
  for(const id of ['herrschaft-caer','herrschaft-askarholm'])assert.equal(r.pages.find(p=>p.id===id).preparation.rankOpen,true);
  assert.ok(r.pages.find(p=>p.id==='hesirentum-skerdgardr'));
  assert.ok(!r.pages.find(p=>p.id==='thanentum-skerdgardr'));
  const members=r.pages.flatMap(p=>p.councilGroups.flatMap(g=>g.members));
  assert.ok(members.every(m=>!m.familyId&&!m.href),'Keine Fragezeichen mit unbenannten Stammbaumpersonen verwechseln');
});

test('gemeinsame Renderer-Daten und sämtliche sichtbaren lokalen Bilder und Links sind auflösbar',()=>{
  for(const r of regions)for(const p of r.pages) {
    const result=(r.name==='Vennyr'?vennyr:fjordheim)(p.id,data);
    assert.equal(result.meta.id,p.id);
    for(const link of result.view.geography.links||[])assert.ok(fs.existsSync(local(link.href)));
    for(const src of [p.crestSrc,...p.families.flatMap(g=>g.houses.map(h=>h.imageSrc)),...p.councilGroups.flatMap(g=>g.members.map(m=>m.imageSrc))].filter(Boolean))assert.ok(fs.existsSync(local(src)),src);
    for(const d of result.view.geography.domains)assert.ok(d.sections.every(s=>s.places.every(Boolean)));
    for(const c of result.view.familySections.flatMap(g=>g.cards)) {
      if(r.name==='Fjordheim')assert.equal(c.href,'');
      else assert.ok(c.href.includes('family='+c.id));
    }
  }
});

test('jede Vennyr- und Fjordheim-Kategorie hat ein lokales Zeichen, ohne Familien oder Beziehungen zu verändern',()=>{
  const baseline=read('Kontinente/modules/vennyr-fjordheim/sources/family-baseline.json');
  assert.equal(createHash('sha256').update(JSON.stringify(FAMILY_REGISTRY)).digest('hex'),baseline.sha256);
  const index=createRegistryBrowserIndex(FAMILY_REGISTRY,FAMILY_REGISTRY_FOLDERS);
  const nodes=[...index.nodes.values()].filter(n=>['Vennyr','Fjordheim'].includes(n.path[0]));
  assert.ok(nodes.length>40);
  for(const n of nodes){assert.ok(n.icon,n.path.join('/'));assert.ok(fs.existsSync(new URL('Stammbäume/'+n.icon,root)),n.icon);}
});

test('vier neue Gebietsnamen und PNG-Banner bleiben von bestehenden Hauswappen getrennt',()=>{
  assert.equal(new Set(VENNYR_PREPARED_LORDSHIPS.map(t=>t.name)).size,4);
  for(const l of VENNYR_PREPARED_LORDSHIPS) {
    const p=regions[0].pages.find(p=>p.title===l.type+' '+l.name);
    assert.equal(p.preparation.newTerritoryName,true);
    const t=regions[0].territories.find(t=>t.id===p.id);
    assert.notEqual(t.crest,t.banner);
    const bytes=fs.readFileSync(new URL('Stammbäume/'+l.banner,root));
    assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
    assert.equal(bytes.readUInt32BE(16),1024);assert.equal(bytes.readUInt32BE(20),1536);
  }
});

test('beide Bildkarten haben 80/50-Vorgaben, keine geschätzten Pins/Grenzen und behalten den Bearbeitungsschutz',()=>{
  for(const r of regions) {
    const map=read(`Karten/${r.name}/data.json`);
    assert.equal(map.state.dotSize,80);assert.equal(map.state.lblSize,50);
    assert.deepEqual(map.state.pins,[]);assert.deepEqual(map.state.regions,[]);
    assert.equal(map.state.dominions.length,r.pages.length);
    assert.equal(map.generatedStateHash,stateHash(map.state));
    assert.ok(fs.existsSync(local(map.state.mapImages.normal)));
  }
});

test('die sieben neuen Altartikel und sechs übernommene Vennyr-Quellen bleiben unverändert archiviert',()=>{
  for(const s of read('Kontinente/modules/vennyr-fjordheim/sources/articles.manifest.json')) {
    const bytes=fs.readFileSync(new URL('Kontinente/modules/vennyr-fjordheim/sources/'+s.file,root));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),s.sha256);
  }
  const previous=read('Stammbäume/assets/data/source-inventories/vennyr-territories-2026-10-05.json');
  for(const s of previous.sources.slice(1)) {
    const bytes=fs.readFileSync(new URL(`Kontinente/modules/vennyr/sources/${s.attachmentId}.html`,root));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),s.sha256);
  }
});
