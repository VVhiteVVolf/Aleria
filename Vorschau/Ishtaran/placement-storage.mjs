export const PLACEMENT_STORAGE_KEY = 'ishtaran:placements:v1';

function preserveRaw(storage, raw) {
  const prefix = `${PLACEMENT_STORAGE_KEY}:before-kutlakar-evacuation`;
  let key = prefix, suffix = 1;
  while (storage.getItem(key) !== null && storage.getItem(key) !== raw) key = `${prefix}:${suffix++}`;
  if (storage.getItem(key) === null) storage.setItem(key, raw);
  return key;
}

/** Startup compatibility only. Explicit imports always use strict current rules. */
export function prepareStoredPlacements({ storage, createState, evacuation }) {
  const raw = storage.getItem(PLACEMENT_STORAGE_KEY);
  if (raw === null) return { status: 'empty' };
  let value;
  try {
    value = JSON.parse(raw);
    createState().restore(value);
    return { status: 'valid' };
  } catch { /* Preserve invalid or outdated input before considering a transition. */ }
  let backupKey;
  try { backupKey = preserveRaw(storage, raw); }
  catch {
    return { status: 'recovery', raw, persistenceBlocked: true,
      message: 'Der vorherige Entwurf konnte nicht zusätzlich im Browser gesichert werden. Er bleibt unverändert erhalten und kann heruntergeladen werden. Neue Sitzänderungen bleiben in dieser geöffneten Ansicht und können gesondert heruntergeladen werden.' };
  }
  if (evacuation && value?.placements?.[evacuation.id] === evacuation.originSeatId) {
    const candidate = { ...value, placements: { ...value.placements, [evacuation.id]: evacuation.refugeSeatId } };
    try {
      createState().restore(candidate);
      storage.setItem(PLACEMENT_STORAGE_KEY, JSON.stringify(candidate, null, 2));
      return { status: 'migrated', raw, backupKey, message: 'Kutlugs früherer Sitz wurde nach Belduran verlegt. Alle anderen gespeicherten Zuordnungen bleiben erhalten.' };
    } catch { /* A full destination or another invalid placement needs manual recovery. */ }
  }
  return { status: 'recovery', raw, backupKey, message: 'Der gespeicherte Sitzentwurf konnte unter den aktuellen Ortsregeln nicht übernommen werden. Das Original bleibt gesichert und kann heruntergeladen werden; angezeigt wird die aktuelle Ausgangsverteilung.' };
}
