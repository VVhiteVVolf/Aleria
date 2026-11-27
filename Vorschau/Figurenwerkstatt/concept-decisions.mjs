import { MEDIA_FORMATS, safeConceptUrl } from './concept-media.mjs';
import { CONCEPT_TYPES, conceptTitle, variantTitle } from './concept-schema.mjs';

export function canConfirmDecision(row) {
  return Boolean(row.name?.trim() && row.result?.trim());
}

export function setDecisionStatus(row, status) {
  if (row.status === status || (status === 'confirmed' && !canConfirmDecision(row))) return row;
  return { ...row, status };
}

export function topicDecisionId(topicId) {
  return `entscheidung-${topicId}`;
}

export function addTopicDecision(draft, topicId) {
  const type = CONCEPT_TYPES[draft.kind];
  const topic = type.decisionTopics.find(entry => entry.id === topicId);
  const id = topicDecisionId(topicId);
  if (!topic || draft.rows.decisions.some(row => row.id === id)) return draft;
  const fields = new Map(type.tabs.flatMap(tab => tab.groups.flatMap(group =>
    group.fields.map(field => [field.id, field.label])
  )));
  const result = topic.fields
    .filter(key => draft.fields[key]?.trim())
    .map(key => topic.fields.length === 1 ? draft.fields[key].trim() : `${fields.get(key)} · ${draft.fields[key].trim()}`)
    .join('\n');
  const row = { id, name: topic.label, ...(result ? { result } : {}) };
  return { ...draft, rows: { ...draft.rows, decisions: [...draft.rows.decisions, row] } };
}

export function mainImageMatches(image, row) {
  return image?.variantId === row.id && safeConceptUrl(image.url) === safeConceptUrl(row.url);
}

export function selectMainImage(draft, rowId) {
  const index = draft.rows.images.findIndex(row => row.id === rowId);
  const row = draft.rows.images[index];
  if (!safeConceptUrl(row?.url)) return draft;
  const mainImage = {
    variantId: rowId, title: variantTitle(row, index), url: row.url.trim(), format: row.format || ''
  };
  return { ...draft, mainImage };
}

function decisionText(row) {
  return [
    row.name?.trim() || 'Entscheidung ohne Thema',
    row.result?.trim() || 'Auswahl offen',
    row.reason?.trim() ? `Begründung\n${row.reason.trim()}` : '',
    row.alternatives?.trim() ? `Alternativen\n${row.alternatives.trim()}` : ''
  ].filter(Boolean).join('\n');
}

export function decisionSheet(draft) {
  const image = draft.mainImage;
  const decisions = draft.rows.decisions.filter(row => [row.name, row.result, row.alternatives, row.reason].some(value => value?.trim()));
  return [
    `${conceptTitle(draft)} · Entscheidungsblatt`,
    `Hauptbild\n${image ? `${image.title}\n${image.url}\n${MEDIA_FORMATS[image.format] || 'Automatisches Vorschauformat'}` : 'Offen'}`,
    ...[
      ['Festgelegt', decisions.filter(row => row.status === 'confirmed')],
      ['Offen', decisions.filter(row => row.status !== 'confirmed')]
    ].filter(([, rows]) => rows.length).map(([title, rows]) => `${title}\n\n${rows.map(decisionText).join('\n\n')}`)
  ].join('\n\n') + '\n';
}
