import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { createAislearneachSourceFamily } from './aislearneach-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "tameran-founder-ceallaigh",
    "cinnfhlaith-unknown-ceallaigh-91-0",
    "gordan-founder-ceallaigh",
    "clothru-founder-ceallaigh",
    "orlaith-founder-durachd",
    "diarmait-founder-durthacht",
    "tiarnan-1580-ceallaigh",
    "mornainin-1585-ceallaigh",
    "hoiteann-1584-cein",
    "muiredach-1589-fintain",
    "dughall-1602-ceallaigh",
    "gormlaith-1605-ceallaigh",
    "ailpein-1608-ceallaigh",
    "naomhnait-1608-luachra",
    "eagon-1600-durthacht",
    "grainne-1612-torcmhar",
    "tameran-1628-ceallaigh",
    "cinnfhlaith-1630-ceallaigh",
    "jathghal-1630-ceallaigh",
    "tamhas-1639-ceallaigh",
    "aibhilin-1632-ui-faill-duibhne",
    "iainbheag-1627-magach",
    "loinneog-1634-tartarfhuil",
    "ualraig-1650-ceallaigh",
    "sorcha-1654-ceallaigh",
    "clothru-1652-ceallaigh",
    "eanbharr-1655-ceallaigh",
    "niamhasas-1653-stwatchn",
    "lorcanach-1649-luchdon",
    "murchadh-1649-rioga",
    "dairine-1657-fiachiontach",
    "ruairias-1671-ceallaigh",
    "heilbhic-1673-ceallaigh",
    "realtin-1675-ceallaigh",
    "malach-1677-ceallaigh",
    "giollaach-1679-ceallaigh",
    "etainin-1675-ceallaigh",
    "raghnall-1678-ceallaigh",
    "aineinan-1675-morna",
    "padraigas-1669-fiachiontach",
    "maolisa-1675-tartarfhuil",
    "brighdeach-1680-fintain",
    "brianach-1671-morgacht",
    "yvaine-unknown-ceallaigh-163-1",
    "tameran-1694-ceallaigh",
    "clothru-1696-ceallaigh",
    "oslaig-1698-ceallaigh",
    "tiarnan-1700-ceallaigh",
    "muirgel-1699-ceallaigh",
    "gordan-1700-ceallaigh",
    "raonach-1703-ceallaigh",
    "dughall-1705-ceallaigh",
    "brigid-ceallaigh",
    "eimear-ceallaigh",
    "iolani-1698-durthacht",
    "conchobhar-1690-nessa",
    "eireann-1704-tiran-treathai",
    "goll-1704-luachra",
    "marsaili-1703-scathain",
    "aodhagan-1699-morath",
    "griana-unknown-ceallaigh-181-2",
    "dyfan-ciarog",
    "waleran-draenog",
    "onchu-1719-ceallaigh",
    "siorbhanan-1726-ceallaigh",
    "nairn-1726-stwatchn",
    "ualraig-1723-ceallaigh",
    "cinnflaith-1725-ceallaigh",
    "ailpein-1724-ceallaigh",
    "daire-1728-ceallaigh",
    "jathan-1728-nessa",
    "sorcha-1728-ceallaigh",
    "roise-1731-ceallaigh"
  ],
  "partnershipIds": [
    "marriage-cinnfhlaith-unknown-ceallaigh-91-0--tameran-founder-ceallaigh",
    "marriage-gordan-founder-ceallaigh--orlaith-founder-durachd",
    "marriage-clothru-founder-ceallaigh--diarmait-founder-durthacht",
    "marriage-hoiteann-1584-cein--tiarnan-1580-ceallaigh",
    "marriage-mornainin-1585-ceallaigh--muiredach-1589-fintain",
    "marriage-dughall-1602-ceallaigh--naomhnait-1608-luachra",
    "marriage-eagon-1600-durthacht--gormlaith-1605-ceallaigh",
    "marriage-ailpein-1608-ceallaigh--grainne-1612-torcmhar",
    "marriage-aibhilin-1632-ui-faill-duibhne--tameran-1628-ceallaigh",
    "marriage-cinnfhlaith-1630-ceallaigh--iainbheag-1627-magach",
    "marriage-jathghal-1630-ceallaigh--loinneog-1634-tartarfhuil",
    "marriage-niamhasas-1653-stwatchn--ualraig-1650-ceallaigh",
    "marriage-lorcanach-1649-luchdon--sorcha-1654-ceallaigh",
    "marriage-clothru-1652-ceallaigh--murchadh-1649-rioga",
    "marriage-dairine-1657-fiachiontach--eanbharr-1655-ceallaigh",
    "marriage-aineinan-1675-morna--ruairias-1671-ceallaigh",
    "marriage-heilbhic-1673-ceallaigh--padraigas-1669-fiachiontach",
    "marriage-maolisa-1675-tartarfhuil--realtin-1675-ceallaigh",
    "marriage-brighdeach-1680-fintain--giollaach-1679-ceallaigh",
    "marriage-brianach-1671-morgacht--etainin-1675-ceallaigh",
    "marriage-raghnall-1678-ceallaigh--yvaine-unknown-ceallaigh-163-1",
    "marriage-iolani-1698-durthacht--tameran-1694-ceallaigh",
    "marriage-clothru-1696-ceallaigh--conchobhar-1690-nessa",
    "marriage-eireann-1704-tiran-treathai--tiarnan-1700-ceallaigh",
    "marriage-goll-1704-luachra--muirgel-1699-ceallaigh",
    "marriage-gordan-1700-ceallaigh--marsaili-1703-scathain",
    "marriage-aodhagan-1699-morath--raonach-1703-ceallaigh",
    "marriage-dughall-1705-ceallaigh--griana-unknown-ceallaigh-181-2",
    "marriage-dyfan-brigid-ciarog",
    "marriage-waleran-eimear-draenog"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-cinnfhlaith-unknown-ceallaigh-91-0--tameran-founder-ceallaigh",
      "childIds": [
        "gordan-founder-ceallaigh",
        "clothru-founder-ceallaigh"
      ],
      "timeJumpId": "gap-aislearneach-ceallaigh-founders"
    },
    {
      "partnershipId": "marriage-gordan-founder-ceallaigh--orlaith-founder-durachd",
      "childIds": [
        "tiarnan-1580-ceallaigh",
        "mornainin-1585-ceallaigh"
      ],
      "timeJumpId": "gap-aislearneach-ceallaigh-gordan"
    },
    {
      "partnershipId": "marriage-hoiteann-1584-cein--tiarnan-1580-ceallaigh",
      "childIds": [
        "dughall-1602-ceallaigh",
        "gormlaith-1605-ceallaigh",
        "ailpein-1608-ceallaigh"
      ]
    },
    {
      "partnershipId": "marriage-dughall-1602-ceallaigh--naomhnait-1608-luachra",
      "childIds": [
        "tameran-1628-ceallaigh",
        "cinnfhlaith-1630-ceallaigh"
      ]
    },
    {
      "partnershipId": "marriage-ailpein-1608-ceallaigh--grainne-1612-torcmhar",
      "childIds": [
        "jathghal-1630-ceallaigh",
        "tamhas-1639-ceallaigh"
      ]
    },
    {
      "partnershipId": "marriage-aibhilin-1632-ui-faill-duibhne--tameran-1628-ceallaigh",
      "childIds": [
        "ualraig-1650-ceallaigh",
        "sorcha-1654-ceallaigh"
      ]
    },
    {
      "partnershipId": "marriage-jathghal-1630-ceallaigh--loinneog-1634-tartarfhuil",
      "childIds": [
        "clothru-1652-ceallaigh",
        "eanbharr-1655-ceallaigh"
      ]
    },
    {
      "partnershipId": "marriage-niamhasas-1653-stwatchn--ualraig-1650-ceallaigh",
      "childIds": [
        "ruairias-1671-ceallaigh",
        "heilbhic-1673-ceallaigh",
        "realtin-1675-ceallaigh",
        "malach-1677-ceallaigh",
        "giollaach-1679-ceallaigh"
      ]
    },
    {
      "partnershipId": "marriage-dairine-1657-fiachiontach--eanbharr-1655-ceallaigh",
      "childIds": [
        "etainin-1675-ceallaigh",
        "raghnall-1678-ceallaigh"
      ]
    },
    {
      "partnershipId": "marriage-aineinan-1675-morna--ruairias-1671-ceallaigh",
      "childIds": [
        "tameran-1694-ceallaigh",
        "clothru-1696-ceallaigh",
        "oslaig-1698-ceallaigh",
        "tiarnan-1700-ceallaigh"
      ]
    },
    {
      "partnershipId": "marriage-maolisa-1675-tartarfhuil--realtin-1675-ceallaigh",
      "childIds": [
        "muirgel-1699-ceallaigh"
      ]
    },
    {
      "partnershipId": "marriage-brighdeach-1680-fintain--giollaach-1679-ceallaigh",
      "childIds": [
        "gordan-1700-ceallaigh",
        "raonach-1703-ceallaigh",
        "dughall-1705-ceallaigh"
      ]
    },
    {
      "partnershipId": "marriage-raghnall-1678-ceallaigh--yvaine-unknown-ceallaigh-163-1",
      "childIds": [
        "brigid-ceallaigh",
        "eimear-ceallaigh"
      ]
    },
    {
      "partnershipId": "marriage-iolani-1698-durthacht--tameran-1694-ceallaigh",
      "childIds": [
        "onchu-1719-ceallaigh",
        "siorbhanan-1726-ceallaigh"
      ]
    },
    {
      "partnershipId": "marriage-eireann-1704-tiran-treathai--tiarnan-1700-ceallaigh",
      "childIds": [
        "ualraig-1723-ceallaigh",
        "cinnflaith-1725-ceallaigh"
      ]
    },
    {
      "partnershipId": "marriage-gordan-1700-ceallaigh--marsaili-1703-scathain",
      "childIds": [
        "ailpein-1724-ceallaigh",
        "daire-1728-ceallaigh"
      ]
    },
    {
      "partnershipId": "marriage-dughall-1705-ceallaigh--griana-unknown-ceallaigh-181-2",
      "childIds": [
        "sorcha-1728-ceallaigh",
        "roise-1731-ceallaigh"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-clothru-founder-ceallaigh--diarmait-founder-durthacht",
      "targetFamilyId": "haus-durthacht",
      "houseId": "house-durthacht"
    },
    {
      "partnershipId": "marriage-mornainin-1585-ceallaigh--muiredach-1589-fintain",
      "targetFamilyId": "haus-fintain",
      "houseId": "house-fintain"
    },
    {
      "partnershipId": "marriage-eagon-1600-durthacht--gormlaith-1605-ceallaigh",
      "targetFamilyId": "haus-durthacht",
      "houseId": "house-durthacht"
    },
    {
      "partnershipId": "marriage-cinnfhlaith-1630-ceallaigh--iainbheag-1627-magach",
      "targetFamilyId": "haus-magach",
      "houseId": "house-magach"
    },
    {
      "partnershipId": "marriage-lorcanach-1649-luchdon--sorcha-1654-ceallaigh",
      "targetFamilyId": "haus-luchdon",
      "houseId": "house-luchdon"
    },
    {
      "partnershipId": "marriage-clothru-1652-ceallaigh--murchadh-1649-rioga",
      "targetFamilyId": "haus-rioga",
      "houseId": "house-rioga"
    },
    {
      "partnershipId": "marriage-heilbhic-1673-ceallaigh--padraigas-1669-fiachiontach",
      "targetFamilyId": "haus-fiachiontach",
      "houseId": "house-fiachiontach"
    },
    {
      "partnershipId": "marriage-brianach-1671-morgacht--etainin-1675-ceallaigh",
      "targetFamilyId": "haus-morgacht",
      "houseId": "house-morgacht"
    },
    {
      "partnershipId": "marriage-clothru-1696-ceallaigh--conchobhar-1690-nessa",
      "targetFamilyId": "haus-nessa",
      "houseId": "house-nessa"
    },
    {
      "partnershipId": "marriage-goll-1704-luachra--muirgel-1699-ceallaigh",
      "targetFamilyId": "haus-luachra",
      "houseId": "house-luachra"
    },
    {
      "partnershipId": "marriage-aodhagan-1699-morath--raonach-1703-ceallaigh",
      "targetFamilyId": "haus-morath",
      "houseId": "house-morath"
    },
    {
      "partnershipId": "marriage-dyfan-brigid-ciarog",
      "targetFamilyId": "haus-ciarog",
      "houseId": "house-ciarog"
    },
    {
      "partnershipId": "marriage-waleran-eimear-draenog",
      "targetFamilyId": "haus-draenog",
      "houseId": "house-draenog"
    }
  ],
  "cadets": [],
  "wards": [
    {
      "personId": "cinnflaith-1725-ceallaigh",
      "targetFamilyId": "haus-luchdon",
      "houseId": "house-luchdon",
      "notes": "Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt."
    }
  ],
  "foster": [
    {
      "childId": "nairn-1726-stwatchn",
      "parentId": "tameran-1694-ceallaigh"
    },
    {
      "childId": "jathan-1728-nessa",
      "parentId": "gordan-1700-ceallaigh"
    }
  ],
  "heads": [
    "tameran-founder-ceallaigh",
    "gordan-founder-ceallaigh",
    "tiarnan-1580-ceallaigh",
    "dughall-1602-ceallaigh",
    "tameran-1628-ceallaigh",
    "tamhas-1639-ceallaigh",
    "ualraig-1650-ceallaigh",
    "ruairias-1671-ceallaigh"
  ],
  "titles": {
    "tameran-founder-ceallaigh": "Historisches Oberhaupt",
    "gordan-founder-ceallaigh": "Historisches Oberhaupt",
    "tiarnan-1580-ceallaigh": "Historisches Oberhaupt",
    "dughall-1602-ceallaigh": "Historisches Oberhaupt",
    "tameran-1628-ceallaigh": "Historisches Oberhaupt",
    "tamhas-1639-ceallaigh": "Fianna · früheres Oberhaupt",
    "ualraig-1650-ceallaigh": "Historisches Oberhaupt",
    "ruairias-1671-ceallaigh": "Mor Tiarna von Tir na Iomaire",
    "realtin-1675-ceallaigh": "Erbfolge: 1",
    "malach-1677-ceallaigh": "Erbfolge: 2",
    "giollaach-1679-ceallaigh": "Erbfolge: 3",
    "raghnall-1678-ceallaigh": "Erbfolge: 4",
    "tameran-1694-ceallaigh": "Erbfolge: 5"
  },
  "personRoles": {
    "nairn-1726-stwatchn": "ward",
    "jathan-1728-nessa": "ward"
  },
  "personExtensions": {},
  "sourceNote": "Zwei Überlieferungslücken. Nairn Stwatchn und Jathán Nessa sind aufgenommene Mündel. Cinnflaith wird nach Luchdon vermittelt. Herrschaftsnachfolge folgt der Amtsliste einschließlich Tàmhas; keine automatische Primogenitur.",
  "currentHeadId": "ruairias-1671-ceallaigh",
  "heirIds": [
    "realtin-1675-ceallaigh",
    "malach-1677-ceallaigh",
    "giollaach-1679-ceallaigh",
    "raghnall-1678-ceallaigh",
    "tameran-1694-ceallaigh"
  ],
  "description": "Tir An’Ceallaigh regiert das Land der Furchen von Koldair aus. Der Clan führt seinen Ursprung auf den gerechten Bauern Tameran zurück und verbindet Landwirtschaft mit Bildung und der Verehrung Ornis. Gòrdans Reformen und die Universität von Koldair machten Wissen zu einem Grundpfeiler seiner Herrschaft. Heute steht Ruairias an der Spitze; erwachsene Familienmitglieder wählen das Oberhaupt aus den mindestens vierzigjährigen Angehörigen."
});

export const HOUSE_CEALLAIGH_FAMILY = withAlbenSourcePortraitUpgrade(createAislearneachSourceFamily("ceallaigh", SOURCE));
