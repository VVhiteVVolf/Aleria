# Experimentelle Szenenrahmen

Zwölf mit dem eingebauten Imagegen erzeugte transparente PNG-Rahmen, jeweils
2172 × 724 Pixel. Die Originale sind bytegleich neben den aktiven Fassungen
erhalten. `generation-receipt.json` und `generation-receipt-20261113.json` enthalten die vollständigen Prompts und
Generatorpfade; das Assetmanifest enthält nur Pfade, Maße und Hashes.
Die Motive folgen den gelieferten Sprechblasenreferenzen. Text,
Namensschilder und Figurenporträts sind nicht in die Rahmen eingebrannt.

Die UI benutzt CSS-Neunteilung, damit Ecken erhalten bleiben und sich längere
Kommentare in der Höhe ausdehnen können. Die Papierfarbe und der Inhalt sind
HTML/CSS, der ornamentale Rahmen ist Rastergrafik. Ein langsames Leuchten wird
ausschließlich auf der Dekoration animiert. Keine Nachbearbeitung, Skalierung
oder künstliche Alphaentfernung an den Generatororiginalen.

Zuordnung: Flirt → rosa Herzen; Gebet → goldene Blätter/Sterne; Gesang → blaue
musikalische Ornamente; Tiersprache → grüne Blätter; Telepathie/Zauberformel →
türkiser arkaner Rahmen; Wahnsinn → dunkelrote zerrissene Kontur.

Ergänzung vom 13. November: Rede → Altgold/Pergament; Gedanken → Blau/Silber;
Flüstern → Lavendel; Rufen → Rot/Kupfer; Schauspiel → Burgunder/Bühnenvorhang;
Handlungen → Leder/Metall. Fremdsprache und Fremde Stimme verwenden den
Redeframe; Geheim-/Kampfhandlungen sowie kompakte Interaktionen die robuste
Handlungskontur mit passenden Papier-/Schriftfarben. Die neuen Originale haben
im zentralen Inhaltsbereich höchstens Alpha 1/255 und bleiben bytegleich erhalten.

Die persönliche Auswahl startet aus und ist direkt in der Szenenleiste sowie
in Schreib-/Bearbeitungsansichten schaltbar. Sie bleibt im Browser gespeichert.
Das Manifest und `tests/scene-presentation.test.mjs` prüfen die aktiven
Dateien gegen ihre Originale. Browserbelege und Sichtprüfung:
`diagnostics/fazit-redesign-20261112/`.
