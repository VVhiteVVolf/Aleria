import { escapeHtml } from '../../ui/dom.js';
import { createBiographySplitPane } from '../biography-page/biography-split-pane.js';
import {
  sanitizeBiographyHref,
  sanitizeBiographyRichText
} from './person-biography-content.js';
import { createPersonBiographyIconPicker } from './person-biography-icon-picker.js';
import {
  createPersonBiographyModule,
  getPersonBiographyModule,
  normalizePersonBiographyModule,
  PERSON_BIOGRAPHY_SCHEMA,
  PERSON_BIOGRAPHY_SCHEMA_VERSION
} from './person-biography-model.js';
import { renderPersonBiography } from './person-biography-renderer.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function slugifyBiographyFileName(name) {
  return String(name || '')
    .toLocaleLowerCase('de')
    .replace(/[^a-z0-9äöüß]+/gi, '-')
    .replace(/^-|-$/g, '') || 'person';
}

// Eigenständiges Dateiformat statt eines Ausschnitts aus dem Familien-Export: Die Biographie
// hängt sonst am selben fragilen lokalen Entwurf wie der restliche Stammbaum (siehe
// family-sync-controller.js) - "Online speichern" im Kopfbereich ist der einzige Weg, sie
// dauerhaft zu sichern. Diese Datei ist ein Werkzeug-unabhängiges Backup pro Person.
function buildBiographyExportPayload(person, module) {
  return {
    schema: PERSON_BIOGRAPHY_SCHEMA,
    schemaVersion: PERSON_BIOGRAPHY_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    personId: person?.id || '',
    personName: person?.name || '',
    biographyModule: normalizePersonBiographyModule(module)
  };
}

function downloadBiographyModuleFile(person, module, documentRef) {
  const payload = buildBiographyExportPayload(person, module);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = documentRef.createElement('a');
  anchor.href = url;
  anchor.download = `${slugifyBiographyFileName(person?.name)}-biographie.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function parseBiographyImportPayload(parsed) {
  const source = parsed?.biographyModule && typeof parsed.biographyModule === 'object'
    ? parsed.biographyModule
    : parsed;
  return normalizePersonBiographyModule(source || {});
}

function openBiographyImportPicker(documentRef, onFile) {
  const input = documentRef.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (file) onFile(file);
  });
  input.click();
}

function inputField(label, field, value, options = {}) {
  const type = options.type || 'text';
  const attributes = [
    options.min !== undefined ? `min="${options.min}"` : '',
    options.max !== undefined ? `max="${options.max}"` : '',
    options.step !== undefined ? `step="${options.step}"` : ''
  ].filter(Boolean).join(' ');
  return `<label class="person-biography-editor__field${options.wide ? ' is-wide' : ''}">
    <span>${escapeHtml(label)}</span>
    <input type="${type}" ${attributes} data-biography-data-field="${escapeHtml(field)}" value="${escapeHtml(value)}">
  </label>`;
}

function toolbar() {
  return `<div class="text-format-toolbar" data-biography-rich-toolbar>
    <button class="text-format-btn" type="button" data-biography-command="bold" title="Fett">F</button>
    <button class="text-format-btn italic" type="button" data-biography-command="italic" title="Kursiv">I</button>
    <button class="text-format-btn underline" type="button" data-biography-command="underline" title="Unterstrichen">U</button>
    <button class="text-format-btn" type="button" data-biography-command="link" title="Link einfügen">URL</button>
    <button class="text-format-btn" type="button" data-biography-command="tooltip" title="Tooltip">Tip</button>
    <button class="text-format-btn" type="button" data-biography-command="spoiler" title="Spoiler">Spoiler</button>
    <button class="text-format-btn" type="button" data-biography-command="linebreak" title="Zeilenumbruch">↵</button>
  </div>`;
}

function richField(label, owner, field, value, documentRef) {
  return `<label class="person-biography-editor__field is-wide person-biography-rich-field">
    <span>${escapeHtml(label)}</span>
    ${toolbar()}
    <div class="person-biography-rich-editor" contenteditable="true" role="textbox" aria-multiline="true" spellcheck="true" data-biography-rich-owner="${owner}" data-biography-rich-field="${field}">${sanitizeBiographyRichText(value, documentRef)}</div>
  </label>`;
}

function collectionInput(collection, index, field, value, placeholder = '') {
  return `<input type="text" data-biography-collection="${collection}" data-biography-index="${index}" data-biography-item-field="${field}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}">`;
}

function removeButton(collection, index, label) {
  return `<button class="icon-button" type="button" data-biography-action="remove-item" data-biography-collection="${collection}" data-biography-index="${index}" aria-label="${escapeHtml(label)} entfernen">×</button>`;
}

function statsEditor(items) {
  return items.map((item, index) => `<div class="person-biography-editor__row two-columns">
    ${collectionInput('stats', index, 'label', item[0], 'Bezeichnung')}
    ${collectionInput('stats', index, 'value', item[1], 'Wert')}
    ${removeButton('stats', index, item[0] || 'Infotabellenzeile')}
  </div>`).join('');
}

function lineEditor(items, collection) {
  return items.map((item, index) => `<div class="person-biography-editor__row one-column">
    ${collectionInput(collection, index, 'value', item, 'Text')}
    ${removeButton(collection, index, 'Eintrag')}
  </div>`).join('');
}

function abilitiesEditor(items) {
  return items.map((item, index) => `<div class="person-biography-editor__row three-columns">
    <span class="person-biography-editor__icon-field">
      ${collectionInput('abilities', index, 'icon', item.icon, 'Icon oder Bild-URL')}
      <button class="button button--quiet button--small" type="button" data-biography-action="pick-ability-icon" data-biography-index="${index}">Icons</button>
    </span>
    ${collectionInput('abilities', index, 'title', item.title, 'Titel')}
    ${collectionInput('abilities', index, 'detail', item.detail, 'Beschreibung')}
    ${removeButton('abilities', index, item.title || 'Punkt')}
  </div>`).join('');
}

function sectionsEditor(items) {
  return items.map((item, index) => `<div class="person-biography-editor__row section-columns">
    <select data-biography-collection="extraSections" data-biography-index="${index}" data-biography-item-field="position">
      <option value="afterIntro"${item.position === 'afterIntro' ? ' selected' : ''}>Nach Haupttext</option>
      <option value="afterWorks"${item.position === 'afterWorks' ? ' selected' : ''}>Nach Abschnitt 3</option>
    </select>
    <select data-biography-collection="extraSections" data-biography-index="${index}" data-biography-item-field="mode">
      <option value="text"${item.mode === 'text' ? ' selected' : ''}>Text</option>
      <option value="list"${item.mode === 'list' ? ' selected' : ''}>Liste</option>
    </select>
    ${collectionInput('extraSections', index, 'title', item.title, 'Überschrift')}
    <textarea data-biography-collection="extraSections" data-biography-index="${index}" data-biography-item-field="text" placeholder="Inhalt">${escapeHtml(item.text)}</textarea>
    ${removeButton('extraSections', index, item.title || 'Zusatzabschnitt')}
  </div>`).join('');
}

function connectionsEditor(items) {
  return items.map((item, index) => item.type === 'heading'
    ? `<div class="person-biography-editor__row heading-columns">
        ${collectionInput('connections', index, 'title', item.title, 'Gruppentitel')}
        ${collectionInput('connections', index, 'detail', item.detail, 'Zusatz')}
        ${removeButton('connections', index, item.title || 'Trenner')}
      </div>`
    : `<div class="person-biography-editor__row connection-columns">
        ${collectionInput('connections', index, 'image', item.image, 'Portrait-URL')}
        <select data-biography-collection="connections" data-biography-index="${index}" data-biography-item-field="imageFormat">
          <option value="portrait"${item.imageFormat === 'portrait' ? ' selected' : ''}>Portrait</option>
          <option value="landscape"${item.imageFormat === 'landscape' ? ' selected' : ''}>Querformat</option>
          <option value="square"${item.imageFormat === 'square' ? ' selected' : ''}>Quadratisch</option>
        </select>
        ${collectionInput('connections', index, 'name', item.name, 'Name')}
        ${collectionInput('connections', index, 'detail', item.detail, 'Beziehung')}
        ${removeButton('connections', index, item.name || 'Verbindung')}
      </div>`).join('');
}

function documentsEditor(items) {
  return items.map((item, index) => `<div class="person-biography-editor__row document-columns">
    ${collectionInput('documents', index, 'icon', item.icon, 'Icon oder Bild-URL')}
    ${collectionInput('documents', index, 'title', item.title, 'Titel')}
    ${collectionInput('documents', index, 'text', item.text, 'Beschreibung')}
    ${collectionInput('documents', index, 'link', item.link, 'Verlinkung')}
    ${removeButton('documents', index, item.title || 'Besitz')}
  </div>`).join('');
}

function editorSection(title, action, actionLabel, content) {
  return `<section class="person-biography-editor__section">
    <header><h3>${escapeHtml(title)}</h3>${action ? `<button class="button button--quiet button--small" type="button" data-biography-action="${action}">${escapeHtml(actionLabel)}</button>` : ''}</header>
    <div class="person-biography-editor__rows">${content || '<p class="person-biography-editor__empty">Noch keine Einträge vorhanden.</p>'}</div>
  </section>`;
}

function portraitStagesEditor(items = []) {
  const stages = Array.from({ length: 4 }, (_, index) => String(items[index] || ''));
  return `<div class="person-biography-editor__portrait-stage is-default">
      <strong>[1]</strong>
      <span>Stammbaum-Portrait (automatisch)</span>
    </div>
    ${stages.map((source, index) => `<label class="person-biography-editor__portrait-stage">
      <strong>[${index + 2}]</strong>
      <input type="text" inputmode="url" data-biography-portrait-stage="${index}" value="${escapeHtml(source)}" placeholder="Optionale Portrait-URL für Altersstufe ${index + 2}">
    </label>`).join('')}`;
}

function renderEditor(module, documentRef) {
  const data = module.biography;
  return `<div class="person-biography-editor" data-biography-editor>
    <section class="person-biography-editor__section">
      <header><h3>Portrait-Altersstufen</h3></header>
      <div class="person-biography-editor__portrait-stages">
        ${portraitStagesEditor(data.portraitStages)}
      </div>
      <p class="person-biography-editor__section-help">[1] verwendet immer das Portrait der Person im Stammbaum. Die optionalen Stufen [2] bis [5] können beispielsweise Kindheit, Jugend, Erwachsenenalter und hohes Alter zeigen.</p>
    </section>
    <section class="person-biography-editor__section">
      <header><h3>Grundaufbau</h3></header>
      <div class="person-biography-editor__grid">
        ${inputField('Biografie-Überschrift', 'biographyTitle', data.biographyTitle)}
        ${inputField('Persönlichkeit-Überschrift', 'abilitiesTitle', data.abilitiesTitle)}
        ${inputField('Linke Inhaltsbreite (%)', 'sideWidth', data.sideWidth, { type: 'number', min: 35, max: 100 })}
        ${richField('Biografie', 'biography', 'biographyText', data.biographyText, documentRef)}
        ${inputField('Hintergrund-Überschrift', 'historyTitle', data.historyTitle)}
        ${inputField('Werke-Überschrift', 'worksTitle', data.worksTitle)}
        ${richField('Hintergrund & Wirkung', 'biography', 'historyText', data.historyText, documentRef)}
      </div>
    </section>
    ${editorSection('Infotabelle', 'add-stat', '+ Zeile', statsEditor(module.stats))}
    ${editorSection('Persönlichkeit & Spezialgebiete', 'add-ability', '+ Punkt', abilitiesEditor(data.abilities))}
    ${editorSection('Bekannte Werke', 'add-work', '+ Werk', lineEditor(data.works, 'works'))}
    ${editorSection('Zusatzabschnitte im Hauptbereich', 'add-section', '+ Abschnitt', sectionsEditor(data.extraSections))}
    <section class="person-biography-editor__section">
      <header><h3>Rechte Spalte</h3></header>
      <div class="person-biography-editor__grid">
        ${inputField('Trivia-Überschrift', 'triviaTitle', data.triviaTitle)}
        ${inputField('Zitate-Überschrift', 'quotesTitle', data.quotesTitle)}
        ${inputField('Verbindungen-Überschrift', 'connectionsTitle', data.connectionsTitle)}
        ${inputField('Verbindungsportrait-Höhe', 'connectionPortraitHeight', data.connectionPortraitHeight, { type: 'number', min: 44, max: 140 })}
        ${inputField('Verbindungstext-Versatz', 'connectionTextOffset', data.connectionTextOffset, { type: 'number', min: 0, max: 80 })}
        ${inputField('Besitz-Überschrift', 'documentsTitle', data.documentsTitle)}
      </div>
    </section>
    ${editorSection('Trivia', 'add-trivia', '+ Trivia', lineEditor(data.trivia, 'trivia'))}
    ${editorSection('Zitate', 'add-quote-line', '+ Zitat', lineEditor(data.quotes, 'quotes'))}
    <section class="person-biography-editor__section">
      <header><h3>Verbindungen</h3><span class="person-biography-editor__header-actions"><button class="button button--quiet button--small" type="button" data-biography-action="add-connection-heading">+ Trenner</button><button class="button button--quiet button--small" type="button" data-biography-action="add-connection">+ Verbindung</button></span></header>
      <div class="person-biography-editor__rows">${connectionsEditor(data.connections) || '<p class="person-biography-editor__empty">Noch keine Verbindungen vorhanden.</p>'}</div>
    </section>
    ${editorSection('Eigentum & Besitz', 'add-document', '+ Eintrag', documentsEditor(data.documents))}
    <section class="person-biography-editor__section">
      <header><h3>Zitatbox & Fußzeile</h3></header>
      <div class="person-biography-editor__grid">
        ${richField('Zitatbox links', 'module', 'quote', module.quote, documentRef)}
        <label class="person-biography-editor__field"><span>Zitat von</span><input type="text" data-biography-module-field="quoteBy" value="${escapeHtml(module.quoteBy)}"></label>
        ${inputField('Fußzeile', 'footer', data.footer, { wide: true })}
      </div>
    </section>
  </div>`;
}

function getCollection(module, collection) {
  return collection === 'stats' ? module.stats : module.biography[collection];
}

export function createPersonBiographyDialog({
  documentRef = document,
  runtime = globalThis,
  onSave,
  onRemove
} = {}) {
  const dialog = documentRef.getElementById('person-biography-dialog');
  const splitPane = createBiographySplitPane({ dialog, runtime });
  const iconPicker = createPersonBiographyIconPicker({ documentRef, runtime });
  const richTextRanges = new WeakMap();
  let person = null;
  let draft = null;
  let editable = false;
  let exists = false;

  function renderPreview() {
    const preview = dialog.querySelector('[data-biography-preview]');
    if (preview && person && draft) {
      preview.innerHTML = renderPersonBiography({ person, biographyModule: draft, documentRef });
    }
  }

  function renderDialog() {
    if (!person) return;
    const emptyView = !editable && !exists;
    dialog.innerHTML = `<form class="person-biography-dialog__form" data-biography-form>
      <header class="dialog-header person-biography-dialog__header">
        <div><p class="eyebrow">Almanach · Biographie</p><h2>${escapeHtml(person.name)}</h2></div>
        <button class="icon-button" type="button" data-biography-action="close" aria-label="Biographie schließen">×</button>
      </header>
      ${emptyView
        ? `<div class="person-biography-dialog__empty"><span aria-hidden="true">✦</span><h3>Noch keine Biographie angelegt</h3><p>Für diese Person wurde bislang kein Biographie-Modul gespeichert.</p></div>`
        : `<div class="person-biography-dialog__body${editable ? ' is-editing' : ''}">
            <section class="person-biography-dialog__preview" data-biography-preview>${renderPersonBiography({ person, biographyModule: draft, documentRef })}</section>
            ${editable ? `<div class="person-biography-dialog__divider" role="separator" aria-orientation="vertical" aria-label="Breite zwischen Live-Vorschau und Bearbeitung ändern" aria-valuemin="30" aria-valuemax="75" aria-valuenow="55" tabindex="0" data-biography-splitter><span>Liveversion</span><span>Bearbeitung</span></div><aside class="person-biography-dialog__editor-pane">${renderEditor(draft, documentRef)}</aside>` : ''}
          </div>`}
      <footer class="dialog-footer person-biography-dialog__footer">
        ${editable && exists ? '<button class="button button--danger" type="button" data-biography-action="remove-module">Biographie entfernen</button>' : ''}
        <span class="person-biography-dialog__footer-spacer"></span>
        ${editable ? '<button class="button button--quiet" type="button" data-biography-action="import-module">Importieren</button>' : ''}
        ${editable ? '<button class="button button--quiet" type="button" data-biography-action="export-module">Exportieren</button>' : ''}
        <button class="button button--quiet" type="button" data-biography-action="close">Schließen</button>
        ${editable ? '<button class="button" type="submit">Biographie speichern</button>' : ''}
      </footer>
    </form>`;
  }

  function rerenderEditor() {
    const pane = dialog.querySelector('.person-biography-dialog__editor-pane');
    if (pane) pane.innerHTML = renderEditor(draft, documentRef);
    renderPreview();
  }

  function open(nextPerson, options = {}) {
    person = nextPerson;
    editable = options.editable === true;
    const stored = getPersonBiographyModule(person);
    exists = Boolean(stored);
    draft = clone(stored || createPersonBiographyModule(person, options.house));
    renderDialog();
    splitPane.sync();
    dialog.showModal();
  }

  function close() {
    iconPicker.close();
    if (dialog.open) dialog.close();
    person = null;
    draft = null;
  }

  function addItem(action) {
    const additions = {
      'add-stat': ['stats', ['Bezeichnung', 'Wert']],
      'add-ability': ['abilities', { icon: '✦', title: 'Neuer Punkt', detail: '' }],
      'add-work': ['works', 'Neues Werk'],
      'add-section': ['extraSections', { position: 'afterIntro', mode: 'text', title: 'Neuer Abschnitt', text: '' }],
      'add-trivia': ['trivia', 'Neue Trivia'],
      'add-quote-line': ['quotes', 'Neues Zitat'],
      'add-connection-heading': ['connections', { type: 'heading', title: 'Neue Gruppe', detail: '' }],
      'add-connection': ['connections', { type: 'connection', image: '', imageFormat: 'portrait', name: 'Neue Verbindung', detail: '' }],
      'add-document': ['documents', { icon: '▧', title: 'Neuer Eintrag', text: '', link: '' }]
    };
    const [collection, item] = additions[action] || [];
    if (!collection) return false;
    getCollection(draft, collection).push(item);
    rerenderEditor();
    return true;
  }

  function rememberRichTextRange(editor) {
    const selection = runtime.getSelection?.();
    if (!editor || !selection?.rangeCount) return null;
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return null;
    const saved = range.cloneRange();
    richTextRanges.set(editor, saved);
    return saved;
  }

  function restoreRichTextRange(editor) {
    const selection = runtime.getSelection?.();
    let range = rememberRichTextRange(editor) || richTextRanges.get(editor)?.cloneRange();
    editor.focus();
    if (!range) {
      range = documentRef.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
    }
    selection?.removeAllRanges();
    selection?.addRange(range);
    return range;
  }

  function rangeHtml(range, fallback = 'Text') {
    if (!range || range.collapsed) return escapeHtml(fallback);
    const box = documentRef.createElement('div');
    box.appendChild(range.cloneContents());
    return box.innerHTML || escapeHtml(fallback);
  }

  function insertRichTextHtml(editor, range, html) {
    const template = documentRef.createElement('template');
    template.innerHTML = sanitizeBiographyRichText(html, documentRef);
    range.deleteContents();
    const fragment = template.content.cloneNode(true);
    const lastNode = fragment.lastChild;
    range.insertNode(fragment);
    if (lastNode) {
      const selection = runtime.getSelection?.();
      const nextRange = documentRef.createRange();
      nextRange.setStartAfter(lastNode);
      nextRange.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(nextRange);
      richTextRanges.set(editor, nextRange.cloneRange());
    }
  }

  function applyInlineFormat(editor, range, command) {
    let applied = false;
    if (typeof documentRef.execCommand === 'function') {
      try {
        applied = documentRef.execCommand(command, false) !== false;
      } catch {
        applied = false;
      }
    }
    if (applied || range.collapsed) return;
    const tagName = command === 'bold' ? 'strong' : command === 'italic' ? 'em' : 'u';
    const wrapper = documentRef.createElement(tagName);
    wrapper.appendChild(range.extractContents());
    range.insertNode(wrapper);
    const selection = runtime.getSelection?.();
    const nextRange = documentRef.createRange();
    nextRange.selectNodeContents(wrapper);
    selection?.removeAllRanges();
    selection?.addRange(nextRange);
    richTextRanges.set(editor, nextRange.cloneRange());
  }

  function executeRichTextCommand(button) {
    const editor = button.closest('.person-biography-rich-field')?.querySelector('.person-biography-rich-editor');
    const command = button.dataset.biographyCommand;
    if (!editor || !command) return;
    const range = restoreRichTextRange(editor);
    if (['bold', 'italic', 'underline'].includes(command)) {
      applyInlineFormat(editor, range, command);
    } else if (command === 'linebreak') {
      insertRichTextHtml(editor, range, '<br>');
    } else if (command === 'link') {
      const href = sanitizeBiographyHref(runtime.prompt?.('Link-URL eingeben:', 'https://') || '');
      if (!href) return;
      insertRichTextHtml(editor, range, `<a href="${escapeHtml(href)}">${rangeHtml(range, href)}</a>`);
    } else if (command === 'tooltip') {
      const tip = String(runtime.prompt?.('Tooltip-Text:') || '').trim();
      if (!tip) return;
      insertRichTextHtml(editor, range, `<span data-tip="${escapeHtml(tip)}">${rangeHtml(range)}</span>`);
    } else if (command === 'spoiler') {
      insertRichTextHtml(editor, range, `<span class="module-spoiler" data-spoiler="true">${rangeHtml(range, 'Spoiler')}</span>`);
    }
    const EventConstructor = runtime.Event || globalThis.Event;
    editor.dispatchEvent(new EventConstructor('input', { bubbles: true }));
    rememberRichTextRange(editor);
  }

  function onMouseDown(event) {
    const button = event.target.closest('[data-biography-command]');
    if (!button) return;
    const editor = button.closest('.person-biography-rich-field')?.querySelector('.person-biography-rich-editor');
    rememberRichTextRange(editor);
    event.preventDefault();
  }

  function onRichTextSelection(event) {
    const editor = event.target.closest?.('.person-biography-rich-editor');
    if (editor) rememberRichTextRange(editor);
  }

  function onClick(event) {
    const portraitTab = event.target.closest('[data-biography-portrait-tab]');
    if (portraitTab) {
      const wrap = portraitTab.closest('[data-biography-portrait-tabs]');
      const index = String(portraitTab.dataset.biographyPortraitTab || '0');
      wrap?.querySelectorAll('[data-biography-portrait-tab]').forEach(button => {
        const active = String(button.dataset.biographyPortraitTab) === index;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      wrap?.querySelectorAll('[data-biography-portrait-pane]').forEach(pane => {
        pane.classList.toggle('is-active', String(pane.dataset.biographyPortraitPane) === index);
      });
      return;
    }
    const commandButton = event.target.closest('[data-biography-command]');
    if (commandButton) {
      event.preventDefault();
      event.stopPropagation();
      executeRichTextCommand(commandButton);
      return;
    }
    const button = event.target.closest('[data-biography-action]');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    const action = button.dataset.biographyAction;
    if (action === 'close') close();
    else if (action === 'pick-ability-icon') {
      const index = Number(button.dataset.biographyIndex);
      const target = dialog.querySelector(`[data-biography-collection="abilities"][data-biography-index="${index}"][data-biography-item-field="icon"]`);
      if (!target) return;
      iconPicker.open({
        onSelect(source) {
          target.value = source;
          const EventConstructor = runtime.Event || globalThis.Event;
          target.dispatchEvent(new EventConstructor('input', { bubbles: true }));
          target.focus({ preventScroll: true });
        }
      });
    }
    else if (action === 'remove-module') {
      if (runtime.confirm?.(`Die Biographie von ${person.name} vollständig entfernen?`)) {
        onRemove?.(person.id);
        close();
      }
    } else if (action === 'remove-item') {
      const collection = getCollection(draft, button.dataset.biographyCollection);
      collection?.splice(Number(button.dataset.biographyIndex), 1);
      rerenderEditor();
    } else if (action === 'export-module') {
      downloadBiographyModuleFile(person, draft, documentRef);
    } else if (action === 'import-module') {
      openBiographyImportPicker(documentRef, importBiographyFile);
    } else addItem(action);
  }

  function importBiographyFile(file) {
    const FileReaderCtor = runtime.FileReader || globalThis.FileReader;
    const reader = new FileReaderCtor();
    reader.addEventListener('load', () => {
      let imported;
      try {
        imported = parseBiographyImportPayload(JSON.parse(String(reader.result || '')));
      } catch (error) {
        runtime.alert?.(`Biographie-Datei konnte nicht gelesen werden: ${error?.message || 'Unbekanntes Format'}`);
        return;
      }
      if (!runtime.confirm?.('Biographie-Datei importieren? Der aktuelle Entwurf in diesem Dialog wird dabei überschrieben (erst "Biographie speichern" schreibt das endgültig fest).')) return;
      draft = imported;
      rerenderEditor();
    });
    reader.addEventListener('error', () => {
      runtime.alert?.('Biographie-Datei konnte nicht gelesen werden.');
    });
    reader.readAsText(file, 'utf-8');
  }

  function onInput(event) {
    if (!editable || !draft) return;
    const target = event.target;
    if (target.dataset.biographyPortraitStage !== undefined) {
      const index = Number(target.dataset.biographyPortraitStage);
      if (Number.isInteger(index) && index >= 0 && index < 4) {
        draft.biography.portraitStages[index] = target.value;
        renderPreview();
      }
      return;
    }
    if (target.matches('[data-biography-rich-field]')) {
      const owner = target.dataset.biographyRichOwner;
      const field = target.dataset.biographyRichField;
      if (owner === 'module') draft[field] = target.innerHTML;
      else draft.biography[field] = target.innerHTML;
      renderPreview();
      return;
    }
    if (target.dataset.biographyModuleField) {
      draft[target.dataset.biographyModuleField] = target.value;
      renderPreview();
      return;
    }
    if (target.dataset.biographyDataField) {
      draft.biography[target.dataset.biographyDataField] = target.value;
      renderPreview();
      return;
    }
    const collectionName = target.dataset.biographyCollection;
    if (!collectionName) return;
    const collection = getCollection(draft, collectionName);
    const index = Number(target.dataset.biographyIndex);
    const field = target.dataset.biographyItemField;
    if (collectionName === 'stats') collection[index][field === 'label' ? 0 : 1] = target.value;
    else if (['works', 'trivia', 'quotes'].includes(collectionName)) collection[index] = target.value;
    else collection[index][field] = target.value;
    renderPreview();
  }

  function onSubmit(event) {
    if (!event.target.matches('[data-biography-form]') || !editable) return;
    event.preventDefault();
    event.stopPropagation();
    onSave?.(person.id, normalizePersonBiographyModule(draft));
    close();
  }

  dialog.addEventListener('mousedown', onMouseDown);
  dialog.addEventListener('click', onClick);
  dialog.addEventListener('input', onInput);
  dialog.addEventListener('change', onInput);
  dialog.addEventListener('submit', onSubmit);
  dialog.addEventListener('mouseup', onRichTextSelection);
  dialog.addEventListener('keyup', onRichTextSelection);

  function destroy() {
    dialog.removeEventListener('mousedown', onMouseDown);
    dialog.removeEventListener('click', onClick);
    dialog.removeEventListener('input', onInput);
    dialog.removeEventListener('change', onInput);
    dialog.removeEventListener('submit', onSubmit);
    dialog.removeEventListener('mouseup', onRichTextSelection);
    dialog.removeEventListener('keyup', onRichTextSelection);
    iconPicker.destroy();
    splitPane.destroy();
  }

  return Object.freeze({ dialog, open, close, destroy });
}
