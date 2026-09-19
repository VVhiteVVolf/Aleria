function createLaerelisNameListData() {
  const labels = [
    ['maennlich', 'Männliche Rufnamen'],
    ['weiblich', 'Weibliche Rufnamen'],
    ['sippe_haus', 'Sippen und Häuser']
  ];
  return sanitizeNameListData({
    archiveLabel: 'Laerelis · Namensarchiv des Lichthains',
    introduction: '1.800 Namensvorschläge: <strong>600 männliche Rufnamen, 600 weibliche Rufnamen und 600 Sippen- und Hausnamen</strong>. Jede Gruppe ist alphabetisch geordnet. <strong>Va</strong> nennt die Sippe, <strong>Mar</strong> das Haus, <strong>Dar</strong> die Herkunft, <strong>Dor</strong> einen anerkannten Anspruch, <strong>Bel</strong> die unmittelbar genannte Elternperson und <strong>Len</strong> die Lehrfolge. Die Partikeln stehen getrennt; Dar verleiht keinen Adel. Die Listen begründen keine bereits bestehenden Personen oder Häuser.<br><br>Vollständige Reihenfolge: <strong>Amt · Rufname · Bel Elternname · Va Sippe · Mar Haus · Dar Herkunft · Dor Sitz</strong>; im gelehrten Zusammenhang folgt Len. Im Alltag genügt meist ein Zusatz. Beispiel: <strong>Thaerir Baeron Bel Nathir Va Calen Mar Maeren Dor Welenor</strong>.',
    ornamentText: 'Laerelis · Laerelin · Laeriel Va Calen',
    ornamentStyle: 'laerelis',
    groups: labels.map(([category, label]) => ({
      label,
      subtitle: category === 'sippe_haus' ? '300 Sippen · 300 Häuser · A–Z' : '600 Namen · A–Z',
      names: LAERELIS_REFERENCE_DATA.namen.filter(item => item.kategorie === category)
        .map(item => item.vollform).sort((a, b) => a.localeCompare(b, 'de', { sensitivity: 'base' }))
    })),
    footer: 'Aleria Almanach · Laerelis · Sprachstand 1.1 · Namensrevision 03'
  });
}

function createLaerelisScriptTableData() {
  return sanitizeScriptTableData({
    archiveLabel: 'Lichtfluss · Das Bedeutungsalphabet des Lichthains',
    title: '25 Zeichen und 400 Wortstämme',
    subtitle: 'Laut, Zeichenfeld und fester Wortstamm sind verschiedene Ebenen. TH, DH, SH und NG zählen jeweils als ein Zeichen; AE bleibt eine Folge aus zwei Zeichen.',
    scriptStyle: 'laerelis',
    ornamentText: 'Lael vai dhael es hol.',
    symbolHeader: 'Lichtfluss',
    nameHeader: 'Zeichenname',
    soundHeader: 'Laut · Eingabe',
    meaningHeader: 'Bedeutungsfelder · Zeichenwert',
    rows: LAERELIS_REFERENCE_DATA.alphabet.map(letter => ({
      symbol: letter.direktzeichen,
      name: letter.name,
      sound: letter.laut,
      meaning: `${letter.bedeutungsfelder} · Wert ${letter.wert}`
    })),
    syllablesTitle: 'Die 400 einsilbigen Wortstämme',
    syllablesSubtitle: 'Die Stämme sind Bausteine der 1.000 Sachwörter auf Seite V und werden nicht als zusätzliche Wörter gezählt. Die Kennungen R001–R400 lösen dort die Wortbildung auf. Zeichenwerte sind Buchstabensummen in Dezimalzahlen, keine Übersetzungsregel.',
    syllableHeader: 'Stamm · Kennung',
    syllableMeaningHeader: 'Feste Bedeutung',
    syllableUsageHeader: 'Aussprache · Bereich · Zeichenwert',
    syllables: LAERELIS_REFERENCE_DATA.wortstaemme.map(root => ({
      syllable: `${root.stamm} · ${root.id}`,
      meaning: root.bedeutung,
      usage: `${root.aussprache} · ${root.thema} · Wert ${root.zeichenwert}`
    })),
    footer: 'Aleria Almanach · Laerelis · Lichtfluss 1.000 · Schriftstand 1.2'
  });
}

function createLaerelisLexiconPage() {
  const partsOfSpeech = { N: 'Nomen', V: 'Verb', A: 'Eigenschaft' };
  const rows = [
    ...LAERELIS_REFERENCE_DATA.sachwoerter.map(word => ({
      symbol: word.wort,
      name: word.bedeutung,
      sound: word.aussprache,
      meaning: `${word.id} · ${partsOfSpeech[word.wortart]} · ${word.aufbau}`
    })),
    ...LAERELIS_REFERENCE_DATA.funktionswoerter.map(word => ({
      symbol: word.form,
      name: word.bedeutung,
      sound: word.aussprache,
      meaning: `${word.id} · Funktionswort · ${word.verwendung}`
    }))
  ].sort((a, b) => a.symbol.localeCompare(b.symbol, 'de', { sensitivity: 'base' }));
  return {
    pageTitle: 'V. — 1.000 Sachwörter und 132 Funktionswörter',
    enableComments: false,
    scriptTablePage: true,
    scriptTable: sanitizeScriptTableData({
      archiveLabel: 'Laerelis · Wörterbuch des Lichthains',
      title: '1.132 Wörter für Hain, Haus und Lehrhalle',
      subtitle: 'Laerelis A–Z · 1.000 Sachwörter (W) und 132 Funktionswörter (F). GROSS markiert die betonte Silbe. R verweist auf die Wortstämme auf Seite IV. Die Lesehilfe setzt weiches englisches r, th, dh und w voraus.',
      scriptStyle: 'plain',
      ornamentText: '',
      symbolHeader: 'Laerelis',
      nameHeader: 'Deutsch',
      soundHeader: 'Aussprache',
      meaningHeader: 'Wortart · Aufbau und Gebrauch',
      rows,
      footer: 'Aleria Almanach · Laerelis · Sprache 1.1 · Erschlossen im Gesamtpaket 1.2'
    })
  };
}
