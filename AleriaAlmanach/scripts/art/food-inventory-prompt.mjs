// Food uses the inventory preset, independently of a venue's scene/portrait style.
export const FOOD_ITEM_STYLE_REFERENCES = Object.freeze([
  'AleriaAlmanach/assets/klingende-krone/goods/haferkaese.png',
  'AleriaAlmanach/public/assets/house-armor/celtigerns-wacht/haus-gafyr-harnisch-v1.png'
]);

export function foodInventoryJob({ id, key = id, destination, visual, preset }) {
  return {
    id, key, kind: 'food', destination,
    stylePreset: 'fantasy-inventory-item', aspectRatio: '1:1', transparent: true,
    references: [...FOOD_ITEM_STYLE_REFERENCES],
    prompt: `${preset.replace('[GEGENSTAND]', visual)}\nAsset type: a single medieval meal INVENTORY ICON. Exact food design and portion are defined by the recipe above. The attached food image is reference 1 for the INVENTORY DRAWING STYLE and isolated presentation only, NOT its bread, cheese or ingredient design; reference 2 is an additional rendering-style reference ONLY. Do not copy armor, emblems, ornaments or house colors. Show only the specified serving in its simple plate/bowl, including ONLY the explicitly specified sides, grouped compactly as one inventory item. A food bundle may use its specified linen wrapping instead of a plate. Entire plate/bowl/bundle visible, centered, slight view from above, comfortable clear margin on all sides. Real transparent PNG outside the item and in open gaps. Modest food quantities, rustic worn wood or plain earthenware, no luxury garnish. No table, room, tavern wall, scenery, backdrop, ground, scenery vignette, extra props, cutlery, glasses, people, steam cloud, border, labels or text. Do not illustrate a scene or an anime still life. Use hand-painted fantasy item art with crisp dark outlines and simplified painterly shading.`
  };
}
