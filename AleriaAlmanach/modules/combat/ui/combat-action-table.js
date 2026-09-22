import { getActionGroups } from './combat-action-card.js?v=20260909-dragon-parent-v2';
import { escapeActionHtml, renderActionChoice, filterActionChoices } from './combat-action-choice.js';

export function renderActionTable(actor, selectedId, groups = getActionGroups(actor)) {
  const columns = [...groups.values()].filter(actions => actions.length);
  return `<header class="combat-action-table-header"><div><small>Dein Arsenal</small><h2>Handlung auswählen</h2><p>${escapeActionHtml(actor.name || 'Figur')} · Nach Kampfform und Bereich geordnet</p></div><button type="button" data-action="close-action-table" aria-label="Übersicht schließen">×</button></header>
    <div class="combat-action-table-tools"><label>Arsenal durchsuchen<input type="search" data-combat-action-search placeholder="Name, Kampfform oder Wirkung …" autocomplete="off"></label><label class="combat-action-table-filter"><input type="checkbox" data-action="available-actions-only"> Nur einsetzbare Handlungen</label></div>
    <div class="combat-action-table-scroll" tabindex="0" aria-label="Bereiche der Handlungsauswahl">
      <table><caption>Jede Spalte enthält einen Bereich deines Arsenals. Eine Handlung anklicken, um sie auszuwählen.</caption><thead><tr>${columns.map((actions, index) => `<th scope="col" data-action-column="${index}">${escapeActionHtml(actions[0].group)} <span data-combat-group-count>${actions.length}</span></th>`).join('')}</tr></thead>
      <tbody><tr>${columns.map((actions, index) => `<td data-combat-action-group data-action-column="${index}">${actions.map(choice => renderActionChoice(actor, choice, selectedId, { detailed: true })).join('')}</td>`).join('')}</tr></tbody></table>
    </div><p data-combat-action-empty role="status" hidden>Keine passende Handlung gefunden.</p>
    <footer>Die Auswahl reserviert noch keine Kosten. Reguläre Kosten stehen an jeder Handlung; alternative Bezahlung wählst du anschließend im Beitrag.</footer>`;
}

/** Owned by the current composer: removing/replacing it also removes the dialog. */
export function bindActionTable(composer, actor, select, onChoose) {
  const trigger = composer.querySelector('[data-action="open-action-table"]');
  if (!trigger) return;
  trigger.addEventListener('click', () => {
    composer.querySelector('[data-combat-details="action-picker"]').open = false;
    let dialog = composer.querySelector('.combat-action-table');
    if (!dialog) {
      dialog = composer.ownerDocument.createElement('dialog');
      dialog.className = 'combat-action-table';
      dialog.setAttribute('aria-label', 'Handlung aus dem Arsenal auswählen');
      dialog.innerHTML = renderActionTable(actor, select.value);
      composer.append(dialog);
      const search = dialog.querySelector('[data-combat-action-search]');
      const onlyAvailable = dialog.querySelector('[data-action="available-actions-only"]');
      const filter = () => filterActionChoices(dialog, search.value, { onlyAvailable: onlyAvailable.checked });
      dialog.addEventListener('input', filter);
      dialog.addEventListener('click', event => {
        if (event.target.closest('[data-action="close-action-table"]')) dialog.close();
        const option = event.target.closest('[data-combat-action-option]');
        if (option && !option.disabled && !option.hidden) {
          dialog.close();
          onChoose(option);
        }
        if (event.target === dialog) {
          const bounds = dialog.getBoundingClientRect();
          if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
        }
      });
      dialog.addEventListener('keydown', event => {
        // Escape belongs to this modal, not to an enclosing comment editor.
        if (event.key === 'Escape') event.stopPropagation();
        if (event.key === 'Enter' && event.target === search) {
          event.preventDefault();
          dialog.querySelector('[data-combat-action-option]:not(:disabled):not([hidden])')?.click();
        }
      });
      dialog.addEventListener('error', event => {
        if (event.target.matches?.('[data-combat-picker-image]')) event.target.remove();
      }, true);
      filter();
    }
    dialog.showModal();
    dialog.querySelector('[data-combat-action-search]').focus();
  });
}
