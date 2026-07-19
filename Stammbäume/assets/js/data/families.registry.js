import { HOUSE_DRAIG_FAMILY } from './house-draig-family.js';
import { HOUSE_GARRAEL_FAMILY } from './house-garrael-family.js';
import { HOUSE_GWYLLACH_FAMILY } from './house-gwyllach-family.js';
import { HOUSE_SGRECHIWR_FAMILY } from './house-sgrechiwr-family.js';
import { HOUSE_GWEFRYDD_FAMILY } from './house-gwefrydd-family.js';
import { HOUSE_GWYVERN_FAMILY } from './house-gwyvern-family.js';
import { HOUSE_ILLYSYWEN_FAMILY } from './house-illysywen-family.js';
import { HOUSE_ARWYDD_FAMILY } from './house-arwydd-family.js';
import { HOUSE_GAFYR_FAMILY } from './house-gafyr-family.js';
import { HOUSE_WYRM_FAMILY } from './house-wyrm-family.js';
import { HOUSE_SAETHWYR_FAMILY } from './house-saethwyr-family.js';
import { LOWER_KNIGHT_HOUSE_FAMILIES } from './lower-knight-house-families.js';
import { ARTUS_STREBEN_HOUSE_FAMILIES } from './artus-streben-house-families.js';
import { GWENDOLYNS_UFER_HOUSE_FAMILIES } from './gwendolyns-ufer-house-families.js';
import { RHONWENS_TRAENEN_HOUSE_FAMILIES } from './rhonwens-traenen-house-families.js';
import { createFolderPathFromHouseProfile } from '../domain/house-profile.js';

export const RETIRED_FAMILY_IDS = Object.freeze(['haus-vael', 'haus-sgrechwyr']);

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

function familyRecord({ id, title, family, type = 'dynasty' }) {
  const folderPath = Object.freeze(createFolderPathFromHouseProfile(family.document.houseProfile));
  return Object.freeze({
    id,
    title,
    status: 'active',
    type,
    folderPath,
    houseProfile: family.document.houseProfile,
    hierarchy: hierarchyFor(folderPath, id, title),
    link: `Stammbaum.html?family=${encodeURIComponent(id)}&mode=view`,
    family
  });
}

export const FAMILY_REGISTRY = Object.freeze([
  familyRecord({
    id: 'haus-arwydd',
    title: 'Haus Arwydd',
    family: HOUSE_ARWYDD_FAMILY
  }),
  familyRecord({
    id: 'haus-draig',
    title: 'Haus Draig',
    family: HOUSE_DRAIG_FAMILY
  }),
  familyRecord({
    id: 'haus-wyrm',
    title: 'Haus Wyrm',
    family: HOUSE_WYRM_FAMILY
  }),
  familyRecord({
    id: 'haus-saethwyr',
    title: 'Haus Saethwyr',
    family: HOUSE_SAETHWYR_FAMILY
  }),
  familyRecord({
    id: 'haus-gafyr',
    title: 'Haus Gafyr',
    family: HOUSE_GAFYR_FAMILY
  }),
  familyRecord({
    id: 'haus-gwefrydd',
    title: 'Haus Gwefrydd',
    family: HOUSE_GWEFRYDD_FAMILY
  }),
  familyRecord({
    id: 'haus-gwyvern',
    title: 'Haus Gwyvern',
    family: HOUSE_GWYVERN_FAMILY
  }),
  familyRecord({
    id: 'haus-illysywen',
    title: 'Haus Illysywen',
    family: HOUSE_ILLYSYWEN_FAMILY
  }),
  familyRecord({
    id: 'haus-garrael',
    title: 'Haus Garrael',
    family: HOUSE_GARRAEL_FAMILY,
    type: 'lower-nobility'
  }),
  familyRecord({
    id: 'haus-gwyllach',
    title: 'Haus Gwyllach',
    family: HOUSE_GWYLLACH_FAMILY,
    type: 'commoner'
  }),
  familyRecord({
    id: 'haus-sgrechiwr',
    title: 'Haus Sgrechiwr',
    family: HOUSE_SGRECHIWR_FAMILY,
    type: 'commoner'
  }),
  ...LOWER_KNIGHT_HOUSE_FAMILIES.map(family => familyRecord({
    id: family.document.id,
    title: family.document.title,
    family,
    type: 'lower-nobility'
  })),
  ...[
    ...ARTUS_STREBEN_HOUSE_FAMILIES,
    ...GWENDOLYNS_UFER_HOUSE_FAMILIES,
    ...RHONWENS_TRAENEN_HOUSE_FAMILIES
  ].map(family => familyRecord({
    id: family.document.id,
    title: family.document.title,
    family,
    type: family.document.houseProfile.rankId === 'commoner' ? 'commoner' : 'lower-nobility'
  }))
]);

export function getRegisteredFamily(familyId) {
  return FAMILY_REGISTRY.find(record => record.id === familyId) || null;
}
