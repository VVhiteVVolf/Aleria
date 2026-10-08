import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { createBlaithneachSourceFamily } from './blaithneach-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "donnagh-founder-haeghra",
    "eithne-unknown-haeghra-91-0",
    "muiredach-founder-haeghra",
    "caoimhe-haeghra",
    "blathnat-founder-durchadh",
    "islwyn-penderyn",
    "mona-1612-haeghra",
    "seamus-1607-haeghra",
    "rioghbhar-1610-nessa",
    "fionaach-1607-durchadh",
    "deaglan-haeghra",
    "oighrig-haeghra",
    "muiredach-1632-haeghra",
    "caireann-1626-leite",
    "fuirseach-gortach",
    "tailltein-unknown-haeghra-125-2",
    "seamus-haeghra",
    "ideas-1657-haeghra",
    "eithne-1650-haeghra",
    "uibhist-1650-haeghra",
    "maeve-schwarzdorn",
    "diarmadas-1654-suiste",
    "uruisg-1650-goidin",
    "yvanna-1650-duach",
    "donnagh-heaghra",
    "dubessa-1672-haeghra",
    "eachdonn-1673-haeghra",
    "feargal-1675-haeghra",
    "braoin-1678-haeghra",
    "dairein-1680-haeghra",
    "marwine-teyrngarch",
    "maelrubha-1667-magach",
    "hoireabard-1680-cein",
    "gordan-1676-gairner",
    "gyda-unknown-haeghra-149-4",
    "deaglan-1695-haeghra",
    "liusaidh-1705-haeghra",
    "muiredach-1700-haeghra",
    "mona-haeghra",
    "cuthbert-1701-haeghra",
    "eamhair-1703-haeghra",
    "wihalgh-1700-scathain",
    "jarlaith-1700-roth",
    "goirtin-1703-ronain",
    "caitriona-1703-fintain",
    "aoghan-gortach",
    "uibhla-unknown-haeghra-167-0",
    "hesta-unknown-haeghra-167-1",
    "aodhin-1698-nessa",
    "eithne-haeghra",
    "ideas-1724-tiran-treathai",
    "seamus-1726-haeghra",
    "uibhist-1723-haeghra",
    "puirseil-1729-haeghra",
    "oighrig-1722-haeghra",
    "vearan-1726-haeghra",
    "lucasan-1733-haeghra",
    "sverre-goldglanz",
    "sionna-1729-luga"
  ],
  "partnershipIds": [
    "marriage-donnagh-founder-haeghra--eithne-unknown-haeghra-91-0",
    "marriage-blathnat-founder-durchadh--muiredach-founder-haeghra",
    "marriage-islwyn-caoimhe-penderyn",
    "marriage-mona-1612-haeghra--rioghbhar-1610-nessa",
    "marriage-fionaach-1607-durchadh--seamus-1607-haeghra",
    "marriage-caireann-1626-leite--deaglan-haeghra",
    "marriage-fuirseach-oighrig-gortach",
    "marriage-muiredach-1632-haeghra--tailltein-unknown-haeghra-125-2",
    "marriage-seamus-maeve-schwarzdorn",
    "marriage-diarmadas-1654-suiste--ideas-1657-haeghra",
    "marriage-eithne-1650-haeghra--uruisg-1650-goidin",
    "marriage-uibhist-1650-haeghra--yvanna-1650-duach",
    "marriage-marwine-donnagh-teyrngarch",
    "marriage-dubessa-1672-haeghra--maelrubha-1667-magach",
    "marriage-feargal-1675-haeghra--hoireabard-1680-cein",
    "marriage-braoin-1678-haeghra--gordan-1676-gairner",
    "marriage-dairein-1680-haeghra--gyda-unknown-haeghra-149-4",
    "marriage-deaglan-1695-haeghra--wihalgh-1700-scathain",
    "engagement-jarlaith-1700-roth--liusaidh-1705-haeghra",
    "marriage-goirtin-1703-ronain--liusaidh-1705-haeghra",
    "marriage-caitriona-1703-fintain--muiredach-1700-haeghra",
    "marriage-aoghan-mona-gortach",
    "marriage-cuthbert-1701-haeghra--uibhla-unknown-haeghra-167-0",
    "affair-cuthbert-1701-haeghra--hesta-unknown-haeghra-167-1",
    "marriage-aodhin-1698-nessa--eamhair-1703-haeghra",
    "marriage-sverre-eithne-goldglanz",
    "engagement-seamus-1726-haeghra--sionna-1729-luga"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-donnagh-founder-haeghra--eithne-unknown-haeghra-91-0",
      "childIds": [
        "muiredach-founder-haeghra",
        "caoimhe-haeghra"
      ],
      "timeJumpId": "gap-blaithneach-haeghra-founders"
    },
    {
      "partnershipId": "marriage-blathnat-founder-durchadh--muiredach-founder-haeghra",
      "childIds": [
        "mona-1612-haeghra",
        "seamus-1607-haeghra"
      ],
      "timeJumpId": "gap-blaithneach-haeghra-muiredach"
    },
    {
      "partnershipId": "marriage-fionaach-1607-durchadh--seamus-1607-haeghra",
      "childIds": [
        "deaglan-haeghra",
        "oighrig-haeghra",
        "muiredach-1632-haeghra"
      ]
    },
    {
      "partnershipId": "marriage-caireann-1626-leite--deaglan-haeghra",
      "childIds": [
        "seamus-haeghra",
        "ideas-1657-haeghra"
      ]
    },
    {
      "partnershipId": "marriage-muiredach-1632-haeghra--tailltein-unknown-haeghra-125-2",
      "childIds": [
        "eithne-1650-haeghra",
        "uibhist-1650-haeghra"
      ]
    },
    {
      "partnershipId": "marriage-seamus-maeve-schwarzdorn",
      "childIds": [
        "donnagh-heaghra",
        "dubessa-1672-haeghra",
        "eachdonn-1673-haeghra",
        "feargal-1675-haeghra"
      ]
    },
    {
      "partnershipId": "marriage-uibhist-1650-haeghra--yvanna-1650-duach",
      "childIds": [
        "braoin-1678-haeghra",
        "dairein-1680-haeghra"
      ]
    },
    {
      "partnershipId": "marriage-marwine-donnagh-teyrngarch",
      "childIds": [
        "deaglan-1695-haeghra",
        "liusaidh-1705-haeghra"
      ]
    },
    {
      "partnershipId": "marriage-feargal-1675-haeghra--hoireabard-1680-cein",
      "childIds": [
        "muiredach-1700-haeghra",
        "mona-haeghra"
      ]
    },
    {
      "partnershipId": "marriage-dairein-1680-haeghra--gyda-unknown-haeghra-149-4",
      "childIds": [
        "cuthbert-1701-haeghra",
        "eamhair-1703-haeghra"
      ]
    },
    {
      "partnershipId": "marriage-deaglan-1695-haeghra--wihalgh-1700-scathain",
      "childIds": [
        "eithne-haeghra",
        "seamus-1726-haeghra"
      ]
    },
    {
      "partnershipId": "marriage-caitriona-1703-fintain--muiredach-1700-haeghra",
      "childIds": [
        "uibhist-1723-haeghra",
        "puirseil-1729-haeghra"
      ]
    },
    {
      "partnershipId": "marriage-cuthbert-1701-haeghra--uibhla-unknown-haeghra-167-0",
      "childIds": [
        "oighrig-1722-haeghra",
        "vearan-1726-haeghra"
      ]
    },
    {
      "partnershipId": "affair-cuthbert-1701-haeghra--hesta-unknown-haeghra-167-1",
      "childIds": [
        "lucasan-1733-haeghra"
      ],
      "legitimacy": "illegitimate"
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-islwyn-caoimhe-penderyn",
      "targetFamilyId": "haus-penderyn",
      "houseId": "house-penderyn"
    },
    {
      "partnershipId": "marriage-mona-1612-haeghra--rioghbhar-1610-nessa",
      "targetFamilyId": "haus-nessa",
      "houseId": "house-nessa"
    },
    {
      "partnershipId": "marriage-fuirseach-oighrig-gortach",
      "targetFamilyId": "haus-gortach",
      "houseId": "house-gortach"
    },
    {
      "partnershipId": "marriage-diarmadas-1654-suiste--ideas-1657-haeghra",
      "targetFamilyId": "haus-suiste",
      "houseId": "house-suiste"
    },
    {
      "partnershipId": "marriage-eithne-1650-haeghra--uruisg-1650-goidin",
      "targetFamilyId": "haus-goidin",
      "houseId": "house-goidin"
    },
    {
      "partnershipId": "marriage-dubessa-1672-haeghra--maelrubha-1667-magach",
      "targetFamilyId": "haus-magach",
      "houseId": "house-magach"
    },
    {
      "partnershipId": "marriage-braoin-1678-haeghra--gordan-1676-gairner",
      "targetFamilyId": "haus-gairner",
      "houseId": "house-gairner"
    },
    {
      "partnershipId": "marriage-goirtin-1703-ronain--liusaidh-1705-haeghra",
      "targetFamilyId": "haus-ronain",
      "houseId": "house-ronain"
    },
    {
      "partnershipId": "marriage-aoghan-mona-gortach",
      "targetFamilyId": "haus-gortach",
      "houseId": "house-gortach"
    },
    {
      "partnershipId": "marriage-aodhin-1698-nessa--eamhair-1703-haeghra",
      "targetFamilyId": "haus-nessa",
      "houseId": "house-nessa"
    },
    {
      "partnershipId": "marriage-sverre-eithne-goldglanz",
      "targetFamilyId": "haus-goldglanz",
      "houseId": "house-goldglanz"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [
    {
      "childId": "ideas-1724-tiran-treathai",
      "parentId": "deaglan-1695-haeghra"
    }
  ],
  "heads": [
    "donnagh-founder-haeghra",
    "muiredach-founder-haeghra",
    "seamus-1607-haeghra",
    "deaglan-haeghra",
    "seamus-haeghra",
    "donnagh-heaghra"
  ],
  "titles": {
    "donnagh-founder-haeghra": "Historisches Oberhaupt",
    "muiredach-founder-haeghra": "Historisches Oberhaupt",
    "seamus-1607-haeghra": "Historisches Oberhaupt",
    "deaglan-haeghra": "Historisches Oberhaupt",
    "seamus-haeghra": "Historisches Oberhaupt",
    "donnagh-heaghra": "Dún Tiarna · Braumeister",
    "deaglan-1695-haeghra": "Laird von Réadlann",
    "seamus-1726-haeghra": "Erbfolge: 2",
    "eachdonn-1673-haeghra": "Fianna"
  },
  "personRoles": {
    "lucasan-1733-haeghra": "bastard",
    "hesta-unknown-haeghra-167-1": "affair",
    "ideas-1724-tiran-treathai": "ward"
  },
  "personExtensions": {
    "liusaidh-1705-haeghra": {
      "chartCenterBetweenPartnerPersonIds": [
        "jarlaith-1700-roth",
        "goirtin-1703-ronain"
      ],
      "chartPartnerGroupPersonOrder": [
        "jarlaith-1700-roth",
        "liusaidh-1705-haeghra",
        "goirtin-1703-ronain"
      ],
      "chartKeepPartnerGroupTogether": true
    }
  },
  "sourceNote": "Zwei serielle Überlieferungslücken. Heaghra ist eine belegte Schreibvariante von Haeghra; vorhandene Personen- und Welt-IDs bleiben erhalten. Liúsaidh war vor ihrer Ehe mit Goirtín mit dem 1720 verstorbenen Jarlaith Roth verlobt. Ideas Tiran Treathai ist Déagláns Mündel; Seamus und Sionna Luga sind verlobt.",
  "currentHeadId": "donnagh-heaghra",
  "heirIds": [
    "deaglan-1695-haeghra",
    "seamus-1726-haeghra"
  ],
  "description": "An’Haeghra, auch Heaghra geschrieben, ist in Réadlann beheimatet und eng mit dem Brauhandwerk verbunden. Sein Oberhaupt Donnagh verbindet die Kunst des Braumeisters mit großem Verwaltungsgeschick; sein Rat ist weit über den eigenen Sitz hinaus geschätzt. Sein Bruder Eachdonn wählte den Kriegerweg und wurde nach seinem Dienst im Krieg zum Fianna erhoben. Déaglán und Seamus stehen in der benannten Nachfolge des Hauses."
});

export const HOUSE_HAEGHRA_FAMILY = withAlbenSourcePortraitUpgrade(createBlaithneachSourceFamily("haeghra", SOURCE));
