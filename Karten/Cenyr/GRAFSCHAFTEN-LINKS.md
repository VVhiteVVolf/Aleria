# Cenyr: Grafschaftskarten

Diese Datei sammelt die stabilen Kartenlinks fuer die Grafschaften von Cenyr.

Die meisten Eintraege sind vorerst `planned`. Das bedeutet: Der Link existiert bereits, aber Bilder und Config werden erst spaeter ergaenzt.

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

1. den geplanten Ordner anlegen
2. Config ergaenzen
3. Imgur-URLs oder lokale Bildpfade in der Config/Registry eintragen
4. Registry-Status von `planned` auf `active` setzen
5. `node Karten/tools/validate-karten-structure.mjs` ausfuehren
