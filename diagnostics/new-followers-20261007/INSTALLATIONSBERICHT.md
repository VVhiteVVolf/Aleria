# Neue Follower - Installation 07.10.2026

Profil: **Nolvus Awakening - SkyrimNet Beta25 Test**.

24 Modpakete sind installiert und aktiviert. Ihre 23 neuen Plugins sind ESL/ESPFE; normale Plugins bleiben bei **252**, Light-Plugins steigen von **3762 auf 3785**. Keine FormIDs wurden kompaktiert. Download-Plugins bleiben unveraendert. Bestehende Plugins behalten ihre relative Reihenfolge.

## Installierte Pakete

- Local - Amy Follower 20261007 (Amy_follower.esp)
- Local - Malik - Avenger of the Lost 20261007 (AvengerOfTheLost.esp)
- Local - Darvok - Fists of the Unyielding 20261007 (FistsoftheUnyielding.esp)
- Local - Kian and Karo - Brothers of the Wild 20261007 (Brothers of the Wild.esp)
- Local - ColdSun - Karla Raven 20261007 (CSV_Karla.esp)
- Local - ColdSun - Lyris Titanborn 20261007 (CS_Lyris.esp)
- Local - ColdSun - Melana Appearance 20261007 (CS_Melana.esp)
- Local - Daedric Individuals - 3BA Followers 20261007 (DaedricIndividuals.esp)
- Local - Dracania Armor - 3BA 20261007 (DracaniaArmor.esp)
- Local - ELLE Elven Assasin - 3BA 20261007 ([ELLE] Elven Assasin.esp)
- Local - Hyren - 3BA Follower 20261007 (Hyren - New Companion - Follower - High Poly - ESL.esp)
- Local - Skogul - Standalone 3BA 20261007 (Skogul.esp)
- Local - Malryn - Standalone 3BA 20261007 ((SDZ21) Lovely Malryn Follower Standalone.esp)
- Local - Melana the War Maiden 20261007 (DZ08_Melana.esp)
- Local - ColdSun - Visions Asset Pack 20261007 (CS_Visions.esp)
- Local - VriTarl Follower 20261007 (VriTarlFollower.esp)
- Local - Eola Replacer 20261007 (EolaReplacer.esp)
- Local - SN Cicero Reina Replacer 20261007 (SN Cicero Replacer.esp)
- Local - Sieglinde Companion 20261007 (Sieglinde Sswayes Mom Companion.esp)
- Local - Blackbeerd Beards Dependency 20261007 (Blackbeerd's Beards.esp)
- Local - Milfactory Asset Hub - CBBE 3BA 20261007 (milfactory asset hub.esp)
- Local - Son of the North 20261007 (SonOfTheNorth.esp)
- Local - New Followers NPC Compatibility 20261007 (Local New Followers NPC Compatibility.esp)
- Local - New Followers OBody Output 20261007

## Ausgelassen

Eudora, Heart of Ice/Astrid, Ivar, Neisa und Naughty Voice Eudora benoetigen normale Slots und wurden vom Nutzer ausgeschlossen. Twins of Windhelm wurde ausdruecklich verworfen. Magecore ist in gleicher Version bereits aktiv. Skogul Base Assets ist eine Alternative zur installierten Standalone-Version. Zusaetzliche Eola-Skin-/RaceMenu-Dateien wurden nicht installiert: Der Replacer hat private Hauttexturen, waehrend die Zusatzdateien die allgemeine weibliche Haut ersetzen wuerden.

## Modelle und Kompatibilitaet

**36 BodySlide-Projekte mit Morphs** gebaut. Projektbezogene kosmetische Nullwerte; technische NeckSeam-/AnkleSize-, versteckte Konvertierungs- und Zap-Vorgaben bleiben beim Autorstandard. Globale Koerper-, Hand-, Fuss- und Kopfmodelle werden nicht ersetzt.

Ciceros privater nackter Koerper und sein Skelett verwenden Kopien der funktionierenden 3BA-/OBody-/XPMSSE-Dateien. Seine sechs BodySlide-Projekte sind gebaut. Ein neuer ESPFE-Patch uebernimmt Eolas und dreier Cicero-Varianten visuelle Felder einschliesslich Haut, Rasse, Gewicht, Geschlecht und Outfit. Alle anderen NPC-Daten des bisherigen Twisted/Nolvus-Patches bleiben byteidentisch, darunter Quests/Scripts, KI, Fraktionen, Werte und Perks.

Falsche Textur-, FaceTint-, Morph- und Modellpfade wurden mit vorhandenen Paketdateien korrigiert. Eolas Draugr-Outfittextur liegt jetzt privat und ersetzt keine allgemeinen Draugr-Texturen. Details: resource-repairs.json.

## Ladereihenfolge

22 neue Basisplugins stehen nach ihrem letzten vorhandenen Master Beards.esp, vor bisherigen Umgebungspatches. Der neue NPC-Kompatibilitaetspatch steht zuletzt. Dadurch bleiben die bisherigen Gewinner von **21 betroffenen CELL-/WRLD-/NAVM-Datensaetzen** erhalten, einschliesslich Beleuchtungs-, Karten- und Ortsanpassungen.

Ein weiterer NAVM-Datensatz aus Brothers of the Wild ersetzt weiterhin Vanilla; kein bisheriger Mod bearbeitet diesen Datensatz. Die angrenzende Navmesh wird allerdings von einem Northern-Roads-Patch veraendert. Die Wegfindung von Kian und Karo bei Half-Moon Mill bleibt im Spiel zu pruefen; keine geometrische Navmesh-Zusammenfuehrung vorgenommen. Details: ordering-validation.json, world-cell-baseline.json, navmesh-comparison.json.

## Pruefungen und Grenzen

Aktivierung, Slots und neue Master-Reihenfolge geprueft; **1738 installierte Dateien** per SHA256 geprueft. Ressourcenabgleich: 391 Meshes, 3680 Texturverweise, keine NIF-Parserfehler. **Kein Laufzeittest im Spiel durchgefuehrt.**

Verbleibende Luecken der Originalpakete:

- VriTarl hat fuer mehrere Outfitteile keine TRI-Dateien oder BodySlide-Projekte. Statische Autorenmodelle vorhanden; dynamische OBody-Verformung dieser Teile nicht bestaetigt.
- Eola fehlt fuer ein Accessoire armor/DraugrHalloweenOutfit/doll.nif als Welt-/Inventarvorschaumesh. Angezoegenes Modell vorhanden.
- Karla fehlt der zusaetzliche Shader-Texturverweis cubemaps/teeth_e.dds; Diffuse-, Normal- und FaceTint-Texturen vorhanden.
- Weitere unaufgeloeste Standardtexturverweise liegen in zusaetzlichen Kopf-/Haarmodellen. Gebackene Gesichter haben vorhandene Texturen oder eigene Texturzuweisungen. Details: resource-validation.json. Dies belegt keinen fehlerfreien Laufzeittest.

## Sicherung

backup-before-install/ enthaelt bisherige Profildateien und MO2-Konfiguration; backup-before-order/ die Sicherung vor der Einordnung. Originalarchive unveraendert. deployment-plan.json, selected-stage.json und Skripte dokumentieren Auswahl, Dateien, Optionen und Korrekturen.

Die fruehere kumulative Nolvus-Upgrade-Sicherung auf D: wurde **nicht aktualisiert**. Vor Neuinstallation muss der bestehende Sicherungsablauf nochmals das aktuelle Profil aufnehmen.
