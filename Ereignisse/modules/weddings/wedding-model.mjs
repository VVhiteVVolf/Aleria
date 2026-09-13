import { validateWedding, WEDDING_GROUPS } from './wedding-schema.mjs';

export const weddingText = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export function weddingGroups(wedding) {
  return Object.fromEntries(WEDDING_GROUPS.map((id, index) => [id, ['Die Zeremonie', `Haus ${wedding.couple[0].house || 'der ersten Brautperson'}`, `Haus ${wedding.couple[1].house || 'der zweiten Brautperson'}`, 'Weitere Gäste', 'Häuser & Delegationen'][index]]));
}
export function weddingDate(wedding, calendar) {
  const { year, month, day, time } = wedding.date;
  if (!year) return 'Der Termin wird noch abgestimmt';
  const label = day ? calendar.format({ year, month, day }, { withWeekday: false }) : month ? `${calendar.monthLabel(month)} ${year}` : `Jahr ${year} · Tag noch offen`;
  return `${label}${time ? ` · ${time} Uhr` : ''}`;
}
export function weddingCalendarHref(wedding, eventsBase) {
  if (!wedding.date.year) return new URL('../AleriaAlmanach/kalender.html', eventsBase).href;
  const url = new URL('../AleriaAlmanach/kalender.html', eventsBase);
  url.searchParams.set('year', wedding.date.year);
  if (wedding.date.month) url.searchParams.set('month', wedding.date.month);
  if (wedding.date.day) url.searchParams.set('date', wedding.date.day);
  return url.href;
}
export function selectWeddingGuests(guests, { query = '', group = 'all', attendance = 'all', gifts = false } = {}) {
  const terms = query.toLocaleLowerCase('de').normalize('NFD').replace(/\p{M}/gu, '').split(/\s+/).filter(Boolean);
  return guests.filter(guest => {
    if (group !== 'all' && guest.group !== group || attendance !== 'all' && guest.attendance !== attendance || gifts && !guest.gift) return false;
    const haystack = [guest.name, guest.house, guest.rank, guest.role, guest.task, guest.gift, guest.leader].join(' ').toLocaleLowerCase('de').normalize('NFD').replace(/\p{M}/gu, '');
    return terms.every(term => haystack.includes(term));
  });
}
export function updateWeddingEntry(wedding, list, item) {
  if (!['guests', 'schedule', 'tasks'].includes(list)) throw new Error('Unbekannte Liste.');
  const next = structuredClone(wedding), index = next[list].findIndex(entry => entry.id === item.id);
  if (index < 0) next[list].push(item); else next[list][index] = item;
  return validateWedding(next);
}
export function removeWeddingEntry(wedding, list, id) {
  if (!['guests', 'schedule', 'tasks'].includes(list)) throw new Error('Unbekannte Liste.');
  return validateWedding({ ...wedding, [list]: wedding[list].filter(entry => entry.id !== id) });
}
export function weddingChanges(before, after) {
  const changes = [];
  for (const [field, label] of [['title','Titel'],['subtitle','Untertitel'],['couple','Brautpaar & Häuser'],['status','Stand der Hochzeit'],['date','Termin'],['location','Ort'],['region','Region'],['image','Titelbild'],['intro','Einführung'],['background','Hintergrund'],['notes','Notizen']]) {
    if (JSON.stringify(before?.[field]) !== JSON.stringify(after[field])) changes.push(`${label} aktualisiert`);
  }
  for (const [field, label] of [['guests','Gästebuch'],['schedule','Ablauf'],['tasks','Vorbereitung']]) {
    const old = new Map((before?.[field] || []).map(item => [item.id, item])), next = new Map(after[field].map(item => [item.id, item]));
    const added = after[field].filter(item => !old.has(item.id)).length;
    const removed = [...old.keys()].filter(id => !next.has(id)).length;
    const edited = after[field].filter(item => old.has(item.id) && JSON.stringify(old.get(item.id)) !== JSON.stringify(item)).length;
    if (added || removed || edited) changes.push(`${label}: ${added} neu, ${edited} geändert, ${removed} entfernt`);
    else if (JSON.stringify([...old.keys()]) !== JSON.stringify([...next.keys()])) changes.push(`${label}: Reihenfolge geändert`);
  }
  return changes;
}
