// Presentation only: personal artwork follows both a stable ability and its
// documented owner. A shared display name never transfers another person's face.
const ROOT = '/AleriaAlmanach/public/assets/ability-icons';
const personal = Object.freeze([
  { abilityId: 'freya-arkaner-schrei', owner: 'freya', asset: 'freya-arkaner-schrei',
    abilityName: 'Arkaner Schrei',
    ids: ['ksJQe8Ai4KbRE9jOAvb7', 'person--haus-skald--freya-skald'], name: 'Freya Skald' },
  { abilityId: 'gildas-gewissenhafte-vorbereitung', owner: 'gildas', asset: 'gildas-gewissenhafte-vorbereitung',
    abilityName: 'Gewissenhafte Vorbereitung',
    ids: ['gildas-gafyr', 'person--haus-gafyr--gildas-gafyr'], name: 'Gildas Gafyr' },
  { abilityId: 'gildas-schutzpflicht', owner: 'gildas', asset: 'gildas-schutzpflicht',
    abilityName: 'Schutzpflicht',
    ids: ['gildas-gafyr', 'person--haus-gafyr--gildas-gafyr'], name: 'Gildas Gafyr' },
  { abilityId: 'gawain-liebt-duefte', owner: 'gawain', asset: 'gawain-liebt-duefte',
    abilityName: 'Liebt Düfte',
    ids: ['q1QtSIug74FzzwUAqWrs', 'person--haus-draig--gawain-draig'], name: 'Gawain Draig' },
  { abilityId: 'gawain-draig-draig-knight-signet', owner: 'gawain', asset: 'gawain-draig-rittersiegelring',
    abilityName: 'Draig-Rittersiegelring',
    ids: ['q1QtSIug74FzzwUAqWrs', 'person--haus-draig--gawain-draig'], name: 'Gawain Draig' },
  { abilityId: 'wolfshorn-asgeir-border-veteran', owner: 'asgeir', asset: 'asgeir-grenzer-des-dunkelhains',
    abilityName: 'Grenzer des Dunkelhains',
    ids: ['oUlhJyX6C4Q69mtLS9u1', 'person--haus-wolfshorn--asgeir-wolfshorn'], name: 'Asgeir Wolfshorn' },
  { abilityId: 'wolfshorn-ylva-border-veteran', owner: 'ylva', asset: 'ylva-veteranin-des-dunkelhains',
    abilityName: 'Veteranin des Dunkelhains',
    ids: ['bSYZYAEOwiRgy44f6OmO', 'person--haus-wolfshorn--ylva-wolfshorn'], name: 'Ylva Wolfshorn' }
]);
const shared = Object.freeze([
  { asset: 'durchschnaufen', ids: ['martial-durchschnaufen'], names: ['Durchschnaufen'] },
  { asset: 'berserkergang', ids: ['fenrir-berserkergang', 'asgeir-berserkergang', 'aldrimar-skjaldr-berserkergang'],
    names: ['Berserkergang', 'Berserkergang · Entfesselter Zorn', 'Berserkergang · Alter Zorn'] },
  { asset: 'tierbegleiter', ids: ['starter-serf-animal-companion', 'starter-skytte-animal-companion'], names: ['Tierbegleiter'] },
  { asset: 'vogelbegleiter', ids: ['starter-ceidwynr-bird-companion'], names: ['Vogelbegleiter'] }
]);

const normalized = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, ' ').trim();
const ownersById = new Map(personal.flatMap(entry => entry.ids.map(id => [id, entry.owner])));
const ownersByName = new Map(personal.map(entry => [normalized(entry.name), entry.owner]));
const abilityIds = item => [item.catalogAbilityId, item.sourceAbilityId, item.id].map(id => String(id || '').trim()).filter(Boolean);
const assetPath = asset => `${ROOT}/${asset}.png`;
const legacyUuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

function ownerKeys(item, context) {
  const keys = new Set();
  const add = (id, name) => {
    const idKey = String(id || '').trim();
    const nameKey = normalized(name);
    const knownId = ownersById.get(idKey);
    const knownName = ownersByName.get(nameKey);
    if (knownId) keys.add(knownId);
    if (knownName) keys.add(knownName);
    if (!knownId && !knownName && (idKey || nameKey)) keys.add(`unknown:${idKey || nameKey}`);
  };
  const collect = value => {
    if (!value || typeof value !== 'object') return;
    add(value.ownerCharacterId, value.ownerCharacterName);
    add(value.sourceCharacterId, value.sourceCharacter);
    add(value.characterId, value.characterName);
  };
  collect(item);
  collect(context);
  add(context?.id, context?.name);
  add(context?.worldPersonId, context?.character?.name);
  if (context?.character) { collect(context.character); add(context.character.id, context.character.name); }
  for (const source of Array.isArray(context?.sources) ? context.sources : []) {
    if (['character', 'creature', 'character-library'].includes(source.kind)) add(source.id, source.name);
  }
  return keys;
}

export function getCharacterAbilityIconSource(item = {}, ownerContext = {}) {
  const explicit = String(item.iconOverride || item.icon || '').trim();
  if (explicit) return explicit;
  const ids = abilityIds(item);
  // Old profile copies replaced the authored ID with a UUID before preserving
  // catalogAbilityId. Recognize only the seven exact published names, only for
  // such unlinked UUID copies, and still require one confirmed matching owner.
  const legacyName = !String(item.catalogAbilityId || item.sourceAbilityId || '').trim()
    && legacyUuid.test(String(item.id || '').trim()) ? String(item.name || '').normalize('NFC').trim() : '';
  const own = personal.find(entry => ids.includes(entry.abilityId))
    || (legacyName ? personal.find(entry => entry.abilityName === legacyName) : null);
  if (own) {
    const owners = ownerKeys(item, ownerContext);
    return owners.size === 1 && owners.has(own.owner) ? assetPath(own.asset) : '';
  }
  const name = normalized(item.name);
  const common = shared.find(entry => entry.ids.some(id => ids.includes(id)) || entry.names.some(alias => normalized(alias) === name));
  return common ? assetPath(common.asset) : '';
}

export function getArchiveAbilityIconSource(entry = {}) {
  const data = entry.data && typeof entry.data === 'object' ? entry.data : {};
  const explicit = String(entry.iconOverride || entry.icon || data.icon || '').trim();
  if (explicit) return explicit;
  return getCharacterAbilityIconSource({ name: entry.name, ...data }, { sources: entry.sources || [] });
}

export const ABILITY_ICON_ASSETS = Object.freeze([...personal.map(entry => entry.asset), ...shared.map(entry => entry.asset)]);
