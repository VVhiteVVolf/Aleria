function clean(value, maximum = 4000) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maximum);
}

function normalized(value) {
  return clean(value).toLocaleLowerCase('de-DE');
}

function getNarrativeEffectMode(resolution = {}) {
  const types = new Set((Array.isArray(resolution.effectResults) ? resolution.effectResults : [])
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

export function buildServerCombatNarration(resolution = {}) {
  const actor = clean(resolution.actorName, 160) || 'Die handelnde Figur';
  const target = clean(resolution.targetName, 160) || 'das Ziel';
  const attack = resolution.attack || {};
  if (resolution.actionType === 'channeling') {
    const progress = resolution.actorChannelingSnapshot?.after || {};
    return `${actor} kanalisiert ${clean(progress.actionName, 160) || 'die Wirkung'} weiter (${Number(progress.progress) || 0}/${Number(progress.requiredComments) || 0}).`;
  }
  const effectMode = getNarrativeEffectMode(resolution);
  if (effectMode === 'healing') return `${actor} lässt die bestätigte Heilwirkung bei ${target} wirksam werden.`;
  if (effectMode === 'temporary-hit-points') return `${actor} stärkt den Schutz von ${target} vorübergehend.`;
  if (effectMode === 'remove-condition') return `${actor} entfernt eine bestätigte Belastung von ${target}.`;
  if (effectMode === 'condition') return `${actor} lässt die bestätigte Wirkung auf ${target} einwirken.`;
  if (effectMode === 'summon') return `${actor} ruft die bestätigte Beschwörung in die Szene.`;
  if (effectMode === 'move') return `${actor} erzwingt eine Bewegung von ${target}; die Position bleibt erzählerisch.`;
  if (effectMode === 'interrupt') return `${actor} unterbricht die laufende Handlung von ${target}.`;
  if (attack.resolutionMode === 'saving-throw') {
    return attack.saveSucceeded
      ? `${target} widersteht der bestätigten Wirkung von ${actor}.`
      : `${target} kann der bestätigten Wirkung von ${actor} nicht widerstehen.`;
  }
  if (attack.criticalFailure) return `${actor} scheitert mit dem Angriff; ${target} wird nicht getroffen.`;
  if (!attack.hit) return `${actor} verfehlt ${target}.`;
  if (attack.criticalSuccess) return `${actor} erzielt einen kritischen Treffer gegen ${target}.`;
  return `${actor} trifft ${target}.`;
}

export function findCombatNarrationContradictions(resolution = {}, narrationText = '') {
  const text = normalized(narrationText);
  if (!text) return ['empty'];
  const attack = resolution.attack || {};
  const effectMode = getNarrativeEffectMode(resolution);
  const issues = [];
  if (/\b(?:stirbt|stirbt\s+sofort|tot|tötet|enthauptet|verblutet)\b/u.test(text)) issues.push('unconfirmed-death');
  if (/\b(?:flieht|ergibt\s+sich|wird\s+bewusstlos|verliert\s+das\s+bewusstsein)\b/u.test(text)) issues.push('unconfirmed-reaction');
  if (resolution.actionType === 'channeling' && /\b(?:trifft|verfehlt|schaden|heilt|verwundet)\b/u.test(text)) issues.push('premature-channel-effect');
  if (resolution.actionType !== 'channeling' && effectMode === 'attack' && attack.hit === false
    && /\b(?:trifft|verwundet|durchbohrt|zerschmettert)\b/u.test(text)
    && !/\b(?:trifft\s+nicht|nicht\s+getroffen|kein(?:en|e)?\s+treffer)\b/u.test(text)) {
    issues.push('miss-described-as-hit');
  }
  if (effectMode === 'attack' && attack.hit === true && /\b(?:verfehlt|geht\s+daneben|trifft\s+nicht)\b/u.test(text)) issues.push('hit-described-as-miss');
  const statedDamage = [...text.matchAll(/\b(\d{1,6})\s*(?:punkte?\s+)?schaden\b/gu)].map(match => Number(match[1]));
  if (statedDamage.some(amount => amount !== Number(resolution.damage?.total || 0))) issues.push('wrong-damage-total');
  return [...new Set(issues)];
}

export function validateCombatNarration(resolution = {}, narration = {}) {
  const text = clean(narration.text);
  const contradictions = findCombatNarrationContradictions(resolution, text);
  if (!contradictions.length) return {
    source: ['aleria-gpt', 'deterministic'].includes(narration.source) ? narration.source : 'deterministic',
    text,
    generatedAt: clean(narration.generatedAt, 80) || new Date().toISOString(),
    serverFactChecked: true,
    contradictions: []
  };
  return {
    source: 'deterministic-server',
    text: buildServerCombatNarration(resolution),
    generatedAt: new Date().toISOString(),
    serverFactChecked: true,
    contradictions
  };
}
