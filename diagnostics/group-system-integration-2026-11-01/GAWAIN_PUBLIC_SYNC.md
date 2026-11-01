# Öffentlicher Gawain-Abgleich, 1. November 2026

Der gezielte lokale Abgleich ist abgeschlossen. Es gab keine Firebase-Zugriffe,
Veröffentlichung, Löschung oder allgemeine Neuprojektion des Figurenbestands.

## Dauerhafte Quellen und Builder

- Gemeinsamer öffentlicher Text: `AleriaAlmanach/modules/gawain-duncan/gawain-public-biography.mjs`.
- Öffentlicher partieller Export: `Charakter Archiv Exporte/gawain-draig-oeffentliche-biografie-2026-11-01.json`, erzeugt durch `AleriaAlmanach/scripts/build-gawain-duncan-content.mjs`.
- Familienprojektion: `gawain-family-snapshot.mjs`, Builder `AleriaAlmanach/scripts/build-gawain-family-snapshot.mjs`.
- Bestehende Datenbankprojektion: `gawain-character-database.mjs`, Builder `AleriaAlmanach/scripts/build-gawain-character-database.mjs`; wiederverwendet die gemeinsamen Contenthash- und `mergeCharacterRecordProjections`-Funktionen.
- Alle drei Builder sind mit `--check` aktuell. Die zwei gezielten Builder stehen ausdrücklich neben dem allgemeinen Archivimport, damit unabhängige Klassifikationsänderungen nicht beiläufig mitgeschrieben werden.

## Erhaltung

`gawain-preservation-result.json` belegt auf dem tatsächlichen Bestand:

- Exakt 255 unveränderte Figuren-IDs. Sämtliche Inventar-/Kampfprofil-Hashes sowohl der einzelnen Akten als auch des Browser-Snapshots stimmen mit `before-profile-hashes.json` überein.
- Nur Gawains Akte, Registryzeile und Snapshotzeile wurden geändert; alle 254 anderen Akten sind bytegleich, alle Ablagepfade und `charTabs` unverändert.
- Haus Draig: Revision 3, gezielte Personenquelle 12. Nur Gawains Titel, öffentliche Notiz, Biografiemodul und zugehörige Quellmetadaten wurden geändert. Sämtliche Attribute, IDs und Beziehungen sowie alle 176 Nachbarn sind strukturell identisch. Die allgemeine Familienquelle 15 wurde nicht pauschal übernommen.
- Alte und neue Familienfassung liegen in den üblichen `backups/haus-draig/`-Revisionsdateien. Vorhandene Sicherungen werden auf Kollision geprüft und niemals überschrieben.

## Behobenes Quellenloch

Der allgemeine Archivimport las zuvor nur direkte Dateien im Exportverzeichnis.
Dadurch fehlten neun bereits registrierte Figuren und neun Figuren hätten andere
Inventar-/Kampfprofilwerte erhalten. Die öffentliche Quellenauswahl besitzt nun
`CharakterDatenbank/lib/character-export-sources.mjs`: direkte Exporte plus exakt
die bereits in Registry oder Snapshot registrierten verschachtelten Dateien.
Keine rekursive Suche. Pfade müssen im öffentlichen Exportarchiv liegen; auch
nach außen führende Junctions werden abgewiesen. Verlorene oder beschädigte
registrierte Quellen führen zu einer verständlichen Fehlermeldung.

Der erneute rein lesende Plan (`check-character-source-plan.mjs`) enthält 171
Overlays, alle 255 Figuren und unveränderte Gameplayhashes. Nachweise:
`gawain-retained-source-plan.json`, `gawain-retained-source-gameplay.json`.

Der allgemeine `sync-character-archive.mjs --check` bleibt erwartbar rot, weil er
sechs unabhängig entstandene, hier nicht ausgeführte Ablagewechsel verlangt:

| Figur | Bisher | Allgemeiner Plan |
| --- | --- | --- |
| Glendower O'Cenyr | unzugeordnet | Haus Twyllod |
| Gruffudd Gwregysdu | Haus Bradrhith | Haus Gwregysdu |
| Der Schwarze Zitteraal | Schwarze Zitteraale | Haus Skellor |
| Cynddelw Llythfor | Ort Gwynthor | Haus Llythfor |
| Eirlys Llythfor | Ort Gwynthor | Haus Llythfor |
| Esyllt Penrudd | Ort Gwynthor | Haus Penrudd |

Der erste gemeldete fehlende Zielpfad ist Glendowers Twyllod-Akte. Dieser Befund
ist getrennt vom behobenen Quellenverlust; der allgemeine Sync wurde nicht im
Schreibmodus ausgeführt. Die bekannte fremde Tuilelaith-Familienvalidierung wurde
ebenfalls nicht verändert.

## Regressionen

- 29/29 Biografie-, Quellenlese- und benachbarte Archivtests: `gawain-biography-tests.log`.
- 10/10 Gruppencontent-Tests einschließlich typisierter Idwal-Schiffskatzen: `group-content-tests.log`.
- 10/10 Gruppenbestands-Tests nach dem unabhängigen Peercheck: `group-inventory-peercheck-tests.log`. Der dabei bestätigte Zugang über einen Besitzlink mit Menge `0` wurde abgewiesen; auch negative und nicht numerische Mengen sind ohne Teiländerung geprüft.

## Abschließende Schnittstellenprüfung

- `group-inventory-final-emulator.log`: 6/6 echte Firestore-Integrationen im ausschließlich lokalen Projekt `demo-aleria-group-inventory`, Emulator 8187. Der tatsächlich erzeugte Gruppenbeleg bleibt bei Rücknahmeversuchen durch Spieler, Moderator und Admin einschließlich Force erhalten; Inventare, Kassen und Vorgangsquittung bleiben unverändert.
- Die reale Suite vergleicht alle vier Münzarten aus dem Browser-Requestbuilder mit Inventaren und Szenenbelegen, einschließlich der Pfennigbilanz. Gefälschte Payload-/gespeicherte IDs ändern weder den authentifizierten Akteur noch die kanonischen Figur-/Gruppenkennungen. Ungültige Währungen, Bruchteile und unberechtigte Zugriffe haben keine Teilwirkung.
- Die dabei belegte Annahme einer verknüpften externen Vorlagenszene wurde im bestehenden Gruppen-Szenenguard geschlossen. Beendete, fehlende, nicht verknüpfte, verborgene und archivierte Szenen bleiben ebenfalls abgewiesen; eine offene verknüpfte externe Szene funktioniert.
- `group-content-final-tests.log`: zuletzt 15/15 Gruppencontent-/Gawain-Tests, einschließlich erster Aktivierung wirklich leerer Gruppenübersichten, Erhalt ausdrücklicher Mitglieder-/Gast-/Preset-Auswahl und unveränderter späterer leerer Auswahl hinter dem Versionsmarker.
- `final-gameplay-preservation.json`: erneut exakt 255 Akten und Snapshotzeilen, identische IDs sowie unveränderte Inventar-/Kampfprofil-Hashes gegenüber der Ausgangsbasis. Beide gezielten Familien-/Datenbank-Builder sind weiterhin mit `--check` aktuell.
- Nach Roots abschließendem Server-Sync: `group-content-membership-final-tests.log` mit 28/28 Servertests auf der generierten gemeinsamen Contentprojektion. `group-final-contract-tests.log` mit 36/36 Frontend-/Content-/Quellenverträgen, einschließlich des angeglichenen Münzmengenvertrags.
- Abschließend alle drei Gawain-Builder sowie die Gruppenfassade mit `--check` aktuell. Die zuvor allein vom Aufrufverzeichnis abhängigen esbuild-Quellkommentare wurden durch Root über ein festes Arbeitsverzeichnis reproduzierbar gemacht; der erneute Check aus `AleriaAlmanach/` besteht.

## Erhaltung vollständiger Kampfprofile nach Browserprobe

Die erste strenge Browserprobe zeigte noch unnötige Profiländerungen bei
alltäglichen Übergaben. `browser-profile-differences.json` benennt die genauen
Pfade aller sechs Figuren: Gawain erhielt eine neue Revision, leere
`triggerRules`/`mechanics` und ein geändertes Rüstungsbild; Duncan und Tanor nur
eine neue Profilrevision. Ylva, Freki und Carreg blieben unverändert. TP und
Ressourcen waren auch in dieser ersten Probe unverändert.

`groups/group-inventory-equipment.js` begrenzt die bereits gemeinsam validierte
Ausrüstungsprojektion nun auf tatsächlich übertragene Inventarverweise. Der
Gruppencommit schreibt das Kampfprofil samt Revisionssektion nur, wenn sich
dessen gebundene Waffen-/Rüstungseinträge wirklich ändern. Geld und reine
Verbrauchsgüter erhalten das komplette Profil exakt. Besitzprüfung, Unikatclaims,
Begleiterbindung und Kampf-Locks bleiben unverändert. Vor der Übergabe wird die
gespeicherte Ausrüstung nicht pauschal hydriert; dadurch kann eine angelegte Waffe
nicht wegen eines widersprüchlichen alten Inventarflags still abgelegt werden.

- `browser-profile-replay-fixed.json`: isolierter Replay der fünf tatsächlichen
  Browseraktionen aus `browser-before-state.json`, ohne Firebase-Anbindung oder
  neue Seeds. Alle sechs kompletten Profile einschließlich Hash sind identisch;
  Geld- und Verbrauchsgütermengen erhalten, fünf Quittungen, eine Registerzuteilung.
- `group-profile-preservation-tests.log`: 31/31 Nachbar-/Regressionsprüfungen.
  Neue Fälle prüfen exakte Profilgleichheit einschließlich Revision und fehlender
  Felder, echte Waffen-/Rüstungsübergabe ohne Änderungen fremder Ausrüstung sowie
  die Sperre für gespeicherte angelegte Ausrüstung.
- `group-inventory-profile-emulator.log`: 6/6 echte Emulator-Integrationen mit
  vollständiger Profilgleichheit bei den Geldübergaben.
- `server-units-after-profile-fix.log`: vollständige Serversuite 310/310 grün.
- Die von Root anschließend ausgeführte weitere Browserprobe (2 Kupfer an Ylva,
  eine Ration an Freki) bestätigte erneut exakte Gleichheit aller sechs Profile.
  Bestehende Testfiguren und Bestände wurden dafür nicht zurückgesetzt.
