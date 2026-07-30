import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_CEIRWYN_PORTRAITS } from './house-ceirwyn-portraits.js';
import {
  VORTIGERNS_RUH_HOUSE_EMBLEMS,
  VORTIGERNS_RUH_HOUSE_PROFILES
} from './vortigerns-ruh-house-profiles.js';

const CEIRWYN_HOUSE_ID = 'house-ceirwyn';
const CEIRWYN_EMBLEM = VORTIGERNS_RUH_HOUSE_EMBLEMS.ceirwyn;

const HOUSE_EMBLEMS = Object.freeze({
  ceirwyn: CEIRWYN_EMBLEM,
  dienyddiwr: VORTIGERNS_RUH_HOUSE_EMBLEMS.dienyddiwr,
  draig: 'assets/images/houses/Llamreis Ankunft/haus-draig.png',
  dyngwn: VORTIGERNS_RUH_HOUSE_EMBLEMS.dyngwn,
  grael: VORTIGERNS_RUH_HOUSE_EMBLEMS.grael,
  gwefrydd: 'assets/images/houses/Artus Streben/haus-gwefrydd.png',
  illewod: 'assets/images/houses/Sonnenküste/haus-illewod.png',
  marwolaeth: VORTIGERNS_RUH_HOUSE_EMBLEMS.marwolaeth,
  pendrag: VORTIGERNS_RUH_HOUSE_EMBLEMS.pendrag,
  saethwyr: 'assets/images/houses/Llamreis Ankunft/haus-saethwyr.png'
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

function person(id, name, sex, birth, death = '', options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId: options.houseId === undefined ? CEIRWYN_HOUSE_ID : options.houseId,
    portrait: HOUSE_CEIRWYN_PORTRAITS[id] || '',
    familyRole: options.familyRole || 'core',
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

function spouse(id, name, sex, birth, death = '', options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    houseId: options.houseId || '',
    familyRole: 'married',
    lineageRole: 'branch'
  });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

const COUPLES = Object.freeze({
  founders: ['rhoslyn-pendrag', 'ceirwyn-inlaw'],
  gorsedd: ['gorsedd-ceirwyn', 'sunniva-sterkr'],
  gwenith: ['rheinallt-grael', 'gwenith-ceirwyn'],
  caedmon: ['caedmon-ceirwyn', 'aslaug-skald'],
  kerrilynn: ['kerrilynn-ceirwyn', 'eochaidh-urquhart'],
  gruffudd: ['gruffudd-ceirwyn', 'magnhild-sokaren'],
  eirwenna: ['eirwenna-ceirwyn', 'seaghdha-bhaird'],
  gwennoeth: ['gwennoeth-ceirwyn', 'dewey-dyngwn'],
  cerridwyn: ['kelyddon-grael', 'cerridwyn-ceirwyn'],
  taliesin: ['ariana-grael', 'taliesin-ceirwyn'],
  aranrhod: ['aranrhod-ceirwyn', 'piet-ridderspore'],
  morgan: ['morgan-ceirwyn', 'astrid-sterkr'],
  edwyn: ['edwyn-ceirwyn', 'fenella-bhaird'],
  land: ['arthgal-illewod', 'land-ceirwyn'],
  merlion: ['merlion-ceirwyn', 'irnskar-brathfengr'],
  talla: ['rywalyn-pendrag', 'talla-ceirwyn'],
  dilys: ['dilys-ceirwyn', 'grugyn-dyngwn'],
  maelona: ['renly-gwefrydd', 'maelona-ceirwyn'],
  rihanna: ['trayvon-draig', 'rihanna-ceirwynn'],
  mandon: ['mandon-ceirwyn', 'antke-skald'],
  melvor: ['melvor-ceirwyn', 'marge-ridderspore'],
  madoc: ['madoc-ceirwyn', 'psylia-adorin'],
  maelys: ['anwyll-saethwyr', 'maelys-ceirwyn'],
  dagonet: ['dagonet-ceirwyn', 'liska-sokaren'],
  uthred: ['uthred-ceirwyn', 'brunhilde-sokering'],
  rhiann: ['rhiann-ceirwyn', 'meurig-marwolaeth'],
  rhyannon: ['rhyannon-ceirwyn', 'robyn-dienyddiwr'],
  arian: ['arian-ceirwyn', 'alastriona-morath']
});

const PARENTS_BY_PARTNERSHIP = Object.freeze({
  'marriage-rhoslyn-ceirwyn': COUPLES.founders,
  'marriage-gorsedd-sunniva-ceirwyn': COUPLES.gorsedd,
  'marriage-caedmon-aslaug-ceirwyn': COUPLES.caedmon,
  'marriage-gruffudd-magnhild-ceirwyn': COUPLES.gruffudd,
  'marriage-ariana-taliesin-ceirwyn': COUPLES.taliesin,
  'marriage-morgan-astrid-ceirwyn': COUPLES.morgan,
  'marriage-edwyn-fenella-ceirwyn': COUPLES.edwyn,
  'marriage-merlion-irnskar-ceirwyn': COUPLES.merlion,
  'marriage-mandon-antke-ceirwyn': COUPLES.mandon,
  'marriage-melvor-marge-ceirwyn': COUPLES.melvor,
  'marriage-madoc-psylia-ceirwyn': COUPLES.madoc,
  'marriage-dagonet-liska-ceirwyn': COUPLES.dagonet,
  'marriage-uthred-brunhilde-ceirwyn': COUPLES.uthred,
  'marriage-arian-alastriona-ceirwyn': COUPLES.arian
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(
    childIds,
    PARENTS_BY_PARTNERSHIP[partnershipId],
    partnershipId,
    { idPrefix: 'ceirwyn-parentage', ...options }
  );
}

function marriedAway(id, name, partnershipId, houseId, options = {}) {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId: houseId.replace(/^house-/, 'haus-'),
    emblem: options.emblem || '',
    subtitle: options.subtitle || `Wegverheiratet an ${name}`,
    notes: options.notes || ''
  });
}

export const HOUSE_CEIRWYN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-ceirwyn',
    title: "Haus Ceirwyn O'Calon",
    motto: 'Gallu mewn canu, Nerth mewn cleddyf, Anrhydedd yn y galon.',
    description: 'Baronenhaus von Calon, dessen Aufstieg mit der Gründung der Stadt und den Prüfungen König Malon Pendrags verbunden ist. Haus Ceirwyn prägt Calon als Handels- und Kulturzentrum durch Kunst, Musik und politische Raffinesse.',
    emblem: CEIRWYN_EMBLEM,
    houseProfile: VORTIGERNS_RUH_HOUSE_PROFILES.ceirwyn
  },
  houses: [
    house(CEIRWYN_HOUSE_ID, "Haus Ceirwyn O'Calon", CEIRWYN_EMBLEM),
    house('house-pendrag', 'Haus Pendrag', HOUSE_EMBLEMS.pendrag),
    house('house-sterkr', 'Haus Sterkr'),
    house('house-grael', 'Haus Grael', HOUSE_EMBLEMS.grael),
    house('house-skald', 'Haus Skald'),
    house('house-urquhart', 'Haus Urquhart'),
    house('house-sokaren', 'Haus Sökaren'),
    house('house-bhaird', 'Haus Bhaird'),
    house('house-dyngwn', 'Haus Dyngwn', HOUSE_EMBLEMS.dyngwn),
    house('house-ridderspore', 'Haus Ridderspore'),
    house('house-illewod', 'Haus Illewod', HOUSE_EMBLEMS.illewod),
    house('house-brathfengr', 'Haus Brathfengr'),
    house('house-gwefrydd', 'Haus Gwefrydd', HOUSE_EMBLEMS.gwefrydd),
    house('house-draig', 'Haus Draig', HOUSE_EMBLEMS.draig),
    house('house-adorin', 'Haus Adorin'),
    house('house-saethwyr', 'Haus Saethwyr', HOUSE_EMBLEMS.saethwyr),
    house('house-sokering', 'Haus Sökering'),
    house('house-marwolaeth', 'Haus Marwolaeth', HOUSE_EMBLEMS.marwolaeth),
    house('house-dienyddiwr', 'Haus Dienyddiwr', HOUSE_EMBLEMS.dienyddiwr),
    house('house-morath', 'Haus Morath')
  ],
  persons: [
    person('ceirwyn-inlaw', 'Ceirwyn', 'male', '????', '????', {
      title: 'Gründer des Hauses Ceirwyn · Baron von Calon',
      lineageRole: 'head'
    }),
    spouse('rhoslyn-pendrag', 'Rhoslyn Pendrag', 'female', '????', '????', {
      houseId: 'house-pendrag',
      title: 'Mitgründerin des Hauses Ceirwyn'
    }),

    person('gorsedd-ceirwyn', 'Gorsedd Ceirwyn', 'male', '1259', '1392', {
      title: 'Baron des Hauses Ceirwyn bis 1392',
      lineageRole: 'head'
    }),
    person('tetra-ceirwyn', 'Tetra Ceirwyn', 'female', '1257', '????'),
    person('gwenith-ceirwyn', 'Gwenith Ceirwyn', 'female', '1256', '1399', {
      title: 'Wegverheiratet an Haus Grael',
      tags: ['Wegverheiratet']
    }),
    spouse('sunniva-sterkr', 'Sunniva Sterkr', 'female', '1261', '1359', {
      houseId: 'house-sterkr'
    }),
    spouse('rheinallt-grael', 'Rheinallt Grael', 'male', '1250', '1412', {
      houseId: 'house-grael'
    }),

    person('caedmon-ceirwyn', 'Caedmon Ceirwyn', 'male', '1589', '1650', {
      title: 'Baron des Hauses Ceirwyn bis 1650',
      lineageRole: 'head'
    }),
    person('kerrilynn-ceirwyn', 'Kerrilynn Ceirwyn', 'female', '1592', '1677', {
      title: 'Wegverheiratet an Haus Urquhart',
      tags: ['Wegverheiratet']
    }),
    spouse('aslaug-skald', 'Aslaug Skald', 'female', '1592', '1690', {
      houseId: 'house-skald'
    }),
    spouse('eochaidh-urquhart', 'Eochaidh Urquhart', 'male', '1590', '1652', {
      houseId: 'house-urquhart'
    }),

    person('gruffudd-ceirwyn', 'Gruffudd Ceirwyn', 'male', '1610', '1681', {
      title: 'Baron des Hauses Ceirwyn von 1650 bis 1681',
      lineageRole: 'head'
    }),
    person('eirwenna-ceirwyn', 'Eirwenna Ceirwyn', 'female', '1619', '1701', {
      title: 'Wegverheiratet an Haus Bhaird',
      tags: ['Wegverheiratet']
    }),
    person('gwennoeth-ceirwyn', 'Gwennoeth Ceirwyn', 'female', '1613', '1706', {
      title: 'Wegverheiratet an Haus Dyngwn',
      tags: ['Wegverheiratet']
    }),
    spouse('magnhild-sokaren', 'Magnhild Sökaren', 'female', '1619', '1698', {
      houseId: 'house-sokaren'
    }),
    spouse('seaghdha-bhaird', 'Seaghdha Bhaird', 'male', '1619', '1688', {
      houseId: 'house-bhaird'
    }),
    spouse('dewey-dyngwn', 'Dewey Dyngwn', 'male', '1613', '1700', {
      houseId: 'house-dyngwn'
    }),

    person('cerridwyn-ceirwyn', 'Cerridwyn Ceirwyn', 'female', '1646', '1729', {
      title: 'Wegverheiratet an Haus Grael',
      tags: ['Wegverheiratet']
    }),
    person('taliesin-ceirwyn', 'Taliesin Ceirwyn', 'male', '1641', '1700', {
      title: 'Baron des Hauses Ceirwyn von 1681 bis 1700',
      lineageRole: 'head'
    }),
    person('aranrhod-ceirwyn', 'Aranrhod Ceirwyn', 'female', '1650', '1730', {
      title: 'Wegverheiratet an Haus Ridderspore',
      tags: ['Wegverheiratet']
    }),
    spouse('kelyddon-grael', 'Kelyddon Grael', 'male', '1649', '1720', {
      houseId: 'house-grael'
    }),
    spouse('ariana-grael', 'Ariana Grael', 'female', '1647', '1717', {
      houseId: 'house-grael'
    }),
    spouse('piet-ridderspore', 'Piet Ridderspore', 'male', '1647', '1724', {
      houseId: 'house-ridderspore'
    }),

    person('morgan-ceirwyn', 'Morgan Ceirwyn', 'male', '1661', '1720', {
      title: 'Baron des Hauses Ceirwyn von 1700 bis 1720',
      lineageRole: 'head'
    }),
    person('edwyn-ceirwyn', 'Edwyn Ceirwyn', 'male', '1665', ''),
    person('land-ceirwyn', 'Land Ceirwyn', 'female', '1669', '', {
      title: 'Wegverheiratet an Haus Illewod',
      tags: ['Wegverheiratet']
    }),
    person('merlion-ceirwyn', 'Merlion Ceirwyn', 'male', '1669', ''),
    person('talla-ceirwyn', 'Talla Ceirwyn', 'female', '1670', '1720', {
      title: 'Wegverheiratet an Haus Pendrag',
      tags: ['Wegverheiratet']
    }),
    person('dilys-ceirwyn', 'Dilys Ceirwyn', 'female', '1673', '', {
      title: 'Wegverheiratet an Haus Dyngwn',
      tags: ['Wegverheiratet']
    }),
    person('maelona-ceirwyn', 'Maelona Ceirwyn', 'female', '1674', '', {
      title: 'Wegverheiratet an Haus Gwefrydd',
      tags: ['Wegverheiratet']
    }),
    person('rihanna-ceirwynn', 'Rihanna Ceirwyn', 'female', '1678', '', {
      title: 'Wegverheiratet an Haus Draig',
      tags: ['Wegverheiratet']
    }),
    spouse('astrid-sterkr', 'Astrid Sterkr', 'female', '1670', '1720', {
      houseId: 'house-sterkr'
    }),
    spouse('fenella-bhaird', 'Fenella Bhaird', 'female', '1669', '', {
      houseId: 'house-bhaird'
    }),
    spouse('arthgal-illewod', 'Arthgal Illewod', 'male', '1664', '1720', {
      houseId: 'house-illewod'
    }),
    spouse('irnskar-brathfengr', 'Irnskar Brathfengr', 'female', '1674', '', {
      houseId: 'house-brathfengr'
    }),
    spouse('rywalyn-pendrag', 'Rywalyn Pendrag', 'male', '1663', '1720', {
      houseId: 'house-pendrag'
    }),
    spouse('grugyn-dyngwn', 'Grugyn Dyngwn', 'male', '1673', '', {
      houseId: 'house-dyngwn'
    }),
    spouse('renly-gwefrydd', 'Renly Gwefrydd', 'male', '1670', '1720', {
      houseId: 'house-gwefrydd'
    }),
    spouse('trayvon-draig', 'Trayvon Draig', 'male', '1677', '1720', {
      houseId: 'house-draig'
    }),

    person('mandon-ceirwyn', 'Mandon Ceirwyn', 'male', '1690', '', {
      title: 'Baron · Oberhaupt des Hauses Ceirwyn seit 1720',
      lineageRole: 'head'
    }),
    person('melvor-ceirwyn', 'Melvor Ceirwyn', 'male', '1694', ''),
    person('madoc-ceirwyn', 'Madoc Ceirwyn', 'male', '1696', '1720'),
    person('maelys-ceirwyn', 'Maelys Ceirwyn', 'female', '1700', '', {
      title: 'Wegverheiratet an Haus Saethwyr',
      tags: ['Wegverheiratet']
    }),
    person('dagonet-ceirwyn', 'Dagonet Ceirwyn', 'male', '1704', ''),
    person('uthred-ceirwyn', 'Uthred Ceirwyn', 'male', '1700', ''),
    person('rhiann-ceirwyn', 'Rhiann Ceirwyn', 'female', '1696', '', {
      title: 'Wegverheiratet an Haus Marwolaeth',
      tags: ['Wegverheiratet']
    }),
    person('rhyannon-ceirwyn', 'Rhyannon Ceirwyn', 'female', '1699', '', {
      title: 'Wegverheiratet an Haus Dienyddiwr',
      tags: ['Wegverheiratet']
    }),
    person('arian-ceirwyn', 'Arian Ceirwyn', 'male', '1703', ''),
    spouse('antke-skald', 'Antke Skald', 'female', '1696', '', {
      houseId: 'house-skald'
    }),
    spouse('marge-ridderspore', 'Marge Ridderspore', 'female', '1699', '', {
      houseId: 'house-ridderspore'
    }),
    spouse('psylia-adorin', 'Psylia Adorin', 'female', '1700', '', {
      houseId: 'house-adorin'
    }),
    spouse('anwyll-saethwyr', 'Anwyll Saethwyr', 'male', '1696', '', {
      houseId: 'house-saethwyr'
    }),
    spouse('liska-sokaren', 'Liska Sökaren', 'female', '1705', '', {
      houseId: 'house-sokaren'
    }),
    spouse('brunhilde-sokering', 'Brunhilde Sökering', 'female', '1702', '', {
      houseId: 'house-sokering'
    }),
    spouse('meurig-marwolaeth', 'Meurig Marwolaeth', 'male', '1694', '', {
      houseId: 'house-marwolaeth'
    }),
    spouse('robyn-dienyddiwr', 'Robyn Dienyddiwr', 'male', '1694', '', {
      houseId: 'house-dienyddiwr'
    }),
    spouse('alastriona-morath', 'Alastriona Morath', 'female', '1705', '', {
      houseId: 'house-morath'
    }),

    person('meiron-ceirwyn', 'Meiron Ceirwyn', 'male', '1717', '', {
      title: 'Erster Erbe des Hauses Ceirwyn',
      lineageRole: 'mainline'
    }),
    person('morwen-ceirwyn', 'Morwen Ceirwyn', 'female', '1721', ''),
    person('mairwen-ceirwyn', 'Mairwen Ceirwyn', 'female', '1718', ''),
    person('meilyr-ceirwyn', 'Meilyr Ceirwyn', 'male', '1721', ''),
    person('pwyll-ceirwyn', 'Pwyll Ceirwyn', 'male', '1721', ''),
    person('rawiyah-ceirwyn', 'Rawiyah Ceirwyn', 'female', '1730', ''),
    person('rhys-ceirwyn', 'Rhys Ceirwyn', 'male', '1728', ''),
    person('esylt-ceirwyn', 'Esylt Ceirwyn', 'female', '1723', ''),
    person('celyn-ceirwyn', 'Celyn Ceirwyn', 'male', '1723', ''),
    person('fflurwen-ceirwyn', 'Fflurwen Ceirwyn', 'female', '1728', '')
  ],
  partnerships: [
    createMarriage('marriage-rhoslyn-ceirwyn', ...COUPLES.founders, { status: 'ended' }),
    createMarriage('marriage-gorsedd-sunniva-ceirwyn', ...COUPLES.gorsedd, { status: 'ended', end: '1359' }),
    createMarriage('marriage-rheinallt-gwenith-grael', ...COUPLES.gwenith, { status: 'widowed', end: '1399' }),
    createMarriage('marriage-caedmon-aslaug-ceirwyn', ...COUPLES.caedmon, { status: 'widowed', end: '1650' }),
    createMarriage('marriage-kerrilynn-eochaidh-ceirwyn', ...COUPLES.kerrilynn, { status: 'widowed', end: '1652' }),
    createMarriage('marriage-gruffudd-magnhild-ceirwyn', ...COUPLES.gruffudd, { status: 'widowed', end: '1681' }),
    createMarriage('marriage-eirwenna-seaghdha-ceirwyn', ...COUPLES.eirwenna, { status: 'widowed', end: '1688' }),
    createMarriage('marriage-gwennoeth-dewey-ceirwyn', ...COUPLES.gwennoeth, { status: 'widowed', end: '1700' }),
    createMarriage('marriage-kelyddon-cerridwyn-ceirwyn', ...COUPLES.cerridwyn, { status: 'widowed', end: '1720' }),
    createMarriage('marriage-ariana-taliesin-ceirwyn', ...COUPLES.taliesin, { status: 'widowed', end: '1700' }),
    createMarriage('marriage-aranrhod-piet-ceirwyn', ...COUPLES.aranrhod, { status: 'widowed', end: '1724' }),
    createMarriage('marriage-morgan-astrid-ceirwyn', ...COUPLES.morgan, { status: 'ended', end: '1720' }),
    createMarriage('marriage-edwyn-fenella-ceirwyn', ...COUPLES.edwyn),
    createMarriage('marriage-arthgal-land', ...COUPLES.land, { status: 'widowed', end: '1720' }),
    createMarriage('marriage-merlion-irnskar-ceirwyn', ...COUPLES.merlion),
    createMarriage('marriage-rywalyn-talla', ...COUPLES.talla, { status: 'ended', end: '1720' }),
    createMarriage('marriage-dilys-grugyn-ceirwyn', ...COUPLES.dilys),
    createMarriage('marriage-renly-maelona', ...COUPLES.maelona, { status: 'widowed', end: '1720' }),
    createMarriage('marriage-trayvon-rihanna', ...COUPLES.rihanna, { status: 'widowed', end: '1720' }),
    createMarriage('marriage-mandon-antke-ceirwyn', ...COUPLES.mandon),
    createMarriage('marriage-melvor-marge-ceirwyn', ...COUPLES.melvor),
    createMarriage('marriage-madoc-psylia-ceirwyn', ...COUPLES.madoc, { status: 'widowed', end: '1720' }),
    createMarriage('marriage-anwyll-maelys', ...COUPLES.maelys),
    createMarriage('marriage-dagonet-liska-ceirwyn', ...COUPLES.dagonet),
    createMarriage('marriage-uthred-brunhilde-ceirwyn', ...COUPLES.uthred),
    createMarriage('marriage-rhiann-meurig-ceirwyn', ...COUPLES.rhiann),
    createMarriage('marriage-rhyannon-robyn-ceirwyn', ...COUPLES.rhyannon),
    createMarriage('marriage-arian-alastriona-ceirwyn', ...COUPLES.arian)
  ],
  parentages: [
    ...childrenOf(['gorsedd-ceirwyn', 'tetra-ceirwyn', 'gwenith-ceirwyn'], 'marriage-rhoslyn-ceirwyn', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen dem Gründerpaar und dieser Generation sind nicht einzeln überlieferte Vorfahren ausgelassen.',
      extensions: { timeJumpId: 'gap-founders-to-gorsedd-generation-ceirwyn' }
    }),
    ...childrenOf(['caedmon-ceirwyn', 'kerrilynn-ceirwyn'], 'marriage-gorsedd-sunniva-ceirwyn', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen Gorsedds Generation und Caedmon sind nicht einzeln überlieferte Vorfahren ausgelassen.',
      extensions: { timeJumpId: 'gap-gorsedd-to-caedmon-generation-ceirwyn' }
    }),
    ...childrenOf(['gruffudd-ceirwyn', 'eirwenna-ceirwyn', 'gwennoeth-ceirwyn'], 'marriage-caedmon-aslaug-ceirwyn'),
    ...childrenOf(['cerridwyn-ceirwyn', 'taliesin-ceirwyn', 'aranrhod-ceirwyn'], 'marriage-gruffudd-magnhild-ceirwyn'),
    ...childrenOf(
      ['morgan-ceirwyn', 'edwyn-ceirwyn', 'land-ceirwyn', 'merlion-ceirwyn', 'talla-ceirwyn', 'dilys-ceirwyn', 'maelona-ceirwyn', 'rihanna-ceirwynn'],
      'marriage-ariana-taliesin-ceirwyn'
    ),
    ...childrenOf(['mandon-ceirwyn', 'melvor-ceirwyn', 'madoc-ceirwyn', 'maelys-ceirwyn'], 'marriage-morgan-astrid-ceirwyn'),
    ...childrenOf(['dagonet-ceirwyn', 'uthred-ceirwyn'], 'marriage-edwyn-fenella-ceirwyn'),
    ...childrenOf(['rhiann-ceirwyn', 'rhyannon-ceirwyn', 'arian-ceirwyn'], 'marriage-merlion-irnskar-ceirwyn'),
    ...childrenOf(['meiron-ceirwyn', 'morwen-ceirwyn'], 'marriage-mandon-antke-ceirwyn'),
    ...childrenOf(['mairwen-ceirwyn', 'meilyr-ceirwyn'], 'marriage-melvor-marge-ceirwyn'),
    ...childrenOf(['pwyll-ceirwyn'], 'marriage-madoc-psylia-ceirwyn'),
    ...childrenOf(['rawiyah-ceirwyn'], 'marriage-dagonet-liska-ceirwyn'),
    ...childrenOf(['rhys-ceirwyn', 'esylt-ceirwyn'], 'marriage-uthred-brunhilde-ceirwyn'),
    ...childrenOf(['celyn-ceirwyn', 'fflurwen-ceirwyn'], 'marriage-arian-alastriona-ceirwyn')
  ],
  cadetBranches: [
    marriedAway('married-away-gwenith-ceirwyn-grael', 'Haus Grael', 'marriage-rheinallt-gwenith-grael', 'house-grael', { emblem: HOUSE_EMBLEMS.grael }),
    marriedAway('married-away-kerrilynn-ceirwyn-urquhart', 'Haus Urquhart', 'marriage-kerrilynn-eochaidh-ceirwyn', 'house-urquhart'),
    marriedAway('married-away-eirwenna-ceirwyn-bhaird', 'Haus Bhaird', 'marriage-eirwenna-seaghdha-ceirwyn', 'house-bhaird'),
    marriedAway('married-away-gwennoeth-ceirwyn-dyngwn', 'Haus Dyngwn', 'marriage-gwennoeth-dewey-ceirwyn', 'house-dyngwn', { emblem: HOUSE_EMBLEMS.dyngwn }),
    marriedAway('married-away-cerridwyn-ceirwyn-grael', 'Haus Grael', 'marriage-kelyddon-cerridwyn-ceirwyn', 'house-grael', { emblem: HOUSE_EMBLEMS.grael }),
    marriedAway('married-away-aranrhod-ceirwyn-ridderspore', 'Haus Ridderspore', 'marriage-aranrhod-piet-ceirwyn', 'house-ridderspore'),
    marriedAway('married-away-land-ceirwyn-illewod', 'Haus Illewod', 'marriage-arthgal-land', 'house-illewod', { emblem: HOUSE_EMBLEMS.illewod }),
    marriedAway('married-away-talla-ceirwyn-pendrag', 'Haus Pendrag', 'marriage-rywalyn-talla', 'house-pendrag', { emblem: HOUSE_EMBLEMS.pendrag }),
    marriedAway('married-away-dilys-ceirwyn-dyngwn', 'Haus Dyngwn', 'marriage-dilys-grugyn-ceirwyn', 'house-dyngwn', { emblem: HOUSE_EMBLEMS.dyngwn }),
    marriedAway('married-away-maelona-ceirwyn-gwefrydd', 'Haus Gwefrydd', 'marriage-renly-maelona', 'house-gwefrydd', { emblem: HOUSE_EMBLEMS.gwefrydd }),
    marriedAway('married-away-rihanna-ceirwyn-draig', 'Haus Draig', 'marriage-trayvon-rihanna', 'house-draig', { emblem: HOUSE_EMBLEMS.draig }),
    marriedAway('married-away-maelys-ceirwyn-saethwyr', 'Haus Saethwyr', 'marriage-anwyll-maelys', 'house-saethwyr', { emblem: HOUSE_EMBLEMS.saethwyr }),
    marriedAway('married-away-rhiann-ceirwyn-marwolaeth', 'Haus Marwolaeth', 'marriage-rhiann-meurig-ceirwyn', 'house-marwolaeth', { emblem: HOUSE_EMBLEMS.marwolaeth }),
    marriedAway('married-away-rhyannon-ceirwyn-dienyddiwr', 'Haus Dienyddiwr', 'marriage-rhyannon-robyn-ceirwyn', 'house-dienyddiwr', { emblem: HOUSE_EMBLEMS.dienyddiwr })
  ],
  timeJumps: [
    {
      id: 'gap-founders-to-gorsedd-generation-ceirwyn',
      parentPartnershipId: 'marriage-rhoslyn-ceirwyn',
      parentPersonId: '',
      childIds: ['gorsedd-ceirwyn', 'tetra-ceirwyn', 'gwenith-ceirwyn'],
      years: 0,
      fromYear: '????',
      toYear: '1256',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter Generationentrenner nach Gründerpaar und Hauswappen.',
      extensions: {}
    },
    {
      id: 'gap-gorsedd-to-caedmon-generation-ceirwyn',
      parentPartnershipId: 'marriage-gorsedd-sunniva-ceirwyn',
      parentPersonId: '',
      childIds: ['caedmon-ceirwyn', 'kerrilynn-ceirwyn'],
      years: 197,
      fromYear: '1392',
      toYear: '1589',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Zweiter absoluter Generationentrenner unter Gorsedd und Sunniva; die spätere Linie beginnt ausschließlich unter diesem Knoten.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-rhoslyn-ceirwyn',
    houseId: CEIRWYN_HOUSE_ID,
    crestSubtitle: 'Baronenhaus von Calon · Herrscher über Uthers Aufstieg',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: { enabled: false }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'ceirwyn-inlaw',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 1,
    sourceModule: "Haus Ceirwyn O'Calon (bereitgestellte Altdaten)",
    sourceNote: 'Genealogie, Lebensdaten, Ehen, Baronsfolge und Porträts folgen der bereitgestellten Ceirwyn-Hausseite. Die beiden Auslassungszeichen werden als strikt serielle Zeitsprünge nach dem Gründerwappen und nach Gorsedd/Sunniva geführt. Die Hauptlinie folgt Ceirwyn, Gorsedd, Caedmon, Gruffudd, Taliesin, Morgan und Mandon; Meiron ist der ausdrücklich genannte Erbe. Sämtliche verheirateten Ceirwyn-Frauen besitzen einen direkten Wegverheiratet-Knoten. Merlion wird anhand des Quellporträts als fortführender Sohn und Irnskar als angeheiratete Frau geführt. Das genealogische grün-silberne Meiron-Porträt hat Vorrang vor der abweichenden goldenen Hofübersichtsvariante. Wiederholte generische Silhouetten werden nicht als individuelle Porträts importiert. Gemeinsame Personen und Ehen mit Pendrag, Grael, Illewod, Gwefrydd, Draig und Saethwyr behalten ihre vorhandenen IDs.',
    registryManagedExtensionFields: ['sourceNote'],
    registryManagedHouseProfileFields: ['rankId', 'seat', 'barony', 'county', 'kingdom', 'regionEmblems'],
    registryManagedRecordFields: ['folderPath']
  }
});
