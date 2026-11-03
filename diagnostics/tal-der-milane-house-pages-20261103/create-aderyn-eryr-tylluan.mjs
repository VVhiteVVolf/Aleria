// One-time source intake. Runtime content lives only in each house's haus.content.mjs.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';

const root = process.cwd();
const baseDir = 'Familien Häuser und Clans/Estryll/Cenyr/Tal_der_Milane/Yvains_Klamm';
const houseRoot = '../Stammbäume/';
const territoryRoot = '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Tal der Milane';
const family = id => FAMILY_REGISTRY.find(record => record.id === id).family;
const image = id => `${houseRoot}${family(id).document.emblem}`;
const slug = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
function member(familyId, personId, role, detail = '') {
  const person = family(familyId).persons.find(person => person.id === personId);
  if (!person) throw new Error(`Unknown person ${familyId}/${personId}`);
  return { id: person.id, familyId, name: person.name, role,
    image: person.portrait ? `${houseRoot}${person.portrait}` : '',
    silhouette: person.sex === 'female' ? 'female' : 'male', detail };
}
const vacant = role => ({ name: 'Nicht benannt', role, silhouette: 'male', detail: 'Amtsinhaber nicht benannt.' });
const commonOffices = ['Vogt', 'Schatzmeister', 'Kommandant der Garde', 'Zeremonienmeister', 'Mundschenk', 'Waffenmeister', 'Stallmeister', 'Kerkermeister', 'Jagdmeister', 'Hofkaplan', 'Küchenmeister', 'Brotmeister', 'Handwerksmeister', 'Gartenmeister', 'Zwingermeister', 'Hofmeister', 'Hofdame', 'Archivar', 'Hoffalkner'];
const placeholderOffices = roles => roles.map(role => ({ ...vacant(role), ...(role === 'Hofdame' ? { silhouette: 'female' } : {}) }));
const knighthood = 'Das cenyrische Rittertum wurzelt in Avallorn. Der Knappe wird an einem See oder einem anderen Gewässer zum Ritter geschlagen und gesalbt. Er schwört auf jeden der Neun Göttlichen und dessen Tugenden; ein zehnter Eid gilt der Dame der See, der Schutzgöttin Cenyrs.';
function base({ id, name, type, highestTitle, liege, parentHouseId, territoryName, territoryId, territoryHref, motto, origin, wealth, patrons, currentHead, firstHeir, attachment, warrior, banner }) {
  const dirName = `Haus_${id.replace('haus-', '').replace(/^./, c => c.toUpperCase())}`;
  const dir = `${baseDir}/${dirName}`;
  const scene = `${dir.replace('Familien Häuser und Clans/', '')}/assets/hausdarstellung-original.png`;
  return { dir, attachment, warrior, banner, content: {
    id, name, type, page: 'haus.html', county: 'Tal der Milane', liege,
    territoryId, territoryName, territoryHref, parentHouseId, extinct: false,
    showMotto: Boolean(motto), registerPage: true, prepared: false,
    contentVersion: '20261103-tal-der-milane-v1', biographySourceRevision: family(id).extensions.sourceRevision + 1,
    biographyPreviousDefaultFingerprints: [], biographyIntroTitle: 'Über das Haus', biographyHistoryTitle: 'Herkunft und Geschichte',
    placeholders: { male: `${houseRoot}assets/images/placeholders/male.png`, female: `${houseRoot}assets/images/placeholders/female.png` },
    allies: [], hierarchy: [
      { type: 'Sammlung', name: 'Familien Häuser und Clans', slug: 'familien-hauser-und-clans' },
      { type: 'Kontinent', name: 'Estryll', slug: 'estryll' },
      { type: 'Königreich', name: 'Cenyr', slug: 'cenyr' },
      { type: 'Grafschaft', name: 'Tal der Milane', slug: 'tal-der-milane' },
      { type: 'Region', name: 'Yvains Klamm', slug: 'yvains-klamm' },
      { type: 'Sitz', name: 'Penbryn', slug: 'penbryn' },
      { type: 'Haus', name, slug: id }
    ],
    profile: { highestTitle, rank: highestTitle, houseType: type === 'Grafenhaus' ? 'Grafschaft' : 'Ritterliche Herrschaft',
      motto: motto || '', quoteAuthor: '', seat: 'Penbryn', affiliation: type === 'Grafenhaus' ? 'Königreich Cenyr · König Tristan Pendrag' : 'Tal der Milane · Haus Aderyn O’Penbryn', liege,
      troopStrength: '', tiarna: '', kerns: '', fleet: '', founding: 'Jahr nicht überliefert', milestoneOne: '', milestoneTwo: '', patron: '', knightingPatron: '',
      people: type === 'Grafenhaus' ? 'Cenyri' : 'Cenyri, Talcenyri', wealth, religion: 'Alerische Kirche', patronDeities: patrons, origin, cadetBranches: '', allies: '', enemies: '' },
    omitMilitaryProfile: true, sections: {},
    images: { crest: image(id), scene, sceneAlt: `Überlieferte Kriegerdarstellung von ${name}`, banner: banner || `${houseRoot}assets/images/regions/tal-der-milane.png` },
    illustrationCategory: 'Kriegerdarstellung', cadets: [], heads: [], heirs: [], offices: [], figuresTitle: 'Historische Persönlichkeiten des Hauses', figures: [], trivia: [], currentHead, firstHeir
  } };
}

const aderyn = base({ id: 'haus-aderyn', name: "Haus Aderyn O'Penbryn", type: 'Grafenhaus', highestTitle: 'Graf', liege: 'König Tristan Pendrag', parentHouseId: '',
  territoryId: 'tal-der-milane', territoryName: 'Tal der Milane', territoryHref: `${territoryRoot}/Grafschaft Tal der Milane.html`, motto: 'Das Ziel vor Augen.', origin: 'Avallorn · Yvain Aderyn', wealth: 'Sehr hoch', patrons: 'Der Schmied und die Dame der See', currentHead: 'Gareth Aderyn', firstHeir: 'Catwan Aderyn',
  attachment: '7885c2c4-113d-4cc6-8b6f-ee2f04363035', warrior: 'https://i.imgur.com/dI0SCvN.png' });
aderyn.content.biographyIntroTitle = 'Das Ziel vor Augen';
aderyn.content.biographyHistoryTitle = 'Von Avallorn nach Penbryn';
aderyn.content.sections = {
  overview: 'Haus Aderyn ist das Grafenhaus des Tals der Milane. Von Penbryn aus verbindet es die Herrschaft über die Gebirgsregion mit einer ausgeprägten Jagd- und Bogenschützentradition. Die Stadt gilt als Hochburg der Helwyr, der Falknerei und des Langbogens. Bergbau, Jagd und die Abgaben seiner Vasallen tragen den großen Wohlstand des Hauses.',
  history: 'Yvain Aderyn, ein Ritter und Überlebender Avallorns sowie Schwager der Pendrag-Königslinie, begründete das Haus. Nach dem Bau Mathragons ließen sich die Aderyn weiter nördlich im Gebirge nieder. Ein Außenposten diente zunächst der Erkundung und Sicherung der Region. Aus ihm entstand Penbryn, die Stadt der Jäger und Vögel.\n\nDie verwandten Häuser entwickelten eigene Aufgaben und Jagdtraditionen. Die sechs ausdrücklich genannten Kadettenhäuser sind Gaeth, Hebog, Mwyalchen, Tylluan, Eryr und Ilyuncu. Gareth Aderyn führt das Grafenhaus seit 1720.',
  traditions: 'Die Meisterschaft im Bogenschießen gehört zum Kern der Familienausbildung. Jedes Mitglied wird angehalten, seine Wahrnehmung und den sicheren Umgang mit dem Bogen zu schulen. Die besonders scharfen Augen der Aderyn gelten im Haus als göttliches Geschenk. Auch die Schwertkunst bleibt Teil der ritterlichen Ausbildung.\n\nDie Falknerei verbindet die Familie mit ihren Raubvögeln, besonders den Rotmilanen. Haltung und Pflege der Vögel gelten als edle Kunst und als Zeichen ihrer Naturverbundenheit. Regelmäßige Bogenschießwettbewerbe machen Penbryn zu einem Treffpunkt für Schützen; Grafen, Barone und Ritterfürsten schicken ihre Kinder zur Ausbildung bei den dortigen Helwyr.',
  knighthood: [knighthood, 'Die Helwyr und Teulu tragen Schwarz, Rot und Weiß. Bewegliche, vergleichsweise leichte Ausrüstung aus Leder und Pelz ist im Gebirge verbreitet; Trollknochen und andere Jagdtrophäen schmücken sie. Die Helwyr stehen für den Langbogen, die Teulu für den Schwertkampf.', 'Waffenknechte, Miliz und Stadtwache verwenden Leder, Brigantinen und ergänzende Metallteile wie Helme oder Harnische. Die Stadtwache trägt das Stadtzeichen, während die Knechte die Zeichen ihres jeweiligen Lehnsherrn führen.'],
  holdings: 'Bergbau, Jagd und Vasallenabgaben bilden die wirtschaftliche Grundlage. Talwyn ist als Bergbaustadt wichtig, Penllyn liefert Fisch und züchtet Vögel. Caer Gwennol sichert die Jagd im Gebirge und die angrenzenden Bergbausiedlungen.\n\nGroße Viehbestände und ausgedehnte Anbauflächen fehlen der Grafschaft. Deshalb bezieht sie Lebensmittel aus dem Ährental. Diese Einfuhren sichern die Versorgung der Bevölkerung und verbinden das Tal wirtschaftlich mit der benachbarten Region.',
  cultureReligion: 'Die Aderyn gehören zu den Cenyri und zur Alerischen Kirche. Sie verehren besonders den Schmied, dessen Verbindung zu Arbeit, Handel und Bergbau ihrer Lebensgrundlage entspricht, sowie Nimue, die Dame der See. Als Förderer von Jagd, Langbogen und Falknerei prägen sie die Kultur des Tals.',
  conflictsAlliances: 'Die Aderyn pflegen die Beziehungen zu ihren Kadettenhäusern und zu historisch verbundenen Adelsfamilien. Die Quelle nennt außerdem einen verwandten Clan in Aldrimar mit cenyrischen Wurzeln, ohne ihn eindeutig zu benennen. Eine gegenwärtige Hausfehde ist nicht überliefert.',
  values: 'Kühle, Stolz und Scharfsinn prägen den Ruf der Aderyn. Ihre Haltung folgt dem zielgerichteten Denken der Helwyr: Sie wollen so moralisch wie möglich handeln, stellen im Konfliktfall jedoch das Wohl des Landes über persönliche moralische Bedenken. Aus dieser Überzeugung können auch harte und fragwürdige Entscheidungen entstehen.',
  succession: 'Die überlieferte Erbfolge nennt Catwan, Cwgon und Arthen Aderyn in dieser Reihenfolge.',
  court: 'Die Oberhauptfolge nennt Amtszeiten. Frühe Lücken bleiben offen; Lebensdaten werden daraus nicht abgeleitet. Nicht benannte Hofämter bleiben sichtbar unbesetzt.',
  familyTree: 'Die bestehende Familienakte ist hier eingebettet. Das Hauswappen im Stammbaum öffnet die Hausbiografie.',
  historicalFigures: 'Die Gründungsgeschichte erinnert an Yvain Aderyn und den Weg des Hauses von Avallorn nach Penbryn.'
};
aderyn.content.biographySummary = {
  overview: 'Haus Aderyn ist das Grafenhaus des Tals der Milane und hat seinen Stammsitz in Penbryn. Die Stadt am Gebirge gilt als Hochburg des Langbogens, der Jagd und der Falknerei. Von hier aus prägt die Familie das Helwyr-Rittertum der Region. Bergbau, Jagd und die Abgaben ihrer Vasallen sichern ihren großen Wohlstand. Das Haus steht unter der Krone Cenyrs; Gareth Aderyn führt es seit 1720.',
  history: 'Yvain Aderyn begründete die Familie nach seiner Flucht aus Avallorn. Er war Ritter, Überlebender des untergegangenen Landes und Schwager der Pendrag-Königslinie. Nach dem Bau Mathragons zogen die Aderyn weiter nach Norden ins Gebirge. Ihr zunächst zur Erkundung und Sicherung errichteter Außenposten wuchs zur Stadt Penbryn heran.\n\nDie sechs ausdrücklich überlieferten Kadettenhäuser sind Gaeth, Hebog, Mwyalchen, Tylluan, Eryr und Ilyuncu. Ihre besonderen Aufgaben verbinden sie bis heute mit dem Grafenhaus.',
  character: 'Die Aderyn gelten als stolz, kühl und scharfsinnig. Ihre Haltung folgt der Zielstrebigkeit der Helwyr: Sie bemühen sich um moralisches Handeln, sind aber bereit, persönliche Bedenken zurückzustellen, wenn sie darin einen Nutzen für das Land sehen. Catwan, Cwgon und Arthen bilden die überlieferte Erbfolge.',
  customs: 'Bogenschießen und die Schulung der Wahrnehmung beginnen innerhalb der Familie früh. Die scharfen Augen der Aderyn gelten als göttliches Geschenk. Auch die Schwertkunst gehört zu ihrer Ausbildung. Besonders eng ist die Bindung an Rotmilane, deren Haltung und Pflege als edle Kunst gelten. Wettbewerbe und die Ausbildung adeliger Kinder bei den Helwyr festigen Penbryns Ruf weit über das Tal hinaus.',
  holdings: 'Talwyn trägt mit seinen Bergwerken zum Wohlstand bei, Penllyn mit Fischfang und Vogelzucht. Caer Gwennol sichert Jagdgebiete und Bergbausiedlungen. Da große Viehbestände und ausgedehnte Felder fehlen, ist die Grafschaft auf Lebensmittel aus dem Ährental angewiesen.',
  culture: 'Die Aderyn bekennen sich zur Alerischen Kirche. Ihre besondere Verehrung gilt dem Schmied und Nimue, der Dame der See. Schwarze, rote und weiße Hausfarben begleiten die lederne, pelzbesetzte Ausrüstung ihrer Helwyr und Teulu. Jagdtrophäen verbinden die ritterliche Darstellung mit dem Leben im Gebirge.',
  relations: 'Die Kadettenhäuser bilden ein wichtiges politisches und familiäres Netz. Eine aktuelle Hausfehde ist nicht genannt; die Quelle erwähnt außerdem einen nicht eindeutig benannten verwandten Clan in Aldrimar.'
};
aderyn.content.cadets = ['haus-gaeth', 'haus-hebog', 'haus-mwyalchen', 'haus-tylluan', 'haus-eryr', 'haus-ilyuncu'].map(id => ({ id, name: FAMILY_REGISTRY.find(record => record.id === id).title, image: image(id) }));
aderyn.content.profile.cadetBranches = 'Gaeth, Hebog, Mwyalchen, Tylluan, Eryr und Ilyuncu';
aderyn.content.founder = member('haus-aderyn', 'yvain-aderyn', 'Gründer', 'Ritter aus Avallorn · Amtszeit nicht überliefert');
aderyn.content.heads = [['yvain-aderyn', 'Amtszeit nicht überliefert'], ['owain-aderyn', 'Amtszeit nicht überliefert'], ['brinthan-aderyn', 'Amtszeit nicht überliefert'], ['kimball-aderyn', 'Amtszeit nicht überliefert'], ['talfryn-aderyn', 'Amtszeit: Beginn unbekannt–1163'], ['ywen-aderyn', 'Amtszeit: Beginn unbekannt–1274'], ['trevelyan-aderyn', 'Amtszeit: 1274–1285'], ['gwalchgwyn-aderyn', 'Amtszeit: 1285–1297 · kanonische Zuordnung'], ['nodawl-aderyn', 'Amtszeit: Beginn unbekannt–1629'], ['llwydawg-aderyn', 'Amtszeit: 1629–1670'], ['anarawd-aderyn', 'Amtszeit: 1670–1686'], ['dungarth-aderyn', 'Amtszeit: 1686–1705'], ['catel-aderyn', 'Amtszeit: 1705–1720'], ['gareth-aderyn', 'Amtszeit: seit 1720']].map(([id, detail]) => member('haus-aderyn', id, 'Graf', detail));
aderyn.content.heirs = ['catwan-aderyn', 'cwgon-aderyn', 'arthen-aderyn'].map((id, i) => member('haus-aderyn', id, `${i + 1}. Erbe`));
aderyn.content.offices = placeholderOffices(commonOffices).map(entry => entry.role === 'Hofkaplan' ? member('haus-eryr', 'daffyd-eryr', 'Hofkaplan') : entry.role === 'Hoffalkner' ? member('haus-aderyn', 'slevin-gaeth', 'Hoffalkner') : entry);
aderyn.content.figures = [{ ...aderyn.content.founder, description: 'Ritter und Überlebender Avallorns. Als Gründer führte er das Haus in das Gebirge, aus dessen Außenposten Penbryn hervorging.' }];
aderyn.content.trivia = ['Das Hausmotto lautet in der gelieferten Sprache „Y nod ger bron.“ – „Das Ziel vor Augen.“', 'Rotmilane stehen im Mittelpunkt der Falknerei des Hauses.'];

const eryr = base({ id: 'haus-eryr', name: "Haus Eryr O'Penbryn", type: 'Ritterfürstenhaus', highestTitle: 'Ritterfürst', liege: 'Graf Gareth Aderyn', parentHouseId: 'haus-aderyn',
  territoryId: 'herrschaft-eryr', territoryName: 'Herrschaft der Eryr', territoryHref: `${territoryRoot}/Herrschaft der Eryr/Herrschaft der Eryr.html`, motto: 'Gemeinsam erheben wir uns höher hinauf!', origin: 'Haus Aderyn · Aeron Aderyn', wealth: 'Hoch', patrons: '', currentHead: 'Daffyd Eryr', firstHeir: 'Aled Eryr',
  attachment: '654d4404-c491-47c0-b467-a65b1d998baa', warrior: 'https://i.imgur.com/W7Dr4fD.png' });
eryr.content.biographyIntroTitle = 'Helwyr unter dem Goldadler';
eryr.content.sections = {
  overview: 'Die Eryr sind ein Kadettenhaus der Aderyn und ein Ritterfürstenhaus von Penbryn. Ihre Helwyr gelten als besonders zielsichere Bogenschützen. Die Pflege dieser Kunst reicht im Haus weiter zurück als Gareths Förderung der Helwyr-Ausbildung; der Graf baute das vorhandene Können und die Ausbildungswege später weiter aus.',
  history: 'Aeron Aderyn, ein jüngerer Angehöriger des Grafenhauses, begründete das Kadettenhaus. Mit seiner Familie und seinem Vermögen ließ er eine Burg im Gebirge unweit Penbryns errichten. Die Eryr bewohnen sie bis heute und herrschen über eine zu Penbryn gehörige Ortschaft. Das genaue Gründungsjahr bleibt offen. Daffyd Eryr führt das Haus seit 1734.',
  traditions: 'Ein Eryr erlernt die Jagd bereits vor dem Ritterschlag und richtet seinen eigenen Goldadler ab. Die Vögel begleiten ihre Falkner über viele Jahre; die Hausüberlieferung nennt eine Lebensspanne von fünfzig bis sechzig Jahren. Bogenschießen und Falknerei sind feste Bestandteile der familiären Ausbildung. Die Eryr sehen sich selbst als die besten Bogenschützen Penbryns.',
  knighthood: [knighthood, 'Die Helwyr des Hauses verbinden sichere Bogenschüsse mit der Falknerei ihrer Adler. Sie jagen unter anderem Gebirgstrolle und tragen dazu bei, deren Zahl gering zu halten. Gegenüber anderen Jagdhäusern betonen die Eryr besonders ihr Selbstverständnis als Bogenschützen.', 'Bogenschützen unter den Milwr sichern die Gebirgswege. Das Haus bildet daneben Speerkämpfer aus; Kavalleristen und Schwertkämpfer sind seltener.'],
  holdings: 'Zur Herrschaft gehören die Burg im Gebirge und eine nahe Penbryn gelegene Ortschaft. Jägereien, Bogenmacher, Pfeilmacher und als Jagdvereine bezeichnete Schenken prägen den Besitz. Dort kommen Helwyr und gewöhnliche Jäger nach ihren Unternehmungen zusammen.\n\nDie Jagdvereine richten Wettbewerbe mit anderen Gebieten aus und unternehmen gelegentlich sogar Unholdjagden im Dunkelhain. Die vergleichsweise große Lehnsherrschaft macht das Haus wohlhabender als manche andere Kadettenfamilie.',
  cultureReligion: 'Die Eryr zählen zu den Cenyri und Talcenyri und gehören zur Alerischen Kirche. Sie gelten als nicht außergewöhnlich religiös. Ihre Jagdkultur führt wiederholt zu Meinungsverschiedenheiten mit dem Kult Kynareths.',
  conflictsAlliances: 'Ehen mit anderen Kadettenhäusern und mit Haus Gaeth sind bevorzugt. Die Eryr halten ihr altes Kadettenhaus für einen besonders nahen Erben der Aderyn. Daraus entstehen gelegentlich Streitigkeiten mit verwandten Häusern, die nach der Überlieferung jedoch nicht ernst werden.',
  values: 'Stolz auf den Bogen und ein ausgeprägter Beschützerwille bestimmen das Auftreten der Eryr. Die cenyrische Lebensweise gilt ihnen als bewahrenswert und wird entschlossen verteidigt. Der Anspruch auf besondere Nähe zu den Aderyn gehört zu ihrem Selbstverständnis.',
  succession: 'Aled Eryr steht vor Aeron Eryr in der überlieferten Erbfolge.',
  court: 'Die Amtsfolge ist von den Lebensdaten der bestehenden Personenakten getrennt. Nicht überlieferte Zeiträume und unbenannte Hofämter bleiben offen.',
  familyTree: 'Die bestehende Familienakte ist hier eingebettet. Das Hauswappen im Stammbaum öffnet die Hausbiografie.',
  historicalFigures: 'Aeron Aderyn wird als Begründer des Kadettenhauses überliefert.'
};
eryr.content.biographySummary = {
  overview: 'Haus Eryr ist ein altes Kadettenhaus der Aderyn und ein Ritterfürstenhaus von Penbryn. Sein Ruf gründet auf besonders zielsicheren Helwyr, der Jagd im Gebirge und der Falknerei mit Goldadlern. Die Pflege des Bogenschießens war hier bereits vor Graf Gareth Aderyn fest verankert; dessen späterer Ausbau der Ausbildung knüpfte auch an die Leistungen der Eryr an. Seit 1734 steht Daffyd Eryr an der Spitze des Hauses.',
  history: 'Der Gründer Aeron Aderyn stammte aus dem Grafenhaus. Als jüngerer Angehöriger ließ er mit seiner Familie und seinem Vermögen eine eigene Burg im Gebirge errichten. Sie liegt unweit Penbryns und ist bis heute der Wohnsitz der Eryr. Die zugehörige Ortschaft bleibt Teil des Penbryner Raums. Ein eindeutiges Gründungsjahr ist nicht überliefert.',
  character: 'Die Eryr treten stolz und beschützend auf. Die cenyrische Lebensweise hat für sie hohen Wert und soll entschlossen verteidigt werden. Ihr altes Kadettenhaus betrachtet sich als besonders nahen Erben der Aderyn. Der daraus entstehende Wettstreit mit anderen Familien bleibt laut Überlieferung meist harmlos. Aled und Aeron Eryr bilden in dieser Reihenfolge die Erbfolge.',
  customs: 'Jagd und Bogenschießen werden schon vor dem Ritterschlag erlernt. Jeder Eryr richtet einen eigenen Goldadler ab, der seinen Falkner über viele Jahre begleitet. Die Hausüberlieferung nennt für die Tiere fünfzig bis sechzig Lebensjahre. Die Helwyr verbinden ihre Treffsicherheit mit der Falknerei und beteiligen sich an der Jagd auf Gebirgstrolle. Bogenschützen und Speerkämpfer sichern die Berge; Reiter und Schwertkämpfer sind seltener.',
  holdings: 'Die vergleichsweise große Lehnsherrschaft trägt zum Wohlstand bei. Zur Burg und ihrer Ortschaft kommen Jägereien, Bogenmacher, Pfeilmacher und Schenken, die als Jagdvereine dienen. Dort treffen sich Helwyr und gewöhnliche Jäger. Gemeinsame Wettbewerbe und gelegentliche Jagden im Dunkelhain gehören zum Leben dieser Gemeinschaften.',
  culture: 'Die Eryr sind Cenyri und Talcenyri und gehören zur Alerischen Kirche. Eine außergewöhnliche Frömmigkeit wird ihnen nicht zugeschrieben; ihre ausgeprägte Jagdkultur bringt sie mitunter in Konflikt mit dem Kult Kynareths.',
  relations: 'Die Bindung an das Mutterhaus Aderyn bleibt bestimmend. Ehen mit anderen Kadettenfamilien und mit Haus Gaeth werden bevorzugt.'
};
eryr.content.allies = [{ name: 'Haus Aderyn', detail: 'Mutterhaus und Lehnsherr', image: image('haus-aderyn'), imageFormat: 'square' }];
eryr.content.founder = member('haus-eryr', 'aeron-aderyn', 'Gründer', 'Amtszeit laut Hofliste: 1286–1314 · Gründungsjahr nicht eindeutig überliefert');
eryr.content.heads = [['aeron-aderyn', 'Amtszeit laut Hofliste: 1286–1314'], ['eiddyl-eryr', 'Amtszeit: Beginn unbekannt–1652'], ['wyndham-eryr', 'Amtszeit: 1652–1663'], ['cynfelyn-eryr', 'Amtszeit: 1663–1690'], ['sheev-eryr', 'Amtszeit: 1690–1697'], ['gruffyd-eryr', 'Amtszeit: 1697–1734'], ['daffyd-eryr', 'Amtszeit: seit 1734']].map(([id, detail]) => member('haus-eryr', id, 'Ritterfürst', detail));
eryr.content.heirs = ['aled-eryr', 'aeron-1715-eryr'].map((id, i) => member('haus-eryr', id, `${i + 1}. Erbe`));
eryr.content.offices = placeholderOffices(['Vogt', 'Schatzmeister', 'Kommandant der Garde', 'Zeremonienmeister', 'Mundschenk', 'Waffenmeister', 'Stallmeister', 'Kerkermeister', 'Jagdmeister', 'Hafenmeister', 'Küchenmeister', 'Brotmeister', 'Handwerksmeister', 'Gartenmeister', 'Hofkaplan', 'Hofmeister', 'Hofdame', 'Archivar', 'Hoffalkner', 'Zwingermeister']);
eryr.content.figures = [{ ...eryr.content.founder, description: 'Aderyn-Angehöriger und Begründer des Hauses Eryr. Er ließ die Burg im Gebirge unweit Penbryns errichten.' }];
eryr.content.trivia = ['Das gelieferte Motto lautet „Fel un, rydyn ni’n codi ein hunain yn uwch.“ – „Gemeinsam erheben wir uns höher hinauf!“'];

const tylluan = base({ id: 'haus-tylluan', name: "Haus Tylluan O'Penbryn", type: 'Ritterfürstenhaus', highestTitle: 'Ritterfürst', liege: 'Graf Gareth Aderyn', parentHouseId: 'haus-aderyn',
  territoryId: 'herrschaft-tylluan', territoryName: 'Herrschaft der Tylluan', territoryHref: `${territoryRoot}/Herrschaft der Tylluan/Herrschaft der Tylluan.html`, motto: '', origin: 'Haus Aderyn · Gwynham Aderyn', wealth: 'Hoch', patrons: 'Kynareth, der Mentor und der Hohepriester', currentHead: 'Bowen Tylluan', firstHeir: 'Lucan Tylluan',
  attachment: '4c6b170f-44c1-46df-b244-61c7aa7280e4', warrior: 'https://i.imgur.com/HKN8vpg.png' });
tylluan.content.biographyIntroTitle = 'Die Schatten der Aderyn';
tylluan.content.sections = {
  overview: 'Die Tylluan sind ein Kadettenhaus der Aderyn und ein Ritterfürstenhaus von Penbryn. Sie verstehen sich als die Schatten des Mutterhauses: Wächter gegen übernatürliche Gefahren, aber auch Kundschafter und politische Beschützer. Ihre Methoden verbinden Helwyr-Ausbildung mit Anregungen aus der Jagd der Mondjäger.',
  history: 'Nach der Hausüberlieferung gestattete ein Oberhaupt der Aderyn zwei seiner Söhne die Gründung eigener Häuser, wenn diese dem Schutz der Familie und ihres Landes auf Dauer verpflichtet blieben. Aus dieser Teilung gingen Mwyalchen und Tylluan hervor: Die einen sollten bei Tag, die anderen bei Nacht schützen. Gwynham Aderyn gilt als Gründer der Tylluan. Seit 1723 führt Bowen Tylluan das Haus.',
  traditions: 'Die Tylluan stellen Flüsterer und übernehmen verdeckte Aufgaben bis hin zu Attentaten. Ihre Schattenwache sichert die Stadt und sucht nach wilden Tieren und übernatürlichen Gefahren. Unehelich geborene Angehörige werden nach der Hausüberlieferung unmittelbar in diese Wache eingebunden; die Familie übernimmt stets deren Verwaltung.\n\nWeil Begegnungen mit solchen Wesen in Cenyr selten sind, bleibt ein großer Teil der Ausbildung theoretisch. Gelegentliche Jagden im Dunkelhain und die Zusammenarbeit mit Haus Loganne liefern praktische Erfahrung. Die Loganne bilden Mondjäger aus und bringen besonderes Wissen über infernale und andere übernatürliche Kreaturen mit.',
  knighthood: [knighthood, 'Die Tylluan sehen sich als Monster- und Hexenjäger. Sie übernehmen Methoden von Mondjägern und Bruxa, werden dadurch aber weder zu Druiden noch zu Alchemisten oder Mutanten. Ihre Miliz unterscheidet sich von diesen spezialisierten Rittern und übernimmt vor allem Wachen am Abend und in der Nacht.', 'Ihr eigener Helwyr-Stil heißt „Ruhende Eule“. Lautlosigkeit und schwierige Klettermanöver sollen ungewöhnliche Schusspositionen ermöglichen, etwa das Herabhängen von einer Brücke.'],
  holdings: 'Das Haus ist am Bergbau beteiligt und unterstützt heilige Ritterorden. Weitere namentlich belegte Betriebe oder eigene Burgen nennt die Quelle nicht.',
  cultureReligion: 'Die Alerische Kirche und die Zusammenarbeit mit den Loganne prägen die religiöse Haltung der Familie. Kynareth gilt als Schutzpatronin; daneben werden der Mentor und der Hohepriester verehrt. Gelegentlich gehen Kleriker aus dem Haus hervor.\n\nAnstelle von Rotmilanen halten die Tylluan silberne Eulen. Die Quelle schreibt den Familienmitgliedern eine ungewöhnliche Nachtsicht zu, deren Ursache unbekannt bleibt. Bei Tag schützen tief gezogene Hüte und Kutten die lichtempfindlichen Augen. Daraus wird keine besondere Herkunft oder Mutation abgeleitet.',
  conflictsAlliances: 'Der Schutz der Aderyn und ihres Herrschaftsraums bildet den Kern der Hausbindung. Haus Mwyalchen ergänzt diese Aufgabe als verwandtes Schutzhaus. Die Zusammenarbeit mit Haus Loganne ist für Wissen und praktische Erfahrung in der Monsterjagd besonders wichtig. Eine konkrete gegenwärtige Hausfehde ist nicht benannt.',
  values: 'Die Tylluan akzeptieren die Rolle als Schatten der Aderyn und sind zu verdeckten und schmutzigen Aufgaben bereit. Ihr Schwerpunkt liegt auf übernatürlichen und infernalen Bedrohungen. Zugleich arbeiten sie als Spione und wollen das Land auch in politischen Konflikten schützen.',
  succession: 'Die überlieferte Erbfolge nennt Lucan, Arian und Madoc Tylluan.',
  court: 'Die Hofübersicht nennt Amtszeiten. Die Gründerjahre werden nicht als Geburtsangaben übernommen. Wyett Tylluan ist als Kommandant der Schattengarde benannt; die übrigen nicht besetzten Ämter bleiben sichtbar offen.',
  familyTree: 'Die bestehende Familienakte ist hier eingebettet. Das Hauswappen im Stammbaum öffnet die Hausbiografie.',
  historicalFigures: 'Gwynham Aderyn wird als Begründer des Hauses Tylluan überliefert.'
};
tylluan.content.biographySummary = {
  overview: 'Haus Tylluan ist ein Ritterfürstenhaus von Penbryn und ein Kadettenzweig der Aderyn. Es versteht sich als Schatten und nächtlicher Schutz des Mutterhauses. Seine Ritter verbinden die Ausbildung der Helwyr mit dem Kampf gegen übernatürliche und infernale Bedrohungen. Auch Spionage und verdeckte politische Aufgaben gehören zur überlieferten Rolle. Bowen Tylluan führt das Haus seit 1723.',
  history: 'Die Hausüberlieferung erzählt von einem Aderyn-Oberhaupt, das zwei Söhnen die Gründung eigener Häuser unter der Bedingung dauerhafter Schutzpflicht erlaubte. Die Mwyalchen sollten das Land bei Tag, die Tylluan bei Nacht sichern. Gwynham Aderyn gilt als Gründer der Tylluan. Die bestehende Familienakte bewahrt die Genealogie; ein neues Gründungsjahr wird aus der Amtsliste nicht abgeleitet.',
  character: 'Die Tylluan sind bereit, für die Aderyn auch schmutzige und verdeckte Aufgaben zu erfüllen. Ihre wichtigste Selbstdeutung bleibt jedoch die Abwehr von Monstern und anderen Gefahren. Lucan, Arian und Madoc bilden die überlieferte Erbfolge. Wyett Tylluan ist als Kommandant der Schattengarde benannt.',
  customs: 'Die Schattenwache übernimmt nächtliche Sicherung, Aufklärung und die Suche nach Bedrohungen. Unehelich geborene Angehörige werden nach der Hausüberlieferung direkt eingebunden; die Familie führt die Verwaltung der Wache. Weil übernatürliche Begegnungen in Cenyr selten sind, besteht ein großer Teil der Ausbildung aus Theorie. Gelegentliche Jagden im Dunkelhain und die Zusammenarbeit mit den Mondjägern des Hauses Loganne ergänzen die Praxis.\n\nDer eigene Helwyr-Stil „Ruhende Eule“ setzt auf Lautlosigkeit, Klettern und ungewöhnliche Schusspositionen. Die Tylluan übernehmen Jagdmethoden von Mondjägern und Bruxa, sind aber selbst keine Druiden, Alchemisten oder Mutanten.',
  holdings: 'Das Haus beteiligt sich am Bergbau und unterstützt heilige Ritterorden. Seine Miliz versieht besonders Wachen am Abend und in der Nacht. Einzelne weitere Betriebe und Besitzungen sind nicht näher beschrieben.',
  culture: 'Silberne Eulen begleiten die Familie anstelle der Rotmilane der Aderyn. Die überlieferte besondere Nachtsicht bleibt in ihrer Ursache ungeklärt; bei Tageslicht schützen Hüte und Kutten die Augen. Die Tylluan gehören zur Alerischen Kirche und verehren Kynareth, den Mentor und den Hohepriester. Aus ihrer religiösen und jagdlichen Tradition gehen gelegentlich Kleriker hervor.',
  relations: 'Die Bindung an die Aderyn, das ergänzende Verhältnis zu den Mwyalchen und der Wissensaustausch mit den Loganne prägen die Stellung des Hauses.'
};
tylluan.content.allies = [{ name: 'Haus Aderyn', detail: 'Mutterhaus und Lehnsherr', image: image('haus-aderyn'), imageFormat: 'square' }, { name: 'Haus Mwyalchen', detail: 'Verwandtes Schutzhaus', image: image('haus-mwyalchen'), imageFormat: 'square' }];
tylluan.content.founder = member('haus-tylluan', 'gwynham-aderyn', 'Gründer', 'Amtszeit laut Hofliste: 1150–1199 · Geburtsjahr in der bestehenden Akte: 1126');
tylluan.content.heads = [['gwynham-aderyn', 'Amtszeit laut Hofliste: 1150–1199'], ['niadhnair-tylluan', 'Amtszeit: Beginn unbekannt–1653'], ['blegwywyrd-tylluan', 'Amtszeit: 1653–1674'], ['gwynham-1630-tylluan', 'Amtszeit: 1674–1685'], ['shan-tylluan', 'Amtszeit: 1685–1723'], ['bowen-tylluan', 'Amtszeit: seit 1723']].map(([id, detail]) => member('haus-tylluan', id, 'Ritterfürst', detail));
tylluan.content.heirs = ['lucan-tylluan', 'arian-tylluan', 'madoc-tylluan'].map((id, i) => member('haus-tylluan', id, `${i + 1}. Erbe`));
tylluan.content.offices = placeholderOffices(['Vogt', 'Schatzmeister', 'Kommandant der Hofgarde', 'Zeremonienmeister', 'Kommandant der Schattengarde', 'Waffenmeister', 'Stallmeister', 'Kerkermeister', 'Jagdmeister', 'Mundschenk', 'Küchenmeister', 'Brotmeister', 'Handwerksmeister', 'Gartenmeister', 'Hofkaplan', 'Hofmeister', 'Hofdame', 'Archivar', 'Hoffalkner', 'Zwingermeister']).map(entry => entry.role === 'Kommandant der Schattengarde' ? member('haus-tylluan', 'wyett-tylluan', entry.role) : entry);
tylluan.content.figures = [{ ...tylluan.content.founder, description: 'Aderyn-Angehöriger und Gründer des Hauses Tylluan, dessen Schutzpflicht die Überlieferung dem Wirken der Mwyalchen bei Tag gegenüberstellt.' }];
tylluan.content.trivia = ['„Schutz bei Nacht“ bezeichnet neben tatsächlichen Nachtwachen besonders den Kampf gegen dunkle und infernale Gefahren.', 'Nekrophagen, Neblinge und Gebirgstrolle werden als typische Jagdziele genannt. Unholde sind in Cenyr ausgesprochen selten; einzelne können sich vom Dunkelhain ins Nebelgebirge verirren.', 'Die Ursache der ungewöhnlichen Nachtsicht ist nicht bekannt. Daraus folgt keine Mutation oder druidische Ausbildung.'];

const decisions = {
  'haus-aderyn': ['Die zweite als Trevelyan beschriftete Amtskarte 1285–1297 wurde anhand der vorhandenen kanonischen Akte Gwalchgwyn Aderyn zugeordnet. Keine Person oder Lebenszahl verändert.', 'Die Angabe „Kadetten: Keine“ widerspricht der konkreten Liste von sechs Kadettenhäusern; die konkrete Liste hat Vorrang.', 'Seilswig im Stadtwachenabschnitt als veraltete Ortsbezeichnung behandelt; bestehende aktuelle Zuordnung Penbryn bleibt maßgeblich.', 'Lebensmittelimporte aus dem Ährental sichern die Versorgung; die widersprüchliche Behauptung, sie verringerten die Abhängigkeit von anderen Regionen, wurde redaktionell entfernt.', 'Der nicht benannte verwandte Clan in Aldrimar bleibt unbenannt. Keine Vermutung als gesicherte Zuordnung ausgegeben.'],
  'haus-eryr': ['Cumbra, Umbrien, Avalon, Brechinaucc und Seilswig im alten allgemeinen Rittertext wurden anhand der aktuellen Registerzuordnung auf Cenyr, Avallorn und Penbryn redaktionell vereinheitlicht.', 'Die Hofübersicht gibt für Aeron 1286–1314 an, die bestehende Akte als Lebensdaten 1262–1314. Die Hausseite kennzeichnet 1286–1314 ausdrücklich als Amtszeit laut Hofliste; keine Geburt wird überschrieben und kein gesichertes Gründungsjahr daraus behauptet.', '„Gaeth aus Aed“ als Haus Gaeth ohne ungeprüfte Ortszuordnung übernommen; kanonischer Sitz ist Penllyn.'],
  'haus-tylluan': ['Seilswig im Fließtext und O’Seilswig wurden anhand des vorhandenen Registers zu Penbryn vereinheitlicht. Keine neue geografische Einsortierung.', 'Die Hofübersicht nennt für den Gründer 1150–1199, die kanonische Akte Lebensdaten 1126–1199. Die Seite trennt Amtszeit laut Hofliste und bestehendes Geburtsjahr.', 'Wyett Tyulluan auf die belegte kanonische Schreibweise Wyett Tylluan vereinheitlicht; Blegwyrd wird mit der bestehenden Person Blegwywyrd Tylluan verlinkt.', 'Absolutes „keine Unholde“ und die anschließende Beschreibung seltener Ausnahmen auf ausgesprochen seltene Vorkommen redigiert.', 'Nachtsicht bleibt eine überlieferte Eigenschaft unbekannter Ursache. Keine Mutation, druidische Herkunft oder zusätzliche Spielmechanik abgeleitet.']
};

for (const item of [aderyn, eryr, tylluan]) {
  const { content, dir } = item;
  await fs.mkdir(path.join(root, dir, 'assets'), { recursive: true });
  const attachmentDir = path.join('C:/Users/fhg_r/.codex/attachments', item.attachment);
  const attachmentName = (await fs.readdir(attachmentDir)).find(name => name.endsWith('.txt'));
  const original = await fs.readFile(path.join(attachmentDir, attachmentName));
  const originalName = 'animexx-source-2026-11-03.html';
  await fs.writeFile(path.join(root, dir, originalName), original);
  await fs.writeFile(path.join(root, dir, 'haus.content.mjs'), '// Redaktionelle Quelle für Hausseite und Stammbaum-Bio.\n// Quellenentscheidungen: source-manifest.json. Genealogie unverändert, bestehende Akte per Iframe.\nexport const HOUSE_CONTENT = ' + JSON.stringify(content, null, 2) + ';\n');
  const warriorBytes = await fs.readFile(path.join(root, dir, 'assets/hausdarstellung-original.png'));
  const manifest = { source: { attachmentId: item.attachment, file: originalName, sha256: crypto.createHash('sha256').update(original).digest('hex') }, genealogy: { imported: false, ignoredSourceSections: ['Hierarchie', 'Stammbaum'], familyId: content.id, existingGraphUnchanged: true }, images: [{ role: 'Kriegerdarstellung', url: item.warrior, localPath: 'assets/hausdarstellung-original.png', status: 'downloaded-and-visually-reviewed', sha256: crypto.createHash('sha256').update(warriorBytes).digest('hex'), width: warriorBytes.readUInt32BE(16), height: warriorBytes.readUInt32BE(20), note: 'Geliefertes Original vom Hauptagenten heruntergeladen; als Ganzkörper-Bogenschütze in Hausfarben tatsächlich angesehen und unmittelbar übernommen.' }], decisions: ['Alle gelieferten Truppenstärken, zahlenmäßigen Aufgebote und Flottenangaben bleiben aus dem Profil entfernt.', 'Originaldatei unverändert archiviert; die genealogischen Vorlagenteile werden nicht importiert.', 'Hofjahre werden als Amtszeiten geführt und nicht als Lebensdaten interpretiert. Unbenannte Ämter bleiben unbesetzt, leere historische Beispielkarten bleiben ausgeschlossen.', ...decisions[content.id]] };
  await fs.writeFile(path.join(root, dir, 'source-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(JSON.stringify({ id: content.id, dir, revision: content.biographySourceRevision, biographyWords: Object.values(content.biographySummary).join(' ').split(/\s+/).length, heads: content.heads.length, heirs: content.heirs.length, offices: content.offices.length }));
}
