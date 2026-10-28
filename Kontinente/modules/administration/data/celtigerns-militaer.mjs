const portraitRoot = '/Stammbäume/assets/images/portraits';
const marschall = 'Marschall der Grafschaft · Egon Gafyr';
const feldmarschall = 'Feldmarschall · Maredudd Draig';
const seemarschall = 'Seemarschall und Admiral · Huw Saethwyr';
const kommandant = 'Kommandant der Cochllamwyr und von Gwynthor · Ferydnand Gafyr';

function officer(id, title, name, house, description, reportsTo, options = {}) {
  return {
    id, title, name,
    portrait: `${portraitRoot}/haus-${house}/${id}.jpg`,
    description, reportsTo, tier: 'bronze',
    links: [{ label: 'Person in der Familienakte', href: `/Stammbäume/Stammbaum.html?family=haus-${house}&mode=view&person=${id}` }],
    ...options,
  };
}

function office(id, title, description, reportsTo, options = {}) {
  return { id, title, name: '', portrait: '', description, reportsTo, tier: 'bronze', ...options };
}

const fieldServices = [
  ['ermittler', 'Militärischer Ermittler', 'Klärt Vorfälle innerhalb des Wehrwesens auf, nimmt Aussagen auf und sichert Spuren. Bei Spionageverdacht arbeitet er mit dem Nachrichtennetz zusammen; zivile Verfahren bleiben bei der Justiz.', 'Kriegswart der Aufklärung', 'spionage', 'Nachrichtenaustausch'],
  ['inspektor', 'Inspektor der Wachen', 'Prüft unangekündigt Wachpläne, Dienstbereitschaft und Bestände. Er dokumentiert Mängel und legt die Ergebnisse der Marschallskanzlei und dem zuständigen Kriegswart vor.', marschall, 'gerichtsbarkeit', 'Prüfbare Dienstverstöße'],
  ['profoss', 'Profoss · militärischer Vollzug', 'Setzt rechtmäßig erteilte Dienstanordnungen um und verantwortet angeordnete Sicherstellungen und Arrestübergaben. Er entscheidet nicht selbst über Schuld oder Strafmaß.', 'Kriegswart der Disziplin', 'gerichtsbarkeit', 'Vollzug und Übergabe'],
  ['heeresschoeffe', 'Heeresschöffe', 'Berät die militärische Führung in Rechtsfragen und bereitet die sachliche Dokumentation von Feldgerichten vor. Die übergeordnete Grafschaftsjustiz bleibt für ihre Rechtsaufsicht zuständig.', marschall, 'gerichtsbarkeit', 'Feldgericht und Rechtsaufsicht'],
  ['botenmeister', 'Boten- und Signalmeister', 'Organisiert militärische Kurierlinien, Horn-, Fahnen- und Feuerzeichen. Ihm zugeordnet sind Signalmeister, Siegelwarte, Kartenmeister sowie die fachlich ausgebildeten Hundeführer und Falkner für Wach-, Spür- und Nachrichtendienste.', 'Kriegswart der Aufklärung', 'diplomatie', 'Kurier- und Zeichenordnung'],
  ['zeugmeister', 'Zeug- und Waffenmeister', 'Verantwortet Ausgabe, Bestand und Instandhaltung von Waffen, Rüstungen und Gerät. Waffenmeister prüfen, schärfen und pflegen das Material; Ausgaben und Verluste werden nachvollziehbar verzeichnet.', 'Kriegswart der Logistik', 'finanzen', 'Beschaffung und Bestandsnachweis'],
  ['quartiermeister', 'Quartier- und Proviantmeister', 'Plant Unterkünfte, Etappen, Fuhrpark und Verpflegung. Wagenmeister betreuen Fuhrwerke, Proviantmeister die Vorräte und Stallmeister Remonten, Futter und Hufschmiede. Die Dienste melden ihren Bedarf gemeinsam an die Logistik.', 'Kriegswart der Logistik', 'finanzen', 'Versorgung und Soldbedarf'],
  ['lehrhauptmann', 'Lehrhauptmann', 'Führt Übungen, Dienstunterweisungen und Befähigungsprüfungen durch. Er hält Ausbildungsstände fest und stimmt mit den Hauptleuten ab, welche Kräfte für ihren vorgesehenen Dienst bereit sind.', 'Kriegswart der Ausbildung', 'magie', 'Gemeinsame Einsatzübungen'],
  ['festungsbaumeister', 'Festungs- und Pioniermeister', 'Prüft Befestigungen, Wege und Übergänge. Brückenmeister betreuen Brücken und Stege, Fährmeister Übersetzpunkte, Belagerungsmeister die Belagerungsgeräte und Sappeurmeister Schanzwerk, Gräben und Minenarbeiten.', 'Kriegswart der Sicherheit · Versorgung über den Kriegswart der Logistik', 'finanzen', 'Bauaufträge und Material'],
  ['torhauptmann', 'Tor- und Kerkerdienst', 'Der Torhauptmann führt Durchlass, Schlagbäume und Torwachen; der Kerkermeister verantwortet Schlüssel, Zellen und die sichere Verwahrung rechtmäßig übergebener Gefangener. Beide halten ihre Dienst- und Übergabeverzeichnisse getrennt.', 'Örtlicher Kommandant · fachlich Sicherheit beziehungsweise Disziplin', 'gerichtsbarkeit', 'Durchlass und Verwahrung'],
  ['feldkaplan', 'Feldkaplan', 'Begleitet Eide, Seelsorge und die Betreuung der Wachen. Er wirkt im militärischen Umfeld, bleibt in geistlichen Angelegenheiten aber seiner kirchlichen Leitung verantwortlich.', marschall, 'klerus', 'Geistlicher Dienst im Heer'],
  ['feldscher', 'Feldscher', 'Versorgt Verwundete, führt Verbände und organisiert die geordnete Übergabe an weiterführende Heilkundige. Er meldet den Bedarf an Material und Versorgung über die Logistik.', 'Kriegswart der Logistik', 'klerus', 'Heilung und Fürsorge'],
  ['militaerherold', 'Herold des Marschallstabs', 'Verkündet militärische Anordnungen und betreut die Bannerordnung. Er stimmt öffentliche Bekanntmachungen mit der Heroldskanzlei ab und schafft keinen eigenen diplomatischen Dienstweg.', 'Kanzlei des Marschalls', 'diplomatie', 'Proklamation und Bannerordnung'],
];

const seaServices = [
  ['steuermann', 'Steuermann und Lotsendienst', 'Verantwortet Navigation, Seekarten und Lotung. Lotsen und Kartenmeistergehilfen unterstützen ihn; der Lotsenmeister organisiert sichere Ein- und Ausfahrten sowie Kenntnisse über Untiefen.', 'Jeweiliger Schiffskapitän · Lotsenwesen nach Hafenordnung', 'diplomatie', 'Sichere Ankunft von Gesandtschaften'],
  ['bootsmann', 'Bootsmann', 'Führt Decksdienst, Takelage und Bordwachen. Matrosen und Vorschoter erhalten ihre Arbeitsaufträge über ihn. Auf Ruderschiffen ordnet der Galeerenmeister Ruderbänke, Takt und Ruderdienst.', 'Jeweiliger Schiffskapitän', 'finanzen', 'Heuer- und Mannschaftsnachweise'],
  ['artilleriemeister', 'Artillerie- und Feuerwerksmeister zur See', 'Verantwortet Geschütze, Pulver, Lunten und sichere Lagerung. Kanoniere und Zündmeister arbeiten nach seiner Sicherheitsordnung; die Bezeichnungen Feuerwerker und Feuerwerksmeister bezeichnen denselben Fachbereich.', 'Jeweiliger Schiffskapitän · Fachaufsicht der Flottenführung', 'magie', 'Abstimmung gefährlicher Wirkmittel'],
  ['schiffszimmermeister', 'Schiffszimmermeister', 'Betreut Rumpf, Masten und Kalfaterarbeiten. Zimmerleute und Kalfaterer melden Schäden unmittelbar, damit Schiff und Besatzung einsatzfähig bleiben.', 'Jeweiliger Schiffskapitän', 'finanzen', 'Reparatur und Material'],
  ['schiffsarzt', 'Schiffsarzt und Schiffskaplan', 'Schiffsärzte, Feldscher zur See und Heilergehilfen versorgen die Besatzung. Der Schiffskaplan übernimmt Eide, Seelsorge und Seebestattungen; die geistliche Weisung bleibt bei der Kirche.', 'Jeweiliger Schiffskapitän · geistlich der zuständigen Kirchenleitung', 'klerus', 'Bordseelsorge und Verwundetenpflege'],
  ['werftmeister', 'Werftmeister', 'Plant Dockung, Neubau und Ausrüstung. Takelmeister, Segelmachermeister, Anker- und Kettenmeister sowie Bootsbauermeister bündeln ihre Arbeiten unter der Werftleitung.', seemarschall, 'finanzen', 'Werftaufträge und Haushaltsmittel'],
  ['hafenmeister', 'Hafenmeister und Hafenaufsicht', 'Verantwortet Liegeplätze, Kräne und Hafenordnung. Dockwarte und Kranführer führen die Arbeiten aus; Hafenaufseher kontrollieren Reede und Kais. Leuchtturmwarte halten Feuer und Sichtzeichen bereit, Strandvögte melden Wrackgut und Strandfälle.', seemarschall, 'gerichtsbarkeit', 'Hafen- und Strandrecht'],
  ['seeproviant', 'Proviant- und Quartiermeister zur See', 'Organisiert Rationen, Trinkwasser, Verladung und Unterkünfte am Kai. Wassermeister, Bäcker und Pökelmeister sichern die Vorräte; Magazinverwalter und Frachtmeister führen die zugehörigen Listen.', seemarschall, 'finanzen', 'Versorgung und Lagerrechnung'],
  ['seesignalmeister', 'Signalmeister zur See', 'Hält den Flottensignalcodex, Flaggen-, Laternen- und Hornsignale einheitlich. Er stimmt die Signalgebung zwischen Flaggschiffen, Flottillen und Häfen ab.', seemarschall, 'spionage', 'Abgestimmte Warnketten'],
  ['kaperbriefverwaltung', 'Kaperbrief- und Prisenverwaltung', 'Die Kaperbrief-Verwaltung dokumentiert gültige Aufträge und ihre Grenzen. Prisenmeister bewerten eingebrachtes Gut und bereiten genehmigte Versteigerungen vor. Über Rechtsansprüche entscheidet die zuständige Justiz; Erträge werden mit der Kämmerei abgerechnet.', seemarschall, 'gerichtsbarkeit', 'Prisenrecht und rechtmäßige Beschlagnahme'],
  ['zollvogt-kai', 'Zollvogt am Kai', 'Führt Beschau, Abgaben und Siegelnachweise in Abstimmung mit der Kämmerei. Die Flotte sichert den Hafen; die fachliche Abgabenrechnung gehört in die Finanzverwaltung.', seemarschall, 'finanzen', 'Kaiabgaben und Zollrechnung'],
  ['pressmeister', 'Pressmeister · Aufgebot zur See', 'Bereitet im ausdrücklich angeordneten Notfall das Aufgebot zur See vor und führt die Heuer- und Dienstlisten. Das Amt ist kein allgemeiner Auftrag, Reisende oder Hafenarbeiter eigenmächtig einzuziehen.', seemarschall, 'gerichtsbarkeit', 'Rechtsgrundlage des Notaufgebots'],
];

function serviceRoles(entries, prefix) {
  return entries.map(([id, title, description, reportsTo, area, label]) => office(
    `${prefix}-${id}`, title, description, reportsTo,
    { connections: [{ area, label, description: `Die zuständigen Stellen aus Militär und ${area === 'klerus' ? 'Klerus' : area === 'finanzen' ? 'Finanzverwaltung' : area === 'gerichtsbarkeit' ? 'Gerichtsbarkeit' : area === 'diplomatie' ? 'Heroldskanzlei' : area === 'magie' ? 'Magiedienst' : 'Nachrichtenwesen'} stimmen sich in diesem Aufgabenbereich ab.` }] },
  ));
}

export default {
  id: 'militaer',
  title: 'Militär',
  intro: 'Egon Gafyr führt als Marschall Heer, Wacht und Flotte der Grafschaft. Maredudd Draig verantwortet das landgebundene Wehrwesen, Huw Saethwyr die See. Persönliche Adjutanten sichern die Dienstwege. Die fünf Kriegswarte stehen im gleichen Rang und führen die Fachaufsicht; Kommandanten und ihre Offiziere setzen die Aufträge vor Ort um. Zur See führt die Befehlskette über Vizeadmiralin, Flottillen und Kapitäne. Eigene Mannschaftsbanner verbinden die Führungsschiffe mit ihren Besatzungen.',
  groups: [
    {
      id: 'militaer-oberbefehl', title: 'Marschall der Grafschaft', kind: 'leadership',
      description: 'Eine oberste militärische Instanz für Heer, Wacht und Flotte.',
      roles: [officer(
        'egon-gafyr', 'Marschall der Grafschaft', 'Egon Gafyr', 'gafyr',
        'Egon verantwortet die militärische Gesamtordnung Celtigerns Wacht. Er setzt die Vorgaben des Grafen um, bestimmt übergeordnete Einsatzschwerpunkte und führt Feld- und Seemarschall zusammen. Die eigenen Truppen und Befehlshaber der Vasallen bleiben örtlich organisiert und müssen ihm im Rahmen der Grafschaftsordnung Rechenschaft ablegen.',
        'Graf von Celtigerns Wacht',
        {
          tier: 'gold',
          authority: 'Oberste militärische Befehlsgewalt der Grafschaft im Auftrag des Grafen; zivile Rechtsprechung und Haushaltsbewilligung liegen bei den zuständigen Ämtern.',
          connections: [
            { area: 'finanzen', label: 'Sold und Wehrbedarf', description: 'Stimmt Mittel, Versorgung und Rüstungsvorhaben mit dem Kämmerer ab.' },
            { area: 'gerichtsbarkeit', label: 'Militärordnung und Recht', description: 'Wahrt die Zuständigkeit der Grafschaftsjustiz bei Rechtsfragen und Beschwerden.' },
            { area: 'diplomatie', label: 'Aufgebot und Bündnisdienst', description: 'Koordiniert die Umsetzung zugesagter militärischer Verpflichtungen mit der Heroldskanzlei.' },
          ],
        },
      )],
    },
    {
      id: 'militaer-marschaelle', title: 'Feldmarschall und Seemarschall', kind: 'leadership',
      description: 'Zwei getrennte Befehlsbereiche unter dem Grafschaftsmarschall: Land und See.',
      roles: [
        officer('maredudd-draig', 'Feldmarschall', 'Maredudd Draig', 'draig',
          'Führt die Landstreitkräfte, bereitet Aufstellungen und Feldzüge vor und verantwortet die Einsatzbereitschaft der Garnisonen. Die fünf Kriegswarte betreuen unter ihm Sicherheit, Logistik, Ausbildung, Aufklärung und Disziplin.', marschall,
          { tier: 'gold', connections: [{ area: 'spionage', label: 'Feldlage', description: 'Gleicht militärische Aufklärung mit den geprüften Lageberichten des Schattens ab.' }] }),
        officer('huw-saethwyr', 'Seemarschall und Admiral', 'Huw Saethwyr', 'saethwyr',
          'Führt Flotte, Küsten- und Seewacht und stimmt Einsätze, Hafenordnung und die Sicherheit der Seewege ab. Rhonwen leitet als Vizeadmiralin die operative Abstimmung; Niniane führt seine persönliche Adjutantur. Seine eigene Schiffsmannschaft erhält ein gesondertes Mannschaftsbanner.', marschall,
          { tier: 'gold', crew: { label: 'Schiffsmannschaft des Seemarschalls · vorbereitet' }, connections: [{ area: 'finanzen', label: 'Häfen und Versorgung', description: 'Stimmt Werftbedarf, Proviant, Heuer und Hafenabgaben mit der Kämmerei ab.' }] }),
      ],
    },
    {
      id: 'militaer-adjutanten', title: 'Adjutanten', kind: 'adjutant',
      description: 'Persönliche Stabsdienste der drei Marschälle. Adjutantur und Fachaufsicht der Kriegswarte sind getrennte Verantwortungen.',
      roles: [
        officer('rhys-draig', 'Adjutant des Feldmarschalls', 'Rhys Draig', 'draig',
          'Unterstützt Maredudd in der Tagesführung, bereitet Befehlsausgaben vor und verfolgt Rückmeldungen von Kriegswarten und Truppenführern. Er hält den Befehlslauf zusammen, ohne ein sechstes Kriegswartamt zu bilden.', feldmarschall, { tier: 'silver' }),
        officer('anaraut-draig', 'Adjutant des Marschalls', 'Anaraut Draig', 'draig',
          'Führt Egons persönliche militärische Korrespondenz, koordiniert Termine und hält gemeinsame Aufträge von Heer und Flotte nach. Vertretungsbefugnisse entstehen nur aus einem konkreten Auftrag des Marschalls.', marschall, { tier: 'silver' }),
        officer('niniane-chwedlonol', 'Adjutantin des Seemarschalls', 'Niniane Chwedlonol', 'chwedlonol',
          'Hält Huws persönliche Befehle, Termine und Rückmeldungen zusammen und vermittelt zwischen Admiral, Vizeadmiralin und Flottenführung. Ihre Adjutantur ersetzt Rhonwens operatives Flottenkommando nicht. Auch Niniane erhält eine eigene, gesondert vorbereitete Schiffsmannschaft.', seemarschall,
          { tier: 'silver', crew: { label: 'Ninianes Schiffsmannschaft · vorbereitet' } }),
      ],
    },
    {
      id: 'militaer-kriegswarte', title: 'Die fünf Kriegswarte', kind: 'core',
      description: 'Fünf gleichrangige Fachämter unter dem Feldmarschall. Sie geben fachliche Vorgaben; die unmittelbare Truppenführung verbleibt bei Kommandanten und Offizieren.',
      roles: [
        officer('gwaeron-awenor', 'Kriegswart der Sicherheit', 'Gwaeron Awenor', 'awenor',
          'Verantwortet Wachordnung, Burgen, Stadttore und Grenzposten. Er prüft Schutzpläne und Dienstbereitschaft und stimmt Vorgaben mit den örtlichen Kommandanten ab. Wach- und Sicherungsaufträge werden über deren Befehlskette umgesetzt.', feldmarschall,
          { tier: 'silver', connections: [{ area: 'gerichtsbarkeit', label: 'Wache und Recht', description: 'Stimmt rechtmäßige Sicherungen und die Übergabe festgehaltener Personen mit der Justiz ab.' }] }),
        officer('ffraid-awenor', 'Kriegswartin der Logistik', 'Ffraid Awenor', 'awenor',
          'Bündelt Proviant, Fuhrwesen, Lager und Material. Zeug-, Quartier- und Proviantmeister melden Bestände und Bedarf an sie. Sie plant die Versorgung, während die Kämmerei die bewilligten Mittel und Rechnungen verantwortet.', feldmarschall,
          { tier: 'silver', connections: [{ area: 'finanzen', label: 'Wehrhaushalt', description: 'Legt Bedarf, Ausgabenbelege und Bestandsnachweise zur gemeinsamen Abrechnung vor.' }] }),
        officer('duncan-gafyr', 'Kriegswart der Ausbildung', 'Duncan Gafyr', 'gafyr',
          'Führt die Fachaufsicht über Schulen, Übungen und militärische Ausbildung. Er stimmt Ausbildungsziele mit den Kommandanten ab und lässt Lehrhauptleute und Instruktoren die Befähigung der Truppen prüfen.', feldmarschall,
          { tier: 'silver', connections: [{ area: 'magie', label: 'Abgestimmte Ausbildung', description: 'Organisiert die notwendige Zusammenarbeit zwischen bewaffneten Kräften und den zuständigen Magiediensten.' }] }),
        office('militaer-kriegswart-aufklaerung', 'Kriegswart der Aufklärung',
          'Verantwortet militärisches Botenwesen, Signalordnung, Karten und Aufklärung. Er führt die fachlichen Dienste zusammen und prüft, welche Erkenntnisse für Aufstellung, Marsch und Schutz der Truppen relevant sind. Die Person ist noch nicht benannt.', feldmarschall,
          { tier: 'silver', connections: [{ area: 'spionage', label: 'Gemeinsame Lage', description: 'Tauscht geprüfte Hinweise mit Efaels Aufklärungsnetz aus; militärische Befehle bleiben im Heer.' }] }),
        officer('derfel-awenydd', 'Kriegswart der Disziplin', 'Derfel Awenydd', 'awenydd',
          'Beaufsichtigt militärische Dienstordnung, Inspektionen und geordneten Vollzug. Er dokumentiert Verstöße und sorgt für nachvollziehbare Verfahren. Heeresschöffen beraten in Rechtsfragen; rechtliche Zuständigkeiten der Grafschaftsjustiz bleiben erhalten.', feldmarschall,
          { tier: 'silver', connections: [{ area: 'gerichtsbarkeit', label: 'Verfahren und Rechtsaufsicht', description: 'Übergibt Beschwerden und zuständige Verfahren an die Justiz und dokumentiert militärische Entscheidungen.' }] }),
      ],
    },
    {
      id: 'militaer-kommandanten', title: 'Kommandanten', kind: 'service',
      description: 'Das unmittelbare Kommando über benannte Verbände und Standorte.',
      roles: [officer('ferydnand-gafyr', 'Kommandant der Cochllamwyr und von Gwynthor', 'Ferydnand Gafyr', 'gafyr',
        'Ferydnand führt die Cochllamwyr und das Kommando von Gwynthor. Er setzt Einsatz- und Wachvorgaben praktisch um, verteilt Kräfte und verantwortet die Bereitschaft seines Verbands. Unmittelbar unter ihm stehen zwei Stellvertreter und danach die vier Hauptmänner der Cochllamwyr.', feldmarschall,
        { authority: 'Operatives Kommando im zugewiesenen Verband und Standort; fachliche Vorgaben der Kriegswarte bleiben verbindlich.' })],
    },
    {
      id: 'militaer-cochllamwyr-stellvertreter', title: 'Zwei Stellvertreter der Cochllamwyr', kind: 'service',
      description: 'Die neu ergänzte Stellvertretungsebene steht unmittelbar unter Ferydnand und über den vier Hauptmännern des Verbands. Die Personen sind noch nicht benannt.',
      roles: [1, 2].map(number => office(`cochllamwyr-stellvertreter-${number}`, `${number}. Stellvertreter des Kommandanten`,
        'Unterstützt Ferydnand bei Dienstplanung, Einsatzbereitschaft und der Weitergabe von Befehlen an die vier Hauptmänner. Übernimmt das Kommando nur im Rahmen einer ausdrücklich geregelten Vertretung. Beide Stellvertreter stehen auf derselben Amtsebene; die Zählung kennzeichnet die zwei Stellen.', kommandant)),
    },
    {
      id: 'militaer-cochllamwyr-hauptmaenner', title: 'Vier Hauptmänner der Cochllamwyr', kind: 'service',
      description: 'Eigene Hauptmannsebene des Verbands, nach den beiden Stellvertretern und vor den allgemeinen Hauptleuten. Personen und einzelne Abteilungsnamen bleiben offen.',
      roles: [1, 2, 3, 4].map(number => office(`cochllamwyr-hauptmann-${number}`, `${number}. Hauptmann der Cochllamwyr`,
        'Führt einen zugewiesenen Teil der Cochllamwyr, organisiert dessen Wach- und Übungsdienst und meldet Bereitschaft, Bedarf und Vorkommnisse entlang der Verbandskette. Die vier Hauptmänner sind gleichrangig; die Zählung erfindet keine besonderen Abteilungsnamen.', 'Kommandant der Cochllamwyr · Dienstweg über seine Stellvertreter')),
    },
    {
      id: 'militaer-hauptleute', title: 'Allgemeine Hauptleute', kind: 'service',
      description: 'Erst nach der eigenen Kommandokette der Cochllamwyr folgen die allgemeinen örtlichen Hauptmannsämter.',
      roles: [office('militaer-allgemeine-hauptleute', 'Hauptleute der Orte und Garnisonen',
        'Führen die ihnen zugeteilten Kräfte einer Siedlung, Burg oder Garnison, setzen Wachpläne um und melden Ausfälle, Bedarf und besondere Vorfälle. Sie sind keine zusätzlichen Hauptmänner der Cochllamwyr. Einzelne Stellen und Personen werden nach ihren tatsächlichen örtlichen Zuständigkeiten ergänzt.', 'Jeweiliger örtlicher Kommandant · übergeordnet dem Feldmarschall')],
    },
    {
      id: 'militaer-banner-und-offiziere', title: 'Bannerführer, Offiziere und Unteroffiziere', kind: 'service',
      description: 'Die Führung kleinerer Einheiten folgt unterhalb der jeweiligen Hauptleute.',
      roles: [
        office('militaer-bannerfuehrer', 'Bannerführer', 'Führt eine zugewiesene Einheit unter ihrem Banner und hält Aufstellung, Zeichen und Sammelpunkte ein. Er empfängt Befehle vom zuständigen Hauptmann.', 'Zuständiger Hauptmann'),
        office('militaer-leutnant', 'Leutnant und Wachoffizier', 'Unterstützt den zuständigen Hauptmann, überwacht einzelne Dienste und übernimmt ausdrücklich zugeteilte Vertretungen. Er bleibt innerhalb der örtlichen Befehlskette.', 'Zuständiger Hauptmann'),
        office('militaer-unteroffizier', 'Unteroffiziere und Stabsleute', 'Führen die unmittelbaren Dienstgruppen, kontrollieren Ausrüstung und Anwesenheit und halten die Verbindung zwischen Offizier und Mannschaft.', 'Zuständiger Bannerführer oder Offizier'),
      ],
    },
    {
      id: 'militaer-landdienste', title: 'Fachdienste des Heeres und der Wacht', kind: 'service',
      description: 'Ausführende und beratende Ämter. Fachaufsicht, örtlicher Dienstweg und die Zusammenarbeit mit anderen Verwaltungsbereichen bleiben erkennbar.',
      roles: serviceRoles(fieldServices, 'landdienst'),
    },
    {
      id: 'militaer-flottenstab', title: 'Operative Flottenführung', kind: 'service',
      description: 'Die Seeordnung besitzt ihre eigene operative Kette unter Huw. Der überlieferte Rang Rhonwens bleibt erhalten.',
      roles: [officer('rhonwen-chwedlonol', 'Vizeadmiralin', 'Rhonwen Chwedlonol', 'chwedlonol',
        'Rhonwen führt die operative Abstimmung der Flotte, koordiniert Geschwader und überwacht die Umsetzung von Huws Einsatzvorgaben. Ihr überlieferter Rang ist Vizeadmiralin. Die persönliche Adjutantur Ninianes und die Befehlsverantwortung Rhonwens sind getrennte Aufgaben.', seemarschall)],
    },
    {
      id: 'militaer-flottillen', title: 'Fünf Flottillenadmiräle', kind: 'service',
      description: 'Die fünf bereits angelegten Flottillenstellen stehen unter der operativen Flottenführung. Jede erhält ein vorbereitetes eigenes Mannschaftsbanner; Namen, Schiffe und Einsatzräume sind noch offen.',
      roles: [1, 2, 3, 4, 5].map(number => office(`militaer-flottillenadmiral-${number}`, `${number}. Flottillenadmiral`,
        'Führt die ihm zugewiesene Flottille, ordnet ihren Befehlslauf und hält die Einsatzbereitschaft ihrer Schiffe nach. Stabskapitäne und Regimentschreiber zur See unterstützen Disziplin, Protokoll und Meldungen. Eine eigene Flaggschiffsmannschaft ist vorbereitet; ihre Besetzung und ihr Schiff sind noch nicht benannt.', 'Vizeadmiralin Rhonwen Chwedlonol · übergeordnet Huw Saethwyr',
        { crew: { label: `Schiffsmannschaft der ${number}. Flottille · vorbereitet` } })),
    },
    {
      id: 'militaer-seekommandanten', title: 'See- und Küstenkommandanten', kind: 'service',
      description: 'Örtliche See- und Küstenaufträge werden unter der Flottenführung umgesetzt. Glastraeth ist als Standort genannt; die Person ist nicht überliefert.',
      roles: [
        office('militaer-seekommandant', 'Seekommandant eines Geschwaders', 'Führt ein zugewiesenes Geschwader oder eine Division und setzt Gefechts- und Marschordnung um. Die Kapitäne behalten das unmittelbare Bordkommando auf ihren Schiffen.', 'Zuständiger Flottillenadmiral · operative Führung durch die Vizeadmiralin'),
        office('militaer-kuestenkommandant-glastraeth', 'Küstenkommandant von Glastraeth', 'Verantwortet Küstenwacht, Sperrketten und Reedeaufsicht im zugewiesenen Küstenbereich. Küstenwachtmeister und Patrouillenboote setzen die örtlichen Aufträge um; die Person ist noch nicht benannt.', seemarschall,
          { connections: [{ area: 'spionage', label: 'Küstenwarnung', description: 'Gibt verdächtige Anlandungen und gefährdete Seewege an das Nachrichtennetz weiter.' }] }),
      ],
    },
    {
      id: 'militaer-kapitaene', title: 'Kapitäne zur See', kind: 'service',
      description: 'Meredithe und Idwal stehen als Kapitäne nebeneinander. Die genaue Flottillenzuordnung bleibt offen, solange sie nicht festgelegt ist.',
      roles: [
        officer('meredithe-1677-chwedlonol', 'Kapitänin zur See', 'Meredithe Chwedlonol', 'chwedlonol',
          'Führt das ihr zugeteilte Schiff, verantwortet dessen Seetüchtigkeit, Bordordnung und Gefechtsführung und leitet ihre Bordoffiziere. Ein Schiffsname und eine bestimmte Flottillenzuordnung sind hier noch nicht überliefert.', 'Zuständiges See- oder Flottillenkommando · übergeordnet Huw Saethwyr',
          { crew: { label: 'Meredithes Schiffsmannschaft · vorbereitet' } }),
        officer('idwal-draig', 'Kapitän der Tiefenwyrm', 'Idwal Draig', 'draig',
          'Idwal führt die schwere Kriegskogge Tiefenwyrm mit ihrer bestehenden Besatzung von fünfzig Mitgliedern. Vom Hafen Gwynthors aus dient sie dem Küstenschutz, der Piratenbekämpfung und dem Geleitschutz. Das Mannschaftswappen öffnet das bereits vorhandene Almanach-Modul.', 'Zuständiges See- oder Flottillenkommando · übergeordnet Huw Saethwyr',
          {
            crew: { label: 'Mannschaft der Tiefenwyrm', href: '/AleriaAlmanach/AleriaAlmanach.html?entry=idwals-schiffsmannschaft', image: '/Kontinente/modules/administration/assets/tiefenwyrm-mannschaft.png' },
            links: [{ label: 'Idwals Schiffsmannschaft im Almanach', href: '/AleriaAlmanach/AleriaAlmanach.html?entry=idwals-schiffsmannschaft' }, { label: 'Idwal in der Familienakte', href: '/Stammbäume/Stammbaum.html?family=haus-draig&mode=view&person=idwal-draig' }],
            connections: [{ area: 'spionage', label: 'Meldungen von See', description: 'Gibt Beobachtungen über Piraterie, fremde Schiffe und gefährdete Küstenwege an die Flottenführung weiter.' }],
          }),
      ],
    },
    {
      id: 'militaer-seedienste', title: 'Bordämter, Häfen und Dienste zur See', kind: 'service',
      description: 'Die Schiffsmannschaften besitzen ihre eigenen Bordämter. Hafen-, Werft- und Versorgungsdienste unterstützen sie unter der Seeordnung.',
      roles: serviceRoles(seaServices, 'seedienst'),
    },
  ],
  sources: [
    { label: 'Bisherige Marschall-, Feld- und Seeordnung', href: '/Kontinente/modules/administration/content/militaer.html' },
    { label: 'Haus Draig · Familienakte', href: '/Stammbäume/Stammbaum.html?family=haus-draig&mode=view' },
    { label: 'Haus Gafyr · Familienakte', href: '/Stammbäume/Stammbaum.html?family=haus-gafyr&mode=view' },
    { label: 'Haus Saethwyr · Familienakte', href: '/Stammbäume/Stammbaum.html?family=haus-saethwyr&mode=view' },
    { label: 'Haus Chwedlonol · Familienakte', href: '/Stammbäume/Stammbaum.html?family=haus-chwedlonol&mode=view' },
    { label: 'Idwals Schiffsmannschaft · Tiefenwyrm', href: '/AleriaAlmanach/AleriaAlmanach.html?entry=idwals-schiffsmannschaft' },
  ],
};
