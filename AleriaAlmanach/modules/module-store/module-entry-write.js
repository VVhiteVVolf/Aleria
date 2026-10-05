// Shared entry persistence for small edits outside the full module editor.
// Storage and remote synchronization remain owned by saveModuleStore.
function persistExistingModuleEntry(sourceEntry, section) {
  const entry = sanitizeModuleEntry(sourceEntry);
  if (!entry?.id || !section) throw new Error('Das Modul ist nicht mehr verfügbar.');
  const builtin = findBuiltinSectionByEntryId(entry.id);
  if (builtin) {
    _entryOverrides[entry.id] = entry;
    unhideModuleEntry(entry.id);
    setModuleSectionMove(entry.id, section);
  } else {
    removeCustomModuleById(entry.id);
    upsertCustomModule(section, entry);
  }
  if (saveModuleStore() === false) throw new Error('Die Änderung konnte nicht lokal gesichert werden.');
  return entry;
}

function setGroupActiveSession(entryId, threadId) {
  if (!canEditModuleContent()) throw new Error('Bitte zuerst die Bearbeitung freischalten.');
  const found = findCurrentSectionByEntryId(entryId);
  const source = found?.section?.entries?.find(entry => entry.id === entryId);
  if (!source) throw new Error('Die Gruppe ist nicht mehr verfügbar.');
  const entry = JSON.parse(JSON.stringify(source));
  const page = entry.pages?.find(page => page.landing?.group);
  if (!page) throw new Error('Diese Gruppe hat keine Gruppenübersicht.');
  const group = page.landing.group;
  group.sceneThreads = [...new Set([...(group.sceneThreads || []), group.threadId, threadId].filter(Boolean))];
  group.threadId = threadId;
  return persistExistingModuleEntry(entry, found.section);
}
