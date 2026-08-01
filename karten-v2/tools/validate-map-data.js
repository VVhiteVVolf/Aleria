#!/usr/bin/env node
// Data validator CLI: checks data/maps/*/registry.json (+layers/locations)
// against the schema in core/validation.js. A single bad map/feature is
// reported, not fatal - mirrors the "never let one bad entry break the
// whole app" rule from the spec. Exits with code 1 if any hard errors were
// found (registry/parent link integrity, missing local asset files),
// matching the old validate-karten-structure.mjs contract.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { validateAll, validateMapDefinition, validateCategory, validatePointFeature } from '../src/core/validation.js';

const ROOT = dirname(fileURLToPath(import.meta.url)).replace(/tools$/, '');
const DATA_DIR = resolve(ROOT, 'data');
const MAPS_DIR = resolve(DATA_DIR, 'maps');
const PUBLIC_DIR = resolve(ROOT, 'public');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function isLocalAsset(path) {
  return !!path && !/^https?:\/\//i.test(path);
}

function checkLocalAsset(label, relativePath, errors) {
  if (!relativePath || !isLocalAsset(relativePath)) return;
  if (!existsSync(resolve(PUBLIC_DIR, relativePath))) {
    errors.push(`${label} "${relativePath}" existiert nicht unter public/.`);
  }
}

function main() {
  let errorCount = 0;
  let warningCount = 0;

  const mapFolders = readdirSync(MAPS_DIR, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  const rawMaps = [];
  const rawLayers = [];
  const rawLocationsByMap = new Map();

  for (const folder of mapFolders) {
    const folderPath = resolve(MAPS_DIR, folder.name);
    const registryPath = resolve(folderPath, 'registry.json');
    if (!existsSync(registryPath)) {
      errorCount += 1;
      console.error(`[maps/${folder.name}] Kein registry.json gefunden.`);
      continue;
    }
    const map = readJson(registryPath);
    if (map.id !== folder.name) {
      errorCount += 1;
      console.error(`[maps/${folder.name}] registry.json id "${map.id}" stimmt nicht mit dem Ordnernamen ueberein.`);
    }
    rawMaps.push(map);

    const layersPath = resolve(folderPath, 'layers.json');
    if (existsSync(layersPath)) {
      rawLayers.push(...(readJson(layersPath).layers || []));
    }
    const locationsPath = resolve(folderPath, 'locations.json');
    if (existsSync(locationsPath)) {
      rawLocationsByMap.set(map.id, readJson(locationsPath).features || []);
    }
  }

  const { valid: validMaps, invalid: invalidMaps } = validateAll(rawMaps, validateMapDefinition);
  for (const { entry, errors } of invalidMaps) {
    errorCount += 1;
    console.error(`[maps/${entry?.id || '?'}] Karte ungueltig: ${errors.join('; ')}`);
  }

  const idSet = new Set();
  for (const map of validMaps) {
    if (idSet.has(map.id)) {
      errorCount += 1;
      console.error(`[maps.json] Doppelte Karten-ID: "${map.id}"`);
    }
    idSet.add(map.id);
  }
  for (const map of validMaps) {
    if (map.parentMapId && !idSet.has(map.parentMapId)) {
      errorCount += 1;
      console.error(`[maps/${map.id}] verweist auf unbekannte parentMapId "${map.parentMapId}".`);
    }
    for (const childId of map.childMapIds || []) {
      if (!idSet.has(childId)) {
        errorCount += 1;
        console.error(`[maps/${map.id}] verweist auf unbekannte childMapId "${childId}".`);
      }
    }
    const assetErrors = [];
    checkLocalAsset('image', map.image, assetErrors);
    checkLocalAsset('regionsImage', map.regionsImage, assetErrors);
    checkLocalAsset('markersImage', map.markersImage, assetErrors);
    checkLocalAsset('rulingHouseCrest', map.rulingHouseCrest, assetErrors);
    checkLocalAsset('rulingHouseBanner', map.rulingHouseBanner, assetErrors);
    for (const message of assetErrors) {
      errorCount += 1;
      console.error(`[maps/${map.id}] ${message}`);
    }
  }

  const categories = readJson(resolve(DATA_DIR, 'categories.json')).categories;
  const { invalid: invalidCategories } = validateAll(categories, validateCategory);
  for (const { entry, errors } of invalidCategories) {
    errorCount += 1;
    console.error(`[categories.json] Kategorie "${entry?.id || '?'}" ungueltig: ${errors.join('; ')}`);
  }

  let locationCount = 0;
  for (const [mapId, features] of rawLocationsByMap) {
    const { invalid } = validateAll(features, validatePointFeature);
    locationCount += features.length;
    for (const { entry, errors } of invalid) {
      errorCount += 1;
      console.error(`[maps/${mapId}/locations.json] Feature "${entry?.id || '?'}" ungueltig: ${errors.join('; ')}`);
    }
  }

  for (const layer of rawLayers) {
    if (!idSet.has(layer.mapId)) {
      warningCount += 1;
      console.warn(`[maps/${layer.mapId}/layers.json] Ebene "${layer.id}" verweist auf unbekannte mapId "${layer.mapId}".`);
    }
    if (layer.type === 'image-overlay') {
      const assetErrors = [];
      checkLocalAsset('image', layer.image, assetErrors);
      for (const message of assetErrors) {
        errorCount += 1;
        console.error(`[maps/${layer.mapId}/layers.json] Ebene "${layer.id}": ${message}`);
      }
    }
  }

  console.log(
    `\nValidierung abgeschlossen: ${validMaps.length}/${rawMaps.length} Karten gueltig, ${categories.length} Kategorien, ${locationCount} Orte, ${rawLayers.length} Ebenen.`,
  );
  console.log(`Errors: ${errorCount}`);
  console.log(`Warnings: ${warningCount}`);

  if (errorCount > 0) process.exit(1);
}

main();
