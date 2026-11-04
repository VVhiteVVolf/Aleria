# Perllan — Quellenübernahme vom 4. November 2026

Der Nutzer beauftragte die vollständige Einbindung der Familie aus seinem
Downloadordner `Perllan`. Vor der Übernahme wurden Register, Personenidentitäten,
Originalporträts sowie Namen mit Geburtsjahren abgeglichen. Beim anfänglichen
lokalen Bestandsabgleich lag keine Perllan-Akte vor. Der vor dem Release neu
hinzugekommene Web-Publish wird unter seiner bestehenden ID fortgeführt, siehe
die nachfolgende Identitätsentscheidung. Rhosyn Awenydd (1723) bleibt wegen ihrer anderen Eltern und ihres
anderen Porträts eine getrennte Namensgleiche.

`family.json`, `manifest.json`, die leere `Perllan.html` und alle 29 Bilddateien
sind unveränderte Originalquellen. `inventory.json` enthält ihre SHA-256-Prüfsummen
und die Pfade der ebenfalls bytegleich übernommenen aktiven Bilder. Die 27
Porträts zeigen 27 benannte Personen; die übrigen 17 Personenknoten sind 15
unbenannte Partner sowie zwei Gründerplatzhalter. Alle Personen- und Welt-IDs,
Datumswerte, Lebensstatus, 16 Partnerschaften, 27 Abstammungen und die Darstellung
bleiben erhalten. Die Gründer verbinden sich bereits in der Quelle über einen
Zeitsprung mit der belegten Linie; daraus folgt keine belegte lückenlose
biologische Elternkette.

Die verwaltete Akte führt die bestehende kanonische ID `perllan` fort; die interne
Haus-ID bleibt `house-perllan`. Der unmittelbar vor dem gemeinsamen Release
erfolgte Web-Publish des Nutzers (Commit `ec32389e89f88bd9b754da93862d933344b03066`)
enthält dieselben 44 Quellpersonen unter dieser ID. Die zuvor nur lokal entworfene
ID `haus-perllan` wird verworfen; es entsteht weder eine zweite Familienakte noch
ein Alias. Originaldateien und historische Bildprüfsummen bleiben unverändert.
Die belegte Herkunft Gwynthor wird im bestehenden Register unter
Cenyr → Celtigerns Wacht → Llamreis Ankunft → Gwynthor geführt. Stand bürgerlich,
Kultur Cenyri, Alerische Kirche, Gründung um 1240 und Waldgrün stammen aus dem
Generatorprofil. Ein genauer Hof, ein Lehnsherr und ein Wahlspruch sind nicht
überliefert. Das leere HTML liefert keine zusätzliche Hausgeschichte.

Die Bildprüfung belegt zwei unbenannte Tiere bei Onn (Eichhörnchen und
Rotkehlchen) und zwei bei Lili (Kaninchen und Blaumeise). Die Einbindung hält
deren Bildbeleg und Besitzerzuordnung fest; Namen, Spielwerte und Fähigkeiten
werden daraus nicht abgeleitet. Gwern und Draenen teilen ein identisches
Originalporträt, bleiben jedoch getrennte Personen.

`import-source.mjs` ist die begrenzte wiederholbare Übernahmemethode. Ohne
Argument prüft sie die erhaltenen Originale; mit einem Quellordner als Argument
übernimmt sie dieselben geprüften Dateien. Abweichende vorhandene Dateien werden
abgelehnt. Der erzeugte Familienbaustein ergänzt die aus denselben Personen
abgeleiteten statischen Charakterbiografien aus
`perllan-person-biographies.generated.js`. Die Biografiekarte wird durch den
begrenzt auf Perllan arbeitenden Charaktergenerator erzeugt.

Die Originalquellen gehören zum Quellenarchiv, nicht zum statischen
Auslieferungspaket. Aktive Bilder liegen separat unter
`assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Perllan/`.
