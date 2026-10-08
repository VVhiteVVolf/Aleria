import { createDamhSourceFamily } from './damh-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "ultach-founder-eilitard",
    "iarnach-founder-forsyth",
    "fuirseach-1580-forsyth",
    "caomhog-1583-forsyth",
    "ceilidh-1587-gealan",
    "aoghan-1582-dianaomh",
    "faithleach-1604-forsyth",
    "eadaoin-1608-forsyth",
    "argyle-1610-forsyth",
    "fechin-1606-drummond",
    "briathach-1605-duff",
    "keitha-1613-clannmhar",
    "ultach-1624-forsyth",
    "iarnach-1626-forsyth",
    "goirtin-1631-forsyth",
    "orla-1624-diuid",
    "macraith-1622-culloch",
    "jorunn-1635-oglivy",
    "fuirseach-1645-forsyth",
    "joaigh-1649-forsyth",
    "fionnghuala-forsyth",
    "uinseann-1655-forsyth",
    "pallaigh-1645-dobhar",
    "fergus-1648-urquhart",
    "itan-dianc",
    "kealagh-1657-buadhtreun",
    "faithleach-1664-forsyth",
    "iarbhine-1665-forsyth",
    "argyle-forsyth",
    "nalainn-1678-forsyth",
    "jaimhin-1679-forsyth",
    "fenella-1670-dubglais",
    "domangair-1663-cithrenn",
    "rhondda-dyfrgi",
    "fionnchu-1674-eoghainn",
    "peathra-1680-elid",
    "fearghas-1688-forsyth",
    "ultach-1692-forsyth",
    "siobhan-forsyth",
    "cairell-1698-forsyth",
    "klaihn-1700-forsyth",
    "bochna-1702-forsyth",
    "vadria-1705-forsyth",
    "sitric-1707-forsyth",
    "conaing-1709-forsyth",
    "goirtin-1700-forsyth",
    "iarnach-1703-forsyth",
    "kessog-1694-lockart",
    "thrainn-riesentod",
    "tuiridh-founder-wellenkrone",
    "quiseog-1702-duff",
    "bjrn-unknown-forsyth-61-4",
    "unbekannte-unknown-forsyth-61-5",
    "dervla-1700-oglivy",
    "connla-1713-forsyth",
    "lorgain-1718-forsyth",
    "toirche-1724-forsyth",
    "cuan-1720-forsyth",
    "flann-1725-forsyth",
    "nioran-1721-forsyth",
    "wicche-1727-forsyth",
    "poilin-1720-forsyth",
    "sarnat-1728-forsyth",
    "aoife-1734-forsyth",
    "argyle-founder-forsyth"
  ],
  "partnershipIds": [
    "marriage-iarnach-founder-forsyth--ultach-founder-eilitard",
    "marriage-ceilidh-1587-gealan--fuirseach-1580-forsyth",
    "marriage-aoghan-1582-dianaomh--caomhog-1583-forsyth",
    "marriage-faithleach-1604-forsyth--fechin-1606-drummond",
    "marriage-briathach-1605-duff--eadaoin-1608-forsyth",
    "marriage-argyle-1610-forsyth--keitha-1613-clannmhar",
    "marriage-orla-1624-diuid--ultach-1624-forsyth",
    "marriage-iarnach-1626-forsyth--macraith-1622-culloch",
    "marriage-goirtin-1631-forsyth--jorunn-1635-oglivy",
    "marriage-fuirseach-1645-forsyth--pallaigh-1645-dobhar",
    "marriage-fergus-1648-urquhart--joaigh-1649-forsyth",
    "marriage-itan-fionnghuala-dianc",
    "marriage-kealagh-1657-buadhtreun--uinseann-1655-forsyth",
    "marriage-faithleach-1664-forsyth--fenella-1670-dubglais",
    "marriage-domangair-1663-cithrenn--iarbhine-1665-forsyth",
    "marriage-rhondda-argyle-dyfrgi",
    "marriage-fionnchu-1674-eoghainn--nalainn-1678-forsyth",
    "marriage-jaimhin-1679-forsyth--peathra-1680-elid",
    "marriage-fearghas-1688-forsyth--kessog-1694-lockart",
    "marriage-thrainn-siobhan-riesentod",
    "marriage-cairell-1698-forsyth--tuiridh-founder-wellenkrone",
    "marriage-bochna-1702-forsyth--quiseog-1702-duff",
    "forced-bjrn-unknown-forsyth-61-4--vadria-1705-forsyth",
    "marriage-conaing-1709-forsyth--unbekannte-unknown-forsyth-61-5",
    "marriage-dervla-1700-oglivy--goirtin-1700-forsyth"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-iarnach-founder-forsyth--ultach-founder-eilitard",
      "childIds": [
        "fuirseach-1580-forsyth",
        "caomhog-1583-forsyth"
      ],
      "timeJumpId": "gap-damh-forsyth-founders"
    },
    {
      "partnershipId": "marriage-ceilidh-1587-gealan--fuirseach-1580-forsyth",
      "childIds": [
        "faithleach-1604-forsyth",
        "eadaoin-1608-forsyth",
        "argyle-1610-forsyth"
      ]
    },
    {
      "partnershipId": "marriage-faithleach-1604-forsyth--fechin-1606-drummond",
      "childIds": [
        "ultach-1624-forsyth",
        "iarnach-1626-forsyth"
      ]
    },
    {
      "partnershipId": "marriage-argyle-1610-forsyth--keitha-1613-clannmhar",
      "childIds": [
        "goirtin-1631-forsyth"
      ]
    },
    {
      "partnershipId": "marriage-orla-1624-diuid--ultach-1624-forsyth",
      "childIds": [
        "fuirseach-1645-forsyth",
        "joaigh-1649-forsyth"
      ]
    },
    {
      "partnershipId": "marriage-goirtin-1631-forsyth--jorunn-1635-oglivy",
      "childIds": [
        "fionnghuala-forsyth",
        "uinseann-1655-forsyth"
      ]
    },
    {
      "partnershipId": "marriage-fuirseach-1645-forsyth--pallaigh-1645-dobhar",
      "childIds": [
        "faithleach-1664-forsyth",
        "iarbhine-1665-forsyth",
        "argyle-forsyth"
      ]
    },
    {
      "partnershipId": "marriage-kealagh-1657-buadhtreun--uinseann-1655-forsyth",
      "childIds": [
        "nalainn-1678-forsyth",
        "jaimhin-1679-forsyth"
      ]
    },
    {
      "partnershipId": "marriage-faithleach-1664-forsyth--fenella-1670-dubglais",
      "childIds": [
        "fearghas-1688-forsyth",
        "ultach-1692-forsyth",
        "siobhan-forsyth",
        "cairell-1698-forsyth",
        "klaihn-1700-forsyth",
        "bochna-1702-forsyth",
        "vadria-1705-forsyth",
        "sitric-1707-forsyth",
        "conaing-1709-forsyth"
      ]
    },
    {
      "partnershipId": "marriage-jaimhin-1679-forsyth--peathra-1680-elid",
      "childIds": [
        "goirtin-1700-forsyth",
        "iarnach-1703-forsyth"
      ]
    },
    {
      "partnershipId": "marriage-fearghas-1688-forsyth--kessog-1694-lockart",
      "childIds": [
        "connla-1713-forsyth",
        "lorgain-1718-forsyth",
        "toirche-1724-forsyth"
      ]
    },
    {
      "partnershipId": "marriage-cairell-1698-forsyth--tuiridh-founder-wellenkrone",
      "childIds": [
        "cuan-1720-forsyth",
        "flann-1725-forsyth"
      ]
    },
    {
      "partnershipId": "marriage-bochna-1702-forsyth--quiseog-1702-duff",
      "childIds": [
        "nioran-1721-forsyth",
        "wicche-1727-forsyth"
      ]
    },
    {
      "partnershipId": "forced-bjrn-unknown-forsyth-61-4--vadria-1705-forsyth",
      "childIds": [
        "poilin-1720-forsyth"
      ],
      "legitimacy": "illegitimate"
    },
    {
      "partnershipId": "marriage-conaing-1709-forsyth--unbekannte-unknown-forsyth-61-5",
      "childIds": [
        "sarnat-1728-forsyth",
        "aoife-1734-forsyth"
      ]
    },
    {
      "partnershipId": "marriage-dervla-1700-oglivy--goirtin-1700-forsyth",
      "childIds": [
        "argyle-founder-forsyth"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-aoghan-1582-dianaomh--caomhog-1583-forsyth",
      "targetFamilyId": "haus-dianaomh",
      "houseId": "house-dianaomh"
    },
    {
      "partnershipId": "marriage-briathach-1605-duff--eadaoin-1608-forsyth",
      "targetFamilyId": "haus-duff",
      "houseId": "house-duff"
    },
    {
      "partnershipId": "marriage-iarnach-1626-forsyth--macraith-1622-culloch",
      "targetFamilyId": "haus-culloch",
      "houseId": "house-culloch"
    },
    {
      "partnershipId": "marriage-fergus-1648-urquhart--joaigh-1649-forsyth",
      "targetFamilyId": "haus-urquhart",
      "houseId": "house-urquhart"
    },
    {
      "partnershipId": "marriage-itan-fionnghuala-dianc",
      "targetFamilyId": "haus-dianc",
      "houseId": "house-dianc"
    },
    {
      "partnershipId": "marriage-domangair-1663-cithrenn--iarbhine-1665-forsyth",
      "targetFamilyId": "haus-cithrenn",
      "houseId": "house-cithrenn"
    },
    {
      "partnershipId": "marriage-rhondda-argyle-dyfrgi",
      "targetFamilyId": "haus-dyfrgi",
      "houseId": "house-dyfrgi"
    },
    {
      "partnershipId": "marriage-fionnchu-1674-eoghainn--nalainn-1678-forsyth",
      "targetFamilyId": "haus-eoghainn",
      "houseId": "house-eoghainn"
    },
    {
      "partnershipId": "marriage-thrainn-siobhan-riesentod",
      "targetFamilyId": "haus-riesentod",
      "houseId": "house-riesentod"
    }
  ],
  "cadets": [],
  "wards": [
    {
      "personId": "toirche-1724-forsyth",
      "targetFamilyId": "haus-dyfrgi",
      "houseId": "house-dyfrgi",
      "notes": "Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt."
    },
    {
      "personId": "flann-1725-forsyth",
      "targetFamilyId": "haus-dyfrgi",
      "houseId": "house-dyfrgi",
      "notes": "Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt."
    },
    {
      "personId": "wicche-1727-forsyth",
      "targetFamilyId": "haus-dyfrgi",
      "houseId": "house-dyfrgi",
      "notes": "Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt."
    },
    {
      "personId": "sarnat-1728-forsyth",
      "targetFamilyId": "haus-dyfrgi",
      "houseId": "house-dyfrgi",
      "notes": "Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt."
    },
    {
      "personId": "aoife-1734-forsyth",
      "targetFamilyId": "haus-dyfrgi",
      "houseId": "house-dyfrgi",
      "notes": "Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt."
    }
  ],
  "foster": [],
  "heads": [],
  "titles": {},
  "personRoles": {
    "poilin-1720-forsyth": "bastard",
    "bjrn-unknown-forsyth-61-4": "forced"
  },
  "personExtensions": {},
  "sourceNote": "Eine Überlieferungslücke. Die nun vorliegende Forsyth-Grafik ersetzt die bisherige offene Vorbereitung. Iarbhine wurde laut Nutzer 1665 geboren. Vadria–Bjørn ist eine erzwungene Verbindung; Poilín ihr uneheliches Kind. Conaings Eheperson und Argyles jüngstes Geburtsjahr bleiben offen. Fünf Kinder sind als Mündel an Dwrgi gegeben.",
  "currentHeadId": "",
  "heirIds": [],
  "description": "Ó Forsyth ist das Laird-Haus von Inverfay in Tir na Damh; seine bereits verzeichnete zusätzliche Zuordnung in Mathgham bleibt erhalten. Die Überlieferung führt auf Ultach Eilitard und Iarnach zurück. Nach einer Generationenlücke entfalten sich mehrere Zweige, darunter die große Familie Fáithleachs und Fenella Dubglais’. Verbindungen bestehen unter anderem zu Dianaomh, Drummond, Dobhar und Elid. Fünf jüngere Angehörige sind als Mündel bei Dyfrgi verzeichnet. Die historische Herrschaft bleibt auch während des Krieges mit Skjaerheim maßgeblich.",
  "warriorReference": ""
});

export const HOUSE_FORSYTH_FAMILY = createDamhSourceFamily("forsyth", SOURCE);
