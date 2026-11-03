// Einmalige Quellenaufnahme. Die Laufzeit verwendet nur haus.content.mjs je Haus.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';

const root = process.cwd();
const featureRoot = 'Familien Häuser und Clans/Estryll/Cenyr/Silberinsel/Silberbucht';
const territoryRoot = '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Silberinsel';
const record = id => FAMILY_REGISTRY.find(record => record.id === id);
const family = id => record(id).family;
const crest = id => `../Stammbäume/${family(id).document.emblem}`;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
function person(familyId, id, role, detail = '') {
  const p = family(familyId).persons.find(p => p.id === id);
  if (!p) throw new Error(`Nicht vorhandene Person: ${familyId}/${id}`);
  return { id, familyId, name: p.name, role, detail, image: p.portrait ? `../Stammbäume/${p.portrait}` : '', silhouette: p.sex === 'female' ? 'female' : 'male' };
}
const officeRoles = ['Vogt', 'Schatzmeister', 'Kommandant der Garde', 'Zeremonienmeister', 'Mundschenk', 'Waffenmeister', 'Stallmeister', 'Kerkermeister', 'Jagdmeister', 'Hafenmeister', 'Küchenmeister', 'Brotmeister', 'Handwerksmeister', 'Gartenmeister', 'Hofkaplan', 'Hofmeister', 'Hofdame', 'Archivar', 'Hoffalkner', 'Zwingermeister'];
const knightRite = 'Das cenyrische Rittertum wurzelt in Avallorn. Ein Knappe empfängt den Ritterschlag und die Salbung an einem See oder einem anderen Gewässer. Er schwört auf die Neun Göttlichen und ihre Tugenden; ein zusätzlicher Eid gilt der Dame der See.';
function create({ id, name, type, title, territoryId, territoryName, territoryHref, motto, patrons, wealth, origin, head, heir, attachment, sourceImage }) {
  const houseName = id.replace('haus-', '').replace(/^./, c => c.toUpperCase());
  const dir = `${featureRoot}/Haus_${houseName}`;
  const liege = id === 'haus-neidr' ? 'König Tristan Pendrag' : "Haus Neidr O'Llanvane";
  return { dir, attachment, sourceImage, content: {
    id, name, type, page: 'haus.html', county: 'Silberinsel', liege,
    territoryId, territoryName, territoryHref, parentHouseId: '', extinct: false,
    showMotto: true, registerPage: true, prepared: false, contentVersion: '20261103-silberinsel-v1',
    biographySourceRevision: family(id).extensions.sourceRevision + 1, biographyPreviousDefaultFingerprints: [],
    biographyIntroTitle: 'Über das Haus', biographyHistoryTitle: 'Herkunft und Geschichte', biographySummary: {},
    placeholders: { male: '../Stammbäume/assets/images/placeholders/male.png', female: '../Stammbäume/assets/images/placeholders/female.png' },
    allies: [], hierarchy: [
      { type: 'Sammlung', name: 'Familien Häuser und Clans', slug: 'familien-hauser-und-clans' },
      { type: 'Kontinent', name: 'Estryll', slug: 'estryll' },
      { type: 'Königreich', name: 'Cenyr', slug: 'cenyr' },
      { type: 'Grafschaft', name: 'Silberinsel', slug: 'silberinsel' },
      { type: 'Baronie', name: 'Silberbucht', slug: 'silberbucht' },
      { type: 'Sitz', name: 'Llanvane', slug: 'llanvane' },
      { type: 'Haus', name, slug: id }
    ],
    profile: { highestTitle: title, rank: title, houseType: type, motto, quoteAuthor: '', seat: 'Llanvane', affiliation: id === 'haus-neidr' ? 'Königreich Cenyr · Silberinsel' : 'Silberbucht · Silberinsel', liege,
      troopStrength: '', tiarna: '', kerns: '', fleet: '', founding: '', milestoneOne: '', milestoneTwo: '', patron: '', knightingPatron: '',
      people: 'Cenyri, Silbercenyri', wealth, religion: 'Alerische Kirche', patronDeities: patrons, origin, cadetBranches: '', allies: '', enemies: '' },
    omitMilitaryProfile: true, sections: {},
    images: { crest: crest(id), scene: `${dir.replace('Familien Häuser und Clans/', '')}/assets/hausdarstellung-original.png`, sceneAlt: `Überlieferte Kriegerdarstellung von ${name}`, banner: id === 'haus-neidr' ? '../Stammbäume/assets/images/regions/silberinsel.png' : '../Stammbäume/assets/images/regions/Cenyr/Silberinsel/Silberbucht.png' },
    illustrationCategory: 'Hausdarstellung', cadets: [], founder: null, heads: [], heirs: [],
    offices: officeRoles.map(role => ({ name: 'Nicht benannt', role, silhouette: role === 'Hofdame' ? 'female' : 'male', detail: 'Amtsinhaber nicht benannt.' })),
    figuresTitle: 'Historische Persönlichkeiten des Hauses', figures: [], trivia: [], currentHead: head, firstHeir: heir,
    headsNote: 'Überlieferte Amtszeiten; unbekannte frühe Zeiträume bleiben offen. Lebensdaten stehen in den bestehenden Personenakten.'
  } };
}

const neidr = create({ id: 'haus-neidr', name: "Haus Neidr O'Llanvane", type: 'Grafenhaus', title: 'Graf', territoryId: 'silberinsel', territoryName: 'Silberinsel', territoryHref: `${territoryRoot}/Grafschaft Silberinsel.html`,
  motto: 'Wissen säen, Weisheit ernten.', patrons: 'Die Dame der See und die Mutter', wealth: 'Sehr hoch', origin: 'Avallorn · Gawan Neidr und Mallaidh Muirghin', head: 'Yvain Neidr', heir: 'Gwynfor Neidr',
  attachment: '21a37d56-6614-4208-8a93-cb17f76fbf6d', sourceImage: 'https://i.imgur.com/dGXptHo.png' });
neidr.content.biographyIntroTitle = 'Wissen säen, Weisheit ernten';
neidr.content.sections = {
  overview: 'Haus Neidr ist das Grafengeschlecht der Silberinsel. Sein Sitz Llanvane liegt in der geschützten Silberbucht im Süden der Insel und bildet deren politisches und wirtschaftliches Zentrum. Die Familie verbindet Seefahrt und Handel mit Bergbau, einer direkten Inselkultur und der Verehrung der Dame der See und der Mutter.',
  history: ['Gawan Neidr führte seine Gefolgsleute auf die Insel, um sie im Namen seines Königs zu beanspruchen. Nach der bestehenden Grafschaftsüberlieferung vertrieb er die Norrnaigh. Seine Ehe mit Mallaidh aus dem überlebenden Clan Tir An Muirghin verband die Neuankömmlinge mit dem älteren Inseladel und begründete das Grafenhaus.', 'Die Sicherung der Küsten und der Seewege blieb eine dauerhafte Aufgabe. Der maritime Handel und die reichen Gebirge trugen zum Aufstieg der Neidr bei. Unter ihren Nachfahren entstanden verwandte Familien auf der Insel; die konkrete Verwandtschaft wird im bestehenden Stammbaum bewahrt. Yvain Neidr regiert seit 1720.'],
  traditions: 'Seemannskunde, religiöse Hingabe und die Ausbildung der Cantref und Helwyr gehören zu den ausdrücklich beschriebenen Haustraditionen. Der Umgang mit den Küstengewässern und die Sicherung der Handelswege prägen die Ausbildung ebenso wie die langjährige Auseinandersetzung mit Gefahren auf der Insel. Der Leitspruch lautet „Hau gwybodaeth, medi doethineb.“ – „Wissen säen, Weisheit ernten.“',
  knighthood: [knightRite, 'Schwarz, Weiß und Gold bestimmen die Hausdarstellung. Die zweckmäßigen lamellenartigen Rüstungen erinnern an Schlangenschuppen. Schwarzes Leder, weiße Nähte und goldene Verbindungen greifen das Wappen auf. Die glatten Helme werden in der Hausquelle mit dem geöffneten Maul einer Schlange verglichen.', 'Cantref und Helwyr sind für das Haus besonders wichtig: Nahkampf und Langbogen ergänzen sich im Dienst auf See und an den Küsten. Hausknechte führen die Schlange und die Hausfarben, während die Stadtwache das Stadtzeichen trägt. Der raue Dienst und wiederkehrende Kämpfe prägen ein selbstbewusstes, mitunter hartes Auftreten.'],
  holdings: ['Llanvane ist der wichtigste Stadt- und Handelssitz der Silberinsel. Die südliche gräfliche Baronie Silberbucht umfasst fruchtbare Gebiete, Gebirgsabschnitte, Klöster und zahlreiche Dörfer. Minen tragen wesentlich zum Wohlstand des Hauses bei; Fischerdörfer und Bergbausiedlungen ergänzen die Einkünfte.', 'Die aktuelle Landesgliederung nennt Silberpfad mit dem Weg von Llanvane nach Eiddon sowie die nördliche Baronie Silberküste. Caer Clwyd gehört zur Herrschaft Silberpfad. Die Lehensbindungen dieser Gebiete werden von der Grafschaft aus zusammengehalten.'],
  cultureReligion: 'Die Neidr gehören zu den Cenyri und Silbercenyri und zur Alerischen Kirche. Die Inselkultur bevorzugt eine direkte, forsche Rede und schlichten Umgang. Höfische Förmlichkeit steht weniger im Vordergrund als auf manchen Teilen des Festlands. Besonders verehrt werden die Dame der See und die Mutter. Die Hausquelle beschreibt den Glauben sowohl als zeremonielle Verpflichtung als auch als Anspruch an das tägliche Verhalten.',
  conflictsAlliances: 'Die Herrschaft über die Silberinsel verbindet die Neidr mit den Familien Saith, Crefyddol, Canwyll, Pyrth und Tiwna. Diese Häuser stehen in unterschiedlichen Lehens- und Verwandtschaftsbeziehungen zum Grafenhaus; nicht jedes ist ein Kadettenhaus der Neidr. Eine bestimmte aktuelle Hausfehde ist nicht benannt.',
  values: 'Tapferkeit, Loyalität und die Bewahrung ritterlicher Ehre gehören zum Selbstbild. Die Hausquelle stellt den frommen Anspruch einer rauen, gelegentlich skrupellosen Praxis gegenüber. Nicht alle Angehörigen verkörpern denselben Charakter; das Streben nach Ansehen und moralischer Bewährung bleibt als Spannung der Hausüberlieferung erhalten.',
  succession: 'Gwynfor Neidr steht an erster Stelle der bestätigten Erbfolge, Lancelot Neidr an zweiter. Lancelot ist in der bestehenden Akte als Mündel bei Haus Pendrag verzeichnet.',
  court: 'Yvain Neidr führt das Haus seit 1720. Die überlieferte Oberhauptfolge enthält große frühe Lücken. Die zwanzig Hofämter der Vorlage bleiben ohne erfundene Amtsinhaber sichtbar unbesetzt.',
  familyTree: 'Die bestehende Familienakte ist hier eingebettet. Das Hauswappen im Stammbaum öffnet die Hausbiografie.',
  historicalFigures: 'Gawan Neidr ist als Begründer des Grafenhauses überliefert.'
};
neidr.content.biographySummary = {
  overview: 'Haus Neidr ist das Grafenhaus der Silberinsel und hat seinen Sitz in Llanvane. Die Hauptstadt liegt in der geschützten Silberbucht im Süden der Insel. Das Geschlecht verbindet Seefahrt, Seehandel und Bergbau mit einer selbstbewussten Inselkultur. Yvain Neidr regiert seit 1720; Gwynfor und Lancelot bilden in dieser Reihenfolge die bestätigte Erbfolge.',
  history: 'Gawan Neidr führte seine Gefolgsleute auf die Insel und beanspruchte sie für seinen König. Nach der bestehenden Grafschaftsüberlieferung gelang es ihm, die Norrnaigh zu vertreiben. Seine Ehe mit Mallaidh Muirghin, einer Überlebenden des älteren Inselclans, begründete das Grafengeschlecht. Die Sicherung der Küsten und der Seewege blieb auch für seine Nachfahren eine prägende Aufgabe.',
  character: 'Die Neidr pflegen den Anspruch auf Tapferkeit, Loyalität und ritterliche Ehre. Die Überlieferung beschreibt zugleich eine harte und bisweilen skrupellose Seite ihres Auftretens. Der Umgang mit den Gefahren der Insel und der See steht damit in Spannung zum religiösen Ideal. Der einzelne Angehörige wird nicht pauschal mit dem Ruf des ganzen Hauses gleichgesetzt.',
  customs: 'Seemannskunde und die Ausbildung von Cantref und Helwyr gehören zum Hausleben. Nahkampf und Langbogen ergänzen sich auf See und an den Küsten. Schwarz, Weiß und Gold, zweckmäßige lamellenartige Panzer und das Schlangenmotiv prägen die ritterliche Darstellung. Der Hausleitspruch lautet „Wissen säen, Weisheit ernten.“',
  holdings: 'Minen in den reichen Gebirgszügen, der Handel Llanvanes sowie Fischerdörfer und Bergbausiedlungen tragen zum Wohlstand bei. Silberbucht bildet das südliche gräfliche Kerngebiet. Der Gebirgsweg durch Silberpfad verbindet Llanvane mit dem nördlichen Eiddon und der Silberküste.',
  culture: 'Als Cenyri und Silbercenyri gehören die Neidr zur Alerischen Kirche. Sie verehren besonders die Dame der See und die Mutter. Die Inselbewohner gelten als direkt und forsch; aufwendige höfische Förmlichkeit ist weniger wichtig als der klare Umgang miteinander.',
  relations: 'Saith, Crefyddol, Canwyll, Pyrth und Tiwna sind durch Lehensbindungen und verschiedene Verwandtschaftslinien mit dem Grafenhaus verbunden. Diese Beziehungen bleiben im bestehenden Stammbaum differenziert. Lancelots Stellung als Mündel bei Haus Pendrag bleibt ebenfalls erhalten.'
};
neidr.content.founder = person('haus-neidr', 'gawan-neidr', 'Gründer', 'Begründer des Grafenhauses · Amtszeit nicht überliefert');
neidr.content.heads = [['gawan-neidr', 'Amtszeit nicht überliefert'], ['gwyron-neidr', 'Amtszeit nicht überliefert'], ['owain-neidr', 'Amtszeit nicht überliefert'], ['cadoc-neidr', 'Amtszeit nicht überliefert'], ['merwin-neidr', 'Amtszeit nicht überliefert'], ['powell-neidr', 'Amtszeit nicht überliefert'], ['gwythyr-neidr', 'Amtszeit nicht überliefert'], ['daffyd-neidr', 'Amtsbeginn unbekannt · bis 1593'], ['gwynnan-neidr', 'Amtszeit: 1593–1653'], ['howell-neidr', 'Amtszeit: 1653–1701'], ['gaenor-neidr', 'Amtszeit: 1701–1711'], ['aeron-neidr', 'Amtszeit: 1711–1720'], ['yvain-neidr', 'Amtszeit: seit 1720']].map(([id, detail]) => person('haus-neidr', id, 'Graf', detail));
neidr.content.heirs = ['gwynfor-neidr', 'lancelot-neidr'].map((id, i) => person('haus-neidr', id, `${i + 1}. Erbe`));
neidr.content.figures = [{ ...neidr.content.founder, description: 'Anführer der cenyrischen Ankömmlinge und Begründer des Hauses Neidr. Seine Verbindung mit Mallaidh Muirghin verknüpfte die neue Herrschaft mit dem älteren Inseladel.' }];
neidr.content.trivia = ['Das Hausmotto lautet „Hau gwybodaeth, medi doethineb.“ – „Wissen säen, Weisheit ernten.“'];
neidr.content.sections.history.push('Eine ältere Hausüberlieferung erinnert an das „Abendmahl der Viper“ als Einschnitt in die frühere Handelsmacht. Sie berichtet von einem Embargo vieler Gilden und Fraktionen sowie des Festlands und von Schulden im Zusammenhang mit der Ermordung eines als Baron bezeichneten Herrschers. Zeitpunkt, Identität des Opfers und der genaue Zusammenhang der Vorgänge bleiben unbestimmt. Ob die damaligen Sanktionen fortbestehen, ist nicht überliefert.');
neidr.content.biographySummary.history += '\n\nDie ältere Hausüberlieferung nennt das „Abendmahl der Viper“, ein Handelsembargo und Schulden nach der Ermordung eines nicht namentlich bezeichneten Barons als Belastungen des Hausansehens. Datierung, Opfer und Fortdauer der Folgen bleiben offen.';

const saith = create({ id: 'haus-saith', name: "Haus Saith O'Llanvane", type: 'Ritterfürstenhaus', title: 'Ritterfürst', territoryId: 'herrschaft-saith', territoryName: 'Herrschaft der Saith', territoryHref: `${territoryRoot}/Herrschaft der Saith/Herrschaft der Saith.html`,
  motto: 'Trag deine Last und geh.', patrons: 'Der Mentor und die Dame der See', wealth: 'Mittelmäßig', origin: 'Bors Saith und Gwennan Neidr', head: 'Duny Saith', heir: 'Lyonel Saith', attachment: '7704814b-d939-4aa0-923b-6c1fb4d33eac', sourceImage: 'https://i.imgur.com/ZiuoWZr.png' });
saith.content.sections = {
  overview: 'Die Saith sind ein altes Ritterfürstenhaus der Silberinsel mit Verwaltungssitz in Llanvane. Als langjährige Vasallen der Neidr verbinden sie Frömmigkeit mit Bildung, Verwaltung und Seemannskunde. Das Haus sieht sich eher in der Rolle gelehrter Staatsleute als in der Selbstdarstellung eines kriegerischen Geschlechts.',
  history: ['Bors Saith und Gwennan Neidr begründeten das Haus. Die Verbindung zum Grafenhaus steht am Anfang einer langen Überlieferung treuer Dienste. Die Saith stellten Verwalter, Justiziare, Alchemisten und Magier und trugen damit zur Herrschaft der Neidr über die Insel bei.', 'Ihre religiöse Geschichte nennt Patriarchen des Mentors und anderer Kulte sowie einzelne Hohepriester des Landes, ohne diese Personen in der Hausquelle namentlich zu bestimmen. Duny Saith steht seit 1717 an der Spitze des Hauses.'],
  traditions: 'Jeder Angehörige wählt einen Schutzpatron aus dem Pantheon oder einen verehrten Heiligen und bemüht sich um dessen Tugenden. Seemannskunde ergänzt diese religiöse Schulung. Eine Ausbildung an der Universität, bei der Magiergilde oder bei einem Alchemisten beziehungsweise Druiden gilt als erstrebenswert. Die Quelle erinnert für die magische Ausbildung außerdem an die frühere Dämmerwacht.',
  knighthood: ['Das cenyrische Rittertum geht auf die Ankunft der Avallornier zurück. Die Saith bilden Ritter aus, werden jedoch stärker als Gelehrte und Staatsleute wahrgenommen. Ihr Nachwuchs wird dafür von betont kriegerischen Häusern gelegentlich belächelt.', 'Das Sternzeichen ihrer Hauskrieger verweist auf die Neun Göttlichen: Acht Zacken stehen für acht Gottheiten, ein kleinerer Stern im Zentrum für den Vater.'],
  holdings: ['Die Saith betreiben eine Akademie in Llanvane und haben durch ihre früheren Investitionen Wohlstand erworben. Die bestehende Herrschaftsüberlieferung nennt außerdem Salzgewinnung in Bodcarreg, Fischerei an der Küste und Landwirtschaft im Raum Tirglyn.', 'Castell Nantgraig ist als wichtige Festung der Herrschaft beschrieben. Porthros gehört zu den Küstensiedlungen. Diese Orte und Gewerbe bilden die überlieferte regionale Lebensgrundlage.'],
  cultureReligion: 'Die Saith gehören als Cenyri und Silbercenyri zur Alerischen Kirche. Der Mentor ist ihr besonderer Schirmherr. Die Neun Göttlichen und die Dame der See prägen die weitere religiöse Ausrichtung. Bildung, Besonnenheit und eine bescheidene Lebensweise gelten als hohe Güter; das Haus rühmt sich weniger seiner Ritter als seiner geistigen Arbeit.',
  conflictsAlliances: 'Die Bindung an Haus Neidr ist die zentrale Lehensbeziehung. Verwandtschaft mit dem Grafenhaus geht auf das Gründerpaar zurück. Eine konkrete gegenwärtige Fehde oder ein zusätzliches förmliches Bündnis ist in der Hausquelle nicht beschrieben.',
  values: 'Frömmigkeit, Aufrichtigkeit und Bodenständigkeit bestimmen das angestrebte Selbstbild. Die Saith bevorzugen einen ruhigen und bescheidenen Alltag. Im Vergleich mit den Neidr betont die Quelle weniger Stolz und stärker die Bereitschaft zu geduldigem Dienst, geistiger Arbeit und verlässlicher Verwaltung.',
  succession: 'Lyonel Saith ist als erster Erbe Duny Saiths überliefert.',
  court: 'Die bestätigte Oberhauptfolge führt von Bors über Dadweir, Argyll und Lancel zu Duny. Frühe Amtszeiten bleiben offen. Die zwanzig überlieferten Hofämter sind nicht namentlich besetzt.',
  familyTree: 'Die bestehende Familienakte ist hier eingebettet. Das Hauswappen im Stammbaum öffnet die Hausbiografie.', historicalFigures: 'Bors Saith ist als Hausgründer überliefert.'
};
saith.content.biographySummary = {
  overview: 'Haus Saith ist ein altes Ritterfürstenhaus der Silberinsel mit Verwaltungssitz in Llanvane. Die Familie gehört zu den langjährigen Vasallen der Neidr. Sie verbindet religiöse Hingabe mit Bildung, Seemannskunde und dem Dienst als Berater und Verwalter. Duny Saith führt das Haus seit 1717; Lyonel ist als erster Erbe genannt.',
  history: 'Bors Saith und Gwennan Neidr begründeten das Haus und verbanden es unmittelbar mit dem Grafengeschlecht. Die spätere Überlieferung hebt die Treue zu den Neidr hervor. Statt sich allein dem Schwert zu widmen, brachten die Saith Verwalter, Justiziare, Alchemisten und Magier hervor. Auch Patriarchen des Mentors und anderer Kulte sowie einzelne Hohepriester des Landes sollen aus dem Haus stammen; die Quelle benennt sie nicht einzeln.',
  character: 'Die Saith verstehen sich eher als Staatsleute denn als Krieger. Frömmigkeit, Aufrichtigkeit und Geduld sollen ihr Handeln bestimmen. Ein ruhiges und bescheidenes Leben hat hohen Wert. Im Vergleich zum stolzen Auftreten der Neidr beschreibt die Hausquelle sie als schlichter und bodenständiger.',
  customs: 'Angehörige wählen einen göttlichen Schutzpatron oder einen verehrten Heiligen und bemühen sich um dessen Tugenden. Seemannskunde gehört ebenso zur Ausbildung. Der Besuch einer Universität, eine magische Lehre oder die Ausbildung bei einem Alchemisten beziehungsweise Druiden gilt als erstrebenswert. Die Familie bildet auch Ritter aus, ohne darin ihren wichtigsten gesellschaftlichen Rang zu sehen.',
  holdings: 'Eine Akademie in Llanvane und frühere Investitionen tragen zum Wohlstand bei. Die Herrschaft besitzt daneben eine regionale Grundlage aus Salzgewinnung in Bodcarreg, Fischerei an der Küste und Landwirtschaft um Tirglyn. Castell Nantgraig und die Küstensiedlung Porthros gehören zu den beschriebenen Orten ihres Herrschaftsraums.',
  culture: 'Die Saith zählen zu den Cenyri und Silbercenyri und gehören zur Alerischen Kirche. Ihr besonderer Patron ist der Mentor. Die Hauskrieger führen ein Sternzeichen der Neun Göttlichen: Acht Zacken werden durch den kleinen Stern des Vaters im Zentrum ergänzt.',
  relations: 'Die Lehensbindung und das verwandtschaftliche Verhältnis zu den Neidr prägen die politische Stellung. Eine konkrete aktuelle Hausfehde ist nicht ausgearbeitet; die bestehenden Beziehungen bleiben im eingebetteten Stammbaum erhalten.'
};
saith.content.founder = person('haus-saith', 'bors-saith', 'Gründer', 'Gründer gemeinsam mit Gwennan Neidr · Amtszeit nicht überliefert');
saith.content.heads = [['bors-saith', 'Amtszeit nicht überliefert'], ['dadweir-saith', 'Amtszeit nicht überliefert'], ['argyll-saith', 'Amtsbeginn unbekannt · bis 1701'], ['lancel-saith', 'Amtszeit: 1701–1717'], ['duny-saith', 'Amtszeit: seit 1717']].map(([id, detail]) => person('haus-saith', id, 'Ritterfürst', detail));
saith.content.heirs = [person('haus-saith', 'lyonel-saith', 'Erster Erbe')];
saith.content.figures = [{ ...saith.content.founder, description: 'Begründer des Hauses Saith. Das Gründerpaar Bors und Gwennan Neidr steht am Anfang der familiären Bindung an das Grafenhaus.' }];
saith.content.allies = [{ name: 'Haus Neidr', detail: 'Lehnsherr und verwandtes Grafenhaus', image: crest('haus-neidr'), imageFormat: 'square' }];
saith.content.sections.history.push('Ein älterer Bericht über die Krise der Neidr nennt auch Einschränkungen und Beschlagnahmungen von Saith-Besitz. Welche Güter betroffen waren, wann dies geschah und welche Folgen noch andauern, ist nicht überliefert.');
saith.content.biographySummary.history += '\n\nEin älterer Krisenbericht nennt Einschränkungen und Beschlagnahmungen von Saith-Besitz. Zeitpunkt, betroffene Güter und heutige Folgen sind nicht näher bestimmt.';

const crefyddol = create({ id: 'haus-crefyddol', name: "Haus Crefyddol O'Llanvane", type: 'Ritterfürstenhaus', title: 'Ritterfürst', territoryId: 'herrschaft-crefyddol', territoryName: 'Herrschaft der Crefyddol', territoryHref: `${territoryRoot}/Herrschaft der Crefyddol/Herrschaft der Crefyddol.html`,
  motto: 'Licht in der Nacht.', patrons: 'St. Sieffre, die Glücksmaid und die Mutter', wealth: 'Mittelmäßig', origin: 'Llwyarch Crefyddol · Sieffre der Fromme und Jinelle Neidr', head: 'Kimball Crefyddol', heir: 'Merrion Crefyddol',
  attachment: 'ec84d68a-07aa-4e31-a856-06e906d108bc', sourceImage: 'https://i.imgur.com/QyU83Aq.png' });
crefyddol.content.biographyIntroTitle = 'Licht in der Nacht';
crefyddol.content.biographyHistoryTitle = 'Sieffres Laterne und Llwyarchs Erbe';
crefyddol.content.sections = {
  overview: 'Die Crefyddol sind ein altes Ritterfürstenhaus von Llanvane. Ihre Ritter verbinden den Kriegsdienst häufig mit dem Klerus und folgen dem Weg des Paladins. Sie verstehen sich als Licht und Schutz gegen infernale Bedrohungen. Das Haus Canwyll ist ihr Bruderhaus.',
  history: ['Sieffre der Fromme war ein Priester, der in einer Abtei auf der von Krieg und finsteren Wesen heimgesuchten Silberinsel Waisen aufnahm. Nach der Hausüberlieferung stellte er den verängstigten Kindern abends eine Kerze in die Schlafkammern. Danach ging er mit einer Laterne hinaus, um Küsten und Wälder zu bewachen.', 'Jinelle Neidr, Tochter des Grafenhauses, verband sich mit Sieffre. Ihre Söhne führten sein Erbe auf unterschiedliche Weise fort: Llwyarch begründete Haus Crefyddol und wählte den Mann mit der Laterne als Hauszeichen. Sein Bruder Llwellyn begründete Haus Canwyll, dessen Kerze an den Trost für die Kinder erinnert.', 'Die bestehende Herrschaftsüberlieferung beschreibt die Übertragung eigener Ländereien bei Llanvane als Anerkennung der Verdienste Sieffres und seiner Nachkommen. Ein Gründungsjahr ist nicht überliefert. Kimball Crefyddol führt das Haus seit 1720.'],
  traditions: 'Viele Angehörige verbinden Rittertum und geistlichen Dienst. Die Abwehr infernaler Gefahren gilt als Fortsetzung von Sieffres Wachgängen. Kerzen und Laternen erinnern an Fürsorge, Schutz und Hoffnung. Der Leitspruch „Licht in der Nacht“ fasst diese Aufgabe zusammen; er verpflichtet nicht jeden Angehörigen auf dieselbe Laufbahn.',
  knighthood: [knightRite, 'Der häufige Weg zum Paladin verbindet die gemeinsame cenyrische Rittertradition mit dem klerikalen Erbe des Hauses. Seine Glaubenskrieger dienen als Verteidiger und geistliche Vorbilder. Bei übernatürlichen Bedrohungen gelten ihnen Schutz der Bevölkerung und Abwehr finsterer Einflüsse als religiöse Pflicht.'],
  holdings: 'Die Herrschaftsüberlieferung nennt mineral- und edelsteinreichen Abbau in Rosgwern, Waffen- und Rüstungsschmieden in Pencaerglyn, Kräuter- und Heilpflanzenanbau in Maesnant sowie Fischfang und Fischölherstellung in Aberffryd. Diese Orte und Gewerbe bilden die regionale Lebensgrundlage. Einzelne weitere Familiengüter sind nicht benannt.',
  cultureReligion: 'Die Crefyddol gehören als Cenyri und Silbercenyri zur Alerischen Kirche. St. Sieffre, die Glücksmaid und die Mutter sind als Patrone genannt. Die Herrschaftsüberlieferung betont Fürsorge, Opferbereitschaft und die Verbindung ihrer Dörfer mit Klöstern und Abteien. Das Entzünden von Kerzen und Laternen bewahrt die Erinnerung an den Stammvater.',
  conflictsAlliances: 'Die Neidr sind Lehnsherr und Herkunftshaus Jinelles. Mit dem Bruderhaus Canwyll teilen die Crefyddol das Erbe Sieffres des Frommen. Die gemeinsame Aufgabe gegen infernale Gefahren wird auf der Silberinsel fortgeführt. Eine konkrete aktuelle Hausfehde ist in der übernommenen Quelle nicht benannt.',
  values: 'Schutz der Schwachen, Trost und tätiger Glaube bestimmen die Gründungsüberlieferung. Die Laterne steht für den Dienst außerhalb sicherer Mauern, die Kerze für die Fürsorge im Inneren. Aus diesem gemeinsamen Ursprung leiten sich die verwandten, aber eigenständigen Hauszeichen der Crefyddol und Canwyll ab.',
  succession: 'Merrion Crefyddol steht an erster, Yvain Crefyddol an zweiter Stelle der bestätigten Erbfolge.',
  court: 'Die Oberhauptfolge führt vom Gründer Llwyarch über die später belegten Ritterfürsten zu Kimball. Frühe Lücken bleiben offen. Die zwanzig Hofämter der Vorlage sind nicht namentlich besetzt.',
  familyTree: 'Die bestehende Familienakte ist hier eingebettet. Das Hauswappen im Stammbaum öffnet die Hausbiografie.', historicalFigures: 'Sieffre der Fromme ist der gemeinsame Stammvater beider Bruderhäuser; Llwyarch ist der Gründer Crefyddols.'
};
crefyddol.content.biographySummary = {
  overview: 'Haus Crefyddol ist ein altes Ritterfürstenhaus von Llanvane in Silberbucht. Es verbindet enge Bindung an den Klerus mit der Ausbildung von Paladinen und dem Schutz der Menschen gegen infernale Gefahren. Kimball Crefyddol führt das Haus seit 1720; Merrion und Yvain bilden die bestätigte Erbfolge. Das Motto lautet „Licht in der Nacht“.',
  history: 'Die Hausüberlieferung beginnt mit Sieffre dem Frommen. Der Priester nahm auf der von Krieg und Finsternis bedrohten Silberinsel Waisen in seiner Abtei auf. Jeden Abend stellte er Kerzen in ihre Schlafkammern, um ihnen Trost und Sicherheit zu geben. Danach zog er mit einer Laterne hinaus und bewachte Küsten und Wälder.\n\nSeine Verbindung mit Jinelle Neidr führte zu den beiden Bruderhäusern. Llwyarch begründete Crefyddol und übernahm den Mann mit der Laterne als Zeichen des wachsamen Schutzes. Llwellyn gründete Canwyll und bewahrte im Kerzenwappen die Erinnerung an Sieffres Fürsorge für die Kinder. Ein datiertes Gründungsjahr ist nicht überliefert.',
  character: 'Das Erbe des Stammvaters verbindet Tapferkeit mit Fürsorge. Schutz der Schwachen, Hoffnung und tätiger Glaube prägen das Selbstbild. Die Laterne steht für den Gang in die gefährliche Nacht; die Kerze erinnert an Geborgenheit innerhalb der Abtei. Die beiden Hauszeichen bewahren unterschiedliche Seiten derselben Gründungserzählung.',
  customs: 'Viele Crefyddol verbinden den Ritterdienst mit einer geistlichen Laufbahn und werden Paladine. Dies gilt als Fortsetzung von Sieffres Schutzaufgabe, ohne jeden Angehörigen auf dieselbe Ausbildung festzulegen. Kerzen und Laternen werden in den Siedlungen als Zeichen von Licht, Zusammenhalt und Schutz entzündet.',
  holdings: 'Die bestehende Herrschaftsüberlieferung nennt Bergbau in Rosgwern, Schmieden in Pencaerglyn, Heilpflanzen und Kräuter in Maesnant sowie Fischfang und Fischölherstellung in Aberffryd. Diese regionalen Gewerbe stützen die Lebensgrundlage nahe Llanvane.',
  culture: 'Die Familie gehört zur Alerischen Kirche und verehrt besonders St. Sieffre, die Glücksmaid und die Mutter. Ihre Dörfer sind mit Klöstern und Abteien verbunden. Die gemeinsame cenyrische Rittertradition tritt neben das klerikale Erbe.',
  relations: 'Die Neidr sind Lehnsherr und Jinelles Herkunftshaus. Mit Canwyll teilen die Crefyddol den Stammvater und die Aufgabe der Abwehr finsterer Gefahren; beide Häuser bleiben eigenständige Familienakten.'
};
crefyddol.content.founder = person('haus-crefyddol', 'llwyarch-founder-crefyddol', 'Gründer', 'Erster Ritterfürst · Amtszeit nicht überliefert');
crefyddol.content.heads = [['llwyarch-founder-crefyddol', 'Amtszeit nicht überliefert'], ['nodawl-crefyddol', 'Amtszeit nicht überliefert'], ['merrion-1582-crefyddol', 'Amtsbeginn unbekannt · bis 1662'], ['cadwallon-crefyddol', 'Amtszeit: 1662–1685'], ['gwastad-crefyddol', 'Amtszeit: 1685–1700'], ['lywelyn-crefyddol', 'Amtszeit: 1700–1720'], ['kimball-crefydoll', 'Amtszeit: seit 1720']].map(([id, detail]) => person('haus-crefyddol', id, 'Ritterfürst', detail));
crefyddol.content.heirs = ['merrion-crefyddol', 'yvain-crefyddol'].map((id, i) => person('haus-crefyddol', id, `${i + 1}. Erbe`));
crefyddol.content.figures = [{ ...person('haus-crefyddol', 'sieffre-der-fromme', 'Heiliger Stammvater'), description: 'Priester und Beschützer der Waisen. Seine Kerzen und nächtlichen Wachgänge mit der Laterne prägen die Hauszeichen der Bruderhäuser.' }, { ...crefyddol.content.founder, description: 'Sohn Sieffres des Frommen und Jinelle Neidrs. Er begründete Haus Crefyddol und übernahm den Wächter mit der Laterne als Hauszeichen.' }];
crefyddol.content.allies = [{ name: 'Haus Neidr', detail: 'Lehnsherr und Jinelles Herkunftshaus', image: crest('haus-neidr'), imageFormat: 'square' }, { name: 'Haus Canwyll', detail: 'Bruderhaus · gemeinsamer Stammvater Sieffre der Fromme', image: crest('haus-canwyll'), imageFormat: 'square' }];
crefyddol.content.trivia = ['Die Laterne der Crefyddol und die Kerze der Canwyll erinnern an unterschiedliche Seiten der Fürsorge Sieffres des Frommen.'];

const commonDecisions = [
  'Die genealogischen Abschnitte „Hierarchie“ und „Stammbaum“ samt alter Stammbaumgrafik werden vollständig ignoriert. Keine neuen Personen, Lebensdaten, Beziehungen oder Graphänderungen.',
  'Alle Militärstatistiken und Zahlen vollständig ignoriert. Das Militärprofil bleibt ausgeblendet; die literarische Beschreibung von Rittertum und Ausrüstung wird davon getrennt behandelt.',
  'Aktuelle Familienakten, Haus-IDs, Personen-IDs, Portraitzuordnungen und Ortsprofile haben Vorrang vor alten Kopierfeldern. Amtszeiten werden ausdrücklich von Lebensdaten getrennt.',
  'Die Kapitel der aktuellen Grafschafts- und Herrschaftsseiten ergänzen belegt die heutige territoriale Einordnung und Lebensgrundlage. Unbenannte Amtsinhaber und historische Platzhalter werden nicht erfunden.'
];
const decisions = {
  'haus-neidr': [
    'Der als Gwyneed beschriftete Graf ab 1720 ist in der kanonischen Akte und Grafschaft als Yvain Neidr identifiziert. Die vorhandene stabile Person yvain-neidr wird verwendet.',
    'Sitz und Hauptstadt sind Llanvane. Die Altbezeichnungen Cerneu/Cerneus werden nicht als neue aktuelle Stadt oder Insel geführt; die aktuelle Gliederung nennt Silberbucht, Silberpfad und Silberküste sowie Eiddon und Caer Clwyd. Liwtune wird nicht als neue Ortschaft angelegt.',
    'Die historische Episode „Abendmal der Viper“ (redaktionell „Abendmahl der Viper“) bleibt ausdrücklich als ältere Hausüberlieferung erhalten: früherer Handelsvorrang, Embargo vieler Gilden/Fraktionen sowie des Festlands, Schulden im Zusammenhang mit der Ermordung eines nicht benannten Barons. Die Quelle nennt weder Datum noch Opfer oder Täter; heutiger Fortbestand und genauer Zusammenhang bleiben offen. Der ältere Baron-/Cerneu-Kontext wird nicht mit einem erfundenen Amtsinhaber der aktuellen Grafenherrschaft gleichgesetzt.',
    'Die Mutter ist im ausgeführten Kulturtext als weitere verehrte Gottheit genannt. Die Kurzzeile Dame der See/Nimue nennt zweimal dieselbe Patronin; die Darstellung führt Dame der See und Mutter.',
    'Verwandtschaft zu den Inselhäusern wird nicht pauschal als Kadettenzuordnung behandelt. Die bestehenden differenzierten Akten bleiben maßgeblich.'
  ],
  'haus-saith': [
    'Kanonische Schreibweise und stabile Haus-ID sind Saith/haus-saith. Llanvane ersetzt keine neue zweite Stadt Cerneu.',
    'Die ältere Behauptung von Einschränkungen und Beschlagnahmungen hängt am Krisenbericht der Neidr-Vorlage. Sie bleibt als ältere Hausüberlieferung erhalten; Zeitpunkt, Güter und heutiger Besitzstand sind unbestimmt. Die Akademie und frühere Investitionen bleiben als eigenständige Sachangaben erhalten.',
    'Das Sternzeichen der Neun Göttlichen wird als Symbol beschrieben, ohne daraus neue Zahlen, Fähigkeiten oder Kampfformen abzuleiten.',
    'Die ältere Magiergildenbezeichnung Dämmerwacht bleibt als ausdrücklich historische Angabe erhalten; ein heutiger Gildenstatus wird nicht neu bestimmt.'
  ],
  'haus-crefyddol': [
    'Crefyddoll/Crefydoll sind Altvarianten des kanonischen Hauses Crefyddol. Die technischen Personen-IDs kimball-crefydoll und andere Altkennungen bleiben unverändert.',
    'Das kopierte Ursprungsfeld Bors Saith/Gwennan Neidr widerspricht Hausgeschichte und kanonischer Akte. Crefyddol wurde von Llwyarch begründet; Sieffre der Fromme und Jinelle Neidr sind die gemeinsamen Eltern der Bruderhausgründer.',
    'Die Namen der Gründer werden nach den vorhandenen Akten als Llwyarch Crefyddol und Llwellyn Canwyll geführt. Keine neue Person für Llywarch/Llewelyn-Varianten angelegt.',
    'Der allgemeine Rittertext verwendet Avallorn statt der veralteten Form Avalon. Offene Kapitel aus Punkten werden nicht als Lore ausgegeben; die bestehende Herrschaftsseite liefert die genannten regionalen Gewerbe.'
  ]
};
for (const item of [neidr, saith, crefyddol]) {
  const { content: c, dir } = item;
  await fs.mkdir(path.join(root, dir, 'assets'), { recursive: true });
  const attachmentDir = path.join('C:/Users/fhg_r/.codex/attachments', item.attachment);
  const sourceName = (await fs.readdir(attachmentDir)).find(name => name.endsWith('.txt'));
  const source = await fs.readFile(path.join(attachmentDir, sourceName));
  await fs.writeFile(path.join(root, dir, 'animexx-original.html'), source);
  await fs.writeFile(path.join(root, dir, 'haus.content.mjs'), '// Redaktionelle Quelle für Hausseite und Hausbio.\n// Quellenentscheidungen: source-manifest.json. Bestehende Genealogie unverändert per Iframe.\nexport const HOUSE_CONTENT = ' + JSON.stringify(c, null, 2) + ';\n');
  const file = path.join(root, dir, 'assets/hausdarstellung-original.png');
  let imageAudit = { url: item.sourceImage, localPath: 'assets/hausdarstellung-original.png', status: 'download-pending', note: 'Sandbox-Download am Proxy 127.0.0.1:9 blockiert; Hauptagent übernimmt direkten Bezug.' };
  try { const bytes = await fs.readFile(file); imageAudit = { ...imageAudit, status: 'downloaded-awaiting-visual-review', sha256: digest(bytes), width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), note: 'Geliefertes Original unverändert übernommen.' }; } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const manifest = { houseId: c.id, source: { attachmentId: item.attachment, file: 'animexx-original.html', sha256: digest(source), byteIdenticalToAttachment: true }, images: [imageAudit], genealogy: { providedHierarchyIgnored: true, providedTreeImageIgnored: true, graphChanges: false, familyId: c.id }, canonicalSources: [`Stammbäume/assets/js/data/house-${c.id.slice(5)}-family.js`, 'Stammbäume/assets/js/data/silberinsel-house-profiles.js', `Kontinente/Estryll/Königreich Cenyr/Grafschaft Silberinsel/${c.id === 'haus-neidr' ? 'grafschaft.data.mjs' : `Herrschaft der ${c.id === 'haus-saith' ? 'Saith' : 'Crefyddol'}/herrschaft.data.mjs`}`], decisions: [...commonDecisions, ...decisions[c.id]] };
  await fs.writeFile(path.join(root, dir, 'source-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(JSON.stringify({ id: c.id, file: `${dir}/haus.content.mjs`, revision: c.biographySourceRevision, words: Object.values(c.biographySummary).join(' ').split(/\s+/).length, heads: c.heads.length, heirs: c.heirs.length, offices: c.offices.length }));
}
