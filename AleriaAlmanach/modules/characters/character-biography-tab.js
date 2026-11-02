// Biographie-Tab des Charakterbogens.
//
// Drei Zustände statt eines Dauer-Editors:
//   - leer:        noch keine Biographie vorhanden -> Hinweis + "Biographie anlegen"/"...importieren"
//   - Ansicht:      Biographie vorhanden, nicht in Bearbeitung -> rendert wie ein fertiges Bio-Modul
//                    (dieselbe Optik wie ein "biographyPage"-Modul, siehe module-renderer.js#buildBiographyPage)
//   - Bearbeitung:  Formular + Live-Vorschau nebeneinander, optional maximiertes Fenster
// Bettet dieselben Modul-Editor-Bausteine wie eine "Story"-Modulseite mit biographyPage:true
// ein (module-editor-biography.js/module-editor-simple-lines.js), aber innerhalb von
// #char-profile-overlay statt #module-editor-overlay - exakt das Muster aus
// character-inventory-profile.js (doppelter Anker [data-biography-embedded-card], eigener
// auf #cp-biography-editor skopierter Event-Dispatcher). Die Biographie ist ein eigenständiger,
// fünfter Speicherbereich (siehe character-profile.js) - unabhängig von Profil/Bilder/Inventar/
// Kampfdaten.

let _characterBiographyDraft = null;
let _characterBiographyEditMode = false;
let _characterBiographyMaximized = false;

// Firestore speichert stats-Zeilen als {label, value}-Objekte (sanitizeCharacterBiographyForFirestore
// in character-save-guard.js, da Firestore keine Arrays-in-Arrays erlaubt). Rendering/Editor hier
// erwarten weiterhin [label, wert]-Paare, deshalb hier wieder zurückwandeln.
function normalizeCharacterBiographyStats(stats) {
  return Array.isArray(stats)
    ? stats.map(item => (Array.isArray(item)
        ? [String(item[0] ?? ''), String(item[1] ?? '')]
        : [String(item?.label ?? ''), String(item?.value ?? '')]))
    : [];
}

function getCharacterBiographyProfileSource(char = {}) {
  const stored = char.biography && typeof char.biography === 'object' ? char.biography : null;
  const source = globalThis.AleriaBiographyCatalog?.resolve(stored, {
    characterId: char.id, worldPersonId: char.identity?.worldPersonId || char.genealogy?.worldPersonId
  }) || stored || {};
  return {
    schema: 'aleria.biography-module',
    schemaVersion: 1,
    stats: normalizeCharacterBiographyStats(source.stats),
    quote: String(source.quote || ''),
    quoteBy: String(source.quoteBy || ''),
    biography: sanitizeBiographyData(source.biography || {})
  };
}

function isCharacterBiographyEmpty(draft) {
  const bio = draft?.biography || {};
  return !String(draft?.quote || '').trim()
    && !String(bio.portrait || '').trim()
    && !(bio.portraitStages || []).some(Boolean)
    && !String(bio.biographyText || '').trim()
    && !String(bio.historyText || '').trim()
    && !(draft?.stats || []).length
    && !(bio.abilities || []).length
    && !(bio.knightMentors || []).length
    && !(bio.connections || []).length
    && !(bio.works || []).length
    && !(bio.trivia || []).length
    && !(bio.quotes || []).length
    && !(bio.documents || []).length
    && !(bio.extraSections || []).length;
}

function buildCharacterBiographyPseudoPage(draft) {
  // Bildet den Charakter-Biographie-Entwurf auf die "Seite" ab, die
  // buildBiographyModuleEditorFields()/collectBiographyModuleEditorPage() erwarten.
  // imageTabs bleibt bewusst weg - der Portraitstufen-Fallback aus Modul-Bildreitern ergibt
  // fuer eine Person keinen Sinn.
  return {
    biographyPage: true,
    stats: draft.stats,
    quote: draft.quote,
    quoteBy: draft.quoteBy,
    biography: draft.biography
  };
}

function getCharacterBiographyEntryMeta() {
  const name = document.getElementById('cp-name')?.value.trim() || '';
  const portraitImg = document.getElementById('cp-portrait-img');
  const portrait = portraitImg && portraitImg.style.display !== 'none' ? (portraitImg.getAttribute('src') || '') : '';
  return { title: name, image: portrait };
}

// Character sheets use the same stateless page renderer as modules and the
// family tree; their edit state and persistence stay within this feature.
function buildCharacterBiographyReadView(page, entry) {
  return buildBiographyReadView(page, entry);
}

function renderCharacterBiographyEmptyState(target) {
  const name = document.getElementById('cp-name')?.value.trim() || 'diesen Charakter';
  target.innerHTML = `
    <div class="cp-biography-empty">
      <span class="cp-biography-empty-icon" aria-hidden="true">&#10022;</span>
      <h3>Noch keine Biographie angelegt</h3>
      <p>Für ${escapeHtml(name)} wurde bislang keine Biographie erstellt.</p>
      <div class="cp-biography-empty-actions">
        <button class="char-save-btn" type="button" data-cp-biography-action="create">Biographie anlegen</button>
        <button class="comment-btn-cancel" type="button" data-cp-biography-action="import">Biographie importieren</button>
      </div>
    </div>`;
}

function renderCharacterBiographyReadOnlyState(target, draft) {
  const pseudoPage = buildCharacterBiographyPseudoPage(draft);
  const entry = getCharacterBiographyEntryMeta();
  target.innerHTML = `
    <div class="cp-biography-view">
      <div class="cp-biography-view-toolbar">
        <button class="char-save-btn" type="button" data-cp-biography-action="edit">&#9998; Bearbeiten</button>
      </div>
      <div class="cp-biography-view-render">
        ${buildCharacterBiographyReadView(pseudoPage, entry)}
      </div>
    </div>`;
}

function renderCharacterBiographyEditorView(target, draft) {
  const pseudoPage = buildCharacterBiographyPseudoPage(draft);
  const entry = getCharacterBiographyEntryMeta();
  target.innerHTML = `
    <div class="cp-biography-edit">
      <div class="cp-biography-edit-toolbar">
        <button class="comment-btn-cancel cp-biography-mobile-preview-toggle" type="button" data-cp-biography-action="toggle-preview" aria-expanded="false">Vorschau anzeigen</button>
        <button class="comment-btn-cancel" type="button" data-cp-biography-action="toggle-maximize">${_characterBiographyMaximized ? '⤡ Verkleinern' : '⤢ Vergrößern'}</button>
        <button class="char-save-btn" type="button" data-cp-biography-action="finish">✓ Fertig</button>
      </div>
      <div class="cp-biography-edit-body">
        <div class="cp-biography-edit-preview" id="cp-biography-preview">
          ${buildCharacterBiographyReadView(pseudoPage, entry)}
        </div>
        <div class="cp-biography-edit-divider" role="separator" aria-orientation="vertical">
          <span>Live-Vorschau</span><span>Bearbeitung</span>
        </div>
        <div class="cp-biography-edit-form character-biography-embedded-editor" data-biography-embedded-card>
          ${buildBiographyModuleEditorFields(pseudoPage)}
        </div>
      </div>
    </div>`;
  if (typeof hydrateModuleRichEditors === 'function') hydrateModuleRichEditors(target);
}

function syncCharacterBiographyMaximizedClass() {
  const card = document.querySelector('#char-profile-overlay .char-profile-card');
  if (!card) return;
  card.classList.toggle('cp-biography-maximized', _characterBiographyEditMode && _characterBiographyMaximized);
}

function renderCharacterBiographyPanel() {
  const target = document.getElementById('cp-biography-editor');
  if (!target) return;
  const draft = _characterBiographyDraft || getCharacterBiographyProfileSource();
  if (_characterBiographyEditMode) {
    renderCharacterBiographyEditorView(target, draft);
  } else if (isCharacterBiographyEmpty(draft)) {
    renderCharacterBiographyEmptyState(target);
  } else {
    renderCharacterBiographyReadOnlyState(target, draft);
  }
  syncCharacterBiographyMaximizedClass();
}

function refreshCharacterBiographyLivePreview() {
  if (!_characterBiographyEditMode) return;
  const preview = document.getElementById('cp-biography-preview');
  const card = document.querySelector('#cp-biography-editor [data-biography-embedded-card]');
  if (!preview || !card || typeof collectBiographyModuleEditorPage !== 'function') return;
  const page = collectBiographyModuleEditorPage(card, {});
  const pseudoPage = { stats: page.stats, quote: page.quote, quoteBy: page.quoteBy, biography: page.biography };
  preview.innerHTML = buildCharacterBiographyReadView(pseudoPage, getCharacterBiographyEntryMeta());
}

function initCharacterBiographyTab(char = {}, options = {}) {
  _characterBiographyDraft = getCharacterBiographyProfileSource(char);
  _characterBiographyEditMode = false;
  _characterBiographyMaximized = false;
  if (options.render !== false) renderCharacterBiographyPanel();
}

function collectCharacterBiographyData() {
  const card = document.querySelector('#cp-biography-editor [data-biography-embedded-card]');
  if (!card || typeof collectBiographyModuleEditorPage !== 'function') {
    return _characterBiographyDraft || getCharacterBiographyProfileSource();
  }
  const page = collectBiographyModuleEditorPage(card, {});
  _characterBiographyDraft = {
    schema: 'aleria.biography-module',
    schemaVersion: 1,
    stats: Array.isArray(page.stats) ? page.stats : [],
    quote: String(page.quote || ''),
    quoteBy: String(page.quoteBy || ''),
    biography: page.biography
  };
  return _characterBiographyDraft;
}

function createCharacterBiographyFromExisting() {
  const name = document.getElementById('cp-name')?.value.trim() || '';
  const title = document.getElementById('cp-title')?.value.trim() || '';
  const houseName = document.getElementById('cp-genealogy-house')?.value.trim()
    || document.getElementById('cp-fraktion')?.value.trim() || '';
  const birth = document.getElementById('cp-genealogy-birth')?.value.trim() || '';
  const death = document.getElementById('cp-genealogy-death')?.value.trim() || '';
  const sexValue = document.getElementById('cp-genealogy-sex')?.value || '';
  const sexLabel = sexValue === 'female' ? 'Weiblich' : sexValue === 'male' ? 'Männlich' : 'Unbekannt';
  _characterBiographyDraft = {
    schema: 'aleria.biography-module',
    schemaVersion: 1,
    stats: [
      ['Vollständiger Name', name],
      ['Haus', houseName],
      ['Titel / Anrede', title],
      ['Geboren', birth],
      ['Geburtsort', ''],
      ['Gestorben', death || 'Lebend'],
      ['Geschlecht', sexLabel],
      ['Familienstand', ''],
      ['Rang / Stand', ''],
      ['Tätigkeit', ''],
      ['Wohnsitz', '']
    ],
    quote: '',
    quoteBy: '',
    biography: sanitizeBiographyData({ footer: name ? `Personenakte · ${name}` : '' })
  };
  _characterBiographyEditMode = true;
  renderCharacterBiographyPanel();
}

function editCharacterBiography() {
  _characterBiographyEditMode = true;
  renderCharacterBiographyPanel();
}

function finishCharacterBiographyEditing() {
  collectCharacterBiographyData();
  _characterBiographyEditMode = false;
  _characterBiographyMaximized = false;
  renderCharacterBiographyPanel();
}

function toggleCharacterBiographyMaximize() {
  collectCharacterBiographyData();
  _characterBiographyMaximized = !_characterBiographyMaximized;
  renderCharacterBiographyPanel();
}

function handleCharacterBiographyPanelAction(trigger) {
  const action = trigger?.dataset?.cpBiographyAction || '';
  if (!action || !trigger.closest('#cp-biography-editor')) return false;
  if (action === 'toggle-preview') {
    const edit = trigger.closest('.cp-biography-edit');
    const visible = edit.classList.toggle('is-preview-visible');
    trigger.setAttribute('aria-expanded', String(visible));
    trigger.textContent = visible ? 'Zur Bearbeitung' : 'Vorschau anzeigen';
    return true;
  }
  if (action === 'create') return createCharacterBiographyFromExisting(), true;
  if (action === 'edit') return editCharacterBiography(), true;
  if (action === 'finish') return finishCharacterBiographyEditing(), true;
  if (action === 'toggle-maximize') return toggleCharacterBiographyMaximize(), true;
  if (action === 'import') return openCurrentCharacterBiographyImportFilePicker(), true;
  return false;
}

function handleCharacterBiographyEditorAction(trigger) {
  const action = trigger?.dataset?.moduleEditorAction || '';
  if (!action || !trigger.closest('#cp-biography-editor')) return false;
  if (action === 'add-biography-mentor-row' || action === 'remove-biography-mentor-row') return editModuleBiographyMentorRow(trigger, action === 'remove-biography-mentor-row'), true;
  if (action === 'add-biography-stat-row') return addModuleBiographyStatRow(trigger), true;
  if (action === 'remove-biography-stat-row') return removeModuleBiographyStatRow(trigger), true;
  if (action === 'add-biography-ability-row') return addModuleBiographyAbilityRow(trigger), true;
  if (action === 'remove-biography-ability-row') return removeModuleBiographyAbilityRow(trigger), true;
  if (action === 'pick-biography-ability-icon') return openBiographyAbilityIconPicker(trigger), true;
  if (action === 'pick-biography-document-icon') return openBiographyDocumentIconPicker(trigger), true;
  if (action === 'add-biography-section-row') {
    return addModuleBiographySectionRow(trigger, trigger.dataset.biographySectionPosition || 'afterIntro'), true;
  }
  if (action === 'remove-biography-section-row') return removeModuleBiographySectionRow(trigger), true;
  if (action === 'add-biography-connection-row') return addModuleBiographyConnectionRow(trigger), true;
  if (action === 'remove-biography-connection-row') return removeModuleBiographyConnectionRow(trigger), true;
  if (action === 'add-biography-document-row') return addModuleBiographyDocumentRow(trigger), true;
  if (action === 'remove-biography-document-row') return removeModuleBiographyDocumentRow(trigger), true;
  if (action === 'add-simple-line-row') return addModuleSimpleLineRow(trigger, trigger.dataset.simpleLineList || ''), true;
  if (action === 'remove-simple-line-row') return removeModuleSimpleLineRow(trigger), true;
  if (action === 'sync-json-preview') {
    if (typeof syncModuleJsonPreview === 'function') syncModuleJsonPreview();
    return true;
  }
  return false;
}

function handleCharacterBiographyEditorFieldChange(field) {
  if (!field?.closest?.('#cp-biography-editor')) return false;
  const action = field.dataset?.moduleEditorAction || '';
  if (action === 'sync-json-preview') {
    if (typeof syncModuleJsonPreview === 'function') syncModuleJsonPreview();
    return true;
  }
  if (action === 'update-range-percent-label') {
    const label = field.closest('.module-editor-field')?.querySelector('label span');
    if (label) label.textContent = `${field.value}px`;
    if (typeof syncModuleJsonPreview === 'function') syncModuleJsonPreview();
    return true;
  }
  return false;
}

async function exportCurrentCharacterBiographyModule() {
  const draft = collectCharacterBiographyData();
  const name = document.getElementById('cp-name')?.value.trim() || '';
  const personId = _editingChar || '';
  const portrait = draft.biography.portrait || getCharacterBiographyEntryMeta().image;
  try {
    const { buildBiographyExportPayload } = await import('../../../js/biography/biography-transfer.mjs');
    const payload = buildBiographyExportPayload({
      personId,
      personName: name,
      biographyModule: { ...draft, biography: { ...draft.biography, portrait } },
      baseUrl: document.baseURI
    });
    downloadJsonFile(payload, `${slugify(name || personId || 'charakter')}-biographie.json`);
    showAppStatus('Biographie exportiert.', 'success');
  } catch (error) {
    showAppStatus(error.message || 'Biographie konnte nicht exportiert werden.', 'error');
  }
}

function openCurrentCharacterBiographyImportFilePicker() {
  const status = document.getElementById('cp-save-status');
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const { parseBiographyImportPayload } = await import('../../../js/biography/biography-transfer.mjs');
      const module = parseBiographyImportPayload(parsed);
      _characterBiographyDraft = {
        schema: 'aleria.biography-module',
        schemaVersion: 1,
        stats: normalizeCharacterBiographyStats(module.stats),
        quote: String(module.quote || ''),
        quoteBy: String(module.quoteBy || ''),
        biography: sanitizeBiographyData(module.biography || {})
      };
      _characterBiographyEditMode = true;
      renderCharacterBiographyPanel();
      if (status) {
        status.style.color = 'var(--gold)';
        status.textContent = 'Biographie importiert – bitte anschließend Speichern klicken.';
      }
    } catch (error) {
      if (status) {
        status.style.color = 'var(--red-wax)';
        status.textContent = error.message || 'Biographie-Datei konnte nicht importiert werden.';
      }
    }
  }, { once: true });
  input.click();
}

document.addEventListener('click', event => {
  const moduleTrigger = event.target?.closest?.('[data-module-editor-action]');
  if (moduleTrigger?.closest?.('#cp-biography-editor')) {
    if (handleCharacterBiographyEditorAction(moduleTrigger)) {
      event.preventDefault();
      event.stopPropagation();
      refreshCharacterBiographyLivePreview();
      return;
    }
  }
  const panelTrigger = event.target?.closest?.('[data-cp-biography-action]');
  if (panelTrigger?.closest?.('#cp-biography-editor')) {
    if (handleCharacterBiographyPanelAction(panelTrigger)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
});

document.addEventListener('input', event => {
  if (!event.target?.closest?.('#cp-biography-editor')) return;
  handleCharacterBiographyEditorFieldChange(event.target);
  refreshCharacterBiographyLivePreview();
  event.stopPropagation();
});

document.addEventListener('change', event => {
  if (!event.target?.closest?.('#cp-biography-editor')) return;
  handleCharacterBiographyEditorFieldChange(event.target);
  refreshCharacterBiographyLivePreview();
  event.stopPropagation();
});
