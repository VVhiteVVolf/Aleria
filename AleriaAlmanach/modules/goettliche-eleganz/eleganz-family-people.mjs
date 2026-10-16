export const ELEGANZ_MODULE_ID = 'goettliche-eleganz';
export const ELEGANZ_ART = './assets/goettliche-eleganz';
export const ELEGANZ_EMBLEMS = Object.freeze({
  raves: 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Raves.png',
  veltrane: 'assets/images/houses/Kaiserreich Argentum/Veltrane.png',
  maerllys: 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Maerllys.png',
  coeddu: 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Coeddu.png'
});
const person = (key, name, sex, birth, house, role, bio, appearance, options = {}) => ({
  key, id: `${key}-${house}`, worldPersonId: `person--haus-${house}--${key}-${house}`,
  name, sex, birth: String(birth), age: 1740 - birth, house, role, bio, appearance,
  portrait: `${ELEGANZ_ART}/portraits/${key}.png`, resident: true, ...options
});

// Canonical identities shared by the business, the family trees and publication.
export const ELEGANZ_PEOPLE = Object.freeze([
  person('matteo', 'Matteo Septimus Veltrane', 'male', 1633, 'veltrane', 'Handelskapitän · Begründer der Gwynthorer Linie',
    'Matteo kam mit Seide und Olivenöl nach Gwynthor und fand in Gwenoras Werkstatt einen Grund zu bleiben. Aus seinem kleinen Krämerladen und ihren Aufträgen wuchs ein Geschäft, das die Schiffe seines Stammhauses nie aus den Augen verlor.',
    'Man aged 38 in a historical portrait, angular kind face, straight long nose, silver swept-back hair fading to charcoal tips, blue eyes, short silver-to-dark beard. Navy late-medieval Italian merchant doublet, ivory collar, white-gold fastenings, no pirate clothing.', { death: '1708', portraitAge: 38, resident: false }),
  person('gwenora', 'Gwenora Maerllys', 'female', 1638, 'maerllys', 'Schneidermeisterin · Mitbegründerin des Geschäfts',
    'Gwenora verstand mehr von Stoff als die meisten Tuchhändler. Sie nähte für Gwynthors Bürger, handelte selbstbewusst mit dem fremden Kapitän und brachte ihm bei, dass ein gutes Geschäft am Saum ebenso leicht scheitert wie auf See.',
    'Elderly Cenyri woman aged 76 in a memorial portrait, entirely silver-grey hair in a braided bun, blue eyes, recognizably old face with forehead wrinkles, crow\'s feet, softened jaw and age lines on neck and hands, dignified confident expression. Burgundy wool gown, ivory sleeves, fine gold embroidery, no held objects.', { death: '1714', portraitAge: 76, resident: false, portrait: `${ELEGANZ_ART}/portraits/gwenora-v2.png` }),
  person('lorenzo', 'Lorenzo Cassian Raves', 'male', 1665, 'raves', 'Verstorbener Geschäftsinhaber',
    'Lorenzo machte aus dem Krämerladen ein Haus für gute Kleidung. Er gab den Maßstuben feste Werkstätten und ließ lieber eine Lieferung ausfallen, als zweifelhafte Seide unter dem Namen Raves zu verkaufen.',
    'Man aged 62 in a memorial portrait, silver hair fading into dark grey tips, silvery blue eyes, long refined nose, neat salt-and-pepper moustache, age lines. Purple Italian merchant robe, white-gold clasp, ivory shirt.', { death: '1734', portraitAge: 62, resident: false }),
  person('rhiain', 'Rhiain', 'female', 1674, 'raves', 'Altmeisterin · Schnittkunde & Ausbildung',
    'Rhiain erkennt einen verzogenen Fadenlauf mit einem Blick. Die Witwe des alten Inhabers gibt ihre Schnitte und ihre Geduld an die Lehrlinge weiter; den letzten Stich einer Festgarnitur prüft sie gern noch selbst.',
    '66-year-old Cenyri woman, dignified lined face, formerly copper red hair now mostly silver-grey in a braided bun, warm blue eyes, glasses on a fine chain. Elegant dark burgundy gown, cream linen sleeves, white-gold clasp, a folded pattern held at chest.', { maidenHouseUnknown: true }),
  person('livia', 'Livia Aurelia Raves', 'female', 1669, 'raves', 'Nach Venalys verheiratet',
    'Livia lebt seit ihrer Heirat in Venalys. Ihre Briefe sind voll bissiger Bemerkungen über neue Säume, schlechte Festkleider und Menschen, die beides tragen. Gelegentlich reist ein seltenes Muster mit der Post nach Gwynthor.',
    '71-year-old elegant woman, silver long hair fading to slate grey ends in a high braided coiffure, silvery pale blue eyes, pronounced cheekbones and mature wrinkles, sharp amused smile. Deep red late-medieval Italian gown, silver embroidery, tiny gold earrings.', { resident: false, destination: 'Venalys' }),
  person('flavia', 'Flavia Marina Raves', 'female', 1674, 'raves', 'Nach Tirnara verheiratet',
    'Flavia kehrte durch ihre Heirat in den Süden zurück. Sie hat ein gutes Gedächtnis für Stoffpreise und ein besseres für Gefälligkeiten. In Gwynthor weiß man, dass ihre seltenen Empfehlungen eine Prüfung wert sind.',
    '66-year-old elegant woman, silver bob with a clear grey-to-charcoal gradient at the ends, blue eyes, rounded face with visible age lines, discerning expression. Ivory and purple medieval Italian dress, white-gold filigree brooch, modest silk scarf.', { resident: false, destination: 'Tirnara' }),
  person('eleonora', 'Eleonora Cassia Raves', 'female', 1701, 'raves', 'Inhaberin · Entwurf & letzte Anprobe',
    'Eleonora führt die Göttliche Eleganz mit ruhiger Stimme und einem unerbittlichen Auge für den Sitz eines Gewandes. Sie berät selbst, zeichnet die besonderen Entwürfe und lässt keine Festgarnitur gehen, deren Träger sich darin verkleidet fühlt.',
    '39-year-old mature confident woman, refined long nose and expressive eyebrows, long silver hair fading progressively through grey to charcoal tips, silvery irises with pale blue rims. Ivory silk and fitted purple medieval Italian overdress, detachable sleeves, white-gold trim, ruby brooch.'),
  person('tiberian', 'Tiberian Raves', 'male', 1703, 'raves', 'Handelsmeister · Seeroute & Fortuna',
    'Tiberian hält die Verbindung zu den Veltrane und zum Markt der Fortuna. Er reist oft nach Tirnara, prüft Zusagen und sorgt dafür, dass aus einem guten Vertrag auch eine pünktliche Lieferung wird. Einen überladenen Laderaum erkennt er schneller als eine schlechte Ausrede.',
    '37-year-old man, family resemblance to Eleonora, silver shoulder-length hair fading to charcoal ends, vivid blue eyes with pale silver flecks, lean long face, short dark-tipped silver beard. Navy Italian merchant doublet, purple shoulder mantle, white-gold clasps, no pirate motifs.'),
  person('orestian', 'Orestian Raves', 'male', 1704, 'raves', 'Zunftsmeier · Kasse, Löhne & Verträge',
    'Orestian führt die Bücher, zahlt die Löhne und hält Maßbestellung und Rechnung zusammen. Die teuerste Seide beeindruckt ihn weniger als ein sauberer Beleg. Wenn er ein zweites Mal nachfragt, hat er den Fehler meist schon gefunden.',
    '36-year-old man, family resemblance to Eleonora, straight elegant nose, RARE Raves copper-red hair at roots fading progressively to pure WHITE tips, short neat hair with a longer white-tipped lock, clean shaven, silver eyes with pale blue rim. Ivory and muted burgundy Italian doublet, small white-gold buttons, slim ledger.'),
  person('luciano', 'Luciano Marcellus Veltrane', 'male', 1698, 'veltrane', 'Stoffmeister · Warenprüfung & Besätze',
    'Luciano prüft Seiden, Futter und die feinen Beschläge aus Gwynthors Werkstätten. Eleonoras Gemahl kann an einem Muster lange schweigen, bevor er eine einzige, sehr genaue Frage stellt. Auf zweifelhafte Färbungen reagiert er empfindlicher als auf einen Sturm.',
    '42-year-old elegant man from a distant Veltrane branch, silver wavy hair gradually darkening into charcoal tips, silvery gleaming eyes ringed pale blue, narrow jaw, distinctive arched nose, neat small goatee. Silver brocade waistcoat over ivory shirt, dark navy Italian overrobe, white-gold chain.'),
  person('maelwen', 'Maelwen Coeddu', 'female', 1713, 'coeddu', 'Empfangsmeisterin · Kundschaft & Termine',
    'Maelwen empfängt die Kundschaft und hält die Anproben im Takt. Sie kann eine verlegene Braut beruhigen und einem ungeduldigen Herrn höflich seinen Termin nennen. Tiberians Reisebriefe bewahrt sie zwischen den weniger dringlichen Bestellungen auf.',
    '27-year-old Cenyri woman, bright natural orange-ginger hair without magical gradient, braided and pinned neatly, green eyes, Coeddu family resemblance to Llywelyn in brows and cheekbones, freckles, assured smile. Elegant navy wool gown with purple sash, cream sleeves and restrained white-gold trim.', { id: 'maelwen-coeddu', worldPersonId: 'person--haus-coeddu--maelwen-coeddu', portrait: `${ELEGANZ_ART}/portraits/maelwen-v2.png` }),
  person('aurelio', 'Aurelio Raves', 'male', 1725, 'raves', 'Schneiderlehrling · Schnitt & Heftarbeit',
    'Aurelio lernt bei seiner Großmutter das Zuschneiden und Heften. Seine eigenen Entwürfe sind schon erstaunlich kühn; Rhiain lässt ihn danach besonders sorgfältig die geraden Nähte üben.',
    '15-year-old adolescent boy, recognizably son of Eleonora and Luciano, silver hair gradually darkening at the tips, blue eyes, youthful refined nose, no beard. Modest but expertly made ivory shirt and navy apprentice doublet, purple piping, age-appropriate proportions.'),
  person('lavinia', 'Lavinia Raves', 'female', 1731, 'raves', 'Tochter Eleonoras · Hauskind',
    'Lavinia sammelt die kleinsten hübschen Stoffreste und näht daraus Kleider für ihre Holzpuppe. Über den Geschmack ihrer Mutter hat sie bereits feste Ansichten, die sie beim Abendessen gern vorträgt.',
    '9-year-old girl, daughter of Eleonora and Luciano, silver long hair in two braids gradually darkening into grey tips, pale blue eyes, round childish cheeks, lively expression. Modest purple medieval child dress with ivory collar, white-gold little fastening, holding a tiny cloth doll at chest.', { resident: false, child: true }),
  person('serafina', 'Serafina Raves', 'female', 1734, 'raves', 'Tochter Tiberians · Hauskind',
    'Serafina zählt die kleinen Stoffballen im Schaufenster und wartet ungeduldig auf Tiberians Heimkehr. Aus jedem seiner Besuche soll er ihr eine Geschichte und einen besonders schönen Knopf mitbringen.',
    '6-year-old little girl, daughter of Tiberian and red-haired Maelwen, RARE copper-red hair fading progressively to WHITE tips in short soft curls, bright blue eyes, round childish features, gap-toothed happy smile. Modest ivory child dress with navy bodice and tiny purple ribbon, holding one large wooden button at chest.', { resident: false, child: true })
]);

export const eleganzPerson = key => {
  const person = ELEGANZ_PEOPLE.find(p => p.key === key);
  if (!person) throw new Error(`Unbekannte Raves-Person: ${key}`);
  return person;
};

export const ELEGANZ_MARRIAGES = Object.freeze({
  founders: { id: 'marriage-matteo-gwenora-raves', people: ['matteo', 'gwenora'], start: '1660', end: '1708', status: 'ended' },
  parents: { id: 'marriage-lorenzo-rhiain-raves', people: ['lorenzo', 'rhiain'], start: '1698', end: '1734', status: 'ended' },
  eleonora: { id: 'marriage-eleonora-luciano-raves', people: ['eleonora', 'luciano'], start: '1724', status: 'active' },
  tiberian: { id: 'marriage-tiberian-maelwen-raves', people: ['tiberian', 'maelwen'], start: '1733', status: 'active' }
});
