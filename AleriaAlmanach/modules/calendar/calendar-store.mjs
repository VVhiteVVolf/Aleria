import { createCalendarEventModel } from './calendar-events-model.mjs';

const STORAGE_KEY = 'aleria.calendar-events.v1';
export function createCalendarStore({ storage = globalThis.localStorage, getBackend = () => globalThis._fb?.calendar, calendar = globalThis.AleriaCalendar, target = globalThis } = {}) {
  const model = createCalendarEventModel(calendar);
  const listeners = new Set();
  let cache = [], drafts = {}, error = '', online = false, unsubscribe = null, started = false;
  const pending = new Set();
  function read() {
    try {
      const saved = JSON.parse(storage?.getItem(STORAGE_KEY) || '{}');
      cache = Array.isArray(saved.cache) ? saved.cache : [];
      drafts = saved.drafts && typeof saved.drafts === 'object' ? saved.drafts : {};
    } catch { error = 'Gespeicherte Kalenderdaten konnten nicht gelesen werden.'; }
  }
  function persist() {
    try { storage?.setItem(STORAGE_KEY, JSON.stringify({ cache, drafts })); }
    catch { throw new Error('Der lokale Speicher ist voll oder gesperrt. Der Termin wurde nicht lokal gespeichert.'); }
  }
  function state() {
    const byId = new Map(cache.map(event => [event.id, event]));
    Object.values(drafts).forEach(event => byId.set(event.id, { ...event, localOnly: true }));
    return { events: [...byId.values()].filter(event => !event.deleted), online, error, pendingCount: Object.keys(drafts).length };
  }
  function emit() { listeners.forEach(listener => listener(state())); }
  function connect() {
    unsubscribe?.(); unsubscribe = null; online = false;
    const backend = getBackend();
    if (!backend) { emit(); return; }
    unsubscribe = backend.subscribe(events => {
      cache = events; online = true; error = '';
      try { persist(); } catch (failure) { error = failure.message; }
      emit();
    }, failure => { online = false; error = String(failure?.message || 'Kalenderverbindung unterbrochen.'); emit(); });
  }
  async function save(input) {
    const event = model.normalize({ ...input, id: input.id || crypto.randomUUID() });
    if (pending.has(event.id)) throw new Error('Dieser Termin wird gerade gespeichert.');
    pending.add(event.id);
    try {
      if (online && getBackend()) {
        const saved = await getBackend().save(event);
        cache = [...cache.filter(item => item.id !== saved.id), saved];
        delete drafts[saved.id];
        try { persist(); } catch (failure) { error = failure.message; }
        emit(); return { ...saved, localOnly: false };
      }
      const old = drafts[event.id];
      drafts[event.id] = event;
      try { persist(); } catch (failure) { if (old) drafts[event.id] = old; else delete drafts[event.id]; throw failure; }
      emit(); return { ...event, localOnly: true };
    } finally { pending.delete(event.id); }
  }
  async function publish() {
    if (!online) throw new Error('Bitte zuerst die Kalenderverbindung wiederherstellen.');
    for (const event of Object.values(drafts)) await save(event);
  }
  function onStorage(event) { if (event.key === STORAGE_KEY) { read(); emit(); } }
  function initialize() {
    if (started) return;
    started = true; read(); connect();
    target.addEventListener?.('fb-ready', connect);
    target.addEventListener?.('online', connect);
    target.addEventListener?.('storage', onStorage);
  }
  return Object.freeze({
    initialize, getState: state, save, publish, reconnect: connect,
    subscribe(listener) { listeners.add(listener); listener(state()); return () => listeners.delete(listener); },
    discardDraft(id) { delete drafts[id]; persist(); emit(); },
    destroy() { unsubscribe?.(); listeners.clear(); target.removeEventListener?.('fb-ready', connect); target.removeEventListener?.('online', connect); target.removeEventListener?.('storage', onStorage); }
  });
}

let sharedStore;
export function getCalendarStore() {
  if (!sharedStore) { sharedStore = createCalendarStore(); sharedStore.initialize(); }
  return sharedStore;
}
