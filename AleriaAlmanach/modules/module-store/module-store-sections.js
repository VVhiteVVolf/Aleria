function cleanCustomSection(section) {
  const next = {
    key: String(section?.key || '').trim() || 'Neuer Bereich',
    tab: String(section?.tab || section?.key || '').trim() || 'Neuer Bereich',
    desc: String(section?.desc || '').trim(),
    entries: Array.isArray(section?.entries) ? section.entries.map(entry => sanitizeModuleEntry(entry)).filter(Boolean) : [],
  };
  return next;
}

function getAllSections() {
  const builtins = SECTIONS
    .filter(section => section && Array.isArray(section.entries))
    .map(section => ({
      ...deepClone(section),
      entries: (section.entries || []).map(entry => {
        if (!entry?.id) return deepClone(entry);
        if (_entryOverrides[entry.id]) return deepClone({ ..._entryOverrides[entry.id], id: entry.id });
        return deepClone(entry);
      })
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
    .map(cleanCustomSection)
    .filter(customSection => customSection.entries.length);
}

function removeCustomModuleById(entryId) {
  _customSections = _customSections
    .map(section => ({
      ...section,
      entries: (section.entries || []).filter(entry => entry?.id !== entryId)
    }))
    .filter(section => section.entries.length);
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
