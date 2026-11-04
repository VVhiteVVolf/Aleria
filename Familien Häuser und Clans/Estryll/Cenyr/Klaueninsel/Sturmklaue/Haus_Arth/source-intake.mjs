// Einmalige, quellengebundene Übernahme dieser fünf Hausvorlagen.
// Redaktionelle Laufzeitquellen bleiben die einzelnen haus.content.mjs.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const { FAMILY_REGISTRY } = await import(pathToFileURL(path.join(root, 'Stammbäume/assets/js/data/families.registry.js')));
const family = id => {
  const value = FAMILY_REGISTRY.find(entry => entry.id === id)?.family;
  if (!value) throw new Error(`Unbekannte kanonische Familie: ${id}`);
  return value;
};
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const base = 'Familien Häuser und Clans/Estryll/Cenyr/Klaueninsel';
const territoryBase = '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Klaueninsel';
const crest = id => `../Stammbäume/${family(id).document.emblem}`;
function person(familyId, id, role, detail = '') {
  const p = family(familyId).persons.find(entry => entry.id === id);
  if (!p) throw new Error(`Unbekannte Person: ${familyId}/${id}`);
  // Nur Personen mit belegtem eigenem Portrait erhalten einen Personenlink.
  return { ...(p.portrait ? { id, familyId } : {}), name: p.name, role, detail,
    image: p.portrait ? `../Stammbäume/${p.portrait}` : '', silhouette: p.sex === 'female' ? 'female' : 'male' };
}
const officeRoles = [['Vogt','male'],['Schatzmeister','female'],['Kommandant der Garde','male'],['Zeremonienmeister','female'],['Mundschenk','male'],['Waffenmeister','male'],['Stallmeister','female'],['Kerkermeister','male'],['Jagdmeister','female'],['Hafenmeister','male'],['Küchenmeister','male'],['Brotmeister','female'],['Handwerksmeister','male'],['Gartenmeister','female'],['Hofkaplan','male'],['Hofmeister','male'],['Hofdame','female'],['Archivar','male'],['Hoffalkner','female'],['Zwingermeister','male']];
const rite = 'Das cenyrische Rittertum wurzelt in Avallorn. Der Knappe empfängt Ritterschlag und Salbung an einem See oder einem anderen Gewässer. Er schwört auf die Neun Göttlichen und ihre Tugenden; ein zusätzlicher Eid gilt der Dame der See.';
function make({ id, folder, region, type, title, head, heir, motto, origin, patron, people = 'Cenyri, Inselcenyri', wealth = 'Mittelmäßig', attachment, image, territoryId, territoryName, territoryPath }) {
  const f = family(id), p = f.document.houseProfile;
  const name = f.document.title;
  const dir = `${base}/${region}/Haus_${folder}`;
  const liege = p.liegeHouseName || 'König Tristan Pendrag';
  return { dir, attachment, image, content: {
    id, name, type, page: 'haus.html', county: 'Klaueninsel', liege,
    territoryId, territoryName, territoryHref: `${territoryBase}/${territoryPath}`,
    parentHouseId: '', extinct: false, prepared: false, registerPage: true, showMotto: Boolean(motto),
    contentVersion: '20261103-klaueninsel-v1', biographySourceRevision: f.extensions.sourceRevision + 1,
    biographyPreviousDefaultFingerprints: [], biographyIntroTitle: 'Über das Haus', biographyHistoryTitle: 'Herkunft und Geschichte',
    biographySummary: {},
    placeholders: { male: '../Stammbäume/assets/images/placeholders/male.png', female: '../Stammbäume/assets/images/placeholders/female.png' },
    allies: [], hierarchy: [
      { type: 'Sammlung', name: 'Familien Häuser und Clans', slug: 'familien-hauser-und-clans' },
      { type: 'Kontinent', name: 'Estryll', slug: 'estryll' },
      { type: 'Königreich', name: 'Cenyr', slug: 'cenyr' },
      { type: 'Grafschaft', name: 'Klaueninsel', slug: 'klaueninsel' },
      { type: 'Baronie', name: p.barony, slug: region.toLowerCase() },
      { type: 'Sitz', name: p.seat, slug: p.seat.toLowerCase().replaceAll(' ', '-') },
      { type: 'Haus', name, slug: id }
    ],
    profile: {
      highestTitle: title, rank: title, houseType: type, motto, quoteAuthor: '', seat: p.seat,
      affiliation: `Klaueninsel · ${p.barony}`, liege, troopStrength: '', tiarna: '', kerns: '', fleet: '',
      founding: '', milestoneOne: '', milestoneTwo: '', patron: '', knightingPatron: '', people, wealth,
      religion: 'Alerische Kirche', patronDeities: patron, origin, cadetBranches: '', allies: '', enemies: ''
    },
    omitMilitaryProfile: true,
    sections: {}, images: { crest: crest(id), scene: dir.replace('Familien Häuser und Clans/', '') + '/assets/hausdarstellung-original.png',
      sceneAlt: `Überlieferte Hausdarstellung von ${name}`, banner: `../Stammbäume/${p.regionEmblems.barony}` },
    illustrationCategory: 'Hausdarstellung', cadets: [], founder: null, heads: [], heirs: [],
    offices: officeRoles.map(([role, silhouette]) => ({ name: 'Nicht benannt', role, silhouette, detail: 'Amtsinhaber nicht benannt.' })),
    figuresTitle: 'Historische Persönlichkeiten des Hauses', figures: [], trivia: [], currentHead: head, firstHeir: heir,
    headsNote: 'Überlieferte Amtszeiten; offene Zeiträume bleiben offen. Lebensdaten stehen ausschließlich in den bestehenden Personenakten.'
  }};
}

const arth = make({ id:'haus-arth', folder:'Arth', region:'Sturmklaue', type:'Grafenhaus', title:'Graf',
  head:'Parzifal Arth', heir:'Rhydian Arth', motto:'Tapfer an der Front!', origin:'Caradoc Arth · Avallorn', patron:'Der Streiter',
  attachment:'0ea7f98c-1328-48e0-9bda-103e612cf394', image:'https://i.imgur.com/MpBoNsE.png',
  territoryId:'grafschaft-klaueninsel', territoryName:'Klaueninsel', territoryPath:'Grafschaft Klaueninsel.html' });
arth.content.sections = {
  overview:'Haus Arth O’Talgarth ist das Grafengeschlecht der Klaueninsel im äußersten Norden Cenyrs. Talgarth in der Sturmklaue bildet seinen Stammsitz. Die Familie gilt als volksnah, rustikal und loyal. Rittertum, Seefahrt und die Verteidigung der nördlichen Küsten prägen ihren Anspruch auf Herrschaft.',
  history:[
    'Die Wurzeln der Arth liegen in Avallorn. Aus einer Familie unerschütterlicher Ritter gingen im Laufe der Zeit auch erfahrene Kapitäne hervor. Der Schutz des Landes erweiterte sich um die Sicherung von Küsten, Gewässern und Handelswegen.',
    'Während der Gründerzeit Cenyrs hielten sich die Arth zunächst in Mathragon auf. Später zogen sie nach Norden, um die Pysgod im Kampf gegen die Norrnaigh und Marodeure zu unterstützen. Gemeinsam nahmen sie die Klaueninseln ein und errichteten die Feste Talgarth. Aus der Burg wuchs die heutige Stadt.',
    'Die Familie bildete zahlreiche Nachkommen aus, aus denen eigenständige Kadettenhäuser hervorgingen. Nach dem Fall Vennyrs nahm sie außerdem alte Adelshäuser aus dem verlorenen Land auf. Diese erhielten in der Grafschaft eine neue Heimat und Aufgaben beim Wiederaufbau und Küstenschutz. Seit 1720 steht Parzifal Arth an der Spitze des Hauses.'
  ],
  traditions:'Junge Männer der Arth sollen sich früh als Seeleute bewähren und Verantwortung auf See übernehmen. Frauen werden dazu nicht verpflichtet, bei eigenem Interesse jedoch ausdrücklich unterstützt. Individuelle Begabung zählt; die Hausüberlieferung betont Gleichberechtigung. Fahrten mit den Möwensängern und Abenteuer werden nicht verboten, doch der Schutz der Heimat bleibt für viele Arth die vorrangige Aufgabe.',
  knighthood:[rite,'Teulu, schwere Rüstung und die Verbindung von Land- und Seekampf kennzeichnen die Arth. Pelz und Fell schützen gegen die nördlichen Winde; dicker Plattenstahl unterstreicht das robuste Auftreten. Die Ausbildung umfasst Waffenhandwerk, Handeln an Bord und maritime Verteidigung. Neu hinzugekommene Vennyri bringen weitere kriegerische Traditionen mit. Die Stadtwache Talgarths unterscheidet sich durch Wappenröcke und Embleme von den Waffenknechten des Grafen; Kettenhemden, ergänzende Platten und Fell gehören zu ihrer Ausstattung.'],
  holdings:'Talgarth ist das politische und wirtschaftliche Zentrum. Eigene Minen liefern Erze und Mineralien, der Hafen verbindet die Inseln mit den übrigen Landesteilen. Die Arena wird an die Kämpfergilde vermietet. Fischerei, Holzhandel, Bergbau, Jagd und Schiffbau tragen zur Versorgung bei. Die begrenzte Landwirtschaft macht Lebensmitteleinfuhren notwendig, unter anderem über Tredegar, Aberon und die Weidebucht. Die einzelnen Baronien und Herrschaften behalten ihre eigenen örtlichen Verwaltungen.',
  cultureReligion:'Die Arth gehören der Alerischen Kirche an und verehren besonders den Streiter. Die religiöse Hausüberlieferung führt die außergewöhnliche Kraft der Familie auf seinen Segen zurück. Ihre Frömmigkeit ist praktisch und wenig an Ordenszugehörigkeit gebunden. Das Zusammenleben der Inselcenyri mit Crannath-, Norrnaigh- und jüngeren Vennyr-Einflüssen bildet den regionalen Hintergrund.',
  conflictsAlliances:'Die Zusammenarbeit mit den Pysgod gehört zur Gründungsgeschichte. Pawen, Crafanc, Cwingod, Unigol und Eirth sind belegte Kadettenhäuser. Morthwyll und Sélwyn sind eigenständige Vasallenhäuser und werden durch Heiraten nicht zu Kadetten. Die Aufnahme der Diafol und anderer Vennyri festigt die nördlichen Herrschaften. Piraten, Marodeure und Überfälle auf die Küsten sind wiederkehrende Herausforderungen.',
  values:'Bodenständigkeit, Mut, Ehrlichkeit und Stolz bestimmen das Selbstbild. Ein Arth soll durch Taten überzeugen und sich auch für schwere oder schmutzige Arbeit nicht zu schade sein. Diese Volksnähe begründet die Beliebtheit der Familie. Ihr Auftreten gilt zugleich als rauer und rustikaler als das höfische Ideal vieler anderer Cenyri.',
  succession:'Rhydian Arth ist als erster Erbe überliefert.',
  court:'Rhun Penry ist als Vogt, Elisud Crafanc als Kommandant der Garde und Brac Pawen als Waffenmeister benannt. Die weiteren überlieferten Hofämter bleiben ohne namentliche Besetzung. Die ältere Oberhauptfolge enthält große zeitliche Lücken.',
  familyTree:'Die bereits ausgearbeitete Familienakte ist hier eingebettet. Das Hauswappen im Stammbaum öffnet die Hausbiografie.',
  historicalFigures:'Caradoc Arth ist als Gründer des alten, aus Avallorn stammenden Hauses überliefert.'
};
arth.content.biographySummary = {
  overview:'Haus Arth O’Talgarth regiert die Grafschaft Klaueninsel im äußersten Norden Cenyrs. Sein Sitz liegt in Talgarth in der Sturmklaue. Das Grafengeschlecht verbindet Rittertum mit Seefahrt und Küstenverteidigung. Es gilt als volksnah, rustikal und loyal. Parzifal Arth führt das Haus seit 1720; Rhydian ist als Erbe überliefert.',
  history:'Die Familie stammt aus Avallorn. Ihre frühen Ritter stellten Stärke und Ausdauer in den Dienst der Verteidigung. Später kamen erfahrene Kapitäne hinzu, die den Schutzauftrag auf Küsten und Seewege ausdehnten. In der Gründerzeit Cenyrs verweilten die Arth zunächst in Mathragon. Dann unterstützten sie die Pysgod im Norden gegen die Norrnaigh und Marodeure. Gemeinsam eroberten sie die Klaueninseln und errichteten Talgarth, das von einer Feste zur Stadt heranwuchs.',
  character:'Bodenständigkeit, Mut, Ehrlichkeit und Stolz prägen das Haus. Taten zählen mehr als vornehme Worte. Die Arth scheuen praktische Arbeit nicht und suchen die Nähe zur Bevölkerung. Ihr raues Auftreten steht neben einer ausgeprägten Verpflichtung gegenüber der Heimat. Die Verehrung des Streiters verbindet diese Haltung mit dem Glauben an einen göttlichen Segen der Blutlinie.',
  customs:'Junge Männer sollen sich früh auf See bewähren. Frauen werden bei eigenem Interesse ebenso gefördert. Begabung und Neigung werden anerkannt, während der Küstenschutz für viele den Mittelpunkt des Lebens bildet. Schwere Rüstung, Pelz und Fell kennzeichnen das kriegerische Erscheinungsbild; die Ausbildung verbindet Land- und Seekampf.',
  holdings:'Talgarth, sein Hafen, eigene Minen und die an die Kämpfergilde vermietete Arena gehören zur wirtschaftlichen Grundlage. Fischerei, Holz, Bergbau und Schiffbau ergänzen einander. Die kargen Böden begrenzen den Ackerbau, weshalb verlässliche Handelsverbindungen für die Lebensmittelversorgung notwendig sind.',
  culture:'Die Familie gehört der Alerischen Kirche an und verehrt besonders den Streiter. Volksnähe und praktische Pflichterfüllung sind wichtiger als der Eintritt in einen Orden. Der Leitspruch lautet „Tapfer an der Front!“',
  relations:'Pawen, Crafanc, Cwingod, Unigol und Eirth sind Kadettenhäuser. Weitere eigenständige Vasallen und aufgenommene Familien aus Vennyr ergänzen das Gefüge. Rhun Penry dient als Vogt, Elisud Crafanc als Kommandant der Garde und Brac Pawen als Waffenmeister. Die Zusammenarbeit mit den Pysgod bleibt Teil der gemeinsamen Herkunftserinnerung.'
};
arth.content.founder = person('haus-arth','caradoc-arth','Gründer','Amtszeit nicht überliefert · individuelles Portrait nicht verfügbar');
arth.content.heads = [['rhun-arth','Amtszeit nicht überliefert'],['cadfael-ancient-arth','Amtszeit nicht überliefert'],['tarrant-ancient-arth','Amtszeit nicht überliefert'],['caradoc-line-arth','Amtszeit nicht überliefert'],['traharyan-arth','Amtszeit: 1620–1645'],['gwalchgwyn-arth','Amtszeit: 1645–1660'],['haul-arth','Amtszeit: 1660–1681'],['rhydderch-arth','Amtszeit: 1681–1698'],['run-arth','Amtszeit: 1698–1720'],['parzifal-arth','Amtszeit: seit 1720']].map(([id,detail])=>person('haus-arth',id,'Graf',detail));
arth.content.heirs = [person('haus-arth','rhydian-arth','1. Erbe')];
arth.content.offices = arth.content.offices.map(entry=>entry.role==='Kommandant der Garde'?person('haus-crafanc','elisud-crafanc',entry.role):entry.role==='Waffenmeister'?person('haus-pawen','brac-pawen',entry.role):entry);
const rhunPenry=family('haus-penry').persons.find(entry=>entry.id==='rhun-penry');
if(rhunPenry?.title!=='Vogt des Hauses Arth · Meleris Großvater') throw new Error('Rhun Penrys Vogtamt nicht bestätigt');
arth.content.offices=arth.content.offices.map(entry=>entry.role==='Vogt'?{...person('haus-penry','rhun-penry','Vogt','In der bestehenden Penry-Akte ausdrücklich als Vogt der Arth belegt.'),id:'rhun-penry',familyId:'haus-penry'}:entry);
arth.content.cadets = ['haus-pawen','haus-crafanc','haus-cwningod','haus-unigol','haus-eirth'].map(id=>({ id,name:family(id).document.title,image:crest(id) }));
arth.content.figures = [{...arth.content.founder,description:'Überlieferter Gründer des Hauses Arth. Die Familie führt ihre Wurzeln auf Avallorn zurück und verbindet ihr späteres Grafenamt mit der Erschließung und Verteidigung der Klaueninseln.'}];
arth.content.profile.cadetBranches = 'Pawen, Crafanc, Cwingod, Unigol, Eirth';

const pawen = make({ id:'haus-pawen', folder:'Pawen', region:'Sturmklaue', type:'Ritterfürstenhaus', title:'Ritterfürst',
  head:'Brac Pawen', heir:'Lamorak Pawen', motto:'Die Pranke des Bären vereint Entschlossenheit und Stärke.', origin:'Haus Arth · Lamorak Arth', patron:'Der Streiter',
  attachment:'d08552fd-38bd-4d94-9e92-4b6814adc55a', image:'https://i.imgur.com/ZJPs9qA.png',
  territoryId:'herrschaft-pawen', territoryName:'Herrschaft der Pawen', territoryPath:'Herrschaft der Pawen/Herrschaft der Pawen.html' });
pawen.content.sections = {
  overview:'Die Pawen sind das älteste Kadettenhaus der Arth und Ritterfürsten mit Sitz in Talgarth. Ihr Name bedeutet „Pranke“. Als rechte Hand des Bären verkörpern sie Entschlossenheit und Stärke. Sie sind besonders für die Ausbildung von Cantref und jungen Rittern bekannt.',
  history:['Lamorak Arth steht am Ursprung des Hauses. Einer Legende zufolge reichen die Pawen bis in die Zeit des Alerischen Kaiserreiches zurück; eine genaue Gründungsdatierung ist nicht überliefert. Die Familie entwickelte sich aus den Arth und blieb deren Herrschaft eng verbunden.','Gemeinsam mit den Crafanc bilden sie Pranke und Klaue des Bären. Beim Ausbau Moreas unterstützten sie die Wahl der Cwingod, deren Begabung für Verwaltung und Politik als besonders geeignet galt. Brac Pawen führt das Haus seit 1695.'],
  traditions:'Die Ausbildung des Nachwuchses und die Pflege ritterlicher Pflichten stehen im Vordergrund. Ehre, Treue und Pflichtgefühl werden in der aktuellen Gebietsüberlieferung ausdrücklich hervorgehoben. Die knappe alte Hausvorlage nennt keine eigenen Feste oder zusätzlichen Hausrituale.',
  knighthood:[rite,'Die Pawen sind besonders für Cantref und die Ausbildung angehender Ritter von Talgarth und Cenyr bekannt. Der Schutz der Gemeinschaft und die Treue zum Grafenhaus prägen ihren Dienst. Brac Pawen bekleidet außerdem das Amt des Waffenmeisters am Hof der Arth.'],
  holdings:'Die Herrschaft umfasst unter anderem die Bergbausiedlung Dyfnor, das verwüstete Brondir und das Kloster Llanvyr. Erze, Edelmetalle, Schmiedehandwerk und andere Zünfte tragen zur Wirtschaft bei. Llanvyr ist ein Zentrum der Kräuterkunde und Alchemie. Der Wiederaufbau Brondirs soll Landwirtschaft und Handwerk wieder stärken. Diese aktuellen Gebietsangaben ergänzen die weitgehend leere alte Besitzrubrik.',
  cultureReligion:'Die Pawen gehören der Alerischen Kirche an und verehren den Streiter. Die Kultur der Inselcenyri verbindet Ehre und Wehrhaftigkeit mit Zusammenhalt und praktischer Arbeit. Die ältere Vorlage stellt kriegerische Begabung stärker heraus als wirtschaftlichen Ehrgeiz; die vorhandenen Siedlungsquellen belegen dennoch eine vielseitige handwerkliche und bergbauliche Lebensgrundlage.',
  conflictsAlliances:'Die engsten Bindungen gelten den Arth und ihren Kadettenhäusern. Mit den Crafanc verbindet die Pawen das Bild von Pranke und Klaue. Die aktuelle Diafol-Gebietsgeschichte überliefert, dass die Pawen Tirwen aus Freundschaft an die Neuankömmlinge überließen. Eine persönliche aktuelle Fehde ist nicht benannt.',
  values:'Ehre, Loyalität und Pflicht gegenüber der Gemeinschaft bestimmen die überlieferte Haltung. Die Familie versteht sich als rechte Hand der Arth und als Hüterin älterer ritterlicher Werte.',
  succession:'Lamorak, Amaethon und Ianto Pawen stehen in der überlieferten Erbfolge.',
  court:'Blegywryd Pawen ist in der aktuellen Gebietsquelle als Marschall des Ritterfürsten benannt. Die zwanzig alten Haus-Hofämter sind ohne individuelle Besetzung überliefert.',
  familyTree:'Die bestehende Familienakte ist eingebettet. Die mitgelieferte alte Genealogie wird nicht übernommen.',
  historicalFigures:'Lamorak Arth ist als Gründer des Hauses überliefert.'
};
pawen.content.biographySummary = {
  overview:'Haus Pawen O’Talgarth ist ein Ritterfürstenhaus der Sturmklaue und das älteste Kadettenhaus der Arth. Die Familie sitzt in Talgarth und dient dem dortigen Grafengeschlecht. Ihr Name bedeutet „Pranke“; als rechte Hand des Bären verbindet sie Entschlossenheit mit Stärke. Brac Pawen steht seit 1695 an ihrer Spitze.',
  history:'Lamorak Arth ist als Gründer überliefert. Der Legende nach bestand der Zweig bereits zur Zeit des Alerischen Kaiserreiches. Eine genaue Gründungszeit ist nicht gesichert. Gemeinsam mit den Crafanc entwickelten sich die Pawen zu einer wichtigen Stütze der Arth. Bei der Entscheidung über den Ausbau Moreas unterstützten beide Häuser die Cwingod, deren Fähigkeiten als Politiker und Verwalter für diese Aufgabe besonders geeignet erschienen.',
  character:'Ehre, Treue und Pflichtgefühl prägen das Selbstverständnis. Die Pawen gelten vor allem als gute Krieger und Ausbilder. Der Schutz der Gemeinschaft und die Bindung an die Arth stehen im Mittelpunkt. Ihr wirtschaftlicher Ruf ist in der älteren Hausvorlage zurückhaltend beschrieben; die aktuellen Gebietsquellen zeigen daneben eine vielseitige handwerkliche und bergbauliche Grundlage.',
  customs:'Der Nachwuchs wird auf ritterlichen Dienst vorbereitet. Besonders die Cantref gehören zum Ruf des Hauses. Die gemeinsame cenyrische Salbung am Gewässer verbindet das Rittertum mit den Neun Göttlichen und der Dame der See. Eigene zusätzliche Feste sind nicht überliefert.',
  holdings:'Dyfnors Bergbau liefert Metalle und andere wertvolle Rohstoffe. Das Kloster Llanvyr steht für Kräuterkunde, Alchemie und Heilmittel. Brondir ist nach Verwüstungen durch die Nordmänner auf Wiederaufbau angewiesen. Schmiede und Zünfte ergänzen Landwirtschaft und Handel. Die einzelnen Siedlungen bleiben Teil der Herrschaft unter dem Grafenhaus Arth.',
  culture:'Die Pawen gehören der Alerischen Kirche an und verehren den Streiter. Gemeinschaft, Wehrhaftigkeit und praktische Arbeit verbinden Haus und Gefolgsleute.',
  relations:'Lamorak, Amaethon und Ianto sind die überlieferten Erben. Brac dient den Arth als Waffenmeister, Blegywryd dem eigenen Haus als Marschall. Die Freundschaft zu den aufgenommenen Diafol zeigt sich in der Überlassung Tirwens. Eine konkrete persönliche Fehde ist nicht benannt.'
};
pawen.content.founder = person('haus-pawen','lamorak-arth','Gründer','Amtszeit nicht überliefert');
pawen.content.heads = [['lamorak-arth','Amtszeit nicht überliefert'],['cadoc-pawen','Amtsbeginn offen · bis 1643'],['sadwrn-pawen','Amtszeit: 1643–1670'],['rhodri-pawen','Amtszeit: 1670–1695'],['brac-pawen','Amtszeit: seit 1695']].map(([id,detail])=>person('haus-pawen',id,'Ritterfürst',detail));
pawen.content.heirs = ['lamorak-pawen','amaethon-pawen','ianto-pawen'].map((id,index)=>person('haus-pawen',id,`${index+1}. Erbe`));
pawen.content.offices.push(person('haus-pawen','blegywryd-pawen','Marschall des Ritterfürsten','In der aktuellen Gebietsquelle benannt'));
pawen.content.figures = [{...pawen.content.founder,description:'Überlieferter Gründer des ältesten Arth-Kadettenhauses. Die weit zurückreichende Gründungslegende besitzt keine gesicherte Jahreszahl.'}];

const crafanc = make({ id:'haus-crafanc', folder:'Crafanc', region:'Sturmklaue', type:'Ritterfürstenhaus', title:'Ritterfürst',
  head:'Elisud Crafanc', heir:'Melwas Crafanc', motto:'Die Klaue des Bären als Zeichen von Stärke und Mut.', origin:'Haus Arth · Artgal Arth', patron:'Der Streiter',
  attachment:'6b4f8db2-6bee-49ad-b8a6-d9be4613b6d7', image:'https://i.imgur.com/jxnu0Vv.png',
  territoryId:'herrschaft-crafanc', territoryName:'Herrschaft der Crafanc', territoryPath:'Herrschaft der Crafanc/Herrschaft der Crafanc.html' });
crafanc.content.sections = {
  overview:'Haus Crafanc O’Talgarth ist ein Ritterfürstenhaus der Sturmklaue und der zweite Kadettenzweig der Arth. Crafanc bedeutet „Klaue“. Gemeinsam mit den Pawen bildet die Familie Pranke und Klaue des Bären und versteht sich als Schild und Schwert der gräflichen Herrschaft. Teulu, Schiffbauer, Kapitäne und Seeleute bestimmen ihren Ruf.',
  history:['Artgal Arth gilt als Gründer des Zweiges. Das Haus entstand nach den Pawen und kurz vor den Cwingod. Eine genaue Gründungszeit ist nicht überliefert. Die besondere Verbindung von Seefahrt und Rittertum blieb kennzeichnend.','Beim Aufbau Moreas unterstützten die Crafanc gemeinsam mit den Pawen die Wahl der Cwingod. Die aktuelle Talklauen-Überlieferung hebt ihre Mitwirkung am Schiffbau hervor. Seit 1698 führt Elisud Crafanc das Haus.'],
  traditions:'Disziplin, Zusammenarbeit und harte Arbeit verbinden ritterlichen Dienst mit maritimer Handwerkskunst. Respekt und Ehre sollen durch Taten, kluge Führung und das Bestehen von Gefahren verdient werden. Die alte Hausvorlage enthält keine ausgearbeiteten zusätzlichen Fest- oder Ritualtraditionen.',
  knighthood:[rite,'Die Crafanc sind für starke Teulu und erfahrene Kapitäne bekannt. Schutz der Küsten und Sicherung der Siedlungen gehören zu ihrem Dienst. Die Seefahrer verbinden Kampfgeist mit handwerklichem Können und Vertrautheit mit den unberechenbaren Gewässern. Elisud Crafanc ist zugleich als Kommandant der Garde am Hof der Arth benannt.'],
  holdings:'Die aktuelle Herrschaftsquelle nennt Ffordd, Garnmor und Maendil als zusammenhängende wirtschaftliche Stützen: Ffordd liefert Erze und Metalle, Garnmor ist Hafen- und Schiffbauzentrum, Maendil versorgt die Werften mit Holz. Wartung, Ausrüstung und Verkauf von Schiffen ergänzen den Rohstoffhandel. Die alte Hausvorlage nennt außerdem Werft und Fischerei in Guwan. Dieser Name bleibt als ältere Überlieferung erhalten; eine sichere heutige Gleichsetzung mit Garnmor ist nicht belegt.',
  cultureReligion:'Die Familie gehört der Alerischen Kirche an und verehrt den Streiter. Mut, Ausdauer und Loyalität prägen die Kultur. Handwerker und Seeleute, Bergleute und Holzfäller tragen mit unterschiedlichen Fähigkeiten zur Herrschaft bei. Die aktuelle Gebietsüberlieferung verbindet den Schiffbau mit gemeinschaftlicher Arbeit und einer langfristig angelegten Versorgung der Werften aus den Wäldern.',
  conflictsAlliances:'Die Bindungen an Arth, Pawen und Cwingod sind eng. Die gemeinsame Rolle als Pranke und Klaue des Bären beschreibt die Zusammenarbeit mit den Pawen. Eine konkrete persönliche Fehde ist in der alten Hausvorlage nicht benannt.',
  values:'Stärke, Mut, Pflichtgefühl und Disziplin gehören zum Selbstverständnis. Küstenschutz und wirtschaftliches Handwerk werden als gemeinsame Verantwortung verstanden. Die Treue zum Haus Arth verbindet sich mit Stolz auf die eigenen Fähigkeiten.',
  succession:'Melwas, Iestyn und Sadwyn Crafanc stehen in der überlieferten Erbfolge.',
  court:'Die Oberhauptfolge führt von Artgal über Caradoc, Cynwrig und Clinoch zu Elisud. Die alten Hofämter sind nicht namentlich besetzt.',
  familyTree:'Die bestehende Familienakte ist eingebettet. Die mitgelieferte Genealogie bleibt von dieser Übernahme ausgeschlossen.',
  historicalFigures:'Artgal Arth ist als Gründer des zweiten Kadettenhauses der Arth überliefert.'
};
crafanc.content.biographySummary = {
  overview:'Haus Crafanc O’Talgarth ist ein Ritterfürstenhaus der Sturmklaue und der zweite Kadettenzweig der Arth. Der Name bedeutet „Klaue“ und verbindet das Haus mit dem Bären des Muttergeschlechts. Teulu, Schiffbauer, Kapitäne und Seeleute begründen seinen Ruf. Elisud Crafanc führt die Familie seit 1698.',
  history:'Artgal Arth gilt als Gründer. Der Zweig entstand nach den Pawen und kurz vor den Cwingod; genaue Gründungsjahre sind nicht überliefert. Gemeinsam mit den Pawen bilden die Crafanc Pranke und Klaue des Bären. Beide unterstützten die Entscheidung, den Cwingod den Aufbau Moreas zu übertragen. Die Crafanc blieben dabei durch ihre Schiffbaukenntnisse wichtige Partner.',
  character:'Mut, Stärke und Disziplin stehen neben der Bereitschaft zu harter Arbeit. Respekt und Ehre sollen durch Taten und kluge Führung erworben werden. Der Schutz der Küsten ist ebenso Teil der Hauspflicht wie die Sicherung der Siedlungen. Die maritime Erfahrung verbindet Kampfgeist mit praktischer Handwerkskunst und dem Bewusstsein für die Gefahren des Meeres.',
  customs:'Die Teulu stehen für den ritterlichen Dienst des Hauses. Die gemeinsame cenyrische Salbung am Gewässer bindet die Ritter an die Neun Göttlichen und die Dame der See. Zusätzliche eigene Feste oder Hausrituale sind in der alten Vorlage nicht ausgearbeitet.',
  holdings:'Ffordd liefert Metalle und Erze; Garnmor ist das aktuelle Hafen- und Schiffbauzentrum. Die Holzfällersiedlung Maendil versorgt die Werften. Der Handel mit Rohstoffen und Schiffen verbindet diese Orte. Die ältere Hausvorlage nennt Werft und Fischerei in Guwan, dessen genaue heutige Zuordnung offenbleibt. Eine Gleichsetzung mit Garnmor wird nicht behauptet.',
  culture:'Die Crafanc gehören der Alerischen Kirche an und verehren den Streiter. Gemeinschaft und Zusammenarbeit verbinden Seeleute, Handwerker, Holzfäller und Bergleute. Die einzelnen Fähigkeiten ergänzen sich in der wirtschaftlichen Grundlage der Herrschaft.',
  relations:'Die Loyalität gilt dem Grafenhaus Arth. Elisud bekleidet dort das Amt des Kommandanten der Garde. Die engen Beziehungen zu Pawen und Cwingod verbinden das Haus mit den älteren Arth-Zweigen. Melwas, Iestyn und Sadwyn bilden die überlieferte Erbfolge.'
};
crafanc.content.founder = person('haus-crafanc','artgal-arth','Gründer','Amtszeit nicht überliefert');
crafanc.content.heads = [['artgal-arth','Amtszeit nicht überliefert'],['caradoc-crafanc','Amtszeit: 1615–1652'],['cynwrig-crafanc','Amtszeit: 1652–1677'],['clinoch-crafanc','Amtszeit: 1677–1698'],['elisud-crafanc','Amtszeit: seit 1698']].map(([id,detail])=>person('haus-crafanc',id,'Ritterfürst',detail));
crafanc.content.heirs = ['melwas-crafanc','iestyn-crafanc','sadwyn-crafanc'].map((id,index)=>person('haus-crafanc',id,`${index+1}. Erbe`));
crafanc.content.figures = [{...crafanc.content.founder,description:'Überlieferter Gründer des zweiten Arth-Kadettenhauses. Seefahrt, Schiffbau und ritterlicher Dienst kennzeichnen die spätere Tradition der Crafanc.'}];

const diafol = make({ id:'haus-diafol-talgarth', folder:'Diafol', region:'Sturmklaue', type:'Ritterfürstenhaus', title:'Ritterfürst',
  head:'Tryffin Diafol', heir:'Tawr Diafol', motto:'Kämpfend leben wir. Kämpfend sterben wir.', origin:'Haus Diafol aus Trefgoch in Vennyr', patron:'Der Streiter · Baldran', people:'Vennyri, Inselcenyri', wealth:'Im Wiederaufbau',
  attachment:'28d1cbd6-7711-4e2c-b3ea-544c6690f1fa', image:'https://i.imgur.com/PgyaJIA.png',
  territoryId:'herrschaft-diafol', territoryName:'Herrschaft der Diafol', territoryPath:'Herrschaft der Diafol/Herrschaft der Diafol.html' });
diafol.content.sections = {
  overview:'Die Diafol von Talgarth sind die cenyrische Fortsetzung eines alten Hauses aus Trefgoch in Vennyr. Früher dienten sie den Trachwyll. Nach dem Verlust der Heimat fanden sie bei den Arth Zuflucht und bewohnen die ehemalige Talgarther Burg der Cwingod. Tryffin Diafol führt die seit 1720 getrennt geführte Ritterfürstenlinie.',
  history:[
    'Um den Ursprung des Hauses ranken sich widersprechende Legenden. Eine erzählt, der Gründer habe in Ogerblut gebadet und dadurch außergewöhnliche Widerstandskraft sowie Unempfindlichkeit gegen Kälte erhalten; Feuer bereite ihm dagegen Unbehagen. Der Druide Ogma wird als Zeuge dieser Erzählung genannt. Eine andere, vom Klerus bestrittene Geschichte behauptet, der Gründer sei aus der gewaltsamen Verbindung eines Ogers mit einer Frau aus Vennyr hervorgegangen. Diese Erzählungen sind Hausmythen, keine bestätigte Abstammung.',
    'Beim Fall Vennyrs verloren die Diafol Trefgoch und ihren früheren Besitz. Die Aufgabe der Städte und der Rückzug der Trachwyll brachen aus Sicht der Diafol deren Anspruch auf Gefolgschaft. Graf Runs Taten begründeten ihre Bewunderung für die Arth. Die Überlebenden wurden in Talgarth aufgenommen und erhielten eine neue Aufgabe im Schutz des Nordens.',
    'Die aktuelle Herrschaftsgeschichte beschreibt den Wiederaufbau von Tewdar und Dôrgar. Tirwen wurde ihnen von den Pawen aus Freundschaft überlassen. Damit tritt zur Erinnerung an den Verlust eine neue wirtschaftliche Grundlage aus Bergbau, Fischerei und Holzverarbeitung.'
  ],
  traditions:'Beim jährlichen Fest des Blutes erinnern Gesang und Heldengeschichten an Vorfahren und Gefallene. Im Ritual des ersten Blutes beweisen sich neue Krieger in einem kontrollierten Kampf. Wer zuerst Blut vergießt, eigenes oder fremdes, wird in die Gemeinschaft aufgenommen. Zum Abschluss werden kleine Narben als Zeichen besiegter Gegner und des persönlichen Kriegserlebnisses gesetzt. Die Bräuche betonen Mut und Zusammenhalt.',
  knighthood:[rite,'Die Diafol gestalten ihre Ausrüstung absichtlich fremdartig. Helme aus Schädelknochen besiegter Trolle oder Grimnaks, teils mit Hörnern, erinnern an frühere Gegner. Fell und gezielt gesetzte Metallplatten verbinden Kälteschutz mit Beweglichkeit. Das Erscheinungsbild soll einschüchtern und die Widerstandskraft des Hauses verkörpern. Die aktuelle Gebietsquelle beschreibt außerdem Morwyr-Ausbildung in Tewdar und die Sicherung der nördlichen Küsten.'],
  holdings:'Die ehemalige Cwingod-Burg in Talgarth ist der neue Sitz. In Tewdar soll eine frühere Crafanc-Festung wieder als Vorposten dienen. Dôrgar wird als zerstörtes Fischerdorf mit Wiederaufbau und Entwicklungsmöglichkeiten im Schiffbau beschrieben. Tirwens Eisen und Erze tragen zur Finanzierung bei. Fischerei und Holzverarbeitung ergänzen die begrenzten Mittel. Die frühere Besitzlosigkeit gehört zur Fluchtgeschichte und beschreibt nicht den gesamten aktuellen Stand.',
  cultureReligion:'Baldran, der Streiter, ist der verehrte Kriegsgott innerhalb der Alerischen Kirche. Ehre, Pflicht und Loyalität sollen im Kodex der Stärke zusammenkommen. Die Diafol sehen sich als Kämpfer gegen Unrecht und als Beschützer von Menschen in Not. Ihre Strenge und Verachtung der Feigheit stehen neben praktischer Hilfe für Schutzbedürftige.',
  conflictsAlliances:'Der Verlust Vennyrs begründet den Groll gegen die Nordmänner. Den Rückzug der Trachwyll deuten die Diafol als Bruch mit ihrem Stärkeideal; die Arth erkennen sie dagegen als neue Lehnsherren an. Freundschaft mit den Pawen unterstützte den Neubeginn. Die Bewunderung für den Mut der Cenyri festigt ihre Bindung an die neue Heimat.',
  values:'Der Kodex der Stärke fordert Mut, direkte Worte und Loyalität zu einem als stark und würdig anerkannten Herrn. Die Diafol scheuen Konflikte nicht. Schwäche allein soll jedoch niemanden von Hilfe ausschließen; abgelehnt wird vor allem Feigheit.',
  succession:'Tawr Diafol ist als Erbe der Talgarther Linie überliefert.',
  court:'Die alten Oberhäupter Gwrgwst, Ercwlff und Traharyan gehören zur Trefgoch-Überlieferung. Tryffin führt die Talgarther Linie seit 1720. Die alten Hofämter sind nicht namentlich besetzt.',
  familyTree:'Die eigenständige Talgarther Familienakte ist eingebettet. Die Vennyr-Ursprungsakte bleibt davon getrennt; die gelieferte Genealogie wird nicht importiert.',
  historicalFigures:'Gwrgwst ist als Gründer des alten Hauses überliefert. Die um seinen Ursprung erzählten Mythen werden nicht als gesicherte Lebens- oder Abstammungsdaten übernommen.'
};
diafol.content.biographySummary = {
  overview:'Haus Diafol O’Talgarth ist eine Ritterfürstenlinie der Sturmklaue. Die Familie stammt aus Trefgoch in Vennyr und fand nach dem Verlust ihrer Heimat bei den Arth Zuflucht. Ihr neuer Sitz ist die ehemalige Talgarther Burg der Cwingod. Tryffin Diafol führt die seit 1720 getrennt geführte Linie; Tawr ist als Erbe überliefert.',
  history:'Das alte Haus diente den Trachwyll. Beim Einfall der Nordmänner verlor es Trefgoch und seinen früheren Besitz. Den Rückzug seiner Lehnsherren deutete es als Verlust ihres Anspruchs auf Gefolgschaft. Graf Runs Heldentaten begründeten dagegen die Bewunderung für die Arth. Die Aufnahme in Talgarth eröffnete den Überlebenden einen Neubeginn. Die frühere Herkunft bleibt in einer eigenen Trefgoch-Akte erhalten.',
  character:'Der Kodex der Stärke prägt das Haus. Mut, direkte Worte und Loyalität zu einem als würdig anerkannten Herrn zählen viel. Feigheit wird verachtet, Schutzbedürftige sollen dennoch nicht im Stich gelassen werden. Die Diafol beschreiben sich als Kämpfer gegen Unrecht und verbinden Strenge mit praktischer Hilfsbereitschaft.',
  customs:'Das jährliche Fest des Blutes erinnert mit Gesang und Geschichten an Vorfahren und Gefallene. Neue Krieger beweisen sich im kontrollierten Ritual des ersten Blutes. Kleine Narben bewahren die Erinnerung an besiegte Gegner und den Preis des Krieges. Fremdartige Knochenhelme, Fell und Metallplatten erinnern an frühere Kämpfe gegen Trolle, Oger und Grimnaks.',
  holdings:'Die neue Herrschaft baut Tewdar und Dôrgar wieder auf. Tirwen wurde von den Pawen aus Freundschaft überlassen. Eisen und Erze, Fischerei und Holzverarbeitung tragen zur wirtschaftlichen Erholung bei. Der Verlust des alten Besitzes erklärt die Fluchtgeschichte; die aktuellen Gebietsquellen belegen inzwischen eigene Aufgaben und Einkünfte.',
  culture:'Die Diafol gehören der Alerischen Kirche an und verehren Baldran, den Streiter. Um Gründer Gwrgwst ranken sich Ogerblut- und Herkunftsmythen. Diese bleiben ausdrücklich Legenden und begründen keine bestätigte Abstammung oder neue Fähigkeit.',
  relations:'Die Arth sind die neuen Lehnsherren, die Pawen wichtige Freunde beim Wiederaufbau. Der Groll gegen die Nordmänner und die Enttäuschung über die Trachwyll prägen die Erinnerung an Vennyr. Das Motto lautet „Kämpfend leben wir. Kämpfend sterben wir.“'
};
diafol.content.founder = person('haus-diafol','gwrgwst-diafol','Gründer des Ursprungshauses','Amtszeit nicht überliefert · Trefgoch');
diafol.content.heads = [['gwrgwst-diafol','Amtszeit nicht überliefert'],['ercwlff-diafol','Amtsbeginn offen · bis 1695'],['traharyan-diafol','Amtszeit: 1695–1720']].map(([id,detail])=>person('haus-diafol',id,'Ritterfürst von Trefgoch',detail));
diafol.content.heads.push(person('haus-diafol-talgarth','tryffin-diafol','Ritterfürstin von Talgarth','Amtszeit: seit 1720'));
diafol.content.heirs = [person('haus-diafol-talgarth','tawr-diafol','1. Erbe')];
diafol.content.figures = [{...diafol.content.founder,description:'Überlieferter Gründer des alten Hauses aus Vennyr. Die verschiedenen Erzählungen über Ogerblut und seine Herkunft sind ausdrücklich unbestätigte Hausmythen.'}];

const cwingod = make({ id:'haus-cwningod', folder:'Cwingod', region:'Talklaue', type:'Baronenhaus', title:'Baron',
  head:'Galeshin Cwingod', heir:'Artgal Cwingod', motto:'Im Maul des Bären liegt die Kraft, die durch Worte und Taten spricht.', origin:'Haus Arth · Galeshin Arth', patron:'Dame der See · Der Knecht', people:'Cenyri, Nordcenyri, Inselcenyri',
  attachment:'f9c7780b-c9ab-4651-926c-38ed319c9989', image:'https://i.imgur.com/GguxeYO.png',
  territoryId:'baronie-talklaue', territoryName:'Talklaue', territoryPath:'Baronie Talklaue/Baronie Talklaue.html' });
cwingod.content.sections = {
  overview:'Haus Cwingod O’Morea ist das dritte Kadettenhaus der Arth und das Baronenhaus der Talklaue. Der Stammsitz ist Cra Fryn; Morea ist als weiterer Stadt- und Handelssitz belegt. Als „Maul“ des Bären stehen die Cwingod für Politik, Verwaltung und Handel.',
  history:['Das Haus ging aus Galeshin Arth hervor und bewohnte zunächst eine Burg in Talgarth. Als ein sicherer Hafen im Süden benötigt wurde, berief der Graf die Ritterfürsten von Pawen, Crafanc und Cwingod zur gemeinsamen Beratung.','Pawen und Crafanc betrachteten sich als rechte und linke Hand der Arth. Sie hielten die Cwingod wegen ihrer politischen und verwalterischen Fähigkeiten für besonders geeignet, das Fischerdorf Morea auszubauen. Die gemeinschaftlich getroffene Wahl führte zur Übertragung der Aufgabe und später zum Baronstitel.','Morea entwickelte sich zum bedeutenden südlichen Ankerplatz und Handelsumschlagplatz. Eine Straße verbindet den Hafen mit Talgarth; die Versorgung muss dadurch nicht mehr den langen Seeweg um die Inseln nehmen. Seit 1738 führt Galeshin Cwingod das Haus.'],
  traditions:'Die Cwingod betonen den Dienst als Verwalter, Politiker und Händler. Ruhiges Abwägen und verlässliche Arbeit begleiten die Pflicht, den Warenverkehr zu sichern. Trotz des Baronstitels soll die Brüderlichkeit mit den anderen Arth-Kadettenhäusern erhalten bleiben.',
  knighthood:[rite,'Massive Rüstung in Gelb, schwarzes Fell und kräftige Träger kennzeichnen das überlieferte Erscheinungsbild. Größe, robuste Ausrüstung und eine einschüchternde Präsenz verkörpern das „Maul“ des Bären. Kraft und Übung sollen den sicheren Umgang mit der schweren Rüstung ermöglichen. Daraus wird keine tatsächliche Unverwundbarkeit abgeleitet.'],
  holdings:'Die Talklaue mit Register- und Stammsitz Cra Fryn bildet die territoriale Einordnung. Morea ist der überlieferte Handels- und Hafenort und ein weiterer belegter Sitz. Der sichere Ankerplatz und die Landverbindung nach Talgarth dienen der Versorgung der gesamten Grafschaft. Landwirtschaft, Fischfang und Bergbau ergänzen den Umschlag von Waren. Die Dyfrgi von Caer Cryftlawd sind die örtlichen Vasallen der Cwingod.',
  cultureReligion:'Die Cwingod gehören zur Alerischen Kirche. Der Dame der See ist in Morea eine prächtige Kapelle gewidmet. Daneben verehren sie den Knecht als Patron von Arbeit, Handel und Aufrichtigkeit. Im Vergleich zu den temperamentvolleren Arth-Verwandten gelten sie als ruhiger und besonnener; Ehrlichkeit und wirtschaftliche Verantwortung werden ausdrücklich betont.',
  conflictsAlliances:'Das Haus hält sich nach eigener Überlieferung möglichst aus persönlichen Konflikten heraus und erfüllt seine Aufgabe für den Grafen. Piraten gefährden die Handelsverbindungen. Bündnisse gelten vor allem den Arth, ihren Kadetten und anderen seefahrenden Häusern. Der höhere Rang soll keine Abkehr von den verwandten Zweigen begründen.',
  values:'Brüderlichkeit, Besonnenheit, harte Arbeit und Verlässlichkeit stehen im Mittelpunkt. Die Cwingod sehen den Hafen als Verpflichtung gegenüber der Grafschaft. Verwaltung und Handel schließen die Bereitschaft nicht aus, gemeinsam mit den anderen Häusern Heimat und Verkehrswege zu schützen.',
  succession:'Artgal und Clinoch Cwingod bilden die überlieferte Erbfolge.',
  court:'Die Amtsfolge führt vom Gründer Galeshin Arth über Rhodhri, Idris, Sath und Domnall zum heutigen Galeshin. Die zwanzig Hofämter sind nicht namentlich besetzt.',
  familyTree:'Die vorhandene Familienakte unter der stabilen ID haus-cwningod ist eingebettet. Die gelieferte alte Stammbaumdarstellung wird nicht übernommen.',
  historicalFigures:'Galeshin Arth steht als Gründer am Ursprung des Hauses. Sein späterer Namensvetter Galeshin Cwingod ist eine eigene, bereits bestehende Person.'
};
cwingod.content.biographySummary = {
  overview:'Haus Cwingod O’Morea ist das Baronenhaus der Talklaue und das dritte Kadettenhaus der Arth. Der kanonische Stammsitz ist Cra Fryn; Morea bleibt als weiterer Stadt- und Handelssitz belegt. Als „Maul“ des Bären stehen die Cwingod für Politik, Verwaltung und Handel. Galeshin Cwingod führt das Haus seit 1738.',
  history:'Gründer Galeshin Arth begründete den Zweig, der zunächst eine Burg in Talgarth bewohnte. Als ein südlicher Versorgungshafen benötigt wurde, beriet der Graf mit Pawen, Crafanc und Cwingod über den Ausbau Moreas. Die beiden anderen Kadettenhäuser unterstützten die Wahl der politisch und verwalterisch begabten Cwingod. Aus dem Fischerdorf entwickelte sich ein wichtiger Ankerplatz; das Haus erhielt später den Baronstitel.',
  character:'Besonnenheit, Verlässlichkeit und harte Arbeit bestimmen das Selbstbild. Der höhere Rang soll die Brüderlichkeit mit den anderen Arth-Zweigen nicht beeinträchtigen. Handel und Verwaltung gelten als Dienst an der Grafschaft. Die Cwingod sind bereit, bei Bedarf selbst anzupacken und gemeinsam mit verwandten Häusern Heimat und Verkehrswege zu schützen.',
  customs:'Im Vergleich zu den temperamentvolleren Verwandten gelten sie als ruhiger. Ihre Ritter tragen massive gelbe Rüstung und schwarzes Fell. Die robuste Erscheinung versinnbildlicht Stärke und Mut. Politisches Abwägen und Verwaltungsgeschick sind daneben ebenso prägende Fähigkeiten wie der ritterliche Dienst.',
  holdings:'Moreas sicherer Hafen und die Straße nach Talgarth verkürzen die Versorgung der nördlichen Stadt. Waren müssen den Inselbogen dadurch nicht vollständig auf See umfahren. Landwirtschaft, Fischerei und Bergbau ergänzen den Handel der Talklaue. Die Dyfrgi von Caer Cryftlawd gehören zu den örtlichen Vasallen. Die aktuelle Familienakte unterscheidet Cra Fryn als Hauptsitz von Morea als zusätzlichem Sitz.',
  culture:'Die Familie gehört der Alerischen Kirche an. Eine Kapelle in Morea ist der Dame der See gewidmet. Der Knecht steht für Arbeit, Handel und Aufrichtigkeit; beide Verehrungen verbinden maritime Erfahrung mit wirtschaftlicher Verantwortung.',
  relations:'Die Arth bleiben der Lehnsherr. Enge Beziehungen gelten den Kadettenhäusern und anderen Seefahrerfamilien. Artgal und Clinoch sind die überlieferten Erben. Persönliche Konflikte werden möglichst vermieden, während der Schutz vor Piraten zum Alltag des Handels gehört.'
};
cwingod.content.founder = person('haus-cwningod','galeshin-ancient-arth','Gründer','Amtszeit nicht überliefert');
cwingod.content.heads = [['galeshin-ancient-arth','Amtszeit nicht überliefert'],['rhodhri-cwningod','Amtszeit: 1663–1671'],['idris-cwingod','Amtszeit: 1671–1672'],['sath-cwningod','Amtszeit: 1672–1713'],['domnall-cwingod','Amtszeit: 1713–1738'],['galeshin-cwningod','Amtszeit: seit 1738']].map(([id,detail])=>person('haus-cwningod',id,'Baron',detail));
cwingod.content.heirs = ['artgal-cwingod','clinoch-cwingod'].map((id,index)=>person('haus-cwningod',id,`${index+1}. Erbe`));
cwingod.content.figures = [{...cwingod.content.founder,description:'Gründer des dritten Arth-Kadettenhauses. Die späteren Cwingod übernahmen den Ausbau Moreas und die Verantwortung für die Talklaue.'}];

const decisions = {
  'haus-arth': [
    'Aktuelle Grafschaft Klaueninsel, Sturmklaue und Talgarth haben Vorrang vor dem früheren Sammelnamen Grafschaft Talgarth. Alte Städtenamen werden nicht zu neuen Grafschaften.',
    'Der erste Caradoc Arth besitzt in der kanonischen Akte absichtlich kein abrufbares individuelles Portrait. Gründerkarte mit Silhouette und ohne Personenlink; keine Übernahme des Bildes seines späteren Namensvetters.',
    'Die erste Caradoc-Karte der Oberhauptfolge ist caradoc-line-arth; Gründer caradoc-arth bleibt davon getrennt. 1620–1645 sind Traharyans Amtsjahre, nicht Lebensdaten.',
    'Die Hofnamen folgen der tatsächlichen Tabellenspalte: Elisud Crafanc = Kommandant der Garde; Brac Pawen = Waffenmeister.',
    'Nur Pawen, Crafanc, Cwingod, Unigol und Eirth sind als Kadetten ausgewiesen. Morthwyll und Sélwyn bleiben eigenständige Vasallenhäuser.',
    'Abgebrochener Traditionssatz und punktierte Platzhalter wurden nicht als Lore ergänzt. Die Segnung des Streiters bleibt ausdrücklich religiöse Hausüberlieferung, kein neuer Spielwert.'
  ],
  'haus-pawen': [
    'Aktuelle Ortsstruktur Klaueninsel/Sturmklaue/Talgarth beibehalten. Brac seit 1695; überlieferter Sadwn heißt in der bestehenden Person Sadwrn. Erbe Amaethon nach kanonischer Schreibweise.',
    'Die knappe Altvorlage wird durch die bestehende Pawen-Gebietsquelle ergänzt: Dyfnor, Brondir, Llanvyr und deren Wirtschaft. Kein neues Ritual und kein zusätzlicher Ort erfunden.',
    'Wirtschaftlich vielseitige Herrschaft und die ältere Charakterisierung ohne besonderen Wirtschaftssinn sind unterschiedliche Aussagen. Kein Widerspruch durch ein erfundenes neues Wohlstandsniveau aufgelöst.',
    'Blegywryd ist in der aktuellen Ratsliste als Marschall des Ritterfürsten belegt und wird zusätzlich zu den zwanzig unbenannten Alt-Hofämtern geführt. Gründer Lamorak Arth und Erbe Lamorak Pawen bleiben getrennt.'
  ],
  'haus-crafanc': [
    'Aktuelle Ortsstruktur Klaueninsel/Sturmklaue/Talgarth und bestehender Ritterfürstenrang beibehalten.',
    'Die aktuelle Gebietsquelle nennt Garnmor als Werftzentrum, Ffordd als Bergbauort und Maendil als Holzsiedlung. Die alte Angabe Werft/Fischerei in Guwan bleibt als historische, heute nicht sicher zugeordnete Namensnennung erhalten; keine Gleichsetzung oder neue Kartenposition.',
    'Artgal Arth ist Gründer; späterer Artgal Crafanc wird nicht verwechselt. Caradocs 1615–1652 sind Amtsjahre, seine vorhandene Geburt 1590 bleibt unverändert.',
    'Die ausgefüllten Kulturabschnitte stammen aus der bestehenden Herrschaftsquelle. Punktierte Vorlagenfelder begründen keine neuen Feste oder Rituale.'
  ],
  'haus-diafol-talgarth': [
    'Hausseite und Iframe gehören ausschließlich zur kanonischen Cenyr-Akte haus-diafol-talgarth. Die eigenständige Vennyr-Akte haus-diafol bleibt erhalten und liefert nur die stabil identifizierten früheren Oberhäupter. Der territoriale Alias haus-diafol-trefgoch wird nicht als Personen-Familien-ID verwendet.',
    'Tryffin ist nach der bestehenden Person weiblich und wird in der Oberhauptkarte als Ritterfürstin geführt. Amtsbeginn 1720 folgt der getrennten kanonischen Talgarther Linie, nicht einem neuen Lebensdatum.',
    'Die Fluchtgeschichte der Besitzlosigkeit wird zeitlich eingeordnet. Aktuelle Gebietsquelle belegt Tewdar, Dôrgar und das von Pawen überlassene Tirwen; deren Wiederaufbau und Einkünfte haben Vorrang vor einer behaupteten heutigen völligen Besitzlosigkeit.',
    'Die Ogerblut- und Vergewaltigungs-/Herkunftserzählungen bleiben ausdrücklich als unbestätigte, teils vom Klerus bestrittene Mythen erhalten. Kein Import als genealogische Tatsache, Rasse oder bestätigte Fähigkeit. Ogma bleibt nur die in der Überlieferung genannte Zeugenfigur, ohne erfundene Personen-ID.',
    'Das Fest des Blutes, kontrolliertes Aufnahmeritual, Narbenzeichen und Kodex der Stärke bleiben als einmalige Hausgeschichte erhalten. Keine Truppen- oder Flottenzahlen übernommen.'
  ],
  'haus-cwningod': [
    'Stabile ID haus-cwningod bleibt erhalten; kanonischer Anzeigename ist Haus Cwingod O’Morea. Gwingod und Cwningod in Alttexten werden nicht zu neuen Häusern.',
    'Aktuelles Profil ordnet den Hauptsitz Cra Fryn in Talklaue zu und nennt Morea als weiteren Sitz. Morea bleibt Handels- und Hafenort; keine Umbenennung Cra Fryns oder Gleichsetzung beider Orte.',
    'Idris ist die bestehende Person idris-cwingod. 1671–1672 sind Amtsjahre, kein erzwungenes Todesjahr. Gründer Galeshin Arth und das heutige Oberhaupt Galeshin Cwingod bleiben getrennt.',
    'Vorhandene frühere Hausbio enthält Militärstatistiken und das Wappen als Hauptbild. Die neue gemeinsame Quelle ersetzt ihren Standard mit dem Original-Kriegerbild und ohne Militärstatistiken; keine eigenständig bearbeitete Nutzerbio wird direkt verändert.',
    'Ruhige Verwaltungskultur, Kapelle der Dame der See, Verehrung des Knechts und Brüderlichkeit zu den anderen Kadetten bleiben erhalten. Die bildhafte angebliche Unverwundbarkeit schwerer Rüstung wird nicht als tatsächliche Fähigkeit behauptet.'
  ]
};
for (const entry of [arth,pawen,crafanc,diafol,cwingod]) {
  const contentPath = path.join(root,entry.dir,'haus.content.mjs');
  try { await fs.access(contentPath); throw new Error(`Bestehende Hausquelle wird nicht überschrieben: ${contentPath}`); }
  catch(error) { if (error.code !== 'ENOENT') throw error; }
}
for (const entry of [arth,pawen,crafanc,diafol,cwingod]) {
  const target = path.join(root,entry.dir);
  await fs.mkdir(path.join(target,'assets'),{recursive:true});
  const source = path.join('C:/Users/fhg_r/.codex/attachments',entry.attachment,'Eingefügter Text.txt');
  const bytes = await fs.readFile(source);
  await fs.writeFile(path.join(target,'animexx-original.html'),bytes,{flag:'wx'});
  await fs.writeFile(path.join(target,'haus.content.mjs'),'// Gemeinsame redaktionelle Quelle für Hausseite und Hausbio.\n// Original und Entscheidungen: source-manifest.json. Genealogie unverändert per Iframe.\nexport const HOUSE_CONTENT = '+JSON.stringify(entry.content,null,2)+';\n',{flag:'wx'});
  let imageHash='';
  try { imageHash=hash(await fs.readFile(path.join(target,'assets/hausdarstellung-original.png'))); } catch(error) { if(error.code!=='ENOENT') throw error; }
  const manifest = {
    houseId:entry.content.id,
    source:{attachmentId:entry.attachment,file:'animexx-original.html',sha256:hash(bytes),byteIdenticalToAttachment:true},
    genealogy:{providedHierarchyIgnored:true,providedTreeImageIgnored:true,graphChanged:false,familyId:entry.content.id},
    militaryStatisticsIgnored:true,
    images:[{file:'assets/hausdarstellung-original.png',url:entry.image,role:'Hausdarstellung',sha256:imageHash,preservedOriginal:true,visuallyInspected:false,status:imageHash?'Heruntergeladen; Sichtprüfung folgt':'Originaldownload ausstehend'}],
    canonicalSources:['Stammbäume/assets/js/data/families.registry.js','Stammbäume/assets/js/data/klaueninseln-house-profiles.js'],
    decisions:[
      'Gelieferte Abschnitte Hierarchie und Stammbaum vollständig aus der Übernahme ausgeschlossen. Ausschließlich bestehende Familien- und Personen-IDs; keine Graphänderung. Amtszeiten sind von Lebensdaten getrennt.',
      'Sämtliche Militärstatistiken in Profil und Fließtext ausgelassen. Qualitative Ausrüstungs-, Ausbildungs- und Kulturangaben bleiben erhalten.',
      ...decisions[entry.content.id]
    ]
  };
  // Verweise auf die tatsächlichen aktuellen Fachquellen statt auf HTML-Hüllen.
  const pageDir = entry.content.territoryHref.slice(3).slice(0,entry.content.territoryHref.slice(3).lastIndexOf('/'));
  manifest.canonicalSources[2] = `${pageDir}/${entry.content.id==='haus-arth'?'grafschaft':entry.content.id==='haus-cwningod'?'baronie':'herrschaft'}.data.mjs`;
  if(entry.content.id==='haus-diafol-talgarth') manifest.canonicalSources.push('Stammbäume/assets/js/data/klaueninseln-house-families.js','Stammbäume/assets/js/data/house-diafol-family.js');
  await fs.writeFile(path.join(target,'source-manifest.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({id:entry.content.id,path:entry.dir,revision:entry.content.biographySourceRevision,biographyWords:Object.values(entry.content.biographySummary).join(' ').split(/\s+/).length,heads:entry.content.heads.length,heirs:entry.content.heirs.length,offices:entry.content.offices.length,sourceSha256:hash(bytes)}));
}
