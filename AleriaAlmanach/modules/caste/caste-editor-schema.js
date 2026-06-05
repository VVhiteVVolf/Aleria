const CASTE_EDITOR_LIST_DEFINITIONS = {
  infoRows: {
    titleField: 'infoTitle',
    label: 'Allgemeine Informationen',
    addLabel: 'Zeile',
    fallback: { icon: '', label: 'Typ', value: 'Kulturelle Kaste' },
    fields: [
      ['icon', 'Icon-URL', 'url'],
      ['label', 'Label', 'text'],
      ['value', 'Wert', 'text']
    ]
  },
  symbols: {
    titleField: 'symbolsTitle',
    label: 'Symbolik',
    addLabel: 'Symbol',
    fallback: { icon: '', name: 'Symbol', meaning: 'Bedeutung', target: '' },
    fields: [
      ['icon', 'Icon-URL', 'url'],
      ['name', 'Name', 'text'],
      ['meaning', 'Bedeutung', 'text'],
      ['target', 'Link / Ziel', 'text']
    ]
  },
  roles: {
    titleField: 'rolesTitle',
    label: 'Aufgaben & Rollen',
    addLabel: 'Rolle',
    fallback: { icon: '', title: 'Rolle', text: 'Beschreibung der Aufgabe.' },
    fields: [
      ['icon', 'Icon-URL', 'url'],
      ['title', 'Rolle / Aufgabe', 'text'],
      ['text', 'Beschreibung', 'textarea']
    ]
  },
  skills: {
    titleField: 'skillsTitle',
    label: 'Faehigkeiten & Kenntnisse',
    addLabel: 'Eintrag',
    fallback: { icon: '', text: 'Faehigkeit oder Wissen' },
    fields: [
      ['icon', 'Icon-URL', 'url'],
      ['text', 'Text', 'textarea']
    ]
  },
  privileges: {
    titleField: 'privilegesTitle',
    label: 'Privilegien',
    addLabel: 'Privileg',
    fallback: { icon: '', text: 'Privileg oder Recht' },
    fields: [
      ['icon', 'Icon-URL', 'url'],
      ['text', 'Text', 'textarea']
    ]
  },
  restrictions: {
    titleField: 'restrictionsTitle',
    label: 'Einschraenkungen / Pflichten',
    addLabel: 'Eintrag',
    fallback: { icon: '', text: 'Pflicht oder Einschraenkung' },
    fields: [
      ['icon', 'Icon-URL', 'url'],
      ['text', 'Text', 'textarea']
    ]
  },
  organizationRows: {
    titleField: 'organizationTitle',
    label: 'Organisation / Raenge',
    addLabel: 'Zeile',
    fallback: { label: 'Rang', value: 'Novize, Adept, Meister' },
    fields: [
      ['label', 'Label', 'text'],
      ['value', 'Wert / Beschreibung', 'textarea']
    ]
  },
  representatives: {
    titleField: 'representativesTitle',
    label: 'Bekannte Vertreter',
    addLabel: 'Vertreter',
    fallback: { portrait: '', name: 'Vertreter', role: 'Rolle', note: 'Kurze Notiz' },
    fields: [
      ['portrait', 'Portrait-URL', 'url'],
      ['name', 'Name', 'text'],
      ['role', 'Rolle / Titel', 'text'],
      ['note', 'Notiz', 'textarea']
    ]
  },
  relatedEntries: {
    titleField: 'relatedTitle',
    label: 'Verbundene Eintraege',
    addLabel: 'Link',
    fallback: { icon: '', label: 'Verbundener Eintrag', target: '' },
    fields: [
      ['icon', 'Icon-URL', 'url'],
      ['label', 'Label', 'text'],
      ['target', 'Link / Ziel', 'text']
    ]
  }
};

const CASTE_EDITOR_LIST_ORDER = [
  'infoRows',
  'symbols',
  'roles',
  'skills',
  'privileges',
  'restrictions',
  'organizationRows',
  'representatives',
  'relatedEntries'
];

function getCasteEditorListDefinition(listName = 'infoRows') {
  return CASTE_EDITOR_LIST_DEFINITIONS[listName] || CASTE_EDITOR_LIST_DEFINITIONS.infoRows;
}
