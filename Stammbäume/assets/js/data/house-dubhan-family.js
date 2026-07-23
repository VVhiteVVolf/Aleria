import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import {
  createFamilyPerson,
  createMarriage,
  createParentages,
  createMarriedAwayBranch
} from './family-record-builders.js';

// Quelle: vom Nutzer geliefertes AleriaAlmanach-Modulpaket "Breccan Dubhan" (Biographie- und
// Hausseite "Sept der Dubhan") sowie ausdrückliche Nutzerkorrekturen zu Alter, Verwandtschaft
// und dem Krieg 1718-1721. Kartenwappen fuer Faelaorn und Tir na Brann vom Nutzer geliefert;
// alle weiteren Wappen (Dubhan-Sept-Symbol, Mac-Dubglais-Wappen) stammen aus dem Modulpaket.
const HOUSE_EMBLEMS = Object.freeze({
  dubhan: 'https://i.imgur.com/dkv5dNQ.png',
  macDubglais: 'https://i.imgur.com/y1uwNjF.png'
});

const REGION_EMBLEMS = Object.freeze({
  faelaorn: 'https://i.imgur.com/64NEZw8.png',
  tirNaBrann: 'https://i.imgur.com/G1Fl4mQ.png'
});

const DUBHAN_HOUSE_ID = 'house-dubhan';

function person(id, name, sex, birth = '????', death = '????', houseId = '', options = {}) {
  return createFamilyPerson({ id, name, sex, birth, death, houseId, ...options });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

const LORD_CONCUBINE_IDS = ['unbekannter-lord-mac-dubglais', 'unbekannte-konkubine-nord'];
const FIACHRA_DOIREANN_IDS = ['fiachra-dubhan', 'doireann-dubhan'];
const CORMAC_AOIFE_IDS = ['cormac-dubhan', 'aoife-dubhan'];
const FEARGHAL_SORCHA_IDS = ['fearghal-dubhan', 'sorcha-dubhan'];
const MUIRCHERTACH_AINGEAL_IDS = ['muirchertach-dubhan', 'aingeal-dubhan'];
const TADHG_SCEANBH_IDS = ['tadhg-dubhan', 'sceanbh'];
const TADHG_MUIRNE_IDS = ['tadhg-dubhan', 'muirne'];
const DEIRDRE_CATHAL_IDS = ['deirdre-dubhan', 'cathal'];
const BRECCAN_EITHNE_IDS = ['breccan-dubhan', 'eithne-dubhan'];

export const HOUSE_DUBHAN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-dubhan',
    title: 'Clan Dubhan',
    motto: 'Vergessen, doch nicht gebrochen.',
    description: 'Die Sept Dubhan, eine Nebenlinie des Clan Mac Dubglais aus Faelaorn, bewachte über Jahrhunderte die Grenzfeste Caer Dubhan in Tir na Fuil. Im Krieg gegen die Nordmänner (1718-1721) verlor der Clan seine Heimat; in den Jahren danach starb der Großteil der Familie nach und nach. Nur Breccan Dubhan, seine beiden Kinder Rogaire und Alpin sowie seine Nichte Ailbhe leben noch. Breccan zog mit Rogaire und Alpin nach Celtigerns Wacht, um Haus Draig einen neuen Eid anzubieten.',
    emblem: HOUSE_EMBLEMS.dubhan,
    houseProfile: createHouseProfileFromFolderPath(
      ['Faelaorn', 'Tir na Brann', 'Tir na Fuil', 'Caer Dubhan'],
      {
        rankId: 'knight',
        secondarySeats: ['Inis na Ceò'],
        liegeHouseName: 'Clan Mac Dubglais',
        regionEmblems: {
          kingdom: REGION_EMBLEMS.faelaorn,
          county: REGION_EMBLEMS.tirNaBrann
        }
      }
    )
  },
  houses: [
    house(DUBHAN_HOUSE_ID, 'Sept Dubhan', HOUSE_EMBLEMS.dubhan),
    house('house-mac-dubglais', 'Clan Mac Dubglais', HOUSE_EMBLEMS.macDubglais)
  ],
  persons: [
    // Ursprung der Sept: ein namentlich nicht überlieferter Dubglais-Lord zeugte mit einer
    // nordischen Konkubine Zwillingssöhne. Statt sie anzuerkennen, ließ er sie in der
    // Kampfgrube seines Clans gegeneinander antreten; erst das Eingreifen der Fianna
    // erzwang die Anerkennung des Überlebenden.
    person('unbekannter-lord-mac-dubglais', 'Unbekannter Lord der Mac Dubglais', 'male', '????', '????', 'house-mac-dubglais', {
      familyRole: 'affair',
      lineageRole: 'branch',
      notes: 'Vater der Zwillinge Cellach und Fiachra; erkannte sie zunächst nicht als Blut an. Kein Teil der eigentlichen Gründerlinie der Sept Dubhan.'
    }),
    person('unbekannte-konkubine-nord', 'Unbekannte nordische Konkubine', 'female', '????', '????', '', {
      familyRole: 'affair',
      lineageRole: 'branch'
    }),

    // Zwillinge: Cellach fiel in der erzwungenen Kampfgrube, Fiachra überlebte und wurde
    // nach dem Eingreifen der Fianna offiziell als Begründer der Sept Dubhan anerkannt.
    person('cellach-dubhan', 'Cellach', 'male', '????', '????', DUBHAN_HOUSE_ID, {
      familyRole: 'bastard',
      lineageRole: 'branch',
      title: 'Zwillingsbruder',
      notes: 'Fiel in der von seinem Vater erzwungenen Kampfgrube gegen seinen Zwillingsbruder Fiachra; nie offiziell anerkannt, keine Nachkommen.'
    }),
    person('fiachra-dubhan', 'Fiachra Dubhan', 'male', '????', '????', DUBHAN_HOUSE_ID, {
      familyRole: 'core',
      lineageRole: 'head',
      title: 'Erster anerkannter Herr der Sept Dubhan',
      notes: 'Überlebte als Einziger die von seinem Vater erzwungene Kampfgrube gegen seinen Zwillingsbruder Cellach; die Fianna erzwangen anschließend seine offizielle Anerkennung als Sohn der Mac Dubglais. Begründer der Sept Dubhan.'
    }),
    person('doireann-dubhan', 'Doireann', 'female', '????', '????', '', {
      familyRole: 'married',
      notes: 'Gattin Fiachras; Herkunft nicht überliefert.'
    }),

    // Mehrere Jahrhunderte nicht einzeln überlieferter Generationen (siehe timeJumps) trennen
    // die Gründung der Sept von Breccans Großeltern.
    person('cormac-dubhan', 'Cormac Dubhan', 'male', '1635', '1698', DUBHAN_HOUSE_ID, {
      familyRole: 'core',
      lineageRole: 'head',
      title: 'Herr von Caer Dubhan',
      notes: 'Breccans Großvater; natürlichen Todes gestorben, lange vor dem Krieg gegen die Nordmänner.'
    }),
    person('aoife-dubhan', 'Aoife', 'female', '1640', '1701', '', {
      familyRole: 'married',
      notes: 'Breccans Großmutter; Herkunft nicht überliefert.'
    }),

    person('fearghal-dubhan', 'Fearghal Dubhan', 'male', '1665', '1733', DUBHAN_HOUSE_ID, {
      familyRole: 'core',
      lineageRole: 'head',
      title: 'Herr von Caer Dubhan',
      notes: 'Breccans Vater; überlebte den Fall Caer Dubhans, starb 1733 gemeinsam mit seiner Frau Sorcha. Genaue Todesumstände nicht überliefert.'
    }),
    person('sorcha-dubhan', 'Sorcha', 'female', '1668', '1733', '', {
      familyRole: 'married',
      notes: 'Breccans Mutter; starb 1733 gemeinsam mit Fearghal. Genaue Todesumstände nicht überliefert.'
    }),

    // Breccans Generation: seine älteren Brüder Muirchertach und Tadhg, seine ältere Schwester
    // Deirdre, und er selbst. Der Krieg 1718-1721 kostete dem Clan seine Heimat; die meisten
    // Verluste der Familie folgten erst in den Jahren danach. Lebend sind heute nur Breccan,
    // seine Kinder und Ailbhe, eine von Tadhgs unehelichen Töchtern.
    person('muirchertach-dubhan', 'Muirchertach Dubhan', 'male', '1688', '1737', DUBHAN_HOUSE_ID, {
      familyRole: 'core',
      lineageRole: 'branch',
      title: 'Ältester Sohn der Dubhan',
      notes: 'Breccans ältester Bruder; überlebte den Krieg 1718-1721, starb 1737 gemeinsam mit seiner Frau Aingeal. Genaue Todesumstände nicht überliefert.'
    }),
    person('aingeal-dubhan', 'Aingeal', 'female', '1690', '1737', '', {
      familyRole: 'married',
      notes: 'Muirchertachs Frau; starb 1737 gemeinsam mit ihm. Herkunft nicht überliefert.'
    }),
    person('ruarc-dubhan', 'Ruarc Dubhan', 'male', '1711', '1738', DUBHAN_HOUSE_ID, {
      familyRole: 'core',
      lineageRole: 'branch',
      title: 'Sohn Muirchertachs',
      notes: 'Starb 1738. Genaue Todesumstände nicht überliefert.'
    }),
    person('tadhg-dubhan', 'Tadhg Dubhan', 'male', '1690', '1736', DUBHAN_HOUSE_ID, {
      familyRole: 'core',
      lineageRole: 'branch',
      title: 'Sohn der Dubhan',
      notes: 'Breccans Bruder; starb 1736. Ging nie eine Ehe ein, unterhielt aber gleichzeitig zwei Verhältnisse, mit Sceanbh und mit Muirne, aus denen zusammen drei Kinder hervorgingen.'
    }),
    person('sceanbh', 'Sceanbh', 'female', '1693', '', '', {
      familyRole: 'affair',
      notes: 'Tadhgs heimliche Geliebte, Mutter seines Sohnes Onchú; lebt noch.'
    }),
    person('onchu-dubhan', 'Onchú Dubhan', 'male', '1714', '1737', DUBHAN_HOUSE_ID, {
      familyRole: 'bastard',
      lineageRole: 'branch',
      title: 'Unehelicher Sohn Tadhgs',
      notes: 'Starb 1737. Genaue Todesumstände nicht überliefert.'
    }),
    person('muirne', 'Muirne', 'female', '1694', '', '', {
      familyRole: 'affair',
      notes: 'Tadhgs zweite heimliche Geliebte, Mutter von Gormlaith und Ailbhe; lebt noch.'
    }),
    person('gormlaith-dubhan', 'Gormlaith Dubhan', 'female', '1715', '1738', DUBHAN_HOUSE_ID, {
      familyRole: 'bastard',
      lineageRole: 'branch',
      title: 'Uneheliche Tochter Tadhgs',
      notes: 'Starb 1738. Genaue Todesumstände nicht überliefert.'
    }),
    person('ailbhe-dubhan', 'Ailbhe Dubhan', 'female', '1717', '', DUBHAN_HOUSE_ID, {
      familyRole: 'bastard',
      lineageRole: 'branch',
      title: 'Uneheliche Tochter Tadhgs',
      notes: 'Lebt noch, als einzige ihrer Geschwister. Blieb in Faelaorn zurück, reiste nicht mit Breccan nach Celtigerns Wacht. Verbleib offen.'
    }),
    person('deirdre-dubhan', 'Deirdre Dubhan', 'female', '1692', '', DUBHAN_HOUSE_ID, {
      familyRole: 'core',
      lineageRole: 'branch',
      title: 'Wegverheiratet an ein unbekanntes Haus',
      notes: 'Breccans ältere Schwester; heiratete Cathal und verließ die Sept Dubhan für sein - nicht überliefertes - Haus. Lebt noch, ebenso wie Cathal. Keine Kinder.'
    }),
    person('cathal', 'Cathal', 'male', '1688', '', '', {
      familyRole: 'married',
      notes: 'Deirdres Mann; Herkunftshaus nicht überliefert. Lebt noch.'
    }),
    person('breccan-dubhan', 'Breccan Dubhan', 'male', '1695', '', DUBHAN_HOUSE_ID, {
      familyRole: 'core',
      lineageRole: 'head',
      title: 'Krieger der Dubhan, vormals Grenzwächter Faelaorns',
      portrait: 'https://i.imgur.com/Ce392i6.png',
      notes: 'Überlebte den Krieg 1718-1721 und den Untergang Faelaorns; zog mit seinen Kindern Rogaire und Alpin nach Celtigerns Wacht, um Haus Draig seinen Eid anzubieten.'
    }),
    person('eithne-dubhan', 'Eithne Dubhan', 'female', '1691', '1735', '', {
      familyRole: 'married',
      notes: 'Breccans Frau; gestorben 1735 im Alter von 44 Jahren. Todesumstände nicht überliefert, Sterbejahr aus dem angegebenen Alter abgeleitet.'
    }),

    // Breccans Kinder: zwei der wenigen weiteren lebenden Dubhan.
    person('rogaire-dubhan', 'Rogaire Dubhan', 'female', '1715', '', DUBHAN_HOUSE_ID, {
      familyRole: 'core',
      lineageRole: 'mainline',
      title: 'Älteste Tochter',
      portrait: 'https://i.imgur.com/qB71xNE.png',
      notes: 'Reiste mit Breccan und Alpin von Faelaorn nach Celtigerns Wacht.'
    }),
    person('alpin-dubhan', 'Alpin Dubhan', 'male', '1726', '', DUBHAN_HOUSE_ID, {
      familyRole: 'core',
      lineageRole: 'mainline',
      title: 'Sohn',
      portrait: 'https://i.imgur.com/RiquhTC.png',
      notes: 'Reiste mit Breccan und Rogaire von Faelaorn nach Celtigerns Wacht.'
    })
  ],
  partnerships: [
    createMarriage('affair-lord-konkubine', ...LORD_CONCUBINE_IDS, {
      type: 'affair',
      status: 'ended',
      certainty: 'confirmed',
      visibility: 'restricted',
      notes: 'Vom Dubglais-Lord zunächst nicht anerkannte Verbindung; Ursprung der Zwillinge Cellach und Fiachra. Nicht die Gründerlinie der Sept Dubhan.'
    }),
    createMarriage('marriage-fiachra-doireann', ...FIACHRA_DOIREANN_IDS, {
      status: 'ended',
      notes: 'Fiachras Ehe nach seiner erzwungenen Anerkennung als Begründer der Sept Dubhan.'
    }),
    createMarriage('marriage-cormac-aoife', ...CORMAC_AOIFE_IDS, {
      status: 'ended',
      start: '1660',
      end: '1698'
    }),
    createMarriage('marriage-fearghal-sorcha', ...FEARGHAL_SORCHA_IDS, {
      status: 'ended',
      start: '1686',
      end: '1733',
      notes: 'Beide starben 1733 gemeinsam.'
    }),
    createMarriage('marriage-muirchertach-aingeal', ...MUIRCHERTACH_AINGEAL_IDS, {
      status: 'ended',
      start: '1708',
      end: '1737',
      notes: 'Beide starben 1737 gemeinsam.'
    }),
    createMarriage('affair-tadhg-sceanbh', ...TADHG_SCEANBH_IDS, {
      type: 'affair',
      status: 'ended',
      start: '1713',
      end: '1736',
      certainty: 'confirmed',
      visibility: 'restricted',
      notes: 'Erstes heimliches Verhältnis Tadhgs, parallel zur Verbindung mit Muirne; Ursprung Onchús. Endete mit Tadhgs Tod 1736, Sceanbh lebt noch.'
    }),
    createMarriage('affair-tadhg-muirne', ...TADHG_MUIRNE_IDS, {
      type: 'affair',
      status: 'ended',
      start: '1714',
      end: '1736',
      certainty: 'confirmed',
      visibility: 'restricted',
      notes: 'Zweites, gleichzeitiges heimliches Verhältnis Tadhgs; Ursprung von Gormlaith und Ailbhe. Endete mit Tadhgs Tod 1736, Muirne lebt noch.'
    }),
    createMarriage('marriage-deirdre-cathal', ...DEIRDRE_CATHAL_IDS, {
      status: 'active',
      start: '1712',
      notes: 'Deirdre verließ mit dieser Ehe die Sept Dubhan; beide leben noch.'
    }),
    createMarriage('marriage-breccan-eithne', ...BRECCAN_EITHNE_IDS, {
      status: 'ended',
      start: '1713',
      end: '1735'
    })
  ],
  parentages: [
    ...createParentages(['cellach-dubhan'], LORD_CONCUBINE_IDS, 'affair-lord-konkubine', {
      legitimacy: 'illegitimate',
      certainty: 'probable',
      visibility: 'restricted',
      notes: 'Nie offiziell anerkannt.'
    }),
    ...createParentages(['fiachra-dubhan'], LORD_CONCUBINE_IDS, 'affair-lord-konkubine', {
      legitimacy: 'legitimized',
      certainty: 'probable',
      visibility: 'restricted',
      notes: 'Nachträglich durch Eingreifen der Fianna offiziell anerkannt.'
    }),
    ...createParentages(['cormac-dubhan'], FIACHRA_DOIREANN_IDS, 'marriage-fiachra-doireann', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Mehrere Jahrhunderte nicht einzeln überlieferter Generationen liegen zwischen Fiachra und Cormac.',
      extensions: { timeJumpId: 'gap-fiachra-cormac' }
    }),
    ...createParentages(['fearghal-dubhan'], CORMAC_AOIFE_IDS, 'marriage-cormac-aoife'),
    ...createParentages(
      ['muirchertach-dubhan', 'tadhg-dubhan', 'deirdre-dubhan', 'breccan-dubhan'],
      FEARGHAL_SORCHA_IDS,
      'marriage-fearghal-sorcha'
    ),
    ...createParentages(['ruarc-dubhan'], MUIRCHERTACH_AINGEAL_IDS, 'marriage-muirchertach-aingeal'),
    ...createParentages(['onchu-dubhan'], TADHG_SCEANBH_IDS, 'affair-tadhg-sceanbh', {
      legitimacy: 'illegitimate',
      certainty: 'confirmed',
      visibility: 'restricted',
      notes: 'Uneheliches Kind aus Tadhgs Verhältnis mit Sceanbh.'
    }),
    ...createParentages(['gormlaith-dubhan', 'ailbhe-dubhan'], TADHG_MUIRNE_IDS, 'affair-tadhg-muirne', {
      legitimacy: 'illegitimate',
      certainty: 'confirmed',
      visibility: 'restricted',
      notes: 'Uneheliche Kinder aus Tadhgs Verhältnis mit Muirne.'
    }),
    ...createParentages(['rogaire-dubhan', 'alpin-dubhan'], BRECCAN_EITHNE_IDS, 'marriage-breccan-eithne')
  ],
  cadetBranches: [
    createMarriedAwayBranch({
      id: 'married-away-unbekannt-deirdre',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-deirdre-cathal',
      houseId: '',
      targetFamilyId: 'haus-unbekannt',
      emblem: ''
    })
  ],
  timeJumps: [
    {
      id: 'gap-fiachra-cormac',
      parentPartnershipId: 'marriage-fiachra-doireann',
      childIds: ['cormac-dubhan'],
      years: 0,
      fromYear: '????',
      toYear: '1635',
      label: 'Mehrere Jahrhunderte nicht einzeln überlieferter Generationen der jungen Sept Dubhan',
      notes: 'Zwischen der Anerkennung der Sept Dubhan und Cormac, Breccans Großvater, liegen mehrere Jahrhunderte, deren Träger nicht überliefert sind.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-fiachra-doireann',
    houseId: DUBHAN_HOUSE_ID,
    crestSubtitle: 'Sept Dubhan',
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'fiachra-dubhan',
    orientation: 'vertical',
    ancestorDepth: 6,
    descendantDepth: 3,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: { sourceRevision: 1 }
});
