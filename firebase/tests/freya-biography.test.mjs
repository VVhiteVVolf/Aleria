import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { planFreyaBiography, FREYA_CHARACTER_ID, FREYA_BIOGRAPHY_FIELDS, FREYA_ACADEMY_LINK } from '../scripts/content/freya-biography-plan.mjs';
import { FREYA_WORLD_ID, buildFreyaFamilyContext } from '../scripts/content/freya-family-context.mjs';
import { assertBiographyPublicationSource, countBiographyPortraits } from '../scripts/content/biography-content-publication.mjs';

const directory = new URL('../../AleriaAlmanach/assets/biographies/freya-skald/2026-10-17/', import.meta.url);
const { assets } = JSON.parse(await readFile(new URL('asset-publication.json', directory), 'utf8'));
const source = () => ({ id: FREYA_CHARACTER_ID, name: 'Freya Skald', portrait: 'existing-portrait',
  identity: { worldPersonId: '' }, genealogy: { sex: 'female', birth: '1720', sources: [] },
  inventory: { companions: [{ id: 'freya-eldfaxi', creatureId: 'companion-eldfaxi' }], money: { gold: 9 } },
  combatProfile: { hitPoints: { current: 7 }, resources: [{ current: 2 }] },
  imageSets: [{ id: 'existing-set', emotes: ['keep-all'] }], activeImageSetId: 'existing-set' });

test('Freya keeps her actual ID and original libraries; four views retain the children and omit the adult couple', () => {
  const current = source(), before = structuredClone(current), plan = planFreyaBiography(current, assets);
  assert.deepEqual(current, before);
  assert.deepEqual(Object.keys(plan.patch).sort(), [...FREYA_BIOGRAPHY_FIELDS].sort());
  assert.deepEqual(plan.creatures, []);
  const bio = plan.patch.biography.biography;
  assert.equal(countBiographyPortraits(plan.patch.biography), 4);
  assert.deepEqual(bio.portraitStages, [assets.armor.url, assets.age15.url, assets.child.url, '']);
  assert.equal(bio.portraitCaptions[3], 'Freya mit 6 und Fenrir mit 8 Jahren · 1726.');
  assert.equal(bio.portraitFit, 'contain');
  assert.equal(plan.patch.identity.worldPersonId, FREYA_WORLD_ID);
  assert.equal(plan.patch.genealogy.worldPersonId, FREYA_WORLD_ID);
  assert.equal(plan.patch.genealogy.relationships.parents.length, 2);
  assert.equal(plan.patch.genealogy.relationships.partners.length, 0);
});

test('family context includes close relations once, distinguishes the two Skald aunts and uses real local portraits or clan emblems', async () => {
  const context = buildFreyaFamilyContext();
  assert.equal(context.connections.length, 53);
  assert.equal(context.siblingIds.length, 6);
  assert.equal(new Set(context.connections.map(person => person.worldPersonId)).size, 53);
  const aunt = name => context.connections.find(person => person.name === name);
  assert.notEqual(aunt('Antje Skald').worldPersonId, aunt('Antke Skald').worldPersonId);
  assert.match(aunt('Gleipnir Varulv').detail, /Antje Skald/);
  assert.match(aunt('Mandon Ceirwyn').detail, /Antke Skald/);
  for (const person of context.connections) await access(new URL('../../' + person.image.slice(1), import.meta.url));
  const bio = planFreyaBiography(source(), assets).patch.biography.biography;
  assert.equal(bio.connections.filter(item => item.type !== 'heading').length, 55);
  assert.match(bio.connections[0].title, /Fenrir.*Love Interest/);
  assert.equal(bio.connections[1].name, 'Fenrir Varulv');
  assert.equal(bio.connections.filter(item => item.name === 'Eldfaxi').length, 1);
  assert.match(bio.connections.find(item => item.name === 'Eldfaxi').detail, /Hest-Mix-Stute/);
});

test('academy link points to the registered institute; love interest, talents and blind spots remain explicit', async () => {
  const entries = JSON.parse(await readFile(new URL('../../Fraktionen/data/organisationen.json', import.meta.url), 'utf8'));
  const academy = (Array.isArray(entries) ? entries : entries.entries).find(entry => entry.id === 'skaldenakademie-klangheim');
  assert(academy);
  const module = planFreyaBiography(source(), assets).patch.biography, bio = module.biography;
  assert(bio.documents.some(item => item.link === FREYA_ACADEMY_LINK));
  assert.equal(bio.abilities.length, 12);
  assert(bio.abilities.every(item => item.icon.startsWith('https://firebasestorage.googleapis.com/')));
  const fenrir = bio.extraSections.find(section => section.title.includes('Love Interest')).text;
  for (const phrase of ['bester Freund', 'gemeinsames Leben', 'Freiheit', 'Verlobung oder Ehe besteht nicht', 'Unfruchtbarkeit']) assert(fenrir.includes(phrase), phrase);
  assert.match(bio.historyText, /musikalischen Künsten als auch.*magischen/);
  assert.match(bio.historyText, /Brüder/);
  assert.match(bio.extraSections.find(section => section.title.includes('blinde Flecken')).text, /praktische Felderfahrung/);
  assert.match(bio.trivia.join(' '), /Rotes Fleisch.*Fisch.*Satire.*Flirt.*Freizügigkeit/);
});

test('concurrent edits to biography or identity block publication; live combat changes do not', () => {
  const current = source(), plan = planFreyaBiography(current, assets);
  plan.source = { biography: null, identity: current.identity, genealogy: current.genealogy };
  assert.doesNotThrow(() => assertBiographyPublicationSource({ ...current, combatProfile: { hitPoints: { current: 1 } } }, plan, FREYA_BIOGRAPHY_FIELDS));
  assert.throws(() => assertBiographyPublicationSource({ ...current, biography: { quote: 'Neue Bio' } }, plan, FREYA_BIOGRAPHY_FIELDS), /inzwischen bearbeitet/);
  assert.throws(() => assertBiographyPublicationSource({ ...current, identity: { worldPersonId: 'someone-else' } }, plan, FREYA_BIOGRAPHY_FIELDS), /inzwischen bearbeitet/);
  assert.equal(countBiographyPortraits({ biography: { portrait: 'a', portraitStages: ['b', 'c', 'd', 'e'] } }), 5);
});
