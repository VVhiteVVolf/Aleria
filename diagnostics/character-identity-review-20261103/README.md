# Öffentlicher Identitätsabgleich vom 3. November 2026

Die bestätigte Doppelung von Gethin stammt aus der erneuten Aktivierung der
Altakte `6atOllMA637Z2VNAZAxf`: lokal war sie archiviert, online seit dem
2. November wieder `archived:false`. Die bisherige Online-Priorität hob damit
die lokale Archivierung auf. Das neue Regressionsszenario bildet diesen
tatsächlichen Zustand nach.

Bestätigte Altakten:

| Altakte | Unveränderte Hauptakte | Beleg |
| --- | --- | --- |
| `6atOllMA637Z2VNAZAxf` | `person--haus-draig--gethin-1722-draig` | Vorhandene bestätigte Zuordnung/Exporte vom 14. Oktober; frühere Medien bereits auf der Hauptakte erhalten; Vivian ausschließlich dort gebunden. |
| `XWJ6XXwvpESHR3zAXkJx` | `15ml9RhSvJPXof7z4qY3` | Bereits registrierte Quell-ID derselben Gwendolyn-Weltperson, identischer Name, Gräfinnentitel und Portrait. |
| `uiKiMFXC6OEWOdDenbiM` | `15ml9RhSvJPXof7z4qY3` | Zusätzliche Geburtsnamen-Altakte derselben Gwendolyn-Weltperson; registrierte Quell-ID, Gräfinnenprofil, Portrait und Ehename stimmen überein. |
| `mRCEkgEQByaxQWC0PJN5` | `fBCCU7G0r163GXUBqgYg` | Bereits registrierte Quell-ID derselben Dehlia-Weltperson; identischer Name, Titel, Portrait und Inventar, Unterschiede nur Emotes/Profillink. |

Gethin Draenmelyn, geboren 1725, bleibt von Gethin Draig, geboren 1722,
getrennt. Ein Namensvergleich erzeugt keine neuen Aliasregeln.

`retirement-plan.json` und `retirement-plan-gwendolyn-alias.json` wurden mit
dem öffentlichen Leseclient vorbereitet und anschließend mit Versionsguards
veröffentlicht. Zusammen betreffen sie vier Altakten für drei Hauptpersonen.
Je Altakte umfassen sie genau `archived` und `mergeIdentity`, mit
REST-updateTime als Vorbedingung. Die Hauptakten werden ausschließlich durch
atomare Verify-Operationen gegen zwischenzeitliche Änderungen geschützt.
Kein Inventar, kein Kampfprofil, keine aktuellen Ressourcen und keine
Reiterkonfiguration werden geschrieben. Vollständige Altakten bleiben erhalten.
Die Pläne enthalten Rücknahmebelege nur für die beiden geänderten Felder.
Vor den beiden atomaren Veröffentlichungen wurden die vollständigen
REST-Originale verschlüsselt im privaten Backupbereich gesichert. Die
anschließenden Prüfungen bestätigten die unveränderten Hauptakten und
sämtliche übrigen Felder der Altakten. Der öffentliche Beleg liegt in
`publication-verification.json`; private Sicherungsinhalte werden hier nicht
kopiert.

Das Browsermodell hält diese Altakten separat archiviert, damit ältere
Inventare oder Kampfstände niemals die neueren Hauptakten überstimmen.
Historische Profilaufrufe lösen bei vorhandener Hauptakte den Alias auf.
Eine nachträglich abweichende explizite Weltpersonen-ID verhindert die
automatische Archivierung und blockiert die Veröffentlichung des Plans.

Der erneuerbare Minimalfeldscan liegt in `scan-public-duplicates.mjs`; sein
Bericht `public-duplicate-review.json` schließt geschützte Quellen, deren lokale
Zuordnungen, private Index-IDs und explizit versteckte Akten vor der Ausgabe
im Speicher aus. Er kopiert keine vollständigen Personen- oder Familienakten.

## Ungeklärter Altfehler Meurig/Odyar

`E8HXkgi2kdkXaqkxrnRo` besitzt Meurigs Namen, Justiziartitel und passende
Meurig-Biografie. `N11mTG3vo2rLq2eQxOXE` heißt ebenfalls Meurig, enthält aber
Odyars Kämmerertitel, ein anderes Portrait und ausdrücklich Odyars Biografie.
`oVvNboWTUionb0PCZDf7` vermischt wiederum Meurigs Namen/Justiziartitel mit
derselben Odyar-Biografie. Genau diese Inkonsistenzen stehen bereits in beiden
ursprünglichen Vollarchiven:

- `Charakter Archiv Exporte/aleria-charakterarchiv-2026-08-03-16-37-25.json`
- `Charakter Archiv Exporte/aleria-charakterarchiv-2026-09-04-01-59-49.json`

Die lokale Registry gruppiert die drei Quell-IDs derzeit schon unter Meurig.
Diese bestehende Gruppierung ist angesichts der vermischten Inhalte kein
ausreichender neuer Identitätsbeleg. Die beiden fraglichen Dokumente werden
weder umbenannt noch archiviert noch mit Odyar verschmolzen.

## Prüfung

19/19 gezielte Tests erfolgreich: vier bestehende/erweiterte Gethin-Prüfungen,
sechs neue Retirement-Prüfungen sowie neun bestehende Datenbank-Sync-Prüfungen.
Geprüft sind insbesondere Online-Reaktivierung, fremde Namensgleiche,
Erhaltung aktueller Ressourcen und Originalmedien, historische Profilverweise,
schmale REST-Feldmasken, Idempotenz, abweichende Weltidentitäten, reversible
Belege und Abbruch bei einem inzwischen veränderten Ausgangsstand.

Zusätzlich wurden die drei geprüften Biografien von Cadogan, Rhiannon und
Gwen samt vier belegten Tierbegleitern atomar gespeichert. Die rein lesende
Nachprüfung bestätigte alle sieben Dokumente und die drei Kampfsperren;
unbeteiligte Hauptfelder blieben exakt erhalten. Details und der begrenzte
lokale Archivabgleich stehen im
[`Patrick-Prüfbericht`](../patrick-bios-20261103/README.md).

Die drei lokalen Charakterprojektionen wurden anhand des bestätigten
Publikationsbelegs abgeglichen: Gwen wurde neu angelegt, 263 unbeteiligte
Charaktere blieben unverändert. Dabei wurden keine vollständigen Inventare
importiert und keine kanonischen Kampfdaten geschrieben. Der erneute
`--check` meldete null veraltete Ausgaben. Push und Netlify-Deploy sind der
anschließende gemeinsame Releaseschritt; dieser Bericht behauptet noch
keinen erfolgten Frontend-Deploy.

Die spätere Browserprüfung führte zusätzlich zu einem getrennten, streng
begrenzten Nachtrag für Rhiannons veraltete flache Rolle und Kurzfassung.
Nur `role`, `bio` und `updatedAt` ihrer Hauptakte wurden mit Versionsguards
geschrieben; die sechs anderen geprüften Personen-/Tierakten und alle
unbeteiligten REST-Felder blieben exakt erhalten. Der erneute lokale Abgleich
derselben drei Personen erzeugte keine weitere Akte und erhält wiederum
263 unbeteiligte Charaktere. Der separate Beleg ist
[`metadata-followup-verification.json`](../patrick-bios-20261103/metadata-followup-verification.json).
