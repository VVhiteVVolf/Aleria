import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { createFamilyPerson } from './family-record-builders.js';
import { IVARSHEIM_HOUSE_EMBLEMS, IVARSHEIM_HOUSE_PROFILES } from './ivarsheim-house-profiles.js?v=20261103-ivarsheim-v1';

const FAMILY_ID = 'haus-hrafnvald';
const HOUSE_ID = 'house-hrafnvald';
const MOTTO = 'Unser Tor bleibt offen.';
const EMBLEM = IVARSHEIM_HOUSE_EMBLEMS.hrafnvald;

// New authorial commission, 2026-11-03. Torleif is not assigned parents,
// a partner, children or a relationship to Liv.
const torleif = createFamilyPerson({
  id: 'torleif-hrafnvald',
  name: 'Torleif Hrafnvald',
  sex: 'male',
  birth: '1681',
  status: 'alive',
  houseId: HOUSE_ID,
  lineageRole: 'head',
  title: 'Amtierender Clanherr · Huskarl',
  notes: 'Führt den kleinen Huskarlclan Hrafnvald in Ivarsfels unter Clan Wargh. Seine Eltern, Partnerschaften und der Verwandtschaftsweg zu Liv sind nicht festgelegt.'
});

// Exact existing public identity from the Wolfshorn/Bleiddorn records.
// The new origin-clan assignment belongs to this document. No marriage or
// parentage from either protected record is imported or rewritten here.
const liv = createFamilyPerson({
  id: 'liv',
  worldPersonId: 'person--family-tree--liv',
  name: 'Liv',
  title: '',
  sex: 'female',
  status: 'alive',
  birth: '1688',
  death: '',
  portrait: '',
  portraitPlaceholder: 'auto',
  houseId: HOUSE_ID,
  familyRole: 'core',
  lineageRole: 'branch',
  tags: [],
  notes: 'Hrolfs frühere Frau; verließ ihn und kehrte mit einem Teil ihrer Kinder zu ihrem Herkunftsclan Hrafnvald in Ivarsfels zurück. Lebt noch.',
  extensions: {}
});

export const HOUSE_HRAFNVALD_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: Object.freeze({
    id: FAMILY_ID,
    title: 'Clan Hrafnvald',
    motto: MOTTO,
    description: 'Kleines alteingesessenes Huskarlgeschlecht aus Ivarsfels in Ivarsklamm, Ivarsheim, Aldrimar. Der Clan dient Clan Wargh und hält einen kleinen umfriedeten Hof. Gastrecht und der Schutz heimkehrender Familien bestimmen sein Selbstverständnis. Torleif Hrafnvald führt den Clan. Hrafnvald ist Livs Herkunftsclan; ihr überlieferter Name bleibt Liv.',
    emblem: EMBLEM,
    houseProfile: IVARSHEIM_HOUSE_PROFILES.hrafnvald
  }),
  houses: Object.freeze([
    Object.freeze({ id: HOUSE_ID, name: 'Clan Hrafnvald', motto: MOTTO, emblem: EMBLEM, status: 'active' })
  ]),
  persons: Object.freeze([Object.freeze(torleif), Object.freeze(liv)]),
  partnerships: Object.freeze([]),
  parentages: Object.freeze([]),
  cadetBranches: Object.freeze([]),
  timeJumps: Object.freeze([]),
  lineage: Object.freeze({
    founderPartnershipId: '',
    houseId: HOUSE_ID,
    crestSubtitle: 'Huskarlclan in Ivarsfels · Unter Clan Wargh',
    crestEmblemScale: 0.86,
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: Object.freeze({ enabled: false, years: 0, fromYear: '', toYear: '', label: '' })
  }),
  presentation: Object.freeze({ relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } }),
  view: Object.freeze({
    focusPersonId: torleif.id,
    orientation: 'vertical',
    ancestorDepth: 8,
    descendantDepth: 8,
    limitGenerations: false,
    showSiblings: true
  }),
  extensions: Object.freeze({
    blankFamily: false,
    sourceRevision: 1,
    jarltum: 'Ivarsheim',
    aldrimarRank: 'Huskarl',
    sourceModule: 'Nutzerautorisierte Neuschöpfung Clan Hrafnvald · 2026-11-03',
    sourceNote: 'Name, Ivarsfels-Zuordnung, Huskarlrang unter Clan Wargh, Hof, Gastrecht, Heraldik, Motto und Torleif Hrafnvald (1681, lebend) sind neue autorisierte Ausarbeitung vom 03.11.2026. Liv ist die unverändert übernommene öffentliche Identität liv / person--family-tree--liv, geboren 1688. Nur die Herkunftsclan-Zuordnung ist neu. Torleif und Liv bleiben zwei unverbundene Personen; keine Eltern, Partner, Kinder oder Verwandtschaft zwischen ihnen erfunden. Wolfshorn und Bleiddorn bleiben unverändert.',
    originPersonIds: Object.freeze(['liv']),
    registryManagedDocumentFields: Object.freeze(['motto', 'description']),
    registryManagedHouseProfileFields: Object.freeze(['rankId', 'seat', 'barony', 'county', 'kingdom', 'secondarySeats', 'liegeHouseId', 'liegeHouseName', 'regionEmblems']),
    registryManagedRecordFields: Object.freeze(['folderPath'])
  })
});
