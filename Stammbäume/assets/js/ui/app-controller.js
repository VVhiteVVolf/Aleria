import { createFamilyChartSession } from '../adapters/family-chart-adapter.js';
import { ALERIA_CURRENT_YEAR } from '../config/chronology.js';
import { createEmptyFamily, createFoundingFamily } from '../domain/family-factory.js';
import { createFamilyGraph } from '../domain/family-graph.js';
import { formatHouseProfile, isHouseProfileEmpty } from '../domain/house-profile.js';
import { createAlmanachCharacterController } from '../modules/almanach-bridge/almanach-character-controller.js';
import { createPersonBiographyDialog } from '../modules/person-biography/person-biography-dialog.js';
import { PERSON_BIOGRAPHY_EXTENSION_ID } from '../modules/person-biography/person-biography-model.js';
import { createRelationshipMatrixDialog } from '../modules/relationship-matrix/relationship-matrix-dialog.js';
import { exportChartAsPng } from '../services/chart-png-export.js';
import {
  loadFamilyById,
  parseFolderPath,
  saveFamilyToLibrary
} from '../services/family-library.js';
import { downloadFamilyJson, parseFamilyJson } from '../services/family-transfer.js';
import {
  createWorkspaceModeUrl,
  grantWorkspaceEditAccess,
  WORKSPACE_MODE
} from '../services/workspace-access.js';
import { createCadetDialog } from './cadet-dialog.js';
import { escapeHtml } from './dom.js';
import { createEditAccessDialog } from './edit-access-dialog.js';
import { createFamilySaveDialog } from './family-save-dialog.js';
import { renderFamilyLegend } from './legend-ui.js';
import { createLineColorsDialog } from './line-colors-dialog.js';
import { createLineageDialog } from './lineage-dialog.js';
import { createNewFamilyDialog } from './new-family-dialog.js';
import { createPersonDialog } from './person-dialog.js';
import { renderPersonInspector } from './person-inspector.js';
import { createRelatedPersonDialog } from './related-person-dialog.js';
import { createRelationshipDialog } from './relationship-dialog.js';
import { createTimeJumpDialog } from './time-jump-dialog.js';
import { createToast } from './toast.js';

function isTypingTarget(target) {
  return target instanceof HTMLInputElement
    || target instanceof HTMLTextAreaElement
    || target instanceof HTMLSelectElement
    || target?.isContentEditable;
}

function findPartnershipId(family, participantIds) {
  const ids = [...new Set(participantIds)].filter(Boolean);
  return family.partnerships.find(partnership => (
    ids.length === partnership.participantIds.length
    && ids.every(personId => partnership.participantIds.includes(personId))
  ))?.id || '';
}

export function createAppController({
  store,
  almanachCharacterRepository = null,
  documentRef = document,
  runtime = globalThis,
  workspaceMode = WORKSPACE_MODE.view,
  requestEditOnInit = false
}) {
  const isEditing = workspaceMode === WORKSPACE_MODE.edit;
  const root = documentRef.getElementById('family-app');
  const chartContainer = documentRef.getElementById('family-chart');
  const chartPanel = documentRef.querySelector('.chart-panel');
  const chartStatus = documentRef.getElementById('chart-status');
  const inspector = documentRef.getElementById('person-inspector');
  const searchInput = documentRef.getElementById('person-search');
  const searchResults = documentRef.getElementById('search-results');
  const importInput = documentRef.getElementById('family-import');
  const toast = createToast(documentRef.getElementById('app-toast'));
  let chartSession = null;
  const almanachCharacterController = createAlmanachCharacterController({
    store,
    repository: almanachCharacterRepository,
    documentRef,
    notify: toast,
    focusPerson(personId) {
      chartSession?.focus(personId, { fit: true });
    }
  });
  const personDialog = createPersonDialog(documentRef);
  const relatedPersonDialog = createRelatedPersonDialog(documentRef);
  const relationshipDialog = createRelationshipDialog(documentRef);
  const lineColorsDialog = createLineColorsDialog(documentRef);
  const lineageDialog = createLineageDialog(documentRef);
  const newFamilyDialog = createNewFamilyDialog(documentRef);
  const cadetDialog = createCadetDialog(documentRef);
  const timeJumpDialog = createTimeJumpDialog(documentRef);
  const familySaveDialog = createFamilySaveDialog(documentRef);
  const editAccessDialog = createEditAccessDialog(documentRef);
  let graph = createFamilyGraph(store.getState().family);
  let unsubscribe = null;
  const personBiographyDialog = createPersonBiographyDialog({
    documentRef,
    runtime,
    onSave(personId, biographyModule) {
      store.setPersonExtension(personId, PERSON_BIOGRAPHY_EXTENSION_ID, biographyModule);
      toast('Biographie wurde gespeichert.');
    },
    onRemove(personId) {
      store.setPersonExtension(personId, PERSON_BIOGRAPHY_EXTENSION_ID, null);
      toast('Biographie wurde entfernt.');
    }
  });
  const relationshipMatrixDialog = createRelationshipMatrixDialog(documentRef);

  function emptyChartMessage() {
    return isEditing
      ? 'Noch keine Person vorhanden. Lege eine Person an, um den Stammbaum zu beginnen.'
      : 'Dieser Stammbaum enthält noch keine Personen.';
  }

  function showChartStatus(message, isError = false) {
    chartStatus.textContent = message;
    chartStatus.hidden = false;
    chartStatus.classList.toggle('is-error', isError);
  }

  function hideChartStatus() {
    chartStatus.hidden = true;
    chartStatus.classList.remove('is-error');
  }

  function openTimeJumpChild(timeJumpId) {
    const state = store.getState();
    const timeJump = state.family.timeJumps.find(item => item.id === timeJumpId);
    const partnership = state.family.partnerships.find(item => item.id === timeJump?.parentPartnershipId);
    const anchorPersonIds = partnership?.participantIds || (timeJump?.parentPersonId ? [timeJump.parentPersonId] : []);
    if (!timeJump || !anchorPersonIds.length) throw new Error('Der Zeitsprungknoten wurde nicht gefunden.');
    const referencePersonId = anchorPersonIds.includes(state.selectedPersonId)
      ? state.selectedPersonId
      : anchorPersonIds[0];
    relatedPersonDialog.open(referencePersonId, state.family, { timeJumpId });
  }

  function openLineageCrestChild(partnershipId) {
    const state = store.getState();
    const partnership = state.family.partnerships.find(item => item.id === partnershipId);
    if (!partnership?.participantIds.length) throw new Error('Das Paar über dem Wappen wurde nicht gefunden.');
    const [referencePersonId, secondParentId = ''] = partnership.participantIds;
    relatedPersonDialog.open(referencePersonId, state.family, {
      relationKind: 'child',
      secondParentId,
      houseId: state.family.lineage.houseId,
      heading: 'Neuen Nachkommen unter dem Stammwappen anlegen'
    });
  }

  function openPersonBiography(personId) {
    const person = graph.getPerson(personId);
    if (!person) return false;
    if (isEditing) store.selectPerson(personId);
    personBiographyDialog.open(person, {
      editable: isEditing,
      house: graph.getHouse(person.houseId)
    });
    return true;
  }

  function createChart(family) {
    if (chartSession) chartSession.destroy();
    chartSession = null;
    if (!family.persons.length) {
      showChartStatus(emptyChartMessage());
      return;
    }
    try {
      hideChartStatus();
      chartSession = createFamilyChartSession({
        container: chartContainer,
        family,
        view: family.view,
        runtime,
        onPersonClick({ personId }) {
          if (!isEditing) return relationshipMatrixDialog.open(store.getState().family, personId);
          return store.selectPerson(personId);
        },
        onPortraitClick({ personId }) {
          return openPersonBiography(personId);
        },
        onFamilyLinkClick({ familyId, branchId }) {
          if (!familyId) return;
          if (isEditing) {
            cadetDialog.openEdit(store.getState().family, branchId);
            return;
          }
          if (!loadFamilyById(familyId, runtime.localStorage)) {
            toast('Das verknüpfte Haus ist noch nicht im Familienregister angelegt.', { error: true });
            return;
          }
          const target = new URL(runtime.location.href);
          target.searchParams.set('family', familyId);
          target.searchParams.set('mode', workspaceMode);
          runtime.location.assign(target.href);
        },
        onTimeJumpClick({ timeJumpId }) {
          if (isEditing) timeJumpDialog.openEdit(store.getState().family, timeJumpId);
        },
        onLineageCrestClick() {
          if (isEditing) lineageDialog.open(store.getState().family);
        },
        onLineageTimeGapClick() {
          if (isEditing) lineageDialog.open(store.getState().family);
        }
      });
    } catch (error) {
      showChartStatus(error.message, true);
    }
  }

  function updateChart(state, event) {
    if (!state.family.persons.length) {
      if (chartSession) chartSession.destroy();
      chartSession = null;
      showChartStatus(emptyChartMessage());
      return;
    }
    if (!chartSession) {
      createChart(state.family);
      return;
    }
    try {
      hideChartStatus();
      if (event?.affectsFamily) chartSession.update(state.family, state.family.view);
    } catch (error) {
      showChartStatus(error.message, true);
    }
  }

  function renderHeader(family) {
    documentRef.getElementById('family-title').textContent = family.document.title;
    documentRef.getElementById('family-motto').textContent = family.document.motto || '—';
    const houseProfile = documentRef.getElementById('family-house-profile');
    houseProfile.hidden = isHouseProfileEmpty(family.document.houseProfile);
    houseProfile.textContent = formatHouseProfile(family.document.houseProfile);
    documentRef.getElementById('person-count').textContent = String(family.persons.length);
    documentRef.getElementById('generation-count').textContent = String(graph.getGenerationCount());
    const livingPeople = family.persons.filter(person => person.status === 'alive');
    documentRef.getElementById('living-count').textContent = String(livingPeople.length);
    const livingDescription = livingPeople.length
      ? `Als lebend verzeichnet: ${livingPeople.map(person => person.name).join(', ')}`
      : 'Keine Person ist ausdrücklich als lebend verzeichnet.';
    documentRef.getElementById('living-stat').title = livingDescription;
    documentRef.getElementById('living-stat').setAttribute('aria-label', livingDescription);
    documentRef.getElementById('partnership-count').textContent = String(family.partnerships.length);
    const emblem = documentRef.getElementById('family-emblem');
    const source = family.document.emblem || family.houses[0]?.emblem;
    emblem.hidden = !source;
    if (source) emblem.src = source;
    emblem.alt = source ? `Wappen von ${family.document.title}` : '';
    documentRef.title = `${family.document.title} · ${isEditing ? 'Stammbaum-Werkstatt' : 'Stammbaum'}`;
  }

  function updateHistoryButtons(state) {
    const undo = documentRef.querySelector('[data-action="undo"]');
    const redo = documentRef.querySelector('[data-action="redo"]');
    if (undo) undo.disabled = !state.canUndo;
    if (redo) redo.disabled = !state.canRedo;
  }

  function render(state, event = null) {
    if (!event || event.affectsFamily) graph = createFamilyGraph(state.family);
    renderHeader(state.family);
    if (isEditing) {
      updateHistoryButtons(state);
      renderPersonInspector(inspector, graph, state.selectedPersonId);
    }
    updateChart(state, event);
  }

  function closeSearchResults() {
    searchResults.hidden = true;
    searchResults.replaceChildren();
  }

  function renderSearch(query) {
    const results = graph.search(query);
    if (!String(query || '').trim()) {
      closeSearchResults();
      return;
    }
    if (!results.length) {
      searchResults.innerHTML = '<div class="search-result"><span>Keine Person gefunden.</span></div>';
      searchResults.hidden = false;
      return;
    }
    searchResults.innerHTML = results.map(person => {
      const house = graph.getHouse(person.houseId);
      return `
        <button class="search-result" type="button" data-action="select-person" data-person-id="${escapeHtml(person.id)}">
          <strong>${escapeHtml(person.name)}</strong>
          <span>${escapeHtml(person.title || house?.name || 'Personenakte')}</span>
        </button>
      `;
    }).join('');
    searchResults.hidden = false;
  }

  async function handleAction(actionElement) {
    const action = actionElement.dataset.action;
    if (action === 'request-edit-mode') {
      editAccessDialog.open();
      return;
    }
    if (action === 'close-edit-access') {
      editAccessDialog.close();
      return;
    }
    if (!isEditing) return;
    const state = store.getState();
    const selected = graph.getPerson(state.selectedPersonId);
    switch (action) {
      case 'undo':
        store.undo();
        break;
      case 'redo':
        store.redo();
        break;
      case 'fit-chart':
        chartSession?.fit();
        break;
      case 'show-default-view':
        chartSession?.reset();
        break;
      case 'focus-person':
        if (selected) chartSession?.focus(selected.id, { fit: true });
        break;
      case 'toggle-orientation':
        store.setOrientation(state.family.view.orientation === 'vertical' ? 'horizontal' : 'vertical');
        break;
      case 'open-person-create':
        personDialog.openCreate(state.family);
        break;
      case 'open-related-person':
        if (selected) relatedPersonDialog.open(selected.id, state.family);
        break;
      case 'open-almanach-characters':
        await almanachCharacterController.open();
        break;
      case 'close-almanach-character-dialog':
        almanachCharacterController.close();
        break;
      case 'close-related-person-dialog':
        relatedPersonDialog.close();
        break;
      case 'open-person-edit':
        if (selected) personDialog.openEdit(selected, state.family);
        break;
      case 'open-person-biography':
        if (selected) openPersonBiography(selected.id);
        break;
      case 'close-person-dialog':
        personDialog.close();
        break;
      case 'open-relationship':
        if (selected && state.family.persons.length > 1) relationshipDialog.open(selected.id, state.family);
        else toast('Für eine Beziehung werden mindestens zwei Personen benötigt.', { error: true });
        break;
      case 'close-relationship-dialog':
        relationshipDialog.close();
        break;
      case 'open-line-colors':
        lineColorsDialog.open(state.family);
        break;
      case 'close-line-colors':
        lineColorsDialog.close();
        break;
      case 'reset-line-colors':
        lineColorsDialog.reset();
        break;
      case 'open-lineage-settings':
        lineageDialog.open(state.family);
        break;
      case 'close-lineage-settings':
        lineageDialog.close();
        break;
      case 'open-cadet-create':
        if (state.family.partnerships.length) {
          cadetDialog.openCreate(state.family, selected ? graph.getPartnerships(selected.id)[0]?.id || '' : '');
        }
        else toast('Für eine Hausverknüpfung muss zuerst ein Paar angelegt werden.', { error: true });
        break;
      case 'close-cadet-dialog':
        cadetDialog.close();
        break;
      case 'delete-cadet':
        if (runtime.confirm('Diese Hausverknüpfung aus dem Stammbaum entfernen?')) {
          store.deleteCadetBranch(actionElement.dataset.branchId);
          toast('Hausverknüpfung wurde entfernt.');
        }
        break;
      case 'delete-current-cadet': {
        const branchId = cadetDialog.getCurrentId();
        if (branchId && runtime.confirm('Diese Hausverknüpfung aus dem Stammbaum entfernen?')) {
          cadetDialog.close();
          store.deleteCadetBranch(branchId);
          toast('Hausverknüpfung wurde entfernt.');
        }
        break;
      }
      case 'open-time-jump-create': {
        if (!state.family.persons.length) {
          toast('Für einen Zeitsprungknoten muss zuerst eine Person angelegt werden.', { error: true });
          break;
        }
        const preferredPartnershipId = selected ? graph.getPartnerships(selected.id)[0]?.id || '' : '';
        timeJumpDialog.openCreate(state.family, preferredPartnershipId, selected?.id || '');
        break;
      }
      case 'open-time-jump-after-person': {
        if (!selected) break;
        const preferredPartnershipId = graph.getPartnerships(selected.id)[0]?.id || '';
        timeJumpDialog.openCreate(state.family, preferredPartnershipId, selected.id);
        break;
      }
      case 'close-time-jump-dialog':
        timeJumpDialog.close();
        break;
      case 'open-time-jump-child':
        openTimeJumpChild(actionElement.dataset.timeJumpId);
        break;
      case 'open-time-jump-child-from-editor': {
        const timeJumpId = timeJumpDialog.getCurrentId();
        if (timeJumpId) {
          timeJumpDialog.close();
          openTimeJumpChild(timeJumpId);
        }
        break;
      }
      case 'open-lineage-child-from-editor':
        if (state.family.lineage.founderPartnershipId) {
          lineageDialog.close();
          openLineageCrestChild(state.family.lineage.founderPartnershipId);
        } else {
          toast('Bitte zuerst ein Gründerpaar auswählen und speichern.', { error: true });
        }
        break;
      case 'delete-time-jump':
        if (runtime.confirm('Diesen Zeitsprungknoten entfernen? Nachkommen bleiben als Personen erhalten.')) {
          store.deleteTimeJump(actionElement.dataset.timeJumpId);
          toast('Zeitsprungknoten wurde entfernt.');
        }
        break;
      case 'delete-current-time-jump': {
        const timeJumpId = timeJumpDialog.getCurrentId();
        if (timeJumpId && runtime.confirm('Diesen Zeitsprungknoten entfernen? Nachkommen bleiben als Personen erhalten.')) {
          timeJumpDialog.close();
          store.deleteTimeJump(timeJumpId);
          toast('Zeitsprungknoten wurde entfernt.');
        }
        break;
      }
      case 'start-new-family':
        newFamilyDialog.open();
        break;
      case 'close-new-family-dialog':
        newFamilyDialog.close();
        break;
      case 'start-empty-family': {
        const family = createEmptyFamily();
        store.replaceFamily(family, { source: 'new-empty-family' });
        store.selectPerson('');
        const target = new URL(runtime.location.href);
        target.searchParams.delete('family');
        runtime.history.replaceState({}, '', target.href);
        newFamilyDialog.close();
        familySaveDialog.open(family, []);
        toast('Eine leere, unabhängige Familienakte wurde angelegt.');
        break;
      }
      case 'open-family-save': {
        const record = loadFamilyById(state.family.document.id, runtime.localStorage);
        familySaveDialog.open(state.family, record?.folderPath || []);
        break;
      }
      case 'close-family-save':
        familySaveDialog.close();
        break;
      case 'select-person':
        store.selectPerson(actionElement.dataset.personId);
        closeSearchResults();
        searchInput.value = '';
        break;
      case 'delete-person':
        if (selected && runtime.confirm(`„${selected.name}“ und ihre direkten Verknüpfungen löschen?`)) {
          store.deletePerson(selected.id);
          toast(`${selected.name} wurde gelöscht.`);
        }
        break;
      case 'export-family':
        downloadFamilyJson(state.family, documentRef);
        toast('Stammbaum wurde als JSON exportiert.');
        break;
      case 'export-png': {
        actionElement.disabled = true;
        toast('Hochauflösendes PNG wird erzeugt …', { duration: 20000 });
        try {
          const result = await exportChartAsPng({
            element: chartPanel,
            title: state.family.document.title,
            fitChart: () => chartSession?.fit(),
            runtime,
            documentRef
          });
          toast(`PNG exportiert · ${result.width} × ${result.height} Pixel`);
        } finally {
          actionElement.disabled = false;
        }
        break;
      }
      case 'trigger-import':
        importInput.click();
        break;
      default:
        break;
    }
  }

  async function handleImport(file) {
    if (!file) return;
    try {
      const family = parseFamilyJson(await file.text());
      store.replaceFamily(family, { source: 'json-import' });
      store.selectPerson(family.view.focusPersonId || family.persons[0]?.id || '');
      toast(`${family.persons.length} Personen wurden importiert.`);
    } catch (error) {
      toast(error.message || 'Die Datei konnte nicht importiert werden.', { error: true, duration: 5000 });
    } finally {
      importInput.value = '';
    }
  }

  function submitPersonForm() {
    const values = personDialog.read();
    if (!values.name) throw new Error('Bitte einen Namen eintragen.');
    if (values.id) store.updatePerson(values.id, values);
    else store.addPerson(values);
    personDialog.close();
    toast(values.id ? 'Personenakte wurde aktualisiert.' : 'Person wurde angelegt.');
  }

  function submitNewFamilyForm() {
    const values = newFamilyDialog.read();
    if (!values.documentTitle) throw new Error('Bitte einen Namen für die neue Familie eintragen.');
    if (!values.founderManName || !values.founderWomanName) {
      throw new Error('Bitte beide Personen des Gründerpaares benennen.');
    }
    const family = createFoundingFamily(values);
    store.replaceFamily(family, { source: 'new-founding-family' });
    store.selectPerson(family.view.focusPersonId);
    const target = new URL(runtime.location.href);
    target.searchParams.delete('family');
    runtime.history.replaceState({}, '', target.href);
    newFamilyDialog.close();
    if (values.openSaveAfterCreate) familySaveDialog.open(family, []);
    toast(`${family.document.title} wurde als neue Familienakte angelegt.`);
  }

  function submitRelatedPersonForm() {
    const values = relatedPersonDialog.read();
    if (!values.person.name) throw new Error('Bitte einen Namen eintragen.');
    store.addRelatedPerson(values.referencePersonId, values.person, values.relation);
    relatedPersonDialog.close();
    toast(`${values.person.name} wurde samt Verbindung in den Stammbaum eingefügt.`);
  }

  function submitRelationshipForm() {
    const values = relationshipDialog.read();
    const state = store.getState();
    const referenceId = values.referencePersonId;
    const otherId = values.otherPersonId;
    if (!referenceId || !otherId) throw new Error('Bitte eine zweite Person wählen.');

    if (values.recordType === 'partnership') {
      store.addPartnership({
        participantIds: [referenceId, otherId],
        type: values.partnershipType,
        status: values.partnershipStatus,
        certainty: values.certainty,
        visibility: values.visibility
      });
    } else {
      const childId = values.parentageDirection === 'reference-is-child' ? referenceId : otherId;
      const primaryParentId = values.parentageDirection === 'reference-is-child' ? otherId : referenceId;
      const parentIds = [...new Set([primaryParentId, values.secondParentId].filter(id => id && id !== childId))];
      store.addParentage({
        childId,
        parentIds,
        partnershipId: findPartnershipId(state.family, parentIds),
        type: values.parentageType,
        legitimacy: values.legitimacy,
        certainty: values.certainty,
        visibility: values.visibility
      });
    }
    relationshipDialog.close();
    toast('Genealogische Verbindung wurde gespeichert.');
  }

  function submitLineColorsForm() {
    store.setRelationshipColors(lineColorsDialog.read());
    lineColorsDialog.close();
    toast('Linienfarben wurden übernommen.');
  }

  function submitLineageForm() {
    store.setLineage(lineageDialog.read());
    lineageDialog.close();
    toast('Gründerpaar und Linienaufbau wurden gespeichert.');
  }

  function submitCadetForm() {
    const values = cadetDialog.read();
    if (!values.name.trim()) throw new Error('Bitte einen Namen für das Kadettenhaus eintragen.');
    if (!values.parentPartnershipId) throw new Error('Bitte ein Gründerpaar wählen.');
    if (!values.targetFamilyId.trim()) throw new Error('Bitte die Ziel-Familien-ID im Register eintragen.');
    if (values.id) store.updateCadetBranch(values.id, values);
    else store.addCadetBranch(values);
    cadetDialog.close();
    toast(`${values.name.trim()} wurde als verlinkter Hausknoten gespeichert.`);
  }

  function submitTimeJumpForm() {
    const values = timeJumpDialog.read();
    if (!values.parentPartnershipId && !values.parentPersonId) {
      throw new Error('Bitte eine Person oder eine Verbindung vor dem Zeitsprung wählen.');
    }
    if (values.id) store.updateTimeJump(values.id, values);
    else store.addTimeJump(values);
    timeJumpDialog.close();
    toast('Zeitsprungknoten wurde gespeichert.');
  }

  function submitFamilySaveForm() {
    const values = familySaveDialog.read();
    const folderPath = parseFolderPath(values.folderPath);
    if (!folderPath.length) throw new Error('Bitte mindestens einen Ordner für das Register angeben.');
    const record = saveFamilyToLibrary({
      family: store.getState().family,
      id: values.id,
      title: values.title,
      folderPath,
      rankId: values.rankId
    }, runtime.localStorage);
    store.replaceFamily(record.family, { source: 'family-library-save' });
    const target = new URL(runtime.location.href);
    target.searchParams.set('family', record.id);
    runtime.history.replaceState({}, '', target.href);
    familySaveDialog.close();
    toast(`${record.title} wurde im Familienregister gespeichert.`);
  }

  function onClick(event) {
    const actionElement = event.target.closest('[data-action]');
    if (!actionElement) {
      if (!event.target.closest('.search-field')) closeSearchResults();
      return;
    }
    event.preventDefault();
    void handleAction(actionElement).catch(error => {
      toast(error.message, { error: true, duration: 5000 });
    });
  }

  function onInput(event) {
    if (!isEditing) return;
    if (event.target === searchInput) renderSearch(searchInput.value);
  }

  function onChange(event) {
    if (!isEditing) return;
    if (event.target === importInput) handleImport(importInput.files?.[0]);
  }

  function onSubmit(event) {
    if (event.target === editAccessDialog.form) {
      event.preventDefault();
      if (!grantWorkspaceEditAccess(editAccessDialog.readPassword(), runtime.sessionStorage)) {
        editAccessDialog.showError();
        return;
      }
      editAccessDialog.close();
      runtime.location.assign(createWorkspaceModeUrl(runtime.location, WORKSPACE_MODE.edit));
      return;
    }
    if (!isEditing) return;
    if (event.target === almanachCharacterController.form) {
      event.preventDefault();
      void almanachCharacterController.submit().catch(error => {
        toast(error.message, { error: true, duration: 5000 });
      });
      return;
    }
    if (event.target === newFamilyDialog.form) {
      event.preventDefault();
      try {
        submitNewFamilyForm();
      } catch (error) {
        toast(error.message, { error: true, duration: 5000 });
      }
    }
    if (event.target === personDialog.form) {
      event.preventDefault();
      try {
        submitPersonForm();
      } catch (error) {
        toast(error.message, { error: true, duration: 5000 });
      }
    }
    if (event.target === relatedPersonDialog.form) {
      event.preventDefault();
      try {
        submitRelatedPersonForm();
      } catch (error) {
        toast(error.message, { error: true, duration: 5000 });
      }
    }
    if (event.target === relationshipDialog.form) {
      event.preventDefault();
      try {
        submitRelationshipForm();
      } catch (error) {
        toast(error.message, { error: true, duration: 5000 });
      }
    }
    if (event.target === lineColorsDialog.form) {
      event.preventDefault();
      try {
        submitLineColorsForm();
      } catch (error) {
        toast(error.message, { error: true, duration: 5000 });
      }
    }
    if (event.target === lineageDialog.form) {
      event.preventDefault();
      try {
        submitLineageForm();
      } catch (error) {
        toast(error.message, { error: true, duration: 5000 });
      }
    }
    if (event.target === cadetDialog.form) {
      event.preventDefault();
      try {
        submitCadetForm();
      } catch (error) {
        toast(error.message, { error: true, duration: 5000 });
      }
    }
    if (event.target === timeJumpDialog.form) {
      event.preventDefault();
      try {
        submitTimeJumpForm();
      } catch (error) {
        toast(error.message, { error: true, duration: 5000 });
      }
    }
    if (event.target === familySaveDialog.form) {
      event.preventDefault();
      try {
        submitFamilySaveForm();
      } catch (error) {
        toast(error.message, { error: true, duration: 5000 });
      }
    }
  }

  function onKeydown(event) {
    if (!isEditing) return;
    if (!(event.ctrlKey || event.metaKey) || event.key.toLocaleLowerCase('de') !== 'z' || isTypingTarget(event.target)) return;
    event.preventDefault();
    if (event.shiftKey) store.redo();
    else store.undo();
  }

  function init() {
    root.dataset.workspaceMode = workspaceMode;
    documentRef.getElementById('workspace-mode-label').textContent = isEditing
      ? 'Bearbeitungsmodus'
      : 'Ansichtsmodus';
    documentRef.getElementById('workspace-eyebrow').textContent = isEditing
      ? 'Aleria Almanach · Stammbaum-Werkstatt'
      : 'Aleria Almanach · Stammbaum';
    documentRef.getElementById('view-mode-link').href = createWorkspaceModeUrl(runtime.location, WORKSPACE_MODE.view);
    documentRef.getElementById('chart-heading').textContent = isEditing
      ? 'Stammbaum bearbeiten'
      : 'Stammbaum ansehen';
    documentRef.querySelector('.chart-hint').textContent = isEditing
      ? 'Ziehen zum Verschieben · Mausrad zum Zoomen · Portrait öffnet die Biographie'
      : 'Ziehen zum Verschieben · Mausrad zum Zoomen · Portrait öffnet die Biographie · Wappen öffnen weitere Häuser';
    documentRef.querySelectorAll('[data-current-year]').forEach(element => {
      element.textContent = String(ALERIA_CURRENT_YEAR);
    });
    if (isEditing) renderFamilyLegend(documentRef.getElementById('family-legend'));
    documentRef.addEventListener('click', onClick);
    documentRef.addEventListener('input', onInput);
    documentRef.addEventListener('change', onChange);
    documentRef.addEventListener('submit', onSubmit);
    documentRef.addEventListener('keydown', onKeydown);
    unsubscribe = store.subscribe(render);
    render(store.getState());
    root.dataset.ready = 'true';
    if (requestEditOnInit) runtime.setTimeout(() => editAccessDialog.open(), 0);
  }

  function destroy() {
    documentRef.removeEventListener('click', onClick);
    documentRef.removeEventListener('input', onInput);
    documentRef.removeEventListener('change', onChange);
    documentRef.removeEventListener('submit', onSubmit);
    documentRef.removeEventListener('keydown', onKeydown);
    unsubscribe?.();
    chartSession?.destroy();
    personBiographyDialog.destroy();
  }

  return Object.freeze({ init, destroy });
}
