import fs from 'node:fs';
import crypto from 'node:crypto';
import { WARRIOR_STYLE_PROMPT, WARRIOR_STYLE_REFERENCE, SARKAL_REFERENCE } from '../warrior-art-direction.mjs';

const plan = JSON.parse(fs.readFileSync(new URL('./emblem-warriors-pool-14-26-art-direction-v3.json', import.meta.url), 'utf8'));
const oldV1 = JSON.parse(fs.readFileSync(new URL('./emblem-warriors-pool-14-26-generation.json', import.meta.url), 'utf8'));
const oldV2 = JSON.parse(fs.readFileSync(new URL('./emblem-warriors-pool-14-26-generation-v2.json', import.meta.url), 'utf8'));
const retained = {
  'pool-18': {
    generation: 'v2', source: oldV2.records.find((entry) => entry.id === 'pool-18'),
    restoredFrom: 'assets/warriors/generated-archive/rejected-v2-20261103/pool-18.png',
    generatorOriginal: 'C:\\Users\\fhg_r\\.codex\\generated_images\\01a1a0ca-6914-7191-9aed-4016bbc9e754\\exec-84430cc3-0c2c-4585-8826-a3b8b75170b9.png',
    sha256: '4d0ca7bae64e34f175e6eb07da8a7ab6f8f0008b72b1979aa289b191704376c3',
    carryoverDescription: 'Ausdrücklich beibehaltener Feuerschalen-Derwisch: navyblauer und roter Stoff, Goldkanten, geschlossener flammenförmiger Tulpenhelm und ein großer zweihändig geführter Krummsäbel.',
    equipment: ['Ein zweihändig geführter großer Krummsäbel'],
  },
  'pool-20': {
    generation: 'v1', source: oldV1.records.find((entry) => entry.id === 'pool-20'),
    restoredFrom: 'sources/rejected-emblem-warriors-pool-14-26/pool-20.png',
    generatorOriginal: 'C:\\Users\\fhg_r\\.codex\\generated_images\\01a1a0ca-6914-7191-9aed-4016bbc9e754\\exec-fcde1277-083e-4797-ae14-9be59006d55b.png',
    sha256: 'b4a2bfd930b937e09fa681bee973958485ed9e07d27ae58585f949d99824f9ae',
    carryoverDescription: 'Ausdrücklich beibehaltener Widder-Ghulam: menschliche kumanische Gesichtsmaske, graue Ketten-/Lamellenrüstung, schwarzer Stoff und rotes Brusttabard mit weißem Widderkopf; ein geflanschter Streitkolben.',
    equipment: ['Geflanschter Streitkolben', 'Schwere Ketten-/Lamellenrüstung', 'Menschliche Kumanen-Gesichtsmaske'],
  },
};

const records = plan.records.map((design) => {
  const generated = `assets/warriors/generated/${design.id}.png`;
  const exception = retained[design.id];
  if (exception) {
    const absolute = new URL(`../${generated}`, import.meta.url);
    const actualHash = crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex');
    if (actualHash !== exception.sha256) throw new Error(`Restored exception hash differs: ${design.id}`);
    return {
      id: design.id, classId: design.classId, emblemId: design.id,
      status: 'restored-approved-exception', mode: 'exact-user-approved-retention',
      retainedGeneration: exception.generation, restoredFrom: exception.restoredFrom,
      generatorOriginal: exception.generatorOriginal, sha256: actualHash, generated,
      explicitException: 'The user explicitly retained this exact earlier image after the general V3 redesign instruction; do not replace it with its planned V3 counterpart.',
      ageRuleExemptByExactRetention: true, age: null, mount: null,
      carryoverDescription: exception.carryoverDescription, equipment: exception.equipment,
      prompt: exception.source.prompt,
      referenced_image_paths: exception.source.referenced_image_paths,
      tool: 'built-in image_gen.imagegen (earlier exact result retained)',
    };
  }
  const mounted = Boolean(design.mount);
  const breedReference = design.mount?.name === 'Shahzad' ? 'Bestiarium/assets/horse-profiles/shahzad.webp' : SARKAL_REFERENCE;
  const references = [WARRIOR_STYLE_REFERENCE, `Vorschau/Ishtaran/assets/emblems/production/${design.id}.png`, ...(mounted ? [breedReference] : [])];
  const prompt = `Use case: stylized-concept. Create ONE entirely NEW Ishtaran emblem warrior from this individual design.\n\nPAINTING STYLE:\n${WARRIOR_STYLE_PROMPT}\n\nREFERENCE ROLES:\nImage1 is the APPROVED MATTE PAINTING TECHNIQUE only: fine even pigment grain, softly painted thin contours and simplified matte forms. Draw a different specified person, different armor and different traditional headgear. Do not copy its western plate, closed knight visor, winged lion or surrounding haze.\nImage2 is the exact EMBLEM for clothing colors and visible hand-painted/embroidered heraldry BELOW the helmet. ${mounted ? `Image3 is the ${design.mount.name} BREED BUILD reference only; use the individual coat color and calm pose below, with no source scenery or other figures.` : ''}\n\nNON-NEGOTIABLE PERSON: one clearly ADULT person aged ${design.age}, ${design.gender}, SLIM and ATHLETIC with a visibly narrow waist and fit young-adult body. Young smooth face, no elderly appearance, grey hair, wrinkles, heavy belly, stocky frame or thick waist. Armor weight changes equipment, never body fat.\n\nTRADITIONAL HEADGEAR: ${design.helmet.type}. ${design.helmet.form} ${design.helmet.coverage}. ${design.helmet.finish} Use normal established historical construction: plain nasal, ordinary metal dome/cone, normal mail curtain or traditional felt bork/turban exactly as specified. Keep this off-the-shelf traditional helmet physically independent from the heraldic motif. No animal or object-shaped headgear, no horn or antler, no fantasy face mask, no geometric emblem construction, no flame/star/wheel/bridge/tower/anchor/fruit sculptural head ornament.\n\nCOMPLETE INDIVIDUAL BRIEF:\n${JSON.stringify(design, null, 2)}\n\nCreate individuality through the youthful human face, hairstyle, slim athletic physique, culturally appropriate armor materials, layered cloth tailoring, large readable heraldry on clothing/shield/saddle and the specified quiet pose. Only traditional Turkish/Ottoman, Persian, Cuman and Janissary headgear; helmets themselves stay historically ordinary. No generic-class or rejected character image has been supplied as a reference.\n\nROLE AND WEAPONS: obey the classId and exact equipment list. Complete coherent weapons with believable hand grips, continuous shafts/blades/bowstrings. No extra weapons, firearm, musket, named person, rank, house, city, spell or religious office. Exactly ONE adult human${mounted ? ' mounted on exactly ONE horse, all four complete hooves visible' : ''}.\n\nCOMPOSITION AND OUTPUT: portrait 2:3, ideally 1024x1536 PNG RGBA. Entire calm full-body figure including helmet, weapon ends, both boots${mounted ? ', whole horse body, head, ears, mane, tail and FOUR full legs/hooves' : ''} inside generous transparent margins. Genuine transparent exterior and gaps alpha0; actual person/equipment surfaces opaque alpha255. No cropping, environment, floor, cast shadow, haze, glow, gradient, text, captions, floating emblem graphic or watermark.`;
  return {
    id: design.id, classId: design.classId, emblemId: design.id, status: 'pending', mode: 'new-v3',
    age: design.age, gender: design.gender, design, prompt,
    referenced_image_paths: references.map((file) => `E:\\Aleria\\${file.replaceAll('/', '\\')}`),
    generated, generator: 'built-in image_gen.imagegen', transparent_background: true,
  };
});

const manifest = {
  schemaVersion: 3, createdAt: '2026-11-03', status: 'approved-v3-in-production-with-explicit-retentions',
  designSource: 'sources/emblem-warriors-pool-14-26-art-direction-v3.json',
  approval: 'Root reviewed and approved V3, archive ready; later user explicitly retained exact pool-18 V2 and pool-20 V1 images.',
  newGenerationCount: records.filter((entry) => entry.mode === 'new-v3').length,
  retainedExceptions: Object.keys(retained), newGenerationUsesGenericOrRejectedPersonReferences: false,
  originalPolicy: 'Generator PNGs copied unchanged. Central architecture agent alone performs alpha preparation.', records,
};
fs.writeFileSync(new URL('./emblem-warriors-pool-14-26-generation-v3.json', import.meta.url), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ newGenerations: manifest.newGenerationCount, exactRetentions: manifest.retainedExceptions }));
