import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { MUSCHI_PEOPLE, MUSCHI_PETS } from '../modules/gestiefelte-muschi/muschi-people.mjs';
import { MUSCHI_ROOMS, MUSCHI_EXTERIOR_VISUAL } from '../modules/gestiefelte-muschi/muschi-rooms.mjs';
import { MUSCHI_RARITIES, MUSCHI_SMOKING_GOODS, MUSCHI_PERFUMES } from '../modules/gestiefelte-muschi/muschi-goods.mjs';
import { MUSCHI_SIGN_PROMPT } from '../modules/gestiefelte-muschi/muschi-sign-art.mjs';
const root = new URL('../../', import.meta.url);
const { presets } = JSON.parse(await readFile(new URL('AleriaAlmanach/docs/art/image-style-presets.json', root), 'utf8'));
const art = 'AleriaAlmanach/assets/gestiefelte-muschi';
const crest = house => `Stammbäume/assets/images/houses/Brevanor/${house}.png`;
const anime = presets['anime-scene-portrait'].prompt.replace('[ANIME EINTRAGEN]', 'Tales of Xillia/Frieren');
const styleItem = 'AleriaAlmanach/public/assets/house-armor/celtigerns-wacht/haus-gafyr-harnisch-v1.png';
const jobs = [];
for (const [house, motif, colors] of [
  ['Bielle', 'Ein großer elfenbeinweißer mittelalterlicher Turm auf weinlaubgrünem Grund. Eine Weinrebe windet sich um den Turm, mit deutlich getrennten weißen und violetten prallen Trauben. Alle Elemente innerhalb des Kreises.', ['Elfenbeinweiß', 'Weinlaubgrün', 'Traubenviolett']],
  ['Desele', 'Ein großer silberner Kelch, unmittelbar daneben ein einzelner Weinrebzweig mit prallen burgunderroten Trauben und dunkelgrünen Blättern. Beide heraldischen Elemente gleichwertig nebeneinander, vollständig innerhalb des Kreises.', ['Silber', 'Burgunderrot', 'Dunkelgrün']]
]) {
  let prompt = presets['fantasy-heraldic-emblem'].prompt;
  for (const [from, to] of [['[NAME]', `Haus ${house} · Brevanor`], ['[BESCHREIBUNG DES HAUPTMOTIVS]', motif], ...colors.map((c, i) => [`[FARBE ${i+1}]`, c]), ['[EISEN / GOLD / SILBER / HOLZ]', house === 'Bielle' ? 'dunklem Eisen' : 'Silber'], ['[RUNEN / KELTISCHE KNOTEN / GEOMETRISCHE ORNAMENTE / KEINE VERZIERUNG]', 'Schlichte Weinranken als geschlossene brevanorische Rahmenornamentik']]) prompt = prompt.replaceAll(from, to);
  jobs.push({ id: `wappen-${house.toLowerCase()}`, destination: crest(house), transparent: true, prompt,
    references: ['Stammbäume/assets/images/houses/Talyndor/haus-thornwick.png'], referenceRole: 'Nearby cultural heraldry reference only. Use the specified independent symbols and colors. Follow the written exact-circle contour and opacity rules, never copy protruding wings or transparency flaws.' });
}
jobs.push({ id: 'schild', destination: `${art}/schild-v2.png`, transparent: true, references: [], prompt: MUSCHI_SIGN_PROMPT });
jobs.push(...MUSCHI_PEOPLE.map(p => ({ id: p.key, destination: `${art}/portraits/${p.key}.png`, transparent: false,
  prompt: `${anime}\nUse case: stylized-concept. Exactly one adult person, standing upper body portrait to hips, ${p.appearance} Quiet uncluttered medieval cabaret interior with timber and a muted burgundy curtain, soft warm lantern lighting, normal rounded human ears. No nudity, no sexual activity, no lettering, no watermark, no frame. Distinct individual face, hair and pose; do not make people look related.`,
  references: p.key === 'daric' ? [crest('Desele')] : [], referenceRole: p.key === 'daric' ? 'Exact chest heraldry and house colors only, integrate silver chalice and grape branch into noble Brevanor armor.' : '' })));
jobs.push({ id: 'hausgarde', destination: `${art}/portraits/hausgarde.png`, transparent: false, references: [`${art}/portraits/daric.png`], referenceRole: 'Same Desele armor family, less ornate and helmeted, different pose.',
  prompt: `${anime}\nUse case: stylized-concept. Exactly one anonymous adult Brevanor Desele house guard aged about 48. Upper body from closed helmet to waist, standing with one gloved hand loosely holding vertical spear at side. Simplified but impressive polished silver steel plate, restrained burgundy enamel, dark green cloth, authentic silver chalice and grape branch chest emblem from Daric reference. CLOSED HELMET, all face openings completely black with deep opaque shadow, no discernible eyes mouth or facial features. Quiet same cabaret entrance. No lion pelt, no fur, no text, no transparent backdrop.` });
jobs.push(...MUSCHI_PETS.map(p => ({ id: p.key, destination: `${art}/pets/${p.key}.png`, transparent: false,
  prompt: `${anime}\nUse case: illustration-story. ${p.visual} Show the complete animal with its cushion or mat, centered within a vertical 2:3 composition. Quiet simple medieval timber salon corner, soft warm light. No other animals, no people, no text.`,
  references: [p.species === 'Samtlicht' ? 'Bestiarium/assets/cat-profiles/samtlicht.webp' : 'Bestiarium/assets/pet-breeds/hunde/pudel.webp'], referenceRole: p.species === 'Samtlicht'
    ? 'Only the breed morphology: elegant white longhaired luxury cat. Use the requested individual pose and eye color, no servants and no copying the illustrated room or painting style.'
    : 'DOG morphology reference: unmistakable POODLE with a long canine muzzle, large hanging floppy ears, dense tight CURLS, rounded groomed poodle head and pompom tail. Exactly one DOG, no cat, no feline face, no triangular upright ears, no feline whiskers. Retain the stated 2:3 anime scene style, not this reference painting style.' })));
jobs.push(...[{ id: 'aussenansicht', visual: MUSCHI_EXTERIOR_VISUAL }, ...MUSCHI_ROOMS].map(r => ({ id: r.id, destination: `${art}/scenes/${r.id}.png`, transparent: false, prompt: `${anime}\nUse case: illustration-story. ${r.visual} Coherent medieval architectural perspective, portrait 2:3. No watermark or readable writing except the supplied sign if present.`, references: r.id === 'aussenansicht' ? [`${art}/schild-v2.png`] : [], referenceRole: r.id === 'aussenansicht' ? 'Business-sign motif only. The exterior must have exactly this booted feline dancing mascot, not a mermaid.' : '' })));
const itemPrompt = visual => presets['fantasy-inventory-item'].prompt.replace('[GEGENSTAND]', visual);
for (const r of MUSCHI_RARITIES) {
  const house = r.id.startsWith('bielle') ? 'Bielle' : 'Desele';
  jobs.push({ id: r.id, destination: `${art}/goods/${r.id}.png`, transparent: true,
    prompt: itemPrompt(`ONE whole antique medieval ${r.kind.includes('Champagnia') ? 'sparkling-wine bottle with firmly tied cork' : 'corked wine bottle'}, containing ${r.color}. ${r.wax} wax seal, old well-kept bottle rescued from Brevanor. Label reads exactly "${r.label}", includes authentic miniature ${house} emblem from reference1. No goblet or extra props.`), references: [crest(house), styleItem], referenceRole: 'Reference1 house crest for small label motif, reference2 inventory painting style only, no armor motifs.' });
}
jobs.push({ id: 'rosenstolz', destination: `${art}/goods/rosenstolz.png`, transparent: true, references: [styleItem], referenceRole: 'Inventory illustration style only, do not copy any armor or heraldry.', prompt: itemPrompt('ONE entire dark green medieval wine bottle containing ruby-red wine from Weisenfluh, burgundy wax cork, ivory label reads ROSENSTOLZ, a single small painted red rose on the label, no separate glass or extra items. Reference1 supplies only inventory art style; the design is the described wine bottle.') });
jobs.push(...[...MUSCHI_SMOKING_GOODS, ...MUSCHI_PERFUMES].map(g => ({ id: g.id, destination: `${art}/goods/${g.id}.png`, transparent: true,
  prompt: itemPrompt(`${g.visual} Reference1 provides ${g.id.startsWith('parfum') ? 'authentic Desele emblem and house colors' : 'only inventory painting style, the design is the object described here'}.`),
  references: g.id.startsWith('parfum') ? [crest('Desele'), styleItem] : [styleItem], referenceRole: g.id.startsWith('parfum') ? 'Reference1 authentic house heraldry, reference2 inventory style only.' : 'Inventory style only, never copy armor or house motif.' })));
await mkdir(new URL(`${art}/`, root), { recursive: true });
await writeFile(new URL(`${art}/image-prompts.json`, root), JSON.stringify({ tool: 'built-in image_gen', styleSource: 'AleriaAlmanach/docs/art/image-style-presets.json', entries: jobs }, null, 2) + '\n');
console.log(JSON.stringify({ jobs: jobs.length, destination: `${art}/image-prompts.json` }));
