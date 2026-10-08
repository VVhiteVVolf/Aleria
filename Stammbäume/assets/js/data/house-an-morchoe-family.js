import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { createCeitheachSourceFamily } from './ceitheach-source-family-builder.js';
import { CEITHEACH_ADDITIONAL_SOURCE_CATALOG } from './ceitheach-additional-source-catalog.js';

// Elternpaare und Kinder nach beschrifteter Tabelle und Stammbaumgrafik.
const SOURCE = Object.freeze({
  "personIds": [
    "toirberth-founder-mochoe",
    "saoirseas-unknown-an-morchoe-founder",
    "reamonn-1581-mochoe",
    "artair-mochoe",
    "ailis-1586-bhaird",
    "sinead-1582-holloran",
    "aodhra-1605-mochoe",
    "haileigh-1610-mochoe",
    "nansaidh-1612-mochoe",
    "omhar-1613-mochoe",
    "onora-farraigeach",
    "harailt-riangabra",
    "macthar-rioga",
    "quaira-boyd",
    "macraith-mochoe",
    "muireann-1633-mochoe",
    "mairtin-1634-mochoe",
    "cathalog-mochoe",
    "saoirseas-mochoe",
    "innogen-1633-eldath",
    "eanraig-1630-leite",
    "jorna-unknown-an-morchoe-1633",
    "vearga-unknown-an-morchoe-1633",
    "donndubhan-rochraide",
    "reamonn-1651-mochoe",
    "banan-mochoe",
    "eamon-mochoe",
    "oideach-mochoe",
    "reamonn-1650-mochoe",
    "earca-tuirseach",
    "sceolaigh-1649-holloran",
    "breanna-tordarroch",
    "gabhan-borthwick",
    "kermena-seaghdha",
    "macthar-mochoe",
    "nansaidh-1677-mochoe",
    "jorcha-mochoe",
    "brogan-mochoe",
    "haileigh-mochoe",
    "toirberth-1674-mochoe",
    "muireann-1676-mochoe",
    "xuinchin-1669-seaghdha",
    "eubhog-tordarroch",
    "sadbh-unknown-an-morchoe-1679",
    "trianne-1672-eldath",
    "meara-unknown-an-morchoe-1677",
    "aonghus-bhaird",
    "mairtin-1694-mochoe",
    "saoirseas-1702-mochoe",
    "colmas-mochoe",
    "banbhin-mochoe",
    "feargal-mochoe",
    "aodhra-1698-mochoe",
    "reamonn-1701-mochoe",
    "omhar-1704-mochoe",
    "laoise-farraigeach",
    "cuilinn-cleirigh",
    "roarke-rochraide",
    "liosa-unknown-an-morchoe-1704",
    "geirlaug-unknown-an-morchoe-1705",
    "frauke-unknown-an-morchoe-1711",
    "lucretia-unknown-an-morchoe-1709",
    "nenetl-unknown-an-morchoe-1715",
    "aine-mochoe",
    "parthas-mochoe",
    "fergus-mochoe",
    "ulfrik-mochoe",
    "iain-mochoe",
    "siman-mochoe",
    "siona-mochoe",
    "bogus-mochoe"
  ],
  "partnershipIds": [
    "marriage-saoirseas-unknown-an-morchoe-founder--toirberth-founder-mochoe",
    "marriage-ailis-1586-bhaird--reamonn-1581-mochoe",
    "marriage-artair-mochoe--sinead-1582-holloran",
    "marriage-aodhra-1605-mochoe--onora-farraigeach",
    "marriage-haileigh-1610-mochoe--harailt-riangabra",
    "marriage-macthar-rioga--nansaidh-1612-mochoe",
    "marriage-omhar-1613-mochoe--quaira-boyd",
    "marriage-innogen-1633-eldath--macraith-mochoe",
    "marriage-eanraig-1630-leite--muireann-1633-mochoe",
    "marriage-jorna-unknown-an-morchoe-1633--mairtin-1634-mochoe",
    "marriage-cathalog-mochoe--vearga-unknown-an-morchoe-1633",
    "marriage-donndubhan-rochraide--saoirseas-mochoe",
    "marriage-earca-tuirseach--reamonn-1651-mochoe",
    "marriage-banan-mochoe--sceolaigh-1649-holloran",
    "marriage-breanna-tordarroch--eamon-mochoe",
    "marriage-gabhan-borthwick--oideach-mochoe",
    "marriage-kermena-seaghdha--reamonn-1650-mochoe",
    "marriage-macthar-mochoe--xuinchin-1669-seaghdha",
    "marriage-eubhog-tordarroch--nansaidh-1677-mochoe",
    "marriage-jorcha-mochoe--sadbh-unknown-an-morchoe-1679",
    "marriage-haileigh-mochoe--trianne-1672-eldath",
    "marriage-meara-unknown-an-morchoe-1677--toirberth-1674-mochoe",
    "marriage-aonghus-bhaird--muireann-1676-mochoe",
    "marriage-laoise-farraigeach--mairtin-1694-mochoe",
    "engagement-cuilinn-cleirigh--saoirseas-1702-mochoe",
    "engagement-banbhin-mochoe--roarke-rochraide",
    "marriage-aodhra-1698-mochoe--liosa-unknown-an-morchoe-1704",
    "marriage-geirlaug-unknown-an-morchoe-1705--reamonn-1701-mochoe",
    "affair-frauke-unknown-an-morchoe-1711--reamonn-1701-mochoe",
    "affair-lucretia-unknown-an-morchoe-1709--omhar-1704-mochoe",
    "affair-nenetl-unknown-an-morchoe-1715--omhar-1704-mochoe"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-saoirseas-unknown-an-morchoe-founder--toirberth-founder-mochoe",
      "childIds": [
        "reamonn-1581-mochoe",
        "artair-mochoe"
      ],
      "timeJumpId": "gap-an-morchoe-founder"
    },
    {
      "partnershipId": "marriage-ailis-1586-bhaird--reamonn-1581-mochoe",
      "childIds": [
        "aodhra-1605-mochoe",
        "haileigh-1610-mochoe",
        "nansaidh-1612-mochoe",
        "omhar-1613-mochoe"
      ]
    },
    {
      "partnershipId": "marriage-aodhra-1605-mochoe--onora-farraigeach",
      "childIds": [
        "macraith-mochoe",
        "muireann-1633-mochoe",
        "mairtin-1634-mochoe"
      ]
    },
    {
      "partnershipId": "marriage-omhar-1613-mochoe--quaira-boyd",
      "childIds": [
        "cathalog-mochoe",
        "saoirseas-mochoe"
      ]
    },
    {
      "partnershipId": "marriage-innogen-1633-eldath--macraith-mochoe",
      "childIds": [
        "reamonn-1651-mochoe",
        "banan-mochoe"
      ]
    },
    {
      "partnershipId": "marriage-jorna-unknown-an-morchoe-1633--mairtin-1634-mochoe",
      "childIds": [
        "eamon-mochoe",
        "oideach-mochoe"
      ]
    },
    {
      "partnershipId": "marriage-cathalog-mochoe--vearga-unknown-an-morchoe-1633",
      "childIds": [
        "reamonn-1650-mochoe"
      ]
    },
    {
      "partnershipId": "marriage-earca-tuirseach--reamonn-1651-mochoe",
      "childIds": [
        "macthar-mochoe",
        "nansaidh-1677-mochoe"
      ]
    },
    {
      "partnershipId": "marriage-breanna-tordarroch--eamon-mochoe",
      "childIds": [
        "jorcha-mochoe",
        "brogan-mochoe"
      ]
    },
    {
      "partnershipId": "marriage-kermena-seaghdha--reamonn-1650-mochoe",
      "childIds": [
        "haileigh-mochoe",
        "toirberth-1674-mochoe",
        "muireann-1676-mochoe"
      ]
    },
    {
      "partnershipId": "marriage-macthar-mochoe--xuinchin-1669-seaghdha",
      "childIds": [
        "mairtin-1694-mochoe",
        "saoirseas-1702-mochoe",
        "colmas-mochoe"
      ]
    },
    {
      "partnershipId": "marriage-jorcha-mochoe--sadbh-unknown-an-morchoe-1679",
      "childIds": [
        "banbhin-mochoe",
        "feargal-mochoe"
      ]
    },
    {
      "partnershipId": "marriage-meara-unknown-an-morchoe-1677--toirberth-1674-mochoe",
      "childIds": [
        "aodhra-1698-mochoe",
        "reamonn-1701-mochoe",
        "omhar-1704-mochoe"
      ]
    },
    {
      "partnershipId": "marriage-aodhra-1698-mochoe--liosa-unknown-an-morchoe-1704",
      "childIds": [
        "aine-mochoe",
        "parthas-mochoe"
      ]
    },
    {
      "partnershipId": "marriage-geirlaug-unknown-an-morchoe-1705--reamonn-1701-mochoe",
      "childIds": [
        "fergus-mochoe",
        "ulfrik-mochoe"
      ]
    },
    {
      "partnershipId": "affair-frauke-unknown-an-morchoe-1711--reamonn-1701-mochoe",
      "childIds": [
        "iain-mochoe"
      ],
      "legitimacy": "bastard"
    },
    {
      "partnershipId": "affair-lucretia-unknown-an-morchoe-1709--omhar-1704-mochoe",
      "childIds": [
        "siman-mochoe",
        "siona-mochoe"
      ],
      "legitimacy": "bastard"
    },
    {
      "partnershipId": "affair-nenetl-unknown-an-morchoe-1715--omhar-1704-mochoe",
      "childIds": [
        "bogus-mochoe"
      ],
      "legitimacy": "bastard"
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-artair-mochoe--sinead-1582-holloran",
      "targetFamilyId": "haus-nic-holloran",
      "houseId": "house-nic-holloran"
    },
    {
      "partnershipId": "marriage-haileigh-1610-mochoe--harailt-riangabra",
      "targetFamilyId": "haus-riangabra",
      "houseId": "house-riangabra"
    },
    {
      "partnershipId": "marriage-macthar-rioga--nansaidh-1612-mochoe",
      "targetFamilyId": "haus-rioga",
      "houseId": "house-rioga"
    },
    {
      "partnershipId": "marriage-eanraig-1630-leite--muireann-1633-mochoe",
      "targetFamilyId": "haus-dal-leite",
      "houseId": "house-dal-leite"
    },
    {
      "partnershipId": "marriage-donndubhan-rochraide--saoirseas-mochoe",
      "targetFamilyId": "haus-ui-rochraide",
      "houseId": "house-rochraide"
    },
    {
      "partnershipId": "marriage-banan-mochoe--sceolaigh-1649-holloran",
      "targetFamilyId": "haus-nic-holloran",
      "houseId": "house-nic-holloran"
    },
    {
      "partnershipId": "marriage-gabhan-borthwick--oideach-mochoe",
      "targetFamilyId": "haus-borthwick",
      "houseId": "house-borthwick"
    },
    {
      "partnershipId": "marriage-eubhog-tordarroch--nansaidh-1677-mochoe",
      "targetFamilyId": "haus-tir-an-tordarroch",
      "houseId": "house-tir-an-tordarroch"
    },
    {
      "partnershipId": "marriage-haileigh-mochoe--trianne-1672-eldath",
      "targetFamilyId": "haus-eldath",
      "houseId": "house-eldath"
    },
    {
      "partnershipId": "marriage-aonghus-bhaird--muireann-1676-mochoe",
      "targetFamilyId": "haus-an-bhaird",
      "houseId": "house-an-bhaird"
    },
    {
      "partnershipId": "marriage-laoise-farraigeach--mairtin-1694-mochoe",
      "targetFamilyId": "haus-farraigeach",
      "houseId": "house-farraigeach"
    },
    {
      "partnershipId": "engagement-cuilinn-cleirigh--saoirseas-1702-mochoe",
      "targetFamilyId": "haus-cleirigh",
      "houseId": "house-cleirigh"
    },
    {
      "partnershipId": "engagement-banbhin-mochoe--roarke-rochraide",
      "targetFamilyId": "haus-ui-rochraide",
      "houseId": "house-rochraide"
    }
  ],
  "cadets": [],
  "wards": [],
  "historicalWards": [],
  "heads": [
    "toirberth-founder-mochoe",
    "reamonn-1581-mochoe",
    "aodhra-1605-mochoe",
    "macraith-mochoe",
    "reamonn-1651-mochoe"
  ],
  "titles": {
    "toirberth-founder-mochoe": "Legendärer Gründer des Clans",
    "reamonn-1581-mochoe": "Oberhaupt bis 1659",
    "aodhra-1605-mochoe": "Oberhaupt 1659–1675",
    "macraith-mochoe": "Oberhaupt 1675–1699",
    "reamonn-1651-mochoe": "Oberhaupt 1699–1720",
    "toirberth-1674-mochoe": "Lehenswart · Herr einer Inselfeste",
    "aodhra-1698-mochoe": "Erbe · Mitglied der Gilde Möwensang",
    "reamonn-1701-mochoe": "Erbe · Mitglied des Blutbundes",
    "omhar-1704-mochoe": "Erbe · Pirat"
  },
  "personRoles": {
    "frauke-unknown-an-morchoe-1711": "affair",
    "lucretia-unknown-an-morchoe-1709": "affair",
    "nenetl-unknown-an-morchoe-1715": "affair"
  },
  "sourceNote": "Ein serieller Quellenzeitsprung. Die beiden Réamonns von 1650 und 1651 sind unterschiedliche Personen mit unterschiedlichen Paaren. Die jüngeren Réamonn- und Omhar-Affären erhalten getrennte uneheliche Kindergruppen. Quaira Boyd ist trotz der kopierten Überschrift Quira dieselbe Quellenperson."
});

export const HOUSE_AN_MORCHOE_FAMILY = withAlbenSourcePortraitUpgrade(createCeitheachSourceFamily('an-morchoe', SOURCE, CEITHEACH_ADDITIONAL_SOURCE_CATALOG));
