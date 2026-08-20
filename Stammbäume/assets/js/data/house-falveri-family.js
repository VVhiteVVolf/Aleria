import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createMigrationHouseBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_FALVERI_PORTRAITS } from './house-falveri-portraits.js';
import { VENALYS_HOUSE_PROFILES } from './venalys-house-profiles.js';

const FALVERI_HOUSE_ID = 'house-falveri';
const FALVERI_EMBLEM = 'assets/images/houses/Venalys/haus-falveri.png';
const CYMRATH_HOUSE_ID = 'house-cymrath-o-traethlan';
const CYMRATH_EMBLEM = 'assets/images/houses/Llamreis Ankunft/haus-cymrath-o-traethlan.png';

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
    houseId: options.houseId === undefined ? FALVERI_HOUSE_ID : options.houseId,
    portrait: HOUSE_FALVERI_PORTRAITS[id] || '',
    familyRole: options.familyRole || 'core',
    lineageRole: options.lineageRole || 'branch',
    title: options.title || '',
    status: options.status || '',
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

function affair(id, name, sex, birth, death = '', options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    houseId: options.houseId || '',
    familyRole: 'affair',
    lineageRole: 'branch'
  });
}

function bastard(id, name, sex, birth, options = {}) {
  return person(id, name, sex, birth, '', {
    ...options,
    familyRole: 'bastard',
    lineageRole: 'branch',
    tags: ['Bastard', 'Nicht anerkannt', ...(options.tags || [])]
  });
}

const COUPLES = Object.freeze({
  founders: ['unknown-founder-falveri', 'unknown-founder-wife-falveri'],
  valerianElder: ['valerian-elder-falveri', 'valeria-elder-spouse'],
  senarian: ['senarian-falveri', 'honoria-senarian-spouse'],
  lexarius: ['lexarius-falveri', 'sapienia-lexarius-spouse'],
  fidelia: ['fidelia-falveri', 'civerius-fidelia-spouse'],
  rationius: ['rationius-falveri', 'civeria-rationius-spouse'],
  valerius: ['valerius-falveri', 'nobilia-valerius-spouse'],
  civerian: ['civerian-falveri', 'rationia-civerian-spouse'],
  civerianAffair: ['civerian-falveri', 'livia-civerian-affair'],
  honoria: ['honoria-falveri', 'argentius-honoria-spouse'],
  potenian: ['potenian-falveri', 'argentia-potenian-spouse'],
  potenianAffair: ['potenian-falveri', 'celia-potenian-affair'],
  valeria: ['valeria-falveri', 'fortenius-valeria-spouse'],
  liberius: ['liberius-falveri', 'honorina-liberius-spouse'],
  fortenius: ['fortenius-falveri', 'ordinia-fortenius-spouse'],
  lexaria: ['lexaria-falveri', 'senarius-lexaria-spouse'],
  valerian: ['valerian-falveri', 'argentiana-valerian-spouse'],
  senaria: ['senaria-falveri', 'honorius-senaria-spouse'],
  lexarian: ['lexarian-falveri', 'fidelina-lexarian-spouse'],
  ordinian: ['ordinian-falveri', 'venturia-ordinian-spouse']
});

const PARENTS_BY_PARTNERSHIP = Object.freeze({
  'marriage-unknown-founders-falveri': COUPLES.founders,
  'marriage-valerian-valeria-falveri': COUPLES.valerianElder,
  'marriage-senarian-honoria-falveri': COUPLES.senarian,
  'marriage-lexarius-sapienia-falveri': COUPLES.lexarius,
  'marriage-rationius-civeria-falveri': COUPLES.rationius,
  'marriage-valerius-nobilia-falveri': COUPLES.valerius,
  'marriage-civerian-rationia-falveri': COUPLES.civerian,
  'affair-civerian-livia-falveri': COUPLES.civerianAffair,
  'marriage-potenian-argentia-falveri': COUPLES.potenian,
  'affair-potenian-celia-falveri': COUPLES.potenianAffair,
  'marriage-liberius-honorina-falveri': COUPLES.liberius,
  'marriage-fortenius-ordinia-falveri': COUPLES.fortenius,
  'marriage-valerian-argentiana-falveri': COUPLES.valerian,
  'marriage-lexarian-fidelina-falveri': COUPLES.lexarian,
  'marriage-ordinian-venturia-falveri': COUPLES.ordinian
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(
    childIds,
    PARENTS_BY_PARTNERSHIP[partnershipId],
    partnershipId,
    { idPrefix: 'falveri-parentage', ...options }
  );
}

export const HOUSE_FALVERI_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-falveri',
    title: 'Haus Falveri',
    motto: '',
    description: 'Großes Magnarierhaus der Stadtrepublik Venalys. Die Falveri gehören nicht zu den fünf Patrizier-Gründerhäusern, sondern halten als venalisches Lehenshaus Ämter, Land und militärische Pflichten unter deren Ordnung. Aldo Falveri entstammt einem politisch unbedeutenden Nebenzweig und erwarb Vermögen und Ansehen erst als Condottiere.',
    emblem: FALVERI_EMBLEM,
    houseProfile: VENALYS_HOUSE_PROFILES.falveri
  },
  houses: [
    {
      id: FALVERI_HOUSE_ID,
      name: 'Haus Falveri',
      motto: '',
      emblem: FALVERI_EMBLEM,
      status: 'active'
    },
    {
      id: CYMRATH_HOUSE_ID,
      name: "Haus Cymrath O'Traethlan",
      motto: '',
      emblem: CYMRATH_EMBLEM,
      status: 'active'
    }
  ],
  persons: [
    person('unknown-founder-falveri', '???', 'male', '????', '????', {
      title: 'Unbekannter Gründer des Hauses Falveri',
      lineageRole: 'head',
      notes: 'Der Name des frühen Falveri-Gründers ist nicht überliefert.'
    }),
    spouse('unknown-founder-wife-falveri', '???', 'female', '????', '????', {
      title: 'Unbekannte Mitgründerin des Hauses Falveri'
    }),

    person('valerian-elder-falveri', 'Valerian Falveri', 'male', '1629', '1698', {
      title: 'Don · Magnarier und erster namentlich überlieferter Falveri',
      lineageRole: 'head'
    }),
    spouse('valeria-elder-spouse', 'Valeria', 'female', '1635', '1706', {
      title: 'Gemahlin Valerians'
    }),

    person('senarian-falveri', 'Senarian Falveri', 'male', '1655', '1724', {
      title: 'Don · Oberhaupt des Magnarierhauses bis 1724',
      lineageRole: 'head'
    }),
    spouse('honoria-senarian-spouse', 'Honoria', 'female', '1660', '1731'),
    person('lexarius-falveri', 'Lexarius Falveri', 'male', '1659', '1720', {
      title: 'Don · Rechts- und Rechnungsführer der Falveri'
    }),
    spouse('sapienia-lexarius-spouse', 'Sapienia', 'female', '1664', '1734'),
    person('fidelia-falveri', 'Fidelia Falveri', 'female', '1662', '1728', {
      title: 'Wegverheiratete Tochter Valerians',
      tags: ['Wegverheiratet']
    }),
    spouse('civerius-fidelia-spouse', 'Civerius', 'male', '1658', '1726', {
      title: 'Gemahl Fidelias · Haus unbekannt'
    }),
    person('rationius-falveri', 'Rationius Falveri', 'male', '1668', '1729', {
      title: 'Don · Vorsteher eines unbedeutenden Falveri-Nebenzweigs',
      notes: 'Rationius begründete den politisch schwächsten der drei männlichen Zweige. Sein zweiter Sohn Aldo erbte weder Amt noch nennenswertes Land.'
    }),
    spouse('civeria-rationius-spouse', 'Civeria', 'female', '1673', '1736'),

    person('valerius-falveri', 'Valerius Falveri', 'male', '1680', '', {
      title: 'Don · Oberhaupt des Magnarierhauses seit 1724',
      lineageRole: 'head'
    }),
    spouse('nobilia-valerius-spouse', 'Nobilia', 'female', '1685', ''),
    person('civerian-falveri', 'Civerian Falveri', 'male', '1684', '', {
      title: 'Don · Verwalter falverischer Lehensgüter'
    }),
    spouse('rationia-civerian-spouse', 'Rationia', 'female', '1688', ''),
    affair('livia-civerian-affair', 'Livia', 'female', '1691', '', {
      title: 'Affäre Civerians · Mutter von zwei Bastarden',
      notes: 'Bellarellus und Venturina stammen ausschließlich aus Livias Affäre mit Civerian.'
    }),
    person('honoria-falveri', 'Honoria Falveri', 'female', '1687', '', {
      title: 'Wegverheiratete Tochter Senarians',
      tags: ['Wegverheiratet']
    }),
    spouse('argentius-honoria-spouse', 'Argentius', 'male', '1683', '', {
      title: 'Gemahl Honorias · Haus unbekannt'
    }),

    person('potenian-falveri', 'Potenian Falveri', 'male', '1683', '', {
      title: 'Don · Gesandter und Silberhändler'
    }),
    spouse('argentia-potenian-spouse', 'Argentia', 'female', '1688', ''),
    affair('celia-potenian-affair', 'Celia', 'female', '1690', '', {
      title: 'Ehemalige Affäre Potenians · Mutter eines Bastards',
      notes: 'Victorellus stammt ausschließlich aus Celias Affäre mit Potenian.'
    }),
    person('valeria-falveri', 'Valeria Falveri', 'female', '1686', '', {
      title: 'Wegverheiratete Tochter Lexarius’',
      tags: ['Wegverheiratet']
    }),
    spouse('fortenius-valeria-spouse', 'Fortenius', 'male', '1682', '', {
      title: 'Gemahl Valerias · Haus unbekannt'
    }),
    person('liberius-falveri', 'Liberius Falveri', 'male', '1690', '', {
      title: 'Don · Rechtsgelehrter des Hauses Falveri'
    }),
    spouse('honorina-liberius-spouse', 'Honorina', 'female', '1695', ''),

    person('fortenius-falveri', 'Fortenius Falveri', 'male', '1692', '', {
      title: 'Don · Verwalter des kleinen Rationius-Zweigs'
    }),
    spouse('ordinia-fortenius-spouse', 'Ordinia', 'female', '1695', ''),
    person('aldo-falveri', 'Aldo Falveri', 'male', '1697', '', {
      title: 'Don · Cavaliere und ehemaliger Condottiere der Roten Kompanie',
      tags: ['Cavaliere', 'Condottiere', 'Rote Kompanie', 'Klingende Münze'],
      notes: 'Aldo stammt als zweiter Sohn aus dem politisch unbedeutenden Rationius-Nebenzweig. Ohne Aussicht auf ein maßgebliches Falveri-Erbe machte er Karriere als Hauptmann der Roten Kompanie, erwarb in Gwynthor ein Vermögen und sucht 1740 im Alter von 43 Jahren ein dauerhaftes Lehen im Dienst des Hauses Draig. Er ist bewusst der einzige unverheiratete Falveri über dreißig.'
    }),
    person('lexaria-falveri', 'Lexaria Falveri', 'female', '1701', '', {
      title: 'Wegverheiratete Tochter Rationius’',
      tags: ['Wegverheiratet']
    }),
    spouse('senarius-lexaria-spouse', 'Senarius', 'male', '1697', '', {
      title: 'Gemahl Lexarias · Haus unbekannt'
    }),

    person('valerian-falveri', 'Valerian Falveri', 'male', '1705', '', {
      title: 'Don · Erbe der Falveri-Hauptlinie',
      lineageRole: 'mainline'
    }),
    spouse('argentiana-valerian-spouse', 'Argentiana', 'female', '1708', ''),
    person('senaria-falveri', 'Senaria Falveri', 'female', '1708', '', {
      title: 'Wegverheiratete Tochter Valerius’',
      tags: ['Wegverheiratet']
    }),
    spouse('honorius-senaria-spouse', 'Honorius', 'male', '1705', '', {
      title: 'Gemahl Senarias · Haus unbekannt'
    }),
    person('fidelius-falveri', 'Fidelius Falveri', 'male', '1712', '', {
      title: 'Don · Jüngerer Sohn der Hauptlinie'
    }),
    person('victoria-falveri', 'Victoria Falveri', 'female', '1716', '', {
      title: 'Unverheiratete Tochter der Hauptlinie'
    }),

    person('lexarian-falveri', 'Lexarian Falveri', 'male', '1710', '', {
      title: 'Don · Erbe des Civerian-Zweigs'
    }),
    spouse('fidelina-lexarian-spouse', 'Fidelina', 'female', '1711', ''),
    person('fortenia-falveri', 'Fortenia Falveri', 'female', '1713', '', {
      title: 'Unverheiratete Tochter Civerians'
    }),
    person('argentellus-falveri', 'Argentellus Falveri', 'male', '1717', '', {
      title: 'Don · Jüngster legitimer Sohn Civerians'
    }),
    bastard('bellarellus-falveri', 'Bellarellus Falveri', 'male', '1714', {
      title: 'Nicht anerkannter Bastard Civerians und Livias',
      notes: 'Bellarellus ist ein Sohn aus Civerians Affäre mit Livia und gehört nicht zur Erbfolge.'
    }),
    bastard('venturina-falveri', 'Venturina Falveri', 'female', '1717', {
      title: 'Nicht anerkannte Bastardtochter Civerians und Livias',
      notes: 'Venturina ist eine Tochter aus Civerians Affäre mit Livia und gehört nicht zur Erbfolge.'
    }),

    person('ordinian-falveri', 'Ordinian Falveri', 'male', '1710', '', {
      title: 'Don · Erbe des Potenian-Zweigs'
    }),
    spouse('venturia-ordinian-spouse', 'Venturia', 'female', '1711', ''),
    person('gloriella-falveri', 'Gloriella Falveri', 'female', '1713', '', {
      title: 'Unverheiratete Tochter Potenians'
    }),
    person('bellarinus-falveri', 'Bellarinus Falveri', 'male', '1716', '', {
      title: 'Don · Jüngerer Sohn Potenians'
    }),
    bastard('victorellus-falveri', 'Victorellus Falveri', 'male', '1714', {
      title: 'Nicht anerkannter Bastard Potenians und Celias',
      notes: 'Victorellus ist Potenians einziger Sohn aus der Affäre mit Celia und gehört nicht zur Erbfolge.'
    }),

    person('venturian-falveri', 'Venturian Falveri', 'male', '1718', '', {
      title: 'Don · Ältester Sohn Liberius’'
    }),
    person('sapienella-falveri', 'Sapienella Falveri', 'female', '1721', '', {
      title: 'Unverheiratete Tochter Liberius’'
    }),
    person('legarellus-falveri', 'Legarellus Falveri', 'male', '1724', '', {
      title: 'Jüngster Sohn Liberius’'
    }),
    person('discipian-falveri', 'Discipian Falveri', 'male', '1716', '', {
      title: 'Don · Erbe des unbedeutenden Rationius-Zweigs'
    }),
    person('argentella-falveri', 'Argentella Falveri', 'female', '1719', '', {
      title: 'Unverheiratete Tochter Fortenius’'
    }),

    person('honorian-falveri', 'Honorian Falveri', 'male', '1728', '', {
      title: 'Vorgesehener Erbe nach seinem Vater',
      lineageRole: 'mainline'
    }),
    person('valerella-falveri', 'Valerella Falveri', 'female', '1731', ''),
    person('civerellus-falveri', 'Civerellus Falveri', 'male', '1735', ''),
    person('lexarellus-falveri', 'Lexarellus Falveri', 'male', '1732', ''),
    person('rationella-falveri', 'Rationella Falveri', 'female', '1736', ''),
    person('potenellus-falveri', 'Potenellus Falveri', 'male', '1732', ''),
    person('fidelella-falveri', 'Fidelella Falveri', 'female', '1735', '')
  ],
  partnerships: [
    createMarriage('marriage-unknown-founders-falveri', ...COUPLES.founders, { status: 'ended' }),
    createMarriage('marriage-valerian-valeria-falveri', ...COUPLES.valerianElder, { status: 'ended', end: '1698' }),
    createMarriage('marriage-senarian-honoria-falveri', ...COUPLES.senarian, { status: 'ended', end: '1724' }),
    createMarriage('marriage-lexarius-sapienia-falveri', ...COUPLES.lexarius, { status: 'ended', end: '1720' }),
    createMarriage('marriage-fidelia-civerius-falveri', ...COUPLES.fidelia, { status: 'ended', end: '1726' }),
    createMarriage('marriage-rationius-civeria-falveri', ...COUPLES.rationius, { status: 'ended', end: '1729' }),
    createMarriage('marriage-valerius-nobilia-falveri', ...COUPLES.valerius, { start: '1703' }),
    createMarriage('marriage-civerian-rationia-falveri', ...COUPLES.civerian, { start: '1708' }),
    createMarriage('affair-civerian-livia-falveri', ...COUPLES.civerianAffair, {
      type: 'affair',
      status: 'ended',
      start: '1713',
      end: '1718'
    }),
    createMarriage('marriage-honoria-argentius-falveri', ...COUPLES.honoria, { start: '1706' }),
    createMarriage('marriage-potenian-argentia-falveri', ...COUPLES.potenian, { start: '1708' }),
    createMarriage('affair-potenian-celia-falveri', ...COUPLES.potenianAffair, {
      type: 'affair',
      status: 'ended',
      start: '1713',
      end: '1715'
    }),
    createMarriage('marriage-valeria-fortenius-falveri', ...COUPLES.valeria, { start: '1705' }),
    createMarriage('marriage-liberius-honorina-falveri', ...COUPLES.liberius, { start: '1716' }),
    createMarriage('marriage-fortenius-ordinia-falveri', ...COUPLES.fortenius, { start: '1714' }),
    createMarriage('marriage-lexaria-senarius-falveri', ...COUPLES.lexaria, { start: '1721' }),
    createMarriage('marriage-valerian-argentiana-falveri', ...COUPLES.valerian, { start: '1726' }),
    createMarriage('marriage-senaria-honorius-falveri', ...COUPLES.senaria, { start: '1727' }),
    createMarriage('marriage-lexarian-fidelina-falveri', ...COUPLES.lexarian, { start: '1730' }),
    createMarriage('marriage-ordinian-venturia-falveri', ...COUPLES.ordinian, { start: '1730' })
  ],
  parentages: [
    ...childrenOf(['valerian-elder-falveri'], 'marriage-unknown-founders-falveri', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Valerian ist der erste namentlich ausgestaltete Vorfahr nach einer unbekannten Zahl nicht überlieferter Generationen.',
      extensions: { timeJumpId: 'gap-founders-valerian-falveri' }
    }),
    ...childrenOf(
      ['senarian-falveri', 'lexarius-falveri', 'fidelia-falveri', 'rationius-falveri'],
      'marriage-valerian-valeria-falveri'
    ),
    ...childrenOf(['valerius-falveri', 'civerian-falveri', 'honoria-falveri'], 'marriage-senarian-honoria-falveri'),
    ...childrenOf(['potenian-falveri', 'valeria-falveri', 'liberius-falveri'], 'marriage-lexarius-sapienia-falveri'),
    ...childrenOf(['fortenius-falveri', 'aldo-falveri', 'lexaria-falveri'], 'marriage-rationius-civeria-falveri'),
    ...childrenOf(['valerian-falveri', 'senaria-falveri', 'fidelius-falveri', 'victoria-falveri'], 'marriage-valerius-nobilia-falveri'),
    ...childrenOf(['lexarian-falveri', 'fortenia-falveri', 'argentellus-falveri'], 'marriage-civerian-rationia-falveri'),
    ...childrenOf(['bellarellus-falveri', 'venturina-falveri'], 'affair-civerian-livia-falveri', {
      legitimacy: 'illegitimate',
      notes: 'Bastard aus Civerians Affäre mit Livia.'
    }),
    ...childrenOf(['ordinian-falveri', 'gloriella-falveri', 'bellarinus-falveri'], 'marriage-potenian-argentia-falveri'),
    ...childrenOf(['victorellus-falveri'], 'affair-potenian-celia-falveri', {
      legitimacy: 'illegitimate',
      notes: 'Bastard aus Potenians Affäre mit Celia.'
    }),
    ...childrenOf(['venturian-falveri', 'sapienella-falveri', 'legarellus-falveri'], 'marriage-liberius-honorina-falveri'),
    ...childrenOf(['discipian-falveri', 'argentella-falveri'], 'marriage-fortenius-ordinia-falveri'),
    ...childrenOf(['honorian-falveri', 'valerella-falveri', 'civerellus-falveri'], 'marriage-valerian-argentiana-falveri'),
    ...childrenOf(['lexarellus-falveri', 'rationella-falveri'], 'marriage-lexarian-fidelina-falveri'),
    ...childrenOf(['potenellus-falveri', 'fidelella-falveri'], 'marriage-ordinian-venturia-falveri')
  ],
  cadetBranches: [
    createMigrationHouseBranch({
      id: 'founded-cymrath-o-traethlan-aldo',
      name: "Haus Cymrath O'Traethlan",
      subtitle: 'Neu begründetes Ritterherrenhaus in Cenyr',
      parentPersonId: 'aldo-falveri',
      houseId: CYMRATH_HOUSE_ID,
      targetFamilyId: 'haus-cymrath-o-traethlan',
      emblem: CYMRATH_EMBLEM,
      crestFrame: 'silver',
      notes: "Aldo Falveri begründet in Tŵr Traethlan das Haus Cymrath O'Traethlan. Die vollständige Gründungsakte mit seiner unbekannten Braut ist über diesen Knoten erreichbar.",
      extensions: {
        registryManagedFields: [
          'linkType',
          'parentPartnershipId',
          'parentPersonId',
          'subtitle',
          'notes'
        ]
      }
    }),
    createMarriedAwayBranch({
      id: 'married-away-fidelia-falveri',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-fidelia-civerius-falveri',
      houseId: 'house-unbekannt-fidelia-falveri',
      targetFamilyId: 'haus-unbekannt',
      subtitle: 'Wegverheiratet an unbekanntes Haus',
      notes: 'Fidelia Falveri führte nach ihrer Heirat keine Falveri-Linie fort.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-honoria-falveri',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-honoria-argentius-falveri',
      houseId: 'house-unbekannt-honoria-falveri',
      targetFamilyId: 'haus-unbekannt',
      subtitle: 'Wegverheiratet an unbekanntes Haus',
      notes: 'Honoria Falveri führte nach ihrer Heirat keine Falveri-Linie fort.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-valeria-falveri',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-valeria-fortenius-falveri',
      houseId: 'house-unbekannt-valeria-falveri',
      targetFamilyId: 'haus-unbekannt',
      subtitle: 'Wegverheiratet an unbekanntes Haus',
      notes: 'Valeria Falveri führte nach ihrer Heirat keine Falveri-Linie fort.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-lexaria-falveri',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-lexaria-senarius-falveri',
      houseId: 'house-unbekannt-lexaria-falveri',
      targetFamilyId: 'haus-unbekannt',
      subtitle: 'Wegverheiratet an unbekanntes Haus',
      notes: 'Lexaria Falveri führte nach ihrer Heirat keine Falveri-Linie fort.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-senaria-falveri',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-senaria-honorius-falveri',
      houseId: 'house-unbekannt-senaria-falveri',
      targetFamilyId: 'haus-unbekannt',
      subtitle: 'Wegverheiratet an unbekanntes Haus',
      notes: 'Senaria Falveri führte nach ihrer Heirat keine Falveri-Linie fort.'
    })
  ],
  timeJumps: [
    {
      id: 'gap-founders-valerian-falveri',
      parentPartnershipId: 'marriage-unknown-founders-falveri',
      parentPersonId: '',
      childIds: ['valerian-elder-falveri'],
      years: 0,
      fromYear: '????',
      toYear: '1629',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Einziger absoluter Generationentrenner zwischen dem Falveri-Hauswappen und Aldos Großvater Valerian.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-unknown-founders-falveri',
    houseId: FALVERI_HOUSE_ID,
    crestSubtitle: 'Magnarierhaus der Stadtrepublik Venalys',
    crestEmblemScale: 0.86,
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: { enabled: false }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'valerian-elder-falveri',
    orientation: 'vertical',
    ancestorDepth: 10,
    descendantDepth: 10,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 1,
    sourceModule: 'Modulvorlagen/aldo-falveri.json',
    sourceNote: 'Aldos Name, Geburtsjahr 1697, Alter 43 im Jahr 1740, Herkunft aus Venalys, Rang als Cavaliere, Laufbahn als Condottiere und Hauptmann der Roten Kompanie, Vermögen, Beziehungen zur Klingenden Münze sowie sein Wunsch nach einem dauerhaften Lehen folgen der Modulvorlage. Rang, Registerzuordnung und Silberrahmen folgen der ausdrücklichen Korrektur: Falveri ist kein Patrizierhaus, sondern ein Magnarier-Lehenshaus der Stadtrepublik. Die übrige große Familie ist mit Stämmen und Endungen der Lingua Argenti ausgestaltet. Nach einem unbekannten Gründerpaar, Hauswappen und genau einem seriellen Zeitsprung setzt die namentliche Linie bei Aldos Großvater Valerian ein. Aldo bleibt unverheirateter zweiter Sohn des politisch unbedeutenden dritten Zweigs und besitzt keinen maßgeblichen Erbanspruch.',
    registryManagedExtensionFields: ['sourceNote', 'venalysEstate', 'affairAttribution'],
    venalysEstate: {
      rankId: 'magnarian',
      rankLabel: 'Magnarierhaus',
      patricianFounderHouse: false,
      feudalKnightHouse: false,
      maleHonorific: 'Don',
      socialOrder: ['Patrizier', 'Magnarier', 'Mercantier', 'Plebejer'],
      definition: 'Magnarier sind venalische Lehenshäuser unter den fünf Patrizier-Gründerhäusern. Ihre Edelleute erfüllen militärische und administrative Pflichten, ohne einem feudalen Ritteradel anzugehören.'
    },
    affairAttribution: [
      {
        partnershipId: 'affair-civerian-livia-falveri',
        parentIds: COUPLES.civerianAffair,
        childIds: ['bellarellus-falveri', 'venturina-falveri']
      },
      {
        partnershipId: 'affair-potenian-celia-falveri',
        parentIds: COUPLES.potenianAffair,
        childIds: ['victorellus-falveri']
      }
    ]
  }
});
