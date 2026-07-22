import { createFamilyProfileDraft, commitFounderCouple } from '../../domain/family-factory.js';
import { createFamilyGraph } from '../../domain/family-graph.js';
import {
  deriveFocusedContinuationPhase,
  deriveTreeGeneratorPhase
} from '../../domain/tree-generator-phase.js';
import { ALERIA_CURRENT_YEAR } from '../../config/chronology.js';
import {
  suggestBirthYear,
  suggestDeathYear,
  suggestMarriageYear,
  suggestName
} from '../../domain/tree-generator-suggestions.js';
import { createTreeGeneratorDialog, defaultParams } from '../../ui/tree-generator-dialog.js';
import {
  buildBirthYearPrompt,
  buildDeathYearPrompt,
  buildMarriageYearPrompt,
  buildNameSuggestionPrompt,
  requestAleriaGptSuggestion
} from './tree-generator-ai-bridge.js';
import {
  assertLineChildCapacity,
  childCountForLine,
  normalizeGenerationParams,
  prepareGeneratedChild
} from './generation-policy.js';
import {
  automaticTemplateOptionsSignature,
  generateAutomaticFamilyTemplate,
  normalizeAutomaticTemplateOptions
} from './automatic-family-template.js';
import { listLineagePartnerships } from '../relationships/lineage-partnership-policy.js';

const PARAMS_STORAGE_KEY = 'tree-generator-params-v1';

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
  let params = { ...normalizeGenerationParams({ ...defaultParams(), ...(loadStoredParams(runtime) || {}) }) };
  // Nur für die aktuell offene Sitzung: siehe Kommentare in tree-generator-phase.js.
  // Beide werden bei jedem frischen open() zurückgesetzt.
  let skipTimeJumpOffer = false;
  let currentGenerationDepth = null;
  let focusedContinuation = null;
  let generationMode = '';
  let automaticOptions = null;
  let automaticPreview = null;
  let automaticPreviewSignature = '';
  let automaticPreviewStale = false;
  let automaticRerollCount = 0;

  function defaultAutomaticOptions() {
    const family = currentFamily();
    return normalizeAutomaticTemplateOptions({
      templateId: 'balanced',
      generationCount: 4,
      seed: `${family.document.id || 'familie'}-vorlage`,
      params: {
        ...params,
        autoGenerateNames: true,
        autoCalculateBirth: true,
        autoCalculateDeath: true
      },
      timeJump: { enabled: false, years: 25 }
    });
  }

  function resetAutomaticState() {
    generationMode = '';
    automaticOptions = null;
    automaticPreview = null;
    automaticPreviewSignature = '';
    automaticPreviewStale = false;
    automaticRerollCount = 0;
  }

  function phaseFor(family) {
    return focusedContinuation
      ? deriveFocusedContinuationPhase(family, focusedContinuation)
      : deriveTreeGeneratorPhase(family, { skipTimeJumpOffer, currentGenerationDepth });
  }

  function currentFamily() {
    return store.getState().family;
  }

  function renderCurrent() {
    const family = currentFamily();
    const phaseInfo = phaseFor(family);
    // Einmal ermittelt, bleibt die Arbeitsgeneration für den Rest der Sitzung fest
    // stehen (siehe tree-generator-phase.js) — erst "Diese Generation abschließen"
    // erhöht sie bewusst.
    if (phaseInfo.phase === 4 && currentGenerationDepth === null) {
      currentGenerationDepth = phaseInfo.generationIndex;
    }
    dialog.renderPhase(phaseInfo, family, params, {
      mode: generationMode,
      options: automaticOptions,
      preview: automaticPreview,
      previewStale: automaticPreviewStale
    });
    return phaseInfo;
  }

  function open(options = {}) {
    skipTimeJumpOffer = false;
    currentGenerationDepth = null;
    focusedContinuation = null;
    resetAutomaticState();
    if (options.mode === 'automatic' || options.mode === 'guided') generationMode = options.mode;
    if (generationMode === 'automatic') automaticOptions = defaultAutomaticOptions();
    dialog.open();
    renderCurrent();
  }

  function openAtLineage(partnershipId) {
    skipTimeJumpOffer = true;
    currentGenerationDepth = null;
    focusedContinuation = { partnershipId };
    resetAutomaticState();
    dialog.open();
    renderCurrent();
  }

  function openAtTimeJump(timeJumpId) {
    skipTimeJumpOffer = true;
    currentGenerationDepth = null;
    focusedContinuation = { timeJumpId };
    resetAutomaticState();
    dialog.open();
    renderCurrent();
  }

  function close() {
    dialog.close();
    resetAutomaticState();
  }

  store.subscribe((state, event) => {
    if (dialog.dialog.open && event.affectsFamily) renderCurrent();
  });

  function isAutomaticOptionField(target) {
    const name = String(target?.name || '');
    return name.startsWith('automatic') || name.startsWith('param-');
  }

  function invalidateAutomaticPreview() {
    if (!automaticPreview) return false;
    automaticPreview = null;
    automaticPreviewSignature = '';
    automaticPreviewStale = true;
    dialog.markAutomaticPreviewStale();
    return true;
  }

  function captureAutomaticOptionsFromForm(event) {
    if (generationMode !== 'automatic' || !isAutomaticOptionField(event.target)) return;
    automaticOptions = normalizeAutomaticTemplateOptions(readAutomaticOptions());
    invalidateAutomaticPreview();
  }

  // Parameteränderungen werden ohne Re-Rendering übernommen, damit bereits
  // ausgefüllte Personenfelder beim Konfigurieren der Generation erhalten bleiben.
  // Im Automatikmodus entwertet jede sichtbare Änderung eine vorhandene Vorschau.
  dialog.form.addEventListener('input', captureAutomaticOptionsFromForm);
  dialog.form.addEventListener('change', event => {
    if (String(event.target.name || '').startsWith('param-') && generationMode !== 'automatic') {
      readParams({ render: false });
    }
    captureAutomaticOptionsFromForm(event);
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

  function selectGenerationMode(mode) {
    if (!['guided', 'automatic'].includes(mode)) {
      throw new Error('Diese Generator-Betriebsart ist unbekannt.');
    }
    generationMode = mode;
    automaticPreview = null;
    automaticPreviewSignature = '';
    automaticPreviewStale = false;
    automaticRerollCount = 0;
    if (mode === 'automatic') {
      params = {
        ...normalizeGenerationParams({
          ...params,
          autoGenerateNames: true,
          autoCalculateBirth: true,
          autoCalculateDeath: true
        })
      };
      saveStoredParams(runtime, params);
      automaticOptions = defaultAutomaticOptions();
    } else {
      automaticOptions = null;
    }
    renderCurrent();
  }

  function backToModeChoice() {
    resetAutomaticState();
    renderCurrent();
  }

  function readAutomaticOptions() {
    params = {
      ...normalizeGenerationParams({
        ...params,
        ...dialog.read('params'),
        // Geburtsjahre sind im Automatikmodus fachlich zwingend. Das Feld wird
        // deshalb dort nicht als abschaltbare Option dargestellt.
        autoCalculateBirth: true
      })
    };
    saveStoredParams(runtime, params);
    const values = dialog.read('automatic-template');
    return {
      ...values,
      seed: values.seed || `${currentFamily().document.id || 'familie'}-vorlage`,
      params
    };
  }

  function previewAutomaticTemplate(options = {}) {
    if (generationMode !== 'automatic') throw new Error('Bitte zuerst die automatische Vorlage auswählen.');
    const values = readAutomaticOptions();
    if (options.reroll === true) {
      automaticRerollCount += 1;
      values.seed = `${values.seed}-neu-${automaticRerollCount}`;
    }
    automaticOptions = normalizeAutomaticTemplateOptions(values);
    automaticPreview = generateAutomaticFamilyTemplate(currentFamily(), automaticOptions);
    automaticPreviewSignature = automaticTemplateOptionsSignature(automaticOptions);
    automaticPreviewStale = false;
    renderCurrent();
    notify(`Vorschau „${automaticPreview.summary.templateLabel}“ wurde erzeugt.`);
    return automaticPreview;
  }

  function acceptAutomaticTemplate() {
    if (automaticPreviewStale) {
      throw new Error('Die Optionen wurden geändert. Bitte die Vorschau aktualisieren, bevor du sie übernimmst.');
    }
    if (!automaticPreview) throw new Error('Bitte zuerst eine Vorschau erzeugen.');
    const visibleOptions = normalizeAutomaticTemplateOptions(readAutomaticOptions());
    if (automaticTemplateOptionsSignature(visibleOptions) !== automaticPreviewSignature) {
      automaticOptions = visibleOptions;
      invalidateAutomaticPreview();
      throw new Error('Die Optionen wurden geändert. Bitte die Vorschau aktualisieren, bevor du sie übernimmst.');
    }
    const generatedFamily = automaticPreview.family;
    automaticPreview = null;
    automaticPreviewSignature = '';
    automaticPreviewStale = false;
    automaticOptions = null;
    generationMode = '';
    currentGenerationDepth = null;
    // Die vollständige Vorlage bildet genau eine lokale Undo-/Autosave-Grenze.
    store.replaceFamily(generatedFamily, { source: 'tree-generator-automatic-template' });
    notify('Automatische Familienvorlage wurde übernommen.');
    return generatedFamily;
  }

  function skipTimeJump() {
    skipTimeJumpOffer = true;
    renderCurrent();
  }

  function revealTimeJumpFields() {
    return dialog.revealTimeJumpFields();
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

  function toggleChildForm(lineId) {
    dialog.toggleChildForm(lineId);
    renderCurrent();
  }

  function cancelChildForm() {
    dialog.clearActiveChildForm();
    renderCurrent();
  }

  function addChild(personId, lineId) {
    const family = currentFamily();
    const phaseInfo = phaseFor(family);
    const leaf = (phaseInfo.openLeaves || []).find(item => (
      item.lineId === lineId || (!lineId && item.personId === personId)
    ));
    if (!leaf) throw new Error('Die ausgewählte Fortsetzungslinie wurde nicht gefunden.');
    const referencePersonId = leaf.personId;
    const values = dialog.read({ childOf: referencePersonId, lineId: leaf.lineId });
    if (leaf?.unresolvedTimeJumpId) {
      const timeJump = family.timeJumps.find(item => item.id === leaf.unresolvedTimeJumpId);
      if ((timeJump?.childIds.length || 0) >= params.maxChildren) {
        throw new Error(`Für diese erste Generation ist die eingestellte Höchstzahl von ${params.maxChildren} Personen erreicht.`);
      }
    } else {
      assertLineChildCapacity(family, leaf, params);
    }
    const referencePerson = family.persons.find(item => item.id === referencePersonId);
    if (!referencePerson) throw new Error('Die Bezugsperson dieser Linie wurde nicht gefunden.');
    const previousChild = dialog.getLastAddedChild();
    const preparedInput = {
      ...values,
      lineId: leaf.lineId,
      suppressParentBasedBirth: leaf.afterTimeBarrier,
      birth: values.birth || (params.autoCalculateBirth ? leaf?.continuationYear || '' : '')
    };
    const personValues = prepareGeneratedChild({
      family,
      referencePerson,
      input: preparedInput,
      params,
      previousChild
    });
    // Ein nicht-uneheliches Kind wird, falls vorhanden, an die aktuelle Ehe/Partnerschaft
    // der Bezugsperson angebunden, statt nur an ein Elternteil.
    const linePartnership = family.partnerships.find(item => item.id === leaf.partnershipId);
    const activeSpouseId = !values.bastard
      ? linePartnership?.participantIds.find(id => id !== referencePersonId) || ''
      : '';
    const relationValues = leaf?.unresolvedTimeJumpId
      ? { relationKind: 'time-jump-child', timeJumpId: leaf.unresolvedTimeJumpId, legitimacy: 'unknown', certainty: 'probable', visibility: 'public', parentageType: 'claimed' }
      : phaseInfo.continuationKind === 'lineage-gap'
        ? { relationKind: 'lineage-gap-child', legitimacy: 'unknown', certainty: 'probable', visibility: 'public', parentageType: 'claimed' }
      : {
        relationKind: 'child',
        secondParentId: activeSpouseId,
        legitimacy: values.bastard ? 'illegitimate' : 'legitimate',
        parentageType: values.adoption ? 'adoptive' : 'biological',
        certainty: 'confirmed',
        visibility: 'public'
      };
    const newPersonId = store.addRelatedPerson(referencePersonId, personValues, relationValues);

    dialog.setLastAddedChild({
      personId: newPersonId,
      name: personValues.name,
      birth: personValues.birth,
      referencePersonId,
      lineId: leaf.lineId
    });
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

  function delegateCadet(personId, partnershipId = '') {
    const family = currentFamily();
    const candidates = listLineagePartnerships(family, personId);
    const partnership = partnershipId
      ? candidates.find(item => item.id === partnershipId)
      : candidates.length === 1 ? candidates[0] : null;
    if (!partnership) {
      throw new Error(candidates.length > 1
        ? 'Diese Person hat mehrere Ehe- oder Lebenslinien. Bitte den Wappenknoten über „Beziehung modifizieren“ an der gewünschten Verbindung anlegen.'
        : 'Für einen Hausknoten braucht diese Linie zuerst eine Ehe oder Lebensgemeinschaft.');
    }
    cadetDialog.openCreate(family, partnership.id);
  }

  function nextGeneration() {
    const family = currentFamily();
    const phaseInfo = phaseFor(family);
    if (phaseInfo.phase !== 4) return;
    if (phaseInfo.focusedContinuation) {
      close();
      return;
    }
    if (!phaseInfo.canAdvance) {
      notify('Es gibt noch keine nächste Generation. Lege zuerst mindestens einen Nachkommen an oder schließe die Linie über den Hausknoten ab.', { error: true });
      return;
    }
    const graph = createFamilyGraph(family);
    // Nur warnen, wenn wirklich noch NIEMAND in dieser Generation angefasst wurde
    // (kein Kind, keine Ehe/Verlobung, kein Kadettenzweig) — wer bereits ein Kind
    // hat, aber im Arbeitsblatt bleibt (für ggf. weitere Kinder), soll den Hinweis
    // nicht jedes Mal auslösen.
    const belowMinimum = (phaseInfo.openLeaves || []).filter(leaf => (
      childCountForLine(family, leaf) < params.minChildren
    ));
    const untouched = (phaseInfo.openLeaves || []).some(leaf => (
      graph.getChildren(leaf.personId).length === 0 && graph.getPartners(leaf.personId).length === 0
    ));
    if (untouched || belowMinimum.length) {
      const proceed = runtime.confirm?.(
        `In dieser Generation liegen noch ${belowMinimum.length} Linien unter der gewünschten Mindestzahl von ${params.minChildren} Nachkommen. Trotzdem fortfahren?`
      );
      if (proceed === false) return;
    }
    currentGenerationDepth = phaseInfo.generationIndex + 1;
    dialog.clearActiveChildForm();
    renderCurrent();
  }

  function readParams(options = {}) {
    params = { ...normalizeGenerationParams({ ...params, ...dialog.read('params') }) };
    saveStoredParams(runtime, params);
    if (options.render !== false) renderCurrent();
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
      const lineId = String(field || '').replace(/^childBirth-/, '');
      const personId = (phaseFor(family).openLeaves || [])
        .find(leaf => leaf.lineId === lineId)?.personId || lineId.replace(/^person:/, '');
      const parent = family.persons.find(person => person.id === personId);
      promptText = buildBirthYearPrompt({ houseName, anchorLabel: parent?.name || 'Ein Elternteil', anchorYear: parent?.birth || ALERIA_CURRENT_YEAR });
    } else if (kind === 'marriage-year') {
      promptText = buildMarriageYearPrompt({
        houseName,
        firstBirthYear: dialog.form.elements.namedItem('founderManBirth')?.value || '',
        secondBirthYear: dialog.form.elements.namedItem('founderWomanBirth')?.value || ''
      });
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
    if (kind === 'birth-year') return suggestBirthYear({ anchorYear: ALERIA_CURRENT_YEAR - 30, role: 'child', params });
    if (kind === 'death-year') return suggestDeathYear({ birthYear: ALERIA_CURRENT_YEAR - 30, params });
    if (kind === 'marriage-year') return suggestMarriageYear({ manBirthYear: ALERIA_CURRENT_YEAR - 30, params });
    return '???';
  }

  return Object.freeze({
    dialog: dialog.dialog,
    open,
    openAtLineage,
    openAtTimeJump,
    close,
    commitPhaseOne,
    commitPhaseTwo,
    selectGenerationMode,
    backToModeChoice,
    previewAutomaticTemplate,
    acceptAutomaticTemplate,
    skipTimeJump,
    revealTimeJumpFields,
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
