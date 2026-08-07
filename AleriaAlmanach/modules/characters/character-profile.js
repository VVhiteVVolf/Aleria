let _editingChar = null;
let _charPortraitUrl = null;
const MAX_EMOTES = CHARACTER_AVATAR_LIMIT;
let _emoteSlots = [];

// Schnappschuss dessen, was beim Öffnen des Bogens tatsächlich geladen wurde (Bilder/Emotes,
// Inventar, Kampfprofil) - jeweils über dieselben collect...()-Funktionen wie beim Speichern,
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
  window.AleriaCharacterCombatProfile?.init?.(c);

  const equipmentBaseline = collectCharacterEquipmentProfileData(c);
  _charProfileLoadedSnapshot = {
    images: collectCharacterImageSetEditorData(),
    inventory: equipmentBaseline.inventory,
    combatProfile: equipmentBaseline.combatProfile
  };
}

function openCharProfile(id) {
  _editingChar = id;
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

function closeCharProfile() {
  if (window.AleriaCharacterCombatProfile?.hasUnsavedDraftNotice?.()) {
    const discard = confirm('Stufenaufstieg oder Starthilfe wurden noch nicht gespeichert. Ohne Klick auf „Figur speichern" gehen diese Änderungen jetzt verloren. Trotzdem schließen?');
    if (!discard) return;
  }
  deactivateDialog('char-profile-overlay');
  _editingChar = null;
  _charPortraitUrl = null;
  _charProfileLoadedSnapshot = null;
}

function previewPortraitUrl(url) {
  const err = document.getElementById('cp-portrait-url-error');
  if (!url) {
    err.style.display = 'none';
    syncPortraitDisplay(null, document.getElementById('cp-name').value || '?');
    _charPortraitUrl = null;
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
    err.style.display = 'none';
    _charPortraitUrl = safeUrl;
    syncPortraitDisplay(safeUrl, document.getElementById('cp-name').value || '?');
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
}

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

function collectCharacterProfileDataFromForm() {
  const existing = _editingChar ? (getCharacterById(_editingChar) || {}) : {};
  const profileLink = normalizeCharacterProfileLinkForStorage(document.getElementById('cp-profile-link-url')?.value || '');
  const now = new Date().toISOString();
  const genealogy = getCharacterGenealogyFormData(existing);
  const imageSetData = collectCharacterImageSetEditorData();
  const equipmentData = collectCharacterEquipmentProfileData(existing);
  return {
    id: _editingChar || '',
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
    profileLink,
    playerOwner: normalizeCharacterPlayerOwner(document.getElementById('cp-player-owner')?.value || ''),
    bio: document.getElementById('cp-bio')?.value.trim() || '',
    aliases: parseAliasInput(document.getElementById('cp-aliases')?.value || ''),
    archived: !!document.getElementById('cp-archived')?.checked,
    createdAt: existing.createdAt || now,
    updatedAt: now,
    ...imageSetData,
    inventory: equipmentData.inventory,
    combatProfile: equipmentData.combatProfile,
    ...(existing.localRecord ? {
      localRecord: cloneCharacterStructuredValue(existing.localRecord, existing.localRecord)
    } : {}),
    identity: normalizeCharacterIdentityRecord(existing.identity?.worldPersonId
      ? existing.identity
      : { worldPersonId: genealogy.worldPersonId }),
    genealogy
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
      const imported = {
        ...records[0],
        aliases: Array.isArray(records[0].aliases) ? records[0].aliases : parseAliasInput(records[0].aliases || ''),
        emotes: Array.isArray(records[0].emotes) ? records[0].emotes : [],
        imageSets: Array.isArray(records[0].imageSets) ? records[0].imageSets : []
      };
      populateCharacterProfileForm(imported);
      if (status) {
        status.style.color = 'var(--gold)';
        status.textContent = 'Importiert – mit „Speichern“ dauerhaft übernehmen.';
      }
    } catch (error) {
      if (status) {
        status.style.color = 'var(--red-wax)';
        status.textContent = error.message || 'Charakterdatei konnte nicht importiert werden.';
      }
    }
  }, { once: true });
  input.click();
}

async function saveCharacter() {
  const selectedCommentCharId = _selectedCharId;
  const selectedCommentEmoteIdx = _selectedEmoteIdx;
  const selectedCommentImageSetId = _selectedImageSetId;
  const name     = document.getElementById('cp-name').value.trim();
  const title    = document.getElementById('cp-title').value.trim();
  const fraktion = document.getElementById('cp-fraktion').value.trim();
  const role = document.getElementById('cp-role')?.value.trim() || '';
  const characterStatus = getCharacterStatusValue(document.getElementById('cp-status')?.value || '');
  const relevance = getCharacterRelevanceValue(document.getElementById('cp-relevance')?.value || '');
  const taxonomyPath = document.getElementById('cp-taxonomy-path')?.value.trim() || '';
  const currentLocation = document.getElementById('cp-current-location')?.value.trim() || '';
  const origin = document.getElementById('cp-origin')?.value.trim() || '';
  const plotNode = document.getElementById('cp-plot-node')?.value.trim() || '';
  const profileLinkInput = document.getElementById('cp-profile-link-url')?.value || '';
  const profileLink = normalizeCharacterProfileLinkForStorage(profileLinkInput);
  const playerOwner = normalizeCharacterPlayerOwner(document.getElementById('cp-player-owner')?.value || '');
  const bio      = document.getElementById('cp-bio').value.trim();
  const aliases  = parseAliasInput(document.getElementById('cp-aliases')?.value || '');
  const archived = !!document.getElementById('cp-archived')?.checked;
  const status   = document.getElementById('cp-save-status');
  const sourceId = _editingChar;
  const isBuiltin = isBuiltinCharacterId(sourceId);

  if (!name) {
    status.style.color = 'var(--red-wax)';
    status.textContent = 'Name ist Pflicht.';
    return;
  }

  if (profileLinkInput.trim() && !profileLink) {
    status.style.color = 'var(--red-wax)';
    status.textContent = 'Profil-Link muss mit http(s), /, ./ oder ../ beginnen.';
    return;
  }

  const existing = sourceId ? (getCharacterById(sourceId) || {}) : {};
  const saveTargetId = isBuiltin ? null : sourceId;
  const now = new Date().toISOString();

  const genealogy = getCharacterGenealogyFormData(existing);
  const imageSetData = collectCharacterImageSetEditorData();
  const equipmentData = collectCharacterEquipmentProfileData(existing);

  // Profil, Bilder & Emotes, Inventar und Kampfdaten sind vier eigenständige Bereiche - der
  // gemeinsame "Speichern"-Knopf darf einen davon nur dann tatsächlich mit anfassen, wenn er in
  // dieser Sitzung auch wirklich bearbeitet wurde. Sonst würde z.B. ein reiner Avatar-Upload das
  // Kampfprofil/Inventar mit dem (möglicherweise veralteten) beim Öffnen geladenen Stand
  // überschreiben. Bei einer neu angelegten Figur (kein Schnappschuss vorhanden) greift die
  // Prüfung nicht - die braucht von Anfang an ein vollständiges Kampfprofil/Inventar/Bilderset.
  const baseline = saveTargetId ? _charProfileLoadedSnapshot : null;
  const current = { images: imageSetData, inventory: equipmentData.inventory, combatProfile: equipmentData.combatProfile };
  const changedSections = new Set(window.AleriaCharacterSaveGuard.selectChangedSections(current, baseline, ['images', 'inventory', 'combatProfile']));
  const imagesChanged = changedSections.has('images');
  const inventoryChanged = changedSections.has('inventory');
  const combatProfileChanged = changedSections.has('combatProfile');

  const data = {
    name, title, fraktion, role, status: characterStatus, relevance,
    taxonomyPath, currentLocation, origin, plotNode, profileLink, playerOwner, bio,
    aliases,
    archived,
    createdAt: existing.createdAt || now,
    updatedAt: now,
    ...(imagesChanged ? imageSetData : {}),
    ...(inventoryChanged ? { inventory: equipmentData.inventory } : {}),
    ...(combatProfileChanged ? { combatProfile: equipmentData.combatProfile } : {}),
    ...(existing.localRecord ? {
      localRecord: cloneCharacterStructuredValue(existing.localRecord, existing.localRecord)
    } : {}),
    identity: normalizeCharacterIdentityRecord(existing.identity?.worldPersonId
      ? existing.identity
      : { worldPersonId: genealogy.worldPersonId }),
    genealogy
  };

  status.style.color = 'var(--gold)';
  status.textContent = 'Wird gespeichert…';

  try {
    const newId = await window._fb.saveCharacter(saveTargetId, data);
    if (saveTargetId) {
      const idx = _characters.findIndex(x => x.id === saveTargetId);
      // data kann inventory/combatProfile/Bilder-Felder bewusst auslassen (siehe oben) - der
      // lokale Zwischenspeicher braucht trotzdem den vollständigen Datensatz, sonst "vergisst"
      // die Sitzung diese Felder bis zum nächsten kompletten Neuladen.
      if (idx >= 0) _characters[idx] = { ..._characters[idx], ...data, id: saveTargetId };
    } else {
      if (isBuiltin && sourceId) {
        replaceCharacterIdInTabs(sourceId, newId);
        saveCharTabs();
      }
      _characters.push({ id: newId, ...data });
      _editingChar = newId;
      document.getElementById('cp-delete-btn').style.display = 'inline-block';
      if (_activeCharTab !== 'Alle' && _activeCharTab !== CHARACTER_ARCHIVE_TAB) {
        if (_activeCharSubtab && _activeCharSubtab !== 'Alle') {
          assignCharToSubtab(newId, _activeCharTab, _activeCharSubtab);
        } else {
          assignCharToTab(newId, _activeCharTab);
        }
      }
    }
    // Nach erfolgreichem Speichern gilt der gerade geschriebene Stand als neuer Sync-Punkt fuer
    // die "wurde dieser Bereich in dieser Sitzung ueberhaupt angefasst"-Pruefung oben.
    _charProfileLoadedSnapshot = {
      images: imagesChanged ? imageSetData : _charProfileLoadedSnapshot?.images,
      inventory: inventoryChanged ? equipmentData.inventory : _charProfileLoadedSnapshot?.inventory,
      combatProfile: combatProfileChanged ? equipmentData.combatProfile : _charProfileLoadedSnapshot?.combatProfile
    };
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
    status.textContent = 'Gespeichert ✓';
    setTimeout(() => { status.textContent = ''; }, 2000);
  } catch(e) {
    const message = getFriendlyErrorMessage(e, 'Charakter konnte nicht gespeichert werden.');
    status.style.color = 'var(--red-wax)';
    status.textContent = message;
    showAppStatus(message, 'error');
  }
}

async function deleteCharacter() {
  if (!_editingChar) return;
  if (isBuiltinCharacterId(_editingChar)) {
    if (!confirm('Integrierten Kommentator aus Listen ausblenden? Bestehende Kommentare bleiben erhalten.')) return;
    _hiddenBuiltinCharacterIds.add(_editingChar);
    saveCharTabs();
    renderCharSubtabs();
    renderCharGrid();
    renderCharPickerInForm();
    closeCharProfile();
    return;
  }
  if (!confirm('Charakter wirklich löschen?')) return;

  try {
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
    closeCharProfile();
  } catch(e) {
    const message = getFriendlyErrorMessage(e, 'Charakter konnte nicht gelöscht werden.');
    document.getElementById('cp-save-status').textContent = message;
    showAppStatus(message, 'error');
  }
}
