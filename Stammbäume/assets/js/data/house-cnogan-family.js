import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { createAislearneachSourceFamily } from './aislearneach-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "treasain-founder-cnogan",
    "eamonin-unknown-cnogan-88-0",
    "nansaidh-1605-cnogan",
    "colmachas-1607-cnogan",
    "seasaidh-1615-cnogan",
    "hascan-unknown-cnogan-100-0",
    "gaothaire-unknown-cnogan-100-1",
    "treasain-1629-cnogan",
    "gilleasbuig-cnogan",
    "mairsaili-1637-cnogan",
    "ailpein-unknown-cnogan-110-0",
    "seonaid-1632-ceinselaig",
    "danaidh-1634-feannag",
    "oighreag-1651-cnogan",
    "ualghairg-1654-cnogan",
    "ealag-unknown-cnogan-120-0",
    "eachdonn-unknown-cnogan-120-1",
    "tormoid-1670-cnogan",
    "quidhnait-1675-cnogan",
    "barabal-unknown-cnogan-130-0",
    "griogair-unknown-cnogan-130-1",
    "treasain-1693-cnogan",
    "gilleasbuig-1697-cnogan",
    "oighreag-cnogan",
    "sorcha-1703-cnogan",
    "calum-unknown-cnogan-140-0",
    "tiobraide-1695-eaghraide",
    "koarnach-1690-eamhra",
    "beiste-unknown-cnogan-140-3",
    "latharn-1696-luchdon",
    "seasaidh-1718-cnogan",
    "vear-1725-cnogan",
    "zennia-eamhra",
    "teasag-1716-cnogan",
    "uilliam-1718-cnogan"
  ],
  "partnershipIds": [
    "marriage-eamonin-unknown-cnogan-88-0--treasain-founder-cnogan",
    "marriage-hascan-unknown-cnogan-100-0--nansaidh-1605-cnogan",
    "marriage-gaothaire-unknown-cnogan-100-1--seasaidh-1615-cnogan",
    "marriage-ailpein-unknown-cnogan-110-0--treasain-1629-cnogan",
    "marriage-gilleasbuig-cnogan--seonaid-1632-ceinselaig",
    "marriage-danaidh-1634-feannag--mairsaili-1637-cnogan",
    "marriage-ealag-unknown-cnogan-120-0--oighreag-1651-cnogan",
    "marriage-eachdonn-unknown-cnogan-120-1--ualghairg-1654-cnogan",
    "marriage-barabal-unknown-cnogan-130-0--tormoid-1670-cnogan",
    "marriage-griogair-unknown-cnogan-130-1--quidhnait-1675-cnogan",
    "marriage-calum-unknown-cnogan-140-0--treasain-1693-cnogan",
    "marriage-gilleasbuig-1697-cnogan--tiobraide-1695-eaghraide",
    "forced-koarnach-1690-eamhra--oighreag-cnogan",
    "marriage-beiste-unknown-cnogan-140-3--oighreag-cnogan",
    "marriage-latharn-1696-luchdon--sorcha-1703-cnogan"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-eamonin-unknown-cnogan-88-0--treasain-founder-cnogan",
      "childIds": [
        "nansaidh-1605-cnogan",
        "colmachas-1607-cnogan",
        "seasaidh-1615-cnogan"
      ],
      "timeJumpId": "gap-aislearneach-cnogan-founders"
    },
    {
      "partnershipId": "marriage-hascan-unknown-cnogan-100-0--nansaidh-1605-cnogan",
      "childIds": [
        "treasain-1629-cnogan",
        "gilleasbuig-cnogan"
      ]
    },
    {
      "partnershipId": "marriage-gaothaire-unknown-cnogan-100-1--seasaidh-1615-cnogan",
      "childIds": [
        "mairsaili-1637-cnogan"
      ]
    },
    {
      "partnershipId": "marriage-ailpein-unknown-cnogan-110-0--treasain-1629-cnogan",
      "childIds": [
        "oighreag-1651-cnogan",
        "ualghairg-1654-cnogan"
      ]
    },
    {
      "partnershipId": "marriage-ealag-unknown-cnogan-120-0--oighreag-1651-cnogan",
      "childIds": [
        "tormoid-1670-cnogan"
      ]
    },
    {
      "partnershipId": "marriage-eachdonn-unknown-cnogan-120-1--ualghairg-1654-cnogan",
      "childIds": [
        "quidhnait-1675-cnogan"
      ]
    },
    {
      "partnershipId": "marriage-barabal-unknown-cnogan-130-0--tormoid-1670-cnogan",
      "childIds": [
        "treasain-1693-cnogan",
        "gilleasbuig-1697-cnogan"
      ]
    },
    {
      "partnershipId": "marriage-griogair-unknown-cnogan-130-1--quidhnait-1675-cnogan",
      "childIds": [
        "oighreag-cnogan",
        "sorcha-1703-cnogan"
      ]
    },
    {
      "partnershipId": "marriage-calum-unknown-cnogan-140-0--treasain-1693-cnogan",
      "childIds": [
        "seasaidh-1718-cnogan",
        "vear-1725-cnogan"
      ]
    },
    {
      "partnershipId": "forced-koarnach-1690-eamhra--oighreag-cnogan",
      "childIds": [
        "zennia-eamhra"
      ],
      "legitimacy": "illegitimate"
    },
    {
      "partnershipId": "marriage-beiste-unknown-cnogan-140-3--oighreag-cnogan",
      "childIds": [
        "teasag-1716-cnogan",
        "uilliam-1718-cnogan"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-gilleasbuig-cnogan--seonaid-1632-ceinselaig",
      "targetFamilyId": "haus-ua-nic-ceinselaig",
      "houseId": "house-ua-nic-ceinselaig"
    },
    {
      "partnershipId": "marriage-danaidh-1634-feannag--mairsaili-1637-cnogan",
      "targetFamilyId": "haus-feannag",
      "houseId": "house-feannag"
    },
    {
      "partnershipId": "marriage-gilleasbuig-1697-cnogan--tiobraide-1695-eaghraide",
      "targetFamilyId": "haus-eaghraide",
      "houseId": "house-eaghraide"
    },
    {
      "partnershipId": "marriage-latharn-1696-luchdon--sorcha-1703-cnogan",
      "targetFamilyId": "haus-luchdon",
      "houseId": "house-luchdon"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [],
  "heads": [
    "treasain-founder-cnogan",
    "nansaidh-1605-cnogan",
    "treasain-1629-cnogan",
    "oighreag-1651-cnogan",
    "tormoid-1670-cnogan"
  ],
  "titles": {
    "treasain-founder-cnogan": "Clangründerin",
    "nansaidh-1605-cnogan": "Historisches Oberhaupt",
    "treasain-1629-cnogan": "Historisches Oberhaupt",
    "oighreag-1651-cnogan": "Historisches Oberhaupt",
    "tormoid-1670-cnogan": "Laird von Foraoise · Clanführerin",
    "treasain-1693-cnogan": "Erbfolge: 1",
    "seasaidh-1718-cnogan": "Erbfolge: 2",
    "barabal-unknown-cnogan-130-0": "Veteran",
    "griogair-unknown-cnogan-130-1": "Gelehrter · Lebenszirkel"
  },
  "personRoles": {
    "zennia-eamhra": "bastard",
    "koarnach-1690-eamhra": "forced"
  },
  "personExtensions": {},
  "sourceNote": "Eine Überlieferungslücke. Treasaín begründet das Haus, Tormoid ist die gegenwärtige Clanführerin und Barabal ihr Ehemann. Oighreags erzwungene Verbindung mit Koarnach Eamhra ist von ihrer Ehe mit Beiste getrennt; Zennia ist unehelich, Teasag und Uilliam sind ihre ehelichen Kinder. Beiste verließ die Familie nach Oighreags Tod.",
  "currentHeadId": "tormoid-1670-cnogan",
  "heirIds": [
    "treasain-1693-cnogan",
    "seasaidh-1718-cnogan"
  ],
  "description": "Cnogan ist ein von der Gründerin Treasaín geprägter Clan in Foraoise. Die Führung fällt an die erstgeborene Tochter; heute steht Tormoid mit ihrem Ehemann, dem Veteranen Barabal, an der Spitze. Treasaín und Seasaidh bilden die benannte Nachfolge. Der Krieg hinterließ tiefe Wunden: Oighreag starb bei Zennias Geburt, doch der Clan nahm das Kind trotz der erzwungenen Verbindung auf."
});

export const HOUSE_CNOGAN_FAMILY = withAlbenSourcePortraitUpgrade(createAislearneachSourceFamily("cnogan", SOURCE));
