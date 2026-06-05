const CHARACTER_ARCHIVE_EXPORT_VERSION = 2;

function buildCharacterArchivePayload() {
  return {
    type: 'aleria-character-archive',
    version: CHARACTER_ARCHIVE_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    characters: cloneForBackup(_characters || []),
    charTabs: {
      tabs: cloneForBackup((_charTabs || ['Alle']).filter(tab => tab !== CHARACTER_ARCHIVE_TAB)),
      map: cloneForBackup(_charTabMap || {}),
      subtabs: cloneForBackup(_charSubtabs || {}),
      subtabMap: cloneForBackup(_charSubtabMap || {}),
      hiddenBuiltins: Array.from(_hiddenBuiltinCharacterIds || [])
    }
  };
}

function exportCharacterArchive() {
  const payload = buildCharacterArchivePayload();
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  downloadJsonFile(payload, `aleria-charakterarchiv-${stamp}.json`);
  showAppStatus(`Charakterarchiv exportiert: ${payload.characters.length} angelegte Charaktere.`, 'success');
}

function normalizeCharacterImportPayload(parsed) {
  if (!parsed || typeof parsed !== 'object') throw new Error('Charakterdatei ist ungültig.');
  if (parsed.type === 'aleria-almanach-backup') {
    return {
      characters: Array.isArray(parsed.characters) ? parsed.characters : [],
      charTabs: parsed.charTabs && typeof parsed.charTabs === 'object' ? parsed.charTabs : null
    };
  }
  if (parsed.type === 'aleria-character-archive') {
    return {
      characters: Array.isArray(parsed.characters) ? parsed.characters : [],
      charTabs: parsed.charTabs && typeof parsed.charTabs === 'object' ? parsed.charTabs : null
    };
  }
  if (parsed.type === 'aleria-character' && parsed.character) {
    return {
      characters: [parsed.character],
      charTabs: parsed.assignedTab && parsed.character?.id
        ? { tabs: ['Alle', parsed.assignedTab], map: { [parsed.assignedTab]: [parsed.character.id] }, hiddenBuiltins: [] }
        : null
    };
  }
  if (Array.isArray(parsed)) {
    return { characters: parsed, charTabs: null };
  }
  if (parsed.name || parsed.id) {
    return { characters: [parsed], charTabs: null };
  }
  throw new Error('Die Datei enthält keine erkennbaren Charakterdaten.');
}

async function importCharacterArchivePayload(payload) {
  const normalized = normalizeCharacterImportPayload(payload);
  const characters = normalized.characters.filter(char => char && typeof char === 'object');
  if (!characters.length) throw new Error('Keine Charaktere zum Import gefunden.');
  if (!window._fb?.saveCharacter) throw new Error('Charaktere können ohne Firebase-Verbindung nicht importiert werden.');
  if (!confirm(`Charakterdaten importieren?\n\nCharaktere: ${characters.length}\nGruppen/Reiter: ${normalized.charTabs ? 'ja' : 'nein'}\n\nGleiche IDs werden überschrieben, nicht enthaltene Charaktere bleiben bestehen.`)) {
    return;
  }

  for (const char of characters) {
    const id = String(char.id || '').trim();
    const data = {
      ...char,
      aliases: Array.isArray(char.aliases) ? char.aliases : parseAliasInput(char.aliases || ''),
      archived: !!char.archived,
      emotes: Array.isArray(char.emotes) ? char.emotes : []
    };
    delete data.id;
    await window._fb.saveCharacter(id || null, data);
  }

  if (normalized.charTabs) {
    const incomingTabs = Array.isArray(normalized.charTabs.tabs) ? normalized.charTabs.tabs : [];
    incomingTabs.forEach(tab => {
      if (tab && tab !== CHARACTER_ARCHIVE_TAB && !_charTabs.includes(tab)) _charTabs.push(tab);
    });
    Object.entries(normalized.charTabs.map || {}).forEach(([tab, ids]) => {
      if (!tab || tab === CHARACTER_ARCHIVE_TAB) return;
      if (!_charTabMap[tab]) _charTabMap[tab] = [];
      (Array.isArray(ids) ? ids : []).forEach(id => {
        if (id && !_charTabMap[tab].includes(id)) _charTabMap[tab].push(id);
      });
    });
    Object.entries(normalized.charTabs.subtabs || {}).forEach(([tab, subtabs]) => {
      if (!tab || tab === CHARACTER_ARCHIVE_TAB) return;
      if (!_charSubtabs[tab]) _charSubtabs[tab] = [];
      (Array.isArray(subtabs) ? subtabs : []).forEach(subtab => {
        if (subtab && subtab !== 'Alle' && !_charSubtabs[tab].includes(subtab)) _charSubtabs[tab].push(subtab);
      });
    });
    Object.entries(normalized.charTabs.subtabMap || {}).forEach(([tab, subtabMap]) => {
      if (!tab || tab === CHARACTER_ARCHIVE_TAB || !subtabMap || typeof subtabMap !== 'object') return;
      if (!_charSubtabMap[tab]) _charSubtabMap[tab] = {};
      Object.entries(subtabMap).forEach(([subtab, ids]) => {
        if (!subtab || subtab === 'Alle') return;
        if (!_charSubtabs[tab]) _charSubtabs[tab] = [];
        if (!_charSubtabs[tab].includes(subtab)) _charSubtabs[tab].push(subtab);
        if (!_charSubtabMap[tab][subtab]) _charSubtabMap[tab][subtab] = [];
        (Array.isArray(ids) ? ids : []).forEach(id => {
          if (id && !_charSubtabMap[tab][subtab].includes(id)) _charSubtabMap[tab][subtab].push(id);
        });
      });
    });
    delete _charTabMap[CHARACTER_ARCHIVE_TAB];
    delete _charSubtabs[CHARACTER_ARCHIVE_TAB];
    delete _charSubtabMap[CHARACTER_ARCHIVE_TAB];
    if (Array.isArray(normalized.charTabs.hiddenBuiltins)) {
      normalized.charTabs.hiddenBuiltins.forEach(id => _hiddenBuiltinCharacterIds.add(id));
    }
    normalizeCharTabState();
    await saveCharTabs();
  }

  _characters = await window._fb.loadCharacters();
  _charactersLoaded = true;
  renderCharSubtabs();
  renderCharGrid();
  renderCharPickerInForm();
  refreshAllModuleCastPickers();
  showAppStatus(`Charakterimport abgeschlossen: ${characters.length} Charaktere.`, 'success');
}

function openCharacterImportFilePicker() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.addEventListener('change', () => handleCharacterImportFile(input), { once: true });
  input.click();
}

function handleCharacterImportFile(input) {
  const file = input?.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener('load', async () => {
    try {
      const parsed = JSON.parse(String(reader.result || ''));
      await importCharacterArchivePayload(parsed);
    } catch (error) {
      console.error('character import failed:', error);
      showAppStatus(error.message || 'Charakterimport fehlgeschlagen.', 'error');
    }
  });
  reader.addEventListener('error', () => showAppStatus('Charakterdatei konnte nicht gelesen werden.', 'error'));
  reader.readAsText(file, 'utf-8');
}
