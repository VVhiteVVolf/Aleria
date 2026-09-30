import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { normalizeMilitaryProfile, formatForceStrength } from '../modules/military/military-profile.mjs';

const root = resolve(import.meta.dirname, '../..');
const dataPath = 'Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Gwynthors_Bannkreis/Gwynthor/ort.data.js';
const context = { window: {} };
vm.runInNewContext(await readFile(resolve(root, dataPath), 'utf8'), context);
const data = context.window.ORT_DATA;
const profile = normalizeMilitaryProfile(data.militaryView, { placeId: 'gwynthor', placeName: data.name });

test('Gwynthor trennt Hauskräfte und Wachen ohne erfundene Aufstellungszahlen', () => {
  assert.equal(profile.status, 'ready');
  assert.equal(profile.presentationMode, 'qualitative');
  assert.equal(profile.total, null);
  assert.deepEqual(Array.from(profile.forces, force => force.kind), ['house', 'vassal', 'cityWatch', 'localWatch']);
  for (const force of profile.forces) {
    assert.equal(force.count, null);
    assert.equal(force.share, null);
  }
  assert.match(formatForceStrength(profile.forces[2]), /Bis zu 600/);
  const content = JSON.stringify(data.militaryView) + JSON.stringify(data.sections.military);
  assert.doesNotMatch(content, /siebzig Prozent|dreißig Prozent|400 bis 600|400 und 600/);
  assert.match(profile.forces[2].note, /nicht zur Draig-Hausmacht/);
  assert.match(profile.forces[0].note, /Leibgarde gehört zu dieser Hausmacht/);
  const example = profile.sections.find(section => section.title.startsWith('Morddwr'));
  assert.match(example.paragraphs.join(' '), /legen nicht fest/);
});

test('Titelbild und beide Wachbilder sind lokal vorhanden; das Titelbild bleibt identisch', async () => {
  assert.equal(profile.heroImage.src, '/AleriaAlmanach/public/assets/draig-leibgarde/steffan-burghof-v1.png');
  assert.equal(profile.units.length, 2);
  assert.ok(profile.units[1].image.src.endsWith('/gwynthor-stadtwache.png?v=20260901a'));
  for (const image of [profile.heroImage, ...profile.units.map(unit => unit.image), ...profile.forces.map(force => force.crest).filter(image => image.src)]) {
    await access(resolve(root, decodeURI(image.src.split('?')[0]).slice(1)));
  }
});
