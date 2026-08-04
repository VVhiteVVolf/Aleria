import { normalizeCombatEncounterEvent } from '../combat/combat-encounter-model.js?v=20260804-referee-v2';

export const COMBAT_ENCOUNTER_ICON_URL = '../IconOrdner/Buttom Icons/Kampfstarter.png';

function escapeMarkup(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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
          <label class="wide"><span>Erzählerischer Hinweis</span><textarea data-combat-encounter-field="body" rows="2" placeholder="Wo und warum beginnt oder endet der Kampf?"></textarea></label>
          <label data-combat-encounter-winning hidden><span>Siegreiche Partei</span><select data-combat-encounter-field="winning-party"></select></label>
          <label data-combat-encounter-award hidden class="combat-encounter-check"><input type="checkbox" data-combat-encounter-field="award-experience" checked> EP automatisch und gleichmäßig vergeben</label>
        </div>
        <div class="combat-encounter-list-head"><input type="search" data-combat-encounter-field="search" placeholder="Figur oder Kreatur suchen …"><span data-combat-encounter-count>0 ausgewählt</span></div>
        <div class="combat-encounter-list" data-combat-encounter-list></div>
        <p class="combat-encounter-status" data-combat-encounter-status></p>
      </div>
      <footer><button type="button" data-combat-encounter-action="close">Abbrechen</button><button type="button" class="primary" data-combat-encounter-action="submit">Eintragen</button></footer>
    </div>`;
  document.body.appendChild(overlay);
  return overlay;
}

export function renderOperationButtons(active, operation) {
  const host = document.querySelector('[data-combat-encounter-operations]');
  if (!host) return;
  const operations = active
    ? [['add', 'Kämpfer hinzufügen'], ['remove', 'Kämpfer entfernen'], ['end', 'Kampf beenden']]
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
      ? `<select data-combat-encounter-field="status" aria-label="Kampfstatus"><option value="active"${candidate.status === 'active' ? ' selected' : ''}>Aktiv</option><option value="defeated"${candidate.status === 'defeated' ? ' selected' : ''}>Besiegt</option><option value="fled"${candidate.status === 'fled' ? ' selected' : ''}>Geflohen</option><option value="left"${candidate.status === 'left' ? ' selected' : ''}>Ausgeschieden</option></select>`
      : `<input data-combat-encounter-field="party" value="${escapeMarkup(candidate.partyName || candidate.partyId || '')}" placeholder="Partei, z. B. Draig">`;
    const checked = operation === 'end' || candidate.selected;
    const runtimeDetails = [
      Number(candidate.maximumHitPoints) > 0 ? `TP ${Number(candidate.currentHitPoints) || 0}/${Number(candidate.maximumHitPoints)}` : '',
      ...(Array.isArray(candidate.conditionNames) ? candidate.conditionNames.slice(0, 3) : []),
      candidate.concentrationName ? `Konzentration: ${candidate.concentrationName}` : '',
      candidate.channelingName ? `Kanalisierung: ${candidate.channelingName}` : ''
    ].filter(Boolean).join(' · ');
    return `<label class="combat-encounter-person" data-combat-encounter-candidate data-actor-id="${escapeMarkup(candidate.actorId)}" data-search="${escapeMarkup(candidate.searchText || '')}">
      <input type="checkbox" data-combat-encounter-field="participant"${checked ? ' checked' : ''}${operation === 'end' ? ' hidden' : ''}>
      <span class="combat-encounter-portrait">${candidate.portrait ? `<img src="${escapeMarkup(candidate.portrait)}" alt="">` : escapeMarkup((candidate.name || '?').slice(0, 1))}</span>
      <span class="combat-encounter-copy"><strong>${escapeMarkup(candidate.name)}</strong><small>${escapeMarkup(candidate.title || (candidate.entityType === 'creature' ? 'Kreatur' : 'Charakter'))}</small>${runtimeDetails ? `<small class="combat-encounter-runtime">${escapeMarkup(runtimeDetails)}</small>` : ''}</span>
      <span class="combat-encounter-control">${statusControl}</span>
    </label>`;
  }).join('');
}

export function setEncounterEndControls(visible, parties = [], selected = '') {
  const winning = document.querySelector('[data-combat-encounter-winning]');
  const award = document.querySelector('[data-combat-encounter-award]');
  if (winning) winning.hidden = !visible;
  if (award) award.hidden = !visible;
  const select = document.querySelector('[data-combat-encounter-field="winning-party"]');
  if (select) select.innerHTML = parties.map(party => `<option value="${escapeMarkup(party.id)}"${party.id === selected ? ' selected' : ''}>${escapeMarkup(party.name)}</option>`).join('');
}

export function filterEncounterCandidates(query = '') {
  const needle = String(query || '').trim().toLocaleLowerCase('de');
  document.querySelectorAll('[data-combat-encounter-candidate]').forEach(row => {
    row.hidden = !!needle && !String(row.dataset.search || '').includes(needle);
  });
}

export function updateEncounterCount() {
  const count = document.querySelectorAll('[data-combat-encounter-field="participant"]:checked').length;
  const output = document.querySelector('[data-combat-encounter-count]');
  if (output) output.textContent = `${count} ausgewählt`;
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
  button.textContent = submitting ? 'Wird gespeichert …' : 'Eintragen';
}

export function renderCombatEncounterComment(comment = {}, index = 0) {
  const event = normalizeCombatEncounterEvent(comment.combatEncounter || comment);
  const labels = { start: 'Kampf beginnt', add: 'Verstärkung', remove: 'Kampfliste geändert', end: 'Kampf beendet' };
  const statuses = { active: 'aktiv', defeated: 'besiegt', fled: 'geflohen', left: 'ausgeschieden' };
  const participants = event.participants.map(participant => `<li><b>${escapeMarkup(participant.name)}</b><span>${escapeMarkup(participant.partyName)} · ${statuses[participant.status] || participant.status}</span></li>`).join('');
  const awards = event.experience.awards.map(award => `<li><b>${escapeMarkup(award.name)}</b><span>+${award.experience} EP · ${award.beforeExperience}→${award.afterExperience}${award.levelUpAvailable ? ` · Stufe ${award.availableLevel} verfügbar` : ''}</span></li>`).join('');
  const divider = index > 0 ? '<div class="comment-divider"><span class="comment-divider-icon">*</span></div>' : '';
  return `${divider}<section class="combat-encounter-event" data-operation="${event.operation}">
    <header><img src="${COMBAT_ENCOUNTER_ICON_URL}" alt=""><span>${labels[event.operation]}</span><strong>${escapeMarkup(event.title)}</strong></header>
    ${event.body ? `<p>${escapeMarkup(event.body)}</p>` : ''}
    ${participants ? `<ul>${participants}</ul>` : ''}
    ${awards ? `<div class="combat-encounter-awards"><strong>${event.experience.total} EP aus dem Sieg</strong><ul>${awards}</ul></div>` : ''}
    ${event.operation === 'end' && !awards ? '<small>Kampfzustände und Konzentrationen wurden beendet. Es wurden keine EP vergeben.</small>' : ''}
  </section>`;
}

export const combatEncounterUiInternals = Object.freeze({ escapeMarkup });
