// Presentation and retention policy for top-level Almanach module sections.
// Removed tabs are pruned from persisted module-store payloads. Hidden tabs keep
// their data intact, but are excluded from the public archive navigation.

const REMOVED_ALMANACH_MODULE_TABS = new Set(['Familien']);
const HIDDEN_ALMANACH_MODULE_TABS = new Set(['Test']);

function getAlmanachModuleSectionTab(section = {}) {
  return String(section?.tab || section?.key || section?.title || '').trim();
}

function isRemovedAlmanachModuleSection(section = {}) {
  return REMOVED_ALMANACH_MODULE_TABS.has(getAlmanachModuleSectionTab(section));
}

function isHiddenAlmanachModuleSection(section = {}) {
  return HIDDEN_ALMANACH_MODULE_TABS.has(getAlmanachModuleSectionTab(section));
}

function unwrapAlmanachModuleStorePayload(payload) {
  if (typeof payload?.data !== 'string') return payload && typeof payload === 'object' ? payload : {};
  try {
    return JSON.parse(payload.data || '{}');
  } catch {
    return {};
  }
}

function hasRemovedAlmanachModuleContent(payload) {
  const source = unwrapAlmanachModuleStorePayload(payload);
  return (Array.isArray(source.customSections) && source.customSections.some(isRemovedAlmanachModuleSection))
    || (Array.isArray(source.moduleSectionNodes) && source.moduleSectionNodes.some(isRemovedAlmanachModuleSection))
    || Object.values(source.moduleSectionMoves || {}).some(isRemovedAlmanachModuleSection);
}

globalThis.AleriaModuleSectionPolicy = Object.freeze({
  getTab: getAlmanachModuleSectionTab,
  hasRemovedContent: hasRemovedAlmanachModuleContent,
  isHidden: isHiddenAlmanachModuleSection,
  isRemoved: isRemovedAlmanachModuleSection
});
