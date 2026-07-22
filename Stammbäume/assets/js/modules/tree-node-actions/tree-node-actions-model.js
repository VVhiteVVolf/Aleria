import {
  resolveAnchorGenerationDepth,
  resolveFamilyGenerationDepths
} from '../../domain/family-generation-depth.js';

const NODE_ACTIONS = Object.freeze({
  editHouse: Object.freeze({ id: 'edit-house', glyph: '⚙', label: 'Haus bearbeiten', hint: 'Gründerpaar, Wappen und Darstellung dieses Hausknotens ändern' }),
  continueHouse: Object.freeze({ id: 'continue-house', glyph: '↓', label: 'Linie fortsetzen', hint: 'Direkte Nachkommen oder einen Zeitsprung unter diesem Haus anlegen' }),
  addDirect: Object.freeze({ id: 'add-direct', glyph: '✦', label: 'Direkte Nachkommen', hint: 'Ohne Zeitsprung mit der nächsten Generation beginnen' }),
  addGap: Object.freeze({ id: 'add-gap', glyph: '⌛', label: 'Zeitsprung einfügen', hint: 'Eine absolute Generationsbarriere direkt unter dem Hauswappen anlegen' }),
  editGap: Object.freeze({ id: 'edit-gap', glyph: '⚙', label: 'Zeitsprung bearbeiten', hint: 'Beschriftung und Zeitraum des vorhandenen Trenners ändern' }),
  addAfterGap: Object.freeze({ id: 'add-after-gap', glyph: '✦', label: 'Nachkommen hinzufügen', hint: 'Die erste bekannte Generation unter dem Zeitsprung weiterführen' }),
  back: Object.freeze({ id: 'back', glyph: '‹', label: 'Zurück', hint: 'Zur ersten Auswahl zurückkehren' })
});

export function findLineageBarrier(family, partnershipId = family.lineage.founderPartnershipId) {
  const partnershipById = new Map(family.partnerships.map(partnership => [partnership.id, partnership]));
  const partnership = partnershipById.get(partnershipId);
  const generationDepths = resolveFamilyGenerationDepths(family);
  const targetDepth = resolveAnchorGenerationDepth(partnership?.participantIds || [], generationDepths);
  const founderPartnership = partnershipById.get(family.lineage.founderPartnershipId);
  const founderDepth = resolveAnchorGenerationDepth(founderPartnership?.participantIds || [], generationDepths);
  if (family.lineage.timeGap.enabled && targetDepth !== null && targetDepth === founderDepth) {
    return Object.freeze({ kind: 'lineage-gap', id: '' });
  }
  const timeJump = [...family.timeJumps]
    .sort((first, second) => first.id.localeCompare(second.id, 'de'))
    .find(item => {
      const anchorIds = partnershipById.get(item.parentPartnershipId)?.participantIds
        || (item.parentPersonId ? [item.parentPersonId] : []);
      return targetDepth !== null
        && resolveAnchorGenerationDepth(anchorIds, generationDepths) === targetDepth;
    });
  return timeJump ? Object.freeze({ kind: 'time-jump', id: timeJump.id }) : null;
}

export function primaryNodeActions(kind) {
  if (kind === 'house-crest') return Object.freeze([NODE_ACTIONS.editHouse, NODE_ACTIONS.continueHouse]);
  if (kind === 'time-jump' || kind === 'lineage-gap') {
    return Object.freeze([NODE_ACTIONS.editGap, NODE_ACTIONS.addAfterGap]);
  }
  return Object.freeze([]);
}

export function houseContinuationActions(family, partnershipId) {
  const barrier = findLineageBarrier(family, partnershipId);
  return barrier
    ? Object.freeze([NODE_ACTIONS.addAfterGap, NODE_ACTIONS.editGap, NODE_ACTIONS.back])
    : Object.freeze([NODE_ACTIONS.addDirect, NODE_ACTIONS.addGap, NODE_ACTIONS.back]);
}
