# Zwei Auswahlen und Bestandsabgleich · 22. September 2026

Neben der bestehenden Liste öffnet „Übersicht öffnen“ eine große modale Tabelle. Jede Kampfform und jeder sonstige Bereich erhält eine eigene Spalte. Beide Ansichten verwenden dieselben Gruppen, Einträge, Aktionskosten und Kompatibilitätsregeln. Die Tabelle zeigt zusätzlich die Wirkung, unterstützt Volltextsuche, das Ausblenden gesperrter Handlungen und Tastaturbedienung. Auf schmalen Bildschirmen sind die Spalten seitlich scrollbar. Eine Auswahl löst weder eine Reservierung noch einen Wurf aus.

Darstellung und Filter sind in `combat-action-choice.js` gemeinsam gekapselt, die Tabelle in `combat-action-table.js` und `styles/combat-action-table.css`. Der Dialog gehört zu seinem Beitragsabschnitt und wird bei dessen Ersetzung entfernt. Keine neue globale Auswahllogik oder Firebase-Anbindung im UI.

## Bestandsprüfung

275 Online-Einträge geprüft, davon 24 mit Kampfdaten. 13 besitzen eine ausgearbeitete Klasse; die übrigen elf sind klassenlose Grundbögen. Zusätzlich wurden die 19 lokalen Datenbankbögen abgeglichen. Alle dort ausgearbeiteten Klassen sind im Online-Abgleich enthalten; Gais und Nudd besitzen ihre vollständigen Bögen bereits online.

| Figur | Klasse | Stufe | Reguläre Techniken nach vollständigem Abgleich |
| --- | --- | ---: | ---: |
| Gethin | Teulu | 5 | 8 |
| Kane Draig | Teulu | 5 | 8 |
| Fenrir Varulv | Skjaldr | 6 | 22, davon vier persönliche Techniken |
| Freya Skald | Skalde | 5 | 10 |
| Ylva Wolfshorn | Skytte | 7 | 21 |
| Asgeir Wolfshorn | Skjaldr | 7 | 21 |
| Gildas Gafyr | Teulu | 6 | 10 |
| Guinevere Neidr | Helwyr | 5 | 11 |
| Nudd Saethwyr | Cantref | 6 | 10 |
| Gais Wyrm | Uchelwyr | 5 | 14 |
| Gawain Draig | Teulu | 5 | 8 |
| Duncan Gafyr | Teulu | 20 | 65 |
| Rhiannon Draig | Magier | 6 | Eigenes Zauberrepertoire; zwei besondere Klassenfähigkeiten |

Besondere Klassenmanöver kommen zur genannten Technikzahl hinzu. Freyas besonderes Manöver heißt nun „Klinge im Heldenvers“, damit es nicht mehr denselben Namen wie der anders bepreiste reguläre „Betonte Schlusshieb“ trägt.

Bei Duncan wurde die bisherige allgemeine Obergrenze von 60 Listeneinträgen als Fehler gefunden. Techniken besitzen jetzt ein eigenes Limit von 256 Einträgen. Dadurch bleiben alle 65 regulären und drei besonderen Angriffe seines aktuellen Online-Bogens erhalten. Die Archiv-Testfigur enthält einen zusätzlich gewählten Pfad und daher 80 Techniken; diese abweichende Pfadwahl wird nicht in den Online-Bogen kopiert.

## Gezielte Übernahme

`firebase/functions/scripts/character-arsenal-release-model.mjs` erzeugt ausschließlich Änderungen an `combatProfile.techniques`, `combatProfile.abilities` und `combatProfile.classTraining`. Gemeinsame Katalogabgleiche übernehmen freigeschaltete Formen und bestehende Regelkorrekturen. Individuelle Techniken bleiben erhalten. Das Modell ist idempotent; klassenlose Bögen bleiben unangetastet.

Der einmalige Online-Abgleich verwendet eine vorherige Sicherung und Firestore-`updateTime`-Vorbedingungen pro Dokument. Keine vollständigen Charakterersetzungen. TP, Ressourcen, Inventar, aktive Zustände, Identität und vergangene Beiträge sind nicht Bestandteil der Schreibmaske. Nach dem Schreiben wird jedes vollständige Dokument gegen die erwartete Änderung geprüft.

## Prüfung

Die Regressionen prüfen gleiche Auswahlmengen und Kosten, gesperrte Einträge, sichere Freitextausgabe, vollständige Meisterarsenale auf Browser und Server sowie verlustfreie Bestandsabgleiche. Der lokale Browsertest am echten Beitragsformular umfasst Listenauswahl, Popup-Auswahl, Suche, Filter, Escape/Fokusrückgabe, Mobilansicht und Duncans großes Arsenal. Produktionsbuild erfolgreich; bestehende Bundle-Größenwarnung unverändert.
