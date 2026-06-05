const COURT_EDITOR_LIST_DEFINITIONS = {
  overviewRows: {
    titleField: 'overviewTitle',
    label: 'Falluebersicht',
    addLabel: 'Zeile',
    fallback: { icon: '', label: 'Tatbestand', value: 'Neutral beschreiben.', target: '' },
    fields: [
      ['icon', 'Icon-URL', 'url'],
      ['label', 'Label', 'text'],
      ['value', 'Wert', 'textarea'],
      ['target', 'Link / Ziel', 'text']
    ]
  },
  charges: {
    titleField: 'chargesTitle',
    label: 'Anklagepunkte',
    addLabel: 'Anklagepunkt',
    fallback: { number: '1', title: 'Anklagepunkt', text: 'Behaupteten Tatbestand neutral beschreiben.', target: '' },
    fields: [
      ['number', 'Nr.', 'text'],
      ['title', 'Titel', 'text'],
      ['text', 'Beschreibung', 'textarea'],
      ['target', 'Link / Ziel', 'text']
    ]
  },
  dates: {
    titleField: 'datesTitle',
    label: 'Wichtige Daten',
    addLabel: 'Datum',
    fallback: { icon: '', label: 'Ereignis', value: 'Noch festlegen', note: '', target: '' },
    fields: [
      ['icon', 'Icon-URL', 'url'],
      ['label', 'Label', 'text'],
      ['value', 'Datum / Wert', 'text'],
      ['note', 'Notiz', 'textarea'],
      ['target', 'Link / Ziel', 'text']
    ]
  },
  parties: {
    titleField: 'partiesTitle',
    label: 'Beteiligte',
    addLabel: 'Beteiligte Person',
    fallback: { role: 'Rolle', name: 'Name', title: '', text: '', portrait: '', crest: '', target: '' },
    fields: [
      ['role', 'Rolle', 'text'],
      ['name', 'Name', 'text'],
      ['title', 'Titel / Amt', 'text'],
      ['text', 'Beschreibung', 'textarea'],
      ['portrait', 'Portrait-URL', 'url'],
      ['crest', 'Wappen-URL', 'url'],
      ['target', 'Link / Ziel', 'text']
    ]
  },
  evidence: {
    titleField: 'evidenceTitle',
    label: 'Beweisstuecke',
    addLabel: 'Beweis',
    fallback: { icon: '', title: 'Beweisstueck', text: 'Beschreibung', date: '', location: '', custodian: '', status: 'protokolliert', target: '' },
    fields: [
      ['icon', 'Icon-/Bild-URL', 'url'],
      ['title', 'Titel', 'text'],
      ['text', 'Beschreibung', 'textarea'],
      ['date', 'Datum', 'text'],
      ['location', 'Fundort', 'text'],
      ['custodian', 'Verwahrung', 'text'],
      ['status', 'Status', 'text'],
      ['target', 'Link / Ziel', 'text']
    ]
  },
  witnesses: {
    titleField: 'witnessesTitle',
    label: 'Zeugen',
    addLabel: 'Zeuge',
    fallback: { portrait: '', name: 'Name', role: 'Zeuge', statement: 'Kurzfassung der Aussage.', status: 'ausstehend', protection: '', target: '' },
    fields: [
      ['portrait', 'Portrait-URL', 'url'],
      ['name', 'Name', 'text'],
      ['role', 'Rolle', 'text'],
      ['statement', 'Aussage', 'textarea'],
      ['status', 'Status', 'text'],
      ['protection', 'Schutz-/Ladungsvermerk', 'text'],
      ['target', 'Link / Ziel', 'text']
    ]
  },
  chronology: {
    titleField: 'chronologyTitle',
    label: 'Chronologie',
    addLabel: 'Ereignis',
    fallback: { date: '', title: 'Ereignis', text: 'Beschreibung', target: '' },
    fields: [
      ['date', 'Datum', 'text'],
      ['title', 'Titel', 'text'],
      ['text', 'Beschreibung', 'textarea'],
      ['target', 'Link / Ziel', 'text']
    ]
  },
  openQuestions: {
    titleField: 'openQuestionsTitle',
    label: 'Offene Fragen',
    addLabel: 'Frage',
    fallback: { icon: '', text: 'Offene Frage', status: 'offen', target: '' },
    fields: [
      ['icon', 'Icon-URL', 'url'],
      ['text', 'Frage / Punkt', 'textarea'],
      ['status', 'Status', 'text'],
      ['target', 'Link / Ziel', 'text']
    ]
  },
  relatedEntries: {
    titleField: 'relatedTitle',
    label: 'Verknuepfte Eintraege',
    addLabel: 'Link',
    fallback: { icon: '', label: 'Verknuepfter Eintrag', detail: '', target: '' },
    fields: [
      ['icon', 'Icon-URL', 'url'],
      ['label', 'Label', 'text'],
      ['detail', 'Detail', 'textarea'],
      ['target', 'Link / Ziel', 'text']
    ]
  }
};

const COURT_EDITOR_LIST_ORDER = [
  'overviewRows',
  'charges',
  'dates',
  'parties',
  'evidence',
  'witnesses',
  'chronology',
  'openQuestions',
  'relatedEntries'
];

function getCourtEditorListDefinition(listName = 'overviewRows') {
  return COURT_EDITOR_LIST_DEFINITIONS[listName] || COURT_EDITOR_LIST_DEFINITIONS.overviewRows;
}
