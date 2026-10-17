const p = (...texts) => texts.map(text => `<p>${text}</p>`).join('');

export const ARENA_SCENES = Object.freeze([
  {
    id: 'kampfflaeche',
    title: 'Die Arena · Sand und Tore',
    intro: p(
      'Hinter dem geöffneten Gittertor liegt der helle Sand. Auf der gegenüberliegenden Seite wartet der zweite Einlass; darüber steigen die steinernen Zuschauerränge zum offenen Himmel auf. Schritte, ein Ruf und das Anschlagen einer Waffe tragen weit durch das Rund. Am Rand bleibt Raum für Schiedsleute und die Versorgung verletzter Kämpfer.',
      'Meist gehört die Fläche den Übungen und Wettkämpfen der örtlichen Kämpfergilde. Für Turniere des Hauses Draig wird sie dem jeweiligen Anlass entsprechend hergerichtet; bei besonders großen Theateraufführungen nehmen zeitweilige Spielpodeste und Kulissen den Platz der Kämpfer ein.',
      '<strong>Bei Gildenkämpfen:</strong> Tötung und Magie sind verboten, Auraeinsatz ist erlaubt. Eine Kapitulation beendet den Kampf sofort; Schiedsrichter sind unantastbar. Gekämpft wird mit unverzauberter Arenarüstung, die im Kampf angelegt bleibt, und Waffen aus dem gemeinsamen Waffenpool. Eigene Waffen sind ausgeschlossen. Aktive Kämpfer dürfen nicht wetten.',
      '<strong>Die Farben der Gilde:</strong> Blau kennzeichnet Heimkämpfer, Rot die Gäste, Gelb den Aufsteiger und Schwarz seinen Verteidiger. Schiedsrichter tragen Weiß.'
    ),
    hint: 'Die Szene im Rund beginnt.',
    emptyTitle: 'Der Sand ist noch unberührt',
    emptyText: 'Die Tore stehen bereit. Was heute in die Arena tritt, entscheidet die Szene.'
  },
  {
    id: 'tribuenen',
    title: 'Die Tribünen · Über dem Rund',
    intro: p(
      'Breite Steinstufen führen zwischen den Sitzreihen hinauf. Unter den hölzernen Dächern liegt Schatten, weiter unten fällt das Licht bis auf die vordersten Bänke. Von den erhöhten Plätzen lässt sich die gesamte Sandfläche überblicken; ein gedeckter Ehrenplatz ist für die Draigs und ihre Gäste vorgesehen.',
      'An Wettkampftagen ziehen Zurufe durch die Ränge. Zwischen den Begegnungen werden Aussichten verglichen, alte Niederlagen aufgewärmt und neue Bekanntschaften geschlossen. Derselbe Blick auf das Rund wird bei einem großen Schauspiel zum Blick auf eine Bühne.'
    ),
    hint: 'Eine Begegnung auf den Rängen.',
    emptyTitle: 'Noch sind die Ränge still',
    emptyText: 'Zwischen freien Bänken und steinernen Stufen wartet der nächste Besuch.'
  },
  {
    id: 'kaempferraeume',
    title: 'Die Kämpferräume · Vor dem Aufruf',
    intro: p(
      'Unter den Rängen liegen die Umkleiden und Vorbereitungsräume der Kämpfer. An langen Bänken werden Riemen nachgezogen und Arenarüstungen geprüft. Getrennte Ablagen halten die ausgegebene Ausrüstung bereit; aus dem Durchgang zum Sand fällt ein schmaler Streifen Tageslicht.',
      'Ein Wasserbecken, saubere Tücher und eine freie Liege bieten Platz für die erste Versorgung. Hinter einer Tür warten die Gäste auf ihren Aufruf, hinter einer anderen die Kämpfer Gwynthors. Vor dem Gang durch das Gitter bleibt Zeit für ein letztes Wort. Bei einer Theateraufführung dienen die Räume vorübergehend als Garderobe und Wartebereich hinter der Spielfläche.'
    ),
    hint: 'Vor dem Aufruf.',
    emptyTitle: 'Der nächste Aufruf steht noch aus',
    emptyText: 'Vom Rund her dringt gedämpfter Hall. Hier kann die Begegnung beginnen.'
  }
]);
