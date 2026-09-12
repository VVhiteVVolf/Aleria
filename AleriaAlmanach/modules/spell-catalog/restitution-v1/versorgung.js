import { defineRestitutionSpell } from './restitution-spell.js';

// Authored Restitution edition 1; higher forms replace the stated base values.
export const NOTFALL_SPELLS = [
  {
    "section": "versorgung",
    "sourceId": "R01",
    "slug": "lebenszeichen",
    "name": "Lebenszeichen",
    "level": 0,
    "actions": "A+B",
    "role": "Untersuchung",
    "summary": "Ein körperlicher Befund",
    "effect": "Ein warmer Schimmer folgt dem Kreislauf. Nach zehn erzählerischen Sekunden erkennt die berührende Hand, ob Lebenszeichen, eine offene Blutung oder eine oberflächliche Wunde vorliegen. Höchstens eine auffällige Stelle wird ermittelt.",
    "limits": "Auch ein lebloser Körper darf untersucht werden. Keine Giftbestimmung, Seelenschau, genaue Todesursache oder TP-Heilung.",
    "duration": "Zehn Sekunden Untersuchung; einmaliger Befund.",
    "requirements": "Berührung und eine freie Hand. Das Ziel muss für die Untersuchung nicht am Leben sein.",
    "manualResolution": "Kosten werden verbucht. Die beschriebene Behandlung und ihre Grenzen mit der Spielleitung am konkreten Ziel auflösen; Zustände werden nicht pauschal entfernt."
  },
  {
    "section": "versorgung",
    "sourceId": "R02",
    "slug": "wundverschluss",
    "name": "Wundverschluss",
    "level": 0,
    "actions": "B",
    "role": "Heilung",
    "summary": "1W4 Heilung",
    "effect": "Ein dünner Lichtfaden schließt einen oberflächlichen Schnitt. Ein lebendes Ziel mit mindestens 1 regulären TP erhält 1W4 TP zurück.",
    "limits": "Bei 0 TP nicht anwendbar. Beendet keine mechanische Blutung und repariert weder Knochen noch Organe.",
    "healing": "1d4",
    "minimumHitPoints": 1
  },
  {
    "section": "versorgung",
    "sourceId": "R03",
    "slug": "stillender-griff",
    "name": "Stillender Griff",
    "level": 1,
    "actions": "R",
    "role": "Reaktiver Schutz",
    "summary": "6 Schutz gegen einen Blutungspuls",
    "effect": "Der Griff hält eine bereits vorhandene körperliche Blutung für einen Augenblick zurück. Genau ein bestimmter Blutungspuls wird nach anderer Abwehr um 6 vermindert, mindestens auf 0.",
    "limits": "Die Blutungsquelle und weitere Pulse bleiben bestehen. Kein Schutz vor dem ursprünglichen Waffenangriff.",
    "trigger": "Vor Bestätigung eines Blutungspulses am berührten Ziel als Unterstützerreaktion zuordnen.",
    "duration": "Ein zugeordneter Blutungspuls.",
    "manualResolution": "Reaktion vorher anmelden. Den bezeichneten Blutungspuls nach regulärer Abwehr um insgesamt 6 vermindern; keine TP nachträglich heilen."
  },
  {
    "section": "versorgung",
    "sourceId": "R04",
    "slug": "heilende-hand",
    "name": "Heilende Hand",
    "level": 1,
    "actions": "A",
    "role": "Heilung",
    "summary": "2W6 Heilung",
    "effect": "Gesammelte Wärme fließt aus der Hand in die Wunde und stellt 2W6 reguläre TP wieder her. Die Heilung wirkt auch bei 0 TP, solange das Ziel noch lebt.",
    "limits": "Reine TP-Heilung: keine Entfernung von Gift, Blutung oder anderen Zuständen. Kein Attributsbonus.",
    "healing": "2d6",
    "forms": [
      {
        "level": 2,
        "actions": "A",
        "summary": "3W6 Heilung",
        "healing": "3d6",
        "effect": "Die berührende Hand stellt 3W6 reguläre TP wieder her. Alle Zielgrenzen der Grundform bleiben bestehen."
      },
      {
        "level": 3,
        "actions": "A+R",
        "summary": "4W6 Heilung",
        "healing": "4d6",
        "effect": "Die berührende Hand stellt 4W6 reguläre TP wieder her. Alle Zielgrenzen der Grundform bleiben bestehen."
      },
      {
        "level": 4,
        "actions": "A+R",
        "summary": "5W6 Heilung",
        "healing": "5d6",
        "effect": "Die berührende Hand stellt 5W6 reguläre TP wieder her. Alle Zielgrenzen der Grundform bleiben bestehen."
      },
      {
        "level": 5,
        "actions": "A+S",
        "summary": "6W6 Heilung",
        "healing": "6d6",
        "effect": "Die berührende Hand stellt 6W6 reguläre TP wieder her. Alle Zielgrenzen der Grundform bleiben bestehen."
      },
      {
        "level": 6,
        "actions": "A+S",
        "summary": "7W6 Heilung",
        "healing": "7d6",
        "effect": "Die berührende Hand stellt 7W6 reguläre TP wieder her. Alle Zielgrenzen der Grundform bleiben bestehen."
      }
    ],
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Cure_Wounds_Unfaded_Icon.webp"
  },
  {
    "section": "versorgung",
    "sourceId": "R05",
    "slug": "lebensruf",
    "name": "Lebensruf",
    "level": 1,
    "actions": "B",
    "role": "Heilung",
    "summary": "1W4 + 1 Heilung",
    "effect": "Eine kurze Formel trägt einen hellen Impuls zu einem sichtbaren Lebenden. Er erhält 1W4 + 1 TP, auch aus 0 TP heraus, sofern er noch lebt.",
    "limits": "Der Zuschlag +1 ist fest. Das Ziel muss die Formel nicht hören; der Zaubernde muss sie hörbar sprechen. Keine zusätzlichen Zustandsheilungen.",
    "range": "12 m; ein sichtbares Ziel",
    "requirements": "Sicht und hörbar gesprochene Formel; keine freie Hand nötig.",
    "healing": "1d4 + 1",
    "forms": [
      {
        "level": 2,
        "actions": "A+B",
        "summary": "2W4 + 2 Heilung",
        "healing": "2d4 + 2",
        "effect": "Eine stärkere Formel heilt ein sichtbares Ziel in 12 m um 2W4 + 2 TP. Diese Form benötigt Aktion und Bonusaktion."
      }
    ],
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Healing_Word_Unfaded_Icon.webp"
  },
  {
    "section": "versorgung",
    "sourceId": "R06",
    "slug": "auffangender-impuls",
    "name": "Auffangender Impuls",
    "level": 2,
    "actions": "R",
    "role": "Reaktive Heilung",
    "summary": "2W6 Heilung nach einem Treffer",
    "effect": "Ein sichtbarer Lebender erhält unmittelbar nach einem vorher zugeordneten Schadensereignis 2W6 TP. Das Licht fängt die Verletzung auf, ohne den Treffer ungeschehen zu machen.",
    "limits": "Nur nach dem benannten Schaden und nur bei fortbestehendem Leben. Konzentrationsprüfungen, verlorene Konzentration und Begleitzustände bleiben bestehen.",
    "range": "9 m; ein sichtbares Ziel",
    "requirements": "Sicht, freie Hand und eine vorab angemeldete Unterstützerreaktion.",
    "trigger": "Vor Schadensbestätigung anmelden; Heilung erst nach der zugehörigen Schadensbuchung.",
    "outcomeKind": "healing",
    "previewFormula": "2d6",
    "manualResolution": "Den Heilwurf erst nach dem bezeichneten Schaden anwenden und das Überleben prüfen. Die Karte würfelt 2W6 zur gemeinsamen Auswertung; sie schreibt keine bereits bestätigte Schadensbuchung um.",
    "guidedRoll": "2d6"
  },
  {
    "section": "versorgung",
    "sourceId": "R07",
    "slug": "blutstillung",
    "name": "Blutstillung",
    "level": 2,
    "actions": "A",
    "role": "Zustandsbehandlung",
    "summary": "1W6 Heilung · eine Blutung beenden",
    "effect": "Die Wundränder schließen sich um die ausgewählte Blutungsstelle. Genau eine behandelbare nichtmagische Blutung endet; das Ziel erhält 1W6 TP.",
    "limits": "Eine weiter schneidende Klinge, ein Fremdkörper oder eine fortwirkende Ursache wird nicht entfernt und kann erneut Blutung verursachen.",
    "healing": "1d6",
    "manualResolution": "Die 1W6 TP werden geheilt. Genau die ausgewählte zulässige Blutungsinstanz mit der Spielleitung entfernen; keine automatische Löschung anderer Zustände."
  },
  {
    "section": "versorgung",
    "sourceId": "R08",
    "slug": "rettungsnaht",
    "name": "Rettungsnaht",
    "level": 3,
    "actions": "A+R",
    "role": "Zustandsbehandlung",
    "summary": "3W6 Heilung · eine Blutung beenden",
    "effect": "Mehrere helle Nähte erhalten verletztes Gewebe. Der Zauber heilt 3W6 TP und beendet eine bereits erfasste nichtmagische Blutungsinstanz.",
    "limits": "Fehlende Organe oder Glieder werden nicht ersetzt. Auch bei 0 TP nur auf noch lebende Ziele anwendbar.",
    "healing": "3d6",
    "manualResolution": "Die TP-Heilung wird gebucht. Die konkrete Blutungsinstanz gemeinsam auswählen und entfernen; Gewebe und fortwirkende Ursachen gesondert prüfen."
  }
].map(defineRestitutionSpell);
