import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readCollections } from './collection-repository.mjs';
import { validateEntryLore, validateLoreBlocks } from '../lore/lore-validation.mjs';
import { validateArtifacts } from '../profiles/profile-artifacts-validation.mjs';
import { validateTradition, traditionImagePaths, traditionSearchTerms } from '../traditions/tradition-repository.mjs';

export const RELIGION_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const WORKSPACE_ROOT = resolve(RELIGION_ROOT, '..');
const ID = /^[a-z][a-z0-9-]*$/;

function requireText(value, context) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Text fehlt: ${context}`);
}

export function validateLocalPath(value) {
  requireText(value, 'Pfad');
  if (/^[/.]|[\\?#:%]/.test(value) || value.split('/').some(part => !part || part === '..' || part === '.')) {
    throw new Error(`Ungültiger lokaler Pfad: ${value}`);
  }
  return value;
}

function requireFile(path, root = WORKSPACE_ROOT) {
  validateLocalPath(path);
  if (!existsSync(resolve(root, path))) throw new Error(`Datei fehlt: ${path}`);
}

export function validateCatalog(catalog) {
  const ids = new Set();
  const allEntryIds = new Set([...catalog.entries, ...(catalog.records || [])].map(entry=>entry.id));
  const chapterIds = new Set();
  for (const [id, lore] of Object.entries(catalog.sharedLore || {})) {
    requireText(lore.title, id);
    validateLoreBlocks(lore.blocks, id);
  }
  for (const chapter of catalog.chapters) {
    if (!ID.test(chapter.id) || chapterIds.has(chapter.id)) throw new Error(`Ungültiges oder doppeltes Kapitel: ${chapter.id}`);
    chapterIds.add(chapter.id);
    for (const field of ['title', 'label', 'number', 'intro']) requireText(chapter[field], `${chapter.id}.${field}`);
  }
  for (const entry of catalog.entries) {
    if (!ID.test(entry.id) || ids.has(entry.id)) throw new Error(`Ungültige oder doppelte Eintrags-ID: ${entry.id}`);
    ids.add(entry.id);
    for (const field of ['title', 'kind', 'summary', 'symbol']) requireText(entry[field], `${entry.id}.${field}`);
    if (!chapterIds.has(entry.chapterId)) throw new Error(`Kapitel fehlt: ${entry.id}`);
    if (Boolean(entry.page) === Boolean(entry.canonicalHref)) throw new Error(`Genau ein Seitenziel erforderlich: ${entry.id}`);
    validateLocalPath(entry.sourcePath);
    validateLocalPath(entry.symbol);
    if (entry.portrait) {
      validateLocalPath(entry.portrait.src);
      requireText(entry.portrait.alt, `${entry.id}.portrait.alt`);
      requireText(entry.portrait.caption, `${entry.id}.portrait.caption`);
      if (![entry.portrait.width, entry.portrait.height].every(value => Number.isInteger(value) && value > 0)) throw new Error(`Ungültige Bildmaße: ${entry.id}`);
    }
    if (entry.symbolRoot !== undefined && entry.symbolRoot !== 'workspace') throw new Error(`Ungültige Symbolwurzel: ${entry.id}`);
    if (entry.canonicalHref) validateLocalPath(entry.canonicalHref);
    for (const field of ['tags', 'relations', 'sections']) {
      if (!Array.isArray(entry[field])) throw new Error(`Liste fehlt: ${entry.id}.${field}`);
    }
    entry.tags.forEach(tag => requireText(tag, `${entry.id}.tags`));
    const sectionIds = new Set(['verbindungen', 'weiterlesen', 'ueberlieferung', 'namen', 'goetterkreis', 'geistlichkeit']);
    for (const section of entry.sections) {
      if (!ID.test(section.id) || sectionIds.has(section.id)) throw new Error(`Ungültiger Abschnitt: ${entry.id}.${section.id}`);
      sectionIds.add(section.id);
      requireText(section.title, `${entry.id}.sections.title`);
    }
    validateEntryLore(entry, catalog.sharedLore);
    if (entry.traditionSource !== undefined) {
      validateLocalPath(entry.traditionSource);
      if (!entry.page || entry.collectionId) throw new Error(`Ungültiger Glaubensartikel: ${entry.id}`);
      validateTradition(entry.tradition, {requireText,validateLocalPath,entryIds:allEntryIds,context:entry.id});
    }
    validateArtifacts(entry.artifacts, { requireText, validateLocalPath, context: entry.id });
    if (entry.artifacts && entry.sections.some(section => section.id === 'artefakte')) throw new Error(`Doppelte Artefaktquelle: ${entry.id}`);
    for (const link of entry.links || []) {
      requireText(link.label, `${entry.id}.links.label`);
      validateLocalPath(link.href);
    }
  }
  for (const entry of catalog.entries) {
    if (new Set(entry.relations).size !== entry.relations.length) throw new Error(`Doppelte Beziehung: ${entry.id}`);
    for (const id of entry.relations) {
      if (!ids.has(id) || id === entry.id) throw new Error(`Ungültige Beziehung: ${entry.id} → ${id}`);
    }
  }
  const paths = new Set(['Religionen/index.html', ...catalog.entries.filter(entry => entry.page).map(entryPagePath)]);
  for (const entry of catalog.entries) {
    if (entry.aliases !== undefined && (!entry.page || !Array.isArray(entry.aliases))) throw new Error(`Ungültige Weiterleitungen: ${entry.id}`);
    for (const alias of entry.aliases || []) {
      validateLocalPath(alias);
      if (!alias.startsWith('Religionen/') || !alias.endsWith('/index.html') || paths.has(alias)) throw new Error(`Kollidierende Weiterleitung: ${alias}`);
      paths.add(alias);
    }
  }
  for (const collection of catalog.collections || []) {
    for (const id of collection.doctrineIds || []) if (!Object.hasOwn(catalog.sharedLore, id)) throw new Error(`Sammlungslehre fehlt: ${collection.id}.${id}`);
    for (const id of collection.readingEntryIds || []) if (!ids.has(id)) throw new Error(`Sammlungsverweis fehlt: ${collection.id}.${id}`);
  }
  return catalog;
}

export function readReligionCatalog() {
  const readJson = path => {
    validateLocalPath(path);
    return JSON.parse(readFileSync(resolve(RELIGION_ROOT, path), 'utf8'));
  };
  const register = readJson('data/register.json');
  const rootEntries = register.chapters.flatMap(chapter => chapter.entries.map(sourcePath => {
    validateLocalPath(sourcePath);
    const entry = readJson(sourcePath);
    return { ...entry, sourcePath, chapterId: chapter.id };
  }));
  const nested = readCollections(register.collections || [], readJson, rootEntries);
  const entries = [...rootEntries, ...nested.entries];
  for (const entry of entries) if (entry.traditionSource) entry.tradition = readJson(entry.traditionSource);
  const sharedLore = register.sharedLoreSource ? readJson(register.sharedLoreSource) : {};
  const catalog = validateCatalog({ ...register, entries, records: nested.records, collections: nested.collections, sharedLore });
  for (const entry of [...entries, ...nested.records]) {
    requireFile(entrySymbolPath(entry));
    if (entry.portrait) requireFile(entry.portrait.src, RELIGION_ROOT);
    if (entry.canonicalHref) requireFile(entry.canonicalHref);
    for (const link of entry.links || []) requireFile(link.href);
    for (const artifact of entry.artifacts?.entries || []) if (artifact.image) requireFile(artifact.image.src, RELIGION_ROOT);
    for (const imagePath of traditionImagePaths(entry.tradition)) requireFile(imagePath, RELIGION_ROOT);
    if (entry.recordOnly && entry.portrait && ![entry.portrait.width, entry.portrait.height].every(value => Number.isInteger(value) && value > 0)) throw new Error(`Ungültige Registerbildmaße: ${entry.id}`);
  }
  return catalog;
}

export function entryPagePath(entry) {
  return entry.canonicalHref || `Religionen/${posix.dirname(entry.sourcePath)}/index.html`;
}

export function entrySymbolPath(entry) {
  return entry.symbolRoot === 'workspace' ? entry.symbol : `Religionen/${entry.symbol}`;
}

export function entrySearchText(entry) {
  return [entry.title, entry.epithet || '', entry.kind, entry.summary, ...entry.tags,
    ...(entry.names || []).map(name => name.value), ...(entry.searchAliases || []), ...traditionSearchTerms(entry.tradition)].join(' ');
}

export function relatedEntries(catalog, entry) {
  return catalog.entries.filter(candidate => candidate.id !== entry.id
    && (entry.relations.includes(candidate.id) || candidate.relations.includes(entry.id)));
}

export function getReligionPageInputs() {
  const catalog = readReligionCatalog();
  return Object.fromEntries([
    ['religions', resolve(RELIGION_ROOT, 'index.html')],
    ...catalog.entries.filter(entry => entry.page).map(entry => [
      `religion-${entry.id}`, resolve(WORKSPACE_ROOT, entryPagePath(entry))
    ]),
    ...catalog.entries.flatMap(entry => (entry.aliases || []).map((alias, index) => [`religion-${entry.id}-alias-${index}`, resolve(WORKSPACE_ROOT, alias)]))
  ]);
}
