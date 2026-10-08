import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { createBlaithneachSourceFamily } from './blaithneach-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "goraidh-founder-ronain-younger",
    "moiraith-founder-cetchathach",
    "simag-founder-gairner",
    "maeve-founder-suiste",
    "nansaidhas-1579-gairner",
    "diarmait-1582-gairner",
    "luighseach-gairner",
    "siofra-1586-clannmhar",
    "ronan-laoch",
    "yachthar-1604-gairner",
    "teaganach-1609-gairner",
    "doileag-1606-ronain",
    "iomhar-1605-feannag",
    "setantaas-1628-gairner",
    "moira-1630-gairner",
    "giorsailan-1629-suiste",
    "cadwallen-mwyalchen",
    "simag-1647-gairner",
    "nighean-1649-gairner",
    "diarmait-gairner",
    "beileag-1651-cleirigh",
    "murchadh-1648-nessa",
    "gwennaelle-ciarog",
    "goraidh-1670-gairner",
    "luighseach-1675-gairner",
    "teaganach-1673-gairner",
    "gordan-1676-gairner",
    "morag-1674-eala",
    "saighir-1672-magach",
    "vardon-1670-fastaigh",
    "braoin-1678-haeghra",
    "yachthar-1692-gairner",
    "ramsay-1696-gairner",
    "setantaas-1701-gairner",
    "nansaidhas-1697-gairner",
    "lusna-gairner",
    "aingeal-1696-suiste",
    "banba-unknown-gairner-163-1",
    "caiden-1693-ronain",
    "tomaltach-1700-leite",
    "simag-1719-gairner",
    "tamhas-1724-gairner",
    "moira-1723-gairner",
    "keir-1726-gairner"
  ],
  "partnershipIds": [
    "engagement-goraidh-founder-ronain-younger--moiraith-founder-cetchathach",
    "marriage-maeve-founder-suiste--simag-founder-gairner",
    "marriage-diarmait-1582-gairner--siofra-1586-clannmhar",
    "marriage-ronan-luighseach",
    "marriage-doileag-1606-ronain--yachthar-1604-gairner",
    "marriage-iomhar-1605-feannag--teaganach-1609-gairner",
    "marriage-giorsailan-1629-suiste--setantaas-1628-gairner",
    "marriage-cadwallen-mwyalchen--moira-1630-gairner",
    "marriage-beileag-1651-cleirigh--simag-1647-gairner",
    "marriage-murchadh-1648-nessa--nighean-1649-gairner",
    "marriage-gwennaelle-diarmait-ciarog",
    "marriage-goraidh-1670-gairner--morag-1674-eala",
    "marriage-luighseach-1675-gairner--saighir-1672-magach",
    "marriage-teaganach-1673-gairner--vardon-1670-fastaigh",
    "marriage-braoin-1678-haeghra--gordan-1676-gairner",
    "marriage-aingeal-1696-suiste--yachthar-1692-gairner",
    "marriage-banba-unknown-gairner-163-1--setantaas-1701-gairner",
    "marriage-caiden-1693-ronain--nansaidhas-1697-gairner",
    "marriage-lusna-gairner--tomaltach-1700-leite"
  ],
  "descendants": [
    {
      "partnershipId": "engagement-goraidh-founder-ronain-younger--moiraith-founder-cetchathach",
      "childIds": [
        "simag-founder-gairner"
      ],
      "legitimacy": "illegitimate"
    },
    {
      "partnershipId": "marriage-maeve-founder-suiste--simag-founder-gairner",
      "childIds": [
        "nansaidhas-1579-gairner",
        "diarmait-1582-gairner",
        "luighseach-gairner"
      ],
      "timeJumpId": "gap-blaithneach-gairner-founders"
    },
    {
      "partnershipId": "marriage-diarmait-1582-gairner--siofra-1586-clannmhar",
      "childIds": [
        "yachthar-1604-gairner",
        "teaganach-1609-gairner"
      ]
    },
    {
      "partnershipId": "marriage-doileag-1606-ronain--yachthar-1604-gairner",
      "childIds": [
        "setantaas-1628-gairner",
        "moira-1630-gairner"
      ]
    },
    {
      "partnershipId": "marriage-giorsailan-1629-suiste--setantaas-1628-gairner",
      "childIds": [
        "simag-1647-gairner",
        "nighean-1649-gairner",
        "diarmait-gairner"
      ]
    },
    {
      "partnershipId": "marriage-beileag-1651-cleirigh--simag-1647-gairner",
      "childIds": [
        "goraidh-1670-gairner",
        "luighseach-1675-gairner"
      ]
    },
    {
      "partnershipId": "marriage-gwennaelle-diarmait-ciarog",
      "childIds": [
        "teaganach-1673-gairner",
        "gordan-1676-gairner"
      ]
    },
    {
      "partnershipId": "marriage-goraidh-1670-gairner--morag-1674-eala",
      "childIds": [
        "yachthar-1692-gairner",
        "ramsay-1696-gairner",
        "setantaas-1701-gairner"
      ]
    },
    {
      "partnershipId": "marriage-braoin-1678-haeghra--gordan-1676-gairner",
      "childIds": [
        "nansaidhas-1697-gairner",
        "lusna-gairner"
      ]
    },
    {
      "partnershipId": "marriage-aingeal-1696-suiste--yachthar-1692-gairner",
      "childIds": [
        "simag-1719-gairner",
        "tamhas-1724-gairner"
      ]
    },
    {
      "partnershipId": "marriage-banba-unknown-gairner-163-1--setantaas-1701-gairner",
      "childIds": [
        "moira-1723-gairner",
        "keir-1726-gairner"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-ronan-luighseach",
      "targetFamilyId": "haus-ruin-ua-laoch",
      "houseId": "house-laoch"
    },
    {
      "partnershipId": "marriage-iomhar-1605-feannag--teaganach-1609-gairner",
      "targetFamilyId": "haus-feannag",
      "houseId": "house-feannag"
    },
    {
      "partnershipId": "marriage-cadwallen-mwyalchen--moira-1630-gairner",
      "targetFamilyId": "haus-mwyalchen",
      "houseId": "house-mwyalchen"
    },
    {
      "partnershipId": "marriage-murchadh-1648-nessa--nighean-1649-gairner",
      "targetFamilyId": "haus-nessa",
      "houseId": "house-nessa"
    },
    {
      "partnershipId": "marriage-luighseach-1675-gairner--saighir-1672-magach",
      "targetFamilyId": "haus-magach",
      "houseId": "house-magach"
    },
    {
      "partnershipId": "marriage-teaganach-1673-gairner--vardon-1670-fastaigh",
      "targetFamilyId": "haus-fastaigh",
      "houseId": "house-fastaigh"
    },
    {
      "partnershipId": "marriage-caiden-1693-ronain--nansaidhas-1697-gairner",
      "targetFamilyId": "haus-ronain",
      "houseId": "house-ronain"
    },
    {
      "partnershipId": "marriage-lusna-gairner--tomaltach-1700-leite",
      "targetFamilyId": "haus-dal-leite",
      "houseId": "house-dal-leite"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [],
  "heads": [
    "simag-founder-gairner",
    "diarmait-1582-gairner",
    "yachthar-1604-gairner",
    "setantaas-1628-gairner",
    "simag-1647-gairner",
    "goraidh-1670-gairner"
  ],
  "titles": {
    "simag-founder-gairner": "Hausgründer · Laird",
    "diarmait-1582-gairner": "Historisches Oberhaupt",
    "yachthar-1604-gairner": "Historisches Oberhaupt",
    "setantaas-1628-gairner": "Historisches Oberhaupt",
    "simag-1647-gairner": "Historisches Oberhaupt",
    "goraidh-1670-gairner": "Laird von Eorach · Marschall",
    "yachthar-1692-gairner": "Erbfolge: 1",
    "simag-1719-gairner": "Erbfolge: 2",
    "tamhas-1724-gairner": "Erbfolge: 3"
  },
  "personRoles": {
    "simag-founder-gairner": "bastard"
  },
  "personExtensions": {},
  "sourceNote": "Der Hausgründer ist Sìmag, nicht sein zuvor verstorbener Vater Goraidh Ronain. Die Verlobung Goraidhs und Moiraiths und Sìmags uneheliche Abstammung folgen beiden Grafiken und Ronains Biografie. Eine serielle Überlieferungslücke nach dem Gründerpaar.",
  "currentHeadId": "goraidh-1670-gairner",
  "heirIds": [
    "yachthar-1692-gairner",
    "simag-1719-gairner",
    "tamhas-1724-gairner"
  ],
  "description": "Dal’Gáirnér ist ein Kadettenhaus der Ronain mit Sitz in Eorach. Fürst Caius wollte seinen Bruder Goraidh mit einer eigenen Linie auszeichnen; nach dessen frühem Tod erhielt Goraidhs unehelicher Sohn Sìmag die Lairdwürde und begründete den Clan. Heute führt Goraidh Gáirnér das Haus und bekleidet das Marschallsamt. Seine Nachfolge ist über Yachthar und dessen Söhne Sìmag und Tàmhas verzeichnet.",
  "founderPartnershipId": "marriage-maeve-founder-suiste--simag-founder-gairner",
  "founderId": "simag-founder-gairner"
});

export const HOUSE_GAIRNER_FAMILY = withAlbenSourcePortraitUpgrade(createBlaithneachSourceFamily("gairner", SOURCE));
