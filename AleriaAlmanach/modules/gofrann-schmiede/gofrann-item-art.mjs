import { GOFRANN_PRODUCTS } from './gofrann-products.mjs';

export function createGofrannItemArtManifest(presets) {
  const preset=presets['fantasy-inventory-item'];
  const art='AleriaAlmanach/assets/gofrann-schmiede/items';
  const style='AleriaAlmanach/public/assets/house-armor/celtigerns-wacht/haus-gafyr-harnisch-v1.png';
  const common=preset.prompt
    .replace("Reference 1 defines the item's exact DESIGN, materials, colors and any authentic house emblem.",'The written subject defines the exact new object design and materials.')
    .replace('Reference 2 defines the ITEM ART STYLE only:','The attached inventory reference defines the ITEM ART STYLE ONLY:')
    .replace("Preserve the item's design and heraldry from reference 1; never copy the symbols or house colors of the style reference.",'Never copy the heraldry, colors, armor shape or insignia of the style reference.')
    .replace('about 10% clear margin','about 5–7% clear margin');
  const torso=preset.houseTorsoPrompt.replace('[HAUSNAME]','Gofrann')
    .replace("Reference 1 defines this house's exact armor DESIGN, metal colors, trim and heraldic chest emblem.",'The written subject defines the exact new plain armor design and materials.')
    .replace('Reference 2 defines the ITEM ART STYLE:','The attached inventory reference defines the ITEM ART STYLE ONLY:')
    .replace('Extract ONLY the torso cuirass from the warrior: an EMPTY standalone waist-length harness with open neck and empty armholes, small attached shoulder caps and short waist plates allowed.','Show ONLY a standalone waist-length torso harness filled by a smooth WHITE HEADLESS ARMLESS TORSO mannequin. Small attached shoulder caps and short waist plates allowed. This mannequin is explicitly requested by the user.')
    .replace('Faithfully retain the house colors and chest emblem from reference 1.','All surfaces plain and unadorned: no heraldry, symbol, engraving, embroidery, decorative trim or cloth surcoat.')
    .replace('wearer, mannequin,','human wearer,');
  return {module:'Zum Dritten Funken · Eigensortiment',status:'local-only · no publication authorized',tool:'built-in image_gen',
    makerMark:'Kleiner gravierter Amboss mit drei Funken auf Knauf oder Abschlussbeschlag; keine Buchstaben.',
    entries:GOFRANN_PRODUCTS.map(p=>{
      const base=p.kind==='armor'?torso:common.replace('[GEGENSTAND]',p.subject)
        .replace('No person, hands, mannequin,',p.kind==='tabard'?'No person or hands,':'No person, hands, mannequin,');
      const framing=p.kind==='weapon'
        ? 'Place the ENTIRE weapon diagonally from LOWER LEFT grip/butt end (about x 8%, y 92%) to UPPER RIGHT blade tip/weapon head (about x 92%, y 8%). Whole object nearly fills the square diagonal with comfortable margins. Both endpoints fully visible. No perspective foreshortening. For polearms preserve the full long shaft and small head proportions in the written subject.'
        :p.kind==='tabard'?'Only upper-body garment on a plain smooth WHITE HEADLESS AND ARMLESS torso mannequin ending at upper hips. No head, hands, arms, legs, feet, stand or mannequin base.':
          p.kind==='armor'?'The white torso mannequin may be visible at the open neck and arm openings ONLY; no head, hands, full arms, legs, feet, stand or base. Upper-body armor only.':'Whole shield centered, gentle three-quarter frontal view, blank clean face. No symbols or maker mark.';
      const mark=p.makerMark?'Gofrann family design language: restrained faceted steel fittings, dark brown leather, a very narrow muted copper collar. ONE TINY maker engraving on the pommel/butt cap or specified grip ferrule: a simple anvil silhouette with three small punched spark marks above it. No letters. Keep the blade and shaft otherwise plain.':'NO maker mark, emblem, symbol, monogram, heraldic engraving or decorative motifs anywhere.';
      const material=p.materialReference?'The SECOND reference is MATERIAL COLOR ONLY: '+(p.materialReference==='tenebron'?'deep BLACK forged Tenebron with fine VIOLET veins.':'SILVER-GREY Tenebrit steel with much finer muted VIOLET veins.')+' Do not copy the person, workshop, weapon shape, background, lighting or anime scene style from that material reference. No external aura or colored glow.':'';
      return {id:p.key,destination:`${art}/${p.key}.png`,transparent:true,
        references:[style,...(p.materialReference?[`AleriaAlmanach/public/assets/natural-resources/tenebrium/${p.materialReference}.png`]:[])],
        prompt:`${base}\nSubject: ${p.subject}\n${framing}\n${mark}\n${material}\nSquare 1:1, one isolated complete object, true transparent PNG background and transparent openings. Match the project's hand-painted fantasy inventory style, clear dark contours, illustrated material shading, no realistic photography or glossy 3D. No scene, separate tools, props, pedestal, border, labels, watermark, floating fragments or cast shadow. Never crop the object.`};
    })};
}
