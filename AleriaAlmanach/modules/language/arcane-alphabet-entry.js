// Source of truth: /Fonts/Arkanes-Alphabet/arcane.js and its accompanying handbook.
// Reuse the font package's tokens and canonical glyphs instead of a second alphabet.
function createArcaneAlphabetRegisterPage(group, pageTitle, subtitle) {
  const runes = AleriaArcana.alphabet.filter(rune => rune.group === group);
  return {
    pageTitle,
    enableComments: false,
    scriptTablePage: true,
    scriptTable: sanitizeScriptTableData({
      archiveLabel: `Alte Zunge · Die elf Zeichen des ${group === 'Körper' ? 'Körpers' : group === 'Geist' ? 'Geistes' : 'Seelenkreises'}`,
      title: `Die Zeichen ${group === 'Seele' ? 'der Seele' : `des ${group === 'Körper' ? 'Körpers' : 'Geistes'}`}`,
      subtitle,
      scriptStyle: 'arcane',
      ornamentText: AleriaArcana.encodeTokens(runes.slice(0, 3).map(rune => rune.token)),
      symbolHeader: 'Rune',
      soundHeader: 'Laut · Eingabe',
      meaningHeader: 'Zahlenwert · Magische Bedeutung',
      rows: runes.map(rune => ({
        symbol: rune.char,
        name: rune.name,
        sound: `${rune.sound} · ${rune.token}`,
        meaning: `${rune.value} · ${rune.meaning}`
      })),
      footer: `Aleria Almanach · Arkanes Alphabet · ${group} · Alte Ritualrunen`
    })
  };
}

function createArcaneAlphabetFormulaPage() {
  return {
    pageTitle: 'VI. — Formeln & Runenschreibung',
    enableComments: false,
    scriptTablePage: true,
    scriptTable: sanitizeScriptTableData({
      archiveLabel: 'Alte Zunge · Überlieferte Verbindungen',
      title: 'Wortschmiedekunst',
      subtitle: 'Runenfolge, gesprochener Name und magische Absicht',
      scriptStyle: 'arcane',
      ornamentText: AleriaArcana.encodeTokens(['F', 'C', '!']),
      symbolHeader: 'Runenfolge',
      nameHeader: 'Formel · Runennamen',
      soundHeader: 'Eingabe',
      meaningHeader: 'Deutung',
      rows: [
        {
          symbol: AleriaArcana.encodeTokens(['R', 'CH', 'B']),
          name: 'Geistiger Schild · Ruis, Céthir, Beith',
          sound: 'R CH B',
          meaning: 'Gedankenmacht, Bann und Schutz bilden einen arkanen Schild gegen geistige Kontrolle.'
        },
        {
          symbol: AleriaArcana.encodeTokens(['AE', 'Y', '’']),
          name: 'Essenz und Wunsch · Aetha, Yren, Ón',
          sound: 'AE Y ’',
          meaning: 'Essenz, innerster Wunsch und Leere: überlieferte Grundlage für Weltschöpfung oder Wunschopfer. Kein vollständig ausgearbeitetes Ritual.'
        },
        {
          symbol: AleriaArcana.encodeTokens(['F', 'C', '!']),
          name: 'Farkael · Fearn, Coll, Xhael',
          sound: 'FC!',
          meaning: 'Feuerball: Fearn trägt Wärme und Energie, Coll gibt Struktur und Kugelgestalt, Xhael entfesselt den Schock. Der Zaubername Farkael und seine drei bedeutungstragenden Runen werden unterschiedlich geschrieben.'
        }
      ],
      syllablesTitle: 'Die Runen eingeben',
      syllablesSubtitle: 'Für Zauberformeln und Fremdsprachblasen „Arkanes Alphabet · Alte Zunge“ wählen. Die lesbare Eingabe bleibt erhalten und lässt sich durch Berühren, Fokussieren oder Antippen der Blase anzeigen.',
      syllableHeader: 'Eingabe',
      syllableMeaningHeader: 'Zeichen',
      syllableUsageHeader: 'Schreibweise',
      syllables: [
        { syllable: 'CH · SH · TH · HL · GH · NG · DZ · TS · AE', meaning: 'Neun Doppelzeichen', usage: 'Jede zusammenhängende Buchstabenfolge bildet eine Rune; Groß-, Klein- und Mischschreibung sind gleichwertig.' },
        { syllable: 'C H / CH', meaning: 'Getrennte oder verbundene Zeichen', usage: 'C H sind Coll und Huathe. CH ist Céthir. Leerzeichen erhalten beabsichtigte Zeichengrenzen.' },
        { syllable: "’ oder '", meaning: 'Ón', usage: 'Beide Apostrophe stehen für den Bruch des Bewusstseins.' },
        { syllable: '! / Æ / æ', meaning: 'Xhael / Aetha', usage: 'Das Ausrufezeichen ist eine Rune; Æ und æ sind zusätzliche Eingaben für AE.' },
        { syllable: 'J K Q W Ä Ö Ü ß', meaning: 'Keine festgelegten Runen', usage: 'Diese Buchstaben bleiben in lesbarer Ersatzschrift stehen. Für den Laut k ist Coll (C) vorgesehen; deutsche Texte werden nicht automatisch übersetzt.' },
        { syllable: '1–11 · 21–31 · 41–51', meaning: 'Körper · Geist · Seele', usage: 'Zahlenwerte sind Eigenschaften der Runen. Eine verbindliche Rechenregel zur Deutung von Namen oder Prophezeiungen ist nicht überliefert.' }
      ],
      footer: 'Aleria Almanach · Arkanes Alphabet · Formeln nach dem Handbuch der Alten Ritualrunen'
    })
  };
}

function createArcaneAlphabetModuleEntry() {
  return {
    id: 'arkanes-alphabet',
    title: 'Das Arkane Alphabet',
    subtitle: 'Die Alte Zunge · Körper, Geist und Seele',
    type: 'Magische Schrift · Alte Ritualrunen',
    category: 'Sprachen · Alte Zunge',
    image: './public/assets/arcane-alphabet/ritual-study.png',
    stamp: 'ALTE ZUNGE · WORTSCHMIEDEKUNST · ARKANES SCHRIFTARCHIV',
    multipage: true,
    appendCommentsPage: false,
    locked: false,
    icon: '✦',
    symbol: null,
    pages: [
      {
        pageTitle: 'I. — Die Schrift der Alten Zunge',
        image: './public/assets/arcane-alphabet/ritual-study.png',
        imageWidth: 44,
        imageFit: 'contain',
        imagePosition: 'center',
        enableComments: true,
        commentThreadKey: 'alte-zunge',
        description: 'Das <strong>Arkane Alphabet</strong> ist das magische Schriftsystem der <strong>Alten Zunge</strong>. Seine dreiunddreißig Zeichen verbinden jeweils einen Laut mit einem Namen, einer magischen Bedeutung und einem Zahlenwert. Sie gliedern sich in drei Klassen: <em>Körper, Geist und Seele</em>.<br><br>Die Alte Zunge wurzelt in der mystischen Sprachtradition der Druiden, der frühen Seher und Weltenformer. Als „Sprache der Götter“ oder „Sprache der Ersten Menschen“ gilt sie als Werkzeug der Schöpfung. Die ersten menschlichen Zauberer ahmten Zeichen und Riten der Druiden nach. Aus dieser Beschäftigung entstanden Magierorden, die Fragmente der Überlieferung sammelten und zu einer magischen Schriftsprache formten.<br><br>In der <strong>Wortschmiedekunst</strong> verbinden sich Formen, Sprechen und Binden. Eine Rune zeichnet nicht nur etwas auf: Sie kann Träger einer Kraft sein, die durch Absicht und Kanalisation wirksam wird. In Gravuren, Talismanen, beschriebenen Tafeln und Bannkreisen erhalten diese Kräfte eine Gestalt.',
        stats: [
          ['Überlieferung', 'Alte Zunge · Druiden, Seher und Weltenformer'],
          ['Schriftfassung', 'Alte Ritualrunen · Aleria Arcana'],
          ['Zeichenordnung', '33 Runen · drei Klassen zu je elf Zeichen'],
          ['Körper', 'Materie und Lebenskraft · Werte 1–11'],
          ['Geist', 'Erkenntnis und Wille · Werte 21–31'],
          ['Seele', 'Wahrheit und innerstes Wesen · Werte 41–51']
        ]
      },
      {
        pageTitle: 'II. — Zeichenordnung & Überlieferung',
        languagePage: true,
        enableComments: false,
        language: {
          archiveLabel: 'Sprachkunde · Die Alte Zunge',
          nativeName: 'Das Arkane Alphabet · Alte Ritualrunen',
          family: 'Mystische Sprachtradition der Druiden, frühen Seher und Weltenformer',
          speakers: 'Druiden · Seher · Zauberer · Magierorden',
          scriptType: 'Magische Zeichenordnung · 33 bedeutungstragende Runen',
          introduction: 'Jede Rune besitzt drei miteinander verbundene Gesichter: Ihr Laut wird gesprochen oder stumm rezitiert, ihr Name ruft sie auf, und ihre Bedeutung bestimmt das Feld ihrer möglichen Wirkung. Kontext, Absicht und Ritual legen fest, wie dieses Bedeutungsfeld entfaltet wird.',
          alphabetTitle: 'Die dreiunddreißig Alten Ritualrunen',
          alphabetLayers: [{
            label: 'Körper · Geist · Seele',
            image: '../Fonts/Arkanes-Alphabet/Schriftuebersicht.png',
            alt: 'Die 33 Runen des Arkanen Alphabets, geordnet nach Körper, Geist und Seele, mit Namen, Eingaben und Zahlenwerten',
            caption: 'Vollständige Schrifttafel der Alten Ritualrunen. Die folgenden Register führen Namen, Laute, Werte und Bedeutungen einzeln auf.'
          }],
          sections: [
            { title: 'Körper · Das Sichtbare und Greifbare', text: 'Blut, Knochen, Körpergrenzen und physische Kraft bilden den ersten Kreis. Seine elf Zeichen verbinden die Ritualschrift mit Materie und Lebenskraft. Sie können Materie formen, Wunden schließen oder Metall verändern.' },
            { title: 'Geist · Gedanken, Erkenntnis und Wille', text: 'Erinnerung, Täuschung, Logik, Bann und mentale Bindung gehören zum zweiten Kreis. Diese Zeichen können Denken ordnen, verschleiern oder beherrschen. Ihre Zahlenwerte reichen von 21 bis 31.' },
            { title: 'Seele · Das innerste Wesen', text: 'Der dritte Kreis berührt Wahrheit, Identität, Schuld, Schicksal, Wunsch und Urteil. Die Überlieferung beschreibt diese elf Zeichen als besonders selten und gefährlich. Ihre Werte reichen von 41 bis 51.' },
            { title: 'Formen, Sprechen und Binden', text: 'Runen werden zu Namen, Siegeln, Bannkreisen oder Formeln verbunden. Die Kanalisation erfolgt durch Ritual, Medium oder Stimme. Eine Verbindung ist nicht einfach die Summe einzelner Wörterbuchbedeutungen: Reihenfolge, Absicht und Verwendung gehören zur magischen Handlung.' },
            { title: 'Rune, Wort und Zaubername', text: 'Ein ausgeschriebenes Wort, eine Folge bedeutungstragender Runen und ein gesprochener Zaubername sind verschiedene Ebenen. <strong>Farkael</strong> etwa bezeichnet einen Feuerball aus <em>Fearn, Coll und Xhael</em>. Seine Runenfolge lautet <strong>FC!</strong>. Eine allgemeine Regel, die beliebige Zaubernamen in solche Formeln überführt, ist nicht festgelegt.' },
            { title: 'Zahl und Deutung', text: 'Die Zahlenwerte bleiben eigenständige Eigenschaften der Runen. Zwischen Körper, Geist und Seele liegen unbelegte Zwischenräume. Eine verbindliche Rechenregel für Namensdeutung oder Prophezeiung ist mit dieser Ordnung noch nicht festgelegt.' }
          ],
          footer: 'Aleria Almanach · Alte Zunge · Nach dem Handbuch des Arkanen Alphabets'
        }
      },
      createArcaneAlphabetRegisterPage('Körper', 'III. — Die elf Zeichen des Körpers', 'Materie, Lebenskraft und Körpergrenzen · Werte 1 bis 11'),
      createArcaneAlphabetRegisterPage('Geist', 'IV. — Die elf Zeichen des Geistes', 'Erinnerung, Erkenntnis und Wille · Werte 21 bis 31'),
      createArcaneAlphabetRegisterPage('Seele', 'V. — Die elf Zeichen der Seele', 'Wahrheit, Identität und Schicksal · Werte 41 bis 51'),
      createArcaneAlphabetFormulaPage()
    ]
  };
}
