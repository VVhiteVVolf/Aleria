import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

test('metadata export/import preserves independent false and true view settings', async () => {
  const state = { regionTitle: 'Prüfkarte', regionIcon: '', pins: [], cats: [],
    showMarkers: false, showPinLabels: true, alwaysShowLettering: true };
  const elements = new Map();
  const element = id => {
    if (!elements.has(id)) elements.set(id, { checked: id === 'exp-meta' || id === 'imp-meta', style: {}, classList: { add() {} } });
    return elements.get(id);
  };
  let downloaded;
  const window = { KartoRuntime: { state: () => state, toast() {}, save() {}, applyState() {}, closeModal() {} } };
  vm.runInNewContext(fs.readFileSync(new URL('../assets/js/data/data-manager.js', import.meta.url), 'utf8'), {
    window, document: { getElementById: element, createElement: () => ({ click() {} }) }, Blob,
    URL: { createObjectURL: blob => { downloaded = blob; return 'blob:test'; }, revokeObjectURL() {} },
    localStorage: { getItem: () => null, setItem() {} },
    FileReader: class { readAsText(file) { this.onload({ target: { result: file.content } }); } },
  });
  window.dmgrExport();
  const exported = JSON.parse(await downloaded.text());
  assert.equal(exported.showMarkers, false);
  assert.equal(exported.showPinLabels, true);
  assert.equal(exported.alwaysShowLettering, true);
  Object.assign(state, { showMarkers: true, showPinLabels: false, alwaysShowLettering: false });
  window.dmgrHandleFile({ name: 'karte.json', content: JSON.stringify(exported) });
  window.dmgrImportApply();
  assert.equal(state.showMarkers, false);
  assert.equal(state.showPinLabels, true);
  assert.equal(state.alwaysShowLettering, true);
  // Older metadata files must not reset options absent from the import.
  window.dmgrHandleFile({ name: 'alt.json', content: JSON.stringify({ regionTitle: 'Alter Titel' }) });
  window.dmgrImportApply();
  assert.equal(state.alwaysShowLettering, true);
  assert.equal(state.showPinLabels, true);
});
