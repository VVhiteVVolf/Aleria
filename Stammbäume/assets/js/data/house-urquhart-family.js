import { createFaelaornSourceFamily } from './faelaorn-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "amergin-founder-urquhart",
    "fionnghuala-founder-tuathanach",
    "dermod-urquhart",
    "brigid-founder-urquhart",
    "faoiltiama-cumhail",
    "ronan-founder-abhrach",
    "filidh-founder-urquhart",
    "rionach-founder-urquhart",
    "hoilbhe-founder-duilb",
    "cadan-cumhail",
    "oisin-founder-urquhart",
    "sinead-urquhart",
    "yilleach-founder-cetchathach",
    "malon-pendrag",
    "ossian-founder-urquhart",
    "dallan-founder-urquhart",
    "caitriona-founder-ronain",
    "eabha-unknown-urquhart-142-1",
    "turlough-1160-urquhart",
    "gormlaith-urquhart",
    "eimhear-1164-roth",
    "iorwerth-draig",
    "muirgel-1266-urquhart",
    "fionnlagh-1268-urquhart",
    "liadan-1270-urquhart",
    "sorley-1260-morath",
    "sluagh-1272-ffearnach",
    "lorcan-unknown-urquhart-166-2",
    "oisin-1539-urquhart",
    "eamhair-urquhart",
    "leagha-1541-roth",
    "thorgest-vaeren",
    "eithne-1559-urquhart",
    "cainneach-1561-urquhart",
    "xarthan-1556-cethrenn",
    "morrigan-1562-dubglais",
    "conchobhair-urquhart",
    "allanah-1583-urquhart",
    "filidh-1586-urquhart",
    "cliona-1588-urquhart",
    "eochaidh-urquhart",
    "fearcharae-cumhail",
    "raghallach-1579-diuid",
    "gormlaith-1586-luthsach",
    "donncadh-1580-dubglais",
    "kerrilynn-ceirwyn",
    "orfllaith-urquhart",
    "carolan-1600-urquhart",
    "beathag-1603-urquhart",
    "siomhrach-urquhart",
    "donnchadh-1600-urquhart",
    "muirne-urquhart",
    "dyvynwal-blodyn",
    "heulyn-1605-bhaird",
    "goraidh-1600-ronain",
    "faithleach-amrhan",
    "nuala-1608-morath",
    "einarr-1614-sterkr",
    "dallan-1628-urquhart",
    "noirin-urquhart",
    "cathal-1632-urquhart",
    "roisin-urquhart",
    "hamish-1626-urquhart",
    "hailidhe-1632-stwatchn",
    "artus-1622-pendrag",
    "lannraig-1632-ness",
    "oleg-skald",
    "grainneog-1630-buadhtreun",
    "cainneach-urquhart",
    "quarnait-1665-urquhart",
    "lachlan-1655-urquhart",
    "dearbhlaas-1652-urquhart",
    "fergus-1648-urquhart",
    "meeghan-pendrag",
    "connla-1660-chulainn",
    "tuarenn-1658-cethrenn",
    "sean-1648-morna",
    "joaigh-1649-forsyth",
    "amergin-1673-urquhart",
    "muirgel-1676-urquhart",
    "orlaith-1678-urquhart",
    "artair-1680-urquhart",
    "ruairidh-1677-urquhart",
    "aodhan-1667-urquhart",
    "sheena-urquhart",
    "alasdair-1674-urquhart",
    "glaodhaich-1675-laga",
    "murdoch-1672-culloch",
    "hiolair-1675-stwatchn",
    "odhbha-1680-duff",
    "dechtire-1680-buadhtreun",
    "kealagh-1671-eoghainn",
    "jygallag-blodyn",
    "porlach-1677-dubglais",
    "turlough-1693-urquhart",
    "mairi-1695-urquhart",
    "brennan-1699-urquhart",
    "caelan-1704-urquhart",
    "sileas-1700-urquhart",
    "daire-1704-urquhart",
    "carolan-1701-urquhart",
    "conchobhair-1705-urquhart",
    "dermod-1700-urquhart",
    "ruarc-1705-urquhart",
    "filidh-1710-urquhart",
    "fiachra-1696-urquhart",
    "brigid-1700-urquhart",
    "fiadhnait-1695-cetchathach",
    "domhnall-1688-diuid",
    "braoin-1702-drummond",
    "seanchan-1692-morath",
    "treabha-1708-cethrenn",
    "uthbhla-1705-lachlann",
    "ailisande-1696-luthsach",
    "aolbha-1708-roich",
    "neidin-1699-carnegie",
    "aodhan-1694-bhaird",
    "amergin-1715-urquhart",
    "allanah-1720-urquhart",
    "oisin-1724-urquhart",
    "liadan-1728-urquhart",
    "sorley-1722-urquhart",
    "cliona-1727-urquhart",
    "sean-1727-roth",
    "ramsay-1729-urquhart",
    "ardith-1733-urquhart",
    "carolan-1726-urquhart",
    "loreena-1729-urquhart",
    "angus-1732-urquhart",
    "adele-1726-urquhart",
    "alasdair-1730-urquhart",
    "enya-1721-urquhart",
    "ewan-1723-urquhart",
    "etain-1726-urquhart",
    "eoin-1730-urquhart"
  ],
  "partnershipIds": [
    "marriage-amergin-founder-urquhart--fionnghuala-founder-tuathanach",
    "marriage-faoiltiama-dermod",
    "marriage-brigid-founder-urquhart--ronan-founder-abhrach",
    "marriage-filidh-founder-urquhart--hoilbhe-founder-duilb",
    "marriage-cadan-cumhail--rionach-founder-urquhart",
    "marriage-oisin-founder-urquhart--yilleach-founder-cetchathach",
    "marriage-malon-sinead",
    "marriage-caitriona-founder-ronain--ossian-founder-urquhart",
    "marriage-dallan-founder-urquhart--eabha-unknown-urquhart-142-1",
    "marriage-eimhear-1164-roth--turlough-1160-urquhart",
    "marriage-iorwerth-gormlaith",
    "marriage-muirgel-1266-urquhart--sorley-1260-morath",
    "marriage-fionnlagh-1268-urquhart--sluagh-1272-ffearnach",
    "marriage-liadan-1270-urquhart--lorcan-unknown-urquhart-166-2",
    "marriage-leagha-1541-roth--oisin-1539-urquhart",
    "marriage-thorgest-eamhair-vaeren",
    "marriage-eithne-1559-urquhart--xarthan-1556-cethrenn",
    "marriage-cainneach-1561-urquhart--morrigan-1562-dubglais",
    "marriage-fearcharae-conchobhair",
    "marriage-allanah-1583-urquhart--raghallach-1579-diuid",
    "marriage-filidh-1586-urquhart--gormlaith-1586-luthsach",
    "marriage-cliona-1588-urquhart--donncadh-1580-dubglais",
    "marriage-kerrilynn-eochaidh-ceirwyn",
    "marriage-dyvynwal-orfllaith",
    "marriage-carolan-1600-urquhart--heulyn-1605-bhaird",
    "marriage-beathag-1603-urquhart--goraidh-1600-ronain",
    "marriage-faithleach-siomhrach-amrhan",
    "marriage-donnchadh-1600-urquhart--nuala-1608-morath",
    "marriage-einarr-muirne-sterkr",
    "marriage-dallan-1628-urquhart--hailidhe-1632-stwatchn",
    "marriage-artus1622-noirin",
    "marriage-cathal-1632-urquhart--lannraig-1632-ness",
    "marriage-oleg-roisin-skald",
    "marriage-grainneog-1630-buadhtreun--hamish-1626-urquhart",
    "marriage-meeghan-cainneach",
    "marriage-connla-1660-chulainn--quarnait-1665-urquhart",
    "marriage-lachlan-1655-urquhart--tuarenn-1658-cethrenn",
    "marriage-dearbhlaas-1652-urquhart--sean-1648-morna",
    "marriage-fergus-1648-urquhart--joaigh-1649-forsyth",
    "marriage-amergin-1673-urquhart--glaodhaich-1675-laga",
    "marriage-muirgel-1676-urquhart--murdoch-1672-culloch",
    "marriage-hiolair-1675-stwatchn--orlaith-1678-urquhart",
    "marriage-artair-1680-urquhart--odhbha-1680-duff",
    "marriage-dechtire-1680-buadhtreun--ruairidh-1677-urquhart",
    "marriage-aodhan-1667-urquhart--kealagh-1671-eoghainn",
    "marriage-jygallag-sheena",
    "marriage-alasdair-1674-urquhart--porlach-1677-dubglais",
    "marriage-fiadhnait-1695-cetchathach--turlough-1693-urquhart",
    "marriage-domhnall-1688-diuid--mairi-1695-urquhart",
    "marriage-braoin-1702-drummond--brennan-1699-urquhart",
    "marriage-seanchan-1692-morath--sileas-1700-urquhart",
    "marriage-daire-1704-urquhart--treabha-1708-cethrenn",
    "marriage-conchobhair-1705-urquhart--uthbhla-1705-lachlann",
    "marriage-ailisande-1696-luthsach--dermod-1700-urquhart",
    "marriage-aolbha-1708-roich--ruarc-1705-urquhart",
    "marriage-fiachra-1696-urquhart--neidin-1699-carnegie",
    "marriage-aodhan-1694-bhaird--brigid-1700-urquhart"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-amergin-founder-urquhart--fionnghuala-founder-tuathanach",
      "childIds": [
        "dermod-urquhart",
        "brigid-founder-urquhart"
      ],
      "timeJumpId": "gap-faelaorn-urquhart-founders"
    },
    {
      "partnershipId": "marriage-faoiltiama-dermod",
      "childIds": [
        "filidh-founder-urquhart",
        "rionach-founder-urquhart"
      ],
      "timeJumpId": "gap-faelaorn-urquhart-dermod"
    },
    {
      "partnershipId": "marriage-filidh-founder-urquhart--hoilbhe-founder-duilb",
      "childIds": [
        "oisin-founder-urquhart",
        "sinead-urquhart"
      ],
      "timeJumpId": "gap-faelaorn-urquhart-filidh"
    },
    {
      "partnershipId": "marriage-oisin-founder-urquhart--yilleach-founder-cetchathach",
      "childIds": [
        "ossian-founder-urquhart",
        "dallan-founder-urquhart"
      ],
      "timeJumpId": "gap-faelaorn-urquhart-oisin"
    },
    {
      "partnershipId": "marriage-caitriona-founder-ronain--ossian-founder-urquhart",
      "childIds": [
        "turlough-1160-urquhart",
        "gormlaith-urquhart"
      ],
      "timeJumpId": "gap-faelaorn-urquhart-ossian"
    },
    {
      "partnershipId": "marriage-eimhear-1164-roth--turlough-1160-urquhart",
      "childIds": [
        "muirgel-1266-urquhart",
        "fionnlagh-1268-urquhart",
        "liadan-1270-urquhart"
      ],
      "timeJumpId": "gap-faelaorn-urquhart-turlough"
    },
    {
      "partnershipId": "marriage-fionnlagh-1268-urquhart--sluagh-1272-ffearnach",
      "childIds": [
        "oisin-1539-urquhart",
        "eamhair-urquhart"
      ],
      "timeJumpId": "gap-faelaorn-urquhart-fionnlagh"
    },
    {
      "partnershipId": "marriage-leagha-1541-roth--oisin-1539-urquhart",
      "childIds": [
        "eithne-1559-urquhart",
        "cainneach-1561-urquhart"
      ]
    },
    {
      "partnershipId": "marriage-cainneach-1561-urquhart--morrigan-1562-dubglais",
      "childIds": [
        "conchobhair-urquhart",
        "allanah-1583-urquhart",
        "filidh-1586-urquhart",
        "cliona-1588-urquhart",
        "eochaidh-urquhart"
      ]
    },
    {
      "partnershipId": "marriage-fearcharae-conchobhair",
      "childIds": [
        "orfllaith-urquhart",
        "carolan-1600-urquhart",
        "beathag-1603-urquhart"
      ]
    },
    {
      "partnershipId": "marriage-kerrilynn-eochaidh-ceirwyn",
      "childIds": [
        "siomhrach-urquhart",
        "donnchadh-1600-urquhart",
        "muirne-urquhart"
      ]
    },
    {
      "partnershipId": "marriage-carolan-1600-urquhart--heulyn-1605-bhaird",
      "childIds": [
        "dallan-1628-urquhart",
        "noirin-urquhart",
        "cathal-1632-urquhart"
      ]
    },
    {
      "partnershipId": "marriage-donnchadh-1600-urquhart--nuala-1608-morath",
      "childIds": [
        "roisin-urquhart",
        "hamish-1626-urquhart"
      ]
    },
    {
      "partnershipId": "marriage-dallan-1628-urquhart--hailidhe-1632-stwatchn",
      "childIds": [
        "cainneach-urquhart",
        "quarnait-1665-urquhart"
      ]
    },
    {
      "partnershipId": "marriage-cathal-1632-urquhart--lannraig-1632-ness",
      "childIds": [
        "lachlan-1655-urquhart"
      ]
    },
    {
      "partnershipId": "marriage-grainneog-1630-buadhtreun--hamish-1626-urquhart",
      "childIds": [
        "dearbhlaas-1652-urquhart",
        "fergus-1648-urquhart"
      ]
    },
    {
      "partnershipId": "marriage-meeghan-cainneach",
      "childIds": [
        "amergin-1673-urquhart",
        "muirgel-1676-urquhart",
        "orlaith-1678-urquhart",
        "artair-1680-urquhart"
      ]
    },
    {
      "partnershipId": "marriage-lachlan-1655-urquhart--tuarenn-1658-cethrenn",
      "childIds": [
        "ruairidh-1677-urquhart"
      ]
    },
    {
      "partnershipId": "marriage-fergus-1648-urquhart--joaigh-1649-forsyth",
      "childIds": [
        "aodhan-1667-urquhart",
        "sheena-urquhart",
        "alasdair-1674-urquhart"
      ]
    },
    {
      "partnershipId": "marriage-amergin-1673-urquhart--glaodhaich-1675-laga",
      "childIds": [
        "turlough-1693-urquhart",
        "mairi-1695-urquhart",
        "brennan-1699-urquhart",
        "caelan-1704-urquhart"
      ]
    },
    {
      "partnershipId": "marriage-artair-1680-urquhart--odhbha-1680-duff",
      "childIds": [
        "sileas-1700-urquhart",
        "daire-1704-urquhart"
      ]
    },
    {
      "partnershipId": "marriage-dechtire-1680-buadhtreun--ruairidh-1677-urquhart",
      "childIds": [
        "carolan-1701-urquhart",
        "conchobhair-1705-urquhart"
      ]
    },
    {
      "partnershipId": "marriage-aodhan-1667-urquhart--kealagh-1671-eoghainn",
      "childIds": [
        "dermod-1700-urquhart",
        "ruarc-1705-urquhart",
        "filidh-1710-urquhart"
      ]
    },
    {
      "partnershipId": "marriage-alasdair-1674-urquhart--porlach-1677-dubglais",
      "childIds": [
        "fiachra-1696-urquhart",
        "brigid-1700-urquhart"
      ]
    },
    {
      "partnershipId": "marriage-fiadhnait-1695-cetchathach--turlough-1693-urquhart",
      "childIds": [
        "amergin-1715-urquhart",
        "allanah-1720-urquhart",
        "oisin-1724-urquhart",
        "liadan-1728-urquhart"
      ]
    },
    {
      "partnershipId": "marriage-braoin-1702-drummond--brennan-1699-urquhart",
      "childIds": [
        "sorley-1722-urquhart",
        "cliona-1727-urquhart"
      ]
    },
    {
      "partnershipId": "marriage-daire-1704-urquhart--treabha-1708-cethrenn",
      "childIds": [
        "ramsay-1729-urquhart",
        "ardith-1733-urquhart"
      ]
    },
    {
      "partnershipId": "marriage-conchobhair-1705-urquhart--uthbhla-1705-lachlann",
      "childIds": [
        "carolan-1726-urquhart",
        "loreena-1729-urquhart",
        "angus-1732-urquhart"
      ]
    },
    {
      "partnershipId": "marriage-aolbha-1708-roich--ruarc-1705-urquhart",
      "childIds": [
        "adele-1726-urquhart",
        "alasdair-1730-urquhart"
      ]
    },
    {
      "partnershipId": "marriage-fiachra-1696-urquhart--neidin-1699-carnegie",
      "childIds": [
        "enya-1721-urquhart",
        "ewan-1723-urquhart",
        "etain-1726-urquhart",
        "eoin-1730-urquhart"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-brigid-founder-urquhart--ronan-founder-abhrach",
      "targetFamilyId": "haus-abhrach",
      "houseId": "house-abhrach"
    },
    {
      "partnershipId": "marriage-cadan-cumhail--rionach-founder-urquhart",
      "targetFamilyId": "haus-mac-ard-cumhaill",
      "houseId": "house-cumhail"
    },
    {
      "partnershipId": "marriage-malon-sinead",
      "targetFamilyId": "haus-pendrag",
      "houseId": "house-pendrag"
    },
    {
      "partnershipId": "marriage-iorwerth-gormlaith",
      "targetFamilyId": "haus-draig",
      "houseId": "house-draig"
    },
    {
      "partnershipId": "marriage-muirgel-1266-urquhart--sorley-1260-morath",
      "targetFamilyId": "haus-morath",
      "houseId": "house-morath"
    },
    {
      "partnershipId": "marriage-thorgest-eamhair-vaeren",
      "targetFamilyId": "haus-vaeren",
      "houseId": "house-vaeren"
    },
    {
      "partnershipId": "marriage-eithne-1559-urquhart--xarthan-1556-cethrenn",
      "targetFamilyId": "haus-cethrenn",
      "houseId": "house-cethrenn"
    },
    {
      "partnershipId": "marriage-allanah-1583-urquhart--raghallach-1579-diuid",
      "targetFamilyId": "haus-diuid",
      "houseId": "house-diuid"
    },
    {
      "partnershipId": "marriage-filidh-1586-urquhart--gormlaith-1586-luthsach",
      "targetFamilyId": "haus-luthsach",
      "houseId": "house-luthsach"
    },
    {
      "partnershipId": "marriage-cliona-1588-urquhart--donncadh-1580-dubglais",
      "targetFamilyId": "haus-dubglais",
      "houseId": "house-dubglais"
    },
    {
      "partnershipId": "marriage-dyvynwal-orfllaith",
      "targetFamilyId": "haus-blodyn",
      "houseId": "house-blodyn"
    },
    {
      "partnershipId": "marriage-beathag-1603-urquhart--goraidh-1600-ronain",
      "targetFamilyId": "haus-ronain",
      "houseId": "house-ronain"
    },
    {
      "partnershipId": "marriage-faithleach-siomhrach-amrhan",
      "targetFamilyId": "haus-amrhan",
      "houseId": "house-amrhan"
    },
    {
      "partnershipId": "marriage-einarr-muirne-sterkr",
      "targetFamilyId": "haus-sterkr",
      "houseId": "house-sterkr"
    },
    {
      "partnershipId": "marriage-artus1622-noirin",
      "targetFamilyId": "haus-pendrag",
      "houseId": "house-pendrag"
    },
    {
      "partnershipId": "marriage-oleg-roisin-skald",
      "targetFamilyId": "haus-skald",
      "houseId": "house-skald"
    },
    {
      "partnershipId": "marriage-connla-1660-chulainn--quarnait-1665-urquhart",
      "targetFamilyId": "haus-chulainn",
      "houseId": "house-chulainn"
    },
    {
      "partnershipId": "marriage-dearbhlaas-1652-urquhart--sean-1648-morna",
      "targetFamilyId": "haus-morna",
      "houseId": "house-morna"
    },
    {
      "partnershipId": "marriage-muirgel-1676-urquhart--murdoch-1672-culloch",
      "targetFamilyId": "haus-culloch",
      "houseId": "house-culloch"
    },
    {
      "partnershipId": "marriage-hiolair-1675-stwatchn--orlaith-1678-urquhart",
      "targetFamilyId": "haus-stwatchn",
      "houseId": "house-stwatchn"
    },
    {
      "partnershipId": "marriage-jygallag-sheena",
      "targetFamilyId": "haus-blodyn",
      "houseId": "house-blodyn"
    },
    {
      "partnershipId": "marriage-domhnall-1688-diuid--mairi-1695-urquhart",
      "targetFamilyId": "haus-diuid",
      "houseId": "house-diuid"
    },
    {
      "partnershipId": "marriage-seanchan-1692-morath--sileas-1700-urquhart",
      "targetFamilyId": "haus-morath",
      "houseId": "house-morath"
    },
    {
      "partnershipId": "marriage-ailisande-1696-luthsach--dermod-1700-urquhart",
      "targetFamilyId": "haus-luthsach",
      "houseId": "house-luthsach"
    },
    {
      "partnershipId": "marriage-aodhan-1694-bhaird--brigid-1700-urquhart",
      "targetFamilyId": "haus-bhaird",
      "houseId": "house-bhaird"
    }
  ],
  "cadets": [
    {
      "partnershipId": "marriage-dallan-founder-urquhart--eabha-unknown-urquhart-142-1",
      "targetFamilyId": "haus-bhaird"
    },
    {
      "partnershipId": "marriage-liadan-1270-urquhart--lorcan-unknown-urquhart-166-2",
      "targetFamilyId": "haus-luthsach"
    }
  ],
  "wards": [],
  "foster": [
    {
      "childId": "sean-1727-roth",
      "parentId": "brennan-1699-urquhart"
    }
  ],
  "heads": [
    "amergin-founder-urquhart",
    "dermod-urquhart",
    "filidh-founder-urquhart",
    "oisin-founder-urquhart",
    "ossian-founder-urquhart",
    "turlough-1160-urquhart",
    "fionnlagh-1268-urquhart",
    "oisin-1539-urquhart",
    "cainneach-1561-urquhart",
    "conchobhair-urquhart",
    "carolan-1600-urquhart",
    "dallan-1628-urquhart",
    "cainneach-urquhart"
  ],
  "titles": {
    "amergin-founder-urquhart": "Legendärer Gründer · Barde",
    "dermod-urquhart": "Historisches Oberhaupt",
    "filidh-founder-urquhart": "Historisches Oberhaupt",
    "oisin-founder-urquhart": "Historisches Oberhaupt",
    "ossian-founder-urquhart": "Historisches Oberhaupt",
    "turlough-1160-urquhart": "Historisches Oberhaupt",
    "fionnlagh-1268-urquhart": "Historisches Oberhaupt",
    "oisin-1539-urquhart": "Historisches Oberhaupt",
    "cainneach-1561-urquhart": "Historisches Oberhaupt",
    "conchobhair-urquhart": "Historisches Oberhaupt",
    "carolan-1600-urquhart": "Historisches Oberhaupt",
    "dallan-1628-urquhart": "Historisches Oberhaupt",
    "cainneach-urquhart": "Fürst von Faelaorn",
    "amergin-1673-urquhart": "Erbfolge: 1",
    "turlough-1693-urquhart": "Erbfolge: 2",
    "amergin-1715-urquhart": "Erbfolge: 3",
    "oisin-1724-urquhart": "Erbfolge: 4"
  },
  "personRoles": {
    "sean-1727-roth": "ward"
  },
  "personExtensions": {},
  "sourceNote": "Sieben serielle Überlieferungslücken. Bhaird und Luthsach sind direkte Kadettenlinien. Aodhán, Sheena und Alasdair sind laut dreispaltiger Elternüberschrift Kinder von Fergus und Joaigh; nur Ruairidh gehört zu Lachlan und Tuarenn. Seán Roth ist Brennans aufgenommenes Mündel. Die alten Herrschaften bleiben trotz Krieg und Teilbesetzung maßgeblich.",
  "currentHeadId": "cainneach-urquhart",
  "heirIds": [
    "amergin-1673-urquhart",
    "turlough-1693-urquhart",
    "amergin-1715-urquhart",
    "oisin-1724-urquhart"
  ],
  "description": "Ui Urquhart herrscht von Piobarach in Tir na Rann aus über Faelaorn. Der Clan führt sich auf den Barden Amergin zurück und verbindet Fürstenherrschaft mit Musik, Dichtung und der Bewahrung alter Überlieferungen. Bhaird und Luthsach gingen als eigene Kadettenlinien aus ihm hervor. Cainneach führt das Haus seit 1720; Amergin, Turlough und dessen Söhne stehen in der benannten Erbfolge. Faelaorn befindet sich im Krieg mit Skjaerheim und ist etwa zur Hälfte übernommen. Das Register bewahrt die alten Herrschaftsverhältnisse. Das Hausmotto lautet: Bewahre, was die Zeit zu vergessen sucht."
});

export const HOUSE_URQUHART_FAMILY = createFaelaornSourceFamily("urquhart", SOURCE);
