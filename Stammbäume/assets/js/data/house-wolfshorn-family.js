import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import {
  createFamilyPerson,
  createMarriage,
  createParentages,
  createMarriedAwayBranch
} from './family-record-builders.js';

// Quelle: vom Nutzer geliefertes AleriaAlmanach-Modulpaket "Hrolf Wolfshorn" (Biographie- und
// Hausseite "Clan Wolfshorn") sowie ausdrueckliche Nutzerkorrekturen zu Alter, Verwandtschaft
// und Sterbestatus. Die Biographie-Fliesstext-Stelle "juengerer Bruder Asgeir, Sohn Halvar"
// widerspricht der strukturierten Verbindungsliste ("Halvar = juengster Bruder, Asgeir =
// aeltester Sohn") und den ausdruecklichen Nutzerangaben (Halvar 39, Asgeir/Ylva 25+); nach
// DATENPFLEGE-Quellenhierarchie gilt die strukturierte Liste, nicht der Fliesstext.
const HOUSE_EMBLEMS = Object.freeze({
  wolfshorn: 'https://i.imgur.com/wsMjaTx.png',
  vangandr: 'https://i.imgur.com/A9WNWtf.png'
});

const REGION_EMBLEMS = Object.freeze({
  aldrimar: 'https://i.imgur.com/OnNslhr.png',
  roriksheim: 'https://i.imgur.com/enlRWCv.png',
  daemmergrund: 'https://i.imgur.com/KyBhKyq.png'
});

const WOLFSHORN_HOUSE_ID = 'house-wolfshorn';

function person(id, name, sex, birth = '????', death = '', houseId = '', options = {}) {
  return createFamilyPerson({ id, name, sex, birth, death, houseId, ...options });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

function marriedAway(id, partnershipId) {
  return createMarriedAwayBranch({
    id,
    name: 'Unbekanntes Haus',
    parentPartnershipId: partnershipId,
    houseId: '',
    targetFamilyId: 'haus-unbekannt',
    emblem: ''
  });
}

const FOUNDER_IDS = ['ahnherr-wolfshorn', 'ahnfrau-wolfshorn'];
const RAGNAR_FREYA_IDS = ['ragnar-wolfshorn', 'freya-wolfshorn'];
const ASTRID_TORGILS_IDS = ['astrid-wolfshorn', 'torgils'];
const SOLVEIG_ULF_IDS = ['solveig-wolfshorn', 'ulf'];
const HROLF_LIV_IDS = ['hrolf-wolfshorn', 'liv'];
const GYDA_ROAR_IDS = ['gyda-wolfshorn', 'roar'];
const SIGNE_EINAR_IDS = ['signe-wolfshorn', 'einar'];
const BJORN_VIGDIS_IDS = ['bjorn-wolfshorn', 'vigdis'];
const BJORN_HALLA_IDS = ['bjorn-wolfshorn', 'halla'];
const THORA_ANGREIFER_IDS = ['thora-wolfshorn', 'unbekannter-angreifer-thora'];

export const HOUSE_WOLFSHORN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-wolfshorn',
    title: 'Clan Wolfshorn',
    motto: 'Lieber fallen als weichen.',
    description: 'Clan Wolfshorn, ein aldrimarisches Huskarlgeschlecht, diente Generationen lang dem Clan Vangandr als Grenzwaechter der Wehrhalle Hornhall in Daemmergrund. Als der Dunkelhain ihre Grenzlande verschlang, hielten sie ihre Feste ueber Jahre gegen Hunger und Verfall, ehe Huskarlherr Hrolf Wolfshorn sie schliesslich aufgab. Die Vangandr werteten dies als Bruch des Lehnseides und verbannten den Clan aus ihrem Thanentum. Hrolf fuehrt die letzten Wolfshorn nun nach Cenyr, um Haus Draig einen neuen Eid anzubieten.',
    emblem: HOUSE_EMBLEMS.wolfshorn,
    houseProfile: createHouseProfileFromFolderPath(
      ['Aldrimar', 'Roriksheim', 'Daemmergrund', 'Hornhall'],
      {
        rankId: 'knight',
        liegeHouseName: 'Clan Vangandr',
        regionEmblems: {
          kingdom: REGION_EMBLEMS.aldrimar,
          county: REGION_EMBLEMS.roriksheim,
          barony: REGION_EMBLEMS.daemmergrund
        }
      }
    )
  },
  houses: [
    house(WOLFSHORN_HOUSE_ID, 'Clan Wolfshorn', HOUSE_EMBLEMS.wolfshorn),
    house('house-vangandr', 'Clan Vangandr', HOUSE_EMBLEMS.vangandr)
  ],
  persons: [
    // Unbekanntes Gruenderpaar, das Haus Wolfshorn begruendete. Mehrere Jahrhunderte als
    // Grenzwaechter der Vangandr in Hornhall sind nicht einzeln ueberliefert (siehe timeJumps).
    person('ahnherr-wolfshorn', 'Unbekannter Ahnherr Wolfshorn', 'male', '????', '????', WOLFSHORN_HOUSE_ID, {
      familyRole: 'core',
      lineageRole: 'head',
      title: 'Begruender des Clans Wolfshorn'
    }),
    person('ahnfrau-wolfshorn', 'Unbekannte Ahnfrau Wolfshorn', 'female', '????', '????', '', {
      familyRole: 'married'
    }),

    // Hrolfs Grosseltern sind nicht benannt; Ragnar und seine Schwestern Astrid und Solveig
    // gelten als die erste namentlich bekannte Generation nach dem Zeitsprung. Alle drei
    // erreichten ein hohes Alter und starben eines natuerlichen Todes.
    person('ragnar-wolfshorn', 'Ragnar Wolfshorn', 'male', '1650', '1732', WOLFSHORN_HOUSE_ID, {
      familyRole: 'core',
      lineageRole: 'head',
      title: 'Huskarlherr von Hornhall',
      notes: 'Hrolfs Vater; gestorben 1732 im hohen Alter von 82 Jahren.'
    }),
    person('freya-wolfshorn', 'Freya', 'female', '1655', '1730', '', {
      familyRole: 'married',
      notes: 'Hrolfs Mutter; gestorben 1730 im hohen Alter von 75 Jahren. Herkunft nicht ueberliefert.'
    }),
    person('astrid-wolfshorn', 'Astrid Wolfshorn', 'female', '1648', '1728', WOLFSHORN_HOUSE_ID, {
      familyRole: 'core',
      lineageRole: 'branch',
      title: 'Hrolfs Tante, wegverheiratet an ein unbekanntes Haus',
      notes: 'Ragnars aeltere Schwester; gestorben 1728 im hohen Alter.'
    }),
    person('torgils', 'Torgils', 'male', '1645', '1726', '', {
      familyRole: 'married',
      notes: 'Astrids Mann; gestorben 1726 im hohen Alter. Herkunftshaus nicht ueberliefert.'
    }),
    person('solveig-wolfshorn', 'Solveig Wolfshorn', 'female', '1653', '1731', WOLFSHORN_HOUSE_ID, {
      familyRole: 'core',
      lineageRole: 'branch',
      title: 'Hrolfs Tante, wegverheiratet an ein unbekanntes Haus',
      notes: 'Ragnars juengere Schwester; gestorben 1731 im hohen Alter.'
    }),
    person('ulf', 'Ulf', 'male', '1650', '1729', '', {
      familyRole: 'married',
      notes: 'Solveigs Mann; gestorben 1729 im hohen Alter. Herkunftshaus nicht ueberliefert.'
    }),

    // Hrolfs eigene Generation: er selbst, sein juengster Bruder Halvar, zwei im Kampf gegen
    // die Kreaturen des Dunkelhains gefallene Brueder ohne Nachkommen, sein Bruder Bjoern mit
    // zwei Verhaeltnissen, zwei wegverheiratete Schwestern und seine Schwester Thora.
    person('hrolf-wolfshorn', 'Hrolf Wolfshorn', 'male', '1679', '', WOLFSHORN_HOUSE_ID, {
      familyRole: 'core',
      lineageRole: 'head',
      title: 'Huskarlherr (Ritterherr), vormals Herr von Hornhall',
      portrait: 'https://i.imgur.com/3SWLL45.png',
      notes: 'Gab Hornhall auf und fuehrt die letzten Wolfshorn nach Cenyr, um Haus Draig einen neuen Eid anzubieten.'
    }),
    person('ivar-wolfshorn', 'Ivar Wolfshorn', 'male', '1684', '1730', WOLFSHORN_HOUSE_ID, {
      familyRole: 'core',
      lineageRole: 'branch',
      title: 'Huskarl der Wolfshorn',
      notes: 'Fiel 1730 im Kampf gegen die Kreaturen des Dunkelhains. Keine Nachkommen.'
    }),
    person('torvald-wolfshorn', 'Torvald Wolfshorn', 'male', '1690', '1735', WOLFSHORN_HOUSE_ID, {
      familyRole: 'core',
      lineageRole: 'branch',
      title: 'Huskarl der Wolfshorn',
      notes: 'Fiel 1735 im Kampf gegen die Kreaturen des Dunkelhains. Keine Nachkommen.'
    }),
    person('bjorn-wolfshorn', 'Bjoern Wolfshorn', 'male', '1687', '', WOLFSHORN_HOUSE_ID, {
      familyRole: 'core',
      lineageRole: 'branch',
      title: 'Huskarl der Wolfshorn',
      notes: 'Ging nie eine Ehe ein, unterhielt aber gleichzeitig zwei Verhaeltnisse, mit Vigdis und mit Halla, aus denen zusammen vier Kinder hervorgingen.'
    }),
    person('vigdis', 'Vigdis', 'female', '1691', '', '', {
      familyRole: 'affair',
      notes: 'Bjoerns erste heimliche Geliebte, Mutter von Eskil und Frida.'
    }),
    person('halla', 'Halla', 'female', '1695', '', '', {
      familyRole: 'affair',
      notes: 'Bjoerns zweite, gleichzeitige heimliche Geliebte, Mutter von Njall und Solvi.'
    }),
    person('gyda-wolfshorn', 'Gyda Wolfshorn', 'female', '1693', '', WOLFSHORN_HOUSE_ID, {
      familyRole: 'core',
      lineageRole: 'branch',
      title: 'Wegverheiratet an ein unbekanntes Haus',
      notes: 'Hrolfs Schwester; verliess den Clan Wolfshorn durch ihre Ehe mit Roar.'
    }),
    person('roar', 'Roar', 'male', '1690', '', '', {
      familyRole: 'married',
      notes: 'Gydas Mann; Herkunftshaus nicht ueberliefert.'
    }),
    person('signe-wolfshorn', 'Signe Wolfshorn', 'female', '1696', '', WOLFSHORN_HOUSE_ID, {
      familyRole: 'core',
      lineageRole: 'branch',
      title: 'Wegverheiratet an ein unbekanntes Haus',
      notes: 'Hrolfs Schwester; verliess den Clan Wolfshorn durch ihre Ehe mit Einar.'
    }),
    person('einar', 'Einar', 'male', '1692', '', '', {
      familyRole: 'married',
      notes: 'Signes Mann; Herkunftshaus nicht ueberliefert.'
    }),
    person('thora-wolfshorn', 'Thora Wolfshorn', 'female', '1682', '', WOLFSHORN_HOUSE_ID, {
      familyRole: 'core',
      lineageRole: 'branch',
      title: 'Schwester Hrolfs',
      notes: 'Wurde waehrend eines Ueberfalls Fremder geschaendet; ihr Sohn Kolbein ist das Ergebnis dieser Tat. Lebt noch.'
    }),
    person('unbekannter-angreifer-thora', 'Unbekannter Angreifer', 'male', '????', '????', '', {
      familyRole: 'forced',
      lineageRole: 'branch',
      notes: 'Namenloser Angreifer, der Thora waehrend des Ueberfalls schaendete; Vater Kolbeins. Kein Teil des Clans, Verbleib unbekannt.'
    }),
    person('halvar-wolfshorn', 'Halvar Wolfshorn', 'male', '1701', '', WOLFSHORN_HOUSE_ID, {
      familyRole: 'core',
      lineageRole: 'branch',
      title: 'Juengster Bruder Hrolfs, Huskarl der Wolfshorn',
      portrait: 'https://i.imgur.com/tKPWO78.png',
      notes: 'Begleitet Hrolf nach Cenyr.'
    }),

    // Bjoerns uneheliche Kinder. Als Bastarde tragen sie nicht den Hausnamen Wolfshorn,
    // sondern einen Beinamen.
    person('eskil-wolfshorn', 'Eskil Langbein', 'male', '1715', '', WOLFSHORN_HOUSE_ID, {
      familyRole: 'bastard',
      lineageRole: 'branch',
      title: 'Unehelicher Sohn Bjoerns'
    }),
    person('frida-wolfshorn', 'Frida die Rote', 'female', '1717', '', WOLFSHORN_HOUSE_ID, {
      familyRole: 'bastard',
      lineageRole: 'branch',
      title: 'Uneheliche Tochter Bjoerns'
    }),
    person('njall-wolfshorn', 'Njall der Kleine', 'male', '1722', '', WOLFSHORN_HOUSE_ID, {
      familyRole: 'bastard',
      lineageRole: 'branch',
      title: 'Unehelicher Sohn Bjoerns'
    }),
    person('solvi-wolfshorn', 'Solvi Falkenauge', 'female', '1724', '', WOLFSHORN_HOUSE_ID, {
      familyRole: 'bastard',
      lineageRole: 'branch',
      title: 'Uneheliche Tochter Bjoerns'
    }),

    // Thoras unehelicher Sohn. Als Bastard traegt er nicht den Hausnamen Wolfshorn.
    person('kolbein-wolfshorn', 'Kolbein der Namenlose', 'male', '1710', '', WOLFSHORN_HOUSE_ID, {
      familyRole: 'bastard',
      lineageRole: 'branch',
      title: 'Unehelicher Sohn Thoras'
    }),

    // Hrolfs Frau Liv verliess ihn mit etwa der Haelfte ihrer gemeinsamen Kinder und kehrte zu
    // ihrem eigenen Clan im Norden Aldrimars zurueck. Ihr weiteres Schicksal und das der mit ihr
    // fortgezogenen Kinder ist Hrolf unbekannt.
    person('liv', 'Liv', 'female', '1688', '', '', {
      familyRole: 'married',
      notes: 'Hrolfs Frau; verliess ihn und kehrte mit einem Teil ihrer Kinder zu ihrem eigenen Clan im Norden Aldrimars zurueck. Lebt noch.'
    }),

    // Hrolfs und Livs elf Kinder: die aeltesten Ylva und Asgeir sowie vier weitere blieben bei
    // Hrolf, fuenf juengere zogen mit Liv fort und sind seither verschollen.
    person('ylva-wolfshorn', 'Ylva Wolfshorn', 'female', '1710', '', WOLFSHORN_HOUSE_ID, {
      familyRole: 'core',
      lineageRole: 'mainline',
      title: 'Erstgeborene Tochter',
      portrait: 'https://i.imgur.com/zQmDv85.png',
      notes: 'Blieb bei Hrolf und begleitet ihn nach Cenyr.'
    }),
    person('asgeir-wolfshorn', 'Asgeir Wolfshorn', 'male', '1712', '', WOLFSHORN_HOUSE_ID, {
      familyRole: 'core',
      lineageRole: 'mainline',
      title: 'Aeltester Sohn',
      portrait: 'https://i.imgur.com/tlufXWn.png',
      notes: 'Blieb bei Hrolf und begleitet ihn nach Cenyr.'
    }),
    person('bodil-wolfshorn', 'Bodil Wolfshorn', 'female', '1714', '', WOLFSHORN_HOUSE_ID, {
      familyRole: 'core',
      lineageRole: 'mainline',
      notes: 'Blieb bei Hrolf und begleitet ihn nach Cenyr.'
    }),
    person('kettil-wolfshorn', 'Kettil Wolfshorn', 'male', '1716', '', WOLFSHORN_HOUSE_ID, {
      familyRole: 'core',
      lineageRole: 'mainline',
      notes: 'Blieb bei Hrolf und begleitet ihn nach Cenyr.'
    }),
    person('eirik-wolfshorn', 'Eirik Wolfshorn', 'male', '1718', '', WOLFSHORN_HOUSE_ID, {
      status: 'missing',
      familyRole: 'core',
      lineageRole: 'mainline',
      notes: 'Zog mit Liv fort; sein heutiges Schicksal ist Hrolf unbekannt.'
    }),
    person('sigrun-wolfshorn', 'Sigrun Wolfshorn', 'female', '1720', '', WOLFSHORN_HOUSE_ID, {
      familyRole: 'core',
      lineageRole: 'mainline',
      notes: 'Blieb bei Hrolf und begleitet ihn nach Cenyr.'
    }),
    person('dagny-wolfshorn', 'Dagny Wolfshorn', 'female', '1722', '', WOLFSHORN_HOUSE_ID, {
      status: 'missing',
      familyRole: 'core',
      lineageRole: 'mainline',
      notes: 'Zog mit Liv fort; ihr heutiges Schicksal ist Hrolf unbekannt.'
    }),
    person('torstein-wolfshorn', 'Torstein Wolfshorn', 'male', '1724', '', WOLFSHORN_HOUSE_ID, {
      familyRole: 'core',
      lineageRole: 'mainline',
      notes: 'Blieb bei Hrolf und begleitet ihn nach Cenyr.'
    }),
    person('vibeke-wolfshorn', 'Vibeke Wolfshorn', 'female', '1726', '', WOLFSHORN_HOUSE_ID, {
      status: 'missing',
      familyRole: 'core',
      lineageRole: 'mainline',
      notes: 'Zog mit Liv fort; ihr heutiges Schicksal ist Hrolf unbekannt.'
    }),
    person('ansgar-wolfshorn', 'Ansgar Wolfshorn', 'male', '1728', '', WOLFSHORN_HOUSE_ID, {
      status: 'missing',
      familyRole: 'core',
      lineageRole: 'mainline',
      notes: 'Zog mit Liv fort; sein heutiges Schicksal ist Hrolf unbekannt.'
    }),
    person('helka-wolfshorn', 'Helka Wolfshorn', 'female', '1730', '', WOLFSHORN_HOUSE_ID, {
      status: 'missing',
      familyRole: 'core',
      lineageRole: 'mainline',
      notes: 'Zog mit Liv fort; ihr heutiges Schicksal ist Hrolf unbekannt.'
    })
  ],
  partnerships: [
    createMarriage('marriage-ahnherr-ahnfrau-wolfshorn', ...FOUNDER_IDS, {
      status: 'ended',
      notes: 'Gruendungsehe des Clans Wolfshorn.'
    }),
    createMarriage('marriage-ragnar-freya', ...RAGNAR_FREYA_IDS, {
      status: 'ended',
      start: '1675',
      end: '1730',
      notes: 'Freya starb 1730, Ragnar 1732, beide im hohen Alter.'
    }),
    createMarriage('marriage-astrid-torgils', ...ASTRID_TORGILS_IDS, {
      status: 'ended',
      end: '1726',
      notes: 'Torgils starb 1726, Astrid 1728, beide im hohen Alter.'
    }),
    createMarriage('marriage-solveig-ulf', ...SOLVEIG_ULF_IDS, {
      status: 'ended',
      end: '1729',
      notes: 'Ulf starb 1729, Solveig 1731, beide im hohen Alter.'
    }),
    createMarriage('marriage-hrolf-liv', ...HROLF_LIV_IDS, {
      status: 'ended',
      start: '1709',
      end: '1731',
      notes: 'Liv verliess Hrolf 1731, kurz nach der Geburt der juengsten Tochter Helka, mit einem Teil ihrer Kinder und kehrte zu ihrem eigenen Clan im Norden Aldrimars zurueck. Beide leben noch.'
    }),
    createMarriage('marriage-gyda-roar', ...GYDA_ROAR_IDS, {
      status: 'active',
      notes: 'Gyda verliess mit dieser Ehe den Clan Wolfshorn.'
    }),
    createMarriage('marriage-signe-einar', ...SIGNE_EINAR_IDS, {
      status: 'active',
      notes: 'Signe verliess mit dieser Ehe den Clan Wolfshorn.'
    }),
    createMarriage('affair-bjorn-vigdis', ...BJORN_VIGDIS_IDS, {
      type: 'affair',
      status: 'active',
      certainty: 'confirmed',
      visibility: 'restricted',
      notes: 'Erstes, andauerndes heimliches Verhaeltnis Bjoerns, parallel zur Verbindung mit Halla; Ursprung von Eskil und Frida.'
    }),
    createMarriage('affair-bjorn-halla', ...BJORN_HALLA_IDS, {
      type: 'affair',
      status: 'active',
      certainty: 'confirmed',
      visibility: 'restricted',
      notes: 'Zweites, gleichzeitiges heimliches Verhaeltnis Bjoerns; Ursprung von Njall und Solvi.'
    }),
    createMarriage('forced-thora-angreifer', ...THORA_ANGREIFER_IDS, {
      type: 'forced',
      status: 'ended',
      certainty: 'confirmed',
      visibility: 'restricted',
      notes: 'Erzwungene Verbindung waehrend eines Ueberfalls Fremder; Ursprung Kolbeins.'
    })
  ],
  parentages: [
    ...createParentages(['ragnar-wolfshorn', 'astrid-wolfshorn', 'solveig-wolfshorn'], FOUNDER_IDS, 'marriage-ahnherr-ahnfrau-wolfshorn', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Mehrere Jahrhunderte nicht einzeln ueberlieferter Generationen liegen zwischen dem Gruenderpaar und dieser Geschwistergruppe.',
      extensions: { timeJumpId: 'gap-ahnherr-ragnar' }
    }),
    ...createParentages(
      ['hrolf-wolfshorn', 'ivar-wolfshorn', 'torvald-wolfshorn', 'bjorn-wolfshorn', 'gyda-wolfshorn', 'signe-wolfshorn', 'thora-wolfshorn', 'halvar-wolfshorn'],
      RAGNAR_FREYA_IDS,
      'marriage-ragnar-freya'
    ),
    ...createParentages(['eskil-wolfshorn', 'frida-wolfshorn'], BJORN_VIGDIS_IDS, 'affair-bjorn-vigdis', {
      legitimacy: 'illegitimate',
      certainty: 'confirmed',
      visibility: 'restricted',
      notes: 'Uneheliche Kinder aus Bjoerns Verhaeltnis mit Vigdis.'
    }),
    ...createParentages(['njall-wolfshorn', 'solvi-wolfshorn'], BJORN_HALLA_IDS, 'affair-bjorn-halla', {
      legitimacy: 'illegitimate',
      certainty: 'confirmed',
      visibility: 'restricted',
      notes: 'Uneheliche Kinder aus Bjoerns Verhaeltnis mit Halla.'
    }),
    ...createParentages(['kolbein-wolfshorn'], THORA_ANGREIFER_IDS, 'forced-thora-angreifer', {
      legitimacy: 'illegitimate',
      certainty: 'confirmed',
      visibility: 'restricted',
      notes: 'Thoras Sohn aus dem Ueberfall, bei dem sie geschaendet wurde.'
    }),
    ...createParentages(
      ['ylva-wolfshorn', 'asgeir-wolfshorn', 'bodil-wolfshorn', 'kettil-wolfshorn', 'eirik-wolfshorn', 'sigrun-wolfshorn', 'dagny-wolfshorn', 'torstein-wolfshorn', 'vibeke-wolfshorn', 'ansgar-wolfshorn', 'helka-wolfshorn'],
      HROLF_LIV_IDS,
      'marriage-hrolf-liv'
    )
  ],
  cadetBranches: [
    marriedAway('married-away-unbekannt-astrid', 'marriage-astrid-torgils'),
    marriedAway('married-away-unbekannt-solveig', 'marriage-solveig-ulf'),
    marriedAway('married-away-unbekannt-gyda', 'marriage-gyda-roar'),
    marriedAway('married-away-unbekannt-signe', 'marriage-signe-einar')
  ],
  timeJumps: [
    {
      id: 'gap-ahnherr-ragnar',
      parentPartnershipId: 'marriage-ahnherr-ahnfrau-wolfshorn',
      childIds: ['ragnar-wolfshorn', 'astrid-wolfshorn', 'solveig-wolfshorn'],
      years: 0,
      fromYear: '????',
      toYear: '1650',
      label: 'Mehrere Jahrhunderte als Grenzwaechter der Vangandr in Hornhall sind nicht einzeln ueberliefert',
      notes: 'Zwischen der Gruendung des Clans Wolfshorn und Ragnars Generation liegen mehrere Jahrhunderte, deren Traeger nicht ueberliefert sind.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-ahnherr-ahnfrau-wolfshorn',
    houseId: WOLFSHORN_HOUSE_ID,
    crestSubtitle: 'Huskarlgeschlecht',
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'ragnar-wolfshorn',
    orientation: 'vertical',
    ancestorDepth: 6,
    descendantDepth: 4,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: { sourceRevision: 1 }
});
