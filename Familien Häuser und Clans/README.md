# Familien Häuser und Clans

Dieser Bereich ist für langlebige Familien-, Haus- und Clanseiten gedacht. Er folgt dem Muster von Orte und Organisationen und Gruppen: zentrale Shell, eigene Registry, eigene Datendateien und später eigene Ordner pro konkreter Familie.

Startpunkt:

```text
haus.html?haus=haeuser-vorlage
```

Wichtige Dateien:

- `haus.html` ist die zentrale Vorlagenseite.
- `haeuser.registry.js` registriert konkrete Häuser, Familien und Clans.
- `data/haeuser-vorlage.data.js` ist die Datenbasis für die Vorlage.
- `assets/js/haeuser-loader.js` lädt Registry und Datendatei.
- `assets/js/haeuser-page.js` rendert strukturierte Vorlagendaten.
- `assets/css/haeuser.css` enthält die featurebezogenen Styles.
- `NEUES-HAUS.md` dokumentiert neue konkrete Eintraege.
- `haeuser-storage.md` dokumentiert Speicherorte und IDs.
