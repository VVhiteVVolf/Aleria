function createMorgarLanguageEntry() {
  const version = MORGAR_REFERENCE_DATA.languageVersion;
  const wordCount = MORGAR_REFERENCE_DATA.words.length;
  return {
    id: 'morgar-karnrith',
    title: 'Morgar',
    subtitle: 'Die Sprache der Morgorner · kurze Worte, schwer wie Stein',
    type: 'Sprache · Bedeutungs- und Steinschrift',
    category: 'Sprachen · Morgornisch',
    image: './modules/language/morgar/assets/morgar-hallenrunde-v1.png',
    stamp: 'MORGORN · KARNRITH · STEINGRATARCHIV',
    multipage: true,
    appendCommentsPage: false,
    locked: false,
    icon: '⛏️',
    symbol: null,
    pages: [
      {
        image: './modules/language/morgar/assets/morgar-hallenrunde-v1.png',
        imageFit: 'contain', imagePosition: 'center', imageWidth: 46,
        pageTitle: 'I. — Eine Stimme aus Stein',
        description: '<strong>Morgar</strong> ist die Sprache der Morgorner: kräftig genug für einen Befehl über dem Schlachtenlärm, aber flüssig genug für eine Geschichte am Herd. Der Klang sitzt in kurzen Silben — <strong>dar, mor, gar, dun, bran</strong>. Ein gerolltes R, klare Vokale und feste Anfangslaute geben den Wörtern Gewicht. Der Mund soll sie sprechen können, bevor der Meißel sie in Stein setzt.<br><br>Ein König heißt <strong>Darak</strong>, ein Vasall <strong>Baran</strong>, ein Krieger <strong>Garan</strong>. Die Burg ist die <strong>Duna</strong>, das Heer das <strong>Garum</strong>, die Schenke der <strong>Borun</strong>. Namen wie <strong>Adrak, Brana, Kharun</strong> und <strong>Toren</strong> tragen denselben Rhythmus: erst der kräftige Anschlag, dann ein klarer Ausklang.<br><br>Geschrieben wird Morgar in <strong>Karnrith</strong>. Seine dreißig Zeichen bewahren die alten Sinnbilder der fünf Klüfte. Ein Zeichenname ist eine Merkhilfe für die Schrift; die lebende Sprache verwendet eigene, kurze Wortstämme. Niemand muss eine Kette aus Runennamen sprechen, um Brot zu bestellen oder seinem Lehnsherrn Treue zu schwören.',
        stats: [
          ['Sprache', `Morgar ${version} · Sprache der Morgorner`],
          ['Schrift', 'Karnrith Tiefenrunen · 30 überlieferte Zeichen'],
          ['Klang', 'Erstsilbenbetonung · klare Vokale · kräftige Anlaute'],
          ['Wortbildung', '60 kurze Stämme · 12 Endungen und Bindewörter'],
          ['Wortschatz', `${wordCount} Wörter aus dreizehn Lebensbereichen · Seite V`],
          ['Namen', '500 männlich · 500 weiblich · 100 unisex · A–Z']
        ],
        quote: 'Ein gutes Wort muss durch die Zähne passen, ehe es durch den Stein geht.',
        quoteBy: '— Lehrspruch der morgornischen Hallen'
      },
      {
        pageTitle: 'II. — Klang, Aussprache und Sprachgebrauch',
        languagePage: true,
        quote: 'Duren! Ir garan, thalen tora!',
        quoteBy: '— Haltet stand! Krieger, bewacht die Grenze!',
        language: {
          archiveLabel: `Morgar ${version} · Die gesprochene Sprache`,
          nativeName: 'Morgar · geschrieben in Karnrith',
          family: 'Eigenständige Bergsprache · zwergische Wucht und gälisch angeregter Sprachfluss',
          speakers: 'Morgorner · Hof und Sippe · Handwerker und Bauern · Krieger und Reisende',
          regions: 'Bergreiche, Hallen, Marktstädte und Grenzfesten',
          scriptType: '30 Lautzeichen mit überlieferten Sinnbildern',
          writingDirection: 'Links nach rechts; monumentale Inschriften auch von oben nach unten',
          introduction: 'Morgar soll laut gesprochen tragen: zwei Silben für die meisten Alltagswörter, gelegentlich drei für längere Namen und präzise Begriffe. Der Klang orientiert sich an der Wucht einer zwergischen Fantasiesprache und am fließenden Wechsel von Vokalen und Konsonanten, den gälische Klangbilder anregen. Die Wörter und Regeln bilden eine eigenständige Sprache für Aleria.',
          alphabetTitle: 'Karnrith · Schriftzeichen und Tastatureingabe',
          alphabetLayers: [
            { label: 'Zeichentafel', image: '../Fonts/Karnrith-Font-2.000/Zeichentafel.png', alt: 'Die 30 Karnrith-Zeichen mit ihren überlieferten Merknamen', caption: 'Schriftarchiv: Die alten Zeichennamen bezeichnen die Runen. Die heutigen Wortstämme stehen auf Seite IV.' },
            { label: 'Schriftprobe', image: '../Fonts/Karnrith-Font-2.000/Leseprobe.png', alt: 'Technische Schriftprobe der Karnrith Tiefenrunen', caption: 'Schriftprobe des Fontarchivs mit Beispielen aus der früheren Sprachfassung. Für den aktuellen Sprachgebrauch gilt das Wörterverzeichnis auf Seite V.' },
            { label: 'Tastaturzeichen', image: '../Fonts/Karnrith-Font-2.000/Tastaturzeichen.png', alt: 'Buchstaben, Ziffern, Akzente und Satzzeichen der Schrift', caption: 'Auch gewöhnliche lateinische Eingaben, Zahlen und Satzzeichen lassen sich mit Karnrith schreiben.' }
          ],
          sections: [
            {
              title: 'Der Rhythmus: Anschlag und Ausklang',
              text: 'Die <strong>erste Silbe</strong> trägt den Hauptdruck: <strong>DA·rak, BA·ran, GA·rum, KHA·run</strong>. Jede Silbe hat einen hörbaren Vokal. Ein Punkt in der Aussprachehilfe zeigt die Sprechgrenze, keine Pause. Sprich das Wort in einem Zug.<br><br>Häufige Anlaute sind b, d, g, k sowie br, dr, gr, kr und sk. Ein einzelnes gerolltes R genügt. Härte entsteht durch den festen Anschlag, nicht durch möglichst viele Konsonanten. Lange Titel bleiben getrennte Wörter: <strong>Ar Darak</strong>.'
            },
            {
              title: 'Vokale und leicht lesbare Schreibweise',
              text: '<strong>A, E, I, O, U</strong> bleiben klare Einzelvokale; ein E am Wortende wird nicht verschluckt. <strong>Y</strong> klingt wie deutsches ü. <strong>Ai und ei</strong> klingen wie in Stein, <strong>au</strong> wie in Haus. Andere benachbarte Vokale werden nacheinander gesprochen. Es gibt keine stummen Buchstaben und keine wechselnde Betonung durch Akzente.<br><br><strong>C</strong> klingt immer wie K, <strong>J</strong> wie in Jahr, <strong>Qu</strong> wie kw und <strong>X</strong> wie ks. Diese Schreibungen kommen vor allem in Namen vor. <strong>V</strong> klingt wie deutsches W; <strong>W</strong> wird mit gerundeten Lippen angesetzt. S bleibt stimmlos, Z ist ein stimmhaftes s.'
            },
            {
              title: 'Raue Laute ohne Zungenknoten',
              text: '<strong>Kh und ch</strong> klingen wie das ch in Bach. <strong>Th</strong> ist ein kräftiges, leicht behauchtes T; <strong>dh</strong> ein weiches D und <strong>gh</strong> ein tief im Mund angesetztes G. <strong>Sh</strong> klingt wie sch, <strong>ng</strong> wie in lange. Ein Doppelzeichen bildet eine Einheit: Das h wird darin nicht als eigene Silbe gesprochen.<br><br>Im heutigen Wortschatz bleiben diese Laute sparsam. Ein klar gesprochenes <strong>Darak</strong> wirkt stärker als eine Folge ineinander verkeilter Endkonsonanten. In Namen wie <strong>Gendara</strong> hält der mittlere Vokal den Fluss offen.'
            },
            {
              title: 'Wörter aus kurzen Bedeutungssilben',
              text: '<strong>dar</strong> trägt Herrschaft, <strong>bar</strong> das Lehen, <strong>mor</strong> die Gemeinschaft und <strong>gar</strong> den bewaffneten Schutz. Mit einer passenden Endung entsteht ein sprechbares Wort: <strong>dar + ak → Darak</strong>, <strong>bar + an → Baran</strong>, <strong>gar + um → Garum</strong>.<br><br><strong>-a</strong> bildet oft Dinge oder Vorgänge, <strong>-an</strong> Zugehörige, <strong>-or</strong> Berufe und Ämter, <strong>-un</strong> Orte, <strong>-en</strong> Tätigkeiten. Das sind Wortbildungsfamilien, keine Pflicht, jedes Wort vollständig zu zerlegen. Gewachsene Wörter stehen mit ihrer festen Bedeutung im Verzeichnis. Für neue Titel werden Wörter getrennt ergänzt, statt endlose Zusammensetzungen zu erzwingen.'
            },
            {
              title: 'Sätze, Mehrzahl und Zeit',
              text: 'Die Grundfolge lautet <strong>Person – Tätigkeit – Sache</strong>: <strong>Mi selen duna.</strong> — Ich sehe die Burg. <strong>Mi</strong> heißt ich, <strong>ti</strong> du, <strong>da</strong> er/sie, <strong>mir</strong> wir, <strong>tir</strong> ihr, <strong>ri</strong> sie. Verben bleiben unverändert. <strong>Do</strong> vor dem Verb bezeichnet Vergangenes, <strong>va</strong> Zukünftiges: <strong>Mi do dalen.</strong> — Ich ging.<br><br><strong>Ir</strong> vor dem Hauptwort bildet die Mehrzahl: <strong>ir garan</strong> — Krieger; <strong>ir dora</strong> — Häuser. <strong>Na</strong> bedeutet von/aus, <strong>vi</strong> mit und <strong>an</strong> zu/für. <strong>Ne</strong> verneint: <strong>Mi ne varen.</strong> — Ich schwöre nicht. Die Satzfrage beginnt mit <strong>Ke</strong>: <strong>Ke ti selen duna?</strong> — Siehst du die Burg?'
            },
            createMorgarTerminologySection(),
            {
              title: 'Weitere Titel, Ämter und gesellschaftlicher Stand',
              text: '<strong>Darak</strong> ist die Krone, <strong>Ardor</strong> ein Herzog, <strong>Torak</strong> ein Markgraf, <strong>Barak</strong> ein Graf und <strong>Baror</strong> ein Baron. Ein <strong>Baran</strong> hält ein Lehen; <strong>Balor</strong> und <strong>Balan</strong> verwalten es. Die Titel gelten für jedes Geschlecht. <strong>Daran</strong> ist die allgemeine Anrede für Herr oder Herrin.<br><br><strong>Garan var</strong> bezeichnet den eidgebundenen Ritter. Handwerkliches Ansehen trägt <strong>Kelor</strong>, der Meister; ihm folgen <strong>Kelan</strong>, der Geselle, und <strong>Kelin</strong>, der Lehrling. Ein <strong>Barin</strong> ist hörig, ein <strong>Zorun</strong> leibeigen. Die Wörter unterscheiden Amt, ererbten Stand und persönliche Abhängigkeit.'
            },
            {
              title: 'Sätze für Spieltisch, Halle und Schlacht',
              text: '<strong>Sera an ti.</strong> — Friede sei dir.<br><strong>Mi varen vara na mora.</strong> — Ich schwöre den Eid des Volkes.<br><strong>Mir varen vi ti.</strong> — Wir schwören mit dir.<br><strong>Delen bera an mi.</strong> — Gib mir Brot.<br><strong>Mi velen bora.</strong> — Ich möchte Bier.<br><strong>Duren!</strong> — Haltet stand!<br><strong>Bragen!</strong> — Greift an!<br><strong>Ir garan, thalen tora!</strong> — Krieger, bewacht die Grenze!<br><br>Im Befehl steht das Verb allein oder vor seinem Gegenstand. Eigenschaften folgen dem Hauptwort: <strong>garan varal</strong> — ein treuer Krieger; <strong>duna garal</strong> — eine wehrhafte Burg.'
            },
            {
              title: 'Namen, Geschlecht und Anrede',
              text: 'Seite III bietet <strong>500 männliche, 500 weibliche und 100 Unisex-Namen</strong>, jeweils von A bis Z. Männliche Formen enden häufig fest auf -ak, -an, -or oder -rik; weibliche Formen verbinden kräftige Anlaute mit offenen Endungen wie -a, -ara oder -una. Unisex-Namen verwenden oft -en, -in oder -el. Diese Vorlieben sind keine Standes- oder Wesensregeln.<br><br><strong>Adrak, Brana und Toren</strong> werden nach denselben Regeln gesprochen wie der übrige Wortschatz. Ein Titel steht getrennt vor dem Namen: <strong>Darak Brana</strong>, <strong>Kelor Toren</strong>. Herkunft kann mit na folgen: <strong>Adrak na Karun</strong> — Adrak aus der Feste.'
            },
            {
              title: 'Karnrith schreiben und in Sprechblasen verwenden',
              text: `Karnrith bleibt die Schrift; Morgar ist die Sprache. Die überlieferten Runennamen sind keine Vorgabe für die Aussprache neuer Alltagswörter. Auf Seite IV stehen die <strong>72 heutigen Wortbausteine</strong>, auf Seite V die <strong>${wordCount} aktuellen Wörter mit Sprechgliederung</strong>. Sie ersetzen die bisherigen Wörter- und Namenslisten des Sprachmoduls.<br><br>Für Fremdsprachblasen und Zauberformeln <strong>Morgar · Karnrith</strong> wählen. NG, TH, KH, GH, SH, CH und DH werden als Schriftligaturen dargestellt. Darüberfahren, Tastaturfokus oder Antippen zeigt den eingegebenen Klartext. Die Schriftwahl übersetzt einen deutschen Satz nicht automatisch.`
            }
          ],
          footer: `Aleria Almanach · Morgar ${version} · Klang und Sprachgebrauch`
        }
      },
      { pageTitle: 'III. — 1.100 Namen von A bis Z', nameListPage: true, nameList: createKarnrithNameListData() },
      { pageTitle: 'IV. — Karnrith und 72 wichtige Wortbausteine', scriptTablePage: true, scriptTable: createKarnrithScriptTableData() },
      createMorgarLexiconPage()
    ]
  };
}

function createMorgarTerminologySection() {
  const terms = MORGAR_REFERENCE_DATA.terminology;
  const hierarchy = terms.nobleTitles.map(term => `<strong>${term.name}</strong>`).join(' → ');
  const castes = terms.classes.map(term => {
    const word = MORGAR_REFERENCE_DATA.words.find(word => word.word === term.name.toLowerCase());
    return `<strong>${term.name}</strong> — ${word.meaning}`;
  }).join('; ');
  return {
    title: 'Morgorns Adelstitel und Kriegerkasten',
    text: `${hierarchy}: Die fünf Adelstitel benennen die Verantwortung für <strong>Reich, Land, Feste, Halle und Sippe</strong>. <strong>Dar</strong> trägt die Herrschaft; tal, kar, dun und nar benennen ihren Bezug. Die weiteren Titel des Morgar-Wörterbuchs bilden keine zusätzlichen Stufen dieser morgornischen Ordnung.<br><br>${castes}. Diese acht Namen bezeichnen Ausbildung und Aufgabe. Die Zugehörigkeit zu einer Kriegerkaste verleiht für sich allein keinen Adel.<br><br><strong>Kuralan</strong> leitet sich von Kural, dem Schaf, ab; der Kastenname umfasst auch die übrigen anvertrauten Tiere und Nutzgebiete. <strong>Rhean</strong> entsteht aus Rhea und -an mit zusammengezogenem a. In diesen beiden Namen wird Rh als R gesprochen: <strong>RE·a, RE·an</strong>. Rhean bezeichnet sowohl gesalbte Ritter als auch Geistliche. Bei den <strong>Falgar</strong> steht das Feuer für Lunte und Pulver.`
  };
}
