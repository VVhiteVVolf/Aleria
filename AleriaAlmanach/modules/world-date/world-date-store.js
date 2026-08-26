const WORLD_DATE_LOCAL_STORAGE_KEY = 'aleria.current-world-date.v1';

let _worldDateRecord = null;
let _worldDateRemoteConnected = false;
let _worldDateRemoteUnsubscribe = null;
let _worldDateInitialized = false;
let _worldDateRemotePublishInFlight = false;
let _worldDateRemoteState = 'connecting';
let _worldDateRemoteError = '';
let _worldDateReconnectTimer = null;
let _worldDateReconnectAttempt = 0;

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
    remoteConnected: _worldDateRemoteConnected,
    syncState: _worldDateRemoteState,
    syncError: _worldDateRemoteError
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
  if (remoteConnected) {
    _worldDateRemoteState = 'online';
    _worldDateRemoteError = '';
  }
  writeLocalWorldDate(record);
  emitWorldDateChanged();
  return true;
}

async function publishNewerLocalWorldDate(backend) {
  if (_worldDateRemotePublishInFlight || !backend || !Number(_worldDateRecord?.updatedAtClient)) return;
  _worldDateRemotePublishInFlight = true;
  _worldDateRemoteState = 'syncing';
  _worldDateRemoteError = '';
  emitWorldDateChanged();
  try {
    const saved = typeof backend.initializeCurrentAleriaDate === 'function'
      ? await backend.initializeCurrentAleriaDate(_worldDateRecord)
      : await backend.saveCurrentAleriaDate(_worldDateRecord);
    applyWorldDateRecord(saved || _worldDateRecord, { remoteConnected: true });
  } catch (error) {
    _worldDateRemoteState = 'error';
    _worldDateRemoteError = String(error?.message || 'Das Aleria-Datum konnte nicht online gespeichert werden.');
    console.warn('Das lokal neuere Aleria-Datum konnte noch nicht online gespeichert werden:', error);
    emitWorldDateChanged();
  } finally {
    _worldDateRemotePublishInFlight = false;
  }
}

function clearWorldDateReconnectTimer() {
  if (_worldDateReconnectTimer === null) return;
  globalThis.clearTimeout?.(_worldDateReconnectTimer);
  _worldDateReconnectTimer = null;
}

function scheduleWorldDateReconnect() {
  if (_worldDateReconnectTimer !== null) return;
  const delay = Math.min(30000, 1000 * (2 ** Math.min(_worldDateReconnectAttempt, 5)));
  _worldDateReconnectAttempt += 1;
  _worldDateReconnectTimer = globalThis.setTimeout?.(() => {
    _worldDateReconnectTimer = null;
    connectWorldDateRemote();
  }, delay) ?? null;
}

function disconnectWorldDateRemote() {
  if (typeof _worldDateRemoteUnsubscribe === 'function') _worldDateRemoteUnsubscribe();
  _worldDateRemoteUnsubscribe = null;
}

function connectWorldDateRemote() {
  const backend = getWorldDateBackend();
  if (!backend) {
    _worldDateRemoteConnected = false;
    _worldDateRemoteState = 'connecting';
    emitWorldDateChanged();
    scheduleWorldDateReconnect();
    return;
  }
  if (_worldDateRemoteUnsubscribe) return;
  clearWorldDateReconnectTimer();
  _worldDateRemoteState = 'connecting';
  _worldDateRemoteError = '';
  try {
    _worldDateRemoteUnsubscribe = backend.subscribeCurrentAleriaDate(record => {
      _worldDateRemoteConnected = true;
      _worldDateRemoteState = 'online';
      _worldDateRemoteError = '';
      _worldDateReconnectAttempt = 0;
      if (!record || !AleriaWorldDateModel.isValid(record)) {
        emitWorldDateChanged();
        publishNewerLocalWorldDate(backend);
        return;
      }
      applyWorldDateRecord(record, { remoteConnected: true });
    }, error => {
      disconnectWorldDateRemote();
      _worldDateRemoteConnected = false;
      _worldDateRemoteState = 'error';
      _worldDateRemoteError = String(error?.message || 'Das Aleria-Datum konnte nicht live abgeglichen werden.');
      console.warn('Das Aleria-Datum konnte nicht live abgeglichen werden:', error);
      emitWorldDateChanged();
      scheduleWorldDateReconnect();
    });
  } catch (error) {
    disconnectWorldDateRemote();
    _worldDateRemoteConnected = false;
    _worldDateRemoteState = 'error';
    _worldDateRemoteError = String(error?.message || 'Das Aleria-Datum konnte nicht verbunden werden.');
    console.warn('Das Aleria-Datum konnte nicht live abgeglichen werden:', error);
    emitWorldDateChanged();
    scheduleWorldDateReconnect();
  }
}

function retryWorldDateRemote() {
  clearWorldDateReconnectTimer();
  disconnectWorldDateRemote();
  _worldDateReconnectAttempt = 0;
  _worldDateRemoteState = 'connecting';
  _worldDateRemoteError = '';
  emitWorldDateChanged();
  connectWorldDateRemote();
}

function initializeWorldDateStore() {
  if (_worldDateInitialized) return;
  _worldDateInitialized = true;
  _worldDateRecord = readLocalWorldDate();
  globalThis.addEventListener?.('fb-ready', retryWorldDateRemote);
  globalThis.addEventListener?.('online', retryWorldDateRemote);
  globalThis.addEventListener?.('aleria:auth-state-changed', () => {
    if (!_worldDateRemoteConnected) retryWorldDateRemote();
  });
  emitWorldDateChanged();
  connectWorldDateRemote();
}

function requireWorldDateBackend() {
  const backend = getWorldDateBackend();
  if (backend) return backend;
  retryWorldDateRemote();
  throw new Error('Das Aleria-Datum ist noch nicht mit Firebase verbunden. Bitte versuche es gleich erneut.');
}

async function setCurrentWorldDate(value) {
  const date = AleriaWorldDateModel.normalize(value);
  if (!AleriaWorldDateModel.isValid(date)) throw new Error('Bitte ein vollständiges gültiges Aleria-Datum angeben.');
  const record = AleriaWorldDateModel.normalizeRecord({
    ...date,
    updatedAtClient: Date.now()
  });
  const backend = requireWorldDateBackend();
  const saved = await backend.saveCurrentAleriaDate(record);
  const remote = AleriaWorldDateModel.normalizeRecord(saved || record);
  applyWorldDateRecord(remote, { remoteConnected: true });
  return { record: remote, localOnly: false };
}

function shiftCurrentWorldDate(days) {
  return setCurrentWorldDate(AleriaWorldDateModel.shift(getCurrentWorldDateState().date, days));
}

globalThis.AleriaWorldDateStore = Object.freeze({
  getState: getCurrentWorldDateState,
  initialize: initializeWorldDateStore,
  retrySync: retryWorldDateRemote,
  setDate: setCurrentWorldDate,
  shiftDate: shiftCurrentWorldDate
});
