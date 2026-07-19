import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';

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

// Diese acht Grafschaften haben (noch) keine überlieferte Unterteilung in Baronien; ihr
// Grafenhaus sitzt direkt am Grafschaftssitz. Anders als profile() in
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
// bleibt bewusst ausgenommen: laut Vorlage ohne eigene Grafschaft.
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
//            house-wyrm (neala-wylan, Ehefrau)
//   illewod: house-draig (kyvwlch-illewod, selwyn-illewod 1643-1707), house-saethwyr (sayres-illewod 1692-)
//   pendrag: house-draig (vortigern-pendrag = König Vortigern I., Gründer; tanwen-/uther-/
//            arianwyn-/trystan-/parzifal-/griflet-/gwyneira-/cerridwyn-/arianwen-/gawain-/
//            angharad-pendrag, revelyn-penderyn)
//   grawn:   house-draig (alaw-grawn 1676-1720, alaweyn-grawn 1716-), house-gwefrydd
//            (eifion-grawn 1636-1699), house-illysywen (owen-grawn 1675-)
//   neidr:   house-draig (gwyneth-neidr 1588-, gaenor-neidr 1646-1711, guinevere-neidr [Mündel]),
//            house-saethwyr (llywellyn-neidr 1650-1734)
//   pysgod:  house-draig (gingalain-pysgod, llinos-pysgod 1619-1653)
//   arth:    house-draig (caradoc-arth, madoc-arth 1643-1722, esyllt-arth 1696- [Affäre]),
//            house-gwyvern (afal-arth 1675-), house-saethwyr (melyn-arth 1684-1735)
//   aderyn:  house-draig (rhiannon-aderyn = Vortigerns Königin, tiwlip-aderyn 1117-1194,
//            gwendolyn-aderyn 1695- [„Gräfin von Celtigerns Wacht"!]), house-gafyr
//            (carnedyr-aderyn 1647-1720, grufydd-aderyn 1670-), house-gwyvern (jeannae-aderyn 1702-)
export const CENYR_COUNTY_HOUSE_PROFILES = Object.freeze({
  wylan: countyProfile('county', 'Weidebucht', 'Cerrigarth'),
  illewod: countyProfile('county', 'Sonnenküste', 'Aberon'),
  pendrag: countyProfile('royal', 'Vortigerns Ruh', 'Mathragon'),
  grawn: countyProfile('county', 'Ährental', 'Glyndraith'),
  neidr: countyProfile('county', 'Silberinsel', 'Llanvane'),
  pysgod: countyProfile('county', 'Graue Weite', 'Tredegar'),
  arth: countyProfile('county', 'Klaueninsel', 'Talgarth'),
  aderyn: countyProfile('county', 'Tal der Milane', 'Penbryn')
});
