import { KANNE_HOUSE_FAMILIES } from '../../../Stammbäume/assets/js/data/krumme-kanne-families.js';

const lore = {
  trevoryn: {
    origin: 'Gwynthor · Cenyr', owner: 'merrik', name: 'Merrik Trevoryn',
    overview: 'Die Trevoryn sind eine einheimische Bürgerfamilie Gwynthors. Ihr heutiger Lebensmittelpunkt ist die Krumme Kanne im östlichen Hafenviertel. Merrik gehört zu den drei gleichberechtigten Inhabern; seine Schwester Eirian, sein Bruder Elidyr und seine Mutter Nestwen prägen den täglichen Betrieb ebenso wie seine Frau Celyn.',
    history: 'Namen und Lebensdaten der Gründer sind unbekannt. Zwischen ihnen und Nestwens Familie liegen nicht einzeln überlieferte Generationen. Merrik kehrte 1720 aus dem Großen Krieg zurück. Zwei Jahre später eröffnete er mit Hrolf Svathamar und Aedan Dubhdarach die Krumme Kanne. Eirians Ehe mit Hrolf verbindet die Trevoryn seit 1723 mit den Svathamar.',
    character: 'Die Familie verbindet Ortskenntnis mit verlässlicher Gastlichkeit. Eirian plant den Dienst, Elidyr führt den Tresen, Celyn verwaltet Vorräte und Wäsche. Nestwen hält in der Flickstube einen Platz für ihre Enkel frei. Die Kinder Cadri und Enlli gehören zum Haushalt; eine Erbfolge für Haus oder Schenke ist nicht festgelegt.',
    heraldry: 'Ein goldener aufrechter Fuchs auf dunkelgrün bemalten Holzbrettern, eingefasst von einem geschlossenen Eisenrahmen mit goldenem keltischem Knotenband.',
    members: ['merrik', 'celyn', 'eirian', 'elidyr', 'nestwen', 'cadri', 'enlli']
  },
  svathamar: {
    origin: 'Rorikshall · Aldrimar', owner: 'hrolf', name: 'Hrolf Svathamar',
    overview: 'Die Svathamar sind eine bürgerliche Familie aus Rorikshall in Aldrimar. Hrolf fand nach dem Großen Krieg in Gwynthor ein neues Zuhause. Seine Geschwister Ketil und Runa folgten ihm; mit Eirian Trevoryn und den Kindern Styr und Heledd gehört er heute zur Hausgemeinschaft der Krummen Kanne.',
    history: 'Der alte Ursprung des Hauses ist unbekannt und wird im Stammbaum durch ein Gründerpaar und einen Zeitsprung kenntlich gemacht. Auch die Namen der Eltern Hrolfs, Ketils und Runas sind nicht überliefert. Hrolf lernte Merrik und Aedan auf dem Schlachtfeld kennen. 1722 gründeten die drei die Kanne, 1723 heiratete Hrolf Merriks Schwester Eirian.',
    character: 'Hrolfs Verantwortungsgefühl für den Hausfrieden, Ketils ruhige Wachführung und Runas Ordnungssinn geben der Familie ihr Gesicht in Gwynthor. Eirian führt als Hausvögtin den Dienstplan aller Bereiche. Styr lernt unter Aufsicht am Tresen, Heledd hat keine feste Dienstschicht. Die Familie behält ihre nordische Herkunft, ohne sich vom cenyrischen Haushalt abzusondern.',
    heraldry: 'Ein schwarzer Berg mit einem zerfallenen schwarzen Turm auf eisblauem Holz. Ein geschlossener Eisenrahmen mit sparsamen nordischen Runen umgibt das Motiv.',
    members: ['hrolf', 'eirian', 'ketil', 'runa', 'styr', 'heledd']
  },
  dubhdarach: {
    origin: 'Leitheach · Albische Herkunft', owner: 'aedan', name: 'Aedan Dubhdarach',
    overview: 'Die Dubhdarach sind eine albische Bürgerfamilie aus Leitheach mit einem heutigen Haushalt in Gwynthor. Aedan ist einer der drei Gründer der Krummen Kanne. Seine Frau Mair stammt aus der Stadt und führt die Rechnungen. Ihre gemeinsamen Kinder Neifion und Eirlys wachsen mit Mairs älterem Sohn Caradog Tonnarth in der Hausgemeinschaft auf.',
    history: 'Ein unbekanntes Gründerpaar steht am Beginn der Familienakte. Die Generationen bis Aedan sind nicht einzeln überliefert. Im Großen Krieg schloss er Freundschaft mit Merrik und Hrolf; 1722 eröffneten sie die gemeinsame Schenke. Aedan und Mair heirateten 1724. Neifion wurde 1726, Eirlys 1731 geboren. Caradog stammt aus Mairs früherer, beendeter Verbindung mit Gareth Tonnarth.',
    character: 'Aedans Verschwiegenheit und Mairs genaue Buchführung ergänzen sich. Neifion übt nach dem Unterricht Lieferlisten und Rechnungen, Eirlys faltet gelegentlich Servietten. Caradog organisiert als erwachsener Meier den Lieferhof. Er bleibt Tonnarth und Aedans Stiefsohn; aus der gemeinsamen Hausgemeinschaft wird keine erfundene leibliche Abstammung.',
    heraldry: 'Ein schwarzer kahler Baum auf silbergrau bemalten Holzbrettern; unter seinen Ästen kniet die schwarze Silhouette eines betenden Mannes. Geschlossener Eisenrahmen mit keltischem Knotenband.',
    members: ['aedan', 'mair', 'neifion', 'eirlys', 'caradog']
  }
};

export function createKanneHouseContent(slug) {
  const text = lore[slug];
  const family = KANNE_HOUSE_FAMILIES.find(f => f.document.id === `haus-${slug}`);
  if (!text || !family) throw new Error(`Unbekanntes Haus: ${slug}`);
  const title = family.document.title;
  const name = title.replace('Haus ', '');
  const portrait = id => `../AleriaAlmanach/assets/krumme-kanne/${['merrik', 'hrolf', 'aedan'].includes(id) ? 'references' : 'portraits'}/${id}.png`;
  return {
    id: family.document.id, name: title, type: 'Bürgerliches Haus', page: 'kleinehaeuser.html', county: 'Celtigerns Wacht', liege: 'Haus Draig',
    territoryId: 'celtigerns-wacht', territoryName: 'Celtigerns Wacht', territoryHref: '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/Grafschaft Celtigerns Wacht.html', parentHouseId: '', extinct: false, showMotto: false, prepared: false, registerPage: true,
    biographySourceRevision: 1, biographyIntroTitle: 'Über die Familie', biographyHistoryTitle: 'Herkunft & Hausgeschichte',
    biographySummary: { overview: text.overview, history: text.history, character: text.character },
    hierarchy: [ ['Sammlung', 'Familien Häuser und Clans', 'familien-hauser-und-clans'], ['Kontinent', 'Estryll', 'estryll'], ['Königreich', 'Cenyr', 'cenyr'], ['Grafschaft', 'Celtigerns Wacht', 'celtigerns-wacht'], ['Region', 'Llamreis Ankunft', 'llamreis-ankunft'], ['Sitz', 'Gwynthor', 'gwynthor'], ['Haus', title, family.document.id] ].map(([type, name, slug]) => ({ type, name, slug })),
    profile: { highestTitle: 'Bürgerlich', rank: 'Bürgerlich', houseType: 'Bürgerliches Haus', motto: '', seat: 'Gwynthor · Östliches Hafenviertel', affiliation: 'Hausgemeinschaft der Krummen Kanne', liege: 'Haus Draig', origin: text.origin, founding: 'Unbekannt · Schenke gegründet 1722', people: 'Familienhaushalt der Krummen Kanne', wealth: 'Gemeinsamer Schank- und Herbergsbetrieb', patronDeities: '', allies: 'Trevoryn · Svathamar · Dubhdarach', enemies: '' },
    sections: {
      overview: text.overview, history: text.history,
      traditions: `${text.character}\n\nDas Familienwappen: ${text.heraldry}`,
      knighthood: 'Die Familie besitzt bürgerlichen Rang. Der Kriegsdienst der Inhaber begründet keinen Adelstitel; ihr heutiges Ansehen beruht auf der Schenke und ihren Beziehungen in Gwynthor.',
      succession: 'Für die Familie ist keine förmliche Erbfolge festgelegt. Die Krumme Kanne gehört weiterhin den drei gleichberechtigten Inhabern; familiäre Zugehörigkeit und betriebliche Zuständigkeit werden getrennt behandelt.',
      holdings: 'Anteil am gemeinsamen Schank- und Herbergsbetrieb der Krummen Kanne im Osten des Hafenviertels, an der Gasse Richtung Osttor. Die drei Inhaber gründeten das Haus 1722. Weiterer Grundbesitz ist nicht benannt.',
      cultureReligion: `${text.origin}. Die Hausgemeinschaft verbindet cenyrische, aldrimarische und albische Gewohnheiten, besonders am gemeinsamen Herd. Ein bestimmter Schutzpatron der Familie ist nicht überliefert.`,
      conflictsAlliances: 'Die drei Gründer wurden im Großen Krieg Freunde. Seit dem Frieden halten sie zusammen. Eirian Trevoryns Ehe mit Hrolf verbindet zwei der Häuser; Aedans Ehe mit Mair verknüpft den Dubhdarach-Haushalt mit Caradogs bestehender Tonnarth-Verwandtschaft.',
      values: 'Gastlichkeit, verlässliche Arbeit und Kameradschaft bestimmen den Alltag. Alte Frontzugehörigkeiten entscheiden nicht über den Empfang eines Gastes. Elidyr hört Beschwerden an; Ketil und die Wache sichern den Hausfrieden.',
      court: 'Als Bürgerhaushalt unterhält die Familie keinen eigenen Hofstaat. Dienstplätze und Zuständigkeiten sind in den sechs wechselbaren Hierarchiereitern des Almanach-Moduls „Die Krumme Kanne“ ausgearbeitet.',
      familyTree: 'Unbekannte Gründer → Zeitsprung über nicht einzeln überlieferte Generationen → heutige Familie. Die verlinkte Familienakte zeigt Ehen, Kinder und die bestehende Tonnarth-Verbindung mit gemeinsamen Personenidentitäten.',
      historicalFigures: 'Die folgenden Personen gehören zur heutigen Familie und Hausgemeinschaft. Historische Gründernamen werden mangels Überlieferung nicht erfunden.'
    },
    images: { crest: `../Stammbäume/${family.document.emblem}`, scene: portrait(text.owner), sceneAlt: `Porträt von ${text.name}`, banner: 'Estryll/Cenyr/Celtigerns_Wacht/Haus_Draig/assets/gwynthor.png' },
    placeholders: { male: '../Stammbäume/assets/images/placeholders/male.png', female: '../Stammbäume/assets/images/placeholders/female.png' },
    allies: KANNE_HOUSE_FAMILIES.filter(f => f !== family).map(f => ({ name: f.document.title, detail: 'Hausgemeinschaft der Krummen Kanne', image: `../Stammbäume/${f.document.emblem}`, imageFormat: 'square' })),
    cadets: [], founder: null, heads: [], heirs: [], offices: [], currentHead: `${text.name} · Hausvertreter`, firstHeir: 'Nicht festgelegt',
    figuresTitle: 'Familie & Hausgemeinschaft', figures: text.members.map(key => { const p = family.persons.find(p => p.portrait === portrait(key)); return { id: p.id, familyId: family.document.id, name: p.name, role: p.title, description: p.notes, image: p.portrait }; }),
    trivia: ['Die drei Wirte fanden im Großen Krieg zueinander; die Schenke wurde erst nach dem Frieden gegründet.', text.heraldry, 'Die jüngsten Kinder haben keine regulären Dienstschichten.']
  };
}
