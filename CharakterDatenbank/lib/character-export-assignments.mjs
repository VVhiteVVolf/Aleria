// Individual exports carry the same assignedTab contract as the Almanach's
// import dialog. Preserve all existing groups and add each supplied ID once.
export function mergeCharacterExportAssignments(charTabs, exports = []) {
  const result = structuredClone(charTabs || { tabs: ['Alle'], map: {}, subtabs: {}, subtabMap: {} });
  result.tabs ||= ['Alle'];
  result.map ||= {};
  for (const exported of exports) {
    const tab = typeof exported.assignedTab === 'string' ? exported.assignedTab.trim() : '';
    const id = String(exported.character?.id || '').trim();
    if (!tab || tab === 'Alle' || tab === 'Archiv' || !id) continue;
    if (!result.tabs.includes(tab)) result.tabs.push(tab);
    const ids = result.map[tab] ||= [];
    if (!ids.includes(id)) ids.push(id);
  }
  return result;
}
