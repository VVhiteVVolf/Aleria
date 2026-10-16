import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {NIXE_ROOMS} from '../modules/lachende-nixe/nixe-rooms.mjs';
import {NIXE_FAMILY_PEOPLE} from '../modules/lachende-nixe/nixe-family-people.mjs';
import {NIXE_DISHES,NIXE_WINES} from '../modules/lachende-nixe/nixe-menu.mjs';
import {NIXE_SERVICE_ICONS} from '../modules/lachende-nixe/nixe-services.mjs';
const presets=JSON.parse(await readFile(new URL('../docs/art/image-style-presets.json',import.meta.url),'utf8')).presets;
const anime=presets['anime-scene-portrait'].prompt.replace('[ANIME EINTRAGEN]','Tales of Xillia/Frieren');
const inventory=presets['fantasy-inventory-item'].prompt;
const itemReferences=['AleriaAlmanach/assets/krumme-kanne/food/gerstenbruehe.png','AleriaAlmanach/public/assets/house-armor/celtigerns-wacht/haus-gafyr-harnisch-v1.png'];
const crestPrompt=presets['fantasy-heraldic-emblem'].prompt
  .replace('[NAME]','Haus Sonnenfels')
  .replace('[BESCHREIBUNG DES HAUPTMOTIVS]','Eine große goldene heraldische Sonne über einem silbernen, dreizackig stilisierten Felsen auf weinrot bemalten Holzbrettern. Keine menschlichen Figuren und kein Gesicht in der Sonne.')
  .replace('[FARBE 1]','Weinrot').replace('[FARBE 2]','Gold').replace('[FARBE 3]','Silber')
  .replace('[EISEN / GOLD / SILBER / HOLZ]','GOLD')
  .replace('[RUNEN / KELTISCHE KNOTEN / GEOMETRISCHE ORNAMENTE / KEINE VERZIERUNG]','Feine heraldische Ranken gleichmäßig innerhalb des vollständig geschlossenen kreisrunden Goldrahmens. Keine Runen, keine überstehenden Elemente.')
  +'\nReferenz: Weinlaub liefert die Weisenfluher Rundform und den geschlossenen Rankenring, nicht sein Traubensymbol. Frontaler EXAKTER KREIS mit etwa 87 Prozent Bildbreite und einem sauberen transparenten Rand. Keine Schrift oder Krone. Innen ausschließlich Alpha 255; nur außerhalb der äußeren Kreislinie Alpha 0.';
const manifest={schemaVersion:1,module:'Die Lachende Nixe',tool:'built-in image_gen',approvedHeraldry:'Goldene Sonne über silbernem Felsen auf Weinrot; feine Ranken im Goldrahmen. Ausdrücklich vom Nutzer ausgewählt.',entries:[...NIXE_ROOMS.map(room=>({
  id:room.id,destination:`AleriaAlmanach/assets/lachende-nixe/scenes/${room.id}.png`,transparent:false,
  references:room.page===0?['AleriaAlmanach/assets/lachende-nixe/references/schild.png','AleriaAlmanach/assets/lachende-nixe/references/aussenansicht-vorher.png','AleriaAlmanach/assets/lachende-nixe/references/albrecht.png']:['AleriaAlmanach/assets/lachende-nixe/references/albrecht.png'],
  prompt:`${anime}\nUse case: stylized-concept. ONE environmental still life, portrait 2:3, for Die Lachende Nixe in the HARBOR DISTRICT of medieval Gwynthor. ${room.scene}\nMatch the existing Albrecht portrait's clean drawn anime shapes, clear dark lineart, simple soft cel shading, warm gold and burgundy accents; no photorealism, watercolor, painterly fading borders, 3D or modern furniture. Calm composition with few well-chosen objects, one coherent believable space. No people, portraits on walls, lettering except the expressly specified sign, collage, border or watermark.`
})),
  ...NIXE_FAMILY_PEOPLE.filter(person=>!person.existing).map(person=>({
    id:person.key,destination:`AleriaAlmanach/${person.portrait.slice(2)}`,transparent:false,
    references:person.sex==='male' && !person.child && person.location.includes('Weisenfluh')
      ? ['AleriaAlmanach/assets/lachende-nixe/references/johanna.png','Stammbäume/assets/images/houses/Weisenfluh/haus-sonnenfels.png']
      :person.child?['AleriaAlmanach/assets/lachende-nixe/portraits/dietmar.png','AleriaAlmanach/assets/lachende-nixe/portraits/ottilie.png','AleriaAlmanach/assets/lachende-nixe/references/albrecht.png']
      :['AleriaAlmanach/assets/lachende-nixe/references/albrecht.png','AleriaAlmanach/assets/lachende-nixe/references/johanna.png'],
    prompt:`${anime}\nUse case: stylized-concept. ONE family character portrait of ${person.name}. ${person.appearance}\nMatch the EXISTING portraits' drawn anime ART STYLE only: clear lively dark lineart, warm restrained cel shading, simplified cloth, believable anime anatomy. The heraldic reference defines the gold sun above silver rocks on wine-red house colors, never a shield held as a prop. Family resemblance is primarily the specified rose-pink hair gradient, not identical faces. Do not clone Albrecht's face, curls, arched eyebrows, large nose, beard, clothes or pose. Standing in a calm SIMPLE individual pose, no held objects. Upper body framing, head to waist/upper hips, portrait 2:3, no full body, feet or complex hand gestures. Quiet medieval stone or wood interior with gentle daylight, almost no objects. Children always look their actual age and wear modest child clothing; their setting is a neutral castle family portrait. No text, collage, border, watermark, modern clothes, sexualization, heavy painterly rendering or photorealistic textures.`
  })),
  ...NIXE_DISHES.map(dish=>({id:dish.id,destination:`AleriaAlmanach/assets/lachende-nixe/food/${dish.id}.png`,transparent:true,references:itemReferences,
    prompt:`${inventory.replace('[GEGENSTAND]',dish.visual)}\nBoth references define the inventory ART STYLE only; do not copy their subjects, heraldry, armor, wood bowl or utensils. Subject is exactly the requested small plated meal. Refined but medieval ivory ceramic crockery, subtle painted texture and dark readable outlines. ONE plate or bowl and its cooked contents, large and centered with clear margin, no table, scenery, hands, napkin or utensils. Genuine transparent PNG outside the dish.`})),
  ...NIXE_WINES.map(wine=>({id:wine.id,destination:`AleriaAlmanach/assets/lachende-nixe/drinks/${wine.id}.png`,transparent:true,
    references: wine.id.startsWith('weinlaub')?[...itemReferences,'Stammbäume/assets/images/houses/Weisenfluh/haus-weinlaub.png']:itemReferences,
    prompt:`${inventory.replace('[GEGENSTAND]',wine.visual)}\nReferences 1 and 2 define the inventory ART STYLE only, no armor or food motifs. ${wine.id.startsWith('weinlaub')?'Reference 3 supplies the authentic Weinlaub grape emblem for a tiny producer seal only.':''} Draw just ONE whole bottle or glass as specified, centered on a square transparent canvas. Clear outlines and hand-painted fantasy inventory finish. No scenery, stand, hands, extra props or outer glow. Keep requested label text short and readable; the three unbranded table wines have no text.`})),
  ...NIXE_SERVICE_ICONS.map(icon=>({id:`service-${icon.id}`,destination:`AleriaAlmanach/assets/lachende-nixe/services/${icon.id}.png`,transparent:true,references:itemReferences,
    prompt:`${inventory.replace('[GEGENSTAND]',icon.visual)}\nA single small readable SERVICE ICON for the upscale medieval Lachende Nixe: burgundy, ivory, dark oak and warm brass or gold. References establish the hand-painted inventory ART STYLE only. Compact bold silhouette and clear dark outlines, few broad details, centered square with 12 percent transparent margin. No people, anatomy, text, lettering, frame, scene, cast shadow or glow. True transparent PNG outside the object.`})),
  {id:'sonnenfels-wappen',destination:'Stammbäume/assets/images/houses/Weisenfluh/haus-sonnenfels.png',transparent:true,
    references:['Stammbäume/assets/images/houses/Weisenfluh/haus-weinlaub.png'],prompt:crestPrompt}
]};
await mkdir(new URL('../assets/lachende-nixe/',import.meta.url),{recursive:true});
await writeFile(new URL('../assets/lachende-nixe/image-prompts.json',import.meta.url),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({prompts:manifest.entries.length}));
