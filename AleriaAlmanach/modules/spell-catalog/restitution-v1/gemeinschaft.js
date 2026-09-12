import { defineRestitutionSpell } from './restitution-spell.js';

// Authored Restitution edition 1; higher forms replace the stated base values.
export const GEMEINSCHAFT_SPELLS = [
  {
    "section": "gemeinschaft",
    "sourceId": "R41",
    "slug": "geteilte-heilung",
    "name": "Geteilte Heilung",
    "level": 2,
    "actions": "A",
    "role": "Gruppenheilung",
    "summary": "Je 1W8 Heilung · bis zu zwei Ziele",
    "effect": "Ein heilender Impuls teilt sich auf bis zu zwei verschiedene sichtbare Lebende. Jedes gewählte Ziel erhält einen eigenen Heilwurf von 1W8 TP.",
    "limits": "Ein Ziel kann nicht doppelt gewählt werden. Nicht genutzte Zielplätze und Überheilung werden nicht umverteilt.",
    "healing": "1d8",
    "maximumTargets": 2,
    "range": "6 m; bis zu zwei gewählte Ziele",
    "requirements": "Sicht auf alle Ziele, freie Hand und gesprochene Formel.",
    "forms": [
      {
        "level": 4,
        "actions": "A+R",
        "summary": "Je 2W8 Heilung · bis zu zwei Ziele",
        "healing": "2d8",
        "effect": "Bis zu zwei verschiedene sichtbare Ziele in 6 m erhalten je einen eigenen Heilwurf von 2W8 TP. Kosten fallen für die gesamte Anwendung einmal an."
      }
    ],
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Mass_Healing_Word_Unfaded_Icon.webp"
  },
  {
    "section": "gemeinschaft",
    "sourceId": "R42",
    "slug": "lebenskreis",
    "name": "Lebenskreis",
    "level": 4,
    "actions": "A+R+B",
    "role": "Gruppenheilung",
    "summary": "Je 2W6 Heilung · bis zu drei Ziele",
    "effect": "Ein Kreis warmen Lichts erreicht bis zu drei ausgewählte Lebende. Jedes Ziel erhält einen eigenen Heilwurf von 2W6 TP.",
    "limits": "Nur gewählte Ziele im Kreis. Keine Heilung später eintretender Wesen und keine Umverteilung von Überheilung.",
    "healing": "2d6",
    "maximumTargets": 3,
    "range": "Mittelpunkt bis 9 m; Radius 3 m; bis zu drei Ziele",
    "requirements": "Sicht auf Mittelpunkt und Ziele, freie Hand und Formel.",
    "forms": [
      {
        "level": 6,
        "actions": "A+S",
        "summary": "Je 3W6 Heilung · bis zu vier Ziele",
        "healing": "3d6",
        "maximumTargets": 4,
        "range": "Mittelpunkt bis 9 m; Radius 3 m; bis zu vier Ziele",
        "effect": "Bis zu vier gewählte Lebende im Kreis erhalten je 3W6 TP. Jedes Ziel wird getrennt geheilt; die übrigen Grenzen des Lebenskreises bleiben bestehen."
      }
    ],
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Mass_Cure_Wounds_Unfaded_Icon.webp"
  },
  {
    "section": "gemeinschaft",
    "sourceId": "R43",
    "slug": "wanderndes-heillicht",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Warden_of_Vitality_Unfaded_Icon.webp",
    "name": "Wanderndes Heillicht",
    "level": 4,
    "actions": "A+R",
    "role": "Nachheilung",
    "summary": "Drei Pulse · je 2W6 Heilung",
    "effect": "Ein Licht begleitet den Zaubernden. Beim Beginn heilt es ein gewähltes sichtbares Ziel in 9 m um 2W6 TP. In jedem der zwei folgenden eigenen Gesamtbeiträge kann gegen eine Bonusaktion ein weiterer Puls ausgelöst werden; das Ziel darf wechseln.",
    "limits": "Mana wird einmal beim Start bezahlt. Maximal drei Pulse; ausgelassene Pulse verfallen. Keine Heilung durch Betreten des Lichts und keine mehrfachen Pulse durch mehrere Abschnitte eines Posts.",
    "healing": "2d6",
    "duration": "Beginn und zwei folgende eigene Gesamtbeiträge; spätestens Kampfende.",
    "concentration": true,
    "range": "Je Puls 9 m; ein sichtbares Ziel",
    "requirements": "Sicht auf das jeweilige Ziel, freie Hand und Formel beim Start.",
    "manualResolution": "Nur die erste Heilung wird beim Start gebucht. Zwei Folgepulse mit Spielleitung nachhalten: je Folgebeitrag einmal Bonusaktion verbrauchen und 2W6 heilen, ohne erneutes Mana. Konzentrationsende beendet alle übrigen Pulse."
  },
  {
    "section": "gemeinschaft",
    "sourceId": "R44",
    "slug": "lazarettkreis",
    "name": "Lazarettkreis",
    "level": 5,
    "actions": "A+S",
    "role": "Ritual",
    "summary": "Je 2W6 Heilung · bis zu sechs Patienten",
    "effect": "Ein zehnminütiges Ritual versorgt bis zu sechs vorher gewählte ruhende Lebende. Beim Abschluss erhält jeder Patient einen eigenen Heilwurf von 2W6 TP.",
    "limits": "Alle Patienten müssen bis zum Abschluss im Kreis bleiben. Keine Zustandsentfernung, Regeneration oder Heilung später eintretender Patienten.",
    "healing": "2d6",
    "maximumTargets": 6,
    "range": "Radius 6 m um den Zaubernden; bis zu sechs Patienten",
    "ritual": "Zehn ununterbrochene Minuten.",
    "requirements": "Zu Beginn gewählte ruhende Patienten, freie Hand und ungestörter Behandlungsplatz.",
    "manualResolution": "Den gesamten Abschluss erst nach zehn ungestörten Minuten verbuchen. Kosten einmal, Heilung je gewähltem Patienten; keine Rast auslösen.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Prayer_of_Healing_Unfaded_Icon.webp"
  },
  {
    "section": "gemeinschaft",
    "sourceId": "R45",
    "slug": "grosse-heilung",
    "name": "Große Heilung",
    "level": 7,
    "actions": "A+S",
    "role": "Heilung",
    "summary": "35 TP · feste Heilung",
    "effect": "Gesammelte heilende Kraft erreicht einen sichtbaren Lebenden und stellt verlässlich 35 reguläre TP wieder her. Eine eigene Meisterkunst, die gesondert erlernt wird.",
    "limits": "Keine Heilwürfel, kritische Heilung, Attributsboni oder Zustandsreinigung. Auch feste Heilung endet am TP-Maximum.",
    "healing": 35,
    "range": "12 m; ein sichtbares Ziel",
    "requirements": "Sicht, freie Hand und gesprochene Formel.",
    "forms": [
      {
        "level": 8,
        "actions": "A+S+B",
        "summary": "45 TP · feste Heilung",
        "healing": 45,
        "effect": "Die Große Heilung stellt 45 reguläre TP eines sichtbaren Lebenden in 12 m wieder her. Keine Zusatzbehandlung."
      },
      {
        "level": 9,
        "actions": "A+S+R",
        "summary": "55 TP · feste Heilung",
        "healing": 55,
        "effect": "Die Große Heilung stellt 55 reguläre TP eines sichtbaren Lebenden in 12 m wieder her. Keine Zusatzbehandlung."
      }
    ],
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Heal_Unfaded_Icon.webp"
  },
  {
    "section": "gemeinschaft",
    "sourceId": "R46",
    "slug": "strom-des-lebens",
    "name": "Strom des Lebens",
    "level": 9,
    "actions": "A+S+R",
    "role": "Gruppenheilung",
    "summary": "Je 25 TP Heilung · bis zu vier Ziele",
    "effect": "Im ersten eigenen Gesamtbeitrag wird die heilende Kraft gesammelt. Im unmittelbar folgenden eigenen Gesamtbeitrag heilt die bezahlte Entladung bis zu vier gewählte Lebende im Kreis um je 25 TP.",
    "limits": "Keine Zustandsreinigung oder Wiederbelebung. Zwei Abschnitte desselben Posts ersetzen keine zwei Beiträge; bei Konzentrationsabbruch keine Entladung.",
    "healing": 25,
    "maximumTargets": 4,
    "range": "Mittelpunkt bis 12 m; Radius 6 m; bis zu vier Ziele",
    "requirements": "Sicht auf Mittelpunkt und Ziele, freie Hand und angekündigte Vorbereitung.",
    "channelComments": 2,
    "concentration": true,
    "duration": "Zwei aufeinanderfolgende eigene Gesamtbeiträge; einmalige Heilung beim Abschluss.",
    "manualResolution": "Vorbereitung und bezahlter Abschluss laufen über die Kanalisierung. Kreis, Sicht und gültige Ziele gemeinsam prüfen; die TP-Heilung wird beim Abschluss je Ziel gebucht."
  }
].map(defineRestitutionSpell);
