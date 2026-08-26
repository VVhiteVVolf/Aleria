const WORLD_DATE_LOCAL_STORAGE_KEY = 'aleria.current-world-date.v1';

let _worldDateRecord = null;
let _worldDateRemoteConnected = false;
let _worldDateRemoteUnsubscribe = null;
let _worldDateInitialized = false;
let _worldDateRemotePublishInFlight = false;

function readLocalWorldDate() {
  try {
    const parsed = JSON.parse(globalThis.localStorage?.getItem(WORLD_DATE_LOCAL_STORAGE_KEY) || 'null');
    const normalized = AleriaWorldDateModel.normalizeRecord(parsed || AleriaWorldDateModel.getDefault());
    return AleriaWorldDateModel.isValid(normalized) ? normalized : AleriaWorldDateModel.normalizeRecord(AleriaWorldDateModel.getDefault());
  } catch (error) {
    console.warn('Das lokale Aleria-Datum konnte nicht gelesen werden:', error);
    return AleriaWorldDateModel.normalizeRecord(AleriaWorldDateModel.getDefault());
  }
}

function writeLocalWorldDate(record) {
  try {
    globalThis.localStorage?.setItem(WORLD_DATE_LOCAL_STORAGE_KEY, JSON.stringify(record));
  } catch (error) {
    console.warn('Das lokale Aleria-Datum konnte nicht gespeichert werden:', error);
  }
}

function getWorldDateBackend() {
  const backend = globalThis._fb;
  if (!backend) return null;
  return typeof backend.saveCurrentAleriaDate === 'function' && typeof backend.subscribeCurrentAleriaDate === 'function'
    ? backend
    : null;
}

function getCurrentWorldDateState() {
  const record = _worldDateRecord || readLocalWorldDate();
  return {
    date: AleriaWorldDateModel.normalize(record),
    record: { ...record },
    remoteConnected: _worldDateRemoteConnected
  };
}

function emitWorldDateChanged() {
  if (typeof document === 'undefined') return;
  document.dispatchEvent(new CustomEvent('almanach-world-date-state', {
    detail: getCurrentWorldDateState()
  }));
}

function applyWorldDateRecord(value, { remoteConnected = _worldDateRemoteConnected } = {}) {
  const record = AleriaWorldDateModel.normalizeRecord(value);
  if (!AleriaWorldDateModel.isValid(record)) return false;
  _worldDateRecord = record;
  _worldDateRemoteConnected = remoteConnected;
  writeLocalWorldDate(record);
  emitWorldDateChanged();
  return true;
}

async function publishNewerLocalWorldDate(backend) {
  if (_worldDateRemotePublishInFlight || !backend || !Number(_worldDateRecord?.updatedAtClient)) return;
  _worldDateRemotePublishInFlight = true;
  try {
    const saved = await backend.saveCurrentAleriaDate(_worldDateRecord);
    applyWorldDateRecord(saved || _worldDateRecord, { remoteConnected: true });
  } catch (error) {
    console.warn('Das lokal neuere Aleria-Datum konnte noch nicht online gespeichert werden:', error);
  } finally {
    _worldDateRemotePublishInFlight = false;
  }
}

function connectWorldDateRemote(attempt = 0) {
  const backend = getWorldDateBackend();
  if (!backend) {
    if (attempt < 80) globalThis.setTimeout?.(() => connectWorldDateRemote(attempt + 1), 250);
    return;
  }
  if (_worldDateRemoteUnsubscribe) return;
  _worldDateRemoteUnsubscribe = backend.subscribeCurrentAleriaDate(record => {
    if (!record || !AleriaWorldDateModel.isValid(record)) {
      _worldDateRemoteConnected = true;
      emitWorldDateChanged();
      publishNewerLocalWorldDate(backend);
      return;
    }
    const incoming = AleriaWorldDateModel.normalizeRecord(record);
    const currentUpdated = Number(_worldDateRecord?.updatedAtClient) || 0;
    if (!currentUpdated || incoming.updatedAtClient >= currentUpdated) {
      applyWorldDateRecord(incoming, { remoteConnected: true });
    } else {
      _worldDateRemoteConnected = true;
      emitWorldDateChanged();
      publishNewerLocalWorldDate(backend);
    }
  }, error => {
    _worldDateRemoteConnected = false;
    console.warn('Das Aleria-Datum konnte nicht live abgeglichen werden:', error);
    emitWorldDateChanged();
  });
}

function initializeWorldDateStore() {
  if (_worldDateInitialized) return;
  _worldDateInitialized = true;
  _worldDateRecord = readLocalWorldDate();
  emitWorldDateChanged();
  connectWorldDateRemote();
}

async function setCurrentWorldDate(value) {
  const date = AleriaWorldDateModel.normalize(value);
  if (!AleriaWorldDateModel.isValid(date)) throw new Error('Bitte ein vollständiges gültiges Aleria-Datum angeben.');
  const record = AleriaWorldDateModel.normalizeRecord({
    ...date,
    updatedAtClient: Date.now()
  });
  applyWorldDateRecord(record);
  const backend = getWorldDateBackend();
  if (!backend) return { record, localOnly: true };
  try {
    const saved = await backend.saveCurrentAleriaDate(record);
    const remote = AleriaWorldDateModel.normalizeRecord(saved || record);
    applyWorldDateRecord(remote, { remoteConnected: true });
    return { record: remote, localOnly: false };
  } catch (error) {
    console.warn('Das Aleria-Datum bleibt vorerst lokal gespeichert:', error);
    return { record, localOnly: true, error };
  }
}

function shiftCurrentWorldDate(days) {
  return setCurrentWorldDate(AleriaWorldDateModel.shift(getCurrentWorldDateState().date, days));
}

globalThis.AleriaWorldDateStore = Object.freeze({
  getState: getCurrentWorldDateState,
  initialize: initializeWorldDateStore,
  setDate: setCurrentWorldDate,
  shiftDate: shiftCurrentWorldDate
});
