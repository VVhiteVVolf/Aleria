// Owns only the bundle dialog DOM. Page policy and persistence remain outside.
import { mountCalendarDatePicker } from '../calendar/calendar-date-picker.mjs';

export function createCommentPageBundleDialog(actions) {
  let root, picker;
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
          <label><input type="checkbox" data-page-role="next-page" data-page-option> Danach eine neue reguläre Seite beginnen</label>
        </div>
        <p class="comment-page-bundle-range" data-page-role="range" aria-live="polite"></p>
        <p class="comment-page-bundle-merge" data-page-role="merge-summary"></p>
        <p class="comment-page-bundle-hint" data-page-role="bundle-hint">Die vollständigen Kommentare bleiben in ihrer Reihenfolge erhalten. In dieser Megaseite gilt keine Kommentargrenze.</p>
      </div>
      <section data-page-role="regular-fields" hidden>
        <label class="comment-page-bundle-title-field" data-page-role="next-title-field">Name der Folgeseite (optional)<input data-page-role="next-title" maxlength="120" autocomplete="off" placeholder="Ohne Namen: Seite 1"></label>
        <label class="comment-page-bundle-check"><input type="checkbox" data-page-role="set-time" data-page-option> Neue Szenenzeit ab dieser Seite (optional)</label>
        <div class="comment-page-bundle-time" data-page-role="time-fields" hidden>
          <div data-page-role="calendar"></div>
          <label class="comment-page-bundle-title-field">Uhrzeit<input type="time" step="1" data-page-role="clock"></label>
        </div>
        <p class="comment-page-bundle-hint">Die Seite bleibt auch ohne Kommentare erreichbar. Ohne neue Zeit läuft die bisherige Szenenzeit weiter.</p>
      </section>
      <section data-page-role="settings" hidden>
        <label class="comment-page-bundle-title-field">Kommentare pro regulärer Seite<input type="number" min="1" max="1000" step="1" data-page-role="page-size"></label>
        <p class="comment-page-bundle-hint">Gilt für diese Szene. Gebündelte Megaseiten bleiben unbegrenzt.</p>
        <button type="button" data-page-dialog-action="new">Neue Seite anlegen</button>
      </section>
      <ul class="comment-page-bundle-list" data-page-role="list"></ul>
      <p class="comment-page-bundle-error" data-page-role="error" role="alert" hidden></p>
      <footer><button type="button" data-page-dialog-action="remove-current" data-page-role="remove" hidden>Bündel auflösen</button><button type="button" data-page-dialog-action="refresh" data-page-role="refresh" hidden>Einteilung aktualisieren</button><span></span><button type="button" data-page-dialog-action="close">Schließen</button><button type="submit" data-page-role="save">Bündeln</button></footer>
    </form>`;
    document.body.append(root);
    root.addEventListener('submit', event => { event.preventDefault(); actions.save(); });
    root.addEventListener('change', event => { if (event.target.matches('[data-page-option]')) { syncFields(); actions.optionsChanged(read()); } });
    root.addEventListener('click', event => {
      if (event.target === root) { actions.close(); return; }
      const button = event.target.closest('[data-page-dialog-action]'); if (!button) return;
      const action = button.dataset.pageDialogAction;
      if (action === 'close') actions.close();
      if (action === 'refresh') actions.refresh();
      if (action === 'rename') actions.rename(button.dataset.pageId);
      if (action === 'regular') actions.regular(button.dataset.pageId, Number(button.dataset.pageNumber));
      if (action === 'new') actions.newPage();
      if (action === 'remove') actions.remove(button.dataset.pageId, button.dataset.pageKind);
      if (action === 'remove-current') actions.remove();
    });
    root.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); actions.close(); } });
  }
  function read() {
    const clock = find('clock').value.split(':').map(Number);
    return { title: find('title').value, includeComment: find('include-comment').checked, includeBundles: find('include-bundles').checked,
      nextPage: find('next-page').checked, regularTitle: root.dataset.mode === 'create' ? find('next-title').value : find('title').value,
      time: find('set-time').checked ? { calendarDate: picker?.getValue(), seconds: clock.length >= 2 ? clock[0] * 3600 + clock[1] * 60 + (clock[2] || 0) : NaN } : null,
      pageSize: Number(find('page-size').value) };
  }
  function syncFields() {
    const regular = root.dataset.mode === 'regular' || root.dataset.mode === 'create' && find('next-page').checked;
    find('regular-fields').hidden = !regular;
    find('time-fields').hidden = !regular || !find('set-time').checked;
    find('clock').required = regular && find('set-time').checked;
  }
  function show({ mode, title = '', hasPages = false, pages = [], pageSize = 75, time = null, defaultTime = null, removable = false, isNew = false }) {
    mount(); root.dataset.mode = mode;
    find('heading').textContent = mode === 'manage' ? 'Seiten verwalten' : mode === 'regular' ? isNew ? 'Neue Seite anlegen' : 'Reguläre Seite bearbeiten' : mode === 'rename' ? 'Seite bearbeiten' : 'Kommentare bündeln';
    find('editor').hidden = mode === 'manage'; find('list').hidden = mode !== 'manage';
    find('title').required = mode === 'create' || mode === 'rename'; find('title').value = title;
    find('title').placeholder = mode === 'regular' ? 'Optional: Name dieser Seite' : 'Zum Beispiel: Ankunft am Haupttor';
    find('options').hidden = mode !== 'create'; find('merge-option').hidden = !hasPages;
    find('range').hidden = mode !== 'create';
    find('include-comment').checked = false; find('include-bundles').checked = false;
    find('next-page').checked = false; find('next-title').value = '';
    find('next-title-field').hidden = mode !== 'create'; find('set-time').checked = !!time;
    find('bundle-hint').hidden = mode !== 'create' && mode !== 'rename';
    find('settings').hidden = mode !== 'manage'; find('page-size').value = pageSize;
    find('page-size').required = mode === 'manage';
    const selectedTime = time || defaultTime;
    const seconds = selectedTime?.seconds || 0;
    find('clock').value = [Math.floor(seconds / 3600), Math.floor(seconds % 3600 / 60), seconds % 60].map(value => String(value).padStart(2, '0')).join(':');
    picker?.destroy();
    if (globalThis.AleriaCalendar) picker = mountCalendarDatePicker(find('calendar'), { value: selectedTime?.calendarDate });
    find('remove').hidden = mode !== 'rename' && !removable;
    find('remove').textContent = mode === 'regular' ? 'Seitengrenze aufheben' : 'Bündel auflösen';
    find('save').hidden = false;
    find('save').textContent = mode === 'manage' ? 'Seitengröße speichern' : mode === 'regular' ? isNew ? 'Seite anlegen' : 'Seite speichern' : mode === 'rename' ? 'Titel speichern' : 'Bündeln';
    find('range').textContent = ''; find('merge-summary').textContent = '';
    error(''); busy(false); renderList(pages); syncFields();
    if (typeof window.activateDialog === 'function') window.activateDialog(root.id, { initialFocus: mode === 'manage' ? '[data-page-role="page-size"]' : '[data-page-role="title"]' });
    else { root.classList.add('active'); root.setAttribute('aria-hidden', 'false'); }
  }
  function renderList(pages) {
    const list = find('list'); list.replaceChildren();
    for (const page of pages) {
      const row = document.createElement('li'), description = document.createElement('div'), title = document.createElement('strong'), count = document.createElement('small');
      title.textContent = page.title || `Seite ${page.label || page.number}`; count.textContent = page.count == null ? 'Grenzen prüfen' : `${page.count} ${page.count === 1 ? 'Kommentar' : 'Kommentare'}${page.kind === 'regular' ? ' · regulär' : ' · gebündelt'}`;
      description.append(title, count); row.append(description);
      const controls = [[page.kind === 'regular' ? 'regular' : 'rename', page.kind === 'regular' ? 'Bearbeiten' : 'Umbenennen']];
      if (page.id) controls.push(['remove', page.kind === 'regular' ? 'Grenze aufheben' : 'Auflösen']);
      for (const [action, label] of controls) {
        const button = document.createElement('button'); button.type = 'button'; button.textContent = label;
        button.dataset.pageDialogAction = action; button.dataset.pageId = page.id || ''; button.dataset.pageKind = page.kind || 'bundle'; button.dataset.pageNumber = page.number || ''; row.append(button);
      }
      list.append(row);
    }
    if (!pages.length) { const row = document.createElement('li'); row.textContent = 'Noch keine Kommentare.'; list.append(row); }
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
