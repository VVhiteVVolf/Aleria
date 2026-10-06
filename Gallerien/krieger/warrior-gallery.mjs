import { createGalleryState, normalizeSearch } from './gallery-state.mjs?v=20261006';
import { galleryElement, renderHouseResults, renderOtherResults, renderStatistics } from './gallery-view.mjs?v=20261006';

import { createImageViewer } from './gallery-viewer.mjs?v=20261006';

const VIEW_COPY = {
  gallery: ['Nach Hauszugehörigkeit', 'Die Bildersammlung', 'Krieger- und Rüstungsdarstellungen aus Hausbios und Referenzarchiven. Ein Bild anklicken, um es zu vergrößern oder einem Haus zuzuordnen.'],
  houses: ['Das vollständige Verzeichnis', 'Alle Häuser & Namen', 'Sämtliche Registerhäuser, einschließlich bürgerlicher und erloschener Häuser. Weitere benannte Häuser und Linien aus den Stammbäumen stehen in einer eigenen Gruppe. Mögliche Schreibvarianten wurden nicht auf Verdacht zusammengeführt.'],
  missing: ['Lücken in der Sammlung', 'Hier fehlt eine Illustration', 'Für diese Häuser wurde im erfassten Bestand noch keine passende Darstellung gefunden. Ein Wappen oder gewöhnliches Personenporträt zählt nicht als Rüstungsreferenz.'],
  other: ['Weitere Zugehörigkeiten', 'Gilden, Wachen & Klerus', 'Stadtwachen sind nach Ort und Paladine nach Klerus erfasst. Bei den zusätzlichen Gildenreferenzen ist der genaue Verband häufig noch offen. Eine Hauszugehörigkeit wird daraus nicht abgeleitet.'],
  unassigned: ['Noch zu bestimmen', 'Zuordnung offen', 'Diese Darstellungen sind noch keinem Haus zugeordnet. Die Gruppen nennen ihren Herkunftsordner, keine bestätigte Zugehörigkeit. Ein Bild öffnen und das passende Haus auswählen. Benannte Clanentwürfe ohne eindeutigen Treffer im Stammbaumverzeichnis bleiben ebenfalls hier.'],
};

function downloadJson(data) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const link = galleryElement('a');
  link.href = url;
  link.download = 'aleria-krieger-zuordnungen.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function mountGallery(root, catalog) {
  const role = name => root.querySelector(`[data-role="${name}"]`);
  let storage;
  try { storage = window.localStorage; } catch { /* In-memory assignments remain usable. */ }
  const state = createGalleryState(catalog, storage);
  const filters = { view: 'gallery', query: '', region: '', scope: 'all', collection: '' };
  const params = new URLSearchParams(location.search);
  if (Object.hasOwn(VIEW_COPY, params.get('view'))) filters.view = params.get('view');
  filters.query = params.get('q') || '';
  let visibleImageIds = [];
  const viewer = createImageViewer(root, catalog, state, () => render());
  const regionSelect = root.querySelector('[data-filter="region"]');
  for (const region of [...new Set(catalog.houses.map(h => h.region))].sort((a, b) => a.localeCompare(b, 'de'))) {
    const option = galleryElement('option', '', region);
    option.value = region;
    regionSelect.append(option);
  }
  root.querySelector('[data-filter="scope"] option[value="registered"]').textContent = `${catalog.houses.filter(h => h.kind === 'registered').length} Registerhäuser`;
  const collectionSelect = root.querySelector('[data-filter="collection"]');
  for (const collection of [...new Set(catalog.illustrations.map(image => image.collection || image.category))].sort((a, b) => a.localeCompare(b, 'de'))) {
    const option = galleryElement('option', '', collection);
    option.value = collection;
    collectionSelect.append(option);
  }

  function render() {
    const [eyebrow, title, note] = VIEW_COPY[filters.view];
    role('view-eyebrow').textContent = eyebrow;
    role('view-title').textContent = title;
    role('view-note').textContent = note;
    for (const button of root.querySelectorAll('[data-action="view"]')) button.setAttribute('aria-pressed', String(button.dataset.view === filters.view));
    const imageView = ['other', 'unassigned'].includes(filters.view);
    for (const input of root.querySelectorAll('[data-filter]')) {
      input.value = filters[input.dataset.filter];
      const key = input.dataset.filter;
      input.closest('label').hidden = key === 'collection' ? !imageView : ['region', 'scope'].includes(key) && imageView;
    }
    if (imageView) {
      const query = normalizeSearch(filters.query);
      const images = catalog.illustrations.filter(image => {
        const inView = filters.view === 'other' ? ['Paladine', 'Stadt- & Ortswachen', 'Gildenreferenzen'].includes(image.category) : !state.assignments(image).length && !['Paladine', 'Stadt- & Ortswachen'].includes(image.category);
        return inView && (!filters.collection || (image.collection || image.category) === filters.collection) && normalizeSearch(`${image.name} ${image.affiliation} ${image.category} ${image.collection || ''} ${image.sources.map(source => source.label || '').join(' ')}`).includes(query);
      });
      visibleImageIds = renderOtherResults(role('results'), images, filters.view === 'unassigned');
      role('result-count').textContent = `${images.length} Illustrationen`;
    } else {
      const houses = state.selectHouses(filters);
      visibleImageIds = renderHouseResults(role('results'), houses, state, filters.view !== 'gallery');
      const registeredCount = houses.filter(h => h.kind === 'registered').length;
      role('result-count').textContent = `${registeredCount} Registerhäuser · ${houses.length - registeredCount} erwähnte Namen / Linien`;
    }
    renderStatistics(role('statistics'), catalog, state);
  }

  root.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const { action, view, imageId, houseId } = button.dataset;
    if (action === 'view') { filters.view = view; render(); }
    if (action === 'reset-filters') { Object.assign(filters, { query: '', region: '', scope: 'all', collection: '' }); render(); }
    if (action === 'show-house') { Object.assign(filters, { view: 'gallery', query: state.houseById.get(houseId).name, region: '', scope: 'all' }); render(); role('view-title').scrollIntoView({ block: 'start' }); }
    if (action === 'open-image') viewer.open(imageId, visibleImageIds);
    if (action === 'export') downloadJson(state.serialize());
  });
  root.addEventListener('input', event => {
    if (!event.target.matches('[data-filter]')) return;
    filters[event.target.dataset.filter] = event.target.value;
    render();
  });
  role('import').addEventListener('change', async event => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      if (file.size > 2 * 1024 * 1024) throw new Error('Die Zuordnungsdatei ist zu groß.');
      const message = state.importData(JSON.parse(await file.text()));
      render();
      role('notice').textContent = `Zuordnungen importiert. ${message}`;
    } catch (error) { role('notice').textContent = error.message; }
    event.target.value = '';
  });
  role('notice').textContent = state.warning;
  render();
}

const root = document.querySelector('[data-gallery]');
try {
  const response = await fetch(new URL('./data/catalog.json?v=20261006-gwyllt', import.meta.url));
  if (!response.ok) throw new Error('Der Bildkatalog konnte nicht geladen werden. Bitte die Seite neu laden.');
  mountGallery(root, await response.json());
} catch (error) {
  root.querySelector('[data-role="result-count"]').textContent = 'Bestand nicht geladen';
  root.querySelector('[data-role="notice"]').textContent = error.message;
}
