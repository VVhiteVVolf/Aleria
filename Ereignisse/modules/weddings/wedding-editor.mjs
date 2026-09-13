import { weddingText as e, weddingChanges } from './wedding-model.mjs';
import { weddingDetailsFields, readWeddingDetails, weddingEntryFields, readWeddingEntry } from './wedding-fields.mjs';
import { renderPortraitField, renderPortraitFields, readPortraitFields } from './wedding-portraits.mjs';

export function createWeddingEditor(dialog, { calendar }) {
  let onSubmit = null, onDelete = null, busy = false;
  function close() { if (!busy) { dialog.close(); dialog.innerHTML = ''; onSubmit = null; onDelete = null; } }
  function show({ title, body, submit = 'Entwurf speichern', save, remove }) {
    onSubmit = save; onDelete = remove || null;
    dialog.innerHTML = `<form><header><h2 id="wedding-dialog-title">${e(title)}</h2><button type="button" data-dialog-action="close" aria-label="Schließen">×</button></header><div class="wedding-dialog-body">${body}</div><footer><p class="wedding-dialog-status" data-dialog-status role="alert" hidden></p><div class="wedding-dialog-actions">${remove ? '<button type="button" data-dialog-action="delete" class="wedding-danger">Eintrag entfernen</button>' : ''}<button type="button" data-dialog-action="close">Abbrechen</button><button type="submit" class="wedding-primary">${e(submit)}</button></div></footer></form>`;
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
  }
  async function perform(action) {
    const status = dialog.querySelector('[data-dialog-status]');
    status.hidden = true;
    busy = true;
    const buttons = [...dialog.querySelectorAll('button')];
    buttons.forEach(button => { button.disabled = true; });
    try { await action(); busy = false; close(); }
    catch (error) { status.textContent = error.message; status.hidden = false; }
    finally { busy = false; buttons.forEach(button => { button.disabled = false; }); }
  }
  dialog.addEventListener('submit', event => {
    event.preventDefault();
    if (busy || !onSubmit) return;
    const form = event.target;
    perform(() => onSubmit(form));
  });
  dialog.addEventListener('click', event => {
    const button = event.target.closest('[data-dialog-action]');
    if (!button || busy) return;
    if (button.dataset.dialogAction === 'close') close();
    if (button.dataset.dialogAction === 'add-portrait') {
      const list = dialog.querySelector('[data-portrait-list]');
      if (list.children.length < 8) { list.insertAdjacentHTML('beforeend',renderPortraitField()); list.lastElementChild.querySelector('input').focus(); }
    }
    if (button.dataset.dialogAction === 'remove-portrait') button.closest('[data-portrait-field]').remove();
    if (button.dataset.dialogAction === 'delete') {
      if (button.dataset.confirmed === 'true') perform(onDelete);
      else { button.dataset.confirmed = 'true'; button.textContent = 'Entfernen bestätigen'; }
    }
  });
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  return Object.freeze({
    details(wedding, save, { creating = false } = {}) {
      show({ title: creating ? 'Ein neues Festbuch beginnen' : 'Brautpaar & Fest', body: `<p class="wedding-dialog-help">Alle Angaben lassen sich später ändern. Unbestimmte Termine bleiben leer.</p><div class="wedding-form-grid">${weddingDetailsFields(wedding,{creating,calendar})}</div>`, save: form => save(readWeddingDetails(form,wedding), new FormData(form).get('id')) });
    },
    entry(list, item, wedding, save, remove) {
      const titles = { guests: 'Gast & Beitrag', schedule: 'Programmpunkt', tasks: 'Vorbereitung' };
      show({ title: titles[list], body: `<div class="wedding-form-grid">${weddingEntryFields(list,item || {},wedding)}${list === 'guests' ? renderPortraitFields(item?.portraits) : ''}</div>`, save: form => save({...readWeddingEntry(form,list,item?.id || `eintrag-${crypto.randomUUID()}`),...(list === 'guests' ? {portraits:readPortraitFields(form)} : {})}), remove: item ? remove : null });
    },
    publish(state, save) {
      const changes = weddingChanges(state.envelope.revision ? state.published.wedding : null, state.envelope.wedding);
      show({ title: 'Festbuch veröffentlichen', submit: 'Auf GitHub veröffentlichen', body: `<p>Diese Fassung von <strong>${e(state.envelope.wedding.title)}</strong> wird zusammen mit dem Hochzeitsregister auf GitHub gespeichert und über die Website veröffentlicht.</p><ul class="wedding-publication-changes">${changes.map(change => `<li>${e(change)}</li>`).join('') || '<li>Aktuelle Fassung erneut speichern</li>'}</ul><p class="wedding-dialog-help">Ausgangsfassung ${state.envelope.revision} · ${state.envelope.wedding.guests.length} Gästebucheinträge. Der Schlüssel wird nur für diese Anfrage verwendet.</p><div class="wedding-form-grid"><label class="wedding-form-wide"><span>Veröffentlichungsschlüssel</span><input type="password" name="publishKey" autocomplete="off" required></label></div>`, save: form => save(String(new FormData(form).get('publishKey') || '')) });
    },
    confirm(title, message, save, submit) { show({ title, body: `<p>${e(message)}</p>`, save, submit }); }
  });
}
