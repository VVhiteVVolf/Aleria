# Prüfung der Kampfauswahl und ihrer Schnittstellen

Stand: 7. September 2026. Änderungen lokal umgesetzt, noch nicht veröffentlicht.

## Ursache der doppelten Jungdrachen-Gruppe

Die ursprünglichen sechs Teulu-Techniken speichern als Ausbildungsnamen `Drachentanz Form I · Tanz des Jungdrachens`, die vier Ergänzungen `Drachentanz · Tanz des Jungdrachens`. Beide haben bereits dieselbe `combatStyleFormId`. Die Kampfauswahl verwendete den gespeicherten Text als Gruppenschlüssel und teilte dieselbe Form dadurch in zwei Listen auf. Die Techniken selbst waren nicht doppelt vergeben.

Die neue Anzeige verwendet Stil- und Form-ID als Gruppenschlüssel. Ein kleines gemeinsames Namensverzeichnis liest die bestehenden Formdefinitionen, ohne komplette Attackenkataloge für eine Beschriftung zu laden. Alle 503 Techniken aus Drachentanz, Sirenentanz und Huskarl sind dagegen geprüft. Eigene Formen ohne bekannte ID behalten ihren Freitext; unterschiedliche eigene IDs werden nicht allein wegen gleicher Namen zusammengelegt.

Die gemeinsame Beschriftung wird in Kampfauswahl, Auswahlmetadaten, Archiv-Kurzangaben und der Startausbildungs-Vorschau verwendet. Gespeicherte IDs, eigene Beschreibungen und mechanische Werte werden dabei nicht umgeschrieben. Die Archiv-Baumstruktur war bereits ID-basiert und bleibt erhalten.

## Behobene Bedienungs- und Darstellungsfehler

| Befund | Änderung |
| --- | --- |
| Ein Formname erzeugte zwei Gruppen | Gruppierung nach stabiler Stil-/Form-ID; bei Gawain eine Jungdrachen-Gruppe mit acht Techniken |
| Ergänzende Grundtechniken standen nach höheren Stufen | Techniken innerhalb einer Gruppe nach Mindeststufe sortiert; Gleichstände behalten ihre Reihenfolge |
| Angriffssuche und Listenposition gingen beim Neuzeichnen verloren | Suchtext, Filter, Fokus, Cursorposition und Scrollposition werden im lokalen Ansichtsstatus erhalten |
| Alte Auswahl-ID zeigte „Handlung wählen“, während Kampfwerte einen aufgelösten Angriff verwendeten | Sichtbare Auswahl und native Rückfallebene verwenden dieselbe aufgelöste Aktion wie Kosten und Kampfwerte |
| Tastatur konnte die gesamte Optionsliste beim Tabben überspringen | Ein erreichbarer Listenfokus, Pfeiltasten, Enter und Escape; deaktivierte Optionen werden bei der Auswahl übersprungen |
| Gesperrte Zeilen waren durch Gesamttransparenz schwer lesbar | Kontrastreichere Texte und dezenter Hintergrund; Sperrgrund bleibt direkt sichtbar |
| Kleine Bildschirme wurden von der ausklappenden Liste überlagert | Im schmalen Container öffnet die Liste im Seitenfluss; ihre Optionen scrollen unabhängig |
| Waffenhinweis verlangte immer eine Bonusaktion | Kostenneutraler Hinweis zur Waffenwahl; die Waffenleiste zeigt weiterhin kostenloses Startausrüsten beziehungsweise tatsächliche Wechselkosten |
| Führungsauswahl zeigte teilweise bereits verstärkten Technikschaden | Ein-/zweihändige Führung zeigt den Grundwürfel der geführten Waffe; der vollständige Angriff steht bei den Kampfwerten |
| Mehrere feste Boni erschienen als `2W8+2 +5` | Gemeinsame Würfelnotation zeigt `2W8+7`, ohne Änderung des Ergebnisses |

Die Liste erhält abgestufte Pergamentüberschriften, Anzahl der sichtbaren Einträge pro Gruppe, Mindeststufen und Zeilentrennung. Gruppenüberschriften bleiben beim Scrollen sichtbar. Die gewählte Zeile, ihre Kostenicons und der Fokus sind getrennt erkennbar.

## Verantwortung und Performance

- `combat-form-presentation.js`: ausschließlich Formschlüssel und lesbare Beschriftung aus vorhandenen Definitionen.
- `combat-action-card.js`: Zuordnung der Aktionen zu ihren Quelldaten und Gruppen sowie gemeinsame Schadensnotation.
- `combat-action-picker.js`: Rendering, Filter und lokale Bedienung der Auswahl.
- `combat-composer-view-state.js`: Wiederherstellung flüchtiger Anzeigezustände; keine Kampfregeln oder Ressourcenmutation.
- `combat-ui.js`: Zusammenbau der Oberfläche aus dem bereits aufgelösten Profil.

Native Auswahl und sichtbare Liste verwenden pro Neudarstellung dieselbe einmal berechnete Gruppierung. Die Anzeige benötigt keine neuen Firebase-Abfragen. Listener bleiben an den jeweiligen Composer beziehungsweise die jeweilige Liste gebunden; es werden keine dauerhaften globalen Listener oder globalen UI-Zustände hinzugefügt. Die Rückfallebene mit nativer Auswahl bleibt bestehen.

## Prüfung und Grenzen

**593 Frontend-/Mechaniktests und 90 Servertests bestanden**, keine Fehler oder übersprungenen Tests. Zusätzlich sind Produktions-Build, Klassen-/Bibliotheksabgleich und `git diff --check` erfolgreich. Die neuen Regressionstests prüfen alle 503 Katalogeinträge, gemischte alte/neue Jungdrachen-Texte, individuelle Form-IDs und die zusammengefasste Schadensanzeige.

Die Browserprüfung verwendete die echten Anzeige-, Profilauflösungs- und Kostenmodule mit einer lokalen Fixture und den gespeicherten Profilen von Gawain, Gildas, Duncan, Guinevere, Fenrir und Freya. Geprüft wurden:

- Einzige Jungdrachen-Gruppe mit acht Techniken bei Gawain und sieben unterschiedliche Drachentanz-Formen/Pfade bei Duncan.
- Suchfilter, leere Trefferliste, Tastaturauswahl, Escape, Erhalt von Fokus und Scrollposition bei Aktualisierungen.
- Veraltete Auswahl-ID: sichtbare Auswahl, native Auswahl und aufgelöstes Profil stimmen überein.
- Schadensfreie Abwehr, Ressourcenreservierung und Rücknahme, Wechsel zwischen normaler und Aura-Zahlung.
- Mehrere ausgewählte Ziele mit Porträt/Initial und Trefferwahrscheinlichkeit; Suchfilter verliert die ausgewählten IDs nicht.
- Freyas Gesangsauswahl und vorhandene Kampfprofile aus unterschiedlichen Klassen.
- Desktop 1360 px, Tablet 768 px und Mobil 390 px. Auf Tablet und Mobil kein horizontaler Überlauf; mobil steht das Zielfeld unter der geöffneten Auswahl.

Es traten keine JavaScript-Fehler auf. Der integrierte Browser war nicht verfügbar, deshalb wurde lokal Edge verwendet. Externe Bildaufrufe waren gesperrt; vorhandene Bild-Fallbacks wurden damit ebenfalls geprüft. Die Fixture stellt die Oberfläche und ihre Eingabeübergänge nach; sie ist kein neuer authentifizierter Live-Kampftest. Produktive Firebase-Daten wurden nicht verändert. Lokale Browserinstanz und Testserver wurden beendet und die Fixture-Datei entfernt.

Bildbelege: [Desktop](interface-check/gawain-desktop.png), [Tablet](interface-check/gawain-tablet.png), [Mobil](interface-check/gawain-mobile.png).

Vite meldet weiterhin große Ausgabepakete, insbesondere das bestehende Almanach-Hauptbundle. Die Änderungen reduzieren doppelte Arbeit beim Aufbau der Auswahl, ersetzen aber keine gesonderte Untersuchung und Aufteilung dieses Hauptbundles.
