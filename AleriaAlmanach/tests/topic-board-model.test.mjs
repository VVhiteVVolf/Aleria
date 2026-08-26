import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function loadTopicBoardModel() {
  const context = vm.createContext({ console, Date });
  for (const relativePath of [
    '../modules/world-date/world-date-model.js',
    '../modules/topic-board/topic-board-travel.js',
    '../modules/topic-board/topic-board-model.js'
  ]) {
    vm.runInContext(fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8'), context);
  }
  return context;
}

function loadTopicBoardStore() {
  const storage = new Map();
  const context = vm.createContext({
    console,
    Date,
    Math,
    CustomEvent: class CustomEvent {
      constructor(type, options = {}) { this.type = type; this.detail = options.detail; }
    },
    document: { dispatchEvent() {} },
    localStorage: {
      getItem(key) { return storage.has(key) ? storage.get(key) : null; },
      setItem(key, value) { storage.set(key, String(value)); }
    },
    setTimeout() {}
  });
  for (const relativePath of [
    '../modules/world-date/world-date-model.js',
    '../modules/topic-board/topic-board-travel.js',
    '../modules/topic-board/topic-board-model.js',
    '../modules/topic-board/topic-board-store.js'
  ]) {
    vm.runInContext(fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8'), context);
  }
  return context;
}

test('Themenvorschlaege normalisieren Metadaten und entfernen doppelte Figuren', () => {
  const context = loadTopicBoardModel();
  const proposal = vm.runInContext(`normalizeTopicProposal({
    title: '  Reise   nach Abergwint  ',
    category: 'reise',
    participants: [
      { id: 'idwal', name: 'Idwal', portrait: './idwal.png' },
      { id: 'idwal', name: 'Doppelt' },
      { id: 'trevor', name: 'Trevor' }
    ],
    votes: { patrick: true, leer: false }
  })`, context);

  assert.equal(proposal.title, 'Reise nach Abergwint');
  assert.equal(proposal.category, 'reise');
  assert.deepEqual(Array.from(proposal.participants, participant => participant.id), ['idwal', 'trevor']);
  assert.equal(proposal.voteCount, 1);
  assert.equal(proposal.travel.enabled, false);
});

test('offene Themen werden nach Stimmen und Aktualitaet sortiert', () => {
  const context = loadTopicBoardModel();
  const ids = vm.runInContext(`sortTopicProposals([
    { id: 'neu', title: 'Neu', updatedAtClient: 30, votes: {} },
    { id: 'favorit', title: 'Favorit', updatedAtClient: 10, votes: { a: true, b: true } },
    { id: 'archiv', title: 'Archiv', status: 'archived', archivedAtClient: 50 }
  ], 'open').map(item => item.id)`, context);

  assert.deepEqual(Array.from(ids), ['favorit', 'neu']);
});

test('Archivansicht enthaelt nur abgehakte Themen', () => {
  const context = loadTopicBoardModel();
  const ids = vm.runInContext(`sortTopicProposals([
    { id: 'offen', title: 'Offen' },
    { id: 'alt', title: 'Alt', status: 'archived', archivedAtClient: 10 },
    { id: 'frisch', title: 'Frisch', status: 'archived', archivedAtClient: 20 }
  ], 'archived').map(item => item.id)`, context);

  assert.deepEqual(Array.from(ids), ['frisch', 'alt']);
});

test('lokale Stimmen lassen sich setzen und wieder zuruecknehmen', async () => {
  const context = loadTopicBoardStore();
  vm.runInContext('initializeTopicBoardState()', context);
  const created = await vm.runInContext("createTopicBoardProposal({ title: 'Hofempfang' })", context);
  const proposalId = created.proposal.id;

  await vm.runInContext(`toggleTopicBoardProposalVote('${proposalId}')`, context);
  assert.equal(vm.runInContext(`getTopicBoardProposalById('${proposalId}').voteCount`, context), 1);

  await vm.runInContext(`toggleTopicBoardProposalVote('${proposalId}')`, context);
  assert.equal(vm.runInContext(`getTopicBoardProposalById('${proposalId}').voteCount`, context), 0);
});
