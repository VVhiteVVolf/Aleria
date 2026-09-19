# Kreaturenbögen und Bildersets

Stand: 19. September 2026. Die Umsetzung liegt lokal vor; sie ist noch nicht veröffentlicht.

## Seiten

Der gemeinsame Kreaturenbogen gilt für gespeicherte Kreaturen, Grundvorlagen und neue Entwürfe. Er besitzt sieben Reiter: Übersicht, Profil, Kampfwerte, Angriffe & Kräfte, Magie & Aura, Beute sowie Bilder & Emotes. Die Seiten bleiben im DOM, damit beim Wechsel keine ungespeicherten Eingaben oder ausgeblendeten Sammlungen verloren gehen. Formularabfragen sind auf den Kreaturenbogen begrenzt.

Die bisherige Lootbox liegt auf einer eigenen Seite. Neue Kreaturen beginnen ohne Beute; bereits hinterlegte Münzen, Gegenstände, Mengen, Fundchancen und Notizen bleiben erhalten. Kampfdetails verwenden weiterhin den gemeinsamen Detaileditor und die bestehenden Ressourcenregeln.

## Bilder

Wie bei Charakteren stehen bis zu 20 benannte Sets mit je einem Portrait und 80 Avataren bereit. Einzelne Bildlinks, mehrere Links, Zwischenablage, Drag-and-drop und Imgur-Alben werden unterstützt. Neue Importe überspringen vorhandene Bildlinks. Gespeicherte Kreaturen-Avatare behalten ihre IDs, Beschriftungen und Reihenfolge, auch wenn ältere Einträge dasselbe Bild verwenden.

Der Standardbestand wird weiterhin in `portrait` und `avatars` bereitgestellt; `imageSets`, `activeImageSetId` und `imageSetSchemaVersion` ergänzen das Kreaturenschema 4. JSON-Import, Export, Duplizieren und die Kommentar-Szenenakteure transportieren die Bildersets mit. Neue und bearbeitete Kommentare verwenden das bestehende `imageSetId` je Abschnitt auch für Kreaturen und ihre Szeneninstanzen.

Imgur-Alben verwenden denselben Dienst wie der Charaktereditor: `/.netlify/functions/imgur-album`. Ein reiner lokaler Dateiserver stellt diesen Netlify-Dienst nicht bereit. Einzelne Bildlinks funktionieren unabhängig davon. Späte Album- und Zwischenablageantworten werden verworfen, wenn inzwischen der Bogen oder das Bilderset gewechselt wurde.

## Zuständigkeiten und Speicherung

- `modules/image-library/`: gemeinsames, zustandsloses Bildmodell, Importfunktionen und serialisierte automatische Speicherwarteschlange. Die bisherigen Classic-Script-APIs der Charaktere bleiben als Adapter erhalten. Die beiden Modell-/Importdateien können sowohl durch verzögerte Classic-Scripts als auch durch ES-Module geladen werden; ihre Installation ist idempotent.
- `modules/creatures/creature-images-*`: Kreaturenmodell-Anbindung, Darstellung und vorübergehender Editorzustand.
- `modules/creatures/creature-sheet-pages.*`: Seitenstruktur, Tastaturnavigation und Layout.
- `creature-system.js`: Kreaturenbestand, Entwurf und bestehende Firebase-Anbindung.

Bildänderungen an bereits gespeicherten Kreaturen speichern automatisch ausschließlich Bildfelder und Bildunterschrift. Grundvorlagen und neue Kreaturen benötigen zuerst „Online speichern“. `combatProfile` und `loot` bleiben bei reinen Bildspeicherungen vollständig ausgespart. Beim regulären Speichern gilt weiterhin `selectChangedSections` mit dem beim Öffnen geladenen Stand. Vorhandene Kampfsperren der Firebase-Anbindung bleiben wirksam.

## Prüfung

50 Tests: Kreaturendaten, Bildmigration und Export/Import, bestehende Charakterbildfunktionen, Imgur-Anbindung, Kommentar-Bildersets einschließlich Kreaturen-Szeneninstanzen und die gemeinsame Speicherwarteschlange.

```powershell
node --test --experimental-test-isolation=none AleriaAlmanach/tests/creature-system.test.mjs AleriaAlmanach/tests/creature-images.test.mjs AleriaAlmanach/tests/character-image-sets.test.mjs AleriaAlmanach/tests/character-avatar-import.test.mjs AleriaAlmanach/tests/comment-segment-image-sets.test.mjs AleriaAlmanach/tests/character-image-library-autosave.test.mjs
```

Zusätzlich lokal im Browser mit Testdaten geprüft: alle sieben Reiter bei 1440, 1024, 760 und 390 Pixeln; 25 Avatare, mehrere Sets, Bild-Autosave ohne Kampf-/Beutedaten, Wiederöffnen, verspätetes Album, Zwischenablage und Bild-Drag-and-drop, Avatarentfernung, Kampfdetailbearbeitung, verschachteltes Escape, Beuteeinträge und leere neue Lootboxen. Albumantworten und Speichervorgänge wurden dabei simuliert; keine produktiven Kreaturen wurden verändert.

Der Produktionsbuild ist erfolgreich. Vorherige Darstellung: `Old Design/2026-09-19-Kreaturenboegen/` im Projektstamm.
