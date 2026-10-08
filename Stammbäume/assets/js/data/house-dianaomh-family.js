import { createDamhSourceFamily } from './damh-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "amhlaoibh-founder-dianaomh",
    "aodhnach-unknown-dianaomh-0-1",
    "aoghan-1582-dianaomh",
    "aoifeann-1586-dianaomh",
    "caomhog-1583-forsyth",
    "eanbharr-1585-dundas",
    "aodhagan-1604-dianaomh",
    "aodhnach-1607-dianaomh",
    "aodhluan-1610-dianaomh",
    "samthann-1609-luga",
    "hearn-1606-oglivy",
    "zaorbha-1612-elid",
    "amhlaoibh-1630-dianaomh",
    "aoibhinn-1635-dianaomh",
    "abhan-1630-dianaomh",
    "tadhaigh-1636-eoghainn",
    "scannlan-1632-duff",
    "dearbhorgaill-1632-marcaigh",
    "aolbha-1654-dianaomh",
    "artan-1655-dianaomh",
    "aibhne-1650-dianaomh",
    "aindreas-1656-dianaomh",
    "oirbhealach-1655-muirgheal",
    "uirghlinn-1655-carnegie",
    "fergus-1648-lockart",
    "vathna-unknown-dianaomh-41-3",
    "aodhagan-1674-dianaomh",
    "aodhnach-1677-dianaomh",
    "aodhluan-1680-dianaomh",
    "ailis-1680-dianaomh",
    "elvara-1675-cadhla",
    "ollamh-1678-dobhar",
    "uibhla-1682-oglivy",
    "aoghan-1694-dianaomh",
    "aibhilin-1695-dianaomh",
    "ailis-1698-dianaomh",
    "abhan-1703-dianaomh",
    "aileen-1708-dianaomh",
    "paidin-1696-muirin",
    "kester-1695-eoghainn",
    "faolan-founder-airdmhor",
    "treabhan-1701-duff",
    "artan-1714-dianaomh"
  ],
  "partnershipIds": [
    "marriage-amhlaoibh-founder-dianaomh--aodhnach-unknown-dianaomh-0-1",
    "marriage-aoghan-1582-dianaomh--caomhog-1583-forsyth",
    "marriage-aoifeann-1586-dianaomh--eanbharr-1585-dundas",
    "marriage-aodhagan-1604-dianaomh--samthann-1609-luga",
    "marriage-aodhnach-1607-dianaomh--hearn-1606-oglivy",
    "marriage-aodhluan-1610-dianaomh--zaorbha-1612-elid",
    "marriage-amhlaoibh-1630-dianaomh--tadhaigh-1636-eoghainn",
    "marriage-aoibhinn-1635-dianaomh--scannlan-1632-duff",
    "marriage-abhan-1630-dianaomh--dearbhorgaill-1632-marcaigh",
    "marriage-aolbha-1654-dianaomh--oirbhealach-1655-muirgheal",
    "marriage-artan-1655-dianaomh--uirghlinn-1655-carnegie",
    "marriage-aibhne-1650-dianaomh--fergus-1648-lockart",
    "marriage-aindreas-1656-dianaomh--vathna-unknown-dianaomh-41-3",
    "marriage-aodhagan-1674-dianaomh--elvara-1675-cadhla",
    "marriage-aodhnach-1677-dianaomh--ollamh-1678-dobhar",
    "marriage-aodhluan-1680-dianaomh--uibhla-1682-oglivy",
    "marriage-aoghan-1694-dianaomh--paidin-1696-muirin",
    "marriage-aibhilin-1695-dianaomh--kester-1695-eoghainn",
    "marriage-ailis-1698-dianaomh--faolan-founder-airdmhor",
    "marriage-aileen-1708-dianaomh--treabhan-1701-duff"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-amhlaoibh-founder-dianaomh--aodhnach-unknown-dianaomh-0-1",
      "childIds": [
        "aoghan-1582-dianaomh",
        "aoifeann-1586-dianaomh"
      ],
      "timeJumpId": "gap-damh-dianaomh-founders"
    },
    {
      "partnershipId": "marriage-aoghan-1582-dianaomh--caomhog-1583-forsyth",
      "childIds": [
        "aodhagan-1604-dianaomh",
        "aodhnach-1607-dianaomh",
        "aodhluan-1610-dianaomh"
      ]
    },
    {
      "partnershipId": "marriage-aodhagan-1604-dianaomh--samthann-1609-luga",
      "childIds": [
        "amhlaoibh-1630-dianaomh",
        "aoibhinn-1635-dianaomh"
      ]
    },
    {
      "partnershipId": "marriage-aodhluan-1610-dianaomh--zaorbha-1612-elid",
      "childIds": [
        "abhan-1630-dianaomh"
      ]
    },
    {
      "partnershipId": "marriage-amhlaoibh-1630-dianaomh--tadhaigh-1636-eoghainn",
      "childIds": [
        "aolbha-1654-dianaomh",
        "artan-1655-dianaomh"
      ]
    },
    {
      "partnershipId": "marriage-abhan-1630-dianaomh--dearbhorgaill-1632-marcaigh",
      "childIds": [
        "aibhne-1650-dianaomh",
        "aindreas-1656-dianaomh"
      ]
    },
    {
      "partnershipId": "marriage-artan-1655-dianaomh--uirghlinn-1655-carnegie",
      "childIds": [
        "aodhagan-1674-dianaomh",
        "aodhnach-1677-dianaomh",
        "aodhluan-1680-dianaomh"
      ]
    },
    {
      "partnershipId": "marriage-aindreas-1656-dianaomh--vathna-unknown-dianaomh-41-3",
      "childIds": [
        "ailis-1680-dianaomh"
      ]
    },
    {
      "partnershipId": "marriage-aodhagan-1674-dianaomh--elvara-1675-cadhla",
      "childIds": [
        "aoghan-1694-dianaomh",
        "aibhilin-1695-dianaomh",
        "ailis-1698-dianaomh",
        "abhan-1703-dianaomh"
      ]
    },
    {
      "partnershipId": "marriage-aodhluan-1680-dianaomh--uibhla-1682-oglivy",
      "childIds": [
        "aileen-1708-dianaomh"
      ]
    },
    {
      "partnershipId": "marriage-aoghan-1694-dianaomh--paidin-1696-muirin",
      "childIds": [
        "artan-1714-dianaomh"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-aoifeann-1586-dianaomh--eanbharr-1585-dundas",
      "targetFamilyId": "haus-dundas",
      "houseId": "house-dundas"
    },
    {
      "partnershipId": "marriage-aodhnach-1607-dianaomh--hearn-1606-oglivy",
      "targetFamilyId": "haus-oglivy",
      "houseId": "house-oglivy"
    },
    {
      "partnershipId": "marriage-aoibhinn-1635-dianaomh--scannlan-1632-duff",
      "targetFamilyId": "haus-duff",
      "houseId": "house-duff"
    },
    {
      "partnershipId": "marriage-aolbha-1654-dianaomh--oirbhealach-1655-muirgheal",
      "targetFamilyId": "haus-muirgheal",
      "houseId": "house-muirgheal"
    },
    {
      "partnershipId": "marriage-aibhne-1650-dianaomh--fergus-1648-lockart",
      "targetFamilyId": "haus-lockart",
      "houseId": "house-lockart"
    },
    {
      "partnershipId": "marriage-aodhnach-1677-dianaomh--ollamh-1678-dobhar",
      "targetFamilyId": "haus-dobhar",
      "houseId": "house-dobhar"
    },
    {
      "partnershipId": "marriage-aibhilin-1695-dianaomh--kester-1695-eoghainn",
      "targetFamilyId": "haus-eoghainn",
      "houseId": "house-eoghainn"
    },
    {
      "partnershipId": "marriage-ailis-1698-dianaomh--faolan-founder-airdmhor",
      "targetFamilyId": "haus-airdmhor",
      "houseId": "house-airdmhor"
    },
    {
      "partnershipId": "marriage-aileen-1708-dianaomh--treabhan-1701-duff",
      "targetFamilyId": "haus-duff",
      "houseId": "house-duff"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [],
  "heads": [],
  "titles": {},
  "personRoles": {},
  "personExtensions": {},
  "sourceNote": "Eine Überlieferungslücke. Todeskreuze werden ohne erfundene Todesjahre übernommen. Ailis (*1680) und Ailís (*1698) sind zwei verschiedene Personen. Die Herkunft Vathnas bleibt offen.",
  "currentHeadId": "",
  "heirIds": [],
  "description": "Sid Ard Dianaomh hält historisch die Dun-Tiarna-Herrschaft Torbhreac in Tir na Damh. Am Anfang der überlieferten Genealogie stehen Amhlaoibh und Aodhnach. Nach dem Überlieferungssprung verbinden die Linien Aogháns und Aoifeanns den Clan mit Forsyth und Dundas; weitere Zweige führen zu Eoghainn, Elid, Dobhar und Oglivy. Zahlreiche Angehörige sind als verstorben gekennzeichnet, während Ailis und Ailís lebend überliefert sind. Die alte Herrschaft bleibt trotz Krieg und Teilbesetzung eingetragen.",
  "warriorReference": ""
});

export const HOUSE_DIANAOMH_FAMILY = createDamhSourceFamily("dianaomh", SOURCE);
