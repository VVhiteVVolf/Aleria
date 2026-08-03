export const COMBAT_RESOURCE_ICON_PRESENTATION = Object.freeze({
  action: { file: 'action.png', fallback: '●' },
  'bonus-action': { file: 'bonus-action.png', fallback: '▲' },
  reaction: { file: 'reaction.png', fallback: '◆' },
  'special-action': { file: 'special-action.png', fallback: '★' },
  'aura-focus': { file: 'aura-focus.png', fallback: '◎' }
});

export function getCombatResourceIconPresentation(resource = {}, baseUrl = globalThis.document?.baseURI || '') {
  const definition = COMBAT_RESOURCE_ICON_PRESENTATION[String(resource.id || '')] || null;
  const configuredSource = definition
    ? `./public/assets/combat-profile-icons/${definition.file}`
    : String(resource.icon || '').trim();
  let source = configuredSource;
  if (configuredSource && baseUrl) {
    try {
      source = new URL(configuredSource, baseUrl).href;
    } catch {
      source = configuredSource;
    }
  }
  return {
    source,
    fallback: definition?.fallback || '✦',
    kind: String(resource.id || 'custom')
  };
}
