# AvatarWerkstatt für Aleria

Aktuelle Zoom-Toleranz vom 21. November 2026: Bei Bedarf darf die Kamera gegenüber dem bisherigen setbezogenen Referenzausschnitt 10–15 % weiter herauszoomen, damit Hände, Unterarme und Gesten mehr Platz haben. Gesicht und Oberkörper bleiben groß und klar erkennbar. Der gewählte Abstand bleibt in allen neun Panels gleich; Perspektive, Identität und die besonderen Ausschnittgrenzen des jeweiligen Sets bleiben erhalten. Diese Erlaubnis ersetzt widersprechende ältere Vorgaben zu unveränderlicher Kameradistanz oder strikt festem engem Brustbild. Setnummern, Paneldefinitionen und alle übrigen Regeln bleiben erhalten.

Aktuelle Nutzervorgabe vom 16. November 2026. Quadratisches Brustbild wie in den freigegebenen Rianna- und Lefraye-Beispielen. Die Kamera bleibt auf Gesichtshöhe. Bei Bedarf darf sie 10–15 % weiter herauszoomen; die untere Bildkante darf entsprechend etwas tiefer liegen. Kopf, Gesicht, Schultern und Brust bleiben Schwerpunkt. Hände und Gesten bleiben kompakt in Brustnähe; Ellbogen und tiefere Unterarme dürfen am Bildrand angeschnitten sein. Keine Beine oder Ganzkörperansicht. In allen neun Panels denselben gewählten Ausschnitt verwenden. Set 4 verwendet ruhige, kleine, natürliche Handgesten und zurückhaltende Mimik. Brauen, Mundwinkel, Blick und Kopfneigung verändern sich nur leicht. Die Hände bleiben nahe am Brustbereich. Die Körperhaltung bleibt entspannt und fast aufrecht.

Hier werden Charakterporträts als zusammenhängende 9er-Reaktionssets vorbereitet und mit dem Avatar Splitter Pro V3 in einzelne Avatare zerlegt. Anleitungen, Beispiele, unveränderte Ausgangsdateien und neue Ausgaben haben eigene Ordner. Künftige Aufträge verwenden diese Struktur für einzelne Charaktere oder gemeinsame Gruppen.

## Gesicherter Bestand

Die Kopie vom 11. Oktober 2026 stammt aus `D:\0-KI Generierte\01 Bilder\Charaktere\Avatare Erstellungs Ordner`. Alle 238 übernommenen Dateien wurden anhand von SHA-256-Prüfsummen mit ihren Quellen verglichen. Der ursprüngliche Ordner wurde nicht verändert. Die vollständige Zuordnung steht in [import-manifest.json](import-manifest.json).

| Ordner | Inhalt |
| --- | --- |
| [Anleitungen](Anleitungen/) | Originale Word-Anleitungen, vollständige UTF-8-Lesefassungen und die nummernstabile 28-Set-Vorlage mit erhaltenen 14-, 20-, 23- und 25-Set-Vorläufern |
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
    Output/                    alle geprüften Einzelavatare dieser Figur
```

Jeder Gruppenordner besitzt dieselbe Struktur. Bei mehreren benannten Figuren in einer Gruppe dürfen darunter eigene Charakterordner nach der Vorlage angelegt werden. Unterschiedliche Kleidung, Anlässe oder Bildvarianten bekommen bei Bedarf einen eigenen Unterordner, wie `Gawain/Hochzeit`.

Für neue Figuren oder Gruppen [Vorlagen/Charakterordner](Vorlagen/Charakterordner/) an die passende Stelle kopieren und benennen. Pro neuem Set einen eigenen Arbeitsordner `set-02`, `set-03` usw. unter `Verarbeitung` anlegen. Seit Nutzervorgabe vom 18. Oktober 2026 liegen alle fertigen Avatare einer Figur direkt in ihrem gemeinsamen `Output`-Ordner; jede Figur hat einen eigenen Output. Dateinamen enthalten Figur und Set, beispielsweise `yvain-allgemein-set-01_Bild01.png`. Bestehende Dateien nicht überschreiben.

Für die Übergabe gilt seit dem 30. Oktober 2026 zusätzlich: Unter `AvatarWerkstatt/Output/<vollständiger Personenname>/` alle fertigen Einzelavatare dieser Person direkt gemeinsam bereitstellen und diesen Personenordner verlinken. Weitere Sets ergänzen denselben Ordner, auch bei unterschiedlichen Anlässen oder Kleidungsvarianten. Die fertigen PNGs aus dem internen Werkstattexport bei jeder Ergänzung dorthin übernehmen; abweichende gleichnamige Dateien als Varianten erhalten. Nur eine vor dem Auftrag ausdrücklich gewünschte ordnertechnische Trennung, etwa „trenne set 1 von set2 ordnertechnisch“, erlaubt getrennte Set-Ordner. Quellen, Prompts, Sheets und technische Verarbeitung behalten ihre interne Werkstattstruktur.

## Avatar-Sheets erstellen

### Nummerierte Sets

Seit der Erweiterung vom 20. November 2026 beziehen sich Aufträge wie „Erstelle Set 2, 4 und 11 für diese Figur“ auf [Avatar_Prompts_28_Sets_20261121.docx](Anleitungen/Avatar_Prompts_28_Sets_20261121.docx). Die [vollständige Lesefassung](Anleitungen/Lesefassungen/Avatar_Prompts_28_Sets_20261121.txt) und der [aktive maschinenlesbare Setkatalog](Anleitungen/avatar-prompt-sets-28-20261121.json) enthalten 28 Sets mit je neun Reaktionen (252 Varianten), exakten Gestiktexten und zeilenweiser Panelreihenfolge. Die Nummern und Themen bleiben erhalten. Seit dem 16. November 2026 verwenden Sets 1 bis 20 den freigegebenen engen Brustbildausschnitt, Set 4 erhält ruhigere Gesten und Mimik. Am 20. November 2026 sind zunächst die sitzenden Tischsets 24 und 25 und danach die subtilen Stehsets 26 bis 28 hinzugekommen.

Der aktive Katalog verwendet die Kennung `avatar-prompts-28-sets-20261121-zoomtoleranz` und bindet das aktuelle Word-Dokument über `sourceSha256`. Sets 1 bis 18 und 26 bis 28 verwenden freie Hände ohne Requisiten. Sets 19 und 20 erlauben die im jeweiligen Panel ausdrücklich beschriebenen Gegenstände. Set 21 erlaubt die genannte Liegefläche und gegebenenfalls ein Kopfkissen, Set 22 genau die bereits vereinbarte Waffe und Set 23 die ausdrücklich genannte Bettumgebung. Sets 24 und 25 erlauben ihren Tisch, Stuhl und gemütlichen Zimmerhintergrund mit den jeweiligen Speisen, Bestecken oder Gefäßen. Bei beiden neuen Sets zusätzlich die panelbezogenen `allowedProps` übernehmen. Die Einträge 19 bis 25 tragen `allowsProps: true`, eine `allowedProps`-Liste und die Begrenzung `scope`. Für Sets 21 bis 25 gelten zusätzlich die auf das jeweilige Panel begrenzten Angaben `posePolicy`, `framingPolicy`, `clothingPolicy` und `settingPolicy`; erforderliche Eingaben stehen gegebenenfalls in `requiredInputs`.

Die bisher aktive [25-Set-Worddatei](Anleitungen/Avatar_Prompts_25_Sets_20261120.docx), ihre [Lesefassung](Anleitungen/Lesefassungen/Avatar_Prompts_25_Sets_20261120.txt) und ihr [25-Set-Katalog](Anleitungen/avatar-prompt-sets-25.json) bleiben samt Quellenbelegen unverändert erhalten. Alle bisherigen 25 Seteinträge sind exakt in die 28er-Fassung übernommen.

Die ältere [23-Set-Worddatei](Anleitungen/Avatar_Prompts_23_Sets_Oberkoerper_Kampf_20261116.docx), ihre [Lesefassung](Anleitungen/Lesefassungen/Avatar_Prompts_23_Sets_Oberkoerper_Kampf_20261116.txt) und ihr [23-Set-Katalog](Anleitungen/avatar-prompt-sets-23.json) bleiben samt Quellenbelegen unverändert erhalten. Alle bisherigen 23 Seteinträge sind exakt in die 25er-Fassung übernommen.

Die ursprüngliche [14-Set-Worddatei](Anleitungen/Avatar_Prompts_14_Sets.docx), ihre [Lesefassung](Anleitungen/Lesefassungen/Avatar_Prompts_14_Sets.txt), der [historische 14-Set-Katalog](Anleitungen/avatar-prompt-sets.json) und der [Übernahmebeleg mit SHA-256](Anleitungen/avatar-prompt-sets.source.json) bleiben unverändert erhalten. Auch die fertig geprüfte [20-Set-Zwischenfassung](Anleitungen/Avatar_Prompts_20_Sets.docx), ihre [Lesefassung](Anleitungen/Lesefassungen/Avatar_Prompts_20_Sets.txt) und ihr [20-Set-Katalog](Anleitungen/avatar-prompt-sets-20.json) bleiben als Vorläufer erhalten. Historische Aufträge und Bildbelege werden nicht auf neue Quellen umgebogen. Die falsche Titelzeile des 14er-Originals über fünf Sets und 45 Varianten bleibt nur in dieser historischen Quelle bestehen. Ältere 13er-Vorlagen und individuelle Auftragszuordnungen bleiben ebenfalls erhalten.

| Set | Thema |
| --- | --- |
| 1 | Grundemotionen und Mimik – Basisset |
| 2 | Gespräch und Kommunikation |
| 3 | Zusätzliche Emotionen |
| 4 | Ausgeprägte Hand- und Körpergesten |
| 5 | Neue gestische Ausdrucksformen |
| 6 | Gelassene Gesprächsreaktionen |
| 7 | Subtile Zwischentöne und leise Reaktionen |
| 8 | Arroganz und demonstrative Überlegenheit |
| 9 | Autorität, Führung und Befehlsgewalt |
| 10 | Erklären, Nachfragen und Befragen |
| 11 | Humorvolle Reaktionen und Gestiken |
| 12 | Euphorische Reaktionen und Gestiken |
| 13 | Aufgebrachte Reaktionen und Gestiken |
| 14 | Genervte, abwinkende und belehrende Reaktionen |
| 15 | Angst und Wachsamkeit |
| 16 | Trauer und Trost |
| 17 | Müdigkeit und körperliches Befinden |
| 18 | Zuneigung und Vertrauen |
| 19 | Schriftstücke und Notizen – mit den genannten Requisiten |
| 20 | Alltagsgegenstände – mit der jeweils genannten Requisite |
| 21 | Liegend: Schlaf, Ohnmacht und Unpässlichkeit |
| 22 | Bewaffnete Abwehr, Angriff und Ausweichen – mit der bereits vereinbarten Waffe |
| 23 | Erwachsene Koketterie im engen Bildausschnitt |
| 24 | Sitzend am Tisch essen und reagieren |
| 25 | Sitzend mit Speisen und Getränken gestikulieren |
| 26 | Erinnern und Wiedererkennen |
| 27 | Diskretion und stumme Verständigung |
| 28 | Selbstbeherrschung und verborgene Gefühle |

Setnummern gelten für die inhaltliche Vorlage und werden nicht nach vorhandenen Ausgaben einer Figur neu gezählt. Im Auftrag `promptSetCatalog`, `promptSetSourceDocument`, `promptSetNumber` und `promptSetSourceSha256` festhalten; `setId` benennt das konkrete Ausgabeset der Figur. Bei historischen Sets mit anderer Belegung die belegte Zuordnung erhalten und eine neue Ausgabe eindeutig benennen. Das ausdrücklich gewählte Porträt bleibt die Identitätsreferenz; ausschließlich Set 23 erlaubt die dort eng begrenzte Abweichung von der sichtbaren Referenzkleidung. Ein gespeicherter Prompt ist keine Autorisierung, weitere Sets oder Publikationen selbständig auszuführen.

### Arbeitsablauf

1. Das verbindliche Porträt tatsächlich ansehen. Bei vorhandenen Figuren bestimmen seine Gesichtszüge, Alter, Haare, Bart, Kleidung, Rüstung, Farben und Zeichenstil die Identität. Andere Beispiele liefern nur Hinweise zu Layout und Gestik.
2. Die [Master-Anleitung](Anleitungen/Lesefassungen/Charakter-Emotionssheet%20Master%20Prompt.txt), den [Expression-Sheet-Prompt](Anleitungen/Lesefassungen/Character_Expression_Sheet_Prompt.txt), die [Avatar-Anweisungen](Anleitungen/Lesefassungen/Anweisungen.txt) und bei nummerierten Aufträgen die [aktive 28-Set-Vorlage](Anleitungen/Lesefassungen/Avatar_Prompts_28_Sets_20261121.txt) lesen. Die `.docx`-Originale bleiben die vollständigen Ausgangsdokumente; die Textdateien sind reine Lesefassungen. Die konkrete Setliste ersetzt die beispielhaften Reaktionslisten älterer Master-Anleitungen.
3. [Vorlagen/Avatar-Auftrag.json](Vorlagen/Avatar-Auftrag.json) nach `Prompts` kopieren. Charakter, Referenzbild, Setname und alle neun Emotionen mit jeweils passender Gestik ausfüllen. Die vorbelegten Reaktionen entsprechen weiterhin unverändert Set 1. Bei anderen nummerierten Sets die jeweilige vollständige Liste und Zusatzvorgaben aus dem aktiven Setkatalog übernehmen. Für Sets 19 bis 25 außerdem `allowsProps`, `allowedProps`, `scope` und die spezifischen `instructions` ausdrücklich in den Auftrag übernehmen. Bei Sets 21 bis 25 zusätzlich `posePolicy`, `framingPolicy`, `clothingPolicy`, `settingPolicy` und gegebenenfalls `requiredInputs` übernehmen. Die leeren Hände, stehende Haltung oder unveränderte Kleidung des Basisset-Prompts dürfen nicht zusätzlich einer ausdrücklich erlaubten Ausnahme widersprechen. Andere ausdrücklich beauftragte Themen sind möglich.
4. Den vollständigen Master-Prompt verwenden und seine Platzhalter für Charakterbeschreibung, Thema und Panel-Liste ersetzen. Ältere pauschale Vorgaben zu freien Händen, Haltung, Ausschnitt, Kleidung und Hintergrund nur dort gezielt ersetzen, wo der gewählte Seteintrag eine begrenzte Ausnahme enthält. Set 21 bleibt bekleidet liegend; Set 22 nutzt die bereits vereinbarte Waffe und den festen Oberkörperausschnitt bis etwa zur Taille; Set 23 erlaubt nur bei ausdrücklich erwachsener, wacher Figur den engen Schnitt mit angedeuteter Unbekleidetheit. Sets 24/25 verwenden ihre Sitzhaltung am Tisch im gemütlichen Zimmer. Identität, Alter, Frisur und Zeichenstil erhalten; die Beleuchtung folgt den Vorgaben des gewählten Sets. Das Porträt als tatsächliche Bildreferenz mitgeben. Den konkret verwendeten Prompt neben dem Auftrag speichern.
5. Ein **quadratisches Gesamtbild im Format 1:1 mit 3×3 gleich großen Feldern** erzeugen. Das 2:3-Format normaler Aleria-Porträts gilt für das Ausgangsporträt, nicht für dieses Sheet.
6. Alle neun Felder prüfen und das vollständige Sheet unter `Sheets` sichern. Für neue Sheets sind durch drei teilbare quadratische Pixelmaße günstig; die vorhandenen Beispiele haben 1254×1254 Pixel und damit grundsätzlich 418×418 Pixel pro Feld.

Für Sets 1 bis 20 sowie 26 bis 28 bleiben Person, Hintergrund, Beleuchtung, Kameradistanz und Bildausschnitt über alle Felder konsistent. Quadratisches Brustbild wie in den freigegebenen Rianna- und Lefraye-Beispielen. Die Kamera bleibt auf Gesichtshöhe. Bei Bedarf darf sie 10–15 % weiter herauszoomen; die untere Bildkante darf entsprechend etwas tiefer liegen. Kopf, Gesicht, Schultern und Brust bleiben Schwerpunkt. Hände und Gesten bleiben kompakt in Brustnähe; Ellbogen und tiefere Unterarme dürfen am Bildrand angeschnitten sein. Keine Beine oder Ganzkörperansicht. In allen neun Panels denselben gewählten Ausschnitt verwenden. Sets 21 bis 25 verwenden ausschließlich die im jeweiligen Panel genannten Abweichungen. Set 21 zeigt den liegenden Oberkörper. Kampfsets zeigen den Kopf und Oberkörper bis ungefähr zur Taille. Die Kamera bleibt auf Gesichtshöhe und darf bei Bedarf gegenüber dem bisherigen Kampfausschnitt 10–15 % weiter herauszoomen. Gesicht, Schultern, Arme, greifende Hände und Waffengriff bleiben gut erkennbar. Der Oberkörper füllt jede Kachel; Beine, Knie und Ganzkörperansichten bleiben außerhalb des Bildes. Für alle neun Panels denselben festen Oberkörperausschnitt verwenden. Lange Klingen oder andere über den Ausschnitt hinausragende Waffenteile dürfen natürlich am Bildrand angeschnitten sein. Die Waffe wird dafür weder verkürzt noch verbogen; über die Zoom-Toleranz hinaus wird die Kamera nicht für ihre vollständige Darstellung weiter herausgezoomt. Der Fokus auf Gesicht und Oberkörper hat Vorrang. Set 23 zeigt nur Gesicht, Hals, Schultern und höchstens den oberen Brustansatz; die Bildkante endet oberhalb jeder Brustwarze. Ausdruck entsteht durch Augen, Brauen, Mund, Blick und Körperhaltung; keine Verzerrung der Identität. Jedes Feld braucht einen eigenen erzählerischen Zweck und eine erkennbare passende Geste.

Keine lesbaren Wörter, Buchstabenfolgen, Ziffern, Bildbeschriftungen, Nummerierungen, zusätzlichen schwebenden Symbole, Sprechblasen, weißen Trennlinien oder äußeren Rahmen. Zeichen und Wappen vorhandener Referenzkleidung bleiben erhalten. In Sets 1 bis 18 und 26 bis 28 bleiben die Hände frei von Requisiten. Set 19 erlaubt nur die je Panel genannten Schriftstücke und gegebenenfalls die Schreibfeder; Papier bleibt leer oder zeigt wenige abstrakte unlesbare Striche. Set 20 erlaubt nur den jeweils genannten Alltagsgegenstand. Würfelpunkte sind erlaubt, Ziffern nicht; die Laterne bleibt unbeleuchtet. Keine moderne Technik, keine zusätzlichen Personen und keine ungefragten Requisiten ergänzen. Tisch und Stuhl sind ausschließlich in Sets 24/25 gemäß Seteintrag erlaubt. Die Gegenstände sind Bildmittel, keine Vergabe kanonischer Inventare oder Festlegung neuer Berufe und Biografien.

Set 21 enthält genau drei Schlaf-, drei Ohnmachts- und drei wache Unpässlichkeitsansichten. Kleidung, Rüstung und Handschuhe bleiben angelegt; keine Verletzung, Diagnose, Ursache oder Tod erfinden. Bett, Kopfkissen und Boden sind nur die ausdrücklich genannten kleinen Liegeflächen.

Set 22 enthält genau drei defensive, drei offensive und drei ausweichende Einzelposen mit genau einer bereits vereinbarten Waffe pro Panel. Bestehende Vereinbarungen gelten ohne erneute Freigabe. Waffentyp aus dem Auftrag, Griffhand und Griffweise aus Referenz oder Auftrag übernehmen; vorhandene Waffenbilder tatsächlich ansehen, alternativ genügt eine hinreichend konkrete vereinbarte Beschreibung. Nur bei fehlenden erforderlichen Angaben oder mit dem Waffentyp nicht sinnvoll umsetzbaren Haltungen gezielt rückfragen. Keine zweite Waffe, zusätzlichen Schild, Gegner, Treffer oder Bewegungsschlieren ergänzen; Hände, Griff und Waffenform anschließend tatsächlich prüfen.

Set 23 ist ausschließlich für ausdrücklich als erwachsen bestätigte Figuren bestimmt; eine Altersschätzung nach Aussehen reicht nicht. Alle neun Ansichten bleiben wach, aktiv und selbstbestimmt: drei Bettliegeansichten, drei sitzende und drei leichte Vorneigungen mit dezent gespitzten Lippen. Unbekleidetheit wird nur durch nackte Schultern und den engen Schnitt angedeutet. Keine Brustwarzen, vollständigen Brüste, Brustunterseite, Ansicht unter die Brust, Intimbereiche, Unterkörper, expliziten Handlungen, zweite Person oder fremden Hände. Nur Set 23 darf im genannten engen Ausschnitt von der Referenzkleidung abweichen; keine Schlaf- oder Ohnmachtszustände aus Set 21 übernehmen.

Set 24 zeigt neun Essensreaktionen: mit vollem Mund zustimmen, kauend zuhören, mit Besteck nachdenken, vor dem nächsten Bissen überrascht sein, mit vollem Mund skeptisch blicken, kauend schmunzeln, mit Besteck erklären, einen Löffelbissen genießen und nach dem Kauen antworten.

Set 25 zeigt neun Momente mit Speisen und Getränken: einen Hähnchenschenkel genüsslich halten, damit erzählen, vor dem Abbeißen innehalten, mit einem Bierhumpen zuprosten, daraus trinken, ihn nachdenklich absetzen, einen Becher mit beiden Händen umfassen, mit ihm gestikulieren und nach einem Schluck zufrieden reagieren.

Sets 24 und 25 zeigen die vollständig bekleidete Figur in allen neun Panels entspannt auf einem schlichten Stuhl am Holztisch in einem gemütlichen mittelalterlichen Zimmer. Innerhalb des Sheets bleiben Einrichtung, Tischposition, Stuhllehne, Perspektive und weiches warmes Fensterlicht gleich. Enger Oberkörperausschnitt auf Gesichtshöhe: Gesicht und Hände groß, nur eine schmale Tischkante und ein kleiner Stuhlansatz; keine Beine oder weit herausgezoomte Tischszene. Nur hier ersetzen diese Vorgaben Stehhaltung, Freihandregel, Tischverbot und Referenzhintergrund; die Raumbeleuchtung darf angepasst werden. Identität, Alter, Kleidung, Rüstung, Handschuhe und Stil bleiben erhalten. Die vollständigen Setregeln und die jeweilige `panel.allowedProps`-Liste übernehmen; nicht alle Requisiten in jedes Panel verteilen. Voller Mund und Kauen bleiben natürlich mit geschlossenen Lippen, leicht gefüllten Wangen und kleiner Kieferbewegung; beim Sprechen ist der Bissen heruntergeschluckt.

Set 26 ergänzt neun stille Denkmomente: ein Detail erkennen, ein Gesicht zuordnen, nach einem Namen suchen, einer Erinnerung nachgehen, den Gesprächsfaden wiederfinden, einen Zusammenhang verstehen, einen eigenen Irrtum bemerken, späte Einsicht gewinnen und eine Erinnerung vorsichtig bestätigen.

Set 27 ergänzt neun diskrete Signale: stilles Einverständnis, um einen Moment bitten, ein Thema vertagen, unauffällig aufmerksam machen, unausgesprochenes Verstehen, eine Bemerkung zurückhalten, einen Einwand zurücknehmen, Stillschweigen zusichern und einen Ausweg anbieten.

Set 28 ergänzt neun beherrschte Regungen: Freude verbergen, Enttäuschung überspielen, Ärger zügeln, Nervosität verbergen, Würde bewahren, Rührung beherrschen, Unsicherheit durch Sachlichkeit überdecken, Sorge hinter Zuversicht verbergen und Fassung wiederfinden.

Sets 26 bis 28 zeigen die Figur stehend, entspannt und fast aufrecht im bisherigen engen Brustbild auf Gesichtshöhe. Kleine natürliche Handgesten bleiben in Brustnähe; Brauen, Augenlider, Blick, Mundwinkel und Kopfneigung verändern sich nur leicht. Jedes Panel zeigt einen eigenen stillen Moment. Hände frei von Requisiten; Referenzhintergrund, Beleuchtung, Kleidung, Rüstung, Handschuhe, Identität und Zeichenstil bleiben erhalten. Die vollständigen Regeln einschließlich posePolicy, framingPolicy, clothingPolicy, settingPolicy und expressionPolicy übernehmen. Die Sitz- und Tischausnahmen 24/25 gelten für diese neuen Sets nicht.

Ausdrückliche Motivwünsche des jeweiligen Auftrags haben Vorrang. Einige historische Beispiele enthalten Trennlinien oder Requisiten; daraus folgt keine zusätzliche Erlaubnis, diese in andere neue Sets zu übernehmen.

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
4. **Aktuelles Bild als 9/alle Avatare exportieren** wählen und den `Output`-Ordner dieser Figur angeben. Der Sheetname muss Figur und Set eindeutig enthalten.

Dieser Export lässt das Sheet an seinem Platz. Die PNGs heißen `<Sheetname>_Bild1.png` bis `<Sheetname>_Bild9.png`. Die Reihenfolge verläuft zeilenweise von oben links nach unten rechts. Erneuter Export in denselben Ordner mit demselben Sheetnamen überschreibt diese Dateien; für weitere Varianten einen neuen eindeutigen Sheetnamen verwenden.

### Ordnerverarbeitung

Ein Sheet aus `Sheets` **kopieren** und direkt in seinen Arbeitsordner `Verarbeitung/<set-id>` legen. Dann ausschließlich diesen Arbeitsordner über **Ordner verarbeiten** auswählen. Vorher die passenden Raster-, Lücken- und Kantenwerte einstellen.

V3 schreibt die Ausschnitte nach `Verarbeitung/<set-id>/output` und verschiebt die dortige Eingabekopie nach `Verarbeitung/<set-id>/Benutzt`. Die Originale und das gesicherte Sheet bleiben erhalten. Das Werkzeug verarbeitet nur Bilddateien direkt im gewählten Ordner, nicht dessen Unterordner.

Die Batch-Ausgabe verwendet `Bild1.png` bis `Bild9.png` und bei Namenskollisionen zusätzliche Suffixe. Damit die Zuordnung zur Figur und zum Sheet eindeutig bleibt, immer genau ein Sheet pro Arbeitsordner verarbeiten. Die geprüften Ergebnisse anschließend mit Figur und Set eindeutig benennen und direkt nach `Output` dieser Figur übernehmen.

### Einstellungen und Kontrolle

Die unverändert kopierte Quellkonfiguration enthält **Lücke Y = 8** und **Autocrop an**. Diese Werte sind keine allgemeine Vorgabe für neue randlose Sheets: Lücken und Autocrop können Größe und Ausschnitt der Einzelbilder verändern. Für ein gleichmäßiges randloses 9er-Sheet mit den Einstellungen 0/0 und ausgeschaltetem Autocrop beginnen.

Die V3-Konfigurationsdatei speichert Spalten, Zeilen, Lücken und Autocrop. Verschobene Rasterlinien und individuelle Kantenkorrekturen werden darin nicht gespeichert. Falls solche Korrekturen nötig sind, ihre Werte beziehungsweise die endgültigen Ausschnittkoordinaten beim jeweiligen Auftrag festhalten.

Vor der Freigabe alle neun PNGs ansehen: richtige Figur und Reihenfolge, vollständiger Kopf und Gestik, keine Nachbarpanels oder Trennlinien, unveränderte Farben, brauchbarer Ausschnitt. Quadratisches Sheet allein garantiert nach individuellen Korrekturen keine quadratischen Einzeldateien; erforderliche Seitenverhältnisse gesondert prüfen. Die Datei- und Pixelprüfung ersetzt die Sichtprüfung nicht.

Ein späterer Import in AleriaAlmanach ist ein eigener Arbeitsschritt. Diese Werkstatt bereitet lokale Bilder vor; Veröffentlichungslinks und Zuordnungen zu Online-Charakteren werden im jeweiligen Importauftrag festgelegt.

Die vier konkreten Ausschnittreferenzen stehen als `framingReferenceImages` im aktiven `Anleitungen/avatar-prompt-sets-28-20261121.json`. Sie bestimmen die Kameradistanz. Die Figurenidentitaet folgt dem jeweils eigenen Portraet.

Die 28er-Fassung vom 20. November 2026 bleibt mit ihrer Worddatei, Lesefassung, dem Katalog `Anleitungen/avatar-prompt-sets-28.json` und dem damaligen Quellenbeleg unverändert als historische Quelle erhalten. Neue Aufträge verwenden die Fassung vom 21. November.
