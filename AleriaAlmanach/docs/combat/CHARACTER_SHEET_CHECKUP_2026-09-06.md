# Charakterbögen: Vitalität, Szenenstand und Pergament

## Umsetzung

- Gemeinsame LP-Arithmetik für Charaktererschaffung, Stufenaufstieg, manuelle Stufe, Bogen, Szenenauflösung und Server. Reguläre Trefferwürfel + KON bleiben; ein kumulierter Viertelzuschlag verteilt die Rundung über Stufe 1–30.
- Eigene/gewürfelte Maxima behalten einen Anker aus Basis-LP und Vitalität. Weitere Aufstiege und rückwirkende KON-Änderungen werden als Differenz fortgeführt. Eingaben beim gewürfelten Aufstieg enthalten Würfel + KON; Vitalität kommt automatisch hinzu.
- Bestehende Wunden bleiben erhalten, ebenso 0 LP und temporäre LP. Szenen mit alten LP-Maxima werden auf das neue Maximum bezogen; auch die Rücknahme eines alten Beitrags erhält die Vitalitätsregel.
- Eine Migrationskennung mit einmaligem LP-Zuwachs verhindert 39/49-Mischstände beim Zusammenführen lokaler Regeln mit älteren Online-Daten. Wiederholtes Laden/Migrieren gibt keinen weiteren Zuschlag.
- Zehn lokale Einzelbögen und die daraus erzeugte Charakterdatenbank abgeglichen. Historische Gesamtexporte bleiben Archivstände.
- Fünf Charakterbogen-Tabs, Starthilfe und Aufstiegsfenster im Pergamentstil: Ocker für Hauptnavigation, mittlere Pergamenttöne für Abschnittsköpfe, helle Eingaben, dunkle Schrift und sichtbare Tastaturfokusse.
- Der aktuelle Kampfstand ist standardmäßig eingeklappt. Er zeigt LP, temporäre LP, aktive Waffe, Ressourcen, Zustände, Dauer, Konzentration und Kanalisierung. In geöffneter Szene sind Vergabe, Entfernen und Reset verfügbar; die serverseitige Kampfsperre gilt weiterhin.
- Gemeinsamer Renderer für kleine Szenenkarte und großen Kampfstand. Aktualisierung verändert nur die Statusanzeige; unspeicherte Grundwerte bleiben erhalten. Inventaranzeige bezieht LP aus dem Kampfprofil.
- Ein doppeltes natives change-Ereignis beim manuellen Stufenwechsel löst keine konkurrierende Neudarstellung mehr aus.

## LP der ausgearbeiteten Figuren

| Figur | Alte maximale LP | Neue maximale LP |
|---|---:|---:|
| Gawain Draig | 39 | 49 |
| Gildas Gafyr | 52 | 65 |
| Rhiannon Draig | 20 | 25 |
| Duncan Gafyr | 204 | 255 |
| Kane Draig | 39 | 49 |
| Gethin | 49 | 62 |
| Guinevere Neidr | 29 | 37 |
| Fenrir Varulv | 65 | 82 |
| Freya Skald | 33 | 42 |

## Prüfungen

697 automatisierte Prüfungen: 535 Frontend-, 90 Server-, 60 Integrationstests einschließlich 12 vollständiger Gruppenkampfsimulationen, 12 Firestore-Regeltests. Geänderte LP-Erwartungen wurden explizit aktualisiert; Schadens- und Ressourcenprüfungen bleiben bestehen.

Browser: alle fünf Tabs, Stufe 5 → 6 mit 49 → 58 LP, Aufstiegsdialog, standardmäßig geschlossener Kampfstand, Auf-/Zuklappen, Desktop und 390px Mobilbreite ohne horizontalen Überlauf oder JavaScript-Fehler. Im lokalen Firestore: temporärer RK-Buff hebt Szenen-RK auf 18, Grundwert bleibt 16; Aktualisierung erhält den geöffneten Statusbereich und den Bogenentwurf, Reset und Kampfsperre funktionieren.

Produktionsbuild, Medienregister und Abgleich der Rittersets sowie aller sechs Cenyr-Bögen bestehen. Die bekannten großen Würfel-/Almanach-Bundles bleiben eine separate Optimierungsaufgabe.

## Veröffentlichung / Datenmigration

Ziel der bestehenden Website ist Firebase `aleriaprojekt` und Netlify `dieweltvonaleria`. Der lesende Vorabgleich fand 232 Live-Figuren, davon 20 mit vorhandenen oder lokal ausgearbeiteten Kampfprofilen. Einige Trainingsprofile fehlten online noch (unter anderem Gildas und Kane; Duncan war nur ein Stufe-1-Grundprofil).

`firebase/functions/scripts/migrate-character-vitality.mjs` läuft standardmäßig lesend. `--apply` sichert zuvor die Originaldokumente unter dem ignorierten `.codex-temp`, ergänzt fehlende/ältere Trainingsprofile entsprechend der bereits verwendeten Archiv-Zusammenführung und migriert LP einmalig. Etablierte Profile behalten ihre übrigen Daten. Revisionsstempel verhindern veraltete Browser-Schreibvorgänge. Änderungen werden atomar mit Versionsvorbedingungen und Prüfung unveränderter Kampfsperren geschrieben; gesperrte Figuren werden ausgelassen.

Freitext-Sonderwirkungen, Folgeschaden und die in den vorherigen Checkups genannten Grenzen werden dadurch nicht zu automatischen Regeln.

Live durchgeführt: 18 Firebase-Funktionen erfolgreich veröffentlicht, Firestore-Regeln aktualisiert, 20 Kampfprofile atomar abgeglichen. Anschließender lesender Kontrolllauf: keine gesperrten Figuren und keine ausstehenden Migrationen; neue LP und Trainingsstufen bestätigt.

Der zusätzliche Live-Abgleich prüft die Speicherkennungen: Gildas' lokaler Archivschlüssel `gildas-gafyr` darf den vorhandenen Online-Datensatz `person--haus-gafyr--gildas-gafyr` nicht ersetzen. Beim Zusammenführen wird nur eine tatsächlich vorhandene Online-Kennung gewählt; alte Archivverweise werden als Aliase aufgelöst und der Editor speichert die aufgelöste Kennung.
