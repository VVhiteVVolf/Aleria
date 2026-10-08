import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { createDunfalSourceFamily } from './dunfal-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "nuada-founder-nuadat",
    "nogh-unknown-nuadat-91-0",
    "tolai-founder-nuadat",
    "tadg-founder-nuadat",
    "lugh-founder-nuadat",
    "haibrhinn-unknown-nuadat-103-0",
    "baoigheall-unknown-nuadat-103-1",
    "teaganach-unknown-nuadat-103-2",
    "nogh-founder-nuadat",
    "treasa-founder-nuadat",
    "aibhreann-unknown-nuadat-115-0",
    "hurracan-unknown-nuadat-115-1",
    "earc-1600-nuadat",
    "keara-1605-nuadat",
    "oran-1608-nuadat",
    "glaodhaich-1606-nessa",
    "connla-1602-duilb",
    "draighean-unknown-nuadat-127-2",
    "lugh-1626-nuadat",
    "fionnghuala-nuadat",
    "bran-1634-nuadat",
    "ceana-1630-nuadat",
    "labhaoise-unknown-nuadat-137-0",
    "haul-arth",
    "peathra-unknown-nuadat-137-2",
    "tormodh-1628-riangabra",
    "nogh-1644-nuadat",
    "ruadh-nuadat",
    "mebh-1654-nuadat",
    "colm-1656-nuadat",
    "maodnait-1645-cetchathach",
    "balor-seaghdha",
    "zareck-1652-casur",
    "josaidh-unknown-nuadat-147-3",
    "tadg-1663-nuadat",
    "sharni-1667-nuadat",
    "ultan-1672-nuadat",
    "tolai-1676-nuadat",
    "quona-1678-nuadat",
    "damhnait-1664-chulainn",
    "donndubhan-1666-diuid",
    "treasa-1669-aonghusa",
    "blawd-unknown-nuadat-157-3",
    "iagan-1675-anbhair",
    "brodie-1686-nuadat",
    "aideen-nuadat",
    "artan-1694-nuadat",
    "earc-1710-nuadat",
    "xina-1697-nuadat",
    "oran-1700-nuadat",
    "aodh-1703-nuadat",
    "aigneis-1692-lockart",
    "cynddelw-pysgod",
    "hadhbh-1710-casur",
    "hearn-unknown-nuadat-175-0",
    "thorir-unknown-nuadat-175-1",
    "maolmhuire-unknown-nuadat-175-2",
    "nogh-1717-nuadat",
    "bryenne-1722-nuadat",
    "fola-1728-nuadat",
    "fiach-1728-nuadat",
    "oira-1734-nuadat",
    "hugh-1723-nuadat",
    "lugh-1725-nuadat",
    "voil-1730-nuadat",
    "bran-1723-nuadat",
    "duna-1726-nuadat"
  ],
  "partnershipIds": [
    "marriage-nogh-unknown-nuadat-91-0--nuada-founder-nuadat",
    "marriage-haibrhinn-unknown-nuadat-103-0--tolai-founder-nuadat",
    "marriage-baoigheall-unknown-nuadat-103-1--tadg-founder-nuadat",
    "marriage-lugh-founder-nuadat--teaganach-unknown-nuadat-103-2",
    "marriage-aibhreann-unknown-nuadat-115-0--nogh-founder-nuadat",
    "marriage-hurracan-unknown-nuadat-115-1--treasa-founder-nuadat",
    "marriage-earc-1600-nuadat--glaodhaich-1606-nessa",
    "marriage-connla-1602-duilb--keara-1605-nuadat",
    "marriage-draighean-unknown-nuadat-127-2--oran-1608-nuadat",
    "marriage-labhaoise-unknown-nuadat-137-0--lugh-1626-nuadat",
    "marriage-haul-fionnghuala",
    "marriage-bran-1634-nuadat--peathra-unknown-nuadat-137-2",
    "marriage-ceana-1630-nuadat--tormodh-1628-riangabra",
    "marriage-maodnait-1645-cetchathach--nogh-1644-nuadat",
    "marriage-balor-seaghdha--ruadh-nuadat",
    "marriage-mebh-1654-nuadat--zareck-1652-casur",
    "marriage-colm-1656-nuadat--josaidh-unknown-nuadat-147-3",
    "marriage-damhnait-1664-chulainn--tadg-1663-nuadat",
    "marriage-donndubhan-1666-diuid--sharni-1667-nuadat",
    "marriage-treasa-1669-aonghusa--ultan-1672-nuadat",
    "marriage-blawd-unknown-nuadat-157-3--tolai-1676-nuadat",
    "marriage-iagan-1675-anbhair--quona-1678-nuadat",
    "marriage-aigneis-1692-lockart--brodie-1686-nuadat",
    "marriage-cynddelw-aideen",
    "marriage-earc-1710-nuadat--hadhbh-1710-casur",
    "marriage-hearn-unknown-nuadat-175-0--xina-1697-nuadat",
    "affair-thorir-unknown-nuadat-175-1--xina-1697-nuadat",
    "marriage-aodh-1703-nuadat--maolmhuire-unknown-nuadat-175-2"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-nogh-unknown-nuadat-91-0--nuada-founder-nuadat",
      "childIds": [
        "tolai-founder-nuadat",
        "tadg-founder-nuadat",
        "lugh-founder-nuadat"
      ],
      "timeJumpId": "gap-dunfal-nuadat-founders"
    },
    {
      "partnershipId": "marriage-baoigheall-unknown-nuadat-103-1--tadg-founder-nuadat",
      "childIds": [
        "nogh-founder-nuadat",
        "treasa-founder-nuadat"
      ],
      "timeJumpId": "gap-dunfal-nuadat-tadg"
    },
    {
      "partnershipId": "marriage-aibhreann-unknown-nuadat-115-0--nogh-founder-nuadat",
      "childIds": [
        "earc-1600-nuadat",
        "keara-1605-nuadat",
        "oran-1608-nuadat"
      ],
      "timeJumpId": "gap-dunfal-nuadat-nogh"
    },
    {
      "partnershipId": "marriage-earc-1600-nuadat--glaodhaich-1606-nessa",
      "childIds": [
        "lugh-1626-nuadat",
        "fionnghuala-nuadat",
        "bran-1634-nuadat"
      ]
    },
    {
      "partnershipId": "marriage-draighean-unknown-nuadat-127-2--oran-1608-nuadat",
      "childIds": [
        "ceana-1630-nuadat"
      ]
    },
    {
      "partnershipId": "marriage-labhaoise-unknown-nuadat-137-0--lugh-1626-nuadat",
      "childIds": [
        "nogh-1644-nuadat",
        "ruadh-nuadat"
      ]
    },
    {
      "partnershipId": "marriage-bran-1634-nuadat--peathra-unknown-nuadat-137-2",
      "childIds": [
        "mebh-1654-nuadat",
        "colm-1656-nuadat"
      ]
    },
    {
      "partnershipId": "marriage-maodnait-1645-cetchathach--nogh-1644-nuadat",
      "childIds": [
        "tadg-1663-nuadat",
        "sharni-1667-nuadat",
        "ultan-1672-nuadat"
      ]
    },
    {
      "partnershipId": "marriage-colm-1656-nuadat--josaidh-unknown-nuadat-147-3",
      "childIds": [
        "tolai-1676-nuadat",
        "quona-1678-nuadat"
      ]
    },
    {
      "partnershipId": "marriage-damhnait-1664-chulainn--tadg-1663-nuadat",
      "childIds": [
        "brodie-1686-nuadat",
        "aideen-nuadat",
        "artan-1694-nuadat",
        "earc-1710-nuadat"
      ]
    },
    {
      "partnershipId": "marriage-blawd-unknown-nuadat-157-3--tolai-1676-nuadat",
      "childIds": [
        "xina-1697-nuadat",
        "oran-1700-nuadat",
        "aodh-1703-nuadat"
      ]
    },
    {
      "partnershipId": "marriage-aigneis-1692-lockart--brodie-1686-nuadat",
      "childIds": [
        "nogh-1717-nuadat",
        "bryenne-1722-nuadat",
        "fola-1728-nuadat"
      ]
    },
    {
      "partnershipId": "marriage-earc-1710-nuadat--hadhbh-1710-casur",
      "childIds": [
        "fiach-1728-nuadat",
        "oira-1734-nuadat"
      ]
    },
    {
      "partnershipId": "marriage-hearn-unknown-nuadat-175-0--xina-1697-nuadat",
      "childIds": [
        "hugh-1723-nuadat",
        "lugh-1725-nuadat"
      ]
    },
    {
      "partnershipId": "affair-thorir-unknown-nuadat-175-1--xina-1697-nuadat",
      "childIds": [
        "voil-1730-nuadat"
      ],
      "legitimacy": "illegitimate"
    },
    {
      "partnershipId": "marriage-aodh-1703-nuadat--maolmhuire-unknown-nuadat-175-2",
      "childIds": [
        "bran-1723-nuadat",
        "duna-1726-nuadat"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-connla-1602-duilb--keara-1605-nuadat",
      "targetFamilyId": "haus-duilb",
      "houseId": "house-duilb"
    },
    {
      "partnershipId": "marriage-haul-fionnghuala",
      "targetFamilyId": "haus-arth",
      "houseId": "house-arth"
    },
    {
      "partnershipId": "marriage-ceana-1630-nuadat--tormodh-1628-riangabra",
      "targetFamilyId": "haus-riangabra",
      "houseId": "house-riangabra"
    },
    {
      "partnershipId": "marriage-balor-seaghdha--ruadh-nuadat",
      "targetFamilyId": "haus-seaghda",
      "houseId": "house-seaghda"
    },
    {
      "partnershipId": "marriage-mebh-1654-nuadat--zareck-1652-casur",
      "targetFamilyId": "haus-casur",
      "houseId": "house-casur"
    },
    {
      "partnershipId": "marriage-donndubhan-1666-diuid--sharni-1667-nuadat",
      "targetFamilyId": "haus-diuid",
      "houseId": "house-diuid"
    },
    {
      "partnershipId": "marriage-treasa-1669-aonghusa--ultan-1672-nuadat",
      "targetFamilyId": "haus-aonghusa",
      "houseId": "house-aonghusa"
    },
    {
      "partnershipId": "marriage-iagan-1675-anbhair--quona-1678-nuadat",
      "targetFamilyId": "haus-anbhair",
      "houseId": "house-anbhair"
    },
    {
      "partnershipId": "marriage-cynddelw-aideen",
      "targetFamilyId": "haus-pysgod",
      "houseId": "house-pysgod"
    }
  ],
  "cadets": [
    {
      "partnershipId": "marriage-haibrhinn-unknown-nuadat-103-0--tolai-founder-nuadat",
      "targetFamilyId": "haus-casur"
    },
    {
      "partnershipId": "marriage-lugh-founder-nuadat--teaganach-unknown-nuadat-103-2",
      "targetFamilyId": "haus-anbhair"
    },
    {
      "partnershipId": "marriage-hurracan-unknown-nuadat-115-1--treasa-founder-nuadat",
      "targetFamilyId": "haus-aonghusa"
    }
  ],
  "wards": [],
  "foster": [],
  "heads": [
    "nuada-founder-nuadat",
    "nogh-unknown-nuadat-91-0",
    "tadg-founder-nuadat",
    "nogh-founder-nuadat",
    "earc-1600-nuadat",
    "lugh-1626-nuadat",
    "nogh-1644-nuadat",
    "tadg-1663-nuadat"
  ],
  "titles": {
    "nuada-founder-nuadat": "Historisches Oberhaupt",
    "nogh-unknown-nuadat-91-0": "Historisches Oberhaupt",
    "tadg-founder-nuadat": "Historisches Oberhaupt",
    "nogh-founder-nuadat": "Historisches Oberhaupt",
    "earc-1600-nuadat": "Historisches Oberhaupt",
    "lugh-1626-nuadat": "Historisches Oberhaupt",
    "nogh-1644-nuadat": "Historisches Oberhaupt",
    "tadg-1663-nuadat": "Mor Tiarna seit 1726",
    "brodie-1686-nuadat": "Dún Tiarna · Erster Erbe",
    "nogh-1717-nuadat": "Erbfolge: 2",
    "artan-1694-nuadat": "Laird"
  },
  "personRoles": {
    "voil-1730-nuadat": "bastard",
    "thorir-unknown-nuadat-175-1": "affair"
  },
  "personExtensions": {},
  "sourceNote": "Drei serielle Überlieferungslücken. Tólaí, Lugh und Treasa begründen Casur, Anbhair und Aonghusa. Voil ist das uneheliche Kind Xinas und Thorirs. Die Partnerüberschriften mit Leerzellen sind anhand der Grafik zugeordnet.",
  "currentHeadId": "tadg-1663-nuadat",
  "heirIds": [
    "brodie-1686-nuadat",
    "nogh-1717-nuadat"
  ],
  "description": "Nic’Nuadat stellt den Mor Tiarna von Tir na Fathach, dem Land der Riesen, mit Sitz in Cradh na Frinne. Die Gründungsüberlieferung erzählt von Nuada, der Tochter eines Druiden-Riesen, und dem Krieger Nógh, dessen Bund mit ihrem Volk den Clan begründete. Naturverbundenheit und die matriarchalische Herkunft prägen sein Selbstverständnis. Aus seiner frühen Linie gingen Casur, Anbhair und Aonghusa hervor. Heute führt Tadg den Clan."
});

export const HOUSE_NUADAT_FAMILY = withAlbenSourcePortraitUpgrade(createDunfalSourceFamily("nuadat", SOURCE));
