import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import vm from 'node:vm';
import { getRegisteredFamily } from '../../Stammbäume/assets/js/data/families.registry.js';
import { normalizeFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';
import { resolveRegisteredFamilyUpgrade } from '../../Stammbäume/assets/js/services/family-registry-upgrade.js';
import { houseBiographyDefaultFingerprint } from '../../Stammbäume/assets/js/modules/house-biography/house-biography-default-upgrade.js';

const feature = new URL('../', import.meta.url);
const context = { window: {} };
vm.runInNewContext(await readFile(new URL('haeuser.registry.js', feature), 'utf8'), context);
const registry = context.window.HaeuserRegistry;
async function source(id) {
  const url = new URL(registry.byId('haus-' + id).data.replace('haus.data.js', 'haus.content.mjs'), feature);
  url.search = '';
  return { url, content: (await import(url)).HOUSE_CONTENT };
}

test('Die 18 neuen Originale besitzen redigierte Artikel, eigenständige kurze Bios und archivierte Bildquellen', async () => {
  for (const name of ['gwyntog','rhuddgar','caerlaen','caerthwyn','barus','cenfig','daran','ymladd','tawelgar','edmy','cysgodion','seldryn','annwyl','penwyn','selog','taranvyr','trydar','garrael']) {
    const { url, content } = await source(name);
    assert.equal(content.prepared, false, name);
    assert.equal(content.sourceBatch, 'gwendolyn-20260911', name);
    assert.ok(JSON.stringify(content.sections.history).length > 100, name);
    assert.ok(Object.values(content.biographySummary).join(' ').split(/\s+/).length < 200, name);
    const provenance = JSON.parse(await readFile(new URL('quellen.json', url), 'utf8'));
    assert.ok((await readFile(new URL(provenance.original, url), 'utf8')).includes('<table'), name);
    for (const image of provenance.images) {
      await access(new URL(image.file, url));
      assert.ok(image.url.startsWith('https://i.imgur.com/'), name);
    }
  }
});

test('Die 19 ausdrücklich gelieferten Kriegerbilder ergänzen ihre bestehenden Häuser', async () => {
  const images = {
    almarch:'0hdSBMi', brinmarch:'KJyLhnl', gwardin:'E8vC07N', tirwyn:'MLYvps3', eirfael:'4eUNXq9',
    ghorswyn:'pdpHgpD', coedvarn:'LNlNoxi', althin:'jxpJ9av', talmeirch:'6couDwc', gwynrhos:'Svx5aRn',
    gwared:'3w0Jntw', rhenna:'VJVQMeQ', madryn:'0CS1p06', talinvyr:'pL6WO20', merek:'T7D46wH',
    skellor:'wy72bsJ', morveth:'it2wNQL', bleiddorn:'g850v6f', 'dubhan-gwynthor':'M3xsR4U',
  };
  for (const [name, imageId] of Object.entries(images)) {
    const { url, content } = await source(name);
    const provenance = JSON.parse(await readFile(new URL('quellen.json', url), 'utf8'));
    const image = provenance.images.find(image => image.url === `https://i.imgur.com/${imageId}.png`);
    assert.ok(image, name);
    await access(new URL(image.file, url));
    assert.ok(JSON.stringify(content.images).includes(image.file), name);
    assert.equal(content.prepared, true, name);
  }
});

test('Widersprüche bleiben offen, vorhandene Herkunft und Personenidentitäten werden nicht überschrieben', async () => {
  for (const [name, field] of [['rhuddgar','knightingPatron'],['caerthwyn','wealth'],['barus','wealth'],['cysgodion','religion'],['seldryn','wealth'],['seldryn','knightingPatron'],['selog','knightingPatron'],['garrael','seat']]) {
    assert.equal((await source(name)).content.profile[field], '', name + ' ' + field);
  }
  assert.equal((await source('garrael')).content.territoryId, 'insel-camruisge');
  assert.equal((await source('penwyn')).content.profile.liege, 'Myrddin Draig');
  assert.ok(!(await source('barus')).content.heirs.some(person => person.name.includes('Macsen')));
  const seldryn = (await source('seldryn')).content;
  assert.ok(seldryn.heads.some(person => person.name.includes('Lugh') && /1680/.test(person.detail)));
  const taranvyr = (await source('taranvyr')).content;
  assert.equal(taranvyr.offices.length, 3);
  assert.ok(taranvyr.offices.some(person => person.role === 'Vogt' && !person.id && person.silhouette === 'male'));
  assert.ok(taranvyr.offices.some(person => person.id === 'fiannait-spouse-taranvyr'));
  assert.ok(taranvyr.offices.some(person => person.id === 'mervynne-spouse-taranvyr'));
});

for (const name of ['annwyl','gwared']) {
  test(`Unveränderte alte Vorbereitungsbio ${name} wird aktualisiert; eigene Texte und Löschung bleiben erhalten`, async () => {
    const fixture = JSON.parse(await readFile(new URL(`fixtures/haus-${name}-prepared-biography.json`, import.meta.url), 'utf8'));
    const { content } = await source(name);
    assert.ok(content.biographyPreviousDefaultFingerprints.includes(houseBiographyDefaultFingerprint(fixture.biography)));
    const registered = getRegisteredFamily(fixture.id).family;
    const local = structuredClone(registered);
    local.extensions.sourceRevision = fixture.sourceRevision;
    local.extensions.houseBiographyModule = fixture.biography;
    const before = normalizeFamily(local);
    const updated = resolveRegisteredFamilyUpgrade(registered, local);
    assert.deepEqual(updated.extensions.houseBiographyModule, registered.extensions.houseBiographyModule);
    for (const field of ['persons','partnerships','parentages','houses','cadetBranches','timeJumps']) {
      const comparable = entries => entries.map(entry => ({ ...entry, extensions: entry.extensions || {} }));
      assert.deepEqual(comparable(updated[field]), comparable(before[field]), field);
    }
    for (const biography of [null, { ...fixture.biography, description: 'Meine eigene Hausgeschichte.' }]) {
      local.extensions.houseBiographyModule = biography;
      assert.deepEqual(resolveRegisteredFamilyUpgrade(registered, local).extensions.houseBiographyModule, biography);
    }
    assert.deepEqual(fixture.biography, before.extensions.houseBiographyModule);
  });
}
