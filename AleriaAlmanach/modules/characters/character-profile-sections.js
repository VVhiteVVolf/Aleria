// Each editor starts only when needed. Unopened sections keep their original
// values, so saving a portrait/profile cannot initialize or overwrite equipment.
const AleriaCharacterProfileSections = Object.freeze({
  create(definitions, onInitialized) {
    const initialized = new Set();
    return Object.freeze({
      isInitialized(section) { return initialized.has(section); },
      ensure(section) {
        const definition = definitions[section];
        if (!definition || initialized.has(section)) return false;
        definition.initialize();
        onInitialized(section, definition.collect());
        initialized.add(section);
        return true;
      },
      collect(section) {
        const definition = definitions[section];
        return initialized.has(section) ? definition.collect() : definition.initialValue;
      }
    });
  }
});
