import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { kingdom } from '../modules/aldrimar/kingdom-data.mjs';
import offices from '../modules/aldrimar/offices.source.json' with {type:'json'};
import { succession } from '../modules/aldrimar/succession-data.mjs';
import { getRegisteredFamily } from '../../Stammbäume/assets/js/data/families.registry.js';

const root=new URL('../../',import.meta.url);
const read=path=>fs.readFileSync(new URL(path,root),'utf8');
const json=path=>JSON.parse(read(path));
const base='Kontinente/Estryll/Königreich Aldrimar/';
const pages=['Königreich von Aldrimar.html','aemter.html','kronfolge.html',...succession.monarchs.map(m=>m.page)];

test('eleven original documents and sixteen image sources remain verifiable',()=>{
  const manifest=json('Kontinente/docs/aldrimar/sources.json');assert.equal(manifest.length,11);
  for(const source of manifest){
    const bytes=fs.readFileSync(new URL('Kontinente/docs/aldrimar/'+source.file,root));
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),source.sha256);
  }
  const assets=json('Kontinente/docs/aldrimar/assets.json');assert.equal(assets.length,16);
  for(const asset of assets){
    const bytes=fs.readFileSync(new URL(asset.path,root));
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),asset.sha256);
  }
});

test('all pages have valid local resources, unique IDs and resolvable internal links',()=>{
  for(const name of pages){
    const html=read(base+name);const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
    assert.equal(ids.length,new Set(ids).size,name+' duplicate IDs');
    assert.doesNotMatch(html,/\bon(?:click|change|input)=|style="|\uFFFD/);
    for(const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)){
      const href=match[1].replaceAll('&amp;','&');
      if(href.startsWith('#'))assert.ok(ids.includes(href.slice(1)),name+': '+href);
      else if(href.startsWith('/'))assert.ok(fs.existsSync(new URL('.'+decodeURI(href.split(/[?#]/)[0]),root)),href);
    }
  }
});

test('the kingdom follows Cenyr’s world codex layout rather than the court subpage shell',()=>{
  const main=read(base+'Königreich von Aldrimar.html');
  const cenyr=read('Kontinente/Estryll/Königreich Cenyr/Königreich von Cenyr.html');
  for(const css of ['assets/css/koenigreich.css','world-codex/world-codex.css']){
    assert.ok(main.includes(css));assert.ok(cenyr.includes(css));
  }
  for(const name of ['world-codex','kingdom-frame','kingdom-title','kingdom-toc','kingdom-content-column','kingdom-sidebar-column','kingdom-infobox','kingdom-region-table','kingdom-guild-table']){
    assert.ok(main.includes(name),name);assert.ok(cenyr.includes(name),name);
  }
  assert.doesNotMatch(main,/court-book|court-sidebar|court-hero|aldrimar-organization-grid|aldrimar-fact-groups/);
  assert.equal([...main.matchAll(/<h2 /g)].length,11);
});

test('all biographies and current royal links resolve existing canonical people',()=>{
  assert.equal(succession.monarchs.length,8);
  for(const monarch of succession.monarchs){
    const person=getRegisteredFamily(monarch.familyId).family.persons.find(p=>p.id===monarch.id);
    assert.ok(person);assert.equal(monarch.personName,person.name);
    assert.equal(monarch.portrait,'/Stammbäume/'+person.portrait);
    const href=new URL(monarch.href,'https://aleria.local');
    assert.equal(href.searchParams.get('family'),monarch.familyId);
    assert.equal(href.searchParams.get('person'),person.id);assert.equal(href.searchParams.get('mode'),'view');
    assert.ok(fs.existsSync(new URL('.'+monarch.portrait,root)));
    assert.ok(monarch.sections.reduce((n,s)=>n+s.blocks.length,0)>15);
  }
  assert.deepEqual(succession.monarchs.slice(4).map(m=>m.reign),['1647 – 1676','1676 – 1689','1689 – 1727','Seit 1727']);
  assert.equal(succession.monarchs[5].role,'Reik · Thronbehüter');
  assert.equal(succession.monarchs[7].current,true);
  assert.ok(succession.monarchs[4].sourceNote.includes('49 Regierungsjahre'));
});

test('all forty-five roles remain searchable and disputed offices keep their source context',()=>{
  const records=offices.groups.flatMap(g=>g.offices);
  assert.deepEqual(offices.groups.map(g=>g.offices.length),[9,23,12,1]);
  assert.equal(records.length,45);assert.equal(new Set(records.map(r=>r.id)).size,45);
  for(const r of records)assert.ok(r.description.length&&r.description.every(Boolean));
  assert.equal(records.find(r=>r.id==='ratskanzler').category,'Cenyrisches Vergleichsamt');
  assert.ok(records.find(r=>r.id==='ratsmagier').note.includes('Bergelmir'));
  assert.ok(records.some(r=>r.title==='Der Hersir (Ritterfürst)'));
  assert.match(read(base+'aemter.html'),/data-court-search[\s\S]*offices|data-court-directory/);
});

test('the kingdom owns its council, five clans, organizations and eight administration links',()=>{
  assert.deepEqual(kingdom.councilGroups.map(g=>g.members.length),[1,9,5]);
  assert.equal(kingdom.clans.length,5);assert.equal(kingdom.clans.filter(c=>c.featured).length,1);
  assert.equal(kingdom.clans.find(c=>c.featured).id,'haus-vaeren');
  assert.equal(kingdom.organizations.length,15);
  for(const group of kingdom.councilGroups)for(const p of group.members){
    assert.ok(fs.existsSync(new URL('.'+p.imageSrc,root)),p.name);
    assert.doesNotMatch(p.name,/Galahad|Tristan|Griflet/);
  }
  const main=read(base+'Königreich von Aldrimar.html');
  assert.equal([...main.matchAll(/class="administration-card"/g)].length,8);
  for(const match of main.matchAll(/aemter.html#([^"<]+)/g)){
    assert.ok(read(base+'aemter.html').includes(`id="${match[1]}"`),match[1]);
  }
});

test('registry discovery includes Aldrimar and its Roriksheim branch while preserving Cenyr',()=>{
  const context={window:{}};vm.runInNewContext(read('Kontinente/kontinente.registry.js'),context);
  const entries=context.window.KONTINENTE_REGISTRY;
  assert.equal(entries.filter(e=>e.type==='Königreich'&&e.hierarchy.some(h=>h.slug==='aldrimar')).length,1);
  assert.equal(entries.filter(e=>e.page.includes('Jarltum Roriksheim/')).length,15);
  assert.equal(entries.find(e=>e.id==='koenigreich-aldrimar').dataType,'module');
  assert.ok(entries.some(e=>e.id==='koenigreich-cenyr'));
  assert.match(read('Kontinente/Estryll/Estryll.html'),/K%C3%B6nigreich%20Aldrimar\/K%C3%B6nigreich%20von%20Aldrimar.html/);
});
