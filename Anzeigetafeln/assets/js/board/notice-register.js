(function () {
  'use strict';
  let root;
  let query = '';
  let type = '';
  const rt = () => window.TafelRuntime;

  function setOpen(open) {
    root.hidden = !open;
    document.getElementById('btn-register').setAttribute('aria-expanded', String(open));
  }

  function render() {
    if (!root) return;
    const visible = window.TafelNoticeSearch.select(rt().state().zettel, { includeSecret: rt().isEditMode() });
    const esc = rt().esc;
    const filter = root.querySelector('[data-role="notice-type-filter"]');
    const options = window.ZETTEL_TYPES.filter(item => visible.some(notice => notice.typ === item.id));
    if (type && !options.some(item => item.id === type)) type = '';
    const matches = window.TafelNoticeSearch.select(visible, { query, type, includeSecret: true });
    const signature = options.map(item => item.id).join(',');
    if (filter.dataset.options !== signature) {
      filter.innerHTML = '<option value="">Alle Aushänge</option>' + options.map(item => `<option value="${item.id}">${esc(item.label)}</option>`).join('');
      filter.dataset.options = signature;
    }
    filter.value = type;
    document.getElementById('notice-count').textContent = String(visible.length);
    root.querySelector('[data-role="notice-result-count"]').textContent = `${matches.length} ${matches.length === 1 ? 'Aushang' : 'Aushänge'}${query || type ? ' gefunden' : ' angeschlagen'}`;
    root.querySelector('[data-role="notice-register-list"]').innerHTML = matches.length ? matches.map((notice, index) => {
      const template = window.TafelZettelConfig.typeById(notice.typ);
      const preview = window.TafelZettelRichText.textPreview(notice.untertitel || notice.text || notice.artikel?.[0]?.text || '', 95);
      return `<button type="button" class="notice-register-entry" data-action="jump-to-notice" data-notice-id="${esc(notice.id)}">
        <span class="notice-register-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
        <span class="notice-register-copy"><small>${esc(template?.label || 'Aushang')}${notice.secret ? ' · Geheim' : ''}</small><strong>${esc(notice.title || template?.label || 'Ohne Titel')}</strong>${preview ? `<span>${esc(preview)}</span>` : ''}</span>
        <span class="notice-register-arrow" aria-hidden="true">›</span>
      </button>`;
    }).join('') : `<p class="notice-register-empty">${query || type ? 'Kein Aushang passt zu dieser Suche.' : 'Noch ist das Brett unbeschrieben.'}</p>`;
  }

  function search(value) {
    query = String(value || '');
    setOpen(true);
    document.getElementById('search-clear').style.display = query ? 'block' : 'none';
    render();
  }

  function clearSearch() {
    query = '';
    document.getElementById('search-inp').value = '';
    document.getElementById('search-clear').style.display = 'none';
    render();
  }

  function init() {
    root = document.getElementById('notice-register');
    if (!root) return;
    setOpen(window.matchMedia('(min-width: 1100px)').matches);
    root.addEventListener('change', event => {
      if (!event.target.matches('[data-role="notice-type-filter"]')) return;
      type = event.target.value;
      render();
    });
    for (const event of ['aleria:tafel:state-applied', 'aleria:tafel:state-saved', 'aleria:tafel:edit-mode']) window.addEventListener(event, render);
    render();
  }

  window.TafelNoticeRegister = Object.freeze({ init, render, search, clearSearch, toggle: () => setOpen(root.hidden) });
})();
