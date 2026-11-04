// Adapters for the common contract of the Nuatlapa and Tirghan source packages.
function createPackageLanguageNameList(data, { language, script, style, introduction }) {
  return sanitizeNameListData({
    archiveLabel: `${language} · Namensarchiv`,
    introduction,
    ornamentText: language,
    ornamentStyle: style,
    groups: [['namen_maennlich', 'Männliche Vornamen'], ['namen_weiblich', 'Weibliche Vornamen']]
      .map(([key, label]) => ({ label, subtitle: '500 Namensvorschläge · A–Z',
        names: data[key].map(item => item.Name).sort((left, right) => left.localeCompare(right, 'de')) })),
    footer: `Aleria Almanach · ${language} · ${script} · Sprachpaket 1.000`
  });
}

function createPackageLanguageScriptTable(data, { language, script, style, subtitle }) {
  const letters = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ');
  const rows = letters.map(letter => ({
    symbol: `${letter} ${letter.toLocaleLowerCase('de')}`,
    name: `Tastaturzeichen ${letter} / ${letter.toLocaleLowerCase('de')}`,
    sound: `${letter} · ${letter.toLocaleLowerCase('de')}`,
    meaning: 'Groß- und Kleinschreibung · keine eigene Zeichenbedeutung festgelegt'
  }));
  rows.push({ symbol: 'ß', name: 'Eszett', sound: 'ß', meaning: 'Deutsches Sonderzeichen' });
  for (const character of '0123456789') rows.push({ symbol: character, name: `Ziffer ${character}`, sound: character, meaning: 'Zählzeichen des Fonts' });
  for (const character of '.,:;!?\'"-+*/=()[]{}<>@#&%_\\|~^$€') {
    rows.push({ symbol: character, name: `Tastaturzeichen ${character}`, sound: character, meaning: 'Satz- oder Sonderzeichen des Fonts' });
  }
  return sanitizeScriptTableData({
    archiveLabel: `${script} · Zeichen- und Bausteinregister`,
    title: `${script} und die 200 Wortbausteine`, subtitle,
    scriptStyle: style, ornamentText: language,
    symbolHeader: script, nameHeader: 'Tastaturzeichen', soundHeader: 'Klartext · Eingabe', meaningHeader: 'Verwendung',
    rows,
    syllablesTitle: 'Alle 200 Silben, Wurzeln, Präfixe und Suffixe',
    syllablesSubtitle: 'Die Nummern folgen dem gelieferten Sprachpaket. Gleiche Schreibungen können in verschiedenen Funktionen erscheinen; alle Datensätze bleiben erhalten.',
    syllableHeader: 'Baustein · Nummer', syllableMeaningHeader: 'Bedeutung', syllableUsageHeader: 'Typ · Aussprache und Register',
    syllables: data.silben.map(item => ({ syllable: `${item.Silbe} · ${item.Nr}`,
      meaning: item.Bedeutung, usage: [item.Typ, item.Aussprache || item.Lautwert, item.Register || item.Hinweis].filter(Boolean).join(' · ') })),
    footer: `Aleria Almanach · ${language} · ${script} · Originalzuordnung des Sprachpakets`
  });
}

function createPackageLanguageLexiconPage(data, language) {
  return {
    pageTitle: `V. — 1.000 Wörter aus dem ${language}`,
    scriptTablePage: true,
    scriptTable: sanitizeScriptTableData({
      archiveLabel: `${language} · Vollständiges Wörterbuch`, title: `1.000 Wörter aus dem ${language}`,
      subtitle: 'Alphabetisch geordnet · deutsche Bedeutung, Wortart, Themenfeld und Herleitung aus dem Sprachpaket. Die Nummer verweist auf den Originaldatensatz.',
      scriptStyle: 'plain', ornamentText: '',
      symbolHeader: language, nameHeader: 'Deutsch', soundHeader: 'Wortart · Themenfeld', meaningHeader: 'Herleitung · Originalnummer',
      rows: data.woerter.map(item => ({ symbol: item[language], name: item.Deutsch,
        sound: [item.Wortart, item.Kategorie].join(' · '),
        meaning: [item.Herleitung, item.Aussprache ? `Aussprache: ${item.Aussprache}` : '', `Nr. ${item.Nr}`].filter(Boolean).join(' · ') }))
        .sort((left, right) => left.symbol.localeCompare(right.symbol, 'de')),
      footer: `Aleria Almanach · ${language} · 1.000 Wörter des gelieferten Sprachentwurfs`
    })
  };
}
