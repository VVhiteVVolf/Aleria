import { normalizeGroupLandingState } from './group-landing-model.js';

const text = value => String(value ?? '').trim();
const list = (items, limit) => (Array.isArray(items) ? items : []).slice(0, limit);
export const landingNumber = (value, fallback = 0, min = 0, max = 100) => {
  const number = Number(value);
  return Math.max(min, Math.min(max, Math.round(Number.isFinite(number) ? number : fallback)));
};

// Stable fallbacks keep imports and repeated normalization idempotent.
export function landingItemId(prefix, index, value = '') {
  let hash = 2166136261;
  for (const character of text(value)) hash = Math.imul(hash ^ character.codePointAt(0), 16777619);
  return `${prefix}-${index}-${(hash >>> 0).toString(36)}`;
}

export function normalizeLandingMembers(items = []) {
  return list(items, 160).map((item, index) => ({
    id: text(item?.id) || landingItemId('member', index, item?.name),
    name: text(item?.name), role: text(item?.role),
    className: text(item?.className || (/^stufe\b/i.test(item?.level || '') ? item?.role : item?.level)),
    status: text(item?.status || 'Bereit'),
    statusColor: /^#[\da-f]{3,8}$/i.test(item?.statusColor || '') ? item.statusColor : '#2c8a3d',
    portrait: text(item?.portrait), badgeIcon: text(item?.badgeIcon || '*'),
    characterId: text(item?.characterId)
  })).filter(item => item.name || item.portrait);
}

export function normalizeLandingQuests(items = []) {
  return list(items, 80).map((item, index) => ({
    id: text(item?.id) || landingItemId('quest', index, item?.title),
    title: text(item?.title || `Aufgabe ${index + 1}`), text: text(item?.text), image: text(item?.image),
    kind: text(item?.kind || 'Nebenquest'),
    status: ['active', 'done', 'failed'].includes(item?.status) ? item.status : 'active',
    progress: landingNumber(item?.progress), ownerMemberId: text(item?.ownerMemberId),
    dueDate: text(item?.dueDate), moduleId: text(item?.moduleId)
  }));
}

export function normalizeLandingNotes(items = []) {
  return list(items, 120).map((item, index) => ({
    id: text(item?.id) || landingItemId('note', index, item?.title),
    authorId: text(item?.authorId), authorName: text(item?.authorName), icon: text(item?.icon),
    title: text(item?.title || `Notiz ${index + 1}`), text: text(item?.text), createdAt: text(item?.createdAt)
  }));
}

export function normalizeLandingEvents(items = [], sanitizeDate = value => value || {}) {
  return list(items, 40).map((item, index) => ({
    icon: text(item?.icon || '*'), title: text(item?.title || `Ereignis ${index + 1}`),
    time: text(item?.time), aleriaDate: sanitizeDate(item?.aleriaDate)
  }));
}

export function normalizeLandingInfo(items = []) {
  return list(items, 40).map((item, index) => ({
    icon: text(item?.icon || '*'), title: text(item?.title || `Information ${index + 1}`), text: text(item?.text)
  }));
}

export function normalizeLandingData(data = {}, sanitizeDate) {
  data = data && typeof data === 'object' ? data : {};
  return {
    bannerImage: text(data.bannerImage), title: text(data.title || 'Gruppenübersicht'), subtitle: text(data.subtitle),
    memberTitle: text(data.memberTitle || 'Aktuelle Gruppe'), questTitle: text(data.questTitle || 'Aufgaben & Quests'),
    notesTitle: text(data.notesTitle || 'Notizen'), eventsTitle: text(data.eventsTitle || 'Ereignisse'),
    mapTitle: text(data.mapTitle || 'Aktuelle Karte'), mapKartenId: text(data.mapKartenId), mapImage: text(data.mapImage),
    mapDisplay: ['embed', 'image'].includes(data.mapDisplay) ? data.mapDisplay : data.group ? 'embed' : 'image',
    mapLink: text(data.mapLink), mapButtonLabel: text(data.mapButtonLabel || 'Karte öffnen'), infoTitle: text(data.infoTitle || 'Informationen'),
    members: normalizeLandingMembers(data.members), quests: normalizeLandingQuests(data.quests),
    notes: normalizeLandingNotes(data.notes), events: normalizeLandingEvents(data.events, sanitizeDate), info: normalizeLandingInfo(data.info),
    ...(data.group ? { group: normalizeGroupLandingState(data.group) } : {})
  };
}

export function createLandingPage(title = 'Gruppenübersicht') {
  return { pageTitle: title, landingPage: true, landing: normalizeLandingData({ title }), stats: [], commentDivider: false, commentSequence: [] };
}
