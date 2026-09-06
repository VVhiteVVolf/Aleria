import { normalizeCombatEncounterEvent, getActiveCombatEncounter } from '../combat/combat-encounter-model.js?v=20260906-effect-rolls-v1';
import { collectClaimedLootActorIds } from '../loot/loot-model.js?v=20260807-loot-v1';
import { ENCOUNTER_STATUS_LABELS, ENCOUNTER_TYPE_LABELS, ENCOUNTER_OUTCOME_LABELS, ENCOUNTER_REASON_LABELS } from '../combat/combat-encounter-outcome.js';
import { renderEncounterSummary, escapeEncounterMarkup as escapeMarkup } from './combat-encounter-summary-ui.js';
import { renderEncounterActions } from './combat-encounter-panel.js?v=20260906-effect-rolls-v1';

export const COMBAT_ENCOUNTER_ICON_URL = '../IconOrdner/Buttom Icons/Kampfstarter.png';

const options = labels => Object.entries(labels).map(([value, label]) => `<option value="${value}">${label}</option>`).join('');

export function ensureCombatEncounterDialog() {
  let overlay = document.getElementById('combat-encounter-overlay');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'combat-encounter-overlay';
  overlay.className = 'scene-time-event-overlay combat-encounter-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('aria-labelledby', 'combat-encounter-dialog-title');
  overlay.innerHTML = `
    <div class="scene-time-event-card combat-encounter-card">
      <header class="combat-encounter-head">
        <span><img src="${COMBAT_ENCOUNTER_ICON_URL}" alt=""></span>
        <div><small>Kampfankündigung</small><h2 id="combat-encounter-dialog-title">Kampfliste verwalten</h2></div>
        <button type="button" data-combat-encounter-action="close" aria-label="Schließen">×</button>
      </header>
      <div class="combat-encounter-body">
        <nav data-combat-encounter-operations></nav>
        <div class="combat-encounter-fields">
          <label><span>Titel</span><input data-combat-encounter-field="title" maxlength="180" value="Kampfankündigung"></label>
          <label data-combat-encounter-type><span>Kampfart</span><select data-combat-encounter-field="combat-type">${options(ENCOUNTER_TYPE_LABELS)}</select></label>
          <label class="wide"><span>Erzählertext · optional</span><textarea data-combat-encounter-field="body" maxlength="4000" rows="2" placeholder="Beschreibe den Beginn oder den Ausgang des Kampfes …"></textarea></label>
          <label data-combat-encounter-end hidden><span>Ergebnis</span><select data-combat-encounter-field="outcome"><option value="">Ergebnis wählen …</option>${options(ENCOUNTER_OUTCOME_LABELS)}</select></label>
          <label data-combat-encounter-end hidden><span>Grund des Abschlusses</span><select data-combat-encounter-field="end-reason">${options(ENCOUNTER_REASON_LABELS)}</select></label>
          <label data-combat-encounter-winning hidden><span>Siegreiche Partei</span><select data-combat-encounter-field="winning-party"></select></label>
          <label data-combat-encounter-award hidden class="combat-encounter-check"><input type="checkbox" data-combat-encounter-field="award-experience" checked> Sieg-EP gleichmäßig an die berechtigten Figuren der Siegerseite vergeben</label>
        </div>
        <p data-combat-encounter-hint></p>
        <div class="combat-encounter-list-head"><input type="search" data-combat-encounter-field="search" aria-label="Figur oder Kreatur suchen" placeholder="Figur oder Kreatur suchen …"><label data-combat-encounter-scope><select data-combat-encounter-field="scope" aria-label="Figuren anzeigen"><option value="scene">Figuren der Szene</option><option value="all">Gesamtes Register</option></select></label><span data-combat-encounter-count>0 ausgewählt</span></div>
        <div class="combat-encounter-list" data-combat-encounter-list></div>
        <div data-combat-encounter-preview hidden></div>
        <p class="combat-encounter-status" data-combat-encounter-status role="status"></p>
        <button type="button" data-combat-encounter-action="refresh" hidden>Aktuellen Kampfstand laden</button>
        <details class="combat-encounter-tools"><summary>Testwerkzeuge</summary><button type="button" class="combat-encounter-cheat" data-combat-encounter-action="cheat-reset">Ausgewählte Figuren vollständig zurücksetzen</button></details>
      </div>
      <footer><button type="button" data-combat-encounter-action="close">Abbrechen</button><button type="button" class="primary" data-combat-encounter-action="submit">Kampf eröffnen</button></footer>
    </div>`;
  document.body.appendChild(overlay);
  return overlay;
}

export function renderOperationButtons(active, operation) {
  const host = document.querySelector('[data-combat-encounter-operations]');
  if (!host) return;
  const operations = active
    ? [['add', 'Kämpfer hinzufügen'], ['remove', 'Kämpfer entfernen'], ['end', 'Kampf abschließen']]
    : [['start', 'Kampf beginnen']];
  host.innerHTML = operations.map(([id, label]) => `<button type="button" data-combat-encounter-action="operation" data-operation="${id}" class="${operation === id ? 'active' : ''}" aria-pressed="${operation === id}">${label}</button>`).join('');
}

export function renderEncounterCandidates(candidates = [], operation = 'start') {
  const host = document.querySelector('[data-combat-encounter-list]');
  if (!host) return;
  if (!candidates.length) {
    host.innerHTML = '<p class="combat-encounter-empty">Für diesen Vorgang sind keine Figuren verfügbar.</p>';
    return;
  }
  host.innerHTML = candidates.map(candidate => {
    const statusControl = ['remove', 'end'].includes(operation)
      ? `<select data-combat-encounter-field="status" aria-label="Kampfstatus von ${escapeMarkup(candidate.name)}">${Object.entries(ENCOUNTER_STATUS_LABELS).map(([value, label]) => `<option value="${value}"${candidate.status === value ? ' selected' : ''}>${label}</option>`).join('')}</select>`
      : `<input data-combat-encounter-field="party" aria-label="Seite von ${escapeMarkup(candidate.name)}" value="${escapeMarkup(candidate.partyName || candidate.partyId || '')}" placeholder="Seite, z. B. Draig">`;
    const checked = operation === 'end' || candidate.selected;
    const runtimeDetails = [
      Number(candidate.maximumHitPoints) > 0 ? `TP ${Number(candidate.currentHitPoints) || 0}/${Number(candidate.maximumHitPoints)}` : '',
      ...(Array.isArray(candidate.conditionNames) ? candidate.conditionNames.slice(0, 3) : []),
      candidate.concentrationName ? `Konzentration: ${candidate.concentrationName}` : '',
      candidate.channelingName ? `Kanalisierung: ${candidate.channelingName}` : ''
    ].filter(Boolean).join(' · ');
    return `<div class="combat-encounter-person" data-combat-encounter-candidate data-actor-id="${escapeMarkup(candidate.actorId)}" data-in-scene="${candidate.inScene === true}" data-search="${escapeMarkup(candidate.searchText || '')}">
      <input type="checkbox" data-combat-encounter-field="participant" aria-label="${escapeMarkup(candidate.name)} auswählen"${checked ? ' checked' : ''}${operation === 'end' ? ' hidden' : ''}>
      <span class="combat-encounter-portrait">${candidate.portrait ? `<img src="${escapeMarkup(candidate.portrait)}" alt="">` : escapeMarkup((candidate.name || '?').slice(0, 1))}</span>
      <span class="combat-encounter-copy"><strong>${escapeMarkup(candidate.name)}</strong><small>${escapeMarkup(candidate.title || (candidate.entityType === 'creature' ? 'Kreatur' : 'Charakter'))}</small>${runtimeDetails ? `<small class="combat-encounter-runtime">${escapeMarkup(runtimeDetails)}</small>` : ''}</span>
      <span class="combat-encounter-control">${statusControl}</span>
    </div>`;
  }).join('');
}

export function setEncounterEndControls(visible, parties = [], selected = '') {
  const winning = document.querySelector('[data-combat-encounter-winning]');
  const award = document.querySelector('[data-combat-encounter-award]');
  if (winning) winning.hidden = !visible;
  if (award) award.hidden = !visible;
  const select = document.querySelector('[data-combat-encounter-field="winning-party"]');
  if (select) select.innerHTML = '<option value="">Siegerseite wählen …</option>' + parties.map(party => `<option value="${escapeMarkup(party.id)}"${party.id === selected ? ' selected' : ''}>${escapeMarkup(party.name)}</option>`).join('');
}

export function filterEncounterCandidates(query = '', scope = 'all') {
  const needle = String(query || '').trim().toLocaleLowerCase('de').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  document.querySelectorAll('[data-combat-encounter-candidate]').forEach(row => {
    row.hidden = needle ? !String(row.dataset.search || '').includes(needle)
      : scope === 'scene' && row.dataset.inScene !== 'true' && !row.querySelector('input:checked');
  });
}

export function updateEncounterCount() {
  const count = document.querySelectorAll('[data-combat-encounter-field="participant"]:checked').length;
  const output = document.querySelector('[data-combat-encounter-count]');
  if (output) output.textContent = `${count} ausgewählt`;
}

export function setEncounterMode(operation, outcome = '') {
  const root = ensureCombatEncounterDialog();
  root.dataset.operation = operation;
  root.querySelectorAll('[data-combat-encounter-end]').forEach(element => { element.hidden = operation !== 'end'; });
  root.querySelector('[data-combat-encounter-type]').hidden = operation !== 'start';
  root.querySelector('[data-combat-encounter-winning]').hidden = operation !== 'end' || outcome !== 'victory';
  root.querySelector('[data-combat-encounter-award]').hidden = operation !== 'end' || outcome !== 'victory';
  root.querySelector('[data-combat-encounter-preview]').hidden = operation !== 'end';
  root.querySelector('[data-combat-encounter-scope]').hidden = !['start', 'add'].includes(operation);
  const labels = { start: 'Kampf eröffnen', add: 'Kämpfer hinzufügen', remove: 'Ausscheiden eintragen', end: 'Fazit veröffentlichen & Kampf abschließen' };
  const button = root.querySelector('[data-combat-encounter-action="submit"]');
  button.dataset.idleLabel = labels[operation];
  button.textContent = labels[operation];
  root.querySelector('#combat-encounter-dialog-title').textContent = operation === 'end' ? 'Kampf abschließen' : operation === 'start' ? 'Kampf eröffnen' : 'Beteiligte verwalten';
  root.querySelector('[data-combat-encounter-hint]').textContent = operation === 'start'
    ? 'Wähle die Beteiligten. Gleiche Seitennamen bilden eine Partei. Die Suche durchsucht immer das gesamte Register.'
    : operation === 'end' ? 'Prüfe die Kampfstände und bestätige den Ausgang. Das Fazit erscheint als eigener Abschluss unter derselben Kampfankündigung.'
      : 'Änderungen gelten für die ausgewählten Figuren im laufenden Kampf.';
}

export function setEncounterPreview(event) {
  const host = document.querySelector('[data-combat-encounter-preview]');
  if (host) host.innerHTML = renderEncounterSummary(event, { preview: true });
}

export function setEncounterStatus(message = '', type = 'info') {
  const output = document.querySelector('[data-combat-encounter-status]');
  if (!output) return;
  output.dataset.status = type;
  output.textContent = message;
}

export function setEncounterSubmitting(submitting) {
  const button = document.querySelector('[data-combat-encounter-action="submit"]');
  if (!button) return;
  button.disabled = !!submitting;
  button.textContent = submitting ? 'Wird gespeichert …' : button.dataset.idleLabel || 'Eintragen';
}

const STATUS_LABELS = ENCOUNTER_STATUS_LABELS;

function renderRosterRow(participant) {
  const initial = escapeMarkup((participant.name || '?').slice(0, 1));
  return `<li data-status="${escapeMarkup(participant.status)}">
    <span class="combat-encounter-roster-portrait">${participant.portrait ? `<img src="${escapeMarkup(participant.portrait)}" alt="">` : initial}</span>
    <span class="combat-encounter-roster-name">${escapeMarkup(participant.name)}</span>
    <span class="combat-encounter-roster-level">Stufe ${escapeMarkup(participant.level || 1)}</span>
    <span class="combat-encounter-roster-status">${STATUS_LABELS[participant.status] || participant.status}</span>
  </li>`;
}

function groupParticipantsByParty(participants = []) {
  const order = [];
  const byParty = new Map();
  participants.forEach(participant => {
    const key = participant.partyId || 'neutral';
    if (!byParty.has(key)) {
      byParty.set(key, { partyId: key, partyName: participant.partyName || key, members: [] });
      order.push(key);
    }
    byParty.get(key).members.push(participant);
  });
  return order.map(key => byParty.get(key));
}

function renderRoster(participants = []) {
  const parties = groupParticipantsByParty(participants);
  if (!parties.length) return '';
  const columns = parties.map(party => `<div class="combat-encounter-party">
    <h4>${escapeMarkup(party.partyName)}</h4>
    <ul>${party.members.map(renderRosterRow).join('')}</ul>
  </div>`);
  const withDividers = columns.reduce((acc, column, i) => (
    i === 0 ? [column] : [...acc, '<span class="combat-encounter-vs">gegen</span>', column]
  ), []);
  return `<div class="combat-encounter-roster">${withDividers.join('')}</div>`;
}

function isCreaturePersistence(persistence = {}) {
  return persistence?.kind === 'creature' || persistence?.kind === 'scene-creature';
}

function renderLootRow(event, comment) {
  if (event.operation !== 'end') return '';
  const defeated = event.participants.filter(participant => participant.status === 'defeated' && isCreaturePersistence(participant.persistence));
  if (!defeated.length) return '';
  const history = globalThis.getCachedCommentsForThread?.(comment.entryId) || [];
  const claimed = collectClaimedLootActorIds(history, event.encounterId);
  const lootable = defeated.filter(participant => !claimed.has(String(participant.actorId)));
  if (!lootable.length) return '';
  return `<div class="combat-encounter-loot-row">
    <span class="combat-encounter-loot-label">Beute verfügbar</span>
    <div class="combat-encounter-loot-avatars">
      ${lootable.map(participant => `<button type="button" class="combat-encounter-loot-avatar" data-action="open-creature-loot" data-entry-id="${escapeMarkup(comment.entryId || '')}" data-encounter-id="${escapeMarkup(event.encounterId)}" data-actor-id="${escapeMarkup(participant.actorId)}" data-actor-name="${escapeMarkup(participant.name)}" data-actor-portrait="${escapeMarkup(participant.portrait || '')}" data-persistence-kind="${escapeMarkup(participant.persistence?.kind || '')}" data-persistence-record-id="${escapeMarkup(participant.persistence?.recordId || '')}" data-persistence-source-creature-id="${escapeMarkup(participant.persistence?.sourceCreatureId || '')}" title="Beute von ${escapeMarkup(participant.name)}" aria-label="Beute von ${escapeMarkup(participant.name)} öffnen">
        ${participant.portrait ? `<img src="${escapeMarkup(participant.portrait)}" alt="">` : escapeMarkup((participant.name || '?').slice(0, 1))}
        <span class="combat-encounter-loot-badge" aria-hidden="true">🎒</span>
      </button>`).join('')}
    </div>
  </div>`;
}

export function renderCombatEncounterComment(comment = {}, index = 0) {
  const event = normalizeCombatEncounterEvent(comment.combatEncounter || comment);
  const labels = { start: 'Kampf beginnt', add: 'Verstärkung', remove: 'Kampfliste geändert', end: 'Kampf beendet' };
  const awards = event.experience.awards.map(award => `<li><b>${escapeMarkup(award.name)}</b><span>+${award.experience} EP · ${award.beforeExperience}→${award.afterExperience}${award.levelUpAvailable ? ` · Stufe ${award.availableLevel} verfügbar` : ''}</span></li>`).join('');
  const divider = index > 0 ? '<div class="comment-divider"><span class="comment-divider-icon">*</span></div>' : '';
  return `${divider}<section class="combat-encounter-event" data-operation="${event.operation}">
    <header><img src="${COMBAT_ENCOUNTER_ICON_URL}" alt=""><span>${labels[event.operation]}</span><strong>${escapeMarkup(event.title)}</strong>${comment.id ? `<button type="button" class="combat-encounter-event-edit" data-action="edit-combat-encounter-text" data-comment-id="${escapeMarkup(comment.id)}" data-entry-id="${escapeMarkup(comment.entryId || '')}" data-title="${escapeMarkup(event.title)}" data-body="${escapeMarkup(event.body)}" title="Titel/Text bearbeiten" aria-label="Titel/Text bearbeiten">✎</button><button type="button" class="combat-encounter-event-delete" data-action="undo-mechanical-comment" data-comment-id="${escapeMarkup(comment.id)}" title="Löschen und zurücksetzen" aria-label="Löschen und zurücksetzen">×</button>` : ''}</header>
    ${event.body ? `<p>${escapeMarkup(event.body)}</p>` : ''}
    ${event.operation === 'end' ? renderEncounterSummary(event) : ''}
    ${renderRoster(event.participants)}
    ${awards ? `<div class="combat-encounter-awards"><strong>${event.experience.total} EP aus dem Sieg</strong><ul>${awards}</ul></div>` : ''}
    ${event.operation === 'end' && !awards ? '<small>Es wurden keine EP vergeben.</small>' : ''}
    ${renderLootRow(event, comment)}
    ${event.operation === 'start' && getActiveCombatEncounter(globalThis.getCachedCommentsForThread?.(comment.entryId) || [])?.encounterId === event.encounterId ? renderEncounterActions(event, comment.entryId) : ''}
  </section>`;
}

export const combatEncounterUiInternals = Object.freeze({ escapeMarkup });
