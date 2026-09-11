import { CALENDAR_TEMPLATES, createCalendarEventModel } from './calendar-events-model.mjs';
import { mountCalendarDatePicker, escapeCalendarText as e } from './calendar-date-picker.mjs';
import { renderCalendarPreview, renderCalendarParticipants, safeCalendarUrl, bindCalendarImageFallback } from './calendar-preview.mjs';

export function createCalendarEditor({ store, calendar = globalThis.AleriaCalendar }) {
  const model = createCalendarEventModel(calendar);
  const overlay = document.createElement('div');
  overlay.id = 'calendar-editor-overlay'; overlay.className = 'calendar-editor-overlay';
  overlay.setAttribute('aria-labelledby', 'calendar-editor-title');
  document.body.append(overlay);
  let draft = null, startPicker, endPicker, people = [], busy = false, selectingIcon = false, revision = 0;
  bindCalendarImageFallback(overlay);
  const field = name => overlay.querySelector(`[name="${name}"]`);
  const status = message => { overlay.querySelector('[data-calendar-editor-status]').textContent = message; };
  function collect() {
    return { ...draft, title: field('title').value, type: field('type').value,
      start: startPicker.getValue(), end: endPicker.getValue(), startTime: field('startTime').value, endTime: field('endTime').value,
      recurrence: field('recurrence').value, location: field('location').value, summary: field('summary').value };
  }
  function preview() {
    try {
      const event = model.normalize(collect());
      const conflicts = model.occurrences(store.getState().events.filter(item => item.id !== event.id), event.start, event.end).filter(item => model.overlaps(event, item));
      overlay.querySelector('[data-calendar-editor-preview]').innerHTML = renderCalendarPreview(event, { calendar, compact: true, collision: conflicts.length > 0 });
    } catch (error) { overlay.querySelector('[data-calendar-editor-preview]').textContent = error.message; }
  }
  function renderPeople() {
    const needle = field('personSearch').value.toLocaleLowerCase('de');
    const chosen = new Set(draft.participants.map(person => person.id));
    overlay.querySelector('[data-calendar-selected-people]').innerHTML = draft.participants.map(person => `<button type="button" data-calendar-person="${e(person.id)}" title="${e(person.name)} entfernen">${renderCalendarParticipants([person])}<span aria-hidden="true">×</span></button>`).join('');
    const candidates = people.filter(person => !chosen.has(person.id) && person.name.toLocaleLowerCase('de').includes(needle));
    overlay.querySelector('[data-calendar-people]').innerHTML = candidates.slice(0, 40).map(person => `<button type="button" data-calendar-person="${e(person.id)}">${renderCalendarParticipants([person])}<span aria-hidden="true">+</span></button>`).join('') || '<p>Keine weiteren passenden Charaktere.</p>';
  }
  async function loadPeople(openRevision) {
    try {
      const source = typeof globalThis.getVisibleCharacterRecords === 'function'
        ? globalThis.getVisibleCharacterRecords()
        : await globalThis._fb?.loadCharacters?.({ throwOnError: true });
      if (revision !== openRevision) return;
      if (!source) throw new Error('Das Charakterregister wird nach dem Verbinden geladen.');
      people = source.filter(person => person.id && person.name).map(person => ({ id: String(person.id), name: person.name, portrait: person.portrait || '' }));
      renderPeople();
    } catch (error) { if (revision === openRevision) overlay.querySelector('[data-calendar-people]').textContent = error.message; }
  }
  function close() {
    if (busy) return;
    revision++; selectingIcon = false; globalThis.deactivateDialog(overlay.id);
  }
  function open(event = null, date = calendar.current()) {
    if (busy) return;
    revision++;
    startPicker?.destroy(); endPicker?.destroy();
    draft = event ? structuredClone(event) : { id: '', revision: 0, title: '', type: 'other', start: date, end: date, participants: [], icon: '', summary: '', location: '', recurrence: 'none' };
    const options = (items, selected) => items.map(([id, label]) => `<option value="${e(id)}"${id === selected ? ' selected' : ''}>${e(label)}</option>`).join('');
    overlay.innerHTML = `<form class="calendar-editor"><header><div><small>Kalender von Aleria</small><h2 id="calendar-editor-title">${event ? 'Termin bearbeiten' : 'Neuer Termin'}</h2></div><button type="button" data-calendar-editor-close aria-label="Schließen">×</button></header>
      <div class="calendar-editor-body"><div class="calendar-editor-grid">
      <label>Vorlage<select name="type">${options(CALENDAR_TEMPLATES.map(item => [item.id, item.name]), draft.type)}</select></label>
      <label>Wiederholung<select name="recurrence">${options([['none', 'Einmalig'], ['week', 'Alle neun Tage'], ['year', 'Jedes Aleria-Jahr']], draft.recurrence)}</select></label>
      <label class="calendar-wide">Titel<input name="title" required maxlength="150" value="${e(draft.title)}" placeholder="Wie heißt der Termin?"></label>
      <div><span>Beginn</span><div data-calendar-start></div></div><div><span>Ende</span><div data-calendar-end></div></div>
      <label>Von · 24 Stunden (optional)<input type="text" inputmode="numeric" name="startTime" placeholder="HH:MM" maxlength="5" pattern="(?:[01]\\d|2[0-3]):[0-5]\\d" value="${e(draft.startTime || '')}"></label><label>Bis · 24 Stunden (optional)<input type="text" inputmode="numeric" name="endTime" placeholder="HH:MM" maxlength="5" pattern="(?:[01]\\d|2[0-3]):[0-5]\\d" value="${e(draft.endTime || '')}"></label>
      <label class="calendar-wide">Ort / Herrschaft<input name="location" maxlength="200" value="${e(draft.location)}" placeholder="z. B. Gwynthor, Halle des Grafen"></label>
      <label class="calendar-wide">Kurzer Überblick<textarea name="summary" rows="3" maxlength="2400">${e(draft.summary)}</textarea></label></div>
      <div class="calendar-icon-choice"><img data-calendar-chosen-icon src="${safeCalendarUrl(draft.icon) || '../IconOrdner/ReiterIcons/Kalender.png'}" alt="Gewähltes Icon"><button type="button" data-calendar-pick-icon>Icon aus dem Verzeichnis wählen</button><button type="button" data-calendar-reset-icon>Vorlagen-Icon</button></div>
      <details class="calendar-people-picker"><summary>Beteiligte Charaktere <span data-calendar-person-count>${draft.participants.length}</span></summary><label>Charakter suchen<input name="personSearch" type="search" placeholder="Name eingeben …"></label><div data-calendar-people>Charakterregister wird geladen …</div></details>
      <div class="calendar-selected-people" data-calendar-selected-people></div>
      <section class="calendar-editor-preview"><h3>Vorschau</h3><div data-calendar-editor-preview></div></section>
      <p class="calendar-help">${draft.recurrence !== 'none' ? 'Änderungen gelten für die gesamte Terminserie. ' : ''}Ohne Uhrzeiten gilt der Termin ganztägig.</p>
      </div><footer><p data-calendar-editor-status role="status"></p><div>${event ? '<button type="button" data-calendar-delete>Termin entfernen</button>' : ''}<button type="button" data-calendar-editor-close>Abbrechen</button><button type="submit" class="calendar-primary">${store.getState().online ? 'Termin speichern' : 'Auf diesem Gerät speichern'}</button></div></footer></form>`;
    startPicker = mountCalendarDatePicker(overlay.querySelector('[data-calendar-start]'), { value: draft.start, calendar, onChange: dateValue => {
      if (calendar.ordinal(dateValue) > calendar.ordinal(endPicker.getValue())) endPicker.setValue(dateValue);
      preview();
    } });
    endPicker = mountCalendarDatePicker(overlay.querySelector('[data-calendar-end]'), { value: draft.end, calendar, onChange: preview });
    field('summary').placeholder = CALENDAR_TEMPLATES.find(item => item.id === draft.type)?.prompt || '';
    preview(); renderPeople(); loadPeople(revision);
    globalThis.activateDialog(overlay.id, { initialFocus: '[name="title"]' });
  }
  overlay.addEventListener('input', event => {
    if (event.target.name === 'personSearch') renderPeople(); else preview();
  });
  overlay.addEventListener('change', event => {
    if (event.target.name !== 'type') { preview(); return; }
    const template = CALENDAR_TEMPLATES.find(item => item.id === field('type').value);
    if (!field('title').value) field('title').value = template.title;
    field('summary').placeholder = template.prompt;
    field('recurrence').value = template.recurrence;
    if (!draft.icon) overlay.querySelector('[data-calendar-chosen-icon]').src = `../IconOrdner/${template.icon}`;
    preview();
  });
  overlay.addEventListener('click', async event => {
    const button = event.target.closest('button');
    if (!button || busy) return;
    if (button.hasAttribute('data-calendar-editor-close')) close();
    if (button.hasAttribute('data-calendar-pick-icon')) { selectingIcon = true; globalThis.openIconDirectory(); }
    if (button.hasAttribute('data-calendar-reset-icon')) {
      draft.icon = ''; overlay.querySelector('[data-calendar-chosen-icon]').src = `../IconOrdner/${CALENDAR_TEMPLATES.find(item => item.id === field('type').value).icon}`; preview();
    }
    if (button.hasAttribute('data-calendar-person')) {
      const id = button.dataset.calendarPerson;
      if (draft.participants.some(person => person.id === id)) draft.participants = draft.participants.filter(person => person.id !== id);
      else if (draft.participants.length < 40) { const person = people.find(item => item.id === id); if (person) draft.participants.push(person); }
      overlay.querySelector('[data-calendar-person-count]').textContent = draft.participants.length;
      renderPeople(); preview();
    }
    if (button.hasAttribute('data-calendar-delete')) {
      if (button.dataset.confirm !== 'true') { button.dataset.confirm = 'true'; button.textContent = 'Entfernen bestätigen'; return; }
      await save({ ...draft, deleted: true });
    }
  });
  async function save(event) {
    busy = true; overlay.querySelectorAll('button').forEach(button => { button.disabled = true; }); status('Wird gespeichert …');
    overlay.querySelector('.calendar-editor-body').inert = true;
    try { await store.save(event); busy = false; close(); }
    catch (error) { status(error.message); }
    finally { busy = false; overlay.querySelector('.calendar-editor-body').inert = false; overlay.querySelectorAll('button').forEach(button => { button.disabled = false; }); }
  }
  overlay.addEventListener('submit', event => { event.preventDefault(); if (!busy) save(collect()); });
  document.addEventListener('almanach-icon-selected', event => {
    if (!selectingIcon || !overlay.classList.contains('active')) return;
    draft.icon = event.detail.src; selectingIcon = false;
    overlay.querySelector('[data-calendar-chosen-icon]').src = draft.icon;
    globalThis.closeIconDirectory(); preview();
  });
  globalThis.addEventListener('fb-ready', () => { if (overlay.classList.contains('active')) loadPeople(revision); });
  return { open, close };
}
