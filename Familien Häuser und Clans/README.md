# Familien Häuser und Clans

Dieser Bereich ist für langlebige Familien-, Haus- und Clanseiten gedacht. Er folgt dem Muster von Orte und Organisationen und Gruppen: zentrale Shell, eigene Registry, eigene Datendateien und später eigene Ordner pro konkreter Familie.

Startpunkt:

```text
haus.html?haus=haeuser-vorlage
kleinehaeuser.html?haus=kleinehaeuser-vorlage
```

Wichtige Dateien:

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
