import {
  resolvePublishedAnchorGenerationDepth,
  resolvePublishedFamilyGenerationDepths
} from './family-generation-depth.js';

function asSet(records, label, diagnostics) {
  const ids = new Set();
  records.forEach(record => {
    if (!record?.id || typeof record.id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,159}$/.test(record.id)) diagnostics.push(`${label} ohne Firebase-geeignete ID.`);
    else if (ids.has(record.id)) diagnostics.push(`Doppelte ${label}-ID „${record.id}“.`);
    else ids.add(record.id);
  });
  return ids;
}

function findAncestryCycle(personIds, parentages) {
  const children = new Map();
  parentages.forEach(parentage => (parentage.parentIds || []).forEach(parentId => {
    if (!children.has(parentId)) children.set(parentId, []);
    children.get(parentId).push(parentage.childId);
  }));
  const visiting = new Set();
  const visited = new Set();
  function walk(personId) {
    if (visiting.has(personId)) return true;
    if (visited.has(personId)) return false;
    visiting.add(personId);
    const hasCycle = (children.get(personId) || []).some(walk);
    visiting.delete(personId);
    visited.add(personId);
    return hasCycle;
  }
  return [...personIds].some(walk);
}

export function validateWorkspaceForPublishing(workspace) {
  const diagnostics = [];
  const { root, collections } = workspace;
  if (root?.schema !== 'aleria.family-tree' || root?.schemaVersion !== 1) {
    diagnostics.push('Nicht unterstützte Datenmodell-Version.');
  }
  if (!root?.familyId || root.familyId !== root.document?.id) {
    diagnostics.push('Familien-ID und Dokument-ID stimmen nicht überein.');
  }
  const personIds = asSet(collections.persons, 'Person', diagnostics);
  const partnershipIds = asSet(collections.partnerships, 'Partnerschaft', diagnostics);
  const partnershipById = new Map(collections.partnerships.map(partnership => [partnership.id, partnership]));
  asSet(collections.parentages, 'Abstammung', diagnostics);
  asSet(collections.houses, 'Haus', diagnostics);
  asSet(collections.cadetBranches, 'Hausverknüpfung', diagnostics);
  asSet(collections.timeJumps, 'Zeitsprung', diagnostics);

  collections.partnerships.forEach(partnership => {
    if (!Array.isArray(partnership.participantIds) || partnership.participantIds.length < 2) {
      diagnostics.push(`Partnerschaft „${partnership.id}“ benötigt mindestens zwei Personen.`);
      return;
    }
    partnership.participantIds.forEach(id => {
      if (!personIds.has(id)) diagnostics.push(`Partnerschaft „${partnership.id}“ verweist auf eine unbekannte Person.`);
    });
  });
  collections.parentages.forEach(parentage => {
    if (!personIds.has(parentage.childId)) diagnostics.push(`Abstammung „${parentage.id}“ hat ein unbekanntes Kind.`);
    if (!Array.isArray(parentage.parentIds) || !parentage.parentIds.length) {
      diagnostics.push(`Abstammung „${parentage.id}“ benötigt Eltern.`);
    }
    (parentage.parentIds || []).forEach(id => {
      if (!personIds.has(id)) diagnostics.push(`Abstammung „${parentage.id}“ hat ein unbekanntes Elternteil.`);
      if (id === parentage.childId) diagnostics.push(`Abstammung „${parentage.id}“ enthält eine Selbstreferenz.`);
    });
  });
  collections.cadetBranches.forEach(branch => {
    if (!partnershipIds.has(branch.parentPartnershipId)) diagnostics.push(`Hausverknüpfung „${branch.id}“ hat kein gültiges Elternpaar.`);
    if (!branch.targetFamilyId) diagnostics.push(`Hausverknüpfung „${branch.id}“ hat kein Zielhaus.`);
  });
  const timeJumpAnchors = [];
  const founderPersonIds = new Set(
    partnershipById.get(root.lineage?.founderPartnershipId)?.participantIds || []
  );
  const generationDepths = resolvePublishedFamilyGenerationDepths(collections);
  const occupiedTimeBarrierDepths = new Map();
  const founderGenerationDepth = resolvePublishedAnchorGenerationDepth(
    [...founderPersonIds],
    generationDepths
  );
  if (root.lineage?.timeGap?.enabled === true && founderGenerationDepth !== null) {
    occupiedTimeBarrierDepths.set(founderGenerationDepth, 'lineage-time-gap');
  }
  collections.timeJumps.forEach(timeJump => {
    const hasPartnership = timeJump.parentPartnershipId && partnershipIds.has(timeJump.parentPartnershipId);
    const hasPerson = timeJump.parentPersonId && personIds.has(timeJump.parentPersonId);
    if (timeJump.parentPartnershipId && !hasPartnership) diagnostics.push(`Zeitsprung „${timeJump.id}“ verweist auf ein unbekanntes Elternpaar.`);
    if (timeJump.parentPersonId && !hasPerson) diagnostics.push(`Zeitsprung „${timeJump.id}“ verweist auf eine unbekannte Ausgangsperson.`);
    if (!hasPartnership && !hasPerson) diagnostics.push(`Zeitsprung „${timeJump.id}“ hat keine gültige Ausgangsperson oder -verbindung.`);
    if (hasPartnership && hasPerson) diagnostics.push(`Zeitsprung „${timeJump.id}“ hat mehrere Ausgangspunkte.`);
    const anchorPersonIds = hasPartnership
      ? partnershipById.get(timeJump.parentPartnershipId)?.participantIds || []
      : hasPerson ? [timeJump.parentPersonId] : [];
    const overlappingAnchor = timeJumpAnchors.find(anchor => (
      anchor.personIds.some(personId => anchorPersonIds.includes(personId))
    ));
    if (anchorPersonIds.length && overlappingAnchor) {
      diagnostics.push(`Zeitsprung „${timeJump.id}“ überlappt „${overlappingAnchor.timeJumpId}“ an mindestens einer Person und wäre damit parallel.`);
    }
    if (anchorPersonIds.length) timeJumpAnchors.push({ timeJumpId: timeJump.id, personIds: anchorPersonIds });
    const hasExactlyOneAnchorField = Boolean(timeJump.parentPartnershipId) !== Boolean(timeJump.parentPersonId);
    const hasValidAnchor = hasExactlyOneAnchorField && (Boolean(hasPartnership) !== Boolean(hasPerson));
    const anchorGenerationDepth = hasValidAnchor
      ? resolvePublishedAnchorGenerationDepth(anchorPersonIds, generationDepths)
      : null;
    const existingBarrierId = anchorGenerationDepth === null
      ? ''
      : occupiedTimeBarrierDepths.get(anchorGenerationDepth);
    if (existingBarrierId) {
      diagnostics.push(`Zeitsprung „${timeJump.id}“ wäre auf Generation ${anchorGenerationDepth} parallel zu „${existingBarrierId}“. Pro Generation ist nur ein globaler Trenner zulässig.`);
    } else if (anchorGenerationDepth !== null) {
      occupiedTimeBarrierDepths.set(anchorGenerationDepth, timeJump.id);
    }
    if (
      root.lineage?.timeGap?.enabled === true
      && anchorPersonIds.some(personId => founderPersonIds.has(personId))
    ) {
      diagnostics.push(`Zeitsprung „${timeJump.id}“ belegt denselben Platz wie der bestehende Trenner unter dem Stammwappen.`);
    }
    (timeJump.childIds || []).forEach(id => {
      if (!personIds.has(id)) diagnostics.push(`Zeitsprung „${timeJump.id}“ verweist auf eine unbekannte Person.`);
    });
  });
  if (findAncestryCycle(personIds, collections.parentages)) diagnostics.push('Die Abstammung enthält einen Zyklus.');
  return Object.freeze({ valid: diagnostics.length === 0, diagnostics: Object.freeze(diagnostics) });
}
