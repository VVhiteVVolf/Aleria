import { createAislearneachSourceFamily } from './aislearneach-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "bhaltar-founder-tuathanach",
    "cairistiona-unknown-ui-faill-duibhne-91-0",
    "faolan-founder-ui-faill-duibhne",
    "keelaith-duibhne",
    "seonaid-founder-laga",
    "donnchadh-cumhail",
    "connla-1578-ui-faill-duibhne",
    "tuilelaith-duibhne",
    "feamainn-1582-ronain",
    "cadwalladar-draig",
    "goll-1600-ui-faill-duibhne",
    "mebh-1605-ui-faill-duibhne",
    "eamhfhlaith-duibhne",
    "fionlaith-1607-cetchathach",
    "luibheas-1600-birn",
    "uarnan-gealach",
    "diarmuid-1628-ui-faill-duibhne",
    "aibhilin-1632-ui-faill-duibhne",
    "colmas-1630-ui-faill-duibhne",
    "oithiona-1632-fintain",
    "tameran-1628-ceallaigh",
    "eilidhan-1630-morna",
    "fearghas-duibhne",
    "finolain-duibhne",
    "fionn-1650-ui-faill-duibhne",
    "meabhin-1655-holloran",
    "donndubhan-1651-leite",
    "brighdeach-1654-muileach",
    "gaothaire-duibhne",
    "maolmhuire-duibhne",
    "balthos-1672-ui-faill-duibhne",
    "cairisti-duibhne",
    "grainnein-eldath",
    "conand-1670-rochraide",
    "liadan-1676-durthacht",
    "fothradh-1671-craobhan",
    "fothad-duibhne",
    "vannoch-1700-ui-faill-duibhne",
    "coemgen-1694-ui-faill-duibhne",
    "doileag-rochraide",
    "aodnait-1700-sept-ferbend",
    "diarmuid-1722-ui-faill-duibhne"
  ],
  "partnershipIds": [
    "marriage-bhaltar-founder-tuathanach--cairistiona-unknown-ui-faill-duibhne-91-0",
    "marriage-faolan-founder-ui-faill-duibhne--seonaid-founder-laga",
    "marriage-donnchadh-keelaith",
    "marriage-connla-1578-ui-faill-duibhne--feamainn-1582-ronain",
    "marriage-cadwalladar-tuilelaith",
    "marriage-fionlaith-1607-cetchathach--goll-1600-ui-faill-duibhne",
    "marriage-luibheas-1600-birn--mebh-1605-ui-faill-duibhne",
    "marriage-uarnan-eamhfhlaith",
    "marriage-diarmuid-1628-ui-faill-duibhne--oithiona-1632-fintain",
    "marriage-aibhilin-1632-ui-faill-duibhne--tameran-1628-ceallaigh",
    "marriage-colmas-1630-ui-faill-duibhne--eilidhan-1630-morna",
    "marriage-fearghas-duibhne--meabhin-1655-holloran",
    "marriage-donndubhan-1651-leite--finolain-duibhne",
    "marriage-brighdeach-1654-muileach--fionn-1650-ui-faill-duibhne",
    "marriage-gaothaire-duibhne--grainnein-eldath",
    "marriage-conand-1670-rochraide--maolmhuire-duibhne",
    "marriage-balthos-1672-ui-faill-duibhne--liadan-1676-durthacht",
    "marriage-cairisti-duibhne--fothradh-1671-craobhan",
    "marriage-doileag-rochraide--fothad-duibhne",
    "marriage-aodnait-1700-sept-ferbend--coemgen-1694-ui-faill-duibhne"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-bhaltar-founder-tuathanach--cairistiona-unknown-ui-faill-duibhne-91-0",
      "childIds": [
        "faolan-founder-ui-faill-duibhne",
        "keelaith-duibhne"
      ],
      "timeJumpId": "gap-aislearneach-ui-faill-duibhne-founders"
    },
    {
      "partnershipId": "marriage-faolan-founder-ui-faill-duibhne--seonaid-founder-laga",
      "childIds": [
        "connla-1578-ui-faill-duibhne",
        "tuilelaith-duibhne"
      ],
      "timeJumpId": "gap-aislearneach-ui-faill-duibhne-faolan"
    },
    {
      "partnershipId": "marriage-connla-1578-ui-faill-duibhne--feamainn-1582-ronain",
      "childIds": [
        "goll-1600-ui-faill-duibhne",
        "mebh-1605-ui-faill-duibhne",
        "eamhfhlaith-duibhne"
      ]
    },
    {
      "partnershipId": "marriage-fionlaith-1607-cetchathach--goll-1600-ui-faill-duibhne",
      "childIds": [
        "diarmuid-1628-ui-faill-duibhne",
        "aibhilin-1632-ui-faill-duibhne",
        "colmas-1630-ui-faill-duibhne"
      ]
    },
    {
      "partnershipId": "marriage-diarmuid-1628-ui-faill-duibhne--oithiona-1632-fintain",
      "childIds": [
        "fearghas-duibhne",
        "finolain-duibhne"
      ]
    },
    {
      "partnershipId": "marriage-colmas-1630-ui-faill-duibhne--eilidhan-1630-morna",
      "childIds": [
        "fionn-1650-ui-faill-duibhne"
      ]
    },
    {
      "partnershipId": "marriage-fearghas-duibhne--meabhin-1655-holloran",
      "childIds": [
        "gaothaire-duibhne",
        "maolmhuire-duibhne"
      ]
    },
    {
      "partnershipId": "marriage-brighdeach-1654-muileach--fionn-1650-ui-faill-duibhne",
      "childIds": [
        "balthos-1672-ui-faill-duibhne",
        "cairisti-duibhne"
      ]
    },
    {
      "partnershipId": "marriage-gaothaire-duibhne--grainnein-eldath",
      "childIds": [
        "fothad-duibhne",
        "vannoch-1700-ui-faill-duibhne"
      ]
    },
    {
      "partnershipId": "marriage-balthos-1672-ui-faill-duibhne--liadan-1676-durthacht",
      "childIds": [
        "coemgen-1694-ui-faill-duibhne"
      ]
    },
    {
      "partnershipId": "marriage-aodnait-1700-sept-ferbend--coemgen-1694-ui-faill-duibhne",
      "childIds": [
        "diarmuid-1722-ui-faill-duibhne"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-donnchadh-keelaith",
      "targetFamilyId": "haus-mac-ard-cumhaill",
      "houseId": "house-cumhail"
    },
    {
      "partnershipId": "marriage-cadwalladar-tuilelaith",
      "targetFamilyId": "haus-draig",
      "houseId": "house-draig"
    },
    {
      "partnershipId": "marriage-luibheas-1600-birn--mebh-1605-ui-faill-duibhne",
      "targetFamilyId": "haus-birn",
      "houseId": "house-birn"
    },
    {
      "partnershipId": "marriage-uarnan-eamhfhlaith",
      "targetFamilyId": "haus-ua-gaelach",
      "houseId": "house-gealach"
    },
    {
      "partnershipId": "marriage-aibhilin-1632-ui-faill-duibhne--tameran-1628-ceallaigh",
      "targetFamilyId": "haus-ceallaigh",
      "houseId": "house-ceallaigh"
    },
    {
      "partnershipId": "marriage-donndubhan-1651-leite--finolain-duibhne",
      "targetFamilyId": "haus-dal-leite",
      "houseId": "house-dal-leite"
    },
    {
      "partnershipId": "marriage-conand-1670-rochraide--maolmhuire-duibhne",
      "targetFamilyId": "haus-ui-rochraide",
      "houseId": "house-rochraide"
    },
    {
      "partnershipId": "marriage-cairisti-duibhne--fothradh-1671-craobhan",
      "targetFamilyId": "haus-craobhan",
      "houseId": "house-craobhan"
    },
    {
      "partnershipId": "marriage-doileag-rochraide--fothad-duibhne",
      "targetFamilyId": "haus-ui-rochraide",
      "houseId": "house-rochraide"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [],
  "heads": [
    "bhaltar-founder-tuathanach",
    "faolan-founder-ui-faill-duibhne",
    "connla-1578-ui-faill-duibhne",
    "goll-1600-ui-faill-duibhne",
    "diarmuid-1628-ui-faill-duibhne",
    "fearghas-duibhne",
    "gaothaire-duibhne"
  ],
  "titles": {
    "bhaltar-founder-tuathanach": "Legendärer Hausgründer",
    "faolan-founder-ui-faill-duibhne": "Historisches Oberhaupt",
    "connla-1578-ui-faill-duibhne": "Historisches Oberhaupt",
    "goll-1600-ui-faill-duibhne": "Historisches Oberhaupt",
    "diarmuid-1628-ui-faill-duibhne": "Historisches Oberhaupt",
    "fearghas-duibhne": "Historisches Oberhaupt",
    "gaothaire-duibhne": "Historisches Oberhaupt",
    "coemgen-1694-ui-faill-duibhne": "Überlebender des Clans"
  },
  "personRoles": {},
  "personExtensions": {},
  "sourceNote": "Nutzerfestlegung: ausgestoßen, mit überlebendem begnadigten Teil. Zwei Überlieferungslücken. Vertauschte Eheüberschriften folgen Grafik, Fintain- und Morna-Gegenquellen: Diarmuid–Oithíona, Colmas–Eilidhan. Fothad und Vannoch sind Gaothaires Kinder, Coemgen ist Balthos Sohn. Coemgen/Aodnait und Diarmuid bleiben dieselben Ferbend-Personen. Kein globaler Endknoten und kein erfundener König als Vorfahr.",
  "currentHeadId": "",
  "heirIds": [],
  "description": "Die Duibhne gehen der Überlieferung nach auf Bhaltar Tuathánach, den Wächter einer Flussinsel, zurück. Ihr Sitz Cliath wurde im Ceitheach-Krieg zum Schauplatz des Verrats Gaothaires und eines blutigen inneren Zerwürfnisses. Balthos widersetzte sich ihm, während Coemgen die Fianna warnte. Der Clan bleibt als ausgestoßen geführt; ein begnadigter Teil der Familie überlebte, darunter Coemgens Linie mit Aodnait Ferbend und ihrem Sohn Diarmuid."
});

export const HOUSE_UI_FAILL_DUIBHNE_FAMILY = createAislearneachSourceFamily("ui-faill-duibhne", SOURCE);
