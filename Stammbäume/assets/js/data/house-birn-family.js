import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { withAislearneachSourceCounterUpgrade } from './aislearneach-source-counter-upgrade.js';
import { createDunfalSourceFamily } from './dunfal-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "deaglan-founder-birn",
    "saoirse-unknown-birn-88-0",
    "luibheas-1600-birn",
    "saoirse-birn",
    "peadarog-1607-birn",
    "mebh-1605-ui-faill-duibhne",
    "gruffydd-dienyddiwr",
    "kavan-1611-riangabra",
    "wiochan-1624-birn",
    "kaivin-birn",
    "tuiren-1630-birn",
    "ylorcan-birn",
    "rabhla-1627-cein",
    "bearnard-iomrach",
    "colm-1626-duilb",
    "sinead-1634-holloran",
    "sadhbh-1645-birn",
    "zorman-1648-birn",
    "zeargan-1652-birn",
    "fionnuala-1654-birn",
    "muirgheas-1642-morath",
    "eibhlin-1652-ailella",
    "jenefer-unknown-birn-120-2",
    "gwyndolyn-unknown-birn-124-0",
    "doireann-1653-suilgeach",
    "barra-1650-anbhair",
    "tarlachan-1670-birn",
    "enda-1679-birn",
    "oran-1684-birn",
    "xina-1685-birn",
    "banan-1689-birn",
    "uibhist-1675-birn",
    "oona-1676-casur",
    "muireann-1679-tartarfhuil",
    "deaglan-1696-birn",
    "wiochan-1701-birn",
    "beathag-1703-birn",
    "iagan-1709-birn",
    "xioran-1698-birn",
    "saoirse-1701-birn",
    "yvanna-1704-birn",
    "ciorstaidh-1700-luachra",
    "shurkan-1700-chulainn",
    "tuarenn-1703-ailella",
    "eadbhard-1699-cein",
    "polan-1719-birn",
    "paislie-1724-birn",
    "ylorcan-1723-birn",
    "hara-1727-birn"
  ],
  "partnershipIds": [
    "marriage-deaglan-founder-birn--saoirse-unknown-birn-88-0",
    "marriage-luibheas-1600-birn--mebh-1605-ui-faill-duibhne",
    "marriage-gruffydd-saoirse-dienyddiwr",
    "marriage-kavan-1611-riangabra--peadarog-1607-birn",
    "marriage-rabhla-1627-cein--wiochan-1624-birn",
    "marriage-bearnard-kaivin",
    "marriage-colm-1626-duilb--tuiren-1630-birn",
    "marriage-sinead-1634-holloran--ylorcan-birn",
    "marriage-muirgheas-1642-morath--sadhbh-1645-birn",
    "marriage-eibhlin-1652-ailella--zorman-1648-birn",
    "affair-jenefer-unknown-birn-120-2--zorman-1648-birn",
    "affair-gwyndolyn-unknown-birn-124-0--zeargan-1652-birn",
    "marriage-doireann-1653-suilgeach--zeargan-1652-birn",
    "marriage-barra-1650-anbhair--fionnuala-1654-birn",
    "marriage-oona-1676-casur--tarlachan-1670-birn",
    "marriage-oran-1684-birn--xina-1685-birn",
    "marriage-muireann-1679-tartarfhuil--uibhist-1675-birn",
    "marriage-ciorstaidh-1700-luachra--deaglan-1696-birn",
    "marriage-beathag-1703-birn--shurkan-1700-chulainn",
    "marriage-tuarenn-1703-ailella--xioran-1698-birn",
    "marriage-eadbhard-1699-cein--yvanna-1704-birn"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-deaglan-founder-birn--saoirse-unknown-birn-88-0",
      "childIds": [
        "luibheas-1600-birn",
        "saoirse-birn",
        "peadarog-1607-birn"
      ],
      "timeJumpId": "gap-dunfal-birn-founders"
    },
    {
      "partnershipId": "marriage-luibheas-1600-birn--mebh-1605-ui-faill-duibhne",
      "childIds": [
        "wiochan-1624-birn",
        "kaivin-birn"
      ]
    },
    {
      "partnershipId": "marriage-kavan-1611-riangabra--peadarog-1607-birn",
      "childIds": [
        "tuiren-1630-birn",
        "ylorcan-birn"
      ]
    },
    {
      "partnershipId": "marriage-rabhla-1627-cein--wiochan-1624-birn",
      "childIds": [
        "sadhbh-1645-birn",
        "zorman-1648-birn"
      ]
    },
    {
      "partnershipId": "marriage-sinead-1634-holloran--ylorcan-birn",
      "childIds": [
        "zeargan-1652-birn",
        "fionnuala-1654-birn"
      ]
    },
    {
      "partnershipId": "marriage-eibhlin-1652-ailella--zorman-1648-birn",
      "childIds": [
        "tarlachan-1670-birn"
      ]
    },
    {
      "partnershipId": "affair-jenefer-unknown-birn-120-2--zorman-1648-birn",
      "childIds": [
        "enda-1679-birn",
        "oran-1684-birn"
      ],
      "legitimacy": "illegitimate"
    },
    {
      "partnershipId": "affair-gwyndolyn-unknown-birn-124-0--zeargan-1652-birn",
      "childIds": [
        "xina-1685-birn",
        "banan-1689-birn"
      ],
      "legitimacy": "illegitimate"
    },
    {
      "partnershipId": "marriage-doireann-1653-suilgeach--zeargan-1652-birn",
      "childIds": [
        "uibhist-1675-birn"
      ]
    },
    {
      "partnershipId": "marriage-oona-1676-casur--tarlachan-1670-birn",
      "childIds": [
        "deaglan-1696-birn",
        "wiochan-1701-birn",
        "beathag-1703-birn"
      ]
    },
    {
      "partnershipId": "marriage-oran-1684-birn--xina-1685-birn",
      "childIds": [
        "iagan-1709-birn"
      ]
    },
    {
      "partnershipId": "marriage-muireann-1679-tartarfhuil--uibhist-1675-birn",
      "childIds": [
        "xioran-1698-birn",
        "saoirse-1701-birn",
        "yvanna-1704-birn"
      ]
    },
    {
      "partnershipId": "marriage-ciorstaidh-1700-luachra--deaglan-1696-birn",
      "childIds": [
        "polan-1719-birn",
        "paislie-1724-birn"
      ]
    },
    {
      "partnershipId": "marriage-tuarenn-1703-ailella--xioran-1698-birn",
      "childIds": [
        "ylorcan-1723-birn",
        "hara-1727-birn"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-gruffydd-saoirse-dienyddiwr",
      "targetFamilyId": "haus-dienyddiwr",
      "houseId": "house-dienyddiwr"
    },
    {
      "partnershipId": "marriage-bearnard-kaivin",
      "targetFamilyId": "haus-iomrach",
      "houseId": "house-iomrach"
    },
    {
      "partnershipId": "marriage-colm-1626-duilb--tuiren-1630-birn",
      "targetFamilyId": "haus-duilb",
      "houseId": "house-duilb"
    },
    {
      "partnershipId": "marriage-muirgheas-1642-morath--sadhbh-1645-birn",
      "targetFamilyId": "haus-morath",
      "houseId": "house-morath"
    },
    {
      "partnershipId": "marriage-barra-1650-anbhair--fionnuala-1654-birn",
      "targetFamilyId": "haus-anbhair",
      "houseId": "house-anbhair"
    },
    {
      "partnershipId": "marriage-beathag-1703-birn--shurkan-1700-chulainn",
      "targetFamilyId": "haus-chulainn",
      "houseId": "house-chulainn"
    },
    {
      "partnershipId": "marriage-eadbhard-1699-cein--yvanna-1704-birn",
      "targetFamilyId": "haus-cein",
      "houseId": "house-cein"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [],
  "heads": [
    "deaglan-founder-birn",
    "luibheas-1600-birn",
    "wiochan-1624-birn",
    "zorman-1648-birn",
    "tarlachan-1670-birn"
  ],
  "titles": {
    "deaglan-founder-birn": "Historisches Oberhaupt",
    "luibheas-1600-birn": "Historisches Oberhaupt",
    "wiochan-1624-birn": "Historisches Oberhaupt",
    "zorman-1648-birn": "Historisches Oberhaupt",
    "tarlachan-1670-birn": "Laird seit 1728",
    "deaglan-1696-birn": "Erbfolge: 1",
    "polan-1719-birn": "Erbfolge: 2"
  },
  "personRoles": {
    "enda-1679-birn": "bastard",
    "oran-1684-birn": "bastard",
    "jenefer-unknown-birn-120-2": "affair",
    "xina-1685-birn": "bastard",
    "banan-1689-birn": "bastard",
    "gwyndolyn-unknown-birn-124-0": "affair"
  },
  "personExtensions": {
    "oran-1684-birn": {
      "chartRepeatForPartnershipIds": [
        "marriage-oran-1684-birn--xina-1685-birn"
      ]
    },
    "xina-1685-birn": {
      "chartPartnerMirrorForPartnershipIds": [
        "marriage-oran-1684-birn--xina-1685-birn"
      ]
    }
  },
  "sourceNote": "Eine serielle Überlieferungslücke. Die beanspruchte königliche Herkunft ist nicht genealogisch gesichert und erzeugt keine erfundenen Eltern. Kavan Riangabra wird nach ihrer Herkunftsakte mit Geburt 1611 geführt; 1632 in Birn wäre jünger als ihr Kind Tuiren (1630). Die Binnenheirat Oran–Xina erhält nur eine fachliche Partnerschaft. Der Nutzer bestätigt Oran–Xina; Banans abweichende Partnerüberschrift ist ein Vorlagenfehler.",
  "currentHeadId": "tarlachan-1670-birn",
  "heirIds": [
    "deaglan-1696-birn",
    "polan-1719-birn"
  ],
  "description": "Dál’Birn ist ein Laird-Clan mit Sitz in Dunfal. Der Clan beruft sich auf Déaglán und beansprucht eine Verbindung zum alten albischen Königshaus. Diese Abstammung ist nicht gesichert: Verlorene Kriegszeugnisse und unterschiedliche Deutungen des Namens lassen offen, ob ein königlicher Kadett oder die alten Königswachen am Ursprung stehen. Der reine Blutstropfen im Wappen verweist auf diesen Herkunftsanspruch. Seit 1728 steht Tarlachán dem Clan vor."
});

export const HOUSE_BIRN_FAMILY = withAlbenSourcePortraitUpgrade(withAislearneachSourceCounterUpgrade(createDunfalSourceFamily("birn", SOURCE)));
