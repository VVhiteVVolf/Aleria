import { createDunfalSourceFamily } from './dunfal-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "furbaide-1654-sept-ferbend",
    "cliodhna-unknown-ferbend-69-0",
    "cearbhall-1678-sept-ferbend",
    "cinnia-unknown-ferbend-79-0",
    "aodnait-1700-sept-ferbend",
    "coemgen-1694-ui-faill-duibhne",
    "diarmuid-1722-ui-faill-duibhne"
  ],
  "partnershipIds": [
    "marriage-cliodhna-unknown-ferbend-69-0--furbaide-1654-sept-ferbend",
    "marriage-cearbhall-1678-sept-ferbend--cinnia-unknown-ferbend-79-0",
    "marriage-aodnait-1700-sept-ferbend--coemgen-1694-ui-faill-duibhne"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-cliodhna-unknown-ferbend-69-0--furbaide-1654-sept-ferbend",
      "childIds": [
        "cearbhall-1678-sept-ferbend"
      ]
    },
    {
      "partnershipId": "marriage-cearbhall-1678-sept-ferbend--cinnia-unknown-ferbend-79-0",
      "childIds": [
        "aodnait-1700-sept-ferbend"
      ]
    },
    {
      "partnershipId": "marriage-aodnait-1700-sept-ferbend--coemgen-1694-ui-faill-duibhne",
      "childIds": [
        "diarmuid-1722-ui-faill-duibhne"
      ]
    }
  ],
  "away": [],
  "cadets": [],
  "wards": [],
  "foster": [],
  "heads": [
    "furbaide-1654-sept-ferbend"
  ],
  "titles": {
    "furbaide-1654-sept-ferbend": "Gründer der Sept · Fianna",
    "cearbhall-1678-sept-ferbend": "Nachfolger · Schankwirt"
  },
  "personRoles": {
    "diarmuid-1722-ui-faill-duibhne": "core"
  },
  "personExtensions": {},
  "sourceNote": "Cearbhall wird in der Biographie ausdrücklich als Furbaides Sohn bezeichnet. Die Punktreihen am Hauswappen stehen daher für die Hausgründung und nicht für fehlende Generationen. Furbaide überlebt seine schwere Verwundung; der spätere lebende Status und das Alter 86 bestätigen Geburt 1654. Diarmuid gehört laut beschrifteter Grafik zum Haus Duibhne.",
  "currentHeadId": "furbaide-1654-sept-ferbend",
  "heirIds": [
    "cearbhall-1678-sept-ferbend"
  ],
  "description": "Die Sept Ferbend lebt vor den Toren von Cradh na Frinne im Land der Riesen. Ihr Gründer Furbaide ist ein Schüler Cú Chulainns und Überlebender des Fianna-Massakers. In dem ihm anvertrauten Vorort errichtete er für seine Frau Clíodhna eine Taverne, die zum Mittelpunkt der Familie wurde. Sohn Cearbhall, dessen Frau Cinnia und ihre Tochter Aodnait tragen dieses Erbe weiter. Aodnaits Ehe mit Coemgen Duibhne verbindet die Sept mit dem überlebenden Zweig jenes Clans."
});

export const SEPT_FERBEND_FAMILY = createDunfalSourceFamily("ferbend", SOURCE);
