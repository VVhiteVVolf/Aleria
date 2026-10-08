import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { createAislearneachSourceFamily } from './aislearneach-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "proinnsias-founder-uilebheist",
    "raonaid-unknown-uilebheist-88-0",
    "zairthan-1607-uilebheist",
    "muireall-1610-uilebheist",
    "uthbhla-unknown-uilebheist-100-0",
    "cael-1606-fiantorc",
    "aonghus-1629-uilebheist",
    "proinnsias-1632-uilebheist",
    "vionnadh-unknown-uilebheist-110-0",
    "eireannach-unknown-uilebheist-110-1",
    "neachdainn-1651-uilebheist",
    "urlar-1654-uilebheist",
    "meara-unknown-uilebheist-120-0",
    "sine-unknown-uilebheist-120-1",
    "proinnsias-1672-uilebheist",
    "oonaas-1680-uilebheist",
    "muireall-1678-uilebheist",
    "keebh-unknown-uilebheist-130-0",
    "labhruinn-1678-luchdon",
    "seumas-1676-gaisgh",
    "aonghus-1696-uilebheist",
    "raonaid-1703-uilebheist",
    "vardan-1704-uilebheist",
    "whelan-1707-uilebheist",
    "zairthan-1710-uilebheist",
    "teasag-unknown-uilebheist-140-0",
    "iomhar-1697-feannag",
    "jiarla-unknown-uilebheist-140-2",
    "onora-unknown-uilebheist-140-3",
    "urlar-1720-uilebheist",
    "donal-1724-uilebheist",
    "neachdainn-1728-uilebheist",
    "iosolda-1729-uilebheist",
    "taraach-1734-uilebheist"
  ],
  "partnershipIds": [
    "marriage-proinnsias-founder-uilebheist--raonaid-unknown-uilebheist-88-0",
    "marriage-uthbhla-unknown-uilebheist-100-0--zairthan-1607-uilebheist",
    "marriage-cael-1606-fiantorc--muireall-1610-uilebheist",
    "marriage-aonghus-1629-uilebheist--vionnadh-unknown-uilebheist-110-0",
    "marriage-eireannach-unknown-uilebheist-110-1--proinnsias-1632-uilebheist",
    "marriage-meara-unknown-uilebheist-120-0--neachdainn-1651-uilebheist",
    "marriage-sine-unknown-uilebheist-120-1--urlar-1654-uilebheist",
    "marriage-keebh-unknown-uilebheist-130-0--proinnsias-1672-uilebheist",
    "marriage-labhruinn-1678-luchdon--oonaas-1680-uilebheist",
    "marriage-muireall-1678-uilebheist--seumas-1676-gaisgh",
    "marriage-aonghus-1696-uilebheist--teasag-unknown-uilebheist-140-0",
    "marriage-iomhar-1697-feannag--raonaid-1703-uilebheist",
    "marriage-jiarla-unknown-uilebheist-140-2--whelan-1707-uilebheist",
    "marriage-onora-unknown-uilebheist-140-3--zairthan-1710-uilebheist"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-proinnsias-founder-uilebheist--raonaid-unknown-uilebheist-88-0",
      "childIds": [
        "zairthan-1607-uilebheist",
        "muireall-1610-uilebheist"
      ],
      "timeJumpId": "gap-aislearneach-uilebheist-founders"
    },
    {
      "partnershipId": "marriage-uthbhla-unknown-uilebheist-100-0--zairthan-1607-uilebheist",
      "childIds": [
        "aonghus-1629-uilebheist",
        "proinnsias-1632-uilebheist"
      ]
    },
    {
      "partnershipId": "marriage-aonghus-1629-uilebheist--vionnadh-unknown-uilebheist-110-0",
      "childIds": [
        "neachdainn-1651-uilebheist"
      ]
    },
    {
      "partnershipId": "marriage-eireannach-unknown-uilebheist-110-1--proinnsias-1632-uilebheist",
      "childIds": [
        "urlar-1654-uilebheist"
      ]
    },
    {
      "partnershipId": "marriage-meara-unknown-uilebheist-120-0--neachdainn-1651-uilebheist",
      "childIds": [
        "proinnsias-1672-uilebheist",
        "oonaas-1680-uilebheist"
      ]
    },
    {
      "partnershipId": "marriage-sine-unknown-uilebheist-120-1--urlar-1654-uilebheist",
      "childIds": [
        "muireall-1678-uilebheist"
      ]
    },
    {
      "partnershipId": "marriage-keebh-unknown-uilebheist-130-0--proinnsias-1672-uilebheist",
      "childIds": [
        "aonghus-1696-uilebheist",
        "raonaid-1703-uilebheist",
        "vardan-1704-uilebheist",
        "whelan-1707-uilebheist",
        "zairthan-1710-uilebheist"
      ]
    },
    {
      "partnershipId": "marriage-aonghus-1696-uilebheist--teasag-unknown-uilebheist-140-0",
      "childIds": [
        "urlar-1720-uilebheist",
        "donal-1724-uilebheist"
      ]
    },
    {
      "partnershipId": "marriage-jiarla-unknown-uilebheist-140-2--whelan-1707-uilebheist",
      "childIds": [
        "neachdainn-1728-uilebheist"
      ]
    },
    {
      "partnershipId": "marriage-onora-unknown-uilebheist-140-3--zairthan-1710-uilebheist",
      "childIds": [
        "iosolda-1729-uilebheist",
        "taraach-1734-uilebheist"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-cael-1606-fiantorc--muireall-1610-uilebheist",
      "targetFamilyId": "haus-fiantorc",
      "houseId": "house-fiantorc"
    },
    {
      "partnershipId": "marriage-labhruinn-1678-luchdon--oonaas-1680-uilebheist",
      "targetFamilyId": "haus-luchdon",
      "houseId": "house-luchdon"
    },
    {
      "partnershipId": "marriage-muireall-1678-uilebheist--seumas-1676-gaisgh",
      "targetFamilyId": "haus-gaisgh",
      "houseId": "house-gaisgh"
    },
    {
      "partnershipId": "marriage-iomhar-1697-feannag--raonaid-1703-uilebheist",
      "targetFamilyId": "haus-feannag",
      "houseId": "house-feannag"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [],
  "heads": [
    "proinnsias-founder-uilebheist",
    "zairthan-1607-uilebheist",
    "aonghus-1629-uilebheist",
    "neachdainn-1651-uilebheist",
    "proinnsias-1672-uilebheist"
  ],
  "titles": {
    "proinnsias-founder-uilebheist": "Historisches Oberhaupt",
    "zairthan-1607-uilebheist": "Historisches Oberhaupt",
    "aonghus-1629-uilebheist": "Historisches Oberhaupt",
    "neachdainn-1651-uilebheist": "Historisches Oberhaupt",
    "proinnsias-1672-uilebheist": "Laird von Foraoise"
  },
  "personRoles": {},
  "personExtensions": {},
  "sourceNote": "Eine Überlieferungslücke. An/Na sind Clanpräfix-Varianten. Das geplante historische Bündnis mit Cnogan begründet keine Ehe zwischen den später anderweitig verheirateten Gründern.",
  "currentHeadId": "proinnsias-1672-uilebheist",
  "heirIds": [],
  "description": "Uilebheist ist ein Laird-Haus in Foraoise, dem Land Tir na Adharcach. Seine Linie führt vom Gründer Proinnsias über Zairthán, Aonghus und Neachdainn zum heutigen Proinnsias. Die Führung wird nach männlicher Primogenitur weitergegeben. Ehen verbinden den Clan besonders mit den Häusern Feannag, Gaisgh und Luchdon."
});

export const HOUSE_UILEBHEIST_FAMILY = withAlbenSourcePortraitUpgrade(createAislearneachSourceFamily("uilebheist", SOURCE));
