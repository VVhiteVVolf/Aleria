import { HOUSE_DRAIG_FAMILY } from '../../../Stammbäume/assets/js/data/house-draig-family.js';

export const THEATER_ID='gwynthorer-theater';
export const THEATER_ART='./assets/gwynthor-theater';
export const AWENFRYN_EMBLEM=`${THEATER_ART}/awenfryn.png`;
export const THEATER_SIGN=`${THEATER_ART}/schild.png`;
const patron=HOUSE_DRAIG_FAMILY.persons.find(p=>p.id==='rihanna-ceirwynn');
if(!patron)throw new Error('Bestehende Theaterpatronin fehlt.');
export const THEATER_PATRON=Object.freeze({key:'rhianna',id:patron.id,worldPersonId:patron.worldPersonId,
  name:'Rhianna Draig',sourceName:patron.name,birth:patron.birth,sex:'female',race:'Mensch',origin:'Haus Ceirwyn · Haus Draig',
  role:'Schirmherrin und Förderin',portrait:`../Stammbäume/${patron.portrait}`,
  bio:'Lady Rhianna Draig, geborene Ceirwyn, machte gemeinsam mit ihrer Freundin Elenid aus einer heruntergekommenen kleinen Spielstube ein großes Theater. Sie ermöglicht Erweiterungen, Ausstattung und die beständige Arbeit des Hauses.'});
const person=(key,name,sex,age,origin,role,appearance,options={})=>Object.freeze({key,id:`theater-${key}`,worldPersonId:`person--gwynthorer-theater--${key}`,
  name,sex,birth:String(1740-age),race:'Mensch',origin,role,bio:role,portrait:`${THEATER_ART}/portraits/${key}.png`,appearance,...options});
export const THEATER_DIRECTOR=person('elenid','Elenid Awenfryn','female',65,'Lynthor · Familie Awenfryn','Inhaberin und Intendantin · Schauspiel- und Dramatiklehrerin',
  'A striking eccentric 65-year-old Cenyri grande dame, clearly mature but fit and glamorous. Tremendously voluminous silver-grey hair in abundant large sculpted waves and curls, no tight bun, all hair one consistent silver-grey base color. Green eyes, long expressive face, pronounced cheekbones, visible crow feet and mature facial lines. Haughty amused half-smile, one eyebrow raised, chin lifted. A provocative yet fully clothed rich plum-and-burgundy medieval gown, structured low-cut bodice showing tasteful cleavage, bare shoulders, dramatic sleeves and restrained gold trim. Standing in an unmistakably theatrical confident pose, one hand on her hip, the other holding an OPEN large plum-and-gold folding fan beside her cheek. Old but in excellent shape, arrogant, extravagant and artistically magnetic, never frail or demure.',
  {familyOrigin:{name:'Familie Awenfryn',seat:'Lynthor',emblem:AWENFRYN_EMBLEM,developed:false},
    bio:'In Lynthor geboren und bei den Bewahrern Avallorns ausgebildet, wurde Elenid als Bardin, Künstlerin und Schauspielerin bekannt. Die exzentrische Grande Dame trägt ihr Alter mit üppigem silbergrauem Haar, gewagten Gewändern und einem Fächer, der ihre Pausen ebenso deutlich setzt wie ihre Worte. Arrogant, schlagfertig und mit großer Bühnensicherheit führt sie heute als Inhaberin und Intendantin das Theater und unterrichtet Schauspiel und Dramatik. Mit Lady Rhianna verbindet sie eine langjährige Freundschaft.'});
export const THEATER_ENSEMBLE=Object.freeze([
  person('geraint','Geraint','male',23,'Cenyr','Schauspieler · junge Helden und Ensemblesprecher',
    '23-year-old adult Cenyri man, short lightly tousled copper-red hair, clear blue eyes, youthful angular clean-shaven face, slender athletic build. Forest-green medieval doublet, ivory shirt. Standing at slight left angle, arms relaxed, open thoughtful smile.'),
  person('cadfan','Cadfan','male',39,'Cenyr','Schauspieler · Charakterrollen und Feldherren',
    '39-year-old Cenyri man, broad face, short brown hair, brown eyes, short neat brown beard, strong straight nose, solid build. Dark blue medieval wool doublet, brown belt. Standing almost frontal, relaxed shoulders, reserved amused expression.'),
  person('rhoswen','Rhoswen','female',28,'Cenyr','Schauspielerin · tragische Hauptrollen',
    '28-year-old adult Cenyri woman, long natural red hair loosely pinned at the back, brown eyes, narrow face, small freckles and expressive brows. Burgundy medieval gown with cream modest neckline and plain brass clasp. Standing turned right, quiet confident expression, arms down.'),
  person('eleri','Eleri','female',21,'Cenyr','Schauspielerin · Komödie und jugendliche Rollen',
    '21-year-old adult Cenyri woman, short chestnut-brown bob, blue eyes, round face with lively eyebrows and a mischievous warm smile. Simple teal medieval tunic-dress over ivory sleeves, narrow leather belt. Standing facing front, slight relaxed head tilt, hands down.'),
  person('roderich','Roderich','male',46,'Mathringen','Schauspieler · Schurken, Gelehrte und große Stimmen',
    '46-year-old man from Mathringen, thick jet-black hair swept back, enormous black handlebar moustache, clean-shaven chin, grey eyes, broad mature face, heavy eyebrows and sturdy build. Charcoal medieval doublet with wine-red trim. Relaxed three-quarter left stance, imposing but friendly expression.'),
  person('samira','Samira','female',29,'Istharan','Schauspielerin · Gesandte und starke Frauenrollen',
    '29-year-old adult woman from Istharan, deep warm tan skin, long black hair in a low loose braid, dark brown eyes with distinctive dark winged kohl eyeliner, elegant strong nose and cheekbones. Wearing a fully Cenyri medieval royal-blue gown with ivory sleeves and modest neckline, with small oriental gold drop earrings and a delicate gold pendant. Relaxed standing three-quarter right, calm self-assured smile.'),
  person('rosalie','Rosalie','female',32,'Weisenfluh','Schauspielerin · Komödie und Gesang',
    '32-year-old adult woman from Weisenfluh, abundant tightly curled rose-pink hair reaching shoulders, green eyes, rounded expressive face and full cheeks. Warm ochre and cream medieval gown, small burgundy waist sash. Standing slightly left, warm amused smile, arms loosely down. One consistent rose-pink hair color.'),
  person('florian','Florian','male',36,'Weisenfluh','Schauspieler · Körperkomik und Verwandlung',
    '36-year-old man from Weisenfluh, short very tightly curled rose-pink hair, blue eyes, long face and pronounced hooked nose, clean shaven, broad shoulders. Simple russet medieval doublet with ivory shirt. Standing at a slight right angle, relaxed playful expression, hands at sides. One consistent rose-pink hair color.'),
  person('sigrun','Sigrun','female',30,'Aldrimar','Schauspielerin · Heldinnen und große Auftritte',
    'Beautiful 30-year-old adult Nordic woman, tall voluptuous figure with a full bust, abundant voluminous long blonde hair, bright blue eyes, broad radiant outgoing smile and confident open posture. Tasteful fully clothed deep red Cenyri medieval gown, fitted bodice and cream sleeves, modest square neckline. Relaxed standing three-quarter left, no provocative pose or complicated gesture.'),
  person('sabjorn','Sabjorn','male',23,'Aldrimar','Schauspieler · junge Helden und Sigruns Bühnenpartner',
    'Handsome 23-year-old adult Nordic human man from Aldrimar, tall, powerfully muscular athletic build, broad shoulders, thick neck and strong forearms. One consistent honey-blonde hair color, thick medium-length swept-back slightly wavy hair, clear blue eyes, strong square jaw, straight broad nose, clean-shaven face and confident warm smile. A fitted deep blue medieval wool tunic with an open laced collar, sleeves rolled to the elbows, a simple dark leather belt and dark trousers. Relaxed standing three-quarter right, weight comfortably on one leg, one hand resting loosely at the belt and the other arm hanging naturally. Ordinary rounded human ears. No armor, weapon, royal crown or provocative gesture.',
    {bio:'Der dreiundzwanzigjährige Aldrimarer bringt eine stattliche, muskulöse Erscheinung und unbefangene Wärme auf die Bühne. Als Sigruns Bühnenpartner spielt Sabjorn den jungen Sigurd Vaeren, der um Freydis Frostauges Hand wirbt und sich den zwölf schweren Prüfungen ihres Vaters stellen muss.'}),
  person('aelir','Aelir','male',41,'Albischer Herkunft','Schauspieler · Fürsten und Gegenspieler',
    '41-year-old human man of Albic cultural origin, ordinary rounded human ears, straight shoulder-length dark brown hair, hazel eyes, narrow elegant face, angular jaw, clean shaven. Dark plum medieval doublet with a simple silver clasp. Relaxed standing frontal, thoughtful poised expression.'),
  person('nuala','Nuala','female',33,'Albischer Herkunft','Schauspielerin · Chor und Erzählung',
    '33-year-old human woman of Albic cultural origin, ordinary rounded human ears, wavy chestnut-brown hair gathered over one shoulder, green eyes, soft long face and composed expressive mouth. Moss-green medieval gown with a plain ivory collar. Relaxed standing slightly right, patient gentle smile, hands naturally low.'),
  person('faelan','Faelan','male',48,'Albischer Herkunft','Schauspieler · Boten und ältere Charakterrollen',
    '48-year-old human man of Albic cultural origin, ordinary rounded human ears, brown hair in a short low tail, blue eyes, long lined face, aquiline nose and clean-shaven chin. Muted blue-grey medieval tunic with simple dark waistcoat. Relaxed standing three-quarter left, slight dry smile, no held objects.')
]);
export const THEATER_PEOPLE=Object.freeze([THEATER_PATRON,THEATER_DIRECTOR,...THEATER_ENSEMBLE]);
export const theaterPerson=key=>{const p=THEATER_PEOPLE.find(p=>p.key===key);if(!p)throw new Error(`Unbekannte Theaterperson: ${key}`);return p;};
