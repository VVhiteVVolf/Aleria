import { COURT_EMBLEMS } from './case-people.js';
import { TWYLLOD_FARM } from './twyllod-farm.js';

export const TWYLLOD_BIOGRAPHY = Object.freeze({
  schema: 'aleria.house-module', schemaVersion: 1, housePage: true, pageTitle: 'Familie Twyllod',
  description: TWYLLOD_FARM.description,
  stats: [['Familie', 'Twyllod'], ['Stand', 'Bürgerliche Fischer'], ['Stammsitz', 'Twyllod-Hof · östlicher Bannkreis Gwynthors'],
    ['Hofvorsteher', 'Meirion Twyllod und Anest'], ['Gewerbe', 'Küstenfischerei, Räuchern und örtlicher Verkauf']],
  house: {
    crestImage: `../Stammbäume/${COURT_EMBLEMS.twyllod}`, sideWidth: 100,
    biographyTitle: 'Der weiterbewirtschaftete Fischerhof', biographyText: TWYLLOD_FARM.description,
    historyTitle: 'Eithne, Arian und Glendower',
    historyText: '<p>Eithne war eine Fischersmagd an der Ostküste und mit Arian Twyllod verheiratet. Nach einem Übergriff durch einen Unbekannten wurde sie schwanger. Arian hielt das Kind zunächst für sein eigenes. Erst nach Glendowers Geburt erzählte Eithne ihm von der erlittenen Gewalt. Arian verließ sie im Zorn; seine Familie verstieß sie und zweifelte zum Teil ihre Schilderung an. Arian geriet später selbst auf kriminelle Wege.</p>'
      + '<p>Glendowers leiblicher Vater blieb unbekannt, weshalb er den Beinamen O’Cenyr trägt. Er ist kein leiblicher Twyllod. Die gestrichelte Stiefverbindung zu Arian zeigt allein dessen anfängliche soziale Vaterstellung. Eithne blieb seine leibliche Mutter. Nach Jahren von Almosen, kirchlicher Hilfe und wechselnder Arbeit ließ sie den Fünfjährigen an einer Kirche in Gwynthor zurück. Patriarch Gwalchgwyn Saethwyr brachte ihn ins Waisenheim.</p>'
      + '<p>Mit dreizehn wurde Glendower Bootsjunge. Als ihn seine Mannschaft später erstmals in ein Bordell drängte, erkannte er dort seine Mutter. Im Schock tötete er sie; bei ihrer Gegenwehr verlor er ein Auge. Mit siebzehn stand er vor Meurig Draig, Odyar Draig und Gwalchgwyn Saethwyr. Der Patriarch nahm ihn als Bußgänger in seinen Dienst. Nach zehn Jahren Buße und Küstendienst ist Glendower heute Paladin im Stab des Patriarchen. Sein Ritterstand stammt aus der Kirche, nicht aus dieser Familie.</p>',
    worksTitle: 'Die heutige Arbeit', works: [
      'Cynwrig und Morfudd gehören zur älteren Generation des Hofes. Meirion und Anest führen den täglichen Betrieb.',
      'Cledwyn, Delyth, Gwenllian und Dewi arbeiten an Fang, Netzen, Verarbeitung und Verkauf. Mit Bledri lebt bereits die nächste Generation auf dem Hof.',
      'Eifion verließ den kleinen Fischerbetrieb und arbeitete sich in der Seefahrt zum Kapitän hoch. Seine Arbeit für Lleucus Reederei ist vom Vermögen und den Booten des Twyllod-Hofes getrennt.'
    ],
    extraSections: [{ position: 'afterWorks', mode: 'text', title: 'Eine Familie mit fortwirkender Vorgeschichte',
      text: 'Die Verstoßung Eithnes wird durch den heutigen Wohlstand und die gewöhnliche Arbeit der Familie nicht nachträglich gerechtfertigt. Die jüngeren Hofmitglieder wurden erst danach geboren. Eifions persönliche Haltung im damaligen Streit bleibt unbelegt. Dass Glendower als Paladin an derselben Küste dient, gehört zur Gegenwart dieser Familiengeschichte; eine Versöhnung wird nicht behauptet.' }],
    connectionsTitle: 'Verbindungen', connections: [{ name: "Glendower O’Cenyr", detail: 'Eithnes Sohn · Arian war sein sozialer, nicht sein leiblicher Vater', image: 'https://i.imgur.com/vSRYHg1.png', imageFormat: 'portrait' }],
    documentsTitle: 'Der Hof auf der Karte', documents: [{ title: 'Twyllod-Hof', text: 'Bestehende Fischerei im östlichen Bannkreis.',
      link: '../Karten/karte.html?map=cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-bannkreis&pin=gwynthor-marking-138' }]
  }
});
