// Morgar 2.0 -> 2.1: add the accepted names without replacing authored pages.
function migrateMorgarTerminologyEntry(entry) {
  if (entry?.id !== 'morgar-karnrith' || !Array.isArray(entry.pages)) return entry;
  const language = entry.pages[1]?.language;
  const dictionary = entry.pages[4]?.scriptTable;
  const oldLanguage = language?.archiveLabel === 'Morgar 2.0 · Die gesprochene Sprache' && Array.isArray(language.sections);
  const oldDictionary = dictionary?.archiveLabel === 'Morgar 2.0 · Wörter des täglichen Lebens' && Array.isArray(dictionary.rows);
  if (!oldLanguage && !oldDictionary) return entry;

  const current = createMorgarLanguageEntry();
  const versionLabel = value => typeof value === 'string'
    ? value.replace('Morgar 2.0', `Morgar ${MORGAR_REFERENCE_DATA.languageVersion}`) : value;
  const pages = entry.pages.map(page => ({ ...page }));
  if (oldDictionary) {
    const currentRows = current.pages[4].scriptTable.rows;
    const terms = MORGAR_REFERENCE_DATA.terminology;
    const addedWords = new Set([...terms.nobleTitles, ...terms.classes]
      .filter(term => term.introduced).map(term => term.name.toLowerCase()));
    const currentThalor = currentRows.find(row => row.symbol === 'thalor');
    const rows = dictionary.rows.filter(row => row && typeof row === 'object').map(row => row.symbol === 'thalor'
      && row.name === 'Wachtposten' && row.meaning === 'Militär · Bewacht einen zugewiesenen Ort.'
      ? { ...row, name: currentThalor.name, meaning: currentThalor.meaning } : row);
    const existingWords = new Set(rows.map(row => String(row.symbol || '').trim().toLowerCase()));
    rows.push(...currentRows.filter(row => addedWords.has(row.symbol) && !existingWords.has(row.symbol)));
    rows.sort((a, b) => String(a.symbol).localeCompare(String(b.symbol), 'de', { sensitivity: 'base' }));
    pages[4] = {
      ...pages[4],
      pageTitle: pages[4].pageTitle === 'V. — Die 360 wichtigsten Wörter · A–Z'
        ? `V. — Die ${rows.length} wichtigsten Wörter · A–Z` : pages[4].pageTitle,
      scriptTable: {
        ...dictionary, rows,
        archiveLabel: versionLabel(dictionary.archiveLabel),
        title: dictionary.title === '360 Wörter für Halle, Lehen und Heer'
          ? `${rows.length} Wörter für Halle, Lehen und Heer` : dictionary.title,
        footer: versionLabel(dictionary.footer)
      }
    };
  }
  if (oldLanguage) {
    const terminology = createMorgarTerminologySection();
    const sections = language.sections.filter(section => section && typeof section === 'object').map(section => ({
      ...section,
      title: section.title === 'Hof, Lehen und gesellschaftlicher Stand'
        ? 'Weitere Titel, Ämter und gesellschaftlicher Stand' : section.title,
      text: section.title === 'Karnrith schreiben und in Sprechblasen verwenden'
        ? String(section.text || '').replace('360 aktuellen Wörter', `${MORGAR_REFERENCE_DATA.words.length} aktuellen Wörter`) : section.text
    }));
    if (!sections.some(section => section.title === terminology.title)) {
      const courtIndex = sections.findIndex(section => section.title === 'Weitere Titel, Ämter und gesellschaftlicher Stand');
      sections.splice(courtIndex < 0 ? sections.length : courtIndex, 0, terminology);
    }
    pages[1].language = { ...language, sections,
      archiveLabel: versionLabel(language.archiveLabel), footer: versionLabel(language.footer) };
  }
  if (Array.isArray(pages[0]?.stats)) pages[0].stats = pages[0].stats.map(stat => {
    if (stat[0] === 'Sprache' && stat[1] === 'Morgar 2.0 · Sprache der Morgorner') return [stat[0], versionLabel(stat[1])];
    if (stat[0] === 'Wortschatz' && stat[1] === '360 Wörter aus dreizehn Lebensbereichen · Seite V') {
      return [stat[0], current.pages[0].stats.find(stat => stat[0] === 'Wortschatz')[1]];
    }
    return stat;
  });
  if (pages[2]?.nameList) pages[2].nameList = { ...pages[2].nameList,
    archiveLabel: versionLabel(pages[2].nameList.archiveLabel), footer: versionLabel(pages[2].nameList.footer) };
  if (pages[3]?.scriptTable) pages[3].scriptTable = { ...pages[3].scriptTable, footer: versionLabel(pages[3].scriptTable.footer) };
  return { ...entry, pages };
}
