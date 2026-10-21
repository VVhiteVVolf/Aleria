# Handschriften für Alerias Aushänge

Die sieben unveränderten Originalschriften werden lokal ausgeliefert. Es gibt
keine Laufzeitverbindung zu einem externen Fontdienst. Jede Schrift liegt mit
ihrer eigenen `OFL.txt` vor; Herkunft, genaue Upstream-Revision, Originaldateiname
und SHA-256-Prüfsumme stehen in [manifest.json](manifest.json).

| Schrift | Auswahl im Aushang |
| --- | --- |
| Patrick Hand | Klare Handschrift |
| Kalam | Ruhige Alltagshand |
| Caveat | Flüchtige Notiz |
| Dancing Script | Elegante Schreibschrift |
| La Belle Aurore | Unregelmäßige Feder |
| Beth Ellen | Krakelige Handschrift |
| Monsieur La Doulaise | Wilde Schnörkel · schwer lesbar |

Quelle: [offizielles Google-Fonts-Repository](https://github.com/google/fonts).
Die Lizenztexte gehören jeweils zur Schrift und bleiben neben ihr erhalten.
Die Dateinamen `regular.ttf` vereinheitlichen lediglich die Ablage; die
Schriftdateien selbst sind bytegleich zu ihren im Manifest verlinkten Originalen.

Offline prüfen:

```sh
node Anzeigetafeln/tools/vendor-notice-handwriting.mjs --check
```

Die Ausführung ohne `--check` aktualisiert den Bestand aus dem offiziellen
Repository und ist ein bewusster Wartungsschritt, kein Teil des Website-Builds.
