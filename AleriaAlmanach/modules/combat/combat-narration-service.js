function getNarrativeEffectMode(facts = {}) {
  const types = new Set((Array.isArray(facts.effectResults) ? facts.effectResults : [])
    .filter(result => result?.applied !== false)
    .map(result => String(result?.effect?.type || '')));
  if (types.has('damage')) return 'damage';
  if (types.has('healing')) return 'healing';
  if (types.has('temporary-hit-points')) return 'temporary-hit-points';
  if (types.has('remove-condition')) return 'remove-condition';
  if (types.has('apply-condition') || types.has('buff') || types.has('debuff')) return 'condition';
  if (types.has('summon')) return 'summon';
  if (types.has('move')) return 'move';
  if (types.has('interrupt')) return 'interrupt';
  return 'attack';
}

function fallbackNarration(facts = {}) {
  if (facts.attack?.resolutionMode === 'channeling') {
    const progress = facts.actorChannelingSnapshot?.after;
    return `${facts.actor} kanalisiert ${progress?.actionName || 'die Wirkung'} weiter (${progress?.progress || 0}/${progress?.requiredComments || 0}).`;
  }
  if (facts.attack?.resolutionMode === 'saving-throw') {
    return facts.attack.saveSucceeded
      ? `${facts.target} widersteht der Wirkung von ${facts.actor}${facts.damage ? ', wird jedoch noch gestreift' : ''}.`
      : `${facts.target} kann der Wirkung von ${facts.actor} nicht widerstehen.`;
  }
  const effectMode = getNarrativeEffectMode(facts);
  if (effectMode === 'healing') return `${facts.actor} lässt die heilende Wirkung bei ${facts.target} wirksam werden.`;
  if (effectMode === 'temporary-hit-points') return `${facts.actor} stärkt den Schutz von ${facts.target} vorübergehend.`;
  if (effectMode === 'remove-condition') return `${facts.actor} löst eine belastende Wirkung von ${facts.target}.`;
  if (effectMode === 'condition') return `${facts.actor} lässt die vorbereitete Wirkung auf ${facts.target} einwirken.`;
  if (effectMode === 'summon') return `${facts.actor} ruft die vorbereitete Beschwörung in die Szene.`;
  if (effectMode === 'move') return `${facts.actor} erzwingt eine Bewegung von ${facts.target}; die genaue Position bleibt erzählerisch.`;
  if (effectMode === 'interrupt') return `${facts.actor} unterbricht die laufende Handlung von ${facts.target}.`;
  if (facts.criticalFailure) return `${facts.actor} setzt zum Angriff an, doch ${facts.target} entgeht dem Versuch vollständig.`;
  if (!facts.hit) return `${facts.target} entzieht sich dem Angriff von ${facts.actor}, bevor ${facts.weapon || 'die Waffe'} Wirkung entfalten kann.`;
  if (facts.critical) return `${facts.actor} findet eine seltene Öffnung. Der Angriff mit ${facts.weapon || 'der Waffe'} trifft ${facts.target} mit außergewöhnlicher Präzision.`;
  return `${facts.actor} überwindet die Verteidigung von ${facts.target}; ${facts.weapon || 'der Angriff'} trifft wirksam.`;
}

function cleanNarration(value) {
  return String(value || '')
    .replace(/^```(?:\w+)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .replace(/^\s*(?:Erzähltext|Beschreibung)\s*:\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 700);
}

function enrichCombatNarrationRetrieval(retrieval = {}, facts = {}) {
  const combatContext = [
    'VERBINDLICHE KAMPFPROFIL-SNAPSHOTS',
    JSON.stringify({
      actorCombatProfile: facts.actorCombatProfile || null,
      targetCombatProfile: facts.targetCombatProfile || null,
      confirmedOutcome: {
        attack: facts.attack || null,
        damage: facts.damageRoll || null,
        targetSnapshot: facts.targetSnapshot || null,
        actorResourceSnapshot: facts.actorResourceSnapshot || null,
        actorAbilitySnapshot: facts.actorAbilitySnapshot || null,
        actorInventorySnapshot: facts.actorInventorySnapshot || null,
        actorHitPointSnapshot: facts.actorHitPointSnapshot || null,
        actorConditionSnapshot: facts.actorConditionSnapshot || null,
        abilityUse: facts.abilityUse || null,
        auraContext: facts.auraContext || null,
        ruleApplications: facts.ruleApplications || [],
        ruleResourceSnapshots: facts.ruleResourceSnapshots || [],
        ruleAbilitySnapshots: facts.ruleAbilitySnapshots || [],
        secondarySaves: facts.secondarySaves || [],
        followUpAttacks: facts.followUpAttacks || [],
        targetConditionSnapshot: facts.targetConditionSnapshot || null,
        targetResourceSnapshot: facts.targetResourceSnapshot || null,
        effectResults: facts.effectResults || [],
        ruleConflicts: facts.ruleConflicts || [],
        actorChannelingSnapshot: facts.actorChannelingSnapshot || null,
        actorConcentrationSnapshot: facts.actorConcentrationSnapshot || null,
        targetConcentrationSnapshot: facts.targetConcentrationSnapshot || null
      }
    }, null, 2)
  ].join('\n');
  return {
    ...(retrieval || {}),
    promptContext: [combatContext, retrieval?.promptContext || ''].filter(Boolean).join('\n\n--- Weitere Almanach-Treffer ---\n\n'),
    chunks: [{
      sourceType: 'combat-profile-snapshots',
      sourceRef: `combat-resolution:${facts.actorId || 'actor'}:${facts.targetId || 'target'}`,
      moduleId: '',
      moduleTitle: '',
      pageTitle: '',
      speakerName: facts.actor || '',
      kind: 'required-combat-profile-snapshots',
      score: 10002,
      text: combatContext
    }, ...(retrieval?.chunks || []).filter(chunk => chunk?.sourceType !== 'combat-profile-snapshots')],
    stats: { ...(retrieval?.stats || {}), requiredCombatProfilesIncluded: true }
  };
}

function buildCombatNarrationQuery(facts = {}) {
  const instructions = [
    'Schreibe 1–3 kurze, immersive Sätze als neutraler Erzähler über die bestätigte Folge dieser Kampfhandlung.',
    'Die Fakten sind unveränderlich. Erfinde keinen weiteren Angriff, keine Flucht, Verstümmelung, Bewusstlosigkeit, dauerhafte Verletzung oder Tod.',
    'Berücksichtige relevante Attribute, Zustände, Marotten, Ausrüstung, Ressourcen, Fähigkeiten, Magie und Notizen aus dem Pflichtkontext. Strukturierte Modifikatoren sind bereits verrechnet und dürfen nicht doppelt zählen.',
    'Greife Stil und Absicht der Kampfbeschreibung auf, ohne deren behauptetes Ergebnis zu übernehmen. Nenne keine Würfel, Formeln oder Zahlen. Ausgabe nur als Erzählertext.'
  ].join('\n');
  const payload = {
    actor: facts.actor,
    target: facts.target,
    weapon: facts.weapon,
    hit: facts.hit,
    critical: facts.critical,
    criticalFailure: facts.criticalFailure,
    damage: facts.damage,
    resolutionMode: facts.attack?.resolutionMode || 'weapon-attack',
    saveSucceeded: facts.attack?.saveSucceeded ?? null,
    targetHitPointsAfter: facts.targetSnapshot?.hitPointsAfter ?? null,
    targetMaximumHitPoints: facts.targetSnapshot?.maximumHitPoints ?? null,
    temporaryHitPointsBefore: facts.targetSnapshot?.temporaryHitPointsBefore ?? 0,
    temporaryHitPointsAfter: facts.targetSnapshot?.temporaryHitPointsAfter ?? 0,
    temporaryHitPointsAbsorbed: facts.targetSnapshot?.damageAbsorbedByTemporaryHitPoints ?? 0,
    abilityUse: facts.abilityUse?.name || '',
    appliedRules: (facts.ruleApplications || []).slice(0, 8).map(rule =>
      [rule.sourceActorName || '', rule.ruleName || '', rule.phase || '']),
    secondarySaves: (facts.secondarySaves || []).map(save => ({
      attribute: save.attributeKey || '',
      dc: Number(save.dc) || 0,
      total: Number(save.total) || 0,
      succeeded: !!save.succeeded
    })),
    followUps: (facts.followUpAttacks || []).map(followUp => ({
      hit: !!followUp.attack?.hit,
      critical: !!followUp.attack?.criticalSuccess,
      damage: Number(followUp.damage?.total) || 0
    })),
    conditionsAfter: (facts.targetConditionSnapshot?.after || []).map(condition => condition.name || condition.id || ''),
    resourcesChanged: (facts.targetResourceSnapshot?.after || []).map(resource =>
      [resource.name || resource.id || '', Number(resource.current) || 0]),
    effects: (facts.effectResults || []).map(result => ({
      type: result.effect?.type || '',
      amount: Number(result.amount) || 0,
      applied: result.applied !== false
    })),
    ruleConflictCount: (facts.ruleConflicts || []).length,
    channeling: facts.actorChannelingSnapshot?.after || null,
    actorConcentration: facts.actorConcentrationSnapshot?.after || null,
    targetConcentration: facts.targetConcentrationSnapshot?.after || null,
    targetChanneling: facts.targetChannelingSnapshot?.after || null,
    defeat: facts.defeat || null,
    originalDescription: ''
  };
  const prefix = `${instructions}\nBestätigte Fakten: `;
  const emptyPayload = JSON.stringify(payload);
  const availableDescriptionLength = Math.max(0, 1180 - prefix.length - emptyPayload.length);
  payload.originalDescription = String(facts.originalDescription || '').slice(0, availableDescriptionLength);
  let query = `${prefix}${JSON.stringify(payload)}`;
  while (query.length > 1180 && payload.originalDescription) {
    payload.originalDescription = payload.originalDescription.slice(0, Math.max(0, payload.originalDescription.length - (query.length - 1180) - 1));
    query = `${prefix}${JSON.stringify(payload)}`;
  }
  if (query.length > 1180) {
    const compactPayload = {
      actor: payload.actor,
      target: payload.target,
      weapon: payload.weapon,
      hit: payload.hit,
      critical: payload.critical,
      criticalFailure: payload.criticalFailure,
      damage: payload.damage,
      resolutionMode: payload.resolutionMode,
      saveSucceeded: payload.saveSucceeded,
      targetHitPointsAfter: payload.targetHitPointsAfter,
      targetMaximumHitPoints: payload.targetMaximumHitPoints,
      appliedRules: payload.appliedRules,
      secondarySaves: payload.secondarySaves,
      followUps: payload.followUps,
      conditionsAfter: payload.conditionsAfter,
      effects: payload.effects,
      defeat: payload.defeat,
      originalDescription: ''
    };
    query = `${prefix}${JSON.stringify(compactPayload)}`;
  }
  return query;
}

export async function narrateCombatResolution(facts = {}) {
  const fallback = fallbackNarration(facts);
  if (!globalThis.AleriaGptClient?.isConfigured?.() || !globalThis.AleriaGptRetrieval?.retrieve) {
    return { text: fallback, source: 'deterministic', reason: 'aleria-gpt-unavailable' };
  }
  try {
    const query = buildCombatNarrationQuery(facts);
    const retrieval = await globalThis.AleriaGptRetrieval.retrieve(query, {
      scope: 'module',
      characterId: facts.actorId || '',
      limit: 20
    });
    const enrichedRetrieval = enrichCombatNarrationRetrieval(retrieval, facts);
    const response = await globalThis.AleriaGptClient.sendChat(query, enrichedRetrieval, {
      responseMode: 'combat-resolution-narration-v2',
      answerStyle: 'short',
      sourceLimit: 20,
      timeoutMs: 45000
    });
    const text = cleanNarration(response?.text);
    return response?.ok && text
      ? { text, source: 'aleria-gpt' }
      : { text: fallback, source: 'deterministic', reason: response?.ok ? 'empty-response' : 'request-rejected' };
  } catch (error) {
    return {
      text: fallback,
      source: 'deterministic',
      reason: error?.name === 'AbortError' ? 'request-timeout' : 'request-failed'
    };
  }
}

export const combatNarrationInternals = Object.freeze({
  fallbackNarration,
  getNarrativeEffectMode,
  cleanNarration,
  enrichCombatNarrationRetrieval,
  buildCombatNarrationQuery
});
