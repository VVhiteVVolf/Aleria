(function () {
  'use strict';

  const password = '7777';
  const editorWidthKey = 'aleria.tafeln.editor-width';
  let editMode = false;
  let pendingPosition = null;
  let selectedType = null;
  let scrollOpener = null;

  const rt = () => window.TafelRuntime;
  const state = () => window.TafelState.get();

  function modal(id, open) {
    document.getElementById(id)?.classList.toggle('open', open);
  }

  function setHint(message) {
    const hint = document.getElementById('hint');
    if (!hint) return;
    hint.textContent = message || '';
    hint.classList.toggle('on', Boolean(message));
  }

  function applyMeta() {
    const current = state();
    const title = document.getElementById('title');
    if (title) title.textContent = current.regionTitle || 'Anzeigetafel';
    const icon = document.getElementById('region-icon-wrap');
    if (!icon) return;
    icon.replaceChildren();
    if (!current.regionIcon) {
      icon.textContent = '⚜';
      return;
    }
    const image = document.createElement('img');
    image.src = current.regionIcon;
    image.alt = '';
    image.addEventListener('error', () => {
      icon.textContent = '⚜';
    }, { once: true });
    icon.append(image);
  }

  function toggleEdit() {
    if (editMode) exitEdit();
    else {
      modal('pw-mo', true);
      window.setTimeout(() => document.getElementById('pw-inp')?.focus(), 40);
    }
  }

  function closePassword() {
    modal('pw-mo', false);
    const input = document.getElementById('pw-inp');
    if (input) input.value = '';
    document.getElementById('pw-err').hidden = true;
  }

  function checkPassword() {
    const input = document.getElementById('pw-inp');
    if (input?.value !== password) {
      document.getElementById('pw-err').hidden = false;
      input?.select();
      return;
    }
    closePassword();
    enterEdit();
  }

  function enterEdit() {
    editMode = true;
    document.getElementById('btn-edit').textContent = '✓ Editormodus';
    document.getElementById('btn-edit').classList.add('on');
    document.getElementById('lock-lbl').textContent = 'aktiv';
    document.getElementById('edit-tools').hidden = false;
    document.getElementById('btn-publish').hidden = !window.TafelPublish?.isConfigured();
    document.getElementById('title').classList.add('editable');
    document.getElementById('region-icon-wrap').classList.add('editable');
    rt().renderZettel();
    window.dispatchEvent(new CustomEvent('aleria:tafel:edit-mode'));
    rt().toast('Editormodus aktiviert');
  }

  function exitEdit() {
    editMode = false;
    cancelPlacement();
    closeSidebar();
    document.getElementById('btn-edit').textContent = '✎ Bearbeiten';
    document.getElementById('btn-edit').classList.remove('on');
    document.getElementById('lock-lbl').textContent = 'gesperrt';
    document.getElementById('edit-tools').hidden = true;
    document.getElementById('title').classList.remove('editable');
    document.getElementById('region-icon-wrap').classList.remove('editable');
    rt().renderZettel();
    window.dispatchEvent(new CustomEvent('aleria:tafel:edit-mode'));
  }

  function editTitle() {
    if (!editMode) return;
    const title = document.getElementById('title');
    const input = document.getElementById('title-input');
    input.value = state().regionTitle || '';
    title.hidden = true;
    input.hidden = false;
    input.focus();
    input.select();
  }

  function saveTitle() {
    const title = document.getElementById('title');
    const input = document.getElementById('title-input');
    if (input.hidden) return;
    state().regionTitle = input.value.trim() || state().regionTitle || 'Anzeigetafel';
    input.hidden = true;
    title.hidden = false;
    applyMeta();
    window.TafelBoard.applyImage();
    window.TafelState.save();
  }

  function cancelTitle() {
    document.getElementById('title-input').hidden = true;
    document.getElementById('title').hidden = false;
  }

  function openIcon() {
    if (!editMode) return;
    const input = document.getElementById('icon-url-inp');
    input.value = state().regionIcon || '';
    previewIcon();
    modal('icon-mo', true);
  }

  function previewIcon() {
    const value = document.getElementById('icon-url-inp').value.trim();
    const preview = document.getElementById('icon-preview');
    preview.replaceChildren();
    if (!value) {
      preview.textContent = '📜';
      return;
    }
    const image = document.createElement('img');
    image.src = value;
    image.alt = '';
    image.addEventListener('error', () => {
      preview.textContent = 'Bild nicht lesbar';
    }, { once: true });
    preview.append(image);
  }

  function saveIcon() {
    state().regionIcon = document.getElementById('icon-url-inp').value.trim();
    applyMeta();
    window.TafelState.save();
    modal('icon-mo', false);
  }

  function clearIcon() {
    state().regionIcon = '';
    applyMeta();
    window.TafelState.save();
    modal('icon-mo', false);
  }

  function openBoardImages() {
    if (!editMode) return;
    const value = state().boardImages?.board || window.TAFEL_CONFIG?.images?.board || '';
    document.getElementById('boardimg-board').value = value;
    previewBoardImage();
    modal('boardimg-mo', true);
  }

  function previewBoardImage() {
    const value = document.getElementById('boardimg-board').value.trim();
    const preview = document.getElementById('boardimg-preview');
    preview.innerHTML = value ? `<img src="${rt().esc(value)}" alt="Vorschau">` : '<span>Kein Bild ausgewählt</span>';
  }

  function saveBoardImages() {
    const value = document.getElementById('boardimg-board').value.trim();
    state().boardImages = value ? { board: value } : {};
    window.TafelBoard.applyImage({ fit: true });
    window.TafelState.save();
    modal('boardimg-mo', false);
    rt().toast('Tafelbild lokal gespeichert');
  }

  function clearBoardImages() {
    state().boardImages = {};
    window.TafelBoard.applyImage({ fit: true });
    window.TafelState.save();
    modal('boardimg-mo', false);
    rt().toast('Registry-Tafelbild wiederhergestellt');
  }

  function startAddZettel() {
    if (!editMode) return;
    setHint('Auf die gewünschte Stelle der Tafel klicken · Esc bricht ab');
    window.TafelBoard.startPlacement(position => openTypePicker(position));
  }

  function openTypePicker(position) {
    pendingPosition = position;
    selectedType = null;
    document.getElementById('zettel-type-grid').innerHTML = window.TafelZettelConfig.renderTypeCards(rt().esc);
    document.getElementById('zettel-tpl-apply-btn').disabled = true;
    document.getElementById('notice-template-detail').textContent = 'Jede Vorlage bietet eigene Angaben, Bilder und Platz für deinen Wortlaut.';
    setHint('');
    modal('zettel-tpl-mo', true);
    document.querySelector('#zettel-type-grid .tpl-card')?.focus();
  }

  function selectType(typeId) {
    const template = window.TafelZettelConfig.typeById(typeId);
    if (!template) return;
    selectedType = typeId;
    document.querySelectorAll('#zettel-type-grid .tpl-card').forEach(card => {
      const selected = card.dataset.zettelType === typeId;
      card.classList.toggle('on', selected);
      card.setAttribute('aria-pressed', String(selected));
    });
    document.getElementById('notice-template-detail').textContent = `${template.label} · ${template.table.map(row => row.k).join(' · ')}`;
    document.getElementById('zettel-tpl-apply-btn').disabled = false;
  }

  function applyTemplate() {
    if (!pendingPosition || !selectedType) return;
    const notice = window.TafelZettelConfig.createDraft(selectedType, pendingPosition, rt().uid);
    state().zettel.push(notice);
    pendingPosition = null;
    selectedType = null;
    modal('zettel-tpl-mo', false);
    rt().renderZettel();
    window.TafelState.save();
    window.openZettelSidebar(notice.id, 'edit');
  }

  function cancelPlacement() {
    pendingPosition = null;
    selectedType = null;
    window.TafelBoard.cancelPlacement();
    modal('zettel-tpl-mo', false);
    setHint('');
  }

  function jumpToNotice(id) {
    const notice = state().zettel.find(item => item.id === id);
    if (!notice) return;

    window.TafelBoard.focusNotice(notice);
    window.setTimeout(() => openZettelScroll(id), 220);
  }

  function openZettelScroll(id) {
    const notice = state().zettel.find(item => item.id === id);
    if (!notice || (notice.secret && !editMode)) return;
    if (!document.getElementById('scroll-mo').classList.contains('open')) scrollOpener = document.activeElement;
    document.getElementById('scroll-content').innerHTML = window.TafelZettelViews.renderLive(notice);
    document.getElementById('scroll-actions').innerHTML = editMode
      ? `<button class="s-btn s-edit" type="button" data-action="zettel-open-edit" data-zettel-id="${rt().esc(id)}">Bearbeiten</button><button class="s-btn s-cancel" type="button" data-action="close-scroll">Schließen</button>`
      : '<button class="s-btn s-cancel" type="button" data-action="close-scroll">Schließen</button>';
    document.getElementById('scroll-card').style.width = `min(${notice.cardWidth || state().cardWidth || 1100}px, calc(100vw - 32px))`;
    document.getElementById('scroll-card').setAttribute('aria-label', notice.title || 'Aushang');
    document.getElementById('scroll-content').scrollTop = 0;
    modal('scroll-mo', true);
    document.querySelector('#scroll-card .scroll-close').focus();
  }

  function closeScroll() {
    const wasOpen = document.getElementById('scroll-mo').classList.contains('open');
    modal('scroll-mo', false);
    if (wasOpen && scrollOpener?.isConnected) scrollOpener.focus();
    scrollOpener = null;
  }

  function clampEditorWidth(value) {
    return Math.max(460, Math.min(Math.max(520, window.innerWidth - 460), Number(value) || 660));
  }

  function bindEditorResize() {
    const resizer = document.getElementById('sb-resizer');
    if (!resizer || resizer.dataset.bound === 'true') return;
    resizer.dataset.bound = 'true';
    resizer.addEventListener('pointerdown', event => {
      event.preventDefault();
      const move = moveEvent => {
        const width = clampEditorWidth(moveEvent.clientX);
        document.getElementById('sidebar').style.setProperty('--editor-col-width', `${width}px`);
        localStorage.setItem(editorWidthKey, String(width));
      };
      const up = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up, { once: true });
    });
  }

  function openEditorShell(kind, id) {
    const sidebar = document.getElementById('sidebar');
    const body = sidebar.querySelector('#sb-body');
    const footer = sidebar.querySelector('#sb-footer');
    if (!body || !footer) return;
    const header = sidebar.querySelector('#sb-header');
    const main = document.createElement('div');
    main.id = 'sb-main';
    const editorColumn = document.createElement('div');
    editorColumn.id = 'sb-editor-col';
    editorColumn.append(body, footer);
    main.innerHTML = '<div id="sb-resizer" role="separator" aria-label="Editorbreite anpassen"></div><div id="sb-preview"><div id="sb-preview-head">Live-Vorschau</div><div id="sb-preview-content"></div></div>';
    main.prepend(editorColumn);
    sidebar.replaceChildren(header, main);
    sidebar.dataset.editorKind = kind;
    sidebar.dataset.editorId = id;
    sidebar.style.setProperty('--editor-col-width', `${clampEditorWidth(localStorage.getItem(editorWidthKey))}px`);
    sidebar.classList.add('open', 'editor-fullscreen');
    bindEditorResize();
    renderEditorPreview();
  }

  function renderEditorPreview() {
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('sb-preview-content');
    if (!content || sidebar.dataset.editorKind !== 'zettel') return;
    const notice = state().zettel.find(item => item.id === sidebar.dataset.editorId);
    content.innerHTML = notice
      ? `<div class="editor-preview-card">${window.TafelZettelViews.renderByType(notice)}</div>`
      : '<div class="editor-preview-empty">Kein Aushang gewählt.</div>';
  }

  function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.remove('open', 'editor-fullscreen');
    sidebar.replaceChildren();
    delete sidebar.dataset.editorKind;
    delete sidebar.dataset.editorId;
    window.TafelZettelEditor?.clearActive();
  }

  function setZettelCardWidth(id, value) {
    const notice = state().zettel.find(item => item.id === id);
    if (!notice) return;
    notice.cardWidth = Math.max(500, Math.min(1600, Number(value) || 1100));
    const label = document.getElementById('card-w-val-z');
    if (label) label.textContent = `${notice.cardWidth}px`;
    renderEditorPreview();
    window.TafelState.save();
  }

  function openBackups() {
    renderBackups();
    modal('backup-mo', true);
  }

  function renderBackups() {
    const list = document.getElementById('backup-list');
    const backups = window.TafelState.backups();
    list.innerHTML = backups.length ? backups.map(entry => `
      <article class="tafel-backup-entry">
        <div><strong>${rt().esc(entry.label)}</strong><span>${new Date(entry.savedAt).toLocaleString('de-DE')} · ${entry.state?.zettel?.length || 0} Aushänge</span></div>
        <button class="s-btn s-cancel" type="button" data-action="restore-backup" data-backup-id="${rt().esc(entry.id)}">Wiederherstellen</button>
      </article>`).join('') : '<p>Noch keine lokalen Sicherungen vorhanden.</p>';
  }

  function saveBackupNow() {
    window.TafelState.backup('Manuell');
    renderBackups();
    rt().toast('Lokale Sicherung angelegt');
  }

  function restoreBackup(id) {
    if (!confirm('Aktuellen lokalen Stand durch diese Sicherung ersetzen?')) return;
    if (window.TafelState.restoreBackup(id)) {
      applyMeta();
      window.TafelBoard.applyImage({ fit: true });
      rt().renderZettel();
      renderBackups();
      rt().toast('Sicherung wiederhergestellt');
    }
  }

  function init() {
    applyMeta();
    document.getElementById('title-input').hidden = true;
    document.getElementById('notice-placement-cursor').hidden = true;
    window.addEventListener('keydown', event => {
      if (document.querySelector('dialog[open]')) return;
      if (event.key === 'Tab' && document.getElementById('scroll-mo').classList.contains('open')) {
        const focusable = [...document.querySelectorAll('#scroll-card button, #scroll-card a[href], #scroll-card input, #scroll-card textarea, #scroll-card summary')].filter(element => !element.disabled && element.getClientRects().length);
        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
      if (event.key === 'Escape') {
        cancelPlacement();
        closeScroll();
      }
    });
    window.addEventListener('aleria:tafel:state-applied', () => {
      applyMeta();
      window.TafelBoard.applyImage();
      rt().renderZettel();
    });
  }

  window.TafelEditor = Object.freeze({
    init,
    isEditMode: () => editMode,
    applyMeta,
    toggleEdit,
    closePassword,
    checkPassword,
    editTitle,
    saveTitle,
    cancelTitle,
    openIcon,
    previewIcon,
    saveIcon,
    clearIcon,
    openBoardImages,
    previewBoardImage,
    saveBoardImages,
    clearBoardImages,
    startAddZettel,
    selectType,
    applyTemplate,
    cancelPlacement,
    jumpToNotice,
    openZettelScroll,
    closeScroll,
    openEditorShell,
    renderEditorPreview,
    closeSidebar,
    setZettelCardWidth,
    openBackups,
    saveBackupNow,
    restoreBackup,
  });

  window.openZettelScroll = openZettelScroll;
  window.setZettelCardWidth = setZettelCardWidth;
})();
