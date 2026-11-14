import { readFileSync } from 'node:fs';
import { CASTLE_HOUSES } from './castle-houses.mjs';
import { castleRooms, castleImage } from './castle-modules.mjs';

export const CASTLE_ART_DOCS = 'AleriaAlmanach/docs/art/gwynthor-castles-20261114';
export const CASTLE_ART_ASSETS = 'AleriaAlmanach/assets/gwynthor-castles';
const style = JSON.parse(readFileSync(new URL('../../docs/art/image-style-presets.json', import.meta.url), 'utf8')).presets['anime-scene-portrait'];
export const CASTLE_ART = Object.freeze(CASTLE_HOUSES.flatMap(house => castleRooms(house.id).map(room => ({
  id: `${house.id}-${room.id}`, version: 1, preset: 'anime-scene-portrait', house: house.id, room: room.id,
  destination: `AleriaAlmanach/${castleImage(house.id, room.id).slice(2)}`,
  references: ['AleriaAlmanach/docs/art/portrait-experiments/2026-11-09/kyrwyn-experimental-v3.png', house.symbol.slice(3)],
  prompt: `Use case: stylized-concept. Asset type: ONE finished castle environment illustration for an interactive Aleria roleplaying scene. Opaque PNG, 2:3 portrait, ideally 1024x1536.\nREFERENCE IMAGE 1 supplies ONLY the approved fine matte anime drawing style. DO NOT include its person, face, clothing or portrait composition. REFERENCE IMAGE 2 is the actual house crest and supplies heraldry and colors, not a decorative full-image border.\nCASTLE: ${house.architecture}\nHERALDRY: ${house.heraldry}\nSPECIFIC SCENE: ${room.art}\nSTYLE PRESET (complete, portrait-only clauses do not apply to this empty environment): ${style.prompt}\nFinal constraints: a readable inhabited medieval architectural space; this request specifically depicts the room or outdoor place WITHOUT PEOPLE. Only animals explicitly requested in the scene. No collage, panels, text, labels, watermark, modern machinery, electric lights or photorealistic textures. Preserve the exact house symbol and palette. Compose a distinct location, not a recolored copy of another castle.`
}))));
