# Der Grüne Bund

`eintrag.json` ist die gemeinsame Textquelle für die Religionsseite und das achtseitige Almanach-Modul. Grundlage ist der Nutzerauftrag vom 3. Oktober 2026. Der Name **Der Grüne Bund** wurde vom Nutzer ausdrücklich bestätigt. Die stabile Eintrags-ID lautet `gruener-bund`.

Die Bewegung gehört unter **Häresien & Kulte**, besitzt aber den eigenen Typ **Radikale Glaubensbewegung**. Sie ist weder eine neue Gottheit noch eine allgemein anerkannte Fortsetzung der Druidenordnung. Der Protest des verstorbenen Druiden ist ihr Auslöser; er hätte die spätere Lehre selbst abgelehnt. Sein Name und genaue Lebensdaten werden nicht ergänzt. Der Spuk über der Asche seines im Großen Krieg zerstörten Ahnenbaums bleibt eine Überlieferung.

## Abgleich mit bestehenden Quellen

- Die 19 alten Götternamen und Tierbezeichnungen stammen aus `religionen/alter-pantheon/glaube.json`. Die eigene Druidenhierarchie dieses Pantheons wird nicht zu einer Hierarchie des Bundes umgedeutet.
- `Astrologie/modules/zodiac/zodiac-data.mjs` und die Astrologieseite bleiben die Quelle der Himmelsordnung: 13 Monatszeichen, fünf Souveräne und Ordates/Ordan als seltenes zusätzliches Zeichen der Drachennacht. Die Bewegung benutzt alte Namen, keine abweichende Kalenderberechnung.
- Die vom Nutzer vorgegebene Reinheitslehre wird der Lehre von der gefallenen Natur ausdrücklich gegenübergestellt. Ihre Behauptung über Geld ist als Glaubensurteil gekennzeichnet.
- Drachen-, Tauben- und Bärengebot sind breite Beispiele, keine erfundene vollständige biologische Taxonomie. Eigenbedarf und Fürsorge für Abhängige erlauben begrenzte Entnahme; Viehzucht und kommerzielle Betriebe bleiben ausgeschlossen.
- Die geringe militärische Gefährlichkeit und überwiegende Duldung unterscheiden den Bund von der Rechtslage der Nimuiten. Es wird kein allgemeines Verfolgungsgebot ergänzt.
- Gemeinbesitz, freie einvernehmliche Bindungen und gleiche Stellung aller Kinder folgen dem Auftrag. Herdversammlungen, Gastfreundschaft, Lieder und Jahreszeitenbräuche sind redaktionelle Ausgestaltung der gewünschten Lebensweise, keine Änderungen anderer Religionen oder Spielmechaniken.

## Seiten und Bilder

| Seite | Inhalt | Motiv unter `assets/` |
| --- | --- | --- |
| I | Ursprung und Protest | `gruener-bund-protest-v1.png` |
| II | Alte Namen und Sternzeichen | `gruener-bund-altar-v1.png` |
| III | Naturlehre und ihr Widerspruch | `gruener-bund-natur-v1.png` |
| IV | Tiergebote und Eigenbedarf | `gruener-bund-vorrat-v1.png` |
| V | Gemeinwirtschaft und Geldverzicht | `gruener-bund-kommune-v1.png` |
| VI | Bindungen, Kinder und Bräuche | `gruener-bund-reigen-v1.png` |
| VII | Druiden, Kirche und weltliche Herren | `gruener-bund-begegnung-v1.png` |
| VIII | Ceitheach und die Erinnerung | `gruener-bund-ahnenbaum-v1.png` |

Alle acht Szenen folgen dem gewünschten Tales-of-Symphonia-Anime-Stil im Format 2:3. Menschen erscheinen mit brünettem Haar, heller Haut, blauen Augen und gälischer Kleidung. Die Illustrationen sind sinnbildlich; sie legen keine neuen Personenbiografien, Siedlungspläne oder gesicherten Geistererscheinungen fest.

Das Registersymbol `gruener-bund-symbol-v1.png` verwendet matte Gold-, Ocker- und Grüntöne mit dunklen Konturen auf Elfenbein. Das Religionsporträt `gruener-bund-glasbild-v1.png` folgt der Glasmalerei des Glaubenscodex. Beide bleiben von den Anime-Szenen getrennt. Erzeugung mit dem eingebauten Imagegen-Werkzeug; die vollständigen Prompts stehen in den gleichnamigen `.prompt.md`-Dateien.

## Erzeugung und Prüfung

```sh
node Religionen/scripts/build-religions.mjs
node Religionen/scripts/build-religions.mjs --check
node --test Religionen/tests/*.test.mjs
node AleriaAlmanach/scripts/check-module-template-roundtrip.js
```

`almanach.pages` verteilt jeden Textabschnitt genau einmal. Die vorhandene Modul-Erzeugung schreibt `AleriaAlmanach/modules/religion/gruener-bund/gruener-bund-entry.js`; diese Datei und die HTML-Seiten nicht unabhängig bearbeiten. Registrierung, Rückverweise, Suche und Vite-Einstiege folgen dem bestehenden Religionsregister. Die Modulbilder werden über `copyReligionModuleAssets` mitgenommen. Es werden keine Firebase-Daten oder historischen Spielstände geändert.
