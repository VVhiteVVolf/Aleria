import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const REGISTRY_FILE = path.join(ROOT, "tafeln.registry.js");
const SHELL_FILE = path.join(ROOT, "tafel.html");
const VALID_STATUSES = new Set(["active", "planned", "archived"]);
const VALID_TYPES = new Set(["kingdom", "county", "barony", "lordship", "settlement", "city", "local"]);
const REQUIRED_IMAGE_KEYS = ["board", "marker"];

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
    reportError(`Path escapes Anzeigetafeln root: ${relativePath}`);
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
    reportError("Missing tafeln.registry.js");
    return [];
  }

  const source = fs.readFileSync(REGISTRY_FILE, "utf8");
  const context = {
    window: {},
    encodeURIComponent,
  };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: REGISTRY_FILE });

  const registry = context.window.TAFEL_REGISTRY;
  if (!Array.isArray(registry)) {
    reportError("window.TAFEL_REGISTRY must be an array");
    return [];
  }

  return registry;
}

function validateTafelShape(tafel, index) {
  const label = tafel?.id || `entry #${index + 1}`;

  if (!tafel || typeof tafel !== "object") {
    reportError(`Registry entry #${index + 1} is not an object`);
    return;
  }

  if (!tafel.id || typeof tafel.id !== "string") reportError(`${label}: missing id`);
  if (tafel.id && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tafel.id)) {
    reportError(`${label}: id must use lowercase slug format`);
  }

  if (!tafel.title || typeof tafel.title !== "string") reportError(`${label}: missing title`);
  if (!VALID_STATUSES.has(tafel.status)) reportError(`${label}: invalid status "${tafel.status}"`);
  if (!VALID_TYPES.has(tafel.type)) reportError(`${label}: invalid type "${tafel.type}"`);

  if (!Array.isArray(tafel.hierarchy) || !tafel.hierarchy.length) {
    reportError(`${label}: hierarchy must contain at least one level`);
  } else {
    tafel.hierarchy.forEach((level, levelIndex) => {
      if (!level.level || !level.slug || !level.title) {
        reportError(`${label}: hierarchy level #${levelIndex + 1} needs level, slug and title`);
      }
      if (level.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(level.slug)) {
        reportError(`${label}: hierarchy slug "${level.slug}" must use lowercase slug format`);
      }
    });
  }

  const expectedLink = `tafel.html?tafel=${tafel.id}`;
  if (tafel.link !== expectedLink) {
    reportError(`${label}: link must be "${expectedLink}"`);
  }

  if (tafel.legacyLink && !fileExists(tafel.legacyLink)) {
    reportError(`${label}: legacyLink not found: ${tafel.legacyLink}`);
  }
}

function validateActiveTafel(tafel) {
  const label = tafel.id;

  if (tafel.folder && !fileExists(tafel.folder)) reportWarning(`${label}: folder not found yet: ${tafel.folder}`);
  if (tafel.config && !fileExists(tafel.config)) reportError(`${label}: config not found: ${tafel.config}`);

  if (!tafel.firebase?.docId) {
    reportError(`${label}: active tafel needs firebase.docId`);
  } else if (tafel.firebase.docId !== tafel.id) {
    reportWarning(`${label}: firebase.docId differs from tafel id`);
  }

  if (!tafel.images || typeof tafel.images !== "object") {
    reportError(`${label}: active tafel needs images object`);
    return;
  }

  REQUIRED_IMAGE_KEYS.forEach((key) => {
    const imagePath = tafel.images[key];
    if (!imagePath) {
      reportError(`${label}: missing image "${key}"`);
      return;
    }
    if (isExternalUrl(imagePath)) return;
    if (!fileExists(imagePath)) reportError(`${label}: image "${key}" not found: ${imagePath}`);
  });
}

function validatePlannedTafel(tafel) {
  const label = tafel.id;

  if (tafel.editableDraft && !tafel.firebase?.docId) {
    reportError(`${label}: editable draft needs firebase.docId`);
  }
  if (tafel.editableDraft && tafel.firebase?.docId !== tafel.id) {
    reportWarning(`${label}: editable draft firebase.docId differs from tafel id`);
  }
  if (tafel.config) {
    reportWarning(`${label}: planned tafel already has config; consider switching to active when assets are ready`);
  }
  if (tafel.images) {
    reportWarning(`${label}: planned tafel already has images; consider switching to active when complete`);
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
  if (!fs.existsSync(SHELL_FILE)) {
    reportError("Missing central shell: tafel.html");
  }

  const registry = readRegistry();
  const ids = new Map();
  const docIds = new Map();

  registry.forEach((tafel, index) => {
    validateTafelShape(tafel, index);
    if (!tafel?.id) return;

    if (ids.has(tafel.id)) reportError(`Duplicate tafel id: ${tafel.id}`);
    ids.set(tafel.id, tafel);

    const docId = tafel.firebase?.docId;
    if (docId) {
      if (docIds.has(docId)) reportError(`Duplicate firebase.docId: ${docId}`);
      docIds.set(docId, tafel.id);
    }

    if (tafel.status === "active") validateActiveTafel(tafel);
    if (tafel.status === "planned") validatePlannedTafel(tafel);
  });

  validateDuplicateImages();

  return registry;
}

const registry = validateRegistry();

console.log("Anzeigetafeln registry validation");
console.log(`Root: ${ROOT}`);
console.log(`Tafeln: ${registry.length}`);
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
