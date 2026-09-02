import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const REGISTRY_FILE = path.join(ROOT, "karten.registry.js");
const VALID_STATUSES = new Set(["active", "planned", "archived"]);
const VALID_TYPES = new Set(["kingdom", "county", "barony", "city", "region", "local"]);
const REQUIRED_IMAGE_KEYS = ["normal"];
const OPTIONAL_IMAGE_KEYS = ["regions", "pins"];

const errors = [];
const warnings = [];

function reportError(message) {
  errors.push(message);
}

function reportWarning(message) {
  warnings.push(message);
}

function relPath(filePath) {
  return path.relative(ROOT, filePath).replaceAll(path.sep, "/");
}

function resolveInsideRoot(relativePath) {
  const resolved = path.resolve(ROOT, relativePath);
  if (!resolved.startsWith(ROOT + path.sep) && resolved !== ROOT) {
    reportError(`Path escapes Karten root: ${relativePath}`);
  }
  return resolved;
}

function fileExists(relativePath) {
  return fs.existsSync(resolveInsideRoot(relativePath));
}

function isExternalUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function readRegistry() {
  if (!fs.existsSync(REGISTRY_FILE)) {
    reportError("Missing karten.registry.js");
    return [];
  }

  const source = fs.readFileSync(REGISTRY_FILE, "utf8");
  const context = {
    window: {},
    encodeURIComponent,
  };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: REGISTRY_FILE });

  const registry = context.window.KARTO_MAP_REGISTRY;
  if (!Array.isArray(registry)) {
    reportError("window.KARTO_MAP_REGISTRY must be an array");
    return [];
  }

  return registry;
}

function validateMapShape(map, index) {
  const label = map?.id || `entry #${index + 1}`;

  if (!map || typeof map !== "object") {
    reportError(`Registry entry #${index + 1} is not an object`);
    return;
  }

  if (!map.id || typeof map.id !== "string") reportError(`${label}: missing id`);
  if (map.id && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(map.id)) {
    reportError(`${label}: id must use lowercase slug format`);
  }

  if (!map.title || typeof map.title !== "string") reportError(`${label}: missing title`);
  if (!VALID_STATUSES.has(map.status)) reportError(`${label}: invalid status "${map.status}"`);
  if (!VALID_TYPES.has(map.type)) reportError(`${label}: invalid type "${map.type}"`);

  if (!Array.isArray(map.hierarchy) || !map.hierarchy.length) {
    reportError(`${label}: hierarchy must contain at least one level`);
  } else {
    map.hierarchy.forEach((level, levelIndex) => {
      if (!level.level || !level.slug || !level.title) {
        reportError(`${label}: hierarchy level #${levelIndex + 1} needs level, slug and title`);
      }
      if (level.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(level.slug)) {
        reportError(`${label}: hierarchy slug "${level.slug}" must use lowercase slug format`);
      }
    });
  }

  const expectedLink = `karte.html?map=${map.id}`;
  if (map.link !== expectedLink) {
    reportError(`${label}: link must be "${expectedLink}"`);
  }
}

function validateActiveMap(map) {
  const label = map.id;

  if (map.folder && !fileExists(map.folder)) reportWarning(`${label}: folder not found yet: ${map.folder}`);

  if (map.config && !fileExists(map.config)) reportError(`${label}: config not found: ${map.config}`);

  if (!map.dataPath) {
    reportError(`${label}: active map needs a dataPath`);
  } else if (!fileExists(map.dataPath)) {
    reportError(`${label}: dataPath does not exist: ${map.dataPath}`);
  }

  // karte.html's own boot logic (see the `!selectedMap.config && !selectedMap.images
  // && !selectedMap.editableDraft` check) treats editableDraft as exempt from
  // needing images up front - an active-but-still-empty map is expected to load
  // with placeholder art until images are set via the in-app "Bilder"-Dialog.
  // Pre-existing gap: this validator didn't have that same exemption, so it
  // was already erroring on Llysfaen (status active, editableDraft, images:{})
  // before this pass - fixed here to match actual runtime behaviour.
  if ((!map.images || typeof map.images !== "object" || !Object.keys(map.images).length) && map.editableDraft) {
    return;
  }

  if (!map.images || typeof map.images !== "object") {
    reportError(`${label}: active map needs images object`);
    return;
  }

  REQUIRED_IMAGE_KEYS.forEach((key) => {
    const imagePath = map.images[key];
    if (!imagePath) {
      reportError(`${label}: missing image "${key}"`);
      return;
    }
    if (isExternalUrl(imagePath)) return;
    if (!fileExists(imagePath)) {
      reportError(`${label}: image "${key}" not found: ${imagePath}`);
    }
  });

  OPTIONAL_IMAGE_KEYS.forEach((key) => {
    const imagePath = map.images[key];
    if (!imagePath || isExternalUrl(imagePath)) return;
    if (!fileExists(imagePath)) {
      reportError(`${label}: image "${key}" not found: ${imagePath}`);
    }
  });
}

function validatePlannedMap(map) {
  const label = map.id;

  if (map.editableDraft && !map.dataPath) {
    reportError(`${label}: editable draft needs a dataPath`);
  }
  if (map.editableDraft && map.dataPath && !fileExists(map.dataPath)) {
    reportError(`${label}: editable draft dataPath does not exist: ${map.dataPath}`);
  }
  if (map.config) {
    reportWarning(`${label}: planned map already has config; consider switching to active when assets are ready`);
  }
  if (map.images) {
    reportWarning(`${label}: planned map already has images; consider switching to active when complete`);
  }
}

function collectFiles(dir, predicate, output = []) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(fullPath, predicate, output);
      return;
    }
    if (entry.isFile() && predicate(fullPath)) output.push(fullPath);
  });
  return output;
}

function hashFile(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function validateDuplicateImages() {
  const imageFiles = collectFiles(ROOT, filePath => /\.(png|jpg|jpeg|webp)$/i.test(filePath));
  const byHash = new Map();

  imageFiles.forEach((filePath) => {
    const hash = hashFile(filePath);
    const group = byHash.get(hash) || [];
    group.push(filePath);
    byHash.set(hash, group);
  });

  [...byHash.values()]
    .filter(group => group.length > 1)
    .forEach((group) => {
      reportWarning(`Duplicate image content:\n    ${group.map(relPath).join("\n    ")}`);
    });
}

function validateRegistry() {
  const registry = readRegistry();
  const ids = new Map();

  registry.forEach((map, index) => {
    validateMapShape(map, index);
    if (!map?.id) return;

    if (ids.has(map.id)) reportError(`Duplicate map id: ${map.id}`);
    ids.set(map.id, map);

    if (map.status === "active") validateActiveMap(map);
    if (map.status === "planned") validatePlannedMap(map);
  });

  validateDuplicateImages();

  return registry;
}

const registry = validateRegistry();

console.log("Karten registry validation");
console.log(`Root: ${ROOT}`);
console.log(`Maps: ${registry.length}`);
console.log(`Errors: ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);

if (errors.length) {
  console.log("\nErrors:");
  errors.forEach(message => console.log(`- ${message}`));
}

if (warnings.length) {
  console.log("\nWarnings:");
  warnings.forEach(message => console.log(`- ${message}`));
}

if (errors.length) process.exit(1);
