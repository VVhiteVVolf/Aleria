import source from './sources/hierarchy-online-20261116.json' with { type: 'json' };
import images from './sources/image-sources.json' with { type: 'json' };
import { buildSchwarzfischeHierarchy, GRENN_PORTRAIT, SCHWARZFISCHE_EMBLEM } from './schwarzfische-hierarchy.mjs';
import { buildGrennBiography } from './schwarzfische-characters.mjs';

export const SCHWARZFISCHE_MODULE_ID = source.id;
export const SCHWARZFISCHE_PATH = ['Die Windreiter', 'Estryll Banden', 'Die Schwarzen Fische'];
const imageSources = Object.fromEntries(images.images.map(image => [image.url, image.src]));

function cynwrigPage() {
  const page = source.pages[1];
  return {
    ...page, description: 'Ritter, Gründer des Schwarzfischbanners und Kommandant der Windreiter auf Estryll.',
    quote: 'Ich hab nicht gefragt, ob ich Kommandant will. Ich hab einfach angefangen, einer zu sein.',
    quoteBy: '— Cynwrig Pysgod O’Tredegar',
    stats: [
      ['Vollständiger Name', 'Cynwrig Pysgod O’Tredegar'], ['Stand', 'Ritter · Spross des Grafenhauses Pysgod'],
      ['Alter', '38 Jahre'], ['Herkunft', 'Tredegar · Graue Weite · Cenyr'],
      ['Amt', 'Kommandant der Windreiter auf Estryll'], ['Banner', 'Die Schwarzfische'],
      ['Hauptquartier', 'Burg Windfeste · Aislaerneach'], ['Früherer Verband', 'Die Kettensprenger']
    ],
    biography: {
      ...page.biography, portrait: page.image,
      biographyTitle: 'Der schwarze Fisch aus Tredegar',
      biographyText: '<p>Cynwrig entstammt dem Grafenhaus Pysgod aus Tredegar in der Grauen Weite. Als Ritter und Söldner fand er seinen Weg zu den Windreitern und diente zunächst bei den Kettensprengern. Nach dem Tod des damaligen Estryll-Kommandanten übernahm er die Nachfolge und stellte ein eigenes Banner auf.</p><p>Die Schwarzfische wuchsen in rund zwölf bis dreizehn Jahren von einem kleinen Kreis erfahrener Gefährten zu einem Verband von mehreren hundert Mitgliedern. Cynwrig verbindet die Führung dieser eigenen Bande mit der kontinentalen Koordination der Windreiter. Den Namen erklärt er mit seiner Stellung als schwarzes Schaf einer Familie, die einen goldenen Fisch im Wappen führt.</p>',
      abilitiesTitle: 'Eigenschaften und Schwerpunkte', abilities: [
        { title: 'Selbstbewusst', icon: '/IconOrdner/Traits%20Icon/Proud.png', detail: 'Tritt mit offenem Vertrauen in die eigenen Fähigkeiten auf und spricht unmittelbar aus, was er von einem Auftrag hält.' },
        { title: 'Organisationsstark', icon: '/IconOrdner/Traits%20Icon/Organizer.png', detail: 'Verbindet einen beweglichen Söldnerverband mit festen Stützpunkten, Schiffen und verlässlicher Auftragsabwicklung.' },
        { title: 'Erfahrener Feldführer', icon: '/IconOrdner/Traits%20Icon/Brave.png', detail: 'Führt bei größeren Aufgaben den engeren Kreis selbst und überträgt kleinere Einsätze bewährten Gefährten.' }
      ],
      extraSections: [], historyTitle: 'Vom Kettensprenger zum Kommandanten',
      historyText: '<p>Mit ehemaligen Kettensprengern, Mitgliedern anderer Banden und neuen Freischwertern baute Cynwrig die Schwarzfische als amtierendes Kommandantenbanner auf. Ihre Aufträge reichen vom südlichen Blaithneach bis in die nördlichen Regionen Aldrimars. Meist arbeiten kleine, auftragsgebundene Gruppen selbstständig.</p><p>Die Windfeste in Aislaerneach bildet den Verwaltungsmittelpunkt. Windfeld in der Grauen Weite verbindet das Banner mit Cynwrigs Heimat. Die Schwarze Flut und die Schattenschuppe ergänzen die festen Plätze um bewegliche Stützpunkte.</p>',
      worksTitle: 'Aufgaben und Bindungen', works: ['Führung des Schwarzfischbanners', 'Koordination der Windreiter auf Estryll', 'Größere Feldaufträge mit dem engeren Kreis'],
      triviaTitle: 'Im Banner bekannt', trivia: ['Der Bannername spielt auf das goldene Fischzeichen seiner Herkunftsfamilie an.', 'Tredegar bleibt seine Heimat, die Windfeste sein Hauptquartier.'],
      quotesTitle: 'Eigene Worte', quotes: ['„Ich hab nicht gefragt, ob ich Kommandant will. Ich hab einfach angefangen, einer zu sein.“'],
      connections: page.biography.connections.map(connection => ({
        ...connection,
        ...(connection.name === 'Die Schwarfzische' ? { name: 'Die Schwarzfische' } : {}),
        ...(connection.name === 'Sinead' ? { detail: 'Gildenvogt und Burgvogt der Windfeste' } : {})
      })),
      documentsTitle: 'Organisation und Standorte', documents: [
        { title: 'Die Schwarzen Fische', text: 'Herkunft, Einordnung, heutige Einsatzweise und die bekannten Stützpunkte.', link: './AleriaAlmanach.html?entry=schwarzfische-windreiter' }
      ],
      footer: 'Windreiter · Kommandantenbanner Estrylls'
    }
  };
}

export function buildSchwarzfische() {
  const grenn = buildGrennBiography();
  const entry = {
    ...source, title: 'Die Schwarzfische · Banner und Organisation',
    subtitle: 'Kerntruppe, Verwaltung, Führungspersonen und reguläre Trupps',
    type: 'Söldnerbanner', category: 'Söldner · Windreiter · Estryll',
    stamp: 'SCHWARZFISCHE · WINDREITER ESTRYLL', icon: '⚔', symbol: SCHWARZFISCHE_EMBLEM,
    image: source.pages[0].image, previewImage: source.pages[0].image,
    pages: [
      {
        ...source.pages[0], pageTitle: 'Das Schwarzfischbanner',
        description: '<p>Die Schwarzfische sind das Kommandantenbanner der Windreiter auf Estryll. Cynwrig Pysgod O’Tredegar gründete die Bande nach seiner Zeit bei den Kettensprengern und führte sie innerhalb von rund zwölf bis dreizehn Jahren zu einer Stärke von mehreren hundert Söldnern.</p><p>Ein engerer Kreis erfahrener Gefährten begleitet das Bannerkommando bei besonderen Aufgaben. Die meisten Aufträge übernehmen kleine Gruppen, die selbstständig Wachen stellen, Reisende begleiten oder vereinbarten Kriegsdienst leisten. Die Windfeste, Windfeld und zwei Schiffe stützen diesen beweglichen Verband.</p><p>Die gemeinsame Verwaltung bündelt Kasse, Verträge, Versorgung, Ausbildung und Nachrichten. Örtliche Führungen verantworten ihre Burgen, Standorte und Besatzungen. Zehn vorbereitete Achterschaften machen die reguläre Truppe einzeln besetzbar und lassen Raum für späteren Ausbau.</p>',
        commentSequence: []
      },
      cynwrigPage(),
      { ...source.pages[2], hierarchy: buildSchwarzfischeHierarchy(imageSources) },
      {
        schemaVersion: 1, commentThreadKey: 'schwarzfische-grenn-seolfor', pageTitle: 'Grenn Coelret', biographyPage: true,
        image: GRENN_PORTRAIT, imageWidth: 40, imageTall: true,
        description: '33 Jahre · Haus Coelret · Speerträger der Schwarzfische', stats: grenn.stats, biography: grenn.biography
      },
      {
        ...source.pages[3], sessionIntro: '<p>Ein Lager der Schwarzfische auf der Reise. Zwischen Zelten, Gepäck und den jeweils eingeteilten Wachen treffen sich Mitglieder und Besucher des Banners. Ort, Reiseziel und Anlass können beim Beginn der Szene gemeinsam festgelegt werden.</p>',
        sessionEmptyText: 'Zwischen Wachwechsel und Aufbruch beginnt die nächste Begegnung.'
      }
    ]
  };
  return JSON.parse(JSON.stringify(entry), (_key, value) => typeof value === 'string' ? imageSources[value] || value : value);
}

export function buildSchwarzfischeRegistrations() {
  return [{
    tab: 'Söldner', path: SCHWARZFISCHE_PATH, icon: SCHWARZFISCHE_EMBLEM,
    description: 'Das Schwarzfischbanner und seine Führung, Ämter und Mannschaften.', entry: buildSchwarzfische()
  }];
}
