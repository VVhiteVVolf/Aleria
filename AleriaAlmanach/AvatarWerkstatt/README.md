# AvatarWerkstatt für Aleria

Hier werden Charakterporträts als zusammenhängende 9er-Reaktionssets vorbereitet und mit dem Avatar Splitter Pro V3 in einzelne Avatare zerlegt. Anleitungen, Beispiele, unveränderte Ausgangsdateien und neue Ausgaben haben eigene Ordner. Künftige Aufträge verwenden diese Struktur für einzelne Charaktere oder gemeinsame Gruppen.

## Gesicherter Bestand

Die Kopie vom 11. Oktober 2026 stammt aus `D:\0-KI Generierte\01 Bilder\Charaktere\Avatare Erstellungs Ordner`. Alle 238 übernommenen Dateien wurden anhand von SHA-256-Prüfsummen mit ihren Quellen verglichen. Der ursprüngliche Ordner wurde nicht verändert. Die vollständige Zuordnung steht in [import-manifest.json](import-manifest.json).

| Ordner | Inhalt |
| --- | --- |
| [Anleitungen](Anleitungen/) | Die drei originalen Word-Anleitungen und vollständige UTF-8-Lesefassungen |
| [Werkzeuge/Avatar Splitterer](Werkzeuge/Avatar%20Splitterer/) | Unveränderte V3 mit Startdatei, Abhängigkeiten, Anleitung und ursprünglicher Konfiguration |
| [Beispiele/9er-Sheets](Beispiele/9er-Sheets/) | Sechs angesehene Beispiele: Aldo, Gais, Heledd, Morgan, Refri und Maredudd |
| [Charaktere/Gruppen/Idwals Crew](Charaktere/Gruppen/Idwals%20Crew/) | Vollständige Kopie der 202 Dateien, einschließlich bisheriger `Benutzt`- und `output`-Ordner |
| [Charaktere/Gruppen/Lachende Nixe](Charaktere/Gruppen/Lachende%20Nixe/) | Vorhandenes 9er-Sheet |
| [Charaktere/Gruppen/Schwarzfische](Charaktere/Gruppen/Schwarzfische/) | Alle neun vorhandenen Sheets |
| [Charaktere/Einzelcharaktere/Yvain](Charaktere/Einzelcharaktere/Yvain/) | Vorhandenes Sheet und seine neun bereits zerlegten Avatare |
| [Charaktere/Einzelcharaktere/Gawain/Hochzeit](Charaktere/Einzelcharaktere/Gawain/Hochzeit/) | `Gawain Hochzeit.png` als Porträt und `Gawain Hochzeit Avatare.png` als 9er-Sheet |
| [Vorlagen](Vorlagen/) | Kopierbare Ordnerstruktur, Auftragsvorlage und Einstellungen für randlose 9er-Sheets |
| [Output](Output/) | Gemeinsame Ausgabe; `Prueflauf` enthält die technische Probezerlegung |

Die übernommenen Charakterordner liegen jeweils vollständig unter `Originale`, mit ihren bisherigen Dateinamen und Unterordnern. Bereits vorhandene Einzelavatare bleiben dadurch in `Originale/output` beziehungsweise Yvains ursprünglichem Sheet-Unterordner auffindbar. Der alte V2-Splitter in Idwals Crew gehört zum historischen Bestand; für neue Arbeiten gilt die zentrale V3.

## Ordner für einen Charakter oder eine Gruppe

```text
Charaktere/
  Gruppen/<Gruppenname>/
  Einzelcharaktere/<Charaktername>/
    Originale/                 unveränderte übernommene Quelldateien
    Referenzen/                verbindliche Porträts für neue Aufträge
    Prompts/                   ausgefüllte Aufträge und verwendete Prompts
    Sheets/                    vollständige neue 9er-Sheets
    Verarbeitung/
      set-01/                  Arbeitskopie genau eines Sheets
        output/                Ergebnis der V3-Ordnerverarbeitung
        Benutzt/               von V3 verschobene Arbeitskopie
    Output/
      set-01/                  geprüfte fertige Einzelavatare
```

Jeder Gruppenordner besitzt dieselbe Struktur. Bei mehreren benannten Figuren in einer Gruppe dürfen darunter eigene Charakterordner nach der Vorlage angelegt werden. Unterschiedliche Kleidung, Anlässe oder Bildvarianten bekommen bei Bedarf einen eigenen Unterordner, wie `Gawain/Hochzeit`.

Für neue Figuren oder Gruppen [Vorlagen/Charakterordner](Vorlagen/Charakterordner/) an die passende Stelle kopieren und benennen. Pro neuem Set einen eigenen Ordner `set-02`, `set-03` usw. unter `Verarbeitung` und `Output` anlegen. Dateinamen sollen Figur und Set enthalten, beispielsweise `yvain-allgemein-set-01.png`. Bestehende Dateien nicht überschreiben.

## Avatar-Sheets erstellen

1. Das verbindliche Porträt tatsächlich ansehen. Bei vorhandenen Figuren bestimmen seine Gesichtszüge, Alter, Haare, Bart, Kleidung, Rüstung, Farben und Zeichenstil die Identität. Andere Beispiele liefern nur Hinweise zu Layout und Gestik.
2. Die [Master-Anleitung](Anleitungen/Lesefassungen/Charakter-Emotionssheet%20Master%20Prompt.txt), den [Expression-Sheet-Prompt](Anleitungen/Lesefassungen/Character_Expression_Sheet_Prompt.txt) und die [Avatar-Anweisungen](Anleitungen/Lesefassungen/Anweisungen.txt) lesen. Die `.docx`-Originale bleiben die vollständigen Ausgangsdokumente; die Textdateien sind reine Lesefassungen.
3. [Vorlagen/Avatar-Auftrag.json](Vorlagen/Avatar-Auftrag.json) nach `Prompts` kopieren. Charakter, Referenzbild, Setname und alle neun Emotionen mit jeweils passender Gestik ausfüllen. Die vorbelegten allgemeinen Reaktionen stammen aus `Anweisungen.docx`; andere Themen sind möglich.
4. Den vollständigen Master-Prompt verwenden und seine Platzhalter für Charakterbeschreibung, Thema und Panel-Liste ersetzen. Das Porträt als tatsächliche Bildreferenz mitgeben. Den konkret verwendeten Prompt neben dem Auftrag speichern.
5. Ein **quadratisches Gesamtbild im Format 1:1 mit 3×3 gleich großen Feldern** erzeugen. Das 2:3-Format normaler Aleria-Porträts gilt für das Ausgangsporträt, nicht für dieses Sheet.
6. Alle neun Felder prüfen und das vollständige Sheet unter `Sheets` sichern. Für neue Sheets sind durch drei teilbare quadratische Pixelmaße günstig; die vorhandenen Beispiele haben 1254×1254 Pixel und damit grundsätzlich 418×418 Pixel pro Feld.

Die Person, der Hintergrund, die Beleuchtung, die Kameradistanz und der Bildausschnitt bleiben über alle Felder konsistent. Die Figur ist von Brust bis Oberkörper sichtbar, mit Platz für lesbare Hände und Gesten. Ausdruck entsteht durch Augen, Brauen, Mund, Blick und Körperhaltung; keine Verzerrung der Identität. Jedes Feld braucht einen eigenen erzählerischen Zweck und eine erkennbare passende Geste.

Keine Schrift, Beschriftungen, Nummerierung, Symbole, Sprechblasen, weißen Trennlinien, äußeren Rahmen oder zusätzlichen Requisiten. Hände bleiben zum Gestikulieren frei. Ausdrückliche Motivwünsche des jeweiligen Auftrags haben Vorrang. Einige historische Beispiele enthalten Trennlinien oder Requisiten; daraus folgt keine Freigabe, diese in neue Sheets zu übernehmen.

Wenn erst ein neues Ausgangsporträt benötigt wird, gelten dafür die [zentralen Bildstil-Vorlagen](../docs/art/image-style-presets.json). Ein bestehendes Referenzporträt für das Sheet wird nicht ungefragt in einen anderen Stil übertragen.

## Mit dem Splitterer zerlegen

Die V3 benötigt Python 3 mit Tkinter und Pillow. `Werkzeuge/Avatar Splitterer/starten.bat` ruft zunächst die Installation der Abhängigkeiten aus `requirements.txt` auf und startet anschließend die Anwendung. Wenn Pillow bereits vorhanden ist, lässt sich die Anwendung auch direkt starten:

```powershell
python "E:\Aleria\AleriaAlmanach\AvatarWerkstatt\Werkzeuge\Avatar Splitterer\AvatarSplitterPro_V3.py"
```

### Einzelnes Sheet

1. Mit **Bild laden** das Sheet wählen, anschließend das Raster **3×3** einstellen.
2. Für randlose Sheets **Lücke X = 0**, **Lücke Y = 0** und **Autocrop aus** wählen. Die dazu passende Vorlage liegt unter `Vorlagen/9er-ohne-Trennlinien.json`.
3. Raster und jede Zelle prüfen. Falls echte Trennlinien vorhanden sind, nur so viel Lücke wie nötig setzen; bei ungleichmäßiger Teilung die Rasterlinien verschieben. Einzelne Kanten können unabhängig korrigiert werden.
4. **Aktuelles Bild als 9/alle Avatare exportieren** wählen und den passenden `Output/<set-id>`-Ordner angeben.

Dieser Export lässt das Sheet an seinem Platz. Die PNGs heißen `<Sheetname>_Bild1.png` bis `<Sheetname>_Bild9.png`. Die Reihenfolge verläuft zeilenweise von oben links nach unten rechts. Erneuter Export in denselben Ordner mit demselben Sheetnamen überschreibt diese Dateien; für weitere Varianten einen neuen Set-Ordner verwenden.

### Ordnerverarbeitung

Ein Sheet aus `Sheets` **kopieren** und direkt in seinen Arbeitsordner `Verarbeitung/<set-id>` legen. Dann ausschließlich diesen Arbeitsordner über **Ordner verarbeiten** auswählen. Vorher die passenden Raster-, Lücken- und Kantenwerte einstellen.

V3 schreibt die Ausschnitte nach `Verarbeitung/<set-id>/output` und verschiebt die dortige Eingabekopie nach `Verarbeitung/<set-id>/Benutzt`. Die Originale und das gesicherte Sheet bleiben erhalten. Das Werkzeug verarbeitet nur Bilddateien direkt im gewählten Ordner, nicht dessen Unterordner.

Die Batch-Ausgabe verwendet `Bild1.png` bis `Bild9.png` und bei Namenskollisionen zusätzliche Suffixe. Damit die Zuordnung zur Figur und zum Sheet eindeutig bleibt, immer genau ein Sheet pro Arbeitsordner verarbeiten. Die geprüften Ergebnisse anschließend nach `Output/<set-id>` übernehmen und bei Bedarf mit Figur und Set benennen.

### Einstellungen und Kontrolle

Die unverändert kopierte Quellkonfiguration enthält **Lücke Y = 8** und **Autocrop an**. Diese Werte sind keine allgemeine Vorgabe für neue randlose Sheets: Lücken und Autocrop können Größe und Ausschnitt der Einzelbilder verändern. Für ein gleichmäßiges randloses 9er-Sheet mit den Einstellungen 0/0 und ausgeschaltetem Autocrop beginnen.

Die V3-Konfigurationsdatei speichert Spalten, Zeilen, Lücken und Autocrop. Verschobene Rasterlinien und individuelle Kantenkorrekturen werden darin nicht gespeichert. Falls solche Korrekturen nötig sind, ihre Werte beziehungsweise die endgültigen Ausschnittkoordinaten beim jeweiligen Auftrag festhalten.

Vor der Freigabe alle neun PNGs ansehen: richtige Figur und Reihenfolge, vollständiger Kopf und Gestik, keine Nachbarpanels oder Trennlinien, unveränderte Farben, brauchbarer Ausschnitt. Quadratisches Sheet allein garantiert nach individuellen Korrekturen keine quadratischen Einzeldateien; erforderliche Seitenverhältnisse gesondert prüfen. Die Datei- und Pixelprüfung ersetzt die Sichtprüfung nicht.

Ein späterer Import in AleriaAlmanach ist ein eigener Arbeitsschritt. Diese Werkstatt bereitet lokale Bilder vor; Veröffentlichungslinks und Zuordnungen zu Online-Charakteren werden im jeweiligen Importauftrag festgelegt.
