import { PATRIARCH, ARIANWEN, PEREDUR, ANGHARAD, CHURCH_SYMBOL, NINE_SYMBOL } from './cathedral-people.mjs';
const p = (...texts) => texts.map(text => `<p>${text}</p>`).join('');

export function buildPatriarchBiography() {
  return {
    crestImage: '../Stammbäume/assets/images/houses/Llamreis Ankunft/haus-saethwyr.png',
    portraitFormat: 'square',
    biographyTitle: 'Ein Hirte mit höfischer Erfahrung',
    biographyText: p(
      'Gwalchgwyn Saethwyr ist Patriarch von Celtigerns Wacht und der oberste Geistliche der Gemeinde Gwynthors. Von der Großen Kathedrale der Neun aus trägt er Verantwortung für Seelsorge, kirchliche Ordnung und die Menschen, die sich seinem Schutz anvertrauen. Innerhalb der cenyrischen Kirche gehört er zu den hohen Würdenträgern unter Erzpatriarch Yvain Neidr.',
      'Wer vor ihn tritt, begegnet einem erfahrenen Höfling, der zuhören kann. Er spricht ruhig, lässt Gedanken ausreifen und findet leicht den Weg zu einer Parabel. Mitunter bemerkt er selbst, dass er längst wieder predigt. Ein trockenes Schmunzeln nimmt seinen Worten die Schwere; seine Aufmerksamkeit verlieren sie dadurch selten.'
    ),
    abilitiesTitle: 'Was seinen Dienst prägt',
    abilities: [
      { title: 'Fürsorge, die etwas tut', icon: CHURCH_SYMBOL, detail: 'Er hört Bedürftige an, sorgt für Beistand und würdige Bestattungen und verlangt, dass zugesagte Hilfe die Menschen erreicht.' },
      { title: 'Geduld mit Haltung', icon: NINE_SYMBOL, detail: 'Er nimmt Schuld ernst, unterscheidet echte Reue von bloßer Furcht und begleitet Menschen auf einem Weg zurück ins Leben.' },
      { title: 'Ordnung im Gespräch', icon: CHURCH_SYMBOL, detail: 'Er sammelt unterschiedliche Stimmen, fragt nach Ursachen und hält hitzige Wortwechsel bei der gemeinsamen Aufgabe.' }
    ],
    historyTitle: 'Barmherzigkeit und Verantwortung',
    historyText: p(
      'Gwalchgwyn hat Krieg und menschliche Grausamkeit erlebt. Er beschönigt Verbrechen nicht und kann eine schwere Strafe befürworten. Doch er duldet ebenso wenig, dass gerechter Zorn in Freude am Leid umschlägt. Wer Waffen trägt oder über andere herrscht, schuldet für ihn gerade in der Wut Selbstbeherrschung.',
      'Seine Barmherzigkeit verlangt Wahrheit. Vergebung bedeutet ihm nicht, Unrecht gutzuheißen, und Scham ersetzt keine Wiedergutmachung. Ein Mensch muss seine Schuld benennen und Verantwortung übernehmen können. Gelingt dies, soll die Kirche ihn aufrichten. Gwalchgwyn zählt sich selbst zu den Fehlbaren; gerade deshalb erwartet er keine Heiligen, wenn jemand ihre Schwelle überschreitet.',
      'Im persönlichen Umgang ist er warm, familienverbunden und zu leiser Neckerei bereit. Jungen Menschen rät er zu überlegten Bindungen und zum Blick auf den Menschen hinter Namen und Ansehen. Zugleich kann aus dem freundlichen Ratgeber ein strenger Mahner werden, wenn Eitelkeit, Zorn oder ungezügelte Begierde die Pflichten verdrängen. Eine Einladung zum Gebet ist bei ihm gelegentlich auch die Ankündigung einer sehr gründlichen Aussprache.'
    ),
    worksTitle: 'Seine Verantwortung',
    works: [
      'Die geistliche Führung Gwynthors und Celtigerns Wacht sowie die Zusammenarbeit mit Prälaten und Gemeinden.',
      'Gottesdienste, Seelsorge, Gelübde und die persönliche Begleitung ihm anvertrauter Bußgänger.',
      'Die Anhörung kirchlicher Anliegen und der Austausch mit dem Haus Draig, ohne dessen weltliche Rechtsprechung an sich zu ziehen.',
      'Besuche bei Gemeinden, Armenfürsorge und die Prüfung praktischer Hilfe, Ausbildung und neuer Lebenswege.',
      'Die Führung seines persönlichen Stabes und die sichere Begleitung kirchlicher Reisen.'
    ],
    triviaTitle: 'Abseits des Amtes',
    trivia: [
      'Geboren 1680, gehört er dem Haus Saethwyr an. Mit Melyn, geborener Arth, hat er die Kinder Anwyll und Enora.',
      'Seine höfische Gewandtheit verbindet sich mit einer Vorliebe für bildhafte Vergleiche und einem gelegentlich sehr trockenen Humor.',
      'Große Berufungen verdienen für ihn Gehör; ihre Träger müssen sich dennoch in den kleinen Pflichten bewähren.'
    ],
    quotesTitle: 'Gwalchgwyn über den Glauben',
    quotes: ['„Man macht sich nicht sauber, bevor man ins Bad geht. Das Bad ist dazu da, einen sauber zu machen.“'],
    connectionsTitle: 'In seinem unmittelbaren Kreis',
    connections: [
      { name: PEREDUR.name, detail: PEREDUR.role, image: PEREDUR.portrait },
      { name: ANGHARAD.name, detail: ANGHARAD.role, image: ANGHARAD.portrait },
      { name: ARIANWEN.name, detail: 'Bußgängerin · unter seiner persönlichen geistlichen Leitung', image: ARIANWEN.portrait }
    ],
    documentsTitle: 'Kirche und Herkunft',
    documents: [
      { title: 'Der Alerische Klerus', icon: CHURCH_SYMBOL, text: 'Berufungen und kirchliche Rangordnungen.', link: '../Religionen/klerus/index.html' },
      { title: 'Haus Saethwyr', icon: '../Stammbäume/assets/images/houses/Llamreis Ankunft/haus-saethwyr.png', text: 'Gwalchgwyns Herkunft und Familie.', link: '../Stammbäume/Stammbaum.html?family=haus-saethwyr&mode=view&person=gwalchgwyn-saethwyr' }
    ],
    footer: PATRIARCH.role
  };
}
