// The shared, generated facade is loaded before the classic module editors.
function makeLandingItemId(prefix = 'item') {
  return prefix + '-' + (globalThis.crypto?.randomUUID?.() || Date.now().toString(36) + '-' + Math.random().toString(36).slice(2));
}
function sanitizeLandingNumber(value, fallback = 0, min = 0, max = 100) { return AleriaLandingModel.landingNumber(value, fallback, min, max); }
function sanitizeLandingMembers(items) { return AleriaLandingModel.normalizeLandingMembers(items); }
function sanitizeLandingQuests(items) { return AleriaLandingModel.normalizeLandingQuests(items); }
function sanitizeLandingNotes(items) { return AleriaLandingModel.normalizeLandingNotes(items); }
function sanitizeLandingEvents(items) { return AleriaLandingModel.normalizeLandingEvents(items, sanitizeAleriaDate); }
function sanitizeLandingInfo(items) { return AleriaLandingModel.normalizeLandingInfo(items); }
function sanitizeLandingData(data = {}) { return AleriaLandingModel.normalizeLandingData(data, sanitizeAleriaDate); }
function createDefaultLandingPage(index = 0) {
  return { ...AleriaLandingModel.createLandingPage(), pageTitle: getRomanPageLabel(index) + ' – Gruppenübersicht' };
}

function buildLandingInput(label, className, value, type = 'text') {
  return `
    <label>
      <span>${escapeHtml(label)}</span>
      <input class="inline-edit-input ${className}" type="${escapeHtml(type)}" value="${escapeHtml(value || '')}">
    </label>`;
}

function buildLandingTextarea(label, className, value) {
  return `
    <label class="wide">
      <span>${escapeHtml(label)}</span>
      <textarea class="inline-edit-textarea ${className}">${escapeHtml(value || '')}</textarea>
    </label>`;
}

let _landingIconPickerTarget = null;

function buildLandingIconInput(label, className, value) {
  return `
    <label>
      <span>${escapeHtml(label)}</span>
      <span class="biography-ability-icon-field">
        <input class="inline-edit-input ${className}" type="text" value="${escapeHtml(value || '')}">
        <button class="module-editor-mini-btn biography-ability-icon-picker" type="button" data-module-editor-action="pick-landing-icon" data-landing-icon-target="${className}" title="Icon-Verzeichnis oeffnen" aria-label="Icon-Verzeichnis oeffnen">Icon</button>
      </span>
    </label>`;
}

function openLandingIconPicker(button) {
  const targetClass = button?.dataset?.landingIconTarget || '';
  const target = button.closest('.trade-editor-grid, .module-editor-field')?.querySelector(`.${targetClass}`)
    || button.parentElement?.querySelector(`.${targetClass}`);
  if (!target) return;
  _landingIconPickerTarget = target;
  if (typeof openIconDirectory === 'function') {
    openIconDirectory();
    return;
  }
  _landingIconPickerTarget = null;
}

function handleLandingIconSelected(event) {
  const target = _landingIconPickerTarget;
  const src = String(event?.detail?.src || '').trim();
  if (!target || !target.isConnected || !src) {
    _landingIconPickerTarget = null;
    return;
  }
  target.value = src;
  target.dispatchEvent(new Event('input', { bubbles: true }));
  target.dispatchEvent(new Event('change', { bubbles: true }));
  try {
    target.focus({ preventScroll: true });
  } catch {
    target.focus();
  }
  if (typeof closeIconDirectory === 'function') {
    closeIconDirectory();
  }
  _landingIconPickerTarget = null;
}

document.addEventListener('almanach-icon-selected', handleLandingIconSelected);

function getLandingKartenRegistry() {
  return (typeof KartoMapRegistry !== 'undefined' && KartoMapRegistry?.all) ? KartoMapRegistry.all() : [];
}

function buildLandingKartenOptions(selectedId) {
  const maps = getLandingKartenRegistry();
  const options = maps.map(map => {
    const breadcrumb = (map.hierarchy || []).map(step => step.title).join(' / ');
    const label = breadcrumb && breadcrumb !== map.title ? `${map.title} (${breadcrumb})` : map.title;
    return `<option value="${escapeHtml(map.id)}"${map.id === selectedId ? ' selected' : ''}>${escapeHtml(label)}</option>`;
  }).join('');
  return `<option value=""${selectedId ? '' : ' selected'}>Keine - Platzhalterbild verwenden</option>${options}`;
}

function buildLandingMapKartenField(data) {
  return `
    <label>
      <span>Karte aus "Karten"</span>
      <select class="inline-edit-select me-landing-mapKartenId" data-module-editor-action="sync-json-preview">
        ${buildLandingKartenOptions(data.mapKartenId)}
      </select>
    </label><label><span>Darstellung</span><select class="inline-edit-select me-landing-mapDisplay" data-module-editor-action="sync-json-preview"><option value="embed"${data.mapDisplay === 'embed' ? ' selected' : ''}>Interaktive Karte (Iframe)</option><option value="image"${data.mapDisplay === 'image' ? ' selected' : ''}>Vorschaubild</option></select></label>`;
}

function buildLandingMemberRows(members = [], mode = 'module') {
  return members.map((member, index) => `
    <section class="trade-editor-item landing-editor-member-row">
      <input type="hidden" class="me-landing-member-id" value="${escapeHtml(member.id)}">
      <div class="trade-editor-item-head compact">
        <div><span>Abenteurer ${index + 1}</span><small>Portrait, Rolle und Status.</small></div>
        <button class="module-editor-mini-btn module-editor-danger" type="button" data-${mode === 'inline' ? 'inline' : 'module-editor'}-action="remove-landing-member" data-landing-index="${index}">Entfernen</button>
      </div>
      <div class="trade-editor-grid">
        ${buildLandingInput('Name', 'me-landing-member-name', member.name)}
        ${buildLandingInput('Rolle', 'me-landing-member-role', member.role)}
        ${buildLandingInput('Klasse', 'me-landing-member-className', member.className)}
        ${buildLandingInput('Status', 'me-landing-member-status', member.status)}
        ${buildLandingInput('Statusfarbe', 'me-landing-member-statusColor', member.statusColor)}
        ${buildLandingIconInput('Badge/Icon oder Bild-URL', 'me-landing-member-badgeIcon', member.badgeIcon)}
        ${buildLandingInput('Portrait', 'me-landing-member-portrait', member.portrait, 'url')}
      </div>
    </section>`).join('');
}

function buildLandingQuestRows(quests = [], mode = 'module') {
  return quests.map((quest, index) => `
    <section class="trade-editor-item landing-editor-quest-row">
      <input type="hidden" class="me-landing-quest-id" value="${escapeHtml(quest.id)}">
      <div class="trade-editor-item-head compact">
        <div><span>Quest ${index + 1}</span><small>Status, Fortschritt und Bild.</small></div>
        <button class="module-editor-mini-btn module-editor-danger" type="button" data-${mode === 'inline' ? 'inline' : 'module-editor'}-action="remove-landing-quest" data-landing-index="${index}">Entfernen</button>
      </div>
      <div class="trade-editor-grid">
        ${buildLandingInput('Titel', 'me-landing-quest-title', quest.title)}
        ${buildLandingInput('Art', 'me-landing-quest-kind', quest.kind)}
        <label><span>Status</span><select class="inline-edit-select me-landing-quest-status">
          <option value="active"${quest.status === 'active' ? ' selected' : ''}>Aktiv</option>
          <option value="done"${quest.status === 'done' ? ' selected' : ''}>Abgeschlossen</option>
          <option value="failed"${quest.status === 'failed' ? ' selected' : ''}>Fehlgeschlagen</option>
        </select></label>
        ${buildLandingInput('Fortschritt', 'me-landing-quest-progress', quest.progress, 'number')}
        ${buildLandingIconInput('Icon oder Bild-URL', 'me-landing-quest-image', quest.image)}
        ${buildLandingTextarea('Text', 'me-landing-quest-text', quest.text)}
      </div>
    </section>`).join('');
}

function buildLandingNoteRows(notes = [], mode = 'module') {
  return notes.map((note, index) => `
    <section class="trade-editor-item landing-editor-note-row">
      <input type="hidden" class="me-landing-note-id" value="${escapeHtml(note.id)}">
      <div class="trade-editor-item-head compact">
        <div><span>Notiz ${index + 1}</span><small>Autor, Zeit und Text.</small></div>
        <button class="module-editor-mini-btn module-editor-danger" type="button" data-${mode === 'inline' ? 'inline' : 'module-editor'}-action="remove-landing-note" data-landing-index="${index}">Entfernen</button>
      </div>
      <div class="trade-editor-grid">
        ${buildLandingInput('Titel', 'me-landing-note-title', note.title)}
        ${buildLandingIconInput('Icon oder Bild-URL', 'me-landing-note-icon', note.icon)}
        ${buildLandingInput('Autor', 'me-landing-note-authorName', note.authorName)}
        ${buildLandingInput('Autor-ID optional', 'me-landing-note-authorId', note.authorId)}
        ${buildLandingInput('Zeitstempel', 'me-landing-note-createdAt', note.createdAt)}
        ${buildLandingTextarea('Text', 'me-landing-note-text', note.text)}
      </div>
    </section>`).join('');
}

function buildLandingSimpleRows(items = [], kind = 'event', mode = 'module') {
  return items.map((item, index) => `
    <section class="trade-editor-item landing-editor-${kind}-row">
      <div class="trade-editor-item-head compact">
        <div><span>${kind === 'event' ? 'Ereignis' : 'Info'} ${index + 1}</span></div>
        <button class="module-editor-mini-btn module-editor-danger" type="button" data-${mode === 'inline' ? 'inline' : 'module-editor'}-action="remove-landing-${kind}" data-landing-index="${index}">Entfernen</button>
      </div>
      <div class="trade-editor-grid">
        ${buildLandingIconInput('Icon oder Bild-URL', `me-landing-${kind}-icon`, item.icon)}
        ${buildLandingInput(kind === 'event' ? 'Beschreibung' : 'Titel', `me-landing-${kind}-title`, item.title)}
        ${buildLandingInput(kind === 'event' ? 'Datum (Freitext)' : 'Text', `me-landing-${kind}-${kind === 'event' ? 'time' : 'text'}`, kind === 'event' ? item.time : item.text)}
        ${kind === 'event' ? buildAleriaDateField('Aleria-Datum', 'me-landing-event-aleriaDate', item.aleriaDate) : ''}
      </div>
    </section>`).join('');
}

function collectLandingRows(block, selector, mapper) {
  return Array.from(block.querySelectorAll(selector)).map(mapper);
}

function collectLandingDataFromBlock(block) {
  let base = {};
  try { base = JSON.parse(block.dataset?.landingBase || '{}'); } catch { /* Older templates have no preserved state. */ }
  return sanitizeLandingData({
    ...base,
    bannerImage: getTrimmedFormValue(block, '.me-landing-bannerImage'),
    title: getTrimmedFormValue(block, '.me-landing-title'),
    subtitle: getTrimmedFormValue(block, '.me-landing-subtitle'),
    memberTitle: getTrimmedFormValue(block, '.me-landing-memberTitle'),
    questTitle: getTrimmedFormValue(block, '.me-landing-questTitle'),
    notesTitle: getTrimmedFormValue(block, '.me-landing-notesTitle'),
    eventsTitle: getTrimmedFormValue(block, '.me-landing-eventsTitle'),
    mapTitle: getTrimmedFormValue(block, '.me-landing-mapTitle'),
    mapKartenId: getTrimmedFormValue(block, '.me-landing-mapKartenId'),
    mapDisplay: getTrimmedFormValue(block, '.me-landing-mapDisplay'),
    mapImage: getTrimmedFormValue(block, '.me-landing-mapImage'),
    mapLink: getTrimmedFormValue(block, '.me-landing-mapLink'),
    mapButtonLabel: getTrimmedFormValue(block, '.me-landing-mapButtonLabel'),
    infoTitle: getTrimmedFormValue(block, '.me-landing-infoTitle'),
    members: base.group ? base.members : collectLandingRows(block, '.landing-editor-member-row', row => ({
      ...(base.members || []).find(item => item.id === getTrimmedFormValue(row, '.me-landing-member-id')),
      id: getTrimmedFormValue(row, '.me-landing-member-id'),
      name: getTrimmedFormValue(row, '.me-landing-member-name'),
      role: getTrimmedFormValue(row, '.me-landing-member-role'),
      className: getTrimmedFormValue(row, '.me-landing-member-className'),
      status: getTrimmedFormValue(row, '.me-landing-member-status'),
      statusColor: getTrimmedFormValue(row, '.me-landing-member-statusColor'),
      badgeIcon: getTrimmedFormValue(row, '.me-landing-member-badgeIcon'),
      portrait: getTrimmedFormValue(row, '.me-landing-member-portrait')
    })),
    quests: collectLandingRows(block, '.landing-editor-quest-row', row => ({
      ...(base.quests || []).find(item => item.id === getTrimmedFormValue(row, '.me-landing-quest-id')),
      id: getTrimmedFormValue(row, '.me-landing-quest-id'),
      title: getTrimmedFormValue(row, '.me-landing-quest-title'),
      kind: getTrimmedFormValue(row, '.me-landing-quest-kind'),
      status: getTrimmedFormValue(row, '.me-landing-quest-status'),
      progress: getTrimmedFormValue(row, '.me-landing-quest-progress'),
      image: getTrimmedFormValue(row, '.me-landing-quest-image'),
      text: getTrimmedFormValue(row, '.me-landing-quest-text')
    })),
    notes: collectLandingRows(block, '.landing-editor-note-row', row => ({
      id: getTrimmedFormValue(row, '.me-landing-note-id'),
      title: getTrimmedFormValue(row, '.me-landing-note-title'),
      icon: getTrimmedFormValue(row, '.me-landing-note-icon'),
      authorName: getTrimmedFormValue(row, '.me-landing-note-authorName'),
      authorId: getTrimmedFormValue(row, '.me-landing-note-authorId'),
      createdAt: getTrimmedFormValue(row, '.me-landing-note-createdAt'),
      text: getTrimmedFormValue(row, '.me-landing-note-text')
    })),
    events: collectLandingRows(block, '.landing-editor-event-row', row => ({
      icon: getTrimmedFormValue(row, '.me-landing-event-icon'),
      title: getTrimmedFormValue(row, '.me-landing-event-title'),
      time: getTrimmedFormValue(row, '.me-landing-event-time'),
      aleriaDate: collectAleriaDateFromBlock(row, 'me-landing-event-aleriaDate')
    })),
    info: collectLandingRows(block, '.landing-editor-info-row', row => ({
      icon: getTrimmedFormValue(row, '.me-landing-info-icon'),
      title: getTrimmedFormValue(row, '.me-landing-info-title'),
      text: getTrimmedFormValue(row, '.me-landing-info-text')
    }))
  });
}

function buildLandingModuleEditorFields(page) {
  const data = sanitizeLandingData(page?.landing || {});
  return `
    <div class="module-page-type-block${inferModulePageType(page) === 'landing' ? ' visible' : ''}" data-page-type="landing" data-landing-base="${escapeHtml(JSON.stringify(data))}">
      <div class="module-editor-grid">
        <div class="module-editor-field wide">
          <div class="module-editor-kicker">Landing Page</div>
          <div class="module-editor-help">Übersicht mit Mitgliedern, Aufgaben, Notizen, Ereignissen und Karte.${data.group ? ' Die aktuelle Gruppe, Gäste, aktive Sitzung und Kasse bearbeitest du direkt auf der Gruppenseite. Mitglieder stammen aus der Hierarchie.' : ''}</div>
        </div>
        <div class="module-editor-field wide"><label>Kopfbereich</label><div class="trade-editor-grid">
          ${buildLandingInput('Titel', 'me-landing-title', data.title)}
          ${buildLandingInput('Untertitel', 'me-landing-subtitle', data.subtitle)}
          ${buildLandingIconInput('Bannerbild', 'me-landing-bannerImage', data.bannerImage)}
        </div></div>
        <div class="module-editor-field wide"><label>Ueberschriften</label><div class="trade-editor-grid">
          ${buildLandingInput('Abenteurer', 'me-landing-memberTitle', data.memberTitle)}
          ${buildLandingInput('Quests', 'me-landing-questTitle', data.questTitle)}
          ${buildLandingInput('Notizen', 'me-landing-notesTitle', data.notesTitle)}
          ${buildLandingInput('Ereignisse', 'me-landing-eventsTitle', data.eventsTitle)}
          ${buildLandingInput('Karte', 'me-landing-mapTitle', data.mapTitle)}
          ${buildLandingInput('Informationen', 'me-landing-infoTitle', data.infoTitle)}
        </div></div>
        ${data.group ? '' : `<div class="module-editor-field wide"><div class="module-editor-inline" style="justify-content:space-between;"><label>Mitglieder</label><button class="module-editor-mini-btn" type="button" data-module-editor-action="add-landing-member">+ Mitglied</button></div><div class="trade-editor-list landing-editor-member-list">${buildLandingMemberRows(data.members, 'module')}</div></div>`}
        <div class="module-editor-field wide"><div class="module-editor-inline" style="justify-content:space-between;"><label>Quests</label><button class="module-editor-mini-btn" type="button" data-module-editor-action="add-landing-quest">+ Quest</button></div><div class="trade-editor-list landing-editor-quest-list">${buildLandingQuestRows(data.quests, 'module')}</div></div>
        <div class="module-editor-field wide"><div class="module-editor-inline" style="justify-content:space-between;"><label>Notizen</label><button class="module-editor-mini-btn" type="button" data-module-editor-action="add-landing-note">+ Notiz</button></div><div class="trade-editor-list landing-editor-note-list">${buildLandingNoteRows(data.notes, 'module')}</div></div>
        <div class="module-editor-field wide"><div class="module-editor-inline" style="justify-content:space-between;"><label>Letzte Ereignisse</label><button class="module-editor-mini-btn" type="button" data-module-editor-action="add-landing-event">+ Ereignis</button></div><div class="trade-editor-list landing-editor-event-list">${buildLandingSimpleRows(data.events, 'event', 'module')}</div></div>
        <div class="module-editor-field wide"><label>Aktuelle Karte</label><div class="module-editor-help">Waehle eine Karte aus dem "Karten"-Ordner: Es wird eine kleine Vorschau angezeigt, der Button oeffnet die vollstaendige Karte in einem neuen Tab. Ohne Auswahl wird ersatzweise das Platzhalterbild mit Klickziel genutzt.</div><div class="trade-editor-grid">
          ${buildLandingMapKartenField(data)}
          ${buildLandingIconInput('Platzhalterbild (Fallback)', 'me-landing-mapImage', data.mapImage)}
          ${buildLandingInput('Klickziel / Modul-ID / Link (Fallback)', 'me-landing-mapLink', data.mapLink)}
          ${buildLandingInput('Buttontext', 'me-landing-mapButtonLabel', data.mapButtonLabel)}
        </div></div>
        <div class="module-editor-field wide"><div class="module-editor-inline" style="justify-content:space-between;"><label>Informationen</label><button class="module-editor-mini-btn" type="button" data-module-editor-action="add-landing-info">+ Info</button></div><div class="trade-editor-list landing-editor-info-list">${buildLandingSimpleRows(data.info, 'info', 'module')}</div></div>
      </div>
    </div>`;
}

function collectLandingModuleEditorPage(card, page) {
  const block = card.querySelector('[data-page-type="landing"]') || card;
  page.landingPage = true;
  page.landing = collectLandingDataFromBlock(block);
  return page;
}

function addLandingEditorItem(button, kind) {
  const card = button.closest('.module-page-card');
  if (!card) return;
  const page = collectModulePageFromCard(card);
  const data = sanitizeLandingData(page.landing || {});
  if (kind === 'member') data.members.push({ name: 'Neuer Abenteurer', role: '', className: '', status: 'Bereit' });
  if (kind === 'quest') data.quests.push({ title: 'Neue Quest', text: '', kind: 'Quest', status: 'active', progress: 0 });
  if (kind === 'note') data.notes.push({ title: 'Neue Notiz', text: '', icon: '', authorName: 'Erzaehler', createdAt: new Date().toISOString() });
  if (kind === 'event') data.events.push({ icon: '*', title: 'Neues Ereignis', time: '' });
  if (kind === 'info') data.info.push({ icon: '*', title: 'Neue Information', text: '' });
  page.landing = sanitizeLandingData(data);
  card.outerHTML = buildModulePageEditorMarkup(page, Number(card.dataset.pageIndex || 0));
  syncModuleJsonPreview();
}

function removeLandingEditorItem(button, kind) {
  const card = button.closest('.module-page-card');
  if (!card) return;
  const page = collectModulePageFromCard(card);
  const data = sanitizeLandingData(page.landing || {});
  const index = Number(button.dataset.landingIndex || -1);
  const listName = kind === 'member' ? 'members' : (kind === 'info' ? 'info' : `${kind}s`);
  if (index >= 0 && Array.isArray(data[listName])) data[listName].splice(index, 1);
  page.landing = sanitizeLandingData(data);
  card.outerHTML = buildModulePageEditorMarkup(page, Number(card.dataset.pageIndex || 0));
  syncModuleJsonPreview();
}

function buildInlineLandingEditor(page) {
  const data = sanitizeLandingData(page?.landing || {});
  return `
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Landing Page</div>
      <div class="inline-edit-grid">
        <div class="inline-edit-field"><span class="inline-edit-label">Titel</span><input class="inline-edit-input" data-inline-action="update-landing-field" data-landing-field="title" value="${escapeHtml(data.title)}"></div>
        <div class="inline-edit-field"><span class="inline-edit-label">Untertitel</span><input class="inline-edit-input" data-inline-action="update-landing-field" data-landing-field="subtitle" value="${escapeHtml(data.subtitle)}"></div>
        <div class="inline-edit-field wide"><span class="inline-edit-label">Bannerbild</span><input class="inline-edit-input" data-inline-action="update-landing-field" data-landing-field="bannerImage" value="${escapeHtml(data.bannerImage)}"></div>
      </div>
      <div class="inline-placeholder-note">${data.group ? 'Zusammenstellung, Gäste, Status, Kasse und aktive Sitzung lassen sich in der fertigen Gruppenübersicht direkt bearbeiten. Die Hierarchie bleibt die Quelle der Mitglieder.' : 'Listen und Darstellung bearbeitest du im Modul-Editor. Aufgaben und Notizen lassen sich auch direkt in der fertigen Ansicht pflegen.'}</div>
    </div>`;
}

function updateInlineLandingField(input) {
  const page = getInlineDraftPageForSource(input);
  if (!page) return;
  const data = sanitizeLandingData(page.landing || {});
  const field = input.dataset.landingField;
  if (!field) return;
  data[field] = String(input.value || '').trim();
  page.landingPage = true;
  page.landing = sanitizeLandingData(data);
}
