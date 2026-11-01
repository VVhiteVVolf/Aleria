// Local UI exercise only. No Firebase client, credentials or production writes.
import { mountQuestPage } from '/AleriaAlmanach/modules/quests/quest-controller.js';
import { STANDARD_ITEMS } from '/AleriaAlmanach/modules/item-register/item-register-standard.js';
import { loadItemRewardCatalog } from '/AleriaAlmanach/modules/item-definitions/item-reward-catalog.js';
const catalog = await (await fetch('/AleriaAlmanach/modules/quests/quest-catalog.json')).json();
const evidence = await (await fetch('/diagnostics/quest-system-2026-11-01/adventure-result.json')).json();
if (evidence.module) catalog.modules.push({id:evidence.module.id,title:evidence.module.title});
catalog.groups = [{id:evidence.module.id,title:'Testgemeinschaft'}];
const quests = [...catalog.quests], runs = [evidence.run], entries = new Map([[evidence.run.id, evidence.events]]), subscribers = new Set(), eventSubscribers = new Map();
const access = { uid: 'local-ui-only', role: 'moderator' }, receipts = new Map();
const clone = value => structuredClone(value);
function publish() { for (const next of subscribers) next({ quests: clone(quests), runs: clone(runs), cursor: null }); }
const repository = {
  subscribe(next) { subscribers.add(next); queueMicrotask(publish); return () => subscribers.delete(next); },
  watchAccess(next) { next(access); return () => {}; }, access: async () => access,
  worldDate: async () => ({ year: 1740, month: 3, day: 9 }),
  party: async () => evidence.figures.map(row => ({ kind: row.entityType === 'creature' ? 'creature' : 'character', recordId: row.id, name: row.name })),
  run: async id => clone(runs.find(row => row.id === id)),
  evidence: async id => clone(evidence.comments.find(row => row.id === id) || null),
  events(id, next) { eventSubscribers.set(id, next); queueMicrotask(() => next(clone(entries.get(id) || []))); return () => eventSubscribers.delete(id); },
  scene(id, next) { queueMicrotask(() => next(clone(evidence.comments.filter(row => row.entryId === id)), null)); return () => {}; },
  async commit(input) {
    if (receipts.has(input.operationId)) return clone(receipts.get(input.operationId));
    let result;
    if (input.action === 'save') { const quest = { ...input.quest, revision: (input.expectedRevision || 0) + 1 }; const index = quests.findIndex(row => row.id === input.id); if (index >= 0) quests[index] = quest; else quests.push(quest); result = { quest }; }
    if (input.action === 'start') {
      const run = { ...input.quest, id: input.id, questId: input.quest.id, party: input.party, groupModuleId: input.groupModuleId || '', groupName: input.groupName, status: 'active', started: input.stamp, ended: null, revision: 1,
        partyClocks: Object.fromEntries(input.party.map(member => [`${member.kind}:${member.recordId}`, input.stamp])), locations: {}, visited: [], rewardPlan: [], rewardStatus: 'pending', completedObjectives: [] };
      runs.push(run); entries.set(run.id, []); result = { run };
    }
    if (['log','finish','claim'].includes(input.action)) {
      const run = runs.find(row => row.id === input.id); run.revision++;
      if (input.action === 'claim') { run.rewardStatus = 'claimed'; result = { runId: run.id }; }
      else {
        const event = { id: input.operationId, sequence: (entries.get(run.id) || []).length + 1, kind: input.kind || 'completion', text: input.text, actors: input.actors || run.party.map(member => `${member.kind}:${member.recordId}`), stamp: input.stamp };
        entries.set(run.id, [...(entries.get(run.id) || []), event]); eventSubscribers.get(run.id)?.(clone(entries.get(run.id))); result = { event };
        if (input.stamp) for (const actor of event.actors) run.partyClocks[actor] = input.stamp;
        if (input.place) { event.place = input.place; run.visited.push(input.place); for (const actor of event.actors) run.locations[actor] = input.place; }
        if (input.objectiveId) run.completedObjectives = [...new Set([...run.completedObjectives, input.objectiveId])];
        if (input.action === 'finish') Object.assign(run, { status: input.status, ended: input.stamp, rewardPlan: input.rewardPlan, rewardStatus: 'ready' });
      }
    }
    receipts.set(input.operationId, clone(result)); publish(); return clone(result);
  }
};
const warning = document.createElement('p'); warning.textContent = 'Lokale Bedienprobe · Testdaten · keine Online-Änderungen'; warning.className = 'quest-note'; document.querySelector('.quest-breadcrumb').after(warning);
mountQuestPage(document.querySelector('[data-quest-page]'), { catalog, calendar: window.AleriaCalendar, repository, templates: async () => [...new Map([...STANDARD_ITEMS, ...await loadItemRewardCatalog()].map(item => [`${item.definitionRef?.id}@${item.definitionRef?.revision}`,item])).values()] });
