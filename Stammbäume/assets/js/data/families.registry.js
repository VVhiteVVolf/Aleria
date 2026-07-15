import {
  HOUSE_DRAIG_FAMILY,
  HOUSE_GAFYR_FAMILY,
  HOUSE_SAETHWYR_FAMILY,
  HOUSE_WYRM_FAMILY
} from './blank-house-families.js';
import { HOUSE_ARWYDD_FAMILY } from './house-arwydd-family.js';

export const RETIRED_FAMILY_IDS = Object.freeze(['haus-vael', 'haus-sgrechwyr']);

const ARWYDD_PATH = Object.freeze(['Cenyr', 'Celtigerns Wacht', 'Rhonwens Tränen', 'Castellbryn']);
const GWYNTHOR_PATH = Object.freeze(['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor']);

function hierarchyFor(path, familyId, familyTitle) {
  const levels = ['kingdom', 'county', 'barony', 'holding'];
  return Object.freeze([
    ...path.map((title, index) => Object.freeze({
      level: levels[index] || 'folder',
      slug: title.toLocaleLowerCase('de').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      title
    })),
    Object.freeze({ level: 'family', slug: familyId, title: familyTitle })
  ]);
}

function familyRecord({ id, title, family, folderPath, type = 'dynasty' }) {
  return Object.freeze({
    id,
    title,
    status: 'active',
    type,
    folderPath,
    hierarchy: hierarchyFor(folderPath, id, title),
    link: `index.html?family=${encodeURIComponent(id)}&mode=view`,
    family
  });
}

export const FAMILY_REGISTRY = Object.freeze([
  familyRecord({
    id: 'haus-arwydd',
    title: 'Haus Arwydd',
    family: HOUSE_ARWYDD_FAMILY,
    folderPath: ARWYDD_PATH
  }),
  familyRecord({
    id: 'haus-draig',
    title: 'Haus Draig',
    family: HOUSE_DRAIG_FAMILY,
    folderPath: GWYNTHOR_PATH
  }),
  familyRecord({
    id: 'haus-wyrm',
    title: 'Haus Wyrm',
    family: HOUSE_WYRM_FAMILY,
    folderPath: GWYNTHOR_PATH
  }),
  familyRecord({
    id: 'haus-saethwyr',
    title: 'Haus Saethwyr',
    family: HOUSE_SAETHWYR_FAMILY,
    folderPath: GWYNTHOR_PATH
  }),
  familyRecord({
    id: 'haus-gafyr',
    title: 'Haus Gafyr',
    family: HOUSE_GAFYR_FAMILY,
    folderPath: GWYNTHOR_PATH
  })
]);

export function getRegisteredFamily(familyId) {
  return FAMILY_REGISTRY.find(record => record.id === familyId) || null;
}
