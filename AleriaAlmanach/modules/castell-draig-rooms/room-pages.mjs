const paragraphs = (...texts) => texts.map(text => `<p>${text}</p>`).join('');

export const DRAIG_ROOMS_MODULE_ID = 'modul-1781470059057';
export const DRAIG_ROOMS = Object.freeze([
  {
    id: 'gawain', name: 'Gawain', title: 'Gemach des Prinzen Gawain', characterId: 'q1QtSIug74FzzwUAqWrs',
    intro: paragraphs(
      'Gawains Gemach empfängt seine Besucher mit rotem Samt, schweren Seidenvorhängen und warmem, rötlichem Kerzenlicht. Das üppige Himmelbett, eine gepolsterte Chaiselongue und ein vergoldeter Spiegel geben dem privaten Zimmer etwas von einem teuren, verruchten Salon.',
      'Dabei liegt nichts achtlos herum: Die weißen Laken sind glatt gezogen, der Boden ist blank poliert und die Schuhe stehen exakt nebeneinander. Auf dem Ankleidetisch bilden Kamm und Duftfläschchen eine sorgfältige Reihe. Selbst das bereitgelegte Gewand ist so ordentlich gefaltet, als dürfte kein fremder Finger es verrücken.'
    )
  },
  {
    id: 'idwal', name: 'Idwal', title: 'Gemach des Prinzen Idwal', characterId: 'kJss0DGF1RLuVrrVCBQT',
    intro: paragraphs(
      'In Idwals Gemach liegen Hemden, Stiefel und achtlos abgelegte Kleidung zwischen Stuhl, Truhe und Boden. Die Bettdecke hängt halb herunter. Staub überzieht die kaum berührten Flächen; zwischen Bettpfosten und Wand ziehen sich Spinnweben. Ein Stapel Seekarten scheint schon lange auf seine nächste Verwendung zu warten.',
      'Unter dem erhöhten Bett liegt eine umgekippte Flasche neben einer alten, eingetrockneten Lache. Weiter hinten blitzen zwei Tieraugen aus dem Dunkel. Das Zimmer wirkt, als hätte sein Bewohner seit geraumer Zeit lieber an ganz anderen Orten geschlafen.'
    )
  },
  {
    id: 'anaraut', name: 'Anaraut', title: 'Gemach des Kronprinzen Anaraut', characterId: 'fq586i4k2gj5Lg30dUwW',
    intro: paragraphs(
      'Anarauts Gemach ist stattlich, gepflegt und vollkommen aufgeräumt. Hochwertige dunkle Stoffe, poliertes Holz und sparsame Goldverzierungen unterstreichen den Rang seines Bewohners. Auf dem Schreibtisch liegen ein geschlossenes Buch und ein sauber abgelegter Brief; die ritterliche Ausrüstung hat ihren festen Platz.',
      'Die Bettdecke liegt glatt auf dem ordentlich gerichteten Himmelbett. Weinrote und dunkelgrüne Stoffe setzen ruhige Akzente im gepflegten Raum. Von draußen fällt Tageslicht durch das Bogenfenster.'
    )
  },
  {
    id: 'isobel', name: 'Isobel', title: 'Gemach der Prinzessin Isobel', characterId: 'wnS8JOFUR3oS1izRzObH',
    intro: paragraphs(
      'Isobels Gemach verbindet ein fein gerichtetes Himmelbett mit dem kleinen Salon einer Bardin. Schimmernde Stoffe, verspielte Goldverzierungen und ein großer Ankleidespiegel lassen keinen Zweifel an ihrem Sinn für einen gepflegten Auftritt. Ein elegantes Kleid wartet auf einer Kleiderpuppe; Schmuck und Schleifen liegen geordnet auf dem Tisch.',
      'Bei der gepolsterten Bank steht eine Laute neben einem offenen Notenheft. Eine kleine Harfe hat ihren Platz am Fenster. Zwischen Instrumenten, schönen Stoffen und dem makellosen Bett bleibt Raum, um ein Lied zu erproben oder einen Besuch zu empfangen.'
    )
  },
  {
    id: 'rhiannon', name: 'Rhiannon', title: 'Gemach der Prinzessin Rhiannon', characterId: 'y7MBxDiAaesbWHBtmw5Q',
    intro: paragraphs(
      'Rhiannons Gemach ist zugleich Schlafzimmer und Gelehrtenstube. Neben dem Bett mit dunkler Decke steht ein benutzter Studiertisch: Offene Folianten, Pergamente mit arkanen Diagrammen, Federkiel und Tinte liegen für die nächste Arbeit bereit. Die Regale bergen Bücher und wenige sorgfältig verwahrte Gefäße.',
      'Ein kristallines Lehrmodell schimmert sanft über seinem kleinen Holzständer. Beim Fenster steht ein Astrolabium aus Messing. Zwischen kühlen Farbakzenten und warmem Licht auf den Buchseiten wirkt der Raum wie der Rückzugsort einer Magierin, deren Gedanken selbst vor dem Schlafengehen noch bei ihren Studien verweilen.'
    )
  },
  {
    id: 'neithon', name: 'Neithon', title: 'Gemach des Prinzen Neithon', characterId: '6Gpz6nJaoL7yo9rFu85H',
    intro: paragraphs(
      'In Neithons Gemach scheint jeder Gegenstand einen genau bestimmten Platz zu besitzen. Das Bett ist glatt gerichtet, die Bücher stehen nach Größe ausgerichtet in den Regalen, und die Pergamentrollen ruhen sauber nebeneinander in ihrem Gestell. Kein Blatt ragt ungeordnet aus einem Stapel.',
      'Auf dem freien Schreibtisch liegen Federkiel und Holzlineal parallel zur Tischkante. Das Tintenfass ist verschlossen, die wenigen Bücherstapel stehen rechtwinklig. Helles Tageslicht fällt auf sauberes Holz, geordnete Schriftstücke und den unversperrten Boden.'
    )
  },
  {
    id: 'tudwal', name: 'Tudwal', title: 'Gemach des Prinzen Tudwal', characterId: 'fcNfoBWpVNvK3ORQUJwX',
    intro: paragraphs(
      'Tudwals Gemach ist ebenso ordentlich wie geschäftsmäßig eingerichtet. Neben dem sauber gemachten Bett steht ein großer Schreibtisch mit einem offenen Kontobuch, akkurat gerollten Verträgen und kleinen, voneinander getrennten Münzstapeln. Messingwaage und Rechenbrett liegen griffbereit.',
      'Die Regale enthalten geordnete Hauptbücher und geschlossene Dokumentenkästen. Eine gefaltete Handelskarte wartet am Rand der Arbeitsfläche. Dunkles Grün und warmes Holz geben dem Zimmer einen zurückhaltenden Wohlstand; die Ordnung dient hier vor allem dem nächsten klugen Geschäft.'
    )
  },
  {
    id: 'oweta', name: 'Oweta', title: 'Gemach der Ritterin Oweta', characterId: 'vk0xAa3ZcEhVvGC1CzNq',
    intro: paragraphs(
      'Owetas Gemach ist schlicht, sauber und aufgeräumt. Das Bett ist ordentlich gemacht, die Kleidertruhe geschlossen und die gepflegte Rüstung am Holzständer verwahrt. Daneben stehen die Stiefel; ihr langer Speer lehnt sicher an der Wand.',
      'Auf der Kommode stehen kleine Zinnsoldaten in einer sorgfältig aufgestellten Formation. Die silbrigen Ritter und Speerträger sind zwischen der praktischen Einrichtung ein sehr persönliches Detail. Durch das Burgfenster fällt ruhiges Tageslicht auf die Figuren und die bereitgehaltene Ausrüstung.'
    )
  }
]);

export function buildDraigRoomPage(room, image) {
  return {
    schemaVersion: 1, pageTitle: room.title, commentThreadKey: `wohntrakte-${room.id}`,
    image, imageWidth: 34, imageTall: true,
    enableComments: true, sessionPage: true, sessionIntro: room.intro,
    sessionHint: 'Schreibe deinen Beitrag zu dieser Szene.',
    sessionLocation: `Castell Draig · Wohntrakte der Burg · ${room.name}s Gemach`,
    sessionStatus: 'active', sessionParticipants: [],
    sessionCast: [room.characterId],
    sessionCastDetails: [{ schemaVersion: 1, id: room.characterId, role: 'Bewohner des Gemachs' }],
    sessionDateAleria: { year: null, month: null, day: null },
    sessionEmptyTitle: `${room.name}s Gemach`,
    sessionEmptyText: 'Die Szene ist offen. Hier kann ein Besuch oder eine Begegnung im Gemach beginnen.'
  };
}

export function planDraigRoomRefresh(before, artwork) {
  if (before?.id !== DRAIG_ROOMS_MODULE_ID || !Array.isArray(before.pages)) throw Error('Falsches Wohntrakt-Modul.');
  const after = structuredClone(before);
  // Remove only the named story placeholder. Historical comments and their
  // database documents are deliberately outside this module-only plan.
  after.pages = after.pages.filter(page => !/^(?:[IVXLCDM]+\.\s*[—–-]\s*)?Verlauf\s*$/iu.test(page.pageTitle || ''));
  for (const room of DRAIG_ROOMS) {
    if (!artwork[room.id]) throw Error(`Fehlendes Zimmerbild: ${room.id}`);
    const matches = after.pages.filter(page => page.commentThreadKey === `wohntrakte-${room.id}`);
    if (matches.length > 1) throw Error(`Doppelter Zimmerthread: ${room.id}`);
    const existing = matches[0];
    if (existing) {
      existing.image = artwork[room.id];
      existing.imageWidth = 34;
      existing.sessionIntro = room.intro;
    } else {
      after.pages.push(buildDraigRoomPage(room, artwork[room.id]));
    }
  }
  return after;
}

// A later illustration correction must not reapply the original eight-room
// publication over independently edited scenes.
export function planDraigRoomCorrection(before, roomId, image) {
  if (before?.id !== DRAIG_ROOMS_MODULE_ID || !Array.isArray(before.pages)) throw Error('Falsches Wohntrakt-Modul.');
  const room = DRAIG_ROOMS.find(candidate => candidate.id === roomId);
  if (!room || !image) throw Error('Zimmer oder Bild fehlt.');
  const after = structuredClone(before);
  const matches = after.pages.filter(page => page.commentThreadKey === `wohntrakte-${roomId}`);
  if (matches.length !== 1) throw Error('Zimmerseite ist nicht eindeutig.');
  matches[0].image = image;
  matches[0].sessionIntro = room.intro;
  return after;
}
