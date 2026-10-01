import '../assets/js/pins/category-catalog.js';
import '../assets/js/pins/pin-template-catalog.js';
import '../assets/js/pins/pin-table-presets.js';

const catalog = globalThis.KartoCategoryCatalog;

// The inventory is visually reviewed map data, never inferred during page load.
// Preserve every existing pin, including custom fields, names, media and IDs.
export function mergeMarkingPins(state, inventory){
  const next = {...structuredClone(state), ...catalog.upgrade(state)};
  const pins = next.pins || (next.pins = []);
  const matches = [];
  const [width, height] = inventory.imageSize;
  if(!(width > 0 && height > 0)) throw new Error('Invalid map dimensions');
  const identities = new Set();
  for(const marking of inventory.markings){
    if(identities.has(marking.id)) throw new Error(`Duplicate marking ID: ${marking.id}`);
    identities.add(marking.id);
    const [left, top, right, bottom] = marking.bounds;
    if(!(left >= 0 && top >= 0 && right > left && bottom > top && right <= width && bottom <= height)){
      throw new Error(`Invalid bounds: ${marking.id}`);
    }
    const x = (left + right) / 2 / width;
    const y = (top + (bottom - top) * .43) / height;
    const existing = pins.find(pin => pin.id === marking.id)
      || pins.find(pin => pin.kind !== 'text' && pin.x * width >= left && pin.x * width <= right
        && pin.y * height >= top && pin.y * height <= bottom);
    if(existing){
      matches.push({marking:marking.id, pin:existing.id, added:false});
      continue;
    }
    const category = next.cats.find(item => item.id === marking.categoryId)
      || next.cats.find(item => catalog.definition(item)?.id === marking.categoryId);
    if(!category) throw new Error(`Missing category for ${marking.id}: ${marking.categoryId}`);
    if(!globalThis.KartoPinTemplateCatalog.get(marking.templateId)) throw new Error(`Unknown pin template: ${marking.templateId}`);
    const table = globalThis.KartoPinTablePresets.createTable(marking.templateId, category);
    const pin = {
      id:marking.id, x, y, title:marking.title, cat:category.id, kind:'place',
      img:'', imgLink:'', crest:inventory.crest, crestLink:'',
      banner:inventory.banner, bannerLink:'', region:'', house:'', faction:'',
      templateId:marking.templateId, table, text:'', secret:false,
    };
    pins.push(pin);
    matches.push({marking:marking.id, pin:pin.id, added:true});
  }
  return {state:next, matches};
}
