import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readReligionCatalog, entryPagePath, entrySymbolPath } from '../../../Religionen/modules/content/content-repository.mjs';
import { FACTION_CATEGORIES } from './faction-categories.mjs';

export const FACTION_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const readJson = path => JSON.parse(readFileSync(resolve(FACTION_ROOT, path), 'utf8'));

export function validateFactionCatalog(catalog) {
  const entries = catalog.flatMap(category => category.entries);
  const byId = new Map();
  for (const entry of entries) {
    if (!/^[a-z][a-z0-9-]*$/.test(entry.id) || byId.has(entry.id)) throw new Error(`Ungültige oder doppelte Fraktions-ID: ${entry.id}`);
    if (!entry.name?.trim()) throw new Error(`Fraktionsname fehlt: ${entry.id}`);
    byId.set(entry.id, entry);
  }
  for (const category of catalog) {
    const groups = new Set(category.groups.map(group => group.id));
    if (groups.size !== category.groups.length) throw new Error(`Doppelte Gruppe: ${category.id}`);
    if (category.authorityId && !byId.has(category.authorityId)) throw new Error(`Aufsichtsorgan fehlt: ${category.id}`);
    for (const group of category.groups) {
      if (group.parentId && category.entries.some(entry => entry.groupId === group.id && entry.parentId !== group.parentId)) throw new Error(`Widersprüchliche Gruppenzugehörigkeit: ${group.id}`);
    }
    for (const entry of category.entries) {
      if (!groups.has(entry.groupId)) throw new Error(`Gruppe fehlt: ${entry.id}`);
      if (!entry.symbol) throw new Error(`Wappen fehlt: ${entry.id}`);
      if (entry.status && !['struck', 'unnamed'].includes(entry.status)) throw new Error(`Unbekannter Status: ${entry.id}`);
      const visited = new Set([entry.id]);
      for (let parentId = entry.parentId; parentId; parentId = byId.get(parentId).parentId) {
        if (!byId.has(parentId)) throw new Error(`Übergeordnete Fraktion fehlt: ${entry.id} → ${parentId}`);
        if (visited.has(parentId)) throw new Error(`Zyklische Fraktionshierarchie: ${entry.id}`);
        visited.add(parentId);
      }
      if (category.id === 'kulte' && entry.parentId) throw new Error(`Kulte haben keine gemeinsame Führung: ${entry.id}`);
      for (const relation of entry.affiliations || []) {
        for (const id of relation.entryIds || [relation.entryId]) {
          if (!byId.has(id)) throw new Error(`Fraktionsverbindung fehlt: ${entry.id} → ${id}`);
        }
      }
      for (const href of [entry.href, entry.symbol]) {
        if (!href) continue;
        if (/^[a-z]+:|^\/|\\/i.test(href) || !existsSync(resolve(FACTION_ROOT, href.split('#')[0]))) throw new Error(`Ungültiges Fraktionsziel: ${entry.id} → ${href}`);
      }
    }
  }
  return catalog;
}

export function readFactionCatalog() {
  const religion = readReligionCatalog();
  const deities = new Map(religion.entries.map(entry => [entry.id, entry]));
  const catalog = FACTION_CATEGORIES.map(category => {
    const data = readJson(`data/${category.id}.json`);
    const groups = data.groups.map(group => {
      if (!group.deityId) return group;
      const deity = deities.get(group.deityId);
      if (!deity) throw new Error(`Gottheit fehlt: ${group.deityId}`);
      return { ...group, deity: {
        name: deity.title, epithet: deity.epithet, summary: deity.summary,
        symbol: `../${entrySymbolPath(deity)}`, href: `../${entryPagePath(deity)}`,
      } };
    });
    if (category.id === 'kulte') {
      const infernalOrder = readJson('../Religionen/data/infernaler-kreis.json').groups
        .filter(group => ['infernale', 'untergoetter'].includes(group.id))
        .flatMap(group => group.entries.map(path => path.split('/').at(-2)));
      groups.sort((a, b) => (infernalOrder.indexOf(a.deityId) + 1 || 100) - (infernalOrder.indexOf(b.deityId) + 1 || 100));
    }
    return { ...category, groups, entries: data.entries.map(entry => {
      const group = groups.find(group => group.id === entry.groupId);
      return { ...entry, categoryId: category.id, symbol: entry.symbol || group.deity?.symbol,
        href: entry.href || (entry.source.kind === 'user-directed-addition' ? `${group.deity.href}#kult` : ''),
        deityId: group.deityId || null,
      };
    }) };
  });
  return validateFactionCatalog(catalog);
}
