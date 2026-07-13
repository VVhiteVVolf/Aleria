// Canonical, fixed language entries whose source packages live in /Fonts.
// Keeping these entries inside the language feature prevents data/sections.js
// from growing another pair of large, unrelated content blocks.

function createLinguaArgentiModuleEntry() {
  return {
    id: 'lingua-argenti',
    title: 'Lingua Argenti',
    subtitle: 'Gesetz, Erbe und Stimme des Kaiserreichs Argentum',
    type: 'Sprache · Vollalphabet · Monumentalschrift',
    category: 'Sprachen · Argentisch',
    image: '',
    stamp: 'ARGENTUM · SENATUS · GRAMMATICI · REICHSARCHIV',
    multipage: true,
    appendCommentsPage: false,
    locked: false,
    icon: '⚖️',
    symbol: null,
    pages: [
      {
        image: '',
        imageFit: 'contain',
        imagePosition: 'center',
        imageWidth: 46,
        pageTitle: 'I. — Sprache, Gesetz und silbernes Erbe',
        description: 'Die <strong>Lingua Argenti</strong> — im Volksmund Argentisch — ist Sprache, Schrift und Herrschaftsinstrument des Kaiserreichs Argentum. In ihr werden Gesetzestexte, Senatsbeschlüsse, militärische Befehle, wissenschaftliche Benennungen und öffentliche Namen so formuliert, dass kein Laut dem Zweifel überlassen bleibt. Klarheit ist keine bloße Stilfrage, sondern ein politisches Ideal.<br><br>Ihre heutige Form entstand aus Kana’anith, Ogham, Stoicheia und der Gemeinen Zunge. Aus diesen älteren Systemen übernahm sie die Vorstellung, dass Zeichen Bedeutung tragen; zugleich verwandelte sie das konsonantengetragene Erbe in ein <strong>Vollalphabet aus 23 Litterae</strong>. Jedes Zeichen besitzt Lautwert, Nomen Litterae und eine Stellung in einem der drei Ordines.<br><br>Argentische Schrift ist kantig, monumental und bewusst frei von unnötigem Zierrat. Sie soll gemeißelt, gestempelt und vor Gericht zweifelsfrei gelesen werden können. Darum ist ein geschriebenes Wort im Reich nie neutral: Es kann Amt verleihen, Zugehörigkeit bestätigen, einen Eid binden oder einen Menschen durch seinen Namen öffentlich verpflichten.',
        stats: [
          ['Eigenname', 'Lingua Argenti · Argentisch'],
          ['Sprecher', 'Argentier · Verwaltung · Legionen · Gelehrte'],
          ['Schriftsystem', 'Vollalphabet · 23 Litterae · drei Ordines'],
          ['Schreibrichtung', 'Horizontal von links nach rechts'],
          ['Formenlehre', '24 Kraftsilben · 14 Präfixe · 18 Suffixe'],
          ['Kulturfelder', 'Gesetz · Amt · Krieg · Wissenschaft · Namensrecht']
        ],
        quote: 'Verba vincunt. Littera regit. Argentum manet.',
        quoteBy: '— Argentische Überlieferung: Worte siegen. Der Buchstabe regiert. Silber bleibt.'
      },
      {
        pageTitle: 'II. — Litterae, Ordines & Syllabae Potentes',
        languagePage: true,
        quote: 'Kein Laut darf verloren gehen, denn auch das Gesetz duldet keine Lücke.',
        quoteBy: '— Lehrsatz der Grammatici',
        language: {
          archiveLabel: 'Sprachkunde · Argentisches Reichsarchiv',
          nativeName: 'Lingua Argenti · die vollkommene Reichsschrift',
          family: 'Tirnarisch-argentische Gelehrtensprache · Kana’anith, Ogham, Stoicheia und Gemeine Zunge',
          speakers: 'Argentier · Grammatici · Senatoren · Legionen · Medici · Naturkundler',
          regions: 'Kaiserreich Argentum · Kolonien · Akademien · Kanzleien und Legionsarchive',
          scriptType: 'Monumentales Vollalphabet · 23 Litterae mit Laut-, Amts- und Reichsbedeutung',
          writingDirection: 'Horizontal von links nach rechts · Majuskeln für Urkunden und Inschriften',
          introduction: 'Lingua Argenti verschriftlicht Vokale und Konsonanten vollständig. Jede Littera besitzt neben ihrem Laut ein Nomen Litterae und eine dreifache Deutung für Person, Amt und Reich. Kraftsilben, Präfixe und Suffixe machen Rang, Funktion, Herkunft und abstrakte Bedeutung sichtbar.',
          alphabetTitle: 'Die 23 Litterae der Lingua Argenti',
          alphabetLayers: [
            { label: 'Monumentalalphabet', image: '', alt: '', caption: 'Für eine spätere Bildtafel der 23 Litterae vorbereitet; das vollständige Fontalphabet steht auf Seite IV.' },
            { label: 'Drei Ordines', image: '', alt: '', caption: 'Für eine gegliederte Übersicht von Reich, Krieg und Wissen vorbereitet.' },
            { label: 'Urkunden- und Kursivhand', image: '', alt: '', caption: 'Für spätere Schriftproben aus Kanzlei, Senat und Feldarchiv vorbereitet.' }
          ],
          sections: [
            {
              title: 'Herkunft & Reichsreform',
              text: 'Die Lingua Argenti wurde nicht in einem einzigen Augenblick erfunden. Kana’anith lieferte die tirnarische Wurzeltradition, Ogham die Vorstellung bedeutungstragender Zeichen, Stoicheia die Verbindung von Schrift, Recht und politischer Wirkung. Die Gemeine Zunge gab schließlich den Lautkörper, aus dem die Grammatici eine reichsweit normierte Hochsprache formten.<br><br>Das Ergebnis ist bewusst administrativ: Ein Erlass aus der Hauptstadt soll in einer Grenzfestung ebenso gelesen werden wie an einer Akademie. Regionale Aussprache darf bestehen, die geschriebene Form jedoch nicht schwanken.'
            },
            {
              title: 'Vollalphabet & Lautordnung',
              text: 'Die Schrift besitzt <strong>23 Grundzeichen</strong>. J, K und W gelten nicht als eigene Litterae, sondern werden über I, C und V geführt. I trägt daher i und j, C kann k oder z bezeichnen, V steht für v und w. Q bewahrt den Laut <em>qu</em>, X den Laut <em>ks</em>; Y trägt ü oder y und ist als Zephyrus zugleich dem freien Wind des Denkens geweiht.<br><br>Anders als Kana’anith notiert Argentisch alle Vokale. Diese Vollständigkeit ist Teil der Rechtskultur: Ein ausgelassener Laut könnte einen Namen, Rang oder Vertrag verändern.'
            },
            {
              title: 'Die drei Ordines',
              text: '<strong>Ordo Primus</strong> sammelt die Litterae von Herrschaft, Gesetz, Bürgerschaft, Adel und tragender Ordnung. <strong>Ordo Secundus</strong> umfasst Krieg, Disziplin, Eid, Ruhm, Mars, Amtsgewalt und Triumph. <strong>Ordo Tertius</strong> bewahrt Beredsamkeit, Harmonie, Frage, Einheit, Fremde, Wind und Eifer.<br><br>Die Einteilung ist keine bloße Sortierung. In Namen, Titeln und Inschriften zeigt die Häufung eines Ordo, welcher Anspruch erhoben wird: Herrschaft, Vollstreckung oder geistige Deutung.'
            },
            {
              title: 'Nomen, Signum, Ius',
              text: 'Jede Littera trägt eine dreifache Lesung. Auf der Ebene der <strong>Person</strong> beschreibt sie Tugend, Anlage oder Makel. Auf der Ebene des <strong>Amtes</strong> bezeichnet sie Befugnis und Pflicht. Auf der Ebene des <strong>Reiches</strong> steht sie für einen Teil der staatlichen Ordnung.<br><br>Lex bedeutet daher nicht nur den Laut L und das Gesetz als Begriff. Es kann persönliche Rechtschaffenheit, die Befugnis Recht zu sprechen und das Fundament des gesamten Rechtssystems zugleich bezeichnen.'
            },
            {
              title: 'Syllabae Potentes',
              text: 'Vierundzwanzig Kraftsilben verdichten zentrale Reichsideen. <em>-val-</em> verbindet Stärke, Tugend, Ansehen und Gesetz; <em>-lex-</em> bindet an unverbrüchliches Recht; <em>-arg-</em> bezeichnet Silber, Reinheit und geistigen Glanz. Weitere Silben tragen Rat, Bürgerschaft, Ehre, Adel, Ordnung, Amtsgewalt, Krieg, Sieg, Legion, Treue, Vernunft, Weisheit, Freiheit, Schrift, Seefahrt und göttlichen Atem.<br><br>Eine Kraftsilbe kann vor oder nach einem Stamm stehen. Ihre Bedeutung bleibt erhalten, doch ihre Stellung verändert Gewicht und Lesefluss.'
            },
            {
              title: 'Präfixe, Suffixe & Fachsprache',
              text: 'Vierzehn Präfixe ordnen Rang und Richtung: <em>prae-</em> setzt etwas voran, <em>sub-</em> unterstellt, <em>con-</em> verbindet, <em>re-</em> führt zurück und <em>contra-</em> stellt entgegen. Reichspräfixe wie <em>civ-, sen-, legi-</em> und <em>arg-</em> markieren Bürgerschaft, Senat, Gesetz/Legion und silberne Gelehrsamkeit.<br><br>Achtzehn Suffixe bilden Personen, Ämter, Institutionen, Eigenschaften, Wissenschaften und Werkzeuge. Aus dieser Formenlehre stammt ein großer Teil der medizinischen, biologischen und staatlichen Fachsprache Alerias.'
            },
            {
              title: 'Namen als öffentliches Dokument',
              text: 'Im Kaiserreich gilt ein Name als öffentliche Verpflichtung. Ein Grammaticus wählt Stamm, Kraftsilbe und Endung so, dass Stand, Hoffnung und vorgesehene Pflicht lesbar werden. Feldherren können später ein <em>Cognomen</em> annehmen, das Sieg oder Eigenschaft festhält; Senatoren bevorzugen Namen mit Recht, Rat und Beredsamkeit.<br><br><em>Valerius</em> trägt Stärke und Gesetz, <em>Argentius</em> das Silber des Reiches. Ein Name mit Bellum und Mars mag einen Krieger auszeichnen, kann ihn aber zugleich für ein beratendes Amt ungeeignet erscheinen lassen.'
            },
            {
              title: 'Schriftbild, Material & Gebrauch',
              text: 'Offizielle Monumentalschrift besteht aus klaren, kantigen Majuskeln. Sie erscheint auf Münzen, Grenzsteinen, Triumphbögen, Legionsstandarten, Gesetzestafeln und Grabinschriften. Kanzleien verwenden eine schnellere Hand, doch in Senatsbeschlüssen gilt: Kein Zeichen darf absichtlich unkenntlich gemacht werden.<br><br>Der mitgelieferte Monumentalfont bewahrt die reichsamtliche Form und ihre Aliaszeichen. Er eignet sich deshalb für Überschriften, Siegel und kurze Formeln; längere Klartexte bleiben für die Lesbarkeit in gewöhnlicher Schrift erhalten.'
            }
          ],
          footer: 'Aleria Almanach · Lingua Argenti · Argentisches Reichsarchiv'
        }
      },
      {
        pageTitle: 'III. — 400 Namen aus der Lingua Argenti',
        nameListPage: true,
        nameList: createLinguaArgentiNameListData()
      },
      {
        pageTitle: 'IV. — Litterae, Kraftsilben & Formenlehre',
        scriptTablePage: true,
        scriptTable: createLinguaArgentiScriptTableData()
      }
    ]
  };
}

function createStoicheiaModuleEntry() {
  return {
    id: 'stoicheia',
    title: 'Stoicheia',
    subtitle: 'Phalantische und klythesische Schrift von Krieg, Recht und Schicksal',
    type: 'Sprache · Vollalphabet · Polis- und Orakelschrift',
    category: 'Sprachen · Phalantisch & Klythesisch',
    image: '',
    stamp: 'PHALANTISCHE POLIS · KLYTHESIS · GRAMMATEIS · ZEICHENARCHIV',
    multipage: true,
    appendCommentsPage: false,
    locked: false,
    icon: '🏛️',
    symbol: null,
    pages: [
      {
        image: '',
        imageFit: 'contain',
        imagePosition: 'center',
        imageWidth: 46,
        pageTitle: 'I. — Die Elemente von Polis, Krieg und Schicksal',
        description: '<strong>Stoicheia</strong> ist die phalantische und klythesische Sprache und Schrift der südlichen Stadtstaaten. Ihre vierundzwanzig Zeichen sind aus dem Kana’anith Süd-Tirnaras hervorgegangen, wurden jedoch zu einem Vollalphabet erweitert und mit einer neuen politischen und sakralen Bedeutungslehre versehen.<br><br>Was einst Handel und Verträge trug, wurde in den Händen der Phalantier zum Werkzeug für Kriegsrecht, Namensbindung, Prophezeiung und Staatsordnung. Ein Stoicheion besitzt Laut, Zeichenname und eine Wirkung auf Körper, Geist und Polis. Die Schrift kann darum einen Satz festhalten und zugleich ein Urteil darüber aussprechen.<br><br>Der Überlieferung nach offenbarte <strong>Athara</strong>, Göttin von Weisheit, Krieg und gerechter Ordnung, dem ersten Nomophylax die wahren Bedeutungen auf einem Schlachtfeld. Seither ritzen Grammateis Gebete auf Waffen, binden Namen an Schicksale, versiegeln Eide und deuten aus Zeichenfolgen den möglichen Ausgang eines Krieges.',
        stats: [
          ['Eigenname', 'Stoicheia · Elemente und Grundbestandteile'],
          ['Sprecher', 'Phalantier · Klythesier · Grammateis'],
          ['Herkunft', 'Vollalphabetischer Nachfolger des Kana’anith'],
          ['Schriftsystem', '24 Zeichen · vier Tetrades · fünf Rhemata-Sphären'],
          ['Formenlehre', '37 Rhemata · 12 Präfixe · 12 Suffixe'],
          ['Anwendung', 'Kriegsrecht · Orakel · Namensbindung · Eid · Polis']
        ],
        quote: 'Wer den Namen kennt, kennt das Schicksal. Wer das Schicksal kennt, kennt den Krieg.',
        quoteBy: '— Phalantische Überlieferung'
      },
      {
        pageTitle: 'II. — Zeichen, Tetrades & Rhemata',
        languagePage: true,
        quote: 'Ein Zeichen ist Klang, Bedeutung und Wirkung — und keine dieser Wahrheiten steht allein.',
        quoteBy: '— Lehre der Grammateis',
        language: {
          archiveLabel: 'Sprachkunde · Phalantisch-klythesisches Polisarchiv',
          nativeName: 'ΣΤΟΙΧΕΙΑ · Stoicheia · Elemente der geordneten Welt',
          family: 'Tirnarische Schriftfamilie · Kana’anith-Nachfolger mit Ogham-Ferneinflüssen',
          speakers: 'Phalantier · Klythesier · Grammateis · Nomophylakes · Strategen',
          regions: 'Südliche Stadtstaaten · Küstenpoleis · klythesische Herrschaftsräume und Kolonien',
          scriptType: 'Vollalphabet · 24 Poliszeichen in vier Bedeutungsgruppen · 37 Rhemata',
          writingDirection: 'Horizontal von links nach rechts · monumental, rituell und administrativ',
          introduction: 'Stoicheia verbindet ein griechisch anmutendes Vollalphabet mit einer dreifachen Zeichenbedeutung für Körper, Geist und Polis. Vier Tetrades ordnen die Grundzeichen, fünf Sphären die produktiven Rhemata. Namen und Formeln werden nicht nur ausgesprochen, sondern als Aussagen über Bestimmung und öffentliche Ordnung gelesen.',
          alphabetTitle: 'Die 24 Stoicheia der Stadtstaaten',
          alphabetLayers: [
            { label: 'Polisalphabet', image: '', alt: '', caption: 'Für eine spätere Bildtafel der 24 Stoicheia vorbereitet; alle Zeichen stehen auf Seite IV in der lokalen Schrift.' },
            { label: 'Tetrades', image: '', alt: '', caption: 'Für eine gegliederte Darstellung von Ares, Polis, Kosmos und Physis vorbereitet.' },
            { label: 'Ritzung & Feldschrift', image: '', alt: '', caption: 'Für spätere Beispiele auf Tontafel, Waffen, Stelen und Orakelplatten vorbereitet.' }
          ],
          sections: [
            {
              title: 'Vom Kana’anith zum Stoicheia',
              text: 'Stoicheia gilt als direkte Nachfolgeschrift des Kana’anith, das seinerseits aus der proto-albischen Ogham-Tradition hervorging. Mit dem Aufstieg der südlichen Stadtstaaten genügte eine konsonantengetragene Handels- und Vertragsschrift nicht mehr. Die Phalantier ergänzten Vokalzeichen und ordneten das Alphabet neu.<br><br>Die Formen blieben als tirnarisches Erbe erkennbar, ihre Bedeutung wurde jedoch auf Polis, Krieg und göttliche Ordnung ausgerichtet. So entstand ein Vollalphabet, das Verwaltung und Kult gleichermaßen dienen konnte.'
            },
            {
              title: 'Athara & der erste Nomophylax',
              text: 'Die Gründungslegende schreibt die Bedeutungsreform <strong>Athara</strong> zu. Sie offenbarte dem ersten Nomophylax die Zeichen nicht als gesprochene Wörter, sondern als leuchtende Visionen im Staub eines Schlachtfeldes. Der Priester-Schreiber erkannte darin Gesetz, Warnung und Orakel zugleich.<br><br>Nomophylakes bewahrten fortan Recht und Ritual. Grammateis deuteten Namen, schrieben Eide und prüften, ob eine Zeichenfolge mit dem beanspruchten Amt oder Schicksal vereinbar war.'
            },
            {
              title: 'Die 24 Grundzeichen',
              text: 'Das Alphabet umfasst vierundzwanzig Zeichen von Alpha bis Omega. Jedes trägt Lautwert und Sinnfeld: Alpha steht für Ursprung und erste Ordnung, Kappa für Herrschaft, Theta für Tod, Pi für Stadt und Schutzwall, Psi für Seele und Omega für den bindenden Eid.<br><br>Die Schrift läuft von links nach rechts. Monumentale Formen erscheinen auf Stelen, Toren und Waffen; eine schnellere Schreibhand dient Verwaltung, Feldbefehlen und Unterricht.'
            },
            {
              title: 'Vier Tetrades',
              text: 'Die Zeichen werden vier kulturellen Pfeilern zugeordnet. <strong>Ares</strong> umfasst Krieg, Körperkraft, Geschoss, Schlachtruf, Heer und Signalfeuer. <strong>Polis</strong> trägt Ursprung, Herrschaft, Tempel, Stadt, Ordnung und Eid. <strong>Kosmos</strong> deutet Leben, Sonne, Tod, Schicksal, Gnade und Seele. <strong>Physis</strong> bezeichnet Erde, Berg, Strömung und Meer.<br><br>Delta und Xi tragen zusätzlich die gesellschaftliche Sphäre <strong>Demos</strong>: Volk, Fremde, Name, Herkunft und öffentliches Urteil.'
            },
            {
              title: 'Körper, Geist & Polis',
              text: 'Ein Stoicheion wird auf drei Ebenen gelesen. Die körperliche Ebene benennt Kraft, Wunde, Atem oder Bewegung. Die geistige Ebene beschreibt Absicht, Erinnerung, Furcht oder Erkenntnis. Die Polis-Ebene fragt nach Amt, Recht und Wirkung auf die Gemeinschaft.<br><br>Kappa kann körperliche Dominanz, den Willen zu herrschen und legitime oder rohe Staatsmacht bedeuten. Die Deutung hängt von Nachbarzeichen, Träger und Anlass ab.'
            },
            {
              title: 'Die 37 Rhemata',
              text: 'Rhemata sind Kernsilben, deren Sinn über die Summe einzelner Buchstaben hinausgeht. Sie gehören zu fünf Sphären: <strong>Ares</strong> für Beginn, Stärke, Kampf, Sieg und Heer; <strong>Polis</strong> für Gemeinschaft, Herrschaft, Gesetz, Amt und Urteil; <strong>Kosmos</strong> für Schicksal, Tod, Göttliches, Erinnerung und Ruhm; <strong>Physis</strong> für Erde, Wasser, Stein, Wind und Wachstum; <strong>Demos</strong> für Name, Abstammung, Wort, Fremde, Ehre und Volk.<br><br>Ein Rhéma kann vor oder nach einem Stamm stehen. Seine Wirkung bleibt, während die Stellung die Betonung verändert.'
            },
            {
              title: 'Formenlehre & Wortbildung',
              text: 'Zwölf Präfixe verändern Richtung und Verhältnis: <em>amphi-</em> umfasst beide Seiten, <em>anti-</em> stellt entgegen, <em>dia-</em> führt hindurch, <em>hyper-</em> erhöht, <em>hypo-</em> unterstellt und <em>meta-</em> führt in Wandel oder Jenseits.<br><br>Zwölf Suffixe bilden Personen, Linien, Ämter, Institutionen, Werkzeuge und Fachbegriffe. <em>-os</em> bezeichnet einen männlichen Träger, <em>-ia</em> eine weibliche Trägerin, <em>-ides</em> Nachkommen, <em>-ion</em> Handlung oder Institution und <em>-archos</em> einen führenden Amtsträger.'
            },
            {
              title: 'Namen, Krieg & gebundene Zukunft',
              text: 'Ein Name gilt als Urteil über das Mögliche. <em>Alkathon</em>, <em>Nyktheos</em> oder <em>Polysthen</em> werden Zeichen für Zeichen und zugleich nach ihren Rhemata gelesen. Viele Krieger wählen später selbst einen Namen, um eine Bestimmung zu verankern — nicht ohne Risiko, denn ein widersprüchlicher Name kann als innere Spaltung gelten.<br><br>Auf Waffen und Feldzeichen werden dieselben Regeln zu Gebeten und Warnungen. Eine Formel kann Sieg anrufen, einen Eid binden oder den Träger daran erinnern, welchen Preis die Polis von ihm fordert.'
            }
          ],
          footer: 'Aleria Almanach · Stoicheia · Phalantisch-klythesisches Spracharchiv'
        }
      },
      {
        pageTitle: 'III. — 400 Namen aus dem Stoicheia',
        nameListPage: true,
        nameList: createStoicheiaNameListData()
      },
      {
        pageTitle: 'IV. — Zeichen, Rhemata & Formenlehre',
        scriptTablePage: true,
        scriptTable: createStoicheiaScriptTableData()
      }
    ]
  };
}
