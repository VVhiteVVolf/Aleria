import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_GRAEL_PORTRAITS } from './house-grael-portraits.js';
import {
  VORTIGERNS_RUH_HOUSE_EMBLEMS,
  VORTIGERNS_RUH_HOUSE_PROFILES
} from './vortigerns-ruh-house-profiles.js';

const GRAEL_HOUSE_ID = 'house-grael';
const GRAEL_EMBLEM = VORTIGERNS_RUH_HOUSE_EMBLEMS.grael;

const HOUSE_EMBLEMS = Object.freeze({
  arth: 'assets/images/houses/Klaueninsel/haus-arth.png',
  ceirwyn: VORTIGERNS_RUH_HOUSE_EMBLEMS.ceirwyn,
  draig: 'assets/images/houses/Llamreis Ankunft/haus-draig.png',
  dyngwn: VORTIGERNS_RUH_HOUSE_EMBLEMS.dyngwn,
  pendrag: VORTIGERNS_RUH_HOUSE_EMBLEMS.pendrag,
  saethwyr: 'assets/images/houses/Llamreis Ankunft/haus-saethwyr.png',
  wyrm: 'assets/images/houses/Llamreis Ankunft/haus-wyrm.png'
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
    houseId: options.houseId === undefined ? GRAEL_HOUSE_ID : options.houseId,
    portrait: HOUSE_GRAEL_PORTRAITS[id] || '',
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
    lineageRole: options.lineageRole || 'branch'
  });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

const COUPLES = Object.freeze({
  founders: ['malltwyn-draig', 'trystan-pendrag'],
  llwydawg: ['llwydawg-grael', 'elspeth-couldwin'],
  arlais: ['arlais-grael', 'seaghdha-runda'],
  ysgithyrwyn: ['gwenalarch-draig', 'ysgithyrwyn-grael'],
  heveydd: ['heveydd-grael', 'orflaith-runda'],
  gwrtheyrn: ['gwrtheyrn-grael', 'morgana-grael-inlaw'],
  bethwyn: ['myrddin-draig', 'bethwyn-nimue-grael'],
  genofeva: ['genofeva-grael', 'ysberyr-grael'],
  rheinallt: ['rheinallt-grael', 'gwenith-ceirwyn'],
  teswyn: ['kenehyr-draig', 'teswyn-grael'],
  elinor: ['llawvrodedd-saethwyr', 'elinor-grael'],
  greidyawl: ['talaith-draig', 'greidyawl-grael'],
  olwyna: ['gareth-pendrag', 'olwyna-grael'],
  gwlyddyn: ['gwlyddyn-grael', 'eurolwyn-morforwyn'],
  rhonwen: ['rhonwen-grael', 'morgan-dyngwn'],
  galahad: ['lynesse-wyrm-1632', 'galahad-grael'],
  kelyddon: ['kelyddon-grael', 'cerridwyn-ceirwyn'],
  ariana: ['ariana-grael', 'taliesin-ceirwyn'],
  trahayarn: ['rhiannon-1673-pendrag', 'trahayarn-grael'],
  caswallon: ['dwynwen-draig', 'caswallon-grael'],
  cerridwyn: ['sieffre-arth', 'cerridwyn-grael']
});

const PARENTS_BY_PARTNERSHIP = Object.freeze({
  'marriage-malltwyn-trystan': COUPLES.founders,
  'marriage-llwydawg-elspeth-grael': COUPLES.llwydawg,
  'marriage-gwenalarch-ysgithyrwyn': COUPLES.ysgithyrwyn,
  'marriage-heveydd-orflaith-grael': COUPLES.heveydd,
  'marriage-gwrtheyrn-morgana-grael': COUPLES.gwrtheyrn,
  'marriage-genofeva-ysberyr-grael': COUPLES.genofeva,
  'marriage-rheinallt-gwenith-grael': COUPLES.rheinallt,
  'marriage-talaith-greidyawl': COUPLES.greidyawl,
  'marriage-gwlyddyn-eurolwyn-grael': COUPLES.gwlyddyn,
  'marriage-lynesse-galahad': COUPLES.galahad,
  'marriage-kelyddon-cerridwyn-ceirwyn': COUPLES.kelyddon,
  'marriage-rhiannon1673-trahayarn': COUPLES.trahayarn,
  'marriage-dwynwen-caswallon': COUPLES.caswallon
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(
    childIds,
    PARENTS_BY_PARTNERSHIP[partnershipId],
    partnershipId,
    { idPrefix: 'grael-parentage', ...options }
  );
}

function claimedAfterGap(childIds, partnershipId, timeJumpId, notes) {
  return childrenOf(childIds, partnershipId, {
    type: 'claimed',
    certainty: 'probable',
    notes,
    extensions: { timeJumpId }
  });
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

export const HOUSE_GRAEL_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-grael',
    title: "Haus Grael O'Mathragon",
    motto: '',
    description: 'Von Trystan Pendrag begründetes königliches Kadettenhaus in Mathragon. Haus Grael verbindet seine berühmte Magiertradition mit höfischer Etikette, diplomatischem Zeremoniell und dem Dienst am königlichen Hof.',
    emblem: GRAEL_EMBLEM,
    houseProfile: VORTIGERNS_RUH_HOUSE_PROFILES.grael
  },
  houses: [
    house(GRAEL_HOUSE_ID, "Haus Grael O'Mathragon", GRAEL_EMBLEM),
    house('house-arth', 'Haus Arth', HOUSE_EMBLEMS.arth),
    house('house-ceirwyn', 'Haus Ceirwyn', HOUSE_EMBLEMS.ceirwyn),
    house('house-couldwin', 'Haus Couldwin'),
    house('house-draig', 'Haus Draig', HOUSE_EMBLEMS.draig),
    house('house-dyngwn', 'Haus Dyngwn', HOUSE_EMBLEMS.dyngwn),
    house('house-morforwyn', 'Haus Morforwyn'),
    house('house-pendrag', 'Haus Pendrag', HOUSE_EMBLEMS.pendrag),
    house('house-runda', 'Haus Rúnda'),
    house('house-saethwyr', 'Haus Saethwyr', HOUSE_EMBLEMS.saethwyr),
    house('house-wyrm', 'Haus Wyrm', HOUSE_EMBLEMS.wyrm)
  ],
  persons: [
    spouse('trystan-pendrag', 'Trystan Pendrag', 'male', '????', '????', {
      houseId: 'house-pendrag',
      title: 'Legendärer Magier · Gründer und erster Ritterfürst des Hauses Grael',
      lineageRole: 'head',
      notes: 'Prinz des Königshauses Pendrag und Begründer des besonderen Grael-Kadettenhauses.'
    }),
    spouse('malltwyn-draig', 'Malltwyn Draig', 'female', '????', '????', {
      houseId: 'house-draig',
      title: 'Mitgründerin des Hauses Grael'
    }),

    person('llwydawg-grael', 'Llwydawg Grael', 'male', '????', '????', {
      title: 'Ritterfürst des Hauses Grael',
      lineageRole: 'head'
    }),
    person('arlais-grael', 'Arlais Grael', 'female', '????', '????', {
      title: 'Wegverheiratet an Haus Rúnda',
      tags: ['Wegverheiratet']
    }),
    person('ysgithyrwyn-grael', 'Ysgithyrwyn Grael', 'male', '????', '????', {
      title: 'Legendärer Magier des Hauses Grael',
      lineageRole: 'mainline',
      notes: 'Die Hauschronik nennt ihn als einen der mächtigsten Magier seiner Zeit und prägenden Erneuerer der cenyrischen Magie.'
    }),
    spouse('elspeth-couldwin', 'Elspeth Couldwin', 'female', '????', '????', {
      houseId: 'house-couldwin'
    }),
    spouse('seaghdha-runda', 'Seaghdha Rúnda', 'male', '????', '????', {
      houseId: 'house-runda'
    }),
    spouse('gwenalarch-draig', 'Gwenalarch Draig', 'female', '????', '????', {
      houseId: 'house-draig'
    }),

    person('tymora-grael', 'Tymora Grael', 'female', '????', '????'),
    person('heveydd-grael', 'Heveydd Grael', 'male', '????', '????', {
      title: 'Ritterfürst des Hauses Grael',
      lineageRole: 'head'
    }),
    person('gwrtheyrn-grael', 'Gwrtheyrn Grael', 'male', '????', '????', {
      lineageRole: 'mainline'
    }),
    person('vortigern-grael', 'Vortigern Grael', 'male', '1410', ''),
    spouse('orflaith-runda', 'Órflaith Rúnda', 'female', '????', '????', {
      houseId: 'house-runda'
    }),
    spouse('morgana-grael-inlaw', 'Morgana', 'female', '????', '????'),

    person('bethwyn-nimue-grael', 'Bethwyn „Nimue“ Grael', 'female', '1311', '1498', {
      title: 'Wegverheiratet an Haus Draig',
      tags: ['Wegverheiratet']
    }),
    person('genofeva-grael', 'Genofeva Grael', 'female', '????', '????', {
      extensions: { chartRepeatForPartnershipIds: ['marriage-genofeva-ysberyr-grael'] }
    }),
    person('ysberyr-grael', 'Ysberyr Grael', 'male', '????', '????', {
      title: 'Ritterfürst des Hauses Grael',
      lineageRole: 'head',
      extensions: { chartPartnerMirrorForPartnershipIds: ['marriage-genofeva-ysberyr-grael'] }
    }),
    person('nadya-grael', 'Nadya Grael', 'female', '????', ''),
    spouse('myrddin-draig', 'Myrddin Draig', 'male', '1119', '', {
      houseId: 'house-draig'
    }),

    person('rheinallt-grael', 'Rheinallt Grael', 'male', '1250', '1412', {
      title: 'Ritterfürst des Hauses Grael',
      lineageRole: 'head'
    }),
    person('teswyn-grael', 'Teswyn Grael', 'female', '1254', '1333', {
      title: 'Wegverheiratet an Haus Draig',
      tags: ['Wegverheiratet']
    }),
    spouse('gwenith-ceirwyn', 'Gwenith Ceirwyn', 'female', '1256', '1399', {
      houseId: 'house-ceirwyn'
    }),
    spouse('kenehyr-draig', 'Kenehyr Draig', 'male', '1253', '1295', {
      houseId: 'house-draig'
    }),

    person('elinor-grael', 'Elinor Grael', 'female', '1580', '1679', {
      title: 'Wegverheiratet an Haus Saethwyr',
      tags: ['Wegverheiratet']
    }),
    person('greidyawl-grael', 'Greidyawl Grael', 'male', '1580', '1667', {
      title: 'Ritterfürst des Hauses Grael bis 1667',
      lineageRole: 'head'
    }),
    person('olwyna-grael', 'Olwyna Grael', 'female', '1579', '1675', {
      title: 'Wegverheiratet an Haus Pendrag',
      tags: ['Wegverheiratet'],
      notes: 'Die Grael-Quelle kürzt den Namen zu „Olwyn“; die Pendrag-Gegenakte belegt die kanonische Form Olwyna.'
    }),
    spouse('llawvrodedd-saethwyr', 'Llawvrodedd Saethwyr', 'male', '1578', '1644', {
      houseId: 'house-saethwyr'
    }),
    spouse('talaith-draig', 'Talaith Draig', 'female', '1584', '1670', {
      houseId: 'house-draig'
    }),
    spouse('gareth-pendrag', 'Gareth Pendrag', 'male', '1573', '1634', {
      houseId: 'house-pendrag'
    }),

    person('gwlyddyn-grael', 'Gwlyddyn Grael', 'male', '1602', '1684', {
      title: 'Ritterfürst des Hauses Grael von 1667 bis 1684',
      lineageRole: 'head'
    }),
    person('rhonwen-grael', 'Rhonwen Grael', 'female', '1612', '', {
      title: 'Wegverheiratet an Haus Dyngwn',
      tags: ['Wegverheiratet']
    }),
    spouse('eurolwyn-morforwyn', 'Eurolwyn Morforwyn', 'female', '1610', '1714', {
      houseId: 'house-morforwyn'
    }),
    spouse('morgan-dyngwn', 'Morgan Dyngwn', 'male', '1588', '????', {
      houseId: 'house-dyngwn'
    }),

    person('galahad-grael', 'Galahad Grael', 'male', '1627', '1701', {
      title: 'Ritterfürst des Hauses Grael von 1684 bis 1701',
      lineageRole: 'head'
    }),
    spouse('lynesse-wyrm-1632', 'Lynesse Wyrm', 'female', '1632', '1698', {
      houseId: 'house-wyrm'
    }),

    person('kelyddon-grael', 'Kelyddon Grael', 'male', '1649', '1720', {
      title: 'Ritterfürst des Hauses Grael von 1701 bis 1720',
      lineageRole: 'head'
    }),
    person('ariana-grael', 'Ariana Grael', 'female', '1647', '1717', {
      title: 'Wegverheiratet an Haus Ceirwyn',
      tags: ['Wegverheiratet']
    }),
    spouse('cerridwyn-ceirwyn', 'Cerridwyn Ceirwyn', 'female', '1646', '1729', {
      houseId: 'house-ceirwyn'
    }),
    spouse('taliesin-ceirwyn', 'Taliesin Ceirwyn', 'male', '1641', '1700', {
      houseId: 'house-ceirwyn'
    }),

    person('trahayarn-grael', 'Trahayarn Grael', 'male', '1669', '', {
      title: 'Ritterfürst · Oberhaupt des Hauses Grael seit 1720',
      lineageRole: 'head'
    }),
    spouse('rhiannon-1673-pendrag', 'Rhiannon Pendrag', 'female', '1673', '', {
      houseId: 'house-pendrag'
    }),

    person('caswallon-grael', 'Caswallon Grael', 'male', '1694', '', {
      title: 'Erster Erbe des Hauses Grael',
      lineageRole: 'mainline'
    }),
    person('cerridwyn-grael', 'Cerridwyn Grael', 'female', '1706', '', {
      title: 'Wegverheiratet an Haus Arth',
      tags: ['Wegverheiratet']
    }),
    spouse('dwynwen-draig', 'Dwynwen Draig', 'female', '1698', '', {
      houseId: 'house-draig'
    }),
    spouse('sieffre-arth', 'Sieffre Arth', 'male', '1700', '', {
      houseId: 'house-arth'
    }),

    person('gwalchmei-grael', 'Gwalchmei Grael', 'male', '1717', '', {
      title: 'Zweiter in der Erbfolge',
      lineageRole: 'mainline'
    }),
    person('tylwyth-grael', 'Tylwyth Grael', 'male', '1721', ''),
    person('medrawd-grael', 'Medrawd Grael', 'male', '1723', '', {
      title: 'Dritter in der Erbfolge',
      lineageRole: 'mainline'
    })
  ],
  partnerships: [
    createMarriage('marriage-malltwyn-trystan', ...COUPLES.founders, { status: 'ended' }),
    createMarriage('marriage-llwydawg-elspeth-grael', ...COUPLES.llwydawg, { status: 'ended' }),
    createMarriage('marriage-arlais-seaghdha-grael', ...COUPLES.arlais, { status: 'ended' }),
    createMarriage('marriage-gwenalarch-ysgithyrwyn', ...COUPLES.ysgithyrwyn, { status: 'ended' }),
    createMarriage('marriage-heveydd-orflaith-grael', ...COUPLES.heveydd, { status: 'ended' }),
    createMarriage('marriage-gwrtheyrn-morgana-grael', ...COUPLES.gwrtheyrn, { status: 'ended' }),
    createMarriage('marriage-myrddin-bethwyn', ...COUPLES.bethwyn, { status: 'widowed', end: '1498' }),
    createMarriage('marriage-genofeva-ysberyr-grael', ...COUPLES.genofeva, { status: 'ended' }),
    createMarriage('marriage-rheinallt-gwenith-grael', ...COUPLES.rheinallt, { status: 'widowed', end: '1399' }),
    createMarriage('marriage-kenehyr-teswyn', ...COUPLES.teswyn, { status: 'widowed', end: '1295' }),
    createMarriage('marriage-llawvrodedd-elinor', ...COUPLES.elinor, { status: 'widowed', end: '1644' }),
    createMarriage('marriage-talaith-greidyawl', ...COUPLES.greidyawl, { status: 'widowed', end: '1667' }),
    createMarriage('marriage-gareth-olwyna', ...COUPLES.olwyna, { status: 'widowed', end: '1634' }),
    createMarriage('marriage-gwlyddyn-eurolwyn-grael', ...COUPLES.gwlyddyn, { status: 'ended', end: '1684' }),
    createMarriage('marriage-rhonwen-morgan-grael', ...COUPLES.rhonwen, { status: 'widowed' }),
    createMarriage('marriage-lynesse-galahad', ...COUPLES.galahad, { status: 'widowed', end: '1698' }),
    createMarriage('marriage-kelyddon-cerridwyn-ceirwyn', ...COUPLES.kelyddon, { status: 'widowed', end: '1720' }),
    createMarriage('marriage-ariana-taliesin-ceirwyn', ...COUPLES.ariana, { status: 'widowed', end: '1700' }),
    createMarriage('marriage-rhiannon1673-trahayarn', ...COUPLES.trahayarn),
    createMarriage('marriage-dwynwen-caswallon', ...COUPLES.caswallon),
    createMarriage('marriage-sieffre-cerridwyn', ...COUPLES.cerridwyn)
  ],
  parentages: [
    ...claimedAfterGap(
      ['llwydawg-grael', 'arlais-grael', 'ysgithyrwyn-grael'],
      'marriage-malltwyn-trystan',
      'gap-founders-to-first-grael-generation',
      'Die Quelle überspringt nach dem Gründerpaar nicht einzeln überlieferte Generationen.'
    ),
    ...childrenOf(['tymora-grael', 'heveydd-grael'], 'marriage-llwydawg-elspeth-grael'),
    ...childrenOf(['gwrtheyrn-grael', 'vortigern-grael'], 'marriage-gwenalarch-ysgithyrwyn'),
    ...claimedAfterGap(
      ['bethwyn-nimue-grael', 'genofeva-grael'],
      'marriage-heveydd-orflaith-grael',
      'gap-heveydd-gwrtheyrn-to-cousin-generation',
      'Der globale Überlieferungssprung umfasst zugleich den Zweig Heveydds und Órflaiths.'
    ),
    ...claimedAfterGap(
      ['ysberyr-grael', 'nadya-grael'],
      'marriage-gwrtheyrn-morgana-grael',
      'gap-heveydd-gwrtheyrn-to-cousin-generation',
      'Der globale Überlieferungssprung umfasst zugleich den Zweig Gwrtheyrns und Morganas.'
    ),
    ...claimedAfterGap(
      ['rheinallt-grael', 'teswyn-grael'],
      'marriage-genofeva-ysberyr-grael',
      'gap-genofeva-ysberyr-to-rheinallt-generation',
      'Die Quelle überspringt nach Genofeva und Ysberyr nicht einzeln überlieferte Generationen.'
    ),
    ...claimedAfterGap(
      ['elinor-grael', 'greidyawl-grael', 'olwyna-grael'],
      'marriage-rheinallt-gwenith-grael',
      'gap-rheinallt-to-1579-generation',
      'Die Quelle überspringt nach Rheinallt und Gwenith nicht einzeln überlieferte Generationen.'
    ),
    ...childrenOf(['gwlyddyn-grael', 'rhonwen-grael'], 'marriage-talaith-greidyawl'),
    ...childrenOf(['galahad-grael'], 'marriage-gwlyddyn-eurolwyn-grael'),
    ...childrenOf(['kelyddon-grael', 'ariana-grael'], 'marriage-lynesse-galahad'),
    ...childrenOf(['trahayarn-grael'], 'marriage-kelyddon-cerridwyn-ceirwyn'),
    ...childrenOf(['caswallon-grael', 'cerridwyn-grael'], 'marriage-rhiannon1673-trahayarn'),
    ...childrenOf(['gwalchmei-grael', 'tylwyth-grael', 'medrawd-grael'], 'marriage-dwynwen-caswallon')
  ],
  cadetBranches: [
    marriedAway('married-away-arlais-grael-runda', 'Haus Rúnda', 'marriage-arlais-seaghdha-grael', 'house-runda'),
    marriedAway('married-away-bethwyn-grael-draig', 'Haus Draig', 'marriage-myrddin-bethwyn', 'house-draig', {
      emblem: HOUSE_EMBLEMS.draig
    }),
    marriedAway('married-away-teswyn-grael-draig', 'Haus Draig', 'marriage-kenehyr-teswyn', 'house-draig', {
      emblem: HOUSE_EMBLEMS.draig
    }),
    marriedAway('married-away-elinor-grael-saethwyr', 'Haus Saethwyr', 'marriage-llawvrodedd-elinor', 'house-saethwyr', {
      emblem: HOUSE_EMBLEMS.saethwyr
    }),
    marriedAway('married-away-olwyna-grael-pendrag', 'Haus Pendrag', 'marriage-gareth-olwyna', 'house-pendrag', {
      emblem: HOUSE_EMBLEMS.pendrag
    }),
    marriedAway('married-away-rhonwen-grael-dyngwn', 'Haus Dyngwn', 'marriage-rhonwen-morgan-grael', 'house-dyngwn', {
      emblem: HOUSE_EMBLEMS.dyngwn
    }),
    marriedAway('married-away-ariana-grael-ceirwyn', 'Haus Ceirwyn', 'marriage-ariana-taliesin-ceirwyn', 'house-ceirwyn', {
      emblem: HOUSE_EMBLEMS.ceirwyn
    }),
    marriedAway('married-away-cerridwyn-grael-arth', 'Haus Arth', 'marriage-sieffre-cerridwyn', 'house-arth', {
      emblem: HOUSE_EMBLEMS.arth
    })
  ],
  timeJumps: [
    {
      id: 'gap-founders-to-first-grael-generation',
      parentPartnershipId: 'marriage-malltwyn-trystan',
      parentPersonId: '',
      childIds: ['llwydawg-grael', 'arlais-grael', 'ysgithyrwyn-grael'],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter Generationentrenner nach Gründerpaar und Grael-Wappen.',
      extensions: {}
    },
    {
      id: 'gap-heveydd-gwrtheyrn-to-cousin-generation',
      parentPartnershipId: 'marriage-gwrtheyrn-morgana-grael',
      sharedParentPartnershipIds: ['marriage-heveydd-orflaith-grael'],
      parentPersonId: '',
      childIds: ['bethwyn-nimue-grael', 'genofeva-grael', 'ysberyr-grael', 'nadya-grael'],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Generationen beider Zweige',
      notes: 'Ein einziger globaler Trenner wird sichtbar von den Paaren Heveydd/Órflaith und Gwrtheyrn/Morgana gespeist. Dahinter bleiben die fachlichen Elternschaften beider Zweige getrennt.',
      extensions: {}
    },
    {
      id: 'gap-genofeva-ysberyr-to-rheinallt-generation',
      parentPartnershipId: '',
      parentPersonId: 'ysberyr-grael',
      childIds: ['rheinallt-grael', 'teswyn-grael'],
      years: 0,
      fromYear: '????',
      toYear: '1250',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter Generationentrenner am fortsetzenden Ysberyr-Zweig. Die fachliche Elternschaft bleibt der einmaligen Cousinenehe Genofevas und Ysberyrs zugeordnet; ihre Genofeva-Gegenstelle bleibt kinderlos.',
      extensions: {}
    },
    {
      id: 'gap-rheinallt-to-1579-generation',
      parentPartnershipId: 'marriage-rheinallt-gwenith-grael',
      parentPersonId: '',
      childIds: ['elinor-grael', 'greidyawl-grael', 'olwyna-grael'],
      years: 0,
      fromYear: '1412',
      toYear: '1579',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter Generationentrenner vor der ab 1579 wieder datierten Grael-Linie.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-malltwyn-trystan',
    houseId: GRAEL_HOUSE_ID,
    crestSubtitle: 'Königliches Kadettenhaus der Pendrag · Ritterfürsten aus Mathragon',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: { enabled: false }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'trystan-pendrag',
    orientation: 'vertical',
    ancestorDepth: 24,
    descendantDepth: 24,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 1,
    sourceModule: "Haus Grael O'Mathragon (bereitgestellte Altdaten)",
    sourceNote: 'Personen, Lebensdaten, Ehen, Elternschaften, Amtsfolge und Porträts folgen der beigefügten Grael-Tabelle und ihrer Stammbaumgrafik. Die wechselnde Quellschreibweise „Greal“ wurde anhand des Namensfelds, des Wappens und der bereits bestehenden Gegenakten einheitlich als Grael geführt; „Olwyn“ wurde mit der Pendrag-Gegenakte als Olwyna und „Gwylyddyn“ als Gwlyddyn normalisiert. Vier Punktreihen werden als vier strikt serielle globale Zeitsprünge abgebildet. Die gemeinsame Lücke der Heveydd- und Gwrtheyrn-Zweige besitzt genau einen Trenner, erhält aber getrennte fachliche Elternschaften. Genofeva und Ysberyr existieren trotz zweier sichtbarer Paarpositionen jeweils nur einmal; Ysberyrs Herkunftszweig führt Rheinallt und Teswyn fort, die Gegenposition bleibt kinderlos. Arlais, Bethwyn, Teswyn, Elinor, Olwyna, Rhonwen, Ariana und Cerridwyn besitzen direkte Wegverheiratet-Knoten. Gemeinsame Weltpersonen, Partnerschaften und Porträts werden aus Draig, Pendrag, Arth, Saethwyr, Wyrm und Neidr wiederverwendet. Schwarze Standardsilhouetten wurden nicht als individuelle Porträts dupliziert. Die in der Oberhauptliste eingeklammerten Jahresbereiche wurden als Amtszeiten und nicht als abweichende Lebensdaten ausgewertet.',
    registryManagedExtensionFields: ['sourceNote'],
    registryManagedHouseProfileFields: ['rankId', 'seat', 'barony', 'county', 'kingdom', 'regionEmblems'],
    registryManagedRecordFields: ['folderPath']
  }
});
