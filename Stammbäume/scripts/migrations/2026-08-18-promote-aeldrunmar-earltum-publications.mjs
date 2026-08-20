import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createFolderPathFromHouseProfile } from '../../assets/js/domain/house-profile.js';
import {
  HOUSE_BERAN_FAMILY,
  HOUSE_ESTMERE_FAMILY,
  HOUSE_FRYE_FAMILY,
  HOUSE_SEOLFOR_FAMILY
} from '../../assets/js/data/aeldrunmar-earltum-families.js';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '../..');
const DATA_ROOT = path.join(PROJECT_ROOT, 'assets/data/published-families');
const REGISTRY_PATH = path.join(DATA_ROOT, 'registry.json');
const MIGRATION_TAG = 'pre-canonical-id-20260818';

const migrations = Object.freeze([
  Object.freeze({ legacyId: 'beran', family: HOUSE_BERAN_FAMILY }),
  Object.freeze({ legacyId: 'estmere', family: HOUSE_ESTMERE_FAMILY }),
  Object.freeze({ legacyId: 'frye', family: HOUSE_FRYE_FAMILY }),
  Object.freeze({ legacyId: 'seolfor', family: HOUSE_SEOLFOR_FAMILY })
]);

function publicationEnvelope(family, legacyEnvelope) {
  return {
    schemaVersion: 1,
    familyId: family.document.id,
    revision: Math.max(1, Number(legacyEnvelope.revision || 1)),
    updatedAt: String(legacyEnvelope.updatedAt || ''),
    family
  };
}

function registryEntry(family, legacyEnvelope) {
  const primaryHouse = family.houses.find(house => house.id === family.lineage.houseId)
    || family.houses[0];
  return {
    id: family.document.id,
    familyId: family.document.id,
    title: family.document.title,
    motto: family.document.motto || '',
    emblem: family.document.emblem || primaryHouse?.emblem || '',
    folderPath: createFolderPathFromHouseProfile(family.document.houseProfile || {}),
    houseProfile: family.document.houseProfile || {},
    personCount: family.persons.length,
    revision: Math.max(1, Number(legacyEnvelope.revision || 1)),
    updatedAt: String(legacyEnvelope.updatedAt || ''),
    link: `Stammbaum.html?family=${encodeURIComponent(family.document.id)}&mode=view`,
    source: 'github'
  };
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function migratePublication({ legacyId, family }, registryById) {
  const legacyPath = path.join(DATA_ROOT, `${legacyId}.json`);
  const canonicalPath = path.join(DATA_ROOT, `${family.document.id}.json`);
  if (!(await fileExists(legacyPath))) {
    const canonicalEnvelope = await readJson(canonicalPath);
    if (canonicalEnvelope.family?.document?.id !== family.document.id) {
      throw new Error(`Weder Legacy- noch gültige Zielakte für ${legacyId} gefunden.`);
    }
    registryById.delete(legacyId);
    registryById.set(family.document.id, registryEntry(family, canonicalEnvelope));
    return;
  }
  const legacyEnvelope = await readJson(legacyPath);
  if (legacyEnvelope.family?.document?.id !== legacyId) {
    throw new Error(`Die Legacy-Akte ${legacyId} besitzt eine unerwartete Familien-ID.`);
  }

  const backupPath = path.join(DATA_ROOT, 'backups', legacyId, `${MIGRATION_TAG}.json`);
  await writeJson(backupPath, legacyEnvelope);
  await writeJson(canonicalPath, publicationEnvelope(family, legacyEnvelope));
  await fs.rm(legacyPath);

  registryById.delete(legacyId);
  registryById.set(family.document.id, registryEntry(family, legacyEnvelope));
}

const registry = await readJson(REGISTRY_PATH);
const registryById = new Map((registry.families || []).map(record => [
  String(record.familyId || record.id),
  record
]));

for (const migration of migrations) {
  await migratePublication(migration, registryById);
}

await writeJson(REGISTRY_PATH, {
  schemaVersion: 1,
  families: [...registryById.values()]
    .sort((first, second) => String(first.title).localeCompare(String(second.title), 'de'))
});
