import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createMigrationHouseBranch,
  createParentages
} from './family-record-builders.js';
import { GRAUE_WEITE_HOUSE_EMBLEMS } from './graue-weite-house-profiles.js';
import { HOUSE_WALWRS_PORTRAITS } from './house-walwrs-portraits.js';
import {
  KLAUENINSEL_HOUSE_EMBLEMS,
  KLAUENINSEL_HOUSE_PROFILES,
  KLAUENINSEL_ORIGIN_HOUSE_PROFILES
} from './klaueninseln-house-profiles.js';
import { WEIDEBUCHT_HOUSE_EMBLEMS } from './weidebucht-house-profiles.js';

const TRAETH_HOUSE_ID = 'house-walwrs';
const CAER_DEHEUOL_HOUSE_ID = 'house-walwrs-caer-deheuol';
const WALWRS_EMBLEM = KLAUENINSEL_HOUSE_EMBLEMS.walwrs;
const FOUNDER_TIME_JUMP_ID = 'gap-owain-to-taran-cerridwyn-llaesgwynyn-walwrs';

const HOUSE_EMBLEMS = Object.freeze({
  arfordir: KLAUENINSEL_HOUSE_EMBLEMS.arfordir,
  blodyn: 'assets/images/houses/Blütenland/haus-blodyn.png',
  crafanc: KLAUENINSEL_HOUSE_EMBLEMS.crafanc,
  dianc: KLAUENINSEL_HOUSE_EMBLEMS.dianc,
  draenog: GRAUE_WEITE_HOUSE_EMBLEMS.draenog,
  gwaedlyd: GRAUE_WEITE_HOUSE_EMBLEMS.gwaedlyd,
  lyfant: GRAUE_WEITE_HOUSE_EMBLEMS.lyfant,
  mochdaer: WEIDEBUCHT_HOUSE_EMBLEMS.mochdaer,
  walwrs: WALWRS_EMBLEM
});

const SOURCE_MANAGED_PERSON_FIELDS = Object.freeze([
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
]);

const HEAD_IDS = new Set([
  'owain-founder-walwrs',
  'taran-walwrs',
  'sieffre-walwrs',
  'owain-1655-walwrs',
  'rheidwn-walwrs',
  'hopcyn-walwrs'
]);

function house(id, name, emblem = '') {
  return {
    id,
    name,
    motto: '',
    emblem,
    status: 'active',
    extensions: { registryManagedFields: ['name', 'emblem'] }
  };
}

function walwrsWorldPersonId(id) {
  return `person--haus-walwrs--${id}`;
}

function personForLine(lineHouseId, id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? lineHouseId : options.houseId;
  const isWalwrs = houseId === TRAETH_HOUSE_ID || houseId === CAER_DEHEUOL_HOUSE_ID;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || (isWalwrs ? walwrsWorldPersonId(id) : ''),
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_WALWRS_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === lineHouseId ? 'core' : 'married'),
    lineageRole: options.lineageRole || (HEAD_IDS.has(id) ? 'head' : 'branch'),
    title: options.title || '',
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
  });
}

function traethPerson(id, name, sex, birth = '????', death = '', options = {}) {
  return personForLine(TRAETH_HOUSE_ID, id, name, sex, birth, death, options);
}

function caerDeheuolPerson(id, name, sex, birth = '????', death = '', options = {}) {
  return personForLine(CAER_DEHEUOL_HOUSE_ID, id, name, sex, birth, death, options);
}

function endedMarriage(id, firstId, secondId, end = '') {
  return createMarriage(id, firstId, secondId, { status: 'ended', end });
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, {
    idPrefix: options.idPrefix || 'walwrs-parentage',
    ...options
  });
}

function marriedAway(id, name, partnershipId, houseId, targetFamilyId, emblem = '') {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId,
    emblem,
    crestFrame: 'gold',
    subtitle: `Wegverheiratet an ${name}`
  });
}

const ORIGIN_HOUSES = Object.freeze([
  house(TRAETH_HOUSE_ID, "Haus Walwrs O'Traeth", WALWRS_EMBLEM),
  house(CAER_DEHEUOL_HOUSE_ID, "Haus Walwrs O'Caer Deheuol", WALWRS_EMBLEM),
  house('house-crafanc', 'Haus Crafanc', HOUSE_EMBLEMS.crafanc),
  house('house-arfordir', "Haus Arfordir O'Serenlyn", HOUSE_EMBLEMS.arfordir),
  house('house-blodyn', "Haus Blodyn O'Llyndor", HOUSE_EMBLEMS.blodyn),
  house('house-drewi', 'Haus Drewi'),
  house('house-gwaedlyd', "Haus Gwaedlyd O'Caer Gorwel", HOUSE_EMBLEMS.gwaedlyd),
  house('house-morgryn', 'Haus Morgryn'),
  house('house-draenog', 'Haus Draenog', HOUSE_EMBLEMS.draenog),
  house('house-trachwyll-talfronwyn', "Haus Trachwyll O'Talfronwyn"),
  house('house-gwenyen', 'Haus Gwenyen'),
  house('house-dianc', "Haus Dianc O'Gwynlann", HOUSE_EMBLEMS.dianc),
  house('house-bochdew', 'Haus Bochdew')
]);

const TARGET_HOUSES = Object.freeze([
  house(CAER_DEHEUOL_HOUSE_ID, "Haus Walwrs O'Caer Deheuol", WALWRS_EMBLEM),
  house(TRAETH_HOUSE_ID, "Haus Walwrs O'Traeth", WALWRS_EMBLEM),
  house('house-gwenyen', 'Haus Gwenyen'),
  house('house-crwynog', 'Haus Crwynog'),
  house('house-mochdaer-cerrigarth', "Haus Mochdaer O'Cerrigarth", HOUSE_EMBLEMS.mochdaer),
  house('house-lyfant-caer-asgwrn', "Haus Lyfant O'Caer Asgwrn", HOUSE_EMBLEMS.lyfant)
]);

const ORIGIN_PARTNERS = Object.freeze({
  founders: ['owain-founder-walwrs', 'lleucu-founder-walwrs'],
  taran: ['nesta-crafanc', 'taran-walwrs'],
  cerridwyn: ['iorwerth-blodyn', 'cerridwyn-walwrs'],
  llaesgwynyn: ['meiriona-arfordir', 'llaesgwynyn-walwrs'],
  meinir: ['illtyd-drewi', 'meinir-walwrs'],
  sieffre: ['sieffre-walwrs', 'llewella-spouse-walwrs'],
  gwendolen: ['ywain-gwaedlyd', 'gwendolen-walwrs'],
  owain: ['zara-morgryn', 'owain-1655-walwrs'],
  lleucu: ['meical-draenog', 'lleucu-walvers'],
  cadwallen: ['cadwallen-walwrs', 'sioned-trachwyll'],
  rheidwn: ['rheidwn-walwrs', 'rhosyn-gwenyen'],
  zenna: ['ysgonan-dianc', 'zenna-walwrs'],
  einir: ['einir-walwrs', 'gwindor-bochdew']
});

export const HOUSE_WALWRS_TRAETH_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-walwrs',
    title: "Haus Walwrs O'Traeth",
    motto: 'Mwynhau yn lle edifarhau!',
    description: 'Vollständige Herkunftsakte des alten vennyrianischen Ritterfürstenhauses aus Traeth. Rheidwn beginnt 1720 die getrennte, ebenfalls ritterfürstliche Linie von Caer Deheuol; seine Nachkommen werden ausschließlich dort fortgeführt.',
    emblem: WALWRS_EMBLEM,
    houseProfile: KLAUENINSEL_ORIGIN_HOUSE_PROFILES['walwrs-traeth']
  },
  houses: [...ORIGIN_HOUSES],
  persons: [
    traethPerson('owain-founder-walwrs', 'Owain Walwrs', 'male', '????', '????', {
      familyRole: 'founder',
      lineageRole: 'head',
      title: "Gründer und erster Ritterfürst des Hauses Walwrs O'Traeth"
    }),
    traethPerson('lleucu-founder-walwrs', 'Lleucu', 'female', '????', '????', {
      houseId: '',
      familyRole: 'founder'
    }),

    traethPerson('taran-walwrs', 'Taran Walwrs', 'male', '1612', '1665', {
      title: 'Ritterfürst von Traeth'
    }),
    traethPerson('nesta-crafanc', 'Nesta Crafanc', 'female', '1619', '1672', {
      houseId: 'house-crafanc',
      familyRole: 'married',
      notes: 'Die Walwrs-Tabelle nennt abweichend 1644; die vollständig ausgearbeitete Crafanc-Gegenakte bleibt mit 1672 kanonisch.'
    }),
    traethPerson('cerridwyn-walwrs', 'Cerridwyn Walwrs', 'female', '1620', '1674', {
      title: "Wegverheiratet an Haus Blodyn O'Llyndor",
      tags: ['Wegverheiratet'],
      notes: 'Die Walwrs-Tabelle nennt abweichend 1618; die Blodyn-Gegenakte bleibt mit 1620 kanonisch.'
    }),
    traethPerson('iorwerth-blodyn', 'Iorwerth Blodyn', 'male', '1618', '1670', {
      houseId: 'house-blodyn',
      familyRole: 'married'
    }),
    traethPerson('llaesgwynyn-walwrs', 'Llaesgwynyn Walwrs', 'male', '1615', '1681'),
    traethPerson('meiriona-arfordir', 'Meiriona Arfordir', 'female', '1617', '1680', {
      houseId: 'house-arfordir',
      familyRole: 'married'
    }),

    traethPerson('meinir-walwrs', 'Meinir Walwrs', 'female', '1638', '1692', {
      title: 'Wegverheiratet an Haus Drewi',
      tags: ['Wegverheiratet']
    }),
    traethPerson('illtyd-drewi', 'Illtyd Drewi', 'male', '1632', '1689', {
      houseId: 'house-drewi',
      familyRole: 'married'
    }),
    traethPerson('sieffre-walwrs', 'Sieffre Walwrs', 'male', '1636', '1698'),
    traethPerson('llewella-spouse-walwrs', 'Llewella', 'female', '1638', '1674', {
      houseId: '',
      familyRole: 'married'
    }),
    traethPerson('gwendolen-walwrs', 'Gwendolen Walwrs', 'female', '1633', '1685', {
      title: "Wegverheiratet an Haus Gwaedlyd O'Caer Gorwel",
      tags: ['Wegverheiratet']
    }),
    traethPerson('ywain-gwaedlyd', 'Ywain Gwaedlyd', 'male', '1629', '1700', {
      houseId: 'house-gwaedlyd',
      familyRole: 'married'
    }),

    traethPerson('owain-1655-walwrs', 'Owain Walwrs', 'male', '1655', '1720'),
    traethPerson('zara-morgryn', 'Zara Morgryn', 'female', '1656', '1709', {
      houseId: 'house-morgryn',
      familyRole: 'married'
    }),
    traethPerson('lleucu-walvers', 'Lleucu Walwrs', 'female', '1656', '1712', {
      worldPersonId: walwrsWorldPersonId('lleucu-walvers'),
      title: 'Wegverheiratet an Haus Draenog',
      tags: ['Wegverheiratet'],
      notes: 'Die stabile technische ID behält die ältere Schreibweise walvers; sichtbar wird der Hausname korrekt als Walwrs geführt.'
    }),
    traethPerson('meical-draenog', 'Meical Draenog', 'male', '1652', '', {
      houseId: 'house-draenog',
      familyRole: 'married'
    }),
    traethPerson('cadwallen-walwrs', 'Cadwallen Walwrs', 'male', '1658', '1715'),
    traethPerson('sioned-trachwyll', 'Sioned Trachwyll', 'female', '1659', '1702', {
      houseId: 'house-trachwyll-talfronwyn',
      familyRole: 'married'
    }),

    traethPerson('rheidwn-walwrs', 'Rheidwn Walwrs', 'male', '1673', '', {
      lineageRole: 'head',
      title: 'Begründer und Ritterfürst der Caer-Deheuol-Linie seit 1720'
    }),
    traethPerson('rhosyn-gwenyen', 'Rhosyn Gwenyen', 'female', '1674', '1720', {
      houseId: 'house-gwenyen',
      familyRole: 'married'
    }),
    traethPerson('zenna-walwrs', 'Zenna Walwrs', 'female', '1675', '1733', {
      title: "Wegverheiratet an Haus Dianc O'Gwynlann",
      tags: ['Wegverheiratet']
    }),
    traethPerson('ysgonan-dianc', 'Ysgonan Dianc', 'male', '1673', '1720', {
      houseId: 'house-dianc',
      familyRole: 'married'
    }),
    traethPerson('einir-walwrs', 'Einir Walwrs', 'female', '1676', '1720', {
      title: 'Wegverheiratet an Haus Bochdew',
      tags: ['Wegverheiratet']
    }),
    traethPerson('gwindor-bochdew', 'Gwindor Bochdew', 'male', '1674', '1720', {
      houseId: 'house-bochdew',
      familyRole: 'married'
    })
  ],
  partnerships: [
    endedMarriage('marriage-owain-lleucu-founders-walwrs', ...ORIGIN_PARTNERS.founders),
    endedMarriage('marriage-nesta-taran-crafanc', ...ORIGIN_PARTNERS.taran, '1665'),
    endedMarriage('marriage-iorwerth-cerridwyn', ...ORIGIN_PARTNERS.cerridwyn, '1670'),
    endedMarriage('marriage-meiriona-llaesgwynyn-walwrs', ...ORIGIN_PARTNERS.llaesgwynyn, '1680'),
    endedMarriage('marriage-illtyd-meinir-walwrs', ...ORIGIN_PARTNERS.meinir, '1689'),
    endedMarriage('marriage-sieffre-llewella-walwrs', ...ORIGIN_PARTNERS.sieffre, '1674'),
    endedMarriage('marriage-ywain-gwendolen-gwaedlyd', ...ORIGIN_PARTNERS.gwendolen, '1685'),
    endedMarriage('marriage-zara-owain-walwrs', ...ORIGIN_PARTNERS.owain, '1709'),
    endedMarriage('marriage-meical-lleucu-draenog', ...ORIGIN_PARTNERS.lleucu, '1712'),
    endedMarriage('marriage-cadwallen-sioned-walwrs', ...ORIGIN_PARTNERS.cadwallen, '1702'),
    endedMarriage('marriage-rheidwn-rhosyn-walwrs', ...ORIGIN_PARTNERS.rheidwn, '1720'),
    endedMarriage('marriage-ysgonan-zenna-dianc', ...ORIGIN_PARTNERS.zenna, '1720'),
    endedMarriage('marriage-einir-gwindor-walwrs', ...ORIGIN_PARTNERS.einir, '1720')
  ],
  parentages: [
    ...childrenOf(
      ['taran-walwrs', 'cerridwyn-walwrs', 'llaesgwynyn-walwrs'],
      ORIGIN_PARTNERS.founders,
      'marriage-owain-lleucu-founders-walwrs',
      {
        type: 'claimed',
        certainty: 'probable',
        notes: 'Zwischen dem Gründerpaar und den ab 1612 belegten Geschwistern liegen nicht einzeln überlieferte Generationen.',
        extensions: { timeJumpId: FOUNDER_TIME_JUMP_ID }
      }
    ),
    ...childrenOf(['meinir-walwrs'], ORIGIN_PARTNERS.taran, 'marriage-nesta-taran-crafanc'),
    ...childrenOf(['sieffre-walwrs', 'gwendolen-walwrs'], ORIGIN_PARTNERS.llaesgwynyn, 'marriage-meiriona-llaesgwynyn-walwrs'),
    ...childrenOf(['owain-1655-walwrs', 'lleucu-walvers', 'cadwallen-walwrs'], ORIGIN_PARTNERS.sieffre, 'marriage-sieffre-llewella-walwrs'),
    ...childrenOf(['rheidwn-walwrs', 'zenna-walwrs'], ORIGIN_PARTNERS.owain, 'marriage-zara-owain-walwrs'),
    ...childrenOf(['einir-walwrs'], ORIGIN_PARTNERS.cadwallen, 'marriage-cadwallen-sioned-walwrs')
  ],
  cadetBranches: [
    marriedAway('married-away-cerridwyn-walwrs-blodyn', "Haus Blodyn O'Llyndor", 'marriage-iorwerth-cerridwyn', 'house-blodyn', 'haus-blodyn', HOUSE_EMBLEMS.blodyn),
    marriedAway('married-away-meinir-walwrs-drewi', 'Haus Drewi', 'marriage-illtyd-meinir-walwrs', 'house-drewi', 'haus-drewi'),
    marriedAway('married-away-gwendolen-walwrs-gwaedlyd', "Haus Gwaedlyd O'Caer Gorwel", 'marriage-ywain-gwendolen-gwaedlyd', 'house-gwaedlyd', 'haus-gwaedlyd', HOUSE_EMBLEMS.gwaedlyd),
    marriedAway('married-away-lleucu-walwrs-draenog', 'Haus Draenog', 'marriage-meical-lleucu-draenog', 'house-draenog', 'haus-draenog', HOUSE_EMBLEMS.draenog),
    marriedAway('married-away-zenna-walwrs-dianc', "Haus Dianc O'Gwynlann", 'marriage-ysgonan-zenna-dianc', 'house-dianc', 'haus-dianc', HOUSE_EMBLEMS.dianc),
    marriedAway('married-away-einir-walwrs-bochdew', 'Haus Bochdew', 'marriage-einir-gwindor-walwrs', 'house-bochdew', 'haus-bochdew'),
    createMigrationHouseBranch({
      id: 'migration-rheidwn-walwrs-caer-deheuol',
      name: "Haus Walwrs O'Caer Deheuol",
      parentPersonId: 'rheidwn-walwrs',
      houseId: CAER_DEHEUOL_HOUSE_ID,
      targetFamilyId: 'haus-walwrs-caer-deheuol',
      emblem: WALWRS_EMBLEM,
      founded: '1720',
      subtitle: 'Von Rheidwn begründete Ritterfürstenlinie in Caer Deheuol',
      crestFrame: 'gold',
      extensions: { offshootPlacement: 'below' },
      notes: 'Der nicht-genealogische Übergang hängt allein und geradlinig unter Rheidwn. Rhosyn schließt in der Zielakte als Ehefrau und Mutter an; ausschließlich ihre gemeinsamen Nachkommen werden dort fortgeführt.'
    })
  ],
  timeJumps: [
    {
      id: FOUNDER_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-owain-lleucu-founders-walwrs',
      sharedParentPartnershipIds: [],
      childIds: ['taran-walwrs', 'cerridwyn-walwrs', 'llaesgwynyn-walwrs'],
      years: 0,
      fromYear: '????',
      toYear: '1612',
      label: 'Die belegte Linie setzt 1612 wieder ein',
      notes: 'Absoluter Generationentrenner: Owain und Lleucu, Hauswappen, genau ein serieller Zeitsprung und erst danach Taran, Cerridwyn und Llaesgwynyn.'
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-owain-lleucu-founders-walwrs',
    houseId: TRAETH_HOUSE_ID,
    crestSubtitle: 'Altes vennyrianisches Ritterfürstenhaus von Traeth',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'owain-founder-walwrs',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    originLine: true,
    successorFamilyId: 'haus-walwrs-caer-deheuol',
    sourceRevision: 2,
    registryManagedExtensionFields: ['blankFamily', 'sourceNote'],
    registryManagedLineageFields: ['founderPartnershipId', 'houseId'],
    registryManagedViewFields: ['focusPersonId', 'ancestorDepth', 'descendantDepth', 'limitGenerations', 'showSiblings'],
    sourceNote: 'Vollständige Traeth-Herkunftsakte nach der Walwrs-Tabelle und ihrer Stammbaumgrafik. Owain und Lleucu tragen Wappen und genau einen seriellen Zeitsprung. Taran/Nesta führen nur zu Meinir; Llaesgwynyn/Meiriona nur zu Sieffre und Gwendolen. Kinder der wegverheirateten Cerridwyn, Gwendolen, Lleucu und Zenna verbleiben ausschließlich in Blodyn, Gwaedlyd, Draenog und Dianc. Rheidwn bleibt als Sohn Owains und Zaras sichtbar; seine Kinder und Enkel werden allein in der Caer-Deheuol-Akte fortgeführt.'
  }
});

const TARGET_PARTNERS = Object.freeze({
  rheidwn: ['rheidwn-walwrs', 'rhosyn-gwenyen'],
  hopcyn: ['hopcyn-walwrs', 'cadi-crwynog'],
  tathal: ['catrin-mochdaer', 'tathal-walwrs'],
  pryderi: ['bethan-lyfant', 'pryderi-walwrs']
});

export const HOUSE_WALWRS_CAER_DEHEUOL_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-walwrs-caer-deheuol',
    title: "Haus Walwrs O'Caer Deheuol",
    motto: 'Mwynhau yn lle edifarhau!',
    description: 'Die seit 1720 getrennt geführte Ritterfürstenlinie von Caer Deheuol. Sie beginnt mit Rheidwn Walwrs und Rhosyn Gwenyen und führt ausschließlich ihre drei Söhne sowie deren Kinder fort.',
    emblem: WALWRS_EMBLEM,
    houseProfile: KLAUENINSEL_HOUSE_PROFILES.walwrs
  },
  houses: [...TARGET_HOUSES],
  persons: [
    caerDeheuolPerson('rheidwn-walwrs', 'Rheidwn Walwrs', 'male', '1673', '', {
      familyRole: 'founder',
      lineageRole: 'head',
      title: 'Gründer und Ritterfürst von Caer Deheuol seit 1720'
    }),
    caerDeheuolPerson('rhosyn-gwenyen', 'Rhosyn Gwenyen', 'female', '1674', '1720', {
      houseId: 'house-gwenyen',
      familyRole: 'founder'
    }),

    caerDeheuolPerson('hopcyn-walwrs', 'Hopcyn Walwrs', 'male', '1692', '', {
      lineageRole: 'mainline',
      title: 'Erster Erbe des Hauses Walwrs'
    }),
    caerDeheuolPerson('cadi-crwynog', 'Cadi Crwynog', 'female', '1695', '', {
      houseId: 'house-crwynog',
      familyRole: 'married'
    }),
    caerDeheuolPerson('tathal-walwrs', 'Tathal Walwrs', 'male', '1694', '', {
      worldPersonId: walwrsWorldPersonId('tathal-walwrs')
    }),
    caerDeheuolPerson('catrin-mochdaer', 'Catrin Mochdaer', 'female', '1699', '', {
      houseId: 'house-mochdaer-cerrigarth',
      familyRole: 'married'
    }),
    caerDeheuolPerson('pryderi-walwrs', 'Pryderi Walwrs', 'male', '1699', '', {
      worldPersonId: walwrsWorldPersonId('pryderi-walwrs')
    }),
    caerDeheuolPerson('bethan-lyfant', 'Bethan Lyfant', 'female', '1700', '', {
      houseId: 'house-lyfant-caer-asgwrn',
      familyRole: 'married'
    }),

    caerDeheuolPerson('unig-walwrs', 'Unig Walwrs', 'male', '1722', '', {
      lineageRole: 'mainline',
      title: 'Zweiter Erbe des Hauses Walwrs'
    }),
    caerDeheuolPerson('trefor-walwrs', 'Trefor Walwrs', 'male', '1724', ''),
    caerDeheuolPerson('tawy-walwrs', 'Tawy Walwrs', 'male', '1722', ''),
    caerDeheuolPerson('alys-walwrs', 'Alys Walwrs', 'female', '1724', ''),
    caerDeheuolPerson('tud-walwrs', 'Tud Walwrs', 'male', '1718', ''),
    caerDeheuolPerson('alaw-walwrs', 'Alaw Walwrs', 'male', '1722', '')
  ],
  partnerships: [
    endedMarriage('marriage-rheidwn-rhosyn-walwrs', ...TARGET_PARTNERS.rheidwn, '1720'),
    createMarriage('marriage-hopcyn-cadi-walwrs', ...TARGET_PARTNERS.hopcyn),
    createMarriage('marriage-catrin-tathal-mochdaer', ...TARGET_PARTNERS.tathal),
    createMarriage('marriage-bethan-pryderi-lyfant', ...TARGET_PARTNERS.pryderi)
  ],
  parentages: [
    ...childrenOf(['hopcyn-walwrs', 'tathal-walwrs', 'pryderi-walwrs'], TARGET_PARTNERS.rheidwn, 'marriage-rheidwn-rhosyn-walwrs'),
    ...childrenOf(['unig-walwrs', 'trefor-walwrs'], TARGET_PARTNERS.hopcyn, 'marriage-hopcyn-cadi-walwrs'),
    ...childrenOf(['tawy-walwrs', 'alys-walwrs'], TARGET_PARTNERS.tathal, 'marriage-catrin-tathal-mochdaer'),
    ...childrenOf(['tud-walwrs', 'alaw-walwrs'], TARGET_PARTNERS.pryderi, 'marriage-bethan-pryderi-lyfant')
  ],
  cadetBranches: [],
  timeJumps: [],
  lineage: {
    founderPartnershipId: 'marriage-rheidwn-rhosyn-walwrs',
    houseId: CAER_DEHEUOL_HOUSE_ID,
    crestSubtitle: 'Ritterfürstenhaus von Caer Deheuol · gegründet 1720',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'rheidwn-walwrs',
    orientation: 'vertical',
    ancestorDepth: 8,
    descendantDepth: 10,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 2,
    originFamilyId: 'haus-walwrs',
    registryManagedExtensionFields: ['blankFamily', 'sourceNote'],
    registryManagedLineageFields: ['founderPartnershipId', 'houseId'],
    registryManagedViewFields: ['focusPersonId', 'ancestorDepth', 'descendantDepth', 'limitGenerations', 'showSiblings'],
    sourceNote: 'Getrennte Caer-Deheuol-Nachfolgeakte nach dem Blaidd- und Mochdaer-Muster. Rheidwn und Rhosyn bilden das neue genealogische Gründerpaar; Hopcyn, Tathal und Pryderi sind ausschließlich ihre Kinder. Unig/Trefor, Tawy/Alys und Tud/Alaw bleiben jeweils am richtigen Elternpaar. Zenna, Einir und die erloschenen älteren Seitenzweige gehören nicht zu Rheidwns neuer Linie und verbleiben daher ausschließlich in der vollständigen Herkunftsakte.'
  }
});

export const WALWRS_HOUSE_FAMILIES = Object.freeze([
  HOUSE_WALWRS_TRAETH_FAMILY,
  HOUSE_WALWRS_CAER_DEHEUOL_FAMILY
]);
