import { defineRestitutionSpell } from './restitution-spell.js';

// Authored Restitution edition 1; higher forms replace the stated base values.
export const REINIGUNG_SPELLS = [
  {
    "section": "reinigung",
    "sourceId": "R17",
    "slug": "bitterer-aufschub",
    "name": "Bitterer Aufschub",
    "level": 1,
    "actions": "A+R",
    "role": "Zustandsbehandlung",
    "summary": "Eine Giftwirkung zeitweise unterdrücken",
    "effect": "Die aktiven Folgeschäden und Nachteile genau eines gewöhnlichen Giftes werden für zwei folgende Zielbeiträge unterdrückt. Seine natürliche Restdauer läuft dabei weiter; ausgefallene Pulse verfallen.",
    "limits": "Bereits entstandener Schaden bleibt. Keine Entfernung des Giftes, keine Wirkung auf neue Dosen oder andere Giftquellen.",
    "duration": "Zwei folgende Zielbeiträge, höchstens zehn erzählerische Minuten.",
    "concentration": true,
    "manualResolution": "Kosten werden verbucht. Die beschriebene Behandlung und ihre Grenzen mit der Spielleitung am konkreten Ziel auflösen; Zustände werden nicht pauschal entfernt."
  },
  {
    "section": "reinigung",
    "sourceId": "R18",
    "slug": "gift-ausleiten",
    "name": "Gift ausleiten",
    "level": 2,
    "actions": "A",
    "role": "Zustandsbehandlung",
    "summary": "Eine Giftquelle behandeln",
    "effect": "Eine ausgewählte, behandelbare gewöhnliche Giftinstanz wird mit ihren noch aktiven Folgen beendet. Ein bitterer Schimmer weicht aus dem Körper.",
    "limits": "Verlorene TP bleiben verloren. Besondere oder magische Gifte sind nicht automatisch behandelbar; andere Giftquellen bleiben bestehen.",
    "forms": [
      {
        "level": 4,
        "actions": "A+R",
        "summary": "Bis zu zwei Giftquellen behandeln",
        "effect": "Bis zu zwei ausdrücklich gewählte behandelbare gewöhnliche Giftinstanzen desselben Ziels enden mit ihren aktiven Folgen. Keine TP-Heilung."
      }
    ],
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Protection_from_Poison_Unfaded_Icon.webp",
    "manualResolution": "Kosten werden verbucht. Die beschriebene Behandlung und ihre Grenzen mit der Spielleitung am konkreten Ziel auflösen; Zustände werden nicht pauschal entfernt."
  },
  {
    "section": "reinigung",
    "sourceId": "R19",
    "slug": "fieberbann",
    "name": "Fieberbann",
    "level": 2,
    "actions": "A",
    "role": "Ritual",
    "summary": "Eine gewöhnliche Krankheit behandeln",
    "effect": "Ein zehnminütiges Ritual beendet eine bekannte, behandelbare gewöhnliche Krankheit und ihre aktiven Krankheitszustände. Die Haut des Patienten verliert den fiebrigen Glanz.",
    "limits": "Arkanistenfieber und besondere Seuchen sind ausgeschlossen. Bleibende Organ-, Attribut- und TP-Verluste bleiben; keine Immunität gegen erneute Ansteckung.",
    "ritual": "Zehn ununterbrochene Minuten.",
    "requirements": "Bekannte behandelbare Krankheit, Berührung und ein sauberer Tuchverband pro Patient; Verband wird verbraucht.",
    "manualResolution": "Nach zehn Minuten die bekannte Krankheit und genau ihre zugehörigen aktiven Zustände gemeinsam entfernen. Materialverbrauch gesondert nachhalten.",
    "forms": [
      {
        "level": 4,
        "actions": "A+R",
        "summary": "Eine Krankheit · bis zu drei Patienten",
        "maximumTargets": 3,
        "range": "3 m um den Zaubernden; bis zu drei gewählte Patienten",
        "effect": "Dasselbe zehnminütige Ritual behandelt dieselbe bekannte gewöhnliche Krankheit bei bis zu drei Patienten. Jeder wird zeitweilig berührt; ein sauberer Tuchverband wird je Patient verbraucht."
      }
    ],
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Lesser_Restoration_Unfaded_Icon.webp"
  },
  {
    "section": "reinigung",
    "sourceId": "R20",
    "slug": "keimruhe",
    "name": "Keimruhe",
    "level": 1,
    "actions": "A+R",
    "role": "Zustandsbehandlung",
    "summary": "Krankheitsfortschritt pausieren",
    "effect": "Genau eine bereits vorhandene gewöhnliche Krankheit schreitet sechs erzählerische Stunden nicht weiter fort. Ihre verbleibende Fortschrittszeit läuft erst danach weiter.",
    "limits": "Bestehende Nachteile, Ansteckungsfähigkeit und andere Krankheiten bleiben unverändert. Keine TP-Heilung oder Beseitigung des Erregers.",
    "duration": "Sechs erzählerische Stunden.",
    "manualResolution": "Kosten werden verbucht. Die beschriebene Behandlung und ihre Grenzen mit der Spielleitung am konkreten Ziel auflösen; Zustände werden nicht pauschal entfernt."
  },
  {
    "section": "reinigung",
    "sourceId": "R21",
    "slug": "nerven-loesen",
    "name": "Nerven lösen",
    "level": 3,
    "actions": "A+R",
    "role": "Zustandsbehandlung",
    "summary": "Eine körperliche Lähmung lösen",
    "effect": "Ein zurückkehrendes Kribbeln löst eine ausgewählte nichtmagische Lähmung oder neuromuskuläre Blockade. Das dazugehörige Gewebe muss erhalten sein.",
    "limits": "Keine Fesseln, Versteinerung, Bezauberung oder fortwirkende magische Kontrolle entfernen. Ein verbliebenes Gift kann erneut lähmen.",
    "manualResolution": "Kosten werden verbucht. Die beschriebene Behandlung und ihre Grenzen mit der Spielleitung am konkreten Ziel auflösen; Zustände werden nicht pauschal entfernt."
  },
  {
    "section": "reinigung",
    "sourceId": "R22",
    "slug": "klarer-blick",
    "name": "Klarer Blick",
    "level": 2,
    "actions": "A+B",
    "role": "Zustandsbehandlung",
    "summary": "Eine vorübergehende Sinnesstörung lösen",
    "effect": "Eine körperlich verursachte vorübergehende Seh- oder Hörstörung endet. Das vorhandene Organ findet zu seiner natürlichen Wahrnehmung zurück.",
    "limits": "Schmutz und äußere Hindernisse vorher entfernen. Kein Ersatz zerstörter Organe, kein Durchschauen von Illusionen oder Aufheben magischer Dunkelheit.",
    "forms": [
      {
        "level": 3,
        "actions": "A+R",
        "summary": "Seh- und Hörstörung lösen",
        "effect": "Je eine körperlich verursachte vorübergehende Seh- und Hörstörung desselben Ziels endet. Beide Organe müssen erhalten sein; alle Grenzen der Grundform gelten."
      }
    ],
    "manualResolution": "Kosten werden verbucht. Die beschriebene Behandlung und ihre Grenzen mit der Spielleitung am konkreten Ziel auflösen; Zustände werden nicht pauschal entfernt."
  },
  {
    "section": "reinigung",
    "sourceId": "R23",
    "slug": "reinigender-quell",
    "name": "Reinigender Quell",
    "level": 4,
    "actions": "A+R+B",
    "role": "Zustandsbehandlung",
    "summary": "2W6 Heilung · bis zu zwei Behandlungen",
    "effect": "Ein klarer Strom heilt 2W6 TP und beendet bis zu zwei gewählte behandelbare Instanzen: gewöhnliches Gift, gewöhnliche Krankheit, nichtmagische Blutung oder vorübergehender körperlicher Seh- oder Hörverlust.",
    "limits": "Jede Auswahl muss nach den Grenzen ihres Einzelzaubers zulässig sein. Keine Flüche, besonderen Seuchen oder neuen Organe.",
    "healing": "2d6",
    "manualResolution": "Die Heilung wird gebucht. Die beiden konkreten Zustandsquellen und deren zulässige Folgen gemeinsam auswählen und gezielt entfernen."
  },
  {
    "section": "reinigung",
    "sourceId": "R24",
    "slug": "panazee",
    "name": "Panazee",
    "level": 6,
    "actions": "A+S",
    "role": "Zustandsbehandlung",
    "summary": "18 Heilung · bis zu drei Behandlungen",
    "effect": "Eine umfassende Behandlung stellt 18 TP wieder her und beendet bis zu drei ausgewählte behandelbare Zustandsinstanzen. Zur Auswahl stehen die Behandlungen des Reinigenden Quells und körperliche nichtmagische Lähmung.",
    "limits": "Kein Allheilmittel: Versteinerung, Beherrschung, Flüche, Arkanistenfieber, verlorene Glieder und dauerhafte Attributverluste bleiben ausgeschlossen.",
    "healing": 18,
    "manualResolution": "18 TP werden geheilt. Höchstens drei tatsächlich zulässige Zustandsquellen mit der Spielleitung behandeln; keine globale Zustandsreinigung.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Restore_Vitality_Unfaded_Icon.webp"
  }
].map(defineRestitutionSpell);
