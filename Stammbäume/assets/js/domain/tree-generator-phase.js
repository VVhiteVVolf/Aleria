import { createFamilyGraph } from './family-graph.js';
import { resolveFamilyGenerationDepths } from './family-generation-depth.js';

// Leitet rein aus dem aktuellen Familiendokument ab, in welcher Etappe sich der
// Stammbaum-Generator gerade befindet. Es gibt bewusst kein persistiertes
// "aktuelle Phase"-Feld — jeder Aufruf inspiziert den lebenden Baum neu, damit der
// Assistent auch dann korrekt fortsetzt, wenn der Baum zwischenzeitlich anders
// bearbeitet wurde (z. B. über den klassischen "＋ Neue Familie"-Dialog, die
// Beziehungsaktionen oder einen JSON-Import).
//
// options.skipTimeJumpOffer und options.currentGenerationDepth sind bewusst nur
// lokaler UI-Zustand der aktuell offenen Assistenten-Sitzung (siehe Controller),
// kein persistiertes Feld: schließt der User den Assistenten ohne weiterzuklicken,
// wird beim nächsten Öffnen wieder der aus den Daten ableitbare Standard verwendet.
export function deriveTreeGeneratorPhase(family, options = {}) {
  if (!family.persons.length) {
    // Eine über Phase 1 des Generators angelegte Akte trägt bereits ein
    // extensions.generatorProfile-Objekt (auch wenn alle Felder noch leer sind);
    // eine wirklich unberührte Akte (createEmptyFamily()) hat keins. Damit lässt
    // sich "ganz frisch" von "Phase 1 schon erledigt, noch kein Gründerpaar"
    // unterscheiden, obwohl beide Zustände persons.length === 0 haben.
    const hasProfileDraft = family.extensions
      && typeof family.extensions.generatorProfile === 'object'
      && family.extensions.generatorProfile !== null;
    return hasProfileDraft ? Object.freeze({ phase: 2 }) : Object.freeze({ phase: 1 });
  }

  const founderPartnershipId = family.lineage.founderPartnershipId;
  const founderPartnership = founderPartnershipId
    ? family.partnerships.find(item => item.id === founderPartnershipId)
    : null;
  if (!founderPartnership) {
    return Object.freeze({ phase: 2 });
  }

  const graph = createFamilyGraph(family);
  const generationCount = graph.getGenerationCount();

  // Ein Zeitsprung gilt als "offen"/unaufgelöst, solange ihm noch kein einziges
  // Kind zugeordnet wurde (childIds leer).
  const unresolvedTimeJumps = family.timeJumps.filter(item => !item.childIds || item.childIds.length === 0);

  if (
    generationCount === 1
    && !unresolvedTimeJumps.length
    && !family.lineage.timeGap.enabled
    && !options.skipTimeJumpOffer
  ) {
    return Object.freeze({ phase: 3, founderPartnershipId });
  }

  // Die Arbeitsgeneration bleibt innerhalb einer Sitzung auf der vom Controller
  // übergebenen Tiefe stehen (statt bei jedem neu hinzugefügten Kind automatisch
  // eine Ebene tiefer zu springen) — nur so lassen sich mehrere Kinder/Zwillinge
  // für dieselbe Person anlegen, bevor die Generation bewusst abgeschlossen wird.
  // Ohne Vorgabe (frisches Öffnen) wird die tiefste bereits erreichte Ebene gewählt.
  const workingDepth = Number.isInteger(options.currentGenerationDepth)
    ? Math.max(1, Math.min(options.currentGenerationDepth, generationCount))
    : generationCount;
  const openLeaves = findOpenLeaves(family, family.timeJumps, workingDepth);

  return Object.freeze({
    phase: 4,
    generationIndex: workingDepth,
    maximumGenerationIndex: generationCount,
    canAdvance: generationCount > workingDepth,
    canFinish: openLeaves.length === 0,
    founderPartnershipId,
    openLeaves
  });
}

export function deriveFocusedContinuationPhase(family, options = {}) {
  const graph = createFamilyGraph(family);
  const depths = computeDepths(family);
  const timeJump = options.timeJumpId
    ? family.timeJumps.find(item => item.id === options.timeJumpId)
    : null;
  const partnershipId = timeJump?.parentPartnershipId || options.partnershipId || '';
  const partnership = partnershipId
    ? family.partnerships.find(item => item.id === partnershipId)
    : null;
  const anchorIds = partnership?.participantIds
    || (timeJump?.parentPersonId ? [timeJump.parentPersonId] : []);
  const referencePersonId = anchorIds[0] || '';
  if (!referencePersonId) throw new Error('Der Ausgangspunkt für die nächste Generation wurde nicht gefunden.');
  const followsLineageGap = !timeJump
    && partnershipId === family.lineage.founderPartnershipId
    && family.lineage.timeGap.enabled;
  const existingContinuationIds = timeJump
    ? [...timeJump.childIds]
    : family.parentages
      .filter(parentage => parentage.partnershipId === partnershipId)
      .map(parentage => parentage.childId);
  const anchorDepth = Math.max(...anchorIds.map(personId => depths.get(personId) || 1));
  return Object.freeze({
    phase: 4,
    generationIndex: anchorDepth,
    maximumGenerationIndex: graph.getGenerationCount(),
    canAdvance: false,
    focusedContinuation: true,
    continuationKind: timeJump ? 'time-jump' : followsLineageGap ? 'lineage-gap' : 'lineage',
    continuationTitle: timeJump || followsLineageGap
      ? 'Erste Generation nach dem Zeitsprung'
      : 'Nachkommen unter dem Hauswappen',
    existingContinuationIds: Object.freeze([...new Set(existingContinuationIds)]),
    openLeaves: Object.freeze([Object.freeze({
      lineId: timeJump
        ? `time-jump:${timeJump.id}`
        : followsLineageGap
          ? `lineage-gap:${partnershipId}`
          : `partnership:${partnershipId}`,
      personId: referencePersonId,
      partnershipId,
      unresolvedTimeJumpId: timeJump?.id || '',
      afterTimeBarrier: Boolean(timeJump || followsLineageGap),
      continuationYear: continuationYear(timeJump || (followsLineageGap ? family.lineage.timeGap : null)),
      continuationMode: true
    })])
  });
}

function continuationYear(timeGap) {
  if (!timeGap) return '';
  if (/^\d{1,4}$/.test(String(timeGap.toYear || ''))) return String(timeGap.toYear);
  if (/^\d{1,4}$/.test(String(timeGap.fromYear || '')) && Number(timeGap.years) > 0) {
    return String(Number(timeGap.fromYear) + Number(timeGap.years));
  }
  return '';
}

function computeDepths(family) {
  return new Map([...resolveFamilyGenerationDepths(family)]
    .map(([personId, depth]) => [personId, depth + 1]));
}

// Jede offene Fortsetzungslinie erscheint genau einmal: aktive Ehepaare teilen
// sich eine Arbeitskarte, Einzelpersonen behalten eine eigene. Wer schon ein Kind
// hat, bleibt sichtbar, bis die Generation bewusst abgeschlossen wird.
function findOpenLeaves(family, timeJumps, workingDepth) {
  const depths = computeDepths(family);
  const branchedPartnershipIds = new Set(family.cadetBranches.map(branch => branch.parentPartnershipId));
  const timeJumpByPartnershipId = new Map();
  const timeJumpByPersonId = new Map();
  timeJumps.forEach(timeJump => {
    if (timeJump.parentPartnershipId) {
      timeJumpByPartnershipId.set(timeJump.parentPartnershipId, timeJump);
    } else if (timeJump.parentPersonId) {
      timeJumpByPersonId.set(timeJump.parentPersonId, timeJump);
    }
  });

  const candidates = family.persons.filter(person => (depths.get(person.id) || 1) === workingDepth);
  const candidateIds = new Set(candidates.map(person => person.id));
  const representedPersonIds = new Set();
  const leaves = [];

  family.partnerships
    .filter(partnership => (
      ['marriage', 'union'].includes(partnership.type)
      && ['active', 'secret', 'widowed'].includes(partnership.status)
    ))
    .forEach(partnership => {
      const participants = partnership.participantIds
        .map(personId => family.persons.find(person => person.id === personId))
        .filter(person => person && candidateIds.has(person.id));
      if (participants.length < 2) return;
      participants.forEach(person => representedPersonIds.add(person.id));
      if (branchedPartnershipIds.has(partnership.id)) return;
      const representative = [...participants].sort((first, second) => (
        Number(first.familyRole === 'married') - Number(second.familyRole === 'married')
        || first.id.localeCompare(second.id, 'de')
      ))[0];
      const timeJump = timeJumpByPartnershipId.get(partnership.id);
      leaves.push(Object.freeze({
        lineId: `partnership:${partnership.id}`,
        personId: representative.id,
        partnershipId: partnership.id,
        unresolvedTimeJumpId: timeJump?.id || '',
        afterTimeBarrier: Boolean(timeJump),
        continuationYear: continuationYear(timeJump)
      }));
    });

  candidates.forEach(person => {
    if (representedPersonIds.has(person.id)) return;
    const timeJump = timeJumpByPersonId.get(person.id);
    leaves.push(Object.freeze({
      lineId: `person:${person.id}`,
      personId: person.id,
      partnershipId: '',
      unresolvedTimeJumpId: timeJump?.id || '',
      afterTimeBarrier: Boolean(timeJump),
      continuationYear: continuationYear(timeJump)
    }));
  });

  return Object.freeze(leaves);
}
