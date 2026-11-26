import { existsSync } from 'node:fs';
import { resolveAdministrationPortrait } from '../../../Kontinente/modules/administration/administration-portrait-sources.mjs';

const publishedOrigin = 'https://dieweltvonaleria.netlify.app';
const sharedRoot = /^(?:\.\.\/)+(Stammbäume|AleriaAlmanach|Orte|Kontinente|Familien Häuser und Clans)\//u;
const isPlaceholder = path => /\/placeholders\//u.test(path);

export function createRosterPortraitSources(root, families, almanac) {
  const familyPortraits = new Map();
  for (const record of families) {
    for (const person of record.family.persons) {
      if (!person.portrait) continue;
      const id = person.worldPersonId || `stammbaum/${record.id}/${person.id}`;
      const portraits = familyPortraits.get(id) || new Set();
      portraits.add(person.portrait);
      familyPortraits.set(id, portraits);
    }
  }

  function declaredPath(source) {
    if (typeof source !== 'string' || !source.trim()) return '';
    const path = resolveAdministrationPortrait(source.trim());
    const local = path.startsWith('assets/') ? `/Stammbäume/${path}` : path;
    if (/^\/(?!\/)/u.test(local)) {
      const file = new URL(`.${local}`, root);
      return file.href.startsWith(root.href) && existsSync(file) ? local : '';
    }
    return /^https:\/\//u.test(local) ? local : '';
  }

  function workbenchPath(source) {
    if (typeof source !== 'string') return '';
    const path = declaredPath(source.trim().replace(sharedRoot, '/$1/'));
    if (!path.startsWith(`${publishedOrigin}/`)) return path;
    const { pathname, search } = new URL(path);
    return declaredPath(pathname + search) || path;
  }

  function bestFor(id, ...declared) {
    const character = almanac.get(id) || (id.startsWith('almanach/') && almanac.get(id.slice('almanach/'.length)));
    const almanacPortrait = character?.portrait?.startsWith('assets/') ? `/AleriaAlmanach/${character.portrait}` : character?.portrait;
    const sources = [...declared, ...(familyPortraits.get(id) || []), almanacPortrait];
    let remote = '', placeholder = '';
    for (const source of sources) {
      const path = workbenchPath(source);
      if (!path) continue;
      if (isPlaceholder(path)) placeholder ||= path;
      else if (path.startsWith('/')) return path;
      else remote ||= path;
    }
    return remote || placeholder;
  }

  return { declaredPath, bestFor };
}
