# Cenyr: Grafschaftskarten

Diese Datei sammelt die stabilen Kartenlinks fuer die Grafschaften von Cenyr.

Die meisten Eintraege sind vorerst `planned` und als `editableDraft` markiert. Das bedeutet: Der Link oeffnet bereits die Kartenoberflaeche, aber ohne eigene Bildlinks erscheint zuerst eine Platzhalterkarte.

Wenn du Imgur nutzt, muss keine lokale Bilddatei in Git liegen. Du kannst die drei Bildlinks direkt im Browser setzen: Bearbeiten -> Bilder.

| Grafschaft | Haus | Status | Karten-ID | Link | Geplanter Ordner |
| --- | --- | --- | --- | --- | --- |
| Celtigerns Wacht | Haus Draig | active | `cenyr-celtigerns-wacht` | `Karten/karte.html?map=cenyr-celtigerns-wacht` | `Karten/Cenyr/celtigerns-wacht` |
| Vortigerns Ruh | Koenigliche Grafschaft des Hauses Pendrag | planned | `cenyr-vortigerns-ruh` | `Karten/karte.html?map=cenyr-vortigerns-ruh` | `Karten/Cenyr/vortigerns-ruh` |
| Tal der Milane | Haus Aderyn | planned | `cenyr-tal-der-milane` | `Karten/karte.html?map=cenyr-tal-der-milane` | `Karten/Cenyr/tal-der-milane` |
| Sonnenkueste | Haus Illewod | planned | `cenyr-sonnenkueste` | `Karten/karte.html?map=cenyr-sonnenkueste` | `Karten/Cenyr/sonnenkueste` |
| Graue Weite | Haus Pysgod | planned | `cenyr-graue-weite` | `Karten/karte.html?map=cenyr-graue-weite` | `Karten/Cenyr/graue-weite` |
| Weidebucht | Haus Wylan | planned | `cenyr-weidebucht` | `Karten/karte.html?map=cenyr-weidebucht` | `Karten/Cenyr/weidebucht` |
| Aehrental | Haus Grawn | planned | `cenyr-aehrental` | `Karten/karte.html?map=cenyr-aehrental` | `Karten/Cenyr/aehrental` |
| Silberinsel | Haus Neidr | planned | `cenyr-silberinsel` | `Karten/karte.html?map=cenyr-silberinsel` | `Karten/Cenyr/silberinsel` |
| Klaueninseln | Haus Arth | planned | `cenyr-klaueninseln` | `Karten/karte.html?map=cenyr-klaueninseln` | `Karten/Cenyr/klaueninseln` |

## Aktivierung einer geplanten Grafschaft

Wenn eine Karte wirklich erstellt wird:

1. Kartenlink oeffnen
2. Bearbeiten aktivieren
3. `Bilder` oeffnen
4. Imgur-URLs fuer Karte, Regionen und Markierungen speichern
5. Pins, Kategorien und Marker wie gewohnt bearbeiten

Ein lokaler Ordner ist nur noetig, wenn du lokale Dateien oder eine eigene Config verwenden willst.

Wenn du die Bildlinks im Browser setzt, werden sie in Firebase gespeichert. Die Karte nutzt trotzdem ihre eigene Karten-ID und teilt keine Pins oder Marker-Daten mit anderen Karten.
