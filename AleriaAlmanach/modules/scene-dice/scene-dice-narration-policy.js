const SCENE_DICE_NARRATION_MODES = Object.freeze([
  Object.freeze({
    id: 'immersive',
    label: 'Immersiv',
    description: 'AleriaGPT erzählt die unmittelbare Folge als Teil der Szene.',
    usesAi: true
  }),
  Object.freeze({
    id: 'character',
    label: 'Charakterfokus',
    description: 'Etablierte Persönlichkeit, Haltung und bisheriges Verhalten erhalten mehr Gewicht.',
    usesAi: true
  }),
  Object.freeze({
    id: 'dramatic',
    label: 'Dramatisch',
    description: 'AleriaGPT verdichtet Atmosphäre, Spannung und sichtbare Konsequenzen.',
    usesAi: true
  }),
  Object.freeze({
    id: 'simple',
    label: 'Einfach würfeln',
    description: 'Keine KI und kein Erzähltext: Es wird ausschließlich das Würfelergebnis angezeigt.',
    usesAi: false
  }),
  Object.freeze({
    id: 'standard',
    label: 'Standard',
    description: 'Keine KI-Deutung: Name und gewürfelter Wert werden knapp festgehalten.',
    usesAi: false
  })
]);

export function getSceneDiceNarrationModes() {
  return SCENE_DICE_NARRATION_MODES.map(mode => ({ ...mode }));
}

export function normalizeSceneDiceNarrationMode(value) {
  const requested = String(value || '').trim();
  return SCENE_DICE_NARRATION_MODES.some(mode => mode.id === requested) ? requested : 'immersive';
}

export function getSceneDiceNarrationMode(value) {
  const id = normalizeSceneDiceNarrationMode(value);
  return SCENE_DICE_NARRATION_MODES.find(mode => mode.id === id) || SCENE_DICE_NARRATION_MODES[0];
}

export function getSceneDiceRolledValue(roll = {}) {
  const natural = Number(roll.natural);
  return Number.isFinite(natural) && natural > 0 ? natural : Number(roll.total) || 0;
}

export function createSceneDiceStandardNarration(roll = {}, actorName = '') {
  const actor = String(actorName || roll.roller || 'Die Szene').trim() || 'Die Szene';
  return `${actor} hat eine ${getSceneDiceRolledValue(roll)} gewürfelt.`;
}

export function getSceneDiceNarrationModeInstruction(value) {
  const mode = normalizeSceneDiceNarrationMode(value);
  if (mode === 'character') {
    return 'Präge die sichtbare Reaktion durch belegte Eigenheiten, Haltung und bisheriges Verhalten; erfinde keine Gedanken oder neuen Charakterzüge.';
  }
  if (mode === 'dramatic') {
    return 'Verdichte den Moment mit Sinneswahrnehmung, Spannung und klarer sichtbarer Folge; erfinde keine verborgenen Fakten.';
  }
  return 'Erzähle die unmittelbare, beobachtbare Folge natürlich als Teil der Szene, ohne Erklärung oder Analyse.';
}

export function getSceneDiceHumorInstruction(roll = {}, enabled = false) {
  if (!enabled) return 'Humor ist ausgeschaltet. Bleibe ernst und zurückhaltend.';
  const natural = Number(roll.natural);
  const ratio = Number(roll.outcomeRatio);
  const veryLow = natural === 1 || (Number.isFinite(ratio) && ratio <= 0.15);
  const low = veryLow || (Number.isFinite(ratio) && ratio <= 0.3);
  if (veryLow) {
    return 'Trockener, leicht absurder In-World-Humor ist erwünscht. Pointiere den Fehlschlag, ohne Szene oder Figur unglaubwürdig zu machen.';
  }
  if (low) {
    return 'Ein trockener Seitenhieb oder kleines situatives Missgeschick ist erlaubt, aber kein Klamauk und keine Demütigung.';
  }
  return 'Humor nur verwenden, wenn er organisch aus Figur und Situation entsteht; keine künstliche Pointe.';
}

export function findSceneDiceMechanicsLeaks(value, roll = {}) {
  const text = String(value || '').trim();
  if (!text) return ['empty'];
  const leaks = [];
  const mechanicalPatterns = [
    /\b(?:würfelergebnis|würfelwurf|gewürfelt|gesamtergebnis|ergebnisqualität|ergebnis)\b/i,
    /\b(?:wurf|würfe)\b/i,
    /\b(?:w|d)\s*\d+\b/i,
    /\b\d+\s+(?:auf|von)\s+(?:einem\s+)?(?:w|d)?\s*\d+\b/i
  ];
  if (mechanicalPatterns.some(pattern => pattern.test(text))) leaks.push('mechanics');

  const resultValues = new Set([
    getSceneDiceRolledValue(roll),
    Number(roll.total) || 0
  ].filter(value => value > 0));
  for (const resultValue of resultValues) {
    const numberPattern = new RegExp(`(^|[^\\d])${resultValue}(?=[^\\d]|$)`);
    if (numberPattern.test(text)) {
      leaks.push('result-number');
      break;
    }
  }
  return Array.from(new Set(leaks));
}
