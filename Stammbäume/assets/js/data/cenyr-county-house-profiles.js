import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import { AEHRENTAL_HOUSE_PROFILES } from './aehrental-house-profiles.js';
import { GRAUE_WEITE_HOUSE_PROFILES } from './graue-weite-house-profiles.js';
import { KLAUENINSEL_HOUSE_PROFILES } from './klaueninseln-house-profiles.js';
import { SONNENKUESTE_HOUSE_PROFILES } from './sonnenkueste-house-profiles.js';
import { SILBERINSEL_HOUSE_PROFILES } from './silberinsel-house-profiles.js';
import { TAL_DER_MILANE_HOUSE_PROFILES } from './tal-der-milane-house-profiles.js';
import { VORTIGERNS_RUH_HOUSE_PROFILES } from './vortigerns-ruh-house-profiles.js';
import { WEIDEBUCHT_HOUSE_PROFILES } from './weidebucht-house-profiles.js';

export const CENYR_REGION_EMBLEMS = Object.freeze({
  kingdom: 'assets/images/regions/koenigreich-cenyr.png',
  counties: Object.freeze({
    Weidebucht: 'assets/images/regions/weidebucht.png',
    Sonnenküste: 'assets/images/regions/sonnenkueste.png',
    'Vortigerns Ruh': 'assets/images/regions/vortigerns-ruh.png',
    Ährental: 'assets/images/regions/aehrental.png',
    Silberinsel: 'assets/images/regions/silberinsel.png',
    'Graue Weite': 'assets/images/regions/graue-weite.png',
    Klaueninsel: 'assets/images/regions/klaueninsel.png',
    'Tal der Milane': 'assets/images/regions/tal-der-milane.png'
  })
});

// Drei dieser acht Grafschaften haben (noch) keine überlieferte Unterteilung in
// Baronien; ihr Grafenhaus sitzt direkt am Grafschaftssitz. Vortigerns Ruh,
// Weidebucht, Sonnenküste, Ährental, Silberinsel, Graue Weite und Tal der Milane werden
// inzwischen in eigenen Feature-Modulen mit ihren Herrschaften geführt. Anders als profile() in
// celtigerns-wacht-house-profiles.js (immer 4-stufiger Kingdom/County/Barony/Seat-Pfad)
// wird hier bewusst KEIN Platzhalter-Baronie-Name erfunden: createHouseProfileFromFolderPath
// erlaubt seat als direktes Override statt über einen 4. Pfad-Index, wodurch die
// Orts-Hierarchie sauber dreistufig bleibt (Cenyr > Grafschaft > Sitz).
function countyProfile(rankId, county, seat, options = {}) {
  return createHouseProfileFromFolderPath(['Cenyr', county], {
    rankId,
    seat,
    liegeHouseId: options.liegeHouseId || '',
    liegeHouseName: options.liegeHouseName || '',
    regionEmblems: {
      kingdom: CENYR_REGION_EMBLEMS.kingdom,
      county: CENYR_REGION_EMBLEMS.counties[county] || '',
      barony: '',
      seat: options.seatEmblem || ''
    }
  });
}

// Grafenhäuser der acht übrigen großen Grafschaften Cenyrs (Celtigerns Wacht/Haus Draig
// ist bereits in celtigerns-wacht-house-profiles.js ausgearbeitet). Blodyn O'Llyndor
// bleibt hier bewusst ausgenommen: Königshaus und Aberdail-Nebenzweig besitzen ihre
// eigenen, vierstufigen Profile in blodyn-house-profiles.js.
//
// WICHTIG: Für JEDES dieser acht Häuser existieren bereits verstreute Personen-Stubs in
// anderen Hausakten (Ehepartner, die dort hineingeheiratet haben) — vor dem Anlegen der
// jeweiligen eigenen Stammbaum-Datei IMMER zuerst hausübergreifend grep'en, siehe
// Fund-Übersicht unten. Das gilt insbesondere für Pendrag: Vortigern (Sohn Celtigerns,
// house-draig-family.js) begründet dort mit Rhiannon Aderyn bereits die Pendrag-Linie
// (cadetBranch 'cadet-pendrag-vortigern') — Vortigern Pendrag war laut Königreich-Cenyr-
// Vorlage der ERSTE KÖNIG von Cenyr, sein Nachfahre König Tristan Pendrag regiert heute
// aus Mathragon. Pendrag ist daher rankId 'royal', nicht 'county'.
//
// Bereits bekannte Cross-Tree-Stubs je Haus (Fundstellen, Stand Juli 2026):
//   wylan:   house-draig (hewet-wylan 1670-1720), house-gwefrydd (wrnach-wylan 1577-1653),
//            house-illewod (rhun-/selsye-wylan), house-neidr (rheidwn-/morgana-wylan),
//            house-pendrag (vorath-wylan), house-pysgod (bedivere-/braith-wylan),
//            house-aderyn (sianwen-wylan), house-grawn (iolyn-wylan), house-wyrm (neala-wylan)
//   illewod: house-draig (kyvwlch-illewod, selwyn-illewod 1643-1707), house-saethwyr (sayres-illewod 1692-)
//   pendrag: house-draig (vortigern-pendrag = König Vortigern I., Gründer; tanwen-/uther-/
//            arianwyn-/trystan-/parzifal-/griflet-/gwyneira-/cerridwyn-/arianwen-/gawain-/
//            angharad-pendrag, revelyn-penderyn)
//   grawn:   house-draig (alaw-grawn 1676-1720, alaweyn-grawn 1716-), house-gwefrydd
//            (eifion-grawn 1636-1699), house-illysywen (owen-grawn 1675-)
//   neidr:   house-draig (gwyneth-neidr 1588-, gaenor-neidr 1646-1711, guinevere-neidr [Mündel]),
//            house-illewod (gwyron-neidr, griff-neidr 1625-1699), house-pendrag
//            (howell-neidr 1623-1701, lancelot-neidr 1730- [Mündel]),
//            house-saethwyr (llywellyn-neidr 1650-1734)
//   pysgod:  house-draig (gingalain-pysgod, llinos-pysgod 1619-1653), house-pendrag
//            (gingalain-1572-pysgod 1571-1639, genyth-pysgod 1673-), house-neidr
//            (morholt-pysgod, Gründer des Hauses Tiwna), house-illewod (lynfa-pysgod
//            1623-1679, cynfor-pysgod 1698-), house-aderyn (hefin-pysgod 1630-1702)
//   arth:    house-draig (caradoc-arth, madoc-arth 1643-1722, esyllt-arth 1696- [Affäre]),
//            house-gwyvern (afal-arth 1675-), house-saethwyr (melyn-arth 1684-1735)
//   aderyn:  house-draig (rhiannon-aderyn = Vortigerns Königin, tiwlip-aderyn 1117-1194,
//            gwendolyn-aderyn 1695- [„Gräfin von Celtigerns Wacht"!]), house-gafyr
//            (carnedyr-aderyn 1647-1720, grufydd-aderyn 1670-), house-grawn
//            (aranrhod-aderyn, rhosyn-aderyn 1626-1659), house-gwyvern (jeannae-aderyn 1702-),
//            house-illewod (trevelyan-aderyn 1250-1285, catel-aderyn 1661-1720), house-neidr
//            (carwyn-aderyn 1675-, gwendolyn-aderyn 1695-), house-pendrag
//            (rhiannon-aderyn, dungarth-aderyn 1643-1705)
export const CENYR_COUNTY_HOUSE_PROFILES = Object.freeze({
  wylan: WEIDEBUCHT_HOUSE_PROFILES.wylan,
  illewod: SONNENKUESTE_HOUSE_PROFILES.illewod,
  pendrag: VORTIGERNS_RUH_HOUSE_PROFILES.pendrag,
  grawn: AEHRENTAL_HOUSE_PROFILES.grawn,
  neidr: SILBERINSEL_HOUSE_PROFILES.neidr,
  pysgod: GRAUE_WEITE_HOUSE_PROFILES.pysgod,
  arth: KLAUENINSEL_HOUSE_PROFILES.arth,
  aderyn: TAL_DER_MILANE_HOUSE_PROFILES.aderyn
});
