// Shared structured editor UI for static and inline v2 family editing.

(function installFamilyEditorUi(global) {
  'use strict';

  const OPTION_LABELS = Object.freeze({
    person: 'Person', placeholder: 'Unbekannte Person', known: 'Bekannt', unknown: 'Unbekannt', missing: 'Verschollen', secret: 'Geheim',
    female: 'Weiblich', male: 'Männlich', intersex: 'Intersexuell', alive: 'Lebend', dead: 'Verstorben', undead: 'Untot',
    vertical: 'Vertikal', horizontal: 'Horizontal', confirmed: 'Bestätigt', probable: 'Wahrscheinlich', rumored: 'Gerücht',
    disputed: 'Umstritten', denied: 'Verneint', public: 'Öffentlich', private: 'Privat',
    marriage: 'Ehe', engagement: 'Verlobung', union: 'Verbindung', affair: 'Affäre', concubinage: 'Konkubinat',
    political: 'Politisch', magical: 'Magisch', custom: 'Benutzerdefiniert', divorce: 'Scheidung', annulment: 'Annullierung',
    separation: 'Trennung', 'broken-engagement': 'Gelöste Verlobung', death: 'Tod', biological: 'Biologisch',
    adoptive: 'Adoption', foster: 'Pflege', guardian: 'Vormundschaft', step: 'Stiefelternschaft', claimed: 'Beansprucht',
    legitimate: 'Legitim', illegitimate: 'Unehelich', legitimized: 'Legitimiert', active: 'Aktiv', ended: 'Beendet', extinct: 'Ausgestorben',
    hidden: 'Verborgen', house: 'Haus', dynasty: 'Dynastie', clan: 'Clan', order: 'Orden', main: 'Hauptlinie',
    branch: 'Nebenlinie', cadet: 'Kadettenlinie', birth: 'Geburt', adoption: 'Adoption', oath: 'Eid', claim: 'Anspruch',
    former: 'Ehemalig', title: 'Titel', vacant: 'Vakant', current: 'Aktuell', regent: 'Regentschaft', contested: 'Angefochten',
    birthright: 'Geburtsrecht', conquest: 'Eroberung', fulfilled: 'Erfüllt', renounced: 'Verzichtet',
    mundane: 'Gewöhnlich', divine: 'Göttlich', cursed: 'Verflucht', dormant: 'Ruhend', born: 'Angeboren',
    awakened: 'Erwacht', transferred: 'Übertragen', heir: 'Erbe', eligible: 'Berechtigt', excluded: 'Ausgeschlossen'
  });
  const COLLECTION_GROUPS = Object.freeze([
    { id: 'document', label: 'Aktenangaben', open: true },
    { id: 'genealogy', label: 'Personen', open: true },
    { id: 'relations', label: 'Beziehungen', open: true },
    { id: 'fantasy', label: 'Fantasy, Adel & Erbfolge', open: false }
  ]);

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getModel() {
    return global.AleriaFamily?.editor?.model || null;
  }

  function getOptionLabel(value) {
    return OPTION_LABELS[value] || value || '—';
  }

  function buildActionAttribute(mode, action) {
    return mode === 'inline'
      ? `data-inline-action="${escapeHtml(action)}"`
      : `data-module-editor-action="${escapeHtml(action)}"`;
  }

  function getDisplayValue(value, type) {
    if (type === 'array') return Array.isArray(value) ? value.join(', ') : '';
    if (type === 'participantRoles') {
      return Array.isArray(value)
        ? value.map(participant => `${participant?.personId || ''}:${participant?.role || 'participant'}`).join(', ')
        : '';
    }
    return value == null ? '' : value;
  }

  function buildField(field, value, context) {
    const type = field.type || 'text';
    const safeValue = escapeHtml(getDisplayValue(value, type));
    const fieldPath = context.recordPath
      ? `${context.recordPath}.${field.path}`
      : field.path;
    const action = buildActionAttribute(context.mode, context.mode === 'inline' ? 'update-family-v2-field' : 'sync-family-v2-field');
    const inputClass = context.recordPath ? 'me-family-v2-record-field' : 'me-family-v2-top-field';
    const attributes = [
      `data-family-path="${escapeHtml(fieldPath)}"`,
      `data-family-value-type="${escapeHtml(type)}"`,
      context.recordPath
        ? `data-family-record-field="${escapeHtml(field.path)}"`
        : '',
      `class="${type === 'boolean' ? 'family-v2-checkbox' : 'family-v2-input'} ${inputClass}"`,
      action
    ].filter(Boolean).join(' ');
    const wideClass = field.wide ? ' wide' : '';
    let control = '';
    if (type === 'select') {
      control = `<select ${attributes}>${(field.options || []).map(option => (
        `<option value="${escapeHtml(option)}"${String(value ?? '') === String(option) ? ' selected' : ''}>${escapeHtml(getOptionLabel(option))}</option>`
      )).join('')}</select>`;
    } else if (type === 'textarea') {
      control = `<textarea ${attributes} rows="3" placeholder="${escapeHtml(field.placeholder || '')}">${safeValue}</textarea>`;
    } else if (type === 'boolean') {
      control = `<label class="family-v2-check"><input ${attributes} type="checkbox"${value === true ? ' checked' : ''}><span>Aktiv</span></label>`;
    } else {
      const inputType = type === 'array' || type === 'participantRoles' ? 'text' : type;
      control = `<input ${attributes} type="${escapeHtml(inputType)}" value="${safeValue}" placeholder="${escapeHtml(field.placeholder || '')}">`;
    }
    return `
      <div class="family-v2-field${wideClass}">
        <label>${escapeHtml(field.label)}</label>
        ${control}
      </div>`;
  }

  function buildFieldGroup(group, family, mode, groupIndex) {
    const model = getModel();
    const workbenchGroup = group.id === 'presentation' || group.id === 'view' ? 'view' : group.id;
    return `
      <details class="family-v2-panel" data-family-workbench-group="${escapeHtml(workbenchGroup)}"${groupIndex === 0 ? ' open' : ''}>
        <summary>${escapeHtml(group.label)}</summary>
        <div class="family-v2-grid">
          ${group.fields.map(field => buildField(field, model.getPath(family, field.path, ''), { mode })).join('')}
        </div>
      </details>`;
  }

  function getRecordTitle(definition, record, index) {
    const model = getModel();
    return model.getPath(record, 'identity.displayName')
      || record?.name
      || record?.label
      || record?.id
      || `${definition.singular} ${index + 1}`;
  }

  function buildRecord(definition, record, index, mode) {
    const model = getModel();
    const recordPath = `${definition.path}.${index}`;
    const originalId = String(record?.id || '');
    return `
      <article class="family-v2-record" data-family-record-index="${index}" data-family-original-id="${escapeHtml(originalId)}">
        <header class="family-v2-record-head">
          <div>
            <span>${escapeHtml(definition.singular)} ${index + 1}</span>
            <strong>${escapeHtml(getRecordTitle(definition, record, index))}</strong>
          </div>
          <button class="module-editor-mini-btn module-editor-danger" type="button" ${buildActionAttribute(mode, 'remove-family-v2-record')} data-family-collection="${escapeHtml(definition.path)}" data-family-record-index="${index}">Löschen</button>
        </header>
        <div class="family-v2-grid">
          ${definition.fields.map(field => buildField(field, model.getPath(record, field.path, ''), { mode, recordPath })).join('')}
        </div>
      </article>`;
  }

  function buildCollection(definition, family, mode) {
    const model = getModel();
    const records = model.getPath(family, definition.path, []);
    return `
      <section class="family-v2-collection" data-family-v2-collection="${escapeHtml(definition.path)}">
        <header class="family-v2-collection-head">
          <div>
            <h4>${escapeHtml(definition.label)}</h4>
            ${definition.description ? `<p>${escapeHtml(definition.description)}</p>` : ''}
          </div>
          <button class="module-editor-mini-btn" type="button" ${buildActionAttribute(mode, 'add-family-v2-record')} data-family-collection="${escapeHtml(definition.path)}">+ ${escapeHtml(definition.singular)}</button>
        </header>
        <div class="family-v2-record-list" data-family-v2-list="${escapeHtml(definition.path)}">
          ${records.length
            ? records.map((record, index) => buildRecord(definition, record, index, mode)).join('')
            : '<div class="family-v2-empty">Noch keine Einträge vorhanden.</div>'}
        </div>
      </section>`;
  }

  function buildCollectionGroup(group, family, mode) {
    const model = getModel();
    const definitions = model.collections.filter(definition => definition.group === group.id);
    if (!definitions.length) return '';
    return `
      <details class="family-v2-panel family-v2-collection-group" data-family-workbench-group="${escapeHtml(group.id)}"${group.open ? ' open' : ''}>
        <summary>${escapeHtml(group.label)}</summary>
        <div class="family-v2-collections">
          ${definitions.map(definition => buildCollection(definition, family, mode)).join('')}
        </div>
      </details>`;
  }

  function buildFields(family, mode = 'module') {
    const model = getModel();
    if (!model?.isVersioned(family)) return '';
    const value = model.normalize(family);
    const migration = value.extensions?.['aleria.migration'];
    const migrationReportCount = Array.isArray(migration?.report) ? migration.report.length : 0;
    const migrationMarkup = migration?.explicit ? `
          <div class="family-v2-migration-note" role="status">
            <div>
              <strong>Explizit aus dem Legacy-Format migriert</strong>
              <span>Der Entwurf enthält den ursprünglichen Datensatz${migrationReportCount ? ` und ${migrationReportCount} Migrationshinweise` : ''}. Gespeichert wird erst über den normalen Modul-Workflow.</span>
            </div>
            ${migration.legacySnapshot ? `<button class="module-editor-mini-btn" type="button" ${buildActionAttribute(mode, 'restore-family-legacy')}>Legacy-Entwurf wiederherstellen</button>` : ''}
          </div>` : '';
    const workbenchUi = global.AleriaFamily?.workbench?.ui;
    if (workbenchUi?.buildShell) {
      return workbenchUi.buildShell({
        mode,
        family: value,
        migrationMarkup
      });
    }
    const panelsMarkup = `
      ${model.fieldGroups.map((group, index) => buildFieldGroup(group, value, mode, index)).join('')}
      ${COLLECTION_GROUPS.map(group => buildCollectionGroup(group, value, mode)).join('')}`;
    return `
      <div class="family-v2-editor" data-family-editor-version="2">
        <textarea class="family-v2-source-data" hidden aria-hidden="true">${escapeHtml(JSON.stringify(value))}</textarea>
        ${migrationMarkup}
        ${panelsMarkup}
      </div>`;
  }

  function getRecordRows(list) {
    return Array.from(list?.children || []).filter(child => child.matches?.('.family-v2-record'));
  }

  function collect(block, originalFamily) {
    const model = getModel();
    const editor = block?.querySelector?.('.family-v2-editor') || (block?.matches?.('.family-v2-editor') ? block : null);
    let sourceFamily = originalFamily;
    if (!model?.isVersioned(sourceFamily)) {
      try {
        sourceFamily = JSON.parse(editor?.querySelector?.('.family-v2-source-data')?.value || 'null');
      } catch (error) {
        sourceFamily = null;
      }
    }
    if (!editor || !model?.isVersioned(sourceFamily)) return originalFamily;
    if (editor.matches?.('.family-workbench')) {
      return typeof global.sanitizeFamilyData === 'function' ? global.sanitizeFamilyData(sourceFamily) : model.normalize(sourceFamily);
    }
    const next = model.normalize(sourceFamily);
    editor.querySelectorAll('.me-family-v2-top-field').forEach(input => {
      model.setPath(next, input.dataset.familyPath, model.readFieldValue(input));
    });
    model.collections.forEach(definition => {
      const list = editor.querySelector(`[data-family-v2-list="${definition.path}"]`);
      const originalRecords = model.getPath(sourceFamily, definition.path, []);
      const records = getRecordRows(list).map((row, index) => {
        const originalId = row.dataset.familyOriginalId || '';
        const originalRecord = originalId
          ? originalRecords.find(record => String(record?.id || '') === originalId)
          : originalRecords[index];
        const record = model.clone(originalRecord || model.createRecord(definition.path, index));
        row.querySelectorAll('.me-family-v2-record-field').forEach(input => {
          model.setPath(record, input.dataset.familyRecordField, model.readFieldValue(input));
        });
        return record;
      });
      model.setPath(next, definition.path, records);
    });
    return typeof global.sanitizeFamilyData === 'function' ? global.sanitizeFamilyData(next) : next;
  }

  function updateRecordIndexes(list, definition) {
    getRecordRows(list).forEach((row, index) => {
      row.dataset.familyRecordIndex = String(index);
      const ordinal = row.querySelector('.family-v2-record-head span');
      if (ordinal) ordinal.textContent = `${definition.singular} ${index + 1}`;
      const button = row.querySelector('[data-family-record-index]');
      if (button) button.dataset.familyRecordIndex = String(index);
      row.querySelectorAll('[data-family-record-field]').forEach(input => {
        input.dataset.familyPath = `${definition.path}.${index}.${input.dataset.familyRecordField}`;
      });
    });
  }

  function handleModuleAction(action, trigger) {
    if (action !== 'add-family-v2-record' && action !== 'remove-family-v2-record') return false;
    const model = getModel();
    const collectionPath = trigger?.dataset?.familyCollection || '';
    const definition = model?.getCollection(collectionPath);
    const editor = trigger?.closest?.('.family-v2-editor');
    const list = editor?.querySelector?.(`[data-family-v2-list="${collectionPath}"]`);
    if (!definition || !list) return true;
    if (action === 'add-family-v2-record') {
      list.querySelector('.family-v2-empty')?.remove();
      const rows = getRecordRows(list);
      const usedIds = rows.map(row => row.querySelector('[data-family-record-field="id"]')?.value || '').filter(Boolean);
      const record = model.createRecord(collectionPath, rows.length, usedIds);
      list.insertAdjacentHTML('beforeend', buildRecord(definition, record, rows.length, 'module'));
    } else {
      trigger.closest('.family-v2-record')?.remove();
      if (!getRecordRows(list).length) list.innerHTML = '<div class="family-v2-empty">Noch keine Einträge vorhanden.</div>';
    }
    updateRecordIndexes(list, definition);
    if (typeof global.syncModuleJsonPreview === 'function') global.syncModuleJsonPreview();
    return true;
  }

  const currentApi = global.AleriaFamily && typeof global.AleriaFamily === 'object' ? global.AleriaFamily : {};
  const currentEditor = currentApi.editor && typeof currentApi.editor === 'object' ? currentApi.editor : {};
  global.AleriaFamily = Object.freeze({
    apiVersion: currentApi.apiVersion || 1,
    schema: currentApi.schema || 'aleria.family',
    schemaVersion: currentApi.schemaVersion || 2,
    ...currentApi,
    editor: Object.freeze({
      ...currentEditor,
      ui: Object.freeze({ buildFields, buildRecord, collect, handleModuleAction })
    })
  });
})(globalThis);
