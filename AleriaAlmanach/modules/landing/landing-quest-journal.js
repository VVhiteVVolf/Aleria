import { normalizeLandingData } from './landing-model.js';
import { groupMemberSnapshots } from './group-landing-data.js';
import { groupMemberRecordId } from './group-landing-roster.js';
import { landingQuestJournalHref } from './landing-quest-model.js';
import { getQuestClient, getQuestCatalog } from '../quests/quest-client.js';
import { e, stampLabel, statusLabel } from '../quests/quest-view.js';
import { questStampKey } from '../quests/quest-model.js';
import { mergeQuestSources } from '../quests/quest-sources.js';
import { questAvailabilityAt, questWorldDate } from '../quests/quest-board-availability.js';
const mounts = new WeakMap();

// A read projection of the central journal. Local planning tasks are retained.
export function mountLandingQuestJournal(context, { client = getQuestClient, catalog: readCatalog = getQuestCatalog } = {}) {
  mounts.get(context.root)?.destroy(); mounts.delete(context.root);
  const root = context.root?.querySelector('[data-landing-quest-journal]');
  if (!root) return;
  const content = root.querySelector('[data-landing-quest-content]'), data = normalizeLandingData(context.page.landing), config = data.questJournal;
  const abort = new AbortController(); let stopped = false, stop = null, activeTab = 'active', value = { quests: [], runs: [] }, connection = 'Verbinde das Abenteuerjournal …';
  const calendar = globalThis.AleriaCalendar; let date = questWorldDate(calendar?.current?.()), stopDate = () => {};
  const sourceStatus = quest => ({ archived: ' · Aushang abgelegt', 'not-published': ' · Noch nicht ausgehängt' }[questAvailabilityAt(quest, date)] || '');
  function render() {
    if (stopped) return;
    const order = run => activeTab === 'archive' ? run.endedKey || questStampKey(run.ended || run.started) : String(run.updatedAt || '');
    const runs = value.runs.filter(run => activeTab === 'active' ? run.status === 'active' : run.status !== 'active');
    content.innerHTML = `<nav class="landing-quest-journal-tabs" aria-label="Abenteueransicht"><button type="button" data-landing-journal-tab="active" aria-pressed="${activeTab === 'active'}">Unterwegs · ${value.runs.filter(run => run.status === 'active').length}</button><button type="button" data-landing-journal-tab="archive" aria-pressed="${activeTab === 'archive'}">Chronik · ${value.runs.filter(run => run.status !== 'active').length}</button></nav>
      <div class="landing-quest-journal-cards">${runs.length ? [...runs].sort((a,b) => order(b).localeCompare(order(a))).slice(0,12).map(run => `<article><span>${e(statusLabel(run.status))}</span><h4><a href="./quests.html?run=${encodeURIComponent(run.id)}" target="_blank" rel="noopener">${e(run.title)} ↗</a></h4><p>${e(run.groupName)} · ${e(run.party.map(member=>member.name).join(', '))}</p><small>${e(stampLabel(run.ended || run.started, calendar))}</small><small>${run.rewardStatus === 'claimed' ? '✓ Belohnung übergeben' : run.rewardStatus === 'ready' ? 'Belohnung wartet auf Übergabe' : 'Belohnung vorgemerkt'}</small></article>`).join('') : `<p class="group-empty">${activeTab === 'active' ? 'Noch keine verknüpfte Gruppe unterwegs.' : 'Noch keine abgeschlossenen Abenteuer.'}</p>`}</div>
      ${value.quests.length ? `<h4>Verknüpfte Aufträge</h4><ul class="landing-quest-journal-sources">${value.quests.slice(0,12).map(quest=>`<li><a href="./quests.html?quest=${encodeURIComponent(quest.id)}&amp;group=${encodeURIComponent(context.entry.id)}" target="_blank" rel="noopener">${e(quest.title)} ↗</a>${e(sourceStatus(quest))}</li>`).join('')}</ul>` : ''}
      <p class="landing-quest-journal-status" role="status">${e(connection)}</p><div class="landing-quest-journal-links"><a href="${e(landingQuestJournalHref(context.entry.id, activeTab))}" target="_blank" rel="noopener">Alle Abenteuer im Journal ↗</a><a href="./quests.html?group=${encodeURIComponent(context.entry.id)}&amp;view=available" target="_blank" rel="noopener">Auftrag auswählen / Gruppe anmelden ↗</a></div>`;
  }
  root.addEventListener('click', event => { const tab = event.target.closest('[data-landing-journal-tab]'); if (tab) { activeTab = tab.dataset.landingJournalTab; render(); } }, { signal: abort.signal });
  mounts.set(context.root, { context, destroy() { stopped = true; stop?.(); stopDate(); abort.abort(); } });
  if (context.preview) { connection = 'Vorschau · Das gemeinsame Journal wird erst in der geöffneten Landingpage verbunden.'; render(); return; }
  const members = data.group ? groupMemberSnapshots(context.entry, data.group) : data.members;
  const memberKeys = config.includeMembers ? members.map(member => ({ kind: member.kind || 'character', id: groupMemberRecordId(member) })).filter(member => member.id).map(member => `${member.kind}:${member.id}`) : [];
  const request = { moduleId: context.entry.id, threadIds: data.group ? [data.group.threadId, ...data.group.sceneThreads].filter(Boolean) : [], memberKeys, questIds: config.questIds, runIds: config.runIds };
  Promise.all([client(), readCatalog()]).then(([repository, catalog]) => {
    if (stopped) return;
    const source = catalog.quests.filter(quest => config.questIds.includes(quest.id) || quest.links.modules.includes(context.entry.id));
    const receiveDate = next => { if (!stopped) { date = questWorldDate(next, date); render(); } };
    if (repository.watchWorldDate) stopDate = repository.watchWorldDate(receiveDate, () => {});
    else if (repository.worldDate) repository.worldDate().then(receiveDate).catch(() => {});
    stop = repository.context(request, next => {
      if (stopped) return;
      value = { runs: next.runs, quests: mergeQuestSources(source, next.quests) };
      connection = data.presentation === 'folio' ? 'Aus dem gemeinsamen Abenteuerbuch dieser Gemeinschaft.' : 'Mit dem gemeinsamen Abenteuerjournal verbunden. Fortschritt und Belohnungen werden dort verwaltet.'; render();
    }, error => { connection = `Journal derzeit nicht verbunden: ${error.message}`; render(); });
  }).catch(error => { connection = `Journal derzeit nicht verbunden: ${error.message}`; render(); });
  render();
}
export function unmountLandingQuestJournal(context) { const mount = mounts.get(context.root); if (mount?.context === context) { mount.destroy(); mounts.delete(context.root); } }
