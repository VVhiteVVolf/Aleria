import { MEDIA_FORMATS } from './concept-media.mjs';

export const STAGES = {
  idea: 'Idee',
  draft: 'In Arbeit',
  review: 'Zur Besprechung',
  developed: 'Ausgearbeitet'
};

export const field = (id, label, placeholder = '') => ({ id, label, placeholder });
export const prose = (id, label, placeholder = '') => ({ ...field(id, label, placeholder), type: 'prose' });
export const link = (id, label) => ({ ...field(id, label, 'https://…'), type: 'link' });
export const icon = (id, label) => ({ id, label, type: 'icon' });
export const reference = label => ({ id: 'target', label, type: 'reference' });
export const group = (title, fields) => ({ title, fields });
export const tab = (id, label, art, groups = [], lists = [], hint = '') => ({ id, label, art, groups, lists, hint });
export const list = (title, add, fields, extra) => ({ title, add, fields, ...extra });
export const imageFormat = { id: 'format', label: 'Vorschauformat', options: MEDIA_FORMATS, emptyOption: 'Automatisch' };

export const nameFields = [
  field('name', 'Arbeitsname'),
  field('author', 'Entworfen von'),
  { id: 'stage', label: 'Bearbeitungsstand', options: STAGES }
];

export const variants = list('Drei Bildvarianten', '', [
  field('name', 'Bezeichnung'),
  link('url', 'Bildlink'),
  imageFormat,
  prose('note', 'Bildidee und Anmerkungen')
], { fixed: ['a', 'b', 'c'] });

export function traits(title) {
  return list(title, '', [
    field('name', 'Merkmal', 'z. B. geduldig'),
    field('note', 'Wie zeigt es sich?'),
    icon('icon', 'Merkmalsicon')
  ], { fixed: Array.from({ length: 8 }, (_, index) => `merkmal-${index + 1}`) });
}

function relationshipList(label, ...extraFields) {
  return list('Beziehungen', 'Beziehung ergänzen', [
    reference(label),
    field('role', 'Verhältnis'),
    prose('note', 'Gemeinsame Geschichte und heutiges Verhältnis'),
    ...extraFields
  ]);
}

export const relations = relationshipList('Figur oder Haus');
export const connections = relationshipList('Name oder Entwurf', link('source', 'Register- oder Quellenlink'));

export function imageVariants(format) {
  return { ...variants, defaultMediaFormat: format, initialFormat: format };
}

export const timeline = list('Zeitleiste', 'Ereignis ergänzen', [
  field('date', 'Jahr oder Zeitraum'),
  field('name', 'Ereignis'),
  prose('note', 'Auswirkung auf den Entwurf')
]);

export const sources = list('Quellen und Referenzen', 'Quelle ergänzen', [
  field('name', 'Titel'),
  link('url', 'Quellenlink'),
  prose('note', 'Was soll aus der Quelle einfließen?')
]);

export const decisions = list('Grundentscheidungen', 'Entscheidung ergänzen', [
  field('name', 'Thema', 'z. B. Hauptsitz oder Zugehörigkeit'),
  prose('result', 'Festlegung', 'Welche Fassung soll gelten?'),
  prose('alternatives', 'Alternativen', 'Welche anderen Möglichkeiten kommen infrage?'),
  prose('reason', 'Begründung', 'Warum passt diese Wahl zum Entwurf?')
]);

export const decisionTab = tab('decisions', 'Entscheidungen', 'judgment', [], ['decisions']);
export const topic = (id, label, ...fields) => ({ id, label, fields });

export const notes = tab('notes', 'Notizen & Quellen', 'quill', [
  group('Offene Fragen', [
    prose('questions', 'Zur Besprechung', 'Welche Entscheidungen stehen noch aus?'),
    prose('notes', 'Freie Notizen')
  ])
], ['sources']);

export function abilityList(title, add, kinds) {
  return list(title, add, [
    field('name', 'Bezeichnung'),
    { id: 'kind', label: 'Art', options: kinds },
    icon('icon', 'Icon'),
    prose('note', 'Beschreibung'),
    prose('limits', 'Grenzen und Voraussetzungen')
  ]);
}

export function people(title, add, role, detail) {
  return list(title, add, [
    reference('Name'),
    field('role', role),
    field('branch', 'Zweig oder Zugehörigkeit'),
    prose('note', detail)
  ]);
}
