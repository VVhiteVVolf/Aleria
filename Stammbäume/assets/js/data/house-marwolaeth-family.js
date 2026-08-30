import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_MARWOLAETH_PORTRAITS } from './house-marwolaeth-portraits.js';
import {
  VORTIGERNS_RUH_HOUSE_EMBLEMS,
  VORTIGERNS_RUH_HOUSE_PROFILES
} from './vortigerns-ruh-house-profiles.js';

const MARWOLAETH_HOUSE_ID = 'house-marwolaeth';
const MARWOLAETH_EMBLEM = VORTIGERNS_RUH_HOUSE_EMBLEMS.marwolaeth;

const HOUSE_EMBLEMS = Object.freeze({
  arth: 'assets/images/houses/Klaueninsel/haus-arth.png',
  ceirwyn: VORTIGERNS_RUH_HOUSE_EMBLEMS.ceirwyn,
  dienyddiwr: VORTIGERNS_RUH_HOUSE_EMBLEMS.dienyddiwr,
  draig: 'assets/images/houses/Llamreis Ankunft/haus-draig.png',
  dyngwn: VORTIGERNS_RUH_HOUSE_EMBLEMS.dyngwn,
  draenog: 'assets/images/houses/Graue Weite/Silberwald/haus-draenog.png',
  gafyr: 'assets/images/houses/Llamreis Ankunft/haus-gafyr.png',
  gwefrydd: 'assets/images/houses/Artus Streben/haus-gwefrydd.png',
  gwyvern: 'assets/images/houses/Gwendolyns Ufer/haus-gwyvern.png',
  marwolaeth: MARWOLAETH_EMBLEM,
  penderyn: VORTIGERNS_RUH_HOUSE_EMBLEMS.penderyn,
  pysgod: 'assets/images/houses/Graue Weite/haus-pysgod.png',
  saethwyr: 'assets/images/houses/Llamreis Ankunft/haus-saethwyr.png',
  wylan: 'assets/images/houses/Weidebucht/haus-wylan.png'
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
    houseId: options.houseId === undefined ? MARWOLAETH_HOUSE_ID : options.houseId,
    portrait: HOUSE_MARWOLAETH_PORTRAITS[id] || '',
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
    familyRole: options.familyRole || 'married',
    lineageRole: 'branch'
  });
}

function awayWoman(id, name, birth, death, targetHouseName, options = {}) {
  return person(id, name, 'female', birth, death, {
    ...options,
    title: `Wegverheiratet an ${targetHouseName}`,
    tags: ['Wegverheiratet']
  });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

const COUPLES = Object.freeze({
  founders: ['uryen-marwolaeth', 'eimear-ailella'],
  llwyrddyddwg: ['llwyrddyddwg-marwolaeth', 'grada-magath'],
  braith: ['eiddyl-wylan', 'braith-marwolaeth'],
  gwenola: ['trayvon-dienyddiwr', 'gwenola-marwolaeth'],
  llwyarch: ['llwyarch-marwolaeth', 'seigine-luga'],
  siana: ['siana-marwolaeth', 'merrion-1582-crefyddol'],
  sieffre: ['cerith-penderyn', 'sieffre-marwolaeth'],
  gwydolwyn: ['gwydolwyn-marwolaeth', 'limwris-draenog'],
  grippiud: ['grippiud-marwolaeth', 'endellion-gwyvern'],
  ninian: ['delwen-dyngwn', 'ninian-marwolaeth'],
  luned: ['edric-gwefrydd', 'luned-marwolaeth'],
  neirin: ['neirin-marwolaeth', 'eirawen-o-cenyr'],
  gregory: ['blodwyn-crefyddol', 'gregory-marwolaeth'],
  cerys: ['trahern-draig', 'cerys-marwolaeth'],
  llywelyn: ['josephine-weissmann', 'llywelyn-marwolaeth'],
  llewella: ['llewella-marwolaeth', 'quinn-ailella'],
  griffith: ['griffith-marwolaeth', 'helga-helgr'],
  gwendolen: ['cadfael-1681-arth', 'gwendolen-marwolaeth'],
  pavetta: ['pavetta-marwolaeth', 'duny-saith'],
  deiniol: ['deiniol-marwolaeth', 'endellion-morforwyn'],
  gwenllian: ['dafydd-dyngwn', 'gwenllian-marwolaeth'],
  morwenna: ['morwenna-marwolaeth', 'sinna-cumhail'],
  adelayne: ['gaheris-pysgod', 'adelayne-marwolaeth'],
  meurig: ['rhiann-ceirwyn', 'meurig-marwolaeth'],
  jenniffer: ['caradog-saethwyr', 'jenniffer-marwolaeth'],
  eleri: ['roderic-gafyr', 'eleri-marwolaeth'],
  penryn: ['penryn-marwolaeth', 'tanwen-blach']
});

const PARENTS_BY_PARTNERSHIP = Object.freeze({
  'marriage-uryen-eimear-marwolaeth': COUPLES.founders,
  'marriage-llwyrddyddwg-grada-marwolaeth': COUPLES.llwyrddyddwg,
  'marriage-llwyarch-seigine-marwolaeth': COUPLES.llwyarch,
  'marriage-cerith-sieffre-marwolaeth': COUPLES.sieffre,
  'marriage-endellion-grippiud': COUPLES.grippiud,
  'marriage-delwen-ninian-dyngwn': COUPLES.ninian,
  'marriage-neirin-eirawen-marwolaeth': COUPLES.neirin,
  'marriage-gregory-blodwyn-marwolaeth': COUPLES.gregory,
  'marriage-llywelyn-josephine-marwolaeth': COUPLES.llywelyn,
  'marriage-griffith-helga-marwolaeth': COUPLES.griffith,
  'marriage-deiniol-endellion-marwolaeth': COUPLES.deiniol,
  'forced-morwenna-sinna-marwolaeth': COUPLES.morwenna,
  'marriage-rhiann-meurig-ceirwyn': COUPLES.meurig,
  'marriage-penryn-tanwen-marwolaeth': COUPLES.penryn
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(
    childIds,
    PARENTS_BY_PARTNERSHIP[partnershipId],
    partnershipId,
    { idPrefix: 'marwolaeth-parentage', ...options }
  );
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

export const HOUSE_MARWOLAETH_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-marwolaeth',
    title: "Haus Marwolaeth O'Mathragon",
    motto: '',
    description: 'Frommes Ritterfürstenhaus von Mathragon, das Demut, Buße und selbstlosen Dienst unter dem Hüter in den Mittelpunkt stellt.',
    emblem: MARWOLAETH_EMBLEM,
    houseProfile: VORTIGERNS_RUH_HOUSE_PROFILES.marwolaeth
  },
  houses: [
    house(MARWOLAETH_HOUSE_ID, "Haus Marwolaeth O'Mathragon", MARWOLAETH_EMBLEM),
    house('house-ailella', 'Haus Ailella'),
    house('house-magath', 'Haus Magath'),
    house('house-wylan', 'Haus Wylan', HOUSE_EMBLEMS.wylan),
    house('house-dienyddiwr', 'Haus Dienyddiwr', HOUSE_EMBLEMS.dienyddiwr),
    house('house-luga', 'Haus Luga'),
    house('house-crefyddol', 'Haus Crefyddol'),
    house('house-penderyn', 'Haus Penderyn', HOUSE_EMBLEMS.penderyn),
    house('house-draenog', 'Haus Draenog', HOUSE_EMBLEMS.draenog),
    house('house-gwyvern', 'Haus Gwyvern', HOUSE_EMBLEMS.gwyvern),
    house('house-dyngwn', 'Haus Dyngwn', HOUSE_EMBLEMS.dyngwn),
    house('house-gwefrydd', 'Haus Gwefrydd', HOUSE_EMBLEMS.gwefrydd),
    house('house-o-cenyr', "Haus O'Cenyr"),
    house('house-draig', 'Haus Draig', HOUSE_EMBLEMS.draig),
    house('house-weissmann', 'Haus Weissmann'),
    house('house-helgr', 'Haus Helgr'),
    house('house-arth', 'Haus Arth', HOUSE_EMBLEMS.arth),
    house('house-saith', 'Haus Saith'),
    house('house-morforwyn', 'Haus Morforwyn'),
    house('house-pysgod', 'Haus Pysgod', HOUSE_EMBLEMS.pysgod),
    house('house-ceirwyn', 'Haus Ceirwyn', HOUSE_EMBLEMS.ceirwyn),
    house('house-saethwyr', 'Haus Saethwyr', HOUSE_EMBLEMS.saethwyr),
    house('house-gafyr', 'Haus Gafyr', HOUSE_EMBLEMS.gafyr),
    house('house-blach', 'Haus Blach'),
    house('house-cumhail', 'Haus Cumhail')
  ],
  persons: [
    person('uryen-marwolaeth', 'Uryen der Gesegnete', 'male', '????', '????', {
      status: 'dead',
      lineageRole: 'head',
      title: 'Gründer des Hauses · Ritterfürst · Patriarch des Hüters',
      notes: 'Einst Bandit und später reuiger Totengräber; nach der Erlösung eines ruhelosen Prinzen in den Ritterstand erhoben.'
    }),
    spouse('eimear-ailella', 'Eimear Ailella', 'female', '????', '????', {
      status: 'dead',
      houseId: 'house-ailella'
    }),

    person('llwyrddyddwg-marwolaeth', 'Llwyrddyddwg Marwolaeth', 'male', '1551', '1644', { lineageRole: 'head' }),
    awayWoman('braith-marwolaeth', 'Braith Marwolaeth', '1557', '1671', 'Haus Wylan'),
    spouse('grada-magath', 'Grada Magath', 'female', '1552', '????', {
      status: 'dead',
      houseId: 'house-magath',
      notes: 'Das Quellenjahr 1652 ist als unmöglicher Zahlendreher zu 1552 normalisiert.'
    }),
    spouse('eiddyl-wylan', 'Eiddyl Wylan', 'male', '1556', '1617', { houseId: 'house-wylan' }),

    person('llwyarch-marwolaeth', 'Llwyarch Marwolaeth', 'male', '1579', '1666', { lineageRole: 'head' }),
    awayWoman('gwenola-marwolaeth', 'Gwenola Marwolaeth', '1582', '1681', 'Haus Dienyddiwr'),
    awayWoman('siana-marwolaeth', 'Siana Marwolaeth', '1586', '1693', 'Haus Crefyddol'),
    spouse('seigine-luga', 'Seigine Luga', 'female', '1580', '????', { status: 'dead', houseId: 'house-luga' }),
    spouse('trayvon-dienyddiwr', 'Trayvon Dienyddiwr', 'male', '1576', '1640', { houseId: 'house-dienyddiwr' }),
    spouse('merrion-1582-crefyddol', 'Merrion Crefyddol', 'male', '1582', '1662', { houseId: 'house-crefyddol' }),

    person('sieffre-marwolaeth', 'Sieffre Marwolaeth', 'male', '1597', '1678', { lineageRole: 'head' }),
    awayWoman('gwydolwyn-marwolaeth', 'Gwydolwyn Marwolaeth', '1608', '1679', 'Haus Draenog'),
    person('grippiud-marwolaeth', 'Grippiud Marwolaeth', 'male', '1598', '1672'),
    spouse('cerith-penderyn', 'Cerith Penderyn', 'female', '1600', '????', { status: 'dead', houseId: 'house-penderyn' }),
    spouse('limwris-draenog', 'Limwris Draenog', 'male', '1604', '1680', { houseId: 'house-draenog' }),
    spouse('endellion-gwyvern', 'Endellion Gwyvern', 'female', '1602', '1671', { houseId: 'house-gwyvern' }),

    person('ninian-marwolaeth', 'Ninian Marwolaeth', 'male', '1630', '1709', { lineageRole: 'head' }),
    person('gwennan-marwolaeth', 'Gwennan Marwolaeth', 'female', '1641', ''),
    awayWoman('luned-marwolaeth', 'Luned Marwolaeth', '1629', '1723', 'Haus Gwefrydd'),
    person('neirin-marwolaeth', 'Neirin Marwolaeth', 'male', '1632', '1720'),
    spouse('delwen-dyngwn', 'Delwen Dyngwn', 'female', '1636', '1687', { houseId: 'house-dyngwn' }),
    spouse('edric-gwefrydd', 'Edric Gwefrydd', 'male', '1624', '1695', { houseId: 'house-gwefrydd' }),
    spouse('eirawen-o-cenyr', "Eirawen O'Cenyr", 'female', '1633', '1669', { houseId: 'house-o-cenyr' }),

    person('gregory-marwolaeth', 'Gregory Marwolaeth', 'male', '1654', '1720', {
      lineageRole: 'head',
      title: 'Ritterfürst von 1709 bis 1719'
    }),
    awayWoman('cerys-marwolaeth', 'Cerys Marwolaeth', '1646', '1733', 'Haus Draig'),
    person('llywelyn-marwolaeth', 'Llywelyn Marwolaeth', 'male', '1657', '1720'),
    awayWoman('llewella-marwolaeth', 'Llewella Marwolaeth', '1657', '', 'Haus Ailella'),
    spouse('blodwyn-crefyddol', 'Blodwyn Crefyddol', 'female', '1654', '1711', { houseId: 'house-crefyddol' }),
    spouse('trahern-draig', 'Trahern Draig', 'male', '1645', '', { houseId: 'house-draig' }),
    spouse('josephine-weissmann', 'Josephine Weissmann', 'female', '1657', '1733', { houseId: 'house-weissmann' }),
    spouse('quinn-ailella', 'Quinn Ailella', 'male', '1654', '', { houseId: 'house-ailella' }),

    person('griffith-marwolaeth', 'Griffith Marwolaeth', 'male', '1671', '', {
      lineageRole: 'head',
      title: 'Ritterfürst · Oberhaupt des Hauses seit 1719'
    }),
    awayWoman('gwendolen-marwolaeth', 'Gwendolen Marwolaeth', '1679', '', 'Haus Arth'),
    awayWoman('pavetta-marwolaeth', 'Pavetta Marwolaeth', '1676', '', 'Haus Saith'),
    person('deiniol-marwolaeth', 'Deiniol Marwolaeth', 'male', '1675', ''),
    awayWoman('gwenllian-marwolaeth', 'Gwenllian Marwolaeth', '1673', '', 'Haus Dyngwn'),
    spouse('helga-helgr', 'Helga Helgr', 'female', '1675', '', { houseId: 'house-helgr' }),
    spouse('cadfael-1681-arth', 'Cadfael Arth', 'male', '1681', '1740', { houseId: 'house-arth' }),
    spouse('duny-saith', 'Duny Saith', 'male', '1670', '', { houseId: 'house-saith' }),
    spouse('endellion-morforwyn', 'Endellion Morforwyn', 'female', '1676', '', { houseId: 'house-morforwyn' }),
    spouse('dafydd-dyngwn', 'Dafydd Dyngwn', 'male', '1670', '', { houseId: 'house-dyngwn' }),

    person('morwenna-marwolaeth', 'Morwenna Marwolaeth', 'female', '1695', '', {
      lineageRole: 'mainline',
      title: 'Älteste Tochter des Ritterfürsten',
      notes: 'Blieb nach dem im Großen Krieg erlittenen Verbrechen unverheiratet; ihr legitimierter Sohn Peredur steht im Mittelpunkt des Erbfolgestreits.'
    }),
    awayWoman('adelayne-marwolaeth', 'Adelayne Marwolaeth', '1700', '', 'Haus Pysgod'),
    person('meurig-marwolaeth', 'Meurig Marwolaeth', 'male', '1694', ''),
    awayWoman('jenniffer-marwolaeth', 'Jenniffer Marwolaeth', '1695', '', 'Haus Saethwyr'),
    awayWoman('eleri-marwolaeth', 'Eleri Marwolaeth', '1698', '', 'Haus Gafyr'),
    person('penryn-marwolaeth', 'Penryn Marwolaeth', 'male', '1696', ''),
    spouse('sinna-cumhail', 'Sinna Cumhail', 'male', '1693', '', {
      houseId: 'house-cumhail',
      familyRole: 'affair',
      title: 'Morwennas Schänder',
      tags: ['Erzwungene Verbindung'],
      notes: 'Kein freiwilliges Verhältnis: Die Quelle bezeichnet Sinna als Morwennas Schänder während des Großen Krieges.'
    }),
    spouse('gaheris-pysgod', 'Gaheris Pysgod', 'male', '1696', '', { houseId: 'house-pysgod' }),
    spouse('rhiann-ceirwyn', 'Rhiann Ceirwyn', 'female', '1696', '', { houseId: 'house-ceirwyn' }),
    spouse('caradog-saethwyr', 'Caradog Saethwyr', 'male', '1696', '', { houseId: 'house-saethwyr' }),
    spouse('roderic-gafyr', 'Roderic Gafyr', 'male', '1699', '', { houseId: 'house-gafyr' }),
    spouse('tanwen-blach', 'Tanwen Blach', 'female', '1700', '', { houseId: 'house-blach' }),

    person('peredur-geoffrey-marwolaeth', 'Peredur Geoffrey Marwolaeth', 'male', '1721', '', {
      status: 'alive',
      lineageRole: 'mainline',
      title: 'Legitimierter Erstgeborener · umstrittener Erbe',
      tags: ['Legitimiert'],
      notes: 'Nach seiner Geburt legitimierter Sohn Morwennas; seine Stellung als künftiger Ritterfürst ist innerhalb des Hauses umstritten.'
    }),
    person('ifan-marwolaeth', 'Ifan Marwolaeth', 'male', '????', '', { status: 'alive' }),
    person('venora-marwolaeth', 'Venora Marwolaeth', 'female', '????', '', { status: 'alive' }),
    person('arian-marwolaeth', 'Arian Marwolaeth', 'male', '????', '', { status: 'alive' }),
    person('jowna-marwolaeth', 'Jowna Marwolaeth', 'female', '????', '', { status: 'alive' })
  ],
  partnerships: [
    createMarriage('marriage-uryen-eimear-marwolaeth', ...COUPLES.founders),
    createMarriage('marriage-llwyrddyddwg-grada-marwolaeth', ...COUPLES.llwyrddyddwg),
    createMarriage('marriage-eiddyl-braith', ...COUPLES.braith),
    createMarriage('marriage-trayvon-gwenola-dienyddiwr', ...COUPLES.gwenola),
    createMarriage('marriage-llwyarch-seigine-marwolaeth', ...COUPLES.llwyarch),
    createMarriage('marriage-siana-merrion-marwolaeth', ...COUPLES.siana),
    createMarriage('marriage-cerith-sieffre-marwolaeth', ...COUPLES.sieffre, { status: 'ended' }),
    createMarriage('marriage-gwydolwyn-limwris-marwolaeth', ...COUPLES.gwydolwyn),
    createMarriage('marriage-endellion-grippiud', ...COUPLES.grippiud),
    createMarriage('marriage-delwen-ninian-dyngwn', ...COUPLES.ninian),
    createMarriage('marriage-edric-luned', ...COUPLES.luned),
    createMarriage('marriage-neirin-eirawen-marwolaeth', ...COUPLES.neirin),
    createMarriage('marriage-gregory-blodwyn-marwolaeth', ...COUPLES.gregory),
    createMarriage('marriage-trahern-cerys', ...COUPLES.cerys),
    createMarriage('marriage-llywelyn-josephine-marwolaeth', ...COUPLES.llywelyn),
    createMarriage('marriage-llewella-quinn-marwolaeth', ...COUPLES.llewella),
    createMarriage('marriage-griffith-helga-marwolaeth', ...COUPLES.griffith),
    createMarriage('marriage-cadfael-gwendolen', ...COUPLES.gwendolen),
    createMarriage('marriage-pavetta-duny-marwolaeth', ...COUPLES.pavetta),
    createMarriage('marriage-deiniol-endellion-marwolaeth', ...COUPLES.deiniol),
    createMarriage('marriage-dafydd-gwenllian-dyngwn', ...COUPLES.gwenllian),
    createMarriage('forced-morwenna-sinna-marwolaeth', ...COUPLES.morwenna, {
      type: 'forced',
      status: 'ended',
      notes: 'Die Quelle bezeichnet Sinna ausdrücklich als Morwennas Schänder; dies ist keine freiwillige Affäre.'
    }),
    createMarriage('marriage-gaheris-adelayne', ...COUPLES.adelayne),
    createMarriage('marriage-rhiann-meurig-ceirwyn', ...COUPLES.meurig),
    createMarriage('marriage-caradog-jenniffer', ...COUPLES.jenniffer),
    createMarriage('marriage-roderic-eleri', ...COUPLES.eleri),
    createMarriage('marriage-penryn-tanwen-marwolaeth', ...COUPLES.penryn)
  ],
  parentages: [
    ...childrenOf(['llwyarch-marwolaeth', 'gwenola-marwolaeth', 'siana-marwolaeth'], 'marriage-llwyrddyddwg-grada-marwolaeth'),
    ...childrenOf(['sieffre-marwolaeth', 'gwydolwyn-marwolaeth', 'grippiud-marwolaeth'], 'marriage-llwyarch-seigine-marwolaeth'),
    ...childrenOf(['ninian-marwolaeth', 'gwennan-marwolaeth'], 'marriage-cerith-sieffre-marwolaeth'),
    ...childrenOf(['luned-marwolaeth', 'neirin-marwolaeth'], 'marriage-endellion-grippiud'),
    ...childrenOf(['gregory-marwolaeth', 'cerys-marwolaeth'], 'marriage-delwen-ninian-dyngwn'),
    ...childrenOf(['llywelyn-marwolaeth', 'llewella-marwolaeth'], 'marriage-neirin-eirawen-marwolaeth'),
    ...childrenOf(['griffith-marwolaeth', 'gwendolen-marwolaeth', 'pavetta-marwolaeth'], 'marriage-gregory-blodwyn-marwolaeth'),
    ...childrenOf(['deiniol-marwolaeth', 'gwenllian-marwolaeth'], 'marriage-llywelyn-josephine-marwolaeth'),
    ...childrenOf(['morwenna-marwolaeth', 'adelayne-marwolaeth'], 'marriage-griffith-helga-marwolaeth'),
    ...childrenOf(['meurig-marwolaeth', 'jenniffer-marwolaeth', 'eleri-marwolaeth', 'penryn-marwolaeth'], 'marriage-deiniol-endellion-marwolaeth'),
    ...childrenOf(['peredur-geoffrey-marwolaeth'], 'forced-morwenna-sinna-marwolaeth', {
      legitimacy: 'legitimized',
      notes: 'Peredur wurde nach seiner Geburt legitimiert.',
      extensions: { registryManagedFields: ['legitimacy', 'notes'] }
    }),
    ...childrenOf(['ifan-marwolaeth', 'venora-marwolaeth'], 'marriage-rhiann-meurig-ceirwyn'),
    ...childrenOf(['arian-marwolaeth', 'jowna-marwolaeth'], 'marriage-penryn-tanwen-marwolaeth')
  ],
  cadetBranches: [
    marriedAway('married-away-braith-marwolaeth-wylan', 'Haus Wylan', 'marriage-eiddyl-braith', 'house-wylan', HOUSE_EMBLEMS.wylan),
    marriedAway('married-away-gwenola-marwolaeth-dienyddiwr', 'Haus Dienyddiwr', 'marriage-trayvon-gwenola-dienyddiwr', 'house-dienyddiwr', HOUSE_EMBLEMS.dienyddiwr),
    marriedAway('married-away-siana-marwolaeth-crefyddol', 'Haus Crefyddol', 'marriage-siana-merrion-marwolaeth', 'house-crefyddol'),
    marriedAway('married-away-gwydolwyn-marwolaeth-draenog', 'Haus Draenog', 'marriage-gwydolwyn-limwris-marwolaeth', 'house-draenog'),
    marriedAway('married-away-luned-marwolaeth-gwefrydd', 'Haus Gwefrydd', 'marriage-edric-luned', 'house-gwefrydd', HOUSE_EMBLEMS.gwefrydd),
    marriedAway('married-away-cerys-marwolaeth-draig', 'Haus Draig', 'marriage-trahern-cerys', 'house-draig', HOUSE_EMBLEMS.draig),
    marriedAway('married-away-llewella-marwolaeth-ailella', 'Haus Ailella', 'marriage-llewella-quinn-marwolaeth', 'house-ailella'),
    marriedAway('married-away-gwendolen-marwolaeth-arth', 'Haus Arth', 'marriage-cadfael-gwendolen', 'house-arth', HOUSE_EMBLEMS.arth),
    marriedAway('married-away-pavetta-marwolaeth-saith', 'Haus Saith', 'marriage-pavetta-duny-marwolaeth', 'house-saith'),
    marriedAway('married-away-gwenllian-marwolaeth-dyngwn', 'Haus Dyngwn', 'marriage-dafydd-gwenllian-dyngwn', 'house-dyngwn', HOUSE_EMBLEMS.dyngwn),
    marriedAway('married-away-adelayne-marwolaeth-pysgod', 'Haus Pysgod', 'marriage-gaheris-adelayne', 'house-pysgod', HOUSE_EMBLEMS.pysgod),
    marriedAway('married-away-jenniffer-marwolaeth-saethwyr', 'Haus Saethwyr', 'marriage-caradog-jenniffer', 'house-saethwyr', HOUSE_EMBLEMS.saethwyr),
    marriedAway('married-away-eleri-marwolaeth-gafyr', 'Haus Gafyr', 'marriage-roderic-eleri', 'house-gafyr', HOUSE_EMBLEMS.gafyr)
  ],
  timeJumps: [
    {
      id: 'gap-uryen-to-llwyrddyddwg-braith-marwolaeth',
      parentPartnershipId: 'marriage-uryen-eimear-marwolaeth',
      parentPersonId: '',
      childIds: ['llwyrddyddwg-marwolaeth', 'braith-marwolaeth'],
      years: 0,
      fromYear: '????',
      toYear: '1551',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter Generationentrenner nach dem Gründerpaar und dem Stammwappen; Llwyrddyddwg und Braith sind keine direkten Kinder Uryens.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-uryen-eimear-marwolaeth',
    houseId: MARWOLAETH_HOUSE_ID,
    crestSubtitle: 'Ritterfürstenhaus von Mathragon · Dem Hüter verpflichtet',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: { enabled: false }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'uryen-marwolaeth',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 3,
    sourceModule: "Haus Marwolaeth O'Mathragon (bereitgestellte Altdaten)",
    sourceNote: 'Genealogie, Lebensdaten, Hausgeschichte, Oberhäupter und Portraitzuordnungen folgen der bereitgestellten Marwolaeth-Hausseite und ihrer eingebetteten Stammbaumgrafik. Uryen der Gesegnete und Eimear Ailella bilden das Gründerpaar. Der einzige Punkttrenner wird nach dem Stammwappen als absoluter Zeitsprung zu Llwyrddyddwg und Braith geführt; beide sind ausdrücklich keine direkten Kinder des Gründerpaars. Die belegte Kopfschaft verläuft über Llwyrddyddwg, Llwyarch, Sieffre, Ninian, Gregory und den seit 1719 amtierenden Griffith. Dreizehn verheiratete Marwolaeth-Frauen ohne fortgeführten Marwolaeth-Zweig besitzen direkte Zielhausknoten. Morwenna bleibt unverheiratet: Sinna Cumhail wird gemäß Quelle als ihr Schänder in einer erzwungenen, beendeten Verbindung geführt, nicht als Affäre. Ihr Sohn Peredur Geoffrey ist biologisch aus dieser Verbindung hervorgegangen, wurde nachträglich legitimiert und bleibt als umstrittener Erbe gekennzeichnet. Sinnas Geburtsjahr 1693 und Peredurs Geburtsjahr 1721 werden aus der ergänzenden Mac-Ard-Cumhaill-Gegenakte synchronisiert. Kinder aus auswärtigen, im Zielhaus fortgesetzten Ehen werden nicht parallel kopiert. Gemeinsame Personen und Ehen mit Wylan, Dienyddiwr, Penderyn, Gwyvern, Dyngwn, Gwefrydd, Draig, Arth, Pysgod, Ceirwyn, Saethwyr und Gafyr behalten ihre vorhandenen Weltpersonen- und Partnerschafts-IDs. Ninians Todesjahr 1709, Gwenolas Todesjahr 1681, Gwendolens Geburtsjahr 1679 und Cadfaels Todesjahr 1740 werden aus dieser jeweiligen Gegenquelle synchronisiert. Gradas unmögliches Quellenjahr 1652 ist als offenkundiger Zahlendreher zu 1552 normalisiert. Wiederholte generische Silhouetten wurden nicht als individuelle Portraits importiert.',
    registryManagedExtensionFields: ['sourceNote'],
    registryManagedHouseProfileFields: ['rankId', 'seat', 'barony', 'county', 'kingdom', 'regionEmblems'],
    registryManagedRecordFields: ['folderPath']
  }
});
