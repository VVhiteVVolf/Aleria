// Direct genealogy editor UI. It deliberately does not reuse the legacy record panels.

(function installFamilyWorkbenchUi(global) {
  'use strict';

  const LABELS = Object.freeze({
    unknown: 'Unbekannt', known: 'Bekannt', missing: 'Verschollen', secret: 'Geheim',
    female: 'Weiblich', male: 'Männlich', intersex: 'Intersexuell', alive: 'Lebend', dead: 'Verstorben', undead: 'Untot',
    marriage: 'Ehe', engagement: 'Verlobung', union: 'Verbindung', affair: 'Affäre', concubinage: 'Konkubinat',
    political: 'Politische Verbindung', magical: 'Magische Bindung', custom: 'Benutzerdefiniert', active: 'Aktiv', ended: 'Beendet',
    confirmed: 'Bestätigt', probable: 'Wahrscheinlich', rumored: 'Gerücht', disputed: 'Umstritten', denied: 'Verneint',
    public: 'Öffentlich', private: 'Privat', biological: 'Biologisch', adoptive: 'Adoption', foster: 'Pflege',
    guardian: 'Vormundschaft', step: 'Stiefelternschaft', claimed: 'Beansprucht', legitimate: 'Legitim',
    illegitimate: 'Unehelich', legitimized: 'Legitimiert', vertical: 'Vertikal', horizontal: 'Horizontal',
    partner: 'Partnerschaft', child: 'Kind', parent: 'Eltern', association: 'Weitere Bindung'
  });
  const MANAGERS = Object.freeze({
    document: { title: 'Familienakte', description: 'Titel, Beschreibung, Aktenangaben und Quellen', groups: ['document'], collections: ['document.facts', 'genealogy.sources'] },
    view: { title: 'Darstellung & Ansicht', description: 'Aussehen, Fokus und sichtbare Beziehungsarten', groups: ['presentation', 'view'], collections: [] },
    fantasy: { title: 'Adel, Häuser & Fantasy', description: 'Häuser, Linien, Titel, Ansprüche, Erbfolge und Blutlinien', groups: [], collections: [] }
  });

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

  function getState() {
    return global.AleriaFamily?.workbench?.state || null;
  }

  function label(value) {
    return LABELS[value] || value || '—';
  }

  function displayValue(value, type) {
    if (type === 'array') return Array.isArray(value) ? value.join(', ') : '';
    if (type === 'participantRoles') {
      return Array.isArray(value) ? value.map(item => `${item?.personId || ''}:${item?.role || 'related'}`).join(', ') : '';
    }
    return value == null ? '' : value;
  }

  function buildOptions(options, value, placeholder = '') {
    const first = placeholder ? `<option value="">${escapeHtml(placeholder)}</option>` : '';
    return first + options.map(option => {
      const optionValue = typeof option === 'object' ? option.value : option;
      const optionLabel = typeof option === 'object' ? option.label : label(option);
      return `<option value="${escapeHtml(optionValue)}"${String(value ?? '') === String(optionValue) ? ' selected' : ''}>${escapeHtml(optionLabel)}</option>`;
    }).join('');
  }

  function buildControl(config = {}) {
    const type = config.type || 'text';
    const value = displayValue(config.value, type);
    const data = Object.entries(config.data || {}).map(([key, item]) => `data-${key}="${escapeHtml(item)}"`).join(' ');
    const classes = `family-direct-input${config.wide ? ' wide' : ''}`;
    let control = '';
    if (type === 'select') {
      control = `<select class="${classes}" ${data}>${buildOptions(config.options || [], value, config.placeholder)}</select>`;
    } else if (type === 'multiselect') {
      const selected = new Set(Array.isArray(config.value) ? config.value.map(String) : []);
      const options = (config.options || []).map(option => {
        const optionValue = typeof option === 'object' ? option.value : option;
        const optionLabel = typeof option === 'object' ? option.label : label(option);
        return `<option value="${escapeHtml(optionValue)}"${selected.has(String(optionValue)) ? ' selected' : ''}>${escapeHtml(optionLabel)}</option>`;
      }).join('');
      control = `<select class="${classes} family-direct-multiselect" ${data} multiple>${options}</select>`;
    } else if (type === 'boolean') {
      control = `<label class="family-direct-toggle"><input type="checkbox" ${data}${config.value === true ? ' checked' : ''}><span>${escapeHtml(config.toggleLabel || 'Aktiv')}</span></label>`;
    } else if (type === 'textarea') {
      control = `<textarea class="${classes}" ${data} rows="4" placeholder="${escapeHtml(config.placeholder || '')}">${escapeHtml(value)}</textarea>`;
    } else {
      control = `<input class="${classes}" ${data} type="${escapeHtml(type === 'array' ? 'text' : type)}" value="${escapeHtml(value)}" placeholder="${escapeHtml(config.placeholder || '')}">`;
    }
    return `<label class="family-direct-field${config.wide ? ' wide' : ''}"><span>${escapeHtml(config.label || '')}</span>${control}</label>`;
  }

  function personOptions(family, selectedId = '', excludedIds = []) {
    const excluded = new Set(excludedIds);
    return getState().getRecords(family, 'genealogy.persons')
      .filter(person => !excluded.has(person.id))
      .map(person => ({ value: person.id, label: person.identity?.displayName || person.id, selected: person.id === selectedId }));
  }

  function buildShell(config = {}) {
    const family = config.family || {};
    const persons = getState().getRecords(family, 'genealogy.persons');
    const selectedId = family.view?.initialFocusPersonId && getState().findPerson(family, family.view.initialFocusPersonId)
      ? family.view.initialFocusPersonId
      : persons[0]?.id || '';
    return `
      <div class="family-v2-editor family-workbench family-direct-workbench" data-family-editor-version="2" data-family-workbench-mode="${config.mode === 'inline' ? 'inline' : 'module'}" data-family-workbench-selected-person="${escapeHtml(selectedId)}">
        <textarea class="family-v2-source-data" hidden aria-hidden="true">${escapeHtml(JSON.stringify(family))}</textarea>
        ${config.migrationMarkup || ''}
        <header class="family-direct-header">
          <div>
            <span>Direkter Stammbaum-Editor</span>
            <h3 data-family-workbench-title>${escapeHtml(family.document?.title || 'Familienakte')}</h3>
            <p>Wähle eine Karte und füge Partner, Kinder oder Eltern direkt an dieser Person an.</p>
          </div>
          <div class="family-direct-counts"><strong data-family-workbench-person-count>${persons.length}</strong> Personen <strong data-family-workbench-relation-count>0</strong> Beziehungen</div>
        </header>
        <div class="family-direct-toolbar">
          <div class="family-direct-toolbar-primary">
            <button type="button" class="family-direct-primary" data-family-workbench-action="add-person">+ Neue Person</button>
            <button type="button" data-family-workbench-action="start-relative" data-family-relation-type="partner">+ Partner/in</button>
            <button type="button" data-family-workbench-action="start-relative" data-family-relation-type="child">+ Kind</button>
            <button type="button" data-family-workbench-action="start-relative" data-family-relation-type="parent">+ Elternteil</button>
            <button type="button" data-family-workbench-action="start-relative" data-family-relation-type="association">+ Weitere Bindung</button>
          </div>
          <div class="family-direct-toolbar-secondary">
            <button type="button" data-family-workbench-action="open-manager" data-family-manager="document">Familienakte</button>
            <button type="button" data-family-workbench-action="open-manager" data-family-manager="fantasy">Adel & Fantasy</button>
            <button type="button" data-family-workbench-action="open-manager" data-family-manager="view">Darstellung</button>
            <label><span>Ausrichtung</span><select data-family-workbench-orientation>${buildOptions(['vertical', 'horizontal'], family.view?.orientation || 'vertical')}</select></label>
            <button type="button" data-family-workbench-action="fit-chart">Einpassen</button>
          </div>
        </div>
        <div class="family-direct-layout">
          <section class="family-direct-canvas" aria-label="Bearbeitbarer Stammbaum">
            <div class="family-direct-canvas-head">
              <div class="family-chart-search family-workbench-search" data-family-workbench-search></div>
              <div data-family-workbench-status role="status">Stammbaum wird aufgebaut …</div>
            </div>
            <div class="family-workbench-chart family-chart-host" data-family-workbench-chart></div>
          </section>
          <aside class="family-direct-inspector" data-family-workbench-inspector aria-live="polite"></aside>
        </div>
      </div>`;
  }

  function buildPersonInspector(family, personId) {
    const person = getState().findPerson(family, personId);
    if (!person) {
      return `
        <div class="family-direct-empty">
          <span>Noch keine Person ausgewählt</span>
          <h3>Beginne den Stammbaum</h3>
          <p>Lege eine Person an. Danach kannst du Partner, Kinder und Eltern direkt an ihrer Karte ergänzen.</p>
          <button type="button" class="family-direct-primary" data-family-workbench-action="add-person">+ Erste Person anlegen</button>
        </div>`;
    }
    const connections = getState().getConnections(family, personId);
    const portrait = person.profile?.portrait?.src || '';
    return `
      <div class="family-person-editor" data-family-person-id="${escapeHtml(personId)}">
        <header class="family-person-editor-head">
          <div class="family-person-editor-portrait" data-family-person-editor-portrait>${portrait ? `<img src="${escapeHtml(portrait)}" alt="${escapeHtml(person.profile?.portrait?.alt || '')}">` : '<span>Kein Portrait</span>'}</div>
          <div>
            <span>Ausgewählte Person</span>
            <h3 data-family-person-editor-title>${escapeHtml(person.identity?.displayName || person.id)}</h3>
            <p data-family-person-editor-tagline>${escapeHtml(person.profile?.tagline || 'Ohne Titel oder Rang')}</p>
          </div>
          <button type="button" class="family-direct-danger-icon" data-family-workbench-action="delete-person" title="Person löschen">×</button>
        </header>
        <section class="family-direct-section">
          <h4>Person</h4>
          <div class="family-direct-grid">
            ${buildControl({ label: 'Anzeigename', value: person.identity?.displayName, data: { 'family-person-field': 'identity.displayName' } })}
            ${buildControl({ label: 'Titel / Rang', value: person.profile?.tagline, data: { 'family-person-field': 'profile.tagline' } })}
            ${buildControl({ label: 'Portrait-URL', type: 'url', value: portrait, wide: true, data: { 'family-person-field': 'profile.portrait.src' } })}
            ${buildControl({ label: 'Geschlecht', type: 'select', value: person.sex, options: ['unknown', 'female', 'male', 'intersex'], data: { 'family-person-field': 'sex' } })}
            ${buildControl({ label: 'Identität', type: 'select', value: person.identity?.status, options: ['known', 'unknown', 'missing', 'secret'], data: { 'family-person-field': 'identity.status' } })}
            ${buildControl({ label: 'Lebensstatus', type: 'select', value: person.life?.status, options: ['unknown', 'alive', 'dead', 'missing', 'undead'], data: { 'family-person-field': 'life.status' } })}
            ${buildControl({ label: 'Geburt', value: person.life?.birth, data: { 'family-person-field': 'life.birth' } })}
            ${buildControl({ label: 'Tod', value: person.life?.death, data: { 'family-person-field': 'life.death' } })}
          </div>
          <details class="family-direct-more">
            <summary>Weitere Personendaten</summary>
            <div class="family-direct-grid">
              ${buildControl({ label: 'Vornamen', type: 'array', value: person.identity?.givenNames, data: { 'family-person-field': 'identity.givenNames', 'family-value-type': 'array' } })}
              ${buildControl({ label: 'Familienname', value: person.identity?.familyName, data: { 'family-person-field': 'identity.familyName' } })}
              ${buildControl({ label: 'Aliasse', type: 'array', value: person.identity?.aliases, data: { 'family-person-field': 'identity.aliases', 'family-value-type': 'array' } })}
              ${buildControl({ label: 'Merkmale', type: 'array', value: person.tags, data: { 'family-person-field': 'tags', 'family-value-type': 'array' } })}
            ${buildControl({ label: 'Portrait-Alternativtext', value: person.profile?.portrait?.alt, wide: true, data: { 'family-person-field': 'profile.portrait.alt' } })}
              ${buildControl({ label: 'Datensatztyp', type: 'select', value: person.recordType || 'person', options: ['person', 'placeholder'], data: { 'family-person-field': 'recordType' } })}
              ${buildControl({ label: 'Kurzbeschreibung', type: 'textarea', value: person.profile?.summary, wide: true, data: { 'family-person-field': 'profile.summary' } })}
            </div>
          </details>
        </section>
        <section class="family-direct-section family-person-relations">
          <div class="family-direct-section-head"><div><h4>Beziehungen</h4><p>Keine IDs nötig – Personen werden direkt gewählt.</p></div></div>
          <div class="family-direct-relation-list">
            ${connections.length ? connections.map(connection => buildConnectionCard(family, connection)).join('') : '<div class="family-direct-list-empty">Noch keine Beziehungen.</div>'}
          </div>
          <div class="family-direct-relation-actions">
            <button type="button" data-family-workbench-action="start-relative" data-family-relation-type="partner">+ Partner/in</button>
            <button type="button" data-family-workbench-action="start-relative" data-family-relation-type="child">+ Kind</button>
            <button type="button" data-family-workbench-action="start-relative" data-family-relation-type="parent">+ Elternteil</button>
          </div>
        </section>
        <section class="family-direct-section">
          <h4>Weitere Bereiche</h4>
          <div class="family-direct-relation-actions">
            <button type="button" data-family-workbench-action="open-manager" data-family-manager="fantasy">Adel, Häuser, Titel & Erbfolge</button>
            <button type="button" data-family-workbench-action="open-manager" data-family-manager="document">Familienakte & Quellen</button>
            <button type="button" data-family-workbench-action="open-manager" data-family-manager="view">Darstellung & Sichtbarkeit</button>
          </div>
        </section>
      </div>`;
  }

  function buildConnectionCard(family, connection) {
    return `
      <article class="family-direct-relation-card" data-family-relation-id="${escapeHtml(connection.relationId)}">
        <button type="button" class="family-direct-relation-main" data-family-workbench-action="edit-relation" data-family-collection="${escapeHtml(connection.collectionPath)}" data-family-relation-id="${escapeHtml(connection.relationId)}">
          <span>${escapeHtml(label(connection.type))}</span>
          <strong>${escapeHtml(connection.title)}</strong>
          <small>${escapeHtml(connection.subtitle)}</small>
        </button>
        ${connection.relatedPersonIds.map(personId => `<button type="button" class="family-direct-focus-person" data-family-workbench-action="select-person" data-family-person-id="${escapeHtml(personId)}" title="Person im Stammbaum auswählen">↗</button>`).join('')}
        <button type="button" class="family-direct-remove-relation" data-family-workbench-action="delete-relation" data-family-collection="${escapeHtml(connection.collectionPath)}" data-family-relation-id="${escapeHtml(connection.relationId)}" title="Beziehung entfernen">×</button>
      </article>`;
  }

  function buildRelativeEditor(family, anchorId, relationType) {
    const anchor = getState().findPerson(family, anchorId);
    if (!anchor) return buildPersonInspector(family, '');
    const typeTitle = { partner: 'Partner/in hinzufügen', child: 'Kind hinzufügen', parent: 'Elternteil hinzufügen', association: 'Weitere Bindung hinzufügen' }[relationType] || 'Beziehung hinzufügen';
    const targetOptions = [{ value: '__new__', label: 'Neue Person anlegen' }, ...personOptions(family, '', [anchorId])];
    const partnerships = getState().getRecords(family, 'genealogy.partnerships')
      .filter(item => (item.participantIds || []).includes(anchorId))
      .map(item => ({ value: item.id, label: item.label || `${label(item.kind)} · ${(item.participantIds || []).filter(id => id !== anchorId).map(id => getState().personName(family, id)).join(', ')}` }));
    return `
      <form class="family-relative-editor" data-family-relative-editor data-family-relation-type="${escapeHtml(relationType)}" data-family-relative-target-mode="new">
        <header class="family-direct-subview-head">
          <button type="button" data-family-workbench-action="show-person">← Zurück</button>
          <div><span>Beziehung zu ${escapeHtml(anchor.identity?.displayName || anchor.id)}</span><h3>${escapeHtml(typeTitle)}</h3></div>
        </header>
        <section class="family-direct-section">
          ${buildControl({ label: 'Person', type: 'select', value: '__new__', options: targetOptions, data: { 'family-relative-target': 'true' } })}
          <div class="family-relative-new-person" data-family-relative-new-person>
            <div class="family-direct-grid">
              ${buildControl({ label: 'Name', value: '', data: { 'family-relative-person-field': 'identity.displayName' }, placeholder: 'Neue Person' })}
              ${buildControl({ label: 'Titel / Rang', value: '', data: { 'family-relative-person-field': 'profile.tagline' } })}
              ${buildControl({ label: 'Geschlecht', type: 'select', value: 'unknown', options: ['unknown', 'female', 'male', 'intersex'], data: { 'family-relative-person-field': 'sex' } })}
              ${buildControl({ label: 'Identität', type: 'select', value: 'known', options: ['known', 'unknown', 'missing', 'secret'], data: { 'family-relative-person-field': 'identity.status' } })}
              ${buildControl({ label: 'Portrait-URL', type: 'url', value: '', wide: true, data: { 'family-relative-person-field': 'profile.portrait.src' } })}
              ${buildControl({ label: 'Geburt', value: '', data: { 'family-relative-person-field': 'life.birth' } })}
              ${buildControl({ label: 'Tod', value: '', data: { 'family-relative-person-field': 'life.death' } })}
            </div>
          </div>
        </section>
        <section class="family-direct-section">
          <h4>Beziehungsdaten</h4>
          <div class="family-direct-grid">
            ${relationType === 'partner' ? `
              ${buildControl({ label: 'Art', type: 'select', value: 'marriage', options: ['marriage', 'engagement', 'union', 'affair', 'concubinage', 'political', 'magical', 'custom'], data: { 'family-relative-field': 'kind' } })}
              ${buildControl({ label: 'Status', type: 'select', value: 'active', options: ['active', 'ended', 'unknown'], data: { 'family-relative-field': 'status' } })}
              ${buildControl({ label: 'Beginn', value: '', data: { 'family-relative-field': 'start' } })}
              ${buildControl({ label: 'Ende', value: '', data: { 'family-relative-field': 'end' } })}
              ${buildControl({ label: 'Eigene Beschriftung', value: '', wide: true, data: { 'family-relative-field': 'label' } })}` : ''}
            ${relationType === 'child' || relationType === 'parent' ? `
              ${buildControl({ label: 'Abstammungsart', type: 'select', value: 'biological', options: ['biological', 'adoptive', 'foster', 'guardian', 'step', 'magical', 'claimed'], data: { 'family-relative-field': 'kind' } })}
              ${buildControl({ label: 'Legitimität', type: 'select', value: 'unknown', options: ['unknown', 'legitimate', 'illegitimate', 'legitimized', 'disputed'], data: { 'family-relative-field': 'legitimacy.status' } })}
              ${buildControl({ label: 'Zweiter Elternteil', type: 'select', value: '', options: personOptions(family, '', [anchorId]), placeholder: 'Keiner / unbekannt', data: { 'family-relative-co-parent': 'true' } })}
              ${buildControl({ label: 'Zugehörige Partnerschaft', type: 'select', value: '', options: partnerships, placeholder: 'Keine', data: { 'family-relative-partnership': 'true' } })}` : ''}
            ${relationType === 'association' ? `
              ${buildControl({ label: 'Art', value: 'guardianship', data: { 'family-relative-field': 'kind' } })}
              ${buildControl({ label: 'Beschriftung', value: '', data: { 'family-relative-field': 'label' } })}
              ${buildControl({ label: 'Rolle von ${anchor.identity?.displayName || anchor.id}', value: 'related', data: { 'family-relative-anchor-role': 'true' } })}
              ${buildControl({ label: 'Rolle der anderen Person', value: 'related', data: { 'family-relative-person-role': 'true' } })}` : ''}
            ${buildControl({ label: 'Gewissheit', type: 'select', value: 'confirmed', options: ['confirmed', 'probable', 'rumored', 'disputed', 'unknown', 'denied'], data: { 'family-relative-field': 'assertion.certainty' } })}
            ${buildControl({ label: 'Sichtbarkeit', type: 'select', value: 'public', options: ['public', 'private', 'secret'], data: { 'family-relative-field': 'assertion.visibility' } })}
            ${buildControl({ label: 'Quellen', type: 'multiselect', value: [], options: getState().getRecords(family, 'genealogy.sources').map(source => ({ value: source.id, label: source.title || source.id })), wide: true, data: { 'family-relative-field': 'assertion.sourceIds', 'family-value-type': 'array' } })}
          </div>
        </section>
        <footer class="family-direct-form-actions">
          <button type="button" data-family-workbench-action="show-person">Abbrechen</button>
          <button type="submit" class="family-direct-primary">${escapeHtml(typeTitle)}</button>
        </footer>
      </form>`;
  }

  function findRelation(family, collectionPath, relationId) {
    return getState().getRecords(family, collectionPath).find(record => record?.id === relationId) || null;
  }

  function relationField(config) {
    return buildControl({ ...config, data: { ...(config.data || {}), 'family-relation-field': config.path } });
  }

  function buildRelationEditor(family, collectionPath, relationId) {
    const relation = findRelation(family, collectionPath, relationId);
    if (!relation) return buildPersonInspector(family, family.view?.initialFocusPersonId || '');
    let fields = '';
    if (collectionPath === 'genealogy.partnerships') {
      const participantIds = Array.isArray(relation.participantIds) ? relation.participantIds : [];
      const participantFields = [...participantIds, ''].map((personId, index) => relationField({
        label: `Person ${index + 1}`,
        path: `participantIds.${index}`,
        type: 'select',
        value: personId,
        options: personOptions(family),
        placeholder: index < 2 ? 'Person auswÃ¤hlen' : 'Weitere Person (optional)'
      })).join('');
      fields = `
        ${participantFields}
        ${relationField({ label: 'Art', path: 'kind', type: 'select', value: relation.kind, options: ['marriage', 'engagement', 'union', 'affair', 'concubinage', 'political', 'magical', 'custom'] })}
        ${relationField({ label: 'Status', path: 'status', type: 'select', value: relation.status, options: ['active', 'ended', 'unknown'] })}
        ${relationField({ label: 'Beschriftung', path: 'label', value: relation.label })}
        ${relationField({ label: 'Beginn', path: 'start', value: relation.start })}
        ${relationField({ label: 'Ende', path: 'end', value: relation.end })}
        ${relationField({ label: 'Endgrund', path: 'endReason', type: 'select', value: relation.endReason, options: ['', 'divorce', 'annulment', 'separation', 'broken-engagement', 'death', 'unknown'] })}`;
    } else if (collectionPath === 'genealogy.parentages') {
      fields = `
        ${relationField({ label: 'Kind', path: 'childId', type: 'select', value: relation.childId, options: personOptions(family) })}
        ${relationField({ label: 'Elternteil 1', path: 'parentIds.0', type: 'select', value: relation.parentIds?.[0], options: personOptions(family), placeholder: 'Unbekannt' })}
        ${relationField({ label: 'Elternteil 2', path: 'parentIds.1', type: 'select', value: relation.parentIds?.[1], options: personOptions(family), placeholder: 'Unbekannt' })}
        ${relationField({ label: 'Art', path: 'kind', type: 'select', value: relation.kind, options: ['biological', 'adoptive', 'foster', 'guardian', 'step', 'magical', 'claimed'] })}
        ${relationField({ label: 'Legitimität', path: 'legitimacy.status', type: 'select', value: relation.legitimacy?.status, options: ['unknown', 'legitimate', 'illegitimate', 'legitimized', 'disputed'] })}
        ${relationField({ label: 'Partnerschaft', path: 'partnershipId', type: 'select', value: relation.partnershipId, options: getState().getRecords(family, 'genealogy.partnerships').map(item => ({ value: item.id, label: item.label || label(item.kind) })), placeholder: 'Keine' })}`;
    } else {
      const participants = Array.isArray(relation.participants) ? relation.participants : [];
      const participantFields = [...participants, { personId: '', role: '' }].map((participant, index) => `
        ${relationField({ label: `Person ${index + 1}`, path: `participants.${index}.personId`, type: 'select', value: participant?.personId, options: personOptions(family), placeholder: index < 2 ? 'Person auswählen' : 'Weitere Person (optional)' })}
        ${relationField({ label: `Rolle ${index + 1}`, path: `participants.${index}.role`, value: participant?.role })}`).join('');
      fields = `
        ${participantFields}
        ${relationField({ label: 'Art', path: 'kind', value: relation.kind })}
        ${relationField({ label: 'Beschriftung', path: 'label', value: relation.label })}`;
    }
    return `
      <div class="family-relation-editor" data-family-relation-editor data-family-collection="${escapeHtml(collectionPath)}" data-family-relation-id="${escapeHtml(relationId)}">
        <header class="family-direct-subview-head"><button type="button" data-family-workbench-action="show-person">← Zurück</button><div><span>Beziehung</span><h3>${escapeHtml(relation.label || label(relation.kind) || 'Beziehung')}</h3></div></header>
        <section class="family-direct-section"><div class="family-direct-grid">${fields}
          ${relationField({ label: 'Gewissheit', path: 'assertion.certainty', type: 'select', value: relation.assertion?.certainty, options: ['confirmed', 'probable', 'rumored', 'disputed', 'unknown', 'denied'] })}
          ${relationField({ label: 'Sichtbarkeit', path: 'assertion.visibility', type: 'select', value: relation.assertion?.visibility, options: ['public', 'private', 'secret'] })}
          ${relationField({ label: 'Quellen', path: 'assertion.sourceIds', type: 'multiselect', value: relation.assertion?.sourceIds, options: getState().getRecords(family, 'genealogy.sources').map(source => ({ value: source.id, label: source.title || source.id })), wide: true, data: { 'family-value-type': 'array' } })}
        </div></section>
        <footer class="family-direct-form-actions"><button type="button" class="family-direct-danger" data-family-workbench-action="delete-relation" data-family-collection="${escapeHtml(collectionPath)}" data-family-relation-id="${escapeHtml(relationId)}">Beziehung entfernen</button><button type="button" class="family-direct-primary" data-family-workbench-action="show-person">Fertig</button></footer>
      </div>`;
  }

  function getReferenceOptions(family, fieldPath) {
    if (fieldPath === 'personId') return personOptions(family);
    const references = {
      houseId: ['genealogy.fantasy.houses', 'name'],
      lineageId: ['genealogy.fantasy.lineages', 'name'],
      parentLineageId: ['genealogy.fantasy.lineages', 'name'],
      titleId: ['genealogy.fantasy.titles', 'name'],
      ruleId: ['genealogy.fantasy.successionRules', 'name'],
      bloodlineId: ['genealogy.fantasy.bloodlines', 'name']
    };
    const reference = references[fieldPath];
    if (!reference) return null;
    return getState().getRecords(family, reference[0]).map(record => ({ value: record.id, label: record[reference[1]] || record.id }));
  }

  function buildManagerField(family, definition, record, field) {
    if (field.path === 'id') return '';
    const options = getReferenceOptions(family, field.path) || field.options;
    return buildControl({
      label: field.label,
      type: options ? 'select' : field.type,
      options: options || [],
      placeholder: options ? 'Nicht zugeordnet' : field.placeholder,
      value: getModel().getPath(record, field.path, ''),
      wide: field.wide,
      data: {
        'family-collection-field': field.path,
        'family-collection': definition.path,
        'family-record-id': record.id || '',
        'family-value-type': field.type || 'text'
      }
    });
  }

  function buildCollectionManager(family, definition) {
    const records = getState().getRecords(family, definition.path);
    return `
      <details class="family-manager-collection" open>
        <summary><span>${escapeHtml(definition.label)}</span><strong>${records.length}</strong></summary>
        <div class="family-manager-collection-body">
          ${definition.description ? `<p>${escapeHtml(definition.description)}</p>` : ''}
          <div class="family-manager-records">
            ${records.map((record, index) => {
              const recordKey = record.id || `@${index}`;
              return `
                <article class="family-manager-record">
                  <header><code>${escapeHtml(record.id || `${definition.singular} ${index + 1}`)}</code><button type="button" data-family-workbench-action="remove-manager-record" data-family-collection="${escapeHtml(definition.path)}" data-family-record-id="${escapeHtml(recordKey)}">Löschen</button></header>
                  <div class="family-direct-grid">${definition.fields.map(field => buildManagerField(family, definition, { ...record, id: recordKey }, field)).join('')}</div>
                </article>`;
            }).join('') || '<div class="family-direct-list-empty">Noch keine Einträge.</div>'}
          </div>
          <button type="button" class="family-direct-add-record" data-family-workbench-action="add-manager-record" data-family-collection="${escapeHtml(definition.path)}">+ ${escapeHtml(definition.singular)}</button>
        </div>
      </details>`;
  }

  function buildManager(family, managerId) {
    const manager = MANAGERS[managerId] || MANAGERS.document;
    const model = getModel();
    const definitions = managerId === 'fantasy'
      ? model.collections.filter(definition => definition.group === 'fantasy')
      : manager.collections.map(path => model.getCollection(path)).filter(Boolean);
    const topFields = model.fieldGroups
      .filter(group => manager.groups.includes(group.id))
      .map(group => `
        <section class="family-direct-section"><h4>${escapeHtml(group.label)}</h4><div class="family-direct-grid">
          ${group.fields.map(field => {
            const personReference = field.path === 'view.initialFocusPersonId';
            const visibleOptions = field.path === 'view.visibleParentageKinds'
              ? ['biological', 'adoptive', 'foster', 'guardian', 'step', 'magical', 'claimed']
              : field.path === 'view.visiblePartnershipKinds'
                ? ['marriage', 'engagement', 'union', 'affair', 'concubinage', 'political', 'magical', 'custom']
                : null;
            const type = personReference ? 'select' : visibleOptions ? 'multiselect' : field.type;
            return buildControl({
              label: personReference ? 'Startperson' : field.label,
              type,
              options: personReference ? personOptions(family) : visibleOptions || field.options,
              value: model.getPath(family, field.path, ''),
              wide: field.wide || Boolean(visibleOptions),
              data: { 'family-top-field': field.path, 'family-value-type': visibleOptions ? 'array' : field.type || 'text' }
            });
          }).join('')}
        </div></section>`).join('');
    return `
      <div class="family-manager" data-family-manager-view="${escapeHtml(managerId)}">
        <header class="family-direct-subview-head"><button type="button" data-family-workbench-action="show-person">← Zurück</button><div><span>${escapeHtml(manager.description)}</span><h3>${escapeHtml(manager.title)}</h3></div></header>
        ${topFields}
        <div class="family-manager-collections">${definitions.map(definition => buildCollectionManager(family, definition)).join('')}</div>
      </div>`;
  }

  function isRecord(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  }

  const currentApi = isRecord(global.AleriaFamily) ? global.AleriaFamily : {};
  const currentWorkbench = isRecord(currentApi.workbench) ? currentApi.workbench : {};
  global.AleriaFamily = Object.freeze({
    apiVersion: currentApi.apiVersion || 1,
    schema: currentApi.schema || 'aleria.family',
    schemaVersion: currentApi.schemaVersion || 2,
    ...currentApi,
    workbench: Object.freeze({
      ...currentWorkbench,
      ui: Object.freeze({ buildShell, buildPersonInspector, buildRelativeEditor, buildRelationEditor, buildManager })
    })
  });
})(globalThis);
