const COLLECTIONS = ['traits', 'connections'];

function iconField(value, label, escape) {
  return `<label class="creature-field"><span>${label}</span><span class="creature-biography-icon-field" data-role="schema-icon-field">
    <input class="schema-icon-field" data-schema-field="icon" data-biography-card-field="icon" value="${escape(value)}" maxlength="2000" placeholder="Symbol oder Bild-URL">
    <button type="button" data-creature-biography-action="pick-icon" data-schema-field="icon" aria-label="Icon für ${label} auswählen">Icon auswählen</button>
  </span></label>`;
}

function rowTools(collection, index, length) {
  return `<div class="creature-biography-row-tools">
    <button type="button" data-creature-biography-action="move-card" data-direction="-1"${index === 0 ? ' disabled' : ''} aria-label="Eintrag nach oben">↑</button>
    <button type="button" data-creature-biography-action="move-card" data-direction="1"${index === length - 1 ? ' disabled' : ''} aria-label="Eintrag nach unten">↓</button>
    <button type="button" data-creature-biography-action="remove-card">${collection === 'traits' ? 'Eigenschaft' : 'Verbindung'} entfernen</button>
  </div>`;
}

function renderRow(item, collection, index, length, escape) {
  const input = (key, label, limit = 140) => `<label class="creature-field"><span>${label}</span><input data-biography-card-field="${key}" value="${escape(item[key] || '')}" maxlength="${limit}"></label>`;
  const heading = item.type === 'heading';
  return `<div class="creature-biography-card-editor" data-creature-biography-row="${collection}" data-index="${index}" data-card-type="${heading ? 'heading' : 'connection'}">
    ${collection === 'traits' ? `${iconField(item.icon, 'Eigenschaft', escape)}${input('title', 'Eigenschaft')}` : heading ? input('title', 'Zwischenüberschrift') : `
      ${input('name', 'Name')}${input('image', 'Portrait-URL', 2000)}${iconField(item.icon, 'Verbindung', escape)}
      <label class="creature-field"><span>Bildformat</span><select data-biography-card-field="imageFormat">${[['portrait', 'Hochformat'], ['landscape', 'Querformat'], ['square', 'Quadrat']].map(([value, label]) => `<option value="${value}"${item.imageFormat === value ? ' selected' : ''}>${label}</option>`).join('')}</select></label>`}
    <label class="creature-field"><span>${collection === 'traits' ? 'Beschreibung' : 'Beziehung / Bedeutung'}</span><textarea data-biography-card-field="detail" rows="3" maxlength="4000">${escape(item.detail || '')}</textarea></label>
    ${rowTools(collection, index, length)}
  </div>`;
}

export function renderCreatureBiographyCardEditor(biography, escape) {
  return COLLECTIONS.map(collection => {
    const traits = collection === 'traits';
    const titleKey = traits ? 'traitsTitle' : 'connectionsTitle';
    return `<section class="creature-biography-edit-section"><h4>${traits ? 'Persönlichkeit & Eigenschaften' : 'Verbindungen'}</h4>
      <p>${traits ? 'Einzelne Wesenszüge mit Symbol, Titel und Beschreibung.' : 'Vertraute, Gefährten, Rudel, Orte oder Erschaffer mit Portrait oder Icon.'}</p>
      <label class="creature-field"><span>Abschnittsüberschrift</span><input data-creature-biography-field="${titleKey}" value="${escape(biography[titleKey])}" maxlength="140"></label>
      ${biography[collection].map((item, index, list) => renderRow(item, collection, index, list.length, escape)).join('')}
      <div class="creature-biography-row-tools"><button type="button" data-creature-biography-action="add-${traits ? 'trait' : 'connection'}"${biography[collection].length >= 40 ? ' disabled' : ''}>+ ${traits ? 'Eigenschaft' : 'Verbindung'}</button>
      ${traits ? '' : `<button type="button" data-creature-biography-action="add-connection-heading"${biography.connections.length >= 40 ? ' disabled' : ''}>+ Zwischenüberschrift</button>`}</div>
    </section>`;
  }).join('');
}

export function collectCreatureBiographyCards(root) {
  return Object.fromEntries(COLLECTIONS.map(collection => [collection,
    [...root.querySelectorAll(`[data-creature-biography-row="${collection}"]`)].map(row => {
      const item = collection === 'connections' ? { type: row.dataset.cardType } : {};
      row.querySelectorAll('[data-biography-card-field]').forEach(field => { item[field.dataset.biographyCardField] = field.value; });
      return item;
    })
  ]));
}

export function updateCreatureBiographyCards(biography, trigger) {
  const action = trigger.dataset.creatureBiographyAction;
  if (action === 'add-trait' && biography.traits.length < 40) biography.traits.push({ icon: '✦', title: '', detail: '' });
  else if (['add-connection', 'add-connection-heading'].includes(action) && biography.connections.length < 40) {
    biography.connections.push({ type: action === 'add-connection-heading' ? 'heading' : 'connection', title: '', image: '', icon: '', imageFormat: 'portrait', name: '', detail: '' });
  } else if (['move-card', 'remove-card'].includes(action)) {
    const row = trigger.closest('[data-creature-biography-row]');
    if (!COLLECTIONS.includes(row?.dataset.creatureBiographyRow)) return false;
    const list = biography[row.dataset.creatureBiographyRow];
    const index = Number(row.dataset.index);
    if (!Number.isInteger(index) || !list[index]) return false;
    if (action === 'remove-card') list.splice(index, 1);
    else {
      const direction = Number(trigger.dataset.direction);
      if (![-1, 1].includes(direction) || !list[index + direction]) return false;
      [list[index], list[index + direction]] = [list[index + direction], list[index]];
    }
  } else return false;
  return true;
}
