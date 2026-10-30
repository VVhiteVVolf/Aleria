# Gwrgan Cochdon gegen Lleucu Swyll

Vierseitige öffentliche Verlautbarung am neuen Gerichtsplakat auf Gwynthors Anzeigetafel. Termin: **in zwei Tagen, zur dritten Morgenstunde**, im Gerichtssaal am gräflichen Hof zu Gwynthor. Kein Questauftrag und kein vorweggenommenes Urteil.

1. Neithon Draig: Verlautbarung mit Parteien, Vorgeschichte, Streitgegenständen und Termin.
2. Gethin Falchdyn: Sachvortrag für Gwrgan, Herausgabe, Rechnungslegung, Entschädigung und Ehefolgen.
3. Valeriano Falto: Erwiderung für Lleucu, Testament, eigene Erwerbsleistungen und Schutz der anerkannten Ehe und Kinder.
4. Gerichtskanzlei: vollständige Gerichtsbesetzung und Verfahrensordnung.

Quellmodell: `Anzeigetafeln/tools/notices/gwrgan-gegen-lleucu.mjs`. Die vorhandene gemeinsame Paketgenerierung bindet alle vier Blätter mit stabilen IDs ein. Das neue Papier wird in gespeicherten Anordnungen einmalig ergänzt; bestehende Positionen, Texte, Kommentare sowie spätere bewusste Löschungen bleiben erhalten.

## Bildmaterial

Mit **built-in image_gen** erstellt, passend zu den vorhandenen warmen, gezeichneten Pergamentplakaten:

- [Gerichtsplakat](gericht-plakat-v2.png)
- [Waage und Gerichtsrolle](gericht-icon-v1.png)
- [Heimkehr aus Gefangenschaft](heimkehr-icon-v1.png)
- [Reederei und Geschäftsbuch](reederei-icon-v1.png)
- [Gethins Unterschrift](gethin-falchdyn-unterschrift-v1.png)
- [Valerianos Unterschrift](valeriano-falto-unterschrift-v1.png)

Neithons vorhandene Unterschrift und das Verwaltungssiegel werden wiederverwendet. Kleine WebP-Fassungen für die Ansicht und Plakatminiaturen entstehen mit `python -X utf8 Anzeigetafeln/tools/build-gwrgan-lleucu-art.py`; die ausgewählten PNG-Originale bleiben als Downloads erhalten. Vollständige [Prompts und Referenzen](generation-prompts.json), [Bildgrößen und Prüfsummen](image-results.json). Der verworfene erste Plakatversuch bleibt unter `diagnostics/gwynthor-erbstreit-2026-10-30/` erhalten.

## Familienkorrektur

Bei Swyll stehen Gwrgan, Lleucu und Eifion nun als geschlossene Ehegruppe zusammen; darunter enden beide Beziehungen an ihren Wappenverknüpfungen. Die Kinder erscheinen erst im Twyllod-Baum. Auch ältere gespeicherte Swyll-Akten erhalten diese Korrektur über den bestehenden Registerabgleich.

Der Twyllod-Hof wird von Meirion und Anest weiterbewirtschaftet. Mit Cledwyn, Delyth, Gwenllian, Dewi und dem kleinen Bledri ist eine fortlebende Hoflinie ergänzt. Glendower ist sichtbar über eine gestrichelte soziale Verbindung zu Arian; seine getrennt gespeicherte biologische Herkunft macht Arian ausdrücklich nicht zum leiblichen Vater. Die Familienbeschreibung folgt Glendowers bestehender Biografie und dem bereits kartierten Fischerhof. Seine Charakterakte bleibt unverändert.

104 Daten- und Integrationstests bestanden. Im Browser geprüft: kompakte Ehegruppe, sichtbarer Paladin-Zweig, vierseitiger Aushang, sämtliche Unterschriften und Bilder, Seitenwechsel und Mobilansicht ohne horizontales Überlaufen. Prüfbelege und Bildschirmbilder unter `diagnostics/gwynthor-erbstreit-2026-10-30/`. Lokale Einbindung; kein neuer Push oder Deploy.
