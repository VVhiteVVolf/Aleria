// Presentation only: these assignments grant no traits or combat modifiers.
export const PATRICK_TRAIT_ICON_REUSE = Object.freeze({
  Eitel: '/IconOrdner/Traits%20Icon/Groomed.png',
  Gewissenhaft: '/IconOrdner/Traits%20Icon/Diligent.png',
  Ehrgeizig: '/IconOrdner/Traits%20Icon/Ambitious.png',
  Gesellig: '/IconOrdner/Traits%20Icon/Gregarious.png',
  Familienverbunden: '/IconOrdner/Traits%20Icon/Family_focus.png',
});

function assetSource(value) {
  if (typeof value === 'string' && value.startsWith('https://')) {
    const url = new URL(value);
    if (!url.username && !url.password && url.hostname) return value;
  }
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')
    || value.includes('\\') || value.split('/').includes('..')) {
    throw new Error('Ein ergänztes Biografieicon benötigt einen lokalen Webpfad oder eine HTTPS-Bildadresse ohne Zugangsdaten.');
  }
  return value;
}

export function planPatrickBiographyIcons(characterId, abilities = [], assetMap = {}) {
  const pending = [], assignments = [];
  const result = abilities.map(ability => {
    const previous = String(ability.icon ?? '').trim();
    if (previous && !['*', '✦'].includes(previous)) return structuredClone(ability);
    const title = String(ability.title || '').trim();
    const icon = PATRICK_TRAIT_ICON_REUSE[title]
      || assetMap[`${characterId}:${title}`] || assetMap[`trait:${title}`];
    if (!icon) {
      pending.push({ kind: 'missing-trait-icon', characterId, title });
      return structuredClone(ability);
    }
    assignments.push({ title, icon: assetSource(icon), reused: Boolean(PATRICK_TRAIT_ICON_REUSE[title]) });
    return { ...structuredClone(ability), icon };
  });
  return { abilities: result, assignments, pending };
}
