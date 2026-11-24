export const NORTHERN_FARMS_MAP = 'cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-bannkreis';

const farms = [
  {
    slug: 'afelwyn', name: 'Afelwyn', pinId: 'gwynthor-marking-071', seat: 'Die Afelwyn-Obstplantage',
    liege: 'Gafyr',
    overview: 'Die Familie Afelwyn bewirtschaftet an der nördlichen Straße von Gwynthor eine Obstplantage mit eigener Imkerei. Vor allem Äpfel und Birnen gehen auf die Märkte der Stadt. Die Afelwyn stehen im Dienst von Haus Gafyr.',
    holdings: 'Auf der Plantage wachsen Äpfel, Birnen und weitere Obstsorten. Neben frischem Obst liefert der Hof eigenen Honig.',
    relations: 'Die Afelwyn und ihre Nachbarn, die Familie Gwerfil, verbindet eine jahrzehntelange Fehde. Ihr ursprünglicher Anlass ist kaum noch bekannt. Beide Familien dienen den Gafyr.',
    heraldry: 'Ein goldener Zweig trägt einen roten Apfel und eine goldene Birne über einer Biene. Das pflaumenfarbene Rundwappen vereint die beiden Erwerbszweige der Familie.',
    recipients: 'Gwynthor und Haus Gafyr'
  },
  {
    slug: 'gwerfil', name: 'Gwerfil', pinId: 'gwynthor-marking-058', seat: 'Der Gwerfil-Hof',
    liege: 'Gafyr',
    overview: 'Die Familie Gwerfil bewirtschaftet einen großen Bauernhof an der nördlichen Hauptstraße von Gwynthor. Ihre Felder und Herden versorgen die Stadt und die umliegenden Höfe. Die Gwerfil stehen im Dienst von Haus Gafyr.',
    holdings: 'Auf den Feldern wachsen Weizen und Futterpflanzen. Zum Betrieb gehören Ziegen, Schafe und Rinder.',
    relations: 'Die Gwerfil tragen seit Jahrzehnten eine Fehde mit der benachbarten Familie Afelwyn aus. Der Ursprung ist kaum noch bekannt. Beide Familien dienen den Gafyr.',
    heraldry: 'Auf dunkelblauem Grund stehen drei goldene Weizenähren über einem hellen Rinderkopf. Sie zeigen Ackerbau und Viehhaltung.',
    recipients: 'Gwynthor und umliegende Höfe'
  },
  {
    slug: 'caehelyg', name: 'Caehelyg', pinId: 'gwynthor-marking-042', seat: 'Hof Caehelyg',
    liege: 'Draig',
    overview: 'Die bäuerliche Familie Caehelyg bewirtschaftet ihren Hof und die umliegenden Felder im nördlichen Bannkreis von Gwynthor. Die Familie ist Haus Draig unmittelbar verpflichtet.',
    holdings: 'Den Hof umgeben die Felder der Caehelyg. Welche Feldfrüchte die Familie anbaut, ist bislang offen.',
    heraldry: 'Eine silberne Weide steht auf tiefgrünem Grund über goldenen Ackerfurchen. Die Weide greift den Familiennamen auf, die Furchen erinnern an den Ackerbau.'
  },
  {
    slug: 'cyffiniau', name: 'Cyffiniau', pinId: 'gwynthor-marking-169', seat: 'Der Cyffiniau-Hof',
    liege: 'Draig',
    overview: 'Die Familie Cyffiniau bewirtschaftet einen kleinen Hof nördlich von Gwynthor. Sie baut Flachs und Futterpflanzen an, hält Schweine und stellt aus Flachs einfache Seile her. Die Cyffiniau sind Haus Draig unmittelbar verpflichtet.',
    holdings: 'Der Hof liefert Flachs, Seile, Tierfutter und Schweine. Feld- und Gartenerzeugnisse dienen auch dem Eigenbedarf.',
    heraldry: 'Über einem goldenen Seilknoten stehen blaue Flachsblüten auf erdrotem Grund. Das Wappen zeigt den Anbau und die Verarbeitung der Faser.',
    recipients: 'Haus Draig'
  }
];

export const NORTHERN_FARMS = Object.freeze(farms.map(farm => Object.freeze({
  ...farm,
  familyId: `haus-${farm.slug}`,
  familyName: `Familie ${farm.name}`,
  liegeName: `Haus ${farm.liege}`,
  emblem: `assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/${farm.name}/${farm.slug}-wappen-v1.png`,
  mapHref: `/Karten/karte.html?map=${NORTHERN_FARMS_MAP}&pin=${farm.pinId}`
})));
