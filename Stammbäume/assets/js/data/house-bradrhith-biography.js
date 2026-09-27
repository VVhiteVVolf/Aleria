export const BRADRHITH_EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Bradrhith.png';
export const BRADRHITH_HOUSE_IMAGE = '../Familien Häuser und Clans/Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Bradrhith/assets/bradrhith-hausbild.png';

// Gemeinsame Hausgeschichte für die bestehende Stammbaum-Bio und die Hausseite.
export const BRADRHITH_HOUSE_TEXT = Object.freeze({
  overview: 'Die Bradrhith sind eine bürgerliche Pferdezüchterfamilie am nördlichen Rand des Gwynthorer Bannkreises, nahe der Grenze zu Mwyncreig. Ihr Hof versorgte Gwynthor mit guten Rössern und Pferden. Nach dem Überfall der Schwarzen Zitteraale ist das Gestüt schwer verwüstet; seine Nachfolge und Weiterführung sind ungeklärt.',
  origin: 'Ceredig Bradrhith war Stall- und Zuchtmeister des Hauses Draig. Zum Dank für seine Dienste erhielt er von den Draig einen Hof und Startkapital, um eine eigene Rosszucht aufzubauen und Gwynthor mit guten Rössern und Pferden zu versorgen. Auf dem Bradrhith Hof wurden Tiere für Feldarbeit, Alltag und Krieg aufgezogen. Pferdekenntnis, Zucht und Handel bildeten den Lebensunterhalt der Familie.',
  family: 'Ceredig verlor zwei Söhne im Krieg und einen weiteren, der sich Söldnern angeschlossen hatte. Während seiner langen Krankheit führten seine jüngere Tochter Mairwen und ihr Gemahl Llyr Dewrdd den Hof maßgeblich mit. Ceredig starb 1739, vor dem Überfall. Nach seinem Tod stritten Mairwen und Llyr mit der älteren Tochter Arianwen und deren Ehemann Gruffudd Gwregysdu um das Erbe und ein nicht mehr auffindbares Testament.',
  attack: 'Ein von Gruffudd veranlasster Überfall der Schwarzen Zitteraale verwüstete den Bradrhith Hof und brannte ihn beinahe nieder. Mairwen und ihre Kinder wurden getötet; Llyr überlebte. Haus Draig sagte Hilfe beim Wiederaufbau zu. Gruffudd bleibt für weitere Verhöre in Haft; sein Todesurteil ist ausgesetzt. Arianwen büßt im Orden der Geläuterten unter persönlicher Aufsicht des Patriarchen Gwalchgwyn Saethwyr. Llyr erhält zunächst als Gast des Draig-Hofes Zeit zur Erholung.',
  succession: 'Derzeit ist ungeklärt, wer den Bradrhith Hof übernehmen und weiterführen wird. Offen ist, ob er an den angeheirateten Pferdemeister Llyr Dewrdd ergeht oder durch Arianwens Kinder Eiludd, Gwrfyw und Creirwy Gwregysdu fortgeführt wird. Eine endgültige Erbfolge oder neue Hofleitung ist noch nicht festgelegt.',
  youngest: 'Arianwen ist vierzig Jahre alt. Ihre Kinder Eiludd, Gwrfyw und Creirwy Gwregysdu sind neunzehn, sechzehn und vierzehn; sie kommen für eine Weiterführung des Hofes infrage. Mairwens und Llyrs Kinder Gwyddien, Clydog und Goleuddydd Dewrdd starben beim Überfall im Alter von dreizehn, zehn und sieben Jahren. Zwischen dem unbekannten Gründerpaar der Familie und Ceredig liegen mehrere nicht überlieferte Generationen.'
});

export const BRADRHITH_HOUSE_BIOGRAPHY = Object.freeze({
  schema: 'aleria.house-module',
  schemaVersion: 1,
  pageTitle: 'I — Haus Bradrhith',
  image: BRADRHITH_HOUSE_IMAGE,
  imageWidth: 30,
  imageSquare: true,
  housePage: true,
  description: BRADRHITH_HOUSE_TEXT.overview,
  stats: [
    ['Voller Name', 'Haus Bradrhith'],
    ['Rang', 'Bürgerfamilie'],
    ['Stammsitz', 'Bradrhith Hof · Gwynthor'],
    ['Grafschaft', 'Celtigerns Wacht'],
    ['Baronie', 'Llamreis Ankunft'],
    ['Ursprung', 'Ceredigs Dienst als Stall- und Zuchtmeister der Draig'],
    ['Früherer Hofherr', 'Ceredig Bradrhith †'],
    ['Nachfolge', 'Offen: Llyr Dewrdd oder Arianwens Kinder'],
    ['Aufsicht', 'Haus Awenydd, auf Beschluss des Draig-Hofes'],
    ['Starthilfe', 'Hof und Startkapital von Haus Draig'],
    ['Erwerb', 'Pferdezucht und Pferdehandel'],
    ['Stand', 'Wiederaufbau nach dem Überfall zugesagt']
  ],
  house: {
    crestImage: BRADRHITH_EMBLEM,
    documentsTitle: 'Mehr über das Haus',
    documents: [{
      icon: BRADRHITH_EMBLEM,
      title: 'Haus Bradrhith · Hausseite',
      text: 'Ceredigs Rosszucht, der Überfall und die offene Zukunft des Hofes.',
      link: '../Familien%20H%C3%A4user%20und%20Clans/kleinehaeuser.html?haus=haus-bradrhith'
    }],
    biographyTitle: 'Der Hof der Bradrhith',
    biographyText: BRADRHITH_HOUSE_TEXT.origin,
    historyTitle: 'Ceredigs Familie',
    historyText: BRADRHITH_HOUSE_TEXT.family,
    extraSections: [
      {
        position: 'afterWorks',
        title: 'Überfall und offene Nachfolge',
        text: `${BRADRHITH_HOUSE_TEXT.attack}\n\n${BRADRHITH_HOUSE_TEXT.succession}`
      },
      {
        position: 'afterWorks',
        title: 'Die jüngste Generation',
        text: BRADRHITH_HOUSE_TEXT.youngest
      }
    ],
    connectionsTitle: 'Bindungen des Hofes',
    connections: [
      { type: 'connection', name: 'Haus Awenydd', detail: 'Aufsicht über den Hof; die familiäre Nachfolge bleibt offen.', image: 'assets/images/houses/Llamreis Ankunft/haus-awenydd.png', imageFormat: 'square' },
      { type: 'connection', name: 'Haus Draig', detail: 'Ceredigs früherer Dienstherr; Hof und Startkapital für die Rosszucht sowie zugesagte Hilfe beim Wiederaufbau.', image: 'assets/images/houses/Llamreis Ankunft/haus-draig.png', imageFormat: 'square' }
    ]
  },
  quote: '„Meine Frau und ich führten den Hof über Jahre hinweg mit dem Segen ihres Vaters.“',
  quoteBy: 'Llyr Dewrdd, bei der Anhörung in Celtigerns Wacht'
});
