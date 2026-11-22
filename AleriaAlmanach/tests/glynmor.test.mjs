import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  GLYNMOR_EMBLEM, GLYNMOR_FAMILY_ID, GLYNMOR_FAMILY_PATH, GLYNMOR_MEERA, GLYNMOR_MODULE_ID, GLYNMOR_TUDUR
} from '../../shared/glynmor/glynmor-identity.mjs';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { assertValidFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';
import { reconcileFamilyWithProjectOrigin } from '../../Stammbäume/assets/js/modules/family-sync/project-origin-reconciliation.js';
import { glynmorChandleryRegistration } from '../modules/glynmor/glynmor-chandlery-module.mjs';

const root = new URL('../../', import.meta.url);
const read = path => readFile(new URL(path, root));
const json = async path => JSON.parse((await read(path)).toString().replace(/^\uFEFF/, ''));
const hash = buffer => createHash('sha256').update(buffer).digest('hex');
const sources = 'Stammbäume/assets/data/source-inventories/glynmor-20261122';
const [record] = FAMILY_REGISTRY.filter(row => row.id === GLYNMOR_FAMILY_ID);

test('Glynmor keeps the original family graph and upgrades the existing published version in place', async () => {
  const { family: before } = await json(`${sources}/originals/published-glynmor-rev1.json`);
  const { family: current } = record;
  assert.deepEqual(record.folderPath, GLYNMOR_FAMILY_PATH);
  assert.equal(record.houseProfile.liegeHouseId, 'house-draig');
  assert.equal(FAMILY_REGISTRY.filter(row => row.id === GLYNMOR_FAMILY_ID).length, 1);
  assert.deepEqual(current.persons.map(person => [person.id, person.worldPersonId]), before.persons.map(person => [person.id, person.worldPersonId]));
  assert.deepEqual(current.parentages, before.parentages);
  assert.deepEqual(current.timeJumps, before.timeJumps);
  assert.equal(current.partnerships.find(relation => relation.id === 'partnership-a99a2fa6').status, 'widowed');
  assert.equal(current.extensions.houseBiographyModule.pageTitle, 'Familie Glynmor');

  before.persons.find(person => person.id === GLYNMOR_TUDUR.personId).notes = 'Private Familiennotiz';
  const localPortrait = before.persons.find(person => person.id === GLYNMOR_MEERA.personId);
  localPortrait.portrait = 'assets/images/custom-meera.png';
  const upgraded = reconcileFamilyWithProjectOrigin({ family: before, projectOriginFamily: current });
  assert.equal(upgraded.upgraded, true);
  assert.equal(upgraded.family.extensions.sourceRevision, 2);
  assert.equal(upgraded.family.document.emblem, GLYNMOR_EMBLEM);
  assert.equal(upgraded.family.houses[0].emblem, GLYNMOR_EMBLEM);
  assert.equal(upgraded.family.persons.find(person => person.id === GLYNMOR_TUDUR.personId).notes, 'Private Familiennotiz');
  assert.equal(upgraded.family.persons.find(person => person.id === GLYNMOR_MEERA.personId).portrait, localPortrait.portrait);
  assert.equal(upgraded.family.persons.filter(person => person.extensions?.biographyModule).length, 21);
  assertValidFamily(upgraded.family);
  assert.equal(reconcileFamilyWithProjectOrigin({ family: upgraded.family, projectOriginFamily: current }).upgraded, false);
});

test('only the 21 named people enter the Gwynthor character register and Meera retains her character ID', async () => {
  const snapshot = await json('CharakterDatenbank/generated/characters.snapshot.json');
  const ids = new Set(record.family.persons.filter(person => person.extensions.biographyModule).map(person => person.worldPersonId));
  const glynmors = snapshot.characters.filter(person => person.genealogy?.sources?.some(source => source.familyId === GLYNMOR_FAMILY_ID));
  assert.equal(glynmors.length, 21);
  assert.deepEqual(new Set(glynmors.map(person => person.identity.worldPersonId)), ids);
  assert.equal(glynmors.filter(person => person.portrait).length, 11);
  const meera = glynmors.find(person => person.id === GLYNMOR_MEERA.characterId);
  assert.equal(meera.identity.worldPersonId, 'person--glynmor--person-d665a54d');
  assert.equal(meera.currentLocation, 'Castell Wyrm');
  assert.equal(meera.genealogy.birth, '1715');
  assert.equal(meera.genealogy.sex, 'female');
  assert.ok(meera.biography.biography.biographyText.includes('persönliche Zofe'));
  assert.equal(meera.biography.biography.abilities.length, 8);
  assert.ok(meera.biography.biography.abilities.every(ability => ability.icon !== '*'));
  assert.ok(glynmors.some(person => person.name === 'Iestyn Glynmor' && person.status === 'dead'));
});

test('the chandlery is a native Gwynthor-Stadt module with unique sessions and a complete original art inventory', async () => {
  const { entry, path, icon } = glynmorChandleryRegistration(record.family);
  const packagePath = 'Charakter Archiv Exporte/Module/Kerzenmacherei Glynmor/gwynthor-kerzenmacherei-glynmor-2026-11-22.json';
  const published = await json('Stammbäume/assets/data/published-families/glynmor.json');
  assert.equal(published.revision, 2);
  assert.equal(published.family.extensions.sourceRevision, 2);
  const modulePackage = await json(packagePath);
  assert.deepEqual(modulePackage.module.entry, JSON.parse(JSON.stringify(entry)));
  assert.equal(modulePackage.module.section.key, entry.title);
  assert.equal(path.at(-2), 'Gwynthor-Stadt');
  assert.equal(entry.id, GLYNMOR_MODULE_ID);
  assert.equal(entry.pages.length, 8);
  assert.equal(new Set(entry.pages.map(page => page.commentThreadKey)).size, entry.pages.length);
  const scenes = entry.pages.filter(page => page.sessionPage);
  assert.equal(scenes.length, 5);
  assert.equal(new Set(scenes.map(page => page.image)).size, scenes.length);
  assert.deepEqual(scenes.find(page => page.commentThreadKey === 'glynmor-zierkammer').sessionCast, [
    GLYNMOR_TUDUR.characterId, GLYNMOR_MEERA.characterId
  ]);
  const services = entry.pages.find(page => page.guildServicesPage).guildServices.services;
  const trees = entry.pages.find(page => page.hierarchyPage).hierarchy.trees;
  assert.equal(services.length, 5);
  assert.equal(trees.filter(tree => tree.parentTreeId === 'leitung').length, 4);
  const roles = trees.flatMap(tree => tree.levels.flatMap(level => level.nodes));
  assert.equal(roles.length, 7);
  const art = await json('AleriaAlmanach/assets/glynmor/manifest.json');
  const expectedPaths = [icon, ...scenes.map(page => page.image), ...services.map(service => service.icon),
    ...roles.filter(role => role.portrait.includes('/roles/')).map(role => role.portrait)]
    .map(path => path.replace(/^\.\//, 'AleriaAlmanach/')).sort();
  assert.deepEqual(art.images.map(row => row.path).sort(), expectedPaths);
  for (const item of art.images) {
    assert.equal(hash(await read(item.path)), item.sha256);
    assert.equal(hash(await read(item.original)), item.originalSha256);
  }
  const crest = await json(`${sources}/crest-alpha.json`);
  assert.deepEqual(crest.alphaValues, [0, 255]);
  assert.equal(crest.rgbUnchanged, true);
  assert.equal(hash(await read(crest.file)), crest.activeSha256);
  assert.equal(hash(await read(crest.original)), crest.originalSha256);
  for (const image of Object.values(await json(`${sources}/portrait-sources.json`))) {
    assert.equal(hash(await read(image.active)), image.sha256);
    assert.equal(hash(await read(image.original)), image.sha256);
  }
});
