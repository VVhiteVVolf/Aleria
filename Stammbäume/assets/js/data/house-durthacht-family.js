import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { createAislearneachSourceFamily } from './aislearneach-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "ardan-founder-durthacht",
    "ainnle-mother-of-eochaidh-durthacht",
    "eochaidh-founder-durthacht",
    "reamonn-founder-durthacht",
    "ainnle-unknown-durthacht-101-0",
    "neidhe-unknown-durthacht-101-1",
    "diarmait-founder-durthacht",
    "lorgain-founder-durthacht",
    "clothru-founder-ceallaigh",
    "draighean-unknown-durthacht-113-1",
    "ruadhan-founder-durthacht",
    "kealtan-founder-durthacht",
    "muireall-founder-ronain",
    "oighreag-unknown-durthacht-125-1",
    "oonaach-1586-durthacht",
    "eochaidh-1580-durthacht",
    "goll-1581-morna",
    "luiseach-1582-midgna",
    "eagon-1600-durthacht",
    "grainne-durthacht",
    "tarlachan-1611-durthacht",
    "gormlaith-1605-ceallaigh",
    "meallan-gallchobhair",
    "eimearin-1616-muileach",
    "padraig-1625-durthacht",
    "aoife-1630-durthacht",
    "hallaith-durthacht",
    "sileach-1628-fiantorc",
    "gearoid-1627-treada",
    "jonaibhi-trodach",
    "cillian-1646-durthacht",
    "aine-1649-durthacht",
    "treasa-durthacht",
    "broccan-1652-durthacht",
    "eabha-1650-magach",
    "barabal-1647-midgna",
    "oirbhealach-1649-leite",
    "jibheann-1655-rioga",
    "eagon-1668-durthacht",
    "eilidh-1673-durthacht",
    "reamonn-1675-durthacht",
    "grainne-1677-durthacht",
    "giollan-durthacht",
    "brychan-durthacht",
    "liadan-1676-durthacht",
    "elbha-1674-roich",
    "aonghas-1670-muileach",
    "fionolaas-1678-cuilen",
    "cael-1673-fiantorc",
    "cuilinn-holloran",
    "hjalmfrid-freiwinter",
    "balthos-1672-ui-faill-duibhne",
    "eochaidh-1694-durthacht",
    "sadhbh-1696-durthacht",
    "kealtan-1700-durthacht",
    "ardan-1712-durthacht",
    "ainnle-1715-durthacht",
    "seanach-1696-durthacht",
    "iolani-1698-durthacht",
    "tiarnan-1703-durthacht",
    "fintanin-1700-durthacht",
    "muirenn-durthacht",
    "ruadhan-1698-durthacht",
    "hallaith-1703-durthacht",
    "raena-1698-morna",
    "lagaid-1689-laga",
    "saoithin-1703-magach",
    "baoigheall-1701-tairise",
    "tameran-1694-ceallaigh",
    "draighean-1705-duff",
    "etain-1704-kerlaouen",
    "coireall-airt",
    "peatharlach-unknown-durthacht-211-0",
    "laisren-1699-treada",
    "eogair-1717-durthacht",
    "gadhra-1722-durthacht",
    "katreen-1725-durthacht",
    "baodan-1725-midgna",
    "hoimin-1720-durthacht",
    "taraan-1724-durthacht",
    "guaire-1727-durthacht",
    "quinn-1722-durthacht",
    "sorchaan-1725-durthacht",
    "nibhn-1724-durthacht",
    "neasa-1728-durthacht",
    "onchu-1723-durthacht",
    "ainean-1726-durthacht",
    "iobu-1730-durthacht",
    "caitlin-1723-durthacht",
    "frida-1726-durthacht"
  ],
  "partnershipIds": [
    "marriage-ainnle-mother-of-eochaidh-durthacht--ardan-founder-durthacht",
    "marriage-ainnle-unknown-durthacht-101-0--eochaidh-founder-durthacht",
    "marriage-neidhe-unknown-durthacht-101-1--reamonn-founder-durthacht",
    "marriage-clothru-founder-ceallaigh--diarmait-founder-durthacht",
    "marriage-draighean-unknown-durthacht-113-1--lorgain-founder-durthacht",
    "marriage-muireall-founder-ronain--ruadhan-founder-durthacht",
    "marriage-kealtan-founder-durthacht--oighreag-unknown-durthacht-125-1",
    "marriage-goll-1581-morna--oonaach-1586-durthacht",
    "marriage-eochaidh-1580-durthacht--luiseach-1582-midgna",
    "marriage-eagon-1600-durthacht--gormlaith-1605-ceallaigh",
    "marriage-meallan-grainne",
    "marriage-eimearin-1616-muileach--tarlachan-1611-durthacht",
    "marriage-padraig-1625-durthacht--sileach-1628-fiantorc",
    "marriage-aoife-1630-durthacht--gearoid-1627-treada",
    "marriage-jonaibhi-hallaith",
    "marriage-cillian-1646-durthacht--eabha-1650-magach",
    "marriage-aine-1649-durthacht--barabal-1647-midgna",
    "marriage-oirbhealach-1649-leite--treasa-durthacht",
    "marriage-broccan-1652-durthacht--jibheann-1655-rioga",
    "marriage-eagon-1668-durthacht--elbha-1674-roich",
    "marriage-aonghas-1670-muileach--eilidh-1673-durthacht",
    "marriage-fionolaas-1678-cuilen--reamonn-1675-durthacht",
    "marriage-cael-1673-fiantorc--grainne-1677-durthacht",
    "marriage-cuilinn-holloran--giollan-durthacht",
    "marriage-hjalmfrid-brychan-freiwinter",
    "marriage-balthos-1672-ui-faill-duibhne--liadan-1676-durthacht",
    "marriage-eochaidh-1694-durthacht--raena-1698-morna",
    "marriage-lagaid-1689-laga--sadhbh-1696-durthacht",
    "marriage-kealtan-1700-durthacht--saoithin-1703-magach",
    "marriage-baoigheall-1701-tairise--seanach-1696-durthacht",
    "marriage-iolani-1698-durthacht--tameran-1694-ceallaigh",
    "marriage-draighean-1705-duff--tiarnan-1703-durthacht",
    "marriage-etain-1704-kerlaouen--fintanin-1700-durthacht",
    "marriage-coireall-muirenn-airt",
    "marriage-peatharlach-unknown-durthacht-211-0--ruadhan-1698-durthacht",
    "marriage-hallaith-1703-durthacht--laisren-1699-treada"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-ainnle-mother-of-eochaidh-durthacht--ardan-founder-durthacht",
      "childIds": [
        "eochaidh-founder-durthacht",
        "reamonn-founder-durthacht"
      ]
    },
    {
      "partnershipId": "marriage-ainnle-unknown-durthacht-101-0--eochaidh-founder-durthacht",
      "childIds": [
        "diarmait-founder-durthacht",
        "lorgain-founder-durthacht"
      ],
      "timeJumpId": "gap-aislearneach-durthacht-eochaidh"
    },
    {
      "partnershipId": "marriage-clothru-founder-ceallaigh--diarmait-founder-durthacht",
      "childIds": [
        "ruadhan-founder-durthacht",
        "kealtan-founder-durthacht"
      ],
      "timeJumpId": "gap-aislearneach-durthacht-diarmait"
    },
    {
      "partnershipId": "marriage-muireall-founder-ronain--ruadhan-founder-durthacht",
      "childIds": [
        "oonaach-1586-durthacht",
        "eochaidh-1580-durthacht"
      ],
      "timeJumpId": "gap-aislearneach-durthacht-ruadhan"
    },
    {
      "partnershipId": "marriage-eochaidh-1580-durthacht--luiseach-1582-midgna",
      "childIds": [
        "eagon-1600-durthacht",
        "grainne-durthacht",
        "tarlachan-1611-durthacht"
      ]
    },
    {
      "partnershipId": "marriage-eagon-1600-durthacht--gormlaith-1605-ceallaigh",
      "childIds": [
        "padraig-1625-durthacht",
        "aoife-1630-durthacht"
      ]
    },
    {
      "partnershipId": "marriage-eimearin-1616-muileach--tarlachan-1611-durthacht",
      "childIds": [
        "hallaith-durthacht"
      ]
    },
    {
      "partnershipId": "marriage-padraig-1625-durthacht--sileach-1628-fiantorc",
      "childIds": [
        "cillian-1646-durthacht",
        "aine-1649-durthacht",
        "treasa-durthacht",
        "broccan-1652-durthacht"
      ]
    },
    {
      "partnershipId": "marriage-cillian-1646-durthacht--eabha-1650-magach",
      "childIds": [
        "eagon-1668-durthacht",
        "eilidh-1673-durthacht",
        "reamonn-1675-durthacht",
        "grainne-1677-durthacht",
        "giollan-durthacht"
      ]
    },
    {
      "partnershipId": "marriage-broccan-1652-durthacht--jibheann-1655-rioga",
      "childIds": [
        "brychan-durthacht",
        "liadan-1676-durthacht"
      ]
    },
    {
      "partnershipId": "marriage-eagon-1668-durthacht--elbha-1674-roich",
      "childIds": [
        "eochaidh-1694-durthacht",
        "sadhbh-1696-durthacht",
        "kealtan-1700-durthacht",
        "ardan-1712-durthacht",
        "ainnle-1715-durthacht"
      ]
    },
    {
      "partnershipId": "marriage-fionolaas-1678-cuilen--reamonn-1675-durthacht",
      "childIds": [
        "seanach-1696-durthacht",
        "iolani-1698-durthacht",
        "tiarnan-1703-durthacht"
      ]
    },
    {
      "partnershipId": "marriage-cuilinn-holloran--giollan-durthacht",
      "childIds": [
        "fintanin-1700-durthacht",
        "muirenn-durthacht"
      ]
    },
    {
      "partnershipId": "marriage-hjalmfrid-brychan-freiwinter",
      "childIds": [
        "ruadhan-1698-durthacht",
        "hallaith-1703-durthacht"
      ]
    },
    {
      "partnershipId": "marriage-eochaidh-1694-durthacht--raena-1698-morna",
      "childIds": [
        "eogair-1717-durthacht",
        "gadhra-1722-durthacht",
        "katreen-1725-durthacht"
      ]
    },
    {
      "partnershipId": "marriage-kealtan-1700-durthacht--saoithin-1703-magach",
      "childIds": [
        "hoimin-1720-durthacht",
        "taraan-1724-durthacht",
        "guaire-1727-durthacht"
      ]
    },
    {
      "partnershipId": "marriage-baoigheall-1701-tairise--seanach-1696-durthacht",
      "childIds": [
        "quinn-1722-durthacht",
        "sorchaan-1725-durthacht"
      ]
    },
    {
      "partnershipId": "marriage-draighean-1705-duff--tiarnan-1703-durthacht",
      "childIds": [
        "nibhn-1724-durthacht",
        "neasa-1728-durthacht"
      ]
    },
    {
      "partnershipId": "marriage-etain-1704-kerlaouen--fintanin-1700-durthacht",
      "childIds": [
        "onchu-1723-durthacht",
        "ainean-1726-durthacht",
        "iobu-1730-durthacht"
      ]
    },
    {
      "partnershipId": "marriage-peatharlach-unknown-durthacht-211-0--ruadhan-1698-durthacht",
      "childIds": [
        "caitlin-1723-durthacht",
        "frida-1726-durthacht"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-goll-1581-morna--oonaach-1586-durthacht",
      "targetFamilyId": "haus-morna",
      "houseId": "house-morna"
    },
    {
      "partnershipId": "marriage-meallan-grainne",
      "targetFamilyId": "haus-gallchobhair",
      "houseId": "house-gallchobhair"
    },
    {
      "partnershipId": "marriage-aoife-1630-durthacht--gearoid-1627-treada",
      "targetFamilyId": "haus-treada",
      "houseId": "house-treada"
    },
    {
      "partnershipId": "marriage-jonaibhi-hallaith",
      "targetFamilyId": "haus-ard-trodach",
      "houseId": "house-trodach"
    },
    {
      "partnershipId": "marriage-aine-1649-durthacht--barabal-1647-midgna",
      "targetFamilyId": "haus-midgna",
      "houseId": "house-midgna"
    },
    {
      "partnershipId": "marriage-oirbhealach-1649-leite--treasa-durthacht",
      "targetFamilyId": "haus-dal-leite",
      "houseId": "house-dal-leite"
    },
    {
      "partnershipId": "marriage-aonghas-1670-muileach--eilidh-1673-durthacht",
      "targetFamilyId": "haus-muileach",
      "houseId": "house-muileach"
    },
    {
      "partnershipId": "marriage-cael-1673-fiantorc--grainne-1677-durthacht",
      "targetFamilyId": "haus-fiantorc",
      "houseId": "house-fiantorc"
    },
    {
      "partnershipId": "marriage-balthos-1672-ui-faill-duibhne--liadan-1676-durthacht",
      "targetFamilyId": "haus-ui-faill-duibhne",
      "houseId": "house-ui-faill-duibhne"
    },
    {
      "partnershipId": "marriage-lagaid-1689-laga--sadhbh-1696-durthacht",
      "targetFamilyId": "haus-laga",
      "houseId": "house-laga"
    },
    {
      "partnershipId": "marriage-iolani-1698-durthacht--tameran-1694-ceallaigh",
      "targetFamilyId": "haus-ceallaigh",
      "houseId": "house-ceallaigh"
    },
    {
      "partnershipId": "marriage-coireall-muirenn-airt",
      "targetFamilyId": "haus-mac-airt",
      "houseId": "house-mac-airt"
    },
    {
      "partnershipId": "marriage-hallaith-1703-durthacht--laisren-1699-treada",
      "targetFamilyId": "haus-treada",
      "houseId": "house-treada"
    }
  ],
  "cadets": [
    {
      "partnershipId": "marriage-neidhe-unknown-durthacht-101-1--reamonn-founder-durthacht",
      "targetFamilyId": "haus-midgna"
    },
    {
      "partnershipId": "marriage-draighean-unknown-durthacht-113-1--lorgain-founder-durthacht",
      "targetFamilyId": "haus-fiantorc"
    },
    {
      "partnershipId": "marriage-kealtan-founder-durthacht--oighreag-unknown-durthacht-125-1",
      "targetFamilyId": "haus-treada"
    }
  ],
  "wards": [
    {
      "personId": "guaire-1727-durthacht",
      "targetFamilyId": "haus-roich",
      "houseId": "house-roich",
      "notes": "Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt."
    },
    {
      "personId": "ainean-1726-durthacht",
      "targetFamilyId": "haus-nessa",
      "houseId": "house-nessa",
      "notes": "Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt."
    }
  ],
  "foster": [
    {
      "childId": "baodan-1725-midgna",
      "parentId": "eochaidh-1694-durthacht"
    }
  ],
  "heads": [
    "eochaidh-founder-durthacht",
    "diarmait-founder-durthacht",
    "ruadhan-founder-durthacht",
    "eochaidh-1580-durthacht",
    "eagon-1600-durthacht",
    "padraig-1625-durthacht",
    "cillian-1646-durthacht",
    "eagon-1668-durthacht"
  ],
  "titles": {
    "eochaidh-founder-durthacht": "Hausgründer",
    "diarmait-founder-durthacht": "Historisches Oberhaupt",
    "ruadhan-founder-durthacht": "Historisches Oberhaupt",
    "eochaidh-1580-durthacht": "Historisches Oberhaupt",
    "eagon-1600-durthacht": "Historisches Oberhaupt",
    "padraig-1625-durthacht": "Historisches Oberhaupt",
    "cillian-1646-durthacht": "Historisches Oberhaupt",
    "eagon-1668-durthacht": "Mor Tiarna von Tir na Tirth · Fianna",
    "eochaidh-1694-durthacht": "Baron",
    "eogair-1717-durthacht": "Erbfolge: 2",
    "gadhra-1722-durthacht": "Erbfolge: 3",
    "kealtan-1700-durthacht": "Laird"
  },
  "personRoles": {
    "baodan-1725-midgna": "ward"
  },
  "personExtensions": {},
  "sourceNote": "Ardán und Ainnle sind Eltern der Gründer Eochaidh und Réamonn, keine zusätzlichen Durthacht-Gründer. Réamonn begründet Midgna; Lorgain Fiantorc und Kealtán Treada. Drei Überlieferungslücken. Baodan Midgna ist aufgenommenes Mündel, Guaire ist nach Roich und Ainean nach Nessa vermittelt.",
  "currentHeadId": "eagon-1668-durthacht",
  "heirIds": [
    "eochaidh-1694-durthacht",
    "eogair-1717-durthacht",
    "gadhra-1722-durthacht"
  ],
  "description": "Mac’Durthacht herrscht von Lorai aus über Tir na Tirth. Die Gründungslegende erzählt von Eochaidh und seinem Bruder Réamonn, deren Rivalität durch die gemeinsame Aufzucht zweier Eber überwunden wurde. Réamonns Linie führte nach Uathneach; später entstanden aus Durthacht die Kadettenhäuser Fiantorc und Treada. Der heutige Mor Tiarna Eagon, ein Fianna, führte im Ceitheach-Krieg den Angriff auf Cliath nach dem Verrat der Duibhne.",
  "founderPartnershipId": "marriage-ainnle-unknown-durthacht-101-0--eochaidh-founder-durthacht",
  "founderId": "eochaidh-founder-durthacht"
});

export const HOUSE_DURTHACHT_FAMILY = withAlbenSourcePortraitUpgrade(createAislearneachSourceFamily("durthacht", SOURCE));
