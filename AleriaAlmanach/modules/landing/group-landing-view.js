import { GROUP_ASSIGNMENTS } from './group-landing-model.js';
import { summarizeGroupReadiness } from './group-landing-combat.js';
import { formatGroupTreasury } from './group-landing-treasury.js';
import { classifyGroupScene } from './group-landing-scenes.js';
import { html, button, empty, groupPortrait, groupIcon } from './group-landing-markup.js';
import { renderGroupInventory } from './group-landing-inventory-view.js';
import { renderLandingFolioHeader, landingFolioIcon } from './landing-folio-view.js';
import { selectGroupRosterWindow } from './group-roster-window.js';
export { html, button, empty, groupPortrait } from './group-landing-markup.js';

export function renderGroupSummary(members) {
  const summary = summarizeGroupReadiness(members);
  return `<div class="group-metrics" aria-label="Kampfbereitschaft der aktuellen Gruppe">
    <div><strong>${summary.active}<small> / ${summary.total}</small></strong><span>Aktuell dabei</span></div>
    <div class="group-tone-ready"><strong>${summary.ready}</strong><span>Kampfbereit</span></div>
    <div class="group-tone-injured"><strong>${summary.limited}</strong><span>Eingeschränkt</span></div>
    <div class="group-tone-unavailable"><strong>${summary.unavailable}</strong><span>Nicht einsatzfähig</span></div>
    <div><strong>${summary.unknown}</strong><span>Ohne Kampfwerte</span></div></div>`;
}

export function renderGroupHeaderClock(active) {
  if (!active) {
    const calendar = globalThis.AleriaCalendar, world = calendar?.current();
    return `<small>Welttag · keine aktive Sitzung</small><strong>${html(calendar?.isValid(world) ? calendar.playDayLabel(world) : 'Tag offen')}</strong><span>${html(calendar?.isValid(world) ? calendar.format(world) : '')}</span>`;
  }
  return `<small>Aktive Sitzung</small><strong>${html(active.dayLabel)}${active.time ? ' · ' + html(active.time) : ''}</strong><span>${html(active.dateLabel)}</span>`;
}

function memberCard(member, compact = false) {
  const state = member.readiness;
  const health = state.known ? `<div class="group-health"><span>TP ${state.current} / ${state.maximum}${state.temporary ? ` (+${state.temporary})` : ''}</span><span>RK ${html(state.defense ?? '–')}</span></div>
    <meter min="0" max="${Math.max(1, state.maximum)}" value="${state.current}" aria-label="Trefferpunkte von ${html(member.name)}"></meter>` : '';
  const metadata = [GROUP_ASSIGNMENTS[member.assignment], member.source === 'guest' ? (member.temporary ? 'Gast · vorübergehend' : 'Zusätzliches Mitglied') : '', member.until ? `Bis: ${member.until}` : '', member.note].filter(Boolean);
  return `<article class="group-member${compact ? ' group-member-compact' : ''}" data-member-id="${html(member.id)}">
    ${groupPortrait(member.portrait, member.name)}<div class="group-member-copy">
      <strong>${member.badgeIcon ? groupIcon(member.badgeIcon) : ''}${html(member.name)}</strong><span class="group-member-role">${html(member.role)}${member.className ? ' · ' + html(member.className) : ''}</span>
      ${metadata.length ? `<small>${html(metadata.join(' · '))}</small>` : ''}</div>
      <div class="group-member-vitals"><span class="group-readiness" data-readiness="${state.key}">${html(state.label)}</span>${compact ? state.known ? `<small class="group-compact-health">TP ${state.current} / ${state.maximum}</small>` : '' : health}
      ${!compact && state.conditions.length ? `<p class="group-conditions">${html(state.conditions.join(' · '))}</p>` : ''}
      ${!compact && state.resources.length ? `<p class="group-resources">${state.resources.map(resource => `${html(resource.name)} ${resource.current}/${resource.maximum}`).join(' · ')}</p>` : ''}
      </div><div class="group-member-actions">${member.source === 'companion' ? '' : button('member', 'Anpassen', `data-member-id="${html(member.id)}"`)}${member.kind === 'creature' && member.creatureId ? button('creature-profile', 'Kreaturbogen ↗', `data-creature-id="${html(member.creatureId)}"`) : member.characterId ? button('profile', 'Bogen ↗', `data-character-id="${html(member.characterId)}"`) : ''}</div></article>`;
}

export function renderGroupRoster(members) {
  const window = selectGroupRosterWindow(members);
  return `<div class="group-roster-controls"><label>Gefährten finden<input type="search" data-group-roster-search placeholder="Name, Rolle oder Begleiter …"></label>
    <label>Zusammenstellung<select data-group-roster-assignment><option value="all">Die ganze Gemeinschaft</option>${Object.entries(GROUP_ASSIGNMENTS).map(([key,label]) => `<option value="${key}">${html(label)}</option>`).join('')}</select></label>
    <small data-group-roster-count role="status">${window.first}–${window.last} von ${window.filtered} Gefährten</small></div>
    <div data-group-roster-results>${renderGroupRosterResults(window)}</div>`;
}

export function renderGroupRosterResults(window) {
  return `<div class="group-active-roster${window.compact ? ' group-roster-list' : ' group-roster-portraits'}">${window.members.map(member => memberCard(member, window.compact)).join('') || empty('Keine passenden Gefährten. Ändere die Suche oder die Zusammenstellung.')}</div>
    ${window.pages > 1 ? `<nav class="group-roster-pagination" aria-label="Seiten der Gemeinschaft"><button type="button" class="group-button" data-group-roster-page="previous"${window.page ? '' : ' disabled'}>← Zurück</button><span>Seite ${window.page + 1} von ${window.pages}</span><button type="button" class="group-button" data-group-roster-page="next"${window.page < window.pages - 1 ? '' : ' disabled'}>Weiter →</button></nav>` : ''}`;
}

export function renderGroupScenePanel(group, scenes, active, connection = '') {
  const calendar = globalThis.AleriaCalendar;
  const world = calendar?.current();
  const history = scenes.filter(scene => group.sceneThreads.includes(scene.threadId) && scene.threadId !== group.threadId)
    .sort((left, right) => (right.ordinal ?? -1) - (left.ordinal ?? -1));
  const current = active ? `<div class="group-scene-current"><span class="group-eyebrow">Aktive Sitzung${active.status === 'paused' ? ' · pausiert' : active.status === 'ended' ? ' · beendet' : ''}</span><h3>${html(active.entryTitle)}</h3><p>${html(active.title)}</p>
    <div class="group-scene-day"><strong>${html(active.dayLabel)}</strong><span>${html(active.dateLabel)}${active.time ? ' · ' + html(active.time) + ' Uhr' : ' · Uhrzeit offen'}</span></div>
    <p>${html([active.location, active.phase].filter(Boolean).join(' · '))}</p>${button('open-scene', 'Sitzung öffnen ↗', `data-thread-id="${html(active.threadId)}"`, true)}</div>`
    : empty(group.threadId ? 'Die verknüpfte Sitzung ist derzeit nicht im Almanach verfügbar.' : 'Markiere eine interaktive Szene als aktive Sitzung. Ihr Tag, ihre Uhrzeit und Kampfzustände erscheinen hier.');
  return `<div class="group-world-day"><span>Aktueller Welttag</span><strong>${html(calendar?.isValid(world) ? calendar.playDayLabel(world) : 'Tag offen')}</strong><small>${html(calendar?.isValid(world) ? calendar.format(world) : '')}</small></div>
    ${current}<p class="group-sync" role="status">${html(connection)}</p>
    ${history.length ? `<details class="group-scene-history"><summary>Weitere Sitzungen · ${history.length}</summary>${history.map(scene => `<div class="group-scene-row"><div><strong>${html(scene.title)}</strong><small>${html(classifyGroupScene(scene, active, calendar, world))} · ${html(scene.dayLabel)} · ${html(scene.time || 'Uhrzeit offen')}</small></div>${button('open-scene', 'Öffnen', `data-thread-id="${html(scene.threadId)}"`)}</div>`).join('')}</details>` : ''}`;
}

export function renderGroupTreasury(treasury) {
  return `<div class="group-treasury-bar"><div><span class="group-eyebrow">Gemeinsame Gruppenkasse</span><strong class="group-cash">${html(formatGroupTreasury(treasury))}</strong></div>
    ${button('treasury', treasury.openingCopper == null ? 'Kasse einrichten' : 'Buchung hinzufügen', '', true)}</div>
    ${treasury.entries.length ? `<details class="group-ledger-history"><summary>Kassenbuch · ${treasury.entries.length} Buchungen</summary><div class="group-ledger">${treasury.entries.slice().reverse().map(entry => `<div><span>${html(entry.label)}<small>${html(entry.date)}</small></span><strong>${entry.direction === 'expense' ? '−' : '+'}${html(formatGroupTreasury({ openingCopper: entry.copper, entries: [] }))}</strong></div>`).join('')}</div></details>` : ''}`;
}

export function renderGroupBody(data, entry, index, members, scenes, active, fragments) {
  const group = data.group;
  const folio = data.presentation === 'folio';
  const folioLabels = { roster: 'Gefährten', scene: 'Auf Reisen', quests: 'Abenteuer', inventory: 'Besitz & Kasse', notes: 'Chronik', map: 'Weltkarte' };
  const folioIcons = { roster: 'people', scene: 'compass', quests: 'book', inventory: 'pack', notes: 'feather', map: 'map' };
  const tabs = [['roster', 'Mannschaft', '♟'], ['scene', 'Lage & Sitzung', '◷'], ['quests', 'Aufgaben', '⚑'], ['inventory', 'Güter & Kasse', '⚒'], ['notes', 'Journal', '✎'], ['map', 'Karte', '⌖']];
  const tabId = key => `group-${index}-${key}`;
  return `<div class="landing-page group-landing${folio ? ' landing-folio' : ''}" data-landing-page-index="${index}" data-group-active-tab="roster">
    ${folio ? renderLandingFolioHeader(data, { title: entry.title, subtitle: entry.subtitle, symbol: entry.symbol, group: true, clock: renderGroupHeaderClock(active), location: group.location || active?.location || '', status: group.status, actions: button('settings', 'Folio gestalten', 'data-group-edit-entry') }) : `<header class="group-hero">${groupPortrait(data.bannerImage || entry.symbol, data.title, 'group-crest')}<div class="group-hero-title"><span class="group-eyebrow">Gruppenübersicht</span><h2>${html(data.title || entry.title)}</h2><p>${html(data.subtitle)}</p><div class="group-hero-meta">${groupIcon(group.icons.location, '⌖')}<span>${html(group.location || active?.location || 'Ort offen')}</span><span class="group-status-tag">${html(group.status || 'Status offen')}</span></div></div><div class="group-hero-clock" data-group-region="clock">${renderGroupHeaderClock(active)}</div>${button('settings', 'Gruppe bearbeiten', 'data-group-edit-entry', true)}</header>`}
    <div data-group-region="summary">${renderGroupSummary(members)}</div>
    <nav class="group-tabs" role="tablist" aria-label="Bereiche der Gruppenübersicht">${tabs.map(([key, label, icon]) => `<button type="button" id="${tabId(key)}-tab" role="tab" data-group-tab="${key}" aria-controls="${tabId(key)}" aria-selected="${key === 'roster'}" tabindex="${key === 'roster' ? 0 : -1}">${group.icons[key] ? groupIcon(group.icons[key]) : folio ? landingFolioIcon(folioIcons[key]) : groupIcon(null, icon)}<span>${folio ? folioLabels[key] : label}</span></button>`).join('')}</nav>
    <div class="group-workspace">
      <section id="${tabId('roster')}" role="tabpanel" aria-labelledby="${tabId('roster')}-tab" data-group-tab-panel="roster" class="group-roster-panel"><div class="group-panel-head"><div><span class="group-eyebrow">${folio ? 'Die Gemeinschaft' : 'Aktuelle Zusammenstellung'}</span><h3>${html(data.memberTitle)}</h3></div><div class="group-toolbar">${button('select', '+ Aus Hierarchie auswählen', '', true)}${button('guest', '+ Gast aus Archiv')}${button('hierarchy', 'Hierarchie ↗')}</div></div>
        <div class="group-presets">${group.presets.length ? `<label>Zusammenstellung <select data-group-field="preset"><option value="">Auswählen …</option>${group.presets.map(preset => `<option value="${html(preset.id)}">${html(preset.name)}</option>`).join('')}</select></label>${button('apply-preset', 'Übernehmen')}${button('delete-preset', 'Entfernen')}` : ''}${button('save-preset', 'Auswahl merken')}</div>
        <div data-group-region="roster">${renderGroupRoster(members)}</div></section>
      <section id="${tabId('scene')}" role="tabpanel" aria-labelledby="${tabId('scene')}-tab" data-group-tab-panel="scene" hidden><div class="group-panel-head"><h3>Lage & Sitzung</h3><div class="group-toolbar">${button('scene', 'Sitzungen verwalten', '', true)}${button('settings', 'Lage bearbeiten')}</div></div><div class="group-session-layout"><div data-group-region="scene">${renderGroupScenePanel(group, scenes, active)}</div><dl class="group-facts">${[['location', 'Ort', group.location || active?.location, '⌖'], ['status', 'Status', group.status, '◇'], ['activity', 'Tätigkeit', group.activity, '⚑'], ['supplies', 'Versorgung', group.supplies, '⚒']].map(([key, label, value, icon]) => `<div><dt>${groupIcon(group.icons[key], icon)}${label}</dt><dd>${html(value || 'Noch offen')}</dd></div>`).join('')}</dl></div></section>
      <section id="${tabId('quests')}" role="tabpanel" aria-labelledby="${tabId('quests')}-tab" data-group-tab-panel="quests" hidden>${fragments.journal || ''}${fragments.quests}</section>
      <section id="${tabId('inventory')}" role="tabpanel" aria-labelledby="${tabId('inventory')}-tab" data-group-tab-panel="inventory" hidden>
        <div class="group-panel-head"><h3>${groupIcon(group.icons.inventory, '⚒')}Besitz & Kasse</h3>${button('register', 'Handelsregister ↗')}</div>
        <section class="group-quest-account" data-group-quest-account></section>
        <details class="group-editorial-stock"><summary>Vorratsnotizen & Kassenbuch</summary><div>
          <p class="group-muted">Redaktionelle Vorratsplanung und bisherige Aufzeichnungen. Der verbindliche Besitz und die Reisekasse stehen oben.</p>
          ${renderGroupTreasury(group.treasury)}
          <div class="group-stock-heading"><h4>Geplante Vorräte</h4>${button('inventory', '+ Aus Handelsregister', '', true)}</div>
          <div data-group-region="inventory">${renderGroupInventory(group, members)}</div>
        </div></details>
      </section>
      <section id="${tabId('notes')}" role="tabpanel" aria-labelledby="${tabId('notes')}-tab" data-group-tab-panel="notes" hidden><div class="group-panel-head"><h3>Journal</h3><button type="button" class="group-button" data-landing-action="edit-settings">Weitere Einträge bearbeiten</button></div>${fragments.notes}${fragments.events}${fragments.info}</section>
      <section id="${tabId('map')}" role="tabpanel" aria-labelledby="${tabId('map')}-tab" data-group-tab-panel="map" hidden><div class="group-panel-head"><h3>${groupIcon(group.icons.map, '⌖')}Karte</h3>${button('map', 'Karte auswählen', '', true)}</div>${fragments.map || empty('Wähle eine Karte aus dem Kartenregister. Sie wird hier interaktiv eingebettet.')}</section>
    </div><p class="group-page-status" data-group-region="error" role="alert"></p></div>`;
}
