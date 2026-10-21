// Canonical households, shared by the Almanach entries and genealogy records.
// Employment is a connection, never ownership of a workplace.
export const HOMES_ART = './assets/gwynthor-heime';
const person = (id, name, sex, age, culture, role, bio, appearance, options = {}) => ({
  id, name, sex, age, birth: String(1740 - age), culture, role, bio, appearance, ...options
});
export const GWYNTHOR_HOUSEHOLDS = [
  {
    slug: 'fearnan', surname: 'Fearnan', district: 'Hafenviertel', marriageYear: '1728',
    summary: 'Eine albische Fischerfamilie und ihr bescheidenes Zuhause nahe den Docks.',
    crestDescription: 'Ein fröhlicher Baum in mattem Grün auf braunem Holz; schlichter geschlossener Holzrand.',
    story: [
      'Zwischen den schmalen Gassen hinter den Docks steht das kleine Heim der Fearnan. Eoghan und Muireann kamen 1728 aus Leitheach nach Gwynthor. Ihre beiden Töchter sind hier geboren; für sie beginnt die Heimat an der Hafentreppe.',
      'Eoghan arbeitet als Fischer von den Docks aus. Muireann führt den Haushalt, flickt Kleidung und teilt den Tagesfang so ein, dass auch morgen etwas auf den Tisch kommt. Für große Anschaffungen bleibt wenig übrig. Das niedrige Haus gehört der Familie und ist ihr einziger größerer Besitz; es ist sauber gehalten und nur mit dem Nötigsten eingerichtet.',
      'Den fröhlichen Baum auf dem kleinen Holzzeichen über der Tür haben die Mädchen mit ausgemalt. Nessa behauptet, dass er lächelt, wenn ihr Vater heil vom Wasser zurückkommt.'
    ],
    room: 'Eine niedrige Wohnstube mit kleinem Herd, grobem Tisch, vier ungleichen Hockern und einer einzigen Truhe. Zwei schmale Schlafnischen liegen hinter Leinentüchern; die Mädchen teilen ihre. Am Haken trocknen Eoghans Mantel und geflickte Netze. Durch das kleine Fenster hört man die Rufe von den Docks.',
    hooks: ['Nach einem Familienausflug fehlt die Metallschatulle unter dem Elternbett: die letzte Kreditrate und sämtliche Ersparnisse sind gestohlen.', 'Der Geld- und Pfandverleiher bietet neue Kreditbedingungen gegen den Verkauf des Hauses an; die Familie bittet vor einer Unterschrift um Nachforschungen.'],
    people: [
      person('eoghan', 'Eoghan Fearnan', 'male', 36, 'Albe · Leitheach', 'Fischer an den Docks', 'Eoghan spricht ruhig und lacht schnell, solange das Wetter mitspielt. Er hält seine Netze sorgfältiger instand als seinen Mantel und kommt nach dem Anlanden möglichst direkt nach Hause.', '36-year-old human Alba fisherman, dark brown short wavy hair, hazel-brown eyes, broad nose, short dark beard. Lean weathered face, gentle crooked smile. Faded moss wool tunic and patched grey-brown sleeveless coat, relaxed standing chest-up, one hand loosely holding a folded net over his shoulder. Simple harbor-home doorway.'),
      person('muireann', 'Muireann', 'female', 34, 'Albin · Leitheach', 'Hausfrau', 'Muireann führt den kleinen Haushalt mit Geduld und einem genauen Blick für Vorräte. Ihre Töchter dürfen widersprechen, solange sie danach trotzdem die nassen Schuhe vor dem Herd ausziehen.', '34-year-old human Alba woman, deep chestnut brown hair in one low braid, warm brown eyes, narrow nose, oval face. Modest ochre wool dress, off-white linen apron, rolled sleeves. Relaxed standing waist-up, holding folded mended linen, quiet amused expression. Sparse plaster-and-timber room.', { married: true }),
      person('eithne', 'Eithne Fearnan', 'female', 9, 'Albisch · in Gwynthor geboren', 'Ältere Tochter', 'Eithne zählt die heimkehrenden Boote und möchte jede Leine richtig benennen. Ihrer kleinen Schwester erklärt sie den Hafen mit großer Ernsthaftigkeit, auch wenn sie selbst gerade erst gefragt hat.', 'Nine-year-old human Alba girl, clearly childlike proportions, dark brown wavy shoulder-length hair in two loose braids, brown eyes like her parents. Plain faded blue long-sleeved wool dress, cream collar. Standing chest-up holding a tiny homemade wooden boat, earnest curious face. Modest family home. Fully modest ordinary child clothing.'),
      person('nessa', 'Nessa Fearnan', 'female', 7, 'Albisch · in Gwynthor geboren', 'Jüngere Tochter', 'Nessa redet mit dem Baum auf dem Türzeichen und sammelt flache Kiesel für ihren Vater. Bei Fremden versteckt sie sich zunächst hinter Muireann; nach wenigen Minuten fragt sie ihnen Löcher in den Bauch.', 'Seven-year-old human Alba girl, clearly young child with round cheeks, dark chestnut curly bob, large warm brown eyes, cheerful small tooth-gap smile. Plain russet long-sleeved dress with patched elbows, linen collar. Standing upper-body portrait holding one smooth beach pebble in both hands. Simple warm cottage wall. Fully modest ordinary child clothing.')
    ]
  },
  {
    slug: 'torvik', surname: 'Torvik', district: 'Marktviertel', marriageYear: '1727',
    summary: 'Ein aldrimarischer Schmiedegehilfe, seine albische Frau und ihr elfjähriger Sohn.',
    crestDescription: 'Ein kleiner cremefarbener Hammer auf braunem Holz; schlichter geschlossener Holzrand.',
    story: [
      'In einer Seitengasse des Marktviertels wohnen Haldor Torvik, seine Frau Maonaid und ihr Sohn Iver. Das schmale Fachwerkhaus hat eine feste Herdstelle, eine gemeinsame Wohnküche und zwei kleine Schlafkammern unter dem Dach.',
      'Haldor stammt aus Aldrimar und arbeitet als Schmiedegehilfe in einer der vielen Werkstätten des Marktviertels. Er trägt Material, bereitet das Feuer vor und hilft bei einfachen Arbeiten. Eine eigene Schmiede besitzt er nicht. Maonaid stammt aus Leitheach und führt den Haushalt.',
      'Das Paar richtet sich mit gewöhnlichem Hausrat ein, ersetzt kaputte Dinge nach und nach und legt nach Möglichkeit etwas zurück. Iver kennt am Klang, wann sein Vater von der Arbeit kommt: Haldor klopft den Ruß stets dreimal an der Türschwelle von den Stiefeln.'
    ],
    room: 'Die Wohnküche ist schlicht und ordentlich: ein Herd an der Rückwand, ein geschrubbter Tisch mit Bank, ein Brett für Zinngeschirr und ein Wassereimer neben der Tür. Eine schmale Holztreppe führt zu den Schlafkammern. Auf dem Fenstersims liegt Ivers angefangene Holzschnitzerei; Arbeitskleidung hängt getrennt vom sauberen Hauszeug.',
    hooks: ['Haldor ist seit dem vergangenen Lyristag vermisst; nach einem Streit um Lohn und Überstunden fand er keinen freien Gesuchsplatz am Grafenhof.', 'Im Kleinen Durst erzählte er laut dem Wirt von einer neuen Arbeitsstelle und brach auf; Maonaid bietet ihr Familienamulett und nötigenfalls dreißig Kupfer für seine sichere Rückkehr.'],
    people: [
      person('haldor', 'Haldor Torvik', 'male', 32, 'Aldrimarer', 'Schmiedegehilfe im Marktviertel', 'Haldor ist kräftig, geduldig und stolz auf eine ordentlich erledigte Arbeit. Er spart auf bessere eigene Werkzeuge und bleibt Gehilfe, bis er sich eine wirkliche Ausbildung leisten kann.', '32-year-old human Aldrimar man, broad square jaw, straight flax-blond hair tied in a short low tail, light blue eyes, thick blond moustache with otherwise shaved face. Strong working build, calm reserved half smile. Charcoal wool shirt, worn leather work apron, relaxed standing chest-up, wiping a sooty hand on a rag. Ordinary market-house door.'),
      person('maonaid', 'Maonaid', 'female', 30, 'Albin · Leitheach', 'Hausfrau', 'Maonaid kennt die Händler der Nachbargassen und lässt sich weder schlechtes Mehl noch ein falsches Gewicht andrehen. Haldors Sturheit begegnet sie mit trockenem Humor und einem zweiten Teller Eintopf.', '30-year-old human Alba woman, almost black dark-brown sleek hair swept into a low coil, warm hazel eyes, pronounced brows, softly angular face. Muted plum wool dress with simple cream linen kerchief at neck, no jewels. Relaxed standing upper-body portrait, one hand on wooden chair back, raised eyebrow and dry knowing smile. Simple tidy home.', { married: true }),
      person('iver', 'Iver Torvik', 'male', 11, 'Aldrimarisch-albische Familie', 'Sohn', 'Iver schnitzt kleine Boote und fragt seinen Vater nach jedem Werkzeug. Ob er später selbst ein Handwerk lernt, steht noch offen. Vorerst darf er in der Schmiede nur unter Aufsicht zuschauen.', 'Eleven-year-old human boy, clearly childlike face, dark sandy-blond straight tousled hair combining blond father and brunette mother, light hazel eyes, square little chin. Plain olive tunic, cream undershirt, no armor. Standing chest-up with a small unfinished wooden toy and delighted sideways smile. Simple timber house interior. Ordinary fully modest child clothing.')
    ]
  },
  {
    slug: 'celynfor', surname: 'Celynfor', district: 'Zwischen Hafen und Marktviertel', marriageYear: '1739',
    summary: 'Ein jung verheiratetes cenyrisches Paar, zwei Arbeitswege und ein Hund vor dem Herd.',
    crestDescription: 'Ein kleines ockerfarbenes Ruderboot auf braunem Holz; schlichter geschlossener Holzrand.',
    story: [
      'Gwydan und Llinos Celynfor haben 1739 geheiratet. Ihr kleines gepachtetes Haus liegt zwischen Hafen und Marktviertel, sodass Gwydan morgens zur Werft und Llinos zur Krummen Kanne gehen kann.',
      'Gwydan ist Schiffsbaugeselle und arbeitet an Handelsschiffen. Er bessert Planken aus, passt Spanten ein und nimmt die Geduld seines Handwerks mit nach Hause. Llinos arbeitet weiterhin als Hausmagd der Krummen Kanne: Wasser, Lampen und das Sauberhalten der Schankstube gehören zu ihrem Dienst.',
      'Das meiste im Haus ist gebraucht oder selbst zurechtgemacht. Ein Tisch, zwei Stühle und eine Bettstatt reichen vorerst. Ihr Hund Spant nimmt die einzige freie Stelle am Herd für sich in Anspruch. Kinder haben die beiden noch nicht.'
    ],
    room: 'Die kleine Wohnstube dient zugleich als Küche. Ein einfaches Doppelbett steht hinter einem Leinenvorhang, daneben die gemeinsame Truhe. Gwydans Werkzeug hängt trocken an einem Brett; Llinos hat ein blaues Tuch ans Fenster gehängt. Vor dem Herd liegt Spants geflickte Decke. Die Dielen sind frisch gescheuert, und durch die angelehnte Tür zieht der Geruch von Holz und Hafenwasser.',
    hooks: ['Gwydan möchte wissen, weshalb ein vermeintlich gewöhnliches Reparaturschiff seine neuen Planken nur bei Nacht erhält.', 'Spant bringt vom Spaziergang einen fremden Handschuh heim; Llinos erkennt die auffällige Stickerei aus der Kanne.'],
    people: [
      person('gwydan', 'Gwydan Celynfor', 'male', 31, 'Cenyri · Gwynthor', 'Schiffsbaugeselle', 'Gwydan ist gelassen und sorgfältig, mit einem leisen Humor, der Llinos zuverlässig zum Lachen bringt. Daheim baut er aus erlaubten Holzresten kleine nützliche Dinge und prüft jeden Stuhl, bevor sich jemand daraufsetzt.', '31-year-old human Cenyri journeyman shipwright, chestnut-red slightly wavy hair cut short at sides and swept sideways, warm brown eyes, long face, clean-shaven with only short russet sideburns. Lean strong shoulders. Faded teal wool waistcoat, cream rolled-sleeve shirt, plain leather belt. Relaxed standing waist-up, one hand resting on a small wooden plane held at hip, soft closed-mouth smile. Simple home by harbor, no shipowner finery.'),
      person('llinos', 'Llinos Celynfor', 'female', 21, 'Cenyri · Gwynthor', 'Hausmagd der Krummen Kanne', 'Llinos bringt in der Krummen Kanne Wasser, füllt die Lampen und hält die Schankstube sauber. Ihr freches Lächeln hat sie auch nach der Hochzeit behalten. Zuhause schimpft sie mit Spant ähnlich wie bei der Arbeit mit dem Kater.', 'Vorhandenes Porträt: kupferrote hochgesteckte Locken, grüne Augen, Sommersprossen, blaues Arbeitskleid, braune Schürze und Öllampe.', { married: true, worldPersonId: 'person--krumme-kanne--llinos', portrait: './assets/krumme-kanne/portraits/llinos.png', workplaceModuleId: 'modul-1781474092957' })
    ],
    pet: { id: 'spant', name: 'Spant', age: 2, species: 'Brág', role: 'Familienhund', bestiary: '../Bestiarium/tiere/vieh/haustiere/hunde/brag/index.html',
      bio: 'Der kleine Brág ist neugierig, verspielt und bei bekannten Gesichtern sofort freundlich. Bei Schritten vor der Tür meldet er sich kurz und wartet dann auf seine Menschen. Er ist Familienhund, kein ausgebildeter Wachhund.',
      appearance: 'One two-year-old Brág family dog, small-to-medium compact robust body, rough weatherproof warm ochre-brown coat, half-upright slightly folded ears, bright friendly dark eyes, short scruffy muzzle. Sitting loosely beside a simple home hearth on a patched wool blanket, head tilted curiously, plain worn leather collar. Full dog visible, quiet sparse room.' }
  }
].map(home => ({ ...home, people: home.people.map(p => ({ ...p,
  worldPersonId: p.worldPersonId || `person--haus-${home.slug}--${p.id}`,
  portrait: p.portrait || `${HOMES_ART}/${home.slug}/${p.id}.png`
})) }));
