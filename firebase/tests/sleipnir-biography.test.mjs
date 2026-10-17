import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { planSleipnirBiography, SLEIPNIR_VARULV_ID } from '../scripts/content/sleipnir-biography-plan.mjs';
import { assertBiographyPublicationSource } from '../scripts/content/biography-content-publication.mjs';

const directory = new URL('../../AleriaAlmanach/assets/biographies/sleipnir-varulv/2026-10-17/', import.meta.url);
const prepared = JSON.parse(await readFile(new URL('prepared.json', directory), 'utf8'));
const { assets } = JSON.parse(await readFile(new URL('asset-publication.json', directory), 'utf8'));
const source = () => ({ id: SLEIPNIR_VARULV_ID, name: 'Sleipnir Varulv',
  portrait: prepared.patch.biography.biography.portrait, biography: structuredClone(prepared.source.biography),
  inventory: { money: { gold: 17 }, items: [{ id: 'existing-bow' }], companions: ['Trygg', 'Kappi', 'Skuggi'].map(name => ({
    name, creatureId: `companion-sleipnir-${name.toLowerCase()}`, image: `/AleriaAlmanach/assets/companions/haus-varulv/${name.toLowerCase()}.png` })) },
  combatProfile: { hitPoints: { current: 13 }, conditions: ['erschöpft'] },
  imageSets: [{ id: 'existing-reactions', emotes: [{ id: 'original' }] }] });

test('Sleipnir gets four additional captioned portraits while inventory, combat and reaction images remain outside the patch', () => {
  const current = source(), original = structuredClone(current);
  const plan = planSleipnirBiography(current, assets, '2026-10-17T17:00:00.000Z');
  assert.deepEqual(current, original);
  assert.deepEqual(Object.keys(plan.patch).sort(), ['biography', 'updatedAt']);
  assert.deepEqual(plan.creatures, []);
  const bio = plan.patch.biography.biography;
  assert.equal(bio.portrait, original.portrait);
  assert.equal(new Set(bio.portraitStages).size, 4);
  assert.match(bio.portraitCaptions[1], /Bogen und Trygg/);
  assert.deepEqual(bio.portraitCaptions.slice(2), ['Mit 22 Jahren · 1718.', 'Mit 12 Jahren · 1708.', 'Als frecher Bub mit 7 Jahren · 1703.']);
  assert.equal(bio.abilities.length, 10);
  assert.ok(bio.abilities.every(ability => ability.icon.startsWith('https://firebasestorage.googleapis.com/')));
  assert.ok(bio.extraSections.some(section => section.text.includes('Sigfast Varulv fiel im Alter von 53 Jahren')));
  assert.ok(bio.historyText.includes('größer ist als seine Vergangenheit'));
  assert.ok(!JSON.stringify(bio).includes('bislang nicht näher festgelegt'));
});

test('every relationship has a real portrait; the three existing companions are included once with their correct species', async () => {
  const current = source(), first = planSleipnirBiography(current, assets);
  const connections = first.patch.biography.biography.connections.filter(connection => connection.type !== 'heading');
  assert.equal(connections.length, 20);
  for (const connection of connections) {
    assert.ok(connection.image.startsWith('/'), connection.name);
    await access(new URL('../../' + connection.image.slice(1), import.meta.url));
  }
  assert.match(connections.find(connection => connection.name === 'Trygg').detail, /Gamir/);
  assert.match(connections.find(connection => connection.name === 'Skuggi').detail, /Habicht/);
  assert.match(connections.find(connection => connection.name === 'Galahad Draig').detail, /brieflicher Austausch/);
  const repeated = planSleipnirBiography({ ...current, ...first.patch }, assets);
  assert.deepEqual(repeated.patch.biography.biography.connections, first.patch.biography.biography.connections);
});

test('publication refuses concurrent biography edits or a wider patch while allowing unrelated live resource changes', () => {
  const current = source(), plan = { ...planSleipnirBiography(current, assets), source: { biography: current.biography } };
  const allowedFields = ['biography', 'updatedAt'];
  assert.doesNotThrow(() => assertBiographyPublicationSource({ ...current, combatProfile: { hitPoints: { current: 7 } } }, plan, allowedFields));
  const edited = structuredClone(current); edited.biography.biography.biographyText += ' Neu.';
  assert.throws(() => assertBiographyPublicationSource(edited, plan, allowedFields), /inzwischen bearbeitet/);
  assert.throws(() => assertBiographyPublicationSource(current, { ...plan, patch: { ...plan.patch, combatProfile: {} } }, allowedFields), /Feldumfang/);
});
