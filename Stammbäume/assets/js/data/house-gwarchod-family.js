import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createExtinctBranch,
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import {
  AEHRENTAL_HOUSE_EMBLEMS,
  AEHRENTAL_HOUSE_PROFILES
} from './aehrental-house-profiles.js';
import { SONNENKUESTE_HOUSE_EMBLEMS } from './sonnenkueste-house-profiles.js';
import { VORTIGERNS_RUH_HOUSE_EMBLEMS } from './vortigerns-ruh-house-profiles.js';
import { HOUSE_GWARCHOD_PORTRAITS } from './house-gwarchod-portraits.js';

const GWARCHOD_HOUSE_ID = 'house-gwarchod';
const GWARCHOD_EMBLEM = AEHRENTAL_HOUSE_EMBLEMS.gwarchod;
const FOUNDER_TIME_JUMP_ID = 'gap-founder-to-drystan-generation-gwarchod';

const HOUSE_EMBLEMS = Object.freeze({
  baedd: AEHRENTAL_HOUSE_EMBLEMS.baedd,
  chiffyddlon: AEHRENTAL_HOUSE_EMBLEMS.chiffyddlon,
  ciarog: AEHRENTAL_HOUSE_EMBLEMS.ciarog,
  dienyddiwr: VORTIGERNS_RUH_HOUSE_EMBLEMS.dienyddiwr,
  dyngwn: VORTIGERNS_RUH_HOUSE_EMBLEMS.dyngwn,
  grawn: AEHRENTAL_HOUSE_EMBLEMS.grawn,
  gwefrydd: 'assets/images/houses/Artus Streben/haus-gwefrydd.png',
  sgwarnog: AEHRENTAL_HOUSE_EMBLEMS.sgwarnog,
  teyrngarch: SONNENKUESTE_HOUSE_EMBLEMS.teyrngarch
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

const SUCCESSION_TITLES = Object.freeze({
  'ector-founder-gwarchod': 'Gründer und erster Ritterfürst des Hauses Gwarchod',
  'drystan-gwarchod': 'Ritterfürst des Hauses Gwarchod bis 1683',
  'garselid-gwarchod': 'Ritterfürst des Hauses Gwarchod 1683–1699',
  'maiwyn-gwarchod': 'Ritterfürst des Hauses Gwarchod 1699–1717',
  'gwernwy-gwarchod': 'Letzter Ritterfürst des Hauses Gwarchod 1717–1720',
  'delwyn-gwarchod': 'Letzter Erbe des Hauses Gwarchod · 1720 gefallen'
});

const HOUSE_HEAD_IDS = new Set([
  'ector-founder-gwarchod',
  'drystan-gwarchod',
  'garselid-gwarchod',
  'maiwyn-gwarchod',
  'gwernwy-gwarchod'
]);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return personId === 'delwyn-gwarchod' ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? GWARCHOD_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_GWARCHOD_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === GWARCHOD_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    title: options.title === undefined ? SUCCESSION_TITLES[id] || '' : options.title,
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
  });
}

function spouse(id, name, sex, birth, death = '', houseId = '', options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    houseId,
    familyRole: 'married',
    lineageRole: 'branch'
  });
}

function awayWoman(id, name, birth, death, targetHouseName, options = {}) {
  return person(id, name, 'female', birth, death, {
    ...options,
    title: `Wegverheiratet an ${targetHouseName}`,
    tags: [...(options.tags || []), 'Wegverheiratet']
  });
}

function house(id, name, emblem = '', status = 'active') {
  return { id, name, motto: '', emblem, status };
}

const COUPLES = Object.freeze({
  founders: ['ector-founder-gwarchod', 'morfudd-founder-gwarchod'],
  drystan: ['ysobel-chiffyddlon', 'drystan-gwarchod'],
  gwendolyn: ['lyonel-gwefrydd', 'gwendolyn-gwarchod'],
  garselid: ['yvaine-teyrngarch', 'garselid-gwarchod'],
  lynesse: ['lynesse-gwarchod-sgwarnog', 'mathonwy-sgwarnog'],
  gwendolen: ['gwalchmai-baedd', 'gwendolen-gwarchod'],
  maiwyn: ['meredyddwynn-hebog', 'maiwyn-gwarchod'],
  jinell: ['cynfarch-grawn', 'jinell-gwarchod'],
  gwernwy: ['brangwen-dyngwn', 'gwernwy-gwarchod'],
  waleran: ['waleran-gwarchod', 'yseut-saith'],
  tegan: ['tegan-gwarchod', 'wyett-tylluan'],
  sabrian: ['wynndie-ciarog', 'sabrian-gwarchod'],
  jeanae: ['rhisiart-crefyddol', 'jeanae-gwarchod'],
  gwen: ['dirmyg-dienyddiwr', 'gwen-gwarchod'],
  gwynndie: ['vaughan-eirth', 'gwynndie-gwarchod'],
  gwenya: ['march-sgwarnog', 'gwenya-gwarchod']
});

const PARENTS_BY_PARTNERSHIP = Object.freeze({
  'marriage-ector-morfudd-gwarchod': COUPLES.founders,
  'marriage-ysobel-drystan-chiffyddlon': COUPLES.drystan,
  'marriage-yvaine-garselid-teyrngarch': COUPLES.garselid,
  'marriage-maiwyn-meredyddwynn-gwarchod': COUPLES.maiwyn,
  'marriage-brangwen-gwernwy-dyngwn': COUPLES.gwernwy,
  'marriage-waleran-yseut-gwarchod': COUPLES.waleran,
  'marriage-wynndie-sabrian-ciarog': COUPLES.sabrian
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(
    childIds,
    PARENTS_BY_PARTNERSHIP[partnershipId],
    partnershipId,
    { idPrefix: 'gwarchod-parentage', ...options }
  );
}

function gapChildren(childIds) {
  return childrenOf(childIds, 'marriage-ector-morfudd-gwarchod', {
    type: 'claimed',
    certainty: 'probable',
    notes: 'Die Zwischen-Generationen sind in der Quelle nicht einzeln überliefert.',
    extensions: { timeJumpId: FOUNDER_TIME_JUMP_ID }
  });
}

function marriedAway(id, name, partnershipId, houseId, emblem = '') {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId: houseId.replace(/^house-/, 'haus-'),
    emblem,
    subtitle: `Wegverheiratet an ${name}`
  });
}

export const HOUSE_GWARCHOD_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-gwarchod',
    title: "Haus Gwarchod O'Glyndraith",
    motto: '',
    description: 'Dynastisch erloschenes Ritterfürstenhaus von Glyndraith im Ährental.',
    emblem: GWARCHOD_EMBLEM,
    houseProfile: AEHRENTAL_HOUSE_PROFILES.gwarchod
  },
  houses: [
    house(GWARCHOD_HOUSE_ID, "Haus Gwarchod O'Glyndraith", GWARCHOD_EMBLEM, 'extinct'),
    house('house-chiffyddlon', 'Haus Chiffyddlon', HOUSE_EMBLEMS.chiffyddlon, 'extinct'),
    house('house-gwefrydd', 'Haus Gwefrydd', HOUSE_EMBLEMS.gwefrydd),
    house('house-teyrngarch', 'Haus Teyrngarch', HOUSE_EMBLEMS.teyrngarch),
    house('house-sgwarnog', "Haus Sgwarnog O'Aldwynd", HOUSE_EMBLEMS.sgwarnog),
    house('house-baedd', "Haus Baedd O'Eirwyn", HOUSE_EMBLEMS.baedd),
    house('house-hebog', 'Haus Hebog'),
    house('house-grawn', "Haus Grawn O'Glyndraith", HOUSE_EMBLEMS.grawn),
    house('house-dyngwn', 'Haus Dyngwn', HOUSE_EMBLEMS.dyngwn),
    house('house-saith', 'Haus Saith'),
    house('house-tylluan', 'Haus Tylluan'),
    house('house-ciarog', "Haus Ciaróg O'Caer Diwedd", HOUSE_EMBLEMS.ciarog),
    house('house-crefyddol', 'Haus Crefyddol'),
    house('house-dienyddiwr', 'Haus Dienyddiwr', HOUSE_EMBLEMS.dienyddiwr),
    house('house-eirth', 'Haus Eirth')
  ],
  persons: [
    person('ector-founder-gwarchod', 'Ector Gwarchod', 'male', '????', '????'),
    spouse('morfudd-founder-gwarchod', 'Morfudd', 'female', '????', '????'),

    person('drystan-gwarchod', 'Drystan Gwarchod', 'male', '1608', '1683'),
    spouse('ysobel-chiffyddlon', 'Ysobel Chiffyddlon', 'female', '1607', '1672', 'house-chiffyddlon', {
      notes: 'Die Gwarchod-Quelle nennt 1609–1661; die ausgearbeitete Chiffyddlon-Herkunftsakte überliefert kanonisch 1607–1672.'
    }),
    awayWoman('gwendolyn-gwarchod', 'Gwendolyn Gwarchod', '1600', '1677', 'Haus Gwefrydd'),
    spouse('lyonel-gwefrydd', 'Lyonel Gwefrydd', 'male', '1597', '1667', 'house-gwefrydd'),

    person('garselid-gwarchod', 'Garselid Gwarchod', 'male', '1628', '1699'),
    spouse('yvaine-teyrngarch', 'Yvaine Teyrngarch', 'female', '1630', '1700', 'house-teyrngarch'),
    awayWoman('lynesse-gwarchod-sgwarnog', "Lynesse Gwarchod O'Glyndraith", '1629', '1701', 'Haus Sgwarnog'),
    spouse('mathonwy-sgwarnog', 'Mathonwy Sgwarnog', 'male', '1628', '1695', 'house-sgwarnog'),
    awayWoman('gwendolen-gwarchod', 'Gwendolen Gwarchod', '1630', '1709', 'Haus Baedd'),
    spouse('gwalchmai-baedd', 'Gwalchmai Baedd', 'male', '1630', '1701', 'house-baedd'),

    person('maiwyn-gwarchod', 'Maiwyn Gwarchod', 'male', '1648', '1717'),
    spouse('meredyddwynn-hebog', 'Meredyddwynn Hebog', 'female', '1654', '1720', 'house-hebog'),
    awayWoman('jinell-gwarchod', 'Jinell Gwarchod', '1650', '1699', 'Haus Grawn'),
    spouse('cynfarch-grawn', 'Cynfarch Grawn', 'male', '1648', '1703', 'house-grawn'),

    person('gwernwy-gwarchod', 'Gwernwy Gwarchod', 'male', '1674', '1720'),
    spouse('brangwen-dyngwn', 'Brangwen Dyngwn', 'female', '1679', '1720', 'house-dyngwn'),
    person('waleran-gwarchod', 'Waleran Gwarchod', 'male', '1676', '????', {
      status: 'dead',
      title: 'Einziger männlicher Überlebender von 1720 · später beim Blutbund gefallen',
      notes: 'Die Stammbaumgrafik nennt 1720 als Todesjahr. Die ausführlichere Hausgeschichte belegt jedoch, dass Waleran erst zehn Jahre nach dem Ende des Hauses aus nordmännischer Gefangenschaft zurückkehrte und später während eines Auftrags des Blutbundes starb; sein genaues Todesjahr bleibt unbekannt.'
    }),
    spouse('yseut-saith', 'Yseut Saith', 'female', '1677', '1720', 'house-saith'),
    awayWoman('tegan-gwarchod', 'Tegan Gwarchod', '1678', '', 'Haus Tylluan'),
    spouse('wyett-tylluan', 'Wyett Tylluan', 'male', '1676', '', 'house-tylluan'),
    person('sabrian-gwarchod', 'Sabrian Gwarchod', 'male', '1678', '1720'),
    spouse('wynndie-ciarog', 'Wynndie Ciaróg', 'female', '1678', '1720', 'house-ciarog'),

    awayWoman('jeanae-gwarchod', 'Jeanae Gwarchod', '1700', '', 'Haus Crefyddol'),
    spouse('rhisiart-crefyddol', 'Rhisiart Crefyddol', 'male', '1698', '', 'house-crefyddol'),
    person('delwyn-gwarchod', 'Delwyn Gwarchod', 'male', '1698', '1720'),
    awayWoman('gwen-gwarchod', 'Gwen Gwarchod', '1699', '', 'Haus Dienyddiwr'),
    spouse('dirmyg-dienyddiwr', 'Dirmyg Dienyddiwr', 'male', '1700', '', 'house-dienyddiwr'),
    awayWoman('gwynndie-gwarchod', 'Gwynndie Gwarchod', '1698', '', 'Haus Eirth'),
    spouse('vaughan-eirth', 'Vaughan Eirth', 'male', '1696', '', 'house-eirth'),
    awayWoman('gwenya-gwarchod', "Gwenya Gwarchod O'Glyndraith", '1700', '', 'Haus Sgwarnog'),
    spouse('march-sgwarnog', 'March Sgwarnog', 'male', '1698', '', 'house-sgwarnog')
  ],
  partnerships: [
    createMarriage('marriage-ector-morfudd-gwarchod', ...COUPLES.founders, { status: 'ended' }),
    createMarriage('marriage-ysobel-drystan-chiffyddlon', ...COUPLES.drystan, { status: 'ended', end: '1672' }),
    createMarriage('marriage-lyonel-gwendolyn', ...COUPLES.gwendolyn, { status: 'ended', end: '1667' }),
    createMarriage('marriage-yvaine-garselid-teyrngarch', ...COUPLES.garselid, { status: 'ended', end: '1699' }),
    createMarriage('marriage-lynesse-mathonwy-sgwarnog', ...COUPLES.lynesse, { status: 'ended', end: '1695' }),
    createMarriage('marriage-gwalchmai-gwendolen-baedd', ...COUPLES.gwendolen, { status: 'ended', end: '1701' }),
    createMarriage('marriage-maiwyn-meredyddwynn-gwarchod', ...COUPLES.maiwyn, { status: 'ended', end: '1717' }),
    createMarriage('marriage-cynfarch-jinell', ...COUPLES.jinell, { status: 'ended', end: '1699' }),
    createMarriage('marriage-brangwen-gwernwy-dyngwn', ...COUPLES.gwernwy, { status: 'ended', end: '1720' }),
    createMarriage('marriage-waleran-yseut-gwarchod', ...COUPLES.waleran, { status: 'ended', end: '1720' }),
    createMarriage('marriage-tegan-wyett-gwarchod', ...COUPLES.tegan),
    createMarriage('marriage-wynndie-sabrian-ciarog', ...COUPLES.sabrian, { status: 'ended', end: '1720' }),
    createMarriage('marriage-jeanae-rhisiart-gwarchod', ...COUPLES.jeanae),
    createMarriage('marriage-dirmyg-gwen-dienyddiwr', ...COUPLES.gwen),
    createMarriage('marriage-gwynndie-vaughan-gwarchod', ...COUPLES.gwynndie),
    createMarriage('marriage-march-gwenya-sgwarnog', ...COUPLES.gwenya)
  ],
  parentages: [
    ...gapChildren(['drystan-gwarchod', 'gwendolyn-gwarchod']),
    ...childrenOf(
      ['garselid-gwarchod', 'lynesse-gwarchod-sgwarnog', 'gwendolen-gwarchod'],
      'marriage-ysobel-drystan-chiffyddlon'
    ),
    ...childrenOf(['maiwyn-gwarchod', 'jinell-gwarchod'], 'marriage-yvaine-garselid-teyrngarch'),
    ...childrenOf(
      ['gwernwy-gwarchod', 'waleran-gwarchod', 'tegan-gwarchod', 'sabrian-gwarchod'],
      'marriage-maiwyn-meredyddwynn-gwarchod'
    ),
    ...childrenOf(['jeanae-gwarchod', 'delwyn-gwarchod'], 'marriage-brangwen-gwernwy-dyngwn'),
    ...childrenOf(['gwen-gwarchod'], 'marriage-waleran-yseut-gwarchod'),
    ...childrenOf(['gwynndie-gwarchod', 'gwenya-gwarchod'], 'marriage-wynndie-sabrian-ciarog')
  ],
  cadetBranches: [
    marriedAway('married-away-gwendolyn-gwarchod-gwefrydd', 'Haus Gwefrydd', 'marriage-lyonel-gwendolyn', 'house-gwefrydd', HOUSE_EMBLEMS.gwefrydd),
    marriedAway('married-away-lynesse-gwarchod-sgwarnog', 'Haus Sgwarnog', 'marriage-lynesse-mathonwy-sgwarnog', 'house-sgwarnog', HOUSE_EMBLEMS.sgwarnog),
    marriedAway('married-away-gwendolen-gwarchod-baedd', 'Haus Baedd', 'marriage-gwalchmai-gwendolen-baedd', 'house-baedd', HOUSE_EMBLEMS.baedd),
    marriedAway('married-away-jinell-gwarchod-grawn', 'Haus Grawn', 'marriage-cynfarch-jinell', 'house-grawn', HOUSE_EMBLEMS.grawn),
    marriedAway('married-away-tegan-gwarchod-tylluan', 'Haus Tylluan', 'marriage-tegan-wyett-gwarchod', 'house-tylluan'),
    marriedAway('married-away-jeanae-gwarchod-crefyddol', 'Haus Crefyddol', 'marriage-jeanae-rhisiart-gwarchod', 'house-crefyddol'),
    marriedAway('married-away-gwen-gwarchod-dienyddiwr', 'Haus Dienyddiwr', 'marriage-dirmyg-gwen-dienyddiwr', 'house-dienyddiwr', HOUSE_EMBLEMS.dienyddiwr),
    marriedAway('married-away-gwynndie-gwarchod-eirth', 'Haus Eirth', 'marriage-gwynndie-vaughan-gwarchod', 'house-eirth'),
    marriedAway('married-away-gwenya-gwarchod-sgwarnog', 'Haus Sgwarnog', 'marriage-march-gwenya-sgwarnog', 'house-sgwarnog', HOUSE_EMBLEMS.sgwarnog),
    createExtinctBranch({
      id: 'extinct-house-gwarchod',
      parentPersonId: 'gwernwy-gwarchod',
      houseId: GWARCHOD_HOUSE_ID,
      emblem: GWARCHOD_EMBLEM,
      notes: 'Gwernwy und sein Erbe Delwyn fielen 1720. Waleran galt damals als tot; die übrigen fortbestehenden Nachkommen waren bereits in andere Häuser verheiratet.',
      extensions: {
        sidePlacement: true,
        offshootSide: 'before'
      }
    })
  ],
  timeJumps: [
    {
      id: FOUNDER_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-ector-morfudd-gwarchod',
      parentPersonId: '',
      childIds: ['drystan-gwarchod', 'gwendolyn-gwarchod'],
      years: 0,
      fromYear: '????',
      toYear: '1600',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter Generationentrenner nach Gründerpaar und Hauswappen; erst darunter beginnen Drystan und Gwendolyn.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-ector-morfudd-gwarchod',
    houseId: GWARCHOD_HOUSE_ID,
    crestSubtitle: 'Erloschenes Ritterfürstenhaus von Glyndraith',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'ector-founder-gwarchod',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 1,
    sourceModule: "Haus Gwarchod O'Glyndraith (bereitgestellte Altdaten)",
    sourceNote: 'Genealogie, Lebensdaten, Amtsfolge und Porträtzuordnungen folgen der bereitgestellten Gwarchod-Hausseite und ihrer vollständigen Stammbaumgrafik. Ector und Morfudd bilden das Gründerpaar; der Hausknoten und der einzige Überlieferungssprung folgen strikt seriell, bevor Drystan und Gwendolyn erscheinen. Die Hauptlinie führt über Drystan, Garselid, Maiwyn und Gwernwy. Gwendolyn, Lynesse, Gwendolen, Jinell, Tegan, Jeanae, Gwen, Gwynndie und Gwenya erhalten direkte Wegverheiratet-Knoten zu ihren Zielhäusern. Zehn bereits ausgearbeitete Gegenbeziehungen verwenden identische Weltpersonen-, Partnerschafts- und Porträtzuordnungen. Kinder erscheinen nur in der fortführenden Akte: Ormund/Efa bei Gwefrydd, Maldwyn/Magwena/Myfanwy und Madog/Main bei Sgwarnog, Rhun/Gwlithen bei Baedd, Cloi bei Grawn sowie Tirian/Frewi bei Dienyddiwr; die eigentlichen Gwarchod-Nachkommen bleiben ausschließlich hier. Die Gwarchod-Quelle nennt für Ysobel 1609–1661, doch ihre Chiffyddlon-Herkunftsakte ist mit 1607–1672 maßgeblich. Umgekehrt korrigiert die Gwarchod-Herkunftsquelle Drystan auf 1608–1683. Walerans Tabellen-Todesjahr 1720 widerspricht der ausführlichen Hausgeschichte, nach der er erst um 1730 aus Gefangenschaft zurückkehrte und später beim Blutbund fiel; deshalb bleibt sein genaues Todesjahr unbekannt. Das Haus endet dynastisch 1720 mit Gwernwy und dem Erben Delwyn. Der Ausgestorben-Knoten steht seitlich parallel an Gwernwy; die übrigen Kinderlinien bleiben regulär darunter.',
    registryManagedExtensionFields: ['sourceNote'],
    registryManagedHouseProfileFields: [
      'rankId',
      'seat',
      'barony',
      'county',
      'kingdom',
      'liegeHouseId',
      'liegeHouseName',
      'secondarySeats',
      'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath']
  }
});
