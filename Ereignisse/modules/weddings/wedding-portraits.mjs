import { weddingText as e } from './wedding-model.mjs';

const silhouette = '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="23" r="11" fill="currentColor"/><path d="M12 61v-8c0-12 8-19 20-19s20 7 20 19v8" fill="currentColor"/></svg>';
export function renderGuestPortraits(guest, eventsBase) {
  if (guest.portraits?.length && eventsBase) return `<div class="wedding-portrait-group">${guest.portraits.map(person => `<span class="wedding-mini-portrait" title="${e(person.name)}" data-position="${person.position}">${silhouette}<img data-wedding-portrait src="${e(new URL(person.image,eventsBase))}" alt="${e(person.name)}" width="68" height="68" loading="lazy" decoding="async"></span>`).join('')}</div>`;
  return `<div class="wedding-portrait-group"><span class="wedding-mini-portrait${guest.emblem ? ' is-emblem' : ' is-missing'}" title="${guest.emblem ? 'Wappen der Delegation' : 'Porträt noch offen'}">${silhouette}${guest.emblem && eventsBase ? `<img data-wedding-portrait src="${e(new URL(guest.emblem,eventsBase))}" alt="" width="68" height="68" loading="lazy">` : ''}</span></div>`;
}
export function renderPortraitField(person = {}) {
  return `<div class="wedding-portrait-field" data-portrait-field data-portrait-id="${e(person.id || '')}"><label><span>Name der Person</span><input data-portrait-name value="${e(person.name || '')}" required maxlength="200"></label><label><span>Bildausschnitt</span><select data-portrait-position>${Object.entries({top:'Oben · Gesicht',upper:'Oberes Viertel',center:'Mitte',bottom:'Unten'}).map(([id,label]) => `<option value="${id}"${(person.position || 'top') === id ? ' selected' : ''}>${label}</option>`).join('')}</select></label><label class="wedding-form-wide"><span>Porträtadresse</span><input data-portrait-image value="${e(person.image || '')}" required maxlength="1200"></label><button type="button" class="wedding-text-button" data-dialog-action="remove-portrait">Porträt entfernen</button></div>`;
}
export function renderPortraitFields(portraits = []) {
  return `<fieldset class="wedding-form-wide wedding-portrait-fields"><legend>Runde Mini-Porträts</legend><p class="wedding-dialog-help">Bei gemeinsamen Einträgen kann jede Person ihr eigenes Bild erhalten. Bildadressen aus den Stammbäumen oder HTTPS-Adressen verwenden.</p><div data-portrait-list>${portraits.map(renderPortraitField).join('')}</div><button type="button" class="wedding-small-button" data-dialog-action="add-portrait">+ Porträt hinzufügen</button></fieldset>`;
}
export function readPortraitFields(form) {
  return [...form.querySelectorAll('[data-portrait-field]')].map(row => ({id:row.dataset.portraitId || `portrait-${crypto.randomUUID()}`,name:row.querySelector('[data-portrait-name]').value,image:row.querySelector('[data-portrait-image]').value,position:row.querySelector('[data-portrait-position]').value}));
}
