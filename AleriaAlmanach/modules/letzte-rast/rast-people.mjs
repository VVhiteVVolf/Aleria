export const RAST_ID = 'celtigerns-letzte-rast';
export const RAST_ART = './assets/letzte-rast';
export const VANN_EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Vann.png';
export const VANN_MOTTO = 'Dem Gast das Beste.';
const reference = key => `${RAST_ART}/references/${key}.png`;
const person = (key, name, sex, birth, role, appearance, options = {}) => Object.freeze({
  key, id: `${key}-vann`, worldPersonId: `person--haus-vann--${key}-vann`, name, sex,
  birth: String(birth), death: '', house: 'vann', role, bio: role,
  portrait: `${RAST_ART}/portraits/${key}.png`, appearance, resident: true, staff: true, ...options
});

export const VANN_PEOPLE = Object.freeze([
  person('iestyn', 'Iestyn Vann', 'male', 1303, 'Erwarb die Letzte Rast 1334',
    'Memorial portrait at 76, deeply lined square face, entirely grey formerly copper-red swept hair, long narrow grey beard, blue eyes. Old-fashioned dark green wool merchant robe, simple brass clasp. Standing turned slightly left, arms relaxed.', { death: '1379', resident: false, staff: false }),
  person('efa', 'Efa', 'female', 1307, 'Mitbegründerin des Vann-Gasthaushalts',
    'Memorial portrait at 74, grey hair in a braided crown, brown eyes, broad expressive face, visible wrinkles, dark red medieval wool gown and cream linen veil. Standing almost frontal with a gentle head tilt.', { death: '1381', resident: false, staff: false, unknownOrigin: true }),
  person('tudwal', 'Tudwal Vann', 'male', 1644, 'Brenns und Madocs Vater · früherer Inhaber',
    'Memorial portrait at 76. Broad elderly man, short entirely grey formerly red hair, blue eyes, strong Vann nose, clean shaven face with deep smile lines. Dark burgundy medieval merchant tunic and fur-edged green shoulder mantle. Standing in three-quarter right view.', { death: '1720', resident: false, staff: false }),
  person('gwenith', 'Gwenith', 'female', 1648, 'Brenns und Madocs Mutter',
    'Memorial portrait at 77. Entirely silver-grey hair in a neat bun under a fine linen coif, brown eyes, long oval face, dignified natural wrinkles. Deep green medieval gown, cream collar, small brass brooch. Standing with arms naturally down.', { death: '1725', resident: false, staff: false, unknownOrigin: true }),
  person('brenn', 'Brenn Vann', 'male', 1673, 'Hausoberhaupt · leitender Inhaber', '', { portrait: reference('brenn'), head: true }),
  person('seren', 'Seren', 'female', 1677, 'Hausmutter · Empfang und Festgesellschaften',
    '63-year-old Cenyri woman, predominantly grey hair with a few faded auburn strands in a loose braided bun, clear blue eyes, wide warm face, mature smile lines. Burgundy medieval silk-wool gown, cream collar and modest gold trim. Standing gently turned left with relaxed hands low.', { unknownOrigin: true }),
  person('madoc', 'Madoc Vann', 'male', 1677, 'Mitinhaber · Meier und Rechnungen', '', { portrait: reference('madoc') }),
  person('lowri', 'Lowri', 'female', 1680, 'Hausdame · Kammern und Hauswäsche',
    '60-year-old Cenyri woman, grey hair with copper-red undertones in a compact braided knot, blue eyes, narrow face and strong cheekbones, mature eye lines, quietly amused expression. Deep navy medieval dress, copper-red sleeveless overdress, fine ivory linen collar. Standing three-quarter right, hands resting loosely below waist.', { unknownOrigin: true }),
  person('cadeyrn', 'Cadeyrn Vann', 'male', 1697, 'Erster Erbe · Leitung des Speisebetriebs', '', { portrait: reference('cadeyrn') }),
  person('angharad', 'Angharad', 'female', 1699, 'Speisemeisterin · Tischdienst und Bankette',
    '41-year-old Cenyri woman, dark chestnut hair in a low side braid, green eyes, angular face, slightly hooked nose and mature confident smile. Burgundy fitted medieval gown, cream linen inset, fine brass chain. Standing facing slightly left, one arm loose at side, no objects.', { unknownOrigin: true }),
  person('owain', 'Owain Vann', 'male', 1701, 'Keller und Importbezug', '', { portrait: reference('owain') }),
  person('meleri', 'Meleri', 'female', 1706, 'Kontor · Lieferlisten und Vorräte',
    '34-year-old Cenyri woman, warm brown hair in a shoulder-length loose braid, brown eyes, rounded face, freckles and broad smile. Simple elegant forest-green medieval dress, cream undersleeves, russet waist sash. Standing frontal, head gently inclined, arms naturally down.', { unknownOrigin: true }),
  person('edern', 'Edern Vann', 'male', 1705, 'Herbergsmeister · Zimmer und Buchungen', '', { portrait: reference('edern') }),
  person('elowen', 'Elowen Maerllys', 'female', 1713, 'Empfang · Buchungen und Hausleinen',
    '27-year-old Cenyri woman, sister of Nia Maerllys. Dark deep red hair and clear blue eyes exactly like the sibling reference. Different face: wider cheekbones, stronger straight nose, mature calm expression. Dark red hair braided across the crown into a low bun. Fine ivory and dark green medieval gown, modest neckline. Standing three-quarter left, arms relaxed, no objects.',
    { id: 'elowen-maerllys', worldPersonId: 'person--haus-maerllys--elowen-maerllys', house: 'maerllys', originFamily: 'haus-maerllys', referencePaths: ['Stammbäume/assets/images/portraits/haus-maerllys/nia-maerllys.png'] }),
  person('eirlys', 'Eirlys Vann', 'female', 1710, 'Nach Haus Raves verheiratet · Beratung in der Göttlichen Eleganz', '', { portrait: reference('eirlys'), resident: false, staff: false, destinationFamily: 'haus-raves' }),
  person('orestian', 'Orestian Raves', 'male', 1704, 'Zunftsmeier der Göttlichen Eleganz', '',
    { id: 'orestian-raves', worldPersonId: 'person--haus-raves--orestian-raves', house: 'raves', resident: false, staff: false, portrait: './assets/goettliche-eleganz/portraits/orestian.png' }),
  person('aneirin', 'Aneirin Vann', 'male', 1719, 'Kontorgehilfe · Ausbildung zum Gastwirt',
    '21-year-old adult son of Cadeyrn and Angharad. Copper-red softly wavy hair, blue eyes, narrow youthful face, his mother\'s angular nose, clean shaven. Navy medieval doublet with restrained brass buttons, cream shirt, burgundy belt. Standing three-quarter right with one arm loosely behind his back.', { referenceKeys: ['cadeyrn', 'angharad'] }),
  person('enid', 'Enid Pendrwn', 'female', 1720, 'Empfangsgehilfin · Gästeankünfte',
    '20-year-old adult Cenyri woman, sister of Emyr Pendrwn. Match Emyr\'s reddish-brown hair and light green eyes. Own feminine face, broad forehead, small upturned nose, friendly expression. Hair half pinned back with a simple brass clasp. Forest-green and cream modest medieval gown. Standing relaxed turned slightly left, no props.',
    { id: 'enid-pendrwn', worldPersonId: 'person--haus-pendrwn--enid-pendrwn', house: 'pendrwn', originFamily: 'haus-pendrwn', referencePaths: ['Stammbäume/assets/images/portraits/haus-pendrwn/emyr-pendrwn.jpeg'] }),
  person('gwenna', 'Gwenna Vann', 'female', 1724, 'Schreiblehrling · Reservierungsbuch',
    '16-year-old adolescent girl, daughter of Cadeyrn and Angharad, chestnut-brown hair in two simple low braids, blue eyes, youthful angular cheeks. Modest burgundy medieval apprentice dress with cream linen collar. Standing frontal, relaxed arms, neutral safe household interior.', { referenceKeys: ['cadeyrn', 'angharad'] }),
  person('rhys', 'Rhys Vann', 'male', 1728, 'Schreiblehrling · erste Kontorübungen',
    '12-year-old boy, son of Owain and Meleri. Tousled copper-red hair, brown eyes from his mother, round boyish face and freckles. Modest green medieval child tunic, cream collar. Standing relaxed, arms down, no tools or props.', { referenceKeys: ['owain', 'meleri'] }),
  person('teleri', 'Teleri Vann', 'female', 1734, 'Hauskind',
    'Six-year-old little girl, daughter of Owain and Meleri. Soft warm brown hair in two small braids, blue eyes, round little cheeks and curious expression. Modest rust-red medieval child dress and ivory collar. Standing naturally, arms at sides, simple bright family room.', { staff: false, referenceKeys: ['owain', 'meleri'] }),
  person('celyn', 'Celyn Vann', 'female', 1735, 'Hauskind',
    'Five-year-old little girl, daughter of Edern Vann and Elowen Maerllys. Deep copper-red hair in a short wavy bob, bright blue eyes, round child cheeks and small straight nose. Modest green medieval child dress, cream sleeves. Standing relaxed, arms down, quiet safe family room.', { staff: false, referenceKeys: ['edern', 'elowen'] }),
  person('iolo', 'Iolo Vann', 'male', 1738, 'Hauskind',
    'Two-year-old toddler boy, son of Edern and Elowen. Soft dark red short curls, blue eyes, unmistakable toddler proportions and chubby cheeks. Simple cream medieval toddler tunic with rust-red sleeveless layer. Standing safely beside a plain low wooden bench, hands relaxed, no props.', { staff: false, referenceKeys: ['edern', 'elowen'] }),
  person('cassian', 'Cassian Raves', 'male', 1733, 'Kind im Haus Raves',
    'Seven-year-old little boy, son of Orestian Raves and Eirlys Vann. Copper-red hair at roots fading clearly into silver-white tips like his father, blue-grey eyes, angular youthful face. Modest burgundy medieval child doublet and cream shirt. Standing relaxed, simple bright family room.', { id:'cassian-raves',worldPersonId:'person--haus-raves--cassian-raves',house: 'raves', resident: false, staff: false, referenceKeys: ['orestian', 'eirlys'] }),
  person('elena', 'Elena Raves', 'female', 1736, 'Kind im Haus Raves',
    'Four-year-old little girl, daughter of Orestian and Eirlys. Soft red hair with a few clearly pale silver-white tips inherited from her father, clear blue eyes, round young cheeks. Modest cream medieval child dress with burgundy apron. Standing gently turned right with arms naturally at sides, safe plain family interior.', { id:'elena-raves',worldPersonId:'person--haus-raves--elena-raves',house: 'raves', resident: false, staff: false, referenceKeys: ['orestian', 'eirlys'] })
]);

export function vannPerson(key) {
  const found = VANN_PEOPLE.find(p => p.key === key);
  if (!found) throw new Error(`Unbekannte Vann-Person: ${key}`);
  return found;
}

export const VANN_MARRIAGES = Object.freeze([
  { id: 'marriage-iestyn-efa-vann', keys: ['iestyn', 'efa'], start: '1330', end: '1379', children: [] },
  { id: 'marriage-tudwal-gwenith-vann', keys: ['tudwal', 'gwenith'], start: '1670', end: '1720', children: ['brenn', 'madoc'] },
  { id: 'marriage-brenn-seren-vann', keys: ['brenn', 'seren'], start: '1695', children: ['cadeyrn', 'owain'] },
  { id: 'marriage-madoc-lowri-vann', keys: ['madoc', 'lowri'], start: '1702', children: ['edern', 'eirlys'] },
  { id: 'marriage-cadeyrn-angharad-vann', keys: ['cadeyrn', 'angharad'], start: '1717', children: ['aneirin', 'gwenna'] },
  { id: 'marriage-owain-meleri-vann', keys: ['owain', 'meleri'], start: '1726', children: ['rhys', 'teleri'] },
  { id: 'marriage-edern-elowen-vann', keys: ['edern', 'elowen'], start: '1733', children: ['celyn', 'iolo'], counterpart: 'haus-maerllys' },
  { id: 'marriage-orestian-eirlys-vann', keys: ['orestian', 'eirlys'], start: '1731', children: ['cassian', 'elena'], counterpart: 'haus-raves', destination: true },
  { id: 'marriage-aneirin-enid-vann', keys: ['aneirin', 'enid'], start: '1738', children: [], counterpart: 'haus-pendrwn' }
]);
