import {
  DEFAULT_RELATIONSHIP_COLORS,
  getFamilyRole
} from '../config/family-colors.js';
import { PORTRAIT_PLACEHOLDERS, resolvePortraitSource } from '../config/portrait-placeholders.js';
import { EXTINCT_LINE_FRAME, getCrestFrame, getPersonCardFrame, TIME_JUMP_FRAME } from '../config/chart-frames.js';
import { getPersonLineageRole } from '../config/person-lineage.js';
import {
  resolveAnchorGenerationDepth,
  resolveFamilyGenerationDepths
} from '../domain/family-generation-depth.js';
import { normalizeFamily } from '../domain/family-schema.js';
import { formatLifeLine } from '../domain/person-presentation.js';
import { earliestKnownBirthYear, latestKnownPersonYear } from '../domain/time-boundaries.js';
import {
  createFamilyChartCardHtml,
  FAMILY_CHART_CARD_LAYOUT
} from './family-chart-card-renderer.js';
import { resolveFamilyChartViewDepths } from './family-chart-depth.js';
import { createFamilyChartLinkRenderer } from './family-chart-link-renderer.js';
import { insertTimeJumpAsSerialBarrier } from './family-chart-time-jump-router.js';

const ADAPTER_ID = 'family-chart';
const LIBRARY_VERSION = '0.9.0';
const PARENTAGE_PRIORITY = Object.freeze({
  biological: 0,
  adoptive: 1,
  magical: 2,
  claimed: 3,
  foster: 4,
  step: 5
});

const CERTAINTY_PRIORITY = Object.freeze({
  confirmed: 0,
  probable: 1,
  rumored: 2,
  disputed: 3,
  unknown: 4
});

const ROLE_LINE_COLORS = Object.freeze({
  bastard: '#62615e',
  affair: '#704485',
  forced: '#c7a974',
  ward: '#2f75a8',
  'ward-away': '#7eb4d7'
});

export function isPortraitCardEvent(event) {
  return Boolean(event?.target?.closest?.('.aleria-person-card__portrait'));
}

function addUnique(target, value) {
  if (value && !target.includes(value)) target.push(value);
}

function removeValue(target, value) {
  const index = target.indexOf(value);
  if (index >= 0) target.splice(index, 1);
}

function pairKey(firstId, secondId) {
  return [firstId, secondId].sort().join('\u001f');
}

function layoutGender(person, diagnostics) {
  if (person.sex === 'male') return 'M';
  if (person.sex === 'female') return 'F';
  diagnostics.push(Object.freeze({
    severity: 'info',
    code: 'LAYOUT_GENDER_FALLBACK',
    message: 'Family Chart benötigt für das Layout M oder F; unbekannt bleibt im Aleria-Modell erhalten.',
    details: Object.freeze({ personId: person.id, sex: person.sex })
  }));
  return 'F';
}

function selectPrimaryParentage(parentages, person) {
  const preferredType = person?.familyRole === 'ward' ? 'foster' : '';
  return [...parentages].sort((first, second) => (
    (first.type === preferredType ? -1 : 0) - (second.type === preferredType ? -1 : 0)
    ||
    (PARENTAGE_PRIORITY[first.type] ?? 99) - (PARENTAGE_PRIORITY[second.type] ?? 99)
    || (CERTAINTY_PRIORITY[first.certainty] ?? 99) - (CERTAINTY_PRIORITY[second.certainty] ?? 99)
  ))[0];
}

function createChartPerson(person, house, diagnostics, legitimacy = 'unknown') {
  const role = getFamilyRole(person.familyRole);
  const lineageRole = getPersonLineageRole(person.lineageRole);
  const frame = getPersonCardFrame(role.id, lineageRole.id, legitimacy, person.extensions.cardFrameId || '');
  // Bastarde dürfen das Hauswappen nicht führen und tragen das neutrale Siegel –
  // außer sie wurden nachträglich legitimiert, dann gilt das Hauswappen wieder.
  const crest = role.id === 'bastard' && legitimacy !== 'legitimized'
    ? PORTRAIT_PLACEHOLDERS.crest
    : (house?.emblem || PORTRAIT_PLACEHOLDERS.crest);
  return {
    id: person.id,
    data: {
      gender: layoutGender(person, diagnostics),
      name: person.name,
      title: person.title,
      house: house?.name || '',
      life: formatLifeLine(person),
      portrait: resolvePortraitSource(person),
      crest: lineageRole.isHouseHead ? '' : crest,
      frameAsset: frame.asset,
      frameVariant: frame.variant,
      crestPosition: frame.crestPosition,
      role: role.id,
      roleLabel: role.label,
      legitimacy,
      lineageRole: lineageRole.id,
      lineageRoleLabel: lineageRole.label,
      nodeKind: 'person',
      aleria: {
        personId: person.id,
        sex: person.sex,
        status: person.status,
        familyRole: person.familyRole,
        legitimacy,
        virtualType: ''
      }
    },
    rels: { parents: [], spouses: [], children: [] }
  };
}

function createVirtualNode({
  id,
  name,
  title = '',
  house = '',
  portrait = '',
  nodeKind,
  targetFamilyId = '',
  cadetBranchId = '',
  lineageOriginId = '',
  timeJumpId = '',
  sourcePartnershipId = '',
  crestFrame = '',
  emblemScale = 0.86,
  frameScale = 1,
  frameAsset = '',
  fromYear = '',
  toYear = ''
}) {
  return {
    id,
    data: {
      gender: 'F',
      name,
      title,
      house,
      life: '',
      portrait,
      crestFrameAsset: crestFrame ? getCrestFrame(crestFrame).asset : '',
      emblemScale,
      frameScale,
      frameAsset,
      fromYear,
      toYear,
      role: 'core',
      roleLabel: '',
      nodeKind,
      aleria: {
        personId: '',
        virtualType: nodeKind,
        targetFamilyId,
        cadetBranchId,
        lineageOriginId,
        timeJumpId,
        sourcePartnershipId
      }
    },
    rels: { parents: [], spouses: [], children: [] }
  };
}

function createTimeJumpLayoutStage(nodeId) {
  return createVirtualNode({
    id: `${nodeId}--layout-stage`,
    name: '',
    nodeKind: 'time-jump-stage'
  });
}

function relationColor(family, relationType, fallback = '#8e2724') {
  return family.presentation.relationshipColors[relationType]
    || DEFAULT_RELATIONSHIP_COLORS[relationType]
    || fallback;
}

function applyLineageStructure({ family, chartById, selectedParentageByChild, parentageLines, houseById, personById }) {
  const partnershipId = family.lineage.founderPartnershipId;
  if (!partnershipId) return;
  const partnership = family.partnerships.find(item => item.id === partnershipId);
  if (!partnership) return;
  const founderIds = partnership.participantIds.filter(personId => chartById.has(personId)).slice(0, 2);
  if (!founderIds.length) return;
  const descendants = [...selectedParentageByChild.entries()]
    .filter(([, parentage]) => parentage.partnershipId === partnershipId)
    .map(([childId]) => childId)
    .filter(childId => chartById.has(childId));

  const house = houseById.get(family.lineage.houseId) || family.houses[0];
  const crestId = `__lineage-crest-${family.document.id}`;
  const crest = createVirtualNode({
    id: crestId,
    name: house?.name || family.document.title,
    title: family.lineage.crestSubtitle,
    portrait: house?.emblem || family.document.emblem || PORTRAIT_PLACEHOLDERS.crest,
    nodeKind: 'house-crest',
    sourcePartnershipId: partnershipId,
    crestFrame: family.lineage.crestFrame,
    emblemScale: family.lineage.crestEmblemScale,
    frameScale: family.lineage.crestFrameScale
  });
  crest.rels.parents = [...founderIds];
  founderIds.forEach(founderId => addUnique(chartById.get(founderId).rels.children, crestId));
  chartById.set(crestId, crest);
  parentageLines.set(crestId, {
    type: 'foundation',
    color: '#b88b37',
    dashed: false
  });

  descendants.forEach(childId => {
    const child = chartById.get(childId);
    founderIds.forEach(founderId => {
      removeValue(chartById.get(founderId).rels.children, childId);
      removeValue(child.rels.parents, founderId);
    });
  });

  if (family.lineage.timeGap.enabled) {
    const gap = family.lineage.timeGap;
    const gapId = `__lineage-gap-${family.document.id}`;
    const gapLabel = gap.label || (gap.years ? `${gap.years} Jahre später` : 'Die Linie setzt sich fort');
    const gapNode = createVirtualNode({
      id: gapId,
      name: gapLabel,
      title: gap.years ? `${gap.years} Jahre ohne lückenlose Überlieferung` : '',
      nodeKind: 'time-gap',
      sourcePartnershipId: partnershipId,
      frameAsset: TIME_JUMP_FRAME.asset,
      fromYear: gap.fromYear || latestKnownPersonYear(founderIds, personById),
      toYear: gap.toYear || earliestKnownBirthYear(descendants, personById)
    });
    gapNode.rels.parents = [crestId];
    gapNode.rels.children = [...descendants];
    crest.rels.children = [gapId];
    descendants.forEach(childId => {
      chartById.get(childId).rels.parents = [gapId];
      parentageLines.set(childId, {
        type: 'claimed',
        color: relationColor(family, 'claimed'),
        dashed: true
      });
    });
    chartById.set(gapId, gapNode);
    parentageLines.set(gapId, {
      type: 'time-gap',
      color: relationColor(family, 'claimed'),
      dashed: true
    });
  } else {
    crest.rels.children = [...descendants];
    descendants.forEach(childId => {
      chartById.get(childId).rels.parents = [crestId];
      parentageLines.set(childId, {
        type: 'claimed',
        color: relationColor(family, 'claimed'),
        dashed: true
      });
    });
  }
}

function applyCadetBranches({ family, chartById, parentageLines, houseById }) {
  family.cadetBranches.forEach(branch => {
    const partnership = family.partnerships.find(item => item.id === branch.parentPartnershipId);
    if (!partnership) return;
    const parentIds = partnership.participantIds.filter(personId => chartById.has(personId)).slice(0, 2);
    if (!parentIds.length) return;
    if (branch.linkType === 'line-extinct') {
      const endNodeId = `__line-end-${branch.id}`;
      const endNode = createVirtualNode({
        id: endNodeId,
        name: branch.name || 'Ausgestorben',
        title: branch.subtitle,
        nodeKind: 'line-end',
        cadetBranchId: branch.id,
        frameAsset: EXTINCT_LINE_FRAME.asset
      });
      endNode.rels.parents = [...parentIds];
      parentIds.forEach(parentId => addUnique(chartById.get(parentId).rels.children, endNodeId));
      chartById.set(endNodeId, endNode);
      parentageLines.set(endNodeId, {
        type: 'line-extinct',
        color: '#5b544c',
        dashed: false
      });
      return;
    }
    const house = houseById.get(branch.houseId);
    const nodeId = `__cadet-${branch.id}`;
    const node = createVirtualNode({
      id: nodeId,
      name: branch.name,
      title: branch.subtitle || (branch.linkType === 'married-away'
        ? 'Wegverheiratete Linie'
        : branch.founded ? `Gegründet ${branch.founded}` : ''),
      house: house?.name || branch.name,
      portrait: branch.emblem || house?.emblem || PORTRAIT_PLACEHOLDERS.crest,
      nodeKind: 'cadet-house',
      targetFamilyId: branch.targetFamilyId,
      cadetBranchId: branch.id,
      crestFrame: branch.crestFrame,
      emblemScale: branch.emblemScale,
      frameScale: branch.frameScale
    });
    node.rels.parents = [...parentIds];
    parentIds.forEach(parentId => addUnique(chartById.get(parentId).rels.children, nodeId));
    chartById.set(nodeId, node);
    parentageLines.set(nodeId, {
      type: 'cadet-house',
      color: '#b88b37',
      dashed: false
    });
  });
}

function applyOriginHouseStructure({ family, chartById, parentageLines, houseById }) {
  const origin = family.lineage.originHouse;
  if (!origin?.enabled) return;

  const childIds = origin.childIds.filter(childId => chartById.has(childId));
  if (!childIds.length) return;

  const house = houseById.get(origin.houseId);
  const nodeId = `__origin-house-${family.document.id}-${origin.id}`;
  const node = createVirtualNode({
    id: nodeId,
    name: origin.name || house?.name || 'Ursprungshaus',
    title: origin.subtitle,
    house: house?.name || origin.name,
    portrait: origin.emblem || house?.emblem || PORTRAIT_PLACEHOLDERS.crest,
    nodeKind: 'house-origin',
    targetFamilyId: origin.targetFamilyId,
    lineageOriginId: origin.id,
    crestFrame: origin.crestFrame,
    emblemScale: origin.emblemScale,
    frameScale: origin.frameScale
  });
  node.rels.children = [...childIds];

  childIds.forEach(childId => {
    const child = chartById.get(childId);
    child.rels.parents.forEach(parentId => removeValue(chartById.get(parentId)?.rels.children || [], childId));
    child.rels.parents = [nodeId];
    parentageLines.set(childId, {
      type: 'biological',
      color: relationColor(family, 'biological'),
      dashed: false
    });
  });

  chartById.set(nodeId, node);
}

function applyTimeJumps({ family, chartById, parentageLines, personById, diagnostics }) {
  const partnershipById = new Map(family.partnerships.map(partnership => [partnership.id, partnership]));
  const generationDepths = resolveFamilyGenerationDepths(family);
  const occupiedBarrierDepths = new Map();
  const founderPartnership = partnershipById.get(family.lineage.founderPartnershipId);
  const founderGenerationDepth = resolveAnchorGenerationDepth(
    founderPartnership?.participantIds || [],
    generationDepths
  );
  if (family.lineage.timeGap.enabled) {
    const founderIds = (founderPartnership?.participantIds || []).filter(personId => chartById.has(personId)).slice(0, 2);
    const lineageGapNode = chartById.get(`__lineage-gap-${family.document.id}`);
    if (founderIds.length && lineageGapNode) {
      if (founderGenerationDepth !== null) {
        occupiedBarrierDepths.set(founderGenerationDepth, lineageGapNode.id);
      }
      const routed = insertTimeJumpAsSerialBarrier({
        chartById,
        timeJumpNode: lineageGapNode,
        layoutStageNode: createTimeJumpLayoutStage(lineageGapNode.id),
        parentIds: founderIds,
        sourcePartnershipId: founderPartnership.id,
        declaredChildIds: [...lineageGapNode.rels.children]
      });
      routed.continuationIds.forEach(childId => {
        parentageLines.set(childId, {
          type: 'claimed',
          color: relationColor(family, 'claimed'),
          dashed: true
        });
      });
      if (routed.stageId) {
        parentageLines.set(routed.stageId, {
          type: 'time-gap',
          color: relationColor(family, 'claimed'),
          dashed: true
        });
      }
    }
  }

  const orderedTimeJumps = family.timeJumps
    .map(timeJump => {
      const partnership = partnershipById.get(timeJump.parentPartnershipId);
      const anchorIds = partnership?.participantIds || (timeJump.parentPersonId ? [timeJump.parentPersonId] : []);
      return {
        timeJump,
        anchorGenerationDepth: resolveAnchorGenerationDepth(anchorIds, generationDepths)
      };
    })
    .sort((first, second) => (
      (first.anchorGenerationDepth ?? Number.MAX_SAFE_INTEGER)
      - (second.anchorGenerationDepth ?? Number.MAX_SAFE_INTEGER)
      || first.timeJump.id.localeCompare(second.timeJump.id, 'de')
    ));

  orderedTimeJumps.forEach(({ timeJump, anchorGenerationDepth }) => {
    const partnership = partnershipById.get(timeJump.parentPartnershipId);
    const anchorIds = partnership?.participantIds || (timeJump.parentPersonId ? [timeJump.parentPersonId] : []);
    const parentIds = anchorIds.filter(personId => chartById.has(personId)).slice(0, 2);
    if (!parentIds.length) return;
    const existingBarrierId = anchorGenerationDepth === null
      ? ''
      : occupiedBarrierDepths.get(anchorGenerationDepth);
    if (existingBarrierId) {
      diagnostics.push(Object.freeze({
        severity: 'error',
        code: 'PARALLEL_TIME_JUMP_GENERATION_SKIPPED',
        message: 'Ein zweiter Zeitsprung derselben Generation wurde nicht dargestellt. Zeitsprünge sind globale serielle Trenner und dürfen niemals parallel stehen.',
        details: Object.freeze({
          timeJumpId: timeJump.id,
          existingBarrierId,
          generationDepth: anchorGenerationDepth
        })
      }));
      return;
    }
    if (anchorGenerationDepth !== null) {
      occupiedBarrierDepths.set(anchorGenerationDepth, `__time-jump-${timeJump.id}`);
    }
    const nodeId = `__time-jump-${timeJump.id}`;
    const node = createVirtualNode({
      id: nodeId,
      name: timeJump.label,
      title: timeJump.years ? `${timeJump.years} Jahre später` : 'Später wieder belegte Linie',
      nodeKind: 'time-jump',
      timeJumpId: timeJump.id,
      frameAsset: TIME_JUMP_FRAME.asset,
      fromYear: timeJump.fromYear || latestKnownPersonYear(parentIds, personById),
      toYear: timeJump.toYear || earliestKnownBirthYear(timeJump.childIds, personById)
    });
    const founderPartnership = family.partnerships.find(item => item.id === family.lineage.founderPartnershipId);
    const sourcePartnershipId = timeJump.parentPartnershipId
      || (founderPartnership?.participantIds.includes(timeJump.parentPersonId) ? founderPartnership.id : '');
    const routed = insertTimeJumpAsSerialBarrier({
      chartById,
      timeJumpNode: node,
      layoutStageNode: createTimeJumpLayoutStage(node.id),
      parentIds,
      sourcePartnershipId,
      declaredChildIds: timeJump.childIds
    });

    routed.continuationIds.forEach(childId => {
      if (!chartById.has(childId)) return;
      parentageLines.set(childId, {
        type: 'claimed',
        color: relationColor(family, 'claimed'),
        dashed: true
      });
    });

    if (routed.stageId) {
      parentageLines.set(routed.stageId, {
        type: 'time-jump',
        color: relationColor(family, 'claimed'),
        dashed: true
      });
    }

    parentageLines.set(nodeId, {
      type: 'time-jump',
      color: relationColor(family, 'claimed'),
      dashed: true
    });
  });
}

export function toFamilyChartData(input, options = {}) {
  const family = normalizeFamily(input);
  const diagnostics = [];
  const houseById = new Map(family.houses.map(house => [house.id, house]));
  const personById = new Map(family.persons.map(person => [person.id, person]));
  const chartById = new Map();
  const pairMetadata = new Map();
  const parentageLines = new Map();
  const selectedParentageByChild = new Map();
  const parentagesByChild = new Map();

  family.parentages.forEach(parentage => {
    if (options.publicOnly && parentage.visibility !== 'public') return;
    if (!parentagesByChild.has(parentage.childId)) parentagesByChild.set(parentage.childId, []);
    parentagesByChild.get(parentage.childId).push(parentage);
  });
  parentagesByChild.forEach((parentages, childId) => {
    selectedParentageByChild.set(childId, selectPrimaryParentage(parentages, personById.get(childId)));
  });

  family.persons.forEach(person => {
    const primaryParentage = selectedParentageByChild.get(person.id);
    chartById.set(person.id, createChartPerson(
      person,
      houseById.get(person.houseId),
      diagnostics,
      primaryParentage?.legitimacy || 'unknown'
    ));
  });

  const extraCoupleLines = [];

  function shareChartParent(firstId, secondId) {
    const firstParents = selectedParentageByChild.get(firstId)?.parentIds || [];
    const secondParents = selectedParentageByChild.get(secondId)?.parentIds || [];
    return firstParents.some(parentId => secondParents.includes(parentId));
  }

  family.partnerships.forEach(partnership => {
    if (options.publicOnly && partnership.visibility !== 'public') return;
    const validIds = partnership.participantIds.filter(personId => chartById.has(personId));
    if (validIds.length < 2) return;
    if (validIds.length > 2) {
      diagnostics.push(Object.freeze({
        severity: 'info',
        code: 'MULTI_PARTNER_PAIRWISE_LAYOUT',
        message: 'Eine Mehrpersonenverbindung wird für Family Chart paarweise dargestellt.',
        details: Object.freeze({ partnershipId: partnership.id, participantIds: Object.freeze([...validIds]) })
      }));
    }
    for (let firstIndex = 0; firstIndex < validIds.length - 1; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < validIds.length; secondIndex += 1) {
        const firstId = validIds[firstIndex];
        const secondId = validIds[secondIndex];
        const metadata = Object.freeze({
          type: partnership.type,
          color: relationColor(family, partnership.type),
          dashed: partnership.type === 'affair' || partnership.type === 'forced'
        });
        pairMetadata.set(pairKey(firstId, secondId), metadata);
        if (shareChartParent(firstId, secondId)) {
          // Partner im selben Geschwisterblock (z. B. Mündel und Verlobter) würden vom
          // Layout dupliziert; ihre Linie zeichnet der Link-Renderer stattdessen direkt.
          extraCoupleLines.push(Object.freeze({ firstId, secondId, ...metadata }));
          diagnostics.push(Object.freeze({
            severity: 'info',
            code: 'SIBLING_PARTNERSHIP_EXTRA_LINE',
            message: 'Eine Verbindung innerhalb desselben Geschwisterblocks wird als Zusatzlinie gezeichnet.',
            details: Object.freeze({ partnershipId: partnership.id, participantIds: Object.freeze([firstId, secondId]) })
          }));
          continue;
        }
        addUnique(chartById.get(firstId).rels.spouses, secondId);
        addUnique(chartById.get(secondId).rels.spouses, firstId);
      }
    }
  });

  parentagesByChild.forEach((parentages, childId) => {
    const child = chartById.get(childId);
    if (!child) return;
    const selected = selectedParentageByChild.get(childId);
    if (parentages.length > 1) {
      diagnostics.push(Object.freeze({
        severity: 'info',
        code: 'ALTERNATIVE_PARENTAGE_DOMAIN_ONLY',
        message: 'Alternative Abstammungen bleiben im Aleria-Modell erhalten; Family Chart zeigt die primäre Variante.',
        details: Object.freeze({ childId, selectedParentageId: selected.id })
      }));
    }
    selected.parentIds.slice(0, 2).forEach(parentId => {
      const parent = chartById.get(parentId);
      if (!parent || parentId === childId) return;
      addUnique(child.rels.parents, parentId);
      addUnique(parent.rels.children, childId);
    });
    const childRole = personById.get(childId)?.familyRole;
    parentageLines.set(childId, Object.freeze({
      type: selected.type,
      color: ROLE_LINE_COLORS[childRole] || relationColor(family, selected.type),
      dashed: ['claimed', 'foster', 'step'].includes(selected.type) || Boolean(ROLE_LINE_COLORS[childRole])
    }));
    if (selected.parentIds.length > 2) {
      diagnostics.push(Object.freeze({
        severity: 'warning',
        code: 'PARENT_LIMIT',
        message: 'Family Chart stellt höchstens zwei Eltern pro Kind dar.',
        details: Object.freeze({ parentageId: selected.id, parentIds: Object.freeze([...selected.parentIds]) })
      }));
    }
  });

  applyLineageStructure({ family, chartById, selectedParentageByChild, parentageLines, houseById, personById });
  applyCadetBranches({ family, chartById, parentageLines, houseById });
  applyOriginHouseStructure({ family, chartById, parentageLines, houseById });
  applyTimeJumps({ family, chartById, parentageLines, personById, diagnostics });

  return Object.freeze({
    data: Object.freeze([...chartById.values()]),
    diagnostics: Object.freeze(diagnostics),
    extraCoupleLines: Object.freeze([...extraCoupleLines]),
    getPartnershipLine(firstId, secondId) {
      return pairMetadata.get(pairKey(firstId, secondId)) || null;
    },
    getParentageLine(childId) {
      return parentageLines.get(childId) || null;
    }
  });
}

function hierarchyNodeId(node) {
  return node?.data?.id || node?.id || '';
}

function childIdFromLink(link) {
  if (Array.isArray(link?.source)) return hierarchyNodeId(link.target);
  if (Array.isArray(link?.target)) return hierarchyNodeId(link.source);
  return hierarchyNodeId(link?.target);
}

export function getFamilyChartAvailability(runtime = globalThis) {
  return Object.freeze({
    available: Boolean(runtime.f3?.createChart && runtime.d3),
    familyChartAvailable: Boolean(runtime.f3?.createChart),
    d3Available: Boolean(runtime.d3),
    adapterId: ADAPTER_ID,
    libraryVersion: LIBRARY_VERSION
  });
}

export function createFamilyChartSession(config) {
  const container = config?.container;
  if (!container) throw new Error('Für Family Chart fehlt der Zielcontainer.');
  const runtime = config.runtime || globalThis;
  const availability = getFamilyChartAvailability(runtime);
  if (!availability.available) {
    throw new Error('Family Chart 0.9.0 oder D3 7.9.0 ist nicht verfügbar.');
  }

  let family = normalizeFamily(config.family);
  let view = { ...family.view, ...(config.view || {}) };
  let converted = toFamilyChartData(family, config.options);
  if (!converted.data.length) throw new Error('Der Stammbaum enthält keine darstellbare Person.');

  function originRootId() {
    const origin = family.lineage?.originHouse;
    if (!origin?.enabled) return '';
    const nodeId = `__origin-house-${family.document.id}-${origin.id}`;
    return converted.data.some(entry => entry.id === nodeId) ? nodeId : '';
  }

  // Mit dem Ursprungshaus als Wurzel rendert Family Chart die Generationen vor dem
  // Gründerpaar als Nachkommen — samt Ehepartnern und Wappenknoten der Seitenlinien.
  function resolveDefaultMainId() {
    const rootId = originRootId();
    if (rootId) return rootId;
    return view.focusPersonId && converted.data.some(entry => entry.id === view.focusPersonId)
      ? view.focusPersonId
      : family.persons[0]?.id;
  }

  let focusPersonId = resolveDefaultMainId();
  let destroyed = false;

  container.classList.add('f3', 'f3-cont');
  const chart = runtime.f3.createChart(container, converted.data);

  function ensureActive() {
    if (destroyed) throw new Error('Die Family-Chart-Sitzung wurde bereits beendet.');
  }

  const linkRenderer = createFamilyChartLinkRenderer({
    container,
    resolveMetadata(link) {
      if (link?.spouse) {
        return converted.getPartnershipLine(hierarchyNodeId(link.source), hierarchyNodeId(link.target));
      }
      return converted.getParentageLine(childIdFromLink(link));
    },
    resolveExtraLinks() {
      return converted.extraCoupleLines;
    }
  });

  function applyView(render = false) {
    const chartDepths = resolveFamilyChartViewDepths(converted.data, focusPersonId, view);
    chart.setTransitionTime?.(260);
    chart.setCardXSpacing?.(FAMILY_CHART_CARD_LAYOUT.horizontalSpacing);
    chart.setCardYSpacing?.(FAMILY_CHART_CARD_LAYOUT.verticalSpacing);
    chart.setShowSiblingsOfMain?.(view.showSiblings !== false);
    chart.setAncestryDepth?.(chartDepths.ancestorDepth);
    chart.setProgenyDepth?.(chartDepths.descendantDepth);
    chart.setSingleParentEmptyCard?.(false, { label: 'Unbekannt' });
    if (view.orientation === 'horizontal') chart.setOrientationHorizontal?.();
    else chart.setOrientationVertical?.();
    if (render) chart.updateTree?.({ initial: false, tree_position: 'fit' });
  }

  function configureCard() {
    const card = chart.setCardHtml?.();
    card?.setCardDim?.({
      width: FAMILY_CHART_CARD_LAYOUT.width,
      height: FAMILY_CHART_CARD_LAYOUT.height
    });
    card?.setCardInnerHtmlCreator?.(createFamilyChartCardHtml);
    card?.setOnCardClick?.((event, datum) => {
      const metadata = datum?.data?.data?.aleria || datum?.data?.aleria || {};
      const personId = datum?.data?.id || datum?.id;
      if (metadata.virtualType === 'house-origin') {
        config.onLineageOriginClick?.({
          lineageOriginId: metadata.lineageOriginId,
          familyId: metadata.targetFamilyId,
          event
        });
        return;
      }
      if (metadata.virtualType === 'cadet-house' && metadata.targetFamilyId) {
        config.onFamilyLinkClick?.({
          familyId: metadata.targetFamilyId,
          branchId: metadata.cadetBranchId,
          event
        });
        return;
      }
      if (metadata.virtualType === 'time-jump' && metadata.timeJumpId) {
        config.onTimeJumpClick?.({ timeJumpId: metadata.timeJumpId, event });
        return;
      }
      if (metadata.virtualType === 'house-crest' && metadata.sourcePartnershipId) {
        config.onLineageCrestClick?.({ partnershipId: metadata.sourcePartnershipId, event });
        return;
      }
      if (metadata.virtualType === 'time-gap' && metadata.sourcePartnershipId) {
        config.onLineageTimeGapClick?.({ partnershipId: metadata.sourcePartnershipId, event });
        return;
      }
      if (metadata.virtualType) return;
      if (isPortraitCardEvent(event)) {
        const portraitHandled = typeof config.onPortraitClick === 'function'
          && config.onPortraitClick({ personId, event }) === true;
        if (portraitHandled) return;
      }
      const handled = typeof config.onPersonClick === 'function'
        && config.onPersonClick({ personId, event }) === true;
      if (!handled) focus(personId, { fit: false });
    });
  }

  function update(nextFamily, nextView = nextFamily?.view) {
    ensureActive();
    const nextConverted = toFamilyChartData(nextFamily, config.options);
    if (!nextConverted.data.length) return false;
    family = normalizeFamily(nextFamily);
    view = { ...family.view, ...(nextView || {}) };
    converted = nextConverted;
    const actualPersonIds = new Set(family.persons.map(person => person.id));
    if (!actualPersonIds.has(focusPersonId)) focusPersonId = resolveDefaultMainId();
    chart.updateData?.(converted.data);
    applyView(false);
    chart.updateMainId?.(focusPersonId);
    chart.updateTree?.({ initial: false, tree_position: 'inherit' });
    return true;
  }

  function focus(personId, options = {}) {
    ensureActive();
    const datum = converted.data.find(person => person.id === personId);
    if (!datum || datum.data.aleria.virtualType) return false;
    focusPersonId = personId;
    applyView(false);
    chart.updateMainId?.(personId);
    chart.updateTree?.({
      initial: false,
      tree_position: options.fit === true ? 'fit' : 'main_to_middle'
    });
    return true;
  }

  function fit() {
    ensureActive();
    chart.updateTree?.({ initial: false, tree_position: 'fit' });
  }

  function reset() {
    ensureActive();
    const defaultPersonId = resolveDefaultMainId();
    if (!defaultPersonId) return false;
    focusPersonId = defaultPersonId;
    applyView(false);
    chart.updateMainId?.(defaultPersonId);
    chart.updateTree?.({ initial: false, tree_position: 'fit' });
    return true;
  }

  function setOrientation(orientation) {
    ensureActive();
    view.orientation = orientation === 'horizontal' ? 'horizontal' : 'vertical';
    applyView(true);
  }

  function destroy() {
    if (destroyed) return;
    linkRenderer.destroy();
    container.replaceChildren();
    container.classList.remove('f3', 'f3-cont');
    destroyed = true;
  }

  configureCard();
  applyView(false);
  chart.setAfterUpdate?.(options => linkRenderer.refresh(options?.transition_time));
  chart.updateMainId?.(focusPersonId);
  chart.updateTree?.({ initial: true, tree_position: 'fit', transition_time: 0 });

  return Object.freeze({
    update,
    focus,
    fit,
    reset,
    setOrientation,
    destroy,
    getState() {
      ensureActive();
      return Object.freeze({
        focusPersonId,
        orientation: view.orientation,
        diagnostics: converted.diagnostics
      });
    },
    getData() {
      ensureActive();
      return converted.data;
    }
  });
}
