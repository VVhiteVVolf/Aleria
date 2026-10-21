import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { buildTradingPost, buildTradingPostFactions, POST_ID, FACTIONS_ID } from '../modules/klingende-muenze-gwynthor/post-module.mjs';
import { POST_SECTION, COUNTY_POSTS } from '../modules/klingende-muenze-gwynthor/post-section.mjs';
import { POST_FACTIONS, COUNCIL_SEATS } from '../modules/klingende-muenze-gwynthor/post-factions.mjs';
import { OPERATING_MEMBERS, AFFILIATED_ENTRY_IDS } from '../modules/klingende-muenze-gwynthor/post-members.mjs';
const root = new URL('../../', import.meta.url);
const post = buildTradingPost(), factions = buildTradingPostFactions();
const nodes = hierarchy => hierarchy.trees.flatMap(tree => tree.levels.flatMap(level => level.nodes));

test('the Grafschaft has four shared posts and three separately owned guild hierarchies', () => {
  assert.deepEqual(COUNTY_POSTS.map(p => p.name), ['Gwynthor', 'Abergwint', 'Castellbryn', 'Rhosmere']);
  assert.match(COUNTY_POSTS[0].function, /Größter/);
  assert.equal(post.pages.length, 9);
  assert.equal(post.pages.filter(page => page.hierarchyPage).length, 3);
  assert.match(post.pages[1].description, /zugleich Mitglied.*Roten Bank.*Konto/);
  assert.match(post.pages[1].description, /Unternehmer und Zunftsmeister/);
  assert.match(post.pages[1].description, /Personal.*Wachdienst.*vereinbart/);
  assert.equal(post.pages.filter(p => p.sessionPage).length, 4);
  assert.equal(new Set(post.pages.map(p => p.commentThreadKey)).size, 9);
});

test('five interest blocs own eight peer council seats with no single guild lord', () => {
  assert.equal(POST_FACTIONS.length, 5);
  assert.equal(COUNCIL_SEATS.length, 8);
  assert.deepEqual(POST_FACTIONS.map(f => COUNCIL_SEATS.filter(s => s.factionId === f.id).length), [2, 2, 1, 1, 2]);
  const council = post.pages[2].hierarchy.trees[0];
  assert.equal(council.levels.length, 1, 'peer council seats must not be joined as subordinate ranks');
  assert.equal(council.levels.flatMap(l => l.nodes).length, 8);
  assert.ok(council.levels.flatMap(l => l.nodes).every(n => n.subtitle === 'Gleichrangiger Sitz im Achterrat'));
  assert.match(post.pages[2].hierarchy.description, /Kein Kaufmann steht allein/);
  assert.equal(factions.pages.length, 6);
});

test('local branches, vassals, rural breeding and exclusive Loer minting remain distinct', () => {
  for (const id of ['falveri', 'ergalla']) {
    const f = POST_FACTIONS.find(f => f.id === id);
    assert.match(f.text, /Hauptzweig/);
    assert.match(f.origin, /Venalys/);
    assert.match(f.origin, /örtlicher Vertretungszweig/);
  }
  assert.equal(POST_FACTIONS.find(f => f.id === 'gwlannor').liege, 'Haus Saethwyr');
  assert.equal(POST_FACTIONS.find(f => f.id === 'halenrhyd').liege, 'Haus Wyrm');
  assert.match(POST_FACTIONS.find(f => f.id === 'halenrhyd').text, /auf dem Land in Gwynthors Bannkreis/);
  assert.match(POST_FACTIONS.find(f => f.id === 'aurdden-loer').text, /Münzprägerecht liegt allein bei den Loer/);
  assert.ok(!nodes(post.pages[2].hierarchy).some(n => /Aurdden/.test(n.subtitle) && /Prägerecht/.test(n.title)));
});

test('bank is led by Ergalla and county command by Falveri; Aldo is former only', () => {
  const bank = post.pages[3].hierarchy, company = post.pages[4].hierarchy;
  assert.match(bank.trees[0].levels[0].nodes[0].subtitle, /Ergalla/);
  assert.match(company.trees[0].levels[0].nodes[0].subtitle, /Falveri.*Celtigerns Wacht/);
  assert.deepEqual(company.trees.map(t => t.label), ['Führung', 'Verwaltung', 'Ehemalige Mitglieder']);
  assert.ok(!nodes(company).some(n => /^Soldat|^Leutnant|^Optio/.test(n.title)));
  assert.ok(!nodes({ trees: company.trees.slice(0, 2) }).some(n => /Aldo/.test(n.title)));
  assert.ok(company.trees.at(-1).levels[0].nodes.some(n => n.title === 'Aldo Falveri'));
  assert.match(company.description, /Hauptmann.*Kaufleuten und Bürokraten/s);
  assert.match(company.description, /Handels- und Kriegsschiffe/);
});

test('existing operating members retain their identities; suppliers and debtors are not promoted', () => {
  assert.deepEqual(OPERATING_MEMBERS.map(m => m.person.name), ['Lucan Valerus', 'Finlay Cneacail', 'Bleddyn Gwregysdu', 'Albrecht Sonnenfels']);
  assert.equal(new Set(OPERATING_MEMBERS.map(m => m.person.worldPersonId)).size, 4);
  assert.ok(!OPERATING_MEMBERS.some(m => /Alasdair|Helviane|Brenn/.test(m.person.name)));
  for (const hierarchy of post.pages.filter(p => p.hierarchyPage).slice(0, 2).map(p => p.hierarchy)) {
    for (const member of OPERATING_MEMBERS) for (const person of member.owners || [member.person]) assert.ok(nodes(hierarchy).some(n => n.title === person.name && n.worldPersonId === person.worldPersonId));
  }
});

test('archive relocation preserves original objects and thread keys and is repeatable', async () => {
  const existing = AFFILIATED_ENTRY_IDS.map((id, i) => ({ id, pages: [{ commentThreadKey: `original-${i}` }], marker: { retained: true } }));
  const rival = { id: 'celtigerns-letzte-rast' };
  const context = vm.createContext({ SECTIONS: [{ key: 'Gwynthor', tab: POST_SECTION.tab, path: POST_SECTION.path.slice(0, -1), entries: [...existing, rival] }] });
  const script = await readFile(new URL('AleriaAlmanach/modules/klingende-muenze-gwynthor/post-data.js', root), 'utf8');
  vm.runInContext(script, context); vm.runInContext(script, context);
  const target = context.SECTIONS.find(s => s.path.at(-1) === POST_SECTION.key);
  assert.equal(target.entries.length, 2 + AFFILIATED_ENTRY_IDS.length);
  for (const entry of existing) assert.equal(target.entries.find(e => e.id === entry.id), entry);
  assert.equal(context.SECTIONS[0].entries[0], rival);
  assert.equal(context.SECTIONS.flatMap(s => s.entries).length, 3 + AFFILIATED_ENTRY_IDS.length);
  for (const id of [POST_ID, FACTIONS_ID, ...AFFILIATED_ENTRY_IDS]) assert.equal(context.SECTIONS.flatMap(s => s.entries).filter(e => e.id === id).length, 1);
});

test('entry registration runs after member scripts and sources share one archive destination', async () => {
  const html = await readFile(new URL('AleriaAlmanach/AleriaAlmanach.html', root), 'utf8');
  for (const path of ['gwregysdu-harbor/harbor-data', 'klingende-krone/krone-data', 'lachende-nixe/nixe-data', 'rote-klaue/klaue-data']) assert.ok(html.indexOf(path) < html.indexOf('klingende-muenze-gwynthor/post-data'));
  const { KRONE_SECTION } = await import('../modules/klingende-krone/krone-module.mjs');
  const { HARBOR_SECTION } = await import('../modules/gwregysdu-harbor/harbor-module.mjs');
  assert.equal(KRONE_SECTION, POST_SECTION); assert.equal(HARBOR_SECTION, POST_SECTION);
});

test('all images are local, portrait ratio and byte-identical to the selected generated originals', async () => {
  const base = new URL('AleriaAlmanach/assets/klingende-muenze-gwynthor/', root);
  const manifest = JSON.parse(await readFile(new URL('image-prompts.json', base), 'utf8'));
  assert.equal(manifest.images.length, 4);
  for (const image of manifest.images) {
    const bytes = await readFile(new URL(image.destination, base));
    assert.equal(bytes.readUInt32BE(16) * 3, bytes.readUInt32BE(20) * 2);
    assert.ok(image.prompt.includes('Tales of Xillia/Frieren'));
    // The source path is editorial provenance, not a build-machine dependency.
    assert.equal(createHash('sha256').update(bytes).digest('hex'), image.sha256);
  }
  for (const hierarchy of post.pages.filter(p => p.hierarchyPage).map(p => p.hierarchy)) {
    for (const node of nodes(hierarchy)) if (node.portrait?.startsWith('../') || node.portrait?.startsWith('./')) await access(new URL(node.portrait, new URL('AleriaAlmanach/', root)));
  }
});
