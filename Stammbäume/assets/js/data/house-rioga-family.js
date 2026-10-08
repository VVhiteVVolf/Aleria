import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { createAislearneachSourceFamily } from './aislearneach-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "macthar-founder-rioga",
    "aisling-unknown-rioga-88-0",
    "immram-1602-rioga",
    "koarnach-rioga",
    "eibhlin-rioga",
    "macthar-rioga",
    "lasairfhiona-1608-luchdon",
    "aodhagan-frisealach",
    "mordred-ciarog",
    "nansaidh-1612-mochoe",
    "aisling-1626-rioga",
    "fergus-1626-rioga",
    "cormac-1631-rioga",
    "mathuin-1627-coronach",
    "aoife-1630-morgacht",
    "yngvild-unknown-rioga-110-2",
    "murchadh-1649-rioga",
    "jibheann-1655-rioga",
    "haodh-1653-rioga",
    "flaithri-1655-rioga",
    "clothru-1652-ceallaigh",
    "broccan-1652-durthacht",
    "fionaas-1655-fiachiontach",
    "iainbheag-1651-farraigeach",
    "macthar-1670-rioga",
    "dearbhla-1676-rioga",
    "immram-1673-rioga",
    "tuala-rioga",
    "sadhbhach-1675-tartarfhuil",
    "fearghal-1673-morna",
    "aslaug-unknown-rioga-130-2",
    "kermena-unknown-rioga-130-3",
    "domnall-cwingod",
    "gadhra-1693-rioga",
    "eilis-1704-rioga",
    "hascan-1704-rioga",
    "fergus-1695-rioga",
    "bochna-1701-rioga",
    "sverre-1733-rioga",
    "yluach-1698-gaisgh",
    "noghan-1700-casur",
    "venora-unknown-rioga-144-2",
    "dubessa-unknown-rioga-144-3",
    "macin-1718-rioga",
    "eilis-1723-rioga",
    "tormodh-1724-rioga",
    "aisling-1730-rioga",
    "mughna-1724-cumhail",
    "haodh-1724-rioga",
    "jorna-1728-rioga",
    "keebh-1732-rioga"
  ],
  "partnershipIds": [
    "marriage-aisling-unknown-rioga-88-0--macthar-founder-rioga",
    "marriage-immram-1602-rioga--lasairfhiona-1608-luchdon",
    "marriage-aodhagan-koarnach",
    "marriage-mordred-eibhlin-ciarog",
    "marriage-macthar-rioga--nansaidh-1612-mochoe",
    "marriage-aisling-1626-rioga--mathuin-1627-coronach",
    "marriage-aoife-1630-morgacht--fergus-1626-rioga",
    "marriage-cormac-1631-rioga--yngvild-unknown-rioga-110-2",
    "marriage-clothru-1652-ceallaigh--murchadh-1649-rioga",
    "marriage-broccan-1652-durthacht--jibheann-1655-rioga",
    "marriage-fionaas-1655-fiachiontach--haodh-1653-rioga",
    "marriage-flaithri-1655-rioga--iainbheag-1651-farraigeach",
    "marriage-macthar-1670-rioga--sadhbhach-1675-tartarfhuil",
    "marriage-dearbhla-1676-rioga--fearghal-1673-morna",
    "affair-aslaug-unknown-rioga-130-2--immram-1673-rioga",
    "marriage-immram-1673-rioga--kermena-unknown-rioga-130-3",
    "marriage-domnall-tuala-cwingod",
    "marriage-gadhra-1693-rioga--yluach-1698-gaisgh",
    "marriage-eilis-1704-rioga--noghan-1700-casur",
    "marriage-hascan-1704-rioga--venora-unknown-rioga-144-2",
    "marriage-bochna-1701-rioga--dubessa-unknown-rioga-144-3"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-aisling-unknown-rioga-88-0--macthar-founder-rioga",
      "childIds": [
        "immram-1602-rioga",
        "koarnach-rioga",
        "eibhlin-rioga",
        "macthar-rioga"
      ],
      "timeJumpId": "gap-aislearneach-rioga-founders"
    },
    {
      "partnershipId": "marriage-immram-1602-rioga--lasairfhiona-1608-luchdon",
      "childIds": [
        "aisling-1626-rioga",
        "fergus-1626-rioga"
      ]
    },
    {
      "partnershipId": "marriage-macthar-rioga--nansaidh-1612-mochoe",
      "childIds": [
        "cormac-1631-rioga"
      ]
    },
    {
      "partnershipId": "marriage-aoife-1630-morgacht--fergus-1626-rioga",
      "childIds": [
        "murchadh-1649-rioga",
        "jibheann-1655-rioga"
      ]
    },
    {
      "partnershipId": "marriage-cormac-1631-rioga--yngvild-unknown-rioga-110-2",
      "childIds": [
        "haodh-1653-rioga",
        "flaithri-1655-rioga"
      ]
    },
    {
      "partnershipId": "marriage-clothru-1652-ceallaigh--murchadh-1649-rioga",
      "childIds": [
        "macthar-1670-rioga",
        "dearbhla-1676-rioga"
      ]
    },
    {
      "partnershipId": "marriage-fionaas-1655-fiachiontach--haodh-1653-rioga",
      "childIds": [
        "immram-1673-rioga",
        "tuala-rioga"
      ]
    },
    {
      "partnershipId": "marriage-macthar-1670-rioga--sadhbhach-1675-tartarfhuil",
      "childIds": [
        "gadhra-1693-rioga",
        "eilis-1704-rioga",
        "hascan-1704-rioga"
      ]
    },
    {
      "partnershipId": "affair-aslaug-unknown-rioga-130-2--immram-1673-rioga",
      "childIds": [
        "sverre-1733-rioga"
      ],
      "legitimacy": "illegitimate"
    },
    {
      "partnershipId": "marriage-immram-1673-rioga--kermena-unknown-rioga-130-3",
      "childIds": [
        "fergus-1695-rioga",
        "bochna-1701-rioga"
      ]
    },
    {
      "partnershipId": "marriage-gadhra-1693-rioga--yluach-1698-gaisgh",
      "childIds": [
        "macin-1718-rioga",
        "eilis-1723-rioga"
      ]
    },
    {
      "partnershipId": "marriage-hascan-1704-rioga--venora-unknown-rioga-144-2",
      "childIds": [
        "tormodh-1724-rioga",
        "aisling-1730-rioga"
      ]
    },
    {
      "partnershipId": "marriage-bochna-1701-rioga--dubessa-unknown-rioga-144-3",
      "childIds": [
        "haodh-1724-rioga",
        "jorna-1728-rioga",
        "keebh-1732-rioga"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-aodhagan-koarnach",
      "targetFamilyId": "haus-frisealach",
      "houseId": "house-frisealach"
    },
    {
      "partnershipId": "marriage-mordred-eibhlin-ciarog",
      "targetFamilyId": "haus-ciarog",
      "houseId": "house-ciarog"
    },
    {
      "partnershipId": "marriage-aisling-1626-rioga--mathuin-1627-coronach",
      "targetFamilyId": "haus-coronach",
      "houseId": "house-coronach"
    },
    {
      "partnershipId": "marriage-broccan-1652-durthacht--jibheann-1655-rioga",
      "targetFamilyId": "haus-durthacht",
      "houseId": "house-durthacht"
    },
    {
      "partnershipId": "marriage-flaithri-1655-rioga--iainbheag-1651-farraigeach",
      "targetFamilyId": "haus-farraigeach",
      "houseId": "house-farraigeach"
    },
    {
      "partnershipId": "marriage-dearbhla-1676-rioga--fearghal-1673-morna",
      "targetFamilyId": "haus-morna",
      "houseId": "house-morna"
    },
    {
      "partnershipId": "marriage-domnall-tuala-cwingod",
      "targetFamilyId": "haus-cwningod",
      "houseId": "house-cwningod"
    },
    {
      "partnershipId": "marriage-eilis-1704-rioga--noghan-1700-casur",
      "targetFamilyId": "haus-casur",
      "houseId": "house-casur"
    }
  ],
  "cadets": [],
  "wards": [
    {
      "personId": "jorna-1728-rioga",
      "targetFamilyId": "haus-muirin",
      "houseId": "house-muirin",
      "notes": "Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt."
    }
  ],
  "foster": [
    {
      "childId": "mughna-1724-cumhail",
      "parentId": "hascan-1704-rioga"
    }
  ],
  "heads": [
    "macthar-founder-rioga",
    "immram-1602-rioga",
    "fergus-1626-rioga",
    "murchadh-1649-rioga",
    "macthar-1670-rioga"
  ],
  "titles": {
    "macthar-founder-rioga": "Historisches Oberhaupt",
    "immram-1602-rioga": "Historisches Oberhaupt",
    "fergus-1626-rioga": "Historisches Oberhaupt",
    "murchadh-1649-rioga": "Historisches Oberhaupt",
    "macthar-1670-rioga": "Laird von Gaelan"
  },
  "personRoles": {
    "sverre-1733-rioga": "bastard",
    "aslaug-unknown-rioga-130-2": "affair",
    "mughna-1724-cumhail": "ward"
  },
  "personExtensions": {},
  "sourceNote": "Eine Überlieferungslücke. Immrams verstorbene Frau Kermena und die spätere Affäre Aslaug sind getrennte Partnerschaften. Mughna Cumhaill ist Háscans Mündel; Jórna ist nach Muirin vermittelt.",
  "currentHeadId": "macthar-1670-rioga",
  "heirIds": [],
  "description": "An’Rioga ist ein in Gaelan ansässiges Laird-Haus Aislearneachs. Seine überlieferte Linie beginnt mit Macthar und führt über Immram, Fergus und Murchadh zum heutigen Oberhaupt Macthar. Die Erbfolge richtet sich nach dem erstgeborenen Kind unabhängig vom Geschlecht. Mughna Cumhaill wächst als Mündel im Haushalt Háscans auf; Jórna wurde zur Pflege nach Muirin gegeben."
});

export const HOUSE_RIOGA_FAMILY = withAlbenSourcePortraitUpgrade(createAislearneachSourceFamily("rioga", SOURCE));
