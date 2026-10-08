import { createAislearneachSourceFamily } from './aislearneach-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "teite-1674-sept-techtmar",
    "peadar-unknown-techtmar-88-0",
    "toirberth-1694-sept-techtmar",
    "tiobraide-1696-sept-techtmar",
    "yairbh-unknown-techtmar-98-0",
    "eoin-unknown-techtmar-98-1",
    "tola-1720-sept-techtmar",
    "toirche-1722-sept-techtmar",
    "tolai-1724-sept-techtmar"
  ],
  "partnershipIds": [
    "marriage-peadar-unknown-techtmar-88-0--teite-1674-sept-techtmar",
    "marriage-toirberth-1694-sept-techtmar--yairbh-unknown-techtmar-98-0",
    "marriage-eoin-unknown-techtmar-98-1--tiobraide-1696-sept-techtmar"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-peadar-unknown-techtmar-88-0--teite-1674-sept-techtmar",
      "childIds": [
        "toirberth-1694-sept-techtmar",
        "tiobraide-1696-sept-techtmar"
      ]
    },
    {
      "partnershipId": "marriage-toirberth-1694-sept-techtmar--yairbh-unknown-techtmar-98-0",
      "childIds": [
        "tola-1720-sept-techtmar",
        "toirche-1722-sept-techtmar"
      ]
    },
    {
      "partnershipId": "marriage-eoin-unknown-techtmar-98-1--tiobraide-1696-sept-techtmar",
      "childIds": [
        "tolai-1724-sept-techtmar"
      ]
    }
  ],
  "away": [],
  "cadets": [],
  "wards": [],
  "foster": [],
  "heads": [
    "teite-1674-sept-techtmar"
  ],
  "titles": {
    "teite-1674-sept-techtmar": "Gründerin · Oberhaupt der Sept"
  },
  "personRoles": {},
  "personExtensions": {},
  "sourceNote": "Bürgerliche Sept mit drei überlieferten Generationen. Téite ist Gründerin; kein adliger Rang und keine unbelegte ältere Ahnenlinie. Keine eigene Kriegerillustration in der Vorlage.",
  "currentHeadId": "teite-1674-sept-techtmar",
  "heirIds": [],
  "description": "Die Sept Techtmar ist eine bürgerliche Familie aus Foraoise. Téite gilt als Gründerin und gegenwärtiges Oberhaupt. Mit ihrem verstorbenen Ehemann Peadar begründete sie die beiden überlieferten Zweige über Toirberth und Tiobraide; die jüngste Generation bilden Tóla, Toirche und Tólaí. Eine besondere Nachfolgeregel ist bisher nicht überliefert."
});

export const SEPT_TECHTMAR_FAMILY = createAislearneachSourceFamily("techtmar", SOURCE);
