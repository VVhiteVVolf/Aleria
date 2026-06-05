let _editingChar = null;
let _charPortraitUrl = null;
const MAX_EMOTES = 40;
let _emoteSlots = [];

function openCharProfile(id) {
  _editingChar = id;
  _charPortraitUrl = null;
  const c = id ? (getCharacterById(id) || {}) : {};
  const isBuiltin = isBuiltinCharacterId(id);

  document.getElementById('cp-name').value     = c.name     || '';
  document.getElementById('cp-title').value    = c.title    || '';
  document.getElementById('cp-fraktion').value = c.fraktion || '';
  document.getElementById('cp-profile-link-url').value = c.profileLink || '';
  document.getElementById('cp-player-owner').value = normalizeCharacterPlayerOwner(c.playerOwner);
  document.getElementById('cp-bio').value      = c.bio      || '';
  document.getElementById('cp-aliases').value  = (c.aliases || []).join(', ');
  document.getElementById('cp-archived').checked = !!c.archived;
  document.getElementById('cp-status').textContent = '';

  syncPortraitDisplay(c.portrait || null, c.name || '?');
  syncProfileLinkDisplay(c.profileLink || '', c.name || '');
  const urlField = document.getElementById('cp-portrait-url');
  if (urlField) urlField.value = c.portrait || '';

  initEmoteSlots(c.emotes || []);

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

function switchCharTab(tab) {
  document.querySelectorAll('.char-profile-tab').forEach((btn, i) => {
    const tabs = ['info', 'bilder'];
    btn.classList.toggle('active', tabs[i] === tab);
  });
  document.getElementById('cp-tab-info').classList.toggle('active', tab === 'info');
  document.getElementById('cp-tab-bilder').classList.toggle('active', tab === 'bilder');
}

function closeCharProfile() {
  deactivateDialog('char-profile-overlay');
  _editingChar = null;
  _charPortraitUrl = null;
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
}

function removeEmote(i) {
  _emoteSlots[i] = null;
  renderEmoteGrid();
}

function collectCharacterProfileDataFromForm() {
  const existing = _editingChar ? (getCharacterById(_editingChar) || {}) : {};
  const profileLink = normalizeCharacterProfileLinkForStorage(document.getElementById('cp-profile-link-url')?.value || '');
  return {
    id: _editingChar || '',
    name: document.getElementById('cp-name')?.value.trim() || existing.name || '',
    title: document.getElementById('cp-title')?.value.trim() || '',
    fraktion: document.getElementById('cp-fraktion')?.value.trim() || '',
    profileLink,
    playerOwner: normalizeCharacterPlayerOwner(document.getElementById('cp-player-owner')?.value || ''),
    bio: document.getElementById('cp-bio')?.value.trim() || '',
    aliases: parseAliasInput(document.getElementById('cp-aliases')?.value || ''),
    archived: !!document.getElementById('cp-archived')?.checked,
    portrait: normalizeImageUrlForStorage(document.getElementById('cp-portrait-url')?.value || '') || normalizeImageUrlForStorage(existing.portrait) || null,
    emotes: (_emoteSlots || [])
      .filter(Boolean)
      .map(e => ({ img: normalizeImageUrlForStorage(e.img), label: e.label || '' }))
      .filter(e => e.img),
    emotesOverride: true
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

async function saveCharacter() {
  const selectedCommentCharId = _selectedCharId;
  const selectedCommentEmoteIdx = _selectedEmoteIdx;
  const name     = document.getElementById('cp-name').value.trim();
  const title    = document.getElementById('cp-title').value.trim();
  const fraktion = document.getElementById('cp-fraktion').value.trim();
  const profileLinkInput = document.getElementById('cp-profile-link-url')?.value || '';
  const profileLink = normalizeCharacterProfileLinkForStorage(profileLinkInput);
  const playerOwner = normalizeCharacterPlayerOwner(document.getElementById('cp-player-owner')?.value || '');
  const bio      = document.getElementById('cp-bio').value.trim();
  const aliases  = parseAliasInput(document.getElementById('cp-aliases')?.value || '');
  const archived = !!document.getElementById('cp-archived')?.checked;
  const status   = document.getElementById('cp-status');
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

  const data = {
    name, title, fraktion, profileLink, playerOwner, bio,
    aliases,
    archived,
    portrait: normalizeImageUrlForStorage(document.getElementById('cp-portrait-url').value) || normalizeImageUrlForStorage(existing.portrait) || null,
    emotes: _emoteSlots
      .filter(Boolean)
      .map(e => ({ img: normalizeImageUrlForStorage(e.img), label: e.label || '' }))
      .filter(e => e.img),
    emotesOverride: true
  };

  status.style.color = 'var(--gold)';
  status.textContent = 'Wird gespeichert…';

  try {
    const newId = await window._fb.saveCharacter(saveTargetId, data);
    if (saveTargetId) {
      const idx = _characters.findIndex(x => x.id === saveTargetId);
      if (idx >= 0) _characters[idx] = { id: saveTargetId, ...data };
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
    renderCharSubtabs();
    renderCharGrid();
    renderCharPickerInForm();
    if (typeof isCommentFormOpen === 'function' && isCommentFormOpen() && selectedCommentCharId) {
      const refreshed = getAvailableCommentCharacterById(selectedCommentCharId) || getAvailableCommentCharacterByName(name);
      if (refreshed) {
        selectCharForComment(refreshed.id);
        if (Number.isInteger(selectedCommentEmoteIdx) && refreshed.emotes?.[selectedCommentEmoteIdx]) {
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
    document.getElementById('cp-status').textContent = message;
    showAppStatus(message, 'error');
  }
}
