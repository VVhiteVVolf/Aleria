# Familie Melog

Die Hausseite und die Stammbaum-Hausbio stammen gemeinsam aus `haus.content.mjs`.
`animexx-original.html` erhält den vom Nutzer am 5. November 2026 gelieferten
Quelltext und `melog-original.json` die nachgereichte vollständige Familienakte bytegleich.
`source-manifest.json` dokumentiert Herkunft, SHA-256,
Abdeckung und redaktionelle Entscheidungen.

Die vollständige JSON benennt Ithel (1647–1723) und seinen Sohn Tewdwr (1675)
als die zur Erzählung von 1690 passenden Meister. Sie enthält 18 Personen,
darunter zwei unbekannte Gründerplatzhalter, sechs Partnerschaften, elf
Abstammungsverbindungen und einen Zeitsprung. Die Hausseite verlinkt alle
16 namentlich bekannten Angehörigen mit ihren gelieferten Portraits. Die
unbekannten Gründer bleiben im Stammbaum und werden nicht zu benannten Figuren.
Die vom Nutzer freigegebene Jahreskorrektur löst die auffällige Altersfolge:
Afanen 1697, Llywarch 1696, Cerys 1731 und Iddon 1732; Lleufer bleibt 1716.
Die Begründung aus Generationen und tatsächlich angesehenen Portraits liegt
im Amendment der Familienquelle. Die Originale bleiben unverändert.
Die Bäckerfigur ist eine gestalterische Hausdarstellung. Die Quelle
bestimmt keine historische Portraitähnlichkeit und keine Zutatenliste der
ursprünglichen Hochzeitstorte.

Die neue Bäckerei und Konditorei ist über den Dokumentlink der Hausbio und über
die große Bäckerfigur erreichbar. Der kanonische Archiveinstieg lautet
`AleriaAlmanach/AleriaAlmanach.html?entry=zum-honigtoertchen`.
Die Hausseite nutzt die vorhandene kompakte Stammbaumeinbettung. Auf schmalen
Bildschirmen werden ihre Angehörigentafeln mit großen Portraits untereinander
angeordnet; Altseiten behalten ihre bisherige Darstellung.

Gezielter Build vom Projektstamm:

```powershell
node "Familien Häuser und Clans/scripts/build-house-content.mjs" --houses=melog
node "Familien Häuser und Clans/scripts/build-house-content.mjs" --houses=melog --check
node --test --experimental-test-isolation=none "Familien Häuser und Clans/tests/melog-house-page.test.mjs"
```

Der begrenzte Builder aktualisiert Hausdaten, Hausbio und die zugehörigen drei
Registereinträge. Fremde Hausquellen werden nicht neu ausgegeben. Die Fachprüfung
kontrolliert den Originalhash, Quellendetails, den Familiengraphen, lokale Bilder,
Stammbaumziele, Shopnavigation und das unveränderte Verhalten einer Altseite.
Eine gesonderte Browserprüfung betrachtet die tatsächliche Hausseite, Bio und
Stammbaumansicht auf Desktop und Mobil. Belege zum gemeinsamen Auftrag liegen
unter `diagnostics/melog-20261105/`.

Dieser Quellenimport veröffentlicht keine Website und schreibt keine
produktiven Spiel- oder Inventardaten.
