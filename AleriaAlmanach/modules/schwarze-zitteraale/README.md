# Die Schwarzen Zitteraale

Lokaler Autorenstand vom 16. November 2026. Das Hauptmodul behält die ID
`schwarze-zitteraale`, seine bisherigen Aktenkennungen und den bestehenden
Hauptquartiersthread. Es hat acht Seiten: zwei Übersichten, Hierarchie, vier
Kopfgeldakten und die ursprüngliche interaktive Hauptquartiersszene.

Unter Kriminalität → Schwarze Zitteraale → **Schwarze Zitteraale - Gruppen**
liegen acht eigenständige Gruppenmodule mit jeweils vier Seiten: Gruppenbio,
Anführerbio, Hierarchie und interaktive Hauptquartiersszene. Jede neue Szene
besitzt einen eigenen Thread und kein vorgegebenes Datum. Die Standorte sind
offen; das Banner dient bis zur Ortsausarbeitung als Szenenbild.

## Aktueller Inhalt

Das Bandenhaupt bleibt **Der Schwarze Zitteraal**. Seine beiden Stellvertreter
heißen jetzt **Der Schinder** (vormals Schlickzahn) und **Der Eidlose** (vormals
Donnerkiefer). Nachtkieme wird unter dem neu gewählten Namen **Llineth** im
eigenen Zweig „Verbindungen“ geführt. Diese drei neuen Anzeigenamen sind
redaktionelle Ausarbeitungen des Auftrags. Die technischen Figurenkennungen
und bisherigen Porträts bleiben erhalten. Netznadel ist aus den aktuellen
Modulseiten, der Hierarchie und der Szenenbesetzung entfernt.

Die Führung zeigt Bandenhaupt, zwei Stellvertreter und acht Unterbandenführer,
letztere in zwei Viererreihen. Der Zweig „Gruppen“ enthält acht verlinkte
2:3-Banner in derselben Anordnung. Jede Unterbande besitzt einen Gruppenführer,
zwei Leutnants, sechzehn Räuberplätze in vier Viererreihen, acht Plätze für
Verstorbene in zwei Viererreihen und vier Plätze für Ex-Mitglieder.

**Die Untoten Aale** sind ausdrücklich **eine der ältesten Unterbanden**. Die
frühere Formulierung als junge Gruppe ist durch die letzte Nutzervorgabe ersetzt.
Sie werden von **Medrawd Angau, dem Untoten Aal**, geführt. Seine gemeinsame
Biografie enthält den Dienst unter dem Patriarchen, den Eidbruch gegenüber
Kharon, seine Hinwendung zu Hela, das Gefecht gegen Huw Saethwyr und die Verluste
gegen Sir Rhys Draig. Gruppe II. bis VIII. behalten offene Namen, schwarze
Banner und unbenannte Führungspersonen.

Der von Rhys getötete frühere erste Leutnant steht bei den Verstorbenen.
Brychan und Tegid stehen dort als frühere einfache Mitglieder; Rhodri steht bei
den Ex-Mitgliedern als früherer zweiter Leutnant. Die beiden neuen Leutnants
sind eigene, noch unbenannte Nachbesetzungen: ein grober ehemaliger Ritter und
eine blonde Zauberwirkerin. Ihre zuletzt gewünschten Porträtversionen sind aktiv.
Der Standort der Untoten Aale bleibt unklar; Tŵr Rhewgorn ist eine Vermutung.

## Verantwortlichkeiten

- `zitteraale-people.mjs`: aktuelle Führung, Gruppen, Banner und alte Mitglieder.
- `zitteraale-module.mjs`, `zitteraale-hierarchy.mjs`: bestehendes Hauptmodul.
- `zitteraale-group-modules.mjs`, `zitteraale-group-hierarchy.mjs`: acht Gruppen.
- `medrawd-angau.mjs`: gemeinsame Biografie und gezielter neuer Figurenexport.
- `untote-aele-lieutenants.mjs`: offene Leutnantstellen und Porträtzuordnung.
- `zitteraale-character-updates.mjs`: begrenzte redaktionelle Aktualisierung
  der drei bereits vorhandenen Figuren über den gemeinsamen Projektionsweg.
- `zitteraale-migration.mjs`: einmalige Revision auf den neuen Autorenstand;
  bestehende Hauptquartiersszene, zusätzliche Editorseiten und Kennungen bleiben
  erhalten. Nach gesetzter Revision bleiben weitere Editoränderungen erhalten.
- `scripts/build-schwarze-zitteraale.mjs`: generierte Registrierung, neun
  Modulpakete, drei begrenzte Figurenprojektionen und ein neuer Medrawd-Import.

Es gibt keine neue Hierarchie- oder Szenenlaufzeit. Registrierung, Layout,
Kommentare, Biografiedarstellung und beide Editoren verwenden die vorhandenen
Systeme. Viererreihen bleiben auf schmalen Bildschirmen horizontal erreichbar.

## Quellen und Bilder

[Die aktuellen Quellenentscheidungen](sources/decisions-20261116.json) ergänzen
die unveränderten historischen Oktoberbelege in `source-notes.json`.
Online-Modul und drei frühere Mitglieder wurden ausschließlich lesend gesichert.
Die acht neuen Modulkennungen und Medrawds Figurenkennung waren beim gezielten
Onlineabgleich nicht belegt. Das ist kein Veröffentlichungsbeleg.

Egons bereits ausgestellte Fahndungsblätter bleiben historische Schreiben mit
ihren damaligen Namen, fünf Köpfen und Kopfgeldern. Ihr Builder liest deshalb
den gesicherten Oktoberstand `sources/wanted-people-20261021.json`, statt heutige
Moduländerungen rückwirkend in alte Aushänge zu übertragen. Netznadels vorhandene
Einzelakte wird nicht gelöscht. Es gibt keine Änderung produktiver Profile,
Spielwerte, Inventare, Geldbestände, Käufe oder Kommentare.

[Bildaufnahme und tatsächliche Prompts](../../docs/art/zitteraale-groups-20261116/README.md):
33 erhaltene Generatororiginale, 27 aktive neue Bilder. Die Räuberplätze verwenden
das vorhandene Komplizenbild und fünfzehn neue Silhouetten. Alle neuen Bilder
haben 1024 × 1536 Pixel. Das Untotenbanner ist außerhalb des Tuchs transparent.
Technische Dateinamen mit `aele` bleiben stabile Versionskennungen; sichtbar ist
ausschließlich die korrigierte Schreibweise **Die Untoten Aale**.

## Erzeugen und prüfen

```powershell
node AleriaAlmanach/scripts/build-schwarze-zitteraale.mjs
node AleriaAlmanach/scripts/build-schwarze-zitteraale.mjs --check
node AleriaAlmanach/scripts/build-quest-catalog.mjs --check
node Anzeigetafeln/tools/build-gwynthor-quest-notices.mjs --check
node --test --experimental-test-isolation=none AleriaAlmanach/tests/schwarze-zitteraale.test.mjs AleriaAlmanach/tests/authored-character-import.test.mjs AleriaAlmanach/tests/schwarzfische.test.mjs AleriaAlmanach/tests/hierarchy-level-capacity.test.mjs AleriaAlmanach/tests/hierarchy-viewport.test.mjs AleriaAlmanach/tests/module-store-revision.test.mjs AleriaAlmanach/tests/module-store-online-source.test.mjs Anzeigetafeln/tests/zitteraale-wanted.test.mjs
node AleriaAlmanach/tests/schwarze-zitteraale.browser.mjs
```

66 Fach- und Nachbartests bestanden. Der endgültige echte Browserlauf prüfte
176 Bedienfälle und 177 Raster bei 1440, 390 und 320 Pixeln. Alle 112 finalen
UI-Aufnahmen wurden über 19 Kontaktbögen betrachtet. Details, frühere Fehlversuche,
Grenzen und Bestandsschutz stehen im
[Abschlussbeleg](../../../diagnostics/zitteraale-groups-20261116/README.md).
Kein Commit, Push, Deploy oder produktiver Inhaltswrite dieses Auftrags.
