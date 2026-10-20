# Wirtschaftskalkulation und Preisprüfung · 19. Oktober 2026

Die letzte Seite jedes passenden Verkaufsorts unter **Völker & Kulturen** erhält eine interaktive Betriebskalkulation. Aktuell sind es **15 Orte**: Kleiner Durst, Krumme Kanne, Letzte Rast, Göttliche Eleganz, Voller Korb, Badehaus Fontani, Gestiefelte Muschi, Letzter Heller, Dritter Funken, Klingende Krone, Lachende Nixe, Owains Gestüt, seine Herberge, der Rote Drache und Zum Roten Tor. Dieselbe Seite lässt sich im Modul-Editor anlegen und vollständig exportieren/importieren.

Die Abgrenzung gehört `economy-venue-scope.mjs`: echter Kulturen-Reiter, begehbare Szene und bepreistes Güterangebot; das Badehaus besitzt stattdessen konkrete Dienstleistungspreise. Ein alter Typ „Story“ schließt einen tatsächlichen Verkaufsort nicht aus. Theater, Arena, Gwregysdu-Lagerhäuser, organisatorische Gildenmodule und die Void-Vorlagen erhalten keine zusätzliche Seite. Die automatische Ergänzung erfolgt einmal am Ende. Bereits bearbeitete Kalkulationen und bewusst verschiedene eigene Szenarien bleiben erhalten; nur exakte Dubletten werden entfernt.

Die Kalkulation ergänzt einen sichtbaren, veränderbaren Wirtschaftsrahmen. Sie verändert keine Charakterkassen, Marktpreise, Besitztümer, Szenen oder Online-Datensätze. Einstellungen in der Leseansicht gelten nur bis zum Schließen beziehungsweise erneuten Rendern der Seite; der JSON-Export hält einen Versuch samt Wochen-, Monats- und Jahresrechnung fest. Änderungen am dauerhaften Szenario erfolgen über den vorhandenen Modul-Editor.

## Belegte Grundlagen und Annahmen

- Preise und Personen stammen aus den aktuellen Ortsmodulen. Die dokumentierte [Preisprüfung](../../docs/economy/price-review-2026-10-19.html) erfasst nach der Ergänzung und Kartenerweiterung des Roten Tors am 20.10.2026 **1.145 Zeilen** einschließlich Gebindevarianten, Dienstleistungen und unbepreister Vorlagen; 144 frühere Preisbelege wurden angepasst beziehungsweise mit ihrem Standard abgeglichen. Die 32 neuen Speisen-, Getränke- und Dienstleistungsangebote bleiben erhalten. Alle 50 Pferde- und Viehpreisbereiche bleiben unverändert. Die Rechenskala ist weiter eine fiktive, veränderbare Abstimmung, keine historische Preisstatistik.
- Build-Adapter lesen die generierten Moduldaten aus den im Almanach geladenen Features und einen datierten öffentlichen Quellenstand von vier alten Ortsmodulen sowie drei Void-Vorlagen. Laufende Ansichten berechnen ihr Szenario aus dem tatsächlich geöffneten Eintrag, nicht aus einer veralteten Kopie der Hierarchie. Quellenstände enthalten keine Spielerbeiträge und werden niemals in den Online-Speicher zurückgeschrieben.
- Der gemeinsame `AleriaCalendar` liefert neun Tage pro Woche, 36 Tage pro Monat und 13 Monate beziehungsweise 468 Tage pro Jahr. Das ergibt vier Wochen pro Monat und 52 Wochen pro Jahr.
- Die vorhandene Inventar-Geldbibliothek liefert Preisparser, Münzwerte und die Umrechnung in ganze Eisenpfennige. Gespeicherte Eingaben bleiben Kupfertaler; alle Geldzeilen des Ergebnisses sind ganze Pfennige.
- Löhne, Nachfrage, Einkaufssätze, feste Kosten, Immobilienwerte, Pacht und Kreditkonditionen sind ausdrücklich Annahmen. Sie sind weder neue verbindliche Regeln für Cenyr noch aus historischen englischen Währungen umgerechnet.
- Cenyrs Bürger sind frei. Die Pacht wird vertraglich gerechnet; Personen und gepachtetes Land sind kein Eigentum der Pächter beziehungsweise des Arbeitgebers.
- Auf ausdrücklichen Wunsch werden in der Rast **60 tätige Personen insgesamt** berücksichtigt: 22 benannte Dienstplätze einschließlich Familienleitung und Ausbildung sowie 38 anonyme bestehende Beschäftigte. Die 19 ausdrücklich freien Hierarchieposten bleiben unbesetzt und kosten keinen fiktiven Lohn.
- Celyn in der Kanne erscheint in mehreren Bereichen, wird jedoch einmal vergütet. Caradog auf der Tiefenwyrm, verstorbene und wegverheiratete Angehörige sind keine zusätzlichen Lohnempfänger. Tiere und Hauskinder erhalten keinen Arbeitslohn; ihre Versorgung steht separat.

## Präzisierte Weltgrundlagen vom 19. Oktober 2026

`economy-world-context.mjs` hält die ausdrücklichen Nutzerentscheidungen getrennt von Geldannahmen. Die drei Beispiele tragen `contextId: "gwynthor"`; bei fehlendem oder unbekanntem Ortsprofil werden Gwynthors Verhältnisse nicht übernommen. Die Schichtung trennt Warenwert und Qualität, örtliche Versorgung und Kosten sowie den einzelnen Betrieb. Zukünftige Orte brauchen eigene Profile, keinen pauschalen Preisfaktor für alle Güter.

- Ein regulärer Hafenlohn soll eine sparsame Familie mit zwei Erwachsenen und zwei Kindern tragen. Eigenarbeit im Haushalt ist Teil dieser Voraussetzung, kein erfundenes Geldeinkommen.
- Gwynthor hat wohlhabende Einwohner und laufenden Außenhandel; unterschiedliche Kundenschichten können sowohl kleine Schänken als auch Luxushäuser gut besuchen. Niedrige Auslastung ist kein zulässiger Automatismus, um eine arme Familiengeschichte rechnerisch herzustellen. Die ursprünglichen Absatzannahmen sind deshalb weiter zu prüfen.
- Cenyrs äußerer Seehandel erreicht vor allem Celtigerns Wacht: Abergwint, Castellbryn, Rhosmere und besonders Gwynthor. Externe Handelsrouten aus dem Norden sind nach dem aktuellen Weltentwurf nicht vorgesehen. Das begründet Gwynthors Sonderstellung, keinen universellen Lebensstandard aller Länder.
- Örtlicher Fisch und landwirtschaftliche Versorgung sind reichlich, hochwertige und seltene Güter sowie bestimmte Importe teuer. Keine pauschale Aussage, jede heimische Ware müsse billig oder jede Importportion gleich teuer sein.
- Gelernte Arbeit verdient mehr; konkrete Lohnabstände sind offen. Familienvergütung und Kost/Logis werden je Betrieb vereinbart.
- Der soziale Rhythmus ist **3 Arbeitstage – 1 frei – 3 Arbeitstage – 2 frei**, also sechs Diensttage. Die Modelllöhne wurden nach Rollen und Ausbildung auf diesen Rahmen abgestimmt. Betriebliche Ausnahmen, Teilzeit und Ausbildung bleiben möglich; echte Verträge sind nicht festgelegt.
- Pacht und Abgaben bleiben getrennt. Abgaben gehen an das zugeordnete Adelshaus, sonst an die Stadtherrschaft; die weitere Verpflichtung des Empfängers wird nicht erneut dem ursprünglichen Zahler belastet. Ritterliche Pflichten können Geld, Naturalien und Dienste umfassen. Die Testquoten von 2 % und 10 % sind weiterhin unbestätigt, keine Weltregel. Persönliche Familienabgaben dürfen bei einem späteren Abgleich nicht zusätzlich als identische Betriebsabgabe angesetzt werden.
- Alltägliche Produktion, Transport und Konservierung erhalten keinen Magiebonus. Andere Schauplätze wie Rhonwens Tränen dürfen nicht aus Gwynthor abgeleitet werden.
- Haus Vanns Wohlstand soll aus tatsächlichem Besitz, Schulden und Geschäft entstehen, nicht aus einer zuvor gewünschten Rangklasse oder Zielmarge.

### Geldsold der Hausritter des Hauses Draig

Aktueller Arbeitsansatz vom 19. Oktober 2026: Ein gewöhnlicher, fest besoldeter Hausritter der Draigs mit Burgwache, gelegentlicher Führung von Waffenknechten und militärischen Diensten erhält **624 Kupfertaler Geldsold pro 36-Tage-Monat**. Auf die zuletzt angesetzte Basis von 480 KT hat der Nutzer eine Erhöhung der Ritter- und Waffenknechtsgehälter um 30 % angewiesen. Das entspricht 156 KT je Neuntagewoche und 8.112 KT im Jahr mit 13 Monaten. Bei modellhaft 24 Diensttagen sind es rechnerisch 26 KT je Diensttag; bezahlt wird hier der vereinbarte Monatsdienst, nicht jeder zusätzliche Auftrag separat.

Der Geldsold kommt zusätzlich zur im Beispiel angenommenen Versorgung durch das Haus: Unterkunft, gewöhnliche Verpflegung, Dienstausrüstung und ein bei Bedarf zugewiesenes Dienstpferd samt Unterhalt. Diese Leistungen sind kein ausgezahlter Lohn und begründen kein persönliches Eigentum an Burgkammer, Rüstung oder Pferd. Die 30-%-Revision betrifft die eingeordneten Geldsoldansätze für Hausritter, Amtsritter und Waffenknechte einschließlich beider Gardestufen. Familienzuwendungen und der allgemeine Beispielhaushalt eines selbst wirtschaftenden Dienstritters werden dadurch nicht pauschal umgewertet. Die privaten Ausgaben von 100 KT monatlich aus dem Gespräch bleiben eine Beispielrechnung, kein festgelegter Bedarf oder Abgabensatz. Damit wären dort 524 KT monatlich für Rücklagen und größere Vorhaben verfügbar.

Die fünf Richtwerte nach der Revision lauten pro 36-Tage-Monat: Hausritter **624 KT**, Amtsritter **936 KT**, Waffenknecht der Hausmacht **312 KT**, Waffenknecht der Garde **436,80 KT**, Ritter der Garde **780 KT**. Die zugehörigen Geldsoldspannen steigen ebenfalls um 30 %. Page, Knappe, fahrender/freigestellter Ritter ohne festen Sold, gewöhnliche Dorf-/Siedlungs-/Stadtwache, hohe Beamte und persönliche Hauszuwendungen bleiben auf ihren bisherigen Ansätzen. In `economy-service-income.mjs` bleibt die alte Basis als fester Rechenbezug erhalten; nur tatsächliche Gehälter mit Ritter- oder Waffenknechtsstatus erhalten einmal den Faktor 1,3. So erhöht ein erneuter Build oder Aufruf weder dieselben Gehälter nochmals noch versehentlich alle anderen Einkommensarten.

Die neun getrennten Einkommensarten stehen in `economy-service-income.mjs` und sind im Bereich **Vermögen & Stände** aufklappbar: Page, Knappe, Hausritter, fahrender/freigestellter Ritter, ritterlicher Angehöriger eines niederen beziehungsweise höheren Adelshauses, erwachsenes Mitglied des Grafenhauses, Amtsritter und hoher Beamter. Der Nutzer hat klargestellt, dass die Ritter der Adelshäuser **Familienangehörige** sind. Ihre vorgeschlagenen persönlichen Hauszuwendungen sind kein Dienstsold und kein garantierter Betrag für jedes Haus. Die Haushaltskasse muss sämtliche Angehörigen tatsächlich tragen können; bestehende kleine Lehensbeispiele werden nicht durch erfundene Einnahmen auf einen gewünschten Familienrang angehoben.

Die übrigen Geldansätze dieser Einordnung sind Vorschläge. Volle Amtsbesoldung ersetzt den gewöhnlichen Hausrittersold. Ausbildungszuwendungen, Hauszuwendungen und Ämter werden nicht automatisch addiert. Fahrende und freigestellte Ritter besitzen keinen festen Sold; tatsächliche Aufträge und Gastfreundschaft sind separat zu erfassen. Persönliches Einkommen und Budgets für Amtspersonal, Wachen oder Dienstreisen bleiben getrennt. Der ältere selbst wirtschaftende Ritterhaushalt mit 12.000 KT Jahresannahme ist entsprechend als Haushaltsbeispiel bezeichnet, nicht als allgemeiner Soldtarif.

### Wachen, Hausmacht und Garde

Nutzerdefinition vom 19. Oktober 2026: **Dorfwachen** sind Weilern, ländlichen Regionen oder kleinen Höfen zugewiesen. **Wachmänner** sichern größere Siedlungen wie Lysfaen oder das Stadtumland. Die **Stadtwache** gehört zur jeweiligen Stadt und bildet eine eigene benannte Einheit, beispielsweise die Cochllamwyr. Die **Hausmacht** gehört persönlich zum Adelshaus und umfasst kriegstaugliche Waffenknechte sowie Hausritter. Die **Garde** ist eine handverlesene Auswahl vertrauter, geeigneter Kämpfer aus Rittern und Waffenknechten. Die Draig-Leibgarde bleibt Teil der Draig-Hausmacht. Zugehörigkeit, Einsatzraum und besonderer Vertrauensdienst bilden keine automatische durchgehende militärische Rangtreppe.

Die Definitionen und sechs zusätzlichen Soldansätze liegen in `economy-watch-service.mjs` und werden von der gemeinsamen Einkommensübersicht verwendet. Die Geldbeträge sind vorgeschlagene Richtwerte, die Organisationsunterscheidung stammt vom Nutzer. Die Ansätze beziehen sich auf gewöhnliche Vollzeitposten; Nebendienst und Aufgebotspflichten benötigen eigene Mengen. Ein Gardist behält seinen Status als Ritter oder Waffenknecht. Der gesamte Gardesold ersetzt den jeweiligen gewöhnlichen Sold. Führung und Versorgung werden gesondert vereinbart; bei gleicher Geldzahlung sind Dienstverträge mit und ohne Kost und Logis wirtschaftlich unterschiedlich.

Die Übersicht besitzt innerhalb **Vermögen & Stände** einen eigenen aufklappbaren Bereich. Private Türsteher, gewerbliche Wachleute und die Söldner der Gilden werden nicht aufgrund des Wortes „Wache“ in eine politische Organisation umklassifiziert. Ihre bereits separat modellierten Vergütungen bleiben bis zu einer konkreten Einordnung eigenständige Vertragsannahmen. Die Organisationsbezeichnung allein überschreibt keine Shop-Belegschaft, kein Inventar und keinen bestehenden Dienstvertrag.

## Preis- und Lohnprüfung

Der neue Bereich stellt der bestehenden Betriebsrechnung einen veränderbaren Haushaltsmaßstab gegenüber. Er besitzt keinen Markt-Schreibzugriff und ändert keine Lohnverträge automatisch. Die **frei gewählte, noch unbestätigte Rechenskala** umfasst 24 KT wöchentlichen Grundbedarf für zwei Erwachsene und zwei Kinder sowie 3 KT für Besuche oder weitere Sparziele. Daraus ergibt sich ein Vergleichs-Hafenlohn von 27 KT über sechs Diensttage. Alle Budgetposten sind einzeln änderbar; weder die Summen noch die Budgetanteile gelten als bestätigte Preise.

Die Besuchsrechnung verwendet nur absatzabhängige Schank-/Restaurantkanäle. Zimmer, Salon und Bankett werden nicht in den Bon eines gewöhnlichen Besuchers eingerechnet. Sparwochen beziehen sich auf freie Mittel nach dem Grundbedarf, nicht auf den gesamten Lohn. Bei fehlendem Absatz oder null Budget entstehen offene Vergleichswerte statt Infinity/NaN. Kost und Logis werden weiterhin als Aufwand des Betriebs gezeigt; ihr Selbstkostenwert ist kein Bargeld, mit dem eine vierköpfige Familie versorgt werden kann.

Budgetänderungen gelten nur in der Ansicht, werden zurückgesetzt und im JSON-Export zusammen mit der Vergleichsrechnung festgehalten. Preisprüfung und Lohnabstimmung sind jetzt vorgenommen; tatsächliche Absatzmengen, Lieferantenrechnungen und Besitzwerte bleiben Modellannahmen. Ein hoher oder negativer Gewinn wird nicht auf einen gewünschten Familienrang zurechtgerechnet.

## Unterschiedliche Betriebe

- Zum Roten Tor besitzt eine eigene veränderbare Kalkulationsseite aus `modules/rotes-tor/tor-economy.mjs`. Sie berücksichtigt Familienarbeit, Cerys' Teilzeit, bezahlte Hoflieferungen, sechs Kammern, zehn Gastpferdeplätze und den begrenzten Bratentag. Der Buildbericht übernimmt solche bereits ausgearbeiteten Szenarien, statt sie mit einem generischen Profil zu überschreiben. Hofpersonal und Altenteil werden nicht als zusätzliche Beschäftigte gezählt.
- Die drei ursprünglichen Tavernen behalten ihre detaillierten Warenkörbe, Hotelkapazitäten und Familienarbeit. Ihre Auslastung entspricht nun einem gut besuchten Handelsort. Fehlende beziehungsweise entfernte Angebote erzeugen keinen erfundenen Verkauf; neue Hierarchiemitglieder können ohne Absturz ergänzt werden.
- Handel, Schmiede, Schneiderei, Badehaus und Zucht besitzen getrennte Profile in `economy-venue-profiles.mjs`. Kein gemeinsamer Restaurantwarenkorb wird über alle Betriebe kopiert. Preisspannen verwenden eine ausdrücklich genannte geometrische Mitte als änderbare Preisannahme.
- Jede belegte Person wird einmal vergütet, auch bei mehreren Aufgaben. Tatsächlich unbenannte Stellen, etwa der Münze oder des Badehauses, zählen als Personal. „Freier Platz“, „unbesetzter Posten“ und reine Hierarchie-Vorlagen kosten keinen fiktiven Lohn. Haustiere bekommen nur Versorgung.
- Gesellschaftshäuser rechnen mit einem festen Geldbetrag und einem ausdrücklich angenommenen Erfolgsanteil der entsprechenden Beschäftigten. Der Umsatzanteil wird genau einmal als Personalaufwand gebucht. Eine Lohnänderung betrifft den festen Anteil und setzt den Erfolgsanteil nicht nochmals als Fixlohn an. Enthaltene Zimmer und alternative Abendpakete werden nicht doppelt verkauft.
- Endliche gerettete Flaschen besitzen einen `stockUnits`-Bestand je ausgewählter Verkaufseinheit. Die Projektion vermindert ihn bis null; er wird nicht jede Woche zurückgesetzt. Nicht erhältliche Biere bleiben ohne Umsatz. Die Rechnung verändert keinen echten Online-Bestand.
- Die Klingende Krone erhält Brauerei- und Vertriebsannahmen zusätzlich zum Ausschank. Gereifter Whisky kommt aus bestehenden Altbeständen; neue Destillation wird nicht sofort als fünfjährige Ware verkauft. Kosten langfristiger Reifebestände bleiben gesondert zu erheben.
- Bei Gildenbetrieben wird die Betriebskasse als Konto mit **null zusätzlichen Arbeitskräften** geführt. Finlay ist bezahlte Leitung; Eigentums- und Gewinnquoten zwischen ihm und der Gilde sind noch nicht festgelegt. Der ganze Überschuss wird weder ihm als Privatlohn noch der Münze als rechtlich bestätigtes Alleineigentum zugeschrieben.
- Owains Gestüt und seine Herberge besitzen noch keine glaubhaft ausgearbeitete Personalhierarchie. Die Rechnung kennzeichnet sechs beziehungsweise vier anonyme **Modellstellen**, keine neuen Figuren. Zwölf angenommene Zuchttiere, Futter und jährliche Verkäufe sind veränderbare Annahmen. Zimmer ohne veröffentlichten Preis erzeugen keinen fiktiven Umsatz. Ein mögliches Defizit bleibt sichtbar.
- Nicht erhobenes Vermögen wird als unbekannt angezeigt, nicht als tatsächliches Nullvermögen. Die ursprünglichen drei Besitzwertschätzungen bleiben ausdrücklich Annahmen.

## Rechnung

1. Schank-/Restaurantbesuche = Plätze × Belegungen × Auslastung × Öffnungstage.
2. Verkaufsmengen entstehen aus dem ausdrücklich angesetzten Warenkorb. Kammerkapazitäten, Monatskammern, Salonbuchungen und seltene Monatsangebote werden getrennt und begrenzt gerechnet. Ein Zimmer wird nicht gleichzeitig an Nacht- und Monatsgäste vermietet; enthaltenes Frühstück erzeugt keinen zweiten Umsatz.
3. Wareneinsatz = Absatz × zugrunde liegender Einkaufspreis ÷ (1 − Verlustquote). Ein hypothetischer höherer Kartenpreis erhöht nicht automatisch den Einkaufspreis. Importkosten bis zur Tür stecken bereits im Einkaufsanteil.
4. Vom Umsatz gehen endgültig erlassene/uneinbringliche Zechen ab. Reine Stundungen sind Forderungen, keine endgültigen Verluste.
5. Laufende Kosten umfassen Löhne, Verpflegung und Unterkunft, Sachkosten, Pacht, feste Gebühren, Schank-/Marktabgabe und Zinsen. Der optionale Kirchenbeitrag hat eine explizite Grundlage: positiver Überschuss oder tatsächliche Einnahmen.
6. Der Betriebsgewinn berücksichtigt angenommenen Wertverzehr. Der freie Geldfluss zieht Tilgung, einmalige Erneuerungsrücklage und private Familienentnahmen ab. Tilgung wird nicht als Gewinnaufwand behandelt.
7. Ein zusätzlicher wirtschaftlicher Gewinn zieht den fehlenden marktüblichen Geldlohn der Inhaber- und Familienarbeit ab. So wird ein nur durch niedrig vergütete Mitarbeit überlebender Betrieb erkennbar.
8. Monats- und Jahresprojektionen senken Restschuld und Zinskosten mit jeder Tilgung und stoppen Zahlungen bei null. Vermögensbestände werden nicht mit vier oder 52 multipliziert. Die Nachfrage bleibt in diesen Projektionen gleichmäßig; echte Saison- und Festtagskurven sind noch kein Bestandteil.

Die sechs weiteren Haushaltsprofile unterscheiden Geldeinkommen, Naturalversorgung, laufende Pflichten, privaten Unterhalt, Bargeld und gebundenes Nettovermögen. Eine einbehaltene Ernte wird nicht zusätzlich als Geldverkauf verbucht. Bei fehlender Naturalversorgung wird ein Zukauf angesetzt.

## Ownership und Integration

| Bereich | Zuständige Quellen |
| --- | --- |
| Datenmodell und Kalenderprüfung | `economy-model.mjs` |
| Reine Berechnung und Schuldprojektion | `economy-engine.mjs` |
| Personalabgleich und ausdrückliche Lohnansätze | `economy-workforce.mjs` |
| Hauskarten-Adapter und Szenarien | `economy-source-venues.mjs`, `economy-examples.mjs` |
| Abgrenzung, Betriebsprofile und generische Szenarien | `economy-venue-scope.mjs`, `economy-venue-profiles.mjs`, `economy-venue-scenario.mjs` |
| Gemeinsame Angebots- und Hierarchieauswertung | `economy-venue-offers.mjs`, `economy-venue-workforce.mjs`, `economy-venue-channels.mjs` |
| Allgemeine Haushaltsprofile | `economy-households.mjs` |
| Weltvorgaben und Ortskontext | `economy-world-context.mjs` |
| Veränderbarer Lebenshaltungsmaßstab und Kaufkraftprüfung | `economy-purchasing-power.mjs`, `economy-purchasing-view.mjs` |
| Seitenaufbau, Bilanzen, Löhne und Haushalte | `economy-*-view.mjs` |
| Lokaler Zustand, delegierte Eingaben und Cleanup | `economy-events.mjs` |
| Bestehende Modul-Editoren | `economy-editor.mjs` |
| Klassische Template-Registry | `economy-classic-api.mjs` und generiertes Bundle |

Ein einziger Feature-Namensraum `AleriaEconomy` verbindet ES-Module mit der bestehenden klassischen Registry. Die Inhaltsmigration übernimmt die einmalige Preisrevision, die Abschnittsmigration entscheidet anhand des tatsächlichen Reiters über eine letzte Kalkulationsseite. Bereits bearbeitete Kalkulationen bleiben erhalten; Szenen und Kommentar-Threadschlüssel werden nicht geändert. Der DOM-Zustand liegt im Feature-`WeakMap`; Mount/Unmount entfernen Listener über `AbortController`.

Die ehemalige automatisch angehängte allgemeine Kommentarseite ist projektweit aus der Seitennavigation entfernt. Ihr alter Editor-Schalter ist entfernt, alte `appendCommentsPage`-Werte sind wirkungslos. Szenenkommentare und vorhandene gespeicherte Beiträge werden nicht gelöscht.

## Erzeugen und prüfen

```powershell
node AleriaAlmanach/scripts/build-economy-price-reference.mjs
node AleriaAlmanach/scripts/build-economy-price-review.mjs
node AleriaAlmanach/scripts/build-economy-calculator.mjs
node AleriaAlmanach/scripts/build-economy-calculator.mjs --check
node --test --experimental-test-isolation=none AleriaAlmanach/tests/economy-calculator.test.mjs AleriaAlmanach/tests/economy-price-review.test.mjs
node AleriaAlmanach/tests/economy-calculator.browser.mjs
node AleriaAlmanach/tests/economy-venues.browser.mjs
```

Das lokale Erzeugen verwendet die vorhandene esbuild-Entwicklungsabhängigkeit. Die Produktionsprüfung braucht keinen zusätzlichen Compiler: Sie berechnet Beispiele und Bericht neu und prüft einen SHA-256-Beleg über sämtliche Bundle-Eingaben und das ausgelieferte Bundle. Ein geänderter Import oder eine geänderte Quelldatei erfordert einen neuen Build.

Der vollständige maschinenlesbare Rechenbeleg liegt unter `docs/economy/venue-calculations-2026-10-19.json`. Browserprüfungen verwenden einen lokalen Server, blockieren externe Schreibzugriffe und benötigen keinen Live-Account.

Für die Veröffentlichung müssen Frontend und `commitItemRegister` mit derselben neuen Standardversion ausgeliefert werden. Die Serverkopien der gemeinsamen Preisrevision werden durch den bestehenden Mechanik-Sync erzeugt. Alte Kaufbelege, individuelle Inventarwerte, Geldbestände, TP und Kampfhistorien werden durch diese reine Katalogrevision nicht umgeschrieben.
