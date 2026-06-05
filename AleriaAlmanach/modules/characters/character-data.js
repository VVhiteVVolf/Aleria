let _currentModuleCommenterEntryId = '';
let _currentModuleCommenterNames = new Set();

function getCharacterNameKeys(char) {
  return new Set([
    char?.name,
    ...(Array.isArray(char?.aliases) ? char.aliases : [])
  ].map(value => normalizeSearchText(value || '')).filter(Boolean));
}

function findCharacterByNameKeys(characters, source) {
  const sourceKeys = getCharacterNameKeys(source);
  if (!sourceKeys.size) return null;
  return characters.find(char =>
    Array.from(getCharacterNameKeys(char)).some(key => sourceKeys.has(key))
  ) || null;
}

function normalizeCharacterPlayerOwner(value) {
  const normalized = normalizeSearchText(value || '');
  if (normalized === 'erdi') return 'erdi';
  if (normalized === 'patrick') return 'patrick';
  return '';
}

function getCharacterPlayerOwnerLabel(value) {
  const owner = normalizeCharacterPlayerOwner(value);
  if (owner === 'erdi') return 'Erdi';
  if (owner === 'patrick') return 'Patrick';
  return '';
}

function cloneCharacterRecord(char) {
  return {
    ...char,
    playerOwner: normalizeCharacterPlayerOwner(char?.playerOwner || char?.playedBy || char?.player),
    aliases: Array.isArray(char?.aliases)
      ? char.aliases.map(alias => String(alias || '').trim()).filter(Boolean)
      : String(char?.aliases || '').split(/[\n,;]+/).map(alias => alias.trim()).filter(Boolean),
    emotes: Array.isArray(char?.emotes)
      ? char.emotes
          .filter(emote => emote && emote.img)
          .map(emote => ({ img: emote.img, label: emote.label || emote.name || '' }))
      : []
  };
}

function mergeCharacterRecords(primary, fallback) {
  const first = cloneCharacterRecord(primary || {});
  const second = cloneCharacterRecord(fallback || {});
  const merged = {
    ...second,
    ...first,
    id: first.id || second.id || null,
    name: first.name || second.name || '',
    title: first.title || second.title || '',
    fraktion: first.fraktion || second.fraktion || '',
    faction: first.faction || second.faction || '',
    bio: first.bio || second.bio || '',
    portrait: first.portrait || second.portrait || null,
    profileLink: first.profileLink || second.profileLink || '',
    playerOwner: first.playerOwner || second.playerOwner || '',
    _builtin: !!(first._builtin || second._builtin),
    emotesOverride: !!first.emotesOverride,
  };

  const aliasSeen = new Set();
  merged.aliases = [...(first.aliases || []), ...(second.aliases || [])].filter(alias => {
    const key = normalizeSearchText(alias);
    if (!key || aliasSeen.has(key)) return false;
    aliasSeen.add(key);
    return true;
  });

  const seen = new Set();
  const emoteSource = first.emotesOverride
    ? (first.emotes || [])
    : [...(first.emotes || []), ...(second.emotes || [])];
  merged.emotes = emoteSource.filter(emote => {
    const key = `${emote.img}::${emote.label || ''}`;
    if (!emote.img || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return merged;
}

function getBuiltinCommentCharacterById(id) {
  const safeId = String(id || '').trim();
  if (!safeId || typeof BUILTIN_COMMENT_CHARACTERS !== 'object') return null;
  const direct = BUILTIN_COMMENT_CHARACTERS[safeId];
  if (direct) return cloneCharacterRecord(direct);
  const matched = Object.values(BUILTIN_COMMENT_CHARACTERS)
    .find(char => String(char?.id || '').trim() === safeId);
  return matched ? cloneCharacterRecord(matched) : null;
}

function getBuiltinCommentCharacters() {
  if (typeof BUILTIN_COMMENT_CHARACTERS !== 'object') return [];
  return Object.values(BUILTIN_COMMENT_CHARACTERS)
    .filter(Boolean)
    .map(char => ({ ...cloneCharacterRecord(char), _builtin: true }));
}

function resolveCommentCastCharacter(castId, allCharacters, byId) {
  const safeId = String(castId || '').trim();
  if (!safeId) return null;
  const direct = byId.get(safeId);
  if (direct) return direct;

  const builtin = getBuiltinCommentCharacterById(safeId);
  if (!builtin) return null;

  const savedMatch = findCharacterByNameKeys(allCharacters, builtin);
  return savedMatch ? mergeCharacterRecords(savedMatch, builtin) : builtin;
}

function makeBuiltinCharacterId(name) {
  const slug = String(name || 'figur')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'figur';
  return `builtin:character:${slug}`;
}

function isBuiltinCharacterId(id) {
  const safeId = String(id || '').trim();
  if (!safeId) return false;
  if (_characters.some(char => String(char.id || '').trim() === safeId)) return false;
  return safeId.startsWith('builtin:');
}

function buildLibraryCharacterFromCommentator(figure, preferredMood) {
  if (!figure?.name) return null;
  return {
    id: makeBuiltinCharacterId(figure.name),
    name: figure.name,
    title: figure.title || '',
    portrait: getPrimaryAvatar(figure, preferredMood),
    emotes: buildAvatarEmotes(figure),
    _builtin: true,
  };
}

let _builtinLibraryCharactersCache = null;

function getBuiltinLibraryCharacters() {
  if (_builtinLibraryCharactersCache) {
    return _builtinLibraryCharactersCache.map(cloneCharacterRecord);
  }

  const combined = new Map();
  const addFigure = (figure, preferredMood) => {
    const built = buildLibraryCharacterFromCommentator(figure, preferredMood);
    if (!built) return;
    const key = normalizeSearchText(built.name || built.id);
    const existing = combined.get(key);
    combined.set(key, existing ? mergeCharacterRecords(existing, built) : built);
  };

  getValidSections().forEach(section => {
    (section.entries || []).forEach(entry => {
      addFigure(entry.commentator, entry.commentatorMood);
      (entry.pages || []).forEach(page => {
        if (page?.commentator) {
          addFigure(page.commentator, page.commentatorMood || entry.commentatorMood);
        }
      });
    });
  });

  _builtinLibraryCharactersCache = Array.from(combined.values()).sort((a, b) =>
    (a.name || '').localeCompare(b.name || '', 'de', { sensitivity: 'base' })
  );
  return _builtinLibraryCharactersCache.map(cloneCharacterRecord);
}

function getCharacterById(id) {
  if (!id) return null;
  const safeId = String(id || '').trim();
  const saved = _characters.find(char => String(char.id || '').trim() === safeId);
  if (saved) return saved;

  const library = getBuiltinLibraryCharacters().find(char => String(char.id || '').trim() === safeId);
  if (library) return library;

  const builtinComment = getBuiltinCommentCharacterById(safeId);
  if (!builtinComment) return null;

  const savedMatch = findCharacterByNameKeys(_characters, builtinComment);
  return savedMatch ? mergeCharacterRecords(savedMatch, builtinComment) : builtinComment;
}

function getAllCharacterRecords() {
  const combined = new Map();
  const addCombined = char => {
    if (!char) return;
    const key = normalizeSearchText(char.name || char.id);
    if (!key) return;
    const existing = combined.get(key);
    combined.set(key, existing ? mergeCharacterRecords(char, existing) : cloneCharacterRecord(char));
  };

  getBuiltinLibraryCharacters().forEach(char => {
    if (_hiddenBuiltinCharacterIds.has(String(char.id || ''))) return;
    addCombined(char);
  });

  getBuiltinCommentCharacters().forEach(char => {
    if (_hiddenBuiltinCharacterIds.has(String(char.id || ''))) return;
    addCombined(char);
  });

  _characters.forEach(char => {
    addCombined(char);
  });

  return Array.from(combined.values()).sort((a, b) =>
    (a.name || '').localeCompare(b.name || '', 'de', { sensitivity: 'base' })
  );
}

function getVisibleCharacterRecords() {
  return getAllCharacterRecords().filter(char => !char.archived);
}

function replaceCharacterIdInTabs(fromId, toId) {
  if (!fromId || !toId || fromId === toId) return;
  Object.keys(_charTabMap).forEach(tab => {
    const seen = new Set();
    _charTabMap[tab] = (_charTabMap[tab] || [])
      .map(id => id === fromId ? toId : id)
      .filter(id => {
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      });
  });
  Object.keys(_charSubtabMap).forEach(tab => {
    Object.keys(_charSubtabMap[tab] || {}).forEach(subtab => {
      const seen = new Set();
      _charSubtabMap[tab][subtab] = (_charSubtabMap[tab][subtab] || [])
        .map(id => id === fromId ? toId : id)
        .filter(id => {
          if (!id || seen.has(id)) return false;
          seen.add(id);
          return true;
        });
    });
  });
}

function isCharacterCommentedInCurrentModule(char) {
  const entry = currentEntry ? getRenderableEntry(currentEntry) : null;
  if (!entry?.id || _currentModuleCommenterEntryId !== entry.id) return false;
  return Array.from(getCharacterNameKeys(char)).some(key => _currentModuleCommenterNames.has(key));
}

async function refreshCurrentModuleCommenterHighlights() {
  const entry = currentEntry ? getRenderableEntry(currentEntry) : null;
  if (!entry?.id) return;
  const backend = typeof getCommentBackend === 'function'
    ? await getCommentBackend({ timeoutMs: 800 })
    : window._fb;
  if (!backend?.loadComments) return;
  const threadIds = getModuleCommentThreadIds(entry);
  if (!threadIds.length) return;

  try {
    const groups = await Promise.all(threadIds.map(threadId =>
      backend.loadComments(threadId).catch(error => {
        console.warn('commenter highlight load failed:', threadId, error);
        return [];
      })
    ));
    const names = new Set();
    groups.flat().forEach(comment => {
      if (comment?.narrator) return;
      const nameKey = normalizeSearchText(comment?.charName || '');
      if (nameKey) names.add(nameKey);
    });
    _currentModuleCommenterEntryId = entry.id;
    _currentModuleCommenterNames = names;
    renderCharPickerInForm();
  } catch (error) {
    console.warn('commenter highlight refresh failed:', error);
  }
}

function getAvailableCommentCharacters() {
  const castIds = getCurrentCommentCastIds();
  const allCharacters = getVisibleCharacterRecords();
  const byId = new Map(allCharacters.map(char => [String(char.id || '').trim(), cloneCharacterRecord(char)]));

  if (castIds.length) {
    const prioritized = [];
    const seenIds = new Set();
    const seenNames = new Set();
    castIds.forEach(id => {
      const safeId = String(id || '').trim();
      if (!safeId || seenIds.has(safeId)) return;
      const matched = resolveCommentCastCharacter(safeId, allCharacters, byId);
      if (!matched) return;
      const nameKey = normalizeSearchText(matched.name || matched.id);
      seenIds.add(safeId);
      if (matched.id) seenIds.add(String(matched.id).trim());
      if (nameKey) seenNames.add(nameKey);
      prioritized.push(matched);
    });

    const remainder = allCharacters.filter(char => {
      const charId = String(char.id || '').trim();
      const nameKey = normalizeSearchText(char.name || char.id);
      return !seenIds.has(charId) && !seenNames.has(nameKey);
    });

    return [...prioritized, ...remainder];
  }

  return allCharacters;
}

function getAvailableCommentCharacterById(id) {
  const safeId = String(id || '').trim();
  const characters = getAvailableCommentCharacters();
  const direct = characters.find(char => String(char.id || '').trim() === safeId);
  if (direct) return direct;
  const builtin = getBuiltinCommentCharacterById(safeId);
  if (!builtin) return null;
  return findCharacterByNameKeys(characters, builtin) || builtin;
}

function getAvailableCommentCharacterByName(name) {
  const needle = normalizeSearchText(name);
  return getAvailableCommentCharacters().find(char => getCharacterNameKeys(char).has(needle)) || null;
}

function buildCharacterSearchText(char) {
  const parts = [
    char.id,
    char.name,
    ...(char.aliases || []),
    char.title,
    char.fraktion,
    char.faction,
    char.profileLink,
    getCharacterPlayerOwnerLabel(char.playerOwner),
    char.role,
    char.bio,
    char.note,
    char.notes,
  ];

  (char.emotes || []).forEach(emote => parts.push(emote.label, emote.name));

  return normalizeSearchText(parts.filter(Boolean).join(' '));
}
