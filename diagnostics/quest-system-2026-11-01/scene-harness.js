import { mountQuestSceneTrackers } from '/AleriaAlmanach/modules/quests/quest-scene-tracker.js';
import { mountGroupQuestAccount } from '/AleriaAlmanach/modules/landing/group-quest-account.js';
const catalog = await (await fetch('/AleriaAlmanach/modules/quests/quest-catalog.json')).json();
const evidence = await (await fetch('./adventure-result.json')).json();
const source = catalog.quests.find(row => row.id.endsWith(':gwynthor-der-staedter-und-sein-pferd'));
const run = { ...evidence.run, id: 'ui-location-test', title: 'Standortprobe mit Testfiguren', status: 'active', ended: null, dossier: source.dossier, links: { ...evidence.run.links, maps: source.links.maps }, locations: {}, revision: 1 };
let next;
const repository = {
  context(request, onNext) { next = onNext; onNext({ runs: [structuredClone(run)] }); return () => { next = null; }; },
  access: async () => ({ uid: 'local-test-only', role: 'moderator' }),
  async commit(input) {
    if (input.expectedRevision !== run.revision) throw Error('Bitte neu laden.');
    if (input.place) for (const actor of input.actors) run.locations[actor] = input.place;
    for (const actor of input.actors) run.partyClocks[actor] = input.stamp;
    run.revision++; next?.({ runs: [structuredClone(run)] });
    return { revision: run.revision };
  },
  groupAccount(id, onNext) { onNext({ inventory: { moneyState: { totalCopper: 50 }, items: [{ name: 'Notizbuch (klein)', quantity: 1 }] }, receipts: [{ runId: evidence.run.id, title: 'Gemeinsame Versorgung · Emulatornachweis', copper: 50 }] }); return () => {}; }
};
mountQuestSceneTrackers(document.querySelector('#scene'), { client: async () => repository, readCatalog: async () => catalog });
mountGroupQuestAccount(document.querySelector('#account'), evidence.module.id, { client: async () => repository });
