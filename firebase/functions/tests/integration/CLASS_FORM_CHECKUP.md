# Drachentanz und Wyrmtanz: Klassenprüfung

Geprüfter Stand: 9. September 2026. Alle **56 Tests** des neuen Emulatorlaufs bestehen. Die vollständigen Ergebnisse einschließlich Würfelfolgen, Ressourcen und Kampfverläufen stehen in [combat-class-form-results.json](combat-class-form-results.json).

## Abgleich der Systeme

- Die verbindliche Formauswahl stimmt zwischen Klassenregistern, erzeugten Klassenseiten, Ausbildungsplänen, redaktionellem Klassenmodul, Attackenkatalog und Charakterbogen überein.
- Cantref und Uchelwyr beginnen ihre Expertenformen mit dem Speerdrachen; die gemeinsame Speerausbildung und die exklusiven Klassenformen sind getrennt.
- Beide Derwyn-Grundausbildungen bleiben exklusiv, überstehen Speicherung und Wechsel und führen zu denselben vier Wyrmformen. Stufe 7–8 ist die freie kreative Phase.
- Browser und Server verwenden identische Regeln. Veraltete kanonische Techniken werden abgeglichen; persönliche Techniken bleiben erhalten.
- **Korrigiert:** Der aufsteigende Drache stand als eingerückter Eintrag nach dem ausgeglichenen Drachen. Jetzt folgt er unmittelbar dem fliegenden Drachen, trägt dessen Namen als Elternpfad und liegt im Attackenarchiv tatsächlich unter ihm. Klassenmodul, Klassenbeschreibungen und erzeugter Katalog zeigen dieselbe Zuordnung. Eine ausdrückliche Negativprüfung stellt sicher, dass der ausgeglichene Drache den Aufstieg nicht freischaltet.

## Formprüfung

43 Kombinationen decken jede zugelassene Expertenform für Teulu, Cantref, Uchelwyr, Helwyr und Arthwyr, die drei weiterführenden Barddwyr-Formen sowie alle vier Derwyn-Waffenformen mit beiden Grundausbildungen ab. Für jede Kombination wird eine regulär erlernte Attacke mit passender Waffe ausgeführt.

Nach jeder Speicherung werden Vorschau, Serverberechnung, Szenen-Replay und gespeicherte Trefferpunkte verglichen. Kosten müssen anfallen, Werte bleiben innerhalb ihrer Grenzen. Die Rücknahme stellt Trefferpunkte, Ressourcen und temporäre Zustände wieder her.

## Vollständige Kämpfe

| Prüffigur und Schwerpunkt | Runden | Zielauswertungen | Ergebnis |
| --- | ---: | ---: | --- |
| Teulu · Schwertdrache | 2 | 6 | Kampf abgeschlossen |
| Cantref · hütender Drache | 1 | 4 | Kampf abgeschlossen |
| Uchelwyr · stürmender Drache | 2 | 7 | Kampf abgeschlossen |
| Helwyr · jagender Drache | 2 | 5 | Kampf abgeschlossen |
| Barddwyr · kreischender Drache | 2 | 6 | Kampf abgeschlossen |
| Arthwyr · Bärenklaue | 1 | 3 | Kampf abgeschlossen |
| Derwyn, Cenyr · fließender Wyrm | 2 | 6 | Kampf abgeschlossen |
| Derwyn, Vennyr · brandender Wyrm | 2 | 5 | Kampf abgeschlossen |
| Derwyn, Vennyr · steigender Wyrm | 2 | 5 | Kampf abgeschlossen |
| Derwyn, Cenyr · peitschender Wyrm | 2 | 5 | Kampf abgeschlossen |

Alle zehn Kämpfe erreichen Kampfunfähigkeit und einen regulären Abschluss. Die ausdrücklich zu prüfende Form wird jeweils tatsächlich eingesetzt. Insgesamt entstehen 52 Zielauswertungen, einschließlich Fehlschlägen und eines kritischen Treffers. Ressourcen begrenzen die Handlungen pro Beitrag; ein künstliches Aktionslimit muss keinen Zug abbrechen.

Zusätzlich bestehen Schutz- und Ablaufprüfungen für **Ruhige Schwelle** und **Wartende Klinge**. Beide bezahlen ihre Kosten, verursachen keinen versteckten Schaden, schützen während des gegnerischen Beitrags und enden nach dem vorgesehenen eigenen Beitrag. Entfernte Attacken lassen sich nicht in einen gültigen Szenenentwurf übernehmen.

## Umfang und Wiederholung

Die Kämpfe verwenden synthetische Figuren mit regulär erlernten Techniken auf Stufe 20 gegen einen einfachen Prüfgegner auf Stufe 9. Das prüft Ausführbarkeit und Datenkonsistenz; es ist keine Gleichstufen- oder PvP-Balancebewertung und kein vollständiger Test jeder einzelnen Attacke des Katalogs.

Firestore läuft ausschließlich auf `127.0.0.1:8180` im Projekt `demo-aleria-combat-checkup`. Die Tests verwenden echte lokale Speicherung und die produktiven Kampfhandler, jedoch lokale Testidentitäten. Produktive Firebase-Daten und echte Charaktere werden nicht verändert. Anmeldung und produktive Sicherheitsregeln sind nicht Gegenstand dieses Laufs.

Aufruf und Emulatorstart: [README.md](README.md). Zusätzlich wurden die Klassenseiten auf Desktop und Mobilgeräten, beide Derwyn-Grundausbildungen im Charakterbogen und die Archivverschachtelung im Browser geprüft; dabei traten keine JavaScript-Fehler oder fehlenden lokalen Dateien auf.
