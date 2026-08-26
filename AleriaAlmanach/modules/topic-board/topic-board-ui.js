const TOPIC_BOARD_ACTION_ICON_ASSET = './public/assets/topic-board/themenvorschlag-icon.png';

let _topicBoardEditingProposalId = '';
let _topicBoardSelectedParticipantIds = new Set();
let _topicBoardSelectedThemeIcon = '';
let _topicBoardSelectedVehicleIcon = '';
let _topicBoardIconTarget = '';
let _topicBoardSubmitting = false;

function topicBoardEscape(value) {
  return typeof escapeHtml === 'function'
    ? escapeHtml(value)
    : String(value ?? '').replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
}

function topicBoardImage(value) {
  return typeof sanitizeImageSrc === 'function'
    ? sanitizeImageSrc(value)
    : topicBoardEscape(value);
}

function topicBoardInitial(value) {
  return typeof getInitialChar === 'function'
    ? getInitialChar(value)
    : (String(value || '').trim()[0] || '?').toUpperCase();
}

function getTopicBoardCharacters() {
  const records = typeof getVisibleCharacterRecords === 'function'
    ? getVisibleCharacterRecords()
    : [];
  return (Array.isArray(records) ? records : [])
    .filter(character => String(character?.id || '').trim())
    .sort((left, right) => String(left?.name || '').localeCompare(String(right?.name || ''), 'de', { sensitivity: 'base' }));
}

function getTopicBoardCharacterPortrait(character) {
  return String(character?.portrait || character?.emotes?.find(emote => emote?.img)?.img || '').trim();
}

function ensureTopicBoardDialog() {
  let overlay = document.getElementById('topic-board-overlay');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'topic-board-overlay';
  overlay.className = 'topic-board-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('aria-labelledby', 'topic-board-title');
  overlay.innerHTML = `
    <div class="topic-board-dialog">
      <header class="topic-board-head">
        <div class="topic-board-heading-mark" aria-hidden="true"><span>✦</span></div>
        <div>
          <div class="topic-board-kicker">Offene Fäden & nächste Szenen</div>
          <h2 id="topic-board-title">Die Themenwand</h2>
          <p>Vorschläge sammeln, gemeinsam gewichten und nach dem Anspielen ins Archiv legen.</p>
        </div>
        <button class="topic-board-close" type="button" data-topic-board-action="close-board" aria-label="Themenwand schließen">×</button>
      </header>
      <div class="topic-board-toolbar">
        <div class="topic-board-tabs" role="tablist" aria-label="Themenwand-Ansicht">
          <button type="button" role="tab" data-topic-board-action="set-view" data-topic-board-view="open">Offen <span data-topic-board-open-count>0</span></button>
          <button type="button" role="tab" data-topic-board-action="set-view" data-topic-board-view="archived">Archiv <span data-topic-board-archive-count>0</span></button>
        </div>
        <div class="topic-board-list-controls">
          <label class="topic-board-list-search"><span class="topic-board-visually-hidden">Themen durchsuchen</span><input type="search" data-topic-board-list-field="query" placeholder="Themen, Orte, Personen …" autocomplete="off"></label>
          <label><span class="topic-board-visually-hidden">Kategorie filtern</span><select data-topic-board-list-field="category"><option value="all">Alle Themenarten</option>${TOPIC_BOARD_CATEGORIES.map(category => `<option value="${category.id}">${topicBoardEscape(category.label)}</option>`).join('')}</select></label>
          <label><span class="topic-board-visually-hidden">Themen sortieren</span><select data-topic-board-list-field="sort"><option value="votes">Beliebteste zuerst</option><option value="due">Als Nächstes fällig</option><option value="newest">Neueste zuerst</option><option value="title">Nach Titel</option></select></label>
          <span class="topic-board-result-count" data-topic-board-result-count aria-live="polite"></span>
        </div>
        <div class="topic-board-sync" data-topic-board-sync></div>
        <button class="topic-board-new" type="button" data-topic-board-action="open-editor"><span aria-hidden="true">＋</span> Vorschlag anheften</button>
      </div>
      <div class="topic-board-workspace">
        <main class="topic-board-list" data-topic-board-list></main>
        <aside class="topic-board-editor" data-topic-board-editor hidden></aside>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  return overlay;
}

function updateTopicBoardSidebarSummary() {
  const state = getTopicBoardState();
  const openCount = state.proposals.filter(proposal => proposal.status === TOPIC_BOARD_STATUS_OPEN).length;
  document.querySelectorAll('[data-topic-board-sidebar-count]').forEach(element => {
    element.textContent = openCount === 1 ? '1 offener Faden' : `${openCount} offene Fäden`;
  });
}

function renderTopicBoardPortraits(participants, options = {}) {
  const compact = options.compact === true;
  if (!participants.length) return `<${compact ? 'span' : 'div'} class="topic-board-no-cast">Besetzung noch offen</${compact ? 'span' : 'div'}>`;
  const visible = compact ? participants.slice(0, 4) : participants;
  const remaining = Math.max(0, participants.length - visible.length);
  const containerTag = compact ? 'span' : 'div';
  return `<${containerTag} class="topic-board-cast${compact ? ' is-compact' : ''}" aria-label="Betroffene Figuren">
    ${visible.map(participant => {
      const portrait = topicBoardImage(participant.portrait);
      return `<span class="topic-board-cast-member"${compact ? '' : ' tabindex="0"'} title="${topicBoardEscape(participant.name)}">
        ${portrait
          ? `<img src="${portrait}" alt="${topicBoardEscape(participant.name)}" loading="lazy" decoding="async">`
          : `<span>${topicBoardEscape(topicBoardInitial(participant.name))}</span>`}
      </span>`;
    }).join('')}${remaining ? `<span class="topic-board-cast-more" title="${remaining} weitere Figuren">+${remaining}</span>` : ''}
  </${containerTag}>`;
}

function getTopicBoardExcerpt(value, maximum = 165) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!text) return 'Noch keine nähere Beschreibung.';
  return text.length > maximum ? `${text.slice(0, maximum - 1).trimEnd()}…` : text;
}

function renderTopicBoardSummaryMeta(proposal) {
  const travel = proposal.travel || {};
  const items = [
    proposal.timeframe ? { icon: '◷', value: proposal.timeframe } : null,
    proposal.location ? { icon: '⌖', value: proposal.location } : null,
    travel.enabled && travel.totalDays !== null
      ? { icon: '⌛', value: `${travel.totalDays} ${travel.totalDays === 1 ? 'Tag' : 'Tage'} Reise` }
      : (proposal.duration ? { icon: '⌛', value: proposal.duration } : null),
    proposal.vehicle ? { icon: '❖', value: proposal.vehicle } : null
  ].filter(Boolean).slice(0, 3);
  if (!items.length) return '<span class="topic-board-summary-meta-empty">Planung noch offen</span>';
  return items.map(item => `<span><i aria-hidden="true">${item.icon}</i>${topicBoardEscape(item.value)}</span>`).join('');
}

function renderTopicBoardMeta(proposal) {
  const items = [
    proposal.timeframe ? { icon: '◷', label: 'Zeit', value: proposal.timeframe } : null,
    proposal.duration ? { icon: '⌛', label: 'Dauer', value: proposal.duration } : null,
    proposal.location ? { icon: '⌖', label: 'Ort', value: proposal.location } : null
  ].filter(Boolean);
  if (!items.length && !proposal.vehicle) return '';
  return `<div class="topic-board-meta">
    ${items.map(item => `<div class="topic-board-meta-item"><span aria-hidden="true">${item.icon}</span><div><small>${item.label}</small><strong>${topicBoardEscape(item.value)}</strong></div></div>`).join('')}
    ${proposal.vehicle ? `<div class="topic-board-meta-item topic-board-vehicle">
      ${topicBoardImage(proposal.vehicleIconUrl)
        ? `<img src="${topicBoardImage(proposal.vehicleIconUrl)}" alt="" loading="lazy" decoding="async">`
        : '<span aria-hidden="true">❖</span>'}
      <div><small>Vehikel</small><strong>${topicBoardEscape(proposal.vehicle)}</strong></div>
    </div>` : ''}
  </div>`;
}

function renderTopicBoardProposalCard(input, options = {}) {
  const proposal = normalizeTopicProposal(input);
  const preview = options.preview === true;
  const archived = proposal.status === TOPIC_BOARD_STATUS_ARCHIVED;
  const listState = globalThis.AleriaTopicBoardListState.getState();
  const expanded = preview || listState.expandedId === proposal.id;
  const viewerVoted = !preview && hasTopicProposalVote(proposal, getTopicBoardViewerId());
  const themeIcon = topicBoardImage(proposal.themeIconUrl);
  const detailId = `topic-board-details-${encodeURIComponent(proposal.id || 'preview').replace(/%/g, '-')}`;
  const excerpt = topicBoardEscape(getTopicBoardExcerpt(proposal.description));
  const description = topicBoardEscape(proposal.description || 'Noch keine nähere Beschreibung.')
    .replace(/\n/g, '<br>');
  const actions = preview ? '' : `<div class="topic-board-card-actions">
    <button type="button" data-topic-board-action="vote" data-topic-board-id="${topicBoardEscape(proposal.id)}" aria-pressed="${viewerVoted}">
      <span class="topic-board-vote-seal" aria-hidden="true">${viewerVoted ? '✓' : '✦'}</span>
      <span>${viewerVoted ? 'Stimme zurücknehmen' : 'Dafür stimmen'}</span>
      <strong>${proposal.voteCount}</strong>
    </button>
    <button type="button" data-topic-board-action="edit" data-topic-board-id="${topicBoardEscape(proposal.id)}">Bearbeiten</button>
    <button type="button" data-topic-board-action="${archived ? 'restore' : 'archive'}" data-topic-board-id="${topicBoardEscape(proposal.id)}">${archived ? 'Wieder öffnen' : 'Als gespielt abhaken'}</button>
  </div>`;
  const summaryTag = preview ? 'div' : 'button';
  const summaryAttributes = preview
    ? ''
    : ` type="button" data-topic-board-action="toggle-details" data-topic-board-id="${topicBoardEscape(proposal.id)}" aria-expanded="${expanded}" aria-controls="${detailId}"`;
  return `<article class="topic-board-card${archived ? ' is-archived' : ''}${preview ? ' is-preview' : ''}${expanded ? ' is-expanded' : ''}" data-topic-board-card="${topicBoardEscape(proposal.id)}">
    <div class="topic-board-card-pin" aria-hidden="true"></div>
    <${summaryTag} class="topic-board-card-summary"${summaryAttributes}>
      <span class="topic-board-card-icon">
        ${themeIcon
          ? `<img src="${themeIcon}" alt="" loading="lazy" decoding="async">`
          : `<span aria-hidden="true">${topicBoardEscape(topicBoardInitial(getTopicBoardCategoryLabel(proposal.category)))}</span>`}
      </span>
      <span class="topic-board-summary-copy">
        <span class="topic-board-card-kicker">${topicBoardEscape(getTopicBoardCategoryLabel(proposal.category))}</span>
        <span class="topic-board-card-title" role="heading" aria-level="3">${topicBoardEscape(proposal.title || 'Neuer Themenvorschlag')}</span>
        ${archived ? '<span class="topic-board-archive-stamp">Gespielt & archiviert</span>' : ''}
        <span class="topic-board-summary-excerpt">${excerpt}</span>
        <span class="topic-board-summary-meta">${renderTopicBoardSummaryMeta(proposal)}</span>
      </span>
      ${globalThis.AleriaTopicBoardScheduleUI.renderBadge(proposal.schedule)}
      <span class="topic-board-summary-cast">${renderTopicBoardPortraits(proposal.participants, { compact: true })}</span>
      <span class="topic-board-card-score" title="Stimmen"><strong>${proposal.voteCount}</strong><span>Stimmen</span></span>
      ${preview ? '' : `<span class="topic-board-summary-chevron" aria-hidden="true">⌄</span>`}
    </${summaryTag}>
    <div class="topic-board-card-details" id="${detailId}" data-topic-board-details${expanded ? '' : ' hidden'}>
      <div class="topic-board-description">${description}</div>
      ${globalThis.AleriaTopicBoardScheduleUI.renderCard(proposal.schedule)}
      ${renderTopicBoardMeta(proposal)}
      ${globalThis.AleriaTopicBoardTravelUI.renderCard(proposal.travel)}
      <footer>
        <div><small>Betroffene Personen</small>${renderTopicBoardPortraits(proposal.participants)}</div>
        ${proposal.localOnly ? '<span class="topic-board-local-badge">nur hier gespeichert</span>' : ''}
      </footer>
      ${actions}
    </div>
  </article>`;
}

function syncTopicBoardListControls(overlay) {
  const state = globalThis.AleriaTopicBoardListState.getState();
  const query = overlay.querySelector('[data-topic-board-list-field="query"]');
  const category = overlay.querySelector('[data-topic-board-list-field="category"]');
  const sort = overlay.querySelector('[data-topic-board-list-field="sort"]');
  if (query && query.value !== state.query) query.value = state.query;
  if (category) category.value = state.category;
  if (sort) sort.value = state.sort;
}

function renderTopicBoardList() {
  const overlay = ensureTopicBoardDialog();
  const state = getTopicBoardState();
  const list = overlay.querySelector('[data-topic-board-list]');
  const allVisible = getTopicBoardVisibleProposals();
  const proposals = globalThis.AleriaTopicBoardListState.selectProposals(allVisible);
  const resultCount = overlay.querySelector('[data-topic-board-result-count]');
  if (resultCount) resultCount.textContent = `${proposals.length} von ${allVisible.length}`;
  if (!list) return;
  if (state.loading) {
    list.innerHTML = '<div class="topic-board-empty">Die Themenzettel werden geordnet …</div>';
    return;
  }
  if (proposals.length) {
    list.innerHTML = proposals.map(renderTopicBoardProposalCard).join('');
    return;
  }
  const filtered = globalThis.AleriaTopicBoardListState.hasFilters();
  list.innerHTML = `<div class="topic-board-empty">
    <span aria-hidden="true">${filtered ? '⌕' : (state.view === TOPIC_BOARD_STATUS_ARCHIVED ? '⌂' : '✦')}</span>
    <h3>${filtered ? 'Keine passenden Themen' : (state.view === TOPIC_BOARD_STATUS_ARCHIVED ? 'Das Archiv ist noch leer' : 'Noch kein offener Faden')}</h3>
    <p>${filtered ? 'Passe Suche oder Themenart an.' : (state.view === TOPIC_BOARD_STATUS_ARCHIVED ? 'Abgehakte Themen erscheinen später hier.' : 'Hefte den ersten Vorschlag an die Themenwand.')}</p>
    ${filtered
      ? '<button type="button" data-topic-board-action="clear-list-filters">Filter zurücksetzen</button>'
      : (state.view === TOPIC_BOARD_STATUS_OPEN ? '<button type="button" data-topic-board-action="open-editor">Ersten Vorschlag schreiben</button>' : '')}
  </div>`;
}

function renderTopicBoard() {
  const overlay = ensureTopicBoardDialog();
  const state = getTopicBoardState();
  const open = state.proposals.filter(proposal => proposal.status === TOPIC_BOARD_STATUS_OPEN);
  const archived = state.proposals.filter(proposal => proposal.status === TOPIC_BOARD_STATUS_ARCHIVED);
  overlay.querySelector('[data-topic-board-open-count]').textContent = open.length;
  overlay.querySelector('[data-topic-board-archive-count]').textContent = archived.length;
  overlay.querySelectorAll('[data-topic-board-action="set-view"]').forEach(button => {
    const active = button.dataset.topicBoardView === state.view;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
  });
  const sync = overlay.querySelector('[data-topic-board-sync]');
  if (sync) {
    sync.dataset.state = state.remoteConnected ? 'online' : 'local';
    sync.textContent = state.remoteConnected ? 'Gemeinsam synchronisiert' : 'Lokale Ablage bereit';
  }
  syncTopicBoardListControls(overlay);
  renderTopicBoardList();
  updateTopicBoardSidebarSummary();
}

function toggleTopicBoardProposalDetails(proposalId) {
  const expandedId = globalThis.AleriaTopicBoardListState.toggleExpanded(proposalId);
  document.querySelector('[data-topic-board-list]')?.querySelectorAll('[data-topic-board-card]').forEach(card => {
    const expanded = !!expandedId && card.dataset.topicBoardCard === expandedId;
    card.classList.toggle('is-expanded', expanded);
    const summary = card.querySelector('[data-topic-board-action="toggle-details"]');
    const details = card.querySelector('[data-topic-board-details]');
    if (summary) summary.setAttribute('aria-expanded', String(expanded));
    if (details) details.hidden = !expanded;
  });
}

function getTopicBoardParticipantPickerMarkup(selectedIds = []) {
  const selected = new Set(selectedIds);
  const characters = getTopicBoardCharacters();
  if (!characters.length) return '<div class="topic-board-character-empty">Noch keine Figuren verfügbar.</div>';
  return characters.map(character => {
    const id = String(character.id || '').trim();
    const portrait = topicBoardImage(getTopicBoardCharacterPortrait(character));
    const isSelected = selected.has(id);
    const search = globalThis.AleriaTopicBoardListState.normalizeSearchText(`${character.name || ''} ${character.title || ''} ${id}`);
    return `<button type="button" class="topic-board-character${isSelected ? ' selected' : ''}" data-topic-board-action="toggle-character" data-character-id="${topicBoardEscape(id)}" data-character-search="${topicBoardEscape(search)}" aria-pressed="${isSelected}">
      ${portrait
        ? `<img src="${portrait}" alt="" loading="lazy" decoding="async">`
        : `<span>${topicBoardEscape(topicBoardInitial(character.name))}</span>`}
      <strong>${topicBoardEscape(character.name || 'Unbekannt')}</strong>
    </button>`;
  }).join('');
}

function renderTopicBoardIconField(kind, label, iconUrl) {
  const safeIcon = topicBoardImage(iconUrl);
  return `<div class="topic-board-icon-field">
    <div class="topic-board-icon-preview" data-topic-board-icon-preview="${kind}">
      ${safeIcon ? `<img src="${safeIcon}" alt="" loading="lazy" decoding="async">` : '<span aria-hidden="true">✦</span>'}
    </div>
    <div><strong>${topicBoardEscape(label)}</strong><small>${safeIcon ? 'Icon gewählt' : 'Noch kein Icon gewählt'}</small></div>
    <button type="button" data-topic-board-action="pick-icon" data-topic-board-icon-target="${kind}">Iconverzeichnis</button>
    ${safeIcon ? `<button class="topic-board-icon-clear" type="button" data-topic-board-action="clear-icon" data-topic-board-icon-target="${kind}" aria-label="${topicBoardEscape(label)} entfernen">×</button>` : ''}
  </div>`;
}

function openTopicBoardEditor(proposalId = '') {
  const overlay = ensureTopicBoardDialog();
  const proposal = proposalId ? getTopicBoardProposalById(proposalId) : null;
  _topicBoardEditingProposalId = proposal?.id || '';
  _topicBoardSelectedParticipantIds = new Set(proposal?.participants.map(participant => participant.id) || []);
  _topicBoardSelectedThemeIcon = proposal?.themeIconUrl || '';
  _topicBoardSelectedVehicleIcon = proposal?.vehicleIconUrl || '';
  const editor = overlay.querySelector('[data-topic-board-editor]');
  editor.hidden = false;
  editor.innerHTML = `<form class="topic-board-form" data-topic-board-form>
    <header>
      <div><small>${proposal ? 'Themenzettel überarbeiten' : 'Neuen Faden anheften'}</small><h3>${proposal ? 'Vorschlag bearbeiten' : 'Was spielen wir als Nächstes?'}</h3></div>
      <button type="button" data-topic-board-action="close-editor" aria-label="Editor schließen">×</button>
    </header>
    <div class="topic-board-form-scroll">
      <label class="topic-board-field topic-board-field-wide"><span>Überschrift *</span><input name="title" type="text" maxlength="${TOPIC_BOARD_LIMITS.title}" value="${topicBoardEscape(proposal?.title || '')}" placeholder="Idwal und Trevor segeln nach Abergwint" required></label>
      <label class="topic-board-field"><span>Art des Themas</span><select name="category">${TOPIC_BOARD_CATEGORIES.map(category => `<option value="${category.id}"${proposal?.category === category.id ? ' selected' : ''}>${topicBoardEscape(category.label)}</option>`).join('')}</select></label>
      <label class="topic-board-field"><span>Zeitangabe (erzählerisch)</span><input name="timeframe" type="text" maxlength="${TOPIC_BOARD_LIMITS.meta}" value="${topicBoardEscape(proposal?.timeframe || '')}" placeholder="Nach dem Herbstmarkt"></label>
      <label class="topic-board-field"><span>Dauer (Freitext)</span><input name="duration" type="text" maxlength="${TOPIC_BOARD_LIMITS.meta}" value="${topicBoardEscape(proposal?.duration || '')}" placeholder="2–3 Tage Fahrt"></label>
      <label class="topic-board-field"><span>Ort / Ziel</span><input name="location" type="text" maxlength="${TOPIC_BOARD_LIMITS.meta}" value="${topicBoardEscape(proposal?.location || '')}" placeholder="Abergwint"></label>
      ${globalThis.AleriaTopicBoardScheduleUI.renderEditor(proposal?.schedule, proposal?.travel)}
      <label class="topic-board-field topic-board-field-wide"><span>Worum geht es?</span><textarea name="description" rows="4" maxlength="${TOPIC_BOARD_LIMITS.description}" placeholder="Beschreibe den Aufhänger, offene Fragen und mögliche Beteiligte …">${topicBoardEscape(proposal?.description || '')}</textarea></label>
      <section class="topic-board-form-section topic-board-field-wide">
        <span class="topic-board-form-label">Themen-Icon</span>
        <div data-topic-board-theme-icon>${renderTopicBoardIconField('theme', 'Hauptsymbol des Vorschlags', _topicBoardSelectedThemeIcon)}</div>
      </section>
      <section class="topic-board-form-section topic-board-field-wide">
        <span class="topic-board-form-label">Vehikel / Reisegefährt</span>
        <label class="topic-board-field"><span>Bezeichnung</span><input name="vehicle" type="text" maxlength="${TOPIC_BOARD_LIMITS.meta}" value="${topicBoardEscape(proposal?.vehicle || '')}" placeholder="Idwals Schiff"></label>
        <div data-topic-board-vehicle-icon>${renderTopicBoardIconField('vehicle', 'Icon für Schiff, Pferd oder Wagen', _topicBoardSelectedVehicleIcon)}</div>
      </section>
      ${globalThis.AleriaTopicBoardTravelUI.renderEditor(proposal?.travel)}
      <section class="topic-board-form-section topic-board-field-wide">
        <span class="topic-board-form-label">Betroffene Personen</span>
        <div class="topic-board-character-filter">
          <input class="topic-board-character-search" type="search" data-topic-board-field="character-search" placeholder="Figur suchen …" autocomplete="off">
          <span data-topic-board-character-count aria-live="polite">${getTopicBoardCharacters().length} Figuren</span>
        </div>
        <div class="topic-board-character-list" data-topic-board-characters>${getTopicBoardParticipantPickerMarkup(Array.from(_topicBoardSelectedParticipantIds))}</div>
        <div class="topic-board-character-filter-empty" data-topic-board-character-empty hidden>Keine Figur passt zu dieser Suche.</div>
      </section>
      <section class="topic-board-form-section topic-board-field-wide topic-board-preview-section">
        <span class="topic-board-form-label">Vorschau</span>
        <div data-topic-board-preview></div>
      </section>
    </div>
    <footer>
      <div class="topic-board-form-status" data-topic-board-form-status role="status"></div>
      <div class="topic-board-form-actions">
        <button type="button" data-topic-board-action="close-editor">Abbrechen</button>
        <button class="topic-board-save-button" type="submit" data-topic-board-action="submit" title="${proposal ? 'Änderungen speichern' : 'Themenvorschlag anlegen'}">
          <img src="${TOPIC_BOARD_ACTION_ICON_ASSET}" alt="" decoding="async">
          <span class="topic-board-visually-hidden">${proposal ? 'Änderungen speichern' : 'Themenvorschlag anlegen'}</span>
        </button>
      </div>
    </footer>
  </form>`;
  renderTopicBoardEditorPreview();
  globalThis.setTimeout?.(() => editor.querySelector('input[name="title"]')?.focus(), 20);
}

function closeTopicBoardEditor() {
  const editor = document.querySelector('[data-topic-board-editor]');
  if (!editor) return;
  editor.hidden = true;
  editor.innerHTML = '';
  _topicBoardEditingProposalId = '';
  _topicBoardSelectedParticipantIds = new Set();
  _topicBoardIconTarget = '';
}

function collectTopicBoardFormPayload() {
  const form = document.querySelector('[data-topic-board-form]');
  if (!form) return normalizeTopicProposal({});
  const charactersById = new Map(getTopicBoardCharacters().map(character => [String(character.id || ''), character]));
  const participants = Array.from(_topicBoardSelectedParticipantIds).map(id => {
    const character = charactersById.get(id);
    return character ? {
      id,
      name: character.name || 'Unbekannt',
      portrait: getTopicBoardCharacterPortrait(character)
    } : null;
  }).filter(Boolean);
  const current = _topicBoardEditingProposalId ? getTopicBoardProposalById(_topicBoardEditingProposalId) : null;
  const travel = globalThis.AleriaTopicBoardTravelUI.collect(form);
  return normalizeTopicProposal({
    ...current,
    title: form.elements.title?.value || '',
    description: form.elements.description?.value || '',
    category: form.elements.category?.value || 'anderes',
    timeframe: form.elements.timeframe?.value || '',
    duration: form.elements.duration?.value || '',
    location: form.elements.location?.value || '',
    themeIconUrl: _topicBoardSelectedThemeIcon,
    vehicle: form.elements.vehicle?.value || '',
    vehicleIconUrl: _topicBoardSelectedVehicleIcon,
    schedule: globalThis.AleriaTopicBoardScheduleUI.collect(form, travel),
    travel,
    participants
  });
}

function renderTopicBoardEditorPreview() {
  const preview = document.querySelector('[data-topic-board-preview]');
  if (!preview) return;
  refreshTopicBoardEditorPlanning(preview.closest('[data-topic-board-form]'));
  preview.innerHTML = renderTopicBoardProposalCard(collectTopicBoardFormPayload(), { preview: true });
}

function refreshTopicBoardEditorPlanning(form) {
  if (!form) return;
  globalThis.AleriaTopicBoardTravelUI.refresh(form);
  const travel = globalThis.AleriaTopicBoardTravelUI.collect(form);
  globalThis.AleriaTopicBoardScheduleUI.refresh(form, travel);
}

function setTopicBoardFormStatus(message = '', type = 'info') {
  const status = document.querySelector('[data-topic-board-form-status]');
  if (!status) return;
  status.textContent = message;
  status.dataset.status = type;
}

function toggleTopicBoardCharacter(characterId) {
  const id = String(characterId || '').trim();
  if (!id) return;
  if (_topicBoardSelectedParticipantIds.has(id)) _topicBoardSelectedParticipantIds.delete(id);
  else if (_topicBoardSelectedParticipantIds.size < TOPIC_BOARD_LIMITS.participantCount) _topicBoardSelectedParticipantIds.add(id);
  document.querySelectorAll('[data-topic-board-action="toggle-character"]').forEach(button => {
    const selected = _topicBoardSelectedParticipantIds.has(button.dataset.characterId || '');
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  renderTopicBoardEditorPreview();
}

function filterTopicBoardCharacters(value) {
  const needle = globalThis.AleriaTopicBoardListState.normalizeSearchText(value);
  const buttons = Array.from(document.querySelectorAll('[data-topic-board-characters] .topic-board-character'));
  let visibleCount = 0;
  buttons.forEach(button => {
    const visible = !needle || String(button.dataset.characterSearch || '').includes(needle);
    button.hidden = !visible;
    if (visible) visibleCount += 1;
  });
  const counter = document.querySelector('[data-topic-board-character-count]');
  if (counter) counter.textContent = `${visibleCount} von ${buttons.length} Figuren`;
  const empty = document.querySelector('[data-topic-board-character-empty]');
  if (empty) empty.hidden = visibleCount > 0 || !buttons.length;
}

function openTopicBoardIconPicker(target) {
  _topicBoardIconTarget = target === 'vehicle' ? 'vehicle' : 'theme';
  if (typeof openIconDirectory === 'function') openIconDirectory();
}

function setTopicBoardSelectedIcon(target, src = '') {
  if (target === 'vehicle') _topicBoardSelectedVehicleIcon = String(src || '').trim();
  else _topicBoardSelectedThemeIcon = String(src || '').trim();
  const host = document.querySelector(target === 'vehicle' ? '[data-topic-board-vehicle-icon]' : '[data-topic-board-theme-icon]');
  if (host) host.innerHTML = renderTopicBoardIconField(target, target === 'vehicle' ? 'Icon für Schiff, Pferd oder Wagen' : 'Hauptsymbol des Vorschlags', src);
  renderTopicBoardEditorPreview();
}

async function submitTopicBoardEditor() {
  if (_topicBoardSubmitting) return;
  const payload = collectTopicBoardFormPayload();
  if (!payload.title) {
    setTopicBoardFormStatus('Bitte gib dem Vorschlag eine Überschrift.', 'error');
    document.querySelector('[data-topic-board-form] input[name="title"]')?.focus();
    return;
  }
  if (!globalThis.AleriaTopicBoardSchedule.hasDate(payload.schedule?.startDate)) {
    setTopicBoardFormStatus('Bitte trage einen vollständigen Start- oder Fälligkeitstermin ein.', 'error');
    document.querySelector('[data-topic-board-form] input[name="scheduleStartDay"]')?.focus();
    return;
  }
  _topicBoardSubmitting = true;
  const submit = document.querySelector('[data-topic-board-action="submit"]');
  if (submit) submit.disabled = true;
  setTopicBoardFormStatus('Der Themenzettel wird angeheftet …');
  try {
    const result = _topicBoardEditingProposalId
      ? await updateTopicBoardProposal(_topicBoardEditingProposalId, payload)
      : await createTopicBoardProposal(payload);
    closeTopicBoardEditor();
    renderTopicBoard();
    if (typeof showAppStatus === 'function') {
      showAppStatus(result.localOnly
        ? 'Vorschlag lokal gespeichert. Er wird auf diesem Gerät weitergeführt.'
        : 'Vorschlag an die Themenwand geheftet.', result.localOnly ? 'info' : 'success');
    }
  } catch (error) {
    setTopicBoardFormStatus(typeof getFriendlyErrorMessage === 'function'
      ? getFriendlyErrorMessage(error, 'Vorschlag konnte nicht gespeichert werden.')
      : String(error?.message || 'Vorschlag konnte nicht gespeichert werden.'), 'error');
  } finally {
    _topicBoardSubmitting = false;
    if (submit) submit.disabled = false;
  }
}

function openTopicBoardDialog(options = {}) {
  ensureTopicBoardDialog();
  renderTopicBoard();
  if (typeof activateDialog === 'function') {
    activateDialog('topic-board-overlay', { initialFocus: options.editor ? 'input[name="title"]' : '[data-topic-board-action="set-view"]' });
  } else {
    document.getElementById('topic-board-overlay')?.classList.add('active');
  }
  if (options.editor) openTopicBoardEditor(options.proposalId || '');
}

function closeTopicBoardDialog() {
  closeTopicBoardEditor();
  if (typeof deactivateDialog === 'function') deactivateDialog('topic-board-overlay');
  else document.getElementById('topic-board-overlay')?.classList.remove('active');
}

globalThis.AleriaTopicBoardUI = Object.freeze({
  closeTopicBoardDialog,
  closeTopicBoardEditor,
  filterTopicBoardCharacters,
  openTopicBoardDialog,
  openTopicBoardEditor,
  openTopicBoardIconPicker,
  renderTopicBoard,
  renderTopicBoardList,
  renderTopicBoardEditorPreview,
  refreshTopicBoardEditorPlanning,
  setTopicBoardFormStatus,
  setTopicBoardSelectedIcon,
  submitTopicBoardEditor,
  toggleTopicBoardCharacter,
  toggleTopicBoardProposalDetails,
  updateTopicBoardSidebarSummary
});
