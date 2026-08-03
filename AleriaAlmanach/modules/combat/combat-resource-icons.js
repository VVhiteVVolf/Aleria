export const COMBAT_RESOURCE_ICON_PRESENTATION = Object.freeze({
  action: { file: 'action.png', fallback: '●' },
  'bonus-action': { file: 'bonus-action.png', fallback: '▲' },
  reaction: { file: 'reaction.png', fallback: '◆' },
  'special-action': { file: 'special-action.png', fallback: '★' },
  'aura-focus': { file: 'aura-focus.png', fallback: '◎' },
  'mana-focus': { file: 'mana.png', fallback: '✦' },
  'celestial-points': { file: '', fallback: '☼' },
  'infernal-points': { file: '', fallback: '♨' }
});

export function getCombatResourceIconPresentation(resource = {}, baseUrl = globalThis.document?.baseURI || '') {
  const resourceText = `${resource.id || ''} ${resource.name || ''}`.toLocaleLowerCase('de');
  const definition = COMBAT_RESOURCE_ICON_PRESENTATION[String(resource.id || '')]
    || (/zauber.?platz|spell.?slot/.test(resourceText)
      ? { file: Number(resource.current) > 0 ? 'spell-slot-full.png' : 'spell-slot-empty.png', fallback: '◆' }
      : (/mana|fokus/.test(resourceText) ? { file: 'mana.png', fallback: '✦' } : null));
  const configuredSource = definition
    ? (definition.file ? `./public/assets/combat-profile-icons/${definition.file}` : '')
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
