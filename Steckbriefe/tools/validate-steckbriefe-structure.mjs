import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve("Steckbriefe");
const registryPath = path.join(root, "steckbriefe.registry.js");
const baseDataPath = path.join(root, "data", "steckbrief-vorlage.data.js");

const errors = [];
const warnings = [];

const registry = loadRegistry();
const seenIds = new Set();
const seenSlugs = new Set();

for (const entry of registry) {
  validateEntry(entry);
}

console.log("Steckbriefe registry validation");
console.log(`Root: ${root}`);
console.log(`Profiles: ${registry.length}`);
console.log(`Errors: ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);

for (const warning of warnings) console.warn(`WARN: ${warning}`);
for (const error of errors) console.error(`ERROR: ${error}`);

if (errors.length) process.exit(1);

function loadRegistry() {
  if (!fs.existsSync(registryPath)) {
    errors.push("Missing steckbriefe.registry.js");
    return [];
  }
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(registryPath, "utf8"), context, { filename: registryPath });
  const value = context.window.STECKBRIEF_REGISTRY;
  if (!Array.isArray(value)) {
    errors.push("window.STECKBRIEF_REGISTRY must be an array");
    return [];
  }
  return value;
}

function validateEntry(entry) {
  if (!entry || typeof entry !== "object") {
    errors.push("Registry entry must be an object");
    return;
  }

  if (!entry.id) errors.push("Registry entry is missing id");
  if (!entry.slug) errors.push(`${entry.id || "unknown"} is missing slug`);
  if (!entry.name) errors.push(`${entry.id || "unknown"} is missing name`);
  if (!entry.data) errors.push(`${entry.id || "unknown"} is missing data path`);
  if (!Array.isArray(entry.hierarchy) || !entry.hierarchy.length) {
    errors.push(`${entry.id || "unknown"} is missing hierarchy`);
  }

  if (entry.id) {
    if (seenIds.has(entry.id)) errors.push(`Duplicate id: ${entry.id}`);
    seenIds.add(entry.id);
  }

  if (entry.slug) {
    if (seenSlugs.has(entry.slug)) warnings.push(`Duplicate slug: ${entry.slug}`);
    seenSlugs.add(entry.slug);
  }

  if (entry.data) {
    const dataPath = resolveRegistryPath(entry.data);
    if (!fs.existsSync(dataPath)) {
      errors.push(`${entry.id || entry.name}: data file does not exist: ${entry.data}`);
      return;
    }
    validateDataFile(entry, dataPath);
  }

  if (entry.legacyHtml) {
    const legacyPath = resolveRegistryPath(entry.legacyHtml);
    if (!fs.existsSync(legacyPath)) warnings.push(`${entry.id}: legacyHtml not found: ${entry.legacyHtml}`);
  }
}

function validateDataFile(entry, dataPath) {
  if (!fs.existsSync(baseDataPath)) {
    errors.push("Missing base data file: data/steckbrief-vorlage.data.js");
    return;
  }
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(baseDataPath, "utf8"), context, { filename: baseDataPath });
  vm.runInContext(fs.readFileSync(dataPath, "utf8"), context, { filename: dataPath });

  const data = context.window.STECKBRIEF_DATA;
  if (!data || typeof data !== "object") {
    errors.push(`${entry.id}: data file did not set window.STECKBRIEF_DATA`);
    return;
  }

  const dataId = data.meta?.id;
  if (!dataId) errors.push(`${entry.id}: data file is missing meta.id`);
  if (dataId && dataId !== entry.id) {
    errors.push(`${entry.id}: registry id does not match data meta.id (${dataId})`);
  }

  const fullName = data.name?.vollstaendig;
  if (!fullName) errors.push(`${entry.id}: data file is missing name.vollstaendig`);
  if (fullName && entry.name && fullName !== entry.name) {
    warnings.push(`${entry.id}: registry name differs from data name (${fullName})`);
  }

  validateSections(entry, data);
}

function validateSections(entry, data) {
  if (!Array.isArray(data.sektionen)) {
    errors.push(`${entry.id}: data file is missing sektionen array`);
    return;
  }

  const groupingIndex = data.sektionen.findIndex((section) => section.id === "gruppierungen" || section.gruppierungen);
  const relationsIndex = data.sektionen.findIndex((section) => section.id === "beziehungen" || section.beziehungsgruppen);

  if (groupingIndex < 0) {
    errors.push(`${entry.id}: data file is missing Gruppierungen section`);
    return;
  }

  const groupingSection = data.sektionen[groupingIndex];
  const groupingTable = groupingSection.gruppierungen;
  if (!groupingTable || typeof groupingTable !== "object") {
    errors.push(`${entry.id}: Gruppierungen section is missing gruppierungen table`);
    return;
  }

  if (!Array.isArray(groupingTable.eintraege)) {
    errors.push(`${entry.id}: Gruppierungen table is missing eintraege array`);
  }

  if (Number(groupingTable.slots || 0) < 5) {
    errors.push(`${entry.id}: Gruppierungen table must provide at least 5 slots`);
  }

  if (relationsIndex >= 0 && groupingIndex > relationsIndex) {
    errors.push(`${entry.id}: Gruppierungen section must be placed before Beziehungen`);
  }
}

function resolveRegistryPath(relativePath) {
  return path.join(root, decodeURIComponent(relativePath).replace(/\//g, path.sep));
}
