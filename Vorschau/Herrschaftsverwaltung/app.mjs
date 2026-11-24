import { createAssemblyState } from './assembly-state.mjs';
import { buildOfficePlans } from '../../shared/cenyr-administration/office-plans.mjs';
import { bindOfficeDialog } from './office-dialog.mjs';
import { renderCouncil, renderHouses } from './workbench-view.mjs';
import { bindVacancyFinder } from './vacancy-search.mjs';
import { COURT_AREA, LEHENSWARTE_AREA, REGENCY_AREA } from '../../shared/cenyr-administration/office-icons.mjs';

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
  const state = createAssemblyState([...houses.values()], roster.free, { storage: storageFor(window), treeCandidates, people });
  const address = new URL(window.location.href);
  let house = houses.get(address.searchParams.get('haus')) ?? houses.values().next().value;
  const chooser = role('houses');
  const council = role('council');
  const fileInput = role('import-file');
  const finder = role('vacancy-finder');
  const vacancies = bindVacancyFinder(finder, { houses: [...houses.values()], areas, state, people });
  let vacancyReturnLink;
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

  function updateDraftView() {
    render();
    vacancies.refresh();
  }

  function clearOfficeAddress() {
    const keys = ['amt', 'abteilung', 'posten'];
    const hadOffice = keys.some(key => address.searchParams.has(key));
    for (const key of keys) address.searchParams.delete(key);
    return hadOffice;
  }

  const office = bindOfficeDialog(role('office-dialog'), {
    state, people, treeCandidates, titleEditor: role('office-title-editor'), authorityEditor: role('local-authority-editor'), onChange: updateDraftView,
    onClose: key => {
      if (vacancyReturnLink && finder.open) vacancies.focus(vacancyReturnLink);
      else council.querySelector(`[data-area="${CSS.escape(key)}"]`)?.focus({ preventScroll: true });
      vacancyReturnLink = undefined;
      if (clearOfficeAddress()) window.history.replaceState(null, '', address);
    },
  });

  function openAddress(params) {
    const scope = houses.get(params.get('haus')) ?? house;
    const area = areas.find(item => item.id === params.get('amt'));
    if (!area || !scope.plans[area.id]) return false;
    if (scope !== house) {
      house = scope;
      render();
    }
    office.open(house, area, params.get('abteilung'), params.get('posten'));
    return true;
  }

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
    const link = event.target.closest('a[data-action="open-appointment"]');
    if (link && event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
      const target = new URL(link.href).searchParams;
      if (openAddress(target)) {
        event.preventDefault();
        if (finder.contains(link)) vacancyReturnLink = link.getAttribute('href');
        clearOfficeAddress();
        for (const [key, value] of target) address.searchParams.set(key, value);
        window.history.replaceState(null, '', address);
      }
      return;
    }
    const button = event.target.closest('button[data-action]');
    if (!button || button.closest('dialog')) return;
    switch (button.dataset.action) {
      case 'choose-house':
        house = houses.get(button.dataset.house);
        address.searchParams.set('haus', house.id);
        clearOfficeAddress();
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
        if (state.undo()) { updateDraftView(); notify('Letzte Änderung zurückgenommen.'); }
        break;
      case 'reset':
        if (state.reset(house.id)) { updateDraftView(); notify(`${house.name} zeigt wieder den Quellenstand.`); }
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
      updateDraftView();
      notify('Gesamtentwurf geladen. Der Import kann rückgängig gemacht werden.');
    } catch (error) {
      if (number === importNumber) notify(error.message || 'Der Entwurf konnte nicht geladen werden.');
    }
  });

  chooser.innerHTML = renderHouses([...houses.values()], people);
  root.querySelectorAll('[data-action="import"], [data-action="export"]').forEach(button => { button.disabled = false; });
  render();
  if (state.loadError()) notify(`Gespeicherter Entwurf konnte nicht geladen werden. ${state.loadError()}`);
  openAddress(address.searchParams);
}

const root = document.querySelector('[data-administration-workbench]');
try {
  const response = await fetch(new URL('./roster.generated.json', import.meta.url));
  if (!response.ok) throw new Error('Das Personenverzeichnis konnte nicht geladen werden.');
  mountWorkbench(root, await response.json(), [...window.ALERIA_ADMINISTRATION_CONTENT.areas, COURT_AREA, LEHENSWARTE_AREA, REGENCY_AREA]);
} catch (error) {
  const status = root.querySelector('[data-role="status"]');
  status.textContent = error.message;
  status.hidden = false;
  console.error(error);
}
