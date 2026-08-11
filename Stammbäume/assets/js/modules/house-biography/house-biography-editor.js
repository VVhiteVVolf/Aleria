import { escapeHtml } from '../../ui/dom.js';

function field(label, owner, key, value, { type = 'text', wide = false, min = '', max = '' } = {}) {
  const bounds = `${min !== '' ? ` min="${min}"` : ''}${max !== '' ? ` max="${max}"` : ''}`;
  return `<label class="person-biography-editor__field${wide ? ' is-wide' : ''}">
    <span>${escapeHtml(label)}</span>
    <input type="${type}"${bounds} data-house-biography-owner="${owner}" data-house-biography-field="${escapeHtml(key)}" value="${escapeHtml(value)}">
  </label>`;
}

function textField(label, owner, key, value) {
  return `<label class="person-biography-editor__field is-wide">
    <span>${escapeHtml(label)}</span>
    <textarea data-house-biography-owner="${owner}" data-house-biography-field="${escapeHtml(key)}">${escapeHtml(value)}</textarea>
  </label>`;
}

function collectionInput(collection, index, key, value, placeholder = '') {
  return `<input type="text" data-house-biography-collection="${collection}" data-house-biography-index="${index}" data-house-biography-item-field="${key}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}">`;
}

function removeButton(collection, index, label) {
  return `<button class="icon-button" type="button" data-house-biography-action="remove-item" data-house-biography-collection="${collection}" data-house-biography-index="${index}" aria-label="${escapeHtml(label)} entfernen">×</button>`;
}

function section(title, action, actionLabel, content) {
  return `<section class="person-biography-editor__section">
    <header><h3>${escapeHtml(title)}</h3>${action ? `<button class="button button--quiet button--small" type="button" data-house-biography-action="${action}">${escapeHtml(actionLabel)}</button>` : ''}</header>
    <div class="person-biography-editor__rows">${content || '<p class="person-biography-editor__empty">Noch keine Einträge vorhanden.</p>'}</div>
  </section>`;
}

function statsRows(items) {
  return items.map((item, index) => `<div class="person-biography-editor__row two-columns">
    ${collectionInput('stats', index, 'label', item[0], 'Bezeichnung')}
    ${collectionInput('stats', index, 'value', item[1], 'Wert')}
    ${removeButton('stats', index, item[0] || 'Infozeile')}
  </div>`).join('');
}

function lineRows(items, collection) {
  return items.map((item, index) => `<div class="person-biography-editor__row one-column">
    ${collectionInput(collection, index, 'value', item, 'Text')}
    ${removeButton(collection, index, 'Eintrag')}
  </div>`).join('');
}

function abilityRows(items) {
  return items.map((item, index) => `<div class="person-biography-editor__row three-columns">
    <span class="person-biography-editor__icon-field">
      ${collectionInput('abilities', index, 'icon', item.icon, 'Icon oder Bild-URL')}
      <button class="button button--quiet button--small" type="button" data-house-biography-action="pick-icon" data-house-biography-collection="abilities" data-house-biography-index="${index}">Icons</button>
    </span>
    ${collectionInput('abilities', index, 'title', item.title, 'Titel')}
    ${collectionInput('abilities', index, 'detail', item.detail, 'Beschreibung')}
    ${removeButton('abilities', index, item.title || 'Einflussbereich')}
  </div>`).join('');
}

function sectionRows(items) {
  return items.map((item, index) => `<div class="person-biography-editor__row section-columns">
    <select data-house-biography-collection="extraSections" data-house-biography-index="${index}" data-house-biography-item-field="position">
      <option value="afterIntro"${item.position === 'afterIntro' ? ' selected' : ''}>Nach Haupttext</option>
      <option value="afterWorks"${item.position === 'afterWorks' ? ' selected' : ''}>Nach Abschnitt 3</option>
    </select>
    <select data-house-biography-collection="extraSections" data-house-biography-index="${index}" data-house-biography-item-field="mode">
      <option value="text"${item.mode === 'text' ? ' selected' : ''}>Text</option>
      <option value="list"${item.mode === 'list' ? ' selected' : ''}>Liste</option>
    </select>
    ${collectionInput('extraSections', index, 'title', item.title, 'Überschrift')}
    <textarea data-house-biography-collection="extraSections" data-house-biography-index="${index}" data-house-biography-item-field="text" placeholder="Inhalt">${escapeHtml(item.text)}</textarea>
    ${removeButton('extraSections', index, item.title || 'Zusatzabschnitt')}
  </div>`).join('');
}

function connectionRows(items) {
  return items.map((item, index) => item.type === 'heading'
    ? `<div class="person-biography-editor__row heading-columns">
        ${collectionInput('connections', index, 'title', item.title, 'Gruppentitel')}
        ${collectionInput('connections', index, 'detail', item.detail, 'Zusatz')}
        ${removeButton('connections', index, item.title || 'Trenner')}
      </div>`
    : `<div class="person-biography-editor__row connection-columns">
        ${collectionInput('connections', index, 'image', item.image, 'Wappen- oder Portrait-URL')}
        <select data-house-biography-collection="connections" data-house-biography-index="${index}" data-house-biography-item-field="imageFormat">
          <option value="portrait"${item.imageFormat === 'portrait' ? ' selected' : ''}>Hochformat</option>
          <option value="landscape"${item.imageFormat === 'landscape' ? ' selected' : ''}>Querformat</option>
          <option value="square"${item.imageFormat === 'square' ? ' selected' : ''}>Quadratisch</option>
        </select>
        ${collectionInput('connections', index, 'name', item.name, 'Name des Hauses')}
        ${collectionInput('connections', index, 'detail', item.detail, 'Beziehung')}
        ${removeButton('connections', index, item.name || 'Verbindung')}
      </div>`).join('');
}

function documentRows(items) {
  return items.map((item, index) => `<div class="person-biography-editor__row document-columns">
    <span class="person-biography-editor__icon-field">
      ${collectionInput('documents', index, 'icon', item.icon, 'Icon oder Bild-URL')}
      <button class="button button--quiet button--small" type="button" data-house-biography-action="pick-icon" data-house-biography-collection="documents" data-house-biography-index="${index}">Icons</button>
    </span>
    ${collectionInput('documents', index, 'title', item.title, 'Titel')}
    ${collectionInput('documents', index, 'text', item.text, 'Beschreibung')}
    ${collectionInput('documents', index, 'link', item.link, 'Verlinkung')}
    ${removeButton('documents', index, item.title || 'Besitz')}
  </div>`).join('');
}

export function renderHouseBiographyEditor(module) {
  const data = module.house;
  return `<div class="person-biography-editor house-biography-editor" data-house-biography-editor>
    <section class="person-biography-editor__section">
      <header><h3>Hausbilder</h3></header>
      <div class="person-biography-editor__grid">
        ${field('Hauptbild links', 'module', 'image', module.image, { wide: true })}
        ${field('Wappen des Hauses (Header rechts)', 'house', 'crestImage', data.crestImage, { wide: true })}
      </div>
      <p class="person-biography-editor__section-help">Das Hauptbild und das Wappen sind – genau wie im Häuser-Template des Almanachs – zwei unabhängige Bildfelder.</p>
    </section>
    ${section('Infotabelle', 'add-stat', '+ Zeile', statsRows(module.stats))}
    <section class="person-biography-editor__section">
      <header><h3>Über dieses Haus</h3></header>
      <div class="person-biography-editor__grid">
        ${field('Überschrift „Über dieses Haus“', 'house', 'biographyTitle', data.biographyTitle)}
        ${field('Linke Inhaltsbreite (%)', 'house', 'sideWidth', data.sideWidth, { type: 'number', min: 35, max: 100 })}
        ${textField('Über dieses Haus', 'house', 'biographyText', data.biographyText)}
        ${field('Einflussbereiche-Überschrift', 'house', 'abilitiesTitle', data.abilitiesTitle)}
      </div>
    </section>
    ${section('Einflussbereiche & Zuständigkeiten', 'add-ability', '+ Punkt', abilityRows(data.abilities))}
    <section class="person-biography-editor__section">
      <header><h3>Geschichte</h3></header>
      <div class="person-biography-editor__grid">
        ${field('Geschichte-Überschrift', 'house', 'historyTitle', data.historyTitle)}
        ${field('Taten-Überschrift', 'house', 'worksTitle', data.worksTitle)}
        ${textField('Geschichte des Hauses', 'house', 'historyText', data.historyText)}
      </div>
    </section>
    ${section('Bekannte Taten & Ereignisse', 'add-work', '+ Tat', lineRows(data.works, 'works'))}
    ${section('Zusatzabschnitte im Hauptbereich', 'add-section', '+ Abschnitt', sectionRows(data.extraSections))}
    <section class="person-biography-editor__section">
      <header><h3>Rechte Spalte</h3></header>
      <div class="person-biography-editor__grid">
        ${field('Besonderheiten-Überschrift', 'house', 'triviaTitle', data.triviaTitle)}
        ${field('Hausworte-Überschrift', 'house', 'quotesTitle', data.quotesTitle)}
        ${field('Verbindungen-Überschrift', 'house', 'connectionsTitle', data.connectionsTitle)}
        ${field('Wappenbild-Höhe (px)', 'house', 'connectionPortraitHeight', data.connectionPortraitHeight, { type: 'number', min: 44, max: 140 })}
        ${field('Verbindungstext-Versatz', 'house', 'connectionTextOffset', data.connectionTextOffset, { type: 'number', min: 0, max: 80 })}
        ${field('Besitz-/Dokumente-Überschrift', 'house', 'documentsTitle', data.documentsTitle)}
      </div>
    </section>
    ${section('Besonderheiten', 'add-trivia', '+ Besonderheit', lineRows(data.trivia, 'trivia'))}
    ${section('Hausworte & Zitate', 'add-quote-line', '+ Zitat', lineRows(data.quotes, 'quotes'))}
    <section class="person-biography-editor__section">
      <header><h3>Verbündete, Rivalen & Vasallen</h3><span class="person-biography-editor__header-actions"><button class="button button--quiet button--small" type="button" data-house-biography-action="add-connection-heading">+ Trenner</button><button class="button button--quiet button--small" type="button" data-house-biography-action="add-connection">+ Verbindung</button></span></header>
      <div class="person-biography-editor__rows">${connectionRows(data.connections) || '<p class="person-biography-editor__empty">Noch keine Verbindungen vorhanden.</p>'}</div>
    </section>
    ${section('Eigentum & Besitz', 'add-document', '+ Eintrag', documentRows(data.documents))}
    <section class="person-biography-editor__section">
      <header><h3>Hausmotto & Fußzeile</h3></header>
      <div class="person-biography-editor__grid">
        ${textField('Hausmotto (Header)', 'module', 'quote', module.quote)}
        ${field('Motto zugeschrieben an', 'module', 'quoteBy', module.quoteBy)}
        ${field('Fußzeile', 'house', 'footer', data.footer, { wide: true })}
      </div>
    </section>
  </div>`;
}

export function getHouseBiographyCollection(module, name) {
  return name === 'stats' ? module.stats : module.house[name];
}

export function addHouseBiographyItem(module, action) {
  const additions = {
    'add-stat': ['stats', ['Bezeichnung', 'Wert']],
    'add-ability': ['abilities', { icon: '✦', title: 'Neuer Punkt', detail: '' }],
    'add-work': ['works', 'Neues Ereignis'],
    'add-section': ['extraSections', { position: 'afterIntro', mode: 'text', title: 'Neuer Abschnitt', text: '' }],
    'add-trivia': ['trivia', 'Neue Besonderheit'],
    'add-quote-line': ['quotes', 'Neues Hauswort'],
    'add-connection-heading': ['connections', { type: 'heading', title: 'Neue Gruppe', detail: '' }],
    'add-connection': ['connections', { type: 'connection', image: '', imageFormat: 'square', name: 'Neue Verbindung', detail: '' }],
    'add-document': ['documents', { icon: '▧', title: 'Neuer Eintrag', text: '', link: '' }]
  };
  const [collectionName, item] = additions[action] || [];
  if (!collectionName) return false;
  getHouseBiographyCollection(module, collectionName).push(item);
  return true;
}

export function updateHouseBiographyDraft(module, target) {
  const owner = target.dataset.houseBiographyOwner;
  const fieldName = target.dataset.houseBiographyField;
  if (owner && fieldName) {
    (owner === 'module' ? module : module.house)[fieldName] = target.value;
    if (owner === 'house' && fieldName === 'biographyText') module.description = target.value;
    return true;
  }
  const collectionName = target.dataset.houseBiographyCollection;
  if (!collectionName) return false;
  const collection = getHouseBiographyCollection(module, collectionName);
  const index = Number(target.dataset.houseBiographyIndex);
  const itemField = target.dataset.houseBiographyItemField;
  if (!collection?.[index]) return false;
  if (collectionName === 'stats') collection[index][itemField === 'label' ? 0 : 1] = target.value;
  else if (['works', 'trivia', 'quotes'].includes(collectionName)) collection[index] = target.value;
  else collection[index][itemField] = target.value;
  return true;
}
