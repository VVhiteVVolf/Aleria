import { defineRestitutionSpell } from './restitution-spell.js';

// Authored Restitution edition 1; higher forms replace the stated base values.
export const LEBENSKRAFT_SPELLS = [
  {
    "section": "lebenskraft",
    "sourceId": "R25",
    "slug": "schmerzlinderung",
    "name": "Schmerzlinderung",
    "level": 0,
    "actions": "B",
    "role": "Erholung",
    "summary": "Bis zu 1 Punkt Schmerzmalus lindern",
    "effect": "Berührung beruhigt den Schmerz. Ein ausdrücklich dokumentierter schmerzbedingter Zahlenmalus einer bestimmten Wurfart wird um höchstens 1 gelindert.",
    "limits": "Kein Bonus über den gesunden Wert, keine TP-Heilung oder Schadensreduktion. Konzentrationsprüfungen bleiben erforderlich.",
    "duration": "Bis Ende des nächsten folgenden Zielbeitrags.",
    "concentration": true,
    "forms": [
      {
        "level": 2,
        "actions": "A+R",
        "summary": "Bis zu 2 Punkte Schmerzmalus lindern",
        "duration": "Zwei folgende Zielbeiträge.",
        "effect": "Ein dokumentierter Schmerzmalus einer bestimmten Wurfart wird um höchstens 2 gelindert. Konzentration; höchstens bis zum gesunden Ausgangswert."
      }
    ],
    "manualResolution": "Kosten werden verbucht. Die beschriebene Behandlung und ihre Grenzen mit der Spielleitung am konkreten Ziel auflösen; Zustände werden nicht pauschal entfernt."
  },
  {
    "section": "lebenskraft",
    "sourceId": "R26",
    "slug": "frischer-atem",
    "name": "Frischer Atem",
    "level": 1,
    "actions": "A+R",
    "role": "Erholung",
    "summary": "Bis zu 2 Punkte Überanstrengungsmalus lindern",
    "effect": "Der Atem wird ruhiger. Ein ausgewählter Zahlenmalus aus gewöhnlicher körperlicher Überanstrengung wird für zwei folgende Zielbeiträge um höchstens 2 gelindert.",
    "limits": "Keine zusätzliche Bewegung, neue Aktion oder Mana. Nahrung, Wasser, Luft und Schlaf werden nicht ersetzt; keine Attribute über den gesunden Wert erhöhen.",
    "duration": "Zwei folgende Zielbeiträge.",
    "concentration": true,
    "manualResolution": "Kosten werden verbucht. Die beschriebene Behandlung und ihre Grenzen mit der Spielleitung am konkreten Ziel auflösen; Zustände werden nicht pauschal entfernt."
  },
  {
    "section": "lebenskraft",
    "sourceId": "R27",
    "slug": "erwachen",
    "name": "Erwachen",
    "level": 0,
    "actions": "B",
    "role": "Erholung",
    "summary": "Gewöhnlichen Schlaf beenden",
    "effect": "Ein leiser Impuls weckt ein lebendes Ziel aus gewöhnlichem Schlaf oder beendet genau eine rein schlafbedingte Benommenheit.",
    "limits": "Keine Wirkung bei 0 TP, Koma, Narkosegift, magischem Schlaf oder körperlicher Handlungsunfähigkeit. Verbrauchte Aktionen bleiben verbraucht.",
    "range": "6 m; ein sichtbares Ziel",
    "requirements": "Sicht und gesprochene Formel.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Sleep_Unfaded_Icon.webp",
    "manualResolution": "Kosten werden verbucht. Die beschriebene Behandlung und ihre Grenzen mit der Spielleitung am konkreten Ziel auflösen; Zustände werden nicht pauschal entfernt."
  },
  {
    "section": "lebenskraft",
    "sourceId": "R28",
    "slug": "kraft-zurueckfuehren",
    "name": "Kraft zurückführen",
    "level": 3,
    "actions": "A+R",
    "role": "Erholung",
    "summary": "Bis zu 2 verlorene Attributspunkte reparieren",
    "effect": "Nach Ende der Ursache kehrt geschädigte körperliche Kraft zurück. Bis zu zwei dokumentiert verlorene Punkte eines körperlichen Attributs werden wiederhergestellt.",
    "limits": "Nur Stärke, Geschicklichkeit oder Konstitution bis zum belegten früheren Wert. Keine zusätzliche TP-Heilung, neuen Fertigkeiten oder freie Attributssteigerung.",
    "manualResolution": "Ausgangswert und beendete Ursache bestätigen. Das betreffende Profil gezielt korrigieren und abgeleitete Werte konsistent neu berechnen; aktuelle TP nicht auffüllen.",
    "forms": [
      {
        "level": 5,
        "actions": "A+R+B",
        "summary": "Bis zu 4 verlorene Attributspunkte reparieren",
        "effect": "Bis zu vier dokumentiert verlorene Punkte desselben körperlichen Attributs werden wiederhergestellt. Der frühere gesunde Wert bleibt die Obergrenze."
      }
    ]
  },
  {
    "section": "lebenskraft",
    "sourceId": "R29",
    "slug": "lebenskraft-ordnen",
    "name": "Lebenskraft ordnen",
    "level": 4,
    "actions": "A+R+B",
    "role": "Erholung",
    "summary": "Bis zu 10 verlorene Maximal-TP reparieren",
    "effect": "Geschädigte Lebenskraft findet ihre frühere Ordnung. Bis zu zehn dokumentiert verlorene Punkte des TP-Maximums werden wiederhergestellt.",
    "limits": "Aktuelle TP bleiben unverändert. Kein Maximum über den belegten Ausgangswert und keine Umgehung einer weiter bestehenden Ursache.",
    "manualResolution": "Früheres Maximum und beendete Ursache bestätigen; ausschließlich den dokumentierten Verlust korrigieren. Keine aktuelle Heilung buchen.",
    "forms": [
      {
        "level": 6,
        "actions": "A+S",
        "summary": "Bis zu 20 verlorene Maximal-TP reparieren",
        "effect": "Bis zu zwanzig dokumentiert verlorene Punkte des TP-Maximums kehren zurück. Aktuelle TP bleiben unverändert und der frühere Ausgangswert bleibt die Grenze."
      }
    ]
  },
  {
    "section": "lebenskraft",
    "sourceId": "R30",
    "slug": "genesungsschlaf",
    "name": "Genesungsschlaf",
    "level": 2,
    "actions": "A+R",
    "role": "Ritual",
    "summary": "Einen Überanstrengungszustand behandeln",
    "effect": "Nach zehn Minuten Vorbereitung schläft ein einverstandenes Ziel zwanzig Minuten in weckbarer Heilruhe. Bei vollständigem Abschluss endet ein vorher benannter gewöhnlicher körperlicher Überanstrengungszustand.",
    "limits": "Unterbrechung beendet die Behandlung. Keine Rast- oder Ressourcenbuchung und kein Ersatz für Schlafmangel, Nahrung, Wasser oder Krankheitsbehandlung.",
    "ritual": "Zehn Minuten Vorbereitung, dann zwanzig Minuten Heilschlaf.",
    "duration": "Wirkung bei vollständigem Abschluss.",
    "manualResolution": "Kosten beim Beginn des eigentlichen Heilschlafs buchen. Nach zwanzig ungestörten Minuten genau den vereinbarten Zustand behandeln; bei Unterbrechung keine Wirkung oder Kostenerstattung.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Prayer_of_Healing_Unfaded_Icon.webp"
  },
  {
    "section": "lebenskraft",
    "sourceId": "R31",
    "slug": "geistige-sammlung",
    "name": "Geistige Sammlung",
    "level": 3,
    "actions": "R+B",
    "role": "Reaktiver Schutz",
    "summary": "Eine Rettung gegen Furcht oder Verwirrung wiederholen",
    "effect": "Ein kurzer Moment der Klarheit erlaubt eine zweite Auswertung einer bereits erlaubten, vorläufig misslungenen Rettung gegen Furcht oder Verwirrung. Das zweite Ergebnis gilt.",
    "limits": "Genau eine Wiederholung. Keine zusätzliche Rettung gegen Beherrschung, Besessenheit oder Flüche und keine neue Befreiungsart, wenn die Ursprungswirkung keinen Rettungswurf erlaubt.",
    "range": "9 m; ein sichtbares Ziel",
    "trigger": "Nach vorläufigem Misslingen, vor endgültiger Bestätigung der Ursprungswirkung anmelden.",
    "requirements": "Sicht, freie Hand und eine zulässige Rettung vor ihrer endgültigen Bestätigung.",
    "manualResolution": "Die zweite Rettung mit denselben Grundregeln durchführen und deren Ergebnis statt des ersten verwenden. Erfolgs- und Misserfolgsfolgen stammen aus der Ursprungswirkung.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Calm_Emotions_Unfaded_Icon.webp"
  },
  {
    "section": "lebenskraft",
    "sourceId": "R32",
    "slug": "tiefenrestitution",
    "name": "Tiefenrestitution",
    "level": 7,
    "actions": "A+S+R",
    "role": "Ritual",
    "summary": "Attributverluste und Maximal-TP reparieren",
    "effect": "Zehn Minuten umfassender Ordnung reparieren bis zu vier verlorene Attributspunkte, verteilt auf höchstens zwei Attribute, sowie bis zu zwanzig verlorene Punkte des TP-Maximums.",
    "limits": "Nur dokumentierte reparable Verluste nach Ende ihrer Ursachen. Keine Erinnerungen, Stufen, Verjüngung, aktuellen TP oder Ressourcen gewinnen.",
    "ritual": "Zehn ununterbrochene Minuten.",
    "manualResolution": "Ausgangswerte und Verluste vor Beginn festhalten. Nach Abschluss exakt diese Profilverluste berichtigen; abgeleitete Werte neu berechnen, ohne aktuelle TP aufzufüllen.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Greater_Restoration_Unfaded_Icon.webp"
  }
].map(defineRestitutionSpell);
