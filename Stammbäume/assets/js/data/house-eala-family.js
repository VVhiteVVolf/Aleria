import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { createBlaithneachSourceFamily } from './blaithneach-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "lucasach-founder-ronain",
    "earca-unknown-ronain-130-2",
    "gearoidas-eala",
    "liobhan-1614-eala",
    "domhnullan-1608-eala",
    "iseabail-1605-leite",
    "saighir-1614-magach",
    "aodhnach-1608-deaghaide",
    "cuthbert-1622-eala",
    "fionnlagh-1625-eala",
    "feamainn-1626-eala",
    "raghnallog-1628-eala",
    "aingeal-1627-briccne",
    "xoran-1624-cleirigh",
    "maighread-unknown-eala-110-2",
    "lucasach-1645-eala",
    "earca-1656-eala",
    "cathalag-1646-eala",
    "peigas-1658-eala",
    "muireall-1651-ronain",
    "iasgair-1650-feannag",
    "rabhla-1648-nessa",
    "ciaran-1657-magach",
    "gearoidas-1671-eala",
    "sileach-1675-eala",
    "morag-1674-eala",
    "alastar-mac-eala",
    "moninne-1677-magach",
    "maoldonaich-1670-suiste",
    "goraidh-1670-gairner",
    "marsaili-sgwarnog",
    "fionnlagh-1695-eala",
    "liobhan-1696-eala",
    "barabal-eala",
    "domhnullan-1696-eala",
    "mairead-1700-suilgeach",
    "caius-1692-ronain",
    "goirsail-leite",
    "saorlaan-unknown-eala-140-3",
    "ottilde-unknown-eala-140-4",
    "maelach-1722-eala",
    "morag-eala",
    "mairtin-1733-eala",
    "fannach-1723-eala",
    "feamainn-1725-eala",
    "earca-1720-eala",
    "alastar-1725-eala",
    "vear-1734-eala"
  ],
  "partnershipIds": [
    "marriage-earca-unknown-ronain-130-2--lucasach-founder-ronain",
    "marriage-gearoidas-eala--iseabail-1605-leite",
    "marriage-liobhan-1614-eala--saighir-1614-magach",
    "marriage-aodhnach-1608-deaghaide--domhnullan-1608-eala",
    "marriage-aingeal-1627-briccne--fionnlagh-1625-eala",
    "marriage-feamainn-1626-eala--xoran-1624-cleirigh",
    "marriage-maighread-unknown-eala-110-2--raghnallog-1628-eala",
    "marriage-lucasach-1645-eala--muireall-1651-ronain",
    "marriage-earca-1656-eala--iasgair-1650-feannag",
    "marriage-cathalag-1646-eala--rabhla-1648-nessa",
    "marriage-ciaran-1657-magach--peigas-1658-eala",
    "marriage-gearoidas-1671-eala--moninne-1677-magach",
    "marriage-maoldonaich-1670-suiste--sileach-1675-eala",
    "marriage-goraidh-1670-gairner--morag-1674-eala",
    "marriage-marsaili-alastar-sgwarnog",
    "marriage-fionnlagh-1695-eala--mairead-1700-suilgeach",
    "marriage-caius-1692-ronain--liobhan-1696-eala",
    "marriage-barabal-eala--goirsail-leite",
    "marriage-domhnullan-1696-eala--saorlaan-unknown-eala-140-3",
    "affair-domhnullan-1696-eala--ottilde-unknown-eala-140-4"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-earca-unknown-ronain-130-2--lucasach-founder-ronain",
      "childIds": [
        "gearoidas-eala",
        "liobhan-1614-eala",
        "domhnullan-1608-eala"
      ],
      "timeJumpId": "gap-blaithneach-eala-founders"
    },
    {
      "partnershipId": "marriage-gearoidas-eala--iseabail-1605-leite",
      "childIds": [
        "cuthbert-1622-eala",
        "fionnlagh-1625-eala"
      ]
    },
    {
      "partnershipId": "marriage-aodhnach-1608-deaghaide--domhnullan-1608-eala",
      "childIds": [
        "feamainn-1626-eala",
        "raghnallog-1628-eala"
      ]
    },
    {
      "partnershipId": "marriage-aingeal-1627-briccne--fionnlagh-1625-eala",
      "childIds": [
        "lucasach-1645-eala",
        "earca-1656-eala",
        "cathalag-1646-eala"
      ]
    },
    {
      "partnershipId": "marriage-maighread-unknown-eala-110-2--raghnallog-1628-eala",
      "childIds": [
        "peigas-1658-eala"
      ]
    },
    {
      "partnershipId": "marriage-lucasach-1645-eala--muireall-1651-ronain",
      "childIds": [
        "gearoidas-1671-eala",
        "sileach-1675-eala"
      ]
    },
    {
      "partnershipId": "marriage-cathalag-1646-eala--rabhla-1648-nessa",
      "childIds": [
        "morag-1674-eala",
        "alastar-mac-eala"
      ]
    },
    {
      "partnershipId": "marriage-gearoidas-1671-eala--moninne-1677-magach",
      "childIds": [
        "fionnlagh-1695-eala",
        "liobhan-1696-eala",
        "barabal-eala"
      ]
    },
    {
      "partnershipId": "marriage-marsaili-alastar-sgwarnog",
      "childIds": [
        "domhnullan-1696-eala"
      ]
    },
    {
      "partnershipId": "marriage-fionnlagh-1695-eala--mairead-1700-suilgeach",
      "childIds": [
        "maelach-1722-eala",
        "morag-eala",
        "mairtin-1733-eala"
      ]
    },
    {
      "partnershipId": "marriage-barabal-eala--goirsail-leite",
      "childIds": [
        "fannach-1723-eala",
        "feamainn-1725-eala"
      ]
    },
    {
      "partnershipId": "marriage-domhnullan-1696-eala--saorlaan-unknown-eala-140-3",
      "childIds": [
        "earca-1720-eala",
        "alastar-1725-eala"
      ]
    },
    {
      "partnershipId": "affair-domhnullan-1696-eala--ottilde-unknown-eala-140-4",
      "childIds": [
        "vear-1734-eala"
      ],
      "legitimacy": "illegitimate"
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-liobhan-1614-eala--saighir-1614-magach",
      "targetFamilyId": "haus-magach",
      "houseId": "house-magach"
    },
    {
      "partnershipId": "marriage-feamainn-1626-eala--xoran-1624-cleirigh",
      "targetFamilyId": "haus-cleirigh",
      "houseId": "house-cleirigh"
    },
    {
      "partnershipId": "marriage-earca-1656-eala--iasgair-1650-feannag",
      "targetFamilyId": "haus-feannag",
      "houseId": "house-feannag"
    },
    {
      "partnershipId": "marriage-ciaran-1657-magach--peigas-1658-eala",
      "targetFamilyId": "haus-magach",
      "houseId": "house-magach"
    },
    {
      "partnershipId": "marriage-maoldonaich-1670-suiste--sileach-1675-eala",
      "targetFamilyId": "haus-suiste",
      "houseId": "house-suiste"
    },
    {
      "partnershipId": "marriage-goraidh-1670-gairner--morag-1674-eala",
      "targetFamilyId": "haus-gairner",
      "houseId": "house-gairner"
    },
    {
      "partnershipId": "marriage-caius-1692-ronain--liobhan-1696-eala",
      "targetFamilyId": "haus-ronain",
      "houseId": "house-ronain"
    }
  ],
  "cadets": [],
  "wards": [
    {
      "personId": "morag-eala",
      "targetFamilyId": "haus-ruin-ua-laoch",
      "houseId": "house-laoch",
      "notes": "Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt."
    }
  ],
  "foster": [],
  "heads": [
    "lucasach-founder-ronain",
    "gearoidas-eala",
    "fionnlagh-1625-eala",
    "lucasach-1645-eala",
    "gearoidas-1671-eala"
  ],
  "titles": {
    "lucasach-founder-ronain": "Historisches Oberhaupt",
    "gearoidas-eala": "Historisches Oberhaupt",
    "fionnlagh-1625-eala": "Historisches Oberhaupt",
    "lucasach-1645-eala": "Historisches Oberhaupt",
    "gearoidas-1671-eala": "Laird von Cel Bearradh",
    "fionnlagh-1695-eala": "Erbfolge: 1",
    "maelach-1722-eala": "Erbfolge: 2",
    "mairtin-1733-eala": "Erbfolge: 3"
  },
  "personRoles": {
    "vear-1734-eala": "bastard",
    "ottilde-unknown-eala-140-4": "affair"
  },
  "personExtensions": {
    "domhnullan-1696-eala": {
      "chartRepeatForPartnershipIds": [
        "affair-domhnullan-1696-eala--ottilde-unknown-eala-140-4"
      ],
      "chartMultiPartnerLayoutReviewed": true
    },
    "ottilde-unknown-eala-140-4": {
      "chartPartnerMirrorForPartnershipIds": [
        "affair-domhnullan-1696-eala--ottilde-unknown-eala-140-4"
      ]
    }
  },
  "sourceNote": "Lùcasach Ronain begründet Eala. Eine serielle Überlieferungslücke. Cathalag gehört laut Elternspalten und Grafik zu Fionnlagh–Aingeal; Peigas zu Raghnallóg–Maighread. Mórag ist als Mündel an Laoch vermittelt. Ottilde ist eine Bardin aus Mathringen; daraus wird kein Herkunftshaus abgeleitet.",
  "currentHeadId": "gearoidas-1671-eala",
  "heirIds": [
    "fionnlagh-1695-eala",
    "maelach-1722-eala",
    "mairtin-1733-eala"
  ],
  "description": "Ua’Eala geht als Kadettenhaus der Ronain auf Lùcasach zurück und sitzt in Cel Bearradh. Die Geschichte der Familie erinnert an Cuthbert, dessen rätselhaftes Leiden zu spät als Fluch erkannt wurde. Heute steht der angesehene Kriegsveteran Gearoidas an der Spitze des Clans. Die benannte Erbfolge führt über Fionnlagh zu Maelach und Máirtín."
});

export const HOUSE_EALA_FAMILY = withAlbenSourcePortraitUpgrade(createBlaithneachSourceFamily("eala", SOURCE));
