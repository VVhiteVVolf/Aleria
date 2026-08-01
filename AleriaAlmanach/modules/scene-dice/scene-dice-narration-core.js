import {
  getSceneDiceHumorInstruction,
  getSceneDiceNarrationMode,
  getSceneDiceNarrationModeInstruction,
  getSceneDiceRolledValue,
  normalizeSceneDiceNarrationMode
} from './scene-dice-narration-policy.js';

function cleanNarrationField(value, maxLength = 14000) {
  return String(value || '').trim().slice(0, maxLength);
}

function truncateNarrationFieldAtWord(value, maxLength) {
  const text = String(value || '').trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, Math.max(0, maxLength)).replace(/\s+\S*$/, '').trim();
}

function getPrimaryDiceTerm(roll = {}) {
  return (Array.isArray(roll.terms) ? roll.terms : []).find(term => term?.kind === 'dice') || null;
}

export function getSceneDiceOutcomeProfile(roll = {}) {
  const natural = Number(roll.natural);
  const primaryTerm = getPrimaryDiceTerm(roll);
  const primarySides = Number(primaryTerm?.sides) || 0;
  let ratio = null;
  if (Number.isFinite(natural) && natural > 0 && primarySides > 0) {
    ratio = natural / primarySides;
  } else if (Array.isArray(roll.keptDice) && roll.keptDice.length && primarySides > 0) {
    const keptTotal = roll.keptDice.map(Number).filter(Number.isFinite).reduce((sum, value) => sum + value, 0);
    ratio = keptTotal / (roll.keptDice.length * primarySides);
  }

  const bounded = Number.isFinite(ratio) ? Math.max(0, Math.min(1, ratio)) : 0.5;
  const label = bounded <= 0.2
    ? 'sehr niedrig'
    : bounded <= 0.4
      ? 'niedrig'
      : bounded <= 0.6
        ? 'durchwachsen'
        : bounded <= 0.8
          ? 'hoch'
          : 'sehr hoch';
  return {
    ratio: bounded,
    label,
    natural: Number.isFinite(natural) && natural > 0 ? natural : null,
    total: Number(roll.total) || 0,
    primarySides
  };
}

export function buildSceneDiceNarrationQuery({ roll = {}, participant = {}, situation = '' } = {}) {
  const outcome = getSceneDiceOutcomeProfile(roll);
  const actorName = cleanNarrationField(participant.name || roll.roller || 'Die Szene', 60);
  const purpose = cleanNarrationField(roll.purpose || 'allgemeine Probe', 100);
  const sceneSituation = cleanNarrationField(situation || roll.situation || '', 900);
  const narrationMode = normalizeSceneDiceNarrationMode(roll.narrationMode);
  const mode = getSceneDiceNarrationMode(narrationMode);
  const humorInstruction = getSceneDiceHumorInstruction({ ...roll, outcomeRatio: outcome.ratio }, roll.humorEnabled === true);
  const resultLine = outcome.natural !== null
    ? `${outcome.natural} auf W${outcome.primarySides}; Gesamtergebnis ${outcome.total}`
    : `Gesamtergebnis ${outcome.total} bei ${cleanNarrationField(roll.formula, 100)}`;

  const lines = [
    `Schreibe als neutraler Erzähler eine kurze Szenenfolge im Modus „${mode.label}“.`,
    `Nur intern zur Abstufung: ${resultLine}; Qualität ${outcome.label}. Dies niemals ausgeben.`,
    'Ausgabe: 1–3 natürliche Sätze mitten in der Szene, höchstens 500 Zeichen. Nie Würfel, Wurf, Ergebnis, Zahlenwert, Formel oder Erfolgsstufe nennen.',
    'Nutze Szenenverlauf und etablierte Persönlichkeit konkret. Keine Analyse, Überschrift, Quellen, erfundenen Gedanken oder verborgenen Fakten.',
    getSceneDiceNarrationModeInstruction(narrationMode),
    'Niedrig: Handlung scheitert konkret, ohne Verborgenes zu verraten. Hoch: klare, kontextgerechte Erkenntnis oder Folge.',
    `Humorregel: ${humorInstruction}`,
    `Figur: ${actorName}. Anlass: ${purpose}.`
  ];
  const baseQuery = lines.join('\n');
  const situationPrefix = '\nSituationsauftrag: ';
  if (!sceneSituation) return `${baseQuery}${situationPrefix}aus dem gelieferten Pflichtkontext ableiten.`;
  const availableSituationLength = Math.max(0, 1180 - baseQuery.length - situationPrefix.length);
  return `${baseQuery}${situationPrefix}${truncateNarrationFieldAtWord(sceneSituation, availableSituationLength)}`.trim();
}

export function enrichSceneDiceNarrationRetrieval(retrieval = {}, { roll = {}, participant = {}, snapshot = {}, situation = '' } = {}) {
  const outcome = getSceneDiceOutcomeProfile(roll);
  const narrationMode = normalizeSceneDiceNarrationMode(roll.narrationMode);
  const mode = getSceneDiceNarrationMode(narrationMode);
  const promptContext = [
    'Szenenwurf – verbindlicher Erzählauftrag',
    `Erzählmodus: ${mode.label}`,
    `Handelnde Figur: ${cleanNarrationField(participant.name, 80) || 'Die Szene'}`,
    `Probe/Anlass: ${cleanNarrationField(roll.purpose || 'allgemeine Probe', 140)}`,
    `Interne Ergebnissteuerung: ${getSceneDiceRolledValue(roll)}, Qualitätsstufe ${outcome.label}. Diese Mechanik und ihr Zahlenwert dürfen im Erzähltext nicht genannt werden.`,
    `Modusregel: ${getSceneDiceNarrationModeInstruction(narrationMode)}`,
    `Humorregel: ${getSceneDiceHumorInstruction({ ...roll, outcomeRatio: outcome.ratio }, roll.humorEnabled === true)}`,
    situation ? `Vom Nutzer gesetzter Situationskontext: ${cleanNarrationField(situation, 900)}` : '',
    snapshot.moduleTitle ? `Modul: ${cleanNarrationField(snapshot.moduleTitle, 160)}` : '',
    snapshot.pageTitle ? `Szene/Seite: ${cleanNarrationField(snapshot.pageTitle, 160)}` : '',
    '',
    'Aktuelle Seite:',
    cleanNarrationField(snapshot.pageText, 9000) || 'Kein Seitentext verfügbar.',
    '',
    'Geordneter Szenenverlauf:',
    cleanNarrationField(snapshot.transcript, 14000) || 'Noch keine kommentierten Szenenbeiträge.',
    '',
    'Kontextpriorität: Situationsauftrag, laufende Szene und bisheriger Verlauf zuerst; danach etablierte Persönlichkeit und übrige Almanach-Treffer.',
    'Erzählregel: neutrale dritte Person, keine Metasprache und keine erfundenen Innenzustände oder verborgenen Fakten.'
  ].filter(Boolean).join('\n');

  const requiredChunks = [
    {
      sourceType: 'current-scene-page',
      sourceRef: `scene-dice:page:${snapshot.moduleId || 'current'}`,
      moduleId: snapshot.moduleId || '',
      moduleTitle: snapshot.moduleTitle || '',
      pageTitle: snapshot.pageTitle || '',
      speakerName: '',
      kind: 'required-current-scene',
      score: 10000,
      text: cleanNarrationField(snapshot.pageText, 9000) || 'Kein Seitentext verfügbar.'
    },
    {
      sourceType: 'current-scene-comments',
      sourceRef: `scene-dice:thread:${snapshot.threadId || 'current'}`,
      moduleId: snapshot.moduleId || '',
      moduleTitle: snapshot.moduleTitle || '',
      pageTitle: snapshot.pageTitle || '',
      speakerName: participant.name || '',
      kind: 'required-ordered-scene-comments',
      score: 9999,
      text: cleanNarrationField(snapshot.transcript, 14000) || 'Noch keine kommentierten Szenenbeiträge.'
    }
  ];

  return {
    ...(retrieval || {}),
    promptContext: [promptContext, retrieval?.promptContext || '']
      .filter(Boolean)
      .join('\n\n--- Weitere Almanach-Treffer ---\n\n'),
    chunks: [
      ...requiredChunks,
      ...((retrieval?.chunks || []).filter(chunk =>
        chunk?.sourceType !== 'current-scene-page'
        && chunk?.sourceType !== 'current-scene-comments'
      ))
    ],
    stats: {
      ...(retrieval?.stats || {}),
      requiredSceneContextIncluded: true,
      sceneDiceNarrationMode: narrationMode
    }
  };
}

export function cleanSceneDiceNarration(value) {
  let text = String(value || '').trim();
  text = text.replace(/^```(?:\w+)?\s*/i, '').replace(/\s*```$/i, '').trim();
  text = text.replace(/^\s*(?:Erzähltext|Beschreibung|Auswertung)\s*:\s*/i, '').trim();
  text = text.replace(/\n{2,}/g, ' ').replace(/\s+/g, ' ').trim();
  return text.slice(0, 700);
}
