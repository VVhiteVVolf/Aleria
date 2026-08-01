import {
  buildSceneDiceNarrationQuery,
  cleanSceneDiceNarration,
  enrichSceneDiceNarrationRetrieval,
  getSceneDiceOutcomeProfile
} from './scene-dice-narration-core.js';
import {
  createSceneDiceStandardNarration,
  findSceneDiceMechanicsLeaks,
  getSceneDiceNarrationMode,
  getSceneDiceNarrationModes,
  normalizeSceneDiceNarrationMode
} from './scene-dice-narration-policy.js';

function buildSceneDiceRepairQuery(narration, roll = {}) {
  const actor = String(roll.roller || 'die Figur').trim();
  return [
    'Überarbeite den folgenden Szenentext sofort zu reiner In-World-Erzählung.',
    'Entferne jede Erwähnung von Würfel, Wurf, Ergebnis, Zahlenwert, Formel und Erfolgsstufe vollständig.',
    `Behalte nur die beobachtbare, zum Kontext passende Folge für ${actor}. Keine Analyse, keine erfundenen Gedanken oder verborgenen Fakten.`,
    'Nutze weiterhin den gelieferten Szenen-, Figuren- und Almanach-Kontext.',
    `Zu überarbeiten: ${String(narration || '').slice(0, 650)}`,
    'Ausgabe: ausschließlich der neue Text in 1–3 natürlichen Sätzen, höchstens 500 Zeichen.'
  ].join('\n').slice(0, 1180);
}

async function sendSceneDiceNarrationRequest(query, retrieval, mode) {
  return window.AleriaGptClient.sendChat(query, retrieval, {
    responseMode: `scene-dice-narration-${mode}`,
    answerStyle: 'short',
    sourceLimit: 24,
    timeoutMs: 45000
  });
}

async function generateSceneDiceNarration(roll = {}, options = {}) {
  const narrationMode = normalizeSceneDiceNarrationMode(roll.narrationMode);
  const mode = getSceneDiceNarrationMode(narrationMode);
  if (narrationMode === 'simple') return '';
  if (!mode.usesAi) return createSceneDiceStandardNarration(roll, roll.roller);
  if (!window.AleriaGptClient?.isConfigured?.()) {
    throw new Error('AleriaGPT ist in dieser Umgebung nicht verbunden.');
  }
  if (!window.AleriaGptRetrieval?.retrieve) {
    throw new Error('Der AleriaGPT-Kontext ist noch nicht geladen.');
  }

  const participants = window.AleriaSceneDiceParticipants;
  if (!participants) throw new Error('Der Szenenkontext ist noch nicht geladen.');
  let snapshot = participants.getSnapshot?.();
  if (!snapshot) snapshot = await participants.refresh();
  const currentParticipant = participants.getSelection?.();
  const participant = currentParticipant && String(currentParticipant.name || '') === String(roll.roller || '')
    ? currentParticipant
    : { id: roll.rollerId || '', name: roll.roller || 'Die Szene' };
  const situation = String(options.situation || roll.situation || '').trim().slice(0, 900);
  const contextualRoll = { ...roll, narrationMode };
  const query = buildSceneDiceNarrationQuery({ roll: contextualRoll, participant, snapshot, situation });
  const retrieval = await window.AleriaGptRetrieval.retrieve(query, {
    scope: snapshot.moduleId ? 'module' : 'all',
    moduleId: snapshot.moduleId || '',
    characterId: participant.id === '__narrator__' ? '' : participant.id,
    characterName: participant.id === '__narrator__' ? '' : participant.name,
    limit: 30
  });
  const enrichedRetrieval = enrichSceneDiceNarrationRetrieval(retrieval, {
    roll: contextualRoll,
    participant,
    snapshot,
    situation
  });
  const response = await sendSceneDiceNarrationRequest(query, enrichedRetrieval, narrationMode);
  if (!response.ok || !response.text) throw new Error('AleriaGPT hat keine Würfelbeschreibung geliefert.');
  let narration = cleanSceneDiceNarration(response.text);
  if (!narration) throw new Error('Die AleriaGPT-Antwort enthielt keinen Erzähltext.');

  if (findSceneDiceMechanicsLeaks(narration, contextualRoll).length) {
    const repairQuery = buildSceneDiceRepairQuery(narration, contextualRoll);
    const repaired = await sendSceneDiceNarrationRequest(repairQuery, enrichedRetrieval, narrationMode);
    narration = cleanSceneDiceNarration(repaired?.text || '');
    if (!repaired?.ok || !narration || findSceneDiceMechanicsLeaks(narration, contextualRoll).length) {
      throw new Error('AleriaGPT hat die Würfelmechanik nicht zuverlässig aus dem Erzähltext entfernt.');
    }
  }
  return narration;
}

window.AleriaSceneDiceNarration = {
  generate: generateSceneDiceNarration,
  getOutcomeProfile: getSceneDiceOutcomeProfile,
  getModes: getSceneDiceNarrationModes,
  getMode: getSceneDiceNarrationMode,
  normalizeMode: normalizeSceneDiceNarrationMode,
  createStandard: createSceneDiceStandardNarration,
  findMechanicsLeaks: findSceneDiceMechanicsLeaks
};
