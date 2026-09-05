# Meirawen und Morwella Gwyllach: Biografien

Die Biografien wurden am 05.09.2026 in den beiden bereits vorhandenen Almanach-Figuren gespeichert. Grundlage ist der Benutzerkontext dieser Sitzung. Die nebenstehenden Einzelimporte enthalten den anschließend aus Firestore zurückgelesenen Stand:

- [Meirawen Gwyllach](meirawen-gwyllach-biografie-2026-09-05.json)
- [Morwella Gwyllach](morwella-gwyllach-biografie-2026-09-05.json)

## Vorgaben und Ausarbeitung

Übernommen wurden der bewusst bürgerliche Stand des Hauses aus Gwynthor, seine mehrfach erworbene Qualifikation für den Ritterstand, die Rolle als Schatten des Hauses Draig, die Kontrolle über die größte Fuhrmannsgilde Celtigerns Wachts sowie die Ausbildung in Heimlichkeit, Spionage und einer eigenen Kampfweise. Diese besondere Ausbildung begründet keine automatischen Kampfboni.

Die Zwillinge stehen seit einigen Jahren im aktiven Dienst. Rhovans Absicht, sie zu Prinz Anaraut Draig zu schicken, wird als Vorhaben beschrieben; ein bereits erfolgter Dienstantritt wird nicht behauptet.

| Figur | Persönlichkeit |
| --- | --- |
| Meirawen | kontaktfreudig, einfallsreich, warmherzig, geltungsbedürftig, ungeduldig, selbstüberschätzend |
| Morwella | aufmerksam, geduldig, gewissenhaft, misstrauisch, grüblerisch, bevormundend |

Persönliche Gewohnheiten, Zitate und das gemeinsame Ritual beim Essen sind neue erzählerische Ausarbeitungen im Rahmen des Auftrags. Die Zwillingsbindung beruht auf Vertrautheit und gemeinsamer Ausbildung. Beide bleiben eigenständige Personen; ihre Sorge füreinander führt auch zu Konflikten und Fehlentscheidungen.

Das Wappen `https://i.imgur.com/IxkbV60.png` wird bei beiden unter **Haus & Gilde** ausdrücklich der Fuhrmannsgilde zugeordnet. Die vorhandenen Figurenporträts wurden übernommen.

## Offene Verwandtschaftsfrage

Der Benutzer bezeichnet die Zwillinge als Rhovans Nichten. Im bestehenden Stammbaum ist Rhovan ein Cousin ihres Großvaters Rhydderch. Dazu wurde eine Rückfrage gestellt. Bis zu einer Klärung verwenden die Texte **Onkel/Nichten als familiäre Anrede**; die Abstammung wurde nicht umgebaut.

Beide sind gemäß der vorherigen Alterskorrektur im Jahr 1716 geboren, damit im Bezugsjahr 1740 jeweils 24 Jahre alt.

## Speicherung und Prüfung

- Bestehende Dokumente: `characters/person--haus-gwyllach--meirawen-gwyllach` und `characters/person--haus-gwyllach--morwella-gwyllach` im Projekt `aleriaprojekt`, Datenbank `(default)`.
- Atomarer Schreibvorgang mit Versionsvorbedingung; Commit: **2026-09-05T04:41:04.725608Z**.
- Geschriebene Felder: `bio`, `biography`, `updatedAt`, `genealogy.birth`, `genealogy.tags`.
- Zurückgelesene Biografien und Altersangaben stimmen mit den geprüften Entwürfen überein. Sämtliche übrigen Online-Felder sind gegenüber dem vorherigen Stand unverändert.
- 30 vorhandene Prüfungen für Biografiekompatibilität und gezieltes Speichern bestanden; zusätzlich wurde die Normalisierung des neuen Biografieformats geprüft.
- Beide Biografien mit dem unveränderten Almanach-Renderer und seinen bestehenden Styles bei 1440 × 1000 geprüft: sechs Eigenschaften, drei Verbindungen, Zwillingsabschnitt, Infotabelle und Gildenwappen vollständig; keine horizontal überlaufenden Spalten.
- Imgur antwortete auf direkte Bildanfragen des Testbrowsers mit HTTP 403. Die drei Originaldateien waren über direkte Downloads abrufbar und wurden ausschließlich für die lokale Darstellungsprüfung als unveränderte Bildkopien eingespielt. Die gespeicherten Biografien verwenden die Originaladressen.
- Archiv synchronisiert und `--check` bestanden: weiterhin **226 Figuren**, keine doppelten Weltpersonen. Inhaltliche Änderungen im Snapshot betreffen ausschließlich die beiden Zwillinge. Weitere erzeugte Dateidifferenzen stammen aus den vom vorhandenen Generator erneuerten Synchronisationszeitpunkten und davon abhängigen Prüfsummen.

Die Einzelimporte sind Archivkopien des bestätigten Online-Stands. Ein erneuter Import in die Anwendung ist nicht erforderlich.

## Persönlichkeitsicons und Beschriftung

Auf ausdrücklichen Benutzerwunsch lautet die Abschnittsüberschrift nun nur **Persönlichkeit**. Die sechs Eigenschaften jeder Figur erscheinen ohne die Präfixe „Stärke“ und „Schwäche“. Die Beschreibungen bleiben erhalten.

Verwendet werden die bereits versionierten CK2-Originaldateien aus `IconOrdner/Traits Icon/`, in den Biografien relativ über `../IconOrdner/Traits%20Icon/` eingebunden:

| Figur | Eigenschaft | Icon |
| --- | --- | --- |
| Meirawen | Kontaktfreudig | Gregarious.png |
| Meirawen | Einfallsreich | Quick.png |
| Meirawen | Warmherzig | Kind.png |
| Meirawen | Geltungsbedürftig | Ambitious.png |
| Meirawen | Ungeduldig | Fussy.png |
| Meirawen | Selbstüberschätzend | Proud.png |
| Morwella | Aufmerksam | Shrewd.png |
| Morwella | Geduldig | Patient.png |
| Morwella | Gewissenhaft | Diligent.png |
| Morwella | Misstrauisch | Paranoid.png |
| Morwella | Grüblerisch | Brooding.png |
| Morwella | Bevormundend | Stubborn.png |

Die Zuordnung illustriert die beschriebenen Eigenschaften; sie importiert keine CK2-Spielwerte. Die Bilddateien wurden visuell geprüft und ihre Einbindung durch den bestehenden Biografie-Renderer validiert. Die 30 vorhandenen Biografie-/Speicherprüfungen bestehen weiterhin.

Die Korrektur wurde mit Versionsvorbedingung atomar gespeichert und vollständig zurückgelesen: **2026-09-05T04:52:04.569023Z**. Geändert wurden ausschließlich `biography.biography.abilities`, `biography.biography.abilitiesTitle` und `updatedAt`; alle übrigen Online-Felder wurden im Vergleich zum vorherigen Stand bestätigt.
