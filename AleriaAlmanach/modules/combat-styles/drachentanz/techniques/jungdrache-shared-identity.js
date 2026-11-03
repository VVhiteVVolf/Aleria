// Only these shared foundation attacks carry the ordinary training ladder.
// Keep identity separate so generic damage calculation does not load a catalogue.
const trainingTechniqueIds = new Set([
  'sicherer-drachenhieb', 'fallende-schwinge', 'erstickte-antwort',
  'entwaffnende-klaue', 'brechender-widerhall'
].map(slug => `combat-style-drachentanz-jungdrache-${slug}`));

export function isSharedJungdracheTrainingTechniqueId(id) {
  return trainingTechniqueIds.has(String(id || ''));
}
