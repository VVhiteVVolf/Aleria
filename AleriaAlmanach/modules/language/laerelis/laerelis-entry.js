function createLaerelisLanguageEntry() {
  const assets = './modules/language/laerelis/assets/';
  return {
    id: 'laerelis-lichtfluss',
    title: 'Laerelis',
    subtitle: 'Die Sprache des Lichthains · sanfte Rede, bewahrtes Wissen',
    type: 'Sprache · Lichtfluss und Bedeutungsalphabet',
    category: 'Sprachen · Lichthain',
    image: `${assets}laerelis-waldrand-v1.png`,
    stamp: 'LICHTHAIN · LAERELIN · LICHTFLUSS',
    multipage: true,
    appendCommentsPage: false,
    locked: false,
    icon: '🌿',
    symbol: null,
    pages: [
      {
        pageTitle: 'I. — Die Lichtrede des Lichthains',
        image: `${assets}laerelis-waldrand-v1.png`,
        imageFit: 'contain', imagePosition: 'center', imageWidth: 46,
        description: '<strong>Laerelis</strong> ist die Sprache des <strong>Lichthains</strong>: melodisch, höflich und präzise. Ihre kurzen Stämme verbinden sich zu fließenden Wörtern. <strong>Laer</strong> trägt das Licht, <strong>lin</strong> den Hain und <strong>lis</strong> die geordnete Rede. So heißen Wald und Land <strong>Laerelin</strong>, die Sprache <strong>Laerelis</strong> — Lichtrede. Der weiche Anfang und die klare erste Silbe geben auch langen Namen Ruhe und Gestalt.<br><br>Die Menschen des Lichthains entstammen den <strong>Ghormaigh</strong>. Baldreskanische Einflüsse prägen ihre höfische Ordnung; die Hochsprache verbindet dieses Erbe mit elbisch anmutender Melodie. Im gepflegten Wald liegen Dörfer, Werkhöfe, Obsthaine und Lehrhallen. Ansehen zeigt sich in verlässlichen Wegen, lesbaren Büchern und sorgfältigem Handwerk. Sanftheit bedeutet dabei Selbstbeherrschung: Ein <strong>Thaerir</strong> schützt Wege und Gäste, ein <strong>Calir</strong> schafft mit kundiger Hand, ein <strong>Laelir</strong> bewahrt und prüft Wissen.<br><br>Geschrieben wird die Sprache in <strong>Lichtfluss</strong>, einer fließenden Schrift mit fünfundzwanzig bedeutungstragenden Grundzeichen. Jedes besitzt einen Laut, einen Namen, verwandte Sinnfelder und einen Zahlenwert. Ein Name kann Erinnerung und Wunsch tragen; seine Zeichen ersetzen weder eine belegte Herkunft noch einen anerkannten Anspruch. Die folgenden Seiten erschließen Klang und Grammatik, Namen, Schrift und den vollständigen Wortbestand des gelieferten Sprachpakets.',
        stats: [
          ['Eigenname', 'Laerelis · Lichtrede · gesprochen LÄI-re-lis'],
          ['Land und Wald', 'Laerelin · Lichthain · gesprochen LÄI-re-lin'],
          ['Schrift', 'Lichtfluss · 25 Grundzeichen · links nach rechts'],
          ['Wortbildung', '400 einsilbige Stämme · klare Endungen · hörbare Fugen'],
          ['Wortschatz', '1.000 Sachwörter + 132 Funktionswörter · Seite V'],
          ['Namen', '600 männlich · 600 weiblich · 600 Sippen und Häuser']
        ],
        quote: 'Lael vai dhael es hol.',
        quoteBy: '— Wissen ohne Wahrheit ist Schatten.'
      },
      {
        pageTitle: 'II. — Klang, Schrift und Sprachgebrauch',
        languagePage: true,
        quote: 'Mi dhaera ya mi fa thana i lin, nura i lael a vira i ban.',
        quoteBy: '— Ich schwöre, den Hain zu behüten, das Wissen zu bewahren und die Sippe zu verteidigen.',
        language: {
          archiveLabel: 'Laerelis · Sprachkunde des Lichthains',
          nativeName: 'Laerelis · Lichtrede · geschrieben in Lichtfluss',
          family: 'Ghormaigh-Erbe · baldreskanischer Kontakt · elbisch geprägte Hochsprache',
          speakers: 'Menschen des Lichthains · Laereliniri · Hof, Sippe, Handwerk und Hainschule',
          regions: 'Laerelin · Waldsiedlungen, Randmärkte, Lehrhallen und höfische Archive',
          scriptType: '25 Grundzeichen mit Laut, Sinnfeldern und Zahlenwert · eigene Zeichen für th, dh, sh und ng',
          writingDirection: 'Lichtfluss: waagerecht von links nach rechts',
          introduction: 'Laerelis verbindet sorgfältige Vokale mit kurzen, festgelegten Wortstämmen. Die Sprache soll im Gespräch tragen: in einer Begrüßung, einer Werkstatt, einem Streit oder einer Urkunde. Schriftdeutung ergänzt diesen Gebrauch. Die ältere Ogham-Grundlage und die fließende Lichtfluss-Schrift geben dieselben Laerelis-Laute wieder; die Namens- und Zeichenbedeutungen gehören zu dieser Sprache.',
          alphabetTitle: 'Lichtfluss · Schrift und Lehre',
          alphabetLayers: [{
            label: 'In der Hainschule',
            image: `${assets}laerelis-hainschule-v1.png`,
            alt: 'Eine menschliche Lehrerin erklärt zwei erwachsenen Lernenden in einer offenen Hainschule ein Manuskript.',
            caption: 'Sorgfältige Hände, klare Worte und geprüftes Wissen. Die vollständigen 25 Lichtfluss-Zeichen mit Lauten, Bedeutungen und Zahlenwerten stehen auf Seite IV.'
          }],
          sections: [
            {
              title: 'Herkunft, Bewahrung und höfische Zurückhaltung',
              text: 'Kurze Stämme für Wald, Verwandtschaft und Pflichten bewahren das Ghormaigh-Erbe. Baldreskanischer Kontakt bringt höfische und rechtliche Begriffe hinzu. Die Hainschulen pflegen daraus eine melodische Hochsprache. <strong>Raenir</strong> bezeichnet den Träger des Kronamts, <strong>Dorir</strong> den Gutsinhaber, <strong>Delir</strong> den Lehnsträger und <strong>Vathir</strong> die Verwaltung anvertrauten Guts. Diese Wörter benennen Aufgaben; sie setzen keine neue Rangfolge der bestehenden Adelstitel fest.<br><br>Ein Eid wird bezeugt und aufgeschrieben. Bewahrung verpflichtet zu Pflege, kann aber auch Wissen verschließen und alte Ansprüche gegen nötige Veränderungen schützen. Die Sprache kennt deshalb höfliche, eindeutige Ablehnung: <strong>Mi lima via lis, be mi nu ce soena.</strong> — Ich höre Eure Rede, aber ich kann nicht zustimmen.'
            },
            {
              title: 'Vokale und der erste klare Akzent',
              text: '<strong>A, e, i, o, u</strong> sind klare Vokale; auch unbetontes und abschließendes e bleibt hörbar. <strong>Ae</strong> klingt wie äi, <strong>ai</strong> wie ai, <strong>au</strong> wie au, <strong>ei</strong> wie langes eh, <strong>oe</strong> wie ou, <strong>oi</strong> wie oi und <strong>ui</strong> als ein Gleitlaut von u zu i. Andere Vokalfolgen bleiben getrennt: <strong>mia = MI-a</strong>, <strong>-iel = i-el</strong>.<br><br>Die <strong>erste Silbe</strong> eines selbstständigen Inhaltswortes trägt den Hauptdruck: <strong>LÄI-re-lis</strong>, <strong>LÄI-re-lin</strong>, <strong>KA-lir</strong>. Spätere Silben bleiben leicht und deutlich. Alle 400 Stammformen sind nach diesen Regeln einsilbig. Die Großschreibung im Wörterbuch markiert die betonte Silbe, keine zusätzliche Lautänderung.'
            },
            {
              title: 'Weiches R und vier eigene Doppelzeichen',
              text: '<strong>C</strong> klingt immer wie k, <strong>g</strong> bleibt hart, <strong>s</strong> stimmlos und <strong>v</strong> klingt wie deutsches w. <strong>R</strong> wird bevorzugt weich wie englisches r gesprochen; ein leichtes Zungenspitzen-r ist als Akzent möglich. <strong>W</strong> ist gerundetes englisches w. <strong>Y</strong> klingt wie deutsches j und ist niemals ein Vokal.<br><br><strong>Th</strong> ist der stimmlose englische Zahnreibelaut /θ/, <strong>dh</strong> sein stimmhaftes Gegenstück /ð/. <strong>Sh</strong> klingt wie sch und <strong>ng</strong> wie in singen, ohne zusätzliches g. Diese vier Paare bilden je ein Grundzeichen; das h erhält keine eigene Silbe. Dagegen besteht ae trotz seines gemeinsamen Klangs aus zwei Schriftzeichen.'
            },
            {
              title: 'Vom Sinnfeld zum sprechbaren Wort',
              text: 'Ein <strong>Zeichenfeld</strong> umfasst verwandte Vorstellungen, ein <strong>Stamm</strong> eine festgelegte Bedeutung, ein <strong>Wort</strong> einen konkreten Begriff. Die Wörterbuchbedeutung wird nicht bei jedem Gebrauch neu aus den Buchstaben erraten. Bei Zusammensetzungen bestimmt gewöhnlich der erste Stamm den letzten: <strong>laer + lin → laerelin</strong>, <strong>raen + dar → raenedar</strong>, <strong>mer + dhaer → meredhaer</strong>. Die Fuge e bleibt sichtbar und hörbar.<br><br><strong>-a</strong> bildet Verben, <strong>-il</strong> Eigenschaften, <strong>-ir</strong> Personen mit Aufgabe oder Befähigung, <strong>-en</strong> Vorgang, Ergebnis oder Gesamtheit. <strong>-el</strong> bezeichnet einen Tätigkeitsort, <strong>-in</strong> eine Verkleinerung, <strong>-oth</strong> ein Werkzeug. <strong>-eth</strong> bildet unter anderem Ordnungszahlen; <strong>-on / -iel</strong> können eine Person ausdrücklich männlich oder weiblich benennen. Ableitungen gehen vom Stamm aus: <strong>leir → leira</strong>, aber <strong>leir → leirir</strong>.'
            },
            {
              title: 'Sätze, Artikel, Mehrzahl und Besitz',
              text: 'Die Grundfolge lautet <strong>Subjekt – Verb – Objekt</strong>: <strong>Mi leira i Laerelis.</strong> — Ich lerne Laerelis. Verben haben keine Personenendungen; <strong>es</strong> heißt unveränderlich sein. <strong>I</strong> ist der bestimmte, <strong>e</strong> der unbestimmte Artikel. Nomen besitzen kein grammatisches Geschlecht.<br><br>Die Mehrzahl erhält <strong>-i</strong> nach Konsonanten, <strong>-ri</strong> nach Vokalen: <strong>baer → baeri</strong>, <strong>calir → caliri</strong>, <strong>fau → fauri</strong>. Nach einer genauen Zahl bleibt die Einzahl: <strong>du baer</strong> — zwei Bäume. Eigenschaften folgen: <strong>i lin seril</strong> — der friedliche Hain. Besitzwörter ersetzen den Artikel: <strong>mia seith</strong> — mein Buch. <strong>Na</strong> bezeichnet Zugehörigkeit, <strong>da</strong> Herkunft oder Bewegung aus einem Ort, <strong>ta</strong> den Empfänger.'
            },
            {
              title: 'Zeit, Verneinung, Frage und Bitte',
              text: 'Die Gegenwart bleibt unmarkiert. <strong>Pa</strong> bezeichnet Vergangenheit, <strong>fa</strong> Zukunft, <strong>wa</strong> eine Möglichkeit; <strong>ha</strong> zeigt Abschluss, <strong>va</strong> einen laufenden Vorgang. <strong>Nu</strong> verneint. Die feste Reihenfolge lautet <strong>Subjekt + nu + pa/fa/wa + Modalwort + ha/va + Verb</strong>; nur benötigte Stellen werden besetzt.<br><br><strong>Mi pa laitha i seith.</strong> — Ich las das Buch.<br><strong>Mi fa laitha i seith.</strong> — Ich werde das Buch lesen.<br><strong>Mi nu ce laitha i seith.</strong> — Ich kann das Buch nicht lesen.<br><strong>Aen ti ce laitha i seith?</strong> — Kannst du das Buch lesen?<br><strong>Me ti laitha?</strong> — Was liest du?<br><strong>Ve fina.</strong> — Bitte komm. <strong>Sha ni leira.</strong> — Lasst uns lernen.<br><br>Eine Ja-Nein-Frage beginnt mit aen; die Wortstellung bleibt erhalten. <strong>Ti</strong> ist vertraut, <strong>vi</strong> die Mehrzahl oder höfliche Einzelanrede.'
            },
            {
              title: 'Wissen, Bericht und begründeter Schluss',
              text: 'Am Satzende nennt <strong>dhei</strong> eigene Prüfung oder Zeugnis, <strong>hen</strong> einen Bericht, <strong>hena</strong> anerkannte Überlieferung und <strong>henai</strong> einen begründeten Schluss. Diese Wörter kennzeichnen die beanspruchte Grundlage, nicht automatisch die Wahrheit einer Aussage.<br><br><strong>I thaerir pa fina, dhei.</strong> — Der Ritter kam; ich bezeuge es selbst.<br><strong>I thaerir pa fina, hen.</strong> — Wie berichtet wird, kam der Ritter.<br><strong>Mi laima ya i seith es sithil, henai.</strong> — Ich denke, dass das Buch alt ist; das erschließe ich.<br><br>Im Gespräch sind die Zusätze freiwillig, in Lehrprüfungen und bindenden Aussagen werden sie erwartet. <strong>Ya</strong> leitet einen Inhaltssatz ein, <strong>ye</strong> einen Grund, <strong>tai</strong> eine Bedingung und <strong>yae</strong> einen Relativsatz.'
            },
            {
              title: 'Sechs Namenspartikeln, sechs unterschiedliche Aussagen',
              text: LAERELIS_REFERENCE_DATA.namenspartikeln.map(particle => `<strong>${particle.form}</strong> — ${particle.meaning}: <em>${particle.example}</em>.`).join('<br>')
                + '<br><br>Alle sechs Zusätze stehen getrennt vor ihrem Bezugsnamen und bleiben unabhängig vom Geschlecht unverändert. <strong>Seriel Dar Welenor</strong> stammt aus Welenor; <strong>Seriel Dor Welenor</strong> besitzt dort einen anerkannten Anspruch. <strong>Bel</strong> nennt eine unmittelbare Elternperson, <strong>Va</strong> eine Sippenlinie. Im gewöhnlichen Satz bleiben die ursprünglichen Wortfunktionen erhalten: va kann einen laufenden Vorgang markieren, Mar als Namenszusatz verweist dagegen auf ein Haus.'
            },
            {
              title: 'Zahlen sprechen und im Zwölfersystem rechnen',
              text: 'Die Zahlwörter von null bis elf lauten <strong>shom, an, du, tri, cae, pem, seis, sen, oeth, nav, den, elv</strong>. <strong>Duin</strong> heißt zwölf, <strong>duinen</strong> 144, <strong>duinor</strong> 1.728. Die lateinische Zahlenschreibung verwendet <strong>0–9, A und B</strong>; A steht für zehn, B für elf. <strong>10</strong> zur Basis zwölf bedeutet also zwölf.<br><br>Größere Gruppen stehen vor kleineren; a verbindet Reste: <strong>duin a an</strong> — dreizehn, <strong>du duin</strong> — vierundzwanzig. In der Hainschrift bilden die ersten elf Alphabetzeichen die Ziffern 1–11; ein mittlerer Punkt ist null, ein Zahlrahmen (hier #) kennzeichnet die Zahl. Alerias Kalender bleibt bei <strong>13 Monaten zu 36 Tagen</strong>: im Zwölfersystem 11 Monate zu 30 Tagen, insgesamt 330 Tage.'
            },
            {
              title: 'Zeichenwerte und die Grenzen der Deutung',
              text: 'Die Werte der 25 Grundzeichen werden für eine Buchstabensumme addiert. <strong>Th, dh, sh und ng</strong> zählen einmal; ae zählt als a und e. Sichtbare Fugen und Endungen zählen mit, Leerzeichen und Großschreibung nicht. <strong>Laerelin</strong> hat acht Zeichen und den Wert <strong>98</strong> (82 zur Basis zwölf), <strong>Laerelis</strong> den Wert <strong>97</strong> (81 zur Basis zwölf).<br><br>Das Zahlwort <strong>an</strong> bedeutet eins, besitzt aber den Zeichenwert 21. Zahlwort und Buchstabensumme erfüllen unterschiedliche Aufgaben. Gleiche Summen machen Wörter weder bedeutungsgleich noch magisch austauschbar. Eine geprüfte Signatur verlangt die vollständige registrierte Namensform; fehlende Namensglieder werden nicht ergänzt.'
            },
            {
              title: 'Sätze für Waldrand, Werkstatt und Haus',
              text: '<strong>Ser ta vi. Aen vi fina da Laerelin?</strong><br>Friede Euch. Kommt Ihr aus dem Lichthain?<br><br><strong>Ae. Nui es Laereliniri. Nui fa fera ta i nel.</strong><br>Ja. Wir sind Menschen des Lichthains. Wir werden zum Dorf gehen. Nui schließt den angesprochenen Fremden nicht in die eigene Gruppe ein.<br><br><strong>Ve fera ven mi. I tor es seril.</strong><br>Bitte geht mit mir. Die Straße ist friedlich.<br><br><strong>I calir pa vera i coel.</strong><br>Der Handwerker hat das Werkzeug ausgebessert.<br><br><strong>Ti es laer na mia mar. Mi mera ti; mi fa nura i meren.</strong><br>Du bist das Licht meines Hauses. Ich liebe dich; ich werde die Liebe bewahren.'
            },
            {
              title: 'Lichtfluss lesen und schreiben',
              text: 'Lichtfluss ist die Schrift, Laerelis die Sprache. Die 25 Grundzeichen auf Seite IV zeigen jeweils Laut, Zeichenname, Bedeutungsfelder und Wert. Darunter stehen alle 400 Stämme; Seite V enthält die 1.000 Sachwörter und 132 Funktionswörter mit Aussprache und Wortbau.<br><br>Für Fremdsprachblasen und Zauberformeln <strong>Laerelis · Lichtfluss</strong> wählen. Die Eingabe von th, dh, sh und ng ergibt jeweils ein eigenes Zeichen. Darüberfahren, Tastaturfokus oder Antippen zeigt den eingegebenen Klartext. Die Schriftwahl übersetzt einen deutschen Satz nicht automatisch.'
            }
          ],
          footer: 'Aleria Almanach · Laerelis · Sprachstand 1.1 · Lichtfluss und Gesamtpaket 1.2'
        }
      },
      { pageTitle: 'III. — 1.800 Namen aus dem Lichthain', nameListPage: true, nameList: createLaerelisNameListData() },
      { pageTitle: 'IV. — Lichtfluss und die 400 Wortstämme', scriptTablePage: true, scriptTable: createLaerelisScriptTableData() },
      createLaerelisLexiconPage()
    ]
  };
}
