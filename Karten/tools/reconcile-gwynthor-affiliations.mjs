import { readFile, writeFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { getRegisteredFamily } from '../../Stammbäume/assets/js/data/families.registry.js';

const root = new URL('../../', import.meta.url);
const directory = new URL('../Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/', import.meta.url);
const dataUrl = new URL('data.json', directory);
const original = JSON.parse(await readFile(dataUrl, 'utf8'));
const data = structuredClone(original), state = data.state;
const oldReview = JSON.parse(await readFile(new URL('house-seat-sources.json', directory), 'utf8'));
const mapping = new Map(oldReview.pins.map(pin => [pin.pinId, pin.houseId]));
for (const pair of [
  ['muoru8isnrnm', 'haus-arwydd'], ['muosoo81765w', 'haus-tlawd'],
  ['gwynthor-marking-003', 'haus-bradrhith'], ['gwynthor-marking-041', 'haus-penrudd'],
  ['gwynthor-marking-048', 'haus-draig'], ['gwynthor-marking-080', 'haus-penrudd'],
  ['gwynthor-marking-141', 'haus-draig'], ['gwynthor-marking-138', 'haus-twyllod']
]) mapping.set(...pair);

const houseWindow = {};
runInNewContext(await readFile(new URL('Familien Häuser und Clans/haeuser.registry.js', root), 'utf8'), {window:houseWindow});
const normalizeId = id => String(id || '').replace(/^house-/, 'haus-');
const byFamily = new Map([
  ['haus-draig', 'msa3c53vo1h89v'], ['haus-gafyr', 'msa3c53vomlanj'],
  ['haus-wyrm', 'msa3c53viyll7z'], ['haus-saethwyr', 'msa3c53vz3k80p'],
  ...state.dominions.filter(node => node.id.startsWith('cw-haus-')).map(node => [node.id.slice(3), node.id])
]);

for (const familyId of ['haus-bradrhith', 'haus-penrudd']) {
  const record = getRegisteredFamily(familyId);
  const id = `cw-${familyId}`;
  byFamily.set(familyId, id);
  if (!state.dominions.some(node => node.id === id)) state.dominions.push({
    id, name: record.title, type: 'Bürgerliches Haus', ruler: record.title,
    seat: record.houseProfile.seat, parentId: '',
    note: familyId === 'haus-bradrhith'
      ? 'Hof unter der Aufsicht des Hauses Awenydd; die familiäre Nachfolge ist ungeklärt.'
      : 'Wirts- und Bauernfamilie im Dienst der Draigs; der Grundeigentümer des Hofes ist nicht festgelegt.'
  });
}

// House membership and local geography are separate: an Arwydd tower in
// Gwynthor does not move to the family's main seat on Rhonwens Tränen.
for (const [familyId, nodeId] of byFamily) {
  const family = getRegisteredFamily(familyId);
  const node = state.dominions.find(node => node.id === nodeId);
  if (!family || !node) continue;
  node.ruler = family.title;
  if (nodeId.startsWith('cw-haus-')) {
    node.name = family.title;
    node.seat = [family.houseProfile.seat, ...family.houseProfile.secondarySeats].filter(Boolean).join(', ');
  }
  const parent = byFamily.get(normalizeId(family.houseProfile.liegeHouseId));
  if (parent && parent !== node.id) node.parentId = parent;
}

const reviewed = [];
for (const pin of state.pins) {
  if (pin.region || pin.house) pin.region = 'Bannkreis Gwynthor · Llamreis Ankunft · Celtigerns Wacht';
  const familyId = mapping.get(pin.id);
  if (!familyId) continue;
  const record = getRegisteredFamily(familyId);
  if (!record) throw Error(`Missing existing house: ${familyId}`);
  const profile = record.houseProfile;
  if (!['gwynthor-marking-048', 'gwynthor-marking-141'].includes(pin.id)) pin.house = record.title;
  pin.crest = `/Stammbäume/${record.family.document.emblem}`;
  const housePage = houseWindow.HaeuserRegistry.byId(familyId);
  pin.crestLink = housePage
    ? `/Familien Häuser und Clans/${houseWindow.HaeuserRegistry.linkFor(familyId)}`
    : `/Stammbäume/${record.link}`;
  pin.banner = '/Stammbäume/assets/images/regions/llamreis-ankunft.png';
  const ownNode = byFamily.get(familyId);
  if (ownNode) pin.dominionId = ownNode;
  reviewed.push({ pinId:pin.id, familyId, familyName:record.title,
    liegeHouseId:normalizeId(profile.liegeHouseId), dominionId:pin.dominionId || '',
    source:'Stammbäume/assets/js/data/families.registry.js', houseProfile:profile,
    note: familyId === 'haus-arwydd' ? 'Örtliches Unterstellungsverhältnis des Turms nicht belegt; keine neue Herrschaftszuordnung erfunden.' : '' });
}

const changed = JSON.stringify(state) !== JSON.stringify(original.state);
if (process.argv.includes('--check') && changed) throw Error('Gwynthor house affiliations differ from their existing house sources');
if (changed) {
  data.revision += 1; data.updatedAt = new Date().toISOString();
  await writeFile(dataUrl, JSON.stringify(data, null, 2)+'\n');
  await writeFile(new URL('house-affiliation-review.json', directory), JSON.stringify({
    schemaVersion:1, reviewedAt:data.updatedAt, dataRevision:data.revision,
    policy:'Existing house records only; preserve pin IDs and positions. Distinguish family allegiance, local geography and land ownership. Unregistered families keep their existing proven local affiliation.',
    sources:['house-seat-sources.json','Stammbäume/assets/js/data/families.registry.js','Familien Häuser und Clans/haeuser.registry.js'],
    pins:reviewed,
    unreconciledFamilies:state.pins.filter(pin => pin.house && !mapping.has(pin.id)).map(pin => ({pinId:pin.id,house:pin.house,reason:'Keine eigenständige Familienakte gefunden; vorhandene Zuordnung erhalten.'}))
  },null,2)+'\n');
}
console.log(JSON.stringify({reviewed:reviewed.length,changed,revision:data.revision}));
