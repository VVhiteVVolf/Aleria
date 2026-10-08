import { createMathghamSourceFamily } from './mathgham-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "murdoch-founder-fiorghra",
    "isla-unknown-fiorghra-88-0",
    "finlay-1582-fiorghra",
    "volla-1586-fiorghra",
    "dubessa-1583-durachd",
    "malcolm-1586-ness",
    "murdoch-1604-fiorghra",
    "kenna-1610-fiorghra",
    "isla-1612-fiorghra",
    "draighean-1609-dundas",
    "sulach-1609-haig",
    "mael-unknown-fiorghra-110-2",
    "sorley-1627-fiorghra",
    "peatharlach-1631-fiorghra",
    "diarmait-1634-fiorghra",
    "peadar-1630-fiorghra",
    "blaithin-1631-luga",
    "giollan-1628-eoghainn",
    "searbhi-1634-muirgheal",
    "giollan-1650-fiorghra",
    "catriona-1655-fiorghra",
    "keir-1655-fiorghra",
    "loinneog-1657-fiorghra",
    "jiarla-1655-ness",
    "aodh-1655-lockart",
    "veilleann-1655-erskine",
    "jodhran-1657-diuid",
    "murdoch-1674-fiorghra",
    "gobaith-fioghrrha",
    "luibheas-1678-fiorghra",
    "nuallan-1676-fiorghra",
    "uisigh-1675-carnegie",
    "odhranag-leite",
    "hoiteann-1678-durachd",
    "pailis-1677-wemyss",
    "uilliam-1695-fiorghra",
    "fenella-1700-fiorghra",
    "finlay-1700-fiorghra",
    "fiona-1703-fiorghra",
    "sorley-1699-fiorghra",
    "sadbh-1698-diuid",
    "malcolm-1696-ness",
    "onora-1704-luga",
    "searach-1697-stwatchn",
    "yluach-1703-arbhair",
    "tavish-1720-fiorghra",
    "catriona-1723-fiorghra",
    "keir-1726-fiorghra",
    "isla-1724-fiorghra",
    "diarmait-1728-fiorghra",
    "iona-1722-fiorghra",
    "laeg-1729-fiorghra"
  ],
  "partnershipIds": [
    "marriage-isla-unknown-fiorghra-88-0--murdoch-founder-fiorghra",
    "marriage-dubessa-1583-durachd--finlay-1582-fiorghra",
    "marriage-malcolm-1586-ness--volla-1586-fiorghra",
    "marriage-draighean-1609-dundas--murdoch-1604-fiorghra",
    "marriage-kenna-1610-fiorghra--sulach-1609-haig",
    "forced-isla-1612-fiorghra--mael-unknown-fiorghra-110-2",
    "marriage-blaithin-1631-luga--sorley-1627-fiorghra",
    "marriage-giollan-1628-eoghainn--peatharlach-1631-fiorghra",
    "marriage-diarmait-1634-fiorghra--searbhi-1634-muirgheal",
    "marriage-giollan-1650-fiorghra--jiarla-1655-ness",
    "marriage-aodh-1655-lockart--catriona-1655-fiorghra",
    "marriage-keir-1655-fiorghra--veilleann-1655-erskine",
    "marriage-jodhran-1657-diuid--loinneog-1657-fiorghra",
    "marriage-murdoch-1674-fiorghra--uisigh-1675-carnegie",
    "marriage-gobaith-fioghrrha--odhranag-leite",
    "marriage-hoiteann-1678-durachd--luibheas-1678-fiorghra",
    "marriage-nuallan-1676-fiorghra--pailis-1677-wemyss",
    "marriage-sadbh-1698-diuid--uilliam-1695-fiorghra",
    "marriage-fenella-1700-fiorghra--malcolm-1696-ness",
    "marriage-finlay-1700-fiorghra--onora-1704-luga",
    "marriage-fiona-1703-fiorghra--searach-1697-stwatchn",
    "marriage-sorley-1699-fiorghra--yluach-1703-arbhair"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-isla-unknown-fiorghra-88-0--murdoch-founder-fiorghra",
      "childIds": [
        "finlay-1582-fiorghra",
        "volla-1586-fiorghra"
      ],
      "timeJumpId": "gap-mathgham-fiorghra-founders"
    },
    {
      "partnershipId": "marriage-dubessa-1583-durachd--finlay-1582-fiorghra",
      "childIds": [
        "murdoch-1604-fiorghra",
        "kenna-1610-fiorghra",
        "isla-1612-fiorghra"
      ]
    },
    {
      "partnershipId": "marriage-draighean-1609-dundas--murdoch-1604-fiorghra",
      "childIds": [
        "sorley-1627-fiorghra",
        "peatharlach-1631-fiorghra",
        "diarmait-1634-fiorghra"
      ]
    },
    {
      "partnershipId": "forced-isla-1612-fiorghra--mael-unknown-fiorghra-110-2",
      "childIds": [
        "peadar-1630-fiorghra"
      ],
      "legitimacy": "illegitimate"
    },
    {
      "partnershipId": "marriage-blaithin-1631-luga--sorley-1627-fiorghra",
      "childIds": [
        "giollan-1650-fiorghra",
        "catriona-1655-fiorghra"
      ]
    },
    {
      "partnershipId": "marriage-diarmait-1634-fiorghra--searbhi-1634-muirgheal",
      "childIds": [
        "keir-1655-fiorghra",
        "loinneog-1657-fiorghra"
      ]
    },
    {
      "partnershipId": "marriage-giollan-1650-fiorghra--jiarla-1655-ness",
      "childIds": [
        "murdoch-1674-fiorghra",
        "gobaith-fioghrrha",
        "luibheas-1678-fiorghra"
      ]
    },
    {
      "partnershipId": "marriage-keir-1655-fiorghra--veilleann-1655-erskine",
      "childIds": [
        "nuallan-1676-fiorghra"
      ]
    },
    {
      "partnershipId": "marriage-murdoch-1674-fiorghra--uisigh-1675-carnegie",
      "childIds": [
        "uilliam-1695-fiorghra",
        "fenella-1700-fiorghra"
      ]
    },
    {
      "partnershipId": "marriage-hoiteann-1678-durachd--luibheas-1678-fiorghra",
      "childIds": [
        "finlay-1700-fiorghra",
        "fiona-1703-fiorghra"
      ]
    },
    {
      "partnershipId": "marriage-nuallan-1676-fiorghra--pailis-1677-wemyss",
      "childIds": [
        "sorley-1699-fiorghra"
      ]
    },
    {
      "partnershipId": "marriage-sadbh-1698-diuid--uilliam-1695-fiorghra",
      "childIds": [
        "tavish-1720-fiorghra",
        "catriona-1723-fiorghra",
        "keir-1726-fiorghra"
      ]
    },
    {
      "partnershipId": "marriage-finlay-1700-fiorghra--onora-1704-luga",
      "childIds": [
        "isla-1724-fiorghra",
        "diarmait-1728-fiorghra"
      ]
    },
    {
      "partnershipId": "marriage-sorley-1699-fiorghra--yluach-1703-arbhair",
      "childIds": [
        "iona-1722-fiorghra",
        "laeg-1729-fiorghra"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-malcolm-1586-ness--volla-1586-fiorghra",
      "targetFamilyId": "haus-ness",
      "houseId": "house-ness"
    },
    {
      "partnershipId": "marriage-kenna-1610-fiorghra--sulach-1609-haig",
      "targetFamilyId": "haus-haig",
      "houseId": "house-haig"
    },
    {
      "partnershipId": "marriage-giollan-1628-eoghainn--peatharlach-1631-fiorghra",
      "targetFamilyId": "haus-eoghainn",
      "houseId": "house-eoghainn"
    },
    {
      "partnershipId": "marriage-aodh-1655-lockart--catriona-1655-fiorghra",
      "targetFamilyId": "haus-lockart",
      "houseId": "house-lockart"
    },
    {
      "partnershipId": "marriage-jodhran-1657-diuid--loinneog-1657-fiorghra",
      "targetFamilyId": "haus-diuid",
      "houseId": "house-diuid"
    },
    {
      "partnershipId": "marriage-gobaith-fioghrrha--odhranag-leite",
      "targetFamilyId": "haus-dal-leite",
      "houseId": "house-dal-leite"
    },
    {
      "partnershipId": "marriage-fenella-1700-fiorghra--malcolm-1696-ness",
      "targetFamilyId": "haus-ness",
      "houseId": "house-ness"
    },
    {
      "partnershipId": "marriage-fiona-1703-fiorghra--searach-1697-stwatchn",
      "targetFamilyId": "haus-stwatchn",
      "houseId": "house-stwatchn"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [],
  "heads": [
    "murdoch-founder-fiorghra",
    "finlay-1582-fiorghra",
    "murdoch-1604-fiorghra",
    "sorley-1627-fiorghra",
    "giollan-1650-fiorghra"
  ],
  "titles": {
    "murdoch-founder-fiorghra": "Historisches Oberhaupt",
    "finlay-1582-fiorghra": "Historisches Oberhaupt",
    "murdoch-1604-fiorghra": "Historisches Oberhaupt",
    "sorley-1627-fiorghra": "Historisches Oberhaupt",
    "giollan-1650-fiorghra": "Dun-Tiarna · Oberhaupt seit 1711"
  },
  "personRoles": {
    "peadar-1630-fiorghra": "bastard",
    "mael-unknown-fiorghra-110-2": "forced"
  },
  "personExtensions": {},
  "sourceNote": "Eine serielle Überlieferungslücke. Isla und Mael werden als erzwungene Verbindung, Peadar Namara als ihr ausdrücklich genanntes uneheliches Kind geführt. Die Gegenbeziehungen zu Ness, Lockart, Diuid, Haig, Dundas und Stwatchn bleiben identisch.",
  "currentHeadId": "giollan-1650-fiorghra",
  "heirIds": [],
  "description": "Tir An Fiorghra von Lochcaeron bewahrt die auf Murdoch zurückgeführte Brennkunst. Whiskyherstellung, Fassbau, Landwirtschaft und Gastfreundschaft verbinden den Clan mit seinen Handwerkern und Handelspartnern. Verdiente Handwerker können in den Sept-Stand aufsteigen. Seine Krieger führen Schwert und Schild zum Schutz der Siedlungen und Brennereien. Giollán steht seit 1711 an der Spitze des Hauses. Das Motto lautet: Zeit veredelt Stärke. Im kriegsgezeichneten Faelaorn folgt das Register weiterhin den alten Herrschaften."
});

export const HOUSE_FIORGHRA_FAMILY = createMathghamSourceFamily("fiorghra", SOURCE);
