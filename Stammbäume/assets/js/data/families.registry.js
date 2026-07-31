import { HOUSE_DRAIG_FAMILY } from './house-draig-family.js';
import { HOUSE_GARRAEL_FAMILY } from './house-garrael-family.js';
import { HOUSE_GWYLLACH_FAMILY } from './house-gwyllach-family.js';
import { HOUSE_SGRECHIWR_FAMILY } from './house-sgrechiwr-family.js';
import { HOUSE_GWEFRYDD_FAMILY } from './house-gwefrydd-family.js';
import { HOUSE_GWYVERN_FAMILY } from './house-gwyvern-family.js';
import { HOUSE_ILLYSYWEN_FAMILY } from './house-illysywen-family.js';
import { HOUSE_ARWYDD_FAMILY } from './house-arwydd-family.js';
import { HOUSE_ARD_CONBHRON_FAMILY } from './house-ard-conbhron-family.js';
import { HOUSE_UI_TALAMH_FAMILY } from './house-ui-talamh-family.js';
import { HOUSE_GAFYR_FAMILY } from './house-gafyr-family.js';
import { HOUSE_WYRM_FAMILY } from './house-wyrm-family.js';
import { HOUSE_SAETHWYR_FAMILY } from './house-saethwyr-family.js';
import { HOUSE_DUBHAN_FAMILY } from './house-dubhan-family.js';
import { HOUSE_DUBHAN_GWYNTHOR_FAMILY } from './house-dubhan-gwynthor-family.js';
import { HOUSE_WOLFSHORN_FAMILY } from './house-wolfshorn-family.js';
import { HOUSE_BLEIDDORN_FAMILY } from './house-bleiddorn-family.js';
import { HOUSE_HOCHREUTH_FAMILY } from './house-hochreuth-family.js';
import { WEISENFLUH_HOUSE_FAMILIES } from './weisenfluh-house-families.js';
import { VENALYS_HOUSE_FAMILIES } from './venalys-house-families.js';
import { MORGORN_HOUSE_FAMILIES } from './morgorn-house-families.js';
import { AELDRUNMAR_HOUSE_FAMILIES } from './aeldrunmar-house-families.js';
import { TALYNDOR_HOUSE_FAMILIES } from './talyndor-house-families.js';
import { CEITHEACH_HOUSE_FAMILIES } from './ceitheach-house-families.js';
import { LOWER_KNIGHT_HOUSE_FAMILIES } from './lower-knight-house-families.js';
import { ARTUS_STREBEN_HOUSE_FAMILIES } from './artus-streben-house-families.js';
import { GWENDOLYNS_UFER_HOUSE_FAMILIES } from './gwendolyns-ufer-house-families.js';
import { GWYNTHOR_COMMONER_HOUSE_FAMILIES } from './gwynthor-commoner-house-families.js';
import { RHONWENS_TRAENEN_HOUSE_FAMILIES } from './rhonwens-traenen-house-families.js';
import { CENYR_COUNTY_HOUSE_FAMILIES } from './cenyr-county-house-families.js';
import {
  SONNENKUESTE_DEPENDENT_HOUSE_FAMILIES,
  SONNENKUESTE_LINKED_LINE_FAMILIES
} from './sonnenkueste-house-families.js';
import { VORTIGERNS_RUH_DEPENDENT_HOUSE_FAMILIES } from './vortigerns-ruh-house-families.js';
import { WEIDEBUCHT_DEPENDENT_HOUSE_FAMILIES } from './weidebucht-house-families.js';
import { AEHRENTAL_DEPENDENT_HOUSE_FAMILIES } from './aehrental-house-families.js';
import { SILBERINSEL_DEPENDENT_HOUSE_FAMILIES } from './silberinsel-house-families.js';
import { TAL_DER_MILANE_DEPENDENT_HOUSE_FAMILIES } from './tal-der-milane-house-families.js';
import {
  GRAUE_WEITE_DEPENDENT_HOUSE_FAMILIES,
  GRAUE_WEITE_ORIGIN_HOUSE_FAMILIES
} from './graue-weite-house-families.js';
import { MOCHDAER_ORIGIN_HOUSE_FAMILIES } from './mochdaer-house-families.js';
import { BLODYN_HOUSE_FAMILIES } from './blodyn-house-families.js';
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

function familyRecord({ id, title, family, type = 'dynasty', listing = 'listed' }) {
  const folderPath = Object.freeze(createFolderPathFromHouseProfile(family.document.houseProfile));
  return Object.freeze({
    id,
    title,
    status: 'active',
    type,
    listing,
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
    id: 'haus-ard-conbhron',
    title: 'Haus Ard Conbhrón',
    family: HOUSE_ARD_CONBHRON_FAMILY
  }),
  familyRecord({
    id: 'haus-ui-talamh',
    title: 'Haus Ui Talamh',
    family: HOUSE_UI_TALAMH_FAMILY
  }),
  familyRecord({
    id: 'haus-garrael',
    title: 'Haus Garrael',
    family: HOUSE_GARRAEL_FAMILY,
    type: 'lower-nobility'
  }),
  familyRecord({
    id: 'haus-dubhan',
    title: 'Clan Dubhan',
    family: HOUSE_DUBHAN_FAMILY,
    type: 'lower-nobility'
  }),
  familyRecord({
    id: 'haus-dubhan-gwynthor',
    title: 'Haus Dubhan',
    family: HOUSE_DUBHAN_GWYNTHOR_FAMILY,
    type: 'lower-nobility'
  }),
  familyRecord({
    id: 'haus-wolfshorn',
    title: 'Clan Wolfshorn',
    family: HOUSE_WOLFSHORN_FAMILY,
    type: 'lower-nobility'
  }),
  familyRecord({
    id: 'haus-bleiddorn',
    title: 'Haus Bleiddorn',
    family: HOUSE_BLEIDDORN_FAMILY,
    type: 'lower-nobility'
  }),
  familyRecord({
    id: 'haus-von-hochreuth',
    title: 'Haus von Hochreuth',
    family: HOUSE_HOCHREUTH_FAMILY,
    type: 'lower-nobility'
  }),
  ...WEISENFLUH_HOUSE_FAMILIES.map(family => familyRecord({
    id: family.document.id,
    title: family.document.title,
    family,
    type: 'lower-nobility'
  })),
  ...VENALYS_HOUSE_FAMILIES.map(family => familyRecord({
    id: family.document.id,
    title: family.document.title,
    family,
    type: 'magnarian'
  })),
  ...MORGORN_HOUSE_FAMILIES.map(family => familyRecord({
    id: family.document.id,
    title: family.document.title,
    family,
    type: 'lower-nobility'
  })),
  ...AELDRUNMAR_HOUSE_FAMILIES.map(family => familyRecord({
    id: family.document.id,
    title: family.document.title,
    family,
    type: 'lower-nobility'
  })),
  ...TALYNDOR_HOUSE_FAMILIES.map(family => familyRecord({
    id: family.document.id,
    title: family.document.title,
    family,
    type: 'lower-nobility'
  })),
  ...CEITHEACH_HOUSE_FAMILIES.map(family => familyRecord({
    id: family.document.id,
    title: family.document.title,
    family,
    type: 'commoner'
  })),
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
  ...GWYNTHOR_COMMONER_HOUSE_FAMILIES.map(family => familyRecord({
    id: family.document.id,
    title: family.document.title,
    family,
    type: 'commoner'
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
  })),
  ...CENYR_COUNTY_HOUSE_FAMILIES.map(family => familyRecord({
    id: family.document.id,
    title: family.document.title,
    family
  })),
  ...SONNENKUESTE_DEPENDENT_HOUSE_FAMILIES.map(family => familyRecord({
    id: family.document.id,
    title: family.document.title,
    family,
    type: family.document.houseProfile.rankId === 'commoner'
      ? 'commoner'
      : family.document.houseProfile.rankId === 'knight'
        ? 'lower-nobility'
        : 'dynasty'
  })),
  ...SONNENKUESTE_LINKED_LINE_FAMILIES.map(family => familyRecord({
    id: family.document.id,
    title: family.document.title,
    family,
    type: 'dynasty',
    listing: 'linked-only'
  })),
  ...VORTIGERNS_RUH_DEPENDENT_HOUSE_FAMILIES.map(family => familyRecord({
    id: family.document.id,
    title: family.document.title,
    family,
    type: family.document.houseProfile.rankId === 'commoner'
      ? 'commoner'
      : family.document.houseProfile.rankId === 'knight'
        ? 'lower-nobility'
        : 'dynasty'
  })),
  ...WEIDEBUCHT_DEPENDENT_HOUSE_FAMILIES.map(family => familyRecord({
    id: family.document.id,
    title: family.document.title,
    family,
    type: family.document.houseProfile.rankId === 'commoner'
      ? 'commoner'
      : family.document.houseProfile.rankId === 'knight'
        ? 'lower-nobility'
        : 'dynasty'
  })),
  ...AEHRENTAL_DEPENDENT_HOUSE_FAMILIES.map(family => familyRecord({
    id: family.document.id,
    title: family.document.title,
    family,
    type: family.document.houseProfile.rankId === 'commoner'
      ? 'commoner'
      : family.document.houseProfile.rankId === 'knight'
        ? 'lower-nobility'
        : 'dynasty'
  })),
  ...SILBERINSEL_DEPENDENT_HOUSE_FAMILIES.map(family => familyRecord({
    id: family.document.id,
    title: family.document.title,
    family,
    type: family.document.houseProfile.rankId === 'commoner'
      ? 'commoner'
      : family.document.houseProfile.rankId === 'knight'
        ? 'lower-nobility'
        : 'dynasty'
  })),
  ...TAL_DER_MILANE_DEPENDENT_HOUSE_FAMILIES.map(family => familyRecord({
    id: family.document.id,
    title: family.document.title,
    family,
    type: family.document.houseProfile.rankId === 'commoner'
      ? 'commoner'
      : family.document.houseProfile.rankId === 'knight'
        ? 'lower-nobility'
        : 'dynasty'
  })),
  ...GRAUE_WEITE_DEPENDENT_HOUSE_FAMILIES.map(family => familyRecord({
    id: family.document.id,
    title: family.document.title,
    family,
    type: family.document.houseProfile.rankId === 'knight'
      ? 'lower-nobility'
      : 'dynasty'
  })),
  ...GRAUE_WEITE_ORIGIN_HOUSE_FAMILIES.map(family => familyRecord({
    id: family.document.id,
    title: family.document.title,
    family,
    type: 'dynasty'
  })),
  ...MOCHDAER_ORIGIN_HOUSE_FAMILIES.map(family => familyRecord({
    id: family.document.id,
    title: family.document.title,
    family,
    type: 'dynasty'
  })),
  ...BLODYN_HOUSE_FAMILIES.map(family => familyRecord({
    id: family.document.id,
    title: family.document.title,
    family
  }))
]);

export function getRegisteredFamily(familyId) {
  return FAMILY_REGISTRY.find(record => record.id === familyId) || null;
}
