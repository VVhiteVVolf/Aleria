// Explicit and reversible migration between legacy and versioned family documents.

(function installFamilyMigrationService(global) {
  'use strict';

  const MIGRATION_EXTENSION = 'aleria.migration';

  function isRecord(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  }

  function clone(value, fallback = {}) {
    try {
      return typeof structuredClone === 'function'
        ? structuredClone(value)
        : JSON.parse(JSON.stringify(value));
    } catch (error) {
      return fallback;
    }
  }

  function isVersioned(value) {
    return value?.schema === 'aleria.family'
      && Number(value?.schemaVersion) >= 2
      && isRecord(value?.genealogy);
  }

  function slugify(value) {
    return String(value || 'familie')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'familie';
  }

  function canMigrate(value) {
    return isRecord(value) && !isVersioned(value);
  }

  function migrate(legacyFamily, options = {}) {
    if (!canMigrate(legacyFamily)) {
      return Object.freeze({ migrated: false, family: legacyFamily, report: Object.freeze([]) });
    }
    const projectLegacy = global.AleriaFamily?.compatibility?.projectLegacy;
    if (typeof projectLegacy !== 'function') {
      const error = new Error('Die Family-Legacy-Bridge ist nicht geladen.');
      error.code = 'FAMILY_MIGRATION_BRIDGE_UNAVAILABLE';
      throw error;
    }

    const source = clone(legacyFamily);
    const projected = projectLegacy(source);
    const family = clone(projected.family);
    const report = clone(projected.report, []);
    const documentTitle = family.document?.title || source.organizationTitle || source.chartTitle || 'Familie';
    family.id = String(source.id || '').trim() || `${slugify(documentTitle)}-family`;
    family.extensions = isRecord(family.extensions) ? family.extensions : {};
    family.extensions['aleria.legacy'] = {
      ...(isRecord(family.extensions['aleria.legacy']) ? family.extensions['aleria.legacy'] : {}),
      projectedAtRuntime: false,
      migratedExplicitly: true
    };
    family.extensions[MIGRATION_EXTENSION] = {
      sourceSchema: 'legacy-family',
      targetSchema: 'aleria.family',
      targetSchemaVersion: 2,
      explicit: true,
      report,
      legacySnapshot: options.keepLegacySnapshot === false ? null : source
    };

    const sanitized = typeof global.sanitizeFamilyData === 'function'
      ? global.sanitizeFamilyData(family)
      : family;
    return Object.freeze({
      migrated: true,
      family: sanitized,
      report: Object.freeze(report.map(item => Object.freeze({ ...item })))
    });
  }

  function canRestore(versionedFamily) {
    return isVersioned(versionedFamily)
      && isRecord(versionedFamily.extensions?.[MIGRATION_EXTENSION]?.legacySnapshot);
  }

  function restore(versionedFamily) {
    if (!canRestore(versionedFamily)) return null;
    return clone(versionedFamily.extensions[MIGRATION_EXTENSION].legacySnapshot, null);
  }

  const currentApi = isRecord(global.AleriaFamily) ? global.AleriaFamily : {};
  global.AleriaFamily = Object.freeze({
    apiVersion: currentApi.apiVersion || 1,
    schema: currentApi.schema || 'aleria.family',
    schemaVersion: currentApi.schemaVersion || 2,
    ...currentApi,
    migration: Object.freeze({
      extension: MIGRATION_EXTENSION,
      canMigrate,
      migrate,
      canRestore,
      restore
    })
  });
})(globalThis);
