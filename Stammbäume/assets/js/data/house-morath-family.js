import { withFaelaornSourceCounterUpgrade } from './faelaorn-source-counter-upgrade.js';
import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { withAislearneachSourceCounterUpgrade } from './aislearneach-source-counter-upgrade.js';
import { createDunfalSourceFamily } from './dunfal-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "torna-founder-morath",
    "doireann-unknown-morath-91-0",
    "sorley-1260-morath",
    "saoirse-morath",
    "muirgel-1266-urquhart",
    "tryggvar-brathfengr",
    "seanchan-1605-morath",
    "nuala-1608-morath",
    "clarach-1605-morath",
    "noracha-1610-duilb",
    "donnchadh-1600-urquhart",
    "lisair-1605-muiredaigh",
    "zibhneach-morath",
    "doireann-1634-morath",
    "flann-1623-morath",
    "sorley-1624-morath",
    "glaodhaich-amrhan",
    "dugald-1631-baird",
    "norberta-1624-sokering",
    "torna-1647-morath",
    "latharna-1652-morath",
    "uallach-1654-morath",
    "muirgheas-1642-morath",
    "liadan-1652-morath",
    "roswitha-1650-ridderspore",
    "ronan-1648-casur",
    "nuallan-unknown-morath-135-2",
    "kelian-unknown-morath-135-3",
    "sadhbh-1645-birn",
    "treabhnan-1649-riangabra",
    "cairbre-1669-morath",
    "saoirse-1674-morath",
    "rhiona-1672-morath",
    "yathghin-1681-morath",
    "flatha-1670-morath",
    "dubhthach-1676-morath",
    "eibhlin-1674-muiredaigh",
    "albrecht-1668-sokering",
    "adomnan-1669-eachtrai",
    "wairbhin-1672-tairise",
    "eimhin-unknown-morath-153-4",
    "seanchan-1692-morath",
    "hailaigh-1705-morath",
    "muiris-1698-morath",
    "treasa-morath",
    "alastriona-morath",
    "aodhagan-1699-morath",
    "eoghan-1704-morath",
    "huaid-morath",
    "caitilin-1709-morath",
    "sileas-1700-urquhart",
    "tiarnog-1703-chulainn",
    "mhor-1705-an-bhaird",
    "vebjorn-skald",
    "arian-ceirwyn",
    "raonach-1703-ceallaigh",
    "scannlan-amrhan",
    "clarach-1719-morath",
    "sorley-1723-morath",
    "doireann-1726-morath",
    "finghin-1726-roth",
    "torna-1724-morath",
    "giolla-1727-morath",
    "sean-1730-morath",
    "nuala-1720-morath",
    "bride-1723-morath"
  ],
  "partnershipIds": [
    "marriage-doireann-unknown-morath-91-0--torna-founder-morath",
    "marriage-muirgel-1266-urquhart--sorley-1260-morath",
    "marriage-tryggvar-saoirse-brathfengr",
    "marriage-noracha-1610-duilb--seanchan-1605-morath",
    "marriage-donnchadh-1600-urquhart--nuala-1608-morath",
    "marriage-clarach-1605-morath--lisair-1605-muiredaigh",
    "marriage-zibhneach-glaodhaich-amrhan",
    "marriage-doireann-1634-morath--dugald-1631-baird",
    "marriage-norberta-1624-sokering--sorley-1624-morath",
    "marriage-roswitha-1650-ridderspore--torna-1647-morath",
    "marriage-latharna-1652-morath--ronan-1648-casur",
    "marriage-nuallan-unknown-morath-135-2--uallach-1654-morath",
    "affair-kelian-unknown-morath-135-3--uallach-1654-morath",
    "marriage-muirgheas-1642-morath--sadhbh-1645-birn",
    "marriage-liadan-1652-morath--treabhnan-1649-riangabra",
    "marriage-cairbre-1669-morath--eibhlin-1674-muiredaigh",
    "marriage-albrecht-1668-sokering--saoirse-1674-morath",
    "marriage-adomnan-1669-eachtrai--rhiona-1672-morath",
    "marriage-flatha-1670-morath--wairbhin-1672-tairise",
    "marriage-dubhthach-1676-morath--eimhin-unknown-morath-153-4",
    "marriage-seanchan-1692-morath--sileas-1700-urquhart",
    "marriage-hailaigh-1705-morath--tiarnog-1703-chulainn",
    "marriage-mhor-1705-an-bhaird--muiris-1698-morath",
    "marriage-vebjorn-treasa-skald",
    "marriage-arian-alastriona-ceirwyn",
    "marriage-aodhagan-1699-morath--raonach-1703-ceallaigh",
    "marriage-scannlan-huaid-amrhan"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-doireann-unknown-morath-91-0--torna-founder-morath",
      "childIds": [
        "sorley-1260-morath",
        "saoirse-morath"
      ],
      "timeJumpId": "gap-dunfal-morath-founders"
    },
    {
      "partnershipId": "marriage-muirgel-1266-urquhart--sorley-1260-morath",
      "childIds": [
        "seanchan-1605-morath",
        "nuala-1608-morath",
        "clarach-1605-morath"
      ],
      "timeJumpId": "gap-dunfal-morath-sorley"
    },
    {
      "partnershipId": "marriage-noracha-1610-duilb--seanchan-1605-morath",
      "childIds": [
        "zibhneach-morath",
        "doireann-1634-morath"
      ]
    },
    {
      "partnershipId": "marriage-clarach-1605-morath--lisair-1605-muiredaigh",
      "childIds": [
        "flann-1623-morath",
        "sorley-1624-morath"
      ]
    },
    {
      "partnershipId": "marriage-zibhneach-glaodhaich-amrhan",
      "childIds": [
        "torna-1647-morath",
        "latharna-1652-morath",
        "uallach-1654-morath"
      ]
    },
    {
      "partnershipId": "marriage-norberta-1624-sokering--sorley-1624-morath",
      "childIds": [
        "muirgheas-1642-morath",
        "liadan-1652-morath"
      ]
    },
    {
      "partnershipId": "marriage-roswitha-1650-ridderspore--torna-1647-morath",
      "childIds": [
        "cairbre-1669-morath",
        "saoirse-1674-morath"
      ]
    },
    {
      "partnershipId": "marriage-nuallan-unknown-morath-135-2--uallach-1654-morath",
      "childIds": [
        "rhiona-1672-morath"
      ]
    },
    {
      "partnershipId": "affair-kelian-unknown-morath-135-3--uallach-1654-morath",
      "childIds": [
        "yathghin-1681-morath"
      ],
      "legitimacy": "illegitimate"
    },
    {
      "partnershipId": "marriage-muirgheas-1642-morath--sadhbh-1645-birn",
      "childIds": [
        "flatha-1670-morath",
        "dubhthach-1676-morath"
      ]
    },
    {
      "partnershipId": "marriage-cairbre-1669-morath--eibhlin-1674-muiredaigh",
      "childIds": [
        "seanchan-1692-morath",
        "hailaigh-1705-morath",
        "muiris-1698-morath",
        "treasa-morath",
        "alastriona-morath"
      ]
    },
    {
      "partnershipId": "marriage-dubhthach-1676-morath--eimhin-unknown-morath-153-4",
      "childIds": [
        "aodhagan-1699-morath",
        "eoghan-1704-morath",
        "huaid-morath",
        "caitilin-1709-morath"
      ]
    },
    {
      "partnershipId": "marriage-seanchan-1692-morath--sileas-1700-urquhart",
      "childIds": [
        "clarach-1719-morath",
        "sorley-1723-morath",
        "doireann-1726-morath"
      ]
    },
    {
      "partnershipId": "marriage-mhor-1705-an-bhaird--muiris-1698-morath",
      "childIds": [
        "torna-1724-morath",
        "giolla-1727-morath",
        "sean-1730-morath"
      ]
    },
    {
      "partnershipId": "marriage-aodhagan-1699-morath--raonach-1703-ceallaigh",
      "childIds": [
        "nuala-1720-morath",
        "bride-1723-morath"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-tryggvar-saoirse-brathfengr",
      "targetFamilyId": "haus-brathfengr",
      "houseId": "house-brathfengr"
    },
    {
      "partnershipId": "marriage-donnchadh-1600-urquhart--nuala-1608-morath",
      "targetFamilyId": "haus-urquhart",
      "houseId": "house-urquhart"
    },
    {
      "partnershipId": "marriage-doireann-1634-morath--dugald-1631-baird",
      "targetFamilyId": "haus-baird",
      "houseId": "house-baird"
    },
    {
      "partnershipId": "marriage-latharna-1652-morath--ronan-1648-casur",
      "targetFamilyId": "haus-casur",
      "houseId": "house-casur"
    },
    {
      "partnershipId": "marriage-liadan-1652-morath--treabhnan-1649-riangabra",
      "targetFamilyId": "haus-riangabra",
      "houseId": "house-riangabra"
    },
    {
      "partnershipId": "marriage-albrecht-1668-sokering--saoirse-1674-morath",
      "targetFamilyId": "haus-sokering",
      "houseId": "house-sokering"
    },
    {
      "partnershipId": "marriage-adomnan-1669-eachtrai--rhiona-1672-morath",
      "targetFamilyId": "haus-eachtrai",
      "houseId": "house-eachtrai"
    },
    {
      "partnershipId": "marriage-flatha-1670-morath--wairbhin-1672-tairise",
      "targetFamilyId": "haus-tairise",
      "houseId": "house-tairise"
    },
    {
      "partnershipId": "marriage-hailaigh-1705-morath--tiarnog-1703-chulainn",
      "targetFamilyId": "haus-chulainn",
      "houseId": "house-chulainn"
    },
    {
      "partnershipId": "marriage-vebjorn-treasa-skald",
      "targetFamilyId": "haus-skald",
      "houseId": "house-skald"
    },
    {
      "partnershipId": "marriage-arian-alastriona-ceirwyn",
      "targetFamilyId": "haus-ceirwyn",
      "houseId": "house-ceirwyn"
    },
    {
      "partnershipId": "marriage-scannlan-huaid-amrhan",
      "targetFamilyId": "haus-amrhan",
      "houseId": "house-amrhan"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [
    {
      "childId": "finghin-1726-roth",
      "parentId": "seanchan-1692-morath"
    }
  ],
  "heads": [
    "torna-founder-morath",
    "sorley-1260-morath",
    "clarach-1605-morath",
    "zibhneach-morath",
    "sorley-1624-morath",
    "torna-1647-morath",
    "flann-1623-morath"
  ],
  "titles": {
    "torna-founder-morath": "Historisches Oberhaupt",
    "sorley-1260-morath": "Historisches Oberhaupt",
    "clarach-1605-morath": "Historisches Oberhaupt",
    "zibhneach-morath": "Historisches Oberhaupt",
    "sorley-1624-morath": "Historisches Oberhaupt",
    "torna-1647-morath": "Historisches Oberhaupt",
    "flann-1623-morath": "Gewählter Laird seit 1740"
  },
  "personRoles": {
    "yathghin-1681-morath": "bastard",
    "kelian-unknown-morath-135-3": "affair",
    "finghin-1726-roth": "ward"
  },
  "personExtensions": {},
  "sourceNote": "Zwei serielle Überlieferungslücken. Das Oberhaupt wird gewählt. Yathghin ist Uallachs und Kélians uneheliches Kind. Fínghin Roth ist Seancháns Mündel. Hallaigh/Hailaigh/Haileigh bezeichnen anhand von Geburt 1705 und Ehe mit Tiarnóg dieselbe Person.",
  "currentHeadId": "flann-1623-morath",
  "heirIds": [],
  "description": "Ruin’Morath sitzt in Iarthar und gehört zu den Laird-Clans von Tir na Rithe. Torna und Doireann stehen am Anfang der Überlieferung; zwischen den frühen Ahnen und den datierten Familienlinien bleiben Generationen unbekannt. Der Clan wählt sein Oberhaupt. Seit 1740 nimmt Flann dieses Amt ein, weshalb aus der Reihenfolge der Nachkommen keine automatische Erbfolge abgeleitet wird."
});

export const HOUSE_MORATH_FAMILY = withFaelaornSourceCounterUpgrade(withAlbenSourcePortraitUpgrade(withAislearneachSourceCounterUpgrade(createDunfalSourceFamily("morath", SOURCE))));
