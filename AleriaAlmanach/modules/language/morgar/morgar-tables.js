function createKarnrithNameListData() {
  return sanitizeNameListData({
    archiveLabel: `Morgar ${MORGAR_REFERENCE_DATA.languageVersion} · Namen von A bis Z`,
    introduction: '500 männliche, 500 weibliche und 100 Unisex-Namen: Jede Liste reicht alphabetisch von A bis Z. Kurze Formen wie Adrak, Brana und Toren stehen neben kräftigen Dreisilbern wie Anarak, Kharuna und Gendara. Die erste Silbe trägt den Hauptdruck; alle Vokale werden gesprochen. C klingt wie K, J wie in Jahr, Qu wie kw, X wie ks und Y wie ü. KH klingt wie das ch in Bach; TH ist ein kräftiges, leicht behauchtes T. Die Namensformen sind Vorschläge für Figuren, keine verbindlichen Aussagen über Rang oder Charakter.',
    ornamentText: 'MORGAR · KARNRITH · BRANA · KHARUN',
    ornamentStyle: 'karnrith',
    groups: MORGAR_REFERENCE_DATA.names.map(group => ({
      label: group.label,
      subtitle: `${group.names.length} Namen · A–Z`,
      names: group.names
    })),
    footer: `Aleria Almanach · Morgar ${MORGAR_REFERENCE_DATA.languageVersion} · 1.100 Namen`
  });
}

function createKarnrithScriptTableData() {
  return sanitizeScriptTableData({
    archiveLabel: 'Karnrith Tiefenrunen · Fels, Raum, Blut, Hand und Geist',
    title: 'Karnrith-Zeichen und Morgar-Silben',
    subtitle: '30 überlieferte Schriftzeichen · 72 Bausteine für die heutige Sprache',
    ornamentText: 'MORGAR · KARNRITH · GARUM · DARAK',
    scriptStyle: 'karnrith',
    symbolHeader: 'Zeichen',
    nameHeader: 'Überlieferter Zeichenname',
    soundHeader: 'Tastatureingabe',
    meaningHeader: 'Sinnbild der Rune',
    rows: Karnrith.alphabet.map(rune => ({
      symbol: rune.token,
      name: rune.name,
      sound: rune.token,
      meaning: rune.meaning
    })),
    syllablesTitle: '72 Silben, Endungen und freie Bindewörter',
    syllablesSubtitle: 'Die folgenden kurzen Bausteine bilden Wörter. Die alten Zeichennamen darüber sind Merknamen der Schrift und werden nicht zu neuen Wortketten zusammengefügt.',
    syllables: MORGAR_REFERENCE_DATA.syllables,
    footer: `Aleria Almanach · Morgar ${MORGAR_REFERENCE_DATA.languageVersion} · Gesellschaft, Lehen, Heer und Alltag`
  });
}

function createMorgarLexiconPage() {
  const wordCount = MORGAR_REFERENCE_DATA.words.length;
  return {
    pageTitle: `V. — Die ${wordCount} wichtigsten Wörter · A–Z`,
    enableComments: false,
    scriptTablePage: true,
    scriptTable: sanitizeScriptTableData({
      archiveLabel: `Morgar ${MORGAR_REFERENCE_DATA.languageVersion} · Wörter des täglichen Lebens`,
      title: `${wordCount} Wörter für Halle, Lehen und Heer`,
      subtitle: 'A–Z · Dreizehn Lebensbereiche · Die GROSS geschriebene Silbe trägt den Hauptdruck. Ein Leerzeichen trennt eigenständige Wörter, ein Punkt trennt Sprechsilben.',
      scriptStyle: 'plain',
      ornamentText: '',
      symbolHeader: 'Morgar',
      nameHeader: 'Deutsch',
      soundHeader: 'So wird es gesprochen',
      meaningHeader: 'Lebensbereich · Gebrauch',
      rows: MORGAR_REFERENCE_DATA.words.map(item => ({
        symbol: item.word,
        name: item.meaning,
        sound: item.syllables.split(' ').map(word => word.replace(/^[^·]+/, first => first.toUpperCase())).join(' '),
        meaning: `${item.category} · ${item.usage}`
      })),
      footer: `Aleria Almanach · Morgar ${MORGAR_REFERENCE_DATA.languageVersion} · Kurze Wörter, klare Silben, kräftige Stimme`
    })
  };
}
