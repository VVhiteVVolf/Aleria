import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';

function placeholderFounder({ id, title, sex, houseId, familyRole }) {
  return {
    id,
    name: '???',
    title,
    sex,
    status: 'alive',
    birth: '',
    death: '',
    portrait: '',
    portraitPlaceholder: 'auto',
    houseId,
    familyRole,
    tags: ['Gründerfamilie'],
    notes: ''
  };
}

// Wie createBlankHouseFamily(), legt aber zusätzlich ein Platzhalter-Gründerpaar
// (Name "???", wie in tree-generator-suggestions.js) samt Gründerehe an, damit die
// Hausakte nicht komplett personenleer ist. Der silberne/eiserne Wappenrahmen richtet
// sich nach dem Rang (Ritterherr = Silber, Bürgerlich = Eisen), analog zu den bereits
// ausgearbeiteten Häusern (z. B. Balchder vs. Gwyllach/Sgrechiwr).
export function createFounderPlaceholderHouseFamily({
  id,
  title,
  emblem,
  houseProfile,
  description = 'Vorbereitete Familienakte mit Platzhalter-Gründerpaar.'
}) {
  const houseId = `house-${id.replace(/^haus-/, '')}`;
  const founderManId = `${id}-gruender`;
  const founderWomanId = `${id}-gruenderin`;
  const partnershipId = `marriage-${id}-founders`;
  const crestFrame = houseProfile.rankId === 'commoner' ? 'iron' : 'silver';
  return Object.freeze({
    schema: 'aleria.family-tree',
    schemaVersion: 1,
    document: { id, title, motto: '', description, emblem, houseProfile },
    houses: [
      { id: houseId, name: title, motto: '', emblem, status: 'active' }
    ],
    persons: [
      placeholderFounder({ id: founderManId, title: 'Gründer des Hauses', sex: 'male', houseId, familyRole: 'core' }),
      placeholderFounder({ id: founderWomanId, title: 'Gründerin des Hauses', sex: 'female', houseId, familyRole: 'married' })
    ],
    partnerships: [
      {
        id: partnershipId,
        participantIds: [founderManId, founderWomanId],
        type: 'marriage',
        status: 'active',
        start: '',
        end: '',
        certainty: 'confirmed',
        visibility: 'public',
        notes: 'Gründerehe des Hauses.'
      }
    ],
    parentages: [],
    lineage: {
      founderPartnershipId: partnershipId,
      houseId,
      crestSubtitle: '',
      crestEmblemScale: 0.86,
      crestFrame,
      crestFrameScale: 1,
      timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
    },
    cadetBranches: [],
    timeJumps: [],
    presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
    view: {
      focusPersonId: founderManId,
      orientation: 'vertical',
      ancestorDepth: 8,
      descendantDepth: 8,
      showSiblings: true
    },
    extensions: { blankFamily: true }
  });
}

// Vorbereitete Hausakte mit einem bewusst noch leeren, aber bereits seriell
// verankerten Überlieferungssprung. Der Trenner hängt ausschließlich unter dem
// Stammwappen des Gründerpaares; spätere bekannte Nachkommen werden über childIds
// ergänzt und dürfen niemals parallel zum Zeitsprung angelegt werden.
export function createFounderTimeJumpPlaceholderHouseFamily({
  id,
  title,
  emblem,
  houseProfile,
  description = 'Vorbereitete Familienakte mit Platzhalter-Gründerpaar und Überlieferungssprung.',
  toYear = '1600',
  timeJumpLabel = 'Überlieferung ab etwa 1600',
  pendingDescendantReview = false
}) {
  const base = createFounderPlaceholderHouseFamily({
    id,
    title,
    emblem,
    houseProfile,
    description
  });
  const timeJumpId = `gap-${id.replace(/^haus-/, '')}-to-${toYear}`;
  return Object.freeze({
    ...base,
    persons: Object.freeze(base.persons.map(person => Object.freeze({
      ...person,
      status: 'dead',
      death: '????',
      notes: 'Historische Gründerfigur vor dem Überlieferungssprung; Name und genaue Lebensdaten sind noch nicht belegt.'
    }))),
    timeJumps: Object.freeze([
      Object.freeze({
        id: timeJumpId,
        parentPartnershipId: base.lineage.founderPartnershipId,
        parentPersonId: '',
        childIds: Object.freeze([]),
        years: 0,
        fromYear: '????',
        toYear: String(toYear),
        label: timeJumpLabel,
        notes: 'Der Zeitsprung ist der alleinige absolute Generationentrenner unter dem Hauswappen. Bekannte Nachkommen werden später ausschließlich hinter diesem Knoten ergänzt.',
        extensions: Object.freeze({ preparedPlaceholder: true })
      })
    ]),
    extensions: Object.freeze({
      ...base.extensions,
      preparedTimeJump: true,
      pendingDescendantReview: Boolean(pendingDescendantReview)
    })
  });
}

// Variante für bereits erloschene Häuser: dasselbe Platzhalter-Gründerpaar, aber mit
// einem sofort angehängten Ausgestorben-Knoten (wie createExtinctBranch() in
// family-record-builders.js) an der Gründerehe, damit das Erlöschen von Anfang an
// sichtbar ist, statt es wie eine gewöhnliche noch fortbestehende Linie wirken zu lassen.
export function createExtinctPlaceholderHouseFamily({
  id,
  title,
  emblem,
  houseProfile,
  description = 'Vorbereitete Familienakte eines erloschenen Hauses.'
}) {
  const base = createFounderPlaceholderHouseFamily({ id, title, emblem, houseProfile, description });
  const branchId = `extinct-${id}`;
  return Object.freeze({
    ...base,
    cadetBranches: [
      {
        id: branchId,
        name: 'Ausgestorben',
        subtitle: 'Die Linie endet hier',
        linkType: 'line-extinct',
        parentPartnershipId: base.lineage.founderPartnershipId,
        houseId: base.lineage.houseId,
        emblem: '',
        emblemScale: 0.86,
        crestFrame: 'gold',
        frameScale: 1,
        founded: '',
        targetFamilyId: '',
        notes: 'Die Linie ist ohne bekannte Nachkommen erloschen.',
        extensions: {}
      }
    ]
  });
}

export function createBlankHouseFamily({
  id,
  title,
  emblem,
  houseProfile,
  description = 'Vorbereitete, noch nicht ausgefüllte Familienakte.'
}) {
  const houseId = `house-${id.replace(/^haus-/, '')}`;
  return Object.freeze({
    schema: 'aleria.family-tree',
    schemaVersion: 1,
    document: { id, title, motto: '', description, emblem, houseProfile },
    houses: [
      { id: houseId, name: title, motto: '', emblem, status: 'active' }
    ],
    persons: [],
    partnerships: [],
    parentages: [],
    lineage: {
      founderPartnershipId: '',
      houseId,
      crestSubtitle: '',
      crestEmblemScale: 0.86,
      crestFrame: 'gold',
      crestFrameScale: 1,
      timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
    },
    cadetBranches: [],
    timeJumps: [],
    presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
    view: {
      focusPersonId: '',
      orientation: 'vertical',
      ancestorDepth: 8,
      descendantDepth: 8,
      showSiblings: true
    },
    extensions: { blankFamily: true }
  });
}
