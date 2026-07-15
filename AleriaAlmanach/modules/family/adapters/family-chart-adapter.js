// Isolates all Family Chart specific data and runtime APIs from the Aleria domain.

(function installFamilyChartAdapter(global) {
  'use strict';

  const ADAPTER_ID = 'family-chart';
  const LIBRARY_VERSION = '0.9.0';
  const DEFAULT_PARENTAGE_KINDS = Object.freeze([
    'biological',
    'adoptive',
    'magical',
    'claimed',
    'foster',
    'guardian',
    'step'
  ]);
  const CERTAINTY_PRIORITY = Object.freeze({
    confirmed: 0,
    probable: 1,
    rumored: 2,
    disputed: 3,
    unknown: 4,
    denied: 5
  });
  const PARTNERSHIP_LABELS = Object.freeze({
    marriage: 'Ehe',
    engagement: 'Verlobung',
    union: 'Verbindung',
    affair: 'Affäre',
    concubinage: 'Konkubinat',
    political: 'Politische Verbindung',
    magical: 'Magische Bindung',
    custom: 'Verbindung'
  });
  const PARTNERSHIP_END_LABELS = Object.freeze({
    divorce: 'geschieden',
    annulment: 'annulliert',
    separation: 'getrennt',
    'broken-engagement': 'aufgelöst'
  });
  const CAPABILITIES = deepFreeze({
    native: {
      layout: true,
      zoom: true,
      pan: true,
      focus: true,
      multiplePartners: true,
      orientation: true,
      generationDepth: true,
      personSearch: true,
      htmlCards: true,
      spouseLinkText: true
    },
    translated: {
      partnershipMetadata: 'spouse-edge-with-context',
      parentageKinds: 'one-primary-parentage-per-child',
      multiParticipantPartnerships: 'pairwise-spouse-edges',
      nonBinarySexValues: 'layout-only-M-or-F-fallback'
    },
    domainOnly: [
      'relationship-certainty',
      'relationship-visibility',
      'legitimacy',
      'foster-and-step-semantics',
      'houses',
      'titles',
      'claims',
      'succession',
      'bloodlines'
    ]
  });

  function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.values(value).forEach(deepFreeze);
    return Object.freeze(value);
  }

  function isRecord(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  }

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function asText(value, fallback = '') {
    return typeof value === 'string' ? value.trim() : fallback;
  }

  function escapeCardHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getId(value) {
    return asText(value);
  }

  function getGenealogy(value) {
    if (isRecord(value?.genealogy)) return value.genealogy;
    return isRecord(value) ? value : {};
  }

  function getAssertion(value) {
    return isRecord(value?.assertion) ? value.assertion : {};
  }

  function addDiagnostic(target, code, message, details = {}, severity = 'warning') {
    target.push(Object.freeze({ code, severity, message, details: Object.freeze({ ...details }) }));
  }

  function relationIsVisible(relation, options) {
    const assertion = getAssertion(relation);
    if (assertion.certainty === 'denied' && !options.includeDeniedRelations) return false;
    if (!options.visibleVisibilities) return true;
    return options.visibleVisibilities.includes(asText(assertion.visibility, 'public'));
  }

  function normalizeOptions(options = {}) {
    const parentageKinds = Array.isArray(options.parentageKinds)
      ? options.parentageKinds.map(getId).filter(Boolean)
      : [...DEFAULT_PARENTAGE_KINDS];
    const partnershipKinds = Array.isArray(options.partnershipKinds)
      ? options.partnershipKinds.map(getId).filter(Boolean)
      : null;
    const visibleVisibilities = Array.isArray(options.visibleVisibilities)
      ? options.visibleVisibilities.map(getId).filter(Boolean)
      : null;
    return {
      parentageKinds,
      partnershipKinds,
      visibleVisibilities,
      includeDeniedRelations: options.includeDeniedRelations === true,
      genderFallback: options.genderFallback === 'M' ? 'M' : 'F',
      sanitizeImageSource: typeof options.sanitizeImageSource === 'function'
        ? options.sanitizeImageSource
        : value => value,
      maxLayoutParents: 2
    };
  }

  function resolveLayoutGender(person, options, diagnostics) {
    if (person.sex === 'male') return 'M';
    if (person.sex === 'female') return 'F';
    addDiagnostic(
      diagnostics,
      'LAYOUT_GENDER_FALLBACK',
      'Family Chart benötigt für das Layout M oder F; der fachliche Geschlechtswert bleibt nur in Aleria erhalten.',
      { personId: getId(person.id), sex: asText(person.sex, 'unknown'), fallback: options.genderFallback },
      'info'
    );
    return options.genderFallback;
  }

  function getDisplayName(person) {
    const identity = isRecord(person.identity) ? person.identity : {};
    return asText(identity.displayName, asText(person.name, 'Unbenannte Person'));
  }

  function getGivenName(person, displayName) {
    const identity = isRecord(person.identity) ? person.identity : {};
    const givenNames = asArray(identity.givenNames).map(name => asText(name)).filter(Boolean);
    return givenNames.join(' ') || displayName;
  }

  function createPresentationProjector(genealogy) {
    const createProjector = global.AleriaFamily?.services?.presentation?.createProjector;
    if (typeof createProjector === 'function') return createProjector(genealogy);
    return Object.freeze({
      get() {
        return Object.freeze({ contextLine: '', lifeLine: '' });
      }
    });
  }

  function buildSafeCardLine(value, className) {
    const text = asText(value);
    return text ? `<span class="${className}">${escapeCardHtml(text)}</span>` : '';
  }

  function buildChartPerson(person, options, diagnostics, presentationProjector) {
    const identity = isRecord(person.identity) ? person.identity : {};
    const profile = isRecord(person.profile) ? person.profile : {};
    const portrait = isRecord(profile.portrait) ? profile.portrait : {};
    const life = isRecord(person.life) ? person.life : {};
    const displayName = getDisplayName(person);
    const familyName = asText(identity.familyName);
    const presentation = presentationProjector.get(person);
    const contextLine = asText(presentation.contextLine);
    const lifeLine = asText(presentation.lifeLine);
    return {
      id: getId(person.id),
      data: {
        gender: resolveLayoutGender(person, options, diagnostics),
        displayName,
        displayNameHtml: escapeCardHtml(displayName),
        'first name': getGivenName(person, displayName),
        'last name': familyName,
        portrait: options.sanitizeImageSource(asText(portrait.src)),
        portraitAlt: asText(portrait.alt, displayName),
        tagline: asText(profile.tagline),
        taglineHtml: escapeCardHtml(asText(profile.tagline)),
        contextLine,
        contextLineHtml: buildSafeCardLine(contextLine, 'family-card-context'),
        lifeLine,
        lifeLineHtml: buildSafeCardLine(lifeLine, 'family-card-life'),
        summary: asText(profile.summary),
        aleria: {
          personId: getId(person.id),
          recordType: asText(person.recordType, 'person'),
          identityStatus: asText(identity.status, 'known'),
          lifeStatus: asText(life.status, 'unknown'),
          characterRef: isRecord(person.characterRef) ? { ...person.characterRef } : null
        }
      },
      rels: {
        parents: [],
        spouses: [],
        children: []
      }
    };
  }

  function collectPeople(genealogy, options, diagnostics) {
    const chartPeople = [];
    const personById = new Map();
    const chartPersonById = new Map();
    const personOrder = new Map();
    const presentationProjector = createPresentationProjector(genealogy);
    asArray(genealogy.persons).forEach((person, index) => {
      if (!isRecord(person)) {
        addDiagnostic(diagnostics, 'INVALID_PERSON', 'Ein ungültiger Personeneintrag wurde übersprungen.', { index });
        return;
      }
      const id = getId(person.id);
      if (!id) {
        addDiagnostic(diagnostics, 'MISSING_PERSON_ID', 'Eine Person ohne ID wurde übersprungen.', { index });
        return;
      }
      if (personById.has(id)) {
        addDiagnostic(diagnostics, 'DUPLICATE_PERSON_ID', 'Eine doppelte Personen-ID wurde übersprungen.', { personId: id, index }, 'error');
        return;
      }
      const normalizedPerson = { ...person, id };
      const chartPerson = buildChartPerson(normalizedPerson, options, diagnostics, presentationProjector);
      personById.set(id, normalizedPerson);
      chartPersonById.set(id, chartPerson);
      personOrder.set(id, chartPeople.length);
      chartPeople.push(chartPerson);
    });
    return { chartPeople, personById, chartPersonById, personOrder };
  }

  function pairKey(firstId, secondId) {
    return [firstId, secondId].sort().join('\u001f');
  }

  function addReciprocalSpouse(chartPersonById, firstId, secondId) {
    const first = chartPersonById.get(firstId);
    const second = chartPersonById.get(secondId);
    if (!first || !second) return;
    if (!first.rels.spouses.includes(secondId)) first.rels.spouses.push(secondId);
    if (!second.rels.spouses.includes(firstId)) second.rels.spouses.push(firstId);
  }

  function getPartnershipLabel(partnership) {
    const explicitLabel = asText(partnership.label);
    if (explicitLabel) return explicitLabel;
    const kind = asText(partnership.kind, 'union');
    const base = PARTNERSHIP_LABELS[kind] || asText(partnership.customKind, PARTNERSHIP_LABELS.custom);
    const endLabel = PARTNERSHIP_END_LABELS[partnership.endReason];
    return endLabel ? `${base} · ${endLabel}` : base;
  }

  function collectPartnerships(genealogy, people, options, diagnostics) {
    const pairEntries = new Map();
    const partnershipById = new Map();
    asArray(genealogy.partnerships).forEach((partnership, index) => {
      if (!isRecord(partnership)) {
        addDiagnostic(diagnostics, 'INVALID_PARTNERSHIP', 'Eine ungültige Partnerschaft wurde übersprungen.', { index });
        return;
      }
      const id = getId(partnership.id);
      if (!id) {
        addDiagnostic(diagnostics, 'MISSING_PARTNERSHIP_ID', 'Eine Partnerschaft ohne ID wurde übersprungen.', { index });
        return;
      }
      if (partnershipById.has(id)) {
        addDiagnostic(diagnostics, 'DUPLICATE_PARTNERSHIP_ID', 'Eine doppelte Partnerschafts-ID wurde übersprungen.', { partnershipId: id }, 'error');
        return;
      }
      partnershipById.set(id, partnership);
      const kind = asText(partnership.kind, 'union');
      if (options.partnershipKinds && !options.partnershipKinds.includes(kind)) return;
      if (!relationIsVisible(partnership, options)) return;

      const participantIds = [...new Set(asArray(partnership.participantIds).map(getId).filter(Boolean))];
      const validIds = participantIds.filter(personId => {
        if (people.personById.has(personId)) return true;
        addDiagnostic(
          diagnostics,
          'MISSING_PARTNERSHIP_PERSON',
          'Eine Partnerschaft verweist auf eine nicht vorhandene Person.',
          { partnershipId: id, personId }
        );
        return false;
      });
      if (validIds.length < 2) {
        addDiagnostic(diagnostics, 'INCOMPLETE_PARTNERSHIP', 'Eine Partnerschaft mit weniger als zwei gültigen Beteiligten wurde nicht dargestellt.', { partnershipId: id });
        return;
      }
      if (validIds.length > 2) {
        addDiagnostic(
          diagnostics,
          'MULTI_PARTICIPANT_PARTNERSHIP_EXPANDED',
          'Eine Mehrpersonenpartnerschaft wurde für Family Chart in paarweise Partnerkanten übersetzt.',
          { partnershipId: id, participantIds: validIds },
          'info'
        );
      }

      for (let firstIndex = 0; firstIndex < validIds.length - 1; firstIndex += 1) {
        for (let secondIndex = firstIndex + 1; secondIndex < validIds.length; secondIndex += 1) {
          const firstId = validIds[firstIndex];
          const secondId = validIds[secondIndex];
          if (firstId === secondId) continue;
          addReciprocalSpouse(people.chartPersonById, firstId, secondId);
          const key = pairKey(firstId, secondId);
          if (!pairEntries.has(key)) pairEntries.set(key, { participantIds: [firstId, secondId], partnerships: [] });
          pairEntries.get(key).partnerships.push(partnership);
        }
      }
    });

    const metadata = [...pairEntries.values()].map(entry => {
      if (entry.partnerships.length > 1) {
        addDiagnostic(
          diagnostics,
          'MULTIPLE_PARTNERSHIPS_COLLAPSED',
          'Mehrere Partnerschaften desselben Paares teilen sich in Family Chart eine Partnerkante.',
          { partnershipIds: entry.partnerships.map(item => getId(item.id)), participantIds: entry.participantIds },
          'info'
        );
      }
      const labels = [...new Set(entry.partnerships.map(getPartnershipLabel).filter(Boolean))];
      return Object.freeze({
        participantIds: Object.freeze([...entry.participantIds]),
        partnershipIds: Object.freeze(entry.partnerships.map(item => getId(item.id))),
        label: labels.join(' · ')
      });
    });
    return { metadata: Object.freeze(metadata), partnershipById };
  }

  function certaintyRank(parentage) {
    const certainty = asText(getAssertion(parentage).certainty, 'unknown');
    return Object.prototype.hasOwnProperty.call(CERTAINTY_PRIORITY, certainty)
      ? CERTAINTY_PRIORITY[certainty]
      : CERTAINTY_PRIORITY.unknown;
  }

  function createsAncestryCycle(childrenByParent, parentId, childId) {
    const pending = [childId];
    const visited = new Set();
    while (pending.length) {
      const currentId = pending.pop();
      if (currentId === parentId) return true;
      if (visited.has(currentId)) continue;
      visited.add(currentId);
      asArray(childrenByParent.get(currentId)).forEach(nextId => pending.push(nextId));
    }
    return false;
  }

  function collectParentageCandidates(genealogy, people, partnerships, options, diagnostics) {
    const candidatesByChild = new Map();
    const parentageIds = new Set();
    asArray(genealogy.parentages).forEach((parentage, index) => {
      if (!isRecord(parentage)) {
        addDiagnostic(diagnostics, 'INVALID_PARENTAGE', 'Eine ungültige Abstammungsgruppe wurde übersprungen.', { index });
        return;
      }
      const id = getId(parentage.id);
      const childId = getId(parentage.childId);
      const kind = asText(parentage.kind, 'biological');
      if (!id || !childId) {
        addDiagnostic(diagnostics, 'INCOMPLETE_PARENTAGE', 'Eine Abstammungsgruppe ohne ID oder Kind wurde übersprungen.', { index, parentageId: id, childId });
        return;
      }
      if (parentageIds.has(id)) {
        addDiagnostic(diagnostics, 'DUPLICATE_PARENTAGE_ID', 'Eine doppelte Abstammungs-ID wurde übersprungen.', { parentageId: id }, 'error');
        return;
      }
      parentageIds.add(id);
      if (!people.personById.has(childId)) {
        addDiagnostic(diagnostics, 'MISSING_PARENTAGE_CHILD', 'Eine Abstammungsgruppe verweist auf ein nicht vorhandenes Kind.', { parentageId: id, childId });
        return;
      }
      if (!options.parentageKinds.includes(kind) || !relationIsVisible(parentage, options)) return;

      const parentIds = [...new Set(asArray(parentage.parentIds).map(getId).filter(Boolean))].filter(parentId => {
        if (parentId === childId) {
          addDiagnostic(diagnostics, 'SELF_PARENTAGE_SKIPPED', 'Eine Person kann nicht ihr eigenes Elternteil sein.', { parentageId: id, personId: childId }, 'error');
          return false;
        }
        if (people.personById.has(parentId)) return true;
        addDiagnostic(diagnostics, 'MISSING_PARENTAGE_PERSON', 'Eine Abstammungsgruppe verweist auf ein nicht vorhandenes Elternteil.', { parentageId: id, parentId });
        return false;
      });
      if (!parentIds.length) {
        addDiagnostic(diagnostics, 'PARENTAGE_WITHOUT_VALID_PARENTS', 'Eine Abstammungsgruppe ohne gültige Eltern wurde nicht dargestellt.', { parentageId: id });
        return;
      }

      const partnershipId = getId(parentage.partnershipId);
      if (partnershipId) {
        const partnership = partnerships.partnershipById.get(partnershipId);
        if (!partnership) {
          addDiagnostic(diagnostics, 'MISSING_PARENTAGE_PARTNERSHIP', 'Die Herkunftspartnerschaft einer Abstammung existiert nicht.', { parentageId: id, partnershipId });
        } else {
          const participantIds = asArray(partnership.participantIds).map(getId);
          const mismatchedParentIds = parentIds.filter(parentId => !participantIds.includes(parentId));
          if (mismatchedParentIds.length) {
            addDiagnostic(
              diagnostics,
              'PARENTAGE_PARTNERSHIP_MISMATCH',
              'Nicht alle Eltern der Abstammungsgruppe gehören zur angegebenen Partnerschaft.',
              { parentageId: id, partnershipId, parentIds: mismatchedParentIds }
            );
          }
        }
      }

      if (!candidatesByChild.has(childId)) candidatesByChild.set(childId, []);
      candidatesByChild.get(childId).push({
        parentage,
        id,
        childId,
        kind,
        parentIds,
        inputIndex: index,
        kindRank: options.parentageKinds.indexOf(kind),
        certaintyRank: certaintyRank(parentage)
      });
    });
    return candidatesByChild;
  }

  function collectParentages(genealogy, people, partnerships, options, diagnostics) {
    const candidatesByChild = collectParentageCandidates(genealogy, people, partnerships, options, diagnostics);
    const childrenByParent = new Map();
    const metadata = [];
    candidatesByChild.forEach((candidates, childId) => {
      candidates.sort((first, second) => (
        first.kindRank - second.kindRank
        || first.certaintyRank - second.certaintyRank
        || first.inputIndex - second.inputIndex
      ));
      const selected = candidates[0];
      if (candidates.length > 1) {
        addDiagnostic(
          diagnostics,
          'PARENTAGE_VARIANTS_NOT_RENDERED',
          'Family Chart kann pro Kind nur eine primäre Elternkonstellation layouten; weitere Varianten bleiben im Aleria-Modell erhalten.',
          { childId, selectedParentageId: selected.id, omittedParentageIds: candidates.slice(1).map(item => item.id) },
          'info'
        );
      }
      if (selected.parentIds.length > options.maxLayoutParents) {
        addDiagnostic(
          diagnostics,
          'TOO_MANY_LAYOUT_PARENTS',
          'Family Chart stellt höchstens zwei Eltern einer Abstammungsgruppe dar.',
          { parentageId: selected.id, parentIds: selected.parentIds, maximum: options.maxLayoutParents }
        );
      }

      selected.parentIds.slice(0, options.maxLayoutParents).forEach(parentId => {
        if (createsAncestryCycle(childrenByParent, parentId, childId)) {
          addDiagnostic(
            diagnostics,
            'ANCESTRY_CYCLE_SKIPPED',
            'Eine zyklische Abstammungskante wurde zum Schutz des Layouts übersprungen.',
            { parentageId: selected.id, parentId, childId },
            'error'
          );
          return;
        }
        const parent = people.chartPersonById.get(parentId);
        const child = people.chartPersonById.get(childId);
        if (!parent || !child) return;
        if (!parent.rels.children.includes(childId)) parent.rels.children.push(childId);
        if (!child.rels.parents.includes(parentId)) child.rels.parents.push(parentId);
        if (!childrenByParent.has(parentId)) childrenByParent.set(parentId, []);
        childrenByParent.get(parentId).push(childId);
        metadata.push(Object.freeze({
          parentageId: selected.id,
          parentId,
          childId,
          kind: selected.kind,
          partnershipId: getId(selected.parentage.partnershipId),
          legitimacy: asText(selected.parentage.legitimacy?.status, 'unknown'),
          certainty: asText(getAssertion(selected.parentage).certainty, 'unknown'),
          visibility: asText(getAssertion(selected.parentage).visibility, 'public')
        }));
      });
    });
    return Object.freeze(metadata);
  }

  function sortRelations(people) {
    const byInputOrder = (firstId, secondId) => (
      (people.personOrder.get(firstId) ?? Number.MAX_SAFE_INTEGER)
      - (people.personOrder.get(secondId) ?? Number.MAX_SAFE_INTEGER)
    );
    people.chartPeople.forEach(person => {
      person.rels.parents.sort(byInputOrder);
      person.rels.spouses.sort(byInputOrder);
      person.rels.children.sort(byInputOrder);
    });
  }

  function toFamilyChartData(familyOrGenealogy, rawOptions = {}) {
    const genealogy = getGenealogy(familyOrGenealogy);
    const options = normalizeOptions(rawOptions);
    const diagnostics = [];
    const people = collectPeople(genealogy, options, diagnostics);
    const partnerships = collectPartnerships(genealogy, people, options, diagnostics);
    const parentages = collectParentages(genealogy, people, partnerships, options, diagnostics);
    sortRelations(people);
    return Object.freeze({
      data: people.chartPeople,
      relations: Object.freeze({
        partnerships: partnerships.metadata,
        parentages
      }),
      diagnostics: Object.freeze(diagnostics),
      capabilities: CAPABILITIES
    });
  }

  function getPairMetadata(converted, firstId, secondId) {
    return converted.relations.partnerships.find(entry => (
      entry.participantIds.includes(firstId) && entry.participantIds.includes(secondId)
    ));
  }

  function getViewOptions(view = {}, sessionOptions = {}) {
    const configuredKinds = Array.isArray(view.visibleParentageKinds)
      ? view.visibleParentageKinds
      : sessionOptions.parentageKinds;
    return {
      ...sessionOptions,
      parentageKinds: configuredKinds,
      partnershipKinds: Array.isArray(view.visiblePartnershipKinds)
        ? view.visiblePartnershipKinds
        : sessionOptions.partnershipKinds
    };
  }

  function createAdapterError(code, message) {
    const error = new Error(message);
    error.code = code;
    return error;
  }

  function getAvailability(runtime = {}) {
    const library = runtime.library || global.f3;
    const usesInjectedLibrary = Boolean(runtime.library);
    const d3Available = usesInjectedLibrary || Boolean(global.d3);
    return Object.freeze({
      available: Boolean(library?.createChart) && d3Available,
      familyChartAvailable: Boolean(library?.createChart),
      d3Available,
      libraryVersion: LIBRARY_VERSION
    });
  }

  function createSession(config = {}) {
    const container = config.container;
    if (!container || typeof container !== 'object') {
      throw createAdapterError('FAMILY_CHART_CONTAINER_REQUIRED', 'Für Family Chart wird ein Container benötigt.');
    }
    const runtime = { library: config.library };
    const availability = getAvailability(runtime);
    if (!availability.familyChartAvailable) {
      throw createAdapterError('FAMILY_CHART_UNAVAILABLE', 'Family Chart 0.9.0 ist nicht geladen.');
    }
    if (!availability.d3Available) {
      throw createAdapterError('FAMILY_CHART_D3_UNAVAILABLE', 'D3 7.9.0 ist nicht geladen.');
    }

    const library = config.library || global.f3;
    const sessionOptions = isRecord(config.options) ? config.options : {};
    let view = isRecord(config.view) ? { ...config.view } : {};
    let family = config.family || config.genealogy || {};
    let converted = toFamilyChartData(family, getViewOptions(view, sessionOptions));
    if (!converted.data.length) {
      throw createAdapterError('FAMILY_CHART_EMPTY_DATA', 'Family Chart benötigt mindestens eine gültige Person.');
    }

    let destroyed = false;
    let focusPersonId = getId(view.initialFocusPersonId);
    if (!converted.data.some(person => person.id === focusPersonId)) focusPersonId = converted.data[0].id;
    container.classList?.add('f3', 'f3-cont');
    const chart = library.createChart(container, converted.data);
    let orientation = 'vertical';

    function ensureActive() {
      if (destroyed) throw createAdapterError('FAMILY_CHART_SESSION_DESTROYED', 'Die Family-Chart-Sitzung wurde bereits beendet.');
    }

    function applyChartSettings(nextView, render = false) {
      const transitionTime = Number.isFinite(sessionOptions.transitionTime)
        ? Math.max(0, sessionOptions.transitionTime)
        : 300;
      chart.setTransitionTime?.(transitionTime);
      chart.setShowSiblingsOfMain?.(nextView.showSiblings !== false);
      if (Number.isInteger(nextView.ancestorDepth) && nextView.ancestorDepth >= 0) {
        chart.setAncestryDepth?.(nextView.ancestorDepth);
      }
      if (Number.isInteger(nextView.descendantDepth) && nextView.descendantDepth >= 0) {
        chart.setProgenyDepth?.(nextView.descendantDepth);
      }
      chart.setSingleParentEmptyCard?.(sessionOptions.showUnknownParentCard !== false, {
        label: asText(sessionOptions.unknownParentLabel, 'Unbekannt')
      });
      setOrientation(nextView.orientation, render);
    }

    function setOrientation(nextOrientation, render = true) {
      ensureActive();
      orientation = nextOrientation === 'horizontal' ? 'horizontal' : 'vertical';
      if (orientation === 'horizontal') chart.setOrientationHorizontal?.();
      else chart.setOrientationVertical?.();
      if (render) chart.updateTree?.({ initial: false, tree_position: 'fit' });
      return orientation;
    }

    function setSpouseLabels() {
      chart.setLinkSpouseText?.((first, second) => {
        const firstId = getId(first?.data?.id || first?.id);
        const secondId = getId(second?.data?.id || second?.id);
        return getPairMetadata(converted, firstId, secondId)?.label || '';
      });
    }

    function focus(personId, options = {}) {
      ensureActive();
      const nextId = getId(personId);
      if (!converted.data.some(person => person.id === nextId)) return false;
      focusPersonId = nextId;
      chart.updateMainId?.(nextId);
      chart.updateTree?.({
        initial: false,
        tree_position: options.fit === true ? 'fit' : 'main_to_middle'
      });
      return true;
    }

    function configureCard() {
      const card = chart.setCardHtml?.();
      card?.setCardImageField?.('portrait');
      card?.setStyle?.('imageRect');
      card?.setCardDisplay?.([
        datum => datum.data.displayNameHtml || 'Unbenannte Person',
        datum => datum.data.taglineHtml || '',
        datum => datum.data.contextLineHtml || '',
        datum => datum.data.lifeLineHtml || ''
      ]);
      card?.setOnCardClick?.((event, datum) => {
        const personId = getId(datum?.data?.id || datum?.id);
        const handled = typeof config.onPersonClick === 'function'
          && config.onPersonClick({ personId, event }) === true;
        if (!handled) focus(personId);
      });
    }

    function configurePersonSearch() {
      if (!config.searchContainer || typeof chart.setPersonDropdown !== 'function') return;
      chart.setPersonDropdown(
        person => person?.data?.displayName || 'Unbenannte Person',
        {
          cont: config.searchContainer,
          placeholder: asText(config.searchPlaceholder, 'Person suchen'),
          onSelect: personId => focus(personId)
        }
      );
    }

    function update(nextFamily, nextView = view) {
      ensureActive();
      const nextFamilyValue = nextFamily || {};
      const nextViewValue = isRecord(nextView) ? { ...nextView } : {};
      const nextConverted = toFamilyChartData(nextFamilyValue, getViewOptions(nextViewValue, sessionOptions));
      if (!nextConverted.data.length) return false;
      family = nextFamilyValue;
      view = nextViewValue;
      converted = nextConverted;
      chart.updateData?.(converted.data);
      applyChartSettings(view, false);
      setSpouseLabels();
      const requestedFocusId = getId(view.initialFocusPersonId);
      if (converted.data.some(person => person.id === requestedFocusId)) focusPersonId = requestedFocusId;
      if (!converted.data.some(person => person.id === focusPersonId)) focusPersonId = converted.data[0].id;
      chart.updateMainId?.(focusPersonId);
      chart.updateTree?.({ initial: false, tree_position: 'inherit' });
      return true;
    }

    function fit() {
      ensureActive();
      chart.updateTree?.({ initial: false, tree_position: 'fit' });
    }

    function destroy() {
      if (destroyed) return;
      if (chart.personSearch && typeof chart.unSetPersonSearch === 'function') chart.unSetPersonSearch();
      if (typeof container.replaceChildren === 'function') container.replaceChildren();
      else if ('innerHTML' in container) container.innerHTML = '';
      container.classList?.remove('f3', 'f3-cont');
      destroyed = true;
      family = null;
      view = null;
      converted = null;
    }

    configureCard();
    configurePersonSearch();
    applyChartSettings(view, false);
    setSpouseLabels();
    chart.setAfterUpdate?.(props => {
      if (typeof config.onAfterUpdate === 'function') config.onAfterUpdate({ focusPersonId, props });
    });
    chart.updateMainId?.(focusPersonId);
    chart.updateTree?.({
      initial: true,
      tree_position: view.fitOnOpen === false ? 'main_to_middle' : 'fit',
      transition_time: 0
    });

    return Object.freeze({
      update,
      focus,
      fit,
      setOrientation,
      destroy,
      getState() {
        ensureActive();
        return Object.freeze({
          focusPersonId,
          orientation,
          diagnostics: converted.diagnostics,
          relations: converted.relations
        });
      },
      getData() {
        ensureActive();
        return converted.data;
      },
      isDestroyed() {
        return destroyed;
      }
    });
  }

  const adapter = Object.freeze({
    id: ADAPTER_ID,
    libraryVersion: LIBRARY_VERSION,
    capabilities: CAPABILITIES,
    getAvailability,
    toFamilyChartData,
    createSession
  });
  const currentApi = isRecord(global.AleriaFamily) ? global.AleriaFamily : {};
  const currentAdapters = isRecord(currentApi.adapters) ? currentApi.adapters : {};
  global.AleriaFamily = Object.freeze({
    apiVersion: currentApi.apiVersion || 1,
    schema: currentApi.schema || 'aleria.family',
    schemaVersion: currentApi.schemaVersion || 2,
    ...currentApi,
    adapters: Object.freeze({ ...currentAdapters, familyChart: adapter })
  });
})(globalThis);
