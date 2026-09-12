import {
  HORSE_STAT_LABELS,
  calculateFoal,
  formatHorseCurrency,
  horsePairKey,
  indexHorseCrossings,
  normalizeLegacyHorseCrossings
} from './horse-breeding-model.mjs';
import {
  localBreedingInterpretation,
  requestBreedingInterpretation
} from './horse-breeding-ai.js';
import { createHorseBreedingStore } from './horse-breeding-store.js';

const root = document.querySelector('[data-horse-breeding]');

if (root) {
  const dataElement = root.querySelector('[data-role="horse-breeding-data"]');
  const data = JSON.parse(dataElement?.textContent || '{"breeds":[],"crossings":[]}');
  const breedsById = new Map(data.breeds.map(breed => [breed.id, breed]));
  const knownCrossings = indexHorseCrossings(data.crossings);
  const store = createHorseBreedingStore(window.localStorage);
  const form = root.querySelector('[data-role="breeding-form"]');
  const mareSelect = form.elements.mare;
  const sireSelect = form.elements.sire;
  const crossNameInput = form.elements.crossName;
  const pairNote = root.querySelector('[data-role="pair-note"]');
  const calculateButton = root.querySelector('[data-role="calculate-button"]');
  const resultElement = root.querySelector('[data-role="breeding-result"]');
  const recordsElement = root.querySelector('[data-role="breeding-records"]');
  const matrixElement = root.querySelector('[data-role="matrix-container"]');
  let legacyCrossings = {};
  try {
    legacyCrossings = JSON.parse(window.localStorage.getItem('rmskt_zb2')) || {};
  } catch {
    legacyCrossings = {};
  }
  const state = {
    stored: store.mergeCustomCrossNames(normalizeLegacyHorseCrossings(legacyCrossings, data.breeds)),
    current: null,
    interpretationRevision: 0,
    interpretationController: null
  };

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);

  const getSelectedPair = () => ({
    mare: breedsById.get(mareSelect.value),
    sire: breedsById.get(sireSelect.value)
  });

  const getCrossName = pairKey => state.stored.customCrossNames[pairKey]
    || knownCrossings.get(pairKey)?.name
    || '';

  function renderParentPreview(role, breed) {
    const container = root.querySelector(`[data-role="${role}-preview"]`);
    if (!breed) {
      container.innerHTML = `<p>Noch ${role === 'mare' ? 'keine Stute' : 'kein Hengst'} gewählt.</p>`;
      return;
    }
    const stats = HORSE_STAT_LABELS.map((label, index) => `<div class="breeding-preview-stat"><span>${escapeHtml(label)}</span><i><span style="width:${breed.stats[index] * 10}%"></span></i><strong>${breed.stats[index]}</strong></div>`).join('');
    container.innerHTML = `<figure><img src="${escapeHtml(breed.image.src)}" width="${Number(breed.image.width)}" height="${Number(breed.image.height)}" alt="${escapeHtml(breed.image.alt)}"><figcaption><strong>${escapeHtml(breed.name)}</strong><span>${escapeHtml(breed.region)} · ${escapeHtml(breed.continent)}</span><span>${escapeHtml(breed.ageLabel)}</span></figcaption></figure><div class="breeding-preview-stats">${stats}</div>`;
  }

  function updatePair() {
    const { mare, sire } = getSelectedPair();
    renderParentPreview('mare', mare);
    renderParentPreview('sire', sire);
    const pairKey = horsePairKey(mare?.id, sire?.id);
    const valid = Boolean(pairKey);
    calculateButton.disabled = !valid;
    if (!mare || !sire) {
      pairNote.textContent = 'Wähle zwei verschiedene Rassen.';
      return;
    }
    if (!valid) {
      pairNote.textContent = 'Stute und Hengst müssen für diese Kreuzung verschiedenen Rassen angehören.';
      return;
    }
    const customName = state.stored.customCrossNames[pairKey];
    const known = knownCrossings.get(pairKey);
    crossNameInput.value = getCrossName(pairKey);
    pairNote.textContent = customName
      ? `Eigener Kreuzungsname: ${customName}${known ? ` · überliefert als ${known.name}` : ''}.`
      : known
        ? `Überlieferte Kreuzung: ${known.name}${known.establishedBreed ? ` · gefestigte Linie ${known.establishedBreed}` : ''}.`
        : 'Diese Verbindung ist in den überlieferten Aufzeichnungen noch unbenannt.';
  }

  function renderResult(payload) {
    const { mare, sire, result, foalName, crossName } = payload;
    const displayName = foalName || crossName || `Fohlen aus ${mare.name} und ${sire.name}`;
    const statRows = HORSE_STAT_LABELS.map((label, index) => {
      const talentClass = index === result.talentIndex ? ' breeding-stat-row--talent' : '';
      return `<div class="breeding-stat-row${talentClass}"><span>${escapeHtml(label)}</span><div class="breeding-stat-track" title="Elternerwartung: ${result.expectedStats[index]}/10"><span style="width:${result.stats[index] * 10}%"></span></div><output>${result.stats[index]}</output></div>`;
    }).join('');
    const traits = result.traits.map(trait => `<span>${escapeHtml(trait.label)}</span>`).join('');
    const crossingNote = result.crossing?.note || 'Eine noch offene Blutlinie, deren Eigenarten erst weitere Nachzuchten bestätigen können.';
    const established = result.crossing?.establishedBreed || 'Noch keine gefestigte Rasse';

    resultElement.innerHTML = `<header class="breeding-result-header"><div><p class="eyebrow">Neu berechneter Zuchtbucheintrag</p><h3>${escapeHtml(displayName)}</h3></div><div class="breeding-result-meta"><span>${escapeHtml(mare.name)} × ${escapeHtml(sire.name)}</span><span>${crossName ? escapeHtml(crossName) : 'Kreuzung noch unbenannt'}</span></div></header><div class="breeding-result-body"><div><p class="eyebrow">Anlagen des Fohlens</p><div class="breeding-stat-list">${statRows}</div></div><aside class="breeding-result-summary"><p class="eyebrow">Züchterische Einordnung</p><div class="breeding-traits">${traits}</div><dl><div><dt>Lebensspanne</dt><dd>${escapeHtml(result.lifespan.label)}</dd></div><div><dt>Fohlenwert</dt><dd>${escapeHtml(formatHorseCurrency(result.priceRange.minCopper))} – ${escapeHtml(formatHorseCurrency(result.priceRange.maxCopper))}</dd></div><div><dt>Güte</dt><dd>${escapeHtml(result.priceRange.quality)}</dd></div><div><dt>Gefestigte Linie</dt><dd>${escapeHtml(established)}</dd></div><div><dt>Überlieferung</dt><dd>${escapeHtml(crossingNote)}</dd></div></dl></aside></div><section class="breeding-interpretation"><p class="eyebrow">Deutung durch Owain Draig · <span data-role="interpretation-source">wird angefragt</span></p><h4>Was das Blut verspricht</h4><p data-role="interpretation-text">Owain prüft den neuen Eintrag …</p></section><div class="breeding-result-actions"><button class="ink-button" type="button" data-action="save-record">Ins Zuchtbuch eintragen</button><button class="breeding-secondary-button" type="button" data-action="reroll">Dasselbe Paar neu berechnen</button></div>`;
    resultElement.hidden = false;
    resultElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  async function interpretCurrentResult(payload) {
    state.interpretationController?.abort();
    const controller = new AbortController();
    state.interpretationController = controller;
    const revision = ++state.interpretationRevision;
    const timeoutId = window.setTimeout(() => controller.abort(), 25000);
    let interpretation;
    let source = 'KI-Deutung';
    try {
      interpretation = await requestBreedingInterpretation(payload, { signal: controller.signal });
    } catch {
      interpretation = localBreedingInterpretation(payload);
      source = 'lokale Archivdeutung';
    } finally {
      window.clearTimeout(timeoutId);
    }
    if (revision !== state.interpretationRevision) return;
    payload.interpretation = interpretation;
    payload.interpretationSource = source;
    const textElement = resultElement.querySelector('[data-role="interpretation-text"]');
    const sourceElement = resultElement.querySelector('[data-role="interpretation-source"]');
    if (textElement) textElement.textContent = interpretation;
    if (sourceElement) sourceElement.textContent = source;
  }

  function calculateCurrentPair() {
    const { mare, sire } = getSelectedPair();
    const pairKey = horsePairKey(mare?.id, sire?.id);
    if (!pairKey) return;
    const crossing = knownCrossings.get(pairKey) || null;
    const payload = {
      mare,
      sire,
      foalName: form.elements.foalName.value.trim(),
      crossName: crossNameInput.value.trim(),
      notes: form.elements.notes.value.trim(),
      result: calculateFoal(mare, sire, { crossing })
    };
    state.current = payload;
    renderResult(payload);
    interpretCurrentResult(payload);
  }

  function renderRecords() {
    if (!state.stored.records.length) {
      recordsElement.innerHTML = '<p class="breeding-empty">Noch wurde kein Fohlen eingetragen.</p>';
      return;
    }
    recordsElement.innerHTML = state.stored.records.map(record => {
      const title = record.foalName || record.crossName || 'Unbenanntes Fohlen';
      const date = new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium' }).format(new Date(record.createdAt));
      const traits = Array.isArray(record.traits) ? record.traits.join(', ') : 'Ausgeglichen';
      return `<article class="breeding-record"><div><p class="eyebrow">${escapeHtml(date)} · ${escapeHtml(record.interpretationSource || 'Archivdeutung')}</p><h3>${escapeHtml(title)}</h3><p>${escapeHtml(record.mareName)} × ${escapeHtml(record.sireName)} · ${escapeHtml(traits)}</p>${record.notes ? `<small>${escapeHtml(record.notes)}</small>` : ''}</div><button class="breeding-delete" type="button" data-action="delete-record" data-record-id="${escapeHtml(record.id)}" aria-label="${escapeHtml(title)} aus dem Zuchtbuch löschen">×</button></article>`;
    }).join('');
  }

  function saveCurrentResult(button) {
    if (!state.current) return;
    const payload = state.current;
    const pairKey = payload.result.pairKey;
    const record = {
      id: window.crypto?.randomUUID?.() || `fohlen-${Date.now()}`,
      createdAt: new Date().toISOString(),
      mareId: payload.mare.id,
      mareName: payload.mare.name,
      sireId: payload.sire.id,
      sireName: payload.sire.name,
      pairKey,
      foalName: payload.foalName,
      crossName: payload.crossName,
      notes: payload.notes,
      stats: payload.result.stats,
      traits: payload.result.traits.map(trait => trait.label),
      lifespan: payload.result.lifespan.label,
      priceRange: payload.result.priceRange,
      interpretation: payload.interpretation || localBreedingInterpretation(payload),
      interpretationSource: payload.interpretationSource || 'lokale Archivdeutung'
    };
    state.stored = store.addRecord(record);
    const knownName = knownCrossings.get(pairKey)?.name || '';
    state.stored = store.setCustomCrossName(pairKey, payload.crossName === knownName ? '' : payload.crossName);
    button.disabled = true;
    button.textContent = 'Im Zuchtbuch vermerkt';
    renderRecords();
    renderMatrix();
  }

  function renderMatrix() {
    const query = root.querySelector('[data-role="matrix-search"]').value.trim().toLocaleLowerCase('de-DE');
    const namedOnly = root.querySelector('[data-role="matrix-named-only"]').checked;
    const rows = query
      ? data.breeds.filter(breed => `${breed.name} ${breed.region} ${breed.continent}`.toLocaleLowerCase('de-DE').includes(query))
      : data.breeds;
    if (!rows.length) {
      matrixElement.innerHTML = '<p class="breeding-empty">Keine Rasse entspricht diesem Filter.</p>';
      return;
    }
    const header = data.breeds.map(breed => `<th scope="col">${escapeHtml(breed.name)}</th>`).join('');
    const body = rows.map(mare => {
      const cells = data.breeds.map(sire => {
        if (mare.id === sire.id) return '<td class="breeding-matrix-diagonal" aria-label="Gleiche Rasse">—</td>';
        const pairKey = horsePairKey(mare.id, sire.id);
        const known = knownCrossings.get(pairKey);
        const customName = state.stored.customCrossNames[pairKey];
        if (namedOnly && !known && !customName) return '<td class="breeding-matrix-empty-cell">·</td>';
        const name = customName || known?.name || '–';
        const kind = customName ? 'custom' : known ? 'known' : 'open';
        const label = `${mare.name} mit ${sire.name}: ${known?.name || customName || 'unbenannt'}`;
        return `<td><button class="breeding-matrix-cell breeding-matrix-cell--${kind}" type="button" data-action="select-cross" data-mare-id="${escapeHtml(mare.id)}" data-sire-id="${escapeHtml(sire.id)}" aria-label="${escapeHtml(label)}">${escapeHtml(name)}</button></td>`;
      }).join('');
      return `<tr><th scope="row">${escapeHtml(mare.name)}</th>${cells}</tr>`;
    }).join('');
    matrixElement.innerHTML = `<table class="breeding-matrix"><thead><tr><th scope="col">Stute ↓<br>Hengst →</th>${header}</tr></thead><tbody>${body}</tbody></table>`;
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    calculateCurrentPair();
  });

  root.addEventListener('change', event => {
    if (event.target === mareSelect || event.target === sireSelect) updatePair();
    if (event.target.matches('[data-role="matrix-named-only"]')) renderMatrix();
  });

  root.addEventListener('input', event => {
    if (event.target.matches('[data-role="matrix-search"]')) renderMatrix();
  });

  root.addEventListener('click', event => {
    const action = event.target.closest('[data-action]');
    if (!action) return;
    if (action.dataset.action === 'save-record') saveCurrentResult(action);
    if (action.dataset.action === 'reroll') form.requestSubmit();
    if (action.dataset.action === 'delete-record') {
      state.stored = store.removeRecord(action.dataset.recordId);
      renderRecords();
    }
    if (action.dataset.action === 'select-cross') {
      mareSelect.value = action.dataset.mareId;
      sireSelect.value = action.dataset.sireId;
      updatePair();
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  renderRecords();
  renderMatrix();
  updatePair();
}
