import { createFaelaornSourceFamily } from './faelaorn-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "dallan-founder-urquhart",
    "eabha-unknown-urquhart-142-1",
    "aodhan-founder-bhaird",
    "aisling-founder-bhaird",
    "treasain-founder-trigithan",
    "fuirseach-founder-ffearnach",
    "dallan-1555-bhaird",
    "una-1560-bhaird",
    "lassarina-1559-teudorga",
    "donndubhan-1558-drummond",
    "cliona-1580-bhaird",
    "turlough-1580-bhaird",
    "eabha-1585-bhaird",
    "faelchu-1578-muiredaigh",
    "aibell-1580-ceolmhior",
    "skjomi-1581-soekeren",
    "aodhan-1598-bhaird",
    "heulyn-1605-bhaird",
    "ciarait-1600-gaoithe",
    "carolan-1600-urquhart",
    "seaghdha-bhaird",
    "allanah-1625-bhaird",
    "dallan-1627-bhaird",
    "ailionora-bhaird",
    "dugald-1631-bhaird",
    "eirwenna-ceirwyn",
    "dietbold-1620-ridderspore",
    "lodvar-skald",
    "doireann-1634-morath",
    "hamish-1648-bhaird",
    "maille-1650-bhaird",
    "artair-1654-bhaird",
    "wihalg-bhaird",
    "turlough-1660-bhaird",
    "julbhach-1648-erskine",
    "hurracan-1649-culloch",
    "liadan-1660-luthsach",
    "tarlachan-amrhan",
    "thiodhild-1662-soekeren",
    "turlough-1666-bhaird",
    "fenella-bhaird",
    "ramsay-1674-bhaird",
    "carolan-1678-bhaird",
    "brigid-bhaird",
    "muirgel-1671-muiredaigh",
    "edwyn-ceirwyn",
    "wendeburg-1678-ridderspore",
    "iolanthe-1680-bhodhrain",
    "skjomi-soekeren",
    "aodhan-1694-bhaird",
    "enya-1697-bhaird",
    "seamus-1700-bhaird",
    "mhor-1705-an-bhaird",
    "dugald-1700-bhaird",
    "loreena-1703-bhaird",
    "ciarag-1705-bhaird",
    "brigid-1700-urquhart",
    "tomaltach-1696-dundas",
    "caralyn-1702-luthsach",
    "muiris-1698-morath",
    "lughna-unknown-bhaird-180-0",
    "hildrun-unknown-bhaird-180-1",
    "dallan-1718-bhaird",
    "clara-1722-bhaird",
    "seaghdha-1724-bhaird",
    "eabha-1722-bhaird",
    "oisin-1726-bhaird",
    "ruarc-1727-bhaird",
    "wyla-1731-bhaird",
    "ansgar-1730-bhaird",
    "anselma-1735-bhaird",
    "sorleyan-1720-ceolmhior"
  ],
  "partnershipIds": [
    "marriage-dallan-founder-urquhart--eabha-unknown-urquhart-142-1",
    "marriage-aodhan-founder-bhaird--treasain-founder-trigithan",
    "marriage-aisling-founder-bhaird--fuirseach-founder-ffearnach",
    "marriage-dallan-1555-bhaird--lassarina-1559-teudorga",
    "marriage-donndubhan-1558-drummond--una-1560-bhaird",
    "marriage-cliona-1580-bhaird--faelchu-1578-muiredaigh",
    "marriage-aibell-1580-ceolmhior--turlough-1580-bhaird",
    "marriage-eabha-1585-bhaird--skjomi-1581-soekeren",
    "marriage-aodhan-1598-bhaird--ciarait-1600-gaoithe",
    "marriage-carolan-1600-urquhart--heulyn-1605-bhaird",
    "marriage-eirwenna-seaghdha-ceirwyn",
    "marriage-allanah-1625-bhaird--dietbold-1620-ridderspore",
    "marriage-lodvar-ailionora-skald",
    "marriage-doireann-1634-morath--dugald-1631-bhaird",
    "marriage-hamish-1648-bhaird--julbhach-1648-erskine",
    "marriage-hurracan-1649-culloch--maille-1650-bhaird",
    "marriage-artair-1654-bhaird--liadan-1660-luthsach",
    "marriage-tarlachan-wihalg-amrhan",
    "marriage-thiodhild-1662-soekeren--turlough-1660-bhaird",
    "marriage-muirgel-1671-muiredaigh--turlough-1666-bhaird",
    "marriage-edwyn-fenella-ceirwyn",
    "marriage-ramsay-1674-bhaird--wendeburg-1678-ridderspore",
    "marriage-carolan-1678-bhaird--iolanthe-1680-bhodhrain",
    "marriage-skjomi-brigid-soekeren",
    "marriage-aodhan-1694-bhaird--brigid-1700-urquhart",
    "marriage-enya-1697-bhaird--tomaltach-1696-dundas",
    "marriage-caralyn-1702-luthsach--seamus-1700-bhaird",
    "marriage-mhor-1705-an-bhaird--muiris-1698-morath",
    "marriage-ciarag-1705-bhaird--lughna-unknown-bhaird-180-0",
    "affair-ciarag-1705-bhaird--hildrun-unknown-bhaird-180-1",
    "engagement-eabha-1722-bhaird--sorleyan-1720-ceolmhior"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-dallan-founder-urquhart--eabha-unknown-urquhart-142-1",
      "childIds": [
        "aodhan-founder-bhaird",
        "aisling-founder-bhaird"
      ],
      "timeJumpId": "gap-faelaorn-bhaird-founders"
    },
    {
      "partnershipId": "marriage-aodhan-founder-bhaird--treasain-founder-trigithan",
      "childIds": [
        "dallan-1555-bhaird",
        "una-1560-bhaird"
      ],
      "timeJumpId": "gap-faelaorn-bhaird-aodhan"
    },
    {
      "partnershipId": "marriage-dallan-1555-bhaird--lassarina-1559-teudorga",
      "childIds": [
        "cliona-1580-bhaird",
        "turlough-1580-bhaird",
        "eabha-1585-bhaird"
      ]
    },
    {
      "partnershipId": "marriage-aibell-1580-ceolmhior--turlough-1580-bhaird",
      "childIds": [
        "aodhan-1598-bhaird",
        "heulyn-1605-bhaird"
      ]
    },
    {
      "partnershipId": "marriage-aodhan-1598-bhaird--ciarait-1600-gaoithe",
      "childIds": [
        "seaghdha-bhaird",
        "allanah-1625-bhaird",
        "dallan-1627-bhaird",
        "ailionora-bhaird",
        "dugald-1631-bhaird"
      ]
    },
    {
      "partnershipId": "marriage-eirwenna-seaghdha-ceirwyn",
      "childIds": [
        "hamish-1648-bhaird",
        "maille-1650-bhaird",
        "artair-1654-bhaird"
      ]
    },
    {
      "partnershipId": "marriage-doireann-1634-morath--dugald-1631-bhaird",
      "childIds": [
        "wihalg-bhaird",
        "turlough-1660-bhaird"
      ]
    },
    {
      "partnershipId": "marriage-hamish-1648-bhaird--julbhach-1648-erskine",
      "childIds": [
        "turlough-1666-bhaird",
        "fenella-bhaird",
        "ramsay-1674-bhaird"
      ]
    },
    {
      "partnershipId": "marriage-thiodhild-1662-soekeren--turlough-1660-bhaird",
      "childIds": [
        "carolan-1678-bhaird",
        "brigid-bhaird"
      ]
    },
    {
      "partnershipId": "marriage-muirgel-1671-muiredaigh--turlough-1666-bhaird",
      "childIds": [
        "aodhan-1694-bhaird",
        "enya-1697-bhaird"
      ]
    },
    {
      "partnershipId": "marriage-ramsay-1674-bhaird--wendeburg-1678-ridderspore",
      "childIds": [
        "seamus-1700-bhaird",
        "mhor-1705-an-bhaird"
      ]
    },
    {
      "partnershipId": "marriage-carolan-1678-bhaird--iolanthe-1680-bhodhrain",
      "childIds": [
        "dugald-1700-bhaird",
        "loreena-1703-bhaird",
        "ciarag-1705-bhaird"
      ]
    },
    {
      "partnershipId": "marriage-aodhan-1694-bhaird--brigid-1700-urquhart",
      "childIds": [
        "dallan-1718-bhaird",
        "clara-1722-bhaird",
        "seaghdha-1724-bhaird"
      ]
    },
    {
      "partnershipId": "marriage-caralyn-1702-luthsach--seamus-1700-bhaird",
      "childIds": [
        "eabha-1722-bhaird",
        "oisin-1726-bhaird"
      ]
    },
    {
      "partnershipId": "marriage-ciarag-1705-bhaird--lughna-unknown-bhaird-180-0",
      "childIds": [
        "ruarc-1727-bhaird",
        "wyla-1731-bhaird"
      ]
    },
    {
      "partnershipId": "affair-ciarag-1705-bhaird--hildrun-unknown-bhaird-180-1",
      "childIds": [
        "ansgar-1730-bhaird",
        "anselma-1735-bhaird"
      ],
      "legitimacy": "illegitimate"
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-aisling-founder-bhaird--fuirseach-founder-ffearnach",
      "targetFamilyId": "haus-ffearnach",
      "houseId": "house-ffearnach"
    },
    {
      "partnershipId": "marriage-donndubhan-1558-drummond--una-1560-bhaird",
      "targetFamilyId": "haus-drummond",
      "houseId": "house-drummond"
    },
    {
      "partnershipId": "marriage-cliona-1580-bhaird--faelchu-1578-muiredaigh",
      "targetFamilyId": "haus-muiredaigh",
      "houseId": "house-muiredaigh"
    },
    {
      "partnershipId": "marriage-eabha-1585-bhaird--skjomi-1581-soekeren",
      "targetFamilyId": "haus-soekeren",
      "houseId": "house-soekeren"
    },
    {
      "partnershipId": "marriage-carolan-1600-urquhart--heulyn-1605-bhaird",
      "targetFamilyId": "haus-urquhart",
      "houseId": "house-urquhart"
    },
    {
      "partnershipId": "marriage-allanah-1625-bhaird--dietbold-1620-ridderspore",
      "targetFamilyId": "haus-ridderspore",
      "houseId": "house-ridderspore"
    },
    {
      "partnershipId": "marriage-lodvar-ailionora-skald",
      "targetFamilyId": "haus-skald",
      "houseId": "house-skald"
    },
    {
      "partnershipId": "marriage-hurracan-1649-culloch--maille-1650-bhaird",
      "targetFamilyId": "haus-culloch",
      "houseId": "house-culloch"
    },
    {
      "partnershipId": "marriage-artair-1654-bhaird--liadan-1660-luthsach",
      "targetFamilyId": "haus-luthsach",
      "houseId": "house-luthsach"
    },
    {
      "partnershipId": "marriage-tarlachan-wihalg-amrhan",
      "targetFamilyId": "haus-amrhan",
      "houseId": "house-amrhan"
    },
    {
      "partnershipId": "marriage-edwyn-fenella-ceirwyn",
      "targetFamilyId": "haus-ceirwyn",
      "houseId": "house-ceirwyn"
    },
    {
      "partnershipId": "marriage-skjomi-brigid-soekeren",
      "targetFamilyId": "haus-soekeren",
      "houseId": "house-soekeren"
    },
    {
      "partnershipId": "marriage-enya-1697-bhaird--tomaltach-1696-dundas",
      "targetFamilyId": "haus-dundas",
      "houseId": "house-dundas"
    },
    {
      "partnershipId": "marriage-mhor-1705-an-bhaird--muiris-1698-morath",
      "targetFamilyId": "haus-morath",
      "houseId": "house-morath"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [],
  "heads": [
    "dallan-founder-urquhart",
    "aodhan-founder-bhaird",
    "dallan-1555-bhaird",
    "turlough-1580-bhaird",
    "hamish-1648-bhaird"
  ],
  "titles": {
    "dallan-founder-urquhart": "Historisches Oberhaupt",
    "aodhan-founder-bhaird": "Historisches Oberhaupt",
    "dallan-1555-bhaird": "Historisches Oberhaupt",
    "turlough-1580-bhaird": "Historisches Oberhaupt",
    "hamish-1648-bhaird": "Laird · Oberhaupt seit 1704",
    "turlough-1666-bhaird": "Erbfolge: 1",
    "aodhan-1694-bhaird": "Erbfolge: 2",
    "dallan-1718-bhaird": "Erbfolge: 3",
    "seaghdha-1724-bhaird": "Erbfolge: 4"
  },
  "personRoles": {
    "ansgar-1730-bhaird": "bastard",
    "anselma-1735-bhaird": "bastard",
    "hildrun-unknown-bhaird-180-1": "affair"
  },
  "personExtensions": {
    "ciarag-1705-bhaird": {
      "chartCenterBetweenPartnerPersonIds": [
        "lughna-unknown-bhaird-180-0",
        "hildrun-unknown-bhaird-180-1"
      ],
      "chartPartnerGroupPersonOrder": [
        "lughna-unknown-bhaird-180-0",
        "ciarag-1705-bhaird",
        "hildrun-unknown-bhaird-180-1"
      ],
      "chartKeepPartnerGroupTogether": true
    }
  },
  "sourceNote": "Zwei serielle Überlieferungslücken. Ciarags Ehe mit Lughna und seine Affäre mit Hildrun haben getrennte Kindergruppen. Ansgar und Anselma sind ausdrücklich Bastarde. Eabha und Sorleyan Ceolmhíor sind verlobt. Ó Bhaird ist nicht An’Bhaird aus Ceitheach.",
  "currentHeadId": "hamish-1648-bhaird",
  "heirIds": [
    "turlough-1666-bhaird",
    "aodhan-1694-bhaird",
    "dallan-1718-bhaird",
    "seaghdha-1724-bhaird"
  ],
  "description": "Ó Bhaird ist die auf Dallán Urquhart zurückgehende Kriegsbardenlinie aus Piobarach. Ihre Mitglieder verbinden Musik und Waffenkunst; sie fertigen Instrumente und tragen das kulturelle Erbe der Urquhart auf das Schlachtfeld. Hamish ist seit 1704 Oberhaupt. Die Linie bleibt von An’Bhaird aus Ceitheach getrennt. Trotz Krieg und Teilbesetzung folgt ihre Einordnung dem alten Lehensverband Faelaorns.",
  "partnershipExtensions": {
    "marriage-ciarag-1705-bhaird--lughna-unknown-bhaird-180-0": {
      "chartAlignPartnerOverChildrenPersonId": "lughna-unknown-bhaird-180-0"
    },
    "affair-ciarag-1705-bhaird--hildrun-unknown-bhaird-180-1": {
      "chartAlignPartnerOverChildrenPersonId": "hildrun-unknown-bhaird-180-1"
    },
    "marriage-thiodhild-1662-soekeren--turlough-1660-bhaird": {
      "chartAlignParentPairOverChildPersonId": "carolan-1678-bhaird",
      "chartPackLeafSiblingBranchesBesideAlignedChild": true
    }
  }
});

export const HOUSE_BHAIRD_FAMILY = createFaelaornSourceFamily("bhaird", SOURCE);
