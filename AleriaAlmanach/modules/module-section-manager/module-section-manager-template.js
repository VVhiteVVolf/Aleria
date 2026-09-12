function ensureModuleSectionManagerDialog() {
  let overlay = document.getElementById('module-section-manager-overlay');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'module-section-manager-overlay';
  overlay.className = 'module-section-manager-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('aria-labelledby', 'module-section-manager-title');
  overlay.setAttribute('tabindex', '-1');
  overlay.innerHTML = `
    <div class="module-section-manager-card">
      <header class="module-section-manager-head">
        <div class="msm-heading">
          <span class="msm-emblem" aria-hidden="true">▤</span>
          <div><div class="module-section-manager-kicker">Archivstruktur · Verwaltung</div>
            <h2 id="module-section-manager-title">Module & Bereiche</h2>
            <p>Ordnen. Wiederfinden. Das Archiv gestalten.</p>
          </div>
        </div>
        <div class="msm-head-actions">
          <span id="msm-overview" class="msm-overview"></span>
          <button type="button" data-section-manager-action="show-import">Importieren</button>
          <button type="button" class="primary" data-section-manager-action="show-create">+ Bereich anlegen</button>
          <button class="module-section-manager-close" type="button" data-section-manager-action="close" aria-label="Verwaltung schließen">×</button>
        </div>
      </header>
      <div class="module-section-manager-body">
        <nav class="msm-sidebar" aria-label="Archivbereiche">
          <div class="msm-sidebar-head">
            <div class="msm-panel-heading"><h3>Bereiche</h3><span id="msm-section-count"></span></div>
            <input id="msm-section-filter" type="search" placeholder="Bereich finden …" aria-label="Bereiche durchsuchen" data-section-manager-field="section-filter">
            <div class="module-section-manager-tree-actions">
              <button type="button" data-section-manager-action="expand-all-sections">Alle ausklappen</button>
              <button type="button" data-section-manager-action="collapse-all-sections">Einklappen</button>
            </div>
            <button id="msm-all-sections" class="msm-all-sections" type="button" data-section-manager-action="select-section" data-section-signature="">
              <span aria-hidden="true">▦</span><strong>Alle Module</strong><span id="msm-all-count" class="msm-count"></span>
            </button>
          </div>
          <div id="msm-section-list" class="module-section-manager-section-list"></div>
          <div class="msm-sidebar-foot">Bereich wählen, Module rechts verwalten.</div>
        </nav>
        <main class="msm-workspace" aria-label="Module verwalten">
          <div class="msm-workspace-head">
            <div id="msm-breadcrumb" class="msm-breadcrumb"></div>
            <div class="msm-context-row">
              <div><h3 id="msm-context-title">Alle Module</h3><p id="msm-context-description"></p></div>
              <div id="msm-context-actions" class="msm-context-actions" hidden>
                <button type="button" data-section-manager-action="edit-active-section">Bereich bearbeiten</button>
                <button type="button" data-section-manager-action="add-active-child">+ Unterbereich</button>
              </div>
            </div>
            <div class="msm-filters">
              <label class="msm-search"><span>Module durchsuchen</span><input id="msm-module-filter" type="search" placeholder="Titel, ID oder Bereich suchen …" data-section-manager-field="filter"></label>
              <label><span>Modultyp</span><select id="msm-type-filter" data-section-manager-view="type"><option value="">Alle Typen</option></select></label>
              <label><span>Ansicht sortieren</span><select id="msm-sort" data-section-manager-view="sort"><option value="title-asc">Titel A–Z</option><option value="title-desc">Titel Z–A</option><option value="section">Bereich, dann Titel</option><option value="type">Typ, dann Titel</option></select></label>
            </div>
            <div class="msm-list-options">
              <label id="msm-descendants-label"><input id="msm-include-descendants" type="checkbox" data-section-manager-view="descendants" checked> Unterbereiche einbeziehen</label>
              <label><input id="msm-selected-only" type="checkbox" data-section-manager-view="selectedOnly"> Nur ausgewählte</label>
              <button id="msm-reset-filters" type="button" data-section-manager-action="reset-filters" hidden>Filter zurücksetzen</button>
              <span id="msm-result-count" role="status"></span>
            </div>
          </div>
          <div class="msm-table-heading">
            <input type="checkbox" id="msm-module-select-all" aria-label="Alle sichtbaren Module auswählen">
            <span>Modul</span><span>Bereich</span><span>Typ</span><span class="msm-align-end">Aktion</span>
          </div>
          <div id="msm-module-list" class="module-section-manager-module-list"></div>
          <div id="msm-module-bulk-bar" class="module-section-manager-bulk-bar" hidden>
            <div class="msm-selection-summary"><strong id="msm-module-bulk-count"></strong><button type="button" data-section-manager-action="clear-module-selection">Auswahl aufheben</button></div>
            <label class="msm-bulk-target"><span>Auswahl verschieben nach</span><select id="msm-module-bulk-target" aria-label="Zielbereich für Auswahl"></select></label>
            <button type="button" class="primary" data-section-manager-action="bulk-move-modules">Verschieben</button>
            <button type="button" class="danger" data-section-manager-action="bulk-delete-modules">Löschen</button>
          </div>
        </main>
        <aside id="msm-inspector" class="msm-inspector" aria-label="Bereichsverwaltung" hidden>
          <section class="module-section-manager-panel" data-manager-panel="create" hidden>
            <div class="msm-panel-heading"><h3>Bereich anlegen</h3><button type="button" data-section-manager-action="close-inspector" aria-label="Bereich anlegen schließen">×</button></div>
            <p class="module-section-manager-help">Neue Struktur für dein Archiv. Unterbereiche werden einem Hauptreiter zugeordnet.</p>
            <div class="module-section-manager-form">
              <fieldset class="module-section-manager-mode" aria-label="Art des neuen Bereichs">
                <label><input type="radio" name="msm-create-mode" value="root" data-section-manager-action="set-create-mode"><span>Hauptreiter</span><small>Oberste Kategorie</small></label>
                <label><input type="radio" name="msm-create-mode" value="child" data-section-manager-action="set-create-mode"><span>Unterreiter</span><small>Innerhalb einer Kategorie</small></label>
              </fieldset>
              <label><span>Hauptreiter</span><input id="msm-tab" type="text" list="msm-tab-options" placeholder="z. B. Magie" data-section-manager-field="tab"><datalist id="msm-tab-options"></datalist></label>
              <label><span>Pfad des Unterbereichs</span><input id="msm-path" type="text" placeholder="z. B. Akademien > Nordturm" data-section-manager-field="path"><small>Mehrere Ebenen mit &gt; trennen.</small></label>
              <label><span>Beschreibung</span><input id="msm-desc" type="text" placeholder="Worum geht es in diesem Bereich?" data-section-manager-field="desc"></label>
              <label><span>Icon · URL oder Pfad</span><span class="module-section-icon-picker-row"><input id="msm-icon" type="text" placeholder="../IconOrdner/…" data-section-manager-field="icon"><button type="button" data-section-manager-action="open-icon-directory">Auswählen</button></span></label>
              <div class="module-section-manager-actions"><button type="button" data-section-manager-action="clear-form">Leeren</button><button type="button" class="primary" data-section-manager-action="save-section">Bereich speichern</button></div>
            </div>
          </section>
          <section class="module-section-manager-panel module-section-import-panel" data-manager-panel="import" hidden>
            <div class="msm-panel-heading"><h3>Module importieren</h3><button type="button" data-section-manager-action="close-inspector" aria-label="Import schließen">×</button></div>
            <p class="module-section-manager-help">Moduldatei auswählen und direkt im passenden Bereich ablegen.</p>
            <div class="module-section-manager-form">
              <label><span>Zielbereich</span><select id="msm-import-target"></select></label>
              <label><span>Neuer Titel (optional)</span><input id="msm-import-title" type="text" placeholder="Titel aus der Datei übernehmen"></label>
              <label><span>Neue Modul-ID (optional)</span><input id="msm-import-id" type="text" placeholder="ID aus der Datei übernehmen"></label>
              <label class="msm-file-field"><span>Moduldatei auswählen</span><input id="msm-module-import-file" type="file" accept=".json,application/json" data-section-manager-action="import-module-file"><small>JSON · Einzelmodul oder Modulpaket</small></label>
              <p class="module-section-manager-help">Der Import wird vor dem Speichern bestätigt. Eine bestehende Modul-ID kann den bisherigen Inhalt ersetzen.</p>
            </div>
          </section>
          <section class="module-section-manager-panel module-section-editor-panel" data-manager-panel="edit" data-section-editor-panel hidden>
            <div class="msm-panel-heading"><h3>Bereich bearbeiten</h3><button type="button" data-section-manager-action="close-section-editor" aria-label="Bearbeitung schließen">×</button></div>
            <div class="module-section-editor-summary" data-section-editor-summary></div>
            <div class="module-section-editor-form">
              <label><span>Reitername</span><input id="msm-edit-title" type="text" data-section-editor-field="title"></label>
              <label><span>Beschreibung</span><input id="msm-edit-desc" type="text" data-section-editor-field="desc"></label>
              <label><span>Icon · URL oder Pfad</span><span class="module-section-icon-picker-row"><input id="msm-edit-icon" type="text" placeholder="../IconOrdner/…" data-section-editor-field="icon"><button type="button" data-section-manager-action="open-icon-directory">Auswählen</button></span></label>
              <button type="button" class="primary" data-section-manager-action="save-section-editor">Änderungen speichern</button>
              <div class="msm-form-divider"></div>
              <label><span>Neuer Unterbereich</span><input id="msm-edit-child-title" type="text" placeholder="Name des Unterbereichs" data-section-editor-field="child-title"></label>
              <button type="button" data-section-manager-action="create-child-from-editor">+ Unterbereich anlegen</button>
              <div class="msm-form-divider"></div>
              <label><span>Bereich verschieben unter</span><select id="msm-edit-parent" class="module-section-manager-parent-select"></select></label>
              <button type="button" data-section-manager-action="apply-section-parent">Bereich verschieben</button>
              <p class="module-section-manager-help">Unterbereiche und Module ziehen mit. Verschieben ist innerhalb desselben Hauptreiters möglich.</p>
              <div class="msm-form-divider"></div>
              <button type="button" class="danger" data-section-manager-action="release-section-editor">Bereich lösen …</button>
              <p class="module-section-manager-help">Enthaltene Module werden in den Auffangbereich „Void“ verschoben.</p>
            </div>
          </section>
        </aside>
      </div>
      <footer class="msm-footer"><span id="module-section-manager-status" class="module-section-manager-status" role="status" aria-live="polite"></span><span>Sortierung gilt für diese Ansicht.</span></footer>
    </div>`;
  overlay.addEventListener('click', handleModuleSectionManagerClick);
  overlay.addEventListener('change', handleModuleSectionManagerChange);
  overlay.addEventListener('input', handleModuleSectionManagerInput);
  overlay.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || getTopActiveDialog() !== overlay) return;
    event.preventDefault();
    event.stopPropagation();
    if (!document.getElementById('msm-inspector').hidden) {
      closeModuleSectionEditor();
      moduleSectionManagerView.showPanel('');
    } else closeModuleSectionManager();
  });
  document.body.appendChild(overlay);
  return overlay;
}
