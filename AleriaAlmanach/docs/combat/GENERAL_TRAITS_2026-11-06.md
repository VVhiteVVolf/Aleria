# 30 allgemeine Eigenschaften vom 6. November 2026

Quelle: `modules/character-development/development-general-traits.js`.
Alle Werte sind kleine, allgemeine Probenmodifikatoren. Sie vergeben keine
Fertigkeitenausbildung, Expertise, Ausrüstung, zusätzlichen Aktionen oder
Resistenzen. Typische Änderungen betragen ±1; +2 auf eine einzelne Fertigkeit
ist bewusst selten. Die Punkte folgen den bestehenden normalen Traits:
ein kleiner Vorteil mit vergleichbarem Nachteil meist 0, zwei kleine Vorteile
mit einem Nachteil meist 1. Die reine Einschränkung Leichtgläubig und das
Nachteilspaket Zerstreute Gedanken geben je einen Punkt zurück.

Die Merkmale sind frei kombinierbare Beschreibungen. Gegensätzliche Gewohnheiten
sollten zur Figur passen; ihre Zahlen heben sich gegebenenfalls auf. Viele
ähnliche kleine Boni addieren sich weiterhin nach den bestehenden Regeln und
werden durch den vorhandenen Balancehinweis sichtbar. Es entstehen keine
verdeckten Bedingungen: Eine Beschreibung wie „laute Stimme“ ist hier ein
allgemeiner Heimlichkeitsabzug und kein nur bei gesprochenen Worten automatisch
geprüfter Filter.

| Eigenschaft | Bonus | Malus | Punkte |
| --- | --- | --- | ---: |
| Ruhiger Atem | Körperbeherrschung +1, Heimlichkeit +1 | Initiative −1 | 1 |
| Kraftvoller Griff | Athletik +1 | Fingerfertigkeit −1 | 0 |
| Behutsame Hände | Fingerfertigkeit +1, Heilkunde +1 | Initiative −1 | 1 |
| Federnder Gang | Akrobatik +1, Bewegung +1 m | Heimlichkeit −1 | 1 |
| Schwere Schritte | Körperbeherrschung +1 | Heimlichkeit −1 | 0 |
| Leiser Tritt | Heimlichkeit +1 | Bewegung −1 m | 0 |
| Lautes Organ | Auftreten +1, Einschüchtern +1 | Heimlichkeit −1 | 1 |
| Flüsterstimme | Heimlichkeit +1 | Einschüchtern −1 | 0 |
| Zäher Marsch | Athletik +1, Körperbeherrschung +1 | Bewegung −1 m | 1 |
| Hastiger Schritt | Bewegung +1 m | Akrobatik −1 | 0 |
| Geduldiger Beobachter | Wahrnehmung +1, Nachforschungen +1 | Initiative −1 | 1 |
| Rascher Entschluss | Initiative +1 | Nachforschungen −1 | 0 |
| Umsichtig | Nachforschungen +1, GES-Rettung +1 | Initiative −1 | 1 |
| Tunnelblick | Nachforschungen +2 | Wahrnehmung −1 | 1 |
| Zerstreute Gedanken | — | Nachforschungen −1, Geschichte −1 | −1 |
| Wissensdurst | Geschichte +1, Naturkunde +1 | Wahrnehmung −1 | 1 |
| Naturverbundener Pragmatiker | Naturkunde +1 | Arkane Kunde −1 | 0 |
| Geübtes Schätzen | Nachforschungen +1, Wahrnehmung +1 | — | 1 |
| Unerschütterliche Ruhe | Körperbeherrschung +1, Furchtrettung +1 | Initiative −1 | 1 |
| Nervöser Antrieb | Initiative +1 | Furchtrettung −1 | 0 |
| Warmherzig | Überzeugen +1, Motiv erkennen +1 | Einschüchtern −1 | 1 |
| Strenger Blick | Einschüchtern +1 | Flirten −1 | 0 |
| Trockener Humor | Auftreten +1 | Flirten −1 | 0 |
| Skeptischer Zuhörer | Motiv erkennen +1, Täuschen +1 | Überzeugen −1 | 1 |
| Leichtgläubig | — | Motiv erkennen −2 | −1 |
| Streitlustig | Einschüchtern +1 | Überzeugen −1 | 0 |
| Harmoniebedürftig | Überzeugen +1 | Einschüchtern −1 | 0 |
| Schelmisch | Täuschen +1, Auftreten +1 | Überzeugen −1 | 1 |
| Pedantisch | Nachforschungen +1, Geschichte +1 | Überzeugen −1 | 1 |
| Pflichtbewusst | CHA-Rettung +1 | Täuschen −1 | 0 |

`GENERAL_TRAIT_ICONS` benennt auf Folgeauftrag für jedes Merkmal sein eigenes
neu generiertes Comicicon. Bilddatei und Merkmalskennung verwenden dieselbe ID.
Die [Iconübersicht](../../../diagnostics/creation-icons-20261106/README.md)
enthält Motive, Originale, vollständige Prompts und Prüfbelege.

`tests/character-development-general.test.mjs` prüft 30 neue Namen und
Rechenoptionen gegenüber dem vorhandenen Katalog, jeden Fertigkeitswert, jede
Attributsrettung mit und ohne Furcht, Initiative, Bewegung sowie den Erhalt
von Grundausbildung, Besitz, Identität und laufenden Ressourcen.
