// Cenyr's folk dance: editorial content using the existing standard-page template.
// Registration runs after data/sections.js and before the archive/store initialize.
// Heledd's existing archive identity is reused; this module never writes character data.
(function registerDrachentanzVolkstanz() {
  const id = 'drachentanz-volkstanz';
  if (SECTIONS.some(section => section.entries.some(entry => entry.id === id))) return;

  const tab = 'Völker & Kulturen';
  const path = ['Cenyr', 'Bräuche und Riten'];
  let section = SECTIONS.find(candidate => candidate.tab === tab
    && candidate.path?.length === path.length
    && path.every((part, index) => candidate.path[index] === part));
  if (!section) {
    section = {
      key: 'Bräuche und Riten',
      tab,
      path,
      desc: 'Feste, Tänze und überlieferte Bräuche Cenyrs',
      entries: []
    };
    SECTIONS.push(section);
  }

  const assetRoot = './public/assets/drachentanz-volkstanz';
  const heledd = {
    id: 'J4wpNQON98GsdPzsaIUk',
    name: 'Heledd (Geb. Gwyvern) Draig',
    title: 'Hofdame des Hauses Draig, Abergwint'
  };

  function createPage({ illustration, paragraphs, comment, mood, ...page }) {
    return {
      ...page,
      image: `${assetRoot}/${illustration}.png`,
      imageSemiLandscape: true,
      imageWidth: 42,
      imageFit: 'contain',
      imagePosition: 'center',
      description: paragraphs.join('<br><br>'),
      commentDivider: true,
      commentSequence: [{
        narrator: false,
        side: 'left',
        name: heledd.name,
        title: heledd.title,
        portrait: `${assetRoot}/heledd-${mood}.png`,
        text: comment
      }]
    };
  }

  const chapters = [
    {
      "pageTitle": "I. — Eine lebendige Tradition",
      "illustration": "dorffest",
      "paragraphs": [
        "Der <strong>Drachentanz</strong> ist ein traditioneller Volkstanz der Cenyri, dessen Ursprünge bis in die alten Tage Avallorns zurückreichen. Seit Jahrtausenden wird er bei Festen, Hochzeiten und anderen gesellschaftlichen Anlässen getanzt und gehört zu den ältesten bis heute lebendigen Traditionen des cenyrischen Volkes.",
        "Es handelt sich dabei nicht um einen einzelnen, unveränderlichen Tanz mit einer festgelegten Abfolge von Bewegungen. Vielmehr bezeichnet der Begriff eine ganze Familie miteinander verwandter Gruppen- und Reihentänze, die auf denselben grundlegenden Schritten, Drehungen und Figuren beruhen.",
        "Je nach Region und Anlass können sich diese Tänze erheblich voneinander unterscheiden. Manche werden in zwei einander gegenüberstehenden Reihen getanzt, andere in langen Ketten oder großen Kreisen. Wieder andere wechseln während des Tanzes mehrfach zwischen diesen Formationen. Dennoch sind ihre gemeinsamen Grundlagen so deutlich, dass ein Cenyri gewöhnlich auch an einem ihm unbekannten Drachentanz teilnehmen kann, sobald er dessen besondere Figuren verstanden hat."
      ],
      "comment": "Du willst wissen, wie man den Drachentanz lernt? Such dir ein Fest, stell dich in die Reihe und versuche, deinem Nachbarn nicht auf die Füße zu treten. Den Rest lernst du unterwegs.",
      "mood": "freundlich",
      "stats": [
        [
          "Überlieferung",
          "Seit den alten Tagen Avallorns"
        ],
        [
          "Volk",
          "Cenyri"
        ],
        [
          "Tanzform",
          "Gruppen- und Reihentänze"
        ],
        [
          "Formationen",
          "Reihen, Ketten und Kreise"
        ]
      ]
    },
    {
      "pageTitle": "II. — Gemeinsam in Bewegung",
      "illustration": "dorffest",
      "paragraphs": [
        "Der Drachentanz beginnt häufig vergleichsweise langsam. Die Tänzer finden ihren Rhythmus, bewegen sich aufeinander zu und wieder voneinander fort, wechseln Plätze oder drehen sich gemeinsam mit einem Partner. Mit zunehmender Dauer steigern die Musiker gewöhnlich das Tempo und die Bewegungsfolgen werden schneller und anspruchsvoller.",
        "Dabei bleibt ein Tänzer nur selten lange am selben Ort. Reihen bewegen sich gegeneinander, lösen sich auf und entstehen neu. Tänzer kreuzen den Weg anderer, wechseln ihre Partner, drehen sich umeinander oder werden für einige Schritte Teil eines Kreises, bevor sich die Formation erneut verändert. Besonders ausgelassene Varianten können eine ganze Halle oder einen Dorfplatz in Bewegung versetzen.",
        "Gerade diese gemeinsame Bewegung bildet das Herz des Drachentanzes. Ein Tänzer muss nicht nur wissen, wohin er selbst seinen nächsten Schritt setzt. Er muss ebenso wahrnehmen, wo sich die Menschen um ihn herum befinden. Abstand, Rhythmus und Bewegung der anderen bestimmen die eigene Bewegung mit. Wer ausschließlich auf seine Füße achtet, wird früher oder später mit jemand anderem zusammenstoßen.",
        "Deshalb lernen viele Cenyri den Drachentanz bereits als Kinder. Zunächst folgen sie älteren Geschwistern, Eltern oder anderen Erwachsenen und beherrschen kaum mehr als einige einfache Schritte. Mit zunehmendem Alter kommen Drehungen, Partnerwechsel und kompliziertere Figuren hinzu.",
        "Eine formelle Ausbildung ist dafür gewöhnlich nicht notwendig. Der Drachentanz wird getanzt und wer oft genug mittanzt, lernt ihn."
      ],
      "comment": "Du brauchst nicht jede Figur zu kennen. Schau auf die Menschen neben dir, nimm die angebotene Hand und bleib im Takt. Die Reihe trägt dich ein Stück mit.",
      "mood": "freundlich"
    },
    {
      "pageTitle": "III. — Schritte und Figuren",
      "illustration": "figuren",
      "paragraphs": [
        "Die Grundlage des Drachentanzes bilden vergleichsweise einfache <strong>Schrittmuster</strong>, die miteinander kombiniert und je nach Tanz unterschiedlich angeordnet werden können. Seitwärtsschritte, kurze Vorstöße, Rückschritte, Überkreuzungen und Gewichtsverlagerungen bilden den größten Teil dieser Bewegungen.",
        "Hinzu kommen zahlreiche <strong>Drehungen</strong>. Manche werden allein ausgeführt, andere gemeinsam mit einem Partner. Zwei Tänzer können einander an den Händen oder Unterarmen fassen und sich für einige Schritte umeinander bewegen, bevor sie sich wieder lösen und ihren Weg durch die Formation fortsetzen.",
        "Der Oberkörper bleibt dabei keineswegs starr. Arme, Schultern und Hüfte begleiten die Bewegungen. Bei manchen Figuren werden die Arme weit geöffnet, bei anderen miteinander verschränkt oder einem Partner gereicht. Dadurch entsteht ein Tanz, bei dem Beine und Oberkörper gleichermaßen an der Bewegung beteiligt sind.",
        "Besonders charakteristisch sind die <strong>Formationswechsel</strong>. Aus zwei gegenüberliegenden Reihen kann ein Kreis entstehen. Ein Kreis kann sich öffnen und zu einer langen Kette werden. Zwei Tänzerreihen können sich kreuzen, sodass jeder Tänzer zwischen zwei Mitgliedern der gegenüberliegenden Gruppe hindurchtritt und anschließend auf deren vorheriger Seite steht.",
        "Erfahrene Tänzer führen solche Wechsel beinahe ohne sichtbare Verständigung aus. Ein Blick, eine angebotene Hand oder die Bewegung einer Schulter genügt häufig, um dem Partner zu zeigen, welche Figur als Nächstes folgt.",
        "Dabei besitzt der Drachentanz durchaus Raum für persönliche Ausgestaltung. Kleine zusätzliche Schritte, besonders schnelle Drehungen oder spielerische Bewegungen sind erlaubt, solange der Tänzer den gemeinsamen Rhythmus und die Formation nicht stört.",
        "Gerade junge Tänzer versuchen sich nicht selten gegenseitig mit besonders geschickten Bewegungen zu übertreffen. Ebenso häufig endet dies damit, dass einer von ihnen auf dem Boden sitzt."
      ],
      "comment": "Eine schöne Drehung ist wenig wert, wenn du danach in deinem Nachbarn landest. Erst der sichere Stand, dann die Kunststücke.",
      "mood": "ermahnend",
      "quote": "„Hör auf, deine Füße anzustarren. Sie wissen längst, wohin sie müssen. Achte lieber auf die Frau vor dir, bevor du sie umrennst.“",
      "quoteBy": "— eine häufige Ermahnung beim Tanzunterricht"
    },
    {
      "pageTitle": "IV. — Musik und Rhythmus",
      "illustration": "musik",
      "paragraphs": [
        "Der Drachentanz wird gewöhnlich von lebhafter Musik begleitet. Trommeln und andere Rhythmusinstrumente geben den Grundschlag vor, während Flöten, Pfeifen, Saiteninstrumente und andere regionale Instrumente die Melodie führen.",
        "Welche Instrumente verwendet werden, unterscheidet sich zwischen den Regionen Cenyrs erheblich. Der Rhythmus ist jedoch von zentraler Bedeutung.",
        "Viele Tänze beginnen in einem gemäßigten Tempo und werden im Verlauf schneller. Die Musiker beobachten dabei die Tänzer ebenso aufmerksam wie diese die Musiker. Auf ausgelassenen Festen entsteht daraus gelegentlich ein regelrechter Wettstreit.",
        "Die Musiker erhöhen das Tempo. Die Tänzer halten mit. Die Musiker werden schneller. Die Tänzer ebenfalls. Bis entweder jemand einen Fehler macht oder die Musiker selbst nicht mehr schneller spielen können.",
        "Besonders gute Tanzgruppen können auf diese Weise beträchtliche Geschwindigkeiten erreichen, ohne dass die Formation auseinanderbricht.",
        "Dennoch verlangt der Drachentanz keinen vollkommenen Gleichklang. Er besitzt einen gemeinsamen Rhythmus, innerhalb dessen die einzelnen Tänzer gewisse Freiheiten haben. Ein erfahrener Tänzer kann einen Schritt verzögern, eine Drehung verlängern oder eine Bewegung beschleunigen und dennoch im richtigen Augenblick wieder in die gemeinsame Folge zurückkehren.",
        "Gerade dieses Gefühl dafür, einen Rhythmus zu halten, ihn kurz zu verlassen und anschließend wiederzufinden, gilt als Zeichen eines hervorragenden Tänzers."
      ],
      "comment": "Wenn die Musiker anfangen zu grinsen, pass auf. Dann haben sie gewöhnlich beschlossen, dass wir noch nicht genug geschwitzt haben.",
      "mood": "freundlich",
      "stats": [
        [
          "Grundschlag",
          "Trommeln und Rhythmusinstrumente"
        ],
        [
          "Melodie",
          "Flöten, Pfeifen und Saiteninstrumente"
        ],
        [
          "Zusammenspiel",
          "Musiker und Tänzer beobachten einander"
        ],
        [
          "Meisterschaft",
          "Zur rechten Zeit den Rhythmus wiederfinden"
        ]
      ]
    },
    {
      "pageTitle": "V. — Ein Tanz für das ganze Fest",
      "illustration": "dorffest",
      "paragraphs": [
        "Der Drachentanz gehört zu den verbreitetsten gesellschaftlichen Traditionen Cenyrs. Er wird bei Hochzeiten, Erntefesten, Siegesfeiern, Jahrmärkten, Familienfesten und zahlreichen anderen Anlässen getanzt. In den Hallen großer Adelshäuser ist er ebenso zu finden wie auf den Dorfplätzen kleiner Siedlungen.",
        "Dabei kennt er nur wenige gesellschaftliche Grenzen. Adlige tanzen ihn ebenso wie Bauern und Handwerker. Bei großen Festen können Ritter, Bedienstete, Kinder und Gäste Teil derselben Formation werden. Unterschiede des Standes verschwinden dadurch nicht, doch für die Dauer eines Tanzes können Menschen nebeneinanderstehen, die sich im gewöhnlichen Alltag kaum auf Augenhöhe begegnen würden.",
        "Besonders Hochzeiten sind eng mit dem Drachentanz verbunden. In vielen Regionen Cenyrs gilt ein Hochzeitsfest ohne wenigstens einen großen gemeinsamen Tanz beinahe als unvollständig.",
        "Kinder nehmen häufig schon teil, lange bevor sie sämtliche Schritte beherrschen.",
        "Sie werden zwischen Erwachsene gestellt, an den Händen geführt oder laufen lachend hinter älteren Geschwistern her. Fehler gehören dabei ebenso zur Tradition wie die richtigen Schritte."
      ],
      "comment": "Ein Kind, das einen Schritt vergisst, hat noch kein Fest verdorben. Ein Erwachsener, der ihm deshalb die Freude nimmt, schon.",
      "mood": "ermahnend"
    },
    {
      "pageTitle": "VI. — Die erste Lehrmeisterin",
      "illustration": "hofunterricht",
      "paragraphs": [
        "In <strong>Adels- und Ritterhäusern</strong> besitzt die Vermittlung des Drachentanzes dagegen einen festen Platz in der Erziehung der Kinder. Dort gehört es traditionell zu den Aufgaben der <strong>Hofdamen</strong>, Jungen wie Mädchen die grundlegenden Schritte, Figuren und gesellschaftlichen Regeln des Tanzes beizubringen.",
        "Der Unterricht beginnt gewöhnlich bereits in jungen Jahren. Zunächst stehen Haltung, einfache Schritte und das sichere Bewegen im Rhythmus im Vordergrund. Später folgen Drehungen, Partnerwechsel und kompliziertere Formationen. Ebenso lernen die Kinder, einen Partner sicher zu führen oder sich führen zu lassen, auf andere Tänzer zu achten und sich innerhalb einer größeren Gesellschaft angemessen zu bewegen.",
        "Damit erfüllen die Hofdamen eine Aufgabe, deren Bedeutung weit über die Vorbereitung auf höfische Feste hinausgeht.",
        "Lange bevor ein Waffenmeister einem Kind das erste Übungsschwert oder den ersten Speer in die Hand gibt, haben die Hofdamen ihm bereits beigebracht, sein Gewicht sicher zu verlagern, während einer Drehung das Gleichgewicht zu bewahren und seine Bewegung mit jener anderer Menschen abzustimmen.",
        "Unter Waffenmeistern wird deshalb bisweilen scherzhaft behauptet, die <strong>erste Lehrmeisterin eines Ritters sei nicht sein Rittervater und auch nicht sein Waffenmeister, sondern jene Hofdame gewesen, die ihm als Kind beigebracht habe, nicht über seine eigenen Füße zu stolpern.</strong>",
        "Ein guter Drachentänzer wird bewundert. Von einem Kind erwartet jedoch niemand Perfektion. Von einem betrunkenen Ritter ebenfalls nicht."
      ],
      "comment": "Die Waffenmeister bekommen die Kinder erst, wenn wir ihnen das Stolpern abgewöhnt haben. Dass sie danach so viel von ihrer eigenen Lehrkunst halten, gönnen wir ihnen.",
      "mood": "freundlich"
    },
    {
      "pageTitle": "VII. — Vom Tanz zur Kampfkunst",
      "illustration": "hofunterricht",
      "paragraphs": [
        "Der Drachentanz besitzt eine außergewöhnlich enge Verbindung zu den traditionellen Kampfkünsten der Cenyri.",
        "Wie alt diese Verbindung tatsächlich ist, lässt sich heute nicht mehr feststellen.",
        "Bereits die ältesten erhaltenen avallornischen Beschreibungen erwähnen Bewegungen im Schwert-, Speer- und unbewaffneten Kampf, die deutliche Ähnlichkeiten mit traditionellen Tanzfiguren besitzen. Gleichzeitig finden sich im heutigen Volkstanz Bewegungen, deren Ursprung möglicherweise in alten Kampfpraktiken liegt.",
        "Über Jahrtausende beeinflussten sich beide Traditionen derart stark, dass eine klare Trennung ihrer Entwicklung kaum noch möglich ist.",
        "Sicher ist lediglich, dass der Drachentanz vielen Cenyri bereits lange vor einer militärischen Ausbildung grundlegende Fähigkeiten vermittelt.",
        "Ein Kind lernt, sein Gleichgewicht während einer Drehung zu halten. Es lernt, sein Gewicht von einem Bein auf das andere zu verlagern. Es lernt, einen Schritt auszuführen, ohne den sicheren Stand zu verlieren. Es lernt, Entfernungen einzuschätzen und sich zwischen anderen Menschen zu bewegen. Vor allem aber lernt es, seinen Körper als zusammenhängende Bewegung zu verstehen.",
        "In Adels- und Ritterhäusern beginnt diese Ausbildung traditionell unter der Anleitung der Hofdamen. Wenn ein Kind später erstmals einem Waffenmeister gegenübersteht, beginnt dieser daher keineswegs bei null. Viele der Bewegungen, die er für den Kampf benötigt, kennt der Schüler bereits – bislang lediglich unter einem anderen Namen und ohne eine Waffe in der Hand.",
        "Diese Fähigkeiten bilden später die Grundlage beinahe sämtlicher traditionellen cenyrischen Kampfkünste."
      ],
      "comment": "Ob der erste Schritt einmal zu einem Tanz oder zu einem Kampf gehörte, sollen die Gelehrten besprechen. Mir genügt zunächst, dass mein Schüler danach noch steht.",
      "mood": "freundlich",
      "quote": "„Bevor du gelernt hast, ein Schwert zu führen, hast du gelernt, deine Füße zu führen. Glaub mir, Junge – das war die wichtigere Lektion.“",
      "quoteBy": "— Sir Morgan"
    },
    {
      "pageTitle": "VIII. — Eine Grundlage, viele Künste",
      "illustration": "figuren",
      "paragraphs": [
        "Ein <strong>Teulu</strong> erkennt darin die Beinarbeit seiner Schwertkunst. Seine Schritte und Drehungen werden mit der Führung des Langschwertes verbunden und bilden jene Kampfkunst, die schließlich selbst den Namen <strong>Drachentanz</strong> erhielt.",
        "Ein <strong>Cantref</strong> nutzt dieselben Grundlagen auf andere Weise. Reichweite, Stellung, Gewichtsverlagerung und die Führung des gesamten Körpers unterstützen die langen Bewegungen seines Speeres.",
        "Ein <strong>Helwyr</strong> benötigt wiederum andere Fähigkeiten. Ein sicherer Stand, kontrollierte Atmung, Gleichgewicht und die Fähigkeit, den eigenen Körper auch während schneller Positionswechsel ruhig zu führen, bilden wichtige Grundlagen seiner Bogenkunst.",
        "Selbst im <strong>waffenlosen Kampf</strong> finden sich dieselben Prinzipien wieder. Eine Drehung kann den Angriff eines Gegners ins Leere führen. Eine Gewichtsverlagerung kann dessen Gleichgewicht brechen. Das Fassen eines Partners am Arm während eines Tanzes unterscheidet sich in seiner Bewegung manchmal erstaunlich wenig von dem Griff, mit dem ein Kämpfer einen Gegner zu Boden bringt.",
        "Die einzelnen Kampfkünste der Cenyri sind deshalb keineswegs lediglich unterschiedliche Ausführungen desselben Tanzes. Speer, Schwert, Bogen und der waffenlose Kampf stellen vollkommen unterschiedliche Anforderungen.",
        "Doch unter all diesen Unterschieden liegt dieselbe Vorstellung davon, <strong>wie ein Körper sich bewegen sollte</strong>.",
        "Waffenmeister verschiedener Traditionen erkennen deshalb häufig Bewegungen ineinander wieder. Ein Schwertmeister mag wenig vom Bogenschießen verstehen und dennoch einen Fehler in der Fußstellung eines Helwyr erkennen. Ein Cantref kann eine Drehung eines Teulu beobachten und darin einen Schritt wiederfinden, den er selbst seit seiner Kindheit kennt.",
        "Die Waffe verändert die Bewegung. Ihr Ursprung bleibt derselbe."
      ],
      "comment": "Ein sicherer Stand macht noch keinen Ritter. Aber auch ein Ritter tut gut daran, sich zu erinnern, woher er ihn hat.",
      "mood": "ermahnend"
    },
    {
      "pageTitle": "IX. — Wissenswertes am Rande",
      "illustration": "musik",
      "paragraphs": [
        "<strong>Regionen und Familien</strong>",
        "Der Drachentanz besitzt zahllose regionale Varianten. Die meisten teilen genügend Grundfiguren, dass ein erfahrener Cenyri auch in einer fremden Region nach kurzer Beobachtung mittanzen kann.",
        "Manche Familien besitzen eigene Figuren, die traditionell nur bei Hochzeiten oder besonderen Festen getanzt werden.",
        "<strong>Tänzer und Kämpfer</strong>",
        "Gute Tänzer gelten nicht automatisch als gute Kämpfer. Waffenmeister weisen allerdings gerne darauf hin, dass es wesentlich einfacher sei, einem guten Tänzer das Kämpfen beizubringen als einem schlechten Tänzer das Gleichgewicht.",
        "Umgekehrt sind hervorragende Kämpfer keineswegs zwangsläufig angenehme Tanzpartner. Manche Teulu sollen beim gewöhnlichen Tanz die unangenehme Angewohnheit besitzen, Bewegungen ihres Gegenübers vorauszuahnen, anstatt sich einfach führen zu lassen.",
        "Bei Festen zwischen jungen Rittern entstehen gelegentlich spontane Wettkämpfe darüber, wer eine besonders schnelle oder komplizierte Figur am saubersten ausführen kann. Das Ziehen eines tatsächlichen Schwertes führt gewöhnlich zum sofortigen Ende dieses Wettbewerbs.",
        "<strong>Wer mittanzt — und wer zusieht</strong>",
        "Fremde Besucher Cenyrs sind gelegentlich überrascht, wenn selbst alte Ritter oder hochrangige Adlige ohne Zögern an einem ausgelassenen Gruppentanz teilnehmen. Für einen Cenyri besitzt dies wenig Ungewöhnliches. Der Tanz gilt nicht als Beschäftigung eines bestimmten Standes oder Geschlechts.",
        "Manche Waffenmeister beobachten ihre zukünftigen Schüler bewusst beim Tanzen. Sie achten dabei weniger darauf, ob jemand sämtliche Figuren kennt, als darauf, wie schnell er neue Bewegungen versteht, sein Gleichgewicht wiederfindet und auf andere Tänzer reagiert.",
        "Besonders alte Waffenmeister behaupten gelegentlich, sie könnten allein anhand des Tanzes erkennen, ob ein Kind später eher zum Schwert, Speer oder Bogen neige. Wie zuverlässig diese Behauptung tatsächlich ist, wird kontrovers diskutiert.",
        "<strong>Musiker und Missverständnisse</strong>",
        "Zwischen den Musikern und besonders guten Tänzern besteht auf manchen Festen eine freundschaftliche Rivalität. Es gilt als Sieg der Musiker, wenn die Tänzer das Tempo nicht mehr halten können. Bleibt die Formation dagegen bis zum Ende bestehen, haben die Tänzer gewonnen.",
        "Das Wort <strong>Drachentanz</strong> kann sowohl den traditionellen Volkstanz als auch die Schwertkampfkunst der Teulu bezeichnen. Für Cenyri entsteht daraus gewöhnlich keine Verwirrung. Ein Schwert in der Hand gilt als recht zuverlässiger Hinweis darauf, welcher von beiden gemeint ist."
      ],
      "comment": "Und wenn ein junger Herr mitten im Tanz nach seinem Schwert greift, darf er sich setzen. Er kann von der Bank aus bewundern, wie die übrigen ohne Klinge zurechtkommen.",
      "mood": "ermahnend"
    }
  ];

  section.entries.push({
    id,
    title: 'Drachentanz (Volkstanz)',
    subtitle: 'Schritte, Feste und lebendige Überlieferung der Cenyri',
    type: 'Volkstanz · Cenyrische Tradition',
    category: 'Cenyr · Bräuche und Riten',
    image: `${assetRoot}/dorffest.png`,
    stamp: 'CENYR · BRÄUCHE UND RITEN',
    icon: '♫',
    multipage: true,
    appendCommentsPage: false,
    locked: false,
    sessionCast: [heledd.id],
    sessionCastDetails: [{ id: heledd.id, role: 'Kommentatorin · Lady Heledd Draig, geb. Gwyvern' }],
    pages: chapters.map(createPage)
  });
})();
