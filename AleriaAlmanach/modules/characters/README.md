# Figurenregister: Suchbestand und vollständige Akten

`character-directory.js` besitzt ausschließlich den lesenden Registerbestand,
Ladezustand, Wiederholung und gezieltes Nachladen. Die eingefrorene Schnittstelle
ist die Brücke für die bestehenden klassischen Skripte. Der Suchbestand wird
niemals in `_characters` oder einen Schreibweg übernommen.

`character-directory-firebase.mjs` liest mit der vorhandenen Firebase-Anmeldung
höchstens 200 Datensätze pro Antwort und einer festen Feldmaske. Inventar,
Kampfprofil, Avataralben und Biografietexte fehlen ausdrücklich in dieser
Projektion. Alle kleinen Suchdatensätze werden schrittweise vervollständigt;
währenddessen kennzeichnet die Oberfläche die noch unvollständige Suche.
Pro Dokument bleibt dies ein Firestore-Lesezugriff; es wird keine Verringerung
der berechneten Dokumentlesezugriffe behauptet.

`character-directory-local.mjs` gleicht den vorhandenen kleinen Index
`CharakterDatenbank/registry.json` ab. Bekannte Kennungen erhalten fehlende
Familien-/Identitätsangaben aus diesem Index. Nur online fehlende lokale Akten
werden in Viererpaketen gelesen und auf dieselben Suchfelder reduziert. Der
große vollständige lokale Snapshot wird dafür nicht geladen; lokale Figuren und
deren Archivstatus bleiben trotzdem enthalten. Ihre vollständigen Inhalte
werden erst bei einer ausdrücklichen Profilanforderung in den Figurenstore
übernommen. Es entsteht kein zweites erzeugtes Figurenregister.

Beim Öffnen einer Akte lädt der bisherige SDK-Gateway nur deren Kennung.
Gleichzeitige Anfragen teilen einen Vorgang. Tatsächliche Teilbereichsänderungen
während des Abrufs erhalten Vorrang, ohne die übrigen Serverfelder zu ersetzen.
Fehlende, widersprüchliche oder zyklische Hauptakten öffnen kein leeres Formular.
Szenen, Gesamtexport, Verwaltung und der ausdrücklich angewählte Beschreibungsfilter
verwenden weiterhin ihren vollständigen Datenweg. Ein Einzellesen markiert den
Gesamtbestand nicht als geladen.

Suche, Sortierung und Fachfilter gehören `character-register-views.js`.
Kategorien gehören `character-category-browser.js`: zunächst 24 Kategorien,
jeweils 36 Figuren pro Ergebnisseite. Die Suche kombiniert Wörter unabhängig von
Reihenfolge und Akzenten. Register-CSS gehört `character-register.css`,
Kategorien und Ergebniszeilen `styles/character-categories.css`; Profil-CSS bleibt
in `styles/characters.css`.

Alle 15 Register-Icons sind eigens erzeugt und über `character-register-icons.js`
zugeordnet. Aktive Dateien liegen in `IconOrdner/ReiterIcons/Charakterregister/`;
Originale, vollständige Prompts und Prüfsummen unter
`docs/art/register-navigation-20261113/`. Echte Hauswappen behalten Vorrang.

Der Stammbaum-Import gehört `../character-genealogy/`. Er startet mit einer
Baumauswahl; die Gesamtsuche wird ausdrücklich angefordert. Maximal 40 Personen
stehen gleichzeitig im DOM. Mobil wechseln Liste und Vorschau mit Rücksprung.
Der vollständige Suchbestand schützt den Dublettenabgleich; eine Verknüpfung mit
einer vorhandenen Akte lädt vor dem Schreiben deren vollständigen Zustand.

Fachprüfungen: `character-directory.test.mjs`, `character-register-views.test.mjs`,
`genealogy-import-catalog.test.mjs` und vorhandene Nachbarprüfungen. Der echte
Browserlauf `tests/register-overview.browser.mjs` verwendet 5.000 künstliche
Figuren, einen lokalen In-Memory-Schreibadapter und blockiert externe Requests.
