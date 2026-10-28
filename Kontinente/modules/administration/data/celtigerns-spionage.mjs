const portraitRoot = '/Stammbäume/assets/images/portraits/haus-gwyllach';

function member(id, title, name, description, reportsTo, options = {}) {
  return {
    id,
    title,
    name: `${name} Gwyllach`,
    portrait: `${portraitRoot}/${id}.jpg`,
    description,
    reportsTo,
    links: [{
      label: 'Person in der Familienakte',
      href: `/Stammbäume/Stammbaum.html?family=haus-gwyllach&mode=view&person=${id}`,
    }],
    ...options,
  };
}

export default {
  id: 'spionage',
  title: 'Spionage',
  intro: 'Die Augen und Ohren des Drachen verbinden Hof, Städte, Handelswege und Grenzlande. Rhovan Gwyllach führt das Nachrichtennetz im Auftrag des Grafen. Sein Adjutant hält Meldungen und Aufträge zusammen; fünf gleichrangige Netzmeister verantworten die Fachbereiche. Die Kutscher- und Fuhrmannszunft bietet Kontakte und Wege, ersetzt aber weder die Gerichte noch den militärischen Oberbefehl. Die örtlichen Dienste arbeiten innerhalb klarer Aufträge; jüngere Angehörige erhalten begrenzte Sonderaufgaben.',
  groups: [
    {
      id: 'schattenleitung',
      title: 'Der Schatten des Grafen',
      kind: 'leadership',
      description: 'Die oberste Nachrichteninstanz der Grafschaft verantwortet Quellen, Prioritäten und die Weitergabe gesicherter Erkenntnisse.',
      roles: [member(
        'rhovan-gwyllach',
        'Schatten des Grafen',
        'Rhovan',
        'Rhovan (*1659, 81 Jahre) ist das amtierende Oberhaupt der Gwyllach. Er bestimmt die Schwerpunkte des Nachrichtennetzes, schützt seine Quellen und legt dem Grafen die Lage dar. Er trennt unbestätigte Gerüchte von belastbaren Erkenntnissen und entscheidet, welcher Fachbereich einen Auftrag übernimmt.',
        'Graf von Celtigerns Wacht',
        {
          authority: 'Leitet das Nachrichtennetz der Grafschaft. Er erteilt keine Gerichtsurteile und hebt weder die Befugnisse des Justiziars noch die Befehlskette der Marschälle auf.',
          connections: [
            { area: 'militaer', label: 'Gefahrenlage', description: 'Gibt Warnungen über feindliche Bewegungen und gefährdete Wege an die Marschälle weiter.' },
            { area: 'gerichtsbarkeit', label: 'Belastbare Erkenntnisse', description: 'Übergibt prüfbare Hinweise an die Justiz; die rechtliche Entscheidung bleibt beim Justiziar.' },
            { area: 'diplomatie', label: 'Vertrauliche Lageberichte', description: 'Stimmt die Bewertung auswärtiger Nachrichten mit der Heroldskanzlei ab.' },
          ],
        },
      )],
    },
    {
      id: 'schattenadjutantur',
      title: 'Adjutantur',
      kind: 'adjutant',
      description: 'Die Adjutantur führt die laufenden Aufträge zusammen und stellt eine nachvollziehbare Weitergabe sicher.',
      roles: [member(
        'meirion-gwyllach',
        'Adjutant des Schattens',
        'Meirion',
        'Meirion (*1710, 30 Jahre), Sohn Drystans und zweiter vorgesehener Erbe des Hauses, führt Auftragslisten, bereitet Lagebesprechungen vor und hält die Verbindung zwischen Rhovan, den fünf Netzmeistern und den örtlichen Zellen. Er verfolgt Fristen und Rückmeldungen, ohne die fachliche Verantwortung der Netzmeister zu übernehmen.',
        'Schatten des Grafen · Rhovan Gwyllach',
        { authority: 'Koordiniert im Auftrag Rhovans. Eine Vertretung der Leitung erfordert dessen ausdrücklichen Auftrag.' },
      )],
    },
    {
      id: 'fuenf-netzmeister',
      title: 'Die fünf Netzmeister',
      kind: 'core',
      description: 'Fünf gleichrangige Fachämter unter dem Schatten des Grafen. Kein Netzmeister ist den übrigen vier vorgesetzt.',
      roles: [
        member(
          'efael-gwyllach',
          'Netzmeister der Aufklärung',
          'Efael',
          'Efael (*1692, 48 Jahre), Sohn Rhydderchs, behält die Aufklärung. Er plant Beobachtungen, prüft die Verlässlichkeit von Quellen und führt Meldungen über Fremde, Truppenbewegungen und drohende Gefahren zusammen. Seine Kundschafter beschaffen Erkenntnisse; sie eröffnen keine eigenmächtigen Feldzüge.',
          'Schatten des Grafen · Rhovan Gwyllach',
          {
            connections: [
              { area: 'militaer', label: 'Kundschaft und Warnung', description: 'Liefert den Kriegswarten und örtlichen Befehlshabern geprüfte Lagehinweise.' },
              { area: 'magie', label: 'Ungewöhnliche Spuren', description: 'Zieht die zuständigen Magier hinzu, wenn Beobachtungen einer arkanen Prüfung bedürfen.' },
            ],
          },
        ),
        member(
          'talaneth-gwyllach',
          'Netzmeisterin der Gegenspionage',
          'Talaneth',
          'Talaneth (*1681, 59 Jahre), gebürtige Gwyllach und Tochter Rhydderchs, überwacht den Schutz des eigenen Nachrichtennetzes. Sie prüft verdächtige Kontaktketten, erkennt mögliche Täuschungen und begrenzt den Zugang zu vertraulichen Informationen auf die jeweils Zuständigen.',
          'Schatten des Grafen · Rhovan Gwyllach',
          {
            authority: 'Prüft die Sicherheit von Quellen und Meldungen. Verdachtsfälle gegen Personen werden der zuständigen Justiz vorgelegt.',
            connections: [
              { area: 'diplomatie', label: 'Sichere Verbindungen', description: 'Berät die Herolde zum Schutz vertraulicher Nachrichten und zur Prüfung fragwürdiger Kontakte.' },
              { area: 'gerichtsbarkeit', label: 'Verdachtsprüfung', description: 'Gibt belastbare Verdachtsmomente weiter, ohne selbst über Schuld zu entscheiden.' },
            ],
          },
        ),
        member(
          'meredydd-gwyllach',
          'Netzmeister der Fahndung',
          'Meredydd',
          'Meredydd (*1683, 57 Jahre), Sohn Rhydderchs, behält die Fahndung. Er führt Personenbeschreibungen, vermisste Personen und angeordnete Suchaufträge zusammen. Seine Leute verfolgen Spuren und Aufenthaltsorte; Festnahmen erfolgen nur im Rahmen der zuständigen Vollzugsgewalt.',
          'Schatten des Grafen · Rhovan Gwyllach',
          {
            authority: 'Verantwortet Suche und Ermittlung. Haftbefehle, Vernehmungsanordnungen und Urteile bleiben Sache der Justiz.',
            connections: [
              { area: 'gerichtsbarkeit', label: 'Fahndungsaufträge', description: 'Übernimmt rechtmäßig angeordnete Suchaufträge und übergibt Ergebnisse an die Gerichte.' },
              { area: 'finanzen', label: 'Abgabenbetrug und Schmuggel', description: 'Prüft Hinweise der Kämmerei gemeinsam mit den zuständigen Zoll- und Justizstellen.' },
            ],
          },
        ),
        member(
          'anelen-gwyllach',
          'Netzmeisterin der Wege und Nachrichten',
          'Anelen',
          'Anelen (*1687, 53 Jahre), gebürtige Gwyllach und Tochter Rhovans, hält Kurierwege, Übergabepunkte und örtliche Kontakte zusammen. Sie legt fest, wie dringende Meldungen den Hof erreichen, und hält für unterbrochene Verbindungen sichere Ausweichwege bereit.',
          'Schatten des Grafen · Rhovan Gwyllach',
          {
            connections: [
              { area: 'diplomatie', label: 'Botenwege', description: 'Stimmt vertrauliche Zustellungen mit der Heroldskanzlei ab.' },
              { area: 'finanzen', label: 'Handels- und Zollwege', description: 'Gleicht Gefahrenmeldungen mit Zollstellen und der Kämmerei ab.' },
              { area: 'militaer', label: 'Warnketten', description: 'Sichert die rasche Weitergabe bestätigter Warnungen an Garnisonen und Flotte.' },
            ],
          },
        ),
        member(
          'drystan-gwyllach',
          'Netzmeister der Beweise',
          'Drystan',
          'Drystan (*1685, 55 Jahre), Sohn Rhovans und vorgesehener Erbe des Hauses, behält die Beweisführung. Er bewahrt Originalmeldungen, vermerkt Herkunft und Übergaben und trennt Beobachtung, Aussage und Schlussfolgerung. So bleibt erkennbar, welche Erkenntnisse vor Gericht einer Prüfung standhalten können.',
          'Schatten des Grafen · Rhovan Gwyllach',
          {
            authority: 'Verantwortet Sicherung und Nachvollziehbarkeit der Unterlagen. Über ihre rechtliche Verwertbarkeit entscheiden die Gerichte.',
            connections: [
              { area: 'gerichtsbarkeit', label: 'Beweiskette', description: 'Übergibt Belege mit dokumentierter Herkunft an die zuständige Gerichtsstelle.' },
              { area: 'magie', label: 'Fachprüfung', description: 'Lässt ungewöhnliche oder möglicherweise veränderte Spuren durch zuständige Fachkundige prüfen.' },
            ],
          },
        ),
      ],
    },
    {
      id: 'oertliche-zellen',
      title: 'Örtliche Zellen und Meldestellen',
      kind: 'service',
      description: 'Die örtlichen Verantwortlichen bündeln Meldungen ihres Einsatzraums. Fachaufträge erhalten sie vom jeweils zuständigen Netzmeister; Prioritäten und Konflikte klärt die Adjutantur.',
      roles: [
        member(
          'talyfer-gwyllach',
          'Zellenführer für Burg und Hof',
          'Talyfer',
          'Talyfer (*1708, 32 Jahre), Sohn Meredydds, koordiniert die Meldestelle im Umfeld von Burg und Hof. Er hält Kontakte zu Bediensteten und Lieferanten, erfasst ungewöhnliche Vorgänge und leitet Hinweise an den passenden Fachbereich weiter.',
          'Adjutantur des Schattens · fachlich dem zuständigen Netzmeister',
          { connections: [{ area: 'unterhaltung', label: 'Hofveranstaltungen', description: 'Stimmt Hinweise auf Gefahren bei Festen und öffentlichen Auftritten mit deren Verantwortlichen ab.' }] },
        ),
        member(
          'saerwyn-gwyllach',
          'Zellenführerin für Stadt und Markt',
          'Saerwyn',
          'Saerwyn (*1710, 30 Jahre), Tochter Meredydds, bündelt Meldungen aus Gwynthors Straßen, Märkten und Herbergen. Sie hält den Kontakt zu Fuhrleuten und Reisenden und unterscheidet alltägliches Marktgerede von Hinweisen, die eine weitere Prüfung rechtfertigen.',
          'Adjutantur des Schattens · fachlich dem zuständigen Netzmeister',
          { connections: [{ area: 'finanzen', label: 'Märkte und Handel', description: 'Gibt Hinweise auf Schmuggel oder falsche Abgabenbelege an Fahndung und Kämmerei weiter.' }] },
        ),
        member(
          'olyndor-gwyllach',
          'Zellenführer für Grenzorte und Fernwege',
          'Olyndor',
          'Olyndor (*1713, 27 Jahre), Sohn Drystans, hält die Meldestellen entlang der Fernwege und an den Grenzorten zusammen. Er sammelt Berichte über gesperrte Wege, verdächtige Durchreisen und ausgebliebene Kuriere und meldet dringende Gefahren entlang der vereinbarten Warnkette.',
          'Adjutantur des Schattens · fachlich dem zuständigen Netzmeister',
          { connections: [{ area: 'militaer', label: 'Grenzmeldungen', description: 'Leitet bestätigte Gefahren an die örtlichen Befehlshaber weiter; deren militärische Befehlsgewalt bleibt bestehen.' }] },
        ),
      ],
    },
    {
      id: 'sonderdienste',
      title: 'Sonderrollen und Ausbildung',
      kind: 'special',
      description: 'Persönliche Dienste mit begrenztem Auftrag und ohne eigenes Führungsamt. Die Angehörigen unter 27 Jahren führen weder einen Fachbereich noch eine Ortszelle; Ausbildung und Befugnisse richten sich nach dem konkreten Auftrag.',
      roles: [
        member(
          'rhufaed-gwyllach',
          'Nachtgreif · gesicherte Zugriffe',
          'Rhufaed',
          'Rhufaed (*1715, 25 Jahre), Sohn Drystans, gehört zu den Nachtgreifen. Dieser Sonderdienst begleitet ausdrücklich angeordnete Sicherungen, schützt die Übergabe empfindlicher Belege und unterstützt den zuständigen Vollzug bei vorbereiteten Zugriffen. Er ist kein eigener Polizeibefehl und keine Ermächtigung zu heimlichen Verhaftungen.',
          'Netzmeister der Fahndung · Meredydd Gwyllach',
          {
            authority: 'Handelt nur mit klar benanntem Auftrag und in Abstimmung mit der zuständigen Justiz- oder Wachstelle.',
            connections: [{ area: 'gerichtsbarkeit', label: 'Geordneter Vollzug', description: 'Unterstützt rechtmäßig angeordnete Sicherungen und Übergaben unter Verantwortung der zuständigen Vollzugsstelle.' }],
          },
        ),
        member(
          'meirawen-gwyllach',
          'Ermittlerin',
          'Meirawen',
          'Meirawen (*1716, 24 Jahre), Tochter Efaels und Zwillingsschwester Morwellas, prüft einzelne Hinweise, gleicht Aussagen ab und dokumentiert Widersprüche. Sie arbeitet an zugewiesenen Fällen und legt ihre Ergebnisse dem Netzmeister der Beweise vor.',
          'Netzmeister der Beweise · Drystan Gwyllach',
          { authority: 'Ermittelt im zugewiesenen Fall; sie verfügt weder über ein eigenes Netz noch über richterliche Befugnisse.' },
        ),
        member(
          'morwella-gwyllach',
          'Fahnderin',
          'Morwella',
          'Morwella (*1716, 24 Jahre), Tochter Efaels und Zwillingsschwester Meirawens, verfolgt konkrete Suchaufträge. Sie gleicht Personenbeschreibungen und Reisehinweise ab und meldet mögliche Aufenthaltsorte, bevor der zuständige Vollzug tätig wird.',
          'Netzmeister der Fahndung · Meredydd Gwyllach',
          { authority: 'Führt zugewiesene Fahndungen aus und meldet Ergebnisse; keine eigenständige Haft- oder Befehlsgewalt.' },
        ),
        member(
          'eryndor-gwyllach',
          'Kundschafter',
          'Eryndor',
          'Eryndor (*1720, 20 Jahre), Sohn Drystans, übernimmt begrenzte Erkundungsaufträge auf bekannten Wegen. Er beobachtet Reisebedingungen und erkennbare Gefahren und liefert kurze, überprüfbare Meldungen. Umfang und Begleitung seiner Aufträge bestimmt der Netzmeister der Aufklärung.',
          'Netzmeister der Aufklärung · Efael Gwyllach',
          { authority: 'Hat einen persönlichen Beobachtungsauftrag und führt keine eigene Zelle.' },
        ),
        member(
          'liora-gwyllach',
          'Kuriergehilfin in Ausbildung',
          'Liora',
          'Liora (*1723, 17 Jahre), Tochter Drystans, lernt das Nachrichtenwesen an sicheren örtlichen Botengängen, Abschriften und Empfangsvermerken. Sie arbeitet unter Aufsicht, befördert keine gefährlichen Geheimaufträge und wird weder zu Zugriffen noch zu Erkundungen in Gefahrengebieten eingesetzt.',
          'Netzmeisterin der Wege und Nachrichten · Anelen Gwyllach',
          { authority: 'Begrenzte Hilfs- und Lernaufgaben unter Aufsicht, ohne eigene Weisungsbefugnis.' },
        ),
      ],
    },
  ],
  sources: [
    { label: 'Haus Gwyllach · vollständige Hausseite', href: '/Familien%20H%C3%A4user%20und%20Clans/kleinehaeuser.html?haus=haus-gwyllach' },
    { label: 'Haus Gwyllach · Familienakte und Lebensdaten', href: '/Stammbäume/Stammbaum.html?family=haus-gwyllach&mode=view' },
    { label: 'Bisherige Schattenordnung · belegte Amtsinhaber', href: '/Kontinente/modules/administration/content/spionage.html' },
  ],
};
