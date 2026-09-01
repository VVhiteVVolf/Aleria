(function (root) {
  function clone(value) {
    return JSON.parse(JSON.stringify(value ?? null));
  }

  function create(pin, options = {}) {
    if (!pin || typeof pin !== 'object') {
      throw new TypeError('Ein Pin-Entwurf benötigt einen gültigen Pin.');
    }

    let original = clone(pin);
    let draft = clone(pin);
    const isNew = options.isNew === true;

    return {
      original: () => clone(original),
      draft: () => draft,
      isNew: () => isNew,
      isDirty: () => JSON.stringify(draft) !== JSON.stringify(original),
      commitInto(target) {
        if (!target || typeof target !== 'object') return null;
        Object.keys(target).forEach(key => delete target[key]);
        Object.assign(target, clone(draft));
        original = clone(target);
        draft = clone(target);
        return target;
      },
      reset(nextPin = original) {
        original = clone(nextPin);
        draft = clone(nextPin);
        return draft;
      },
    };
  }

  const api = { create };
  root.KartoPinDraft = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
