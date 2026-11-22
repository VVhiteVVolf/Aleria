import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { shouldPublish } from '../../netlify/build/site-publish.mjs';
import { FEDERKIEL_BANNKREIS_COURIERS, federkielCourierAvatar } from '../modules/federkiel-gwynthor/federkiel-couriers.mjs';

const root = new URL('../../', import.meta.url);
const read = path => readFile(new URL(path, root));
const json = async path => JSON.parse(await read(path));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

test('the four independent entries have only a given name, a short biography and a Gwynthor assignment', async () => {
  const [snapshot, registry] = await Promise.all([json('CharakterDatenbank/generated/characters.snapshot.json'), json('CharakterDatenbank/registry.json')]);
  for (const person of FEDERKIEL_BANNKREIS_COURIERS) {
    const found = snapshot.characters.filter(character => character.id === person.id);
    assert.equal(found.length, 1);
    const [profile] = found;
    assert.equal(profile.name, person.name);
    assert.ok(!/\s/.test(profile.name));
    assert.equal(profile.portrait, person.portrait);
    assert.equal(profile.bio, person.bio);
    assert.equal(profile.currentLocation, 'Bannkreis Gwynthor');
    assert.match(profile.biography.biography.biographyText, /Bannkreis/);
    assert.match(profile.biography.biography.documents[0].link, /entry=gwynthor-federkiel-kurierstation$/);
    assert.ok(!profile.identity?.worldPersonId);
    assert.equal(snapshot.charTabs.map.Gwynthor.filter(id => id === person.id).length, 1);
    const recordPath = registry.records.find(record => record.firestoreDocumentId === person.id).path;
    const record = await json(`CharakterDatenbank/${recordPath}`);
    assert.equal(record.character.id, person.id);
    assert.equal(record.local.authoredFeature, 'federkiel-couriers-20261122');
  }
});

test('the runtime profiles, workshop and delivery use the same nine Set 1 crops per courier', async () => {
  const snapshot = await json('CharakterDatenbank/generated/characters.snapshot.json');
  const catalog = await json('AleriaAlmanach/AvatarWerkstatt/Anleitungen/avatar-prompt-sets-28-20261121.json');
  const baseline = catalog.sets.find(set => set.number === 1);
  const distinct = new Set();
  for (const person of FEDERKIEL_BANNKREIS_COURIERS) {
    const profile = snapshot.characters.find(character => character.id === person.id);
    const workshop = `AleriaAlmanach/AvatarWerkstatt/Charaktere/Gruppen/Federkiel - Gwynthor/${person.name}`;
    const manifest = await json(`${workshop}/avatar-manifest.json`);
    const [set] = manifest.sets;
    assert.equal(manifest.catalogSourceSha256, catalog.sourceSha256);
    assert.equal(manifest.characterId, person.id);
    assert.equal(set.catalogNumber, 1);
    assert.equal(profile.emotes.length, 9);
    const [sheet, original, portrait] = await Promise.all([read(set.sourceSheet), read(set.generatorOriginal), read(set.reference)]);
    assert.deepEqual(sheet, original);
    assert.equal(sha(sheet), set.sourceSha256);
    assert.equal(sha(portrait), set.referenceSha256);
    assert.equal(shouldPublish(set.generatorOriginal), false);
    for (const item of set.outputs) {
      assert.equal(item.emotion, baseline.panels[item.index - 1].emotion);
      const url = federkielCourierAvatar(person.slug, item.index);
      assert.deepEqual(profile.emotes[item.index - 1], { label: item.emotion.split(' / ')[0], img: url });
      assert.equal(url.slice(1), item.webFile);
      assert.equal(shouldPublish(item.webFile), true);
      const [web, work, delivered] = await Promise.all([read(item.webFile), read(item.localPath), read(item.deliveryFile)]);
      assert.deepEqual(web, work);
      assert.deepEqual(web, delivered);
      assert.equal(sha(web), item.sha256);
      assert.equal(web.readUInt32BE(16), item.width);
      assert.equal(web.readUInt32BE(20), item.height);
      assert.equal(item.width, item.height);
      distinct.add(item.sha256);
    }
  }
  assert.equal(distinct.size, 36);
});
