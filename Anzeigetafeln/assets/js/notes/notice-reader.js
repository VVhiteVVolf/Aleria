(function () {
  'use strict';
  let activeId = '';
  let personPage = 0;
  let opener = null;
  let stopLayout = () => {};
  let stopTypography = () => {};
  const rt = () => window.TafelRuntime;
  const visibleMembers = () => window.TafelNoticeStacks.members(rt().state().zettel, activeId, { includeSecret: rt().isEditMode() });

  function render() {
    const stack = visibleMembers();
    const entries = window.TafelNoticeStacks.publications(stack, { includeSecret: rt().isEditMode() });
    const entry = entries.find(item => item.notices.some(notice => notice.id === activeId));
    const items = entry?.notices || [];
    const notice = items.find(item => item.id === activeId);
    if (!notice) { close(); return; }
    const index = items.indexOf(notice);
    const esc = rt().esc;
    const publications = document.getElementById('notice-publications');
    publications.hidden = entries.length < 2;
    publications.innerHTML = entries.length < 2 ? '' : entries.map(item => `<button type="button" data-action="notice-publication-select" data-notice-id="${esc(item.id)}" aria-pressed="${item.key === entry.key}">${esc(item.primary.title || 'Ohne Titel')}${item.notices.length > 1 ? ` · ${item.notices.length} Blätter` : ''}</button>`).join('');
    const nav = document.getElementById('notice-stack-nav');
    nav.hidden = items.length < 2;
    nav.innerHTML = items.length < 2 ? '' : `
      <button type="button" data-action="notice-stack-previous" aria-label="Vorheriger Aushang" ${index === 0 ? 'disabled' : ''}>‹ <span>Zurück</span></button>
      <label class="notice-stack-select"><span aria-live="polite">${esc(entry.primary.title || 'Aushang')} · Blatt ${index + 1} von ${items.length}</span><select aria-label="Blatt dieses Aushangs wählen" data-input-action="notice-stack-select">${items.map(item => `<option value="${esc(item.id)}" ${item.id === activeId ? 'selected' : ''}>${esc(item.title || 'Ohne Titel')}</option>`).join('')}</select></label>
      <button type="button" data-action="notice-stack-next" aria-label="Nächster Aushang" ${index === items.length - 1 ? 'disabled' : ''}><span>Weiter</span> ›</button>`;
    const content = document.getElementById('scroll-content');
    stopLayout();
    stopTypography();
    content.innerHTML = window.TafelZettelViews.renderLive(notice, { personPage });
    content.scrollTop = 0;
    document.getElementById('scroll-actions').innerHTML = rt().isEditMode()
      ? `<button class="s-btn s-edit" type="button" data-action="zettel-open-edit" data-zettel-id="${esc(activeId)}">Bearbeiten</button><button class="s-btn s-cancel" type="button" data-action="close-scroll">Schließen</button>`
      : '<button class="s-btn s-cancel" type="button" data-action="close-scroll">Schließen</button>';
    const card = document.getElementById('scroll-card');
    card.style.width = `min(${Number(notice.cardWidth) || rt().state().cardWidth || 1100}px, calc(100vw - 32px))`;
    card.setAttribute('aria-label', notice.title || 'Aushang');
    card.classList.toggle('is-stacked', stack.length > 1);
    stopTypography = window.TafelNoticeTypography.mount(content, notice);
    stopLayout = window.TafelNoticeTextLayout.observe(content);
  }

  function open(id) {
    const notice = rt().state().zettel.find(item => item.id === id);
    if (!notice || (notice.secret && !rt().isEditMode())) return;
    const modal = document.getElementById('scroll-mo');
    if (!modal.classList.contains('open')) opener = document.activeElement;
    activeId = id;
    personPage = 0;
    modal.classList.add('open');
    render();
    document.querySelector('#scroll-card .scroll-close').focus();
  }

  function select(id) {
    if (!visibleMembers().some(item => item.id === id)) return;
    activeId = id;
    personPage = 0;
    render();
    document.querySelector('#notice-stack-nav select')?.focus();
  }

  function step(direction) {
    const items = window.TafelNoticeStacks.publication(visibleMembers(), activeId, { includeSecret: rt().isEditMode() })?.notices || [];
    const index = items.findIndex(item => item.id === activeId);
    if (items[index + direction]) select(items[index + direction].id);
  }

  function close() {
    const modal = document.getElementById('scroll-mo');
    const wasOpen = modal.classList.contains('open');
    modal.classList.remove('open');
    stopLayout();
    stopTypography();
    activeId = '';
    if (wasOpen && opener?.isConnected) opener.focus();
    opener = null;
  }

  function setPersonPage(id, page) {
    if (id !== activeId) return;
    const notice = rt().state().zettel.find(item => item.id === id);
    personPage = Math.max(0, Math.min((notice?.personen?.length || 1) - 1, page));
    render();
  }

  function refresh() {
    if (document.getElementById('scroll-mo').classList.contains('open')) render();
  }

  window.addEventListener('aleria:tafel:state-applied', refresh);
  window.addEventListener('aleria:tafel:edit-mode', refresh);
  window.TafelNoticeReader = Object.freeze({ open, close, select, step, setPersonPage, refresh });
})();
