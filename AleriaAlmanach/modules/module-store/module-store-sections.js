function cleanCustomSection(section) {
  const rawKey = String(section?.key || '').trim();
  const path = getSectionPathParts(section);
  const derivedPath = path.length ? path : (/>/.test(rawKey) ? parseSectionPathInput(rawKey) : []);
  const key = derivedPath.length ? derivedPath[derivedPath.length - 1] : (rawKey || 'Neuer Bereich');
  const iconUrl = String(section?.iconUrl || '').trim().slice(0, 900);
  const next = {
    key,
    tab: String(section?.tab || '').trim() || key,
    desc: String(section?.desc || '').trim(),
    entries: Array.isArray(section?.entries) ? section.entries.map(entry => sanitizeModuleEntry(entry)).filter(Boolean) : [],
  };
  if (iconUrl) next.iconUrl = iconUrl;
  const nodeId = String(section?.nodeId || '').trim();
  if (nodeId) next.nodeId = nodeId;
  if (derivedPath.length) next.path = derivedPath;
  return next;
}

function cleanModuleSectionMove(section) {
  const cleaned = cleanCustomSection({ ...(section || {}), entries: [] });
  return {
    key: cleaned.key,
    tab: cleaned.tab,
    desc: cleaned.desc,
    path: getSectionPathParts(cleaned),
    nodeId: cleaned.nodeId || ensureModuleNodeForSection(cleaned),
    iconUrl: cleaned.iconUrl || ''
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
  if (target.nodeId) _moduleNodeAssignments[id] = target.nodeId;
  if (builtin && makeSectionSignature(builtin.section) === makeSectionSignature(target)) {
    delete _moduleSectionMoves[id];
    delete _moduleNodeAssignments[id];
    return;
  }
  _moduleSectionMoves[id] = target;
}

function clearModuleSectionMove(entryId) {
  const id = String(entryId || '').trim();
  if (id) delete _moduleSectionMoves[id];
  if (id) delete _moduleNodeAssignments[id];
}

const MODULE_DELETE_CONFIRM_CODE = '2603';

function isModuleEntryHidden(entryId) {
  const id = String(entryId || '').trim();
  return !!(id && _hiddenModuleIds?.[id]);
}

function unhideModuleEntry(entryId) {
  const id = String(entryId || '').trim();
  if (id) delete _hiddenModuleIds[id];
}

function getModuleDeleteKind(entryId) {
  const id = String(entryId || '').trim();
  if (!id) return '';
  if (findCustomSectionByEntryId(id)) return 'custom';
  if (findBuiltinSectionByEntryId(id)) return 'builtin';
  if (_entryOverrides[id] || _moduleSectionMoves[id]) return 'override';
  return '';
}

function getModuleDeletePromptLabel(entryId) {
  const current = findCurrentSectionByEntryId(entryId);
  return current?.entry?.title || entryId || 'dieses Modul';
}

function confirmModuleDeleteCode(entryId, options = {}) {
  const label = getModuleDeletePromptLabel(entryId);
  const kind = options.kind || getModuleDeleteKind(entryId);
  const action = kind === 'builtin'
    ? 'ausblenden und lokale Bearbeitungen entfernen'
    : (kind === 'override' ? 'lokale Bearbeitung entfernen' : 'loeschen');
  const code = prompt(`Modul "${label}" ${action}?\n\nGib zur Bestaetigung den Code 2603 ein.`);
  if (code === null) return false;
  if (String(code || '').trim() !== MODULE_DELETE_CONFIRM_CODE) {
    showAppStatus('Falscher Loeschcode. Modul wurde nicht geloescht.', 'error');
    return false;
  }
  return confirm(`Endgueltig fortfahren?\n\nModul: ${label}\nAktion: ${action}`);
}

function deleteModuleById(entryId, options = {}) {
  const id = String(entryId || '').trim();
  if (!id) return { ok: false, reason: 'missing-id' };
  const kind = getModuleDeleteKind(id);
  if (!kind) return { ok: false, reason: 'not-found' };
  if (options.requireCode !== false && !confirmModuleDeleteCode(id, { kind })) {
    return { ok: false, reason: 'cancelled' };
  }

  removeCustomModuleById(id);
  delete _entryOverrides[id];
  clearModuleSectionMove(id);
  if (kind === 'builtin') _hiddenModuleIds[id] = true;
  else delete _hiddenModuleIds[id];

  if (!options.deferSave) saveModuleStore();
  return { ok: true, kind, entryId: id };
}

function findSectionBySignature(signature) {
  return getValidSections().find(section => makeSectionSignature(section) === signature) || null;
}

function getAllSections() {
  ensureKnownModuleSectionNodes();
  const movedEntries = [];
  const builtins = SECTIONS
    .filter(section => section && Array.isArray(section.entries))
    .map(section => ({
      ...deepClone(section),
      entries: (section.entries || []).map(entry => {
        if (!entry?.id) return deepClone(entry);
        if (isModuleEntryHidden(entry.id)) return null;
        const nextEntry = _entryOverrides[entry.id]
          ? deepClone({ ..._entryOverrides[entry.id], id: entry.id })
          : deepClone(entry);
        const assignedNodeId = _moduleNodeAssignments[entry.id];
        const movedSection = assignedNodeId && findModuleSectionNodeById(assignedNodeId)
          ? getModuleSectionFromNode(findModuleSectionNodeById(assignedNodeId), [])
          : getModuleSectionMove(entry.id);
        if (movedSection) {
          movedEntries.push({ section: movedSection, entry: nextEntry });
          return null;
        }
        return nextEntry;
      }).filter(Boolean)
    }));

  const merged = builtins;

  _customSections.forEach(section => {
    const nodeId = section.nodeId || ensureModuleNodeForSection(section);
    const customSection = cleanCustomSection({ ...section, nodeId });
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

  _moduleSectionNodes.forEach(node => {
    const nodeSection = getModuleSectionFromNode(node, []);
    const signature = makeSectionSignature(nodeSection);
    if (!merged.some(existing => makeSectionSignature(existing) === signature)) {
      merged.push(nodeSection);
    }
  });

  return merged.filter(section => section && Array.isArray(section.entries));
}

function getValidSections() {
  const sectionPolicy = globalThis.AleriaModuleSectionPolicy;
  return getAllSections().filter(section => (
    !sectionPolicy?.isRemoved?.(section) && !sectionPolicy?.isHidden?.(section)
  ));
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
  unhideModuleEntry(nextEntry.id);
  clearModuleSectionMove(nextEntry.id);
  const targetNodeId = sectionInput?.nodeId || ensureModuleNodeForSection(sectionInput);
  const targetSection = cleanCustomSection({ ...sectionInput, nodeId: targetNodeId, entries: [] });
  const signature = makeSectionSignature(targetSection);
  let section = _customSections.find(item => makeSectionSignature(item) === signature);
  if (!section) {
    section = cleanCustomSection({ ...targetSection, entries: [] });
    _customSections.push(section);
  } else {
    section.key = targetSection.key;
    section.tab = targetSection.tab;
    section.desc = targetSection.desc;
    section.path = getSectionPathParts(targetSection);
    section.nodeId = targetSection.nodeId;
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

function setModuleSceneStartDateAleria(entryId, pageIndex, value) {
  const id = String(entryId || '').trim();
  const index = Math.max(0, Math.floor(Number(pageIndex) || 0));
  const date = typeof sanitizeAleriaDate === 'function' ? sanitizeAleriaDate(value) : value;
  if (!id || typeof hasAleriaDate !== 'function' || !hasAleriaDate(date)) return false;

  const current = findCurrentSectionByEntryId(id);
  if (!current?.entry) return false;
  const entry = deepClone(current.entry);
  const pages = Array.isArray(entry.pages) ? entry.pages.map(page => ({ ...(page || {}) })) : [];
  const page = pages[index];
  if (!page?.sessionPage || hasAleriaDate(page.sessionDateAleria)) return false;

  page.sessionDateAleria = date;
  entry.pages = pages;
  const savedEntry = sanitizeModuleEntry({ ...entry, id });
  if (findCustomSectionByEntryId(id)) {
    removeCustomModuleById(id);
    upsertCustomModule(current.section, savedEntry);
  } else {
    _entryOverrides[id] = savedEntry;
    unhideModuleEntry(id);
  }

  if (typeof currentEntry !== 'undefined' && String(currentEntry?.id || '') === id) {
    currentEntry = savedEntry;
  }
  saveModuleStore();
  document.dispatchEvent(new CustomEvent('almanach:scene-start-date-assigned', {
    detail: { entryId: id, pageIndex: index, date: deepClone(date) }
  }));
  return true;
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
      desc: current.section.desc || '',
      path: getSectionPathParts(current.section),
      nodeId: current.section.nodeId || '',
      iconUrl: current.section.iconUrl || ''
    },
    entry: sanitizeModuleEntry(current.entry)
  };
}
