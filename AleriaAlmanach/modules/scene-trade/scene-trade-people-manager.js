import { escape as html } from '../item-register/item-register-markup.js';
import { normalizeSceneTradeSearch } from './scene-trade-catalog.js';
import { renderSceneTradeActorAvatar } from './scene-trade-actor-picker.js';
import { sceneTradePersonAliases } from './scene-trade-participants.js';

const lockedIds = state => new Set([
  ...state.lines.flatMap(line => [line.payerKey, line.recipientKey, line.sellerKey])
    .filter(key => key?.startsWith('character:')).map(key => key.slice('character:'.length)),
  ...(state.lines.length ? [state.actorCharacterId] : [])
]);

export function renderSceneTradePeopleManager({ accounts, selected, state, loading = false, error = '', persistent = true }) {
  const used = lockedIds(state);
  const people = selected.filter(account => account.kind === 'character');
  const chips = people.map(account => `<button type="button" class="scene-trade-person-chip" data-trade-person-action="remove" data-person-id="${html(account.id)}" aria-label="${html(account.name)} aus Handelsauswahl entfernen"${used.has(account.id) ? ' disabled title="In der Bestellung verwendet; zuerst die Position ändern oder entfernen"' : ''}>${renderSceneTradeActorAvatar(account)}<span class="scene-trade-actor-name">${html(account.name)}</span><span aria-hidden="true">×</span></button>`).join('');
  return `<details class="scene-trade-people" data-trade-people><summary>Personen · ${people.length}<span>Auswahl bearbeiten</span></summary><div class="scene-trade-people-body"><p class="scene-trade-hint">Modulbesetzung, Hierarchie und bisherige Beiträge bestimmen die Vorauswahl. Ergänzungen und Ausblendungen gelten für deinen Handel in dieser Szene.</p><div class="scene-trade-people-selected">${chips || '<p class="scene-trade-hint">Noch keine Person zugeordnet. Suche eine Figur und ergänze sie.</p>'}</div><label>Weitere Figur ergänzen<input type="search" class="scene-trade-actor-search" data-trade-people-search placeholder="Mindestens zwei Buchstaben …" autocomplete="off"></label><div data-trade-people-results aria-live="polite"></div><button type="button" class="scene-trade-text-button" data-trade-person-action="reset">Automatische Auswahl wiederherstellen</button>${loading ? '<p class="scene-trade-hint" role="status">Bisherige Beiträge werden ergänzt …</p>' : ''}${error ? `<p class="scene-trade-hint">${html(error)}</p>` : ''}${!persistent ? '<p class="scene-trade-hint">Der Browser blockiert die Speicherung. Die Auswahl bleibt für dieses offene Fenster erhalten.</p>' : ''}</div></details>`;
}

export function mountSceneTradePeopleManager(root, { getContext, canEdit, onChange }) {
  const lifetime = new AbortController();
  function search(input) {
    const { accounts, selected } = getContext(), ids = new Set(selected.map(account => account.key));
    const query = normalizeSceneTradeSearch(input.value), container = input.closest('[data-trade-people]').querySelector('[data-trade-people-results]');
    if (query.length < 2) { container.replaceChildren(); return; }
    const matches = accounts.filter(account => account.kind === 'character' && !account.record.archived && !ids.has(account.key)
      && normalizeSceneTradeSearch(`${account.name} ${account.record.title || ''} ${sceneTradePersonAliases(account.record).join(' ')}`).includes(query));
    container.innerHTML = matches.slice(0, 12).map(account => `<button type="button" class="scene-trade-actor-option" data-trade-person-action="add" data-person-id="${html(account.id)}">${renderSceneTradeActorAvatar(account)}<span class="scene-trade-actor-name">${html(account.name)}<small>${html(account.record.title || 'Zum Handel ergänzen')}</small></span><span aria-hidden="true">+</span></button>`).join('') || '<p class="scene-trade-hint">Keine weitere passende Figur gefunden.</p>';
    if (matches.length > 12) container.insertAdjacentHTML('beforeend', '<p class="scene-trade-hint">Mehr als zwölf Treffer – grenze den Namen weiter ein.</p>');
  }
  root.addEventListener('input', event => {
    if (event.target.matches?.('[data-trade-people-search]') && canEdit()) search(event.target);
  }, { signal: lifetime.signal });
  root.addEventListener('click', event => {
    const button = event.target.closest?.('[data-trade-person-action]');
    if (!button || !root.contains(button) || button.disabled || !canEdit()) return;
    event.preventDefault();
    const { state } = getContext();
    if (button.dataset.tradePersonAction === 'remove' && lockedIds(state).has(button.dataset.personId)) return;
    onChange(button.dataset.tradePersonAction, button.dataset.personId || '');
  }, { signal: lifetime.signal });
  return { destroy: () => lifetime.abort() };
}
