function createTlapanuiLanguageEntry() {
  const assets = './modules/language/tlapanui/assets/';
  return {
    id: 'tlapanui', title: 'Nuatlapa · Tlapanui',
    subtitle: 'Die Rede der Inselgemeinschaft · Tavarua, Zeichen von Welle und Stufe',
    type: 'Sprache · Inselrede und Tavarua-Schrift', category: 'Sprachen · Tlapanui',
    image: `${assets}language-tlapanui-scene.webp`, stamp: 'TLAPANUI · TLAPATLAN · CALIDARIA · TAVARUA',
    multipage: true, appendCommentsPage: false, locked: false, icon: '🌊', symbol: null,
    pages: [
      {
        pageTitle: 'I. — Die Rede der Inselgemeinschaft',
        image: `${assets}language-tlapanui-scene.webp`, imageFit: 'contain', imagePosition: 'center', imageWidth: 46,
        description: '<strong>Nuatlapa</strong> bedeutet <strong>Rede der Inselgemeinschaft</strong>. Offene Vokale, fließende Inselklänge und die Lautgruppen <em>tl, ts, ch</em> und <em>qu</em> prägen die Sprache der Tlapanui. Eine kleine kaiserliche Schicht ergänzt lateinisch anmutende Endungen. Wohlklang und deutliche Aussprache haben Vorrang: Ein Name muss nicht Silbe für Silbe eine starre Bildbedeutung tragen.<br><br>Die Vorfahren der <strong>Tlapanui</strong> kamen aus <strong>Sundara</strong>. Ihr friedvolles Inselvolk nannte sein Land <strong>Tlapatlan</strong> und handelte mit den Nachbarn. Um Waren zu erhalten, die auf den eigenen Inseln nicht zugänglich waren, ließen sich die Tlapanui vom Kaiserreich annektieren. Das Reich gab dem Archipel den Namen <strong>Calidaria</strong>. Heute lebt dort ein Mischvolk aus Argentern und Tlapanui. Die Inselrede bewahrt diesen Zusammenhang von Gemeinschaft, Meer und Handel.<br><br>Ihre Schrift heißt <strong>Tavarua</strong>, Zeichen von Welle und Stufe. Breite Inselbögen, Wellenzüge, Stufen und monumentale Achsen bilden ein lautorientiertes Schriftbild. Die folgenden Seiten stellen Sprache und Schrift vor: Aussprache und Grammatik, 1.000 persönliche Namensvorschläge, die Tastaturzeichen und 200 Wortbausteine sowie das vollständige Wörterbuch.',
        stats: [
          ['Sprache', 'Nuatlapa · Rede der Inselgemeinschaft'],
          ['Sprecher', 'Tlapanui · heutige Mischbevölkerung Calidarias'],
          ['Herkunft und Land', 'Sundara · Tlapatlan · heute Calidaria'],
          ['Schrift', 'Tavarua · Zeichen von Welle und Stufe'],
          ['Wortbestand', '1.000 Wörter · 200 Wortbausteine'],
          ['Personennamen', '500 männliche · 500 weibliche Vorschläge']
        ],
        quote: 'Moku no Lani.', quoteBy: '— Beispiel der Sprachbibel: Insel des Lani.'
      },
      {
        pageTitle: 'II. — Klang, Schrift und Sprachgebrauch', languagePage: true,
        language: {
          archiveLabel: 'Nuatlapa · Sprachkunde der Tlapanui', nativeName: 'Nuatlapa · Rede der Inselgemeinschaft',
          family: 'Eigenständige Sprache · offene Inselphonetik und kaiserliche Lehnformen',
          speakers: 'Tlapanui · argentisch-tlapanuische Mischbevölkerung',
          regions: 'Tlapatlan · der heute Calidaria genannte Archipel; Vorfahren aus Sundara',
          scriptType: 'Tavarua · lautorientierte Schrift mit Bögen, Wellen und Stufen',
          writingDirection: 'Tavarua-Tastaturfont: waagerecht von links nach rechts',
          introduction: 'Nuatlapa verbindet vokalreiche Inselklänge mit markanten Lautverbänden. Feierliche Rede und alltägliches Mischregister verwenden unterschiedliche bevorzugte Satzstellungen. Tavarua hält die Sprache in einer eigenen, lautorientierten Schrift fest.',
          alphabetTitle: 'Tavarua · vollständige Zeichentafel',
          alphabetLayers: [{ label: 'Tavarua Bildschnitt 2.000', image: `${assets}tlapanui-zeichentafel.png`,
            alt: 'Originale Zeichentafel des Tavarua-Bildschnitts mit Buchstaben, Ziffern und Sonderzeichen',
            caption: 'Originaltafel des gelieferten Fonts. Groß- und Kleinbuchstaben, Ziffern, deutsche Sonderzeichen und übliche Tastaturzeichen sind belegt.' }],
          sections: [
            { title: 'Inselherkunft und kaiserlicher Kontakt', text: 'Die Tlapanui stammen aus Sundara; ihr Landesname Tlapatlan ging der kaiserlichen Bezeichnung Calidaria voraus. Die Annektierung war mit dem Zugang zu fremden Waren verbunden. Auf dem Archipel begegnen sich bis heute die Inselkultur und das argentische Erbe.<br><br>Die kleine lateinische Schicht der Sprache steht neben den offenen Inselklängen. Vor allem in Verwaltung, Handel und gelehrten Formen werden die kaiserlich geprägten Ausgänge hörbar.' },
            { title: 'Vokale und Lautverbände', text: '<strong>A, e, i, o und u</strong> bleiben klare Einzelvokale und werden nicht verschluckt. <strong>Tl</strong> ist ein seitlich gesprochener Lautverband, <strong>ts</strong> klingt wie z in <em>Zeit</em>, <strong>ch</strong> wie tsch; vor i und e kann es weicher ausfallen. <strong>Qu</strong> wird kw gesprochen. Ein Apostroph bezeichnet einen kurzen Kehlverschluss und kann gleiche Vokale trennen.<br><br>Die Betonung liegt gewöhnlich auf der vorletzten Silbe. Eine abweichende Betonung kann durch einen Akzent markiert werden.' },
            { title: 'Feierliche Rede und Alltag', text: 'Feierliche Rede bevorzugt <strong>Verb – Subjekt – Objekt</strong>. Im alltäglichen Mischregister steht häufiger <strong>Subjekt – Verb – Objekt</strong>. Der Unterschied betrifft die Satzstellung, während die Wortformen erkennbar bleiben.<br><br>Eigenschaftswörter folgen gewöhnlich dem Hauptwort. Hauptwörter besitzen kein grammatisches Geschlecht.' },
            { title: 'Belebte und unbelebte Mehrzahl', text: 'Die Mehrzahl wird durch ein vorangestelltes Wort angezeigt: <strong>na</strong> vor Belebtem, <strong>ma</strong> vor Unbelebtem. <em>Na apana</em> bedeutet die Menschen, <em>ma vatula</em> die Bauwerke.<br><br>Diese freien Mehrzahlwörter sind von gleich geschriebenen gebundenen Wortbausteinen zu unterscheiden. Ihre Funktion ergibt sich daraus, ob sie selbstständig vor einem Wort stehen oder mit einer Wurzel verbunden werden.' },
            { title: 'Besitz, Ort und Richtung', text: '<strong>No</strong> verbindet Besitz und Zugehörigkeit: <em>moku no Lani</em> bedeutet Insel des Lani. <strong>I</strong> kennzeichnet den Ort, etwa <em>i koro</em> für im Dorf. <strong>Ki</strong> bezeichnet eine Richtung: <em>ki Tlapatlan</em> heißt nach Tlapatlan.' },
            { title: 'Vergangenheit, Zukunft und Verneinung', text: '<strong>Kua</strong> kennzeichnet die Vergangenheit, <strong>e</strong> die Zukunft und <strong>kore</strong> die Verneinung. Die Beispiele lauten <em>kua tava</em> – ist gefahren, <em>e tava</em> – wird fahren und <em>kore tava</em> – fährt nicht.' },
            { title: 'Wurzeln, Präfixe und Suffixe', text: 'Die 200 Bausteine umfassen Klangwurzeln, produktive Präfixe und produktive Suffixe. Sie erschließen Themen wie Inselgemeinschaft, Natur, Handel, Handwerk, Recht und Reise. Auf Seite IV stehen ihre Bedeutungen, Aussprache und Register.<br><br>Gleich klingende selbstständige Wörter und Endungen können unterschiedliche Funktionen besitzen. Bei Personennamen bleibt der Wohlklang wichtiger als eine lückenlose Zerlegung in einzelne Bedeutungen.' },
            { title: 'Das kaiserliche Register', text: 'In kaiserlicher Amtssprache erscheinen häufiger Ausgänge wie <strong>-us, -um, -or, -aria und -ium</strong>. Amts-, Provinz- und Institutionsformen verbinden diese Schicht mit den Inselwurzeln.<br><br><em>-or</em> bezeichnet einen Amtsträger, <em>-aria</em> eine Provinzform und <em>-ium</em> eine Institution. Neben diesen Formen bewahrt die Alltagssprache ihre offenen, vokalreichen Ausgänge.' },
            { title: 'Personennamen und Wohlklang', text: 'Die beiden Listen auf Seite III enthalten jeweils <strong>500 Vornamen</strong>. Rhythmus, Wohlklang und Familiengebrauch stehen im Vordergrund. Die Klangbestandteile verpflichten einen Namen nicht auf eine starre Einzelbedeutung.<br><br>Einige Formen kommen in beiden Namenslisten vor. Inselklänge und kaiserlich anmutende Ausgänge stehen auch hier nebeneinander.' },
            { title: 'Tavarua lesen und verwenden', text: '<strong>Tavarua</strong> ist die Schrift, <strong>Nuatlapa</strong> die Sprache. Trotz ihrer bildhaften Formen ist die Schrift lautorientiert. Breite Bögen, Wellenzüge, Stufen und monumentale Achsen prägen das Schriftbild. Seite IV stellt Tastatureingabe und Schriftzeichen nebeneinander.<br><br>Für interaktive Szene, Anzeigetafel und Dokumentwerkstatt <strong>Nuatlapa · Tlapanui</strong> wählen. Der eingegebene Klartext bleibt erhalten; die Schriftwahl verändert das Zeichenbild, ohne den Text automatisch zu übersetzen.' }
          ],
          footer: 'Aleria Almanach · Nuatlapa 1.000 · Tavarua Bildschnitt 2.000'
        }
      },
      { pageTitle: 'III. — 1.000 Vornamen der Tlapanui', nameListPage: true,
        nameList: createPackageLanguageNameList(TLAPANUI_REFERENCE_DATA, { language: 'Nuatlapa', script: 'Tavarua', style: 'tlapanui',
          introduction: 'Je <strong>500 männliche und weibliche Vornamen</strong> aus der Nuatlapa-Namenssammlung, alphabetisch geordnet und in lesbarer Schrift. Wohlklang, Rhythmus und Familiengebrauch haben Vorrang vor einer zwingenden Einzelbedeutung jeder Silbe. Überschneidende Formen zwischen beiden Listen sind erhalten; die Sammlung bewahrt beide Verwendungen.' }) },
      { pageTitle: 'IV. — Tavarua und 200 Wortbausteine', scriptTablePage: true,
        scriptTable: createPackageLanguageScriptTable(TLAPANUI_REFERENCE_DATA, { language: 'Nuatlapa', script: 'Tavarua', style: 'tlapanui',
          subtitle: 'Tastaturzeichen und ihre Darstellung im Tavarua-Bildschnitt. TL, TS, CH und QU sind Lautverbände und bleiben lesbare Eingabefolgen; eigene Buchstabennamen sind nicht überliefert.' }) },
      createPackageLanguageLexiconPage(TLAPANUI_REFERENCE_DATA, 'Nuatlapa')
    ]
  };
}
