import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { buildFortunaTradingPost, buildFortunaFactions, FORTUNA_POST_ID, FORTUNA_FACTIONS_ID } from '../modules/markt-der-fortuna-gwynthor/fortuna-module.mjs';
import { FORTUNA_SECTION } from '../modules/markt-der-fortuna-gwynthor/fortuna-section.mjs';
import { FORTUNA_FACTIONS, FORTUNA_COUNCIL } from '../modules/markt-der-fortuna-gwynthor/fortuna-factions.mjs';
import { FORTUNA_BUSINESSES, FORTUNA_AFFILIATED_IDS, FORTUNA_EXTERNAL_RELATIONS } from '../modules/markt-der-fortuna-gwynthor/fortuna-network.mjs';
import { HOUSE_AELMOR_FAMILY } from '../../Stammbäume/assets/js/data/house-aelmor-family.js';
const root = new URL('../../', import.meta.url), post = buildFortunaTradingPost(), families = buildFortunaFactions();
const allNodes = hierarchy => hierarchy.trees.flatMap(tree => tree.levels.flatMap(level => level.nodes));

test('Fortuna has distinct market, bank, company and a very small Mariel branch; excluded guilds stay absent', () => {
  assert.equal(post.pages.length, 11);
  assert.equal(families.pages.length, 9);
  assert.equal(post.pages.filter(p => p.hierarchyPage).length, 4);
  assert.equal(post.pages.filter(p => p.sessionPage).length, 5);
  assert.doesNotMatch(JSON.stringify([post, families]), /Windreiter|Geeinte Hände|Rote Kompanie|Draig|Südstahl|Tauwind/);
  assert.equal(new Set(post.pages.map(p => p.commentThreadKey)).size, 11);
  assert.equal(new Set(families.pages.map(p => p.commentThreadKey)).size, 9);
});

test('seven family blocs own nine peer seats, with distinct Venalys vassalage and shipbuilding', async () => {
  assert.deepEqual(FORTUNA_FACTIONS.map(f => f.name), ['Falto', 'Nerva', 'Tonnarth', 'Braglas', 'Aelmor', 'Coeddu', 'Maerllys']);
  assert.equal(FORTUNA_COUNCIL.length, 9);
  assert.deepEqual(FORTUNA_FACTIONS.map(f => f.seats), [2, 2, 1, 1, 1, 1, 1]);
  const council = post.pages[2].hierarchy.trees[0];
  assert.equal(council.levels.length, 1);
  assert.equal(council.levels[0].nodes.length, 9);
  for (const family of FORTUNA_FACTIONS.slice(0, 2)) assert.equal(family.liege, 'Magnarierhaus · unter Vinicius');
  assert.match(FORTUNA_FACTIONS[0].text, /lange bevor die Klingende Münze hier/);
  assert.match(FORTUNA_FACTIONS[1].text, /mehrere Jahrhunderte/);
  const aelmor = FORTUNA_FACTIONS.find(f => f.id === 'aelmor');
  assert.equal(aelmor.liege, 'Haus Saethwyr');
  assert.match(aelmor.text, /Handelsschiffe, keine Kriegsschiffe/);
  assert.match(aelmor.text, /Gwlannor/);
  assert.equal(HOUSE_AELMOR_FAMILY.document.houseProfile.liegeHouseId, 'haus-saethwyr');
  const city = vm.createContext({ window: {}, encodeURI, encodeURIComponent });
  vm.runInContext(await readFile(new URL('Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Gwynthors_Bannkreis/Gwynthor/ort.data.js', root), 'utf8'), city);
  const houses = [];
  function collect(value) { if (!value || typeof value !== 'object') return; if (value.familyId && value.liege) houses.push(value); Object.values(value).forEach(collect); }
  collect(city.window.ORT_DATA);
  assert.equal(houses.find(h => h.familyId === 'haus-aelmor').liege, 'Haus Saethwyr');
  assert.equal(houses.find(h => h.familyId === 'haus-tonnarth').liege, 'Haus Draig');
});

test('Falto leads the bank and Nerva the company; no old red-company officers are reassigned', () => {
  const bank = post.pages[3].hierarchy, company = post.pages[4].hierarchy;
  assert.match(bank.trees[0].levels[0].nodes[0].subtitle, /Falto/);
  assert.match(company.trees[0].levels[0].nodes[0].subtitle, /Nerva/);
  assert.deepEqual(company.trees.map(t => t.label), ['Führung', 'Verwaltung', 'Ehemalige Mitglieder']);
  assert.ok(!allNodes(company).some(n => /^Soldat|^Leutnant|Aldo Falveri/.test(n.title)));
});

test('Mariels Gabe is a Weisenfluh merchant subguild whose local Tafel has exactly three posts', () => {
  const mariel = post.pages[5].hierarchy, nodes = allNodes(mariel);
  assert.equal(nodes.length, 3);
  assert.ok(nodes.every(node => node.subtitle.startsWith('1 Stelle')));
  assert.match(mariel.description, /Kaufmannsgilde.*Weisenfluh.*Untergilde/s);
  assert.match(mariel.description, /Fortuna-Hafen/);
  assert.match(mariel.description, /Tafel der Mutter/);
  assert.match(mariel.description, /Bedürftige.*kirchliche Stellen/);
  assert.equal(mariel.trees.length, 1);
});

test('prior member, cooperation and supply evidence remain distinct; wider families receive no invented seat', () => {
  assert.deepEqual(FORTUNA_BUSINESSES.map(p => [p.family, p.status]), [['Vann', 'member'], ['Raves', 'cooperation'], ['Pendrwn', 'supply']]);
  assert.equal(new Set(FORTUNA_BUSINESSES.map(p => p.person.worldPersonId)).size, 3);
  assert.equal(FORTUNA_BUSINESSES.filter(p => p.bank).length, 1);
  assert.deepEqual(FORTUNA_EXTERNAL_RELATIONS.map(p => p.id), ['veltrane']);
  assert.doesNotMatch(JSON.stringify(FORTUNA_EXTERNAL_RELATIONS), /Draig|Südstahl|Tauwind/);
  assert.doesNotMatch(JSON.stringify(families.pages.at(-1)), /Draig|Südstahl|Tauwind/);
  assert.ok(FORTUNA_EXTERNAL_RELATIONS.every(p => !FORTUNA_FACTIONS.some(f => f.id === p.id)));
  const bankCustomerNodes = post.pages[3].hierarchy.trees.at(-1).levels.at(-1).nodes;
  assert.deepEqual(bankCustomerNodes.map(n => n.title), ['Brenn Vann']);
  assert.ok(!allNodes(post.pages[2].hierarchy).some(n => /Meilyr|Gwenith/.test(n.title)));
});

test('registration relocates the same business objects once, keeps threads and leaves Münze entries outside', async () => {
  const businesses = FORTUNA_AFFILIATED_IDS.map((id, index) => ({ id, pages: [{ commentThreadKey: `stable-${index}` }], retained: true }));
  const coin = { id: 'gwynthor-handelsposten-klingende-muenze' };
  const context = vm.createContext({ SECTIONS: [{ key: 'Gwynthor', tab: FORTUNA_SECTION.tab, path: FORTUNA_SECTION.path.slice(0, -1), entries: [...businesses, coin] }] });
  const source = await readFile(new URL('AleriaAlmanach/modules/markt-der-fortuna-gwynthor/fortuna-data.js', root), 'utf8');
  vm.runInContext(source, context); vm.runInContext(source, context);
  const target = context.SECTIONS.find(s => s.path.at(-1) === FORTUNA_SECTION.key);
  assert.equal(target.entries.length, 5);
  for (const before of businesses) assert.equal(target.entries.find(e => e.id === before.id), before);
  assert.equal(context.SECTIONS[0].entries[0], coin);
  for (const id of [FORTUNA_POST_ID, FORTUNA_FACTIONS_ID, ...FORTUNA_AFFILIATED_IDS]) assert.equal(context.SECTIONS.flatMap(s => s.entries).filter(e => e.id === id).length, 1);
});

test('five selected images retain dimensions, hashes and existing family emblems', async () => {
  const base = new URL('AleriaAlmanach/assets/markt-der-fortuna-gwynthor/', root);
  const manifest = JSON.parse(await readFile(new URL('image-prompts.json', base), 'utf8'));
  assert.equal(manifest.images.length, 5);
  for (const image of manifest.images) {
    const bytes = await readFile(new URL(image.destination, base));
    assert.equal(bytes.readUInt32BE(16) * 3, bytes.readUInt32BE(20) * 2);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), image.sha256);
    assert.ok(image.prompt.includes('Tales of Xillia/Frieren'));
  }
  for (const hierarchy of post.pages.filter(p => p.hierarchyPage).map(p => p.hierarchy)) {
    for (const node of allNodes(hierarchy)) if (node.portrait) await access(new URL(node.portrait, new URL('AleriaAlmanach/', root)));
  }
  assert.equal(FORTUNA_FACTIONS[0].familyId, 'haus-falto');
  assert.equal(FORTUNA_FACTIONS[1].familyId, '');
  assert.ok(FORTUNA_FACTIONS.slice(0, 2).every(f => f.emblem === ''));
});

test('generated placement loads after all three businesses and uses the shared section destination', async () => {
  const html = await readFile(new URL('AleriaAlmanach/AleriaAlmanach.html', root), 'utf8');
  for (const path of ['goettliche-eleganz/eleganz-data', 'pendrwn-general-store/store-data', 'letzte-rast/rast-data']) assert.ok(html.indexOf(path) < html.indexOf('markt-der-fortuna-gwynthor/fortuna-data'));
  const { STORE_SECTION } = await import('../modules/pendrwn-general-store/store-module.mjs');
  assert.equal(STORE_SECTION, FORTUNA_SECTION);
});

test('profile-only snapshot publication is a read-only no-op after the isolated Aelmor correction', async () => {
  const { publishFamilySnapshots } = await import('../../Stammbäume/tools/publish-family-snapshots.mjs');
  const url = new URL('Stammbäume/assets/data/published-families/haus-aelmor.json', root);
  const before = await readFile(url, 'utf8');
  const result = await publishFamilySnapshots(['haus-aelmor'], { houseProfilesOnly: true });
  assert.deepEqual(result.changed, []);
  assert.equal(result.applied, false);
  assert.equal(await readFile(url, 'utf8'), before);
  assert.equal(JSON.parse(before).family.document.houseProfile.liegeHouseId, 'haus-saethwyr');
});
