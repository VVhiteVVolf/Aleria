const KINDS = ['cityNames', 'houseNames', 'emblems'];
const NOTE_LIMIT = 10000;

/** A local shortlist. Names, ranks and seats in the source catalogs never change. */
export function createProposalDraft(catalogs) {
  const allowed = Object.fromEntries(KINDS.map(kind => [kind, new Set(catalogs[kind].map(item => item.id))]));
  const initial = () => ({ favorites: Object.fromEntries(KINDS.map(kind => [kind, []])), notes: '' });
  let draft = initial();
  const history = [];
  const clone = value => structuredClone(value);
  const remember = () => { history.push(clone(draft)); if (history.length > 80) history.shift(); };

  function validate(value) {
    if (value?.schemaVersion !== 1 || value.realm !== 'ishtaran' || value.kind !== 'shortlist') {
      throw Error('Diese Datei ist keine Ishtaran-Merkliste.');
    }
    if (!value.favorites || typeof value.favorites !== 'object' || Array.isArray(value.favorites)
      || Object.keys(value.favorites).length !== KINDS.length) throw Error('Die Merkliste ist unvollständig.');
    for (const kind of KINDS) {
      const ids = value.favorites[kind];
      if (!Array.isArray(ids) || new Set(ids).size !== ids.length || ids.some(id => !allowed[kind].has(id))) {
        throw Error('Die Merkliste enthält unbekannte oder doppelte Vorschläge.');
      }
    }
    if (typeof value.notes !== 'string' || value.notes.length > NOTE_LIMIT) throw Error('Die Entwurfsnotiz ist ungültig oder zu lang.');
    return { favorites: Object.fromEntries(KINDS.map(kind => [kind, [...value.favorites[kind]]])), notes: value.notes };
  }

  return {
    current: () => clone(draft),
    canUndo: () => history.length > 0,
    toggle(kind, id) {
      if (!allowed[kind]?.has(id)) throw Error('Dieser Vorschlag ist nicht bekannt.');
      remember();
      const ids = draft.favorites[kind];
      draft.favorites[kind] = ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id];
    },
    setNotes(notes) {
      if (typeof notes !== 'string' || notes.length > NOTE_LIMIT) throw Error('Die Notiz darf höchstens 10.000 Zeichen enthalten.');
      if (notes === draft.notes) return false;
      remember(); draft.notes = notes; return true;
    },
    undo() { if (!history.length) return false; draft = history.pop(); return true; },
    reset() {
      if (!draft.notes && KINDS.every(kind => !draft.favorites[kind].length)) return false;
      remember(); draft = initial(); return true;
    },
    serialize: () => JSON.stringify({ schemaVersion: 1, realm: 'ishtaran', kind: 'shortlist', ...draft }, null, 2),
    restore(value, { recordHistory = true } = {}) {
      const next = validate(value);
      if (recordHistory) remember();
      draft = next;
    }
  };
}
