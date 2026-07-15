// Public entry point for the versioned Aleria family feature.

(function initializeAleriaFamilyApi(global) {
  'use strict';

  const current = global.AleriaFamily;
  if (current && typeof current === 'object') return;

  global.AleriaFamily = Object.freeze({
    apiVersion: 1,
    schema: 'aleria.family',
    schemaVersion: 2,
    adapters: Object.freeze({})
  });
})(globalThis);
