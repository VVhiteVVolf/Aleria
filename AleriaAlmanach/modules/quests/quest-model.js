// Shared contract for quest records and independent party runs. No persistence or DOM.
import { normalizeItemDefinitionRef } from '../item-definitions/item-definition-model.js';
import { normalizeQuestDossier } from './quest-dossier-model.js';
export const QUEST_SCHEMA = 1;
export const QUEST_EVENT_TYPES = Object.freeze(['note', 'travel', 'visit', 'dialogue', 'objective', 'evidence']);
const text = (value, max = 240) => String(value ?? '').trim().slice(0, max);
export function questId(value) {
  const id = String(value ?? '').trim();
  if (!/^[\w:.-]{1,300}$/.test(id)) throw Error('Eine gültige Kennung fehlt.');
  return id;
}
export function questStamp(value) {
  const date = value?.date || {}, time = text(value?.time, 5);
  if (!Number.isInteger(date.year) || date.year < 1 || date.year > 99999 || !Number.isInteger(date.month) || date.month < 1 || date.month > 13
    || !Number.isInteger(date.day) || date.day < 1 || date.day > 36 || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw Error('Bitte ein gültiges Aleria-Datum und eine Uhrzeit angeben.');
  return { date: { year: date.year, month: date.month, day: date.day }, time };
}
export function questStampKey(value) {
  const { date, time } = questStamp(value);
  return `${String(date.year).padStart(5, '0')}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}T${time}`;
}
export function normalizeQuestLinks(input = {}) {
  const ids = name => [...new Set((Array.isArray(input[name]) ? input[name] : []).map(questId))].slice(0, 40);
  return { modules: ids('modules'), maps: ids('maps'), boards: ids('boards'), scenes: ids('scenes'),
    notices: (Array.isArray(input.notices) ? input.notices : []).slice(0, 20).map(row => ({ boardId: questId(row.boardId), noticeId: questId(row.noticeId) })) };
}
export function normalizeQuestRewards(input = []) {
  if (!Array.isArray(input) || input.length > 24) throw Error('Höchstens 24 Belohnungen pro Zuteilung.');
  return input.map(row => {
    if (row.kind === 'money') {
      if (!['gold', 'silver', 'copper', 'pfennig'].includes(row.currency) || !Number.isFinite(row.amount) || row.amount <= 0 || row.amount > 1000000) throw Error('Ungültige Geldbelohnung.');
      return { kind: 'money', currency: row.currency, amount: row.amount };
    }
    if (row.kind === 'item') {
      if (!Number.isSafeInteger(row.quantity) || row.quantity < 1 || row.quantity > 9999) throw Error('Ungültige Itemmenge.');
      const result = { kind: 'item', itemId: text(row.itemId, 220), quantity: row.quantity, title: text(row.title, 180) };
      if (row.definitionRef) {
        result.definitionRef = normalizeItemDefinitionRef(row.definitionRef);
        if (!result.definitionRef) throw Error('Ungültige Itemversion.');
      }
      if (!result.itemId && !result.definitionRef) throw Error('Bitte eine Itemdefinition wählen.');
      if (row.moduleId) result.moduleId = questId(row.moduleId);
      if (row.sourceRevision) result.sourceRevision = text(row.sourceRevision, 160);
      return result;
    }
    if (row.kind === 'honor') return { kind: 'honor', title: text(row.title, 180), condition: text(row.condition, 800) };
    throw Error('Unbekannte Belohnungsart.');
  });
}
export function normalizeQuest(input = {}) {
  const title = text(input.title, 180);
  if (!title) throw Error('Der Auftrag braucht einen Titel.');
  return { schemaVersion: QUEST_SCHEMA, id: questId(input.id), title, summary: text(input.summary, 6000), patron: text(input.patron, 180),
    links: normalizeQuestLinks(input.links), rewards: normalizeQuestRewards(input.rewards),
    objectives: (Array.isArray(input.objectives) ? input.objectives : []).slice(0, 30).map((row, index) => ({ id: questId(row.id || `goal-${index + 1}`), title: text(row.title, 300) })).filter(row => row.title),
    ...(input.dossier ? { dossier: normalizeQuestDossier(input.dossier) } : {}),
    revision: Number.isSafeInteger(input.revision) ? input.revision : 0 };
}
export function normalizeQuestParty(input = []) {
  if (!Array.isArray(input) || !input.length || input.length > 30) throw Error('Bitte 1 bis 30 Gruppenmitglieder wählen.');
  const seen = new Set();
  return input.map(row => {
    if (!['character', 'creature'].includes(row.kind)) throw Error('Unbekannte Figurenart.');
    const member = { kind: row.kind, recordId: questId(row.recordId), name: text(row.name, 180) };
    const key = `${member.kind}:${member.recordId}`;
    if (seen.has(key)) throw Error('Ein Gruppenmitglied ist doppelt eingetragen.');
    seen.add(key); return member;
  });
}
export function questMatches(quest, search = '', context = {}) {
  const links = quest.links || {};
  if (context.board && !links.boards?.includes(context.board)) return false;
  if (context.notice && !links.notices?.some(row => row.noticeId === context.notice)) return false;
  if (context.map && !links.maps?.includes(context.map)) return false;
  if (context.module && !links.modules?.includes(context.module) && !links.scenes?.some(id => id.split('::')[0] === context.module)) return false;
  return [quest.title, quest.summary, quest.patron, quest.groupName, ...(quest.party || []).map(row => row.name)].join(' ').toLocaleLowerCase('de').includes(search.toLocaleLowerCase('de').trim());
}
export function questHref(kind, id, extra = '') {
  const value = encodeURIComponent(id);
  if (kind === 'module') return `/AleriaAlmanach/AleriaAlmanach.html?entry=${value}`;
  if (kind === 'scene') return `/AleriaAlmanach/AleriaAlmanach.html?entry=${encodeURIComponent(id.split('::')[0])}&thread=${value}`;
  if (kind === 'map') return `/Karten/karte.html?map=${value}${extra ? `&pin=${encodeURIComponent(extra)}` : ''}`;
  if (kind === 'board') return `/Anzeigetafeln/tafel.html?tafel=${value}${extra ? `&notice=${encodeURIComponent(extra)}` : ''}`;
  if (kind === 'character' || kind === 'creature') return `/AleriaAlmanach/AleriaAlmanach.html?${kind}=${value}`;
  return '';
}
