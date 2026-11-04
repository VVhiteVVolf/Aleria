function createIshtaranLanguageEntry() {
  const assets = './modules/language/ishtaran/assets/';
  return {
    id: 'ishtaran', title: 'Tirghan · Ishtaran',
    subtitle: 'Die Rede des gemeinsamen Landes · Ayluun, Schrift des geführten Bogens',
    type: 'Sprache · Tirghan und Ayluun-Schrift', category: 'Sprachen · Ishtaran',
    image: `${assets}language-ishtaran-scene.webp`, stamp: 'ISHTARAN · TIRNARA · TIRGHAN · AYLUUN',
    multipage: true, appendCommentsPage: false, locked: false, icon: '📜', symbol: null,
    pages: [
      {
        pageTitle: 'I. — Die Rede des gemeinsamen Landes',
        image: `${assets}language-ishtaran-scene.webp`, imageFit: 'contain', imagePosition: 'center', imageWidth: 46,
        description: '<strong>Tirghan</strong>, die Rede des gemeinsamen Landes, ist die moderne Sprache des heutigen <strong>Ishtaran auf Tirnara</strong>. Sein fester, konsonantenreicher Klang verbindet turkisch-mongolisch angeregte Silben mit einer kleinen gälischen Färbung in alten und ehrenden Formen. Die Schreibweise bleibt für deutschsprachige Leser zugänglich. <strong>Ayluun</strong>, die Schrift des geführten Bogens, gibt dieser Rede ein eigenes Zeichenbild.<br><br>Die Bevölkerung Ishtarans ging aus den <strong>Maghath</strong> und ihrem antiken Fürstentum <strong>Maghneach</strong> hervor. Zarakhul unterwarf Tirnaras Völker unter seiner infernalen Sprache; <strong>Orin</strong> störte die Tyrannei durch Sprachverwirrung. Nach dem Zerfall der alten albischen Ordnung und der Zerschlagung Zarakhuls entstand das spätere Ishtaran mit einer gänzlich anderen Sprache. Seine Herkunft macht Tirghan weder zu einer albischen Grammatik noch zu einer albisch-infernalischen Mischsprache.<br><br>Das heutige Ishtaran ist türkisch und seldschukisch inspiriert. Wissenschaft, Esoterik und weitere Studien haben ihren Ort an der <strong>Madrasa</strong>; der <strong>Sahir</strong> ist der oberste Gelehrte. Die Kultur betrachtet Dualität, Balance und Frieden, schützt Religionsfreiheit und räumt Religion keine politische Macht ein. Die folgenden Seiten erschließen Klang und Grammatik, persönliche Namen, Schrift und Wortschatz.',
        stats: [
          ['Sprache', 'Tirghan · Rede des gemeinsamen Landes'],
          ['Land', 'Ishtaran · Kontinent Tirnara'],
          ['Historisches Erbe', 'Maghath · Maghneach · bewusster Sprachbruch'],
          ['Schrift', 'Ayluun · Schrift des geführten Bogens'],
          ['Wortbestand', '1.000 Wörter · 200 Wortbausteine'],
          ['Personennamen', '500 männliche · 500 weibliche Vorschläge']
        ],
        quote: 'Hanin tam.', quoteBy: '— Beispiel der Sprachbibel: Siegel des Herrschers.'
      },
      {
        pageTitle: 'II. — Klang, Schrift und Sprachgebrauch', languagePage: true,
        language: {
          archiveLabel: 'Tirghan · Sprachkunde Ishtarans', nativeName: 'Tirghan · Rede des gemeinsamen Landes',
          family: 'Eigenständige moderne Sprache · turkisch-mongolisch angeregter Klang · kleine gälische Färbung',
          speakers: 'Istharaner · Gelehrte, Hof, Handwerk, Reiter und mündliche Überlieferung',
          regions: 'Ishtaran auf Tirnara · Madrasa, Höfe, Städte und Reisende',
          scriptType: 'Ayluun · Schrift des geführten Bogens · vollständiger Tastaturfont',
          writingDirection: 'Ayluun-Tastaturfont: waagerecht von links nach rechts',
          introduction: 'Tirghan arbeitet mit Wurzeln und angefügten Endungen. Die moderne Sprache steht für den Bruch mit der früheren infernalen Unterwerfung. Das Schriftbild Ayluuns verbindet feste Stammstriche mit Bögen, Haken und offenen Schleifen.',
          alphabetTitle: 'Ayluun Mondbogen · vollständige Zeichentafel',
          alphabetLayers: [{ label: 'Ayluun Mondbogen 1.000', image: `${assets}ishtaran-zeichentafel.png`,
            alt: 'Originale Ayluun-Mondbogen-Zeichentafel mit Tastaturbuchstaben, Ziffern und Sonderzeichen',
            caption: 'Originaltafel aus dem Ishtaran-Gesamtpaket 1.000. Die Fontbelegung erhält lateinische Eingabe, deutsche Umlaute, Ziffern und Tastaturzeichen.' }],
          sections: [
            { title: 'Maghath, Maghneach und der Sprachbruch', text: '<strong>Maghath</strong> ist der Volksname, <strong>Maghneach</strong> der Name der antiken fürstlichen Heimat. Ishtaran liegt auf <strong>Tirnara</strong>. Die Bevölkerung bewahrt ihre Herkunft, besitzt nach Zarakhuls Zerschlagung aber eine neue Sprache.<br><br>Orins Sprachverwirrung durchbrach die gemeinsame infernale Sprache der Unterworfenen. Das moderne Tirghan steht damit für eine andere sprachliche Ordnung als die einstige Tyrannei.' },
            { title: 'Name und Klang der neuen Sprache', text: '<strong>Tirghan</strong> heißt Rede des gemeinsamen Landes. Der Name verbindet <em>tir</em> für Land mit der sprachbezogenen Bildung um <em>gar</em>; gh bezeichnet eine weich geriebene Übergangslautung.<br><br>Kräftige Konsonanten, häufig zwei bis drei Silben und gut lesbare Endungen prägen den Klang. Alte und ehrende Formen können gälisch gefärbte Ausgänge wie <em>-eal, -ach und -aigh</em> tragen.' },
            { title: 'Aussprache und lesbare Schreibung', text: '<strong>Sch</strong> klingt wie sch in <em>Schule</em>, <strong>tsch</strong> wie tsch in <em>Deutsch</em>. <strong>Gh</strong> ist ein weiches kehliges g, besonders in alten Formen. <strong>Ö und ü</strong> bleiben vollwertige deutsche Umlaute. <strong>Ai und ae</strong> werden getrennt oder leicht gleitend gesprochen. Das <strong>r</strong> ist gerollt oder deutlich und wird nicht verschluckt.<br><br>Die germanisierte Schreibung zeigt sich in Namen wie <strong>Aschina, Göktemir und Börtugan</strong> sowie den Amtstiteln <strong>Müder und Va’iz</strong>.' },
            { title: 'Satzbau und angefügte Endungen', text: 'Tirghan ist <strong>agglutinierend</strong>: Mehrere Endungen können an eine Wurzel treten. Die Grundreihenfolge lautet <strong>Subjekt – Objekt – Verb</strong>. Attribute stehen gewöhnlich vor dem Hauptwort; Orts- und Verhältnisendungen treten zuletzt an die Wortform.<br><br>Die Sprache besitzt kein grammatisches Geschlecht. Eine Geschlechtsmarkierung erscheint dort, wo Stand, Anrede oder persönliche Benennung sie erfordern. Die bestätigte Paarform Sayyid / Sayyida bleibt erhalten.' },
            { title: 'Mehrzahl, Besitz und Zugehörigkeit', text: '<strong>-lar</strong> kennzeichnet die belebte Mehrzahl: <em>aranlar</em> heißt Menschen. <strong>-ler</strong> bezeichnet die unbelebte Mehrzahl, etwa <em>taschler</em> für Steine. <strong>-in</strong> verbindet Besitz oder Zugehörigkeit: <em>hanin tam</em> bedeutet Siegel des Herrschers.' },
            { title: 'Ort, Herkunft, Richtung und Gemeinschaft', text: '<strong>-de</strong> bedeutet an oder in, <strong>-den</strong> von oder aus, <strong>-ka</strong> zu oder nach. Die Beispiele lauten <em>kentde</em> – in der Stadt, <em>dagden</em> – vom Berg und <em>Altasarka</em> – nach Altasar. <strong>-ile</strong> bedeutet mit oder gemeinsam; <em>cerile</em> heißt mit dem Heer.' },
            { title: 'Verneinung, Vergangenheit und Bedingung', text: '<strong>-ma</strong> verneint: <em>gelma</em> bedeutet nicht kommen. <strong>-di</strong> markiert die abgeschlossene Vergangenheit, <em>geldi</em> heißt kam. <strong>-sa</strong> bezeichnet Bedingung oder Möglichkeit: <em>gelsa</em> bedeutet falls er oder sie kommt.<br><br>Weitere Bausteine auf Seite IV unterscheiden unter anderem andauernde und vollendete Handlung.' },
            { title: 'Dualität, Gelehrsamkeit und weltliche Ordnung', text: 'Die Kultur betrachtet zwei entgegengesetzt wirkende, bislang <strong>unbenannte Entitäten</strong>. Tag und Nacht, Licht und Dunkelheit sowie Gut und Böse beschreiben ihre Gegenüberstellung. Das ist keine staatliche Götterverehrung. Religionsfreiheit besteht; Religion erhält keine politische Macht.<br><br>Die <strong>Madrasa</strong> widmet sich Wissenschaft, Esoterik und weiteren Studien. Der <strong>Sahir</strong> ist oberster Gelehrter, der <strong>Va’iz</strong> Ratsmagier. Beide sind keine daraus abgeleiteten geistlichen Staatsämter.' },
            { title: 'Titel, Ämter und Kriegerklassen', text: '<strong>Emir</strong> bedeutet Fürst oder Herzog, <strong>Amir</strong> Marschall. <strong>Timar</strong> ist der ritterliche Herr mit Land; <strong>Sayyid / Sayyida</strong> bezeichnet den Ritter ohne Landbesitz. Titel, Staatsamt und Kriegerklasse haben jeweils eine eigene Bedeutung.<br><br><strong>Nefer, Derwisch, Sipahi, Ghulam, Aschik, Nizet, Keman und Lewent</strong> sind die acht Kriegerklassen. Der Aschik verbindet Fechten, Musik, Dichtung und Überlieferung.' },
            { title: 'Wortbausteine und vollständiges Wörterbuch', text: 'Seite IV enthält alle <strong>200 nummerierten Wurzeln, Präfixe und Suffixe</strong>. Identische Schreibungen können unterschiedliche Funktionen tragen: <em>gök</em> steht als Wurzel für Himmel und als Präfix für himmlisch oder hoch. Nummer und Typ erleichtern die Unterscheidung.<br><br>Seite V erschließt <strong>1.000 Wörter</strong> mit deutscher Bedeutung, Wortart, Themenfeld und Herleitung.' },
            { title: 'Vornamen, Häuser und Orte auseinanderhalten', text: 'Die <strong>500 männlichen und 500 weiblichen Vornamen</strong> auf Seite III verbinden persönliche Benennung mit den Wurzeln der Sprache. <em>Aran</em> verbindet Mensch und Zugehörigkeit, <em>Ayen</em> Mond und weibliche Person.<br><br>Die Vornamenslisten stehen neben den überlieferten Haus- und Ortsnamen. Klänge wie <em>-bek, -tegin</em> und <em>-lug</em> begegnen in persönlichen Namen und im älteren Namenskorpus, ohne dass jeder Name eine wörtliche Standesbezeichnung sein muss.' },
            { title: 'Ayluun lesen und verwenden', text: '<strong>Ayluun</strong> ist die Schrift des geführten Bogens, <strong>Tirghan</strong> die Sprache. Harte Stammstriche erinnern an Steppeninschriften. Bögen, Haken und offene Schleifen tragen die Schreibertradition der Höfe und Madrasas. Die Zahlzeichen folgen einer eigenen Mondbogenform.<br><br>Die Zeichentafel und Seite IV zeigen die Tastatureingabe neben den Schriftzeichen. Für interaktive Szene, Anzeigetafel und Dokumentwerkstatt <strong>Tirghan · Ishtaran</strong> wählen. Der eingegebene Klartext bleibt erhalten; die Schriftwahl verändert das Zeichenbild, ohne den Text automatisch zu übersetzen.' }
          ],
          footer: 'Aleria Almanach · Tirghan 1.000 · Ayluun Mondbogen 1.000'
        }
      },
      { pageTitle: 'III. — 1.000 Vornamen aus Ishtaran', nameListPage: true,
        nameList: createPackageLanguageNameList(ISHTARAN_REFERENCE_DATA, { language: 'Tirghan', script: 'Ayluun', style: 'ishtaran',
          introduction: 'Je <strong>500 männliche und weibliche Vornamen</strong> aus der Tirghan-Namenssammlung, alphabetisch geordnet. Persönliche Namen verbinden Klang und Bedeutung; Haus- und Ortsnamen bilden eigene Namensgruppen.' }) },
      { pageTitle: 'IV. — Ayluun und 200 Wortbausteine', scriptTablePage: true,
        scriptTable: createPackageLanguageScriptTable(ISHTARAN_REFERENCE_DATA, { language: 'Tirghan', script: 'Ayluun', style: 'ishtaran',
          subtitle: 'Tastaturzeichen und ihre Darstellung in Ayluun Mondbogen. SCH, TSCH und GH bleiben lesbare Eingabefolgen; eigene Buchstabennamen sind nicht überliefert.' }) },
      createPackageLanguageLexiconPage(ISHTARAN_REFERENCE_DATA, 'Tirghan')
    ]
  };
}
