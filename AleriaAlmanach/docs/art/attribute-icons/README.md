# Attributsmedaillons

Sechs eigenständig mit dem integrierten `image_gen` erzeugte Attributsicons im vorhandenen handgemalten Fantasy-Medaillonstil. Die Fertigkeitsicons Athletik, Motiv erkennen und Körperbeherrschung dienten als tatsächlich angesehene Stilreferenzen. Vollständige Prompts: [prompts.json](prompts.json).

Die PNG-Originale liegen hier. Das Projekt verwendet die auf 96 × 96 Pixel verkleinerten, verlustfrei kodierten WebP-Dateien unter `public/assets/attribute-icons`. Der erzeugte Alphakanal bleibt erhalten. Die sechs Laufzeitdateien benötigen zusammen rund 86 KB; das Manifest dokumentiert Quelldatei-Hashes und Größen.

| Attribut | Motiv |
| --- | --- |
| Kraft | Faust biegt eine Eisenstange |
| Geschick | Hand balanciert einen Dolch |
| Konstitution | Herz hinter einem Schild |
| Intelligenz | Buch und blauer Kristall |
| Weisheit | Eulenkopf |
| Charisma | Strahlendes goldenes Profil |

Die zentrale Zuordnung erfolgt in `modules/skill-checks/attribute-icon-registry.js`. Derselbe Attributsschlüssel verwendet im Charakterbogen, beim Attributswurf und beim Rettungswurf dasselbe Motiv. Fertigkeitsicons behalten ihre eigenen Motive.
