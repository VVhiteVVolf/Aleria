import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { createFamilyPerson, createMarriage, createParentages, createMarriedAwayBranch, createWardAwayBranch, createCadetHouseBranch } from './family-record-builders.js';

const PERSON_FIELDS = ['worldPersonId', 'name', 'title', 'sex', 'birth', 'death', 'status', 'portrait', 'portraitPlaceholder', 'houseId', 'familyRole', 'lineageRole', 'notes'];

function sourcePartnerships(source, partnershipRecords) {
  const continuingIds = new Set(source.descendants.flatMap(group =>
    partnershipRecords[group.partnershipId].participantIds));
  return source.partnershipIds.map(partnershipId => {
    const partnership = partnershipRecords[partnershipId];
    if (!partnership) throw new Error(`Fehlende Quellenpartnerschaft ${partnershipId}.`);
    const descendants = source.descendants.find(group => group.partnershipId === partnershipId && !group.timeJumpId);
    const anchors = descendants?.childIds.length === 1
      ? { chartAlignParentPairOverChildPersonId: descendants.childIds[0] }
      : descendants?.childIds.length > 1 && descendants.childIds.every(id => !continuingIds.has(id))
        ? { chartAlignChildGroupBelowParentPair: true } : {};
    const sharedExtensions = Object.fromEntries(Object.entries(partnership.extensions || {}).filter(([key]) => !key.startsWith('chart')));
    return { ...createMarriage(partnership.id, ...partnership.participantIds), ...partnership,
      extensions: { ...sharedExtensions, ...anchors, registryManagedExtensionFields: Object.keys(anchors) } };
  });
}

export function createSourceHouseFamily({
  id, houseId, title, source, catalog, houseProfile, description, emblem, biography, territorialSource,
  titleForPerson, crestSubtitle = '', extensions = {}
}) {
  const slug = id.replace(/^haus-/, '');
  const wardIds = new Set(source.wards.map(ward => ward.personId));
  const founderId = source.personIds[0];
  const persons = source.personIds.map(personId => {
    const person = catalog.persons[personId];
    if (!person) throw new Error(`${id}: fehlende Quellenperson ${personId}.`);
    return createFamilyPerson({
      ...person,
      portrait: catalog.portraits[personId] || '',
      title: titleForPerson(personId, founderId),
      familyRole: wardIds.has(personId) ? 'ward-away' : source.personRoles?.[personId] || (person.houseId === houseId || personId === founderId ? 'core' : 'married'),
      lineageRole: source.heads.includes(personId) ? 'head' : 'branch',
      extensions: { ...source.personExtensions?.[personId], registryManagedFields: PERSON_FIELDS,
        registryManagedExtensionFields: Object.keys(source.personExtensions?.[personId] || {}) }
    });
  });
  const partnerships = sourcePartnerships(source, catalog.partnerships);
  const pairs = new Map(partnerships.map(pair => [pair.id, pair]));
  const parentages = source.descendants.flatMap(descendants => createParentages(
    descendants.childIds, pairs.get(descendants.partnershipId).participantIds, descendants.partnershipId,
    { idPrefix: `${slug}-parentage`, ...(descendants.legitimacy ? { legitimacy: descendants.legitimacy } : {}), ...(descendants.type ? {
      type: descendants.type, certainty: descendants.certainty, notes: descendants.notes
    } : {}), ...(descendants.timeJumpId ? {
      type: 'claimed', certainty: 'probable', notes: 'Nicht einzeln überlieferte Zwischengenerationen.',
      extensions: { timeJumpId: descendants.timeJumpId }
    } : {}) }
  ));
  const timeJumps = source.descendants.filter(entry => entry.timeJumpId).map(entry => {
    const years = entry.childIds.map(personId => Number(catalog.persons[personId].birth)).filter(Number.isFinite);
    return { id: entry.timeJumpId, parentPartnershipId: entry.partnershipId, childIds: [...entry.childIds],
      years: 0, fromYear: '????', toYear: years.length ? String(Math.min(...years)) : '????',
      label: 'Nicht einzeln überlieferte Generationen', notes: 'Serieller Überlieferungssprung nach dem belegten Elternpaar.', extensions: {} };
  });
  const houseById = new Map(catalog.houses.map(entry => [entry.id, entry]));
  const cadetBranches = source.away.map((branch, index) => {
    const targetHouseId = branch.houseId || branch.targetFamilyId.replace(/^haus-/, 'house-');
    const targetHouse = houseById.get(targetHouseId);
    return createMarriedAwayBranch({ id: `married-away-${slug}-${index + 1}`, name: targetHouse?.name || 'Unbekanntes Haus',
      houseId: targetHouseId, targetFamilyId: branch.targetFamilyId, parentPartnershipId: branch.partnershipId, emblem: targetHouse?.emblem || '',
      extensions: { chartAlignBelowPartnership: true, registryManagedExtensionFields: ['chartAlignBelowPartnership'] } });
  });
  for (const [index, branch] of (source.cadets || []).entries()) {
    const targetHouseId = branch.houseId || branch.targetFamilyId.replace(/^haus-/, 'house-');
    const targetHouse = houseById.get(targetHouseId);
    cadetBranches.push(createCadetHouseBranch({
      id: `cadet-${slug}-${index + 1}`, name: targetHouse?.name || 'Unbekanntes Haus',
      houseId: targetHouseId, targetFamilyId: branch.targetFamilyId,
      parentPartnershipId: branch.partnershipId, emblem: targetHouse?.emblem || '',
      notes: branch.notes || '', extensions: { chartAlignBelowPartnership: true, registryManagedExtensionFields: ['chartAlignBelowPartnership'] }
    }));
  }
  for (const ward of source.wards) {
    const targetHouseId = ward.houseId || ward.targetFamilyId.replace(/^haus-/, 'house-');
    const targetHouse = houseById.get(targetHouseId);
    cadetBranches.push(createWardAwayBranch({ id: `ward-away-${ward.personId}`, name: ward.name || targetHouse?.name || 'Unbekanntes Haus',
      parentPersonId: ward.personId, houseId: targetHouseId, targetFamilyId: ward.targetFamilyId,
      emblem: targetHouse?.emblem || '', notes: ward.notes || catalog.persons[ward.personId].notes }));
  }
  const requiredHouses = new Set([houseId, ...persons.map(person => person.houseId), ...cadetBranches.map(branch => branch.houseId)]);
  const houses = [...requiredHouses].map(requiredId => houseById.get(requiredId) || {
    id: requiredId, name: cadetBranches.find(branch => branch.houseId === requiredId)?.name || 'Unbekanntes Haus', motto: '', emblem: '', status: 'active'
  });
  return {
    schema: 'aleria.family-tree', schemaVersion: 1,
    document: { id, title, motto: '', description, emblem, houseProfile },
    persons, houses, partnerships, parentages, cadetBranches, timeJumps,
    lineage: { founderPartnershipId: source.partnershipIds[0], houseId, crestSubtitle, crestEmblemScale: 0.86,
      crestFrame: 'gold', crestFrameScale: 1, timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' } },
    presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
    view: { focusPersonId: founderId, orientation: 'vertical', ancestorDepth: 16, descendantDepth: 16, limitGenerations: false, showSiblings: true },
    extensions: { blankFamily: false, sourceRevision: 2, chartLayoutPolicy: 'strict-v1',
      territorialSource,
      sourceNote: `Nutzerquelle und Stammbaumgrafik vom 05.10.2026. Geteilte Personen, Welt-IDs, Partnerschaften und Porträts bleiben identisch. ${source.sourceNote} Hausrang, unbekannte Lebensdaten und anonyme Vorlagen werden nicht ergänzt.`,
      sourceInventory: catalog.inventory,
      warriorReference: `assets/images/references/${id}/krieger.png`,
      houseBiographyModule: biography,
      registryManagedDocumentFields: ['description'],
      registryManagedExtensionFields: ['blankFamily', 'chartLayoutPolicy', 'sourceNote', 'sourceInventory', 'warriorReference', 'houseBiographyModule'],
      registryManagedLineageFields: ['founderPartnershipId', 'houseId'],
      registryManagedViewFields: ['focusPersonId', 'ancestorDepth', 'descendantDepth', 'limitGenerations', 'showSiblings'], ...extensions }
  };
}
