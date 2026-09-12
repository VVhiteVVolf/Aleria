# Infernus — Quellen und Pflege

Stand: 10.09.2026. Grundlage sind eine Übersicht und 17 vollständige Einzelvorlagen des Nutzers. Die Übersicht nennt **zehn** Infernalen. Der frühere Neuner-Pfad bleibt als statische Weiterleitung erhalten; der aktuelle Bereich liegt unter `pantheons/infernus/index.html`.

## Inhalt und Gliederung

| Gruppe | Einträge | Vollständige Artikel |
| --- | --- | --- |
| Hohe Mächte | Dagon, Lunara, Grimnar, Bhaal, Zatrach, Sanguine, Nyxara, Adar, Amon, Hela | 10 |
| Untergötter | Thraal, Nemsara, Azrath & Morvath, Migdal, Nergaloth | 5 |
| Infernale Geweihte | Arkeon, Asphyra | 0 |
| Gefallene | Der Seelenherr, Der Narzisst, Narath, Zarakhul, Balor | 2 |

Die fünf noch nicht ausgearbeiteten Namen erhalten eigene `eintrag.json` mit `recordOnly: true`, Symbol, Bildnis und Quellenangabe. Die Übersicht bietet ihre Bilder in voller Größe an. Es werden weder persönliche Namen für Seelenherr/Narzisst erfunden noch leere Artikel erzeugt.

Alle ausgearbeiteten Absätze, Aufzählungen, Gaben und Kultbeschreibungen der 17 Profile sind übernommen. Der Import wurde gegen jeden substanziellen Absatz der Originaldateien geprüft, auch in verschachtelten Artefakttabellen. `infernaler-kreis-import.json` dokumentiert Anhangs-IDs, Quell-Hashes, normalisierte Absatz-Hashes, Textumfang und Prüfsumme des importierten Gesamttextes. Die Tests sichern diesen Stand gegen versehentlichen Textverlust. Bei bewussten Loreänderungen muss der Prüfstand nachvollziehbar aktualisiert werden; Quellen-Hashes bleiben als Herkunftsnachweis erhalten.

Leere Wissenswertes-/Namensfelder, Dialogvorlagen und unbenannte Artefaktzeilen entfallen. Noch fehlende Aspekte oder Kulttexte stehen als offene Überlieferung im jeweiligen Artikel. Ausgearbeitete Texte werden nicht durch Kurzfassungen ersetzt.

## Inhaltliche Sonderstellungen

- Adar wird im infernalen Register geführt, bleibt aber eine **kosmische Entität mit umstrittener Zugehörigkeit**. Seine widersprüchlichen Mythen werden nicht zu einer eindeutigen Abstammung umgeschrieben.
- Aroth ist der frühere Name der später in Azrath und Morvath gespaltenen Wesenheit. Historische Erwähnungen und Kultnamen bleiben erhalten und sind suchbar.
- Thraals unterschiedliche Herkunftserzählungen um Bhaal, Hela und Nimue bleiben nebeneinander bestehen.
- Zarakhul ist der ehemalige Chronist und in seinen Neun Splittern gebannt. Vier gesicherte Fragmente und die benannten Bewahrer bleiben in der Lore erhalten. Er vergibt gegenwärtig keine eigenen Pakte oder Aspekte.
- Balor wurde von Dagon erschaffen, schloss sich später Zarakhul an und wurde nach seiner Niederlage wieder mit Dagon vereint. Auch er vergibt keine eigenständigen Pakte oder Aspekte.
- Es wird keine gemeinsame Kirchenhierarchie oder Übernahme der Kleruskasten der Neun eingeführt. Gemeinsame göttliche Lehre und Heiligenliste gehören ausschließlich zum göttlichen Kreis.

Eindeutige Vorlagenreste wurden an die bestehende Aleria-Namensgebung angepasst: unter anderem Baal → Bhaal, Azura → Lunara, Kynareth → Sylvana, Arkay → Kharon, Sheogorath → Azrath-Morvath und Midgal → Migdal. Drei kopierte Hela-Überschriften innerhalb Amons Kult beschreiben nun Amon. Das Importprotokoll führt die Ersetzungen auf.

## Bilder und eigene Zeichen

Die früheren SVG-Zeichen wurden auf ausdrücklichen Nutzerwunsch durch **23 einzeln generierte, transparente PNG-Icons** ersetzt: je eines für die 22 Registereinträge und eines für Infernus. Die eigenen Motive verwenden mattes Gold-Ocker, dunkle Sepiakonturen und eine feine Pigmentstruktur nach dem Vorbild der vorhandenen celestialen Icons von Ordan und Mariel. Dateien, vollständige Prompts und Stilreferenzen stehen in `assets/infernal-icons/image-prompts.json`; die Bilder stammen aus dem eingebauten Imagegen-Werkzeug. Die alten Entwürfe unter `assets/infernal-symbols` bleiben als historischer Bestand erhalten und sind nicht mehr eingebunden.

Das `symbol`-Feld des jeweiligen Religionsdatensatzes ist die gemeinsame Bildquelle für Übersicht, Götterprofil und Magie-Domäne. Magie übernimmt die Symbole der zehn hohen Mächte und fünf Untergötter ohne Dateikopien. Geweihte und Gefallene erhalten ihre neuen Registericons, ohne ihnen zusätzliche magische Domänen zuzuschreiben.

Die 22 gelieferten Bildnisse liegen unverändert unter `assets/infernal-art/`; die 17 Artikel zeigen sie groß und ohne Beschnitt. Die fünf übrigen Bildnisse sind direkt im Register erreichbar. `sources.json` hält Original-URL, lokalen Pfad, Maße und SHA-256 fest. Symbole und Artikelporträts bleiben getrennte Felder.

Sieben weitere Originalbilder liegen unter `assets/infernal-art/artefakte/`. Zarakhuls Herz erhält alle drei Beschreibungsabsätze und den Bewahrer Mogh Ruith. Rechte/linke Hand, beide Augen und Fangzähne bleiben mit Namen und Bild verzeichnet; Eigenschaften fehlen in der Quelle. Balors Morvahr enthält seine vollständigen zwei Beschreibungsabsätze. Die Anzahl der abgebildeten Fragmente verändert nicht die erzählerische Zahl der Neun Splitter.

## Technische Verantwortung

`data/infernaler-kreis.json` definiert Gruppen und Reihenfolge. `collection-repository.mjs` trennt veröffentlichte Profile und Registereinträge; das Sammlungsmodul führt sie in Quellreihenfolge für die Übersicht zusammen. Die Hauptsuche findet beide über Infernus. Artikel-Nachbarschaften bleiben innerhalb der jeweiligen Sammlung und Gruppe.

`theme: "infernal"` aktiviert ausschließlich auf diesen Seiten die gekapselte Farbvariante. Lehrabschnitte und weiterführende Registerartikel werden durch `doctrineIds` bzw. `readingEntryIds` je Sammlung ausgewählt. Es gibt keine zweite Suchsteuerung oder zusätzlichen globalen Zustand.

`artifacts` besitzt `intro` und `entries`. Jeder Eintrag braucht `id`, `title`, `paragraphs` sowie bei fehlendem Text eine `pending`-Angabe. Optional sind `keeper` und `image` mit `src`, `alt`, `width`, `height`. Validierung und Darstellung gehören zu `modules/profiles/profile-artifacts-*`. Bildlinks tragen `data-religion-image-link`, damit Vite sichtbares Bild und vollständige Datei gemeinsam verarbeitet.

Der gemeinsame Generator und die bestehenden Vite-Einstiege erfassen die Sammlung automatisch. Vite gibt die Icons als wiederverwendbare Bilddateien aus, die über mehrere Seiten hinweg zwischengespeichert werden. Quelldaten und erzeugtes HTML werden zusammen gepflegt. Prüfung aus der Projektwurzel:

```text
node Religionen/scripts/build-religions.mjs
node Religionen/scripts/build-religions.mjs --check
node --test Religionen/tests/*.test.mjs
```

In eingeschränkten Windows-Testumgebungen kann zusätzlich `--experimental-test-isolation=none` verwendet werden.
