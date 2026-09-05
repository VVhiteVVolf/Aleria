export const BRADRHITH_EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Bradrhith.png';

export const BRADRHITH_HOUSE_BIOGRAPHY = Object.freeze({
  schema: 'aleria.house-module',
  schemaVersion: 1,
  pageTitle: 'I — Haus Bradrhith',
  image: '../Karten/assets/images/pin-placeholders/default-siedlung.webp',
  imageWidth: 30,
  imageSquare: true,
  housePage: true,
  description: 'Bürgerliche Pferdezüchterfamilie am nördlichen Rand des Gwynthorer Bannkreises.',
  stats: [
    ['Voller Name', 'Haus Bradrhith'],
    ['Rang', 'Bürgerfamilie'],
    ['Stammsitz', 'Bradrhith Hof · Gwynthor'],
    ['Grafschaft', 'Celtigerns Wacht'],
    ['Baronie', 'Llamreis Ankunft'],
    ['Ursprung', 'Ein Stallmeister der Draig; vor über einem Jahrhundert'],
    ['Früherer Hofherr', 'Ceredig Bradrhith †'],
    ['Erben', 'Eiludd, Gwrfyw und Creirwy Gwregysdu'],
    ['Aufsicht', 'Haus Awenydd, auf Beschluss des Draig-Hofes'],
    ['Bisherige Pacht', 'Unmittelbar bei Haus Draig'],
    ['Erwerb', 'Pferdezucht und Pferdehandel'],
    ['Stand', 'Wiederaufbau nach dem Überfall zugesagt']
  ],
  house: {
    crestImage: BRADRHITH_EMBLEM,
    biographyTitle: 'Der Hof der Bradrhith',
    biographyText: 'Die Bradrhith sind eine bürgerliche Pferdezüchterfamilie aus dem Norden des Gwynthorer Bannkreises, nahe der Grenze zu Mwyncreig. Ihr Gestüt geht auf einen Stallmeister im Dienst der Draig zurück und stand über Generationen in deren unmittelbarer Pacht. Auf dem Hof wurden Rösser für Feldarbeit, Alltag und Krieg aufgezogen; Pferdekenntnis, Zucht und Handel prägten den Lebensunterhalt der Familie.',
    historyTitle: 'Ceredigs Familie',
    historyText: 'Der zuletzt verstorbene Hofherr Ceredig Bradrhith verlor zwei Söhne im Krieg und einen weiteren, der sich Söldnern angeschlossen hatte. Seine jüngere Tochter Mairwen und ihr Gemahl Llyr Dewrdd führten den Hof in seinen letzten Jahren maßgeblich mit. Nach Ceredigs Tod stritten sie mit der älteren Tochter Arianwen und deren Ehemann Gruffudd Gwregysdu um das Erbe und ein nicht mehr auffindbares Testament.',
    extraSections: [
      {
        position: 'afterWorks',
        title: 'Nach der Anhörung',
        text: 'Ein von Gruffudd veranlasster Überfall der Schwarzen Zitteraale kostete Mairwen und ihre Kinder das Leben und verwüstete Teile des Hofes. Llyr überlebte. Das Gericht erkannte seine Nachfolge über Mairwen an; er lehnte das Erbe jedoch ab. Damit fällt der Hof an Arianwens Kinder und wird künftig durch Haus Awenydd beaufsichtigt. Haus Draig sagte Hilfe beim Wiederaufbau zu. Gruffudd bleibt für weitere Verhöre in Haft; sein Todesurteil ist ausgesetzt. Arianwen tritt ihre Buße im Orden der Geläuterten unter persönlicher Aufsicht des Patriarchen Gwalchgwyn Saethwyr an. Llyr erhält zunächst als Gast des Draig-Hofes Zeit zur Erholung; sein weiterer Weg bleibt offen.'
      },
      {
        position: 'afterWorks',
        title: 'Die jüngste Generation',
        text: 'Arianwen ist vierzig Jahre alt. Ihre Kinder Eiludd, Gwrfyw und Creirwy Gwregysdu sind neunzehn, sechzehn und vierzehn. Ihnen fällt nun die Zukunft des verwüsteten Hofes zu. Mairwens und Llyrs Kinder Gwyddien, Clydog und Goleuddydd Dewrdd starben beim Überfall im Alter von dreizehn, zehn und sieben Jahren. Zwischen dem unbekannten Gründerpaar und Ceredig liegen mehrere nicht überlieferte Generationen.'
      }
    ],
    connectionsTitle: 'Bindungen des Hofes',
    connections: [
      { type: 'connection', name: 'Haus Awenydd', detail: 'Künftige Aufsicht über den Hof und die unerfahrenen Erben.', image: 'assets/images/houses/Llamreis Ankunft/haus-awenydd.png', imageFormat: 'square' },
      { type: 'connection', name: 'Haus Draig', detail: 'Ursprünglicher Pachtherr; Gerichtsherrschaft und zugesagte Hilfe beim Wiederaufbau.', image: 'assets/images/houses/Llamreis Ankunft/haus-draig.png', imageFormat: 'square' }
    ]
  },
  quote: '„Meine Frau und ich führten den Hof über Jahre hinweg mit dem Segen ihres Vaters.“',
  quoteBy: 'Llyr Dewrdd, bei der Anhörung in Celtigerns Wacht'
});
