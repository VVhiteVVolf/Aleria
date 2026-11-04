import fs from 'node:fs';
import { WARRIOR_STYLE_PROMPT, WARRIOR_STYLE_REFERENCE, SARKAL_REFERENCE } from '../warrior-art-direction.mjs';

const plan = JSON.parse(fs.readFileSync(new URL('./emblem-warriors-pool-14-26-art-direction-v2.json', import.meta.url), 'utf8'));
const records = plan.records.map((design) => {
  const mounted = Boolean(design.mount);
  const breedReference = design.mount?.name === 'Shahzad'
    ? 'Bestiarium/assets/horse-profiles/shahzad.webp' : SARKAL_REFERENCE;
  const references = [WARRIOR_STYLE_REFERENCE, `Vorschau/Ishtaran/assets/emblems/production/${design.id}.png`, ...(mounted ? [breedReference] : [])];
  const prompt = `Use case: stylized-concept. Create ONE ENTIRELY NEW, INDIVIDUALLY DESIGNED emblem warrior for Ishtaran. This is a fresh illustration from an individual armor/helmet/person design, not a recolor or logo replacement.\n\nPAINTING STYLE:\n${WARRIOR_STYLE_PROMPT}\n\nREFERENCE ROLES:\nImage1 is the approved PAINTING TECHNIQUE ONLY: simplified clear shapes, restrained matte pigment texture, soft thin painted contours and calm full-body framing. Its exact western plate armor, helmet, pose, body, heraldry, face and hazy background are not this new subject.\nImage2 is the exact emblem: use its colors, motif geometry and symbolic forms to design NEW physical helmet and armor construction. Let the motif influence real contours, structural ribs, segments, shoulder shapes and cloth tailoring, not only a chest logo. ${mounted ? `Image3 supplies the ${design.mount.name} BREED BUILD only; draw the individually specified coat color and calm horse pose below. Discard all scene background, other figures and battle action in that horse reference.` : ''}\n\nTHE FOLLOWING INDIVIDUAL DESIGN IS REQUIRED IN FULL:\n${JSON.stringify(design, null, 2)}\n\nMake the specified helmet silhouette, degree of face coverage, armor construction, cloth layering, physique, face and quiet weapon pose visually clear. This must look like this specific design even without a chest emblem. Keep Seljuk/Turkish, Persian and Cuman inspired material language rather than French/western plate. Motif-shaped metal forms and animal-related heraldic crest details explicitly described in the design are allowed. Non-animal symbols become functional geometry rather than literal objects perched on the head. Small heraldic embroidery or inlay can complement the structural design but cannot replace it.\n\nROLE AND EQUIPMENT: follow only this design's classId and weapons. No added class mechanics, named person, house history, rank, city, magical effect or religious office. Exactly one human${mounted ? ' mounted on exactly one ordinary horse of the specified breed' : ''}. No firearms or muskets. Weapons have coherent continuous shafts/blades/strings and believable hands; all weapon ends are visible.\n\nCOMPOSITION AND OUTPUT: portrait 2:3, ideally 1024x1536 pixels. Calm full-body catalog pose as specified, no battle action. Entire headgear, weapons, boots${mounted ? ', horse body, head, ears, mane, tail and FOUR complete hooves' : ''} visible inside comfortable transparent margins; no cropping. Genuine transparent PNG RGBA background, opaque subject alpha255, exterior/open gaps alpha0 except a narrow antialiased contour. No floor, landscape, ship/deck scene, paper rectangle, haze, glow, aura, cast shadow, floating crest graphic, text, labels or watermark.`;
  return {
    id: design.id, classId: design.classId, emblemId: design.id, status: 'pending',
    design, prompt, referenced_image_paths: references.map((file) => `E:\\Aleria\\${file.replaceAll('/', '\\')}`),
    generated: `assets/warriors/generated/${design.id}.png`,
    generator: 'built-in image_gen.imagegen', transparent_background: true,
  };
});

const manifest = {
  schemaVersion: 2, createdAt: '2026-11-03', status: 'approved-individual-v2-in-production',
  designApproval: 'Root reviewed the complete 13-design V2 plan and explicitly authorized generation in the current conversation.',
  designSource: 'sources/emblem-warriors-pool-14-26-art-direction-v2.json',
  rejectedSeriesPreserved: true, genericClassImagesUsedAsReferences: false,
  originalPolicy: 'Copy built-in generator PNG unchanged. Shared alpha preparation runs separately after all batches.', records,
};
fs.writeFileSync(new URL('./emblem-warriors-pool-14-26-generation-v2.json', import.meta.url), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ preparedIndividualPrompts: records.length, first: records[0].id, last: records.at(-1).id }));
