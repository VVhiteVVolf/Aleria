# Lotsensuche · Schreib- und Bildmaterial

Eigenes Blutbund-Wachssiegel nach dem vorhandenen Faustmotiv, Wegweiser-Icon,
Namenszeichen von Vébrand sowie ein handbeschriebenes Plakat.
Alle Motive wurden mit dem eingebauten Bildwerkzeug erzeugt. Die PNGs sind
erhaltene Originale; WebP-Dateien sind beschnittene und verkleinerte
Darstellungsfassungen ohne Neuzeichnung. `lotsen-plakat-v2.png` ist das
ausgewählte vollständige Plakat.

`python Anzeigetafeln/tools/build-lotsensuche-art.py` erzeugt die
Darstellungsfassungen und aktualisiert den Bildkatalog. Anschließend erstellt
`node Anzeigetafeln/tools/build-lotsensuche.mjs` den Tafelverweis und den
Aushangpack; `--check` prüft ihn ohne Schreibzugriffe.

Die zwei eigenständig kommentierten Blätter gehören zu einem gemeinsamen
Anschlag. Der erste ist angenommen und wird mit seinen alten Antworten grau
angezeigt. Der zweite bleibt offen. Vébrand schreibt in Schoolbell, Rob in
Kalam; beide Schriften werden lokal geladen.
