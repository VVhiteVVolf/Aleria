const paragraphs = (...texts) => texts.map(text => `<p>${text}</p>`).join('');

export const GWYNTHOR_NOTICE_BOARD_HREF = '/Anzeigetafeln/tafel.html?tafel=cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-anzeigetafel';

// Local scene identities also form permanent comment-thread keys. Keep them
// stable when changing the prose, illustrations or ordering of these POIs.
export const MARKETPLACE_SCENES = Object.freeze([
  {
    id: 'park-lindenhain',
    title: 'Park I · Unter den Linden',
    intro: paragraphs(
      'An der Nordseite des Marktplatzes wird das Pflaster zu einem breiten Kiesweg. Alte Linden stehen zwischen dem Weg und der offenen Rasenfläche; um einen der Stämme läuft eine hölzerne Rundbank. Durch die Blätter sind die hellen Markttücher zu sehen. Die Rufe der Händler klingen hier bereits gedämpfter.',
      'Zwei Spaziergänger bleiben am Wegrand stehen, während auf der Bank jemand den Deckel eines kleinen Korbes öffnet. Ein freier Platz im Schatten bietet Raum zum Warten, für ein mitgebrachtes Frühstück oder ein Gespräch, das zwischen zwei Besorgungen beginnt.'
    ),
    hint: 'Eine Begegnung im Lindenhain.',
    emptyTitle: 'Ein Platz unter den Linden',
    emptyText: 'Auf der Rundbank ist noch Raum. Vom Markt wehen Stimmen herüber.'
  },
  {
    id: 'park-rosengarten',
    title: 'Park II · Der Rosengarten',
    intro: paragraphs(
      'Östlich des Platzes ziehen sich niedrige Rosenbeete um einen schmalen Gartenweg. Ein hölzerner Rankbogen steht vor zwei einander zugewandten Steinbänken. Hinter den Blüten blitzen die Dächer der Marktstände auf; durch die offene Hecke bleibt der Weg zum Platz sichtbar.',
      'Auf einem der Sitze liegt ein gefaltetes Tuch neben einem abgelegten Korb. Jenseits des Rankbogens spazieren zwei undeutliche Gestalten langsam weiter. Hier lässt sich auf jemanden warten, im Vorübergehen ein Wort wechseln oder dem Markt für eine Weile den Rücken kehren.'
    ),
    hint: 'Ein Gespräch zwischen Rosen und Rankbogen.',
    emptyTitle: 'Zwischen den Rosen ist es ruhiger',
    emptyText: 'Der Gartenweg führt vom Marktplatz zu den beiden Steinbänken.'
  },
  {
    id: 'park-schattengarten',
    title: 'Park III · Am flachen Wasserbecken',
    intro: paragraphs(
      'An der Südseite liegt ein schattiger Parkwinkel mit einem niedrigen, länglichen Wasserbecken. Eine schlichte Steinrinne lässt Wasser hineinrieseln. Farne wachsen am Rand; eine breite Bank steht unter einem ausladenden Baum. Zwischen den Stämmen führt ein kurzer Weg zurück zum Marktplatz.',
      'Die Oberfläche kräuselt sich unter dem dünnen Wasserstrahl. Auf der Bank unterhalten sich zwei ältere Stadtbewohner mit leisen Stimmen, während jemand mit einem Einkaufskorb vorübergeht. Neben ihnen bleibt genug Platz, um die Last abzustellen und einen Augenblick zu verweilen.'
    ),
    hint: 'Eine Pause im Schattengarten.',
    emptyTitle: 'Wasser plätschert über die Steinrinne',
    emptyText: 'Ein freies Stück Bank wartet zwischen Schatten und Marktgeräuschen.'
  },
  {
    id: 'park-spielwiese',
    title: 'Park IV · Die Spielwiese',
    intro: paragraphs(
      'Westlich des Marktplatzes öffnet sich der Park zu einer kleinen Wiese. Unter einem Baum stehen zwei einfache Holzbänke. Am Wegrand sind flache Hüpfkästchen in den festen Boden geritzt; ein niedriger Baumstamm trennt die Spielfläche vom Durchgang zu den Ständen.',
      'Ein paar Kinder lassen einen Stoffball zwischen sich hin und her fliegen. Erwachsene mit Körben sitzen in Sichtweite, andere gehen am Rand der Wiese vorbei. Wer hier wartet, bekommt zugleich das Spiel, die Spaziergänger und einen Streifen des geschäftigen Platzes mit.'
    ),
    hint: 'Eine Begegnung am Rand der Spielwiese.',
    emptyTitle: 'Der Stoffball springt über das Gras',
    emptyText: 'Neben den Bänken führt der Weg zurück zwischen die Marktstände.'
  },
  {
    id: 'anzeigetafel',
    title: 'Die Anzeigetafel · Zwischen den Wartenden',
    intro: paragraphs(
      'Am Rand des Marktplatzes steht die große hölzerne Anzeigetafel unter ihrem schmalen Dach. Helle und nachgedunkelte Anschläge liegen dicht nebeneinander. Eine kleine Gruppe wartet davor: Mantelsäume, Körbe und gebeugte Köpfe zeichnen sich als dunkle Silhouetten gegen die Papiere ab. Alle blicken zur Tafel; eine Hand deutet auf einen der Zettel.',
      'Jemand rückt zur Seite, damit die Nächsten näher treten können. Ein halblaut vorgelesener Satz löst ein kurzes Gespräch aus. Zwischen Lesenden und Wartenden lässt sich eine Nachricht entdecken, nach einem Aushang fragen oder zufällig eine andere suchende Person ansprechen.',
      `<a href="${GWYNTHOR_NOTICE_BOARD_HREF}" target="_blank" rel="noopener">Gwynthors Anzeigetafel mit den aktuellen Aushängen öffnen</a>.`
    ),
    hint: 'Eine Begegnung vor Gwynthors Anzeigetafel.',
    emptyTitle: 'Vor der Tafel wird ein Platz frei',
    emptyText: 'Die Wartenden schauen auf die Anschläge. Eine Frage kann das Gespräch eröffnen.'
  },
  {
    id: 'marktstaende',
    title: 'Der Markt · Zwischen Gemüse und Fisch',
    intro: paragraphs(
      'Unter hellen Leinentüchern stehen die Stände in lockeren Reihen auf dem Pflaster. Vorn liegen Kohlköpfe, Wurzelgemüse und Bündel grüner Kräuter in flachen Körben. Ein Stück weiter werden Fische auf feuchten Brettern gezeigt; nebenan stapeln sich Brotlaibe und kleine Käsestücke. Zwischen den Auslagen bleibt ein breiter Gang für die Einkaufenden.',
      'Eine Händlerin füllt Gemüse in den Korb einer Kundin. Am Fischstand beugt sich ein Käufer über die Auslage, während am nächsten Tisch Brot in ein Tuch geschlagen wird. Rufe, Münzklirren und Gesprächsfetzen mischen sich. Wer stehen bleibt, kann eine Ware betrachten, nachfragen, feilschen oder mitten im Gedränge auf Bekannte treffen.'
    ),
    hint: 'Handel und Begegnungen zwischen den Marktständen.',
    emptyTitle: 'Der nächste Korb wird auf die Theke gestellt',
    emptyText: 'Die Händler bieten Gemüse, Fisch, Brot und andere Alltagswaren an.'
  },
  {
    id: 'marktbrunnen',
    title: 'Der Marktbrunnen · Am steinernen Rand',
    intro: paragraphs(
      'Zwischen den Marktgängen steht ein runder Brunnen mit breitem Steinrand. Aus einer schlichten Säule fällt Wasser in das Becken. An der Pflasterkante sind feuchte Spuren von abgestellten Eimern zu sehen. Dahinter öffnen sich die Wege zu den Ständen und den vier Parkbereichen.',
      'Eine Person hebt ihren gefüllten Eimer vom Rand; daneben wird ein leerer Krug bereitgestellt. Zwei andere warten mit ihren Einkäufen und halten nach jemandem Ausschau. Das Plätschern schafft eine kleine Lücke im Marktlärm, ohne das Treiben außer Sicht geraten zu lassen.'
    ),
    hint: 'Ein Treffpunkt am Marktbrunnen.',
    emptyTitle: 'Wasser läuft in das runde Becken',
    emptyText: 'Zwischen Eimern und Einkaufskörben bleibt Zeit für ein paar Worte.'
  },
  {
    id: 'spielleute',
    title: 'Die Spielleute · Unter dem Sonnentuch',
    intro: paragraphs(
      'Wo der Marktgang in den westlichen Parkweg mündet, spannt sich ein schlichtes Sonnentuch zwischen zwei Holzpfosten. Darunter sitzen zwei Spielleute mit einer kleinen Laute und einer Handtrommel. Vor ihnen liegt ein umgedrehter Hut. Einige Menschen haben ihre Einkäufe abgestellt und bilden einen lockeren Halbkreis.',
      'Der Rhythmus trägt bis zu den nächsten Ständen. Ein Kind wippt auf den Fersen, jemand summt eine bekannte Wendung mit, andere bleiben nur für einen halben Vers stehen. Zwischen Liedern ist Zeit für Wünsche, eine Münze, eine Bemerkung oder ein Gespräch mit den Zuhörenden.'
    ),
    hint: 'Eine Begegnung bei den Spielleuten.',
    emptyTitle: 'Die Laute setzt zum nächsten Lied an',
    emptyText: 'Unter dem Sonnentuch ist noch Platz am Rand des kleinen Publikums.'
  }
]);
