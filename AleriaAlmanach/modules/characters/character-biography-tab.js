// Biographie-Tab des Charakterbogens.
// Bettet dieselben Modul-Editor-Bausteine wie eine "Story"-Modulseite mit biographyPage:true
// ein (module-editor-biography.js/module-editor-simple-lines.js), aber innerhalb von
// #char-profile-overlay statt #module-editor-overlay - exakt das Muster aus
// character-inventory-profile.js (doppelter Anker [data-biography-embedded-card], eigener
// auf #cp-biography-editor skopierter Event-Dispatcher). Die Biographie ist ein eigenständiger,
// fünfter Speicherbereich (siehe character-profile.js) - unabhängig von Profil/Bilder/Inventar/
// Kampfdaten.

let _characterBiographyDraft = null;

function getCharacterBiographyProfileSource(char = {}) {
  const source = char.biography && typeof char.biography === 'object' ? char.biography : {};
  return {
    schema: 'aleria.biography-module',
    schemaVersion: 1,
    stats: Array.isArray(source.stats) ? source.stats : [],
    quote: String(source.quote || ''),
    quoteBy: String(source.quoteBy || ''),
    biography: sanitizeBiographyData(source.biography || {})
  };
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

function renderCharacterBiographyEditor() {
  const target = document.getElementById('cp-biography-editor');
  if (!target || typeof buildBiographyModuleEditorFields !== 'function') return;
  const draft = _characterBiographyDraft || getCharacterBiographyProfileSource();
  const pseudoPage = buildCharacterBiographyPseudoPage(draft);
  target.innerHTML = `<div class="character-biography-embedded-editor" data-biography-embedded-card>
    ${buildBiographyModuleEditorFields(pseudoPage)}
  </div>`;
  if (typeof hydrateModuleRichEditors === 'function') hydrateModuleRichEditors(target);
}

function initCharacterBiographyTab(char = {}) {
  _characterBiographyDraft = getCharacterBiographyProfileSource(char);
  renderCharacterBiographyEditor();
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

function handleCharacterBiographyEditorAction(trigger) {
  const action = trigger?.dataset?.moduleEditorAction || '';
  if (!action || !trigger.closest('#cp-biography-editor')) return false;
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

function exportCurrentCharacterBiographyModule() {
  const draft = collectCharacterBiographyData();
  const name = document.getElementById('cp-name')?.value.trim() || '';
  const payload = {
    schema: 'aleria.biography-module',
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    personId: _editingChar || '',
    personName: name,
    biographyModule: {
      schema: 'aleria.biography-module',
      schemaVersion: 1,
      stats: draft.stats,
      quote: draft.quote,
      quoteBy: draft.quoteBy,
      biography: draft.biography
    }
  };
  downloadJsonFile(payload, `${slugify(name || _editingChar || 'charakter')}-biographie.json`);
  showAppStatus('Biographie exportiert.', 'success');
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
      if (parsed?.schema !== 'aleria.biography-module') {
        throw new Error('Keine gültige Biographie-Datei (falsches Schema).');
      }
      const module = parsed.biographyModule && typeof parsed.biographyModule === 'object'
        ? parsed.biographyModule
        : parsed;
      _characterBiographyDraft = {
        schema: 'aleria.biography-module',
        schemaVersion: 1,
        stats: Array.isArray(module.stats) ? module.stats : [],
        quote: String(module.quote || ''),
        quoteBy: String(module.quoteBy || ''),
        biography: sanitizeBiographyData(module.biography || {})
      };
      renderCharacterBiographyEditor();
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
  const trigger = event.target?.closest?.('[data-module-editor-action]');
  if (!trigger?.closest?.('#cp-biography-editor')) return;
  if (handleCharacterBiographyEditorAction(trigger)) {
    event.preventDefault();
    event.stopPropagation();
  }
});

document.addEventListener('input', event => {
  if (handleCharacterBiographyEditorFieldChange(event.target)) {
    event.stopPropagation();
  }
});

document.addEventListener('change', event => {
  if (handleCharacterBiographyEditorFieldChange(event.target)) {
    event.stopPropagation();
  }
});
