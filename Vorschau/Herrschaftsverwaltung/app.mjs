import { createAssemblyState } from './assembly-state.mjs';
import { buildOfficePlans } from '../../shared/cenyr-administration/office-plans.mjs';
import { bindOfficeDialog } from './office-dialog.mjs';
import { renderCouncil, renderHouses } from './workbench-view.mjs';
import { COURT_AREA, REGENCY_AREA } from '../../shared/cenyr-administration/office-icons.mjs';

function storageFor(window) {
  try { return window.localStorage; }
  catch { return undefined; }
}

function downloadDraft(window, serialized) {
  const url = window.URL.createObjectURL(new Blob([serialized], { type: 'application/json' }));
  const link = window.document.createElement('a');
  link.href = url;
  link.download = 'herrschaftsverwaltung-entwurf.json';
  link.click();
  window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}

function mountWorkbench(root, roster, areas) {
  const role = name => root.querySelector(`[data-role="${name}"]`);
  const window = root.ownerDocument.defaultView;
  const people = new Map(roster.people.map(person => [person.id, person]));
  const treeCandidates = new Map(roster.tree.map(candidate => [candidate.id, candidate]));
  const houses = new Map(roster.houses.map(house => [house.id, { ...house, plans: buildOfficePlans(house) }]));
  const state = createAssemblyState([...houses.values()], roster.free, { storage: storageFor(window), treeCandidates });
  const address = new URL(window.location.href);
  let house = houses.get(address.searchParams.get('haus')) ?? houses.values().next().value;
  const chooser = role('houses');
  const council = role('council');
  const fileInput = role('import-file');
  let importNumber = 0;

  function notify(message) {
    const notice = role('status');
    notice.textContent = message;
    notice.hidden = !message;
  }

  function render() {
    chooser.querySelectorAll('button').forEach(button => { button.ariaPressed = String(button.dataset.house === house.id); });
    council.innerHTML = renderCouncil(house, areas, state.positions(house.id), people, state);
    role('persistence').textContent = state.persisted()
      ? 'Entwürfe werden in diesem Browser gespeichert.'
      : 'Entwürfe bleiben in diesem Fenster. Zum Behalten exportieren.';
  }

  const office = bindOfficeDialog(role('office-dialog'), {
    state, people, treeCandidates, onChange: render,
    onClose: key => {
      if (address.searchParams.has('amt') || address.searchParams.has('abteilung')) {
        address.searchParams.delete('amt');
        address.searchParams.delete('abteilung');
        window.history.replaceState(null, '', address);
      }
      council.querySelector(`[data-area="${CSS.escape(key)}"]`)?.focus({ preventScroll: true });
    },
  });

  root.addEventListener('error', event => {
    const image = event.target;
    if (image.tagName === 'IMG' && image.dataset.fallback) {
      image.src = image.dataset.fallback;
      delete image.dataset.fallback;
    } else if (image.tagName === 'IMG' && image.hasAttribute('data-office-art')) {
      const symbol = window.document.createElement('span');
      symbol.className = 'office-art-fallback';
      symbol.setAttribute('aria-hidden', 'true');
      symbol.style.setProperty('--icon-size', `${image.width}px`);
      image.replaceWith(symbol);
    }
  }, true);
  root.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button || button.closest('dialog')) return;
    switch (button.dataset.action) {
      case 'choose-house':
        house = houses.get(button.dataset.house);
        address.searchParams.set('haus', house.id);
        address.searchParams.delete('amt');
        address.searchParams.delete('abteilung');
        window.history.replaceState(null, '', address);
        notify('');
        render();
        break;
      case 'open-office':
        office.open(house, areas.find(area => area.id === button.dataset.area));
        break;
      case 'export':
        downloadDraft(window, state.serialize());
        notify('Gesamtentwurf exportiert.');
        break;
      case 'import': fileInput.click(); break;
      case 'undo':
        if (state.undo()) { render(); notify('Letzte Änderung zurückgenommen.'); }
        break;
      case 'reset':
        if (state.reset(house.id)) { render(); notify(`${house.name} zeigt wieder den Quellenstand.`); }
        break;
    }
  });
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;
    const number = ++importNumber;
    fileInput.value = '';
    notify('Entwurf wird geladen …');
    try {
      const contents = await file.text();
      if (number !== importNumber) return;
      state.importDraft(contents);
      render();
      notify('Gesamtentwurf geladen. Der Import kann rückgängig gemacht werden.');
    } catch (error) {
      if (number === importNumber) notify(error.message || 'Der Entwurf konnte nicht geladen werden.');
    }
  });

  chooser.innerHTML = renderHouses([...houses.values()], people);
  root.querySelectorAll('[data-action="import"], [data-action="export"]').forEach(button => { button.disabled = false; });
  render();
  if (state.loadError()) notify(`Gespeicherter Entwurf konnte nicht geladen werden. ${state.loadError()}`);
  const selectedArea = areas.find(area => area.id === address.searchParams.get('amt'));
  if (selectedArea) office.open(house, selectedArea, address.searchParams.get('abteilung'));
}

const root = document.querySelector('[data-administration-workbench]');
try {
  const response = await fetch(new URL('./roster.generated.json', import.meta.url));
  if (!response.ok) throw new Error('Das Personenverzeichnis konnte nicht geladen werden.');
  mountWorkbench(root, await response.json(), [...window.ALERIA_ADMINISTRATION_CONTENT.areas, COURT_AREA, REGENCY_AREA]);
} catch (error) {
  const status = root.querySelector('[data-role="status"]');
  status.textContent = error.message;
  status.hidden = false;
  console.error(error);
}
