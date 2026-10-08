import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { createAislearneachSourceFamily } from './aislearneach-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "brian-1276-morna",
    "etain-unknown-morna-115-2",
    "colmach-1602-coronach",
    "lorcanach-1604-coronach",
    "raghnas-1609-coronach",
    "zaorbha-1609-feannag",
    "doirind-unknown-coronach-100-1",
    "mathuin-1627-coronach",
    "peadar-1632-coronach",
    "brian-1635-coronach",
    "aisling-1626-rioga",
    "owena-unknown-coronach-110-1",
    "aisling-1635-muileach",
    "maelas-1650-coronach",
    "gwilym-1690-coronach",
    "lorcanach-1655-coronach",
    "unaas-1652-morna",
    "glaodhach-1657-morgacht",
    "colmach-1671-coronach",
    "peadaran-1676-coronach",
    "nechtan-1677-coronach",
    "etain-coronach",
    "liobhan-1676-luchdon",
    "saorlaan-1678-feannag",
    "odhran-1676-tordarroch",
    "maelas-1695-coronach",
    "caragh-coronach",
    "mathuin-1695-coronach",
    "dervla-coronach",
    "saorla-1700-morna",
    "domhnall-1702-cumhail",
    "iarbhine-unknown-coronach-140-2",
    "wynward-pyrth",
    "brian-1720-coronach",
    "raghnas-1725-coronach",
    "puirseil-1721-coronach",
    "etain-1727-coronach"
  ],
  "partnershipIds": [
    "marriage-brian-1276-morna--etain-unknown-morna-115-2",
    "marriage-colmach-1602-coronach--zaorbha-1609-feannag",
    "marriage-doirind-unknown-coronach-100-1--raghnas-1609-coronach",
    "marriage-aisling-1626-rioga--mathuin-1627-coronach",
    "affair-mathuin-1627-coronach--owena-unknown-coronach-110-1",
    "marriage-aisling-1635-muileach--brian-1635-coronach",
    "marriage-maelas-1650-coronach--unaas-1652-morna",
    "marriage-glaodhach-1657-morgacht--lorcanach-1655-coronach",
    "marriage-colmach-1671-coronach--liobhan-1676-luchdon",
    "marriage-peadaran-1676-coronach--saorlaan-1678-feannag",
    "marriage-etain-coronach--odhran-1676-tordarroch",
    "marriage-maelas-1695-coronach--saorla-1700-morna",
    "marriage-domhnall-caragh",
    "marriage-iarbhine-unknown-coronach-140-2--mathuin-1695-coronach",
    "marriage-wynward-dervla-pyrth"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-brian-1276-morna--etain-unknown-morna-115-2",
      "childIds": [
        "colmach-1602-coronach",
        "lorcanach-1604-coronach",
        "raghnas-1609-coronach"
      ],
      "timeJumpId": "gap-aislearneach-coronach-founders"
    },
    {
      "partnershipId": "marriage-colmach-1602-coronach--zaorbha-1609-feannag",
      "childIds": [
        "mathuin-1627-coronach"
      ]
    },
    {
      "partnershipId": "marriage-doirind-unknown-coronach-100-1--raghnas-1609-coronach",
      "childIds": [
        "peadar-1632-coronach",
        "brian-1635-coronach"
      ]
    },
    {
      "partnershipId": "marriage-aisling-1626-rioga--mathuin-1627-coronach",
      "childIds": [
        "maelas-1650-coronach"
      ]
    },
    {
      "partnershipId": "affair-mathuin-1627-coronach--owena-unknown-coronach-110-1",
      "childIds": [
        "gwilym-1690-coronach"
      ],
      "legitimacy": "illegitimate"
    },
    {
      "partnershipId": "marriage-aisling-1635-muileach--brian-1635-coronach",
      "childIds": [
        "lorcanach-1655-coronach"
      ]
    },
    {
      "partnershipId": "marriage-maelas-1650-coronach--unaas-1652-morna",
      "childIds": [
        "colmach-1671-coronach",
        "peadaran-1676-coronach"
      ]
    },
    {
      "partnershipId": "marriage-glaodhach-1657-morgacht--lorcanach-1655-coronach",
      "childIds": [
        "nechtan-1677-coronach",
        "etain-coronach"
      ]
    },
    {
      "partnershipId": "marriage-colmach-1671-coronach--liobhan-1676-luchdon",
      "childIds": [
        "maelas-1695-coronach",
        "caragh-coronach"
      ]
    },
    {
      "partnershipId": "marriage-peadaran-1676-coronach--saorlaan-1678-feannag",
      "childIds": [
        "mathuin-1695-coronach",
        "dervla-coronach"
      ]
    },
    {
      "partnershipId": "marriage-maelas-1695-coronach--saorla-1700-morna",
      "childIds": [
        "brian-1720-coronach",
        "raghnas-1725-coronach"
      ]
    },
    {
      "partnershipId": "marriage-iarbhine-unknown-coronach-140-2--mathuin-1695-coronach",
      "childIds": [
        "puirseil-1721-coronach",
        "etain-1727-coronach"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-etain-coronach--odhran-1676-tordarroch",
      "targetFamilyId": "haus-tir-an-tordarroch",
      "houseId": "house-tir-an-tordarroch"
    },
    {
      "partnershipId": "marriage-domhnall-caragh",
      "targetFamilyId": "haus-mac-ard-cumhaill",
      "houseId": "house-cumhail"
    },
    {
      "partnershipId": "marriage-wynward-dervla-pyrth",
      "targetFamilyId": "haus-pyrth",
      "houseId": "house-pyrth"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [],
  "heads": [
    "brian-1276-morna",
    "colmach-1602-coronach",
    "mathuin-1627-coronach",
    "maelas-1650-coronach",
    "colmach-1671-coronach"
  ],
  "titles": {
    "brian-1276-morna": "Historisches Oberhaupt",
    "colmach-1602-coronach": "Historisches Oberhaupt",
    "mathuin-1627-coronach": "Historisches Oberhaupt",
    "maelas-1650-coronach": "Historisches Oberhaupt",
    "colmach-1671-coronach": "Laird von Gaelan",
    "maelas-1695-coronach": "Erbfolge: 1",
    "brian-1720-coronach": "Erbfolge: 2",
    "raghnas-1725-coronach": "Erbfolge: 3"
  },
  "personRoles": {
    "gwilym-1690-coronach": "bastard",
    "owena-unknown-coronach-110-1": "affair"
  },
  "personExtensions": {},
  "sourceNote": "Brian Morna begründet den Clan. Eine Überlieferungslücke. Mathuins Sohn Gwilym stammt aus der Affäre mit Owena. Die Jahresangabe 1320 in der Amtsliste ist Brians Amtsbeginn, kein zweites Geburtsjahr.",
  "currentHeadId": "colmach-1671-coronach",
  "heirIds": [
    "maelas-1695-coronach",
    "brian-1720-coronach",
    "raghnas-1725-coronach"
  ],
  "description": "Ua’Coronach ist ein Kadettenhaus der Morna mit Sitz in Gaelan. Es geht auf Brian Morna und Etain zurück und folgt wie das Stammhaus der männlichen Primogenitur. Heute führt Colmach den Clan; als Nachfolger sind Maelas, Brian und Raghnas verzeichnet. Zu den dunklen Gestalten seiner Geschichte zählt der Magier Lorcanach, der später zum Kultisten wurde."
});

export const HOUSE_CORONACH_FAMILY = withAlbenSourcePortraitUpgrade(createAislearneachSourceFamily("coronach", SOURCE));
