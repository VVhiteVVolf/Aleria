import { conceptsForExport, decodeConcepts, encodeConcepts } from './concept-drafts.mjs';
import { conceptTitle } from './concept-schema.mjs';
import { decisionSheet } from './concept-decisions.mjs';

export async function readConceptFile(file) {
  const drafts = decodeConcepts(await file.text());
  if (!drafts.length) throw new Error('Die Datei enthält keine Entwürfe.');
  return drafts;
}

function conceptFilename(draft) {
  return conceptTitle(draft).replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 90) || 'Entwurf';
}

function downloadFile(filename, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

export function downloadConcepts(drafts, id) {
  const exported = conceptsForExport(drafts, id);
  if (!exported.length) return;
  const filename = id ? conceptFilename(exported[0]) : 'Entwurfsmappe';
  downloadFile(`Aleria-${filename}.json`, encodeConcepts(exported, { pretty: true }), 'application/json');
}

export function downloadDecisionSheet(draft) {
  downloadFile(`Aleria-${conceptFilename(draft)}-Entscheidungsblatt.txt`, decisionSheet(draft), 'text/plain;charset=utf-8');
}
