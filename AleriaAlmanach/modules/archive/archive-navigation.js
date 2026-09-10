/* Owns the tab strip, overflow controls and the complete area chooser. */
const AleriaArchiveNavigation = (() => {
  let unmount = () => {};
  const tools = [
    ['new-module', '+ Modul', 'Neues Modul anlegen'],
    ['import-module', 'Import', 'Modul importieren, exportieren oder Backup verwalten'],
    ['open-module-stamp', 'Stempel', 'Bestehendes Modul kopieren und als eigenständige Kopie einsetzen'],
    ['create-module-section', '+ Reiter', 'Neuen großen Modul-Reiter erstellen'],
    ['toggle-archive-manage', 'Verwalten', 'Reiter, Pfade und Modulpositionen verwalten'],
    ['open-icon-directory', 'Icons', 'Icon-Verzeichnis aus dem Projektordner öffnen']
  ];

  function render(sections, { activeTab = 'Alle', toolsExpanded = false } = {}) {
    const primaryRegisterTabs = new Set(['Alle', 'Charaktere', 'Kreaturen']);
    const tabs = ['Alle', ...new Set(sections.map(section => section.tab || section.key).filter(tab => tab && !primaryRegisterTabs.has(tab)))];
    return `
      <div class="archive-tab-scroller">
        <button class="archive-tab-scroll" type="button" data-archive-navigation="scroll" data-direction="-1" aria-label="Vorherige Reiter" hidden>‹</button>
        <div class="gallery-tab-group gallery-tab-group-main">
          ${tabs.map(tab => `<button class="gallery-tab-btn${tab === activeTab ? ' active' : ''}" type="button" data-tab="${escapeHtml(tab)}" data-tab-theme="${escapeHtml(getThemeMetaForTab(tab).slug)}" data-archive-action="switch-tab"${tab === activeTab ? ' aria-current="page"' : ''}>${escapeHtml(tab === 'Alle' ? 'Übersicht' : tab)}</button>`).join('')}
        </div>
        <button class="archive-tab-scroll" type="button" data-archive-navigation="scroll" data-direction="1" aria-label="Weitere Reiter" hidden>›</button>
      </div>
      <div class="archive-area-chooser">
        <button class="archive-area-toggle" type="button" data-archive-navigation="toggle-areas" aria-expanded="false" aria-controls="archive-area-panel">Alle Bereiche <span aria-hidden="true">⌄</span></button>
        <div class="archive-area-panel" id="archive-area-panel" role="region" aria-label="Alle Archivbereiche" hidden>
          <div class="archive-area-panel-head"><strong>Weltpfade</strong><button type="button" data-archive-navigation="close-areas" aria-label="Bereichsauswahl schließen">×</button></div>
          <button class="archive-area-home" type="button" data-archive-action="switch-tab" data-tab="Alle">Zur Übersicht <span aria-hidden="true">↗</span></button>
          <div class="archive-area-grid">${buildArchiveDashboardSectionCards(sections)}</div>
        </div>
      </div>
      <div class="gallery-tab-group gallery-tab-group-tools${toolsExpanded ? ' is-expanded' : ''}" aria-label="Archivwerkzeuge">
        <button class="gallery-tab-btn gallery-tab-edit-toggle${toolsExpanded ? ' active' : ''}" type="button" data-archive-action="toggle-archive-tools" aria-label="Bearbeitungswerkzeuge anzeigen" aria-expanded="${toolsExpanded}">Bearbeiten</button>
        <div class="gallery-tab-tool-actions" aria-label="Bearbeitungswerkzeuge">
          ${tools.map(([action, label, title]) => `<button class="gallery-tab-btn gallery-tab-add gallery-tab-tool" type="button" data-archive-action="${action}" title="${title}" aria-label="${title}">${label}</button>`).join('')}
        </div>
      </div>`;
  }

  function mount({ activeTab = 'Alle', focusActiveTab = false } = {}) {
    unmount();
    const nav = document.getElementById('gallery-tabs');
    if (!nav) return;
    const abort = new AbortController();
    const { signal } = abort;
    const scroller = nav.querySelector('.archive-tab-scroller');
    const strip = nav.querySelector('.gallery-tab-group-main');
    const arrows = [...nav.querySelectorAll('[data-archive-navigation="scroll"]')];
    const panel = nav.querySelector('.archive-area-panel');
    const toggle = nav.querySelector('[data-archive-navigation="toggle-areas"]');
    const compact = window.matchMedia('(max-width: 1100px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function closeAreas(restoreFocus = false) {
      if (panel.hidden) return;
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      if (restoreFocus) toggle.focus({ preventScroll: true });
    }

    function updateOverflow() {
      const overflowing = strip.scrollWidth > scroller.clientWidth + 1;
      scroller.classList.toggle('has-overflow', overflowing);
      arrows.forEach(button => {
        button.hidden = !overflowing;
        button.disabled = button.dataset.direction === '-1'
          ? strip.scrollLeft <= 1
          : strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 1;
      });
    }

    nav.addEventListener('click', event => {
      const action = event.target.closest('[data-archive-navigation]')?.dataset.archiveNavigation;
      if (action === 'toggle-areas') {
        panel.hidden = !panel.hidden;
        toggle.setAttribute('aria-expanded', String(!panel.hidden));
        if (!panel.hidden) {
          panel.scrollTop = 0;
          panel.querySelector('button')?.focus({ preventScroll: true });
        }
      } else if (action === 'close-areas') closeAreas(true);
      else if (action === 'scroll') {
        const direction = Number(event.target.closest('[data-direction]').dataset.direction);
        strip.scrollBy({ left: direction * Math.max(160, strip.clientWidth * 0.75), behavior: reducedMotion.matches ? 'auto' : 'smooth' });
      }
      if (event.target.closest('[data-archive-action="switch-tab"]')) closeAreas();
      if (event.target.closest('[data-archive-action="toggle-archive-tools"]')) requestAnimationFrame(updateOverflow);
    }, { signal });
    document.addEventListener('pointerdown', event => {
      if (!panel.contains(event.target) && !toggle.contains(event.target)) closeAreas();
    }, { signal });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); closeAreas(true); }
    }, { signal });
    nav.addEventListener('focusout', event => {
      if (event.relatedTarget && !panel.contains(event.relatedTarget) && event.relatedTarget !== toggle) closeAreas();
    }, { signal });
    strip.addEventListener('scroll', updateOverflow, { passive: true, signal });
    compact.addEventListener('change', event => {
      const tree = document.querySelector('.archive-hierarchy-tree');
      if (tree) tree.open = !event.matches;
    }, { signal });
    panel.querySelectorAll('[data-tab]').forEach(button => {
      if (button.dataset.tab === activeTab) button.setAttribute('aria-current', 'page');
    });
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(scroller);
    updateOverflow();
    const selected = strip.querySelector('[aria-current="page"]');
    if (selected) {
      const item = selected.getBoundingClientRect();
      const bounds = strip.getBoundingClientRect();
      if (item.left < bounds.left) strip.scrollLeft += item.left - bounds.left;
      else if (item.right > bounds.right) strip.scrollLeft += item.right - bounds.right;
      if (focusActiveTab) selected.focus({ preventScroll: true });
    }
    document.fonts?.ready.then(() => { if (!signal.aborted) updateOverflow(); });
    unmount = () => { abort.abort(); observer.disconnect(); };
  }

  return Object.freeze({ render, mount });
})();
