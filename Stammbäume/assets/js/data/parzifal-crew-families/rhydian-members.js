import { createFamilyPerson } from '../family-record-builders.js';

// Existing approved crew, copied from the finalized source named in each record.
export const RHYDIAN_FAMILY_MEMBERS = Object.freeze([
  {
    "id": "uwchric-mathgraig",
    "name": "Uwchric Mathgraig",
    "sex": "male",
    "houseId": "house-mathgraig",
    "birth": "1686",
    "title": "Steuermann des Seebären",
    "portrait": "../AleriaAlmanach/assets/ship-crews/rhydians-schiffsmannschaft/portraits-2026-10-05/uwchric-mathgraig-v2.png",
    "tags": [
      "Der Seebär",
      "Rhydians Schiffsmannschaft"
    ],
    "notes": "54 Jahre. Erfahrener Steuermann; kennt Strömungen und Untiefen, bleibt bei schwerer See ruhig am Ruder.",
    "extensions": {
      "sourceNote": "Freigegebene Mannschaft aus AleriaAlmanach/assets/ship-crews/rhydians-schiffsmannschaft/crew-candidates-2026-10-05.json; Familienzuordnung vom 06.10.2026.",
      "almanachModuleId": "rhydians-schiffsmannschaft"
    }
  },
  {
    "id": "helban-morgwynt",
    "name": "Helban Morgwynt",
    "sex": "male",
    "houseId": "house-morgwynt",
    "birth": "1704",
    "title": "Bootsmann des Seebären",
    "portrait": "../AleriaAlmanach/assets/ship-crews/rhydians-schiffsmannschaft/portraits-2026-10-05/helban-morgwynt.png",
    "tags": [
      "Der Seebär",
      "Rhydians Schiffsmannschaft"
    ],
    "notes": "36 Jahre. Erfahrener Decksführer; rauer Ton, klare Befehle und verlässlicher Drill.",
    "extensions": {
      "sourceNote": "Freigegebene Mannschaft aus AleriaAlmanach/assets/ship-crews/rhydians-schiffsmannschaft/crew-candidates-2026-10-05.json; Familienzuordnung vom 06.10.2026.",
      "almanachModuleId": "rhydians-schiffsmannschaft"
    }
  },
  {
    "id": "oenric-prys",
    "name": "Oenric Prys",
    "sex": "male",
    "houseId": "house-prys",
    "birth": "1716",
    "title": "Schiffskaplan des Seebären",
    "portrait": "../AleriaAlmanach/assets/ship-crews/rhydians-schiffsmannschaft/portraits-2026-10-05/oenric-prys.png",
    "tags": [
      "Der Seebär",
      "Rhydians Schiffsmannschaft"
    ],
    "notes": "24 Jahre. Junger Geistlicher Baldrans; kameradschaftlich, mit Sinn für Seemannsbräuche.",
    "extensions": {
      "sourceNote": "Freigegebene Mannschaft aus AleriaAlmanach/assets/ship-crews/rhydians-schiffsmannschaft/crew-candidates-2026-10-05.json; Familienzuordnung vom 06.10.2026.",
      "almanachModuleId": "rhydians-schiffsmannschaft"
    }
  },
  {
    "id": "saithar-morglan",
    "name": "Saithar Morglan",
    "sex": "male",
    "houseId": "house-morglan",
    "birth": "1715",
    "title": "Quartiermeister des Seebären",
    "portrait": "../AleriaAlmanach/assets/ship-crews/rhydians-schiffsmannschaft/portraits-2026-10-05/saithar-morglan-v2.png",
    "tags": [
      "Der Seebär",
      "Rhydians Schiffsmannschaft"
    ],
    "notes": "25 Jahre. Organisiert Stauplätze, Ausrüstung und die Ausgabe an die Mannschaft.",
    "extensions": {
      "sourceNote": "Freigegebene Mannschaft aus AleriaAlmanach/assets/ship-crews/rhydians-schiffsmannschaft/crew-candidates-2026-10-05.json; Familienzuordnung vom 06.10.2026.",
      "almanachModuleId": "rhydians-schiffsmannschaft"
    }
  },
  {
    "id": "maelban-penry",
    "name": "Maelban Penry",
    "sex": "male",
    "houseId": "house-penry",
    "birth": "1713",
    "title": "Schreiber / Adjutant des Seebären",
    "portrait": "../AleriaAlmanach/assets/ship-crews/rhydians-schiffsmannschaft/portraits-2026-10-05/maelban-penry.png",
    "tags": [
      "Der Seebär",
      "Rhydians Schiffsmannschaft"
    ],
    "notes": "27 Jahre. Organisiert Logbuch, Mannschaftslisten und Korrespondenz; unterstützt Rhydian als Schreiber und Adjutant.",
    "extensions": {
      "sourceNote": "Freigegebene Mannschaft aus AleriaAlmanach/assets/ship-crews/rhydians-schiffsmannschaft/crew-candidates-2026-10-05.json; Familienzuordnung vom 06.10.2026.",
      "almanachModuleId": "rhydians-schiffsmannschaft"
    }
  },
  {
    "id": "iwrban-dyger",
    "name": "Iwrban Dyger",
    "sex": "male",
    "houseId": "house-dyger",
    "birth": "1717",
    "title": "Schiffsmusikant des Seebären",
    "portrait": "../AleriaAlmanach/assets/ship-crews/rhydians-schiffsmannschaft/portraits-2026-10-05/iwrban-dyger.png",
    "tags": [
      "Der Seebär",
      "Rhydians Schiffsmannschaft"
    ],
    "notes": "23 Jahre. Fiedel, Seemannslieder und Arbeitstakt; Musikant, kein ausgebildeter Barddwyr.",
    "extensions": {
      "sourceNote": "Freigegebene Mannschaft aus AleriaAlmanach/assets/ship-crews/rhydians-schiffsmannschaft/crew-candidates-2026-10-05.json; Familienzuordnung vom 06.10.2026.",
      "almanachModuleId": "rhydians-schiffsmannschaft"
    }
  },
  {
    "id": "gwaeden-beryn",
    "name": "Gwaeden Beryn",
    "sex": "male",
    "houseId": "house-beryn",
    "birth": "1714",
    "title": "Wachmeister des Seebären",
    "portrait": "../AleriaAlmanach/assets/ship-crews/rhydians-schiffsmannschaft/portraits-2026-10-05/gwaeden-beryn.png",
    "tags": [
      "Der Seebär",
      "Rhydians Schiffsmannschaft"
    ],
    "notes": "26 Jahre. Teilt Wachen ein; diszipliniert und aufmerksam an Deck und im Hafen.",
    "extensions": {
      "sourceNote": "Freigegebene Mannschaft aus AleriaAlmanach/assets/ship-crews/rhydians-schiffsmannschaft/crew-candidates-2026-10-05.json; Familienzuordnung vom 06.10.2026.",
      "almanachModuleId": "rhydians-schiffsmannschaft"
    }
  }
].map(createFamilyPerson));
