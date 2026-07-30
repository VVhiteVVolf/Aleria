import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_ASYN_PORTRAITS } from './house-asyn-portraits.js';
import {
  WEIDEBUCHT_HOUSE_EMBLEMS,
  WEIDEBUCHT_HOUSE_PROFILES
} from './weidebucht-house-profiles.js';

const ASYN_HOUSE_ID = 'house-asyn';
const ASYN_EMBLEM = WEIDEBUCHT_HOUSE_EMBLEMS.asyn;

const HOUSE_EMBLEMS = Object.freeze({
  hwyaden: WEIDEBUCHT_HOUSE_EMBLEMS.hwyaden,
  tannau: WEIDEBUCHT_HOUSE_EMBLEMS.tannau,
  'tir-addawol': WEIDEBUCHT_HOUSE_EMBLEMS['tir-addawol'],
  wylan: WEIDEBUCHT_HOUSE_EMBLEMS.wylan
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

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? ASYN_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_ASYN_PORTRAITS[id] || '',
    worldPersonId: options.worldPersonId || '',
    familyRole: options.familyRole || (houseId === ASYN_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || 'branch',
    title: options.title || '',
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
  });
}

function spouse(id, name, sex, birth = '????', death = '', houseId = '', options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    houseId,
    familyRole: options.familyRole || 'married'
  });
}

function awayWoman(id, name, birth, death, targetHouseName, options = {}) {
  return person(id, name, 'female', birth, death, {
    ...options,
    title: options.title || `Wegverheiratet an ${targetHouseName}`,
    tags: [...(options.tags || []), 'Wegverheiratet']
  });
}

function endedMarriage(id, firstId, secondId, options = {}) {
  return createMarriage(id, firstId, secondId, { status: 'ended', ...options });
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, options);
}

function marriedAway(id, name, partnershipId, houseId, targetFamilyId, emblem = '') {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId,
    emblem,
    crestFrame: 'gold'
  });
}

const COUPLES = Object.freeze({
  founders: ['gamon-der-tor-asyn', 'llwyn-asyn-founder-spouse'],
  griff: ['griff-ancient-asyn', 'torri-asyn'],
  gwenda: ['gwenda-asyn', 'llue-tannau'],
  anarawd: ['anarawd-asyn', 'mallt-tylwyth'],
  eilun: ['gwyndor-tir-addawol', 'eilun-asyn-tir-addawol'],
  eiddyl: ['eiddyl-asyn', 'rhianu-asyn'],
  cariad: ['gwiawn-hwyaden', 'cariad-asyn'],
  tudwal: ['meinir-wylan', 'tudwal-asyn'],
  teleri: ['teleri-asyn', 'neirin-tylwyth'],
  talon: ['talon-asyn', 'helga-asyn'],
  kane: ['kane-asyn', 'astrith-asyn'],
  cloi: ['cloi-asyn', 'treasa-asyn'],
  bran: ['bran-asyn', 'reiltin-asyn']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-gamon-llwyn-asyn': COUPLES.founders,
  'marriage-griff-torri-asyn': COUPLES.griff,
  'marriage-gwenda-llue-asyn': COUPLES.gwenda,
  'marriage-anarawd-mallt-asyn': COUPLES.anarawd,
  'marriage-gwyndor-eilun-tir-addawol': COUPLES.eilun,
  'marriage-eiddyl-rhianu-asyn': COUPLES.eiddyl,
  'marriage-gwiawn-cariad-hwyaden': COUPLES.cariad,
  'marriage-meinir-tudwal': COUPLES.tudwal,
  'marriage-teleri-neirin-asyn': COUPLES.teleri,
  'forced-talon-helga-asyn': COUPLES.talon,
  'affair-kane-astrith-asyn': COUPLES.kane,
  'marriage-cloi-treasa-asyn': COUPLES.cloi,
  'marriage-bran-reiltin-asyn': COUPLES.bran
});

export const HOUSE_ASYN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-asyn',
    title: "Haus Asyn O'Cerrigarth",
    motto: 'Mit Eifer in den Tag.',
    description: 'Ritterfürstenhaus von Castell Asyn in Cerrigarth. Nach dem Verschwinden der Hauptfamilie 1639 überdauerte eine verborgene uneheliche Linie; Réiltín kehrte 1740 mit Arlais und Griff nach Cerrigarth zurück.',
    emblem: ASYN_EMBLEM,
    houseProfile: WEIDEBUCHT_HOUSE_PROFILES.asyn
  },
  houses: [
    house(ASYN_HOUSE_ID, "Haus Asyn O'Cerrigarth", ASYN_EMBLEM),
    house('house-hwyaden', 'Haus Hwyaden', HOUSE_EMBLEMS.hwyaden),
    house('house-tannau', 'Haus Tannau', HOUSE_EMBLEMS.tannau),
    house('house-tir-addawol', 'Haus Tir Addawol', HOUSE_EMBLEMS['tir-addawol']),
    house('house-tylwyth', 'Haus Tylwyth'),
    house('house-wylan', "Haus Wylan O'Cerrigarth", HOUSE_EMBLEMS.wylan)
  ],
  persons: [
    person('gamon-der-tor-asyn', 'Gamon der Tor', 'male', '????', '????', {
      title: 'Gründer und erster Ritterfürst des Hauses Asyn',
      lineageRole: 'head',
      tags: ['Hausgründer']
    }),
    spouse('llwyn-asyn-founder-spouse', 'Llwyn', 'female', '????', '????'),

    person('griff-ancient-asyn', 'Griff Asyn', 'male', '????', '????', {
      title: 'Ritterfürst des Hauses Asyn',
      lineageRole: 'head'
    }),
    awayWoman('gwenda-asyn', 'Gwenda Asyn', '????', '????', 'Haus Tannau'),
    spouse('torri-asyn', 'Torri', 'female', '????', '????'),
    spouse('llue-tannau', 'Llue Tannau', 'male', '????', '????', 'house-tannau'),

    person('anarawd-asyn', 'Anarawd Asyn', 'male', '????', '????', {
      title: 'Ritterfürst des Hauses Asyn',
      lineageRole: 'head'
    }),
    awayWoman('eilun-asyn-tir-addawol', 'Eilun Asyn', '????', '????', 'Haus Tir Addawol'),
    spouse('mallt-tylwyth', 'Mallt Tylwyth', 'female', '????', '????', 'house-tylwyth'),
    spouse('gwyndor-tir-addawol', 'Gwyndor Tir Addawol', 'male', '????', '????', 'house-tir-addawol', {
      title: 'Baron von Glyndale'
    }),

    person('eiddyl-asyn', 'Eiddyl Asyn', 'male', '????', '????', {
      title: 'Ritterfürst des Hauses Asyn',
      lineageRole: 'head'
    }),
    awayWoman('cariad-asyn', 'Cariad Asyn', '????', '????', 'Haus Hwyaden'),
    spouse('rhianu-asyn', 'Rhianu', 'female', '????', '????'),
    spouse('gwiawn-hwyaden', 'Gwiawn Hwyaden', 'male', '????', '????', 'house-hwyaden', {
      title: 'Baron von Trefyddin',
      notes: 'Die Asyn-Quelle schreibt den Namen einmal „Gwiawm“; die ausgearbeitete Hwyaden-Gegenakte führt die kanonische Form Gwiawn.'
    }),

    person('tudwal-asyn', 'Tudwal Asyn', 'male', '1607', '1639', {
      title: 'Letzter Ritterfürst vor dem Verschwinden 1639',
      lineageRole: 'head',
      notes: 'Verschwand 1639 auf der Überfahrt nach Esgairmor.'
    }),
    awayWoman('teleri-asyn', 'Teleri Asyn', '1610', '1679', 'Haus Tylwyth'),
    spouse('meinir-wylan', 'Meinir Wylan', 'female', '1608', '1639', 'house-wylan', {
      notes: 'Verschwand 1639 gemeinsam mit Tudwals Familie auf See.'
    }),
    spouse('neirin-tylwyth', 'Neirin Tylwyth', 'male', '1608', '1645', 'house-tylwyth'),

    person('travion-asyn', 'Travion Asyn', 'male', '1625', '1639', {
      title: '1639 auf See verschollen'
    }),
    person('owena-asyn', 'Owena Asyn', 'female', '1627', '1639?', {
      title: '1639 vermutlich auf See verschollen',
      notes: 'Die Quelle versieht das Todesjahr 1639 mit einem Fragezeichen.'
    }),
    person('wynfor-asyn', 'Wynfor Asyn', 'male', '1627', '1639', {
      title: '1639 auf See verschollen'
    }),
    person('talon-asyn', 'Talon Asyn', 'male', '1633', '1670', {
      lineageRole: 'mainline',
      notes: 'Über Talons unehelichen Sohn Kane überdauerte die in Cerrigarth für erloschen gehaltene Linie.'
    }),
    spouse('helga-asyn', 'Helga', 'female', '1631', '1670', '', {
      familyRole: 'forced',
      title: 'Opfer Talons',
      notes: 'Die Quelle bezeichnet Talon ausdrücklich als Helgas Schänder; dies ist keine Ehe und keine freiwillige Affäre.'
    }),

    person('kane-asyn', 'Kane Asyn', 'male', '1655', '1688', {
      familyRole: 'bastard',
      lineageRole: 'mainline',
      title: 'Unehelicher Sohn Talons und Helgas'
    }),
    spouse('astrith-asyn', 'Astrith', 'female', '1656', '1698', '', {
      familyRole: 'affair'
    }),
    person('cloi-asyn', 'Cloi Asyn', 'male', '1678', '1707', {
      familyRole: 'bastard',
      lineageRole: 'mainline',
      title: 'Unehelicher Sohn Kanes und Astriths'
    }),
    spouse('treasa-asyn', 'Treasa', 'female', '1680', '1719'),
    person('bran-asyn', 'Bran Asyn', 'male', '1702', '1736', {
      lineageRole: 'mainline',
      title: 'Nachfahre der verborgenen Asyn-Linie'
    }),
    spouse('reiltin-asyn', 'Réiltín', 'female', '1705', '', '', {
      title: 'Kehrte 1740 mit ihren Kindern nach Cerrigarth zurück'
    }),
    person('arlais-asyn', 'Arlais Asyn', 'female', '1723', '', {
      lineageRole: 'mainline',
      title: '1740 nach Cerrigarth zurückgekehrt'
    }),
    person('griff-1732-asyn', 'Griff Asyn', 'male', '1732', '', {
      lineageRole: 'mainline',
      title: '1740 nach Cerrigarth zurückgekehrt'
    })
  ],
  partnerships: [
    endedMarriage('marriage-gamon-llwyn-asyn', ...COUPLES.founders),
    endedMarriage('marriage-griff-torri-asyn', ...COUPLES.griff),
    endedMarriage('marriage-gwenda-llue-asyn', ...COUPLES.gwenda),
    endedMarriage('marriage-anarawd-mallt-asyn', ...COUPLES.anarawd),
    endedMarriage('marriage-gwyndor-eilun-tir-addawol', ...COUPLES.eilun),
    endedMarriage('marriage-eiddyl-rhianu-asyn', ...COUPLES.eiddyl),
    endedMarriage('marriage-gwiawn-cariad-hwyaden', ...COUPLES.cariad),
    endedMarriage('marriage-meinir-tudwal', ...COUPLES.tudwal, { end: '1639' }),
    endedMarriage('marriage-teleri-neirin-asyn', ...COUPLES.teleri, { end: '1645' }),
    createMarriage('forced-talon-helga-asyn', ...COUPLES.talon, {
      type: 'forced',
      status: 'ended',
      end: '1670',
      notes: 'Die Quelle bezeichnet Talon als Helgas Schänder; diese Verbindung wird ausdrücklich nicht als Ehe oder Affäre geführt.'
    }),
    createMarriage('affair-kane-astrith-asyn', ...COUPLES.kane, {
      type: 'affair',
      status: 'ended',
      end: '1688'
    }),
    endedMarriage('marriage-cloi-treasa-asyn', ...COUPLES.cloi, { end: '1707' }),
    endedMarriage('marriage-bran-reiltin-asyn', ...COUPLES.bran, { end: '1736' })
  ],
  parentages: [
    ...childrenOf(['griff-ancient-asyn', 'gwenda-asyn'], 'marriage-gamon-llwyn-asyn', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen Gamon und der Griff-Generation sind nicht einzeln überlieferte Asyn ausgelassen.',
      extensions: { timeJumpId: 'gap-founders-to-griff-generation-asyn' }
    }),
    ...childrenOf(['anarawd-asyn', 'eilun-asyn-tir-addawol'], 'marriage-griff-torri-asyn', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen Griff und der Anarawd-Generation sind nicht einzeln überlieferte Asyn ausgelassen.',
      extensions: { timeJumpId: 'gap-griff-to-anarawd-generation-asyn' }
    }),
    ...childrenOf(['eiddyl-asyn', 'cariad-asyn'], 'marriage-anarawd-mallt-asyn', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen Anarawd und der Eiddyl-Generation sind nicht einzeln überlieferte Asyn ausgelassen.',
      extensions: { timeJumpId: 'gap-anarawd-to-eiddyl-generation-asyn' }
    }),
    ...childrenOf(['tudwal-asyn', 'teleri-asyn'], 'marriage-eiddyl-rhianu-asyn', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen Eiddyl und der ab 1607 belegten Tudwal-Generation sind nicht einzeln überlieferte Asyn ausgelassen.',
      extensions: { timeJumpId: 'gap-eiddyl-to-tudwal-generation-asyn' }
    }),
    ...childrenOf(['travion-asyn', 'owena-asyn', 'wynfor-asyn', 'talon-asyn'], 'marriage-meinir-tudwal'),
    ...childrenOf(['kane-asyn'], 'forced-talon-helga-asyn', {
      legitimacy: 'illegitimate',
      notes: 'Kane ist der ausdrücklich als Bastard bezeichnete Sohn aus Talons erzwungener Verbindung mit Helga.'
    }),
    ...childrenOf(['cloi-asyn'], 'affair-kane-astrith-asyn', {
      legitimacy: 'illegitimate',
      notes: 'Cloi stammt aus Kanes Affäre mit Astrith.'
    }),
    ...childrenOf(['bran-asyn'], 'marriage-cloi-treasa-asyn'),
    ...childrenOf(['arlais-asyn', 'griff-1732-asyn'], 'marriage-bran-reiltin-asyn')
  ],
  cadetBranches: [
    marriedAway('married-away-gwenda-asyn-tannau', 'Haus Tannau', 'marriage-gwenda-llue-asyn', 'house-tannau', 'haus-tannau', HOUSE_EMBLEMS.tannau),
    marriedAway('married-away-eilun-asyn-tir-addawol', 'Haus Tir Addawol', 'marriage-gwyndor-eilun-tir-addawol', 'house-tir-addawol', 'haus-tir-addawol', HOUSE_EMBLEMS['tir-addawol']),
    marriedAway('married-away-cariad-asyn-hwyaden', 'Haus Hwyaden', 'marriage-gwiawn-cariad-hwyaden', 'house-hwyaden', 'haus-hwyaden', HOUSE_EMBLEMS.hwyaden),
    marriedAway('married-away-teleri-asyn-tylwyth', 'Haus Tylwyth', 'marriage-teleri-neirin-asyn', 'house-tylwyth', 'haus-tylwyth')
  ],
  timeJumps: [
    {
      id: 'gap-founders-to-griff-generation-asyn',
      parentPartnershipId: 'marriage-gamon-llwyn-asyn',
      parentPersonId: '',
      childIds: ['griff-ancient-asyn', 'gwenda-asyn'],
      sharedParentPartnershipIds: [],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Asyn-Generationen',
      notes: 'Der erste absolute Trenner liegt seriell unter dem Gründerpaar und dem Asyn-Hauswappen.',
      extensions: {}
    },
    {
      id: 'gap-griff-to-anarawd-generation-asyn',
      parentPartnershipId: 'marriage-griff-torri-asyn',
      parentPersonId: '',
      childIds: ['anarawd-asyn', 'eilun-asyn-tir-addawol'],
      sharedParentPartnershipIds: [],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Asyn-Generationen',
      notes: 'Der zweite absolute Trenner liegt ausschließlich unter Griff und Torri.',
      extensions: {}
    },
    {
      id: 'gap-anarawd-to-eiddyl-generation-asyn',
      parentPartnershipId: 'marriage-anarawd-mallt-asyn',
      parentPersonId: '',
      childIds: ['eiddyl-asyn', 'cariad-asyn'],
      sharedParentPartnershipIds: [],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Asyn-Generationen',
      notes: 'Der dritte absolute Trenner liegt ausschließlich unter Anarawd und Mallt.',
      extensions: {}
    },
    {
      id: 'gap-eiddyl-to-tudwal-generation-asyn',
      parentPartnershipId: 'marriage-eiddyl-rhianu-asyn',
      parentPersonId: '',
      childIds: ['tudwal-asyn', 'teleri-asyn'],
      sharedParentPartnershipIds: [],
      years: 0,
      fromYear: '????',
      toYear: '1607',
      label: 'Die datierte Asyn-Linie setzt 1607 wieder ein',
      notes: 'Der vierte absolute Trenner liegt ausschließlich unter Eiddyl und Rhianu.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-gamon-llwyn-asyn',
    houseId: ASYN_HOUSE_ID,
    crestSubtitle: 'Ritterfürstenhaus von Castell Asyn · Verschollen 1639 · Rückkehr 1740',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'gamon-der-tor-asyn',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 1,
    sourceModule: "Haus Asyn O'Cerrigarth (bereitgestellte Altdaten)",
    sourceNote: 'Genealogie, Lebensdaten, Hausgeschichte und Porträts folgen der bereitgestellten Asyn-Hausseite. Die vier Punktreihen werden als vier strikt serielle absolute Generationentrenner umgesetzt. Gwenda, Eilun, Cariad und Teleri besitzen direkte Wegverheiratet-Knoten zu den belegten Zielhäusern. Cariad/Gwiawn, Eilun/Gwyndor und Meinir/Tudwal verwenden dieselben Welt- und Ehe-IDs wie ihre ausgearbeiteten Gegenakten. Die Schreibweise Gwiawn folgt der kanonischen Hwyaden-Akte statt dem einmaligen Quellfehler „Gwiawm“. Talon/Helga sind ausdrücklich eine erzwungene Verbindung, keine Ehe oder Affäre; Kane ist ihr unehelicher Sohn. Cloi stammt unehelich aus Kanes Affäre mit Astrith. Daher ist die 1639 in Cerrigarth für erloschen gehaltene Linie genealogisch nicht beendet: Sie führt über Kane, Cloi und Bran zu Arlais und Griff, die 1740 mit ihrer Mutter Réiltín zurückkehren. Wiederholte generische Standardsilhouetten wurden nicht als Individualporträts importiert.',
    registryManagedExtensionFields: ['sourceNote'],
    registryManagedHouseProfileFields: ['rankId', 'seat', 'barony', 'county', 'kingdom', 'regionEmblems']
  }
});
