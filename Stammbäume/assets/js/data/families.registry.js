import { SAMPLE_CADET_FAMILY } from './sample-cadet-family.js';
import { SAMPLE_FAMILY } from './sample-family.js';
import { HOUSE_ARWYDD_FAMILY } from './house-arwydd-family.js';

export const FAMILY_REGISTRY = Object.freeze([
  Object.freeze({
    id: 'haus-vael',
    title: 'Haus Vael',
    status: 'active',
    type: 'dynasty',
    folderPath: Object.freeze(['Cenyr', 'Celtigerns Wacht', 'Llamrais Ankunft', 'Haus Vael']),
    hierarchy: Object.freeze([
      Object.freeze({ level: 'kingdom', slug: 'cenyr', title: 'Cenyr' }),
      Object.freeze({ level: 'county', slug: 'celtigerns-wacht', title: 'Celtigerns Wacht' }),
      Object.freeze({ level: 'barony', slug: 'llamrais-ankunft', title: 'Llamrais Ankunft' }),
      Object.freeze({ level: 'family', slug: 'haus-vael', title: 'Haus Vael' })
    ]),
    link: 'index.html?family=haus-vael&mode=view',
    family: SAMPLE_FAMILY
  }),
  Object.freeze({
    id: 'haus-arwydd',
    title: 'Haus Arwydd',
    status: 'active',
    type: 'dynasty',
    folderPath: Object.freeze(['Cenyr', 'Haus Arwydd']),
    hierarchy: Object.freeze([
      Object.freeze({ level: 'kingdom', slug: 'cenyr', title: 'Cenyr' }),
      Object.freeze({ level: 'family', slug: 'haus-arwydd', title: 'Haus Arwydd' })
    ]),
    link: 'index.html?family=haus-arwydd&mode=view',
    family: HOUSE_ARWYDD_FAMILY
  }),
  Object.freeze({
    id: 'haus-sgrechwyr',
    title: 'Haus Sgrechwyr',
    status: 'active',
    type: 'cadet-house',
    folderPath: Object.freeze(['Cenyr', 'Celtigerns Wacht', 'Llamrais Ankunft', 'Haus Sgrechwyr']),
    hierarchy: Object.freeze([
      Object.freeze({ level: 'kingdom', slug: 'cenyr', title: 'Cenyr' }),
      Object.freeze({ level: 'county', slug: 'celtigerns-wacht', title: 'Celtigerns Wacht' }),
      Object.freeze({ level: 'barony', slug: 'llamrais-ankunft', title: 'Llamrais Ankunft' }),
      Object.freeze({ level: 'family', slug: 'haus-sgrechwyr', title: 'Haus Sgrechwyr' })
    ]),
    link: 'index.html?family=haus-sgrechwyr&mode=view',
    family: SAMPLE_CADET_FAMILY
  })
]);

export function getRegisteredFamily(familyId) {
  return FAMILY_REGISTRY.find(record => record.id === familyId) || null;
}
