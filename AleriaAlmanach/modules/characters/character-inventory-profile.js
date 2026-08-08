let _characterInventoryDraft = null;
let _characterInventoryEditMode = false;

function getDefaultCharacterInventoryProfileItems() {
  return [
    { category: 'weapon', icon: '*', name: 'Hauptwaffe', type: 'Waffe', description: 'Beschreibe Material, Zustand und besondere Merkmale.', weight: 'Noch festlegen', quantity: '1' },
    { category: 'armor', icon: '*', name: 'Rüstung / Schutz', type: 'Rüstung', description: 'Rüstung, Kleidung oder magischer Schutz.', weight: 'Noch festlegen', quantity: '1' },
    { category: 'equipment', icon: '*', name: 'Reiseausrüstung', type: 'Ausrüstung', description: 'Werkzeuge, Vorrat oder nützliche Gegenstände.', weight: 'Noch festlegen', quantity: '1' },
    { category: 'potions', icon: '*', name: 'Heil- oder Verbrauchsgut', type: 'Trinktur', description: 'Trank, Verband, Fokus oder anderer aufbrauchbarer Gegenstand.', weight: 'Noch festlegen', quantity: '1' },
    { category: 'documents', icon: '*', name: 'Dokumente / Urkunden', type: 'Dokument', description: 'Passierschein, Brief, Vertrag, Siegel oder Lizenz.', weight: 'Noch festlegen', quantity: '1' },
    { category: 'other', icon: '*', name: 'Persönlicher Gegenstand', type: 'Sonstiges', description: 'Erbstück, Andenken, Siegel oder wichtiger Besitz.', weight: 'Noch festlegen', quantity: '1' }
  ];
}

function getDefaultCharacterInventoryProfileCompanions() {
  return [
    { name: 'Reittier / Gefährte', species: 'Tier oder Begleiter', role: 'Begleiter', summary: 'Kurzbeschreibung des Gefährten.', status: 'Gesund' },
    { name: 'Treuer Begleiter', species: 'Tier / Person', role: 'Gefährte', summary: 'Besonderheit, Nutzen oder Bindung.', status: 'Noch festlegen' }
  ];
}

function createCharacterInventoryDataFromCharacter(char = {}) {
  return sanitizeCharacterInventoryData({
    characterId: char.id || _editingChar || '',
    title: 'Charakter-Inventar',
    subtitle: 'Ausrüstung, Gegenstände und Gefährten verwalten',
    portrait: char.portrait || '',
    name: char.name || 'Name des Charakters',
    role: char.title || char.fraktion || 'Rolle',
    level: char.fraktion || '',
    status: 'Gesund',
    hitpoints: 'TP / Zustand',
    money: '0 Gold, 0 Silber, 0 Kupfer',
    moneyState: { gold: 0, silver: 0, copper: 0, totalCopper: 0 },
    carryLabel: 'Traglast',
    carryValue: 'Noch festlegen',
    showInfoTable: false,
    infoRows: [
      { icon: '*', label: 'Status', value: 'Gesund' },
      { icon: '*', label: 'TP / Zustand', value: 'Noch festlegen' },
      { icon: '*', label: 'Geld', value: 'Noch festlegen' },
      { icon: '*', label: 'Tragkapazität', value: 'Noch festlegen' },
      { icon: '*', label: 'Rolle', value: char.title || 'Noch festlegen' },
      { icon: '*', label: 'Fraktion', value: char.fraktion || 'Noch festlegen' },
      { icon: '*', label: 'Aufenthalt', value: 'Noch festlegen' },
      { icon: '*', label: 'Notiz', value: 'Noch festlegen' }
    ],
    items: getDefaultCharacterInventoryProfileItems(),
    companions: getDefaultCharacterInventoryProfileCompanions()
  });
}

function getCharacterInventoryProfileSource(char = {}) {
  if (char.inventory && typeof char.inventory === 'object') {
    return sanitizeCharacterInventoryData({
      ...char.inventory,
      characterId: char.inventory.characterId || char.id || _editingChar || '',
      portrait: char.inventory.portrait || char.portrait || '',
      name: char.inventory.name || char.name || 'Name des Charakters',
      role: char.inventory.role || char.title || char.fraktion || 'Rolle'
    });
  }
  return createCharacterInventoryDataFromCharacter(char);
}

function renderCharacterInventoryProfileView(target, data) {
  target.innerHTML = `
    <div class="cp-inventory-view">
      ${buildCharacterInventoryPage({ characterInventoryPage: true, characterInventory: data, characterInventoryReadOnly: true, hideNav: true }, {}, 0, 1)}
    </div>`;
}

function setCharacterInventoryProfileMode(editing = false) {
  _characterInventoryEditMode = !!editing;
  const panel = document.querySelector('.cp-inventory-panel');
  if (panel) panel.classList.toggle('editing', _characterInventoryEditMode);
}

function renderCharacterInventoryProfileEditor() {
  const target = document.getElementById('cp-inventory-editor');
  if (!target) return;
  const data = sanitizeCharacterInventoryData(_characterInventoryDraft || {});
  if (_characterInventoryEditMode) {
    if (typeof buildCharacterInventoryEmbeddedEditorMarkup !== 'function') return;
    target.innerHTML = buildCharacterInventoryEmbeddedEditorMarkup(data);
    return;
  }
  renderCharacterInventoryProfileView(target, data);
}

function handleCharacterInventoryProfileEditorAction(trigger) {
  const action = trigger?.dataset?.moduleEditorAction || '';
  if (!action || !trigger.closest('#cp-inventory-editor')) return false;
  if (action === 'add-ci-row') return addCharacterInventoryRow(trigger), true;
  if (action === 'remove-ci-row') return removeCharacterInventoryRow(trigger), true;
  if (action === 'add-ci-attribute') return addCharacterInventoryAttribute(trigger), true;
  if (action === 'remove-ci-attribute') return removeCharacterInventoryAttribute(trigger), true;
  if (action === 'add-ci-category') return addCharacterInventoryCategory(trigger), true;
  if (action === 'remove-ci-category') return removeCharacterInventoryCategory(trigger), true;
  if (action === 'add-ci-item') return addCharacterInventoryItem(trigger), true;
  if (action === 'add-ci-item-from-register') return addCharacterInventoryItemFromRegister(trigger), true;
  if (action === 'remove-ci-item') return removeCharacterInventoryItem(trigger), true;
  if (action === 'move-ci-item') return moveCharacterInventoryItem(trigger), true;
  if (action === 'duplicate-ci-item') return duplicateCharacterInventoryItem(trigger), true;
  if (action === 'add-ci-item-row') return addCharacterInventoryNestedRow(trigger, 'item'), true;
  if (action === 'add-ci-item-attribute') return addCharacterInventoryNestedAttribute(trigger, 'item'), true;
  if (action === 'add-ci-companion') return addCharacterInventoryCompanion(trigger), true;
  if (action === 'remove-ci-companion') return removeCharacterInventoryCompanion(trigger), true;
  if (action === 'move-ci-companion') return moveCharacterInventoryCompanion(trigger), true;
  if (action === 'duplicate-ci-companion') return duplicateCharacterInventoryCompanion(trigger), true;
  if (action === 'add-ci-companion-row') return addCharacterInventoryNestedRow(trigger, 'companion'), true;
  if (action === 'add-ci-companion-attribute') return addCharacterInventoryNestedAttribute(trigger, 'companion'), true;
  return false;
}

function handleCharacterInventoryProfileEditorRefresh(field) {
  if (!field?.closest?.('#cp-inventory-editor')) return false;
  if (field.dataset.moduleEditorAction !== 'refresh-ci-preview') return false;
  refreshCharacterInventoryEditorPreview(field);
  return true;
}

function initCharacterInventoryProfile(char = {}) {
  _characterInventoryDraft = getCharacterInventoryProfileSource(char);
  setCharacterInventoryProfileMode(false);
  renderCharacterInventoryProfileEditor();
}

function collectCharacterInventoryProfileData() {
  const card = document.querySelector('#cp-inventory-editor [data-ci-embedded-card]');
  // Die gerenderte Leseansicht ist nur eine Darstellung und darf einen zwischenzeitlich durch
  // den Kampfbogen aktualisierten Inventarentwurf nicht wieder ueberschreiben. Nur der echte
  // eingebettete Editor wird beim Einsammeln aus dem DOM gelesen.
  if (!_characterInventoryEditMode || !card || typeof collectCharacterInventoryModuleEditorPage !== 'function') {
    return sanitizeCharacterInventoryData(_characterInventoryDraft || {});
  }
  const page = collectCharacterInventoryModuleEditorPage(card, {});
  _characterInventoryDraft = sanitizeCharacterInventoryData(page.characterInventory || {});
  return _characterInventoryDraft;
}

function setCharacterInventoryProfileData(inventory = {}, options = {}) {
  _characterInventoryDraft = sanitizeCharacterInventoryData(inventory);
  if (options.render === true) renderCharacterInventoryProfileEditor();
  return _characterInventoryDraft;
}

function syncCharacterInventoryProfileDraftFromPage(page) {
  if (!page?.closest?.('#cp-inventory-editor')) return;
  try {
    _characterInventoryDraft = sanitizeCharacterInventoryData(JSON.parse(page.dataset.ciData || '{}'));
  } catch (error) {
    console.warn('Charakter-Inventar konnte nicht aktualisiert werden:', error);
  }
}

function editCharacterInventoryProfile() {
  setCharacterInventoryProfileMode(true);
  renderCharacterInventoryProfileEditor();
}

function showCharacterInventoryProfileView() {
  collectCharacterInventoryProfileData();
  setCharacterInventoryProfileMode(false);
  renderCharacterInventoryProfileEditor();
}

function getCharacterInventoryFormSnapshot() {
  return {
    name: document.getElementById('cp-name')?.value.trim() || 'Name des Charakters',
    title: document.getElementById('cp-title')?.value.trim() || '',
    fraktion: document.getElementById('cp-fraktion')?.value.trim() || '',
    portrait: normalizeImageUrlForStorage(document.getElementById('cp-portrait-url')?.value || '') || ''
  };
}

function resetCharacterInventoryFromCurrentProfile() {
  const current = collectCharacterInventoryProfileData();
  const snapshot = getCharacterInventoryFormSnapshot();
  _characterInventoryDraft = sanitizeCharacterInventoryData({
    ...current,
    portrait: snapshot.portrait || current.portrait,
    name: snapshot.name || current.name,
    role: snapshot.title || snapshot.fraktion || current.role,
    level: snapshot.fraktion || current.level
  });
  renderCharacterInventoryProfileEditor();
}

function buildCharacterInventoryTemplatePayload(data = {}) {
  const source = sanitizeCharacterInventoryData(data);
  return sanitizeCharacterInventoryData({
    ...source,
    portrait: '',
    name: 'Name des Charakters',
    role: 'Rolle',
    level: ''
  });
}

function buildCharacterInventoryForCharacterFromTemplate(template, char = {}) {
  const source = sanitizeCharacterInventoryData(template);
  return sanitizeCharacterInventoryData({
    ...source,
    portrait: char.portrait || '',
    name: char.name || 'Name des Charakters',
    role: char.title || char.fraktion || source.role || 'Rolle',
    level: char.fraktion || source.level || ''
  });
}

function refreshCharacterInventoryTemplateViews() {
  const current = _editingChar ? getCharacterById(_editingChar) : null;
  if (current) {
    _characterInventoryDraft = getCharacterInventoryProfileSource(current);
    renderCharacterInventoryProfileEditor();
    window.AleriaCharacterCombatProfile?.init?.(current);
  }
  renderCharGrid();
  renderCharPickerInForm();
  refreshAllModuleCastPickers();
}

function exportCharacterInventoryProfileTemplate() {
  const inventory = buildCharacterInventoryTemplatePayload(collectCharacterInventoryProfileData());
  const payload = {
    type: 'aleria-character-inventory-template',
    version: 1,
    exportedAt: new Date().toISOString(),
    inventory
  };
  downloadJsonFile(payload, 'aleria-charakter-inventar-vorlage.json');
  showAppStatus('Charakter-Inventar-Vorlage exportiert.', 'success');
}

async function stampCharacterInventoryProfileTemplateToAll() {
  if (!window._fb?.saveCharacter) {
    showAppStatus('Inventarvorlage konnte nicht online gespeichert werden.', 'error');
    return;
  }
  const code = prompt('Code eingeben, um diese Inventarvorlage auf alle angelegten Charaktere zu stempeln:');
  if (String(code || '').trim() !== '2603') {
    showAppStatus('Inventar-Stempel abgebrochen: falscher Code.', 'error');
    return;
  }
  const targets = Array.isArray(_characters) ? _characters.filter(char => char?.id) : [];
  if (!targets.length) {
    showAppStatus('Keine angelegten Charaktere gefunden.', 'error');
    return;
  }
  if (!confirm(`Inventarvorlage wirklich auf ${targets.length} angelegte Charaktere anwenden?\n\nNamen, Portraits und Basisdaten bleiben erhalten. Inventar, Items, Gefährten, Kategorien und Attribute werden ersetzt.`)) {
    return;
  }

  const template = buildCharacterInventoryTemplatePayload(collectCharacterInventoryProfileData());
  let savedCount = 0;
  try {
    for (const char of targets) {
      // Nur das Inventar wird geschickt (siehe Speichersystem-Checkup) - ein voller Spread von
      // "char" wuerde bei jeder einzelnen Figur zusaetzlich Name/Bio/Kampfprofil/Bilder aus dem
      // moeglicherweise veralteten Zwischenspeicher zurueckschreiben, obwohl diese Aktion
      // ausdruecklich nur das Inventar aendern soll.
      const templateInventory = buildCharacterInventoryForCharacterFromTemplate(template, char);
      const synchronized = window.AleriaCharacterEquipmentSync?.synchronizeFromInventory?.({
        inventory: templateInventory,
        combatProfile: char.combatProfile || {}
      });
      const synchronizedInventory = synchronized?.inventory || templateInventory;
      const combatProfileChanged = !!char.combatProfile
        && !!synchronized?.combatProfile
        && JSON.stringify(synchronized.combatProfile) !== JSON.stringify(char.combatProfile);
      const data = {
        inventory: synchronizedInventory,
        ...(combatProfileChanged ? { combatProfile: synchronized.combatProfile } : {}),
        updatedAt: new Date().toISOString()
      };
      const result = await window._fb.saveCharacter(char.id, data, { returnWriteResult: true });
      const persistedData = typeof result === 'object' && result?.data ? result.data : data;
      const targetIndex = _characters.findIndex(candidate => candidate.id === char.id);
      if (targetIndex >= 0) {
        _characters[targetIndex] = {
          ..._characters[targetIndex],
          inventory: persistedData.inventory,
          ...(persistedData.combatProfile ? { combatProfile: persistedData.combatProfile } : {}),
          updatedAt: persistedData.updatedAt || data.updatedAt
        };
      }
      savedCount += 1;
    }
    refreshCharacterInventoryTemplateViews();
    showAppStatus(`Inventarvorlage auf ${targets.length} Charaktere gestempelt.`, 'success');
  } catch (error) {
    const message = getFriendlyErrorMessage(error, 'Inventarvorlage konnte nicht auf alle Charaktere angewendet werden.');
    refreshCharacterInventoryTemplateViews();
    showAppStatus(`Inventarvorlage nach ${savedCount} von ${targets.length} Figuren abgebrochen. ${message}`, 'error');
  }
}

document.addEventListener('click', event => {
  const trigger = event.target?.closest?.('[data-module-editor-action]');
  if (!trigger?.closest?.('#cp-inventory-editor')) return;
  if (handleCharacterInventoryProfileEditorAction(trigger)) {
    event.preventDefault();
    event.stopPropagation();
  }
});

document.addEventListener('input', event => {
  if (handleCharacterInventoryProfileEditorRefresh(event.target)) {
    event.stopPropagation();
  }
});

document.addEventListener('change', event => {
  if (handleCharacterInventoryProfileEditorRefresh(event.target)) {
    event.stopPropagation();
  }
});
