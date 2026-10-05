import { GROUP_ASSIGNMENTS } from './group-landing-model.js';
import { summarizeGroupReadiness } from './group-landing-combat.js';
import { formatGroupTreasury } from './group-landing-treasury.js';
import { classifyGroupScene } from './group-landing-scenes.js';
import { html, button, empty, groupPortrait, groupIcon } from './group-landing-markup.js';
import { renderGroupInventory } from './group-landing-inventory-view.js';
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
  const metadata = [member.source === 'guest' ? (member.temporary ? 'Gast · vorübergehend' : 'Zusätzliches Mitglied') : '', member.until ? `Bis: ${member.until}` : '', member.note].filter(Boolean);
  return `<article class="group-member${compact ? ' group-member-compact' : ''}" data-member-id="${html(member.id)}">
    ${groupPortrait(member.portrait, member.name)}<div class="group-member-copy">
      <strong>${member.badgeIcon ? groupIcon(member.badgeIcon) : ''}${html(member.name)}</strong><span class="group-member-role">${html(member.role)}${member.className ? ' · ' + html(member.className) : ''}</span>
      ${metadata.length ? `<small>${html(metadata.join(' · '))}</small>` : ''}</div>
      <div class="group-member-vitals"><span class="group-readiness" data-readiness="${state.key}">${html(state.label)}</span>${compact ? '' : health}
      ${!compact && state.conditions.length ? `<p class="group-conditions">${html(state.conditions.join(' · '))}</p>` : ''}
      ${!compact && state.resources.length ? `<p class="group-resources">${state.resources.map(resource => `${html(resource.name)} ${resource.current}/${resource.maximum}`).join(' · ')}</p>` : ''}
      </div><div class="group-member-actions">${button('member', 'Anpassen', `data-member-id="${html(member.id)}"`)}${member.characterId ? button('profile', 'Bogen ↗', `data-character-id="${html(member.characterId)}"`) : ''}</div></article>`;
}

export function renderGroupRoster(members) {
  const active = members.filter(member => member.assignment === 'active');
  return `<div class="group-active-roster">${active.length ? active.map(member => memberCard(member)).join('') : empty('Noch keine Reisegruppe ausgewählt. Stelle hier zusammen, wer aktuell mitkommt.')}</div>
    ${['reserve', 'away'].map(assignment => {
      const subset = members.filter(member => member.assignment === assignment);
      return `<details class="group-reserves"><summary>${GROUP_ASSIGNMENTS[assignment]} <span>${subset.length}</span></summary><div class="group-reserve-grid">${subset.map(member => memberCard(member, true)).join('') || empty('Keine Mitglieder in dieser Kategorie.')}</div></details>`;
    }).join('')}`;
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
  const tabs = [['roster', 'Mannschaft', '♟'], ['scene', 'Lage & Sitzung', '◷'], ['quests', 'Aufgaben', '⚑'], ['inventory', 'Güter & Kasse', '⚒'], ['notes', 'Journal', '✎'], ['map', 'Karte', '⌖']];
  const tabId = key => `group-${index}-${key}`;
  return `<div class="landing-page group-landing" data-landing-page-index="${index}" data-group-active-tab="roster">
    <header class="group-hero">${groupPortrait(data.bannerImage || entry.symbol, data.title, 'group-crest')}<div class="group-hero-title"><span class="group-eyebrow">Gruppenübersicht</span><h2>${html(data.title || entry.title)}</h2><p>${html(data.subtitle)}</p><div class="group-hero-meta">${groupIcon(group.icons.location, '⌖')}<span>${html(group.location || active?.location || 'Ort offen')}</span><span class="group-status-tag">${html(group.status || 'Status offen')}</span></div></div><div class="group-hero-clock" data-group-region="clock">${renderGroupHeaderClock(active)}</div>${button('settings', 'Gruppe bearbeiten', 'data-group-edit-entry', true)}</header>
    <div data-group-region="summary">${renderGroupSummary(members)}</div>
    <nav class="group-tabs" role="tablist" aria-label="Bereiche der Gruppenübersicht">${tabs.map(([key, label, icon]) => `<button type="button" id="${tabId(key)}-tab" role="tab" data-group-tab="${key}" aria-controls="${tabId(key)}" aria-selected="${key === 'roster'}" tabindex="${key === 'roster' ? 0 : -1}">${groupIcon(group.icons[key], icon)}<span>${label}</span></button>`).join('')}</nav>
    <div class="group-workspace">
      <section id="${tabId('roster')}" role="tabpanel" aria-labelledby="${tabId('roster')}-tab" data-group-tab-panel="roster" class="group-roster-panel"><div class="group-panel-head"><div><span class="group-eyebrow">Aktuelle Zusammenstellung</span><h3>${html(data.memberTitle)}</h3></div><div class="group-toolbar">${button('select', '+ Aus Hierarchie auswählen', '', true)}${button('guest', '+ Gast aus Archiv')}${button('hierarchy', 'Hierarchie ↗')}</div></div>
        <div class="group-presets">${group.presets.length ? `<label>Zusammenstellung <select data-group-field="preset"><option value="">Auswählen …</option>${group.presets.map(preset => `<option value="${html(preset.id)}">${html(preset.name)}</option>`).join('')}</select></label>${button('apply-preset', 'Übernehmen')}${button('delete-preset', 'Entfernen')}` : ''}${button('save-preset', 'Auswahl merken')}</div>
        <div data-group-region="roster">${renderGroupRoster(members)}</div></section>
      <section id="${tabId('scene')}" role="tabpanel" aria-labelledby="${tabId('scene')}-tab" data-group-tab-panel="scene" hidden><div class="group-panel-head"><h3>Lage & Sitzung</h3><div class="group-toolbar">${button('scene', 'Sitzungen verwalten', '', true)}${button('settings', 'Lage bearbeiten')}</div></div><div class="group-session-layout"><div data-group-region="scene">${renderGroupScenePanel(group, scenes, active)}</div><dl class="group-facts">${[['location', 'Ort', group.location || active?.location, '⌖'], ['status', 'Status', group.status, '◇'], ['activity', 'Tätigkeit', group.activity, '⚑'], ['supplies', 'Versorgung', group.supplies, '⚒']].map(([key, label, value, icon]) => `<div><dt>${groupIcon(group.icons[key], icon)}${label}</dt><dd>${html(value || 'Noch offen')}</dd></div>`).join('')}</dl></div></section>
      <section id="${tabId('quests')}" role="tabpanel" aria-labelledby="${tabId('quests')}-tab" data-group-tab-panel="quests" hidden>${fragments.quests}</section>
      <section id="${tabId('inventory')}" role="tabpanel" aria-labelledby="${tabId('inventory')}-tab" data-group-tab-panel="inventory" hidden><div class="group-panel-head"><h3>${groupIcon(group.icons.inventory, '⚒')}Güter & Kasse</h3><div class="group-toolbar">${button('inventory', '+ Aus Handelsregister', '', true)}${button('register', 'Handelsregister ↗')}</div></div>${renderGroupTreasury(group.treasury)}<div class="group-stock-heading"><h4>Gemeinsamer Bestand</h4><small>Mengen, Lagerorte & Verantwortung</small></div><div data-group-region="inventory">${renderGroupInventory(group, members)}</div></section>
      <section id="${tabId('notes')}" role="tabpanel" aria-labelledby="${tabId('notes')}-tab" data-group-tab-panel="notes" hidden><div class="group-panel-head"><h3>Journal</h3><button type="button" class="group-button" data-landing-action="edit-settings">Weitere Einträge bearbeiten</button></div>${fragments.notes}${fragments.events}${fragments.info}</section>
      <section id="${tabId('map')}" role="tabpanel" aria-labelledby="${tabId('map')}-tab" data-group-tab-panel="map" hidden><div class="group-panel-head"><h3>${groupIcon(group.icons.map, '⌖')}Karte</h3>${button('map', 'Karte auswählen', '', true)}</div>${fragments.map || empty('Wähle eine Karte aus dem Kartenregister. Sie wird hier interaktiv eingebettet.')}</section>
    </div><p class="group-page-status" data-group-region="error" role="alert"></p></div>`;
}
