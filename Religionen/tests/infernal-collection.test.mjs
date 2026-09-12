import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { RELIGION_ROOT, readReligionCatalog, entrySearchText, entryPagePath, validateCatalog } from '../modules/content/content-repository.mjs';
import { readCollections, profileContext } from '../modules/content/collection-repository.mjs';
import { collectionCatalog } from '../modules/pantheon/pantheon-template.mjs';
import { rootCatalogEntries } from '../modules/catalog/catalog-register-template.mjs';
import { renderReligionEntry } from '../modules/content/page-template.mjs';
import { renderEntryRedirect } from '../modules/content/redirect-template.mjs';
import { filterEntries } from '../modules/catalog/catalog-model.mjs';

const catalog = readReligionCatalog();
const collection = catalog.collections.find(item => item.id === 'infernaler-kreis');
const circle = collectionCatalog(catalog, collection);
const profiles = catalog.entries.filter(entry => entry.collectionId === collection.id);
const get = id => profiles.find(entry => entry.id === id);
const readJson = path => JSON.parse(readFileSync(resolve(RELIGION_ROOT, path), 'utf8'));
const hash = value => createHash('sha256').update(value).digest('hex');

test('infernal register preserves ten high powers, five lesser powers, two consecrated and five fallen', () => {
  assert.deepEqual(collection.groups.map(group => group.memberIds.length), [10,5,2,5]);
  assert.equal(profiles.length,17);
  assert.equal(circle.entries.length,22);
  assert.equal(catalog.records.length,5);
  assert.deepEqual(circle.entries.filter(entry => entry.chapterId === 'gefallene').map(entry => entry.id), ['seelenherr','narzisst','narath','zarakhul','balor']);
  assert.deepEqual(catalog.records.map(entry => entry.id),['arkeon','asphyra','seelenherr','narzisst','narath']);
  for (const entry of profiles) {
    const { siblings } = profileContext(catalog,entry);
    assert.equal(siblings.length,entry.groupId==='infernale'?10:entry.groupId==='untergoetter'?5:2);
    assert(siblings.every(sibling => sibling.collectionId===collection.id && sibling.groupId===entry.groupId));
  }
});

test('all seventeen imported profiles retain their audited text including nested artifact descriptions', () => {
  const audit = readJson('docs/infernaler-kreis-import.json');
  assert.equal(audit.sourceCount,18);
  assert.equal(audit.profiles.length,17);
  for (const source of audit.profiles) {
    const entry = get(source.id);
    const text = [...entry.sections.flatMap(section => section.blocks.map(block => block.type==='list' ? block.items.join(' ') : block.text)),
      ...(entry.artifacts?.entries || []).flatMap(artifact => artifact.paragraphs), ...(entry.artifacts?.intro || [])].join(' ');
    assert.equal(hash(text),source.contentSha256,entry.id);
    assert.equal(Array.from(text).length,source.loreCharacters,entry.id);
    assert.equal(entry.source.sha256,source.sha256);
    assert(source.paragraphs.length>=13);
    assert(text.length>7000);
    assert(!/Animexx|\b(?:Azura|Kynareth|Arkay|Sheogorath|Midgal)\b|Titel hier einfügen|\[Name 1\]/i.test(text),entry.id);
  }
  assert.equal(get('zarakhul').artifacts.entries.length,6);
  assert.equal(get('zarakhul').artifacts.entries[0].paragraphs.length,3);
  assert.equal(get('zarakhul').artifacts.entries[0].keeper,'Erzdruide Mogh Ruith');
  assert(get('zarakhul').artifacts.entries.slice(1).every(artifact=>artifact.pending && !artifact.paragraphs.length));
  assert.equal(get('balor').artifacts.entries[0].title,'Morvahr');
  assert.equal(get('balor').artifacts.entries[0].paragraphs.length,2);
});

test('ambiguous origins and the present limits of fallen powers remain explicit', () => {
  assert.equal(get('adar').kind,'Kosmische Entität');
  assert(get('adar').facts.some(fact=>fact.label==='Sonderstellung' && fact.value.includes('umstritten')));
  assert(get('azrath-morvath').names.some(name=>name.value==='Aroth'));
  assert(get('zarakhul').facts.some(fact=>fact.value.includes('keine eigenen Pakte')));
  assert(get('balor').facts.some(fact=>fact.value.includes('keine eigenständigen Pakte')));
  assert(get('balor').relations.includes('dagon'));
  assert(get('thraal').relations.includes('bhaal') && get('thraal').relations.includes('hela'));
});

test('generated gold icons cover the entire infernal circle and supplied portraits remain unchanged', () => {
  const symbols = readJson('assets/infernal-icons/image-prompts.json').images;
  assert.equal(symbols.length,23);
  const shapes = new Set();
  const entries = [catalog.entries.find(entry => entry.id === 'infernus'), ...circle.entries];
  for (const symbol of symbols) {
    const path = `assets/infernal-icons/${symbol.file}`;
    const bytes = readFileSync(resolve(RELIGION_ROOT,path));
    assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a',symbol.id);
    assert(bytes.readUInt32BE(16) >= 256 && bytes.readUInt32BE(20) >= 256,symbol.id);
    assert.equal(bytes[25],6,`${symbol.id}: RGBA PNG`);
    assert.equal(entries.find(entry => entry.id === symbol.id)?.symbol,path,symbol.id);
    assert.equal(symbol.styleReferences.length,2);
    assert(symbol.prompt.includes('Transparent background'));
    shapes.add(hash(bytes));
  }
  assert.equal(shapes.size,23);
  const images = readJson('assets/infernal-art/sources.json').images;
  assert.equal(images.length,29);
  for (const image of images) {
    const bytes = readFileSync(resolve(RELIGION_ROOT,image.src));
    assert.equal(hash(bytes),image.sha256,image.id);
    assert.equal(bytes.readUInt32BE(16),image.width,image.id);
    assert.equal(bytes.readUInt32BE(20),image.height,image.id);
  }
  for (const entry of profiles) {
    const html = renderReligionEntry(catalog,entry);
    assert.equal(entry.portrait.src,`assets/infernal-art/${entry.id}.png`);
    assert.match(html, /class="profile-cover has-portrait"/);
    assert(html.includes(entry.portrait.src));
    assert.equal(entry.symbol,`assets/infernal-icons/${entry.id}.png`);
  }
});

test('register-only names are discoverable without empty articles or unrelated church doctrine', () => {
  const root = rootCatalogEntries(catalog).map(entry=>({...entry,searchText:entrySearchText(entry)}));
  for (const query of ['Dagon','Aroth','Arkeon','Narath','Seelenherr']) {
    assert.deepEqual(filterEntries(root,{query}).map(entry=>entry.id),query === 'Narath' ? ['infernus','schwarze-sonne'] : ['infernus']);
  }
  const html = renderReligionEntry(catalog,catalog.entries.find(entry=>entry.id==='infernus'));
  assert.match(html,/data-theme="infernal"/);
  assert(!html.includes('id="heilige"') && !html.includes('class="pantheon-doctrine"'));
  assert.equal((html.match(/data-religion-image-link/g)||[]).length,5);
  for (const record of catalog.records) {
    assert(record.recordOnly && !record.page && !record.canonicalHref);
    assert(!existsSync(resolve(RELIGION_ROOT,'..',entryPagePath(record))));
    assert(html.includes(`id="entry-${record.id}"`));
  }
  const divine = renderReligionEntry(catalog,catalog.entries.find(entry=>entry.id==='neun-goettliche'));
  assert(!divine.includes('data-theme="infernal"'));
  assert(divine.includes('id="heilige"') && divine.includes('class="pantheon-doctrine"'));
});

test('invalid register targets, duplicate IDs, broken doctrine and artifacts fail before generation', () => {
  function invalidRecord(change) {
    return () => readCollections(['data/infernaler-kreis.json'], path => {
      const value=readJson(path);
      if (value.id==='arkeon') change(value);
      return value;
    },catalog.entries.filter(entry=>!entry.collectionId));
  }
  assert.throws(invalidRecord(value=>{value.page=true;}),/Seitenziel/);
  assert.throws(invalidRecord(value=>{value.id='dagon';}),/doppelter Sammlungseintrag/);
  assert.throws(invalidRecord(value=>{value.tags='wrong';}),/Registerbegriffe/);
  const badDoctrine = structuredClone(catalog);
  badDoctrine.collections[1].doctrineIds=['missing'];
  assert.throws(()=>validateCatalog(badDoctrine),/Sammlungslehre fehlt/);
  const badArtifact = structuredClone(catalog);
  badArtifact.entries.find(entry=>entry.id==='zarakhul').artifacts.entries[0].image.src='../escape.png';
  assert.throws(()=>validateCatalog(badArtifact),/Ungültiger lokaler Pfad/);
  const emptyArtifact = structuredClone(catalog);
  delete emptyArtifact.entries.find(entry=>entry.id==='zarakhul').artifacts.entries[1].pending;
  assert.throws(()=>validateCatalog(emptyArtifact),/Artefaktüberlieferung fehlt/);
});

test('legacy infernal address redirects safely to the new collection and rejects output collisions', () => {
  const parent = catalog.entries.find(entry=>entry.id==='infernus');
  const alias = parent.aliases[0];
  const html = renderEntryRedirect(parent,alias);
  assert.equal(readFileSync(resolve(RELIGION_ROOT,'..',alias),'utf8').replace(/\r\n/g,'\n'),html);
  assert.match(html,/http-equiv="refresh"/);
  assert.match(html,/\.\.\/infernus\/index.html/);
  const bad = structuredClone(catalog);
  bad.entries.find(entry=>entry.id==='infernus').aliases=['Religionen/pantheons/neun-goettliche/index.html'];
  assert.throws(()=>validateCatalog(bad),/Kollidierende Weiterleitung/);
  bad.entries.find(entry=>entry.id==='infernus').aliases=['Religionen/index.html'];
  assert.throws(()=>validateCatalog(bad),/Kollidierende Weiterleitung/);
});
