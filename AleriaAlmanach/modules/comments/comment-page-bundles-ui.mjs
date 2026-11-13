// Owns only the bundle dialog DOM. Page policy and persistence remain outside.
export function createCommentPageBundleDialog(actions) {
  let root;
  const find = role => root.querySelector(`[data-page-role="${role}"]`);
  function mount() {
    if (root) return;
    root = document.createElement('div');
    root.id = 'comment-page-bundle-dialog'; root.className = 'comment-page-bundle-overlay';
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-hidden', 'true');
    root.setAttribute('aria-labelledby', 'comment-page-bundle-title'); root.tabIndex = -1;
    root.innerHTML = `<form class="comment-page-bundle-card">
      <header><h2 id="comment-page-bundle-title" data-page-role="heading"></h2><button type="button" data-page-dialog-action="close" aria-label="Schließen">×</button></header>
      <div data-page-role="editor">
        <label class="comment-page-bundle-title-field">Seitentitel<input data-page-role="title" maxlength="120" required autocomplete="off" placeholder="Zum Beispiel: Ankunft am Haupttor"></label>
        <div class="comment-page-bundle-options" data-page-role="options">
          <label><input type="checkbox" data-page-role="include-comment" data-page-option> Diesen Kommentar mit aufnehmen</label>
          <label data-page-role="merge-option"><input type="checkbox" data-page-role="include-bundles" data-page-option> Frühere benannte Seiten mit einbeziehen</label>
        </div>
        <p class="comment-page-bundle-range" data-page-role="range" aria-live="polite"></p>
        <p class="comment-page-bundle-merge" data-page-role="merge-summary"></p>
        <p class="comment-page-bundle-hint">Die vollständigen Kommentare bleiben in ihrer Reihenfolge erhalten. In dieser Megaseite gilt keine Kommentargrenze.</p>
      </div>
      <ul class="comment-page-bundle-list" data-page-role="list"></ul>
      <p class="comment-page-bundle-error" data-page-role="error" role="alert" hidden></p>
      <footer><button type="button" data-page-dialog-action="remove-current" data-page-role="remove" hidden>Bündel auflösen</button><button type="button" data-page-dialog-action="refresh" data-page-role="refresh" hidden>Einteilung aktualisieren</button><span></span><button type="button" data-page-dialog-action="close">Schließen</button><button type="submit" data-page-role="save">Bündeln</button></footer>
    </form>`;
    document.body.append(root);
    root.addEventListener('submit', event => { event.preventDefault(); actions.save(); });
    root.addEventListener('change', event => { if (event.target.matches('[data-page-option]')) actions.optionsChanged(read()); });
    root.addEventListener('click', event => {
      if (event.target === root) { actions.close(); return; }
      const button = event.target.closest('[data-page-dialog-action]'); if (!button) return;
      const action = button.dataset.pageDialogAction;
      if (action === 'close') actions.close();
      if (action === 'refresh') actions.refresh();
      if (action === 'rename') actions.rename(button.dataset.pageId);
      if (action === 'remove') actions.remove(button.dataset.pageId);
      if (action === 'remove-current') actions.remove();
    });
    root.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); actions.close(); } });
  }
  function read() {
    return { title: find('title').value, includeComment: find('include-comment').checked, includeBundles: find('include-bundles').checked };
  }
  function show({ mode, title = '', hasPages = false, pages = [] }) {
    mount(); root.dataset.mode = mode;
    find('heading').textContent = mode === 'manage' ? 'Benannte Seiten' : mode === 'rename' ? 'Seite bearbeiten' : 'Kommentare bündeln';
    find('editor').hidden = mode === 'manage'; find('list').hidden = mode !== 'manage';
    find('title').required = mode !== 'manage'; find('title').value = title;
    find('options').hidden = mode !== 'create'; find('merge-option').hidden = !hasPages;
    find('range').hidden = mode !== 'create';
    find('include-comment').checked = false; find('include-bundles').checked = false;
    find('remove').hidden = mode !== 'rename'; find('save').hidden = mode === 'manage';
    find('save').textContent = mode === 'rename' ? 'Titel speichern' : 'Bündeln';
    find('range').textContent = ''; find('merge-summary').textContent = '';
    error(''); busy(false); renderList(pages);
    if (typeof window.activateDialog === 'function') window.activateDialog(root.id, { initialFocus: mode === 'manage' ? '[data-page-dialog-action="close"]' : '[data-page-role="title"]' });
    else { root.classList.add('active'); root.setAttribute('aria-hidden', 'false'); }
  }
  function renderList(pages) {
    const list = find('list'); list.replaceChildren();
    for (const page of pages) {
      const row = document.createElement('li'), description = document.createElement('div'), title = document.createElement('strong'), count = document.createElement('small');
      title.textContent = page.title; count.textContent = page.count == null ? 'Grenzen prüfen' : `${page.count} ${page.count === 1 ? 'Kommentar' : 'Kommentare'}`;
      description.append(title, count); row.append(description);
      for (const [action, label] of [['rename', 'Umbenennen'], ['remove', 'Auflösen']]) {
        const button = document.createElement('button'); button.type = 'button'; button.textContent = label;
        button.dataset.pageDialogAction = action; button.dataset.pageId = page.id; row.append(button);
      }
      list.append(row);
    }
    if (!pages.length) { const row = document.createElement('li'); row.textContent = 'Noch keine benannten Seiten.'; list.append(row); }
  }
  function plan(value, metadataPages = []) {
    find('merge-option').hidden = !metadataPages.length;
    find('range').textContent = value?.existingPage ? `Dieser Bereich gehört bereits zu „${value.existingPage.title}“.` : value?.count ? `${value.count} ${value.count === 1 ? 'Kommentar wird' : 'Kommentare werden'} auf einer Seite gebündelt.` : 'Davor liegen keine ungebündelten Kommentare. Du kannst den gewählten Kommentar mit aufnehmen.';
    const names = (value?.replaceIds || []).map(id => metadataPages.find(page => page.id === id)?.title).filter(Boolean);
    find('merge-summary').textContent = names.length ? `Diese benannten Seiten werden darin aufgenommen: ${names.join(', ')}.` : '';
    find('save').disabled = !value?.count;
  }
  function busy(value) { root.dataset.busy = String(value); root.querySelectorAll('button:not([data-page-dialog-action="close"]), input').forEach(node => { node.disabled = value; }); }
  function error(message) { find('error').textContent = message; find('error').hidden = !message; find('refresh').hidden = !message; }
  function close() { if (!root) return; if (typeof window.deactivateDialog === 'function') window.deactivateDialog(root.id); else { root.classList.remove('active'); root.setAttribute('aria-hidden', 'true'); } }
  return { show, read, plan, busy, error, close };
}
