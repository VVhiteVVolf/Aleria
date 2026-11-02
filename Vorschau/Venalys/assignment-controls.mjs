import { createPlacementControls } from '../shared/placement-controls.mjs';
import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { createAssignmentState, DRAFT_STORAGE_KEY } from './assignment-state.mjs';
import { renderHouseGroups, renderTargets, renderTargetOptions, targetName } from './assignment-view.mjs';
import { createVenalysMap } from './map-view.mjs';

// Every name submission uses the same validated state operation. The field
// stays mounted, so a successful commit preserves editing focus and selection.
export function commitDistrictName(field, { state, onChange, onError }) {
  if (!field) return false;
  const id = field.dataset.district;
  const selection = [field.selectionStart, field.selectionEnd];
  try {
    const changed = state.renameDistrict(id, field.value);
    field.value = state.current().districtNames[id];
    if (changed) onChange();
    if (selection.every(Number.isInteger) && typeof field.setSelectionRange === 'function')
      field.setSelectionRange(...selection.map(value => Math.min(value, field.value.length)));
    return changed;
  } catch (error) {
    field.value = state.current().districtNames[id] || '';
    onError(error);
    return false;
  }
}

/** The editor owns selection, persistence and events; its state owns validation. */
export function mountAssignmentControls({ root, houses, districts, pointsOfInterest, mapGeometry }) {
  const targets = [...districts, ...pointsOfInterest];
  const state = createAssignmentState({ houseIds: houses.map(h => h.id), districts, pointIds: pointsOfInterest.map(p => p.id) });
  const select = role => root.querySelector(`[data-role="${role}"]`);
  const houseSelect = select('house-select'), targetSelect = select('target-select');
  let selectedHouse = null, selectedTarget = null, timer;

  function notice(text) {
    const status = select('status');
    status.textContent = text; status.hidden = false;
    clearTimeout(timer); timer = setTimeout(() => status.hidden = true, 6500);
  }
  function save() {
    try { localStorage.setItem(DRAFT_STORAGE_KEY, state.serialize()); return true; }
    catch { return false; }
  }
  function render({ keepEditors = false } = {}) {
    const draft = state.current();
    if (!keepEditors) {
      select('house-groups').innerHTML = renderHouseGroups(houses, selectedHouse);
      select('districts').innerHTML = renderTargets(districts, draft, houses, selectedHouse, { districts: true });
      select('points-of-interest').innerHTML = renderTargets(pointsOfInterest, draft, houses, selectedHouse);
    } else for (const district of districts) {
      const card = root.querySelector(`#target-${district.id}`);
      card.querySelector('h3').textContent = draft.districtNames[district.id];
      card.querySelector('[data-role="district-name"]').value = draft.districtNames[district.id];
      for (const button of card.querySelectorAll('[data-action="remove-assignment"]')) {
        const house = houses.find(h => h.id === button.dataset.house);
        button.setAttribute('aria-label', `Haus ${house.name} aus ${draft.districtNames[district.id]} entfernen`);
      }
    }
    targetSelect.innerHTML = renderTargetOptions(targets, draft);
    houseSelect.value = selectedHouse || ''; targetSelect.value = selectedTarget || '';
    root.querySelector('[data-action="assign-selected"]').disabled = !selectedHouse || !selectedTarget;
    root.querySelector('[data-action="remove-selected"]').disabled = !selectedHouse || !selectedTarget || !draft.assignments[selectedTarget].includes(selectedHouse);
    root.querySelector('[data-action="cancel-selection"]').disabled = !selectedHouse;
    root.querySelector('[data-action="undo"]').disabled = !state.canUndo();
    select('selection-hint').textContent = selectedHouse
      ? `Haus ${houses.find(h => h.id === selectedHouse).name} bleibt ausgewählt. Mehrere Bezirke oder Orte nacheinander zuordnen – vorhandene Zuordnungen bleiben erhalten.`
      : 'Ein Haus auswählen und ein Plus auf der Karte oder einen Zielknopf verwenden. Ziehen mit Maus oder Stift fügt eine Zuordnung hinzu; auf Touch bleibt die Karte verschiebbar.';
    const target = targets.find(t => t.id === selectedTarget);
    select('active-target').innerHTML = target ? `Ausgewählt: <strong>${e(targetName(target, draft))}</strong> · ${draft.assignments[target.id].length} Häuser · <a href="#target-${e(target.id)}">${draft.districtNames[target.id] ? 'Bezirksname und Häuser bearbeiten' : 'Hauszuordnungen ansehen'} ↗</a>` : 'Ein Bezirks- oder Ortsname auf der Karte wählt das Gebiet aus.';
    map.render();
    controls.render({ settlements: targets.map(t => ({ ...t, name: targetName(t, draft) })) });
  }
  function choose(id) {
    selectedHouse = houses.some(h => h.id === id) ? id : null;
    render();
  }
  function change(operation, message, options) {
    try { if (operation()) { const saved = save(); render(options); notice(saved ? message : `${message} Die lokale Speicherung ist nicht verfügbar; bitte den Entwurf herunterladen.`); } }
    catch (error) { notice(error.message || 'Der Entwurf konnte nicht geändert werden.'); }
  }
  function assign(id, targetId) {
    change(() => state.assign(id, targetId), 'Haus zusätzlich zugeordnet. Andere Bezirke und Orte bleiben erhalten.');
  }
  function commitName(field) {
    return commitDistrictName(field, {
      state,
      onChange() {
        const saved = save(); render({ keepEditors: true });
        notice(saved ? 'Bezirksname im Entwurf gespeichert.' : 'Bezirksname übernommen. Die lokale Speicherung ist nicht verfügbar; bitte den Entwurf herunterladen.');
      },
      onError: error => notice(error.message || 'Der Bezirksname konnte nicht übernommen werden.'),
    });
  }
  const map = createVenalysMap({ root, targets, districts, houses, geometry: mapGeometry, getDraft: state.current,
    onTarget(id) { selectedTarget = id; render(); } });
  const controls = createPlacementControls({ root, getSelected: () => selectedHouse, onMove: assign, escape: e, canMove: state.canAssign });
  houseSelect.innerHTML = '<option value="">Ein Haus auswählen …</option>' + houses.map(h => `<option value="${e(h.id)}">Haus ${e(h.name)}</option>`).join('');
  try { const saved = localStorage.getItem(DRAFT_STORAGE_KEY); if (saved) state.restore(JSON.parse(saved), { recordHistory: false }); }
  catch { notice('Der gespeicherte Entwurf konnte nicht geladen werden. Deine Datei wurde nicht überschrieben.'); }

  root.addEventListener('change', event => {
    const field = event.target;
    if (field === houseSelect) choose(field.value);
    if (field === targetSelect) { selectedTarget = field.value || null; map.locate(selectedTarget); render(); }
    if (field.matches('[data-role="district-name"]')) commitName(field);
  });
  root.addEventListener('keydown', event => {
    if (event.key === 'Enter' && event.target.matches('[data-role="district-name"]')) { event.preventDefault(); commitName(event.target); }
    if (event.key === 'Escape' && !root.querySelector('dialog[open]')) choose(null);
  });
  root.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    switch (button.dataset.action) {
      case 'commit-district-name': commitName(root.querySelector(`[data-role="district-name"][data-district="${button.dataset.district}"]`)); break;
      case 'choose-house': choose(selectedHouse === button.dataset.house ? null : button.dataset.house); root.querySelector(`[data-action="choose-house"][data-house="${button.dataset.house}"]`)?.focus({ preventScroll: true }); break;
      case 'assign-selected': if (selectedHouse && selectedTarget) assign(selectedHouse, selectedTarget); break;
      case 'remove-selected': if (selectedHouse && selectedTarget) change(() => state.remove(selectedHouse, selectedTarget), 'Diese Zuordnung ist gelöst. Weitere Zuordnungen bleiben erhalten.'); break;
      case 'remove-assignment': change(() => state.remove(button.dataset.house, button.dataset.target), 'Diese Zuordnung ist gelöst. Weitere Zuordnungen bleiben erhalten.'); break;
      case 'cancel-selection': choose(null); break;
      case 'locate-target': selectedTarget = button.dataset.target; map.locate(selectedTarget); render(); root.querySelector('#karte').scrollIntoView({ behavior: 'smooth', block: 'start' }); break;
      case 'open-map': map.open(); break;
      case 'close-map': map.close(); break;
      case 'zoom-in': map.zoomBy(.4); break;
      case 'zoom-out': map.zoomBy(-.4); break;
      case 'fit-map': map.fit(); break;
      case 'toggle-map-mode': map.toggleMode(button); controls.render({ settlements: targets.map(t => ({ ...t, name: targetName(t, state.current()) })) }); break;
      case 'toggle-crests': map.toggleCrests(button); controls.render({ settlements: targets.map(t => ({ ...t, name: targetName(t, state.current()) })) }); break;
      case 'toggle-names': map.toggleNames(button); controls.render({ settlements: targets.map(t => ({ ...t, name: targetName(t, state.current()) })) }); break;
      case 'undo': change(state.undo, 'Letzte Änderung zurückgenommen.'); break;
      case 'reset': change(state.reset, 'Ausgangsstand: neutrale Bezirksnamen und keine Hauszuordnungen.'); break;
      case 'import': select('import-file').click(); break;
      case 'export': {
        const url = URL.createObjectURL(new Blob([state.serialize()], { type: 'application/json' }));
        const link = document.createElement('a'); link.href = url; link.download = 'venalys-entwurf.json'; link.click();
        setTimeout(() => URL.revokeObjectURL(url), 0); break;
      }
      case 'print': window.print(); break;
    }
  });
  select('import-file').addEventListener('change', async event => {
    const file = event.target.files?.[0]; if (!file) return;
    try {
      if (file.size > 500000) throw Error('Die Entwurfsdatei ist zu groß.');
      state.restore(JSON.parse(await file.text())); const saved = save(); render(); notice(saved ? 'Bezirksnamen und Hauszuordnungen gemeinsam geladen.' : 'Entwurf geladen. Die lokale Speicherung ist nicht verfügbar; bitte vor dem Schließen herunterladen.');
    } catch (error) { notice(error.message || 'Die Datei konnte nicht geladen werden.'); }
    finally { event.target.value = ''; }
  });
  render();
  return { current: state.current, choose(id) { choose(id); root.querySelector('#karte').scrollIntoView({ behavior: 'smooth', block: 'start' }); houseSelect.focus({ preventScroll: true }); } };
}
