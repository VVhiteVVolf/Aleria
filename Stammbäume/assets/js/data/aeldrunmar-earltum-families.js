import beranSource from '../../data/family-sources/aeldrunmar/beran.json' with { type: 'json' };
import earncynneSource from '../../data/family-sources/aeldrunmar/earncynne.json' with { type: 'json' };
import estmereSource from '../../data/family-sources/aeldrunmar/estmere.json' with { type: 'json' };
import fryeSource from '../../data/family-sources/aeldrunmar/frye.json' with { type: 'json' };
import seolforSource from '../../data/family-sources/aeldrunmar/seolfor.json' with { type: 'json' };
import { prepareAeldrunmarExportFamily } from './aeldrunmar-export-family.js';
import {
  AELDRUNMAR_HOUSE_EMBLEMS,
  AELDRUNMAR_HOUSE_PROFILES
} from './aeldrunmar-house-profiles.js';

const HOUSE_IDS = Object.freeze({
  baldreska: 'house-baldreska',
  beran: 'house-beran',
  earncynne: 'house-earncynne',
  estmere: 'house-estmere',
  frye: 'house-frye',
  kendryck: 'house-kendryck',
  pysgod: 'house-pysgod',
  seolfor: 'house-seolfor',
  tharn: 'house-tharn'
});

const EXTERNAL_HOUSES = Object.freeze({
  baldreska: {
    id: HOUSE_IDS.baldreska,
    name: 'Königshaus Baldreska',
    emblem: ''
  },
  beran: {
    id: HOUSE_IDS.beran,
    name: 'Haus Beran',
    emblem: AELDRUNMAR_HOUSE_EMBLEMS.beran
  },
  earncynne: {
    id: HOUSE_IDS.earncynne,
    name: 'Haus Earncynne',
    emblem: AELDRUNMAR_HOUSE_EMBLEMS.earncynne
  },
  estmere: {
    id: HOUSE_IDS.estmere,
    name: 'Haus Estmere',
    emblem: AELDRUNMAR_HOUSE_EMBLEMS.estmere
  },
  frye: {
    id: HOUSE_IDS.frye,
    name: 'Haus Frye',
    emblem: AELDRUNMAR_HOUSE_EMBLEMS.frye
  },
  kendryck: {
    id: HOUSE_IDS.kendryck,
    name: 'Haus Kendryck',
    emblem: AELDRUNMAR_HOUSE_EMBLEMS.kendryck
  },
  pysgod: {
    id: HOUSE_IDS.pysgod,
    name: 'Haus Pysgod',
    emblem: 'assets/images/houses/Graue Weite/haus-pysgod.png'
  },
  seolfor: {
    id: HOUSE_IDS.seolfor,
    name: 'Haus Seolfor',
    emblem: AELDRUNMAR_HOUSE_EMBLEMS.seolfor
  },
  tharn: {
    id: HOUSE_IDS.tharn,
    name: 'Haus Tharn',
    emblem: 'assets/images/houses/Aeldrunmar/haus-tharn.png'
  }
});

const managedExtensions = (fields) => ({ registryManagedFields: fields });

const createPerson = ({
  id,
  worldPersonId,
  name,
  title = '',
  sex,
  birth = '',
  death = '',
  houseId,
  familyRole = 'married',
  lineageRole = 'branch',
  notes = ''
}) => ({
  id,
  worldPersonId,
  name,
  title,
  sex,
  status: death ? 'dead' : 'alive',
  birth,
  death,
  portrait: '',
  portraitPlaceholder: 'auto',
  houseId,
  familyRole,
  lineageRole,
  tags: [],
  notes,
  extensions: managedExtensions([
    'worldPersonId',
    'name',
    'title',
    'sex',
    'status',
    'birth',
    'death',
    'portrait',
    'portraitPlaceholder',
    'houseId',
    'familyRole',
    'lineageRole',
    'tags',
    'notes'
  ])
});

const createPartnership = ({ id, participantIds, type = 'marriage', status = 'active' }) => ({
  id,
  participantIds,
  type,
  status,
  start: '',
  end: '',
  certainty: 'confirmed',
  visibility: status === 'secret' ? 'secret' : 'public',
  notes: '',
  extensions: {}
});

const createMarriedAwayBranch = ({ id, name, partnershipId, targetFamilyId, emblem }) => ({
  id,
  name,
  subtitle: `Wegverheiratet an ${name}`,
  linkType: 'married-away',
  parentPartnershipId: partnershipId,
  parentPersonId: '',
  houseId: '',
  emblem,
  emblemScale: 0.86,
  crestFrame: 'gold',
  frameScale: 1,
  founded: '',
  targetFamilyId,
  notes: '',
  extensions: {}
});

const baseConfig = ({ slug, title, houseProfile, crestSubtitle }) => ({
  familyId: `haus-${slug}`,
  title,
  description: `Vollständiger Registerstammbaum des ${title} in Aeldrunmar.`,
  house: {
    id: `house-${slug}`,
    name: title,
    emblem: AELDRUNMAR_HOUSE_EMBLEMS[slug]
  },
  houseProfile,
  crestSubtitle,
  sourceRevision: 1,
  sourceNote: `Aus dem manuellen Export ${slug}.json übernommen und für das Aeldrunmar-Register bereinigt.`
});

const fryeConfig = {
  ...baseConfig({
    slug: 'frye',
    title: 'Haus Frye',
    houseProfile: AELDRUNMAR_HOUSE_PROFILES.frye,
    crestSubtitle: 'Earltumshaus im Jarltum der Fyr'
  }),
  externalHouses: [
    EXTERNAL_HOUSES.tharn,
    EXTERNAL_HOUSES.estmere,
    EXTERNAL_HOUSES.seolfor,
    EXTERNAL_HOUSES.beran,
    EXTERNAL_HOUSES.baldreska
  ],
  partnershipIdMap: {
    'partnership-3dc30d20': 'marriage-aethelstan-birna-frye-estmere',
    'partnership-9adb25ad': 'marriage-rowena-saewine-frye-seolfor',
    'partnership-465499fd': 'marriage-ceolwynne-cole-frye-beran'
  },
  personPatches: {
    'person-597d28a5': { houseId: HOUSE_IDS.tharn },
    'person-5aaaf1e5': {
      houseId: HOUSE_IDS.estmere,
      worldPersonId: 'person--haus-estmere--person-225e2567'
    },
    'person-a97f5905': {
      name: 'Walhyld Saewine Seolfor',
      birth: '1694',
      death: '1726',
      status: 'dead',
      houseId: HOUSE_IDS.seolfor,
      worldPersonId: 'person--haus-seolfor--person-0e1d5c6c'
    },
    'person-f4667753': {
      name: 'Æthelmaer Cole Beran',
      houseId: HOUSE_IDS.beran,
      worldPersonId: 'person--haus-beran--person-ee3d9ccb'
    },
    'person-2f26da70': { houseId: HOUSE_IDS.baldreska },
    'person-f53a01d0': { title: 'Tochter Æthelmars' },
    'person-d05d2f84': { title: 'Tochter Æthelnoths' }
  },
  cadetBranchPatches: {
    'cadet-branch-3e1b2b9e': {
      name: 'Haus Tharn',
      targetFamilyId: 'haus-tharn',
      subtitle: 'Wegverheiratet an Haus Tharn'
    },
    'cadet-branch-6019987c': {
      name: 'Haus Beran',
      targetFamilyId: 'haus-beran',
      emblem: AELDRUNMAR_HOUSE_EMBLEMS.beran,
      subtitle: 'Wegverheiratet an Haus Beran'
    }
  },
  extraCadetBranches: [
    createMarriedAwayBranch({
      id: 'married-away-rowena-frye-seolfor',
      name: 'Haus Seolfor',
      partnershipId: 'marriage-rowena-saewine-frye-seolfor',
      targetFamilyId: 'haus-seolfor',
      emblem: AELDRUNMAR_HOUSE_EMBLEMS.seolfor
    })
  ]
};

const estmereConfig = {
  ...baseConfig({
    slug: 'estmere',
    title: 'Haus Estmere',
    houseProfile: AELDRUNMAR_HOUSE_PROFILES.estmere,
    crestSubtitle: 'Earltumshaus im Jarltum der Estmere'
  }),
  externalHouses: [
    EXTERNAL_HOUSES.tharn,
    EXTERNAL_HOUSES.frye,
    EXTERNAL_HOUSES.earncynne,
    EXTERNAL_HOUSES.pysgod,
    EXTERNAL_HOUSES.baldreska
  ],
  partnershipIdMap: {
    'partnership-1909e7d2': 'marriage-aethelstan-birna-frye-estmere',
    'partnership-fed4d3ca': 'marriage-ymma-finnegan-estmere-earncynne',
    'partnership-bb31d190': 'marriage-aethelbeth-eskill-estmere-pysgod'
  },
  personPatches: {
    'person-6a80c3f2': { houseId: HOUSE_IDS.tharn },
    'person-8a7adf2b': { houseId: HOUSE_IDS.tharn },
    'person-c2386f90': {
      houseId: HOUSE_IDS.frye,
      worldPersonId: 'person--haus-frye--person-244ec1e6'
    },
    'person-f710c562': {
      houseId: HOUSE_IDS.earncynne,
      worldPersonId: 'person--haus-earncynne--person-ed5dfb3c'
    },
    'person-c5496cf7': {
      birth: '',
      houseId: HOUSE_IDS.pysgod,
      worldPersonId: 'person--haus-pysgod--eskill-pysgod'
    },
    'person-1334198a': {
      worldPersonId: 'person--haus-estmere--aethelbeth-estmere'
    },
    'person-e297b4e2': { houseId: HOUSE_IDS.baldreska }
  },
  cadetBranchPatches: {
    'cadet-branch-32a0daf1': {
      name: 'Haus Pysgod',
      targetFamilyId: 'haus-pysgod',
      emblem: EXTERNAL_HOUSES.pysgod.emblem,
      subtitle: 'Wegverheiratet an Haus Pysgod'
    },
    'cadet-branch-a14a1492': {
      name: 'Haus Tharn',
      targetFamilyId: 'haus-tharn',
      subtitle: 'Wegverheiratet an Haus Tharn'
    },
    'cadet-branch-c6e954fe': {
      name: 'Haus Frye',
      targetFamilyId: 'haus-frye',
      emblem: AELDRUNMAR_HOUSE_EMBLEMS.frye,
      subtitle: 'Wegverheiratet an Haus Frye'
    },
    'cadet-branch-cc4c67d1': {
      name: 'Haus Earncynne',
      targetFamilyId: 'haus-earncynne',
      emblem: AELDRUNMAR_HOUSE_EMBLEMS.earncynne,
      subtitle: 'Wegverheiratet an Haus Earncynne'
    }
  }
};

const earncynneConfig = {
  ...baseConfig({
    slug: 'earncynne',
    title: 'Haus Earncynne',
    houseProfile: AELDRUNMAR_HOUSE_PROFILES.earncynne,
    crestSubtitle: 'Earltumshaus im Jarltum der Earncynne'
  }),
  externalHouses: [EXTERNAL_HOUSES.estmere],
  partnershipIdMap: {
    'partnership-6679d247': 'marriage-ymma-finnegan-estmere-earncynne'
  },
  personPatches: {
    'person-baf31942': {
      name: 'Æthelmae Ymma Estmere',
      houseId: HOUSE_IDS.estmere,
      worldPersonId: 'person--haus-estmere--person-39db003b'
    }
  }
};

const beranConfig = {
  ...baseConfig({
    slug: 'beran',
    title: 'Haus Beran',
    houseProfile: AELDRUNMAR_HOUSE_PROFILES.beran,
    crestSubtitle: 'Earltumshaus im Jarltum der Beran'
  }),
  externalHouses: [EXTERNAL_HOUSES.frye],
  partnershipIdMap: {
    'partnership-cec21da4': 'marriage-ceolwynne-cole-frye-beran'
  },
  personPatches: {
    'person-a95bd3c5': {
      name: 'Ætheloslafa Ceolwynne Frye',
      houseId: HOUSE_IDS.frye,
      worldPersonId: 'person--haus-frye--person-6ae03c39'
    }
  },
  parentagePatches: {
    'parentage-ed585a18': {
      partnershipId: 'union-a760-a55-beran'
    }
  },
  extraPartnerships: [
    createPartnership({
      id: 'union-a760-a55-beran',
      participantIds: ['person-a760bfc0', 'person-a55d2d31'],
      type: 'union'
    })
  ]
};

const seolforConfig = {
  ...baseConfig({
    slug: 'seolfor',
    title: 'Haus Seolfor',
    houseProfile: AELDRUNMAR_HOUSE_PROFILES.seolfor,
    crestSubtitle: 'Thainschaft der Seolfor im Königlichen Jarltum der Kendryck'
  }),
  externalHouses: [EXTERNAL_HOUSES.frye, EXTERNAL_HOUSES.kendryck],
  removeCadetBranchIds: ['cadet-branch-4242edd9'],
  partnershipIdMap: {
    'partnership-05331b0c': 'marriage-rowena-saewine-frye-seolfor'
  },
  personPatches: {
    'person-9f2951d2': {
      name: 'Ætheldawn Rowena Frye',
      houseId: HOUSE_IDS.frye,
      worldPersonId: 'person--haus-frye--person-05c7b54f'
    }
  },
  extraPersons: [
    createPerson({
      id: 'person-322c0257',
      worldPersonId: 'person--haus-kendryck--person-322c0257',
      name: 'Coelwulf Wulfgar Kendryck',
      title: 'König von Aeldrunmar',
      sex: 'male',
      birth: '1693',
      houseId: HOUSE_IDS.kendryck
    })
  ],
  extraPartnerships: [
    createPartnership({
      id: 'marriage-coelwulf-walmaris-kendryck-seolfor',
      participantIds: ['person-659f30e1', 'person-322c0257']
    })
  ],
  extraCadetBranches: [
    createMarriedAwayBranch({
      id: 'married-away-walmaris-seolfor-kendryck',
      name: 'Haus Kendryck',
      partnershipId: 'marriage-coelwulf-walmaris-kendryck-seolfor',
      targetFamilyId: 'haus-kendryck',
      emblem: AELDRUNMAR_HOUSE_EMBLEMS.kendryck
    })
  ]
};

export const HOUSE_FRYE_FAMILY = prepareAeldrunmarExportFamily(fryeSource, fryeConfig);
export const HOUSE_ESTMERE_FAMILY = prepareAeldrunmarExportFamily(estmereSource, estmereConfig);
export const HOUSE_EARNCYNNE_FAMILY = prepareAeldrunmarExportFamily(
  earncynneSource,
  earncynneConfig
);
export const HOUSE_BERAN_FAMILY = prepareAeldrunmarExportFamily(beranSource, beranConfig);
export const HOUSE_SEOLFOR_FAMILY = prepareAeldrunmarExportFamily(seolforSource, seolforConfig);
