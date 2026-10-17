// Editorial content from the user's Freya brief, separate from publication and genealogy.
export const FREYA_TRAITS = [
  { title: 'Künstlerisches Genie', icon: 'Genius', detail: 'Freya denkt in Bildern, Versen und Melodien. Skizzieren, Malen, Schreiben und Singen sind für sie verschiedene Ausdrucksformen derselben unerschöpflichen Einbildungskraft.' },
  { title: 'Geborene Skaldin', icon: 'Poet', detail: 'Lyrik, Eddas, Musik und Geschichte begeistern sie. Besonders tragische Helden bringen ihre Fantasie zum Glühen: Kaum hört sie ihre Geschichte, hat sie Ideen für ein Lied, ein Gedicht und ein Gemälde.' },
  { title: 'Gesellig und lebensfroh', icon: 'Gregarious', detail: 'Die extrovertierte Frohnatur sucht Begegnungen, bringt sich lebhaft ein und steckt andere mit ihrer Begeisterung an. Eine fremde Kultur verspricht ihr neue Freunde und neue Geschichten.' },
  { title: 'Wohlwollend und nachsichtig', icon: 'Kind', detail: 'Freya sucht zuerst das Gute im Gegenüber. Sie ist wenig nachtragend, findet, dass jeder eine Chance verdient, und bemüht sich auch dann um Fairness, wenn ihre eigenen Wünsche sie verführen.' },
  { title: 'Vertrauensvoll und unerfahren', icon: 'Trusting', detail: 'Ihre Offenheit macht sie zugänglich, aber auch leichtsinnig. Ihr fehlt praktische Erfahrung im Feld; die Aussicht auf eine große Geschichte kann Warnzeichen und die Absichten anderer überstrahlen.' },
  { title: 'Abenteuerhungrig', icon: 'Adventurer', detail: 'Sie will die andere Seite der Welt sehen, Kulturen kennenlernen, mythischen Kreaturen begegnen und infernale Wesen überlisten. Die Gefahren dahinter wirken auf sie oft wie der verheißungsvolle Anfang eines Liedes.' },
  { title: 'Unabhängiger Freigeist', icon: 'Willful', detail: 'Freya möchte selbst entdecken, wie und mit wem sie leben will. Ehe, ein sesshaftes Leben und die Zukunftsplanung ihres Clans engen ihre Vorstellungen ein; Zuneigung bedeutet für sie nicht, die eigene Freiheit aufzugeben.' },
  { title: 'Charmant und flirtfreudig', icon: 'Charismatic_negotiator', detail: 'Sie spielt gern mit Worten, Nähe und ihrer weiblichen Ausstrahlung und weiß, dass Charme Türen öffnet. Dabei ist sie keine Heilige: Manchmal weckt sie Hoffnungen, die sie selbst noch gar nicht erfüllen möchte.' },
  { title: 'Theatralisch und exzentrisch', icon: 'Rowdy', detail: 'Freya spricht in Sinnbildern und schmückt selbst gerade erst geschehende Ereignisse aus. Ihr Hang zur Dramaturgie kennt bisweilen kein Ende; Theater und Satire sind ihr ebenso lieb wie das große Heldenlied.' },
  { title: 'Friedliebend auf ihre Art', icon: 'Affectionate', detail: 'Streit und peinliche Spannungen sind ihr unangenehm. Statt sie auszuhalten, stimmt sie gelegentlich ein Lied an, um die Lage zu entspannen – mit mäßigem Erfolg und nicht immer zum passenden Zeitpunkt.' },
  { title: 'Wacher musikalischer Instinkt', icon: 'Quick', detail: 'Dank ihres absoluten Gehörs erfasst sie Tonhöhen und Melodien unmittelbar. Obwohl sie Notenschrift beinahe wie eine Sprache beherrscht, findet sie ein gehörtes Stück am leichtesten direkt am Instrument wieder.' },
  { title: 'Mutig bis zur Unbedachtheit', icon: 'Brave', detail: 'Jugendlicher Eifer und künstlerische Begeisterung treiben sie voran. Wo erfahrene Reisende erst die Lage prüfen würden, hört Freya manchmal schon den Refrain ihres künftigen Abenteuers.' }
];

const paragraphs = (...text) => text.map(value => `<p>${value}</p>`).join('\n');
export const FREYA_PROSE = {
  biographyTitle: 'Freya Skald – Ein Leben voller ungesungener Lieder',
  biographyText: paragraphs(
    'Freya Skald ist eine zwanzigjährige Skaldin aus Klangheim, Tochter des weltberühmten Ragnar Skald und der furchtlosen Lagertha Eisenjungfer. In ihr treffen die künstlerische und magische Tradition ihres Vaters auf den Mut ihrer Mutter – doch Freya möchte aus diesem Erbe ihr ganz eigenes Leben machen.',
    'Sie liebt Lyrik, Musik, Kunst, Kultur und Geschichte. Eine ruhmreiche Erzählung über einen tragischen Helden genügt, und in ihrem Kopf entstehen bereits eine Edda, ein Lied und die Komposition eines Gemäldes. Noch sind vieles davon Einfälle und Vorhaben: Ihre Vorstellungskraft eilt der gelebten Erfahrung weit voraus.',
    'Am liebsten würde sie die Welt mit offenen Augen, einer Laute im Gepäck und genügend Zeit für jede neue Begegnung durchstreifen. Sie möchte fremde Kulturen in sich aufnehmen und als Kunst weitergeben, große Helden besingen und vielleicht eines Tages selbst in einer Geschichte weiterleben.'),
  abilitiesTitle: 'Persönlichkeit',
  historyTitle: 'Herkunft & Ausbildung',
  historyText: paragraphs(
    'Freya wurde 1720 geboren und wuchs im Umfeld des Clans Skald in Klangheim auf, im Thanentum Skaldenheim in Roriksheim, Aldrimar. Ragnar Skald und Lagertha Eisenjungfer haben sieben Kinder: Bjoern, Gyda, Ubbe, Hvitserk, Sigurd, Ivar und als jüngste Freya. Ihr familiäres Umfeld verbindet skaldische Kunst mit der kriegerischen Tradition der Eisenjungfern.',
    'Ihre Ausbildung zur Skaldin erhielt sie an der Skaldenakademie von Klangheim. Verschiedene Dozenten und Lehrmeister unterwiesen sie sowohl in den musikalischen Künsten als auch in deren magischen Möglichkeiten. Zur Ausbildung gehörte für sie mehr als das Beherrschen eines Instruments: Stimme, Dichtung und Musik wurden Teil ihrer skaldischen Ausdruckskraft.',
    'Auch ihre Brüder hatten großen Anteil an ihrer musikalischen und magischen Entwicklung. Ragnar prägte sie ebenfalls, obwohl ihn seine Aufgaben meist weit in den Nordosten Aldrimars führen, an den Hof des Königs bei der Hauptstadt.',
    'Von Lagertha lernte sie die Kampfweise der Skjoldr mit Schwert und Schild. Freya ist darin ganz passabel und kann sich als Schildmaid ausrüsten; ihre eigentliche Leidenschaft liegt jedoch in Musik, Magie und Kunst. Die Ausbildung ersetzt bislang keine umfassende praktische Erfahrung auf gefährlichen Reisen.'),
  worksTitle: 'Künste, Begabungen & Vorhaben',
  works: [
    '<strong>Stimme und absolutes Gehör:</strong> Freya singt, erkennt Tonhöhen sicher und kann gehörte Melodien besonders rasch nachspielen. Ihre Vertrautheit mit Noten ergänzt diesen unmittelbaren Zugang.',
    '<strong>Instrumente:</strong> Sie findet zu beinahe jedem bequem tragbaren Instrument Zugang – zumindest scheint es oft so. Dass sie tatsächlich jedes Instrument der Welt beherrscht, wäre eine ihrer eigenen hübschen Übertreibungen. Ihr Lieblingsinstrument und ständiger Begleiter ist die Laute.',
    '<strong>Wort und Bild:</strong> Sie schreibt, dichtet, skizziert und malt. Kultur, Geschichte und die Schicksale großer Gestalten liefern ihr Stoff für Lyrik, Eddas, Lieder und Bilder.',
    '<strong>Skaldische Magie:</strong> Musikalische und magische Unterweisung greifen bei ihr ineinander. Akademie und Familie legten die Grundlage; Erfahrung im wirklichen Abenteuer muss sie noch sammeln.',
    '<strong>Noch ungeschriebene Werke:</strong> Ihr Kopf steckt voller Entwürfe für Heldengesänge und Gemälde. Große vollendete Epen oder ruhmreiche eigene Taten sind damit noch nicht belegt.'
  ],
  triviaTitle: 'Eigenarten & Marotten',
  trivia: [
    'Rotes Fleisch liegt ihr wenig. Sie bevorzugt Fisch, Geflügel und anderes mageres Fleisch.',
    'Ihre Laute ist meist dabei; auch andere handliche Instrumente ziehen sie sofort an.',
    'Bei Streit oder unangenehmer Stille beginnt sie manchmal zu singen. Nicht jedes Gegenüber empfindet das als Hilfe.',
    'Sie kommentiert das Leben gern in Bildern und dramatischen Wendungen, als spiele sich gerade ein Theaterstück ab.',
    'Theater und Satire begeistern sie ebenso wie feierliche Heldendichtung.',
    'Gefühlt halb Klangheims Junggesellen haben bereits um ihre Hand angehalten. Freya weiß mit ernsthaften Anträgen oft weniger anzufangen als mit einem spielerischen Flirt.',
    'Ihr unbekümmerter Umgang mit Erotik, Körperlichkeit und Freizügigkeit irritiert bisweilen Fenrir, ihre Eltern und Geschwister. Sie unterschätzt, wie ernst andere ihre Signale nehmen oder wie unbehaglich ihnen die Offenheit ist.',
    'Eine Geschichte ist für sie selten nur eine Geschichte: Meist hört sie schon die Melodie und sieht das Bühnenbild dazu.'
  ],
  quotesTitle: 'Wünsche & Selbstbild', quotes: [
    'Sie möchte die Welt kennenlernen, ehe andere ihr Leben für sie festlegen.',
    'Große Helden besingen – und vielleicht eines Tages selbst besungen werden.',
    'Zuneigung soll freiwillig wachsen und Raum lassen, sich selbst zu entdecken.'
  ],
  extraSections: [
    { position: 'afterIntro', mode: 'text', title: 'Fenrir Varulv – Bester Freund & Love Interest', text: paragraphs(
      'Fenrir ist Freyas bester Freund und ein Mensch, mit dem sie sich ein gemeinsames Leben vorstellen kann. Ihre Vertrautheit reicht bis in die Kindheit zurück. Zwischen ihnen steht echte Zuneigung, auch wenn daraus noch keine gemeinsame Zukunftsentscheidung geworden ist.',
      'Freya möchte sich ausprobieren und herausfinden, was sie will und mit wem. Das bedeutet für sie nicht zwangsläufig eine polyamore Beziehung; entscheidend ist das Recht, ihre Wünsche selbst zu entdecken. Fenrir denkt womöglich traditioneller über Bindung, Ehe und Familie. Beide müssen erst herausfinden, ob ihre Vorstellungen zusammenfinden.',
      'Sie mag Kinder, wünscht sich eigene aber eher sehr spät und ist von der Ehe wenig begeistert. Als Magiekundige rechnet sie mit einem längeren Leben und langsamerem Altern. Dass in dieser Welt damit auch eine zunehmende Unfruchtbarkeit einhergeht, schiebt sie mit jugendlichem Optimismus beiseite: Sie glaubt, noch viel Zeit zu haben, und nimmt auch die Möglichkeit hin, dass es keine Kinder geben könnte.',
      'Ihr lockeres Flirten und ihre offene Art können Fenrir verunsichern. Freya will ihn weder verletzen noch sich vorschnell festlegen. Gerade darin liegt die Spannung ihrer Verbindung: Nähe ist längst da, ein gemeinsames Verständnis von Freiheit und Verbindlichkeit noch nicht. Eine Verlobung oder Ehe besteht nicht.') },
    { position: 'afterWorks', mode: 'text', title: 'Fernweh, Ruhm & blinde Flecken', text: paragraphs(
      'Ein Leben zu Hause, in dem sie vor allem den Clan aufbaut, Kinder großzieht und alt wird, ist gegenwärtig nicht ihr Traum. Sie will reisen, Erfahrungen sammeln und sehen, wie Menschen jenseits ihres vertrauten Horizonts leben. Mythische Kreaturen und infernale Wesen erscheinen ihr als Verheißung ebenso sehr wie als Gefahr.',
      'Ihre Abenteuerlust, künstlerische Exzentrik und Naivität verstärken einander. Oft kennt sie kein rechtes Maß und übersieht, dass aus einer reizvollen Geschichte eine sehr reale Bedrohung werden kann. Noch fehlt ihr die praktische Felderfahrung, um die eigene Begeisterung zuverlässig von einer guten Entscheidung zu unterscheiden.') },
    { position: 'afterWorks', mode: 'text', title: 'Eldfaxi – Reisegefährtin & Duettpartnerin', text: paragraphs(
      'Die fröhliche Hest-Mix-Stute Eldfaxi begleitet Freya seit mehr als sechs Jahren. Ihr helles Fell mit dunklen Flecken, die lange dunkle Mähne und ihr lebhaftes Wesen machen sie unverwechselbar. Wenn Freya singt, stimmt Eldfaxi gern auf ihre eigene Weise mit ein.',
      'Für Freya ist sie weit mehr als ein Reittier: Eldfaxi gehört zu den vertrauten Stimmen ihres Alltags und zu der Vorstellung von Freiheit, mit der sie sich auf den Weg in die Welt machen möchte.') }
  ],
  connectionsTitle: 'Verbindungen & Familie', documentsTitle: 'Ausbildung & Stammbäume',
  footer: 'Personenakte · Freya Skald'
};
