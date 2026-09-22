# Wolfshorn: Ylva, Asgeir und Freki

Ausgearbeitet am 22. September 2026. Der Nutzer hat die Veröffentlichung einschließlich gezielter Firebase-Übernahme während des laufenden Gildas–Gawain-Duells ausdrücklich freigegeben. Dessen bestehende Würfe, Lebenspunkte, Ressourcen und Effekte bleiben erhalten.

| Figur | Bestehende / feste ID | Klasse / Art | Stufe | TP | RK |
| --- | --- | --- | --- | --- | --- |
| Ylva Wolfshorn | `bSYZYAEOwiRgy44f6OmO` | Skytte | 7 | 75 | 12 |
| Asgeir Wolfshorn / Bleiddorn | `oUlhJyX6C4Q69mtLS9u1` | Skjaldr | 7 | 94 | 14 |
| Freki | `companion-ylva-freki` | Gramnir · Nordwolf | 4 | 38 | 13 |

Beide Charaktere hatten bislang keinen gespeicherten Kampfbogen und ausschließlich die Standard-Inventarplatzhalter. Namen, Porträts, Emotes, Familienverknüpfungen und bestehende IDs bleiben erhalten. Asgeir Bleiddorn ist ein Alias desselben Charakters. Die Platzhaltergegenstände und Platzhaltergefährten wurden durch tatsächliche Ausrüstung ersetzt; Geld wurde nicht hinzugefügt.

## Charakterausbildung

Standard-Array und Herkunft Aldrimarer (+2 KRF, +1 KON); auf Stufe 4 erhalten beide insgesamt zwei Attributspunkte. TP verwenden die zentrale Durchschnitts- und Vitalitätsregel. Gemäß vorhandener Rüstungsroutine zählt GES in angelegter Rüstung erst ab Stufe 12. Beide haben auf Stufe 7 je eine Aktion, Bonusaktion und Reaktion sowie zwei Besondere Aktionen. Keine Magie und keine erfundenen zusätzlichen Ressourcen.

| Figur | KRF | GES | KON | INT | WEI | CHA |
| --- | --- | --- | --- | --- | --- | --- |
| Ylva | 12 | 17 | 14 | 8 | 14 | 12 |
| Asgeir | 18 | 13 | 16 | 8 | 10 | 12 |

**Ylva:** Wolfshorn-Langbogen (1W8 Stich, Angriff +7 einschließlich Auge des Jägers), Jagdspeer (1W6 / zweihändig 1W8 Stich), Handaxt (1W6 Hieb), verstärkte Jagdleder-Rüstung und 30 verknüpfte Jagdpfeile. Fünf Ausbildungsplätze: Erster Jagdpfeil, Speer am Wildpfad, Sax im Unterholz (mit ihrer Handaxt nutzbar), Grenzwächterschuss und Abstand mit dem Speer. Der Bogenbonus gehört der Klasse und wird beim Übertragen des Bogens nicht als Gegenstandsbonus weitergegeben.

**Asgeir:** zwei getrennt geführte Einhandäxte (je 1W6 Hieb), lange Streitaxt (1W12 Hieb), Schuppenpanzer sowie ein alternativ anlegbarer Rundschild (+2 RK). Sieben Ausbildungsplätze: Kurzer Axthieb, Gebändigter Stand, Langer Spalthieb, Doppelter Axtgriff, Haken hinter den Schild, Hieb des Schildbeißers und Gekreuzte Axtwende. Doppelaxtführung gewährt keinen kostenlosen weiteren Angriff. Schildtechniken verlangen das Ablegen der Nebenhandwaffe; schwere Techniken beide freien Hände und eine passende Waffe.

Asgeirs Berserkergang folgt der gemeinsamen Skjaldr-Staffel: Stufe 7 verwendet Entfesselter Zorn, einmal täglich, Aktivierung Bonusaktion + Reaktion, +2 KRF, +1W4 Waffenschaden, −4 RK und 1W12 + KON temporäre TP. Weitere Regeln einschließlich Überlebensschutz und Ende der Raserei bleiben im vorhandenen Klassenmodul.

## Gefährte

Freki ist ein vom Clan Wolfshorn seit dem Welpenalter domestizierter Gramnir, von Ylva als Jagd- und Wachgefährte ausgebildet. Wachsam, eigenwillig, Fremden gegenüber distanziert, mit enger Bindung zu Ylva. Rassenquelle: [lokaler Bestiarium-Eintrag](../../../Bestiarium/tiere/raubtiere/woelfe/gramnir/profil.json), entsprechend der vom Nutzer genannten Webseite. Bild: `https://i.imgur.com/jO6WUgH.png`.

Die Stufe-4-Werte sind eigens für diesen Gefährten ausgearbeitet, keine aus dem Bestiarium übernommenen Kampfzahlen: KRF/GES/KON/WEI 14, INT 3, CHA 8; **38 TP** (bisher 26 Basis + 7 Vitalität = 33, auf Nutzerwunsch einmalig +15 %, aufgerundet), RK 13, Bewegung 12 m, Biss +4 / 1W6+2 Stich. Spürnase, Handzeichen und Winterfell beschreiben seine Ausbildung und natürlichen Eigenschaften; sie gewähren keine unbegrenzten Kampfboni oder Kälteresistenz. Freki handelt als eigene Kreatur mit eigenen Ressourcen, sobald er in der Szene anwesend ist.

Sechs zusätzliche, direkt nutzbare Kampfoptionen:

| Option | Kosten | Wirkung |
| --- | --- | --- |
| Schneller Fang | Bonusaktion | 1W4+2 Stich, Angriff +4 |
| Fesselbiss | Aktion + Reaktion | 1W6+2 Stich; nach Treffer KRF-SG 12, bei Fehlschlag −2 m Bewegung für einen eigenen Beitrag |
| Wuchtiger Jagdsprung | Aktion + Besondere Aktion | 2W6+2 Stich; kein kostenloses Umwerfen oder zusätzliche Bewegung |
| Flankenlauf | Bonusaktion + Reaktion | +3 m Bewegungsbudget für einen eigenen Beitrag |
| Geduckte Wacht | Reaktion | +2 RK für einen eigenen Beitrag, vor künftigen Angriffen einzusetzen |
| Zäher Nordwolf | Bonusaktion + Besondere Aktion | 1W6+2 temporäre TP; kein Stapeln und keine Heilung |

Der natürliche RK-Wert wird als 11 + GES 2 berechnet, damit zeitweilige Abwehrzustände tatsächlich wirken. Freki besitzt weiterhin zwei Besondere Aktionen täglich. Ein Aura-Ersatz der Kosten ist für seine Manöver gesperrt.

Die Erweiterung wurde zusammen mit Klassenkatalog, generierten Seiten, Kampfauswertung, Aktionsökonomie, Ressourcen und Kreaturmodell geprüft: **81 Tests erfolgreich**, Produktionsbuild erfolgreich. Der Kreaturexport enthält dieselben Werte und Fähigkeiten wie der Katalog. Vorhandene Online-Kreaturen müssen beim später freigegebenen Release gezielt abgeglichen werden; weder eine erneute prozentuale TP-Erhöhung noch ein Zurücksetzen inzwischen verbrauchter Ressourcen ist vorgesehen.

Inventargegenstand `ylva-freki`, Gefährtenansicht und Kreaturbogen verwenden dieselbe Kreatur-ID und Besitzverknüpfung. Es erscheint nur eine Gefährtenkarte. Sein Kreaturbogen ist im bestehenden Katalog und zusätzlich als importierbare Datei unter `Charakter Archiv Exporte/gefaehrten/freki-gramnir.json` enthalten.

## Ausrüstung und spätere Übernahme

Vorhandene Registerbilder und Preise wurden für Bogen, Äxte, Rüstungen und Schild übernommen. Handaxtwert 400 KT, Jagdspeer 200 KT und Jagdpfeil 1 KT sind ausdrücklich Schätzungen; keine erfundenen Kaufbelege. Freki hat keinen Handelspreis. Inventar und Kampfausrüstung sind über die gemeinsame Ausrüstungssynchronisation verbunden.

Beim freigegebenen Release die beiden Charakterexporte auf die **bestehenden IDs** übernehmen und Freki unter seiner festen Kreatur-ID bereitstellen. Neuere Online-Biografie, Bilder, Inventarbesitz und laufende Kampfzustände vor der Übernahme vergleichen und erhalten. Ein Code-Push allein ersetzt bestehende Online-Inventarplatzhalter nicht. Der vorhandene Kreaturkatalog kann Freki bei Verwendung materialisieren; sein Besitz muss mit Ylvas Inventareintrag übereinstimmen. Keine automatische Migration beim Seitenaufruf ergänzen.

Prüfung: `node --experimental-test-isolation=none --test AleriaAlmanach/tests/wolfshorn-combat-sheets.test.mjs`.

Neun gezielte Tests erfolgreich, einschließlich Browser-/Server-Regelgleichheit, echter Kampfauswertung mit Pfeilverbrauch, Inventarrückübertragung und Archividentität. Produktionsbuild erfolgreich. Die ergänzende Regressionsauswahl ergab 84 erfolgreiche Tests und einen unabhängigen Fehler in `armor-routine.test.mjs`: Der Archiv-Klasseneintrag Grungar wird von der unveränderten Liste der Rüstungsroutine-Klassen nicht erkannt. Dieser allgemeine Klassenabgleich gehört nicht zur Vergabe der beiden Wolfshorn-Bögen und bleibt separat offen.
