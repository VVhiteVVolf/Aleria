# Abschlussreview – 15 Häuser der Grauen Weite

Stand: 3. November 2026. Keine Produktionsänderungen durch diesen Reviewagenten.

## Ergebnis

Keine offenen materiellen Befunde in den geprüften Hausmodulen. Alle 15 tatsächlich eingebauten Prosaabschnitte, Gründer-, Oberhaupt- und Erbenrollen wurden gegen die aktuellen öffentlichen Akten und die verwertbaren narrativen Quellen gelesen. Die Kontaktübersichten aller 15 Originalfiguren wurden tatsächlich angesehen. Acht diagnostische Textvorschläge dieses Agenten wurden zusätzlich vom anderen Quellenagenten unabhängig geprüft, bevor der Architekturagent sie übernahm.

`module-review.json` dokumentiert den unabhängigen Abgleich: 15 von 15 Modulen vollständig, keine fehlgeschlagenen Prüfungen und keine Prosa-Warnungen. Die 15 Zielgraphen samt ihren aktuellen Profilen bleiben unverändert; auch die vier geschützten Vennyr-Graphen, Profile und Versionsstände stimmen mit dem Vorherstand überein. Alle 15 Hauptfiguren sind bytegleich zu den gesicherten Originaldownloads. Keine neue Figur war erforderlich.

## Geprüfte Schwerpunkte

- Pysgod bleibt Grafenhaus von Tredegar in der Grauen Weite. Alte Menevia-/Baronieangaben und behauptete Flächenanteile wurden nicht übernommen.
- Blaidd, Illygoden, Gwaedlyd und Lyfant verwenden ihre eigenen südlichen IDs. Die vier nördlichen Ursprungsakten bleiben getrennt und unverändert. Bei Lyfant ist ausschließlich `haus-lyfant-caer-asgwrn` das südliche Ziel.
- Pelleas ist Gründer der südlichen Blaidd-Linie. Die Priesterbrüder bleiben Teil der älteren Familiensage. Cadwgawn wird nicht irrtümlich als Gründer des südlichen Hauses Gwaedlyd ausgewählt.
- Brithyll enthält keine kopierten Cumbra-/Umbrien-/Brechinaucc-Angaben und keine neue Amtsbesetzung. Die Flossenschulterteile stimmen mit dem sichtbaren Original überein.
- Coedwig bleibt in Llanfyn/Achatsee; eine ältere Ortsbezeichnung ersetzt den aktuellen Sitz nicht. Der Eremit und die Mac-Duff-Verbindung bleiben Erzählmotive, ohne neue Namens- oder Amtskarten.
- Draenog trennt den alten Gründer Mathonwy vom heutigen gleichnamigen Erben. Deiniol bleibt heutiges Oberhaupt. Die unsicher zugeordnete Erzpatriarchen-Erzählung wird nicht als neue Amtstatsache übernommen.
- Wiverns ältere Abstammung bleibt ungesichert. Das Original zeigt tatsächlich einen sitzenden Ritter am Baum. Morfil bleibt Baronshaus von Talsarn mit Trayvion als Gründer.
- Die südliche Lyfant-Linie bleibt unter Pysgod, nicht unter Draenog. Cledwyn führt sie seit 1720; Cadwgan gehört zum mitausgewanderten Seitenzweig. Meredydds Linie bleibt in Derwyddion.
- Dornach, Brathaireann und Tonnmharra erhalten keine erfundenen Gründer, Chroniken oder Religionen aus leeren Vorlagefeldern. Die derzeit registrierten Ränge und Orte bleiben erhalten, einschließlich Tonnmharras Ritterfürstenrang.
- Tanwyn wird historisch als erloschenes Haus erzählt. Konkreter Rang und aktueller Sitz bleiben offen. Keine Überlebenden, neue Erben oder privaten Dossierhandlungen werden aus vagen Andeutungen abgeleitet.
- Orinor, Tharnor und Sylvanaeth sind in den aktuellen Gottheitsakten unter `Religionen/gottheiten/goettliche/` als avallornische Namen belegt. Nimues aktuelles Epithet lautet Dame des Sees.

## Quellen und Schnittstellen

Alle gelieferten Stammbäume, Hof- und Hierarchietabellen bleiben ausgeschlossen. Draenogs falsch mit „9.) Werte“ überschriebener Hofblock wurde ebenfalls ausgeschlossen. Die aktiven Hausseiten verwenden die vorhandenen Familien-IDs mit `mode=view` im Stammbaum-Iframe.

Militärprofile und statistische Truppen-/Flottenangaben fehlen. Qualitative Kriegertraditionen erzeugen keine neuen Klassenregeln, Zaubermechaniken oder automatischen Ausbildungen. Ursprüngliche Quellenarchive bleiben lokal erhalten und sind von der statischen Auslieferung ausgeschlossen.

Die vier verlinkten alten Animexx-Ortsbeiträge der letzten acht Vorlagen waren über das Webwerkzeug nicht zugänglich; daraus wurden keine weiteren Inhalte behauptet. Alle 23 direkt eingebundenen Original-PNGs dieser acht Vorlagen wurden erfolgreich geladen und gehasht. Zusammen mit den 21 Bildern der ersten sieben Vorlagen bleiben die bestehenden Darstellungen vollständig nachvollziehbar.

## Prüfungen

- Unabhängiger Daten-/Graph-/Profil-/Bildhash-/Iframetest: vollständig grün für 15 Zielhäuser und vier geschützte Ursprungsakten.
- `Familien Häuser und Clans/tests/graue-weite-house-pages.test.mjs`: neun von neun Prüfungen bestanden.
- `netlify/tests/house-source-publication.test.mjs`: vier von vier Prüfungen bestanden.

Der erste Upgrade-Testlauf unterschied neue Verwaltungsstempel der bestehenden Cwingod-Namenskorrektur von einem leeren Extensionsobjekt. Der zuständige Agent korrigierte den Vergleich gezielt für die bekannten Trackingfelder; eigene Personenextensions werden weiterhin ausdrücklich geprüft. Ein Produktions- oder Genealogiefix war dafür nicht nötig. Der anschließende unabhängige Fokuslauf ist vollständig grün.

Es wurden keine Git-Mutationen, Pushs, Deploys oder Firebase-Schreibzugriffe ausgeführt. Die parallel bearbeitete Sonnenküste wurde durch diesen Agenten nicht geändert.
