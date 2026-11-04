import { readFile, writeFile } from 'node:fs/promises';
import { EMBLEMS } from '../heraldry-data.mjs';
import { EMBLEM_WARRIOR_DIRECTIONS_V3 as firstPool } from '../sources/emblem-warriors-pool-01-13-art-direction-v3.mjs';

const root = new URL('../', import.meta.url);
const readJson = async file => JSON.parse((await readFile(new URL(file, root), 'utf8')).replace(/^\uFEFF/, ''));
const source = await readJson('sources/emblem-warriors-source-art-direction-v3.json');
const secondPool = await readJson('sources/emblem-warriors-pool-14-26-art-direction-v3.json');
const approvedImages = await readJson('sources/approved-warrior-images.json');
const carryovers = new Map(approvedImages.records.filter(item => item.usage === 'emblem-pair').map(item => [item.id, item]));
const poolWeapons = {
  'pool-01': ['Kompositbogen schräg über dem Sattel', 'Krummsäbel', 'Sattelköcher'],
  'pool-02': ['Flanschstreitkolben'],
  'pool-03': ['Lange Gleve'],
  'pool-04': ['Speer', 'Rundschild'],
  'pool-05': ['Zwei Krummsäbel'],
  'pool-06': ['Kompositbogen tief vor dem Sattel', 'Krummsäbel', 'Sattelköcher'],
  'pool-07': ['Orientalische Lanze', 'Krummsäbel'],
  'pool-08': ['Krummsäbel in der Hand', 'Laute am Rücken', 'Dolch'],
  'pool-09': ['Speer', 'Rundschild'],
  'pool-10': ['Flanschstreitkolben'],
  'pool-11': ['Morgenstern mit starrem Schaft'],
  'pool-12': ['Lange Gleve'],
  'pool-13': ['Säbel in der Hand', 'Bogen und Pfeilköcher am Rücken'],
};
const asText = value => Array.isArray(value) ? value.join(' · ') : value || '';
const displayText = value => asText(value).replace(/\bfitted\b/giu, 'taillierter').split(/(?<=[.!?])\s+/u)
  .filter(sentence => !/^(?:kein(?:e|en|em|er|es)?|nicht)\b/i.test(sentence.trim())).join(' ');
const helmetText = helmet => typeof helmet === 'object'
  ? [helmet.form, helmet.coverage].filter(Boolean).map(displayText).join(' ')
  : displayText(helmet);
const secondEntries = secondPool.records || secondPool.jobs || secondPool.entries;
if (!Array.isArray(secondEntries)) throw Error('Der zweite V3-Wappenplan enthält keine Entwürfe.');
const directions = [...source.jobs, ...firstPool, ...secondEntries];
const byId = new Map(directions.map(item => [item.id, item]));
for (const retained of carryovers.values()) {
  let direction = {};
  if (retained.directionSource) {
    const original = await readJson(retained.directionSource);
    direction = (original.jobs || original.records).find(item => item.id === retained.id);
    if (!direction) throw Error(`Beibehaltener Bildentwurf fehlt: ${retained.id}.`);
  }
  byId.set(retained.id, { ...direction, ...retained.display, id: retained.id, classId: retained.classId });
}
if (byId.size !== 38) throw Error('Die Bildpläne müssen 38 eindeutige Wappen umfassen.');

const designs = EMBLEMS.map(emblem => {
  const direction = byId.get(emblem.id);
  if (!direction?.helmet) throw Error(`Helmentwurf fehlt: ${emblem.id}.`);
  const weapons = direction.equipment || poolWeapons[emblem.id] || direction.weapons;
  const equipment = Array.isArray(weapons) ? weapons : weapons ? [weapons] : [];
  if (!equipment.length) throw Error(`Individuelle Ausrüstung fehlt: ${emblem.id}.`);
  return {
    id: emblem.id,
    classId: direction.classId === 'ancient' ? null : direction.classId,
    revision: carryovers.get(emblem.id)?.revision ?? 3,
    helmet: helmetText(direction.helmet),
    armor: displayText(direction.armor || direction.armorAndCloth),
    pose: displayText(direction.pose),
    equipment: equipment.map(displayText),
    ageSpec: carryovers.has(emblem.id) ? null : { minimum: 20, maximum: 30, scope: 'illustration-only' },
    mount: direction.mount ? { name: direction.mount.name, href: direction.mount.href }
      : emblem.id === 'pool-24' ? { name: 'Shahzad', href: '../../Bestiarium/tiere/pferde/shahzad/index.html' } : undefined,
  };
});
const output = `// Generated display fields only. Prompts and source provenance stay in the authoring archive.\nexport const EMBLEM_WARRIOR_DESIGNS = Object.freeze(${JSON.stringify(designs, null, 2)}.map(item => Object.freeze({...item, equipment:Object.freeze(item.equipment)})));\n`;
await writeFile(new URL('emblem-warrior-designs.mjs', root), output);
console.log(JSON.stringify({ designs: designs.length, retainedEmblemIllustrations: carryovers.size, newDesignRevision: 3 }));
