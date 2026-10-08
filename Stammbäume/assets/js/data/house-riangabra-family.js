import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { withBlaithneachSourceCounterUpgrade } from './blaithneach-source-counter-upgrade.js';
import { createDunfalSourceFamily } from './dunfal-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "treabhnan-founder-riangabra",
    "glaisne-unknown-riangabra-91-0",
    "malach-1591-riangabra",
    "ealar-1596-riangabra",
    "caireann-1592-duilb",
    "gearoid-1591-neill",
    "harailt-riangabra",
    "kavan-1611-riangabra",
    "breasal-1609-riangabra",
    "haileigh-1610-mochoe",
    "peadarog-1607-birn",
    "iomhair-unknown-riangabra-113-2",
    "tormodh-1628-riangabra",
    "sorcha-1636-riangabra",
    "donal-1628-riangabra",
    "ceana-1630-nuadat",
    "gilleasbuig-1634-eachtrai",
    "peagan-1632-casur",
    "treabhnan-1649-riangabra",
    "vaithreach-1651-riangabra",
    "yulrach-1652-riangabra",
    "liadan-1652-morath",
    "banbhin-1648-aonghusa",
    "quiseog-unknown-riangabra-133-2",
    "gluineach-1670-riangabra",
    "dalara-riangabra",
    "meadhbhan-1675-riangabra",
    "malach-1672-riangabra",
    "aisling-1676-goidin",
    "eachan-1670-bhaird",
    "deirdre-1675-salaig",
    "tormodh-1696-riangabra",
    "glaisne-1695-riangabra",
    "peadhra-unknown-riangabra-153-0",
    "mairtin-unknown-riangabra-153-1",
    "loeg-unknown-riangabra-153-2",
    "zosie-unknown-riangabra-153-3",
    "zephen-1720-riangabra",
    "harailt-1716-riangabra",
    "sile-1721-riangabra",
    "cillian-1723-riangabra",
    "ferdiad-1718-riangabra",
    "flerdiad-1718-riangabra",
    "iollan-1726-riangabra",
    "yllana-1723-chulainn"
  ],
  "partnershipIds": [
    "marriage-glaisne-unknown-riangabra-91-0--treabhnan-founder-riangabra",
    "marriage-caireann-1592-duilb--malach-1591-riangabra",
    "marriage-ealar-1596-riangabra--gearoid-1591-neill",
    "marriage-haileigh-1610-mochoe--harailt-riangabra",
    "marriage-kavan-1611-riangabra--peadarog-1607-birn",
    "marriage-breasal-1609-riangabra--iomhair-unknown-riangabra-113-2",
    "marriage-ceana-1630-nuadat--tormodh-1628-riangabra",
    "marriage-gilleasbuig-1634-eachtrai--sorcha-1636-riangabra",
    "marriage-donal-1628-riangabra--peagan-1632-casur",
    "marriage-liadan-1652-morath--treabhnan-1649-riangabra",
    "marriage-banbhin-1648-aonghusa--vaithreach-1651-riangabra",
    "marriage-quiseog-unknown-riangabra-133-2--yulrach-1652-riangabra",
    "marriage-aisling-1676-goidin--gluineach-1670-riangabra",
    "marriage-dalara-riangabra--eachan-1670-bhaird",
    "marriage-deirdre-1675-salaig--meadhbhan-1675-riangabra",
    "marriage-peadhra-unknown-riangabra-153-0--tormodh-1696-riangabra",
    "marriage-glaisne-1695-riangabra--mairtin-unknown-riangabra-153-1",
    "marriage-glaisne-1695-riangabra--loeg-unknown-riangabra-153-2",
    "affair-loeg-unknown-riangabra-153-2--zosie-unknown-riangabra-153-3",
    "engagement-harailt-1716-riangabra--yllana-1723-chulainn"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-glaisne-unknown-riangabra-91-0--treabhnan-founder-riangabra",
      "childIds": [
        "malach-1591-riangabra",
        "ealar-1596-riangabra"
      ],
      "timeJumpId": "gap-dunfal-riangabra-founders"
    },
    {
      "partnershipId": "marriage-caireann-1592-duilb--malach-1591-riangabra",
      "childIds": [
        "harailt-riangabra",
        "kavan-1611-riangabra",
        "breasal-1609-riangabra"
      ]
    },
    {
      "partnershipId": "marriage-haileigh-1610-mochoe--harailt-riangabra",
      "childIds": [
        "tormodh-1628-riangabra",
        "sorcha-1636-riangabra"
      ]
    },
    {
      "partnershipId": "marriage-breasal-1609-riangabra--iomhair-unknown-riangabra-113-2",
      "childIds": [
        "donal-1628-riangabra"
      ]
    },
    {
      "partnershipId": "marriage-ceana-1630-nuadat--tormodh-1628-riangabra",
      "childIds": [
        "treabhnan-1649-riangabra",
        "vaithreach-1651-riangabra"
      ]
    },
    {
      "partnershipId": "marriage-donal-1628-riangabra--peagan-1632-casur",
      "childIds": [
        "yulrach-1652-riangabra"
      ]
    },
    {
      "partnershipId": "marriage-liadan-1652-morath--treabhnan-1649-riangabra",
      "childIds": [
        "gluineach-1670-riangabra",
        "dalara-riangabra",
        "meadhbhan-1675-riangabra"
      ]
    },
    {
      "partnershipId": "marriage-quiseog-unknown-riangabra-133-2--yulrach-1652-riangabra",
      "childIds": [
        "malach-1672-riangabra"
      ]
    },
    {
      "partnershipId": "marriage-aisling-1676-goidin--gluineach-1670-riangabra",
      "childIds": [
        "tormodh-1696-riangabra"
      ]
    },
    {
      "partnershipId": "marriage-deirdre-1675-salaig--meadhbhan-1675-riangabra",
      "childIds": [
        "glaisne-1695-riangabra"
      ]
    },
    {
      "partnershipId": "marriage-peadhra-unknown-riangabra-153-0--tormodh-1696-riangabra",
      "childIds": [
        "zephen-1720-riangabra"
      ]
    },
    {
      "partnershipId": "marriage-glaisne-1695-riangabra--mairtin-unknown-riangabra-153-1",
      "childIds": [
        "harailt-1716-riangabra"
      ]
    },
    {
      "partnershipId": "marriage-glaisne-1695-riangabra--loeg-unknown-riangabra-153-2",
      "childIds": [
        "sile-1721-riangabra",
        "cillian-1723-riangabra"
      ]
    },
    {
      "partnershipId": "affair-loeg-unknown-riangabra-153-2--zosie-unknown-riangabra-153-3",
      "childIds": [
        "ferdiad-1718-riangabra",
        "flerdiad-1718-riangabra",
        "iollan-1726-riangabra"
      ],
      "legitimacy": "illegitimate"
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-ealar-1596-riangabra--gearoid-1591-neill",
      "targetFamilyId": "haus-neill",
      "houseId": "house-neill"
    },
    {
      "partnershipId": "marriage-kavan-1611-riangabra--peadarog-1607-birn",
      "targetFamilyId": "haus-birn",
      "houseId": "house-birn"
    },
    {
      "partnershipId": "marriage-gilleasbuig-1634-eachtrai--sorcha-1636-riangabra",
      "targetFamilyId": "haus-eachtrai",
      "houseId": "house-eachtrai"
    },
    {
      "partnershipId": "marriage-banbhin-1648-aonghusa--vaithreach-1651-riangabra",
      "targetFamilyId": "haus-aonghusa",
      "houseId": "house-aonghusa"
    },
    {
      "partnershipId": "marriage-dalara-riangabra--eachan-1670-bhaird",
      "targetFamilyId": "haus-an-bhaird",
      "houseId": "house-an-bhaird"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [],
  "heads": [
    "treabhnan-founder-riangabra",
    "malach-1591-riangabra",
    "harailt-riangabra",
    "breasal-1609-riangabra",
    "tormodh-1628-riangabra",
    "donal-1628-riangabra",
    "treabhnan-1649-riangabra",
    "yulrach-1652-riangabra",
    "meadhbhan-1675-riangabra",
    "glaisne-1695-riangabra"
  ],
  "titles": {
    "treabhnan-founder-riangabra": "Historisches Oberhaupt",
    "malach-1591-riangabra": "Historisches Oberhaupt",
    "harailt-riangabra": "Historisches Oberhaupt",
    "breasal-1609-riangabra": "Historisches Oberhaupt",
    "tormodh-1628-riangabra": "Historisches Oberhaupt",
    "donal-1628-riangabra": "Historisches Oberhaupt",
    "treabhnan-1649-riangabra": "Historisches Oberhaupt",
    "yulrach-1652-riangabra": "Historisches Oberhaupt",
    "meadhbhan-1675-riangabra": "Historisches Oberhaupt",
    "glaisne-1695-riangabra": "Oberhaupt seit 1719",
    "harailt-1716-riangabra": "Erbfolge: 1"
  },
  "personRoles": {
    "ferdiad-1718-riangabra": "bastard",
    "flerdiad-1718-riangabra": "bastard",
    "iollan-1726-riangabra": "bastard",
    "zosie-unknown-riangabra-153-3": "affair"
  },
  "personExtensions": {
    "glaisne-1695-riangabra": {
      "chartPartnerGroupPersonOrder": [
        "mairtin-unknown-riangabra-153-1",
        "glaisne-1695-riangabra",
        "loeg-unknown-riangabra-153-2",
        "zosie-unknown-riangabra-153-3"
      ],
      "chartCenterBetweenPartnerPersonIds": [
        "mairtin-unknown-riangabra-153-1",
        "loeg-unknown-riangabra-153-2"
      ],
      "chartKeepPartnerGroupTogether": true
    },
    "loeg-unknown-riangabra-153-2": {
      "chartMultiPartnerLayoutReviewed": true
    }
  },
  "sourceNote": "Eine serielle Überlieferungslücke. Die vertauschten Überschriften Kavan/Ealar werden nach Grafik und Birn-Gegenbeziehung berichtigt: Ealar–Gearoid Neill, Kavan–Peadaróg Birn. Glaisne hat nacheinander Máirtín und Loeg geheiratet; Loegs Affäre mit Zosie ist getrennt. Harailt ist Máirtíns Sohn, Síle und Cillian sind Loegs Kinder.",
  "currentHeadId": "glaisne-1695-riangabra",
  "heirIds": [
    "harailt-1716-riangabra"
  ],
  "description": "Na’Riangabra ist ein Laird-Clan von Tir na Fathach mit Sitz in Baile Begg. Seine Überlieferung führt auf Treabhnán und Glaisne zurück. Die jüngere Familiengeschichte umfasst mehrere Wechsel des Oberhaupts zwischen den Zweigen Harailts und Breasals. Glaisne leitet den Clan seit 1719; ihr Sohn Harailt ist als Nachfolger vorgesehen. Seine Verlobung mit Yllána Chulainn verbindet die kommende Generation mit dem Fürstenclan.",
  "partnershipExtensions": {
    "marriage-glaisne-1695-riangabra--mairtin-unknown-riangabra-153-1": {
      "chartAlignPartnerOverChildrenPersonId": "mairtin-unknown-riangabra-153-1",
      "chartReserveLeafChildLane": true,
      "chartArrangeLeafChildrenEvenly": true
    },
    "affair-loeg-unknown-riangabra-153-2--zosie-unknown-riangabra-153-3": {
      "chartAlignPartnerOverChildrenPersonId": "zosie-unknown-riangabra-153-3",
      "chartReserveLeafChildLane": true,
      "chartArrangeLeafChildrenEvenly": true
    },
    "marriage-glaisne-1695-riangabra--loeg-unknown-riangabra-153-2": {
      "chartAlignPartnerOverChildrenPersonId": "loeg-unknown-riangabra-153-2",
      "chartReserveLeafChildLane": true,
      "chartArrangeLeafChildrenEvenly": true
    }
  }
});

export const HOUSE_RIANGABRA_FAMILY = withAlbenSourcePortraitUpgrade(withBlaithneachSourceCounterUpgrade(createDunfalSourceFamily("riangabra", SOURCE)));
