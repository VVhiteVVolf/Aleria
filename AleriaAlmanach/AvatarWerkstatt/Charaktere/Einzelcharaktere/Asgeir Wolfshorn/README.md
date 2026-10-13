# Asgeir Wolfshorn – Avatare

4 9er-Sets, insgesamt **36 Einzelavatare**, fertiggestellt am 13. Oktober 2026. Verbindliche Grundlage ist das [unveränderte Nutzerporträt](Referenzen/asgeir-wolfshorn-nutzerreferenz.png). Gesicht und künstlerischer Stil richten sich nach diesem Originalbild.

In den Kampfsets 01–03 stehen **oben drei angreifende**, **in der Mitte drei verteidigende** und **unten drei neutrale** Haltungen. Die Dateinummern `Bild01` bis `Bild09` folgen dieser Reihenfolge zeilenweise. Die neutralen Bilder zeigen Bereitschaft, Beobachtung oder eine kurze Pause. Mimik steht im Vordergrund; Waffen dürfen den Bildrand verlassen. Alle Avatare sind 1:1; jedes vollständige Sheet misst 1254×1254 Pixel.

| Set | Bewaffnung / Thema | Sheet | Einzelavatare | PNG-Pixel |
| --- | --- | --- | --- | --- |
| set-01 | Zwei Einhandäxte | [9er-Sheet](Sheets/asgeir-wolfshorn-kampf-set-01-doppelaexte.png) | [9 PNGs](Output/set-01/) | 418×418 |
| set-02 | Großaxt | [9er-Sheet](Sheets/asgeir-wolfshorn-kampf-set-02-grossaxt-v2.png) | [9 PNGs](Output/set-02/) | 418×418 |
| set-03 | Axt und Rundschild | [9er-Sheet](Sheets/asgeir-wolfshorn-kampf-set-03-axt-und-schild-v2.png) | [9 PNGs](Output/set-03/) | 410×410 |
| set-04 | Peinlich berührt, ertappt und entschuldigend (waffenfrei) | [9er-Sheet](Sheets/asgeir-wolfshorn-set-04-verlegen-ertappt-entschuldigend-v3.png) | [9 PNGs](Output/set-04/) | 418×418 |


## Vorlage, Ausrüstung und Darstellung

Asgeirs Originalanhang bestimmt Gesicht, Haarform, Sommersprossen, Alter, Fellmantel, sichtbares Kettengeflecht und die gedämpfte künstlerische Darstellung. Die ausdrückliche Stilkorrektur des Nutzers vom 13. Oktober hat Vorrang vor allgemeinen Anime-Vorgaben und einer abweichenden Rüstungsdarstellung des Inventarbildes. Die Itembilder bestimmen Äxte und Rundschild.

Beim Großaxt-Set wurden zwei zuvor verdeckte Hände sichtbar an denselben Schaft gelegt. Beim Schild-Set wurden der Schild unter das Kinn gesenkt und die Hintergrundbanner zum Draig-Wappen korrigiert. Die tatsächlichen Zeilengrenzen dieses Sheets liegen bei y=414 und y=827. V3 exportiert daraus mit dokumentierten Kantenkorrekturen neun quadratische 410×410-PNGs ohne Nachbarbildreste; die anderen Sets ergeben 418×418 Pixel. Es wurde nicht skaliert.

Alle Sets zeigen den Trainingsplatz im Draig-Burginnenhof mit hellen Steinmauern, rotem Draig-Banner, Waffenständern und Übungszielen bei Tageslicht. Die beiden Figuren behalten jeweils den Stil ihres eigenen Nutzerporträts.

## Dateien und Prüfung

Die Bilder wurden mit dem integrierten `image_gen` erzeugt. [Prompts](Prompts/) enthält den vollständigen verwendeten Master-Prompt mit den neun konkreten Reaktionen, Auftragsdateien und etwaige Korrekturprompts. [Referenzen](Referenzen/) enthält Originalanhang und berücksichtigte Itembilder; `quellen.json` dokumentiert deren Herkunft. Bei zusätzlichen Umgebungsreferenzen dient ausschließlich die Burg als Vorlage.

Die Einzelbilder unter [Output](Output/) wurden mit den unveränderten Zuschneidemethoden des zentralen Avatar Splitter Pro V3 erstellt, mit 3×3, Lücke X/Y 0 und Autocrop aus. [avatar-manifest.json](avatar-manifest.json) enthält Bildzuordnung, Ausschnittkoordinaten, Pixelmaße, Prüfsummen und dokumentierte Kantenkorrekturen. Alle Einzelbilder wurden auf Vorlagennähe, Mimik, Waffenhaltung und Nachbarbildreste angesehen.

Die vollständigen finalen Sheets bleiben in [Sheets](Sheets/), abweichende Entwürfe getrennt in `Sheets/Entwuerfe`. `Verarbeitung` enthält Arbeitskopien und Zwischenexporte. Für die Nutzung gelten die geprüften PNGs unter `Output`.

[Paket mit allen 27 Kampfavataren](Asgeir-Wolfshorn-27-Kampfavatare.zip) – inklusive finaler Sheets, Originalreferenz, Prompts und Manifest. Entwürfe und doppelte Arbeitskopien sind nicht Bestandteil des ZIPs. Die Prompts dokumentieren gegebenenfalls auch frühere Korrekturschritte, deren Entwurfsbilder nur im Charakterordner liegen.

## Neues Reaktionsset set-04

Asgeir zeigt trockene, zurückhaltende Verlegenheit, ertapptes Schweigen, knappe Rechtfertigung und eine ernste Entschuldigung. Die starke Röte und kokette Gestik des ersten Entwurfs wurden nach Nutzerfeedback entfernt; die Reaktionen behalten seine gewohnte reservierte Haltung. Gesicht, Haare, Sommersprossen, Fellmantel, Kettengeflecht und der originale gedämpfte Zeichenstil richten sich nach dem unveränderten Nutzerporträt.

[Setbeschreibung und Reihenfolge](README-set-04.md) · [Neues Paket mit 9 Avataren](Asgeir-Wolfshorn-9-Verlegenheit-Entschuldigung.zip)

Die 3/3/3-Aufteilung der Kampfsets gilt für dieses thematische Set nicht. Die bisherigen Bilder und ZIP-Pakete bleiben unverändert.
