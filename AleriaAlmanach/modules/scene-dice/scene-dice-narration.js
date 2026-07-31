import {
  buildSceneDiceNarrationQuery,
  cleanSceneDiceNarration,
  enrichSceneDiceNarrationRetrieval,
  getSceneDiceOutcomeProfile
} from './scene-dice-narration-core.js';

async function generateSceneDiceNarration(roll = {}, options = {}) {
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
  const query = buildSceneDiceNarrationQuery({ roll, participant, snapshot, situation });
  const retrieval = await window.AleriaGptRetrieval.retrieve(query, {
    scope: snapshot.moduleId ? 'module' : 'all',
    moduleId: snapshot.moduleId || '',
    characterId: participant.id === '__narrator__' ? '' : participant.id,
    characterName: participant.id === '__narrator__' ? '' : participant.name,
    limit: 30
  });
  const enrichedRetrieval = enrichSceneDiceNarrationRetrieval(retrieval, {
    participant,
    snapshot,
    situation
  });
  const response = await window.AleriaGptClient.sendChat(query, enrichedRetrieval, {
    responseMode: 'scene-dice-narration',
    answerStyle: 'short',
    sourceLimit: 24,
    timeoutMs: 45000
  });
  if (!response.ok || !response.text) throw new Error('AleriaGPT hat keine Würfelbeschreibung geliefert.');
  const narration = cleanSceneDiceNarration(response.text);
  if (!narration) throw new Error('Die AleriaGPT-Antwort enthielt keinen Erzähltext.');
  return narration;
}

window.AleriaSceneDiceNarration = {
  generate: generateSceneDiceNarration,
  getOutcomeProfile: getSceneDiceOutcomeProfile
};
