import { createHash } from 'node:crypto';
import { sortSceneHistory } from '../mechanics/trusted-scene-history.js';

export const SCENE_BACKUP_ROOT = 'AleriaAlmanach/backups/scenes';
const PRIVATE_FIELDS = new Set(['deleteCode', 'deleteCodeHash', 'deleteCodeVersion', 'createdBy', 'updatedBy', 'importedBy']);

function publicRecord(record) {
  return Object.fromEntries(Object.entries(record).filter(([key]) => !PRIVATE_FIELDS.has(key)));
}

function timelineOrder(comment) {
  const explicit = Number(comment.orderKey || comment.createdAtClient);
  if (Number.isFinite(explicit) && explicit > 0) return explicit;
  const timestamp = comment.ts || comment.createdAt;
  const seconds = timestamp?.seconds ?? timestamp?._seconds;
  if (Number.isFinite(Number(seconds))) return Number(seconds) * 1000 + Number(timestamp.nanoseconds || timestamp._nanoseconds || 0) / 1_000_000;
  return typeof timestamp === 'string' ? Date.parse(timestamp) || 0 : 0;
}

export function parseSceneThread(threadId) {
  const match = String(threadId || '').match(/^([^/]{1,180})::session:([^/:]{1,180})$/);
  return match ? { moduleId: match[1], pageKey: match[2] } : null;
}

export function belongsToModule(threadId, moduleId) {
  return threadId === moduleId || ['session', 'page'].some(kind => threadId.startsWith(`${moduleId}::${kind}:`));
}

export function validateSceneModule(modulePayload, threadId) {
  const location = parseSceneThread(threadId);
  if (modulePayload?.type !== 'aleria-module' || !location || modulePayload.entry?.id !== location.moduleId) {
    throw new Error('Szenenthread und Modulexport passen nicht zusammen.');
  }
  const pageIndex = modulePayload.entry.pages?.findIndex((page, index) =>
    page?.sessionPage && String(page.commentThreadKey || index) === location.pageKey);
  if (!Number.isInteger(pageIndex) || pageIndex < 0 || !modulePayload.section?.key) {
    throw new Error('Die interaktive Szene fehlt im Modulexport.');
  }
  return { ...location, pageIndex };
}

export function sceneBackupDirectory(moduleId, backupId, requestedAt) {
  const slug = moduleId.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 80) || 'szene';
  const hash = createHash('sha256').update(moduleId).digest('hex').slice(0, 10);
  const stamp = new Date(requestedAt).toISOString().replace(/[:.]/g, '-');
  return `${SCENE_BACKUP_ROOT}/${slug}-${hash}/${stamp}-${backupId}`;
}

function threadDescriptors(entry, comments, turns) {
  const descriptors = new Map([[entry.id, { threadId: entry.id, kind: 'entry-comments', pageIndex: null, pageTitle: 'Modulkommentare' }]]);
  (entry.pages || []).forEach((page, pageIndex) => {
    const pageKey = String(page.commentThreadKey || pageIndex);
    const add = kind => {
      const threadId = `${entry.id}::${kind}:${pageKey}`;
      descriptors.set(threadId, { threadId, kind, pageIndex, pageTitle: page.pageTitle || '' });
    };
    if (page.sessionPage) add('session');
    if (entry.enablePageComments || page.enableComments) add('page');
  });
  [...comments.map(comment => comment.entryId), ...turns.map(turn => turn.threadId || turn.id)].forEach(threadId => {
    if (!threadId || descriptors.has(threadId) || !belongsToModule(threadId, entry.id)) return;
    descriptors.set(threadId, { threadId, kind: threadId.includes('::session:') ? 'session' : 'page', pageIndex: null, pageTitle: 'Historischer Kommentarbereich' });
  });
  return [...descriptors.values()];
}

function readableHistory(entry, comments) {
  const lines = [`# ${entry.title || entry.id}`, '', 'Die vollständigen strukturierten Daten stehen in comments.json.', ''];
  comments.forEach((comment, index) => {
    const speaker = comment.narrator ? 'Erzähler' : (comment.charName || comment.name || 'Unbekannt');
    lines.push(`## ${index + 1}. ${speaker}`, '', `Kommentar: ${comment.id} · Thread: ${comment.entryId}`, '', String(comment.text || ''), '');
    (comment.commentSegments || []).forEach(segment => {
      if (segment?.text && segment.text !== comment.text) lines.push(String(segment.text), '');
    });
  });
  return lines.join('\n');
}

export function buildSceneBackupFiles({ modulePayload, comments, turns, threadId, backupId, requestedAt, capturedAt, moduleSource }) {
  validateSceneModule(modulePayload, threadId);
  const entry = modulePayload.entry;
  const threadOrders = new Map();
  const ordered = sortSceneHistory(comments.filter(comment => belongsToModule(String(comment.entryId || ''), entry.id))
    .map(comment => ({ orderKey: timelineOrder(comment), comment })))
    .map(({ comment }, index) => {
      const threadOrder = (threadOrders.get(comment.entryId) || 0) + 1;
      threadOrders.set(comment.entryId, threadOrder);
      return { ...publicRecord(comment), exportOrder: index + 1, threadOrder };
    });
  const commentTurns = turns.filter(turn => belongsToModule(String(turn.threadId || turn.id || ''), entry.id)).map(publicRecord);
  const threads = threadDescriptors(entry, ordered, commentTurns).map(descriptor => ({
    ...descriptor,
    turn: commentTurns.find(turn => (turn.threadId || turn.id) === descriptor.threadId) || null,
    commentCount: threadOrders.get(descriptor.threadId) || 0
  }));
  const commentsExport = {
    type: 'aleria-module-comments-export', version: 1, exportedAt: capturedAt,
    source: { moduleId: entry.id, moduleTitle: entry.title || '', sectionKey: modulePayload.section.key, sectionTab: modulePayload.section.tab || modulePayload.section.key },
    summary: { threadCount: threads.length, commentCount: ordered.length, turnCount: commentTurns.length },
    threads, comments: ordered, commentTurns
  };
  const json = value => `${JSON.stringify(value, (key, item) => {
    // Admin SDK timestamps otherwise serialize as _seconds/_nanoseconds;
    // the existing browser import/export format expects seconds/nanoseconds.
    if (item && Number.isFinite(item._seconds) && Number.isFinite(item._nanoseconds)
      && Object.keys(item).every(field => ['_seconds', '_nanoseconds'].includes(field))) {
      return { seconds: item._seconds, nanoseconds: item._nanoseconds };
    }
    return item;
  }, 2)}\n`;
  const contents = [
    { path: 'module.json', content: json(modulePayload) },
    { path: 'comments.json', content: json(commentsExport) },
    { path: 'history.md', content: readableHistory(entry, ordered) }
  ];
  const manifest = {
    type: 'aleria-scene-backup', version: 1, backupId, threadId, moduleId: entry.id,
    moduleTitle: entry.title || '', requestedAt, capturedAt, moduleSource,
    summary: commentsExport.summary,
    omittedFields: [...PRIVATE_FIELDS],
    commentStorage: 'Jeder Kommentar steht einmal in comments.json unter comments; threads ordnet die Kommentare über entryId zu.',
    assets: 'Bilder und Anhänge bleiben als Originalverweise erhalten; externe Dateien sind nicht in diesem Backup eingebettet.',
    files: contents.map(file => ({ path: file.path, bytes: Buffer.byteLength(file.content), sha256: createHash('sha256').update(file.content).digest('hex') }))
  };
  return { files: [...contents, { path: 'manifest.json', content: json(manifest) }], summary: commentsExport.summary };
}
