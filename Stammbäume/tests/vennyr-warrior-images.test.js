import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { getRegisteredFamily } from '../assets/js/data/families.registry.js';
import { VENNYR_WARRIOR_BIOGRAPHY_DEFAULTS } from '../assets/js/data/vennyr-warrior-biography-defaults.js';
import { normalizeFamily } from '../assets/js/domain/family-schema.js';
import { getHouseRank } from '../assets/js/domain/house-profile.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';
import { houseBiographyDefaultFingerprint } from '../assets/js/modules/house-biography/house-biography-fingerprint.js';
import { withHouseBiographyDefault } from '../assets/js/modules/house-biography/house-biography-registry-default.js';

const root = new URL('../../', import.meta.url);
const treeRoot = new URL('../', import.meta.url);
const readJson = url => JSON.parse(readFileSync(url, 'utf8'));
// Only these already public records are fixtures; no generated aggregate tree export.
const before = readJson(new URL('diagnostics/vennyr-warrior-import-20261103/before.json', root));
const baselineById = new Map(before.map(record => [record.id, record]));
const existingBioIds = ['haus-caerdyn', 'haus-drewi', 'haus-gwanrhyd', 'haus-bochdew',
  'haus-udgorn', 'haus-balauric', 'haus-morgryn', 'haus-gwenyen', 'haus-crwynog'];
const newBioIds = ['haus-blodyn', 'haus-trachwyll'];
const targetIds = [...existingBioIds, ...newBioIds];
const controlIds = ['haus-trachwyll-talfronwyn', 'haus-blodyn-talgarth', 'haus-blodyn-aberdail'];
const graphKeys = ['persons', 'partnerships', 'parentages', 'houses', 'timeJumps', 'cadetBranches'];
const graph = family => Object.fromEntries(graphKeys.map(key => [key, family[key]]));
const normalizedGraph = family => Object.fromEntries(graphKeys.map(key => [key,
  family[key].map(entity => ({ ...entity, extensions: entity.extensions || {} }))]));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const imagePath = id => `assets/images/references/${id}/krieger.png`;
const withoutImage = ({ image, ...biography }) => biography;
const registered = id => {
  const record = getRegisteredFamily(id);
  assert.ok(record, id);
  return record;
};
const editLocalPerson = family => {
  if (!family.persons.length) return;
  family.persons[0].name = 'Eigener unveränderter Name';
  family.persons[0].title = 'Eigener unveränderter Titel';
  family.persons[0].notes = 'Eigene unveränderte Personennotiz';
};

test('elf gezielte Bilddefaults erhöhen ausschließlich ihre bestehenden Akten um eine Quellenrevision', () => {
  assert.equal(before.length, 14);
  assert.deepEqual(before.map(record => record.id).sort(), [...targetIds, ...controlIds].sort());
  assert.deepEqual(Object.keys(VENNYR_WARRIOR_BIOGRAPHY_DEFAULTS).sort(), [...targetIds].sort());
  for (const id of targetIds) {
    const baseline = baselineById.get(id), entry = VENNYR_WARRIOR_BIOGRAPHY_DEFAULTS[id];
    const family = registered(id).family;
    assert.equal(entry.sourceRevision, baseline.sourceRevision + 1, id);
    assert.equal(family.extensions.sourceRevision, baseline.sourceRevision + 1, id);
    assert.deepEqual(family.extensions.houseBiographyModule, entry.biography, id);
    assert.equal(entry.biography.image, imagePath(id), id);
  }
});

test('alle 14 Graphen, Titel, Profile, Orte und Hauswappen bleiben unverändert', () => {
  for (const baseline of before) {
    const record = registered(baseline.id), family = record.family;
    assert.equal(sha256(JSON.stringify(graph(family))), baseline.graphFingerprint, baseline.id);
    assert.equal(record.title, baseline.title, baseline.id);
    assert.equal(family.document.title, baseline.title, baseline.id);
    assert.deepEqual(record.folderPath, baseline.path, baseline.id);
    assert.deepEqual(record.houseProfile, baseline.houseProfile, baseline.id);
    assert.deepEqual(family.document.houseProfile, baseline.houseProfile, baseline.id);
    const expectedCrest = baseline.biography?.house.crestImage
      || (baseline.id === 'haus-blodyn' ? 'assets/images/houses/Blütenland/haus-blodyn.png'
        : 'assets/images/houses/Aldrimar/Ivarsheim/haus-trachwyll.png');
    assert.equal(new URL(family.document.emblem, treeRoot).href,
      new URL(expectedCrest, treeRoot).href, baseline.id);
  }
  assert.deepEqual(registered('haus-trachwyll').folderPath,
    ['Aldrimar', 'Ivarsheim', 'Ivarsklamm', 'Ivarsfels']);
  assert.deepEqual(registered('haus-trachwyll-talfronwyn').folderPath,
    ['Vennyr', 'Tir Gogledd', 'Talfronwyn']);
});

test('an den neun vorhandenen Bios ändert sich exakt das Hauptbild und kein einziges anderes Feld', () => {
  assert.equal(existingBioIds.length, 9);
  for (const id of existingBioIds) {
    const baseline = baselineById.get(id), biography = registered(id).family.extensions.houseBiographyModule;
    assert.ok(baseline.biography, id);
    assert.notEqual(biography.image, baseline.biography.image, id);
    assert.deepEqual(withoutImage(biography), withoutImage(baseline.biography), id);
    assert.equal(biography.house.crestImage, baseline.biography.house.crestImage, id);
    assert.equal(biography.image, imagePath(id), id);
    assert.deepEqual(VENNYR_WARRIOR_BIOGRAPHY_DEFAULTS[id].replacedDefaultFingerprints,
      [houseBiographyDefaultFingerprint(baseline.biography)], `${id}: nur der belegte alte Default`);
  }
});

test('Blodyn und die Ivarsfels-Trachwyll erhalten nur eine knappe Bio aus ihrem bestehenden Dokument und Profil', () => {
  for (const id of newBioIds) {
    const family = registered(id).family, biography = family.extensions.houseBiographyModule;
    assert.equal(baselineById.get(id).biography, undefined, id);
    assert.equal(biography.pageTitle, family.document.title, id);
    assert.equal(biography.description, family.document.description, id);
    assert.equal(biography.house.biographyText, family.document.description, id);
    assert.equal(biography.house.crestImage, family.document.emblem, id);
    assert.equal(biography.image, imagePath(id), id);
    for (const [label, value] of biography.stats) {
      const profile = baselineById.get(id).houseProfile;
      if (label === 'Rang') assert.equal(value, getHouseRank(profile.rankId).label, id);
      else assert.ok(value === family.document.title || Object.values(profile).includes(value),
        `${id}: ${label} muss aus dem vorhandenen Profil stammen`);
    }
    for (const key of ['abilities', 'extraSections', 'works', 'trivia', 'quotes', 'connections', 'documents']) {
      assert.deepEqual(biography.house[key], [], `${id}: ${key}`);
    }
    assert.equal(biography.house.historyText, '', id);
    assert.doesNotMatch(JSON.stringify(biography), /Noch festlegen|Erstes bekanntes Ereignis|Ein prägnantes Detail|Verbündetes Haus|Beschreibe Ursprung/iu, id);
  }
  const context = { window: {} };
  vm.runInNewContext(readFileSync(new URL('Familien Häuser und Clans/haeuser.registry.js', root), 'utf8'), context);
  for (const id of targetIds) assert.equal(context.window.HaeuserRegistry.byId(id), null, `${id}: keine neue Hausseite`);
});

test('Talfronwyn und beide Cenyr-Blodyn-Akten bleiben einschließlich Quellenrevision und Bio unverändert', () => {
  for (const id of controlIds) {
    const family = registered(id).family, baseline = baselineById.get(id);
    assert.equal(family.extensions.sourceRevision, baseline.sourceRevision, id);
    assert.deepEqual(family.extensions.houseBiographyModule, baseline.biography, id);
    assert.equal(Object.hasOwn(VENNYR_WARRIOR_BIOGRAPHY_DEFAULTS, id), false, id);
  }
});

test('alle elf lokalen Krieger sind unveränderte Originale mit Quellenbeleg und richtiger Galeriezuordnung', () => {
  const catalog = readJson(new URL('Gallerien/krieger/data/catalog.json', root));
  for (const id of targetIds) {
    const file = new URL(imagePath(id), treeRoot);
    assert.ok(existsSync(file), id);
    const bytes = readFileSync(file), hash = sha256(bytes);
    assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], id);
    const receipt = readJson(new URL(`assets/images/references/${id}/reference-sources.json`, treeRoot));
    const source = receipt.assets.find(asset => asset.role === 'warrior');
    assert.ok(source?.url && source?.sha256, id);
    assert.equal(source.sha256, hash, id);
    assert.match(source.url, /^https:\/\/i\.imgur\.com\/[A-Za-z0-9]+\.png$/, id);
    assert.equal(new URL(source.path, root).href, file.href, id);
    const illustration = catalog.illustrations.find(entry => entry.sha256 === hash);
    assert.ok(illustration?.houseIds.includes(id), id);
    assert.ok(catalog.houses.find(house => house.id === id)?.illustrationIds.includes(illustration.id), id);
    assert.equal(sha256(readFileSync(new URL(illustration.image, root))), hash, id);
  }
  const blodyn = readFileSync(new URL(imagePath('haus-blodyn'), treeRoot));
  assert.equal(sha256(blodyn), '3cd4b1cc77b6bb0f54cb1fc326340fb43aa8630cb7e58b7fce097cf49d225ed1');
  assert.deepEqual(blodyn, readFileSync(new URL(
    'Familien Häuser und Clans/Estryll/Cenyr/Klaueninsel/Sturmklaue/Haus_Blodyn_Talgarth/assets/hausdarstellung-original.png', root)));
  const trachwyll = readJson(new URL('assets/images/references/haus-trachwyll/reference-sources.json', treeRoot));
  assert.equal(trachwyll.assets.find(asset => asset.role === 'warrior').url, 'https://i.imgur.com/WG2uS0O.png');
});

test('exakte alte Defaults und bisher fehlende Bios erhalten die Originalbilder ohne eigene Personenfelder oder Beziehungen zu überschreiben', () => {
  for (const id of targetIds) {
    const current = registered(id).family, baseline = baselineById.get(id), local = structuredClone(current);
    local.extensions.sourceRevision = baseline.sourceRevision;
    if (baseline.biography) local.extensions.houseBiographyModule = structuredClone(baseline.biography);
    else delete local.extensions.houseBiographyModule;
    editLocalPerson(local);
    const expectedGraph = normalizedGraph(normalizeFamily(local));
    const applied = withHouseBiographyDefault(local, VENNYR_WARRIOR_BIOGRAPHY_DEFAULTS);
    assert.deepEqual(applied.extensions.houseBiographyModule, current.extensions.houseBiographyModule, id);
    assert.deepEqual(graph(applied), graph(local), id);
    const upgraded = resolveRegisteredFamilyUpgrade(current, local);
    assert.deepEqual(upgraded.extensions.houseBiographyModule, current.extensions.houseBiographyModule, id);
    assert.deepEqual(normalizedGraph(upgraded), expectedGraph, id);
    assert.deepEqual(resolveRegisteredFamilyUpgrade(current, upgraded), upgraded, `${id}: wiederholungsfest`);
    assert.equal(withHouseBiographyDefault(applied, VENNYR_WARRIOR_BIOGRAPHY_DEFAULTS), applied, id);
  }
});

test('eigene alte Biotexte und bewusst gelöschte Bios bleiben bei allen elf Bildintegrationen erhalten', () => {
  for (const id of targetIds) {
    const current = registered(id).family, baseline = baselineById.get(id);
    const custom = structuredClone(baseline.biography || current.extensions.houseBiographyModule);
    custom.description = 'Eigene Hausbeschreibung';
    custom.house.biographyText = 'Eigener beibehaltener Biotext';
    custom.commentSequence = [{ text: 'Eigene Notiz zur Hausgeschichte' }];
    if (baseline.biography) {
      assert.notEqual(houseBiographyDefaultFingerprint(custom), houseBiographyDefaultFingerprint(baseline.biography), id);
    }
    for (const own of [custom, null]) {
      const local = structuredClone(current);
      local.extensions.sourceRevision = baseline.sourceRevision;
      local.extensions.houseBiographyModule = own;
      editLocalPerson(local);
      const expectedGraph = normalizedGraph(normalizeFamily(local));
      assert.equal(withHouseBiographyDefault(local, VENNYR_WARRIOR_BIOGRAPHY_DEFAULTS), local, id);
      const upgraded = resolveRegisteredFamilyUpgrade(current, local);
      assert.deepEqual(upgraded.extensions.houseBiographyModule, own, id);
      assert.deepEqual(normalizedGraph(upgraded), expectedGraph, id);
      assert.deepEqual(resolveRegisteredFamilyUpgrade(current, upgraded), upgraded, `${id}: eigene Bio wiederholungsfest`);
    }
  }
});
