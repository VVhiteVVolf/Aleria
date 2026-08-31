# Karten-Migrationsbericht

## Celtigerns Wacht: Firebase nach GitHub

Geprueft am 2026-08-31.

Quellen:

- alter Firebase-/Legacy-Export:
  `karten-v2/data/legacy-export/cenyr-celtigerns-wacht.json`
- veroeffentlichter GitHub-Stand:
  `Karten/Cenyr/celtigerns-wacht/data.json`, Revision 5

Ergebnis des ID- und Inhaltsvergleichs:

| Pruefung | Ergebnis |
| --- | ---: |
| Pins im Legacy-Export | 99 |
| Pins im GitHub-Stand | 99 |
| nur im Legacy-Export | 0 |
| nur im GitHub-Stand | 0 |
| Kategorien je Stand | 20 |
| Marker-Katalog je Stand | 0 |

Alle 99 alten Pin-IDs sind im GitHub-Stand vorhanden. Beim rekursiven Vergleich
aller bereits im Legacy-Export vorhandenen Pinfelder weichen nur sechs
`region`-Werte ab. Diese sechs Pins sind im GitHub-Stand nicht verloren,
sondern besitzen weiterentwickelte Regionszuordnungen. Der GitHub-Stand fuehrt
darueber hinaus neue Felder und Funktionen, die der alte Export noch nicht
besass.

Damit ist der vorhandene Firebase-/Legacy-Bestand von Celtigerns Wacht fuer
Pins und Kategorien vollstaendig in die aktuelle GitHub-Fassung uebernommen.
Ein erneutes Ueberschreiben aus Firestore ist nicht erforderlich und wuerde
die spaeteren Ergaenzungen gefaehrden.

Der direkte Firestore-Leseversuch wurde zusaetzlich ueber REST und den
produktiven Browser-Origin durchgefuehrt. Firebase antwortet inzwischen mit
`permission-denied`; es wurde zu keinem Zeitpunkt nach Firebase geschrieben.
