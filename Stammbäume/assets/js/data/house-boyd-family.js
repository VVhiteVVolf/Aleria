import { createFaernaSourceFamily } from './faerna-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "ytaran-founder-boyd",
    "uachall-unknown-boyd-91-0",
    "dubhan-boyd",
    "grainneog-1584-boyd",
    "olwyna-drewi",
    "tiernan-1582-grannd",
    "ytaran-1590-boyd",
    "muireann-1592-boyd",
    "padraig-1596-boyd",
    "caelira-1592-farraigeach",
    "eoghan-1590-culloch",
    "glaisne-1600-suilgeach",
    "diarmuid-1610-boyd",
    "quaira-boyd",
    "joriath-1620-boyd",
    "doirind-1608-borthwick",
    "omhar-1613-mochoe",
    "deirdre-1623-cairbre",
    "trianach-1631-boyd",
    "heilbhic-1635-boyd",
    "vardon-1642-boyd",
    "loinneog-1648-boyd",
    "oirigh-1634-muirgheal",
    "donncadh-1634-buadhtreun",
    "peigi-1645-cadhla",
    "naomhan-1646-erskine",
    "ardan-1653-boyd",
    "essylt-boyd",
    "peadar-1664-boyd",
    "peadhra-1669-boyd",
    "brighde-1655-grannd",
    "taranis-trachwyll",
    "siofra-1666-lasgair",
    "gearoid-1668-borthwick",
    "dubhan-1674-boyd",
    "yilleach-1678-boyd",
    "joriath-1684-boyd",
    "dairine-1684-boyd",
    "reathnaigh-1675-durachd",
    "judan-1674-erskine",
    "grainneog-1686-muirgheal",
    "veaghan-1678-dundas",
    "trianach-1696-boyd",
    "boudica-boyd",
    "padraig-1705-boyd",
    "uachall-1704-boyd",
    "diarmuid-1710-boyd",
    "isbeil-1696-reannachain",
    "iuliana-unknown-boyd-163-1",
    "lornir-wellenschild",
    "naodhan-1699-buadhtreun",
    "ytaran-1715-boyd",
    "bardan-1719-boyd"
  ],
  "partnershipIds": [
    "marriage-uachall-unknown-boyd-91-0--ytaran-founder-boyd",
    "marriage-dubhan-boyd--olwyna-drewi",
    "marriage-grainneog-1584-boyd--tiernan-1582-grannd",
    "marriage-caelira-1592-farraigeach--ytaran-1590-boyd",
    "marriage-eoghan-1590-culloch--muireann-1592-boyd",
    "marriage-glaisne-1600-suilgeach--padraig-1596-boyd",
    "marriage-diarmuid-1610-boyd--doirind-1608-borthwick",
    "marriage-omhar-1613-mochoe--quaira-boyd",
    "marriage-deirdre-1623-cairbre--joriath-1620-boyd",
    "marriage-oirigh-1634-muirgheal--trianach-1631-boyd",
    "marriage-donncadh-1634-buadhtreun--heilbhic-1635-boyd",
    "marriage-peigi-1645-cadhla--vardon-1642-boyd",
    "marriage-loinneog-1648-boyd--naomhan-1646-erskine",
    "marriage-ardan-1653-boyd--brighde-1655-grannd",
    "marriage-taranis-essylt-trachwyll",
    "marriage-peadar-1664-boyd--siofra-1666-lasgair",
    "marriage-gearoid-1668-borthwick--peadhra-1669-boyd",
    "marriage-dubhan-1674-boyd--reathnaigh-1675-durachd",
    "marriage-judan-1674-erskine--yilleach-1678-boyd",
    "marriage-grainneog-1686-muirgheal--joriath-1684-boyd",
    "marriage-dairine-1684-boyd--veaghan-1678-dundas",
    "marriage-isbeil-1696-reannachain--trianach-1696-boyd",
    "affair-iuliana-unknown-boyd-163-1--trianach-1696-boyd",
    "marriage-lornir-boudica-wellenschild",
    "marriage-naodhan-1699-buadhtreun--uachall-1704-boyd"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-uachall-unknown-boyd-91-0--ytaran-founder-boyd",
      "childIds": [
        "dubhan-boyd",
        "grainneog-1584-boyd"
      ],
      "timeJumpId": "gap-faerna-boyd-founders"
    },
    {
      "partnershipId": "marriage-dubhan-boyd--olwyna-drewi",
      "childIds": [
        "ytaran-1590-boyd",
        "muireann-1592-boyd",
        "padraig-1596-boyd"
      ]
    },
    {
      "partnershipId": "marriage-caelira-1592-farraigeach--ytaran-1590-boyd",
      "childIds": [
        "diarmuid-1610-boyd",
        "quaira-boyd"
      ]
    },
    {
      "partnershipId": "marriage-glaisne-1600-suilgeach--padraig-1596-boyd",
      "childIds": [
        "joriath-1620-boyd"
      ]
    },
    {
      "partnershipId": "marriage-diarmuid-1610-boyd--doirind-1608-borthwick",
      "childIds": [
        "trianach-1631-boyd",
        "heilbhic-1635-boyd"
      ]
    },
    {
      "partnershipId": "marriage-deirdre-1623-cairbre--joriath-1620-boyd",
      "childIds": [
        "vardon-1642-boyd",
        "loinneog-1648-boyd"
      ]
    },
    {
      "partnershipId": "marriage-oirigh-1634-muirgheal--trianach-1631-boyd",
      "childIds": [
        "ardan-1653-boyd",
        "essylt-boyd"
      ]
    },
    {
      "partnershipId": "marriage-peigi-1645-cadhla--vardon-1642-boyd",
      "childIds": [
        "peadar-1664-boyd",
        "peadhra-1669-boyd"
      ]
    },
    {
      "partnershipId": "marriage-ardan-1653-boyd--brighde-1655-grannd",
      "childIds": [
        "dubhan-1674-boyd",
        "yilleach-1678-boyd"
      ]
    },
    {
      "partnershipId": "marriage-peadar-1664-boyd--siofra-1666-lasgair",
      "childIds": [
        "joriath-1684-boyd",
        "dairine-1684-boyd"
      ]
    },
    {
      "partnershipId": "marriage-dubhan-1674-boyd--reathnaigh-1675-durachd",
      "childIds": [
        "trianach-1696-boyd",
        "boudica-boyd",
        "padraig-1705-boyd"
      ]
    },
    {
      "partnershipId": "marriage-grainneog-1686-muirgheal--joriath-1684-boyd",
      "childIds": [
        "uachall-1704-boyd",
        "diarmuid-1710-boyd"
      ]
    },
    {
      "partnershipId": "marriage-isbeil-1696-reannachain--trianach-1696-boyd",
      "childIds": [
        "ytaran-1715-boyd"
      ]
    },
    {
      "partnershipId": "affair-iuliana-unknown-boyd-163-1--trianach-1696-boyd",
      "childIds": [
        "bardan-1719-boyd"
      ],
      "legitimacy": "illegitimate"
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-grainneog-1584-boyd--tiernan-1582-grannd",
      "targetFamilyId": "haus-grannd",
      "houseId": "house-grannd"
    },
    {
      "partnershipId": "marriage-eoghan-1590-culloch--muireann-1592-boyd",
      "targetFamilyId": "haus-culloch",
      "houseId": "house-culloch"
    },
    {
      "partnershipId": "marriage-omhar-1613-mochoe--quaira-boyd",
      "targetFamilyId": "haus-an-morchoe",
      "houseId": "house-an-morchoe"
    },
    {
      "partnershipId": "marriage-donncadh-1634-buadhtreun--heilbhic-1635-boyd",
      "targetFamilyId": "haus-buadhtreun",
      "houseId": "house-buadhtreun"
    },
    {
      "partnershipId": "marriage-loinneog-1648-boyd--naomhan-1646-erskine",
      "targetFamilyId": "haus-erskine",
      "houseId": "house-erskine"
    },
    {
      "partnershipId": "marriage-taranis-essylt-trachwyll",
      "targetFamilyId": "haus-trachwyll-talfronwyn",
      "houseId": "house-trachwyll-talfronwyn"
    },
    {
      "partnershipId": "marriage-gearoid-1668-borthwick--peadhra-1669-boyd",
      "targetFamilyId": "haus-borthwick",
      "houseId": "house-borthwick"
    },
    {
      "partnershipId": "marriage-judan-1674-erskine--yilleach-1678-boyd",
      "targetFamilyId": "haus-erskine",
      "houseId": "house-erskine"
    },
    {
      "partnershipId": "marriage-dairine-1684-boyd--veaghan-1678-dundas",
      "targetFamilyId": "haus-dundas",
      "houseId": "house-dundas"
    },
    {
      "partnershipId": "marriage-lornir-boudica-wellenschild",
      "targetFamilyId": "haus-wellenschild",
      "houseId": "house-wellenschild"
    },
    {
      "partnershipId": "marriage-naodhan-1699-buadhtreun--uachall-1704-boyd",
      "targetFamilyId": "haus-buadhtreun",
      "houseId": "house-buadhtreun"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [],
  "heads": [
    "ytaran-founder-boyd",
    "dubhan-boyd",
    "ytaran-1590-boyd",
    "diarmuid-1610-boyd",
    "trianach-1631-boyd",
    "ardan-1653-boyd"
  ],
  "titles": {
    "ytaran-founder-boyd": "Historisches Oberhaupt",
    "dubhan-boyd": "Historisches Oberhaupt",
    "ytaran-1590-boyd": "Historisches Oberhaupt",
    "diarmuid-1610-boyd": "Historisches Oberhaupt",
    "trianach-1631-boyd": "Historisches Oberhaupt",
    "ardan-1653-boyd": "Letzter belegter Laird · 1710–1720"
  },
  "personRoles": {
    "bardan-1719-boyd": "bastard",
    "iuliana-unknown-boyd-163-1": "affair"
  },
  "personExtensions": {
    "trianach-1696-boyd": {
      "chartCenterBetweenPartnerPersonIds": [
        "isbeil-1696-reannachain",
        "iuliana-unknown-boyd-163-1"
      ],
      "chartPartnerGroupPersonOrder": [
        "isbeil-1696-reannachain",
        "trianach-1696-boyd",
        "iuliana-unknown-boyd-163-1"
      ],
      "chartKeepPartnerGroupTogether": true
    }
  },
  "sourceNote": "Eine serielle Überlieferungslücke. Trianachs Ehe mit Isbeil und seine Affäre mit Iúliana sind getrennt; Bardan ist das Kind der Affäre. Diarmuid (*1710) überlebte die Zerstörung und wurde Pirat. Historische Lehensfolge: Boyd → Muirgheal → Buadhtreun.",
  "currentHeadId": "",
  "heirIds": [],
  "description": "Na Boyd von Ealach ist ein kleiner Insel- und Küstenclan in Tir na Faerna. Sein Name geht auf die alte Sept Buidhe zurück; die Genealogie beginnt mit Ytarán und Uachall. Das Haus dient den Muirgheal und über sie den Ard Buadhtreun. „Still im Dienst, tapfer im Sturm“ steht für Loyalität, Verwaltungsgeschick und verlässlichen Küstenschutz. Seine Airig kämpfen mit schmalen Speeren; Schuppenpanzer und Flossenkämme greifen den Schwertfisch des Wappens auf. Das älteste Kind erbt. Ardan, der letzte belegte Laird, starb 1720 während der Zerstörung des Clans. Angehörige überlebten in anderen Häusern; Diarmuid floh als Kind und wurde Pirat. Die historische Lehensordnung bleibt trotz Krieg und Teilbesetzung bestehen.",
  "partnershipExtensions": {
    "marriage-isbeil-1696-reannachain--trianach-1696-boyd": {
      "chartAlignPartnerOverChildrenPersonId": "isbeil-1696-reannachain",
      "chartReserveLeafChildLane": true,
      "chartArrangeLeafChildrenEvenly": true
    },
    "affair-iuliana-unknown-boyd-163-1--trianach-1696-boyd": {
      "chartAlignPartnerOverChildrenPersonId": "iuliana-unknown-boyd-163-1",
      "chartReserveLeafChildLane": true,
      "chartArrangeLeafChildrenEvenly": true
    },
    "marriage-dubhan-1674-boyd--reathnaigh-1675-durachd": {
      "chartAlignParentPairOverChildPersonId": "trianach-1696-boyd",
      "chartPackLeafSiblingBranchesBesideAlignedChild": true
    }
  }
});

export const HOUSE_BOYD_FAMILY = createFaernaSourceFamily("boyd", SOURCE);
