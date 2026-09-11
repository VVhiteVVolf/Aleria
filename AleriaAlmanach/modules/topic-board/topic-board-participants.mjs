import { createParticipantSelection } from './topic-board-participant-selection.mjs';

export function mountParticipantPicker(root, { characters, selected, groups = [], limit, escape, image, onChange }) {
  const selection = createParticipantSelection({ characters, selected, limit });
  const lifetime = new AbortController();
  const sources = groups.filter(group => group.participants?.length);
  root.innerHTML = `
    <div class="topic-board-people-heading"><div><span class="topic-board-form-label">Besetzung zusammenstellen</span><p>Wer ist an diesem Faden beteiligt?</p></div><strong data-people-total aria-live="polite"></strong></div>
    <div class="topic-board-selected-people" data-people-selected aria-label="Ausgewählte Personen"></div>
    <div class="topic-board-people-tools">
      <button type="button" data-people-action="clear">Auswahl leeren</button>
      <button type="button" data-people-action="undo">Rückgängig</button>
      <label><input type="checkbox" data-people-selected-only> Nur Auswahl</label>
    </div>
    <label class="topic-board-field"><span>Personen suchen</span>
      <span class="topic-board-people-search"><input type="search" data-people-query placeholder="z. B. Idwal, Trevor, Siânmue" autocomplete="off" aria-describedby="topic-board-people-help"><button type="button" data-people-action="reset-search" aria-label="Personensuche leeren">×</button></span>
    </label>
    <p class="topic-board-people-help" id="topic-board-people-help">Mehrere Namen mit Komma trennen. Die Auswahl bleibt beim Weitersuchen erhalten.</p>
    <div class="topic-board-people-results"><span data-people-count aria-live="polite"></span><button type="button" data-people-action="add-results">Treffer hinzufügen</button></div>
    <div class="topic-board-character-list" data-people-results></div>
    <p class="topic-board-character-filter-empty" data-people-empty hidden>Keine passenden Figuren. Versuche einen kürzeren Namen oder leere die Suche.</p>
    ${sources.length ? `<div class="topic-board-people-reuse"><label class="topic-board-field"><span>Besetzung aus einem Thema ergänzen</span><select data-people-group><option value="">Thema auswählen …</option>${sources.map((group, index) => `<option value="${index}">${escape(group.title)} · ${group.participants.length} Personen</option>`).join('')}</select></label><button type="button" data-people-action="add-group">Übernehmen</button></div>` : ''}
    <p class="topic-board-people-status" data-people-status role="status"></p>`;
  const find = selector => root.querySelector(selector);
  const query = find('[data-people-query]');
  const only = find('[data-people-selected-only]');
  const status = find('[data-people-status]');
  const portrait = record => {
    const src = image(record.portrait || '');
    return src ? `<img src="${src}" alt="" loading="lazy" decoding="async">` : `<span class="topic-board-person-initial" aria-hidden="true">${escape((record.name || '?').slice(0, 1))}</span>`;
  };
  const results = () => selection.filter(query.value, only.checked);
  function render() {
    const picked = selection.selected();
    const visible = results();
    find('[data-people-total]').textContent = `${picked.length} / ${limit}`;
    find('[data-people-selected]').innerHTML = picked.length ? picked.map(record => `<button class="topic-board-person-chip" type="button" data-people-action="remove" data-person-id="${escape(record.id)}" aria-label="${escape(record.name)} entfernen">${portrait(record)}<span>${escape(record.name)}</span><span aria-hidden="true">×</span></button>`).join('') : '<span class="topic-board-people-placeholder">Noch offen – wähle die Beteiligten unten aus.</span>';
    find('[data-people-results]').innerHTML = visible.map(record => `<button type="button" class="topic-board-character${selection.has(record.id) ? ' selected' : ''}" data-people-action="toggle" data-person-id="${escape(record.id)}" aria-pressed="${selection.has(record.id)}">${portrait(record)}<span class="topic-board-person-copy"><strong>${escape(record.name || 'Unbekannt')}</strong>${record.title ? `<small>${escape(record.title)}</small>` : ''}</span><span class="topic-board-person-check" aria-hidden="true">${selection.has(record.id) ? '✓' : '+'}</span></button>`).join('');
    find('[data-people-count]').textContent = `${visible.length} von ${selection.list().length} Figuren`;
    find('[data-people-empty]').hidden = visible.length > 0;
    find('[data-people-action="clear"]').disabled = !picked.length;
    find('[data-people-action="undo"]').disabled = !selection.canUndo();
    find('[data-people-action="add-results"]').disabled = !visible.some(record => !selection.has(record.id));
    find('[data-people-action="reset-search"]').disabled = !query.value;
  }
  function add(records) {
    const { added, skipped } = selection.add(records);
    status.textContent = `${added} ${added === 1 ? 'Person ergänzt' : 'Personen ergänzt'}.${skipped ? ` Maximal ${limit} Personen; ${skipped} weitere wurden nicht übernommen.` : ''}`;
  }
  root.addEventListener('click', event => {
    const button = event.target.closest('[data-people-action]');
    if (!button || !root.contains(button)) return;
    const action = button.dataset.peopleAction;
    const id = button.dataset.personId;
    status.textContent = '';
    if (action === 'reset-search') { query.value = ''; render(); query.focus(); return; }
    if (action === 'toggle' && !selection.has(id)) add([id]);
    else if (action === 'toggle' || action === 'remove') selection.remove(id);
    else if (action === 'add-results') add(results());
    else if (action === 'add-group') {
      const value = find('[data-people-group]').value;
      if (value === '') { status.textContent = 'Wähle zuerst ein Thema aus.'; return; }
      add(sources[Number(value)]?.participants || []);
    } else if (action === 'clear') selection.clear();
    else if (action === 'undo') selection.undo();
    render(); onChange(selection.selected());
    if (!button.isConnected) {
      const replacement = Array.from(root.querySelectorAll('[data-people-action]')).find(element => element.dataset.peopleAction === action && element.dataset.personId === id);
      (replacement || query).focus({ preventScroll: true });
    }
  }, { signal: lifetime.signal });
  root.addEventListener('input', event => {
    if (event.target === query || event.target === only) render();
  }, { signal: lifetime.signal });
  root.addEventListener('error', event => {
    const broken = event.target;
    if (!broken.matches?.('img')) return;
    const id = broken.closest('[data-person-id]')?.dataset.personId;
    const record = selection.list().find(item => item.id === id);
    const fallback = document.createElement('span');
    fallback.className = 'topic-board-person-initial';
    fallback.setAttribute('aria-hidden', 'true');
    fallback.textContent = (record?.name || '?').slice(0, 1);
    broken.replaceWith(fallback);
  }, { capture: true, signal: lifetime.signal });
  // Enter inside the search must never submit the surrounding proposal form.
  query.addEventListener('keydown', event => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    if (event.ctrlKey || event.metaKey) return;
    const visible = results();
    if (visible.length === 1) { add(visible); render(); onChange(selection.selected()); }
    else find('[data-people-action="add-results"]').focus();
  }, { signal: lifetime.signal });
  render();
  return { collect: selection.selected, destroy: () => lifetime.abort() };
}
