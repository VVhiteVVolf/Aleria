let _editingChar = null;
let _charPortraitUrl = null;
const MAX_EMOTES = CHARACTER_AVATAR_LIMIT;
let _emoteSlots = [];
let _pendingCharacterImport = null;
let _charProfileSavePromise = null;

// Schnappschuss dessen, was beim Öffnen des Bogens tatsächlich geladen wurde (Profil,
// Bilder/Emotes, Inventar, Kampfprofil) - jeweils über dieselben collect...()-Funktionen wie beim Speichern,
// damit der Vergleich später wirklich "Apfel mit Apfel" ist. Damit kann saveCharacter() Bereiche,
// die in dieser Sitzung nie angefasst wurden, komplett aus dem Schreibvorgang weglassen, statt sie
// aus dem (potenziell veralteten) Formularzustand einfach immer wieder mitzuspeichern. Genau das
// verhindert, dass z.B. ein reiner Avatar-Upload das Kampfprofil/Inventar anfasst oder - schlimmer -
// mit einem veralteten Stand überschreibt.
let _charProfileLoadedSnapshot = null;

function populateCharacterProfileForm(c = {}) {
  _charPortraitUrl = null;

  document.getElementById('cp-name').value     = c.name     || '';
  document.getElementById('cp-title').value    = c.title    || '';
  document.getElementById('cp-fraktion').value = c.fraktion || '';
  document.getElementById('cp-role').value = c.role || '';
  document.getElementById('cp-status').value = getCharacterStatusValue(c.status);
  document.getElementById('cp-relevance').value = getCharacterRelevanceValue(c.relevance);
  document.getElementById('cp-taxonomy-path').value = c.taxonomyPath || '';
  document.getElementById('cp-current-location').value = c.currentLocation || '';
  document.getElementById('cp-origin').value = c.origin || '';
  document.getElementById('cp-plot-node').value = c.plotNode || '';
  document.getElementById('cp-profile-link-url').value = c.profileLink || '';
  document.getElementById('cp-player-owner').value = normalizeCharacterPlayerOwner(c.playerOwner);
  document.getElementById('cp-bio').value      = c.bio      || '';
  document.getElementById('cp-aliases').value  = (c.aliases || []).join(', ');
  document.getElementById('cp-archived').checked = !!c.archived;
  document.getElementById('cp-save-status').textContent = '';

  syncProfileLinkDisplay(c.profileLink || '', c.name || '');
  syncCharacterGenealogyFields(c);
  initCharacterImageSetEditor(c);
  if (typeof initCharacterInventoryProfile === 'function') initCharacterInventoryProfile(c);
  if (typeof initCharacterBiographyTab === 'function') initCharacterBiographyTab(c);
  window.AleriaCharacterCombatProfile?.init?.(c);

  const equipmentBaseline = collectCharacterEquipmentProfileData(c);
  _charProfileLoadedSnapshot = {
    profile: collectCharacterProfileSectionData(c),
    images: collectCharacterImageSetEditorData(),
    inventory: equipmentBaseline.inventory,
    combatProfile: equipmentBaseline.combatProfile,
    biography: collectCharacterBiographyData()
  };
}

function openCharProfile(id) {
  _editingChar = id;
  _pendingCharacterImport = null;
  const c = id ? (getCharacterById(id) || {}) : {};
  const isBuiltin = isBuiltinCharacterId(id);
  populateCharacterProfileForm(c);
  document.getElementById('cp-delete-btn').style.display = id ? 'inline-block' : 'none';
  document.getElementById('cp-delete-btn').textContent = isBuiltin ? 'Ausblenden' : 'Löschen';
  switchCharTab('info');
  activateDialog('char-profile-overlay', { initialFocus: '#cp-name' });
}

function syncPortraitDisplay(src, name) {
  const initial = getInitialChar(name);
  const img1 = document.getElementById('cp-portrait-img');
  const ph1  = document.getElementById('cp-portrait-placeholder');
  const img2 = document.getElementById('cp-portrait-thumb-img');
  const ph2  = document.getElementById('cp-portrait-thumb-ph');

  if (src) {
    img1.src = src;
    img1.style.display = 'block';
    ph1.style.display = 'none';
    img2.src = src;
    img2.style.display = 'block';
    ph2.style.display = 'none';
    return;
  }

  img1.style.display = 'none';
  img1.removeAttribute('src');
  ph1.style.display = 'flex';
  ph1.textContent = initial;
  img2.style.display = 'none';
  img2.removeAttribute('src');
  ph2.style.display = 'flex';
  ph2.textContent = initial;
}

function normalizeCharacterProfileLinkForStorage(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  return sanitizeHref(raw) ? raw : '';
}

function syncProfileLinkDisplay(profileLink, name) {
  const anchor = document.getElementById('cp-profile-link-anchor');
  if (!anchor) return;

  const safeHref = sanitizeHref(profileLink || '');
  if (safeHref) {
    anchor.href = String(profileLink || '').trim();
    anchor.classList.add('has-profile-link');
    anchor.removeAttribute('aria-disabled');
    anchor.setAttribute('aria-label', `${name || 'Charakterprofil'} öffnen`);
    anchor.title = `${name || 'Charakterprofil'} öffnen`;
    return;
  }

  anchor.removeAttribute('href');
  anchor.classList.remove('has-profile-link');
  anchor.setAttribute('aria-disabled', 'true');
  anchor.removeAttribute('aria-label');
  anchor.removeAttribute('title');
}

function getCharacterGenealogyFormData(existing = {}) {
  const genealogy = normalizeCharacterGenealogyRecord(existing.genealogy);
  return normalizeCharacterGenealogyRecord({
    ...genealogy,
    worldPersonId: genealogy.worldPersonId || existing.identity?.worldPersonId || '',
    birth: document.getElementById('cp-genealogy-birth')?.value || '',
    death: document.getElementById('cp-genealogy-death')?.value || '',
    sex: document.getElementById('cp-genealogy-sex')?.value || 'unknown',
    houseName: document.getElementById('cp-genealogy-house')?.value || ''
  });
}

function syncCharacterGenealogyFields(character = {}) {
  const genealogy = normalizeCharacterGenealogyRecord(character.genealogy);
  document.getElementById('cp-genealogy-birth').value = genealogy.birth || '';
  document.getElementById('cp-genealogy-death').value = genealogy.death || '';
  document.getElementById('cp-genealogy-sex').value = ['female', 'male', 'unknown'].includes(genealogy.sex)
    ? genealogy.sex
    : 'unknown';
  document.getElementById('cp-genealogy-house').value = genealogy.houseName || '';

  const source = genealogy.sources[0] || null;
  const sourceLink = document.getElementById('cp-genealogy-source-link');
  const safeSourceUrl = sanitizeHref(source?.url || '');
  sourceLink.hidden = !safeSourceUrl;
  if (safeSourceUrl) sourceLink.href = source.url;
  else sourceLink.removeAttribute('href');

  const sourceStatus = document.getElementById('cp-genealogy-source-status');
  sourceStatus.hidden = !source;
  sourceStatus.textContent = source
    ? `Verknüpft mit ${source.familyId} / ${source.personId}${source.releaseId ? ` · Fassung ${source.releaseId}` : ''}`
    : '';

  const relations = genealogy.relationships || {};
  const relationGroups = [
    ['Eltern', relations.parents],
    ['Partner', relations.partners],
    ['Kinder', relations.children]
  ].filter(([, people]) => Array.isArray(people) && people.length);
  const relationBox = document.getElementById('cp-genealogy-relations');
  relationBox.hidden = relationGroups.length === 0;
  relationBox.innerHTML = relationGroups.map(([label, people]) => `
    <div><strong>${escapeHtml(label)}:</strong> ${people.map(person => escapeHtml(person.name || '')).filter(Boolean).join(', ')}</div>
  `).join('');
}

function switchCharTab(tab) {
  if (tab === 'inventory' && window.AleriaCharacterCombatProfile?.collectLinked) {
    const inventory = typeof collectCharacterInventoryProfileData === 'function'
      ? collectCharacterInventoryProfileData()
      : {};
    const linked = window.AleriaCharacterCombatProfile.collectLinked(inventory);
    if (linked?.inventory && typeof setCharacterInventoryProfileData === 'function') {
      setCharacterInventoryProfileData(linked.inventory, { render: true });
    }
  }
  if (tab === 'combat' && window.AleriaCharacterCombatProfile?.refreshInventory) {
    const existing = _editingChar ? (getCharacterById(_editingChar) || {}) : {};
    const inventory = typeof collectCharacterInventoryProfileData === 'function'
      ? collectCharacterInventoryProfileData()
      : existing.inventory;
    window.AleriaCharacterCombatProfile.refreshInventory({ ...existing, inventory });
  }
  document.querySelectorAll('.char-profile-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.charProfileTab === tab);
  });
  document.querySelectorAll('#char-profile-overlay .char-tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `cp-tab-${tab}`);
  });
}

function getUnsavedCharacterProfileSectionLabels() {
  if (!_charProfileLoadedSnapshot || !window.AleriaCharacterSaveGuard?.selectChangedSections) return [];
  const existing = _editingChar ? (getCharacterById(_editingChar) || {}) : {};
  const equipment = collectCharacterEquipmentProfileData(existing);
  const current = {
    profile: collectCharacterProfileSectionData(existing),
    images: collectCharacterImageSetEditorData(),
    inventory: equipment.inventory,
    combatProfile: equipment.combatProfile,
    biography: collectCharacterBiographyData()
  };
  const labels = {
    profile: 'Profil',
    images: 'Bilder & Emotes',
    inventory: 'Inventar',
    combatProfile: 'Charakterbogen',
    biography: 'Biographie'
  };
  return window.AleriaCharacterSaveGuard
    .selectChangedSections(current, _charProfileLoadedSnapshot, Object.keys(labels))
    .map(section => labels[section]);
}

function setCharacterProfileSavingState(isSaving) {
  const overlay = document.getElementById('char-profile-overlay');
  if (!overlay) return;
  overlay.inert = !!isSaving;
  if (isSaving) overlay.setAttribute('aria-busy', 'true');
  else overlay.removeAttribute('aria-busy');
}

function closeCharProfile(options = {}) {
  if (options.skipUnsavedCheck !== true && _charProfileSavePromise) {
    const status = document.getElementById('cp-save-status');
    if (status) status.textContent = 'Speichern läuft noch …';
    return;
  }
  const changedSections = options.skipUnsavedCheck === true ? [] : getUnsavedCharacterProfileSectionLabels();
  const hasPendingImport = options.skipUnsavedCheck !== true && !!_pendingCharacterImport;
  const hasCombatDraftNotice = options.skipUnsavedCheck !== true
    && window.AleriaCharacterCombatProfile?.hasUnsavedDraftNotice?.();
  if (changedSections.length || hasPendingImport || hasCombatDraftNotice) {
    const details = changedSections.length ? ` (${changedSections.join(', ')})` : '';
    const discard = confirm(`Ungespeicherte Charakteränderungen${details} gehen beim Schließen verloren. Trotzdem schließen?`);
    if (!discard) return;
  }
  deactivateDialog('char-profile-overlay');
  _editingChar = null;
  _charPortraitUrl = null;
  _charProfileLoadedSnapshot = null;
  _pendingCharacterImport = null;
}

function previewPortraitUrl(url) {
  const err = document.getElementById('cp-portrait-url-error');
  if (!url) {
    err.style.display = 'none';
    syncPortraitDisplay(null, document.getElementById('cp-name').value || '?');
    _charPortraitUrl = null;
    scheduleCharacterImageLibraryPersistence('clear-portrait');
    return;
  }

  const safeUrl = normalizeImageUrlForStorage(url);
  if (!safeUrl) {
    err.style.display = 'block';
    _charPortraitUrl = null;
    syncPortraitDisplay(null, document.getElementById('cp-name').value || '?');
    return;
  }

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.addEventListener('load', () => {
    const currentValue = normalizeImageUrlForStorage(document.getElementById('cp-portrait-url')?.value || '');
    if (currentValue !== safeUrl) return;
    err.style.display = 'none';
    _charPortraitUrl = safeUrl;
    syncPortraitDisplay(safeUrl, document.getElementById('cp-name').value || '?');
    scheduleCharacterImageLibraryPersistence('portrait');
  }, { once: true });
  img.addEventListener('error', () => {
    err.style.display = 'block';
  }, { once: true });
  img.src = safeUrl;
}

function openEmoteUrlInput(slotIndex) {
  const url = prompt('Imgur-URL für Emote (z.B. https://i.imgur.com/xxxxx.png):');
  if (!url) return;

  const safeUrl = normalizeImageUrlForStorage(url);
  if (!safeUrl) {
    alert('Bitte eine gueltige http(s)-Bild-URL verwenden.');
    return;
  }

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.addEventListener('load', () => {
    const label = _emoteSlots[slotIndex]?.label || '';
    _emoteSlots[slotIndex] = { img: safeUrl, label };
    renderEmoteGrid();
    scheduleCharacterImageLibraryPersistence('emote');
  }, { once: true });
  img.addEventListener('error', () => alert('Bild konnte nicht geladen werden. Bitte prüfe die URL.'), { once: true });
  img.src = safeUrl;
}

function initEmoteSlots(existingEmotes) {
  _emoteSlots = Array.from({ length: MAX_EMOTES }, (_, i) =>
    (existingEmotes && existingEmotes[i]) ? { ...existingEmotes[i] } : null
  );
  renderEmoteGrid();
}

function renderEmoteGrid() {
  const grid = document.getElementById('cp-emote-grid');
  if (!grid) return;

  grid.innerHTML = '';
  _emoteSlots.forEach((slot, i) => {
    const div = document.createElement('div');
    div.className = 'emote-slot';
    if (slot && slot.img) {
      const safeLabel = escapeHtml(slot.label || '');
      div.innerHTML = `
        <img src="${sanitizeImageSrc(slot.img)}" alt="Emote ${i+1}" loading="lazy" decoding="async">
        <button class="emote-remove-btn" type="button" data-char-profile-action="remove-emote" data-emote-index="${i}">✕</button>
        <input class="emote-label-input" type="text" value="${safeLabel}"
          placeholder="Label" maxlength="20"
          data-char-profile-action="update-emote-label" data-emote-index="${i}">`;
    } else {
      div.innerHTML = `
        <div class="emote-slot-placeholder" role="button" tabindex="0" data-char-profile-action="open-emote-url" data-emote-index="${i}" title="URL eingeben">
          <span>+</span>
        </div>
        <input class="emote-label-input" type="text" placeholder="Label" maxlength="20"
          data-char-profile-action="update-emote-label" data-emote-index="${i}">`;
    }
    grid.appendChild(div);
  });
  updateCharacterAvatarImportSummary();
}

function removeEmote(i) {
  _emoteSlots[i] = null;
  renderEmoteGrid();
  scheduleCharacterImageLibraryPersistence('remove-emote');
}

function setCharacterImageLibrarySaveStatus(message, isError = false) {
  const status = document.getElementById('cp-save-status');
  if (!status) return;
  status.style.color = isError ? 'var(--red-wax)' : 'var(--gold)';
  status.textContent = message;
}

window.AleriaCharacterProfileMediaPersistence = Object.freeze({
  capture(reason = '') {
    const characterId = String(_editingChar || '');
    if (!characterId || isBuiltinCharacterId(characterId)) return null;
    return {
      characterId,
      reason,
      images: collectCharacterImageSetEditorData()
    };
  },
  showDeferred() {
    setCharacterImageLibrarySaveStatus('Bilder werden beim ersten Speichern der Figur gesichert.');
  },
  showQueued() {
    setCharacterImageLibrarySaveStatus('Bilder werden gespeichert…');
  },
  applySaved(snapshot, { isLatest } = {}) {
    const idx = _characters.findIndex(character => character.id === snapshot.characterId);
    if (idx >= 0) {
      _characters[idx] = {
        ..._characters[idx],
        ...snapshot.images,
        updatedAt: new Date().toISOString()
      };
    }
    if (_editingChar !== snapshot.characterId || !isLatest) return;
    _charProfileLoadedSnapshot = {
      ...(_charProfileLoadedSnapshot || {}),
      images: snapshot.images
    };
    setCharacterImageLibrarySaveStatus('Bilder gespeichert ✓');
    setTimeout(() => {
      const status = document.getElementById('cp-save-status');
      if (status?.textContent === 'Bilder gespeichert ✓') status.textContent = '';
    }, 2000);
  },
  showError(error, snapshot, { isLatest } = {}) {
    const message = getFriendlyErrorMessage(error, 'Bilder konnten nicht gespeichert werden.');
    if (_editingChar === snapshot?.characterId && isLatest) {
      setCharacterImageLibrarySaveStatus(message, true);
    }
    if (isLatest) showAppStatus(message, 'error');
  }
});

function collectCharacterEquipmentProfileData(existing = {}) {
  const inventory = typeof collectCharacterInventoryProfileData === 'function'
    ? collectCharacterInventoryProfileData()
    : sanitizeCharacterInventoryData(existing.inventory || {});
  const linked = window.AleriaCharacterCombatProfile?.collectLinked?.(inventory);
  if (linked?.inventory && typeof setCharacterInventoryProfileData === 'function') {
    setCharacterInventoryProfileData(linked.inventory);
  }
  return {
    inventory: linked?.inventory || inventory,
    combatProfile: linked?.combatProfile
      || window.AleriaCharacterCombatProfile?.collect?.()
      || window.AleriaCharacterCombatProfile?.sanitize?.(existing.combatProfile || {})
      || existing.combatProfile
      || {}
  };
}

function collectCharacterProfileSectionData(existing = {}) {
  const genealogy = getCharacterGenealogyFormData(existing);
  return {
    name: document.getElementById('cp-name')?.value.trim() || existing.name || '',
    title: document.getElementById('cp-title')?.value.trim() || '',
    fraktion: document.getElementById('cp-fraktion')?.value.trim() || '',
    role: document.getElementById('cp-role')?.value.trim() || '',
    status: getCharacterStatusValue(document.getElementById('cp-status')?.value || ''),
    relevance: getCharacterRelevanceValue(document.getElementById('cp-relevance')?.value || ''),
    taxonomyPath: document.getElementById('cp-taxonomy-path')?.value.trim() || '',
    currentLocation: document.getElementById('cp-current-location')?.value.trim() || '',
    origin: document.getElementById('cp-origin')?.value.trim() || '',
    plotNode: document.getElementById('cp-plot-node')?.value.trim() || '',
    profileLink: normalizeCharacterProfileLinkForStorage(document.getElementById('cp-profile-link-url')?.value || ''),
    playerOwner: normalizeCharacterPlayerOwner(document.getElementById('cp-player-owner')?.value || ''),
    bio: document.getElementById('cp-bio')?.value.trim() || '',
    aliases: parseAliasInput(document.getElementById('cp-aliases')?.value || ''),
    archived: !!document.getElementById('cp-archived')?.checked,
    ...(existing.localRecord ? {
      localRecord: cloneCharacterStructuredValue(existing.localRecord, existing.localRecord)
    } : {}),
    identity: normalizeCharacterIdentityRecord(existing.identity?.worldPersonId
      ? existing.identity
      : { worldPersonId: genealogy.worldPersonId }),
    genealogy
  };
}

function collectCharacterProfileDataFromForm() {
  const existing = _editingChar ? (getCharacterById(_editingChar) || {}) : {};
  const now = new Date().toISOString();
  const profile = collectCharacterProfileSectionData(existing);
  const imageSetData = collectCharacterImageSetEditorData();
  const equipmentData = collectCharacterEquipmentProfileData(existing);
  return {
    id: _editingChar || '',
    ...profile,
    createdAt: existing.createdAt || now,
    updatedAt: now,
    ...imageSetData,
    inventory: equipmentData.inventory,
    combatProfile: equipmentData.combatProfile,
    biography: collectCharacterBiographyData()
  };
}

function exportCurrentCharacterProfile() {
  const profileLinkInput = document.getElementById('cp-profile-link-url')?.value || '';
  if (profileLinkInput.trim() && !normalizeCharacterProfileLinkForStorage(profileLinkInput)) {
    showAppStatus('Profil-Link muss mit http(s), /, ./ oder ../ beginnen.', 'error');
    return;
  }
  const data = collectCharacterProfileDataFromForm();
  if (!data.name) {
    showAppStatus('Charakter braucht vor dem Export mindestens einen Namen.', 'error');
    return;
  }
  const payload = {
    type: 'aleria-character',
    version: CHARACTER_ARCHIVE_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    character: data,
    assignedTab: getCharacterAssignedTab(data.id)
  };
  downloadJsonFile(payload, `${slugify(data.name || data.id || 'charakter')}.json`);
}

function openCurrentCharacterImportFilePicker() {
  if (_charProfileSavePromise) {
    const status = document.getElementById('cp-save-status');
    if (status) status.textContent = 'Bitte warte, bis der laufende Speichervorgang abgeschlossen ist.';
    return;
  }
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    if (!file) return;
    const status = document.getElementById('cp-save-status');
    try {
      const parsed = JSON.parse(await file.text());
      const normalized = normalizeCharacterImportPayload(parsed);
      const records = normalized.characters.filter(character => character && typeof character === 'object');
      if (records.length !== 1) throw new Error('Bitte wähle für den geöffneten Bogen genau einen Charakter aus.');
      const importedRecord = {
        ...records[0],
        aliases: Array.isArray(records[0].aliases) ? records[0].aliases : parseAliasInput(records[0].aliases || ''),
        emotes: Array.isArray(records[0].emotes) ? records[0].emotes : [],
        imageSets: Array.isArray(records[0].imageSets) ? records[0].imageSets : []
      };
      const currentRecord = _editingChar ? (getCharacterById(_editingChar) || {}) : {};
      const imported = window.AleriaCharacterSaveGuard?.mergeCharacterImageLibrary
        ? window.AleriaCharacterSaveGuard.mergeCharacterImageLibrary(currentRecord, importedRecord)
        : importedRecord;
      // Ein Einzelimport ist kein unverbindlicher Formularentwurf: Er ersetzt den geoeffneten
      // Charakter vollstaendig und wird direkt in Firestore verankert. Bleibt der Schreibvorgang
      // z. B. wegen einer aktiven Kampfsperre erfolglos, merkt sich _pendingCharacterImport den
      // Vollimport, damit ein spaeterer Klick auf "Speichern" denselben Ersatzschreibvorgang
      // wiederholt und nicht versehentlich nur einzelne Formularfelder zusammenfuehrt.
      _pendingCharacterImport = imported;
      populateCharacterProfileForm(imported);
      if (status) {
        status.style.color = 'var(--gold)';
        status.textContent = 'Import wird vollständig gespeichert…';
      }
      await saveCharacter({
        importedRecord: imported,
        forceOverwrite: true,
        replaceExisting: true,
        successMessage: 'Import vollständig gespeichert ✓'
      });
    } catch (error) {
      if (status) {
        status.style.color = 'var(--red-wax)';
        status.textContent = error.message || 'Charakterdatei konnte nicht importiert werden.';
      }
    }
  }, { once: true });
  input.click();
}

async function saveCharacter(options = {}) {
  const previous = _charProfileSavePromise;
  const operation = (previous ? previous.catch(() => null) : Promise.resolve())
    .then(async () => {
      setCharacterProfileSavingState(true);
      try {
        return await saveCharacterOnce(options);
      } finally {
        setCharacterProfileSavingState(false);
      }
    });
  _charProfileSavePromise = operation;
  try {
    return await operation;
  } finally {
    if (_charProfileSavePromise === operation) _charProfileSavePromise = null;
  }
}

async function saveCharacterOnce(options = {}) {
  await window.AleriaCharacterImageLibraryAutosave?.flush?.(_editingChar);
  const importedRecord = options.importedRecord || _pendingCharacterImport;
  const replaceExisting = options.replaceExisting === true || !!importedRecord;
  const forceOverwrite = options.forceOverwrite === true || !!importedRecord;
  const selectedCommentCharId = _selectedCharId;
  const selectedCommentEmoteIdx = _selectedEmoteIdx;
  const selectedCommentImageSetId = _selectedImageSetId;
  const profileLinkInput = document.getElementById('cp-profile-link-url')?.value || '';
  const profileLink = normalizeCharacterProfileLinkForStorage(profileLinkInput);
  const status   = document.getElementById('cp-save-status');
  const sourceId = _editingChar;
  const isBuiltin = isBuiltinCharacterId(sourceId);

  if (!window._fb?.saveCharacter || !window.AleriaCharacterSaveGuard?.selectChangedSections) {
    const message = 'Die Online-Speicherung ist noch nicht bereit. Bitte versuche es gleich erneut.';
    status.style.color = 'var(--red-wax)';
    status.textContent = message;
    showAppStatus(message, 'error');
    return null;
  }

  if (!document.getElementById('cp-name').value.trim()) {
    status.style.color = 'var(--red-wax)';
    status.textContent = 'Name ist Pflicht.';
    return null;
  }

  if (profileLinkInput.trim() && !profileLink) {
    status.style.color = 'var(--red-wax)';
    status.textContent = 'Profil-Link muss mit http(s), /, ./ oder ../ beginnen.';
    return null;
  }

  const existing = sourceId ? (getCharacterById(sourceId) || {}) : {};
  const saveTargetId = isBuiltin ? null : sourceId;
  const now = new Date().toISOString();
  const recordSource = replaceExisting && importedRecord && window.AleriaCharacterSaveGuard?.mergeCharacterImageLibrary
    ? window.AleriaCharacterSaveGuard.mergeCharacterImageLibrary(existing, importedRecord)
    : (replaceExisting && importedRecord ? importedRecord : existing);

  const profileData = collectCharacterProfileSectionData(recordSource);
  const name = profileData.name;
  const imageSetData = replaceExisting && importedRecord
    ? buildCharacterImageLibraryStorage(recordSource)
    : collectCharacterImageSetEditorData();
  const equipmentData = replaceExisting && importedRecord
    ? (window.AleriaCharacterCombatProfile?.prepareImported?.(recordSource)
      || {
        inventory: typeof sanitizeCharacterInventoryData === 'function'
          ? sanitizeCharacterInventoryData(recordSource.inventory || {})
          : cloneCharacterStructuredValue(recordSource.inventory, {}),
        combatProfile: window.AleriaCharacterCombatProfile?.sanitize?.(recordSource.combatProfile || {})
          || cloneCharacterStructuredValue(recordSource.combatProfile, {})
      })
    : collectCharacterEquipmentProfileData(recordSource);

  // Profil, Bilder & Emotes, Inventar, Kampfdaten und Biographie sind fünf eigenständige
  // Bereiche - der gemeinsame "Speichern"-Knopf darf einen davon nur dann tatsächlich mit
  // anfassen, wenn er in dieser Sitzung auch wirklich bearbeitet wurde. Sonst würde z.B. ein
  // reiner Avatar-Upload das Kampfprofil/Inventar mit dem (möglicherweise veralteten) beim
  // Öffnen geladenen Stand überschreiben. Bei einer neu angelegten Figur (kein Schnappschuss
  // vorhanden) greift die Prüfung nicht - die braucht von Anfang an ein vollständiges
  // Kampfprofil/Inventar/Bilderset.
  const baseline = saveTargetId && !replaceExisting ? _charProfileLoadedSnapshot : null;
  const current = {
    profile: profileData,
    images: imageSetData,
    inventory: equipmentData.inventory,
    combatProfile: equipmentData.combatProfile,
    biography: collectCharacterBiographyData()
  };
  const changedSections = new Set(window.AleriaCharacterSaveGuard.selectChangedSections(
    current,
    baseline,
    ['profile', 'images', 'inventory', 'combatProfile', 'biography']
  ));
  const profileChanged = changedSections.has('profile');
  const imagesChanged = changedSections.has('images');
  const inventoryChanged = changedSections.has('inventory');
  const combatProfileChanged = changedSections.has('combatProfile');
  const biographyChanged = changedSections.has('biography');

  if (!changedSections.size) {
    status.style.color = 'var(--gold)';
    status.textContent = 'Keine Änderungen.';
    setTimeout(() => {
      if (status.textContent === 'Keine Änderungen.') status.textContent = '';
    }, 2000);
    return saveTargetId;
  }

  const data = {
    ...(replaceExisting && importedRecord
      ? cloneCharacterStructuredValue(recordSource, {})
      : {}),
    ...(profileChanged ? profileData : {}),
    ...(!saveTargetId || replaceExisting ? {
      createdAt: recordSource.createdAt || existing.createdAt || now
    } : {}),
    updatedAt: now,
    ...(imagesChanged ? imageSetData : {}),
    ...(inventoryChanged ? { inventory: equipmentData.inventory } : {}),
    ...(combatProfileChanged ? { combatProfile: equipmentData.combatProfile } : {}),
    ...(biographyChanged ? { biography: current.biography } : {})
  };
  delete data.id;
  delete data._builtin;
  delete data._imageSetsExplicit;
  delete data.ownerUid;
  delete data.createdBy;

  status.style.color = 'var(--gold)';
  status.textContent = 'Wird gespeichert…';

  try {
    const saveResult = await window._fb.saveCharacter(saveTargetId, data, {
      forceOverwrite,
      replaceExisting,
      returnWriteResult: true
    });
    const newId = typeof saveResult === 'object' && saveResult ? saveResult.id : saveResult;
    const persistedData = typeof saveResult === 'object' && saveResult?.data
      ? saveResult.data
      : data;
    let persistedRecord;
    if (saveTargetId) {
      const idx = _characters.findIndex(x => x.id === saveTargetId);
      // data kann inventory/combatProfile/Bilder-Felder bewusst auslassen (siehe oben) - der
      // lokale Zwischenspeicher braucht trotzdem den vollständigen Datensatz, sonst "vergisst"
      // die Sitzung diese Felder bis zum nächsten kompletten Neuladen.
      if (idx >= 0) {
        _characters[idx] = replaceExisting
          ? { id: saveTargetId, ...persistedData }
          : { ..._characters[idx], ...persistedData, id: saveTargetId };
      } else {
        _characters.push({ id: saveTargetId, ...persistedData });
      }
      persistedRecord = getCharacterById(saveTargetId) || { id: saveTargetId, ...persistedData };
    } else {
      if (isBuiltin && sourceId) {
        replaceCharacterIdInTabs(sourceId, newId);
        saveCharTabs();
      }
      _characters.push({ id: newId, ...persistedData });
      _editingChar = newId;
      persistedRecord = getCharacterById(newId) || { id: newId, ...persistedData };
      document.getElementById('cp-delete-btn').style.display = 'inline-block';
      if (_activeCharTab !== 'Alle' && _activeCharTab !== CHARACTER_ARCHIVE_TAB) {
        if (_activeCharSubtab && _activeCharSubtab !== 'Alle') {
          assignCharToSubtab(newId, _activeCharTab, _activeCharSubtab);
        } else {
          assignCharToTab(newId, _activeCharTab);
        }
      }
    }
    // Firestore vergibt für Inventar und Kampfprofil frische Revisionsnummern. Der Editor und der
    // Vergleichsschnappschuss müssen genau diesen geschriebenen Stand übernehmen; andernfalls
    // würde der nächste legitime Speichervorgang wie ein veralteter Browser-Tab aussehen.
    if (inventoryChanged || combatProfileChanged) {
      window.AleriaCharacterCombatProfile?.init?.(persistedRecord);
    }
    const persistedEquipment = inventoryChanged || combatProfileChanged
      ? collectCharacterEquipmentProfileData(persistedRecord)
      : null;
    _charProfileLoadedSnapshot = {
      profile: profileChanged ? profileData : (baseline?.profile || current.profile),
      images: imagesChanged ? imageSetData : (baseline?.images || current.images),
      inventory: persistedEquipment?.inventory || baseline?.inventory || current.inventory,
      combatProfile: persistedEquipment?.combatProfile || baseline?.combatProfile || current.combatProfile,
      biography: biographyChanged ? current.biography : (baseline?.biography || current.biography)
    };
    _pendingCharacterImport = null;
    renderCharSubtabs();
    renderCharGrid();
    renderCharPickerInForm();
    if (typeof isCommentFormOpen === 'function' && isCommentFormOpen() && selectedCommentCharId) {
      const refreshed = getAvailableCommentCharacterById(selectedCommentCharId) || getAvailableCommentCharacterByName(name);
      if (refreshed) {
        selectCharForComment(refreshed.id, { imageSetId: selectedCommentImageSetId });
        const refreshedPresentation = getSelectedCommentCharacterPresentation(refreshed);
        if (Number.isInteger(selectedCommentEmoteIdx) && refreshedPresentation.emotes?.[selectedCommentEmoteIdx]) {
          selectEmote(selectedCommentEmoteIdx);
        }
      }
    }
    document.dispatchEvent(new CustomEvent('aleria:character-saved', {
      detail: { record: persistedRecord }
    }));
    try {
      await window.AleriaCharacterArchive?.archiveRecord?.(persistedRecord, 'character');
    } catch (archiveError) {
      console.info('Charakter wurde gespeichert; der Online-Abgleich des Charakterbogen-Archivs folgt später.', archiveError);
      showAppStatus('Charakter gespeichert. Das Charakterbogen-Archiv wurde vorerst lokal ergänzt.', 'info');
    }
    status.textContent = options.successMessage || 'Gespeichert ✓';
    setTimeout(() => { status.textContent = ''; }, 2000);
    return newId;
  } catch(e) {
    const message = getFriendlyErrorMessage(e, 'Charakter konnte nicht gespeichert werden.');
    status.style.color = 'var(--red-wax)';
    status.textContent = message;
    showAppStatus(message, 'error');
    return null;
  }
}

async function deleteCharacter() {
  if (!_editingChar) return;
  if (isBuiltinCharacterId(_editingChar)) {
    if (!confirm('Integrierten Kommentator aus Listen ausblenden? Bestehende Kommentare bleiben erhalten.')) return;
    if (_charProfileSavePromise) await _charProfileSavePromise;
    _hiddenBuiltinCharacterIds.add(_editingChar);
    saveCharTabs();
    renderCharSubtabs();
    renderCharGrid();
    renderCharPickerInForm();
    closeCharProfile({ skipUnsavedCheck: true });
    return;
  }
  if (!confirm('Charakter wirklich löschen?')) return;

  try {
    if (_charProfileSavePromise) await _charProfileSavePromise;
    window.AleriaCharacterImageLibraryAutosave?.cancel?.(_editingChar);
    await window.AleriaCharacterImageLibraryAutosave?.flush?.(_editingChar);
    await window._fb.deleteCharacter(_editingChar);
    _characters = _characters.filter(x => x.id !== _editingChar);
    Object.keys(_charTabMap).forEach(tab => {
      _charTabMap[tab] = (_charTabMap[tab] || []).filter(id => id !== _editingChar);
    });
    removeCharacterFromSubtabs(_editingChar);
    saveCharTabs();
    renderCharSubtabs();
    renderCharGrid();
    renderCharPickerInForm();
    closeCharProfile({ skipUnsavedCheck: true });
  } catch(e) {
    const message = getFriendlyErrorMessage(e, 'Charakter konnte nicht gelöscht werden.');
    document.getElementById('cp-save-status').textContent = message;
    showAppStatus(message, 'error');
  }
}
