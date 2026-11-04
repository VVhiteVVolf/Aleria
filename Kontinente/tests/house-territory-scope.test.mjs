import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access, stat } from 'node:fs/promises';
import vm from 'node:vm';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';

const root = new URL('../../', import.meta.url);
const houseRegistryContext = { window: {} };
vm.runInNewContext(await readFile(new URL('Familien Häuser und Clans/haeuser.registry.js', root), 'utf8'), houseRegistryContext);
const houseRegistry = houseRegistryContext.window.HaeuserRegistry;
const county = new URL('Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/', root);
const regions = {
  gwendolyn: 'Baronie Gwendolyns Ufer/baronie.data.js',
  artus: 'Baronie Arthus Streben/baronie.data.js',
  rhonwens: 'Herrschaft Rhonwens Tränen/herrschaft.data.js',
  gafyr: 'Herrschaft der Gafyr/herrschaft.data.js',
  saethwyr: 'Herrschaft der Saethwyr/herrschaft.data.js',
  wyrm: 'Herrschaft der Wyrm/herrschaft.data.js',
  camruisge: 'Insel Camruisge/insel.data.js',
};
async function sections(path) {
  const context = { window: {} };
  vm.runInNewContext(await readFile(new URL('Kontinente/assets/js/herrschaft-data.js', root), 'utf8'), context);
  vm.runInNewContext(await readFile(new URL(path, county), 'utf8'), context);
  return context.window.KONTINENTE_DATA.view.familySections;
}
const countySections = await sections('grafschaft.data.js');
const local = countySections.flatMap(section => section.cards);
const territories = Object.fromEntries(await Promise.all(Object.entries(regions).map(async ([id, path]) => [id, await sections(path)])));
const ids = cards => Array.from(cards, card => card.id).filter(Boolean).sort();

test('Grafschaft zeigt alle großen Häuser, ausschließlich örtliche kleinere Häuser und die drei historischen Ausnahmen', () => {
  assert.deepEqual(ids(countySections[0].cards), ['arwydd','draig','gafyr','gwefrydd','gwyvern','saethwyr','wyrm'].map(id => 'haus-' + id).sort());
  assert.deepEqual(ids([...countySections[1].cards,...countySections[2].cards]), FAMILY_REGISTRY.filter(record=>record.folderPath.includes('Celtigerns Wacht')&&record.folderPath.includes('Llamreis Ankunft')&&!countySections[0].cards.some(card=>card.id===record.id)).map(record=>record.id).sort());
  for (const card of [...countySections[1].cards, ...countySections[2].cards]) {
    assert.ok(FAMILY_REGISTRY.find(record => record.id === card.id).folderPath.includes('Llamreis Ankunft'), card.id);
  }
  assert.deepEqual(ids(countySections[3].cards), ['haus-ard-conbhron','haus-illysywen','haus-ui-talamh']);
  assert.ok(!local.some(card => card.id === 'haus-von-hochreuth'));
});

test('Das Grafenhaus steht über seinen Vasallen und dient selbst Haus Pendrag', () => {
  const greatHouses = countySections[0].cards;
  const featured = greatHouses.filter(card => card.featured);
  assert.equal(featured.length, 1);
  assert.equal(featured[0].id, 'haus-draig');
  assert.equal(featured[0].featuredLabel, 'Grafenhaus');
  assert.equal(featured[0].liege, 'Haus Pendrag');
  for (const vassal of greatHouses.filter(card => !card.featured)) {
    assert.equal(vassal.liege, 'Haus Draig', vassal.id);
  }
  const tlawd = local.find(card => card.id === 'haus-tlawd');
  assert.equal(tlawd.seat, 'Gwynthor');
  assert.equal(tlawd.liege, 'Gafyr');
});

test('Unterherrschaften führen alle eigenen registrierten Häuser, ohne ihre kleineren Häuser auf der Grafschaft zu duplizieren', () => {
  for (const [key, folder, lord] of [
    ['gwendolyn','Gwendolyns Ufer','haus-gwyvern'],
    ['artus','Artus Streben','haus-gwefrydd'],
    ['rhonwens','Rhonwens Tränen','haus-arwydd'],
    ['camruisge','Camruisge',''],
  ]) {
    const expected = FAMILY_REGISTRY.filter(record => record.folderPath.includes('Celtigerns Wacht') && record.folderPath.includes(folder)).map(record => record.id).sort();
    const cards = territories[key].flatMap(section => section.cards);
    const registered = ids(cards).filter(id => FAMILY_REGISTRY.some(record => record.id === id && record.folderPath.includes('Celtigerns Wacht')));
    assert.deepEqual(registered, expected, key);
    for (const id of expected.filter(id => ![lord,'haus-illysywen'].includes(id))) {
      assert.ok(!local.some(card => card.id === id), id);
    }
  }
  const extinct = territories.rhonwens.find(section => section.title === 'Ausgestorbene Häuser');
  assert.deepEqual(ids(extinct.cards), ['haus-illysywen','haus-morveth']);
  const dispossessed = territories.rhonwens.find(section => section.title === 'Entmachtetes Ritterhaus');
  assert.deepEqual(ids(dispossessed.cards), ['haus-skellor']);
});

test('Ritterfürsten zeigen ihre belegten Vasallen direkt auf der eigenen Herrschaftsseite', () => {
  for (const [key, expected] of [
    ['gafyr', ['gafyr','gostyn','tlawd']],
    ['saethwyr', ['chwedlonol','eneiniog','saethwyr']],
    ['wyrm', ['argall','blevis','brogar','cludwyr','crewe','glyn','jernigan','loer','rhyddid','talfryn','tarw','tynged','wyrm']],
  ]) {
    const cards = territories[key].flatMap(section => section.cards);
    assert.deepEqual(ids(cards).filter(id => id.startsWith('haus-')), expected.map(id => 'haus-' + id), key);
  }
});

test('Wyrms bürgerliche Familien behalten ihren Wohnort unabhängig von ihrer Dienstbindung', () => {
  const wyrmCards = territories.wyrm.flatMap(section => section.cards);
  for (const [seat, names] of [
    ['Llysfaen', ['blevis','brogar','crewe','glyn','jernigan','talfryn']],
    ['Craithglyn', ['tarw','tynged']],
  ]) {
    for (const name of names) {
      const id = 'haus-' + name;
      const record = FAMILY_REGISTRY.find(record => record.id === id);
      assert.deepEqual(record.folderPath, ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', seat], id);
      assert.equal(record.family.document.houseProfile.seat, seat, id);
      assert.equal(record.family.document.houseProfile.liegeHouseId, 'haus-wyrm', id);
      for (const cards of [local, wyrmCards]) {
        const matches = cards.filter(card => card.id === id);
        assert.equal(matches.length, 1, id);
        assert.equal(matches[0].seat, seat, id);
        assert.equal(matches[0].liege, 'Wyrm', id);
      }
    }
  }
});

test('Alle registrierten Grafschaftsfamilien bleiben über direkte Hausseiten oder vorhandene Familienakten erreichbar', async () => {
  const cards = [...local, ...Object.values(territories).flatMap(sections => sections.flatMap(section => section.cards))];
  for (const record of FAMILY_REGISTRY.filter(record => record.folderPath.includes('Celtigerns Wacht'))) {
    const found = cards.filter(card => card.id === record.id);
    assert.ok(found.length, record.id);
    for (const card of found) {
      const target = new URL(card.href, 'http://aleria.local');
      const houseEntry = houseRegistry.byId(record.id);
      if (houseEntry) {
        assert.equal(card.href, '/Familien%20H%C3%A4user%20und%20Clans/' + houseRegistry.linkFor(record.id), record.id);
        assert.equal(target.searchParams.get('haus'), record.id);
        assert.equal(decodeURIComponent(target.pathname), '/Familien Häuser und Clans/' + (houseEntry.page || 'haus.html'));
      } else {
        assert.equal(target.searchParams.get('family'), record.id);
        assert.equal(target.searchParams.get('mode'), 'view');
        assert.equal(decodeURIComponent(target.pathname), '/Stammbäume/Stammbaum.html');
      }
      if (['haus-cochdon', 'haus-twyllod', 'haus-llythfor'].includes(record.id)) {
        assert.equal(card.rank, 'Bürgerliche Familie');
      }
      target.search = '';
      // Leading slash denotes the site's root, not the filesystem root.
      await access(new URL(target.pathname.replace(/^\//, ''), root));
      assert.equal(typeof card.imageSrc, 'string', record.id);
      assert.ok(card.imageSrc.trim(), 'Fehlendes Wappenbild: ' + record.id);
      assert.ok((await stat(new URL(card.imageSrc.replace(/^\//, ''), root))).isFile(), 'Wappenbild ist keine Datei: ' + record.id);
    }
  }
});
