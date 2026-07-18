import { createFamilyGraph } from './family-graph.js';

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

  if (generationCount === 1 && !unresolvedTimeJumps.length && !options.skipTimeJumpOffer) {
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

  return Object.freeze({
    phase: 4,
    generationIndex: workingDepth,
    maximumGenerationIndex: generationCount,
    founderPartnershipId,
    openLeaves: findOpenLeaves(family, graph, unresolvedTimeJumps, workingDepth)
  });
}

function computeDepths(family, graph) {
  const childIds = new Set(family.parentages.map(parentage => parentage.childId));
  const roots = family.persons.filter(person => !childIds.has(person.id));
  const startPeople = roots.length ? roots : family.persons;
  const depth = new Map();
  const queue = startPeople.map(person => ({ personId: person.id, depth: 1 }));
  while (queue.length) {
    const current = queue.shift();
    if ((depth.get(current.personId) || 0) >= current.depth) continue;
    depth.set(current.personId, current.depth);
    graph.getChildren(current.personId).forEach(child => queue.push({ personId: child.id, depth: current.depth + 1 }));
  }
  return depth;
}

// Alle Personen der aktuellen Arbeitsgeneration (nach Tiefe, nicht nach
// Kinderzahl!) ohne bereits abschließenden Kadettenzweig (wegverheiratet/
// ausgestorben) an ihrer jüngsten Partnerschaft. Wer schon ein Kind hat, bleibt
// also im Arbeitsblatt sichtbar, solange die Generation nicht abgeschlossen wurde
// — sonst ließe sich einer Person immer nur ein einziges Kind zuordnen.
function findOpenLeaves(family, graph, unresolvedTimeJumps, workingDepth) {
  const depths = computeDepths(family, graph);
  const branchedPartnershipIds = new Set(family.cadetBranches.map(branch => branch.parentPartnershipId));
  const timeJumpByParentId = new Map();
  unresolvedTimeJumps.forEach(timeJump => {
    const anchorPartnership = timeJump.parentPartnershipId
      ? family.partnerships.find(item => item.id === timeJump.parentPartnershipId)
      : null;
    const parentIds = anchorPartnership
      ? anchorPartnership.participantIds
      : [timeJump.parentPersonId].filter(Boolean);
    parentIds.forEach(personId => timeJumpByParentId.set(personId, timeJump.id));
  });

  return family.persons
    .filter(person => {
      if ((depths.get(person.id) || 1) !== workingDepth) return false;
      const hasResolvedBranch = graph.getPartnerships(person.id)
        .some(partnership => branchedPartnershipIds.has(partnership.id));
      return !hasResolvedBranch;
    })
    .map(person => Object.freeze({
      personId: person.id,
      unresolvedTimeJumpId: timeJumpByParentId.get(person.id) || ''
    }));
}
