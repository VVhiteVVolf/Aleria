// Biografie nach den Benutzervorgaben vom 12.09.2026.
// Gemeinsames Biografieschema mit vorhandenen CK2-Trait-Icons.
export const ARMEL_BALCHDER_BIOGRAPHY = {
  schema: 'aleria.biography-module',
  schemaVersion: 1,
  stats: [
    { label: 'Name', value: 'Sir Armel Balchder' },
    { label: 'Geboren', value: '1717' },
    { label: 'Alter im Jahr 1740', value: '23 Jahre' },
    { label: 'Haus', value: 'Haus Balchder' },
    { label: 'Heimat', value: 'Gwynthor, Celtigerns Wacht · Cenyr' },
    { label: 'Stand', value: 'Ritter · formeller Ritterschlag' },
    { label: 'Klasse', value: 'Uchelwyr · kaum praktische Kampferfahrung' },
    { label: 'Ausbildung', value: 'Balchder-Schule · Rechnen, Wirtschaft und Verwaltung' },
    { label: 'Eltern', value: 'Avan Balchder und Ronda Rhyddid' },
    { label: 'Rittervater', value: 'Dalvin Balchder · Großvater und Vorbild' },
    { label: 'Tätigkeit', value: 'Geschäftspartner und informeller Vermögensverwalter Tudwal Draigs' },
    { label: 'Zukunft', value: 'Angehender Vogt · möglicherweise im Dienst von Haus Draig' },
    { label: 'Reittier', value: 'Herzogsschimmer' }
  ],
  quote: 'Natürlich könnt Ihr Euch das leisten. Ich rechne nur nach, ob Ihr es Euch auch zweimal leisten könnt.',
  quoteBy: 'Armel Balchder zu Tudwal Draig',
  biography: {
    portraitStages: ['', '', '', ''],
    sideWidth: 100,
    connectionPortraitHeight: 78,
    connectionTextOffset: 0,
    biographyTitle: 'Armel Balchder – Feder, Zahlen und ein gutes Maß',
    biographyText: '<p><strong>Sir Armel Balchder</strong> trägt seinen Ritterstand mit der Selbstverständlichkeit eines Mannes, der seine eigentlichen Leistungen auf einem anderen Gebiet erbringt. Der Sohn von <strong>Avan Balchder</strong> und <strong>Ronda Rhyddid</strong> besitzt einen scharfen Verstand, einen ausgeprägten Sinn für Qualität und die bemerkenswerte Fähigkeit, auch in einer sehr angenehmen Gesellschaft noch an eine unvollendete Abrechnung zu denken. Sein rötliches Haar, der sorgfältige Schnurrbart und das dunkle, goldverzierte Gewand geben ihm ein gepflegtes, etwas selbstzufriedenes Auftreten. Meist steht dahinter schlicht die Überzeugung, seine Sache gründlich durchdacht zu haben.</p><p>In der Mathematik und in wirtschaftlichen Fragen ist Armel ein <strong>außergewöhnliches Genie</strong>. Er versteht Zahlen ebenso wie die Zusammenhänge dahinter: wann ein Gewinn nur auf dem Papier besteht, welche Ausgabe sich langfristig trägt und weshalb ein ansehnliches Vermögen trotzdem schlecht verwaltet sein kann. Er arbeitet hart, ausdauernd und häufig länger, als seine Umgebung für vernünftig hält. Eine offene Rechnung lässt sich für ihn schwerer beiseiteschieben als ein versäumtes Waffentraining.</p><p>Im Umgang ist er anständig und respektvoll. Armel möchte niemanden kleinmachen. Dennoch kann er ausgesprochen besserwisserisch wirken, besonders wenn ihm die richtige Antwort so offensichtlich erscheint, dass er gar nicht auf den Gedanken kommt, seine Erklärung könnte herablassend klingen. Sein Geschmack und seine vornehme Art geben solchen Momenten einen versnobbten Anstrich. Manchmal bemerkt er die Wirkung seiner Worte erst, wenn das Gespräch bereits merklich kühler geworden ist.</p>',
    abilitiesTitle: 'Persönlichkeit',
    abilities: [
      {
        title: 'Genial',
        detail: 'Mathematische Zusammenhänge, Vermögensfragen und wirtschaftliche Entwicklungen erfasst Armel mit ungewöhnlicher Klarheit. Er kann rechnen und zugleich beurteilen, was eine Zahl für ein Geschäft tatsächlich bedeutet. Seine Begabung kommt besonders in Planung und Verwaltung zur Geltung.',
        icon: '../IconOrdner/Traits%20Icon/Genius.png'
      },
      {
        title: 'Fleißig bis zur Arbeitsbesessenheit',
        detail: 'Er übernimmt Verantwortung und bleibt an einer Aufgabe, bis sie sauber erledigt ist. Bei der Arbeit fehlt ihm bisweilen das Maß, das er beim Genuss so sicher findet: Nach einer abgeschlossenen Rechnung fällt ihm zuverlässig noch etwas ein, das ebenfalls heute erledigt werden könnte.',
        icon: '../IconOrdner/Traits%20Icon/Diligent.png'
      },
      {
        title: 'Maßvoll',
        detail: 'Armel weiß, wann er genug hat. Ein ausgezeichneter Wein, ein gutes Essen oder ein kostbares Stück bereiten ihm große Freude; sobald er zufrieden ist, braucht er keine Steigerung mehr. Er kann sich etwas gönnen, ohne dem nächsten Genuss hinterherzulaufen.',
        icon: '../IconOrdner/Traits%20Icon/Temperate.png'
      },
      {
        title: 'Wohlwollend',
        detail: 'Hinter seinem gelegentlich belehrenden Ton steht ehrliche Hilfsbereitschaft. Er begegnet anderen grundsätzlich anständig und respektvoll. Tudwal greift er mit erheblichem persönlichem Einsatz unter die Arme, weil ihm der Freund und dessen Zukunft wichtig sind.',
        icon: '../IconOrdner/Traits%20Icon/Kind.png'
      },
      {
        title: 'Kultivierter Genießer',
        detail: 'Er schätzt gute Verarbeitung, gepflegte Kleidung und einen gelungenen Abend. Wenn er sich etwas gönnt, wählt er bewusst etwas Hochwertiges und genießt es mit voller Aufmerksamkeit. Sein Sinn für Qualität ist ausgeprägter als sein Bedürfnis nach Menge.',
        icon: '../IconOrdner/Traits%20Icon/Groomed.png'
      },
      {
        title: 'Versnobbt und besserwisserisch',
        detail: 'Armel hält den eigenen Geschmack und seine gut begründeten Urteile leicht für selbstverständlich. Dann erklärt er ungefragt, verbessert zu ausführlich oder klingt gönnerhaft. Eine Beleidigung beabsichtigt er dabei nicht; dass sich jemand herabgewürdigt fühlen könnte, bemerkt er gelegentlich überhaupt nicht.',
        icon: '../IconOrdner/Traits%20Icon/Proud.png'
      }
    ],
    historyTitle: 'Dalvins Enkel und Schüler der Balchder',
    historyText: '<p>Armel wuchs als Sohn <strong>Avan Balchders</strong> und <strong>Ronda Rhyddids</strong> im Umfeld eines Hauses auf, dessen Wahlspruch <strong>„Feder und Pflicht.“</strong> seinem Wesen ausgesprochen entgegenkommt. Sein Großvater <strong>Dalvin Balchder</strong>, Ritterherr des Hauses und Vogt von Haus Draig, wurde sein Rittervater. Für Armel ist Dalvin bis heute das große Vorbild: ein Mann, dessen Verantwortung weit über die eigene Waffenhand hinausreicht.</p><p>Armel erhielt einen <strong>formellen Ritterschlag</strong> und zählt zu den <strong>Uchelwyr</strong>. Die ritterliche Unterweisung hinterließ bei ihm jedoch wenig, worauf sich im Ernstfall verlassen ließe. Waffenführung gehörte zu seiner Ausbildung; eine ausgeprägte kämpferische Befähigung oder anhaltende Übung entstand daraus kaum. Ob er das Kämpfen längst abgelegt oder sich niemals ernsthaft darauf eingelassen hat, macht für seinen heutigen Alltag wenig Unterschied. Vermutlich könnte ihn selbst ein gewöhnlicher Milwr oder Waffenknecht besiegen. Armel empfindet diese Aussicht nicht als persönliche Kränkung. Das Kämpfen interessiert ihn schlicht nicht genug, um seine Zeit darauf zu verwenden.</p><p>Parallel zu dieser Unterweisung besuchte er die <strong>Balchder-Schule</strong>. Dort lag das Feld, auf dem aus seiner Begabung ein Handwerk wurde: rechnen, ordnen, wirtschaftliche Zusammenhänge verstehen und Verantwortung für eine Verwaltung übernehmen. Hier arbeitet Armel mit einem Eifer, den man bei seinen Waffenübungen vergeblich gesucht hätte. Sein Weg führt zum <strong>Vogtsamt</strong>. Vielleicht wird er eines Tages sogar wie Dalvin für <strong>Haus Draig</strong> tätig sein. Noch ist das eine Zukunftsaussicht; die Arbeit, die ihn dafür befähigen soll, nimmt er bereits sehr ernst.</p>',
    worksTitle: 'Können & Fachgebiete',
    works: [
      'Mathematik & Rechnungswesen · Außergewöhnliche Begabung für Zahlen, Kalkulationen und das Erkennen wirtschaftlicher Zusammenhänge. Armel prüft sowohl eine Rechnung als auch die Annahmen, auf denen sie beruht.',
      'Wirtschaft & Vermögensverwaltung · Behält Einnahmen, Ausgaben, Verpflichtungen und die langfristige Tragfähigkeit eines Vorhabens im Blick. Dieses Können setzt er bereits für Tudwal Draig ein.',
      'Verwaltung · An der Balchder-Schule ausgebildet und auf eine Zukunft als Vogt ausgerichtet. Sorgfalt, Arbeitsdisziplin und die Bereitschaft, sich auch mit unscheinbaren Einzelheiten zu befassen, prägen seine Arbeit.',
      'Ritterstand · Formell geschlagener Uchelwyr mit geringer praktischer Kampfbefähigung. Sein Titel bietet keinen verlässlichen Hinweis darauf, wie er sich in einem wirklichen Gefecht schlagen würde.'
    ],
    extraSections: [
      {
        title: 'Tudwals Freund, Geschäftspartner und Trauzeuge',
        position: 'afterWorks',
        mode: 'text',
        text: '<p><strong>Tudwal Draig</strong> ist Armels bester Freund. Zugleich sind die beiden Geschäftspartner, und Armel kümmert sich in erheblichem Umfang um <strong>Tudwals Vermögen und wirtschaftliche Angelegenheiten</strong>. Die Zuständigkeit ist nicht in jeder Hinsicht offiziell geregelt. Im Alltag übernimmt Armel dennoch weit mehr als einen gelegentlichen prüfenden Blick auf eine Rechnung: Er denkt mit, rechnet nach, plant voraus und greift Tudwal tatkräftig unter die Arme.</p><p>Die Freundschaft verträgt seine Korrekturen vermutlich auch deshalb so gut, weil hinter ihnen verlässlicher Einsatz steht. Armel bleibt bei einer Schwierigkeit, bis eine brauchbare Lösung gefunden ist. Wer ihn nur bei einer seiner etwas zu ausführlichen Erläuterungen hört, könnte die Wärme übersehen, die sich bei ihm besonders deutlich im Handeln zeigt.</p><p>Nun ist Armel auch <strong>Tudwals Trauzeuge</strong>. Zu seinen ohnehin vollen Arbeitstagen kommen die Aufgaben rund um die Hochzeit. Er hat entsprechend viel um die Ohren und nimmt diese persönliche Verpflichtung ebenso gewissenhaft wie seine Geschäfte. Für einen Mann, der Arbeit nur ungern liegen lässt, ist die Verbindung aus Freundschaft, Verantwortung und Hochzeitsvorbereitungen ein sehr wirksamer Weg zu einem vollen Kalender.</p>'
      },
      {
        title: 'Genuss mit einem Ende',
        position: 'afterWorks',
        mode: 'text',
        text: '<p>Armel kann sich ein gutes Leben schmecken lassen. Wenn er sich etwas gönnt, soll es ausgezeichnet sein: ein sorgfältig zubereitetes Essen, ein wirklich guter Wein, Kleidung mit schöner Verarbeitung. Er kennt den Unterschied zwischen einer Ausgabe, die nur Eindruck macht, und einer, an der er selbst Freude hat. Dass beides gelegentlich zusammenfällt, stört ihn selbstverständlich nicht.</p><p>Dabei besitzt er ein verlässliches Gefühl für <strong>das richtige Maß</strong>. Ein gelungener Abend muss nicht immer länger, teurer oder ausgelassener werden. Ist Armel zufrieden, dann ist er zufrieden. Er kann das Glas stehen lassen und eine schöne Gelegenheit auskosten, ohne sie erschöpfen zu müssen. Bei seinen Vergnügungen gelingt ihm dieses Aufhören deutlich leichter als am Schreibtisch.</p>'
      },
      {
        title: 'Ein Herzogsschimmer für einen Mann mit Geschmack',
        position: 'afterWorks',
        mode: 'text',
        text: '<p>Armel reitet einen <strong>Herzogsschimmer</strong>. Sein Pferd ist gut, edel und nicht übermäßig verspielt. Es passt zu einem Reiter, der zuverlässig ankommen, dabei ordentlich aussehen und sich anschließend wieder seinen eigentlichen Aufgaben widmen möchte.</p><p>Ganz ohne Eitelkeit ist diese Wahl allerdings nicht getroffen. Der Herzogsschimmer besitzt genügend Glanz, dass Armel ihn mit erkennbarem Vergnügen vorzeigen kann. Er schätzt den praktischen Nutzen und freut sich zugleich darüber, wenn jemand die Qualität bemerkt. Aus dem edlen Ross lässt sich nur kein besonderes Interesse seines Besitzers an ritterlichen Kämpfen ableiten.</p>'
      }
    ],
    triviaTitle: 'Marotten & Eigenarten',
    trivia: [
      'Kann eine Rechenfrage beiläufig beantworten und erst hinterher bemerken, dass überhaupt niemand um eine Prüfung gebeten hatte.',
      'Sagt gelegentlich „Das ist ganz einfach“ vor einer Erklärung, die seine Zuhörer keineswegs einfach finden.',
      'Hat für ein weiteres Glas ein höfliches Nein übrig. Bei einer weiteren unerledigten Aufgabe fällt ihm dieselbe Antwort erheblich schwerer.',
      'Nimmt ein Lob für sein Pferd gern an und kann anschließend erstaunlich genau erklären, weshalb es eine vernünftige Wahl war.',
      'Würde eine Niederlage gegen einen Waffenknecht vermutlich gelassener hinnehmen als einen vermeidbaren Fehler in einer von ihm geprüften Abrechnung.',
      'Seine gut gemeinten Verbesserungen klingen manchmal wie ein Urteil. Die freundliche Absicht hält er dabei für so offensichtlich, dass er sie selten eigens erklärt.'
    ],
    quotesTitle: 'In eigenen Worten',
    quotes: [
      '„Ein ausgezeichnetes Glas ist ein Vergnügen. Das nächste ist keine Verpflichtung.“',
      '„Ihr führt das Schwert gewiss besser als ich. Wollen wir nun die Rechnung ansehen?“',
      '„Tudwal, ich bin Euer Trauzeuge. Selbstverständlich habe ich Zeit. Ich muss sie nur noch finden.“'
    ],
    connectionsTitle: 'Familie & Freundschaft',
    connections: [
      { type: 'connection', name: 'Avan Balchder', image: '../Stammbäume/assets/images/portraits/haus-rhyddid/avan-balchder.jpg', imageFormat: 'portrait', detail: 'Armels Vater; Sohn Dalvin Balchders und Teil der Hauptlinie des Hauses Balchder.' },
      { type: 'connection', name: 'Ronda Rhyddid', image: '../Stammbäume/assets/images/portraits/haus-rhyddid/ronda-rhyddid.jpg', imageFormat: 'portrait', detail: 'Armels Mutter. Durch sie ist er mit Haus Rhyddid verbunden.' },
      { type: 'connection', name: 'Dalvin Balchder', image: '../Stammbäume/assets/images/portraits/haus-balchder/dalvin-balchder.jpg', imageFormat: 'portrait', detail: 'Großvater, Rittervater und großes Vorbild. Als Vogt von Haus Draig verkörpert er die Aufgabe, in die Armel eines Tages selbst hineinwachsen möchte.' },
      { type: 'connection', name: 'Tudwal Draig', image: '../Stammbäume/assets/images/portraits/haus-draig/tudwal-draig.jpg', imageFormat: 'portrait', detail: 'Bester Freund und Geschäftspartner. Armel verwaltet informell sein Vermögen, kümmert sich um seine wirtschaftlichen Angelegenheiten und ist bei seiner bevorstehenden Hochzeit der Trauzeuge.' }
    ],
    documentsTitle: 'Haus & Reittier',
    documents: [
      { title: 'Haus Balchder', icon: '../Stammbäume/assets/images/houses/Llamreis%20Ankunft/haus-balchder.png', link: '../Stammbäume/Stammbaum.html?family=haus-balchder&mode=view&person=armel-balchder', text: 'Seine Familie, Dalvins Vorbild und die Schule, in der Armel sein wirtschaftliches Handwerk erlernte.' },
      { title: 'Herzogsschimmer', icon: '../Bestiarium/assets/icons/pferde.webp', link: '../Bestiarium/tiere/pferde/herzogsschimmer/index.html', text: 'Die edle Pferderasse seines Reittiers im Bestiarium.' }
    ],
    footer: 'Personenakte · Sir Armel Balchder · Haus Balchder'
  }
};
