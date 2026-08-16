import { createFamilyChartSession } from '../adapters/family-chart-adapter.js';
import { ALERIA_CURRENT_YEAR } from '../config/chronology.js';
import { createEmptyFamily, createFoundingFamily } from '../domain/family-factory.js';
import { createFamilyGraph } from '../domain/family-graph.js';
import { formatHouseProfile, getHouseRank, getHouseRankIcon, isHouseProfileEmpty } from '../domain/house-profile.js';
import { createAlmanachCharacterController } from '../modules/almanach-bridge/almanach-character-controller.js';
import { createEditorToolbarController } from '../modules/editor-toolbar/editor-toolbar-controller.js';
import { buildRegisteredHouseIndex } from '../modules/family-assets/house-emblem-index.js';
import { createTreeGeneratorController } from '../modules/tree-generator/tree-generator-controller.js';
import { createHouseBiographyDialog } from '../modules/house-biography/house-biography-dialog.js';
import { HOUSE_BIOGRAPHY_EXTENSION_ID } from '../modules/house-biography/house-biography-model.js';
import { createPersonBiographyDialog } from '../modules/person-biography/person-biography-dialog.js';
import { PERSON_BIOGRAPHY_EXTENSION_ID } from '../modules/person-biography/person-biography-model.js';
import { assertUsablePortraitSource } from '../modules/person-portrait/person-portrait-source.js';
import { createRelationshipMatrixDialog } from '../modules/relationship-matrix/relationship-matrix-dialog.js';
import { exportChartAsPng } from '../services/chart-png-export.js';
import { downloadFamilyBundle } from '../services/family-bundle-export.js';
import { importFamilyBundle } from '../services/family-bundle-import.js';
import {
  listFamilyRecords,
  loadFamilyById,
  saveFamilyToLibrary
} from '../services/family-library.js';
import { downloadFamilyJson, parseFamilyJson } from '../services/family-transfer.js';
import { saveFamilyRecordsAtomically } from '../services/family-persistence.js';
import {
  clearPendingTreeGeneratorLaunch,
  consumePendingTreeGeneratorLaunch,
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
import { createLineageTimeGapDialog } from './lineage-time-gap-dialog.js';
import { createLineageOriginDialog } from './lineage-origin-dialog.js';
import { createNewFamilyDialog } from './new-family-dialog.js';
import { createPersonDialog } from './person-dialog.js';
import { renderPersonInspector } from './person-inspector.js';
import { createRelatedPersonDialog } from './related-person-dialog.js';
import { createRelationActionsDialog } from './relation-actions-dialog.js';
import {
  findExistingImport,
  relationForAction
} from '../services/relation-actions.js';
import { createRelationshipDialog } from './relationship-dialog.js';
import { createTimeJumpDialog } from './time-jump-dialog.js';
import { createToast } from './toast.js';
import { createTreeNodeActionsDialog } from '../modules/tree-node-actions/tree-node-actions-dialog.js';
import { findLineageBarrier } from '../modules/tree-node-actions/tree-node-actions-model.js';
import {
  createMirroredPartnershipChange,
  removeMirroredPartnershipChange,
  updateMirroredPartnershipChange
} from '../modules/relationships/cross-family-relationship.js';
import {
  createMirroredGuardianshipChange,
  removeMirroredGuardianshipChange
} from '../modules/relationships/cross-family-guardianship.js';
import { listLineagePartnerships } from '../modules/relationships/lineage-partnership-policy.js';

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

// Verlinkt das Stammwappen auf die zugehörige Lore-Seite unter "Familien Häuser und
// Clans", sofern dort bereits ein Eintrag für dieses Haus existiert.
function buildHouseLoreLink(runtime, houseId) {
  const registry = runtime.HaeuserRegistry;
  if (!registry || !houseId || !registry.byId(houseId)) return '';
  return encodeURI(`../Familien Häuser und Clans/${registry.linkFor(houseId)}`);
}

export function createAppController({
  store,
  almanachCharacterRepository = null,
  assetRepository = null,
  documentRef = document,
  runtime = globalThis,
  latestLocalFamilySource = null,
  workspaceMode = WORKSPACE_MODE.view,
  requestEditOnInit = false,
  autoOpenTreeGenerator = false
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
  const bundleImportInput = documentRef.getElementById('family-bundle-import');
  const toast = createToast(documentRef.getElementById('app-toast'));
  const editorToolbarController = createEditorToolbarController({
    toolbar: documentRef.querySelector('.toolbar'),
    documentRef
  });
  const localFamilySource = latestLocalFamilySource || Object.freeze({
    loadById: familyId => loadFamilyById(familyId, runtime.localStorage),
    listRecords: () => listFamilyRecords(runtime.localStorage)
  });
  let registeredHouses = new Map();

  function refreshRegisteredHouses() {
    registeredHouses = buildRegisteredHouseIndex(localFamilySource.listRecords?.() || []);
  }

  function resolveRegisteredHouse(houseId) {
    return registeredHouses.get(houseId) || null;
  }
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
  const relationActionsDialog = createRelationActionsDialog(documentRef, runtime, latestLocalFamilySource);
  const relationshipDialog = createRelationshipDialog(documentRef);
  const lineColorsDialog = createLineColorsDialog(documentRef);
  const lineageDialog = createLineageDialog(documentRef);
  const lineageTimeGapDialog = createLineageTimeGapDialog(documentRef);
  const lineageOriginDialog = createLineageOriginDialog(documentRef);
  const newFamilyDialog = createNewFamilyDialog(documentRef);
  const cadetDialog = createCadetDialog(documentRef);
  const timeJumpDialog = createTimeJumpDialog(documentRef);
  const treeNodeActionsDialog = createTreeNodeActionsDialog(documentRef);
  const treeGeneratorController = createTreeGeneratorController({
    store,
    documentRef,
    runtime,
    notify: toast,
    relationActionsDialog,
    cadetDialog,
    focusPerson(personId) {
      chartSession?.focus(personId, { fit: true });
    }
  });
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
  const houseBiographyDialog = createHouseBiographyDialog({
    documentRef,
    runtime,
    onSave(_familyId, biographyModule) {
      store.setFamilyExtension(HOUSE_BIOGRAPHY_EXTENSION_ID, biographyModule);
      toast('Clanbeschreibung wurde lokal gespeichert.');
    },
    onRemove() {
      store.setFamilyExtension(HOUSE_BIOGRAPHY_EXTENSION_ID, null);
      toast('Clanbeschreibung wurde entfernt.');
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

  function lineageHouseName(family) {
    return family.houses.find(house => house.id === family.lineage.houseId)?.name
      || family.document.title;
  }

  function familyIdForHouse(houseId, currentFamily) {
    if (!houseId) return '';
    if (currentFamily.lineage.houseId === houseId) return currentFamily.document.id;
    const registered = localFamilySource.listRecords?.().find(record => (
      record.family?.lineage?.houseId === houseId
    ));
    if (registered?.id) return registered.id;
    const conventionalId = String(houseId).replace(/^house-/, 'haus-');
    return localFamilySource.loadById?.(conventionalId)?.id || '';
  }

  function navigateToFamily(familyId, missingMessage) {
    if (!familyId || !localFamilySource.loadById?.(familyId)) {
      toast(missingMessage, { error: true });
      return false;
    }
    const target = new URL(runtime.location.href);
    target.searchParams.set('family', familyId);
    target.searchParams.set('mode', workspaceMode);
    runtime.location.assign(target.href);
    return true;
  }

  function openTreeNodeActions(context) {
    const family = store.getState().family;
    treeNodeActionsDialog.open(context, family);
  }

  function performTreeNodeAction(actionId) {
    const state = store.getState();
    const context = treeNodeActionsDialog.getContext();
    if (!context || context.familyId !== state.family.document.id) {
      throw new Error('Der ausgewählte Knoten ist nicht mehr aktuell.');
    }
    if (actionId === 'back') {
      treeNodeActionsDialog.showPrimary();
      return;
    }
    if (actionId === 'continue-house') {
      treeNodeActionsDialog.showHouseContinuation(state.family);
      return;
    }
    if (actionId === 'edit-house-biography') {
      treeNodeActionsDialog.close();
      houseBiographyDialog.open(state.family, { editable: true });
      return;
    }
    if (actionId === 'edit-house') {
      treeNodeActionsDialog.close();
      lineageDialog.open(state.family);
      return;
    }
    if (actionId === 'add-direct') {
      treeNodeActionsDialog.close();
      treeGeneratorController.openAtLineage(context.partnershipId);
      return;
    }
    if (actionId === 'add-gap') {
      treeNodeActionsDialog.close();
      lineageTimeGapDialog.open(state.family, { focusLabel: true });
      return;
    }

    const barrier = context.kind === 'house-crest'
      ? findLineageBarrier(state.family, context.partnershipId)
      : context.kind === 'lineage-gap'
        ? { kind: 'lineage-gap', id: '' }
        : { kind: 'time-jump', id: context.timeJumpId };
    if (!barrier) throw new Error('An diesem Haus ist kein Zeitsprung vorhanden.');
    if (actionId === 'edit-gap') {
      treeNodeActionsDialog.close();
      if (barrier.kind === 'lineage-gap') lineageTimeGapDialog.open(state.family);
      else timeJumpDialog.openEdit(state.family, barrier.id);
      return;
    }
    if (actionId === 'add-after-gap') {
      treeNodeActionsDialog.close();
      if (barrier.kind === 'lineage-gap') {
        treeGeneratorController.openAtLineage(context.partnershipId || state.family.lineage.founderPartnershipId);
      } else {
        treeGeneratorController.openAtTimeJump(barrier.id);
      }
      return;
    }
    throw new Error('Diese Knotenaktion ist nicht verfügbar.');
  }

  function preferredSpouseId(family, personId) {
    const candidates = family.partnerships.filter(partnership => (
      partnership.participantIds.includes(personId)
      && ['marriage', 'union'].includes(partnership.type)
      && partnership.status === 'active'
    )).map(partnership => ({
      partnership,
      partnerId: partnership.participantIds.find(id => id !== personId),
      partner: family.persons.find(person => person.id === partnership.participantIds.find(id => id !== personId))
    })).sort((first, second) => (
      Number(second.partner?.status !== 'dead' && !second.partner?.death)
      - Number(first.partner?.status !== 'dead' && !first.partner?.death)
      || Number(second.partnership.start || 0) - Number(first.partnership.start || 0)
    ));
    const preferred = candidates[0]?.partnership;
    return preferred?.participantIds.find(id => id !== personId) || '';
  }

  function openRelationActions(personId) {
    const state = store.getState();
    const person = state.family.persons.find(item => item.id === personId);
    if (!person) return false;
    relationActionsDialog.open(person, state.family);
    return true;
  }

  function performRelationAction(actionId) {
    const state = store.getState();
    const person = state.family.persons.find(item => item.id === relationActionsDialog.getPersonId());
    if (!person) throw new Error('Die Person wurde nicht gefunden.');

    switch (actionId) {
      case 'revive':
        relationActionsDialog.close();
        store.updatePerson(person.id, { death: '', status: 'alive' });
        toast(`${person.name} wird wieder als lebend geführt.`);
        return;
      case 'legitimize': {
        const targets = state.family.parentages.filter(parentage => (
          parentage.childId === person.id && !['legitimate', 'legitimized'].includes(parentage.legitimacy)
        ));
        if (!targets.length) throw new Error('Für diese Person ist keine uneheliche Abstammung eingetragen.');
        relationActionsDialog.close();
        targets.forEach(parentage => store.updateParentage(parentage.id, { legitimacy: 'legitimized' }));
        toast(`${person.name} wurde legitimiert.`);
        return;
      }
      case 'beget-child':
        relationActionsDialog.close();
        relatedPersonDialog.open(person.id, state.family, {
          relationKind: 'child',
          secondParentId: preferredSpouseId(state.family, person.id),
          heading: `Kind von ${person.name} zeugen`
        });
        return;
      case 'adopt':
        relationActionsDialog.close();
        relatedPersonDialog.open(person.id, state.family, {
          relationKind: 'child',
          parentageType: 'adoptive',
          secondParentId: preferredSpouseId(state.family, person.id),
          heading: `Adoptivkind von ${person.name} anlegen`
        });
        return;
      case 'add-parent':
        relationActionsDialog.close();
        relatedPersonDialog.open(person.id, state.family, {
          relationKind: 'parent',
          heading: `Elternteil von ${person.name} ergänzen`
        });
        return;
      case 'add-related':
        relationActionsDialog.close();
        relatedPersonDialog.open(person.id, state.family);
        return;
      case 'link-existing':
        if (state.family.persons.length < 2) {
          throw new Error('Für eine Verknüpfung werden mindestens zwei Personen benötigt.');
        }
        relationActionsDialog.close();
        relationshipDialog.open(person.id, state.family);
        return;
      case 'delete-current-person':
        if (!runtime.confirm(`${person.name} samt direkten Verknüpfungen vollständig aus diesem Stammbaum entfernen?`)) return;
        relationActionsDialog.close();
        store.deletePerson(person.id);
        toast(`${person.name} wurde vollständig entfernt. Über „Rückgängig“ kann die Löschung sofort zurückgenommen werden.`);
        return;
      default:
        if (!relationActionsDialog.showStep(actionId)) {
          throw new Error('Diese Aktion ist noch nicht verfügbar.');
        }
    }
  }

  function toastPartnerSuccess(action, person, partnerName) {
    if (action === 'marry') toast(`${person.name} und ${partnerName} sind nun verheiratet.`);
    else if (action === 'betroth') toast(`${person.name} und ${partnerName} sind nun verlobt.`);
    else if (action === 'affair') toast(`Die Affäre zwischen ${person.name} und ${partnerName} wurde eingetragen.`);
    else toast(`${partnerName} wurde als Mündel bei ${person.name} aufgenommen.`);
  }

  function connectExistingPartner(action, person, partnerId, family) {
    if (action === 'import-ward') {
      const spouseId = preferredSpouseId(family, person.id);
      const parentIds = [person.id, spouseId].filter(Boolean).filter(id => id !== partnerId);
      store.addParentage({
        childId: partnerId,
        parentIds,
        partnershipId: findPartnershipId(family, parentIds),
        type: 'foster',
        legitimacy: 'unknown',
        certainty: 'confirmed',
        visibility: 'public'
      });
      const wardPerson = family.persons.find(item => item.id === partnerId);
      if (wardPerson && wardPerson.familyRole !== 'ward') store.updatePerson(partnerId, { familyRole: 'ward' });
      return;
    }
    const relation = relationForAction(action);
    const values = {
      participantIds: [person.id, partnerId],
      type: relation.partnershipType,
      status: relation.partnershipStatus,
      certainty: relation.certainty,
      visibility: relation.visibility
    };
    if (action === 'affair') store.addPartnership(values);
    else store.setExclusivePartnership(values);
  }

  function persistMirroredFamilyChange({
    currentRecord,
    currentBaseFamily,
    counterpartRecord,
    change,
    source
  }) {
    saveFamilyRecordsAtomically([
      {
        id: currentRecord.id,
        title: currentRecord.title,
        folderPath: currentRecord.folderPath,
        family: change.currentFamily
      },
      {
        id: counterpartRecord.id,
        title: counterpartRecord.title,
        folderPath: counterpartRecord.folderPath,
        family: change.counterpartFamily
      }
    ], runtime.localStorage);
    store.synchronizeFamily(change.currentFamily, {
      source,
      counterpartFamilyId: counterpartRecord.id,
      counterpartFamily: change.counterpartFamily,
      currentBaseFamily,
      counterpartBaseFamily: counterpartRecord.family,
      linkId: change.linkId
    });
  }

  function mirrorRegistryPartnership({ action, state, person, record, sourcePerson, marriageDirection = 'partner-leaves' }) {
    const currentRecord = loadFamilyById(state.family.document.id, runtime.localStorage);
    if (!currentRecord) {
      throw new Error('Bitte speichere die aktuelle Familienakte zuerst im Register, bevor du zwei Stammbäume verknüpfst.');
    }
    const relation = relationForAction(action);
    const change = createMirroredPartnershipChange({
      currentFamily: state.family,
      counterpartFamily: record.family,
      currentPersonId: person.id,
      counterpartPersonId: sourcePerson.id,
      type: relation.partnershipType,
      status: relation.partnershipStatus,
      certainty: relation.certainty,
      visibility: relation.visibility,
      leavingFamilyId: action === 'marry'
        ? (marriageDirection === 'current-leaves' ? state.family.document.id : record.family.document.id)
        : ''
    });
    persistMirroredFamilyChange({
      currentRecord,
      currentBaseFamily: state.family,
      counterpartRecord: record,
      change,
      source: 'cross-family-relationship'
    });
  }

  function mirrorRegistryGuardianship({ state, person, record, otherPerson, currentRole }) {
    const currentRecord = loadFamilyById(state.family.document.id, runtime.localStorage);
    if (!currentRecord) {
      throw new Error('Bitte speichere die aktuelle Familienakte zuerst im Register, bevor du ein Mündel zwischen zwei Stammbäumen vermittelst.');
    }
    const change = createMirroredGuardianshipChange({
      currentFamily: state.family,
      counterpartFamily: record.family,
      currentPersonId: person.id,
      counterpartPersonId: otherPerson.id,
      currentRole
    });
    persistMirroredFamilyChange({
      currentRecord,
      currentBaseFamily: state.family,
      counterpartRecord: record,
      change,
      source: 'cross-family-guardianship'
    });
  }

  function updateRegistryPartnership({ state, partnership, values }) {
    const relationship = partnership.extensions?.crossFamilyRelationship;
    if (!relationship?.linkId || !relationship.counterpartFamilyId) return false;
    const currentRecord = loadFamilyById(state.family.document.id, runtime.localStorage);
    const counterpartRecord = localFamilySource.loadById(relationship.counterpartFamilyId);
    if (!currentRecord || !counterpartRecord) {
      throw new Error('Mindestens eine Akte der gespiegelten Verbindung fehlt im Familienregister. Bitte die Verknüpfung dort zuerst wiederherstellen.');
    }
    const change = updateMirroredPartnershipChange({
      currentFamily: state.family,
      counterpartFamily: counterpartRecord.family,
      partnershipId: partnership.id,
      values
    });
    persistMirroredFamilyChange({
      currentRecord,
      currentBaseFamily: state.family,
      counterpartRecord,
      change,
      source: 'cross-family-relationship-updated'
    });
    return true;
  }

  function submitPartnerAction(values, state, person) {
    const action = values.action;
    if (values.partnerSource === 'new') {
      relationActionsDialog.close();
      if (action === 'import-ward') {
        relatedPersonDialog.open(person.id, state.family, {
          relationKind: 'child',
          parentageType: 'foster',
          secondParentId: preferredSpouseId(state.family, person.id),
          heading: `Mündel bei ${person.name} aufnehmen`
        });
        return;
      }
      relatedPersonDialog.open(person.id, state.family, {
        relationKind: 'partnership',
        partnershipType: action === 'marry' ? 'marriage' : action === 'betroth' ? 'engagement' : 'affair',
        partnershipStatus: action === 'affair' ? 'secret' : 'active',
        visibility: action === 'affair' ? 'private' : 'public',
        heading: action === 'marry'
          ? `${person.name} verheiraten`
          : action === 'betroth'
            ? `${person.name} verloben`
            : `Affäre für ${person.name} eintragen`
      });
      return;
    }
    if (values.partnerSource === 'tree') {
      if (!values.partnerPersonId) throw new Error('Bitte eine Person aus dem Baum wählen.');
      relationActionsDialog.close();
      connectExistingPartner(action, person, values.partnerPersonId, state.family);
      const partner = state.family.persons.find(item => item.id === values.partnerPersonId);
      toastPartnerSuccess(action, person, partner?.name || 'die gewählte Person');
      return;
    }
    if (!values.registryFamilyId || !values.registryPersonId) {
      throw new Error('Bitte Haus und Person aus dem Register wählen.');
    }
    const record = localFamilySource.loadById(values.registryFamilyId);
    const sourcePerson = record?.family.persons.find(item => item.id === values.registryPersonId);
    if (!sourcePerson) throw new Error('Die Person wurde im Register nicht gefunden.');
    const existing = findExistingImport(state.family, sourcePerson);
    if (record.id === state.family.document.id && existing) {
      relationActionsDialog.close();
      connectExistingPartner(action, person, existing.id, state.family);
      toastPartnerSuccess(action, person, existing.name);
      return;
    }
    if (action !== 'import-ward') {
      mirrorRegistryPartnership({
        action,
        state,
        person,
        record,
        sourcePerson,
        marriageDirection: values.marriageDirection
      });
      relationActionsDialog.close();
      toastPartnerSuccess(action, person, sourcePerson.name);
      toast(`Die Verbindung wurde auch in ${record.title} gespiegelt.`, { duration: 5500 });
      return;
    }
    mirrorRegistryGuardianship({
      state,
      person,
      record,
      otherPerson: sourcePerson,
      currentRole: 'guardian'
    });
    relationActionsDialog.close();
    toastPartnerSuccess(action, person, sourcePerson.name);
    toast(`Die Aufnahme wurde zugleich in ${record.title} als fortgegebenes Mündel verzeichnet.`, { duration: 6000 });
  }

  function submitRelationActionsForm() {
    const values = relationActionsDialog.read();
    const state = store.getState();
    const person = state.family.persons.find(item => item.id === values.personId);
    if (!person) throw new Error('Die Person wurde nicht gefunden.');

    if (values.action === 'change-portrait') {
      const portrait = assertUsablePortraitSource(values.portrait);
      store.updatePerson(person.id, { portrait });
      relationActionsDialog.close();
      toast(portrait
        ? `Das Portrait von ${person.name} wurde im lokalen Entwurf gespeichert. Für andere ist es erst nach „Online speichern“ sichtbar.`
        : `Für ${person.name} wird wieder die Standardsilhouette verwendet.`);
      return;
    }

    if (values.action === 'die') {
      const year = values.deathUnknown ? '????' : values.deathYear;
      if (!year) throw new Error('Bitte ein Todesjahr eintragen oder „unbekannt“ wählen.');
      relationActionsDialog.close();
      store.updatePerson(person.id, { death: year, status: 'dead' });
      toast(values.deathUnknown
        ? `${person.name} wird nun als verstorben geführt (Jahr unbekannt).`
        : `${person.name} ist im Jahr ${year} verstorben.`);
      return;
    }

    if (values.action === 'send-ward') {
      if (!values.targetFamilyId || !values.targetGuardianId) throw new Error('Bitte Zielhaus und aufnehmende Person wählen.');
      const record = localFamilySource.loadById(values.targetFamilyId);
      if (!record) throw new Error('Die Zielakte wurde im Register nicht gefunden.');
      const guardian = record.family.persons.find(item => item.id === values.targetGuardianId);
      if (!guardian) throw new Error('Die aufnehmende Person wurde im Zielhaus nicht gefunden.');
      mirrorRegistryGuardianship({
        state,
        person,
        record,
        otherPerson: guardian,
        currentRole: 'ward'
      });
      relationActionsDialog.close();
      toast(`${person.name} wurde an ${record.title} vermittelt und dort direkt als Mündel bei ${guardian.name} eingesetzt. Beide Akten warten gemeinsam auf „Online speichern“.`, { duration: 7000 });
      return;
    }

    if (values.action === 'marry-away') {
      const partnership = listLineagePartnerships(state.family, person.id)
        .find(item => item.id === values.partnershipId);
      if (!partnership) {
        throw new Error('Bitte eine Ehe oder Lebensgemeinschaft für den Wappenknoten wählen.');
      }
      relationActionsDialog.close();
      cadetDialog.openCreate(state.family, partnership.id);
      return;
    }

    if (values.action === 'divorce') {
      const partnership = state.family.partnerships.find(item => item.id === values.partnershipId);
      if (!partnership) throw new Error('Bitte eine Verbindung wählen.');
      const wasEngagement = partnership.type === 'engagement';
      const changes = {
        status: partnership.type === 'marriage' ? 'divorced' : 'ended',
        end: String(ALERIA_CURRENT_YEAR)
      };
      const mirrored = updateRegistryPartnership({ state, partnership, values: changes });
      if (!mirrored) store.updatePartnership(partnership.id, changes);
      relationActionsDialog.close();
      toast(wasEngagement
        ? `Das Verlöbnis wurde gelöst${mirrored ? ' und in beiden Familienakten aktualisiert' : ''}.`
        : partnership.type === 'marriage'
          ? `Die Ehe wurde geschieden${mirrored ? ' und in beiden Familienakten aktualisiert' : ''}.`
          : `Die Verbindung wurde gelöst${mirrored ? ' und in beiden Familienakten aktualisiert' : ''}.`);
      return;
    }

    if (values.action === 'delete-partnership') {
      const partnership = state.family.partnerships.find(item => item.id === values.removalId);
      if (!partnership) throw new Error('Bitte eine Verbindung zum Entfernen wählen.');
      const otherPersonIds = partnership.participantIds.filter(id => id !== person.id);
      const mirrored = removeRegistryPartnership({ state, partnership });
      if (!mirrored) {
        store.deletePartnership(partnership.id, {
          removeUnconnectedPersonIds: values.removeUnconnectedPartner ? otherPersonIds : []
        });
      }
      relationActionsDialog.close();
      toast(`Die Verbindung wurde vollständig entfernt${mirrored ? ' – in beiden Familienakten' : ''}. Über „Rückgängig“ kann eine lokale Löschung sofort zurückgenommen werden.`);
      return;
    }

    if (values.action === 'delete-parentage') {
      const parentage = state.family.parentages.find(item => item.id === values.removalId);
      if (!parentage) throw new Error('Bitte eine Kind-/Elternverknüpfung zum Entfernen wählen.');
      const mirrored = removeRegistryGuardianship({ state, parentage });
      if (!mirrored) {
        store.deleteParentage(parentage.id, {
          removeUnconnectedChild: values.removeUnconnectedChild
        });
      }
      relationActionsDialog.close();
      toast(`Die Kind-/Elternverknüpfung wurde vollständig entfernt${mirrored ? ' – in beiden Familienakten' : ''}.`);
      return;
    }

    if (values.action === 'delete-guardianship') {
      removeRegistryGuardianshipForPerson({ state, person });
      relationActionsDialog.close();
      toast('Die Mündelvermittlung wurde vollständig aus beiden Familienakten entfernt.');
      return;
    }

    if (values.action === 'upgrade-engagement') {
      const partnership = state.family.partnerships.find(item => item.id === values.partnershipId);
      if (!partnership) throw new Error('Bitte ein Verlöbnis wählen.');
      const changes = { type: 'marriage', status: 'active', start: String(ALERIA_CURRENT_YEAR), end: '' };
      const mirrored = updateRegistryPartnership({ state, partnership, values: changes });
      if (!mirrored) {
        store.setExclusivePartnership({
          participantIds: partnership.participantIds,
          type: 'marriage',
          status: 'active',
          start: String(ALERIA_CURRENT_YEAR),
          certainty: partnership.certainty,
          visibility: partnership.visibility,
          extensions: partnership.extensions
        });
      }
      relationActionsDialog.close();
      toast(`Aus dem Verlöbnis wurde eine Ehe${mirrored ? ' – in beiden Familienakten' : ''}.`);
      return;
    }

    if (['marry', 'betroth', 'affair', 'import-ward'].includes(values.action)) {
      submitPartnerAction(values, state, person);
      return;
    }
    throw new Error('Diese Aktion ist noch nicht verfügbar.');
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

  function openHouseBiography() {
    houseBiographyDialog.open(store.getState().family, { editable: isEditing });
    return true;
  }

  function removeRegistryPartnership({ state, partnership }) {
    const relationship = partnership.extensions?.crossFamilyRelationship;
    if (!relationship?.linkId || !relationship.counterpartFamilyId) return false;
    const currentRecord = loadFamilyById(state.family.document.id, runtime.localStorage);
    const counterpartRecord = localFamilySource.loadById(relationship.counterpartFamilyId);
    if (!currentRecord || !counterpartRecord) {
      throw new Error('Mindestens eine Akte der gespiegelten Verbindung fehlt im Familienregister.');
    }
    const change = removeMirroredPartnershipChange({
      currentFamily: state.family,
      counterpartFamily: counterpartRecord.family,
      partnershipId: partnership.id
    });
    persistMirroredFamilyChange({
      currentRecord,
      currentBaseFamily: state.family,
      counterpartRecord,
      change,
      source: 'cross-family-relationship-removed'
    });
    return true;
  }

  function removeRegistryGuardianship({ state, parentage }) {
    const guardianship = parentage.extensions?.crossFamilyGuardianship;
    if (!guardianship?.linkId) return false;
    const counterpartFamilyId = guardianship.wardFamilyId === state.family.document.id
      ? guardianship.guardianFamilyId
      : guardianship.wardFamilyId;
    const currentRecord = loadFamilyById(state.family.document.id, runtime.localStorage);
    const counterpartRecord = localFamilySource.loadById(counterpartFamilyId);
    if (!currentRecord || !counterpartRecord) {
      throw new Error('Mindestens eine Akte der gespiegelten Mündelverknüpfung fehlt im Familienregister.');
    }
    const change = removeMirroredGuardianshipChange({
      currentFamily: state.family,
      counterpartFamily: counterpartRecord.family,
      parentageId: parentage.id
    });
    persistMirroredFamilyChange({
      currentRecord,
      currentBaseFamily: state.family,
      counterpartRecord,
      change,
      source: 'cross-family-guardianship-removed'
    });
    return true;
  }

  function removeRegistryGuardianshipForPerson({ state, person }) {
    const localParentage = state.family.parentages.find(parentage => (
      parentage.extensions?.crossFamilyGuardianship?.linkId
      && (parentage.childId === person.id || parentage.parentIds.includes(person.id))
    ));
    const guardianship = person.extensions?.crossFamilyGuardianship
      || localParentage?.extensions?.crossFamilyGuardianship;
    if (!guardianship?.linkId) throw new Error('Für diese Person wurde keine gespiegelte Mündelvermittlung gefunden.');
    const counterpartFamilyId = guardianship.wardFamilyId === state.family.document.id
      ? guardianship.guardianFamilyId
      : guardianship.wardFamilyId;
    const currentRecord = loadFamilyById(state.family.document.id, runtime.localStorage);
    const counterpartRecord = localFamilySource.loadById(counterpartFamilyId);
    if (!currentRecord || !counterpartRecord) {
      throw new Error('Mindestens eine Akte der gespiegelten Mündelverknüpfung fehlt im Familienregister.');
    }
    const change = removeMirroredGuardianshipChange({
      currentFamily: state.family,
      counterpartFamily: counterpartRecord.family,
      parentageId: localParentage?.id || '',
      personId: person.id,
      linkId: guardianship.linkId
    });
    persistMirroredFamilyChange({
      currentRecord,
      currentBaseFamily: state.family,
      counterpartRecord,
      change,
      source: 'cross-family-guardianship-removed'
    });
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
      refreshRegisteredHouses();
      chartSession = createFamilyChartSession({
        container: chartContainer,
        family,
        view: family.view,
        options: { resolveHouse: resolveRegisteredHouse },
        runtime,
        onPersonClick({ personId }) {
          if (!isEditing) return relationshipMatrixDialog.open(store.getState().family, personId);
          store.selectPerson(personId);
          return openRelationActions(personId);
        },
        onPortraitClick({ personId }) {
          if (isEditing) {
            store.selectPerson(personId);
            return openRelationActions(personId);
          }
          return openPersonBiography(personId);
        },
        onPersonCrestClick({ personId }) {
          const currentFamily = store.getState().family;
          const person = currentFamily.persons.find(entry => entry.id === personId);
          const familyId = familyIdForHouse(person?.houseId, currentFamily);
          return navigateToFamily(
            familyId,
            'Für dieses Wappen ist noch kein eigener Stammbaum im Familienregister angelegt.'
          );
        },
        onFamilyLinkClick({ familyId, branchId }) {
          if (!familyId) return;
          if (isEditing) {
            cadetDialog.openEdit(store.getState().family, branchId);
            return;
          }
          navigateToFamily(familyId, 'Das verknüpfte Haus ist noch nicht im Familienregister angelegt.');
        },
        onLineageOriginClick({ familyId }) {
          if (isEditing) {
            lineageOriginDialog.open(store.getState().family);
            return;
          }
          if (!familyId) return;
          navigateToFamily(familyId, 'Das verknüpfte Ursprungshaus ist noch nicht im Familienregister angelegt.');
        },
        onTimeJumpClick({ timeJumpId }) {
          if (!isEditing) return;
          const timeJump = store.getState().family.timeJumps.find(item => item.id === timeJumpId);
          openTreeNodeActions({ kind: 'time-jump', timeJumpId, label: timeJump?.label || 'Zeitsprung' });
        },
        onLineageCrestClick({ partnershipId }) {
          if (isEditing) {
            const family = store.getState().family;
            openTreeNodeActions({ kind: 'house-crest', partnershipId, label: lineageHouseName(family) });
            return;
          }
          openHouseBiography();
          return true;
        },
        onLineageTimeGapClick({ partnershipId }) {
          if (isEditing) {
            openTreeNodeActions({ kind: 'lineage-gap', partnershipId, label: 'Zeitsprung unter dem Hauswappen' });
          }
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
      if (event?.affectsFamily) {
        refreshRegisteredHouses();
        chartSession.update(state.family, state.family.view);
      }
    } catch (error) {
      showChartStatus(error.message, true);
    }
  }

  function renderHeader(family) {
    documentRef.getElementById('family-title').textContent = family.document.title;
    documentRef.getElementById('family-motto').textContent = family.document.motto || '—';
    const houseProfile = documentRef.getElementById('family-house-profile');
    houseProfile.hidden = isHouseProfileEmpty(family.document.houseProfile);
    documentRef.getElementById('family-house-profile-text').textContent = formatHouseProfile(family.document.houseProfile);
    const rankIcon = documentRef.getElementById('family-rank-icon');
    const rankIconSrc = getHouseRankIcon(family.document.houseProfile.rankId);
    rankIcon.hidden = !rankIconSrc;
    rankIcon.src = rankIconSrc;
    rankIcon.alt = rankIconSrc ? getHouseRank(family.document.houseProfile.rankId).label : '';
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
    const emblemButton = documentRef.getElementById('family-emblem-button');
    const source = family.document.emblem || family.houses[0]?.emblem;
    emblem.hidden = !source;
    emblemButton.hidden = !source;
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
      // Der Passwort-Dialog wurde ohne Freigabe abgebrochen — ein zuvor über die
      // Landingpage-CTA gesetzter Auto-Öffnen-Merker darf dann nicht bestehen
      // bleiben, sonst würde ein später an ganz anderer Stelle gewährter
      // Bearbeitungszugang unerwartet die dort offene Familie zurücksetzen.
      clearPendingTreeGeneratorLaunch(runtime.sessionStorage);
      return;
    }
    if (action === 'open-house-biography') {
      openHouseBiography();
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
      case 'open-relation-actions':
        if (selected) openRelationActions(selected.id);
        else toast('Bitte zuerst eine Person auswählen.', { error: true });
        break;
      case 'close-relation-actions':
        relationActionsDialog.close();
        break;
      case 'relation-actions-back':
        relationActionsDialog.showMenu();
        break;
      case 'relation-action':
        performRelationAction(actionElement.dataset.relationAction);
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
      case 'close-lineage-time-gap':
        lineageTimeGapDialog.close();
        break;
      case 'delete-lineage-time-gap':
        if (runtime.confirm('Diesen Zeitsprung unter dem Hauswappen entfernen? Die Nachkommen bleiben erhalten.')) {
          lineageTimeGapDialog.close();
          store.setLineageTimeGap({ enabled: false });
          toast('Zeitsprung unter dem Hauswappen wurde entfernt.');
        }
        break;
      case 'close-tree-node-actions':
        treeNodeActionsDialog.close();
        break;
      case 'tree-node-action':
        performTreeNodeAction(actionElement.dataset.nodeAction);
        break;
      case 'close-lineage-origin-dialog':
        lineageOriginDialog.close();
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
      case 'open-time-jump-actions': {
        const timeJump = state.family.timeJumps.find(item => item.id === actionElement.dataset.timeJumpId);
        if (!timeJump) throw new Error('Der Zeitsprungknoten wurde nicht gefunden.');
        openTreeNodeActions({
          kind: 'time-jump',
          timeJumpId: timeJump.id,
          label: timeJump.label || 'Zeitsprung'
        });
        break;
      }
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
      case 'open-tree-generator':
        treeGeneratorController.open();
        break;
      case 'close-tree-generator':
        treeGeneratorController.close();
        break;
      case 'tree-generator-commit-phase-1':
        treeGeneratorController.commitPhaseOne();
        break;
      case 'tree-generator-commit-phase-2':
        treeGeneratorController.commitPhaseTwo();
        break;
      case 'tree-generator-select-guided-mode':
        treeGeneratorController.selectGenerationMode('guided');
        break;
      case 'tree-generator-select-automatic-mode':
        treeGeneratorController.selectGenerationMode('automatic');
        break;
      case 'tree-generator-back-to-mode-choice':
        treeGeneratorController.backToModeChoice();
        break;
      case 'tree-generator-preview-automatic':
        treeGeneratorController.previewAutomaticTemplate();
        break;
      case 'tree-generator-reroll-automatic':
        treeGeneratorController.previewAutomaticTemplate({ reroll: true });
        break;
      case 'tree-generator-accept-automatic':
        treeGeneratorController.acceptAutomaticTemplate();
        break;
      case 'tree-generator-skip-time-jump':
        treeGeneratorController.skipTimeJump();
        break;
      case 'tree-generator-reveal-time-jump':
        treeGeneratorController.revealTimeJumpFields();
        break;
      case 'tree-generator-commit-time-jump':
        treeGeneratorController.commitTimeJump();
        break;
      case 'tree-generator-toggle-child-form':
        treeGeneratorController.toggleChildForm(actionElement.dataset.lineId);
        break;
      case 'tree-generator-cancel-child':
        treeGeneratorController.cancelChildForm();
        break;
      case 'tree-generator-add-child':
        treeGeneratorController.addChild(actionElement.dataset.personId, actionElement.dataset.lineId);
        break;
      case 'tree-generator-delegate-marriage':
        treeGeneratorController.delegateMarriage(actionElement.dataset.personId);
        break;
      case 'tree-generator-delegate-cadet':
        treeGeneratorController.delegateCadet(
          actionElement.dataset.personId,
          actionElement.dataset.partnershipId
        );
        break;
      case 'tree-generator-next-generation':
        treeGeneratorController.nextGeneration();
        break;
      case 'tree-generator-ai-suggest': {
        const field = actionElement.dataset.suggestField;
        const targetInput = field ? treeGeneratorController.dialog.querySelector(`[name="${field}"]`) : null;
        actionElement.classList.add('ai-suggest-button--busy');
        await treeGeneratorController.requestAiSuggestion(actionElement.dataset.suggestKind, field, targetInput);
        actionElement.classList.remove('ai-suggest-button--busy');
        break;
      }
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
      case 'export-family-bundle': {
        actionElement.disabled = true;
        toast('Vollständiges Paket wird gepackt …', { duration: 20000 });
        try {
          const result = await downloadFamilyBundle(state.family, { documentRef, runtime });
          toast(result.failedCount
            ? `Paket exportiert · ${result.failedCount} von ${result.imageCount} Bildern konnten nicht mitexportiert werden.`
            : `Paket exportiert · ${result.imageCount} Bilder enthalten.`, { duration: 6000 });
        } catch (error) {
          toast(error.message || 'Das Paket konnte nicht erzeugt werden.', { error: true, duration: 5000 });
        } finally {
          actionElement.disabled = false;
        }
        break;
      }
      case 'trigger-bundle-import':
        bundleImportInput.click();
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

  async function handleBundleImport(file) {
    if (!file) return;
    try {
      await importFamilyBundle({ file, store, assetRepository, runtime, notify: toast });
    } catch (error) {
      toast(error.message || 'Das Paket konnte nicht importiert werden.', { error: true, duration: 5000 });
    } finally {
      bundleImportInput.value = '';
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
    if (family.document.id === store.getState().family.document.id) {
      throw new Error('Diese Familien-ID gehört bereits zur geöffneten Akte. Bitte für die neue Familie eine andere ID wählen.');
    }
    store.replaceFamily(family, { source: 'new-founding-family' });
    store.selectPerson(family.view.focusPersonId);
    const target = new URL(runtime.location.href);
    target.searchParams.delete('family');
    runtime.history.replaceState({}, '', target.href);
    newFamilyDialog.close();
    if (values.nextStep === 'register') {
      familySaveDialog.open(family, []);
    } else {
      treeGeneratorController.open({ mode: values.nextStep });
    }
    toast(`${family.document.title} wurde als neue Gründerfamilie angelegt.`);
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

  function submitLineageTimeGapForm() {
    store.setLineageTimeGap(lineageTimeGapDialog.read());
    lineageTimeGapDialog.close();
    toast('Zeitsprung unter dem Hauswappen wurde gespeichert.');
  }

  function submitLineageOriginForm() {
    const values = lineageOriginDialog.read();
    if (!values.name.trim()) throw new Error('Bitte einen Namen für das Ursprungshaus eintragen.');
    if (!values.childIds.length) throw new Error('Bitte mindestens eine anschließende Person auswählen.');
    store.setLineageOrigin(values);
    lineageOriginDialog.close();
    toast('Das vorgelagerte Ursprungshaus wurde gespeichert.');
  }

  function submitCadetForm() {
    const values = cadetDialog.read();
    if (!values.name.trim()) throw new Error('Bitte einen Namen für das Kadettenhaus eintragen.');
    const requiresPersonAnchor = ['ward-away', 'migration-offshoot', 'single-founder-house'].includes(values.linkType);
    if (values.linkType === 'ward-away' && !values.parentPersonId) {
      throw new Error('Eine Mündelvermittlung benötigt die fortgegebene Person.');
    }
    if (values.linkType === 'migration-offshoot' && !values.parentPersonId) {
      throw new Error('Ein Auswanderungszweig benötigt seine auswandernde Gründerperson.');
    }
    if (values.linkType === 'single-founder-house' && !values.parentPersonId) {
      throw new Error('Diese Hausgründung benötigt ihre alleinige Gründerperson.');
    }
    if (!requiresPersonAnchor && !values.parentPartnershipId) {
      throw new Error('Bitte ein Gründerpaar wählen.');
    }
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
    const record = saveFamilyToLibrary({
      family: store.getState().family,
      id: values.id,
      title: values.title,
      folderPath: values.folderPath,
      folderIcons: values.folderIcons,
      rankId: values.rankId,
      unclassified: values.unclassified
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
    if (event.target === bundleImportInput) handleBundleImport(bundleImportInput.files?.[0]);
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
    if (event.target === relationActionsDialog.form) {
      event.preventDefault();
      try {
        submitRelationActionsForm();
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
    if (event.target === lineageTimeGapDialog.form) {
      event.preventDefault();
      try {
        submitLineageTimeGapForm();
      } catch (error) {
        toast(error.message, { error: true, duration: 5000 });
      }
    }
    if (event.target === lineageOriginDialog.form) {
      event.preventDefault();
      try {
        submitLineageOriginForm();
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
      ? 'Ziehen zum Verschieben · Mausrad zum Zoomen · Karte oder Portrait öffnet „Beziehung modifizieren“'
      : 'Ziehen zum Verschieben · Mausrad zum Zoomen · Portrait öffnet die Biographie · Wappen öffnen weitere Häuser';
    documentRef.querySelectorAll('[data-current-year]').forEach(element => {
      element.textContent = String(ALERIA_CURRENT_YEAR);
    });
    if (isEditing) renderFamilyLegend(documentRef.getElementById('family-legend'));
    if (isEditing) editorToolbarController.init();
    documentRef.addEventListener('click', onClick);
    documentRef.addEventListener('input', onInput);
    documentRef.addEventListener('change', onChange);
    documentRef.addEventListener('submit', onSubmit);
    documentRef.addEventListener('keydown', onKeydown);
    unsubscribe = store.subscribe(render);
    render(store.getState());
    root.dataset.ready = 'true';
    if (requestEditOnInit) runtime.setTimeout(() => editAccessDialog.open(), 0);
    // Landingpage-CTA "＋ Neue Familie beginnen": startet immer mit einer leeren
    // Familienakte (nicht mit der zuletzt geöffneten/zwischengespeicherten), damit
    // der Generator garantiert bei Phase 1 beginnt statt mitten in einer fremden
    // Generation fortzusetzen. Der Merker wird hier ein für alle Mal konsumiert.
    if (autoOpenTreeGenerator && isEditing && consumePendingTreeGeneratorLaunch(runtime.sessionStorage)) {
      runtime.setTimeout(() => {
        store.replaceFamily(createEmptyFamily(), { source: 'tree-generator-cta' });
        store.selectPerson('');
        treeGeneratorController.open();
      }, 0);
    }
  }

  function destroy() {
    documentRef.removeEventListener('click', onClick);
    documentRef.removeEventListener('input', onInput);
    documentRef.removeEventListener('change', onChange);
    documentRef.removeEventListener('submit', onSubmit);
    documentRef.removeEventListener('keydown', onKeydown);
    editorToolbarController.destroy();
    unsubscribe?.();
    chartSession?.destroy();
    personBiographyDialog.destroy();
    houseBiographyDialog.destroy();
  }

  return Object.freeze({ init, destroy });
}
