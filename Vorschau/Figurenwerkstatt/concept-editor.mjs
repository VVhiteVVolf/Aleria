import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { conceptTitle, CONCEPT_TYPES, STAGES, variantTitle } from './concept-schema.mjs';
import { fieldLimit } from './concept-drafts.mjs';
import { artImage, renderMedia, safeConceptUrl } from './concept-media.mjs';
import { referencedName, renderReferenceLink } from './concept-reference-view.mjs';
import { renderConceptReading } from './concept-reading.mjs';
import { mainImageMatches } from './concept-decisions.mjs';
import { renderDecisionEditor, renderMainImageStatus } from './concept-decision-view.mjs';
import { renderExampleChoices } from './concept-example-view.mjs';

export function renderDrafts(drafts, selected) {
  if (!drafts.length) return '<p class="draft-empty">Hier erscheinen deine Entwürfe.</p>';
  return `<ul class="draft-list">${drafts.map(draft => {
    const type = CONCEPT_TYPES[draft.kind];
    return `<li><button type="button" data-action="select-draft" data-id="${e(draft.id)}" aria-current="${draft.id === selected}">
      <span class="draft-list-art">${artImage(type.art, 27)}</span>
      <span><strong>${e(conceptTitle(draft))}</strong><small>${e(type.label)} · ${e(STAGES[draft.fields.stage] || STAGES.idea)}</small></span>
    </button></li>`;
  }).join('')}</ul>`;
}

export function renderWelcome() {
  return `<section class="concept-welcome" aria-labelledby="welcome-title">
    <h2 id="welcome-title">Einen Entwurf beginnen</h2>
    <p>Wähle eine Vorlage. Entwürfe können in derselben Mappe miteinander verknüpft werden.</p>
    <div class="concept-starters">
      ${Object.entries(CONCEPT_TYPES).map(([kind, type]) => `<article class="concept-starter">
        <div class="concept-starter-art">${artImage(type.art, 70)}</div>
        <div><h3>${e(type.name)}</h3><p>${e(type.summary)}</p>
        <button class="workshop-button workshop-button--primary" type="button" data-action="new" data-kind="${kind}">${e(type.name)} anlegen <span aria-hidden="true">→</span></button></div>
      </article>`).join('')}
    </div>
    <section class="concept-samples" aria-labelledby="samples-title">
      <h3 id="samples-title">Musterbeispiele</h3>
      <p>Sechs verknüpfte Entwürfe rund um Gelynwacht und ein Orts-Pitch für Caer Ysgellfor.</p>
      ${renderExampleChoices()}
    </section>
  </section>`;
}

export function renderTypeOptions() {
  return `<ul class="picker-results concept-type-options">${Object.entries(CONCEPT_TYPES).map(([kind, type]) => `
    <li><button type="button" data-action="new" data-kind="${kind}">
      ${artImage(type.art, 34)}
      <span><strong>${e(type.name)} anlegen</strong><small>${e(type.summary)}</small></span>
    </button></li>`).join('')}</ul>`;
}

function renderTabs(items, action, selected, panel, label) {
  return `<div class="concept-tabs${action === 'relationship' ? ' concept-tabs--sub' : ''}" role="tablist" aria-label="${e(label)}">
    ${items.map(({ id, label: text, art }) => `<button type="button" role="tab" id="${action}-${e(id)}" data-action="${action}" data-id="${e(id)}"
      aria-controls="${panel}" aria-selected="${id === selected}" tabindex="${id === selected ? 0 : -1}">
      ${art ? artImage(art, 20) : ''}${e(text)}
    </button>`).join('')}
  </div>`;
}

function renderControl(field, value = '', { placeholder = field.placeholder, readOnly = false, media = false } = {}) {
  const common = `data-field="${e(field.id)}" maxlength="${fieldLimit(field)}" placeholder="${e(placeholder)}"`;
  let input;
  if (field.type === 'prose') {
    input = `<textarea ${common} rows="3">${e(value)}</textarea>`;
  } else if (field.options) {
    const empty = field.id === 'stage' ? '' : `<option value="">${e(field.emptyOption || 'Bitte wählen')}</option>`;
    input = `<select data-field="${e(field.id)}" aria-label="${e(field.label)}">${empty}${Object.entries(field.options).map(([id, label]) => (
      `<option value="${e(id)}"${id === value ? ' selected' : ''}>${e(label)}</option>`
    )).join('')}</select>`;
  } else {
    input = `<input ${common} value="${e(value)}"${field.type === 'link' ? ' inputmode="url" spellcheck="false"' : ''}${readOnly ? ' readonly' : ''}${media ? ' data-media-input' : ''}>`;
  }
  return `<label class="concept-field${field.type === 'prose' ? ' concept-field--wide' : ''}"><span>${e(field.label)}</span>${input}</label>`;
}

function renderIconControl(field, icon) {
  const src = safeConceptUrl(icon?.src);
  const picture = src ? `<img src="${e(src)}" alt="" width="28" height="28" referrerpolicy="no-referrer">` : artImage('quill', 22);
  const label = src ? icon.name : `${field.label} wählen`;
  return `<div class="concept-icon-control">
    <button type="button" class="workshop-button concept-icon-button" data-action="choose-icon" aria-haspopup="dialog" aria-label="${e(src ? `Icon ändern (${label})` : label)}">${picture}<span>${e(label)}</span></button>
    ${src ? '<button type="button" class="concept-link" data-action="clear-icon">Icon entfernen</button>' : ''}
  </div>`;
}

function renderReferenceControl(field, row, drafts) {
  return `<div class="concept-reference">
    ${renderControl({ id: 'name', label: field.label }, referencedName(row, drafts), { readOnly: Boolean(row.target), placeholder: 'Name oder Arbeitstitel' })}
    <div class="workshop-actions">
      <button type="button" class="workshop-button" data-action="choose-target" aria-haspopup="dialog">${artImage('search', 18)}${row.target ? 'Verknüpfung ändern' : 'Verknüpfen'}</button>
      ${row.target ? '<button type="button" class="concept-link" data-action="clear-target">Verknüpfung lösen</button>' : ''}
      ${renderReferenceLink(row.target, drafts)}
    </div>
  </div>`;
}

function renderGroup(group, draft) {
  const proseGrid = group.fields.length > 1 && group.fields.every(field => field.type === 'prose');
  return `<section class="concept-group"><h3>${e(group.title)}</h3><div class="concept-fields${proseGrid ? ' concept-fields--prose-grid' : ''}">
    ${group.fields.map(field => renderControl(field, draft.fields[field.id])).join('')}
  </div></section>`;
}

function renderVariants(draft, list) {
  const cards = draft.rows.images.map((row, index) => {
    const title = variantTitle(row, index);
    const favorite = row.id === draft.favorite;
    const selectedUrl = draft.mainImage?.variantId === row.id ? safeConceptUrl(draft.mainImage.url) : '';
    return `<article class="variant-card" data-collection="images" data-row="${row.id}" data-favorite="${favorite}"
      data-main-image="${mainImageMatches(draft.mainImage, row)}" data-selected-url="${e(selectedUrl)}">
      <div class="variant-heading"><h4 tabindex="-1">${e(title)}</h4>
        <label class="variant-favorite" title="Diese Variante als Favorit markieren"><input type="radio" name="favorite" value="${row.id}" data-role="favorite"${favorite ? ' checked' : ''} aria-label="${e(`${title} als Favorit`)}">Favorit</label>
      </div>
      ${renderMedia(row.url, title, { format: row.format, fallbackFormat: list.defaultMediaFormat })}
      <div class="workshop-actions variant-main-choice">
        <button type="button" class="workshop-button" data-action="choose-main-image"${safeConceptUrl(row.url) ? '' : ' disabled'}>
          <span class="variant-main-set">Als Hauptbild festlegen</span><span class="variant-main-update">Festlegung aktualisieren</span>
        </button>
        <span class="decision-state" data-confirmed="true" data-role="variant-main-label">Hauptbild</span>
      </div>
      <div class="variant-fields">${list.fields.map(field => renderControl(field, row[field.id], { media: field.id === 'url' })).join('')}</div>
    </article>`;
  }).join('');
  return `<section class="concept-group concept-image-list">
    ${renderMainImageStatus(draft.mainImage)}
    <div class="concept-list-heading"><h3>${e(list.title)}</h3><button class="concept-link" type="button" data-action="clear-favorite"${draft.favorite ? '' : ' hidden'}>Favorit lösen</button></div>
    <div class="concept-variants">${cards}</div>
    <p class="concept-field-help">Ein direkter Bildlink beginnt mit http:// oder https://. Bilder aus Aleria kannst du auch mit ihrem Seitenpfad verlinken.</p>
  </section>`;
}

function renderTraits(draft, list) {
  return `<section class="concept-group"><h3>${e(list.title)}</h3><ul class="concept-traits">
    ${draft.rows.traits.map(row => `<li data-collection="traits" data-row="${row.id}">
      ${list.fields.map(field => field.type === 'icon'
        ? renderIconControl(field, row[field.id])
        : renderControl(field, row[field.id])).join('')}
    </li>`).join('')}
  </ul></section>`;
}

function renderListRow(listId, row, definition, drafts, relationGroups) {
  const fields = definition.fields.map(field => {
    if (field.type === 'reference') return renderReferenceControl(field, row, drafts);
    if (field.type === 'icon') return renderIconControl(field, row[field.id]);
    return renderControl(field, row[field.id], { media: field.id === definition.media });
  }).join('');
  const category = listId === 'relations' ? renderControl({ id: 'category', label: 'Beziehungsreiter', options: relationGroups }, row.category) : '';
  const name = referencedName(row, drafts) || 'Bildreferenz';
  return `<li class="concept-row" data-collection="${listId}" data-row="${e(row.id)}">
    <div class="concept-fields">${fields}${category}</div>
    ${definition.media ? `<div class="concept-row-media"${row[definition.media]?.trim() ? '' : ' hidden'}>${renderMedia(row[definition.media], name, {
      empty: 'Optionales Bild', format: row.format, fallbackFormat: definition.defaultMediaFormat
    })}</div>` : ''}
    <button class="concept-link concept-remove" type="button" data-action="remove-row">Eintrag entfernen</button>
  </li>`;
}

function renderList(listId, draft, type, drafts, relationship) {
  const definition = type.lists[listId];
  if (listId === 'images') return renderVariants(draft, definition);
  if (listId === 'decisions') return renderDecisionEditor(draft, type, renderControl);
  if (listId === 'traits') return renderTraits(draft, definition);
  const relations = listId === 'relations';
  const rows = relations ? draft.rows[listId].filter(row => row.category === relationship) : draft.rows[listId];
  const title = relations ? type.relationGroups[relationship] : definition.title;
  return `<section class="concept-group">
    ${relations ? renderTabs(Object.entries(type.relationGroups).map(([id, label]) => ({ id, label })), 'relationship',
      relationship, 'relationship-panel', 'Beziehungsgruppen') : ''}
    <div${relations ? ` id="relationship-panel" role="tabpanel" aria-labelledby="relationship-${e(relationship)}"` : ''}>
      <div class="concept-list-heading"><h3>${e(title)}</h3><button type="button" class="workshop-button" data-action="add-row" data-collection="${listId}">＋ ${e(definition.add)}</button></div>
      ${rows.length
        ? `<ul class="concept-list">${rows.map(row => renderListRow(listId, row, definition, drafts, type.relationGroups)).join('')}</ul>`
        : '<p class="concept-empty">Hier sind noch keine Einträge.</p>'}
    </div>
  </section>`;
}

function renderProfileImage(draft, type) {
  const row = draft.rows.images.find(row => row.id === draft.favorite && safeConceptUrl(row.url))
    ?? draft.rows.images.find(row => safeConceptUrl(row.url));
  const image = draft.mainImage ?? row;
  const title = draft.mainImage?.title ?? (row ? variantTitle(row, draft.rows.images.indexOf(row)) : '');
  const imagesTab = type.tabs.find(tab => tab.id === 'images');
  return `<aside class="concept-profile-image">
    <h3>${draft.mainImage ? 'Hauptbild' : e(imagesTab.label)}</h3>
    ${renderMedia(image?.url, title, {
      empty: 'Noch kein Bild verlinkt', format: image?.format, fallbackFormat: type.lists.images.defaultMediaFormat
    })}
    <button type="button" class="workshop-button" data-action="section" data-id="images">Bildvarianten bearbeiten →</button>
  </aside>`;
}

function renderPanel(draft, type, drafts, section, relationship) {
  const groups = section.groups.map(group => renderGroup(group, draft));
  const lists = section.lists.map(id => renderList(id, draft, type, drafts, relationship));
  const pieces = [
    section.hint ? `<p class="concept-section-hint">${e(section.hint)}</p>` : '',
    ...(section.id === 'images' ? [...lists, ...groups] : [...groups, ...lists])
  ].join('');
  return `<div class="concept-panel" role="tabpanel" id="concept-panel" aria-labelledby="section-${section.id}">
    ${section.id === 'profile' ? `<div class="concept-profile"><div>${pieces}</div>${renderProfileImage(draft, type)}</div>` : pieces}
  </div>`;
}

export function renderConceptEditor(draft, { drafts, section, relationship, reading }) {
  if (!draft) return renderWelcome();
  const type = CONCEPT_TYPES[draft.kind];
  return `<div class="concept-heading">
    <div class="concept-heading-copy"><p class="concept-kind">${artImage(type.art, 21)}${e(type.label)} <span aria-hidden="true">·</span> <span data-role="active-stage">${e(STAGES[draft.fields.stage] || STAGES.idea)}</span></p>
      <h2 data-role="active-title" tabindex="-1">${e(conceptTitle(draft))}</h2>
    </div>
    <div class="workshop-actions">
      <button type="button" class="workshop-button" data-action="toggle-reading">${artImage(reading ? 'quill' : 'learning', 18)}${reading ? 'Bearbeiten' : 'Lesefassung'}</button>
      <button type="button" class="workshop-button" data-action="export-one">${artImage('export', 18)}Entwurf exportieren</button>
    </div>
  </div>
  ${reading ? renderConceptReading(draft, drafts)
    : `${renderTabs(type.tabs, 'section', section.id, 'concept-panel', 'Abschnitte im Entwurf')}${renderPanel(draft, type, drafts, section, relationship)}`}
  <footer class="concept-footer">${reading ? '' : '<button type="button" class="concept-link concept-remove" data-action="delete-draft">Entwurf löschen</button>'}</footer>`;
}
