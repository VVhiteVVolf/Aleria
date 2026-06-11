function cleanCustomSection(section) {
  const next = {
    key: String(section?.key || '').trim() || 'Neuer Bereich',
    tab: String(section?.tab || section?.key || '').trim() || 'Neuer Bereich',
    desc: String(section?.desc || '').trim(),
    entries: Array.isArray(section?.entries) ? section.entries.map(entry => sanitizeModuleEntry(entry)).filter(Boolean) : [],
  };
  return next;
}

function cleanModuleSectionMove(section) {
  const cleaned = cleanCustomSection({ ...(section || {}), entries: [] });
  return {
    key: cleaned.key,
    tab: cleaned.tab,
    desc: cleaned.desc
  };
}

function getModuleSectionMove(entryId) {
  const id = String(entryId || '').trim();
  return id && _moduleSectionMoves[id] ? cleanModuleSectionMove(_moduleSectionMoves[id]) : null;
}

function setModuleSectionMove(entryId, section) {
  const id = String(entryId || '').trim();
  if (!id) return;
  const builtin = findBuiltinSectionByEntryId(id);
  const target = cleanModuleSectionMove(section);
  if (builtin && makeSectionSignature(builtin.section) === makeSectionSignature(target)) {
    delete _moduleSectionMoves[id];
    return;
  }
  _moduleSectionMoves[id] = target;
}

function clearModuleSectionMove(entryId) {
  const id = String(entryId || '').trim();
  if (id) delete _moduleSectionMoves[id];
}

function findSectionBySignature(signature) {
  return getValidSections().find(section => makeSectionSignature(section) === signature) || null;
}

function getAllSections() {
  const movedEntries = [];
  const builtins = SECTIONS
    .filter(section => section && Array.isArray(section.entries))
    .map(section => ({
      ...deepClone(section),
      entries: (section.entries || []).map(entry => {
        if (!entry?.id) return deepClone(entry);
        const nextEntry = _entryOverrides[entry.id]
          ? deepClone({ ..._entryOverrides[entry.id], id: entry.id })
          : deepClone(entry);
        const movedSection = getModuleSectionMove(entry.id);
        if (movedSection) {
          movedEntries.push({ section: movedSection, entry: nextEntry });
          return null;
        }
        return nextEntry;
      }).filter(Boolean)
    }));

  const merged = builtins;

  _customSections.forEach(section => {
    const customSection = cleanCustomSection(section);
    const signature = makeSectionSignature(customSection);
    const target = merged.find(existing => makeSectionSignature(existing) === signature);
    if (target) {
      target.entries.push(...customSection.entries.map(entry => deepClone(entry)));
    } else {
      merged.push(customSection);
    }
  });

  movedEntries.forEach(item => {
    const signature = makeSectionSignature(item.section);
    let target = merged.find(existing => makeSectionSignature(existing) === signature);
    if (!target) {
      target = cleanCustomSection({ ...item.section, entries: [] });
      merged.push(target);
    }
    target.entries = (target.entries || []).filter(entry => entry?.id !== item.entry.id);
    target.entries.push(deepClone(item.entry));
  });

  return merged.filter(section => section && Array.isArray(section.entries));
}

function getValidSections() {
  return getAllSections();
}

function findBuiltinSectionByEntryId(entryId) {
  for (const section of SECTIONS) {
    const found = (section.entries || []).find(entry => entry?.id === entryId);
    if (found) return { section, entry: found };
  }
  return null;
}

function findCustomSectionByEntryId(entryId) {
  for (const section of _customSections) {
    const found = (section.entries || []).find(entry => entry?.id === entryId);
    if (found) return { section, entry: found };
  }
  return null;
}

function findCurrentSectionByEntryId(entryId) {
  for (const section of getValidSections()) {
    const found = (section.entries || []).find(entry => entry?.id === entryId);
    if (found) return { section, entry: found };
  }
  return null;
}

function upsertCustomModule(sectionInput, entry) {
  const nextEntry = sanitizeModuleEntry(entry);
  clearModuleSectionMove(nextEntry.id);
  const targetSection = cleanCustomSection({ ...sectionInput, entries: [] });
  const signature = makeSectionSignature(targetSection);
  let section = _customSections.find(item => makeSectionSignature(item) === signature);
  if (!section) {
    section = cleanCustomSection({ ...targetSection, entries: [] });
    _customSections.push(section);
  } else {
    section.key = targetSection.key;
    section.tab = targetSection.tab;
    section.desc = targetSection.desc;
  }
  const existingIndex = (section.entries || []).findIndex(item => item.id === nextEntry.id);
  if (existingIndex >= 0) section.entries[existingIndex] = nextEntry;
  else section.entries.push(nextEntry);
  _customSections = _customSections
    .map(cleanCustomSection);
}

function removeCustomModuleById(entryId) {
  _customSections = _customSections
    .map(section => ({
      ...section,
      entries: (section.entries || []).filter(entry => entry?.id !== entryId)
    }));
}

function buildModuleExportPayload(entryId) {
  const current = findCurrentSectionByEntryId(entryId);
  if (!current) return null;
  return {
    type: 'aleria-module',
    version: MODULE_EXPORT_SCHEMA_VERSION,
    section: {
      key: current.section.key,
      tab: current.section.tab || current.section.key,
      desc: current.section.desc || ''
    },
    entry: sanitizeModuleEntry(current.entry)
  };
}
