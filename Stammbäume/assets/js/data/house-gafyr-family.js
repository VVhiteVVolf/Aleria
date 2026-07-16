import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { CELTIGERNS_WACHT_HOUSE_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_GAFYR_PORTRAITS } from './house-gafyr-portraits.js';

const HOUSE_EMBLEMS = Object.freeze({
  arwydd: 'assets/images/houses/haus-arwydd.png',
  draig: 'assets/images/houses/haus-draig.png',
  gafyr: 'assets/images/houses/haus-gafyr.png',
  gwefrydd: 'assets/images/houses/haus-gwefrydd.png',
  gwyvern: 'assets/images/houses/haus-gwyvern.png',
  saethwyr: 'assets/images/houses/haus-saethwyr.png',
  wyrm: 'assets/images/houses/haus-wyrm.png'
});

const GAFYR_HOUSE_ID = 'house-gafyr';

function person(id, name, sex, birth = '', death = '', houseId = GAFYR_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_GAFYR_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === GAFYR_HOUSE_ID ? 'core' : 'married'),
    ...options
  });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

const GARYM_FAMILY_IDS = ['garym-gafyr', 'fiodhna-talamh'];
const KYNWRIG_FAMILY_IDS = ['kynwrig-gafyr', 'elinowyn-draig'];
const RHEIDWYN_FAMILY_IDS = ['rheidwyn-gafyr', 'heulwen-gwefrydd'];
const MALDWYN_FAMILY_IDS = ['maldwyn-gafyr', 'eurolwyn-draig'];
const MAIRWYN_FAMILY_IDS = ['mairwyn-gafyr', 'limwris-saethwyr'];
const MATHONWY_FAMILY_IDS = ['mathonwy-gafyr', 'lynesse-wyrm-1598'];
const HWYVEL_FAMILY_IDS = ['hwyvel-gafyr', 'olwen-draig'];
const GERWYN_FAMILY_IDS = ['gerwyn-gafyr', 'siobhan-gallchobhair'];
const UTHER_FAMILY_IDS = ['uther-gafyr', 'owena-tir-addawol'];
const DUNCAN_FAMILY_IDS = ['duncan-gafyr', 'morfudd-gwialen'];
const FERYDNAND_FAMILY_IDS = ['ferydnand-gafyr', 'niniel-mwyalchen'];
const HYWELL_FAMILY_IDS = ['hywell-gafyr', 'tallula-eirce'];
const EGON_FAMILY_IDS = ['egon-gafyr', 'alicyn-draig'];
const RHEINALLT_FAMILY_IDS = ['rheinallt-gafyr', 'ffion-gwefrydd'];
const RODERIC_FAMILY_IDS = ['roderic-gafyr', 'eleri-marwolaeth'];
const KELYDDON_FAMILY_IDS = ['kelyddon-gafyr', 'izolda-arwydd'];

export const HOUSE_GAFYR_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-gafyr',
    title: 'Haus Gafyr',
    motto: '',
    description: "Die überlieferte Linie der Familie Gafyr O'Gwynthor von Garym dem Gehörnten bis zur Generation von 1724.",
    emblem: HOUSE_EMBLEMS.gafyr,
    houseProfile: CELTIGERNS_WACHT_HOUSE_PROFILES.gafyr
  },
  houses: [
    house('house-gafyr', 'Haus Gafyr', HOUSE_EMBLEMS.gafyr),
    house('house-talamh', 'Haus Talamh'),
    house('house-draig', 'Haus Draig', HOUSE_EMBLEMS.draig),
    house('house-gwefrydd', 'Haus Gwefrydd', HOUSE_EMBLEMS.gwefrydd),
    house('house-saethwyr', 'Haus Saethwyr', HOUSE_EMBLEMS.saethwyr),
    house('house-wyrm', 'Haus Wyrm', HOUSE_EMBLEMS.wyrm),
    house('house-gwyvern', 'Haus Gwyvern', HOUSE_EMBLEMS.gwyvern),
    house('house-creyr', 'Haus Créyr'),
    house('house-gallchobhair', 'Haus Gallchobhair'),
    house('house-aderyn', 'Haus Aderyn'),
    house('house-tir-addawol', 'Haus Tir Addawol'),
    house('house-gwialen', 'Haus Gwialen'),
    house('house-lwynog', 'Haus Lwynog'),
    house('house-mwyalchen', 'Haus Mwyalchen'),
    house('house-eirce', 'Haus Eirce'),
    house('house-marwolaeth', 'Haus Marwolaeth'),
    house('house-crafanc', 'Haus Crafanc'),
    house('house-arwydd', 'Haus Arwydd', HOUSE_EMBLEMS.arwydd)
  ],
  persons: [
    // Älteste bekannte Generation und das spätere Gründerpaar der belegten Hauslinie
    person('garym-gafyr', 'Garym der Gehörnte', 'male', '????', '????', GAFYR_HOUSE_ID, { status: 'dead' }),
    person('fiodhna-talamh', 'Fíodhna Talamh', 'female', '????', '????', 'house-talamh', { status: 'dead' }),
    person('kynwrig-gafyr', 'Kynwrig', 'male', '????', '????', GAFYR_HOUSE_ID, { status: 'dead' }),
    person('elinowyn-draig', 'Elinowyn Draig', 'female', '????', '????', 'house-draig', { status: 'dead' }),

    // Erste nach der Überlieferungslücke wieder genannte Geschwister
    person('rheidwyn-gafyr', 'Rheidwyn', 'male', '????', '????', GAFYR_HOUSE_ID, { status: 'dead' }),
    person('sianwyn-gafyr', 'Sianwyn', 'female', '????', '????', GAFYR_HOUSE_ID, { status: 'dead' }),
    person('heulwen-gwefrydd', 'Heulwen Gwefrydd', 'female', '????', '????', 'house-gwefrydd', { status: 'dead' }),
    person('kynwrig-draig', 'Kynwrig Draig', 'male', '????', '????', 'house-draig', { status: 'dead' }),

    // Zweite frühe Generation
    person('maldwyn-gafyr', 'Maldwyn', 'male', '1249', '1312'),
    person('mairwyn-gafyr', 'Mairwyn', 'female', '1251', '1312'),
    person('eurolwyn-draig', 'Eurolwyn Draig', 'female', '1250', '1312', 'house-draig'),
    person('limwris-saethwyr', 'Limwris Saethwyr', 'male', '1250', '1300', 'house-saethwyr'),

    // Nach der großen Überlieferungslücke
    person('mathonwy-gafyr', 'Mathonwy', 'male', '1593', '1659'),
    person('igraine-gafyr', 'Igraine', 'female', '1598', '1672'),
    person('isotta-gafyr', 'Isotta', 'female', '1597', '1664'),
    person('lynesse-wyrm-1598', 'Lynesse Wyrm', 'female', '1598', '1666', 'house-wyrm', {
      worldPersonId: 'person--haus-wyrm--lynesse-wyrm-1598'
    }),
    person('gwrddnei-gwyvern', 'Gwrddnei Gwyvern', 'male', '1600', '1667', 'house-gwyvern'),
    person('greidyawl-gwefrydd', 'Greidyawl Gwefrydd', 'male', '1598', '1661', 'house-gwefrydd'),

    // Hauptlinie Mathonwys
    person('hwyvel-gafyr', 'Hwyvel', 'male', '1615', '1679'),
    person('rhiannon-gafyr', 'Rhiannon', 'female', '1625', '1702'),
    person('olwen-draig', 'Olwen Draig', 'female', '1619', '1681', 'house-draig'),
    person('grippiud-creyr', 'Grippiud Créyr', 'male', '1625', '1701', 'house-creyr'),

    // Kinder von Hwyvel und Olwen
    person('gerwyn-gafyr', 'Gerwyn', 'male', '1644', '1708'),
    person('braith-gafyr-1648', 'Braith', 'unknown', '1648', '1702'),
    person('uther-gafyr', 'Uther', 'male', '1650', '1711'),
    person('siobhan-gallchobhair', 'Siobhan Gallchobhair', 'female', '1648', '1711', 'house-gallchobhair'),
    person('carnedyr-aderyn', 'Carnedyr Aderyn', 'unknown', '1647', '1720', 'house-aderyn'),
    person('owena-tir-addawol', 'Owena Tir Addawol', 'female', '1652', '1729', 'house-tir-addawol'),

    // Generation 1670 bis 1680
    person('duncan-gafyr', 'Duncan', 'male', '1670'),
    person('bronwyn-gafyr', 'Bronwyn', 'female', '1672'),
    person('ferydnand-gafyr', 'Ferydnand', 'male', '1674'),
    person('hywell-gafyr', 'Hywell', 'male', '1677'),
    person('morfudd-gwialen', 'Morfudd Gwialen', 'female', '1676', '', 'house-gwialen'),
    person('grufydd-aderyn', 'Grufydd Aderyn', 'male', '1670', '', 'house-aderyn'),
    person('niniel-mwyalchen', 'Niniel Mwyalchen', 'female', '1678', '', 'house-mwyalchen'),
    person('tallula-eirce', 'Tallula Eirce', 'female', '1680', '', 'house-eirce'),

    // Generation 1694 bis 1700
    person('egon-gafyr', 'Egon', 'male', '1694', '', GAFYR_HOUSE_ID, {
      title: 'Marschall der Grafschaft Celtigerns Wacht',
      tags: ['Almanach-Charakter'],
      notes: 'Im AleriaAlmanach als Sir Egon Gafyr geführt.'
    }),
    person('aerwyn-gafyr', 'Aerwyn', 'female', '1699'),
    person('rheinallt-gafyr', 'Rheinallt', 'male', '1694'),
    person('heledd-gafyr', 'Heledd', 'female', '1696'),
    person('roderic-gafyr', 'Roderic', 'male', '1699'),
    person('kelyddon-gafyr', 'Kelyddon', 'male', '1698', '', GAFYR_HOUSE_ID, {
      worldPersonId: 'person--haus-gafyr--kelyddon-gafyr'
    }),
    person('alicyn-draig', 'Alicyn Draig', 'female', '1697', '', 'house-draig'),
    person('tudwallon-lwynog', 'Tudwallon Lwynog', 'male', '1695', '', 'house-lwynog'),
    person('ffion-gwefrydd', 'Ffion Gwefrydd', 'female', '1700', '', 'house-gwefrydd'),
    person('eleri-marwolaeth', 'Eleri Marwolaeth', 'female', '1698', '', 'house-marwolaeth'),
    person('izolda-arwydd', 'Izolda Arwydd', 'female', '1701', '', 'house-arwydd', {
      worldPersonId: 'person--haus-arwydd--izolda-arwydd'
    }),

    // Jüngste benannte Generation
    person('alwyn-gafyr', 'Alwyn', 'male', '1719'),
    person('rhys-gafyr', 'Rhys', 'male', '1721'),
    person('skywyn-gafyr', 'Skywyn', 'male', '1723'),
    person('gwenna-crafanc', 'Gwenna Crafanc', 'female', '1716', '', 'house-crafanc', {
      familyRole: 'ward',
      notes: 'Mündel Egon Gafyrs.'
    }),
    person('slevin-gafyr', 'Slevin', 'male', '1720'),
    person('lefraye-gafyr', 'Lefraye', 'unknown', '1722'),
    person('rheu-gafyr', 'Rheu', 'unknown', '1721'),
    person('braith-gafyr-1724', 'Braith', 'unknown', '1724'),
    person('gildas-gafyr', 'Gildas', 'male', '1722'),
    person('uthyr-gafyr', 'Uthyr', 'male', '1724')
  ],
  partnerships: [
    createMarriage('marriage-garym-fiodhna', ...GARYM_FAMILY_IDS),
    createMarriage('marriage-kynwrig-elinowyn', ...KYNWRIG_FAMILY_IDS),
    createMarriage('marriage-rheidwyn-heulwen', ...RHEIDWYN_FAMILY_IDS),
    createMarriage('marriage-sianwyn-kynwrig-draig', 'sianwyn-gafyr', 'kynwrig-draig'),
    createMarriage('marriage-maldwyn-eurolwyn', 'maldwyn-gafyr', 'eurolwyn-draig'),
    createMarriage('marriage-mairwyn-limwris', ...MAIRWYN_FAMILY_IDS),
    createMarriage('marriage-mathonwy-lynesse', ...MATHONWY_FAMILY_IDS),
    createMarriage('marriage-igraine-gwrddnei', 'igraine-gafyr', 'gwrddnei-gwyvern'),
    createMarriage('marriage-isotta-greidyawl', 'isotta-gafyr', 'greidyawl-gwefrydd'),
    createMarriage('marriage-hwyvel-olwen', ...HWYVEL_FAMILY_IDS),
    createMarriage('marriage-rhiannon-grippiud', 'rhiannon-gafyr', 'grippiud-creyr'),
    createMarriage('marriage-gerwyn-siobhan', ...GERWYN_FAMILY_IDS),
    createMarriage('marriage-braith-carnedyr', 'braith-gafyr-1648', 'carnedyr-aderyn'),
    createMarriage('marriage-uther-owena', ...UTHER_FAMILY_IDS),
    createMarriage('marriage-duncan-morfudd', ...DUNCAN_FAMILY_IDS),
    createMarriage('marriage-bronwyn-grufydd', 'bronwyn-gafyr', 'grufydd-aderyn'),
    createMarriage('marriage-ferydnand-niniel', ...FERYDNAND_FAMILY_IDS),
    createMarriage('marriage-hywell-tallula', ...HYWELL_FAMILY_IDS),
    createMarriage('marriage-egon-alicyn', ...EGON_FAMILY_IDS),
    createMarriage('marriage-aerwyn-tudwallon', 'aerwyn-gafyr', 'tudwallon-lwynog'),
    createMarriage('marriage-rheinallt-ffion', ...RHEINALLT_FAMILY_IDS),
    createMarriage('marriage-roderic-eleri', ...RODERIC_FAMILY_IDS),
    createMarriage('marriage-kelyddon-izolda', ...KELYDDON_FAMILY_IDS)
  ],
  parentages: [
    ...createParentages(['kynwrig-gafyr'], GARYM_FAMILY_IDS, 'marriage-garym-fiodhna'),
    ...createParentages(
      ['rheidwyn-gafyr', 'sianwyn-gafyr'],
      KYNWRIG_FAMILY_IDS,
      'marriage-kynwrig-elinowyn',
      { type: 'claimed', notes: 'Zwischen Kynwrigs Generation und diesen Nachkommen fehlen einzelne Überlieferungsglieder.' }
    ),
    ...createParentages(
      ['maldwyn-gafyr', 'mairwyn-gafyr'],
      RHEIDWYN_FAMILY_IDS,
      'marriage-rheidwyn-heulwen',
      {
        type: 'claimed',
        notes: 'Die Vorlage markiert hier eine weitere nicht vollständig überlieferte Folge.',
        extensions: { timeJumpId: 'gap-rheidwyn-maldwyn' }
      }
    ),
    ...createParentages(
      ['mathonwy-gafyr', 'igraine-gafyr', 'isotta-gafyr'],
      MALDWYN_FAMILY_IDS,
      'marriage-maldwyn-eurolwyn',
      {
        type: 'claimed',
        notes: 'Die belegte Linie setzt nach mehreren Jahrhunderten wieder ein.',
        extensions: { timeJumpId: 'gap-maldwyn-mathonwy' }
      }
    ),
    ...createParentages(['hwyvel-gafyr', 'rhiannon-gafyr'], MATHONWY_FAMILY_IDS, 'marriage-mathonwy-lynesse'),
    ...createParentages(['gerwyn-gafyr', 'braith-gafyr-1648', 'uther-gafyr'], HWYVEL_FAMILY_IDS, 'marriage-hwyvel-olwen'),
    ...createParentages(['duncan-gafyr', 'bronwyn-gafyr', 'ferydnand-gafyr'], GERWYN_FAMILY_IDS, 'marriage-gerwyn-siobhan'),
    ...createParentages(['hywell-gafyr'], UTHER_FAMILY_IDS, 'marriage-uther-owena'),
    ...createParentages(['egon-gafyr', 'aerwyn-gafyr'], DUNCAN_FAMILY_IDS, 'marriage-duncan-morfudd'),
    ...createParentages(['rheinallt-gafyr', 'heledd-gafyr', 'roderic-gafyr'], FERYDNAND_FAMILY_IDS, 'marriage-ferydnand-niniel'),
    ...createParentages(['kelyddon-gafyr'], HYWELL_FAMILY_IDS, 'marriage-hywell-tallula'),
    ...createParentages(['alwyn-gafyr', 'rhys-gafyr', 'skywyn-gafyr'], EGON_FAMILY_IDS, 'marriage-egon-alicyn'),
    ...createParentages(['gwenna-crafanc'], ['egon-gafyr'], '', {
      type: 'foster',
      notes: 'Gwenna Crafanc ist in der Quelle ausdrücklich als Egons Mündel verzeichnet.'
    }),
    ...createParentages(['slevin-gafyr', 'lefraye-gafyr'], RHEINALLT_FAMILY_IDS, 'marriage-rheinallt-ffion'),
    ...createParentages(['rheu-gafyr', 'braith-gafyr-1724'], RODERIC_FAMILY_IDS, 'marriage-roderic-eleri'),
    ...createParentages(['gildas-gafyr', 'uthyr-gafyr'], KELYDDON_FAMILY_IDS, 'marriage-kelyddon-izolda')
  ],
  lineage: {
    founderPartnershipId: 'marriage-kynwrig-elinowyn',
    houseId: GAFYR_HOUSE_ID,
    crestSubtitle: '',
    crestEmblemScale: 0.8,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  cadetBranches: [
    createMarriedAwayBranch({
      id: 'married-away-draig-sianwyn',
      name: 'Haus Draig',
      parentPartnershipId: 'marriage-sianwyn-kynwrig-draig',
      houseId: 'house-draig',
      targetFamilyId: 'haus-draig'
    }),
    createMarriedAwayBranch({
      id: 'married-away-saethwyr-mairwyn',
      name: 'Haus Saethwyr',
      parentPartnershipId: 'marriage-mairwyn-limwris',
      houseId: 'house-saethwyr',
      targetFamilyId: 'haus-saethwyr'
    }),
    createMarriedAwayBranch({
      id: 'married-away-gwyvern',
      name: 'Haus Gwyvern',
      parentPartnershipId: 'marriage-igraine-gwrddnei',
      houseId: 'house-gwyvern',
      targetFamilyId: 'haus-gwyvern'
    }),
    createMarriedAwayBranch({
      id: 'married-away-gwefrydd',
      name: 'Haus Gwefrydd',
      parentPartnershipId: 'marriage-isotta-greidyawl',
      houseId: 'house-gwefrydd',
      targetFamilyId: 'haus-gwefrydd'
    }),
    createMarriedAwayBranch({
      id: 'married-away-creyr',
      name: 'Haus Créyr',
      parentPartnershipId: 'marriage-rhiannon-grippiud',
      houseId: 'house-creyr',
      targetFamilyId: 'haus-creyr'
    }),
    createMarriedAwayBranch({
      id: 'married-away-aderyn-braith',
      name: 'Haus Aderyn',
      parentPartnershipId: 'marriage-braith-carnedyr',
      houseId: 'house-aderyn',
      targetFamilyId: 'haus-aderyn'
    }),
    createMarriedAwayBranch({
      id: 'married-away-aderyn-bronwyn',
      name: 'Haus Aderyn',
      parentPartnershipId: 'marriage-bronwyn-grufydd',
      houseId: 'house-aderyn',
      targetFamilyId: 'haus-aderyn'
    }),
    createMarriedAwayBranch({
      id: 'married-away-lwynog',
      name: 'Haus Lwynog',
      parentPartnershipId: 'marriage-aerwyn-tudwallon',
      houseId: 'house-lwynog',
      targetFamilyId: 'haus-lwynog'
    })
  ],
  timeJumps: [
    {
      id: 'gap-rheidwyn-maldwyn',
      parentPartnershipId: 'marriage-rheidwyn-heulwen',
      childIds: ['maldwyn-gafyr', 'mairwyn-gafyr'],
      years: 0,
      fromYear: '????',
      toYear: '1249',
      label: 'Die nächste belegte Generation beginnt mit Maldwyn und Mairwyn',
      notes: 'Die Vorlage kennzeichnet zwischen Rheidwyns Generation und Maldwyn/Mairwyn eine nicht einzeln benannte Folge.',
      extensions: {}
    },
    {
      id: 'gap-maldwyn-mathonwy',
      parentPartnershipId: 'marriage-maldwyn-eurolwyn',
      childIds: ['mathonwy-gafyr', 'igraine-gafyr', 'isotta-gafyr'],
      years: 281,
      fromYear: '1312',
      toYear: '1593',
      label: 'Die belegte Linie setzt 1593 wieder ein',
      notes: 'Die dazwischenliegenden Generationen sind in der Vorlage nicht einzeln benannt.',
      extensions: {}
    }
  ],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'garym-gafyr',
    orientation: 'vertical',
    ancestorDepth: 12,
    descendantDepth: 12,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Personen, Portraitzuordnungen, Lebensdaten und Beziehungen nach der bereitgestellten Gafyr-Tabelle und Stammbaumgrafik. Querverbindungen zu Wyrm, Arwydd und zum Almanach verwenden gemeinsame feste Personen-IDs.',
    blankFamily: false,
    sourceRevision: 1
  }
});
