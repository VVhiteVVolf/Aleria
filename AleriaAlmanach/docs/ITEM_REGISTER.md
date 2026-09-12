# Items und Güter – Architektur und Veröffentlichung

Stand: 12. September 2026. Implementierung und lokale Prüfungen abgeschlossen; Firebase-Funktion, Regeln und Frontend wurden in dieser Arbeit **nicht veröffentlicht**.

## Verantwortlichkeiten

| Bereich | Führender Speicher | Verhalten |
| --- | --- | --- |
| Standardgüter | Versionierte Marktquellen im Repository | Geschützte Vorlagen, reproduzierbar für Browser und Server erzeugt. Änderungen erfolgen über eine neue Datenversion. |
| Anbieter und Sortimente | Firestore `item_register_offers` | Ein Dokument je Angebot mit eigener ID, Standardreferenz, Preis, Ankaufspreis, Bestand und Revision. |
| Individuelle Listen | `characters/{id}.inventory.items` | Abgeleitete Ansicht des tatsächlichen Besitzes. Keine zweite Inventarkopie. |
| Begleiter | `creatures/{id}` mit `itemOrigin` | Name, Bild und Beschreibung werden mit dem zugehörigen Inventargegenstand abgeglichen. |
| Handelsbelege | `item_register_transactions` | Vorgangs-ID und Preisbeleg verhindern doppelte Buchungen bei Wiederholungen. |

Die Trennung vermeidet zwei gleichzeitig beschreibbare Kopien derselben Daten in GitHub und Firebase. Das Repository hält die Maßstäbe; Firebase hält die veränderlichen Spielstände. Der Registerexport sichert Sortimente als JSON. Charaktere und Kreaturen bleiben Bestandteil der vorhandenen vollständigen Datensicherung. Es gibt keinen automatischen GitHub-Commit für einzelne Käufe.

Das Feature liegt in `modules/item-register/`: Modelle und Geldrechnung sind rein, Firebase-Zugriffe liegen in den Adaptern, UI, Formulare und CSS besitzen eigene Zuständigkeiten. Die klassischen `item-db-*`-Dateien stellen nur noch die bisherigen Einstiegspunkte und den Picker bereit. Ein gemeinsamer nativer Moduleinstieg verhindert doppelte Listener im Produktionsbuild.

## Daten und Bilder

`node scripts/build-item-register.mjs` erzeugt 215 Standardgüter sowie dieselbe Datenversion im Frontend und in den Firebase Functions. `--check` prüft beide Kopien und das Versionsmanifest ohne Änderungen.

Der Rossmarkt wird direkt aus `Markt/Rossmarkt/Rossmarkt.html` gelesen. Archiv und Register verwenden dafür denselben Parser in `scripts/source-pages/rossmarkt-source.mjs`. Alle 31 Reittiere behalten ihre vorhandenen Bild-URLs, Beschreibungen, Herkunft und Preisspannen. 27 sind Rösser oder Ponys, vier weitere Reittiere erscheinen unter Vieh. Der Arbeitsgaul aus dem Viehmarkt ist eine weitere eigene Pferdevorlage. Goldstück-Preise werden korrekt in Kupfer umgerechnet. Bestehende Pferde-IDs einschließlich der älteren Pony-Endungen bleiben stabil.

Die Bildfläche richtet sich nach `naturalWidth` und `naturalHeight`; `object-fit: contain` hält auch ungewöhnliche Formate vollständig sichtbar. Externe Bilder werden ohne Seitenverweis geladen, weil der vorhandene Bildhost Anfragen mit lokalem Referer mit HTTP 403 abweist. Individuelle Bilder gehen der Vorlage vor.

Die zehn Kategorie-Icons liegen in `public/assets/item-register/categories/`. Sie wurden mit dem integrierten `image_gen` erstellt. Die verwendeten Prompts stehen in `prompts.json`; `ruestungen-v3.png` ist die verwendete Stilvariante mit geschlossenem Topfhelm. Die vorhandenen Bilder einzelner Waren werden dadurch nicht ersetzt.

## Besitz und Handel

- Ein Kauf bucht Geld und gegebenenfalls Anbieterbestand in einer serverseitigen Transaktion und erzeugt ein Einzelstück mit `instanceId`, `templateId`, optionaler `offerId` und gespeichertem Kaufpreis.
- Der normale Verkaufspreis beträgt **50 % des tatsächlich bezahlten Stückpreises**, abgerundet auf einen Pfennig. Ein ausdrücklich hinterlegter Ankaufspreis des Anbieters geht vor. Fehlt bei älteren Gegenständen der Kaufpreis, wird kein fiktiver Preis angenommen.
- Preise innerhalb einer Spanne werden im Kaufdialog vereinbart. Der Server prüft Spanne, Bestand, Vermögen, Besitzberechtigung und Revision erneut. Ein wiederholter Vorgang mit derselben ID wird einmal gebucht.
- Name, Beschreibung, Bild und Ausführung gehören zum Einzelstück. Änderungen überschreiben die Standardvorlage nicht. Waffen und Rüstungen mit ausdrücklicher Kampfdefinition werden mit dem Charakterbogen verknüpft; bei einer Übergabe wechseln Inventar und Ausrüstungsverknüpfung gemeinsam.
- Ein gekauftes Tier kann als Begleiter angelegt werden. Änderungen im Inventar oder Kreaturenbogen aktualisieren die andere Seite. Verkauf entfernt die aktive Besitzerzuordnung, bewahrt aber Herkunft und Beleg. Verknüpfte Begleiter müssen vor dem Löschen aus dem Inventar gelöst werden.
- Aktive Kampfsperren verhindern widersprüchliche Handels- und Übergabevorgänge. Anbieter bearbeiten Redaktion und Spielleitung; mit Charakteren handeln deren Firebase-Besitzer und die Spielleitung.

Die bisherigen Marktquellen enthalten für viele Standardwaffen und Rüstungen keine verbindliche Schadensformel bzw. Rüstungsklasse. Diese Angaben werden nicht aus Preis oder Namen erfunden. Anbieter können sie im Formular hinterlegen; bestehende Kampfdefinitionen eines Inventargegenstands bleiben erhalten. Neue Begleiter übernehmen Identität und Herkunft, ihre Kampfwerte müssen im Bestiarium ausgearbeitet werden.

## Aktualisierung und Altbestände

Firestore-Listener aktualisieren Sortimente, Besitz und Begleiter für alle Leser. Gecachte oder unvollständige Verbindungen werden sichtbar markiert; Handel erfordert einen bestätigten Serverstand. Geöffnete Formulare behalten ihre Eingaben und Revision, damit ein inzwischen geänderter Datensatz beim Speichern erkannt wird.

Ein kleines Manifest prüft bei sichtbarer Seite alle 60 Sekunden sowie bei Rückkehr ins Fenster/Netz neue Standardversionen. Es hat eine feste URL auch im Produktionsbuild. Veraltete Standardversionen werden beim Handel serverseitig abgewiesen.

Alte lokale und Firebase-Registerdaten werden nur gelesen. Eigene Einträge und frühere Überschreibungen erscheinen als übernehmbare Angebote; Duplikate tatsächlichen Charakterbesitzes werden ausgespart. Vorherige Löschmarkierungen bleiben wirksam. Alte Daten werden weder massenhaft neu hochgeladen noch automatisch in die Standardvorlagen zurückgeschrieben.

## Veröffentlichung und Prüfung

Vor dem Einsatz für alle Spieler müssen die neue Callable Function `commitItemRegister`, die angepasste `commitInventoryTransfer`, Firestore-Regeln und das Frontend gemeinsam aus demselben geprüften Stand veröffentlicht werden. Die generierten Standarddateien müssen identisch sein. Ein Versionsunterschied unterbricht Käufe, bis Browser und Server wieder zusammenpassen. Vor einer produktiven Umstellung die vorhandene vollständige Datensicherung verwenden.

Lokale Prüfungen:

```text
node scripts/build-item-register.mjs --check
node scripts/sync-character-archive-pages.mjs --check
node tests/item-register.test.mjs
node tests/item-register-integration.test.mjs
cd ../firebase/functions
node tests/item-register.test.js
```

24 gezielte Registertests prüfen Preise, reale Rossmarkt-Bilder, Archiveinordnung, Besitzmetadaten, Käufe, Verkäufe, Wiederholungen, konkurrierenden Bestand, Rechte, Sperren, Übergaben und Änderungen verknüpfter Kreaturen. Zusätzlich wurden 63 bestehende Tests für Inventar, Ausrüstung, Speicherschutz, Kreaturen und Archiv ausgeführt. Die Transaktionstests verwenden einen lokalen Testadapter, keinen produktiven Firebase-Speicher.

Der versteckte lokale Browsertest prüft Kategorien als Startansicht, standardmäßig eingeklappte individuelle Listen, Suchfokus, Kauf, mehrfaches Absenden, Umbenennung, Begleiter, Varianten, Dialogtastatur und Ansichten mit 390, 760, 1280 und 1680 Pixeln. Das vorhandene Afol-Bild wird tatsächlich geladen und mit vollständiger Silhouette dargestellt. Bildschirmaufnahmen liegen unter `.tmp/item-register-review/` im Workspace. Der Produktionsbuild läuft mit den bestehenden Vite-Hinweisen zu klassischen Skripten und großen Bundles durch.
