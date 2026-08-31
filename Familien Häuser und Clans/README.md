# Familien Häuser und Clans

Dieser Bereich ist für langlebige Familien-, Haus- und Clanseiten gedacht. Er folgt dem Muster von Orte und Organisationen und Gruppen: zentrale Shell, eigene Registry, eigene Datendateien und später eigene Ordner pro konkreter Familie.

Startpunkt:

```text
haus.html?haus=haeuser-vorlage
kleinehaeuser.html?haus=kleinehaeuser-vorlage
```

Wichtige Dateien:

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
- `haeuser-storage.md` dokumentiert Speicherorte und IDs.
