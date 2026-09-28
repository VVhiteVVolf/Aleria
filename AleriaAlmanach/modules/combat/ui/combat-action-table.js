import { getActionGroups } from './combat-action-card.js?v=20260928-equipment-art-v1';
import { escapeActionHtml as escape } from './combat-action-choice.js';
import { arsenalFavorites, matchesArsenalChoice } from './combat-arsenal-model.js';
import { renderArsenalCard, renderArsenalDetail, renderArsenalResources } from './combat-arsenal-view.js?v=20260928-equipment-art-v1';

export function renderActionTable(actor, selectedId, groups = getActionGroups(actor)) {
  const sections = [...groups.entries()].filter(([, actions]) => actions.length);
  const navigation = [['all', 'Alle Handlungen', sections.reduce((sum, [, actions]) => sum + actions.length, 0)], ['favorites', '☆ Favoriten', 0], ...sections.map(([key, actions]) => [key, actions[0].group, actions.length])];
  return `<header class="combat-action-table-header"><div><small>Dein Arsenal · ${escape(actor.name || 'Figur')}</small><h2>Deine nächste Handlung</h2><p>Bereich wählen. Möglichkeiten entdecken. Gezielt handeln.</p></div><button type="button" data-action="close-action-table" aria-label="Übersicht schließen">×</button></header>
    <div class="combat-action-table-tools"><label>Arsenal durchsuchen<input type="search" data-combat-action-search placeholder="Name, Kampfform oder Wirkung …" autocomplete="off"></label><div class="combat-arsenal-resources" aria-label="Aktionsvorrat">${renderArsenalResources(actor)}</div>
    <div class="combat-arsenal-filters"><div role="group" aria-label="Handlungsart">${[['all', 'Alles'], ['attack', 'Angriff'], ['support', 'Schutz & Unterstützung'], ['special', 'Besondere Aktion']].map(([key, label]) => `<button type="button" data-arsenal-filter="${key}" aria-pressed="${key === 'all'}">${label}</button>`).join('')}</div><label><input type="checkbox" data-action="available-actions-only"> Nur einsetzbar <span title="Zeigt Handlungen mit erfüllten Ausrüstungs- und Klassenvoraussetzungen. Die Bezahlung wird beim Reservieren geprüft.">ⓘ</span></label></div></div>
    <div class="combat-arsenal-workspace"><nav class="combat-arsenal-nav" aria-label="Arsenalbereiche"><small>Bereiche</small>${navigation.map(([key, label, count]) => `<button type="button" data-arsenal-section="${escape(key)}" aria-pressed="${key === 'all'}"><span>${escape(label)}</span><b data-arsenal-count>${count}</b></button>`).join('')}</nav>
    <section class="combat-arsenal-results" aria-label="Handlungen"><div class="combat-arsenal-results-heading"><h3 data-arsenal-heading>Alle Handlungen</h3><span data-arsenal-result-count role="status"></span></div><div class="combat-arsenal-grid">${sections.flatMap(([, actions]) => actions.map(choice => renderArsenalCard(actor, choice, selectedId))).join('')}</div><p data-combat-action-empty hidden>Keine passende Handlung. Wähle einen anderen Bereich oder passe die Filter an.</p></section>
    <aside class="combat-arsenal-detail" aria-label="Handlungsdetails">${renderArsenalDetail(actor)}</aside></div>
    <footer>☆ Favoriten bleiben für diese Figur in diesem Browser gespeichert. Die Suche durchsucht immer das gesamte Arsenal.</footer>`;
}

/** Owned by the composer; previewing and favoriting never change the selected action. */
export function bindActionTable(composer, actor, select, onChoose) {
  const trigger = composer.querySelector('[data-action="open-action-table"]');
  if (!trigger) return;
  trigger.addEventListener('click', () => {
    composer.querySelector('[data-combat-details="action-picker"]').open = false;
    composer.querySelector('.combat-action-table')?.remove();
    const dialog = composer.ownerDocument.createElement('dialog');
    dialog.className = 'combat-action-table';
    dialog.setAttribute('aria-label', 'Handlung aus dem Arsenal auswählen');
    const groups = getActionGroups(actor);
    const choices = [...groups.values()].flat();
    let storage;
    try { storage = composer.ownerDocument.defaultView.localStorage; } catch { /* Optional local preference. */ }
    const favorites = arsenalFavorites(actor, storage);
    const hasFavorites = choices.some(choice => favorites.ids.has(choice.action.id));
    const state = { section: hasFavorites ? 'favorites' : 'all', filter: 'all', query: '', onlyAvailable: false, favorites: favorites.ids };
    let inspectedId = '';
    dialog.innerHTML = renderActionTable(actor, select.value, groups);
    composer.append(dialog);
    const search = dialog.querySelector('[data-combat-action-search]');
    const cards = [...dialog.querySelectorAll('[data-arsenal-card]')];
    const detail = dialog.querySelector('.combat-arsenal-detail');
    const inspect = id => {
      inspectedId = id;
      cards.forEach(card => card.querySelector('[data-combat-action-option]').setAttribute('aria-pressed', String(card.dataset.arsenalCard === id)));
      detail.innerHTML = renderArsenalDetail(actor, choices.find(choice => choice.action.id === id));
      detail.scrollTop = 0;
    };
    const refresh = () => {
      const visible = choices.filter(choice => matchesArsenalChoice(choice, state, actor));
      const ids = new Set(visible.map(choice => choice.action.id));
      cards.forEach(card => { card.hidden = !ids.has(card.dataset.arsenalCard); });
      dialog.querySelector('[data-combat-action-empty]').hidden = visible.length > 0;
      dialog.querySelector('[data-arsenal-result-count]').textContent = `${visible.length} ${visible.length === 1 ? 'Handlung' : 'Handlungen'}`;
      dialog.querySelectorAll('[data-arsenal-section]').forEach(button => {
        const section = button.dataset.arsenalSection;
        button.setAttribute('aria-pressed', String(!state.query.trim() && section === state.section));
        button.querySelector('[data-arsenal-count]').textContent = choices.filter(choice => matchesArsenalChoice(choice, { ...state, query: '', section }, actor)).length;
      });
      const activeSection = [...dialog.querySelectorAll('[data-arsenal-section]')].find(button => button.dataset.arsenalSection === state.section);
      dialog.querySelector('[data-arsenal-heading]').textContent = state.query.trim() ? 'Suchergebnisse · gesamtes Arsenal' : activeSection.querySelector('span').textContent;
      dialog.querySelectorAll('[data-arsenal-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.arsenalFilter === state.filter)));
      dialog.querySelectorAll('[data-arsenal-favorite]').forEach(button => {
        const selected = favorites.ids.has(button.dataset.arsenalFavorite);
        button.setAttribute('aria-pressed', String(selected)); button.textContent = selected ? '★' : '☆';
        const name = choices.find(choice => choice.action.id === button.dataset.arsenalFavorite)?.label || 'Handlung';
        button.setAttribute('aria-label', `${name}: ${selected ? 'Favorit entfernen' : 'als Favorit merken'}`);
        button.title = selected ? 'Favorit entfernen' : 'Favorit merken';
      });
      if (!ids.has(inspectedId)) inspect('');
    };
    dialog.addEventListener('input', () => {
      state.query = search.value;
      state.onlyAvailable = dialog.querySelector('[data-action="available-actions-only"]').checked;
      refresh();
      dialog.querySelector('.combat-arsenal-results').scrollTop = 0;
    });
    dialog.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (button?.dataset.action === 'back-to-arsenal') {
        const previous = cards.find(card => card.dataset.arsenalCard === inspectedId);
        inspect(''); previous?.querySelector('[data-combat-action-option]')?.focus();
      }
      if (button?.dataset.action === 'close-action-table') dialog.close();
      if (button?.dataset.arsenalSection) {
        state.section = button.dataset.arsenalSection; state.query = ''; search.value = ''; refresh();
        dialog.querySelector('.combat-arsenal-results').scrollTop = 0;
      }
      if (button?.dataset.arsenalFilter) { state.filter = button.dataset.arsenalFilter; refresh(); }
      if (button?.dataset.arsenalFavorite) {
        const id = button.dataset.arsenalFavorite;
        if (favorites.ids.has(id)) favorites.ids.delete(id); else favorites.ids.add(id);
        favorites.save(); refresh();
      }
      if (button?.dataset.combatActionOption) {
        inspect(button.dataset.combatActionOption);
        if (composer.ownerDocument.defaultView.matchMedia('(max-width: 600px)').matches) detail.querySelector('[data-action="back-to-arsenal"]').focus();
      }
      if (button?.dataset.action === 'choose-arsenal-action' && !button.disabled) {
        const choice = choices.find(item => item.action.id === inspectedId);
        const option = cards.find(card => card.dataset.arsenalCard === inspectedId)?.querySelector('[data-combat-action-option]');
        if (choice && choice.action.compatible !== false && option && !option.closest('[hidden]')) { dialog.close(); onChoose(option); }
      }
      if (event.target === dialog) {
        const bounds = dialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
      }
    });
    dialog.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); dialog.close(); }
      if (event.key === 'Enter' && event.target === search) {
        event.preventDefault();
        const first = cards.find(card => !card.hidden)?.querySelector('[data-combat-action-option]');
        first?.click(); first?.focus();
      }
    });
    dialog.addEventListener('close', () => trigger.focus({ preventScroll: true }));
    dialog.addEventListener('error', event => {
      if (event.target.matches?.('[data-combat-picker-image]')) event.target.remove();
    }, true);
    refresh();
    if (!composer.ownerDocument.defaultView.matchMedia('(max-width: 600px)').matches && cards.some(card => !card.hidden && card.dataset.arsenalCard === select.value)) inspect(select.value);
    dialog.showModal();
    search.focus();
  });
}
