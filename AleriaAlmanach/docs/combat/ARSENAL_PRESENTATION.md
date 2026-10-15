# Arsenal und Kampfauswertung

Veröffentlichung vom 15. Oktober 2026. Gemeinsame Darstellung für die Listenauswahl und die Arsenalübersicht im Beitragsfenster.

## Zuständigkeiten

- `modules/combat/ui/combat-action-taxonomy.js` ordnet Quelldaten nach persönlichen Techniken, Klasse, Kampfform und Waffenbereich. Die Projektion vergibt keine Ausbildung und verändert keine Figuren.
- `combat-action-card.js` erstellt die gemeinsamen Gruppen. Persönliche Techniken werden unabhängig von Namenszusätzen zusammengeführt. Klassen und Formen bleiben getrennt; eine gemeinsame Mehrklassentechnik erscheint einmal mit beiden Klassennamen.
- `combat-arsenal-model.js` besitzt Suche, Bereichsfilter und Zählung. Favoriten bleiben ausschließlich eine Browserpräferenz.
- `combat-presentation-icons.js` verbindet Waffenbereiche mit Wappenicons. Ausdrücklich begrenzte Waffen werden im Tooltip genannt. Das Symbol richtet sich nach erlaubten Waffen, nicht nach der gerade gehaltenen Waffe.
- `combat-evaluation-stats.js` zeigt ausschließlich gespeicherte Kampfbelege. Treffer, Schaden, Abwehr, TP, Rettungen und Ressourcen werden nicht anhand aktueller Bögen neu berechnet.
- `combat-tooltips.js` besitzt einen delegierten Tooltip-Controller mit lokalem Zustand und aufräumbarem Listener-Lebenszyklus. Hover, Tastaturfokus und Berührung fokussierbarer Werte sind möglich. Escape schließt zuerst den Tooltip; Scrollen und Fokuswechsel räumen ihn auf.

## Klassen, Formen und Waffen

Klassenherkunft stammt aus `cultureTraining.allowedClassIds` und `cenyrTraining.allowedClassIds`, abgeglichen mit den deklarierten Klassen. Die Anzeige unterstützt mehrere Klassen-IDs sowie kombinierte Archetypbezeichnungen. Sie führt keine neuen Mehrklassenregeln ein. Gemeinsame Techniken werden nicht je Klasse kopiert.

Innerhalb einer Form bestimmt die Klasse die Waffenreihenfolge. Skytte und Helwyr: Fernkampf, Einhandwaffen, Speer, weitere Bereiche. Uchelwyr, Cantref und Thegnar: Speer/Lanze vor Seitenwaffen. Skjaldr: zwei Waffen, Zweihandwaffen, Einhandwaffen. Innerhalb eines Waffenbereichs folgen Mindeststufe und Name.

Schild-, Zweihand-, Zweiwaffen- und Reitvoraussetzungen stammen aus strukturierten Ausbildungsdaten. Vielseitige Waffen werden nicht allein wegen eines Hinweises auf zweihändigen Schaden als reine Zweihandwaffen einsortiert. Bogenwaffen bleiben Fernkampfwaffen. Persönliche Speerfolgen und gemeinsam für Sax/Axt zugelassene Techniken behalten ihre Waffenbeschränkungen.

Bei einer derzeit unzulässigen Technik werden keine aus einer unpassenden geführten Waffe berechneten Kampfwerte gezeigt. Nach dem Waffenwechsel übernimmt die Vorschau wieder die regulär aufgelösten Werte.

## Bilder und Prüfung

Zwölf neue transparente Wappenicons liegen unter `IconOrdner/IconsCharakterbogen/Arsenal-Wappen`. `manifest.json` enthält Prompts, Referenzen und Generator. Kleine verlustfreie WebP-Fassungen liegen unter `public/assets/combat-arsenal-icons`; die zwölf Wappen und vier wiederverwendeten BG-Werticons benötigen zusammen rund 183 KB.

[Audit aller 13 Online-Figuren über Stufe 2](ARSENAL_PRESENTATION_AUDIT_2026-10-15.json): 373 auswählbare Handlungen; Sir Duncan ausgenommen. Online-Bögen wurden ausschließlich gelesen. Keine Ressourcen, Waffenführungen, Zustände, IDs oder Kampfauswertungen wurden geschrieben.

Erneute Archivprüfung: `node AleriaAlmanach/scripts/audit-combat-arsenal.mjs`. Optional können ein JSON-Export als erster Parameter und ein Berichtspfad als zweiter Parameter angegeben werden.

Automatische Prüfungen umfassen Waffenreihenfolge, vollständige Arsenale, persönliche Rubriken, gemeinsame Mehrklassenformen, sichere Textdarstellung und unveränderte gespeicherte Würfe. Browserprüfungen umfassen alle 13 Figuren, Suche, Waffenfilter, Karten, Vorschau, Tooltips und mobile Darstellung.

## Szenarioabhängige Auswertung

Das anschließende Nutzerfeedback wird durch eigene Präsentationsmodule umgesetzt:

- `combat-evaluation-model.js` liest Szenario, Angriffsinstanzen, Schadensbelege und Zustandsänderungen aus der gespeicherten Auswertung.
- `combat-evaluation-rolls.js` zeigt jeden Treffer- und Schadenswurf getrennt und ordnet die verbuchte Abwehr über vorhandene Folgeangriffs- oder Wurf-IDs zu. Fehlen ältere Instanzbelege, wird keine Schadensverteilung erfunden.
- `combat-evaluation-effects.js` zeigt angewandte Zustände, Konterbereitschaft, Heilung und Schutz mit Empfänger und Dauer. Eine zukünftige Entwaffnung beim Konter wird ausdrücklich als bedingte Folge dargestellt.
- `combat-evaluation-ledger.js` gliedert Belege in Würfe, Schaden/Schutz, Wirkungen, Zustände, Ressourcen und Regeln. Bereits sichtbare Angriffsfolgen werden beim Aufklappen nicht verdoppelt.

Selbstwirkungen und unterstützende automatische Fähigkeiten verwenden blaue Karten. Automatische Handlungen zeigen keine technisch hinterlegte Dummy-W20-Notation. Unveränderte TP erscheinen bei solchen Fähigkeiten nicht als Hauptergebnis; tatsächliche Heilung, Eigenschaden und Änderungen temporärer TP bleiben sichtbar. Mehrzielwirkungen benennen Ziel und laufende Zielnummer; Rettungen und Schadensarten bleiben je Ziel getrennt.

Die originalen Asgeir–Nudd-Belege wurden ausschließlich gelesen. Asgeirs vier Trefferwürfe sind 12, 20, 14 und 10; nur der zweite trifft und verursacht 8 gewürfelten beziehungsweise 6 angewandten Schaden. Nudds gespeicherte Vorbereitung „Entwaffnende Klaue“ behält ihre damaligen Kosten und ihren damaligen festen Konter-SG 13. Spätere Klassenrevisionen werden nicht rückwirkend auf diese Belege angewandt.

Bei Angriffsfolgen und Selbstvorbereitungen steht eine aus den Regelbelegen abgeleitete Zusammenfassung im Vordergrund. Die ursprüngliche gespeicherte Erzählung bleibt separat aufklappbar und wird nicht überschrieben.
