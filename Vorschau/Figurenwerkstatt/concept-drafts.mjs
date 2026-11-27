import { CONCEPT_TYPES, conceptTitle } from './concept-schema.mjs';
import { canConfirmDecision } from './concept-decisions.mjs';
import { MEDIA_FORMATS, safeConceptUrl } from './concept-media.mjs';

export const CONCEPT_FORMAT = 'aleria.preparation.concepts';
export const CONCEPT_VERSION = 3;

const ID = /^[\w.:-]{1,180}$/;
const isObject = value => Boolean(value && typeof value === 'object' && !Array.isArray(value));
export const isConceptId = value => typeof value === 'string' && ID.test(value);
const invalid = () => new Error('Die Datei enthält ungültige Entwurfsdaten.');

export function fieldLimit(field) {
  return { prose: 12000, link: 2048 }[field.type] || 240;
}

function text(value, limit) {
  if (typeof value !== 'string' || value.length > limit) throw invalid();
  return value;
}

function readReference(value) {
  if (!isObject(value) || !['character', 'house', 'draft'].includes(value.type) || !isConceptId(value.id)) throw invalid();
  const result = { type: value.type, id: value.id, name: text(value.name, 240) };
  if (value.page !== undefined) {
    if (value.type !== 'house' || !['house', 'small-house'].includes(value.page)) throw invalid();
    result.page = value.page;
  }
  return result;
}

function readIcon(value) {
  if (!isObject(value)) throw invalid();
  return { name: text(value.name, 240), src: text(value.src, 2048) };
}

function readFields(input, definitions, allowedKeys = []) {
  const fields = {};
  for (const key of Object.keys(input)) {
    if (!allowedKeys.includes(key) && !definitions.some(field => field.id === key)) throw invalid();
  }
  for (const field of definitions) {
    if (!Object.hasOwn(input, field.id)) continue;
    const value = input[field.id];
    if (field.type === 'icon') fields[field.id] = value === null ? null : readIcon(value);
    else if (field.type === 'reference') fields[field.id] = value === null ? null : readReference(value);
    else {
      fields[field.id] = text(value, fieldLimit(field));
      if (field.options && value !== '' && !Object.hasOwn(field.options, value)) throw invalid();
    }
  }
  return fields;
}

function readRows(input, type, listId) {
  const list = type.lists[listId];
  if (!Array.isArray(input)) throw invalid();
  const definitions = list.fields.flatMap(field => field.type === 'reference'
    ? [field, { id: 'name' }]
    : [field]);
  const rows = new Map();
  const metadata = { relations: ['category'], decisions: ['status'] }[listId] || [];
  for (const row of input) {
    if (!isObject(row) || !isConceptId(row.id) || rows.has(row.id) || (list.fixed && !list.fixed.includes(row.id))) throw invalid();
    const fields = readFields(row, definitions, ['id', ...metadata]);
    if (listId === 'relations') {
      if (!Object.hasOwn(type.relationGroups, row.category)) throw invalid();
      fields.category = row.category;
    }
    if (listId === 'decisions' && row.status !== undefined) {
      if (!['open', 'confirmed'].includes(row.status) || (row.status === 'confirmed' && !canConfirmDecision(fields))) throw invalid();
      fields.status = row.status;
    }
    rows.set(row.id, { id: row.id, ...fields });
  }
  if (!list.fixed) return [...rows.values()];
  const defaults = list.initialFormat ? { format: list.initialFormat } : {};
  return list.fixed.map(id => rows.get(id) || { id, ...defaults });
}

function readMainImage(image, variants) {
  if (image == null) return null;
  if (!isObject(image) || !variants.includes(image.variantId)) throw invalid();
  const title = text(image.title, 240);
  const url = text(image.url, 2048);
  const format = text(image.format ?? '', 240);
  if (!title.trim() || !safeConceptUrl(url) || (format !== '' && !Object.hasOwn(MEDIA_FORMATS, format))) throw invalid();
  return { variantId: image.variantId, title, url, format };
}

function readDraft(input) {
  if (!isObject(input) || !isConceptId(input.id) || !Object.hasOwn(CONCEPT_TYPES, input.kind)
    || !isObject(input.fields) || !isObject(input.rows) || !Number.isFinite(input.updatedAt)) throw invalid();
  const type = CONCEPT_TYPES[input.kind];
  const definitions = type.tabs.flatMap(tab => tab.groups.flatMap(group => group.fields));
  const fields = { stage: 'idea', ...readFields(input.fields, definitions) };
  for (const listId of Object.keys(input.rows)) {
    if (!Object.hasOwn(type.lists, listId)) throw invalid();
  }
  const rows = Object.fromEntries(Object.keys(type.lists).map(id => [id, readRows(input.rows[id] ?? [], type, id)]));
  const favorite = input.favorite ?? '';
  if (favorite !== '' && !type.lists.images.fixed.includes(favorite)) throw invalid();
  const mainImage = readMainImage(input.mainImage, type.lists.images.fixed);
  return { id: input.id, kind: input.kind, fields, rows, favorite, mainImage, updatedAt: input.updatedAt };
}

export function createConcept(kind, id = crypto.randomUUID(), now = Date.now()) {
  return readDraft({ id, kind, fields: {}, rows: {}, updatedAt: now });
}

export function encodeConcepts(drafts, { pretty = false } = {}) {
  return JSON.stringify({ schema: CONCEPT_FORMAT, version: CONCEPT_VERSION, drafts }, null, pretty ? 2 : 0);
}

export function decodeConcepts(json) {
  let data;
  try { data = JSON.parse(json); }
  catch { throw new Error('Die Datei ist kein lesbares JSON.'); }
  if (data?.schema !== CONCEPT_FORMAT || ![1, 2, CONCEPT_VERSION].includes(data.version) || !Array.isArray(data.drafts)) {
    throw new Error('Die Datei stammt aus einer anderen Werkstatt oder verwendet eine unbekannte Version.');
  }
  const drafts = data.drafts.map(readDraft);
  if (new Set(drafts.map(draft => draft.id)).size !== drafts.length) throw invalid();
  return drafts;
}

function mapReferences(draft, transform) {
  const rows = Object.fromEntries(Object.entries(draft.rows).map(([listId, entries]) => [
    listId, entries.map(row => row.target?.type === 'draft' ? { ...row, target: transform(row.target) } : row)
  ]));
  return { ...draft, rows };
}

export function conceptsForExport(drafts, selectedId = '') {
  const byId = new Map(drafts.map(draft => [draft.id, draft]));
  return drafts.filter(draft => !selectedId || draft.id === selectedId).map(draft => mapReferences(draft, target => {
    const linked = byId.get(target.id);
    return linked ? { ...target, name: conceptTitle(linked) } : target;
  }));
}

export function mergeConcepts(current, incoming, createId = () => crypto.randomUUID(), now = Date.now()) {
  const present = new Set(current.map(draft => draft.id));
  const allocated = new Set([...present, ...incoming.map(draft => draft.id)]);
  const remapped = new Map();
  for (const draft of incoming) {
    if (!present.has(draft.id)) continue;
    let id = createId();
    while (allocated.has(id)) id = createId();
    allocated.add(id);
    remapped.set(draft.id, id);
  }
  const added = incoming.map(draft => mapReferences({
    ...draft, id: remapped.get(draft.id) ?? draft.id, updatedAt: now
  }, target => remapped.has(target.id) ? { ...target, id: remapped.get(target.id) } : target));
  return { drafts: [...current, ...added], added };
}

export function deleteConcept(drafts, id) {
  const removed = drafts.find(draft => draft.id === id);
  if (!removed) return drafts;
  return drafts.filter(draft => draft.id !== id).map(draft => mapReferences(draft, target => (
    target.id === id ? { ...target, name: conceptTitle(removed) } : target
  )));
}
