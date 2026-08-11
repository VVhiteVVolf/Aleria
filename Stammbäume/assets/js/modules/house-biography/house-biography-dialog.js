import { createBiographySplitPane } from '../biography-page/biography-split-pane.js';
import { createPersonBiographyIconPicker } from '../person-biography/person-biography-icon-picker.js';
import {
  addHouseBiographyItem,
  getHouseBiographyCollection,
  renderHouseBiographyEditor,
  updateHouseBiographyDraft
} from './house-biography-editor.js';
import {
  createHouseBiographyModule,
  getHouseBiographyModule,
  HOUSE_BIOGRAPHY_SCHEMA,
  HOUSE_BIOGRAPHY_SCHEMA_VERSION,
  normalizeHouseBiographyModule,
  parseHouseBiographyImportPayload
} from './house-biography-model.js';
import {
  renderHouseBiography,
  renderHouseBiographyHeader
} from './house-biography-renderer.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function slug(value) {
  return String(value || 'haus')
    .toLocaleLowerCase('de')
    .replace(/[^a-z0-9äöüß]+/gi, '-')
    .replace(/^-|-$/g, '') || 'haus';
}

function downloadModule(family, module, documentRef) {
  const payload = {
    schema: HOUSE_BIOGRAPHY_SCHEMA,
    schemaVersion: HOUSE_BIOGRAPHY_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    familyId: family.document.id,
    familyName: family.document.title,
    houseBiographyModule: normalizeHouseBiographyModule(module)
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = documentRef.createElement('a');
  anchor.href = url;
  anchor.download = `${slug(family.document.title)}-hausbeschreibung.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function chooseImport(documentRef, onFile) {
  const input = documentRef.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (file) onFile(file);
  });
  input.click();
}

export function createHouseBiographyDialog({
  documentRef = document,
  runtime = globalThis,
  onSave,
  onRemove
} = {}) {
  const dialog = documentRef.getElementById('house-biography-dialog');
  const splitPane = createBiographySplitPane({ dialog, runtime });
  const iconPicker = createPersonBiographyIconPicker({ documentRef, runtime });
  let family = null;
  let draft = null;
  let editable = false;
  let exists = false;

  function previewHtml() {
    return renderHouseBiography({
      family,
      biographyModule: draft,
      documentRef,
      includeHeader: false
    });
  }

  function renderDialog() {
    const emptyView = !editable && !exists;
    dialog.innerHTML = `<form class="person-biography-dialog__form" data-house-biography-form>
      <header class="dialog-header person-biography-dialog__header house-biography-dialog__header">
        <div class="house-biography-dialog__header-content" data-house-biography-header>${renderHouseBiographyHeader(family, draft, documentRef)}</div>
        <button class="icon-button" type="button" data-house-biography-action="close" aria-label="Clanbeschreibung schließen">×</button>
      </header>
      ${emptyView
        ? `<div class="person-biography-dialog__empty"><span aria-hidden="true">✦</span><h3>Noch keine Clanbeschreibung angelegt</h3><p>Für dieses Haus wurde bislang kein Häuser-Modul gespeichert.</p></div>`
        : `<div class="person-biography-dialog__body${editable ? ' is-editing' : ''}">
            <section class="person-biography-dialog__preview house-biography-dialog__preview" data-house-biography-preview>${previewHtml()}</section>
            ${editable ? `<div class="person-biography-dialog__divider" role="separator" aria-orientation="vertical" aria-label="Breite zwischen Live-Vorschau und Bearbeitung ändern" aria-valuemin="30" aria-valuemax="75" aria-valuenow="55" tabindex="0" data-biography-splitter><span>Liveversion</span><span>Bearbeitung</span></div><aside class="person-biography-dialog__editor-pane">${renderHouseBiographyEditor(draft)}</aside>` : ''}
          </div>`}
      <footer class="dialog-footer person-biography-dialog__footer">
        ${editable && exists ? '<button class="button button--danger" type="button" data-house-biography-action="remove-module">Clanbeschreibung entfernen</button>' : ''}
        <span class="person-biography-dialog__footer-spacer"></span>
        ${editable ? '<button class="button button--quiet" type="button" data-house-biography-action="import-module">Importieren</button>' : ''}
        ${editable ? '<button class="button button--quiet" type="button" data-house-biography-action="export-module">Exportieren</button>' : ''}
        <button class="button button--quiet" type="button" data-house-biography-action="close">Schließen</button>
        ${editable ? '<button class="button" type="submit">Clanbeschreibung speichern</button>' : ''}
      </footer>
    </form>`;
  }

  function updatePreview() {
    const preview = dialog.querySelector('[data-house-biography-preview]');
    if (preview) preview.innerHTML = previewHtml();
    const header = dialog.querySelector('[data-house-biography-header]');
    if (header) header.innerHTML = renderHouseBiographyHeader(family, draft, documentRef);
  }

  function rerenderEditor() {
    const pane = dialog.querySelector('.person-biography-dialog__editor-pane');
    if (pane) pane.innerHTML = renderHouseBiographyEditor(draft);
    updatePreview();
  }

  function open(nextFamily, options = {}) {
    family = nextFamily;
    editable = options.editable === true;
    const stored = getHouseBiographyModule(family);
    exists = Boolean(stored);
    draft = clone(stored || createHouseBiographyModule(family));
    renderDialog();
    splitPane.sync();
    if (!dialog.open) dialog.showModal();
  }

  function close() {
    iconPicker.close();
    if (dialog.open) dialog.close();
    family = null;
    draft = null;
  }

  function importFile(file) {
    const FileReaderCtor = runtime.FileReader || globalThis.FileReader;
    const reader = new FileReaderCtor();
    reader.addEventListener('load', () => {
      try {
        const imported = parseHouseBiographyImportPayload(JSON.parse(String(reader.result || '')));
        if (!runtime.confirm?.('Clanbeschreibung importieren? Der aktuelle Entwurf im Dialog wird dabei überschrieben.')) return;
        draft = imported;
        rerenderEditor();
      } catch (error) {
        runtime.alert?.(`Clanbeschreibung konnte nicht gelesen werden: ${error?.message || 'Unbekanntes Format'}`);
      }
    });
    reader.addEventListener('error', () => runtime.alert?.('Clanbeschreibung konnte nicht gelesen werden.'));
    reader.readAsText(file, 'utf-8');
  }

  function onClick(event) {
    const button = event.target.closest('[data-house-biography-action]');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    const action = button.dataset.houseBiographyAction;
    if (action === 'close') close();
    else if (action === 'remove-module') {
      if (runtime.confirm?.(`Die Clanbeschreibung von ${family.document.title} vollständig entfernen?`)) {
        onRemove?.(family.document.id);
        close();
      }
    } else if (action === 'remove-item') {
      const collection = getHouseBiographyCollection(draft, button.dataset.houseBiographyCollection);
      collection?.splice(Number(button.dataset.houseBiographyIndex), 1);
      rerenderEditor();
    } else if (action === 'pick-icon') {
      const collectionName = button.dataset.houseBiographyCollection;
      const index = Number(button.dataset.houseBiographyIndex);
      const target = dialog.querySelector(`[data-house-biography-collection="${collectionName}"][data-house-biography-index="${index}"][data-house-biography-item-field="icon"]`);
      if (!target) return;
      iconPicker.open({
        onSelect(source) {
          target.value = source;
          target.dispatchEvent(new (runtime.Event || globalThis.Event)('input', { bubbles: true }));
        }
      });
    } else if (action === 'export-module') downloadModule(family, draft, documentRef);
    else if (action === 'import-module') chooseImport(documentRef, importFile);
    else if (addHouseBiographyItem(draft, action)) rerenderEditor();
  }

  function onInput(event) {
    if (!editable || !draft) return;
    if (updateHouseBiographyDraft(draft, event.target)) updatePreview();
  }

  function onSubmit(event) {
    if (!event.target.matches('[data-house-biography-form]') || !editable) return;
    event.preventDefault();
    event.stopPropagation();
    onSave?.(family.document.id, normalizeHouseBiographyModule(draft));
    close();
  }

  dialog.addEventListener('click', onClick);
  dialog.addEventListener('input', onInput);
  dialog.addEventListener('change', onInput);
  dialog.addEventListener('submit', onSubmit);

  function destroy() {
    dialog.removeEventListener('click', onClick);
    dialog.removeEventListener('input', onInput);
    dialog.removeEventListener('change', onInput);
    dialog.removeEventListener('submit', onSubmit);
    iconPicker.destroy();
    splitPane.destroy();
  }

  return Object.freeze({ dialog, open, close, destroy });
}
