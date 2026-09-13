// A live character can expose hundreds of action/grip/grade combinations. Keep
// only a small working set, and let replaced source records be garbage-collected.
export function createCombatProfileCache(limit = 8) {
  let owners = new WeakMap();
  return {
    get(owner, key, resolve) {
      if (!owner || typeof owner !== 'object') return resolve();
      let entries = owners.get(owner);
      if (!entries) { entries = new Map(); owners.set(owner, entries); }
      if (entries.has(key)) {
        const value = entries.get(key);
        entries.delete(key);
        entries.set(key, value);
        return value;
      }
      const value = resolve();
      entries.set(key, value);
      if (entries.size > limit) entries.delete(entries.keys().next().value);
      return value;
    },
    clear() { owners = new WeakMap(); }
  };
}
