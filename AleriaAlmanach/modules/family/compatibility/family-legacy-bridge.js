// Projects the existing level-based family format into the v2 relationship model in memory.

(function installFamilyLegacyBridge(global) {
  'use strict';

  function isRecord(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  }

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function asText(value, fallback = '') {
    return typeof value === 'string' ? value.trim() : fallback;
  }

  function normalizeRelationType(value) {
    return asText(value, 'custom')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-');
  }

  function pairKey(firstId, secondId) {
    return [firstId, secondId].sort().join('\u001f');
  }

  function makeLegacyId(prefix, value, index) {
    const slug = asText(value, `${prefix}-${index + 1}`)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return `legacy-${prefix}-${slug || index + 1}`;
  }

  function isV2Family(value) {
    return value?.schema === 'aleria.family'
      && Number(value?.schemaVersion) >= 2
      && isRecord(value?.genealogy);
  }

  function collectLegacyNodes(data) {
    return asArray(data.trees).flatMap((tree, treeIndex) => (
      asArray(tree?.levels).flatMap((level, levelIndex) => (
        asArray(level?.nodes).map((node, nodeIndex) => ({
          ...node,
          _legacyTreeId: asText(tree?.id, `tree-${treeIndex + 1}`),
          _legacyTreeLabel: asText(tree?.label, `Familienbaum ${treeIndex + 1}`),
          _legacyLevelIndex: levelIndex,
          _legacyNodeIndex: nodeIndex
        }))
      ))
    ));
  }

  function collectLegacyConnections(data) {
    return asArray(data.trees).flatMap(tree => asArray(tree?.connections));
  }

  function getPartnershipKind(relationType) {
    if (['spouse', 'marriage', 'married', 'ehe', 'ehepartner'].includes(relationType)) return 'marriage';
    if (['engagement', 'betrothal', 'verlobung', 'verlobt'].includes(relationType)) return 'engagement';
    if (['affair', 'affaire'].includes(relationType)) return 'affair';
    if (['union', 'partnership', 'verbindung'].includes(relationType)) return 'union';
    return '';
  }

  function buildLegacyPartnerships(connections, personIds, report) {
    const seen = new Set();
    const partnerships = [];
    connections.forEach((connection, index) => {
      const firstId = asText(connection?.from);
      const secondId = asText(connection?.to);
      const relationType = normalizeRelationType(connection?.relationType);
      const kind = getPartnershipKind(relationType);
      if (!kind) return;
      if (!personIds.has(firstId) || !personIds.has(secondId) || firstId === secondId) {
        report.push({
          code: 'LEGACY_PARTNERSHIP_SKIPPED',
          severity: 'warning',
          connectionIndex: index
        });
        return;
      }
      const key = `${pairKey(firstId, secondId)}\u001f${kind}`;
      if (seen.has(key)) return;
      seen.add(key);
      partnerships.push({
        id: makeLegacyId('partnership', `${firstId}-${secondId}-${kind}`, partnerships.length),
        participantIds: [firstId, secondId],
        kind,
        customKind: null,
        status: 'unknown',
        endReason: null,
        label: asText(connection?.label),
        period: { from: null, to: null },
        assertion: {
          certainty: 'confirmed',
          visibility: 'public',
          sourceIds: [],
          note: 'Aus dem bisherigen Family-Template übernommen.'
        },
        extensions: {
          'aleria.legacy': { relationType }
        }
      });
    });
    return partnerships;
  }

  function findOriginPartnershipId(parentIds, partnerships) {
    if (parentIds.length !== 2) return null;
    const key = pairKey(parentIds[0], parentIds[1]);
    return partnerships.find(partnership => pairKey(...partnership.participantIds) === key)?.id || null;
  }

  function buildLegacyParentages(nodes, personIds, partnerships, report) {
    return nodes.flatMap((node, index) => {
      const childId = asText(node.id);
      const parentIds = [...new Set(asArray(node.parentIds).map(asText).filter(Boolean))]
        .filter(parentId => parentId !== childId && personIds.has(parentId));
      if (!parentIds.length) return [];
      const missingCount = asArray(node.parentIds).length - parentIds.length;
      if (missingCount > 0) {
        report.push({
          code: 'LEGACY_PARENT_REFERENCE_SKIPPED',
          severity: 'warning',
          childId,
          count: missingCount
        });
      }
      const familyType = asText(node.familyType, 'direct');
      return [{
        id: makeLegacyId('parentage', childId, index),
        childId,
        parentIds,
        kind: familyType === 'ward' ? 'foster' : 'biological',
        partnershipId: findOriginPartnershipId(parentIds, partnerships),
        legitimacy: {
          status: familyType === 'bastard' ? 'illegitimate' : 'unknown',
          effectiveFrom: null,
          authorityPersonIds: [],
          note: ''
        },
        period: { from: null, to: null },
        assertion: {
          certainty: 'confirmed',
          visibility: 'public',
          sourceIds: [],
          note: 'Aus parentIds des bisherigen Family-Templates übernommen.'
        },
        extensions: {}
      }];
    });
  }

  function buildLegacyAssociations(connections, personIds) {
    const partnershipTypes = new Set([
      'spouse', 'marriage', 'married', 'ehe', 'ehepartner',
      'engagement', 'betrothal', 'verlobung', 'verlobt',
      'affair', 'affaire', 'union', 'partnership', 'verbindung'
    ]);
    const derivedTypes = new Set(['sibling', 'geschwister', 'cousin', 'vetter', 'in-law', 'schwager']);
    return connections.flatMap((connection, index) => {
      const firstId = asText(connection?.from);
      const secondId = asText(connection?.to);
      const relationType = normalizeRelationType(connection?.relationType);
      if (partnershipTypes.has(relationType) || derivedTypes.has(relationType)) return [];
      if (!personIds.has(firstId) || !personIds.has(secondId) || firstId === secondId) return [];
      const kind = ['ward', 'mundel', 'guardian'].includes(relationType)
        ? 'guardianship'
        : (['forced', 'erzwungen'].includes(relationType) ? 'forced-bond' : 'custom');
      return [{
        id: makeLegacyId('association', `${firstId}-${secondId}-${relationType}`, index),
        kind,
        participants: [
          { personId: firstId, role: kind === 'guardianship' ? 'guardian' : 'participant' },
          { personId: secondId, role: kind === 'guardianship' ? 'ward' : 'participant' }
        ],
        label: asText(connection?.label),
        assertion: { certainty: 'confirmed', visibility: 'public', sourceIds: [] },
        extensions: { 'aleria.legacy': { relationType } }
      }];
    });
  }

  function chooseInitialFocus(nodes, partnerships, parentages) {
    const scoreById = new Map(nodes.map(node => [asText(node.id), node.familyType === 'direct' ? 1 : 0]));
    partnerships.forEach(partnership => partnership.participantIds.forEach(id => {
      scoreById.set(id, (scoreById.get(id) || 0) + 2);
    }));
    parentages.forEach(parentage => {
      scoreById.set(parentage.childId, (scoreById.get(parentage.childId) || 0) + 2);
      parentage.parentIds.forEach(id => scoreById.set(id, (scoreById.get(id) || 0) + 1));
    });
    return [...scoreById.entries()].sort((first, second) => second[1] - first[1])[0]?.[0] || null;
  }

  function projectLegacyFamily(rawFamily = {}) {
    const data = typeof global.sanitizeFamilyData === 'function'
      ? global.sanitizeFamilyData(rawFamily)
      : rawFamily;
    const report = [];
    const nodes = collectLegacyNodes(data);
    const personIds = new Set(nodes.map(node => asText(node.id)).filter(Boolean));
    const connections = collectLegacyConnections(data);
    const partnerships = buildLegacyPartnerships(connections, personIds, report);
    const parentages = buildLegacyParentages(nodes, personIds, partnerships, report);
    const persons = nodes.map(node => ({
      id: asText(node.id),
      recordType: 'person',
      characterRef: null,
      identity: {
        status: 'known',
        displayName: asText(node.title, 'Unbenannte Person'),
        givenNames: [],
        familyName: '',
        aliases: []
      },
      profile: {
        tagline: asText(node.subtitle),
        summary: asText(node.text),
        portrait: {
          src: asText(node.portrait),
          alt: asText(node.title, 'Porträt')
        }
      },
      sex: 'unknown',
      genderIdentity: null,
      life: { status: 'unknown', birth: null, death: null },
      tags: [asText(node.familyType, 'direct')],
      extensions: {
        'aleria.legacy': {
          treeId: node._legacyTreeId,
          treeLabel: node._legacyTreeLabel,
          levelIndex: node._legacyLevelIndex,
          nodeIndex: node._legacyNodeIndex
        }
      }
    }));
    const associations = buildLegacyAssociations(connections, personIds);
    const lineages = asArray(data.trees).map((tree, index) => ({
      id: makeLegacyId('lineage', tree?.id || tree?.label, index),
      name: asText(tree?.label, `Familienlinie ${index + 1}`),
      kind: index === 0 ? 'main' : 'branch',
      status: 'unknown',
      parentLineageId: null,
      extensions: { 'aleria.legacy': { treeId: asText(tree?.id) } }
    }));

    return {
      family: {
        schema: 'aleria.family',
        schemaVersion: 2,
        id: 'legacy-family-projection',
        document: {
          eyebrow: asText(data.eyebrow, 'Familie'),
          title: asText(data.organizationTitle, 'Familienhaus'),
          subtitle: asText(data.subtitle),
          summary: asText(data.description),
          quote: asText(data.quote),
          facts: asArray(data.details)
        },
        genealogy: {
          persons,
          partnerships,
          parentages,
          associations,
          sources: [],
          fantasy: {
            houses: [],
            lineages,
            houseAffiliations: [],
            titles: [],
            titleHoldings: [],
            claims: [],
            successionRules: [],
            successionDecisions: [],
            bloodlines: [],
            bloodlineLinks: []
          }
        },
        view: {
          initialFocusPersonId: chooseInitialFocus(nodes, partnerships, parentages),
          orientation: data.layoutMode === 'depth' ? 'horizontal' : 'vertical',
          showSiblings: true,
          fitOnOpen: true,
          visibleParentageKinds: ['biological', 'adoptive', 'foster', 'magical']
        },
        extensions: {
          'aleria.legacy': {
            projectedAtRuntime: true,
            treeDisplayMode: asText(data.treeDisplayMode, 'tabs')
          }
        }
      },
      report: Object.freeze(report.map(item => Object.freeze(item))),
      migrated: true
    };
  }

  function readFamily(rawFamily = {}) {
    if (isV2Family(rawFamily)) {
      return { family: rawFamily, report: Object.freeze([]), migrated: false };
    }
    return projectLegacyFamily(rawFamily);
  }

  const currentApi = isRecord(global.AleriaFamily) ? global.AleriaFamily : {};
  const currentCompatibility = isRecord(currentApi.compatibility) ? currentApi.compatibility : {};
  global.AleriaFamily = Object.freeze({
    apiVersion: currentApi.apiVersion || 1,
    schema: currentApi.schema || 'aleria.family',
    schemaVersion: currentApi.schemaVersion || 2,
    ...currentApi,
    compatibility: Object.freeze({
      ...currentCompatibility,
      read: readFamily,
      projectLegacy: projectLegacyFamily
    })
  });
})(globalThis);
