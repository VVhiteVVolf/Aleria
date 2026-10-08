import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { createAislearneachSourceFamily } from './aislearneach-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "muireadhach-founder-fintain",
    "edana-unknown-fintain-91-0",
    "jodhran-1587-fintain",
    "talullaan-1607-fintain",
    "muiredach-1589-fintain",
    "eireann-1589-morna",
    "lorgain-1603-luchdon",
    "mornainin-1585-ceallaigh",
    "urramach-1607-fintain",
    "deidreas-1612-fintain",
    "cethern-1610-fintain",
    "caitriona-fintain",
    "eilidhan-1608-nessa",
    "beiste-1609-tiran-treathai",
    "treabha-unknown-fintain-113-2",
    "dughall-1609-craobhan",
    "muireadhach-1627-fintain",
    "oithiona-1632-fintain",
    "treabha-1632-fintain",
    "fingin-1634-fintain",
    "oonaach-1630-mata",
    "diarmuid-1628-ui-faill-duibhne",
    "nechtan-1627-torcmhar",
    "eadaoin-1636-cleirigh",
    "ruari-fintain",
    "gormlaith-fintain",
    "zephen-fintain",
    "eoghanas-1656-fintain",
    "crystin-dinefwr",
    "drwst-tir-addawol",
    "saoirse-1652-ceinselaig",
    "hoilbhe-unknown-fintain-133-3",
    "eachan-1669-fintain",
    "brighdeach-1680-fintain",
    "talullaan-1680-fintain",
    "oranan-1684-fintain",
    "gordanach-1675-fintain",
    "deirdreas-1676-fintain",
    "urramach-1678-fintain",
    "maighread-1673-cein",
    "giollaach-1679-ceallaigh",
    "caolan-1676-arduinna",
    "hailidhe-1678-dobhar",
    "fionnlagh-1672-suilgeach",
    "tailltein-unknown-fintain-151-1",
    "cethern-1692-fintain",
    "teaganach-1701-fintain",
    "edana-1703-fintain",
    "fingin-1705-fintain",
    "baodan-1698-fintain",
    "diahan-fintain",
    "eamon-1705-fintain",
    "mornain-1699-fintain",
    "caitriona-1703-fintain",
    "brionnflaith-1697-tiran-treathai",
    "ronanach-1698-morna",
    "jilbhe-1709-ness",
    "ysolde-unknown-fintain-169-0",
    "meirion-grawn",
    "reamha-unknown-fintain-169-2",
    "gordanach-1694-lasgair",
    "muiredach-1700-haeghra",
    "ramsay-1717-fintain",
    "oithiona-1723-fintain",
    "mael-1723-mata",
    "ruari-1730-fintain",
    "maelas-1735-fintain",
    "ealag-1721-fintain",
    "eoghan-1725-fintain",
    "oideach-1729-fintain",
    "hoilbhe-1726-fintain",
    "treabha-1732-fintain"
  ],
  "partnershipIds": [
    "marriage-edana-unknown-fintain-91-0--muireadhach-founder-fintain",
    "marriage-eireann-1589-morna--jodhran-1587-fintain",
    "marriage-lorgain-1603-luchdon--talullaan-1607-fintain",
    "marriage-mornainin-1585-ceallaigh--muiredach-1589-fintain",
    "marriage-eilidhan-1608-nessa--urramach-1607-fintain",
    "marriage-beiste-1609-tiran-treathai--deidreas-1612-fintain",
    "marriage-cethern-1610-fintain--treabha-unknown-fintain-113-2",
    "marriage-caitriona-fintain--dughall-1609-craobhan",
    "marriage-muireadhach-1627-fintain--oonaach-1630-mata",
    "marriage-diarmuid-1628-ui-faill-duibhne--oithiona-1632-fintain",
    "marriage-nechtan-1627-torcmhar--treabha-1632-fintain",
    "marriage-eadaoin-1636-cleirigh--fingin-1634-fintain",
    "marriage-crystin-ruari-dinefwr",
    "marriage-drwst-gormlaith-tir-addawol",
    "marriage-saoirse-1652-ceinselaig--zephen-fintain",
    "marriage-eoghanas-1656-fintain--hoilbhe-unknown-fintain-133-3",
    "marriage-eachan-1669-fintain--maighread-1673-cein",
    "marriage-brighdeach-1680-fintain--giollaach-1679-ceallaigh",
    "marriage-caolan-1676-arduinna--talullaan-1680-fintain",
    "marriage-gordanach-1675-fintain--hailidhe-1678-dobhar",
    "marriage-deirdreas-1676-fintain--fionnlagh-1672-suilgeach",
    "marriage-tailltein-unknown-fintain-151-1--urramach-1678-fintain",
    "marriage-brionnflaith-1697-tiran-treathai--cethern-1692-fintain",
    "marriage-ronanach-1698-morna--teaganach-1701-fintain",
    "marriage-fingin-1705-fintain--jilbhe-1709-ness",
    "marriage-baodan-1698-fintain--ysolde-unknown-fintain-169-0",
    "marriage-meirion-diahan",
    "marriage-eamon-1705-fintain--reamha-unknown-fintain-169-2",
    "marriage-gordanach-1694-lasgair--mornain-1699-fintain",
    "marriage-caitriona-1703-fintain--muiredach-1700-haeghra"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-edana-unknown-fintain-91-0--muireadhach-founder-fintain",
      "childIds": [
        "jodhran-1587-fintain",
        "talullaan-1607-fintain",
        "muiredach-1589-fintain"
      ],
      "timeJumpId": "gap-aislearneach-fintain-founders"
    },
    {
      "partnershipId": "marriage-eireann-1589-morna--jodhran-1587-fintain",
      "childIds": [
        "urramach-1607-fintain",
        "deidreas-1612-fintain"
      ]
    },
    {
      "partnershipId": "marriage-mornainin-1585-ceallaigh--muiredach-1589-fintain",
      "childIds": [
        "cethern-1610-fintain",
        "caitriona-fintain"
      ]
    },
    {
      "partnershipId": "marriage-eilidhan-1608-nessa--urramach-1607-fintain",
      "childIds": [
        "muireadhach-1627-fintain",
        "oithiona-1632-fintain"
      ]
    },
    {
      "partnershipId": "marriage-cethern-1610-fintain--treabha-unknown-fintain-113-2",
      "childIds": [
        "treabha-1632-fintain",
        "fingin-1634-fintain"
      ]
    },
    {
      "partnershipId": "marriage-muireadhach-1627-fintain--oonaach-1630-mata",
      "childIds": [
        "ruari-fintain",
        "gormlaith-fintain"
      ]
    },
    {
      "partnershipId": "marriage-eadaoin-1636-cleirigh--fingin-1634-fintain",
      "childIds": [
        "zephen-fintain",
        "eoghanas-1656-fintain"
      ]
    },
    {
      "partnershipId": "marriage-crystin-ruari-dinefwr",
      "childIds": [
        "eachan-1669-fintain",
        "brighdeach-1680-fintain",
        "talullaan-1680-fintain",
        "oranan-1684-fintain",
        "gordanach-1675-fintain"
      ]
    },
    {
      "partnershipId": "marriage-eoghanas-1656-fintain--hoilbhe-unknown-fintain-133-3",
      "childIds": [
        "deirdreas-1676-fintain",
        "urramach-1678-fintain"
      ]
    },
    {
      "partnershipId": "marriage-eachan-1669-fintain--maighread-1673-cein",
      "childIds": [
        "cethern-1692-fintain",
        "teaganach-1701-fintain",
        "edana-1703-fintain",
        "fingin-1705-fintain"
      ]
    },
    {
      "partnershipId": "marriage-gordanach-1675-fintain--hailidhe-1678-dobhar",
      "childIds": [
        "baodan-1698-fintain",
        "diahan-fintain",
        "eamon-1705-fintain"
      ]
    },
    {
      "partnershipId": "marriage-tailltein-unknown-fintain-151-1--urramach-1678-fintain",
      "childIds": [
        "mornain-1699-fintain",
        "caitriona-1703-fintain"
      ]
    },
    {
      "partnershipId": "marriage-brionnflaith-1697-tiran-treathai--cethern-1692-fintain",
      "childIds": [
        "ramsay-1717-fintain",
        "oithiona-1723-fintain"
      ]
    },
    {
      "partnershipId": "marriage-fingin-1705-fintain--jilbhe-1709-ness",
      "childIds": [
        "ruari-1730-fintain",
        "maelas-1735-fintain"
      ]
    },
    {
      "partnershipId": "marriage-baodan-1698-fintain--ysolde-unknown-fintain-169-0",
      "childIds": [
        "ealag-1721-fintain",
        "eoghan-1725-fintain",
        "oideach-1729-fintain"
      ]
    },
    {
      "partnershipId": "marriage-eamon-1705-fintain--reamha-unknown-fintain-169-2",
      "childIds": [
        "hoilbhe-1726-fintain",
        "treabha-1732-fintain"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-lorgain-1603-luchdon--talullaan-1607-fintain",
      "targetFamilyId": "haus-luchdon",
      "houseId": "house-luchdon"
    },
    {
      "partnershipId": "marriage-beiste-1609-tiran-treathai--deidreas-1612-fintain",
      "targetFamilyId": "haus-tiran-treathai",
      "houseId": "house-tiran-treathai"
    },
    {
      "partnershipId": "marriage-caitriona-fintain--dughall-1609-craobhan",
      "targetFamilyId": "haus-craobhan",
      "houseId": "house-craobhan"
    },
    {
      "partnershipId": "marriage-diarmuid-1628-ui-faill-duibhne--oithiona-1632-fintain",
      "targetFamilyId": "haus-ui-faill-duibhne",
      "houseId": "house-ui-faill-duibhne"
    },
    {
      "partnershipId": "marriage-nechtan-1627-torcmhar--treabha-1632-fintain",
      "targetFamilyId": "haus-torcmhar",
      "houseId": "house-torcmhar"
    },
    {
      "partnershipId": "marriage-drwst-gormlaith-tir-addawol",
      "targetFamilyId": "haus-tir-addawol",
      "houseId": "house-tir-addawol"
    },
    {
      "partnershipId": "marriage-saoirse-1652-ceinselaig--zephen-fintain",
      "targetFamilyId": "haus-ua-nic-ceinselaig",
      "houseId": "house-ua-nic-ceinselaig"
    },
    {
      "partnershipId": "marriage-brighdeach-1680-fintain--giollaach-1679-ceallaigh",
      "targetFamilyId": "haus-ceallaigh",
      "houseId": "house-ceallaigh"
    },
    {
      "partnershipId": "marriage-caolan-1676-arduinna--talullaan-1680-fintain",
      "targetFamilyId": "haus-arduinna",
      "houseId": "house-arduinna"
    },
    {
      "partnershipId": "marriage-deirdreas-1676-fintain--fionnlagh-1672-suilgeach",
      "targetFamilyId": "haus-suilgeach",
      "houseId": "house-suilgeach"
    },
    {
      "partnershipId": "marriage-ronanach-1698-morna--teaganach-1701-fintain",
      "targetFamilyId": "haus-morna",
      "houseId": "house-morna"
    },
    {
      "partnershipId": "marriage-meirion-diahan",
      "targetFamilyId": "haus-grawn",
      "houseId": "house-grawn"
    },
    {
      "partnershipId": "marriage-gordanach-1694-lasgair--mornain-1699-fintain",
      "targetFamilyId": "haus-lasgair",
      "houseId": "house-lasgair"
    },
    {
      "partnershipId": "marriage-caitriona-1703-fintain--muiredach-1700-haeghra",
      "targetFamilyId": "haus-haeghra",
      "houseId": "house-haeghra"
    }
  ],
  "cadets": [],
  "wards": [
    {
      "personId": "oideach-1729-fintain",
      "targetFamilyId": "haus-cein",
      "houseId": "house-cein",
      "notes": "Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt."
    }
  ],
  "foster": [
    {
      "childId": "mael-1723-mata",
      "parentId": "cethern-1692-fintain"
    }
  ],
  "heads": [
    "muireadhach-founder-fintain",
    "jodhran-1587-fintain",
    "cethern-1610-fintain",
    "muireadhach-1627-fintain",
    "fingin-1634-fintain",
    "ruari-fintain",
    "eoghanas-1656-fintain",
    "eachan-1669-fintain"
  ],
  "titles": {
    "muireadhach-founder-fintain": "Historisches Oberhaupt",
    "jodhran-1587-fintain": "Historisches Oberhaupt",
    "cethern-1610-fintain": "Historisches Oberhaupt",
    "muireadhach-1627-fintain": "Historisches Oberhaupt",
    "fingin-1634-fintain": "Historisches Oberhaupt",
    "ruari-fintain": "Historisches Oberhaupt",
    "eoghanas-1656-fintain": "Historisches Oberhaupt",
    "eachan-1669-fintain": "Mor Tiarna von Tir na Faela",
    "urramach-1678-fintain": "Erbfolge: 1",
    "cethern-1692-fintain": "Erbfolge: 2",
    "fingin-1705-fintain": "Erbfolge: 3",
    "eamon-1705-fintain": "Erbfolge: 4",
    "ramsay-1717-fintain": "Rinderzüchter · aussichtsreicher Nachfolgekandidat"
  },
  "personRoles": {
    "mael-1723-mata": "ward"
  },
  "personExtensions": {},
  "sourceNote": "Eine Überlieferungslücke. Mael Mata ist Cethern zugeordnetes Mündel; Oideach ist nach Céin vermittelt. Muiredach und Mornaínín behalten nach ihren Herkunftsakten getrennt belegte Geburtsjahre.",
  "currentHeadId": "eachan-1669-fintain",
  "heirIds": [
    "urramach-1678-fintain",
    "cethern-1692-fintain",
    "fingin-1705-fintain",
    "eamon-1705-fintain",
    "ramsay-1717-fintain"
  ],
  "description": "Mac’Fintain führt sich auf Muireadhach zurück und sitzt in Croga im Land des Viehs, Tir na Faela. Die Rinderzucht entscheidet über die Führung des Hauses: Unter Aufsicht der Fianna wird beim Tod eines Oberhauptes die erfolgreichste Zucht gekürt. Gegenwärtig regiert Eachan. Der junge, gelehrte Ramsay gilt als vielversprechender Kandidat, während andere Angehörige den Kriegerweg dem überlieferten Züchterleben vorziehen."
});

export const HOUSE_FINTAIN_FAMILY = withAlbenSourcePortraitUpgrade(createAislearneachSourceFamily("fintain", SOURCE));
