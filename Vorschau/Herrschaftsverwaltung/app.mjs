import { createAssemblyState } from './assembly-state.mjs';
import { buildOfficePlans } from '../../shared/cenyr-administration/office-plans.mjs';
import { bindOfficeDialog } from './office-dialog.mjs';
import { renderCouncil, renderHouses } from './workbench-view.mjs';
import { bindVacancyFinder } from './vacancy-search.mjs';
import { ADDITIONAL_COUNCIL_AREAS, CAMRUISGE_AREAS, COURT_AREA, LEHENSWARTE_AREA, REGENCY_AREA } from '../../shared/cenyr-administration/office-icons.mjs';
import { DEFAULT_COUNTY, officeDestination, prepareTerritorialHouses, territorialGroups } from './territorial-navigation.mjs';

function storageFor(window) {
  try { return window.localStorage; }
  catch { return undefined; }
}

function downloadDraft(window, serialized) {
  const url = window.URL.createObjectURL(new Blob([serialized], { type: 'application/json' }));
  const link = window.document.createElement('a');
  link.href = url;
  link.download = 'cenyr-herrschaftsplanung-entwurf.json';
  link.click();
  window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}

function mountWorkbench(root, roster, directory, areas) {
  const role = name => root.querySelector(`[data-role="${name}"]`);
  const window = root.ownerDocument.defaultView;
  const people = new Map([...roster.people, ...directory.people].map(person => [person.id, person]));
  const treeCandidates = new Map(roster.tree.map(candidate => [candidate.id, candidate]));
  const houses = new Map(prepareTerritorialHouses(roster.houses, directory).map(house => [house.id, { ...house, plans: buildOfficePlans(house) }]));
  const groups = new Map(territorialGroups(directory).map(county => [county.id, county]));
  const state = createAssemblyState([...houses.values()], [...roster.free, ...directory.free], { storage: storageFor(window), treeCandidates, people });
  const address = new URL(window.location.href);
  const firstHouse = county => houses.get(groups.get(county)?.scopes[0].id);
  let house = houses.get(officeDestination(address.searchParams).id) ?? firstHouse(address.searchParams.get('grafschaft'))
    ?? houses.values().next().value;
  const chooser = role('houses');
  const countySelect = role('county-select');
  const council = role('council');
  const fileInput = role('import-file');
  const finder = role('vacancy-finder');
  const vacancies = bindVacancyFinder(finder, { houses: [...houses.values()], areas, state, people, counties: [...groups.values()] });
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

  function renderCounty(resetVacancies = true) {
    const county = groups.get(house.countyId || DEFAULT_COUNTY);
    const royal = county.id === directory.kingdom.id;
    const heading = royal ? 'Königlicher Rat und Hof' : 'Rats- und Hofämter';
    root.ownerDocument.title = `${royal ? heading : county.name} · Herrschaftswerkstatt · Aleria`;
    role('county-heading').textContent = royal ? county.name : `Grafschaft ${county.name}`;
    role('workbench-title').textContent = heading;
    role('county-summary').textContent = royal ? `Sitz der Krone in ${county.seat}` : `Sitz der Grafschaft in ${county.seat}`;
    countySelect.value = county.id;
    chooser.innerHTML = renderHouses(county.scopes.map(scope => houses.get(scope.id)), people);
    if (resetVacancies) vacancies.setCounty(county.id);
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
      if (clearOfficeAddress()) {
        address.searchParams.set('haus', house.id);
        address.searchParams.set('grafschaft', house.countyId);
        window.history.replaceState(null, '', address);
      }
    },
  });

  function openAddress(params) {
    const destination = officeDestination(params);
    const scope = houses.get(destination.id) ?? house;
    const area = areas.find(item => item.id === destination.area);
    if (!area || !scope.plans[area.id]) return false;
    if (scope !== house) {
      const changedCounty = scope.countyId !== house.countyId;
      house = scope;
      if (changedCounty) renderCounty(false);
      render();
    }
    office.open(house, area, destination.department, destination.post);
    return true;
  }

  function selectHouse(scope) {
    const changedCounty = scope.countyId !== house.countyId;
    house = scope;
    if (changedCounty) renderCounty();
    address.searchParams.set('grafschaft', house.countyId);
    address.searchParams.set('haus', house.id);
    clearOfficeAddress();
    window.history.replaceState(null, '', address);
    notify('');
    render();
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
        address.searchParams.set('grafschaft', house.countyId);
        window.history.replaceState(null, '', address);
      }
      return;
    }
    const button = event.target.closest('button[data-action]');
    if (!button || button.closest('dialog')) return;
    switch (button.dataset.action) {
      case 'choose-house':
        selectHouse(houses.get(button.dataset.house));
        break;
      case 'open-office':
        office.open(house, areas.find(area => area.id === button.dataset.area));
        break;
      case 'export':
        downloadDraft(window, state.serialize());
        notify('Gesamtentwurf für Cenyr exportiert.');
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

  for (const county of groups.values()) countySelect.add(new Option(county.name, county.id));
  countySelect.disabled = false;
  countySelect.addEventListener('change', () => selectHouse(firstHouse(countySelect.value)));
  renderCounty();
  root.querySelectorAll('[data-action="import"], [data-action="export"]').forEach(button => { button.disabled = false; });
  render();
  if (state.loadError()) notify(`Gespeicherter Entwurf konnte nicht geladen werden. ${state.loadError()}`);
  openAddress(address.searchParams);
}

const root = document.querySelector('[data-administration-workbench]');
async function fetchRoster(file) {
  const response = await fetch(new URL(file, import.meta.url));
  if (!response.ok) throw new Error('Das Personen- oder Territorialverzeichnis konnte nicht geladen werden.');
  return response.json();
}
try {
  const [roster, directory] = await Promise.all([fetchRoster('./roster.generated.json'), fetchRoster('./kingdom.generated.json')]);
  mountWorkbench(root, roster, directory, [
    ...window.ALERIA_ADMINISTRATION_CONTENT.areas, ...ADDITIONAL_COUNCIL_AREAS,
    COURT_AREA, LEHENSWARTE_AREA, REGENCY_AREA, ...CAMRUISGE_AREAS,
  ]);
} catch (error) {
  const status = root.querySelector('[data-role="status"]');
  status.textContent = error.message;
  status.hidden = false;
  console.error(error);
}
