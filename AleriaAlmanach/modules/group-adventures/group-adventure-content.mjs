import { migrateGroupLandingEntry } from '../landing/group-landing-migration.js';
import { normalizeLandingData } from '../landing/landing-model.js';
import { enrichAnaraut } from './anaraut-content.mjs';
import { IDWAL_SHIP_CATS } from '../creatures/catalog/idwal-ship-cats.js';
import { collectGroupRoster } from '../landing/group-landing-roster.js';
import { normalizeGroupMemberState } from '../landing/group-landing-model.js';

export const GROUP_ADVENTURE_CONTENT_VERSION = 1;
export const GROUP_ADVENTURE_MODULES = Object.freeze({
  'skallis-gefolge': { title: 'Skallis Gefolge', subtitle: 'Gefährten auf den Wegen Roriksheims' },
  'idwals-schiffsmannschaft': { title: 'Idwals Schiffsmannschaft', subtitle: 'Das Logbuch der Tiefenwyrm' },
  'modul-1782120382311': { title: 'Anarauts Gefolge', subtitle: 'Im Dienst des Erben von Celtigerns Wacht und des Marschalls' },
  'rhydians-schiffsmannschaft': { title: 'Rhydians Schiffsmannschaft', subtitle: 'Das Logbuch des Seebären' },
  'parzifals-schiffsmannschaft': { title: 'Parzifals Schiffsmannschaft', subtitle: 'Die gemeinsamen Fahrten der Dychwelyd' },
  'lynnes-schiffsmannschaft': { title: 'Lynnes Schiffsmannschaft', subtitle: 'Das Logbuch der Leeren Flasche' },
  'draig-leibgarde': { title: 'Draig Leibgarde', subtitle: 'Gefährten im Schutzdienst des Hauses Draig' }
});

// A one-time editorial projection, never a write. Persisting a reviewed module
// retains the version marker, so later user choices and hierarchy edits win.
export function withGroupAdventureContent(entry) {
  const preset = GROUP_ADVENTURE_MODULES[entry?.id];
  if (!preset || Number(entry.groupAdventureContentVersion || 0) >= GROUP_ADVENTURE_CONTENT_VERSION) return entry;
  const previous = entry.pages?.find(page => page.landingPage && page.landing?.group)?.landing.group;
  const hasSelection = ['members', 'guests', 'presets'].some(key => previous?.[key]?.length);
  const next = structuredClone(migrateGroupLandingEntry(entry, { tab: 'Gruppen' }));
  const overview = next.pages?.find(page => page.landingPage && page.landing?.group);
  if (!overview) return entry;
  const landing = normalizeLandingData(overview.landing);
  overview.landing = { ...landing, presentation: 'folio', questJournal: { ...landing.questJournal, enabled: true } };
  if (!landing.subtitle || /^(?:Mannschaft, Reisegruppe|Gemeinsame Wege, Aufgaben)/.test(landing.subtitle)) overview.landing.subtitle = preset.subtitle;
  if (next.id === 'idwals-schiffsmannschaft') {
    const guests = overview.landing.group.guests;
    for (const cat of IDWAL_SHIP_CATS) if (!guests.some(guest => guest.creatureId === cat.id || guest.id === `crew-creature:${cat.id}`)) {
      guests.push({ id: `crew-creature:${cat.id}`, kind: 'creature', creatureId: cat.id, characterId: '', name: cat.name,
        portrait: cat.portrait, role: 'Schiffskatze', assignment: 'reserve', status: 'auto', temporary: false,
        until: '', note: cat.biography.bonds, badgeIcon: '' });
    }
  }
  if (next.id === 'modul-1782120382311') enrichAnaraut(next);
  // An empty old overview never expressed a decision to leave everyone behind.
  // Initialize only this first editorial migration; later user choices win.
  if (!hasSelection) {
    overview.landing.group.members = collectGroupRoster(next).map(member => normalizeGroupMemberState({ ...member, assignment: 'active' }));
    overview.landing.group.guests = overview.landing.group.guests.map(guest => ({ ...guest, assignment: 'active' }));
  }
  next.groupAdventureContentVersion = GROUP_ADVENTURE_CONTENT_VERSION;
  return next;
}
