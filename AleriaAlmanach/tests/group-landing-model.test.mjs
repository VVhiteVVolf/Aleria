import test from 'node:test';
import assert from 'node:assert/strict';
import { migrateGroupLandingEntry } from '../modules/landing/group-landing-migration.js';
import { normalizeLandingData, createLandingPage } from '../modules/landing/landing-model.js';
import { normalizeGroupLandingState, applyGroupPreset, updateGroupMember } from '../modules/landing/group-landing-model.js';
import { collectGroupRoster, resolveGroupRoster, matchGroupCharacter } from '../modules/landing/group-landing-roster.js';
import { bookGroupTreasury, groupTreasuryBalance } from '../modules/landing/group-landing-treasury.js';
import { projectGroupReadiness, summarizeGroupReadiness } from '../modules/landing/group-landing-combat.js';
import { collectGroupScenes, projectGroupScene, classifyGroupScene } from '../modules/landing/group-landing-scenes.js';
import { groupMemberSnapshots, observeGroupScene } from '../modules/landing/group-landing-data.js';
import '../modules/core/aleria-calendar.js';

const hierarchy = { hierarchyPage: true, hierarchy: { trees: [{ id: 'main', levels: [{ nodes: [
  { title: 'Kapitän', subtitle: 'Idwal Draig' }, { title: 'Ritter zur See', subtitle: 'VAKANT' },
  { title: 'Feldscher', subtitle: '' }, { title: 'Anaraut Draig', subtitle: 'Anführer' },
  { title: 'Schiffskoch', subtitle: 'Murdo Marlòn' }, { title: 'Altmatrose', subtitle: 'Nicht benannt' },
  { title: 'Familie', subtitle: 'Haus Arth' }, { title: 'Kapitän', subtitle: 'Idwal Draig' }
] }] }] } };
const entry = { id: 'crew', title: 'Mannschaft', pages: [{ pageTitle: 'Titel' }, hierarchy, { sessionPage: true, pageTitle: 'Schiff' }] };

test('Roster reads both hierarchy layouts, deduplicates people, excludes vacant roles and houses', () => {
  assert.deepEqual(collectGroupRoster(entry).map(member => member.name), ['Idwal Draig', 'Anaraut Draig', 'Murdo Marlòn']);
  assert.equal(matchGroupCharacter('Lady Lynne Arth', [{ id: 'lynne', name: 'Lynne Arth' }]).id, 'lynne');
  assert.equal(matchGroupCharacter('Idwal', [{ id: 'a', name: 'Idwal' }, { id: 'b', name: 'Idwal' }]), null);
});

test('Migration inserts after hierarchy once, anchors existing comments and leaves other tabs untouched', () => {
  assert.equal(migrateGroupLandingEntry(entry, { tab: 'Welt' }), entry);
  const upgraded = migrateGroupLandingEntry(entry, { tab: 'Gruppen' });
  assert.equal(upgraded.pages[2].landingPage, true);
  assert.equal(upgraded.pages[3].commentThreadKey, '2');
  assert.equal(upgraded.pages[2].commentThreadKey, 'group-overview');
  assert.deepEqual(upgraded.pages[1].hierarchy, hierarchy.hierarchy);
  assert.equal(migrateGroupLandingEntry(upgraded, { tab: 'Gruppen' }), upgraded);
  assert.equal(entry.pages.length, 3);
});

test('Existing named selections and tasks survive; no fictional template adventurers become guests', () => {
  const old = { ...entry, pages: [...entry.pages, { landingPage: true, landing: { members: [{ id: 'real', name: 'Idwal Draig' }, { name: 'Abenteurer 8' }], quests: [{ id: 'q', title: 'Reise', ownerMemberId: 'real', dueDate: 'Tag 4' }] } }] };
  const next = migrateGroupLandingEntry(old, { tab: 'Gruppen' });
  assert.equal(next.pages[2].landing.group.members[0].assignment, 'active');
  assert.deepEqual(next.pages[2].landing.group.guests, []);
  assert.equal(next.pages[2].landing.quests[0].dueDate, 'Tag 4');
  assert.equal(next.pages[2].landing.quests[0].ownerMemberId, 'hierarchy:idwal draig');
  assert.equal(next.pages[3].commentThreadKey, '2');
  assert.equal(next.pages[2].commentThreadKey, '3');
});

test('Presets choose only the current expedition; hierarchy and guest duplicate identities remain stable', () => {
  const roster = collectGroupRoster(entry);
  let state = normalizeGroupLandingState({ guests: [{ id: 'guest', characterId: 'friend', name: 'Gast', assignment: 'active' }],
    presets: [{ id: 'shore', name: 'Landgang', memberIds: [roster[0].id] }] });
  state = applyGroupPreset(state, 'shore', roster.map(member => member.id));
  const resolved = resolveGroupRoster(entry, state);
  assert.equal(resolved.filter(member => member.assignment === 'active').length, 1);
  assert.equal(state.guests[0].assignment, 'reserve');
  assert.throws(() => updateGroupMember(state, 'missing', {}, roster.map(member => member.id)));
  state.guests.push({ id: 'duplicate', name: 'Sir Idwal Draig' });
  assert.equal(resolveGroupRoster(entry, state).length, 4);
});

test('An automatic archive link can be explicitly removed without returning on the next render', () => {
  const members = collectGroupRoster(entry);
  const group = normalizeGroupLandingState({ members: [{ id: members[0].id, linkMode: 'none' }] });
  assert.equal(resolveGroupRoster(entry, group, [{ id: 'idwal', name: 'Idwal Draig' }])[0].characterId, '');
});

test('Hierarchy icons survive party selection and can be deliberately cleared', () => {
  const source = { pages: [{ hierarchyPage: true, hierarchy: { levels: [{ nodes: [{ title: 'Kapitän', subtitle: 'Idwal Draig', icon: '⚑' }] }] } }] };
  const roster = collectGroupRoster(source);
  const chosen = updateGroupMember({}, roster[0].id, { assignment: 'active' }, [roster[0].id]);
  assert.equal(resolveGroupRoster(source, chosen)[0].badgeIcon, '⚑');
  const cleared = updateGroupMember(chosen, roster[0].id, { badgeIcon: '' }, [roster[0].id]);
  assert.equal(resolveGroupRoster(source, cleared)[0].badgeIcon, '');
});

test('Treasury uses integer shared denominations, rejects insufficient funds and keeps unknown distinct from zero', () => {
  assert.equal(groupTreasuryBalance({}), null);
  const initial = { openingCopper: 1000, entries: [] };
  const booked = bookGroupTreasury(initial, { id: 'one', direction: 'expense', amount: '1,01', currency: 'ST', label: 'Proviant' });
  assert.equal(groupTreasuryBalance(booked), 899);
  const pennies = bookGroupTreasury(booked, { id: 'two', direction: 'income', amount: '3', currency: 'Pf', label: 'Restgeld' });
  assert.equal(groupTreasuryBalance(pennies), 899.03);
  assert.throws(() => bookGroupTreasury(pennies, { id: 'three', direction: 'expense', amount: '2', currency: 'GT', label: 'Zu viel' }));
  assert.throws(() => bookGroupTreasury(initial, { id: 'bad', direction: 'income', amount: '1-2', currency: 'KT', label: 'Bereich' }));
  assert.deepEqual(initial, { openingCopper: 1000, entries: [] });
});

test('Missing sheets stay unknown; manual ready cannot conceal zero HP or action blocking effects', () => {
  assert.equal(projectGroupReadiness({ status: 'fit' }, null).known, false);
  const profile = { currentHitPoints: 0, maximumHitPoints: 30, conditions: [], resources: [] };
  assert.equal(projectGroupReadiness({ status: 'fit' }, profile).key, 'unavailable');
  assert.equal(projectGroupReadiness({ status: 'fit' }, { ...profile, currentHitPoints: 30, conditions: [{ name: 'Gelähmt', mechanics: { blocksActions: true } }] }).key, 'unavailable');
  const wounded = projectGroupReadiness({ status: 'fit' }, { ...profile, currentHitPoints: 20 });
  assert.equal(wounded.key, 'injured');
  assert.equal(summarizeGroupReadiness([{ assignment: 'reserve', readiness: wounded }, { assignment: 'active', readiness: projectGroupReadiness({}, null) }]).unknown, 1);
});

test('Active session calendar follows the shared timeline and immutable play start', () => {
  const calendar = globalThis.AleriaCalendar;
  const scenes = collectGroupScenes([{ entries: [{ id: 'crew', pages: [{}, { sessionPage: true, commentThreadKey: 'old-scene', sessionDateAleria: { year: 1740, month: 3, day: 9 } }] }] }]);
  assert.equal(scenes[0].threadId, 'crew::session:old-scene');
  const active = projectGroupScene(scenes[0], [{}], { calendar, timeline: () => [{ endSeconds: 45000, aleriaEndDayIndex: 3 }] });
  assert.equal(active.dayLabel, 'Tag 3');
  assert.equal(active.time, '12:30');
  assert.equal(classifyGroupScene({ ...active, threadId: 'older', ordinal: active.ordinal - 1 }, active, calendar), 'Früher');
  assert.equal(classifyGroupScene({ ...active, threadId: 'next', ordinal: active.ordinal + 1 }, active, calendar), 'Kommend');
  assert.equal(classifyGroupScene({ ...active, threadId: 'unknown', ordinal: null }, active, calendar), 'Zeit offen');
  assert.equal(calendar.playDay({ year: 1740, month: 3, day: 9 }), 1);
});

test('Normalization retains group, guest, session and task state through repeated sanitization', () => {
  const source = { group: { threadId: 'crew::session:2', sceneThreads: ['old', 'old'], members: [{ id: 'one', assignment: 'active' }], guests: [{ id: 'guest', name: 'Gast', until: 'Nach der Reise' }], treasury: { openingCopper: 0 } }, quests: [{ id: 'q', title: 'Reise', ownerMemberId: 'one', dueDate: 'Tag 4', moduleId: 'quest' }] };
  const clean = normalizeLandingData(source);
  assert.deepEqual(normalizeLandingData(clean), clean);
  assert.deepEqual(clean.group.sceneThreads, ['old']);
  assert.equal(clean.quests[0].moduleId, 'quest');
  assert.deepEqual(createLandingPage().landing.members, []);
  assert.deepEqual(createLandingPage().landing.quests, []);
});

test('Stored combat snapshots enrich the overview without changing comments or base profiles', () => {
  const original = { currentHitPoints: 30, maximumHitPoints: 30, resources: [], conditions: [], abilities: [], totalDefense: 15 };
  globalThis.getAvailableCommentCharacters = () => [{ id: 'idwal', name: 'Idwal Draig', combatProfile: { level: 7 } }];
  globalThis.AleriaCombat = { getProfile: () => structuredClone(original) };
  const comments = [{ combatResolution: { actorId: 'idwal', targetId: 'enemy', actorHitPointSnapshot: { after: { current: 9, maximum: 30, temporary: 0 } } } }];
  const copy = JSON.stringify(comments);
  const members = groupMemberSnapshots(entry, normalizeGroupLandingState({}), comments);
  assert.equal(members[0].readiness.current, 9);
  assert.equal(members[0].readiness.key, 'injured');
  assert.equal(JSON.stringify(comments), copy);
  assert.equal(original.currentHitPoints, 30);
  delete globalThis.getAvailableCommentCharacters; delete globalThis.AleriaCombat;
});

test('Scene subscription releases listeners and rejects delayed reads after a newer update', async () => {
  let push, resolveRead, released = 0;
  const received = [];
  const backend = { subscribeComments(id, listener) { push = listener; return () => released++; }, loadComments: () => new Promise(resolve => { resolveRead = resolve; }) };
  const stop = observeGroupScene('scene', comments => received.push(comments), assert.fail, async () => backend);
  await Promise.resolve();
  push([{ id: 'new' }]); resolveRead([{ id: 'old' }]); await Promise.resolve();
  assert.deepEqual(received, [[{ id: 'new' }]]);
  stop(); push([{ id: 'later' }]);
  assert.equal(released, 1); assert.equal(received.length, 1);
  let resolveBackend;
  const stopBeforeReady = observeGroupScene('scene', assert.fail, assert.fail, () => new Promise(resolve => { resolveBackend = resolve; }));
  stopBeforeReady(); resolveBackend(backend); await Promise.resolve(); assert.equal(released, 1);
});
