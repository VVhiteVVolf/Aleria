# Aktionssymbole und Reaktionen

`comment-action-icons.js` ist der gemeinsame Katalog für 20 Fertigkeiten,
Essen, Trinken, Einnehmen, Benutzen und die bestehende allgemeine Interaktion.
Es akzeptiert ausschließlich Katalogkennungen. `comment-action-icons-ui.js`
besitzt die Symbolauswahl und das kleine überlagerte Abzeichen. Die bestehende
Inventar-UI bindet die Auswahl in Beitragsabschnitten ein; die
Herausforderungswerkstatt verwendet dieselbe Auswahl je Lösungsweg.

`actionIconId` wird am Ansatz und am Beitragsabschnitt gespeichert. Ein Versuch
übernimmt das vorbereitete Symbol; beim Kommentieren lässt es sich ändern.
Ohne Auswahl wird das Symbol aus der tatsächlichen Probe oder Verbrauchsart
ermittelt. Alte Beiträge bleiben ohne Migration lesbar. Ein Wechsel zwischen
Interagieren und Konsumieren verwendet nur Symbole der passenden Gruppe.

Interaktionen, Konsumaktionen und ausgewertete Herausforderungen verwenden
das gemeinsame kleine Porträt mit versetztem Abzeichen. Die Beschriftung
behält die tatsächliche Blasenart bei. Die CSS liegt in
`styles/comment-action-icons.css`; keine neuen Inline-Handler.

Die 24 neuen Aktionsbilder und das neue Merkmalbild wurden mit dem eingebauten
Imagegen-Werkzeug erzeugt. Originale, tatsächliche Prompts, SHA256, Alphakanal
und die technischen 256-Pixel-Ausgaben sind unter
`docs/art/comment-action-icons-20261117/` dokumentiert.

## Kommentarplatzierung

Beim Einstieg über „Versuchen“ merkt sich der neue Abschnitt unter
`challengeReplyToCommentId` den ersten Antwortbeitrag auf dieselbe
Herausforderung. Ohne bisherigen Versuch ist die Herausforderung selbst der
Anker. Der normale Kommentieren-Knopf entfernt diese Bindung auch aus einem
wiederhergestellten Entwurf. Manuelle nachträgliche Antworten behalten ihren
bisherigen eigenen Speicherweg.

Die normale Seitengröße ist 100 Kommentare. Bestehende ausdrücklich gewählte
Größen, benannte Sammelseiten und Tagesgrenzen bleiben erhalten. Erst beim
Zusammenstellen regulärer Anzeigeseiten gruppiert die Pagination die Antworten.
Gespeicherte `orderKey`-Werte und die Historie der Würfel-/Inventartransaktionen
werden dafür nicht geändert. Der Ordnungshelfer arbeitet ohne Rekursion und
ohne Mutation der Kommentare. Fehlende Anker verlieren keine Beiträge.

## Tierumgang und Tiersprache

„Mit Tieren umgehen“ ist bei Rede, Flüstern und Rufen eine reguläre Probe.
Der Standardzugang einer entsprechenden Herausforderung ist Rede.

Das neue Merkmal `development-trait-kann-mit-tieren-sprechen` heißt
„Kann mit Tieren sprechen“, kostet 3 Entwicklungspunkte und wird durch die
bestehende Charakterentwicklung ausgewählt. Es wird niemandem automatisch
zugewiesen. Nur ein aktives Merkmal mit dieser gespeicherten Identität erlaubt
Tiersprache. In der Tiersprache-Blase gibt es Vorteil auf „Mit Tieren umgehen“;
die übrigen Blasen erhalten diesen Vorteil nicht.

Die gemeinsame Auflösung (`skill-evaluation-8`) verrechnet diesen Vorteil mit
den bestehenden Vor-/Nachteilen. Der Server liest die tatsächliche Figurenakte
für normale, Fertigkeits- und Kampfbeiträge. Mitgesandte Traitkopien ersetzen
diese Prüfung nicht. Die Würfelauswertung wird serverseitig erneut geprüft;
die tatsächliche Tiersprache-Wirkung steht im gespeicherten Beleg.

## Prüfung und begrenzte Onlinekorrekturen

Fachtests, Backendtests, Browser-Fixtures und die Abschlussbelege liegen unter
`diagnostics/interaction-presentation-20261117/`. Die Browserfälle verwenden
ausschließlich lokale GET-Ressourcen und In-Memory-Speicheradapter.

Ausdrücklich online korrigiert wurden zwei gelieferte Beiträge: Asgeirs letzter
Redeabschnitt wurde bei unveränderter Interaktion und Auswertung entfernt;
bei „Den rasenden Tanor besänftigen“ wurde die Ein-Versuch-Grenze entfernt.
Gawains gespeicherter Fehlschlag bleibt erhalten. Beide Änderungen hatten
eine gezielte Vorhersicherung, Update-Time-Vorbedingung und Serverrückprüfung.
