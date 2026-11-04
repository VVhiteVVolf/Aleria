/** Venalys owns a many-to-many territory draft, distinct from single-seat realms. */
export const DRAFT_SCHEMA = 'aleria.venalys.district-assignments';
export const DRAFT_STORAGE_KEY = 'aleria:proposal:venalys:district-assignments:v1';

const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const copy = value => structuredClone(value);

function exactKeys(value, expected) {
  return isRecord(value) && Object.keys(value).length === expected.size
    && Object.keys(value).every(key => expected.has(key));
}

function districtName(value) {
  if (typeof value !== 'string') throw Error('Ein Bezirksname muss ein Text sein.');
  const name = value.trim();
  if (!name || name.length > 80 || /[\u0000-\u001f\u007f]/.test(name))
    throw Error('Bezirksnamen benötigen 1 bis 80 Zeichen ohne Steuerzeichen.');
  return name;
}

export function createAssignmentState({ houseIds, districts, pointIds, legacyPointIds = [] }) {
  const houses = new Set(houseIds), districtIds = new Set(districts.map(d => d.id));
  const targets = new Set([...districtIds, ...pointIds]);
  const legacyTargets = new Set([...districtIds,...legacyPointIds]);
  if (!houses.size || houses.size !== houseIds.length || districtIds.size !== districts.length
      || targets.size !== districts.length + pointIds.length
      || new Set(legacyPointIds).size !== legacyPointIds.length || legacyPointIds.some(id => !pointIds.includes(id)))
    throw Error('Die Venalys-Zuordnungsdaten enthalten doppelte oder fehlende Kennungen.');
  const initial = {
    districtNames: Object.fromEntries(districts.map(d => [d.id, districtName(d.name)])),
    assignments: Object.fromEntries([...targets].map(id => [id, []])),
  };
  const houseOrder = new Map(houseIds.map((id, index) => [id, index]));
  let draft = copy(initial);
  const history = [];

  function validate(value) {
    if (value?.schema !== DRAFT_SCHEMA || value.schemaVersion !== 1 || value.realm !== 'venalys')
      throw Error('Diese Datei ist kein Venalys-Bezirksentwurf.');
    const compatible = legacyPointIds.length > 0 && exactKeys(value.assignments,legacyTargets);
    if (!exactKeys(value.districtNames, districtIds) || (!exactKeys(value.assignments, targets) && !compatible))
      throw Error('Die Bezirks- oder Ortsliste des Entwurfs ist unvollständig oder unbekannt.');
    const names = Object.fromEntries([...districtIds].map(id => [id, districtName(value.districtNames[id])]));
    const assignments = Object.fromEntries([...targets].map(id => {
      const entries = compatible && !legacyTargets.has(id) ? [] : value.assignments[id];
      if (!Array.isArray(entries) || new Set(entries).size !== entries.length || entries.some(h => !houses.has(h)))
        throw Error('Die Hauszuordnungen enthalten unbekannte oder doppelte Häuser.');
      return [id, [...entries].sort((a, b) => houseOrder.get(a) - houseOrder.get(b))];
    }));
    return { districtNames: names, assignments };
  }

  function update(next) {
    if (JSON.stringify(next) === JSON.stringify(draft)) return false;
    history.push(copy(draft));
    draft = next;
    return true;
  }

  function assertAssignment(houseId, targetId) {
    if (!houses.has(houseId) || !targets.has(targetId)) throw Error('Unbekanntes Haus oder unbekanntes Gebiet.');
  }

  return {
    current: () => copy(draft),
    canUndo: () => history.length > 0,
    canAssign: houseId => houses.has(houseId),
    assign(houseId, targetId) {
      assertAssignment(houseId, targetId);
      if (draft.assignments[targetId].includes(houseId)) return false;
      const next = copy(draft);
      next.assignments[targetId].push(houseId);
      next.assignments[targetId].sort((a, b) => houseOrder.get(a) - houseOrder.get(b));
      return update(next);
    },
    remove(houseId, targetId) {
      assertAssignment(houseId, targetId);
      if (!draft.assignments[targetId].includes(houseId)) return false;
      const next = copy(draft);
      next.assignments[targetId] = next.assignments[targetId].filter(id => id !== houseId);
      return update(next);
    },
    renameDistrict(id, value) {
      if (!districtIds.has(id)) throw Error('Unbekannter Bezirk.');
      const next = copy(draft);
      next.districtNames[id] = districtName(value);
      return update(next);
    },
    undo() {
      if (!history.length) return false;
      draft = history.pop();
      return true;
    },
    reset: () => update(copy(initial)),
    serialize: () => JSON.stringify({ schema: DRAFT_SCHEMA, schemaVersion: 1, realm: 'venalys', ...draft }, null, 2),
    restore(value, { recordHistory = true } = {}) {
      const next = validate(value);
      if (recordHistory) return update(next);
      draft = next;
      history.length = 0;
      return true;
    },
  };
}
