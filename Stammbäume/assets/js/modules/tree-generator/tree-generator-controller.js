import { createFamilyProfileDraft, commitFounderCouple } from '../../domain/family-factory.js';
import { createFamilyGraph } from '../../domain/family-graph.js';
import { deriveTreeGeneratorPhase } from '../../domain/tree-generator-phase.js';
import {
  AGING_KINDS,
  suggestBirthYear,
  suggestDeathYear,
  suggestMarriageYear,
  suggestName
} from '../../domain/tree-generator-suggestions.js';
import { createTreeGeneratorDialog, defaultParams } from '../../ui/tree-generator-dialog.js';
import {
  buildBirthYearPrompt,
  buildDeathYearPrompt,
  buildNameSuggestionPrompt,
  requestAleriaGptSuggestion
} from './tree-generator-ai-bridge.js';

const PARAMS_STORAGE_KEY = 'tree-generator-params-v1';

function findActiveSpouseId(family, personId) {
  const partnership = family.partnerships.find(item => (
    item.participantIds.includes(personId)
    && ['marriage', 'union'].includes(item.type)
    && ['active', 'widowed'].includes(item.status)
  ));
  return partnership?.participantIds.find(id => id !== personId) || '';
}

function loadStoredParams(runtime) {
  try {
    const raw = runtime.localStorage?.getItem(PARAMS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveStoredParams(runtime, params) {
  try {
    runtime.localStorage?.setItem(PARAMS_STORAGE_KEY, JSON.stringify(params));
  } catch {
    // localStorage kann in manchen Kontexten (privater Modus etc.) fehlschlagen —
    // die Parameter bleiben dann einfach nur für diese Sitzung erhalten.
  }
}

export function createTreeGeneratorController({
  store,
  documentRef = document,
  runtime = globalThis,
  notify = () => {},
  relationActionsDialog,
  cadetDialog,
  focusPerson = () => {}
}) {
  const dialog = createTreeGeneratorDialog(documentRef);
  let params = { ...defaultParams(), ...(loadStoredParams(runtime) || {}) };
  // Nur für die aktuell offene Sitzung: siehe Kommentare in tree-generator-phase.js.
  // Beide werden bei jedem frischen open() zurückgesetzt.
  let skipTimeJumpOffer = false;
  let currentGenerationDepth = null;

  function currentFamily() {
    return store.getState().family;
  }

  function renderCurrent() {
    const family = currentFamily();
    const phaseInfo = deriveTreeGeneratorPhase(family, { skipTimeJumpOffer, currentGenerationDepth });
    // Einmal ermittelt, bleibt die Arbeitsgeneration für den Rest der Sitzung fest
    // stehen (siehe tree-generator-phase.js) — erst "Diese Generation abschließen"
    // erhöht sie bewusst.
    if (phaseInfo.phase === 4 && currentGenerationDepth === null) {
      currentGenerationDepth = phaseInfo.generationIndex;
    }
    dialog.renderPhase(phaseInfo, family, params);
    return phaseInfo;
  }

  function open() {
    skipTimeJumpOffer = false;
    currentGenerationDepth = null;
    dialog.open();
    renderCurrent();
  }

  function close() {
    dialog.close();
  }

  store.subscribe((state, event) => {
    if (dialog.dialog.open && event.affectsFamily) renderCurrent();
  });

  // Parameteränderungen (Checkbox-Panel) lösen sofort ein Re-Rendering aus, damit
  // z. B. das Aus-/Einblenden von Bastard-/Adoptions-/Zwillingsfeldern live reagiert.
  dialog.form.addEventListener('change', event => {
    if (String(event.target.name || '').startsWith('param-')) readParams();
  });

  function commitPhaseOne() {
    const values = dialog.read('phase-1');
    if (!values.documentTitle) throw new Error('Bitte einen Hausnamen eintragen.');
    const draft = createFamilyProfileDraft(values);
    store.replaceFamily(draft, { source: 'tree-generator-phase-1' });
    renderCurrent();
    notify('Hausstammdaten übernommen.');
  }

  function commitPhaseTwo() {
    const values = dialog.read('phase-2');
    const family = currentFamily();
    const nextFamily = commitFounderCouple(family, values);
    store.replaceFamily(nextFamily, { source: 'tree-generator-phase-2' });
    store.selectPerson(`${family.document.id}-gruender`);
    renderCurrent();
    notify('Gründerpaar angelegt.');
  }

  function skipTimeJump() {
    skipTimeJumpOffer = true;
    renderCurrent();
  }

  function commitTimeJump() {
    const values = dialog.read('phase-3-time-jump');
    const family = currentFamily();
    store.addTimeJump({
      parentPartnershipId: family.lineage.founderPartnershipId,
      years: values.years,
      fromYear: values.fromYear,
      toYear: values.toYear,
      label: values.label,
      notes: values.notes
    });
    renderCurrent();
    notify('Zeitsprung eingefügt.');
  }

  function toggleChildForm(personId) {
    dialog.toggleChildForm(personId);
    renderCurrent();
  }

  function cancelChildForm() {
    dialog.clearActiveChildForm();
    renderCurrent();
  }

  function addChild(personId) {
    const values = dialog.read({ childOf: personId });
    if (!values.name && !params.usePlaceholders) {
      throw new Error('Bitte einen Namen eintragen oder „Platzhalter verwenden“ aktivieren.');
    }
    const family = currentFamily();
    const phaseInfo = deriveTreeGeneratorPhase(family);
    const leaf = (phaseInfo.openLeaves || []).find(item => item.personId === personId);
    const agingKind = params.allowSpecialAging ? (values.agingKind || 'normal') : 'normal';
    // Priester/Magier/Druiden-Alterung hat kein eigenes Schema-Feld — als Tag
    // festgehalten, damit sie in der Personenkarte sichtbar bleibt.
    const agingTag = agingKind !== 'normal' ? [AGING_KINDS[agingKind]?.label.split(' (')[0] || agingKind] : [];
    let death = values.death;
    if (!death && params.autoCalculateDeath && values.birth) {
      death = suggestDeathYear({ birthYear: values.birth, params, agingKind });
      if (death === '???') death = '';
    }
    const personValues = {
      name: values.name || '???',
      title: '',
      sex: values.sex,
      status: death ? 'dead' : 'alive',
      birth: values.birth,
      death,
      portrait: '',
      portraitPlaceholder: 'auto',
      houseId: family.persons.find(item => item.id === personId)?.houseId || '',
      familyRole: 'core',
      lineageRole: 'branch',
      tags: agingTag,
      notes: ''
    };
    // Ein nicht-uneheliches Kind wird, falls vorhanden, an die aktuelle Ehe/Partnerschaft
    // der Bezugsperson angebunden, statt nur an ein Elternteil.
    const activeSpouseId = !values.bastard ? findActiveSpouseId(family, personId) : '';
    const relationValues = leaf?.unresolvedTimeJumpId
      ? { relationKind: 'time-jump-child', timeJumpId: leaf.unresolvedTimeJumpId, legitimacy: 'unknown', certainty: 'probable', visibility: 'public', parentageType: 'claimed' }
      : {
        relationKind: 'child',
        secondParentId: activeSpouseId,
        legitimacy: values.bastard ? 'illegitimate' : 'legitimate',
        parentageType: values.adoption ? 'adoptive' : 'biological',
        certainty: 'confirmed',
        visibility: 'public'
      };
    const newPersonId = store.addRelatedPerson(personId, personValues, relationValues);

    if (values.twin) {
      // Der Zwilling bekommt bewusst keinen aus dem Geschwistername abgeleiteten
      // Platzhalter (kein echter Name) — der eigene Name wird anschließend über die
      // normale Personenbearbeitung ergänzt, nur Geburtsjahr und Querverweis-Tag
      // werden automatisch übernommen.
      const twinValues = {
        ...personValues,
        name: '???',
        tags: [`Zwilling von ${personValues.name}`]
      };
      store.addRelatedPerson(personId, twinValues, relationValues);
    }

    dialog.setLastAddedChild({ personId: newPersonId, name: personValues.name, referencePersonId: personId });
    dialog.clearActiveChildForm();
    renderCurrent();
    focusPerson(newPersonId);
    notify(`${personValues.name} wurde hinzugefügt.`);
  }

  function delegateMarriage(personId) {
    const family = currentFamily();
    const person = family.persons.find(item => item.id === personId);
    if (!person) return;
    relationActionsDialog.open(person, family);
  }

  function delegateCadet(personId) {
    const family = currentFamily();
    const partnership = family.partnerships.find(item => item.participantIds.includes(personId));
    cadetDialog.openCreate(family, partnership?.id || '');
  }

  function nextGeneration() {
    const family = currentFamily();
    const phaseInfo = deriveTreeGeneratorPhase(family, { skipTimeJumpOffer, currentGenerationDepth });
    if (phaseInfo.phase !== 4) return;
    const graph = createFamilyGraph(family);
    // Nur warnen, wenn wirklich noch NIEMAND in dieser Generation angefasst wurde
    // (kein Kind, keine Ehe/Verlobung, kein Kadettenzweig) — wer bereits ein Kind
    // hat, aber im Arbeitsblatt bleibt (für ggf. weitere Kinder), soll den Hinweis
    // nicht jedes Mal auslösen.
    const untouched = (phaseInfo.openLeaves || []).some(leaf => (
      graph.getChildren(leaf.personId).length === 0 && graph.getPartners(leaf.personId).length === 0
    ));
    if (untouched) {
      const proceed = runtime.confirm?.(
        'Diese Generation hat noch gänzlich unberührte Personen (kein Kind, keine Ehe). Trotzdem fortfahren?'
      );
      if (proceed === false) return;
    }
    currentGenerationDepth = phaseInfo.generationIndex + 1;
    dialog.clearActiveChildForm();
    renderCurrent();
  }

  function readParams() {
    params = { ...params, ...dialog.read('params') };
    saveStoredParams(runtime, params);
    renderCurrent();
  }

  async function requestAiSuggestion(kind, field, targetInput) {
    const family = currentFamily();
    const houseName = family.document.title;
    let promptText = '';
    if (kind === 'text') {
      promptText = `${houseName ? `Haus ${houseName}: ` : ''}Schlage einen kurzen, passenden Wert für das Feld "${field}" vor. Antworte nur mit dem Vorschlag, ohne Erklärung.`;
    } else if (kind.startsWith('name-')) {
      const sex = kind === 'name-male' ? 'male' : kind === 'name-female' ? 'female' : 'unknown';
      promptText = buildNameSuggestionPrompt({ houseName, sex, usedNames: family.persons.map(p => p.name) });
    } else if (kind === 'birth-year') {
      promptText = buildBirthYearPrompt({ houseName, anchorLabel: 'Ein Elternteil', anchorYear: new Date().getFullYear() });
    } else {
      promptText = buildDeathYearPrompt({ houseName, personName: 'Diese Person', birthYear: '????' });
    }
    const result = await requestAleriaGptSuggestion(promptText, { runtime });
    if (targetInput) {
      targetInput.value = result.ok ? result.text.split(/[,\n]/)[0].trim() : (targetInput.value || suggestFallback(kind));
    }
  }

  function suggestFallback(kind) {
    if (kind.startsWith('name-')) {
      const sex = kind === 'name-male' ? 'male' : kind === 'name-female' ? 'female' : 'unknown';
      return suggestName(sex, currentFamily().persons.map(p => p.name));
    }
    if (kind === 'birth-year') return suggestBirthYear({ anchorYear: new Date().getFullYear() - 30, role: 'child', params });
    if (kind === 'death-year') return suggestDeathYear({ birthYear: new Date().getFullYear() - 30, params });
    if (kind === 'marriage-year') return suggestMarriageYear({ manBirthYear: new Date().getFullYear() - 30, params });
    return '???';
  }

  return Object.freeze({
    dialog: dialog.dialog,
    open,
    close,
    commitPhaseOne,
    commitPhaseTwo,
    skipTimeJump,
    commitTimeJump,
    toggleChildForm,
    cancelChildForm,
    addChild,
    delegateMarriage,
    delegateCadet,
    nextGeneration,
    readParams,
    requestAiSuggestion
  });
}
