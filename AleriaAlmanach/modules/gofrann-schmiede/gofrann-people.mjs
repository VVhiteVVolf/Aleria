// Shared identities for the workshop, portraits and both family projections.
export const GOFRANN_MODULE_ID = 'zum-dritten-funken';
export const GOFRANN_TITLE = 'Zum Dritten Funken';
export const GOFRANN_ART = './assets/gofrann-schmiede';
export const GOFRANN_EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Gofrann.png';
export const TLAWD_EMBLEM = 'assets/images/houses/Llamreis Ankunft/haus-tlawd.png';
const person = (key, name, sex, birth, role, bio, appearance, options = {}) => {
  const death = options.death || '';
  const id = options.id || `${key}-gofrann`;
  const age = (death ? Number(death) : 1740) - birth;
  return Object.freeze({ key, id, worldPersonId: options.worldPersonId || `person--haus-gofrann--${id}`,
    name, sex, birth: String(birth), death, age, portraitAge: age, house: 'gofrann',
    role, bio, appearance, portrait: `${GOFRANN_ART}/portraits/${key}.png`,
    active: !death, staff: !death, maidenHouseUnknown: false, ...options });
};

export const GOFRANN_PEOPLE = Object.freeze([
  person('edern', 'Edern Gofrann', 'male', 1638, 'Früherer Harnischmeister',
    'Edern machte aus einer engen Esse eine Werkstatt, an deren Tür auch Ritter klopften. Bei ihm begann die Regel, dass ein Harnisch erst fertig ist, wenn sein Träger sich darin frei bewegen kann.',
    'Memorial portrait at his actual age of death, 76. Elderly broad-faced man, deep forehead and cheek wrinkles, entirely silver-grey tightly curled hair, a short square curly grey beard, clear blue eyes and a slightly crooked nose. Dark petrol wool work coat, plain cream collar, brown leather shoulder apron. Kindly serious expression, standing with relaxed arms.', { death: '1714', staff: false }),
  person('eirwen', 'Eirwen', 'female', 1643, 'Frühere Hüterin von Kasse und Vorräten',
    'Eirwen kannte den Wert eines guten Lederriemens und den Preis jedes Kohlenwagens. Ihre sauberen Bücher machten es möglich, eine schlechte Lieferung zurückzuweisen, ohne die nächste Esse kalt werden zu lassen.',
    'Memorial portrait at her actual age of death, 77. Clearly elderly woman, silver-grey hair in a loose braided bun with small curls at the temples, blue eyes, prominent smile lines and age lines at neck. Modest charcoal gown with petrol apron and cream linen cap, no beard, no held objects. Calm upright pose.',
    { death: '1720', maidenHouseUnknown: true, staff: false }),
  person('caradfan', 'Caradfan Gofrann', 'male', 1642, 'Früherer Klingenschmied',
    'Ederns jüngerer Bruder gab lieber einer Klinge den letzten Schliff, als lange über sie zu sprechen. Seine Werkbank blieb am Fenster; dort sah er jede Unebenheit, die das Licht der Esse verborgen hatte.',
    'Memorial portrait at his actual age of death, 70. Broad rounded elderly face, large blunt nose with a small healed notch, heavy lower eyelids, vivid blue eyes, deeply etched cheeks and forehead. Bald crown with sparse short tight silver-grey curls at the sides and back. Long grey walrus moustache drooping below the mouth corners, completely clean-shaven chin and jaw. Broad sturdy ageing build with rounded shoulders. Charcoal wool shirt, cream neckcloth and worn dark tan leather apron. Standing slightly toward image right with arms relaxed at his sides, no props. His own face, clearly distinct from his son Bleddyn.',
    { death: '1712', staff: false }),
  person('neryn-alt', 'Neryn', 'female', 1647, 'Frühere Vorsteherin der Verkaufsstube',
    'Neryn erinnerte sich an die Hand eines Kunden ebenso gut wie an seinen Namen. Sie ließ niemanden mit einem schlecht sitzenden Griff gehen und schickte ungeduldige Besteller mit derselben Freundlichkeit wieder zur Bank.',
    'Memorial portrait at her actual age of death, 78. Elderly woman with a round face, pronounced wrinkles, gentle blue eyes, completely grey hair softly curled around the forehead and gathered at the nape. Muted copper-brown medieval wool dress, charcoal sleeveless overdress, cream scarf. Small amused smile, standing in a simple three-quarter pose, no beard or objects.',
    { death: '1725', maidenHouseUnknown: true, staff: false }),
  person('gethin', 'Gethin Gofrann', 'male', 1669, 'Leitender Inhaber · Harnischmeister',
    'Gethin führt die Werkstatt mit einer Stimme, die selten laut werden muss. Er prüft Schulter, Gelenk und Nietung selbst. Einen guten Auftrag nimmt er gern an; einen unmöglichen Termin verspricht er auch einem Ritter nicht.',
    '71-year-old actively working master armourer. Broad stocky shoulders, heavy square jaw, large rounded nose, thick silver-grey tightly curled hair with receding temples, full short curly grey beard, vivid blue eyes, deep age lines and thick brows. Charcoal linen shirt with sleeves simply rolled below elbows, dark petrol leather-edged work waistcoat, worn brown leather apron, a tiny copper anvil clasp. Standing squarely, hands relaxed below the crop, a warm stubborn smile.',
    { head: true }),
  person('teleri', 'Teleri Gofrann', 'female', 1673, 'Hausmeierin · Kasse und Löhne',
    'Teleri hält Löhne, offene Rechnungen und den Anteil der Tlawd auseinander, ohne sich in den Zahlen zu verlieren. Wer nach einer langen Woche seinen Lohn abholt, weiß ihre Pünktlichkeit zu schätzen.',
    '67-year-old mature woman, clearly elderly with natural wrinkles and softening jaw, entirely grey hair in a neat braided crown, blue eyes, formerly copper-haired Cenyri, composed alert expression. Deep petrol medieval wool gown, cream underdress, narrow copper-brown belt, plain small brooch. Standing with loosely folded hands low at the waist, no beard or props.',
    { maidenHouseUnknown: true }),
  person('bleddyn', 'Bleddyn Gofrann', 'male', 1672, 'Mitinhaber · Waffenmeister der Schmiede',
    'Bleddyn hört beim Schleifen, wann eine Klinge seine Aufmerksamkeit verlangt. Er neckt Gethin seit Kindertagen und hält ihm bei schwierigen Entscheidungen den Rücken frei. Den Lehrlingen erklärt er einen Fehler ein zweites Mal, aber er lässt ihn nicht im fertigen Stück stehen.',
    '68-year-old actively working master bladesmith, noticeably different from his cousin Gethin. Tall lean build, long angular face, high cheekbones, narrow aquiline nose, blue eyes, swept-back silver-grey tight curls, long separated grey moustache and a neatly forked curly grey beard. Visible forehead wrinkles and crows feet. Off-white linen shirt, copper-brown leather apron over a muted russet waistcoat, simple dark belt. Standing slightly turned left, one arm resting loosely at the waist, playful restrained smile, no objects.'),
  person('mareda', 'Mareda Gofrann', 'female', 1676, 'Verkaufsmeisterin · Aufträge und Stammkundschaft',
    'Mareda kennt die Stammkunden und lässt sich vor einer Bestellung erzählen, wofür eine Waffe gebraucht wird. Sie kann einen aufgeregten jungen Söldner beruhigen und einem reichen Käufer freundlich erklären, weshalb sein Harnisch eine weitere Anprobe braucht.',
    '64-year-old older woman with grey wavy hair pinned in a low bun, clear blue eyes, broad kind face with mature lines around mouth and eyes. Dark charcoal medieval dress, petrol bodice, cream sleeves and small copper fastening. Standing with one arm relaxed and the other hand resting simply at the belt, confident welcoming expression. No beard or objects.',
    { maidenHouseUnknown: true }),
  person('einion', 'Einion Gofrann', 'male', 1696, 'Werkstattmeier · Organisation und Lieferwege',
    'Einion bringt Aufträge, Material und verfügbare Hände zusammen. Er geht lieber selbst zur Warenannahme, als eine fehlende Lieferung im Buch schönzureden. Mit Renfri führt er den Teil des Hauses, in dem aus einer Zusage ein verlässlicher Termin wird.',
    '44-year-old man, Gethins son. Broad calm face, rounded family nose, vivid blue eyes, dense dark chestnut corkscrew curls cut to ear length, short curly brown beard with the first few grey hairs. Dark petrol medieval wool doublet over a cream shirt, copper buttons, plain brown belt, no apron. Standing three-quarter right with relaxed shoulders and arms at sides, composed approachable expression.',
    { id: 'einion', worldPersonId: 'person--family-tree--einion' }),
  person('renfri', 'Renfri Tlawd', 'female', 1699, 'Empfang und Rüstungsanproben',
    'Renfri nimmt Maßtermine auf und weiß, wann ein Kunde eine klare Antwort braucht. Die Tochter der Tlawd kennt den Anspruch ihrer ritterlichen Verwandtschaft; in der Werkstatt zählt für sie, ob ein Stück am Ende richtig sitzt.',
    '', { id: 'renfri-tlawd', worldPersonId: 'person--haus-tlawd--renfri-tlawd', house: 'tlawd', existingPortrait: true,
      portrait: '../Stammbäume/assets/images/portraits/haus-tlawd/renfri-tlawd.jpg' }),
  person('idnerth', 'Idnerth Gofrann', 'male', 1702, 'Harnischgeselle · Platten und Gelenke',
    'Idnerth formt Platten mit Geduld und prüft die Beweglichkeit lieber einmal zu oft. Seinen Vater Gethin überredet er zu neuen Schnitten, indem er ein sauberes Muster vorlegt.',
    '38-year-old adult man, Einions younger brother and Gethins son. Chestnut tight curls cut short at the sides, blue eyes, broad jaw, short curly moustache with clean-shaven chin, slightly uneven eyebrows. Cream rolled-sleeve shirt, charcoal leather work apron, petrol neckcloth. Strong ordinary build, standing slightly turned left, one hand resting low on his belt, thoughtful expression, no held tools.'),
  person('ceryth', 'Ceryth Gofrann', 'female', 1705, 'Verkauf · Abholung und Zubehör',
    'Ceryth richtet fertige Bestellungen zur Abholung her und merkt sich, welcher Riemen zu welchem Kunden gehört. Sie erklärt Pflege und Verschlüsse mit einer Geduld, die Idnerth an sich selbst gelegentlich vermisst.',
    '35-year-old adult Cenyri woman, copper-red softly wavy hair braided over one shoulder, blue eyes, fine freckles, oval face with a straight nose. Modest warm grey medieval dress, petrol sleeveless overdress, brown leather belt with a small copper clasp. Standing naturally facing slightly right, arms relaxed, gentle lively smile, no beard or objects.',
    { maidenHouseUnknown: true }),
  person('ulaena', 'Ulaena Gofrann', 'female', 1699, 'Nach Haus Tlawd verheiratet',
    'Ulaena lebt mit Lludd bei den Tlawd. Sie kennt noch den Rhythmus der alten Werkstatt und schaut bei Besuchen zuerst nach ihrem Vater Bleddyn, bevor sie sich nach den Neuigkeiten erkundigt.',
    '41-year-old adult woman, Bleddyns daughter. Dense dark chestnut naturally tight curls pinned into a loose braided bun, a few curls at the temples, clear blue eyes, long family nose, refined angular face with subtle mature smile lines. Medieval burgundy gown with black fitted bodice and cream sleeves, modest square neckline, a small round copper anvil pendant. Standing three-quarter left with hands loosely together below the crop, poised warm expression, no tools or beard.',
    { id: 'ulaena', worldPersonId: 'person--family-tree--ulaena', staff: false }),
  person('lludd', 'Lludd Tlawd', 'male', 1698, 'Ulaenas Gemahl · Haus Tlawd', '', '',
    { id: 'lludd-tlawd', worldPersonId: 'person--haus-tlawd--lludd-tlawd', house: 'tlawd', staff: false, existingPortrait: true,
      portrait: '../Stammbäume/assets/images/portraits/haus-tlawd/lludd-tlawd.jpg' }),
  person('madoc', 'Madoc Gofrann', 'male', 1704, 'Klingengeselle · Härten und Schleifen',
    'Madoc arbeitet neben Bleddyn an Klingen und Beschlägen. Er ist schneller im Gespräch als sein Vater, nimmt sich am Schleifstein aber dieselbe Ruhe. Die erste brauchbare Klinge eines Lehrlings legt er gern für den Meister sichtbar hin.',
    '36-year-old adult man, Bleddyns son and Ulaenas younger brother. Lean face with high cheekbones and narrow family nose, bright blue eyes, medium-length dark brown tight curls tied very loosely at the nape, small curly chin beard and short moustache. Muted rust linen shirt, deep petrol leather-trimmed work vest and plain brown apron. Standing in a relaxed frontal pose, arms low and an easy crooked smile, no held objects.'),
  person('aneira', 'Aneira Gofrann', 'female', 1708, 'Warenannahme und Vorräte',
    'Aneira prüft Leder, Kohlen und Kleinteile, bevor sie ins Lager wandern. Eine sauber verschnürte Lieferung beeindruckt sie erst, wenn auch ihr Inhalt stimmt. Mit Einion hält sie die Wege zu den Zulieferern offen.',
    '32-year-old adult Cenyri woman, dark auburn curly bob, blue eyes, round face with a small upturned nose and faint freckles, lively attentive expression. Plain cream linen blouse, charcoal medieval fitted wool vest, copper-brown working apron with no visible tools. Standing slightly turned right, one relaxed hand low against the apron seam, no objects or beard.',
    { maidenHouseUnknown: true }),
  person('cynlas', 'Cynlas Gofrann', 'male', 1720, 'Junger Klingengeselle',
    'Cynlas hat seine Lehrjahre hinter sich und übernimmt einfache Klingen und die gründliche Schlussreinigung. Bei schwierigen Arbeiten sieht Bleddyn noch über seine Schulter; Cynlas lässt ihn gewähren und fragt nach.',
    '20-year-old young adult man, Einion and Renfris son. Dark chestnut tight curls above the ears, blue eyes, angular brows inherited from his mother, youthful jaw, clean shaven. Simple charcoal work tunic with cream neckline, short petrol leather apron, plain belt. Standing with relaxed arms and a slightly shy proud smile, no tools.'),
  person('eluned', 'Eluned Gofrann', 'female', 1725, 'Schreiblehrling · Auftragsbücher',
    'Eluned lernt bei Teleri, aus einer hastigen Bestellung einen lesbaren Eintrag zu machen. Sie fragt lieber einmal nach einer Zahl, als sie später aus dem Gedächtnis einzusetzen.',
    '15-year-old teenage girl, clearly her actual age, Einion and Renfris daughter. Dark chestnut tightly curled shoulder-length hair gathered with a plain ribbon, clear blue eyes, youthful oval face, modest charcoal wool dress over a cream long-sleeve underdress, small petrol sash. Standing in a quiet daylit room, arms relaxed and an attentive small smile. Modest age-appropriate clothes, no adult styling, beard or objects.'),
  person('tegwyn', 'Tegwyn Gofrann', 'male', 1726, 'Schmiedelehrling · Grundarbeiten',
    'Tegwyn lernt bei Idnerth Werkzeugpflege, saubere Markierungen und die Geduld vor dem nächsten Arbeitsschritt. Einen gelungenen Niet zeigt er seinem Großvater noch am selben Abend.',
    '14-year-old teenage boy, clearly young adolescent, Idnerth and Ceryths son. Thick brown corkscrew curls, blue eyes, a few freckles, narrow youthful shoulders and a soft childlike jaw, no facial hair. Modest russet work tunic and simple short dark leather apron. Standing casually in a neutral bright wood interior, arms at sides, earnest curious expression, no tools or active forge.'),
  person('rhoswen', 'Rhoswen Gofrann', 'female', 1731, 'Hauskind',
    'Rhoswen erkennt die Stammkunden an ihren Schritten. Nach dem Unterricht erzählt sie Ceryth, welche Namen sie inzwischen selbst lesen kann.',
    'Nine-year-old little girl, Idnerth and Ceryths daughter. Brown tight ringlet curls to shoulder length, blue eyes, freckles and round child cheeks. Modest cream and muted petrol medieval childs dress, plain ribbon. Standing naturally in a safe quiet family room, arms relaxed, curious open smile. Small child proportions, no apron, tools, adult styling or beard.',
    { staff: false }),
  person('emrys', 'Emrys Gofrann', 'male', 1728, 'Botenlehrling · Kontor und kurze Wege',
    'Emrys lernt Lesen, Rechnen und die vertrauten Wege zwischen Kontor und Verkaufsstube. Für einen kurzen Botengang bekommt er eine klare Nachricht und danach Zeit, seine Schriftübungen zu beenden.',
    'Twelve-year-old boy, clearly a child, Madoc and Aneiras son. Soft dark brown tight curls, clear blue eyes, youthful round face, no facial hair. Modest cream medieval shirt with a plain charcoal sleeveless wool vest and petrol sash. Standing with relaxed arms in a safe quiet daylight family interior, friendly attentive expression. No tools, forge work or adult proportions.'),
  person('neryn', 'Neryn Gofrann', 'female', 1734, 'Hauskind',
    'Neryn hört am liebsten Bleddyns Geschichten, wenn die Werkstatt geschlossen ist. Den dritten Funken auf dem Hausschild zählt sie jedes Mal mit.',
    'Six-year-old little girl, unmistakably a small child, Madoc and Aneiras daughter. Short chestnut tight curls, bright blue eyes, round child cheeks and little upturned nose. Modest muted russet medieval childs dress with cream collar. Standing with a slight curious head tilt in a quiet bright family room, tiny relaxed hands below crop. No tools, working apron, adult styling or beard.',
    { staff: false })
]);

const lookup = new Map(GOFRANN_PEOPLE.map(p => [p.key, p]));
export function gofrannPerson(key) {
  const value = lookup.get(key);
  if (!value) throw new Error(`Unbekannte Gofrann-Person: ${key}`);
  return value;
}
export const GOFRANN_MARRIAGES = Object.freeze([
  { id: 'marriage-edern-eirwen-gofrann', keys: ['edern','eirwen'], start: '1667', end: '1714', children: ['gethin'] },
  { id: 'marriage-caradfan-neryn-gofrann', keys: ['caradfan','neryn-alt'], start: '1669', end: '1712', children: ['bleddyn'] },
  { id: 'marriage-gethin-teleri-gofrann', keys: ['gethin','teleri'], start: '1693', children: ['einion','idnerth'] },
  { id: 'marriage-bleddyn-mareda-gofrann', keys: ['bleddyn','mareda'], start: '1696', children: ['ulaena','madoc'] },
  { id: 'marriage-renfri-einion', keys: ['renfri','einion'], start: '1718', children: ['cynlas','eluned'], counterpart: 'haus-tlawd' },
  { id: 'marriage-idnerth-ceryth-gofrann', keys: ['idnerth','ceryth'], start: '1724', children: ['tegwyn','rhoswen'] },
  { id: 'marriage-lludd-ulaena', keys: ['lludd','ulaena'], start: '', children: [], counterpart: 'haus-tlawd' },
  { id: 'marriage-madoc-aneira-gofrann', keys: ['madoc','aneira'], start: '1726', children: ['emrys','neryn'] }
]);
