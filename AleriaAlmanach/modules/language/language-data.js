const LANGUAGE_ALPHABET_LAYER_LIMIT = 3;
const LANGUAGE_DESCRIPTION_SECTION_LIMIT = 12;

const LANGUAGE_DEFAULT_SECTIONS = [
  { title: 'Einführung', text: 'Beschreibe Klang, Charakter und Besonderheiten dieser Sprache.' },
  { title: 'Hintergrund & Ursprung', text: 'Wo entstand die Sprache, und welche Völker oder Ereignisse prägten sie?' },
  { title: 'Aufbau & Struktur', text: 'Erläutere Alphabet, Lautung, Schreibrichtung und grammatische Grundzüge.' },
  { title: 'Bedeutungslehre', text: 'Welche symbolischen, kulturellen oder magischen Bedeutungen tragen die Zeichen?' },
  { title: 'Anwendung', text: 'Zeige typische Namen, Begriffe, Redewendungen oder Übersetzungsbeispiele.' },
  { title: 'Trivia', text: 'Sammle Besonderheiten, regionale Varianten und wissenswerte Randnotizen.' }
];

function sanitizeLanguageAlphabetLayers(items = []) {
  const source = Array.isArray(items) ? items : [];
  return Array.from({ length: LANGUAGE_ALPHABET_LAYER_LIMIT }, (_, index) => {
    const item = source[index] || {};
    return {
      label: String(item.label || `Ebene ${index + 1}`).trim(),
      image: String(item.image || item.src || '').trim(),
      alt: String(item.alt || '').trim(),
      caption: String(item.caption || '').trim()
    };
  });
}

function sanitizeLanguageDescriptionSections(items) {
  const source = Array.isArray(items) ? items : LANGUAGE_DEFAULT_SECTIONS;
  return source
    .map(item => ({
      title: String(item?.title || '').trim(),
      text: String(item?.text || '').trim()
    }))
    .filter(item => item.title || item.text)
    .slice(0, LANGUAGE_DESCRIPTION_SECTION_LIMIT);
}

function sanitizeLanguageData(data = {}) {
  return {
    archiveLabel: String(data.archiveLabel || 'Sprachkunde · Schriftarchiv').trim(),
    nativeName: String(data.nativeName || '').trim(),
    family: String(data.family || '').trim(),
    speakers: String(data.speakers || '').trim(),
    regions: String(data.regions || '').trim(),
    scriptType: String(data.scriptType || '').trim(),
    writingDirection: String(data.writingDirection || '').trim(),
    introduction: String(data.introduction || '').trim(),
    alphabetTitle: String(data.alphabetTitle || 'Alphabet & Schriftbild').trim(),
    alphabetLayers: sanitizeLanguageAlphabetLayers(data.alphabetLayers || data.layers),
    sections: sanitizeLanguageDescriptionSections(data.sections),
    footer: String(data.footer || 'Aleria Almanach · Sprachenarchiv').trim()
  };
}

function createDefaultLanguagePage(index = 0) {
  return {
    pageTitle: `${getRomanPageLabel(index)} - Spracharchiv`,
    image: '',
    imageWidth: 100,
    languagePage: true,
    description: '',
    quote: 'Eine Sprache bewahrt mehr als Worte – sie bewahrt eine Welt.',
    quoteBy: '— Aus den Aufzeichnungen des Almanachs',
    language: sanitizeLanguageData({
      nativeName: 'Name in der eigenen Schrift',
      family: 'Sprachfamilie noch festlegen',
      speakers: 'Volk oder Sprechergruppe',
      regions: 'Verbreitungsgebiet',
      scriptType: 'Alphabet / Runenschrift / Silbenschrift',
      writingDirection: 'Schreibrichtung noch festlegen',
      introduction: 'Eine kurze Einordnung der Sprache und ihrer Bedeutung innerhalb Alerias.',
      alphabetLayers: [
        { label: 'Ebene 1', image: '', alt: 'Erste Ebene des Alphabets', caption: 'Grundform oder gebräuchlichste Fassung des Alphabets.' },
        { label: 'Ebene 2', image: '', alt: 'Zweite Ebene des Alphabets', caption: '' },
        { label: 'Ebene 3', image: '', alt: 'Dritte Ebene des Alphabets', caption: '' }
      ]
    })
  };
}
