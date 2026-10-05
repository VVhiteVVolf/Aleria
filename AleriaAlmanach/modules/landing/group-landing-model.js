import { normalizeGroupTreasury } from './group-landing-treasury.js';
import { normalizeGroupInventory } from './group-landing-inventory.js';

const text = value => String(value ?? '').trim();
export const GROUP_ASSIGNMENTS = Object.freeze({ active: 'Dabei', reserve: 'Zurückgeblieben', away: 'Abwesend' });
export const GROUP_MEMBER_STATUSES = Object.freeze({ auto: 'Aus dem Charakterbogen', fit: 'Bereit', injured: 'Verletzt', exhausted: 'Erschöpft', unavailable: 'Nicht einsatzfähig' });
export const GROUP_ICON_LABELS = Object.freeze({ roster: 'Mannschaft', scene: 'Sitzung', quests: 'Aufgaben', inventory: 'Ausrüstung', notes: 'Journal', map: 'Karte', location: 'Ort', status: 'Status', activity: 'Tätigkeit', supplies: 'Versorgung', treasury: 'Gruppenkasse' });

function uniqueRecords(items, normalize) {
  const seen = new Set();
  return (Array.isArray(items) ? items : []).map(normalize).filter(item => {
    if (!item.id || seen.has(item.id)) return false;
    seen.add(item.id); return true;
  });
}

export function normalizeGroupMemberState(source = {}) {
  source = source && typeof source === 'object' ? source : {};
  return { id: text(source.id), characterId: text(source.characterId),
    linkMode: ['manual', 'none'].includes(source.linkMode) ? source.linkMode : 'auto',
    assignment: Object.hasOwn(GROUP_ASSIGNMENTS, source.assignment) ? source.assignment : 'reserve',
    status: Object.hasOwn(GROUP_MEMBER_STATUSES, source.status) ? source.status : 'auto', note: text(source.note),
    // Null inherits the hierarchy icon; an explicitly empty string clears it.
    badgeIcon: source.badgeIcon == null ? null : text(source.badgeIcon)
  };
}

export function normalizeGroupLandingState(source = {}) {
  source = source && typeof source === 'object' ? source : {};
  return {
    version: 2, location: text(source.location), activity: text(source.activity), status: text(source.status),
    supplies: text(source.supplies), threadId: text(source.threadId),
    sceneThreads: [...new Set((Array.isArray(source.sceneThreads) ? source.sceneThreads : []).map(text).filter(Boolean))],
    members: uniqueRecords(source.members, normalizeGroupMemberState),
    guests: uniqueRecords(source.guests, guest => ({
      ...normalizeGroupMemberState(guest), characterId: text(guest?.characterId),
      name: text(guest?.name), role: text(guest?.role || 'Gast'), portrait: text(guest?.portrait),
      until: text(guest?.until), temporary: guest?.temporary !== false
    })),
    presets: uniqueRecords(source.presets, preset => ({ id: text(preset?.id), name: text(preset?.name),
      memberIds: [...new Set((Array.isArray(preset?.memberIds) ? preset.memberIds : []).map(text).filter(Boolean))] })),
    treasury: normalizeGroupTreasury(source.treasury), inventory: normalizeGroupInventory(source.inventory),
    icons: Object.fromEntries(Object.keys(GROUP_ICON_LABELS).map(key => [key, text(source.icons?.[key])]))
  };
}

export function updateGroupMember(state, id, patch, rosterIds = []) {
  const group = normalizeGroupLandingState(state);
  if (group.guests.some(guest => guest.id === id)) {
    group.guests = group.guests.map(guest => guest.id === id ? { ...guest, ...normalizeGroupMemberState({ ...guest, ...patch }) } : guest);
  } else {
    if (!rosterIds.includes(id)) throw new Error('Das Mitglied steht nicht mehr in der Hierarchie.');
    const current = group.members.find(member => member.id === id) || { id };
    const next = normalizeGroupMemberState({ ...current, ...patch, id });
    group.members = [...group.members.filter(member => member.id !== id), next];
  }
  return group;
}

export function applyGroupPreset(state, presetId, rosterIds = []) {
  let group = normalizeGroupLandingState(state);
  const preset = group.presets.find(item => item.id === presetId);
  if (!preset) throw new Error('Diese Zusammenstellung ist nicht mehr vorhanden.');
  const selected = new Set(preset.memberIds);
  for (const id of [...rosterIds, ...group.guests.map(guest => guest.id)]) group = updateGroupMember(group, id, { assignment: selected.has(id) ? 'active' : 'reserve' }, rosterIds);
  return group;
}
