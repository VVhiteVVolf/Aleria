# Gwynthorer Theater

Ausarbeitung vom 17.10.2026. Der Nutzer hat am 17.10.2026 ausdrücklich alle vorbereiteten Module für die Veröffentlichung auf master freigegeben.

Elf Inhaltsseiten und eine Kommentarabschlussseite: Gründungsgeschichte, Theaterbiographie, Rhianna und Elenid gemeinsam, Personalhierarchie, Repertoire und sechs bespielbare Räume. Das Theater erscheint genau einmal im Gwynthorer Archiv und ist in der Stadtbeschreibung als Betrieb und Kulturstätte vermerkt.

Lady Rhianna Draig, geborene Ceirwyn, bleibt die bestehende Person `person--haus-ceirwyn--rihanna-ceirwynn` mit ihrem vorhandenen Porträt. Elenid Awenfryn, 65, stammt aus Lynthor und absolvierte ihre Ausbildung bei den Bewahrern Avallorns, im bestehenden Fraktionsregister „Bewahrer von Avallorn“. Sie ist Inhaberin und Intendantin, Bardin, Schauspielikone und Lehrerin für Schauspiel und Dramatik. Die jüngste Nutzervorgabe ist in Bild und Text übernommen: arrogant, exzentrisch, dramatisch, üppiges silbergraues Haar, gewagtes Gewand, geöffneter Fächer. Ihre Familie ist als Herkunft mit Wappen vermerkt; ein Stammbaum wird nicht erfunden.

Das Ensemble hat dreizehn Darsteller mit ausschließlich Vornamen: vier Cenyri, je eine Person aus Mathringen und Istharan sowie zwei aus Aldrimar, zwei aus Weisenfluh und drei albischer Herkunft. **Alle sind Menschen; albisch bezeichnet die Herkunft, keine Elfen.** Aelirs, Nualas und Faelans irrtümliche Spitzohren wurden auf Nutzerkorrektur durch normale menschliche Ohren ersetzt. Verwaltung, Hausbetrieb und Hauswache haben einzelne freie Posten ohne Porträts. Die vier Personalreiter sind Theaterführung, Schauspielensemble, Verwaltung & Hausbetrieb und Hauswache.

Das Repertoire enthält Myrddins rothaarige Lehrlingszeit gegen den Vampirzauberer, Freydis und die zwölf Prüfungen mit Sigrun als Freydis, Sabjorn als jungem Sigurd und Cadfan als Vater Njörd mit blonder Perücke, Bogo und den Weg zur Großmutter sowie Gariths und Aurnias Trauerspiel mit den bestehenden Lebensdaten und einem Jahr zwischen beiden Todesfällen. Die Darsteller der Szenen entsprechen den Porträtreferenzen. Die Bühnenillustrationen besitzen echte transparente Klecksränder; ihre generierten Alphakanäle bleiben erhalten.

`theater-people.mjs` besitzt Personen und Identitäten, `theater-program.mjs` Stücke und Besetzung, `theater-hierarchy.mjs` Zuständigkeiten und Posten, `theater-rooms.mjs` Räume und Szenenvorgaben. `theater-module.mjs` setzt daraus den Eintrag zusammen. `theater-characters.mjs` erstellt einen reinen Importplan für 15 Profile. Vorhandene Profile behalten Namen, Text, Porträt, Besitz und Live-Daten; der Plan ist keine Veröffentlichung ins Charakterarchiv.

Das neue, wiederverwendbare [Theaterrepertoire-Template](../theatre-program/README.md) liegt getrennt von den konkreten Theaterinhalten. Zwei Stücke je Zeile auf breiten Flächen, eine Spalte auf schmalen; eigener per Tastatur erreichbarer Scrollbereich. Vier freie Plätze bleiben beim Sanitizer- und Editor-Rundlauf erhalten. Weitere Plätze lassen sich ergänzen. Modal- und Inline-Editor nutzen das vorhandene gemeinsame Zeilenschema.

29 aktive Bilder wurden mit **built-in image_gen** erstellt und unter [assets/gwynthor-theater](../../assets/gwynthor-theater) gespeichert: 14 Einzelporträts, neun Szenen einschließlich des gemeinsamen Freundinnenbilds, vier Bühnenillustrationen, Familienwappen und Geschäftsschild. [Vollständige Prompts](../../assets/gwynthor-theater/image-prompts.json), [Originalquellen und Prüfsummen](../../assets/gwynthor-theater/image-results.json), [Bildprüfung](../../assets/gwynthor-theater/image-audit.json) und [Alpha-Freigabe und Nachweis](../../assets/gwynthor-theater/sign-alpha-corrections.json) sind abgelegt. Originaldateien bleiben am Generator-Speicherort erhalten.

Das gewählte Wappen ist kreisrund: goldene Harfe mit silberner Feder auf Nachtblau, geschlossener Messingrahmen mit keltischen Knoten. Ausschließlich Alpha und transparenter Rand von Wappen und Geschäftsschild wurden nach ausdrücklicher Nutzerfreigabe technisch bereinigt; vorhandene RGB-Werte sind nachweislich erhalten. Innen deckend, außen transparent, mittig und ungefähr 87 Prozent Bildbreite. Das Normalisierungsskript liest für reproduzierbare Wiederholung die unveränderten Generatororiginale.

Prüfung: 23 gezielte Datentests, davon sieben Theater-Tests; allgemeine Template-Prüfung mit 33 Vorlagen und 36 Defaultseiten; alle 29 Bilddateien und Prüfsummen. Echte Browserprüfung: elf Seiten, zwölf Seiten einschließlich Kommentaren, vier Personalreiter, alle lokalen Bilder, vier Stücke und vier Leerplätze, neunter Eintrag, Modal- und Inline-Editor, Desktop- und Handy-Scrollen bis zum letzten freien Platz, 15 vorbereitete Charakterprofile sowie Stadt- und Institutsverweis. Externe Schreibzugriffe sind dabei blockiert. Abschließende Ergebnisse und Aufnahmen: `.tmp/gwynthor-theater/browser-1792195224757/`.

Reproduktion vom Projektstamm:

```powershell
node AleriaAlmanach/scripts/build-gwynthor-theater.mjs --check
node AleriaAlmanach/tests/gwynthor-theater.test.mjs
node AleriaAlmanach/tests/gwynthor-theater.browser.mjs
node AleriaAlmanach/scripts/check-module-template-assets.js
node AleriaAlmanach/scripts/check-module-template-roundtrip.js
python AleriaAlmanach/scripts/audit-theater-art.py
```

Das vollständige Modul liegt unter `Charakter Archiv Exporte/Module/Gwynthorer Theater/gwynthorer-theater-2026-10-17.json`, die Personenübersicht daneben als `ensemble-und-fuehrung.json`.

Sabjorn (23, Aldrimar) ist Sigruns Bühnenpartner. Der frühere Schlacht-Titel und das zugehörige Bild sind aus dem aktiven Repertoire entfernt. Das neue Bild verwendet die drei konkreten Darsteller als Referenzen; zwölf Prüfungstafeln und Cadfans blonde Perücke sind visuell geprüft. [Bildrevision](../../assets/gwynthor-theater/image-revisions.json).
