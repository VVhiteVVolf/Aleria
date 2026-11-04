# Familien Häuser und Clans

Dieser Bereich ist für langlebige Familien-, Haus- und Clanseiten gedacht. Er folgt dem Muster von Orte und Organisationen und Gruppen: zentrale Shell, eigene Registry, eigene Datendateien und später eigene Ordner pro konkreter Familie.

Startpunkt:

```text
haus.html?haus=haeuser-vorlage
kleinehaeuser.html?haus=kleinehaeuser-vorlage
```

Wichtige Dateien:

- [Quellinventar der autorisierten Lorekorrekturen vom 4. November 2026](../Stammbäume/assets/data/source-inventories/house-lore-corrections-20261104.json) dokumentiert 71 gezielte Felder in 28 Familienakten und 30 Hausquellen für Leitheach, Cenyr und Aldrimar bei 15 geschützten Kinderankern. Die [Cenyr-](../diagnostics/house-lore-fixes-20261104/cenyr-changes.json), [Leitheach-](../diagnostics/house-lore-fixes-20261104/leitheach-changes.json) und [Aldrimar-Belege](../diagnostics/house-lore-fixes-20261104/aldrimar-changes.json) ergänzen die unveränderten ursprünglichen Importbaselines. 250 Tests sind bestanden; Browserstatus bleibt wegen des CUA-`timeoutMs`-Fehlers eingeschränkt. Die übrigen [20 Gegenaktenabweichungen](../diagnostics/house-lore-fixes-20261104/remaining-twenty-counterparts.json) werden nur aufgelistet. Keine Veröffentlichung aus diesem Auftrag.

- [Leitheach-Clanübernahme](docs/LEITHEACH_CLAN_IMPORT.md) dokumentiert 29 Hausseiten und Bios, drei historische Hausverwaltungen mit belegten Überlebenden, 26 unveränderte Originaldarstellungen und drei Ergänzungen mit menschlichen Ohren in Bildrevision v2. 115 Node- und vier Wartungstests, die 31 betroffenen Tests nach v2 und beide begrenzten Generatorprüfungen sind bestanden; Browserstatus bleibt `limited`. Drei überholte Bildkopien wurden entfernt, Quellen und Tooloriginale erhalten. [Diagnoseindex und finale Bildbelege](../diagnostics/leitheach-clans-20261103/README.md) verweisen auf aktuelle Prompts, Bildhashes und die nachvollziehbare v1-Provenienz.

- [Kronental / Heldenwacht – Clanübernahme](docs/KRONENTAL_CLAN_IMPORT.md) dokumentiert 29 Hausseiten und Bios, 19 erhaltene Originalbilder und elf ergänzte Darstellungen sowie den Schutz bestehender Akten und der beiden Altseiten. 105 Tests und die lokale Browserprüfung sind bestanden.

- [Krähenmoor-Clanübernahme](docs/KRAEHENMOOR_CLAN_IMPORT.md) dokumentiert 26 Hausseiten und Bios, 13 unveränderte Originaldarstellungen und 13 ergänzte Hausfiguren bei unveränderten Bestandsakten. 93 Tests und die lokale Browserprüfung sind bestanden.

- [SCHWARZFENN-2026-11-03.md](SCHWARZFENN-2026-11-03.md) dokumentiert Wolfsklamms elf Clans im kanonischen Jarltum Schwarzfenn, ihre Originalfiguren und den Erhalt aktueller Ränge, Familienakten und historischer Einordnungen.

- [IVARSHEIM-2026-11-03.md](IVARSHEIM-2026-11-03.md) dokumentiert zwölf übernommene Häuser und den neuen Clan Hrafnvald mit unveränderten Altakten, zwölf Originalfiguren und neuer Heraldik und Hausdarstellung.

- [RORIKSHEIM-2026-11-03.md](RORIKSHEIM-2026-11-03.md) dokumentiert 33 Clanseiten und Hausbios einschließlich fünf ausgestorbener Clans, 19 übernommener Originalfiguren und 15 ergänzter Hausdarstellungen.

- [CENYR-VOLLSTAENDIGKEIT-2026-11-03.md](CENYR-VOLLSTAENDIGKEIT-2026-11-03.md) dokumentiert die vollständige Abdeckung von 276 öffentlichen Cenyr-Familien mit Hausseite, Biografie, tatsächlichem Stammbaum-Iframe und Hausdarstellung sowie die begrenzte Pflegeprüfung.

- [KLAUENINSEL-2026-11-03.md](KLAUENINSEL-2026-11-03.md) dokumentiert 37 Hausseiten und Bios mit getrennten Vennyr-Ursprungsakten, 15 erhaltenen Originalmotiven und 21 neuen Hausfiguren.

- [GRAUE-WEITE-2026-11-03.md](GRAUE-WEITE-2026-11-03.md) dokumentiert 15 lokale Hausseiten mit unveränderten Originalfiguren, getrennten Vennyr-Herkunftsakten und dem begrenzten Hausseiten-Build.

- [SONNENKUESTE-2026-11-03.md](SONNENKUESTE-2026-11-03.md) dokumentiert 28 Hausseiten und Bios, acht aktive Originalfiguren, 20 aktive Ergänzungen und die vier Jungferntal-Ritterhäuser einschließlich Caerwen und Nerwynn.

- [WEIDEBUCHT-2026-11-03.md](WEIDEBUCHT-2026-11-03.md) dokumentiert zehn lokale Hausseiten und Bios mit neun unveränderten Originaldarstellungen und einer ergänzten bürgerlichen Figur.

- [SILBERINSEL-2026-11-03.md](SILBERINSEL-2026-11-03.md) dokumentiert 18 Hausseiten mit Bios, sieben übernommenen und elf neu erzeugten Darstellungen sowie den Vorrang aktueller Orts- und Hausdaten.

- [AEHRENTAL-2026-11-03.md](AEHRENTAL-2026-11-03.md) dokumentiert zwölf lokale Hausseiten und Bios mit aktuellen kanonischen Metadaten, bestehenden Stammbaum-Iframes und dreizehn Bildpositionen.

- [TAL-DER-MILANE-2026-11-03.md](TAL-DER-MILANE-2026-11-03.md) dokumentiert 19 neue Hausseiten, Bios und Bildzuordnungen mit unveränderten bestehenden Stammbaum-Iframes.

- [VORTIGERNS-RUH-2026-10-24.md](VORTIGERNS-RUH-2026-10-24.md) dokumentiert die 17 lokal ergänzten Hausseiten, übernommenen Originalbilder und neuen Darstellungen. Push und Deploy sind vorläufig gestoppt.

- [CELTIGERNS-WACHT-2026-10-24.md](CELTIGERNS-WACHT-2026-10-24.md) beschreibt den aktuellen Ausbau auf 92 Familien, ausgefüllte Bios und den neu freigegebenen Hausfigurenstil.

- `haus.html` ist die zentrale Vorlagenseite für größere Häuser, Familien und Clans.
- `kleinehaeuser.html` ist die sekundäre Vorlage für kleinere Häuser, Bürgerfamilien, Nebenlinien und kleinere Clans.
- `haeuser.registry.js` registriert konkrete Häuser, Familien und Clans.
- Jeder Registry-Eintrag besitzt einen eigenen `contentData`-Pfad für den veröffentlichten GitHub-Stand der Direktbearbeitung.
- `data/haeuser-vorlage.data.js` ist die Datenbasis für die Vorlage.
- `data/kleinehaeuser-vorlage.data.js` ist die Datenbasis für die kleine Vorlage.
- `assets/js/haeuser-loader.js` lädt Registry und Datendatei.
- `assets/js/haeuser-storage.js` konfiguriert lokale Entwürfe und die explizite GitHub-Veröffentlichung.
- `assets/js/haeuser-page.js` rendert strukturierte Vorlagendaten.
- `assets/css/haeuser.css` enthält die featurebezogenen Styles.
- `NEUES-HAUS.md` dokumentiert neue konkrete Eintraege.
- [HAUSSEITEN-VORGEHEN.md](HAUSSEITEN-VORGEHEN.md) beschreibt die gemeinsame Erstellung von Hausseite und Stammbaum-Bio, beginnend mit Haus Draig.
- [CELTIGERNS-WACHT-HAUSSEITEN.md](CELTIGERNS-WACHT-HAUSSEITEN.md) dokumentiert die sieben weiteren Hausseiten, Quellenentscheidungen und die gemeinsamen Darstellungsregeln.
- `haeuser-storage.md` dokumentiert Speicherorte und IDs.
