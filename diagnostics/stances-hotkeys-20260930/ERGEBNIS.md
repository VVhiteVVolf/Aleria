# Stances: Tastenprüfung vom 30.09.2026

Profil: **Nolvus Awakening - SkyrimNet Beta25 Test**. Keine Spiel- oder Moddateien bei dieser Prüfung geändert. Stances bleibt auf Num 1–4.

## Umfang und Grenzen

Die Prioritäten von 3.981 aktivierten MO2-Einträgen wurden berücksichtigt, einschließlich Overwrite und Stock Game/Data. 13.858 gewinnende Textdateien aus SKSE, MCM, Interface und Skriptverzeichnissen wurden erfasst; die Suche ergab 1.401 mögliche Eingabefelder und 236 Skriptstellen zur Tastenabfrage. Nicht jeder Treffer ist tatsächlich ein Hotkey. Konfigurationsvorgaben wurden, wo möglich, mit MCM/Settings zusammengeführt. Windows-VK-Codes und DirectInput-Scancodes sind unterschiedliche Codesysteme.

**„Kein Treffer“ ist keine Garantie für einen freien Hotkey.** Individuelle MCM-Werte, Favoriten-Hotkeys und ESP-Skripteigenschaften können im Spielstand gespeichert sein. ControlMap_Custom.txt ist vorhanden und wurde nicht vollständig dekodiert. Kompilierte DLLs/PEX und BSA-Inhalte wurden nicht vollständig auf intern festgelegte Hotkeys untersucht. Tastatur-/Maussoftware und externe Overlays wurden nicht ausgelesen. Im Spiel wurde kein Tastentest durchgeführt.

## Kandidaten ohne gefundenen eigenständigen Gameplay-Hotkey

Die Tabelle gilt für eine deutsche Standardtastatur. Eingaben in Textfeldern und Menüs sind ausgenommen. Die Kandidaten müssen vor dauerhafter Nutzung im betroffenen Spielstand geprüft werden.

| Taste | Scancode | Einschätzung |
|---|---:|---|
| < (neben linker Shift-Taste) | 86 | Besonders gut erreichbar; erster Kandidat für Stances-All-in-One |
| U | 22 | Kein zugeordneter Hotkey im ermittelten Bestand; brauchbarer All-in-One-Kandidat |
| Ü | 26 | Kein Hotkey gefunden; weiter von WASD entfernt |
| Ö | 39 | Kein Hotkey gefunden |
| Ä | 40 | Kein Hotkey gefunden |
| # | 43 | Kein Hotkey gefunden; zusammen mit Ü/Ö/Ä als Vierergruppe möglich |
| ß | 12 | Kein Hotkey gefunden; wenig ergonomisch |
| ´ | 13 | Kein Hotkey gefunden; Layout-/Totastenverhalten beachten |
| , | 51 | Kein eigenständiger Gameplay-Hotkey gefunden |
| . | 52 | Kein eigenständiger Gameplay-Hotkey gefunden |
| Bild hoch | 201 | Kein eigenständiger Gameplay-Hotkey gefunden; Menü-/Konsolennutzung möglich |
| Bild runter | 209 | Kein eigenständiger Gameplay-Hotkey gefunden; Menü-/Konsolennutzung möglich |
| Ende | 207 | Kein eigenständiger Gameplay-Hotkey gefunden; Texteingabe beachten |
| Rollen | 70 | Kein Hotkey gefunden; Lock-/Overlay-Funktion gesondert prüfen |
| Num * | 55 | Kein eigenständiger Hotkey gefunden, aber Shift+Num * ist ENB-FPS-Anzeige |
| F13 / F14 / F15 | 100 / 101 / 102 | Keine Zuordnung gefunden; meist nur über umprogrammierte Hardware verfügbar, keine vierte Taste zugesichert |

Backspace und Enter sind nur kontextabhängige Kandidaten: Texteingabe, Dialoge und Menüs verwenden sie. Backspace ist außerdem Bestandteil von NPC-Names-Distributor-Kombinationen. Rechte Shift-Taste ist kein unbedenklicher Modifier: ENB verwendet Shift-Kombinationen ohne in der INI eine Seite festzulegen.

## Kombinationen, die mit der bestehenden Stances-Funktion möglich sind

Die installierte Stances.ini dokumentiert All-in-One: Richtung vorwärts = hoch, links = mittel, rückwärts = tief, rechts = neutral. Bei üblichem WASD entspricht das:

| AIO-Taste | Hoch | Mittel | Tief | Neutral |
|---|---|---|---|---|
| < | < + W | < + A | < + S | < + D |
| U | U + W | U + A | U + S | U + D |
| Ü | Ü + W | Ü + A | Ü + S | Ü + D |
| Ö | Ö + W | Ö + A | Ö + S | Ö + D |
| Ä | Ä + W | Ä + A | Ä + S | Ä + D |
| # | # + W | # + A | # + S | # + D |

Auch die übrigen geeigneten Einzeltasten lassen sich grundsätzlich als AIO-Auslöser verwenden. Das sind richtungsabhängige Stance-Wechsel, keine frei programmierbaren Zweitasten-Hotkeys. Gleichzeitige Richtungen und Bedienreihenfolge wurden nicht im Spiel getestet.

## Herkömmliche Modifier-Kombinationen

Die derzeitige dTry-Key-Utils-Konfiguration ordnet einer Taste eine Fähigkeit zu. Sie bietet keine allgemeine Syntax für Shift+1 oder Strg+G. Ein zusätzliches Eingabesystem müsste passende Kombinationen erkennen und gegebenenfalls die bereits belegten Grundtasten unterdrücken.

| Modifier bzw. Gruppe | Vorhandene Verwendung / Beurteilung |
|---|---|
| Linke Shift + 1–4, Buchstaben, F-Tasten | Linke Shift ist Dodge; weitere Mods verwenden sie als Modifier. Keine konfliktfreie Empfehlung. |
| Linke Strg + 1–4 oder Buchstaben | Schleichen; außerdem Favoriten-Zuweisung und Strg+D für Dialogverlauf. Keine freie Standardlösung. |
| Linke Alt + 1–4 oder Buchstaben | Sprinten und OStim-Prism-UI-Kontext. Keine freie Standardlösung. |
| Rechte Strg + 1–4 oder Buchstaben | OCum-Status-Taste sowie mehrere NPC-Names-Distributor-Kombinationen und Dialogverlauf. Nicht pauschal frei. |
| Rechte Alt / AltGr + Tasten | ORomance registriert rechte Alt; SmoothCam-Presets verwenden sie ebenfalls. Aktive SmoothCam-Hauptkonfiguration hat sie deaktiviert, Presets könnten das ändern. AltGr ist auf deutschem Layout zusätzlich problematisch. |
| Rechte Shift + 1–4 | Kein exakter Kombinations-Hotkey gefunden; die Grundtasten 1–4 bleiben aber potenzielle Schnellwahl-/Maustasten. Zusätzliche Eingabeanpassung nötig, nicht konfliktfrei nachgewiesen. |
| Feststelltaste + WASD | Feststelltaste schaltet dauerhaftes Laufen um; vorherige Belegung müsste geändert werden. |
| Strg+Shift, Alt+Shift, Strg+Alt, alle drei + Taste | Mehrere bereits belegte Grundtasten; kein Vorteil ohne gezielte Eingabeunterdrückung. Windows-/Layout-Funktionen zusätzlich möglich. |
| Windows-Taste + Taste | Betriebssystemkombinationen; für diese Spielbelegung nicht empfohlen. |

## Weitere konkret belegte Tasten

- **G:** Wheeler vorheriges Rad, nur im Radkontext. Als Stances-Auslöser nur bedingt geeignet.
- **Z (deutsches Layout):** Wheeler-Bearbeitung; ebenfalls kontextabhängig.
- **F1–F4:** SkyUI-Favoritengruppen; zusätzlich F2 Physik-Hotkey, F3/F4 SkyrimNet.
- **F5/F9:** Schnellspeichern/Schnellladen; F5 zusätzlich Physik-Konfiguration.
- **F6:** SkyrimNet-Dashboard und Kompass-Umschaltung.
- **F7:** SkyrimNet, IED-Vorgabe sowie NarrativeEngine-Dashboard-Vorgabe. Gespeicherte UI/MCM-Einstellungen können abweichen.
- **F8/F10/F12:** SkyrimNet; weitere Anzeige-/Screenshot-Belegungen.
- **F11:** Uhranzeige-Vorgabe; Shift+F11 ENB.
- **Num 1–4:** aktuell Stances sowie OStim/OEdge-Vorgaben in deren Kontext.
- **Pfeiltasten:** OStim und Wheeler-/Menüfunktionen.
- **Einfg:** dMenu; Shift+Einfg Display-Tweaks-OSD.
- **Pos1/Entf:** ReShade; Shift-Kombinationen ENB.
- **Pause:** Vigilant-Szenenüberspringen.
- **+ (DE):** NFF-Vorgabe.
- **8/9:** Bathing-in-Skyrim-Konfigurationsvorgaben; Shift+8 SeverActions-Skriptvorgabe.
- **Maus 1–5/Mausrad:** vom Nutzer bereits belegt; nicht als frei eingestuft.

## Empfehlung

Zuerst **< plus W/A/S/D** als vorhandene All-in-One-Funktion testen, alternativ **U plus W/A/S/D**. Wenn vier getrennte Tasten gewünscht sind: **Ü, Ö, Ä, #** als Kandidatengruppe. Für keine dieser Optionen wurde in dieser Prüfung eine Aktivierung vorgenommen.

## Belege

- `winners.json`: aktuelle Dateigewinner.
- `input-fields.json`, `key-calls.json`: zusätzliche Suchtreffer, einschließlich nicht relevanter Treffer.
- `Hotkeys.csv`, `Spiel-und-Menue-Steuerung.csv`: aktualisierte bekannte Zuordnungen; einige Beschreibungen/Skriptvorgaben aus der früheren Prüfung übernommen, kein vollständiger Laufzeitdump.
- Eingabesyntax im Originalcode: https://github.com/D7ry/DtryKeyUtil/blob/master/src/inputHandler/inputTracer.cpp
- Installierte All-in-One-Dokumentation: `Stances - Dynamic Animation Sets - Nolvus Settings/SKSE/plugins/dtryKeyUtil/config/custom/Stances.ini`.
