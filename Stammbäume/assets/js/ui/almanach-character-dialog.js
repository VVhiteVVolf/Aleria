import { normalizePersonName } from '../../../../js/world-identity/person-identity.js';
import { getCandidateLifeLabel } from '../modules/almanach-bridge/almanach-character-bridge.js';
import { escapeHtml } from './dom.js';

function safeImageSource(value) {
  const source = String(value || '').trim();
  if (!source) return '';
  try {
    const url = new URL(source, globalThis.location?.href || 'https://aleria.invalid/');
    if (url.protocol === 'data:') {
      return /^data:image\/(?:png|jpe?g|webp|gif);/i.test(source) ? source : '';
    }
    return ['http:', 'https:', 'blob:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

function matchPresentation(candidate) {
  const match = candidate?.match;
  if (!match) return { label: 'Noch nicht im Stammbaum', modifier: 'new' };
  if (match.kind === 'linked') return { label: 'Bereits verbunden', modifier: 'linked' };
  if (match.kind === 'probable') return { label: 'Sehr wahrscheinlich vorhanden', modifier: 'probable' };
  if (match.kind === 'conflict') return { label: 'Namenskonflikt', modifier: 'conflict' };
  return { label: 'Gleicher Name – prüfen', modifier: 'warning' };
}

function sexLabel(value) {
  if (value === 'female') return 'Weiblich';
  if (value === 'male') return 'Männlich';
  return 'Unbekannt';
}

function addPeople(select, family, selectedId, emptyLabel) {
  select.replaceChildren(new Option(emptyLabel, ''));
  (family?.persons || []).forEach(person => select.add(new Option(
    person.name + (person.birth ? ' · * ' + person.birth : ''),
    person.id
  )));
  select.value = selectedId || '';
}

export function createAlmanachCharacterDialog(documentRef = document) {
  const dialog = documentRef.getElementById('almanach-character-dialog');
  const form = documentRef.getElementById('almanach-character-form');
  const list = documentRef.getElementById('almanach-character-list');
  const preview = documentRef.getElementById('almanach-character-preview');
  const search = form.elements.namedItem('search');
  const showAll = form.elements.namedItem('showAll');
  const placement = form.elements.namedItem('placementKind');
  const referencePerson = form.elements.namedItem('referencePersonId');
  const secondParent = form.elements.namedItem('secondParentId');
  const forceSeparate = form.elements.namedItem('forceSeparate');
  const placementFields = documentRef.getElementById('almanach-placement-fields');
  const forceSeparateField = documentRef.getElementById('almanach-force-separate-field');
  const submitButton = documentRef.getElementById('almanach-character-submit');
  const status = documentRef.getElementById('almanach-character-status');
  let family = null;
  let candidates = [];
  let selectedCharacterId = '';
  let preferredTreePersonId = '';
  let loading = false;
  let busy = false;
  let error = '';

  function visibleCandidates() {
    const needle = normalizePersonName(search.value);
    return candidates.filter(candidate => {
      if (!showAll.checked && !candidate.isHouseRelevant) return false;
      if (!needle) return true;
      return normalizePersonName([
        candidate.character.name,
        candidate.character.title,
        candidate.genealogy.houseName,
        candidate.genealogy.birth,
        candidate.relevanceReason
      ].filter(Boolean).join(' ')).includes(needle);
    });
  }

  function selectedCandidate() {
    return candidates.find(candidate => candidate.character.id === selectedCharacterId) || null;
  }

  function initialCandidateId() {
    return candidates.find(candidate => (
      candidate.match?.character?.treePerson?.id === preferredTreePersonId
    ))?.character.id
      || candidates.find(candidate => candidate.isHouseRelevant)?.character.id
      || candidates[0]?.character.id
      || '';
  }

  function renderList() {
    if (loading) {
      list.innerHTML = '<p class="almanach-bridge-empty">Almanach-Charaktere werden geladen …</p>';
      return;
    }
    if (error) {
      list.innerHTML = '<p class="almanach-bridge-empty almanach-bridge-empty--error">' + escapeHtml(error) + '</p>';
      return;
    }
    const visible = visibleCandidates();
    if (!visible.length) {
      list.innerHTML = '<p class="almanach-bridge-empty">Keine passenden Charaktere gefunden.</p>';
      return;
    }
    list.innerHTML = visible.map(candidate => {
      const presentation = matchPresentation(candidate);
      const portraitSource = safeImageSource(candidate.character.portrait);
      const portrait = portraitSource
        ? '<img src="' + escapeHtml(portraitSource) + '" alt="">'
        : '<span>' + escapeHtml(candidate.character.name.slice(0, 1) || '?') + '</span>';
      return '<button class="almanach-candidate' + (candidate.character.id === selectedCharacterId ? ' is-selected' : '')
        + '" type="button" data-almanach-candidate-id="' + escapeHtml(candidate.character.id) + '">'
        + '<span class="almanach-candidate__portrait">' + portrait + '</span>'
        + '<span class="almanach-candidate__body"><strong>' + escapeHtml(candidate.character.name) + '</strong>'
        + '<small>' + escapeHtml(getCandidateLifeLabel(candidate)) + (candidate.relevanceReason ? ' · ' + escapeHtml(candidate.relevanceReason) : '') + '</small></span>'
        + '<span class="almanach-candidate__status almanach-candidate__status--' + presentation.modifier + '">'
        + escapeHtml(presentation.label) + '</span></button>';
    }).join('');
  }

  function syncPlacement() {
    const candidate = selectedCandidate();
    const matchKind = candidate?.match?.kind || '';
    const canLinkExisting = matchKind === 'probable' || matchKind === 'name-only';
    const isLinked = matchKind === 'linked';
    forceSeparateField.hidden = !canLinkExisting;
    forceSeparate.disabled = !canLinkExisting;
    if (!canLinkExisting) forceSeparate.checked = false;
    const needsPlacement = !!candidate && !isLinked && (!canLinkExisting || forceSeparate.checked);
    placementFields.hidden = !needsPlacement;
    placementFields.querySelectorAll('select,input').forEach(field => {
      field.disabled = !needsPlacement;
    });
    const referenceRequired = needsPlacement && placement.value !== 'standalone';
    referencePerson.required = referenceRequired;
    referencePerson.disabled = !referenceRequired;
    secondParent.disabled = !referenceRequired || !['child', 'parent'].includes(placement.value);
    submitButton.disabled = loading || busy || !candidate;
    submitButton.textContent = isLinked
      ? 'Im Baum anzeigen'
      : canLinkExisting && !forceSeparate.checked
        ? 'Mit vorhandener Person verbinden'
        : 'In Stammbaum übernehmen';
  }

  function renderPreview() {
    const candidate = selectedCandidate();
    if (!candidate) {
      preview.innerHTML = '<p class="almanach-bridge-empty">Wähle links einen Almanach-Charakter aus.</p>';
      syncPlacement();
      return;
    }
    const presentation = matchPresentation(candidate);
    const matchedPerson = candidate.match?.character?.treePerson;
    preview.innerHTML = '<div class="almanach-preview-heading">'
      + '<span class="almanach-candidate__status almanach-candidate__status--' + presentation.modifier + '">'
      + escapeHtml(presentation.label) + '</span>'
      + '<h3>' + escapeHtml(candidate.character.name) + '</h3>'
      + '<p>' + escapeHtml(candidate.character.title || candidate.genealogy.houseName || 'Almanach-Charakter') + '</p></div>'
      + '<dl class="almanach-preview-facts">'
      + '<div><dt>Lebensdaten</dt><dd>' + escapeHtml(getCandidateLifeLabel(candidate)) + '</dd></div>'
      + '<div><dt>Geschlecht</dt><dd>' + escapeHtml(sexLabel(candidate.genealogy.sex)) + '</dd></div>'
      + '<div><dt>Haus</dt><dd>' + escapeHtml(candidate.genealogy.houseName || 'Aus Name oder Familie abgeleitet') + '</dd></div>'
      + '<div><dt>Erkennung</dt><dd>' + escapeHtml(candidate.match?.reason || candidate.relevanceReason || 'Noch keine Verbindung') + '</dd></div>'
      + (matchedPerson ? '<div><dt>Baumperson</dt><dd>' + escapeHtml(matchedPerson.name) + '</dd></div>' : '')
      + '</dl>';
    syncPlacement();
  }

  function render() {
    renderList();
    renderPreview();
    const visibleCount = visibleCandidates().length;
    status.textContent = loading
      ? 'Lade Daten …'
      : busy ? 'Verknüpfung wird gespeichert …' : visibleCount + ' von ' + candidates.length + ' Charakteren sichtbar';
  }

  function populatePlacementPeople(selectedPersonId) {
    addPeople(referencePerson, family, selectedPersonId, '— Bezugsperson wählen —');
    addPeople(secondParent, family, '', '— Kein zweites Elternteil —');
    if (!(family?.persons || []).length) placement.value = 'standalone';
  }

  function open(nextFamily, nextCandidates = [], selectedPersonId = '', options = {}) {
    family = nextFamily;
    candidates = nextCandidates;
    loading = options.loading === true;
    busy = false;
    error = options.error || '';
    preferredTreePersonId = selectedPersonId || '';
    selectedCharacterId = initialCandidateId();
    form.reset();
    showAll.checked = false;
    placement.value = family?.persons?.length ? 'child' : 'standalone';
    populatePlacementPeople(selectedPersonId);
    render();
    if (!dialog.open) dialog.showModal();
    search.focus();
  }

  function setCandidates(nextCandidates, options = {}) {
    candidates = nextCandidates;
    loading = false;
    error = options.error || '';
    selectedCharacterId = initialCandidateId();
    render();
  }

  function read() {
    const candidate = selectedCandidate();
    return {
      candidate,
      placementKind: placement.value || 'standalone',
      referencePersonId: referencePerson.value || '',
      secondParentId: secondParent.value || '',
      forceSeparate: forceSeparate.checked
    };
  }

  function setBusy(nextBusy) {
    busy = nextBusy === true;
    render();
  }

  list.addEventListener('click', event => {
    const trigger = event.target.closest('[data-almanach-candidate-id]');
    if (!trigger) return;
    selectedCharacterId = trigger.dataset.almanachCandidateId || '';
    render();
  });
  search.addEventListener('input', render);
  search.addEventListener('keydown', event => {
    if (event.key === 'Enter') event.preventDefault();
  });
  showAll.addEventListener('change', render);
  placement.addEventListener('change', syncPlacement);
  referencePerson.addEventListener('change', () => {
    const selected = referencePerson.value;
    Array.from(secondParent.options).forEach(option => {
      option.disabled = !!selected && option.value === selected;
    });
  });
  forceSeparate.addEventListener('change', syncPlacement);

  return Object.freeze({
    dialog,
    form,
    open,
    setCandidates,
    setBusy,
    close: () => dialog.close(),
    read
  });
}
