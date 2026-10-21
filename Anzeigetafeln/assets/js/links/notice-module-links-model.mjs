export const NOTICE_MODULE_REFERENCES = Object.freeze([
  { id: 'lothaires-arkaneum', names: ['Lothaires Arkaneum', 'Arkaneum'] },
  { id: 'gwynthor-zum-kleinen-durst', names: ['Zum Kleinen Durst', 'Kleinen Durst'] },
  { id: 'heim-der-fearnan', names: ['Heim der Fearnan', 'Familie Fearnan', 'Eoghan Fearnan', 'Haus mit dem fröhlichen Baum'] },
  { id: 'heim-der-torvik', names: ['Heim der Torvik', 'Familie Torvik', 'Haldor Torvik'] },
  { id: 'gwynthor-badehaus-fontani', names: ['Badehaus der Fontani', 'Badehaus'] },
  { id: 'gwynthor-die-rote-klaue', names: ['Die rote Klaue', 'Rote Klaue'] },
  { id: 'schwarze-zitteraale', names: ['Schwarzen Zitteraalen', 'Schwarzen Zitteraale', 'Schwarze Zitteraale', 'Schwarzen Zitteraal', 'Schwarze Zitteraal'] },
].map(reference => Object.freeze({ ...reference, names: Object.freeze(reference.names) })));

const entryPattern = /^[a-z0-9][a-z0-9-]{0,159}$/i;
const names = NOTICE_MODULE_REFERENCES.flatMap(reference => reference.names.map(name => ({ name, id: reference.id })));
const escapedNames = names.map(entry => entry.name).sort((a, b) => b.length - a.length)
  .map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
const mentionPattern = new RegExp(`(?<![\\p{L}\\p{N}_])(${escapedNames.join('|')})(?![\\p{L}\\p{N}_])`, 'giu');

export function moduleHref(id) {
  return entryPattern.test(String(id || '')) ? `/AleriaAlmanach/AleriaAlmanach.html?${new URLSearchParams({ entry: id })}` : '';
}

export function normalizeModuleHref(value, base) {
  if (!String(value || '').trim()) return '';
  try {
    const url = new URL(value, base);
    if (!['https:', 'http:'].includes(url.protocol) || url.origin !== new URL(base).origin) return '';
    if (!/^\/AleriaAlmanach\/AleriaAlmanach(?:\.html)?\/?$/i.test(url.pathname)) return '';
    return moduleHref(url.searchParams.get('entry'));
  } catch { return ''; }
}

export function moduleMentions(text) {
  return [...String(text || '').matchAll(mentionPattern)].map(match => ({
    text: match[0], index: match.index,
    id: names.find(entry => entry.name.toLocaleLowerCase('de') === match[0].toLocaleLowerCase('de')).id,
  }));
}
