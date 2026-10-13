# Kampfbelege und aktuelle Szenenanzeige – 13. Oktober 2026

Auslöser ist der abgeschlossene Übungskampf Nudd–Asgeir. Nudds gespeicherter
kritischer Konter verursachte 24 Schaden, fehlte aber im Fazit und erhielt keinen
zufälligen Krit-Nebeneffekt. Nach dem K. o. wurde noch ein weiterer Angriff
ausgewertet. Die bisherigen Beiträge, Würfel, Lebenspunkte und Ressourcen werden
durch diese Veröffentlichung nicht verändert.

## Gemeinsame Erfassung

`modules/combat/combat-resolution-tree.js` liest Hauptauswertungen und die
eigenständigen verschachtelten Gegenangriffe. Folgeangriffe gehören weiterhin zum
bereits addierten Schaden ihrer Hauptauswertung. Dieselbe Erfassung wird für
Kritfolgen, Szenengegenstände, Kampfliste, Verbrauchsbelege und Statistik verwendet.
Historische Einzelauswertungen und W10-Belege bleiben lesbar.

Die serverseitige Kritvergabe berücksichtigt jeden kritischen Einzelangriff einer
Folge sowie Gegenangriffe. Je ganzem Beitrag gelten weiterhin ein Treffer-Nebeneffekt
pro Angreifer/Ziel und ein Fehlschlags-Nebeneffekt pro Angreifer. Treffer und Patzer
können beide auftreten. Unterdrückte Zusatzfolgen ziehen keinen weiteren W20.
Würfel werden nur serverseitig gewählt und bei Transaktionswiederholungen wiederverwendet.
Ein bereits fallengelassenes Waffenexemplar wird innerhalb derselben Erfassung nicht
nochmals abgelegt. Die Folgen beginnen weiterhin nach dem ganzen Beitrag.

In Übungskämpfen und Duellen werden schädliche Handlungen gegen bereits kampfunfähige
Ziele vor neuen Würfen oder Kosten abgewiesen. Heilung bleibt möglich. Ein ungültiger
weiterer Abschnitt lässt die gesamte Einreichung atomar scheitern; gültige Abschnitte
können anschließend separat eingereicht werden. Andere Kampfarten behalten ihre
bestehenden Regeln.

Gegenangriffe zählen für Schaden, Handlungen, Höhepunkte und Niederlagenstatus.
Zusammengeführte Reaktionsbelege werden nicht doppelt berechnet. Bei alten Fazits
werden diese Kennzahlen ausschließlich für die Anzeige aus den gespeicherten
Auswertungen gelesen; ursprüngliche Vorher-/Nachher-Snapshots bleiben erhalten.
Ein historisch fehlender Krit-Wurf wird weder erfunden noch nachgewürfelt.

## Interaktive Szene

- Verwaltungsereignisse der Kampfliste erneuern keine regulären Aktionsressourcen
  und zählen keine Beitragsdauern herunter. Kampfgebundene Wirkungen enden weiterhin
  an ihrer vorgesehenen Grenze.
- Die Profilkarte zeigt aktuelle TP, Ressourcen, Ausrüstung, zweite Hand,
  Entwaffnung, vorbereitete Schutz-/Konterwirkungen und bedingte Regelboni.
  Begrenzte Ausrüstungseffekte weisen ihren Verbrauch für Szene oder Tag aus.
- Die letzten bestätigten Vorgänge dokumentieren unter anderem Konter, TP-Übergänge,
  Kosten, Kritbelege, Zustandsverwaltung, Gegenstandsnutzung und Rasten. Der vollständige
  Verlauf bleibt bei den jeweiligen Beiträgen sichtbar.
- Profil-, Figuren-, Kreaturen- und Kommentarereignisse aktualisieren offene Karten.
  Geänderte Profildaten verwerfen den alten Auflösungscache. Bei neu aufgebauten
  Kommentaren bleiben Karten über ihre Beitrags-/Akteurkennung offen; Detailauswahl
  und Scrollposition bleiben erhalten. Noch nicht geladene Profile aktualisieren
  sich nach dem Laden automatisch.
- Angriffsfolgen zeigen alle Einzelwürfe, Treffer, Patzer und kritischen Treffer.
  Kritische Gegenangriffe und ihre Nebeneffekte sind ausdrücklich sichtbar.
  Automatische Erzählungen berücksichtigen Teiltreffer und Gegenangriffe; manuelle
  Spielertexte und frühere Erzählungen werden nicht umgeschrieben.

Die Jungdrachen-Haltungen behalten ihre freigegebenen Ersetzungsgruppen. Dieser Fix
erlaubt kein zusätzliches Stapeln und ändert weder Technikwerte noch Itemboni.

## Prüfung

Der breite Lauf bestand aus 507 Kampf-/Szenentests und 159 Servertests; anschließend
wurden zusätzliche Regressionen für doppelte Entwaffnung, gemischte Krit-/Patzerfolgen,
Heilung bei 0 TP und getrennte Kontererzählung ergänzt und gezielt geprüft.
Die Firebase-Veröffentlichung führt die vollständige aktuelle Serversuite nochmals aus.

Dauerhafte Regressionen:

- `tests/combat-resolution-completeness.test.mjs`: Traversierung, W20-Grenzen,
  Gegenangriffe, Entwaffnung, Fazit ohne Datenmutation, K. o.-Sperre, Heilung,
  Verwaltungsereignisse und sichtbare Wirkungen.
- `firebase/functions/tests/critical-scene-items.test.js`: echte serverseitige
  Rekonstruktion kritischer Konter, korrekte Empfänger, Live-Persistenz, Replay,
  Rücknahme, Manipulationsabwehr, atomarer K. o.-Abbruch und Vier Fänge mit
  zwei kritischen Treffern und zwei Patzern.
- `firebase/functions/tests/combat-narration-integrity.test.js`: Teiltreffer und
  Gegenangriffe dürfen getrennte Ergebnisse behalten.
- `tests/combat-scene-profile.browser.mjs`: echte Controller und Nudds Archivprofil,
  Desktop und 390-Pixel-Mobilansicht, neue Kommentaransicht mit geändertem Renderindex,
  Scroll-/Detailerhalt, Itemverbrauch, Konterdokumentation, Nachladen und Cachewechsel.
  Der Browser verwendet ausschließlich lokale Testdaten und sperrt externe Zugriffe.

Beispiel für den Browserlauf:

```powershell
$env:PLAYWRIGHT_EXECUTABLE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
node AleriaAlmanach/tests/combat-scene-profile.browser.mjs Stammbäume/node_modules/playwright-core/index.mjs
```

Screenshots und lokale Prüfprotokolle liegen im ignorierten Verzeichnis
`.codex-temp/combat-checkup/`.
