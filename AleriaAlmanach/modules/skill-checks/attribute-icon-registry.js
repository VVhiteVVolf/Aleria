// Presentation is independent of character calculations and saved row labels.
const names = { strength: 'Kraft', dexterity: 'Geschick', constitution: 'Konstitution',
  intelligence: 'Intelligenz', wisdom: 'Weisheit', charisma: 'Charisma' };
export const ATTRIBUTE_ICON_DEFINITIONS = Object.freeze(Object.entries(names).map(([id, name]) => Object.freeze({
  id, name, src: new URL(`../../public/assets/attribute-icons/${id}-v1.webp`, import.meta.url).href
})));
const byKey = new Map(ATTRIBUTE_ICON_DEFINITIONS.map(icon => [icon.id, icon]));
export function getAttributeIconPresentation(attribute) {
  const key = typeof attribute === 'string' ? attribute.replace(/^(?:attribute|save):/, '')
    : attribute?.key || (attribute?.checkType ? attribute.attributeKey : '');
  return byKey.get(key) || null;
}

export function renderAttributeIcon(attribute, { className = 'cp-sheet-attribute-icon', size = 44 } = {}) {
  const icon = getAttributeIconPresentation(attribute);
  return icon ? `<img class="${className}" data-attribute-icon="${icon.id}" src="${icon.src}" alt="" width="${size}" height="${size}" loading="lazy" decoding="async">` : '';
}
