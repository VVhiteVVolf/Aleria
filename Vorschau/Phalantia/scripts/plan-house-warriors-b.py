"""Retained initial art direction for four individually designed Phalantian houses."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORKSPACE = ROOT.parents[1]
STYLE = str(WORKSPACE/'AleriaAlmanach/docs/art/character-style/2026-10-24-approved-house-knight.png')
BASE = """Use case: stylized-concept. Asset type: full-body noble house warrior for Aleria, Phalantia.
Reference image 1 is ONLY the approved PAINTING STYLE: matte restrained hand-painted gouache, simplified large clear forms, soft thin painted edges, fine even pigment grain. Do NOT copy its western knight armor, griffin, colors, haze or background. Reference image 2 is ONLY the concrete house HERALDRY and palette; use the motif faithfully as paint or embroidery on practical equipment, not a sculpted animal-head helmet.
Exactly one fit muscular young adult HUMAN MAN age 23-29, anatomically normal round human ears. Ancient GREEK / SPARTAN fantasy equipment, not Roman or medieval European armor. Full figure in a calm believable three-quarter catalog stance, entire highest crest, all weapon tips and both complete feet visible with generous clear margins in a 1024x1536 portrait PNG (2:3). Distinctive dignified silhouette. Fully transparent background and open gaps; no scene, floor, cast shadow, smoke, glow, haze, halo or paper. Matte subdued colors and sparing soft shade, no realistic glossy metal or CGI. Functional hands, straps and grips. No text, watermark, firearms, women, children, old or fat men.
"""

ROWS = [
    dict(id='house-nerathen',name='Nerath',prototypeId='prototype-02',role='Hoplit',
         description='Hoplit des Hauses Nerath mit frühem korinthischem Helm, schwerem Hoplon und Igelheraldik.',
         reason='Der Igel erscheint als schützendes Schildmotiv und gezackte Randzier, während Bronze und breite Beinschienen die wehrhafte Haltung des Hauses tragen.',
         equipment=['Stoßspeer','Großer Hoplon mit Igelmotiv','Früher korinthischer Helm','Bronzener Brustpanzer','Breite Beinschienen'],
         palette=['Senfgelb','Schwarz','Elfenbein','Matte Bronze'],mount=None,
         direction='A powerful HOPLITE of House Nerath. Full EARLY CORINTHIAN bronze helmet with long integral noseguard, enclosing cheeks and NO feather crest, as on an archaic Greek helmet chart. Heavy matte bronze muscle breastplate and broad bronze greaves; black under-tunic and a short mustard-yellow shoulder mantle. His left forearm supports a large circular HOPLON whose mustard-yellow painted face bears ONE clear ivory-and-black HEDGEHOG in side profile matching reference 2. Hedgehog prickles inspire only a jagged black woven hem and subtle engraved border, no literal spikes on helmet. Right hand naturally holds a perfectly straight upright dory spear with its complete spearhead in view. Straight xiphos sheathed at hip. Calm frontal three-quarter guarding posture, not royal Agoge regalia.'),
    dict(id='house-kallorys',name='Kallorys',prototypeId='prototype-08',role='Kriegssänger',
         description='Fanatischer Kriegssänger mit zwei Äxten, roter Tätowierung und kupfer-purpurfarbener Skolopenderheraldik.',
         reason='Die gegliederten Bordüren greifen den Skolopender auf; freie Arme und die rote Tätowierung zeigen die fanatische, leichte Kampfweise.',
         equipment=['Eine Kriegsaxt in jeder Hand','Piloshelm mit schmaler Helmzier','Rote griechische Tätowierungen','Leichter Brustgurt','Purpurfarbene Schurzbahnen'],
         palette=['Kupfer','Pflaumenviolett','Schwarz','Rote Tätowierungen'],mount=None,
         direction='A muscular bare-chested KRIEGSSAENGER berserker of House Kallorys, shouting or singing with open mouth, a young strong face. Distinct bronze PILOS conical Greek helmet, open face, small narrow copper-and-dark-purple upright plume, NOT the broad royal transverse crest. Sparse copper armor on wrists and one shoulder, dark leather cross-body harness, a segmented purple-and-copper hanging waist panel bearing ONE embroidered C-shaped CENTIPEDE matching reference 2. RED angular ancient Greek meander tattoos cover visible chest and strong arms, never black tattoos. Exactly ONE functional one-handed war axe in EACH hand, two axes total, both held low and outward so both handles, fingers and blades are fully visible and separate from legs. No extra weapons, no instrument, no lute, no horn. Short dark hair, no old face. Grounded calm wide catalog stance despite fierce shouting expression.'),
    dict(id='house-erythaden',name='Erythad',prototypeId='prototype-05',role='Toxot und Marinekrieger',
         description='Maritimer Toxot mit boiotischem Helm, korrekt gespanntem Bogen und Langustenheraldik.',
         reason='Kalkweiß, Rotocker und dunkelblaue Wellen verbinden das Hauszeichen mit dem Seekrieg; offener Helm und leichter Panzer erlauben Beweglichkeit an Deck.',
         equipment=['Einfacher gespannter Langbogen','Rückenköcher','Gerades Kurzschwert','Offener boiotischer Helm','Leichter Schuppenpanzer'],
         palette=['Rotocker','Kalkweiß','Dunkelblau','Matte Bronze'],mount=None,
         direction='A maritime TOXOT archer of House Erythad, fit young muscular man. Distinct open BOEOTIAN bronze helmet with broad rolled brim, front eyebrow-shaped folds and cheek openings, no plume and no royal Corinthian mask. Light white linen torso armor partly over bronze fish-scale plates, dark blue narrow shoulder cloak, red-ochre meander borders and one clear RED SPINY LOBSTER painted on a white chest cloth, matching reference 2, no giant claws. A functional arrow quiver on his back and a STRAIGHT Greek short sword sheathed at hip. He holds ONE well-formed STRUNG SIMPLE LONGBOW vertically well clear of his left leg and torso, one hand grasping its central wrapped grip. Crucial bow geometry: continuous wooden stave forms one smooth symmetric C-shaped arc with equal upper and lower limbs around the center grip, not an S, no broken bend, no twisted or zigzag shape. ONE taut perfectly STRAIGHT bowstring joins only the two end nocks as the chord of that arc, visibly separated from the central wooden grip by open transparent space. Both wooden tips and the full straight string must be visible and understandable. Other hand rests at belt. A small rope coil is attached at belt; no scenery or ship.'),
    dict(id='house-theskariden',name='Theskarid',prototypeId='prototype-06',role='Lanzenreiter',
         description='Edler Lanzenreiter auf einem Sarkal mit phrygischem Helm und Purpurschnecke auf der Satteldecke.',
         reason='Die Purpurschnecke prägt Stickerei und Farbteilung der Satteldecke; die Figur erhält eine eigenständige, helle Reiterpanzerung.',
         equipment=['Lange Lanze','Gerades Reiterschwert','Phrygischer Helm','Griechischer Schuppenpanzer','Sarkal mit funktionalem Zaumzeug'],
         palette=['Elfenbein','Purpurrot','Dunkelgrau','Antiksilber'],
         mount=dict(name='Sarkal',profile='../../Bestiarium/tiere/pferde/sarkal/index.html',source='Bestiarium/tiere/pferde/sarkal/profil.json',reference='Bestiarium/assets/horse-profiles/sarkal.webp'),
         direction='Exactly ONE fully visible MOUNTED LANCE CAVALRYMAN of House Theskarid on ONE Sarkal horse. Use reference 3 ONLY for the HORSE BREED anatomy, ignore its riders, battle, equipment and background. Horse is tall and long-legged, sinewy athletic military horse, deep chest, long neck, straight taut back, dappled grey coat with short dark mane and tail, not a massive draft horse. Stand horse almost in side profile with all FOUR legs and FOUR complete hooves distinct, no extra legs, natural hindquarter-attached tail. Rider is young muscular man wearing a graceful PHRYGIAN Greek helmet with forward-curving peak and articulated cheek guards, a small pale plume, open face. Silvered Greek scale-and-muscle cuirass, ivory shoulder cloth, purple-red cloak, split riding skirt over fitted trousers and leather boots. Saddlecloth has purple-red upper field, charcoal lower field, ONE large ivory MUREX SPINY SHELL matching reference 2 on the visible side, and a narrow Greek silver meander hem. Rider right hand holds a SINGLE LONG STRAIGHT LANCE nearly vertical with all of its shaft, spear tip and butt fully inside the canvas. Left hand holds a coherent pair of reins connected visibly to a simple bridle and bit. Functional saddle, girth and stirrups with believable sitting balance; no horse armor hiding anatomy. Entire horse, rider, helmet crest and lance fit in 1024x1536 portrait with generous transparent margins and no floor or shadow.'),
]

def main():
    destination=ROOT/'sources/house-warriors-b-jobs.json'
    if destination.exists():
        print('Existing art direction preserved. Edit the source JSON to retain selected revisions.')
        return
    jobs=[]
    for row in ROWS:
        refs=[STYLE,str(ROOT/f"assets/emblems/production/{row['id']}.png")]
        if row['mount']:
            refs.append(str(WORKSPACE/'Bestiarium/assets/horse-profiles/sarkal.webp'))
        jobs.append({**row,'houseId':row['id'],'assetStem':row['id'],'prompt':BASE+'\nPrimary request: '+row['direction'],'references':refs})
    path=destination
    path.write_text(json.dumps(dict(schemaVersion=1,tool='image_gen.imagegen',jobs=jobs),ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print(json.dumps(dict(jobs=len(jobs))))

if __name__=='__main__': main()
