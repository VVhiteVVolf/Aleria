// Einmalige Übernahme. Spätere Redaktion erfolgt direkt in haus.content.mjs.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { HOUSE_EDITORIAL } from './house-editorial.mjs';

const work = 'diagnostics/vortigerns-house-refresh-2026-10-24';
const feature = 'Familien Häuser und Clans';
const version = '20261024-vortigerns-v1';
const paths = JSON.parse(readFileSync(`${work}/house-paths.json`, 'utf8'));
const previous = JSON.parse(readFileSync(`${work}/previous-defaults.json`, 'utf8'));
const legacy = JSON.parse(readFileSync(`${work}/legacy-sections.json`, 'utf8'));
const originals = JSON.parse(readFileSync(`${work}/source-audit.json`, 'utf8'));
const records = FAMILY_REGISTRY.filter(record => record.folderPath.includes('Vortigerns Ruh'));
const slug = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
const imageFromTree = source => source ? `../Stammbäume/${source}` : '';
const relativeImage = source => path.relative(feature, source).replaceAll('\\', '/');
const rankLabels = { royal: 'König', barony: 'Baron', 'knight-prince': 'Ritterfürst', knight: 'Ritterherr', commoner: 'Bürgerlich', 'dun-tiarna': 'Dún-Tiarna' };
const heirIds = {
  'haus-ceirwyn': ['meiron-ceirwyn'], 'haus-cath': ['taran-cath', 'rhain-cath'],
  'haus-grael': ['caswallon-grael', 'gwalchmei-grael', 'medrawd-grael'],
  'haus-penderyn': ['aneurin-penderyn', 'rhon-penderyn', 'dwnn-penderyn'],
  'haus-dienyddiwr': ['robyn-dienyddiwr', 'arawn-dienyddiwr'],
  'haus-dyngwn': ['gwlgawd-dyngwn', 'garith-dyngwn', 'derwyn-dyngwn', 'hael-1722-dyngwn'],
  'haus-marwolaeth': ['peredur-geoffrey-marwolaeth']
};
const courtHeads = { 'haus-cath': ['kibddar-cath', 'arawn-cath', 'floyd-cath', 'drystan-cath', 'blegwyrd-cath'] };
const founderIds = { 'haus-pendrag': ['vortigern-pendrag'], 'haus-ceirwyn': ['ceirwyn-inlaw', 'rhoslyn-pendrag'],
  'haus-cath': ['kibddar-cath', 'siriol-cath'], 'haus-grael': ['trystan-pendrag'],
  'haus-penderyn': ['islwyn-penderyn'], 'haus-dienyddiwr': ['taredd-dienyddiwr'],
  'haus-dyngwn': ['kynwas-schwertarm-dyngwn'], 'haus-marwolaeth': ['uryen-marwolaeth'] };

function person(record, id) {
  const value = record.family.persons.find(person => person.id === id);
  if (!value) throw Error(`${record.id}: Personenverknüpfung fehlt: ${id}`);
  return value;
}
function card(record, member, role = '') {
  return { id: member.id, familyId: record.id, name: member.name, role: role || member.title || 'Familienmitglied',
    image: imageFromTree(member.portrait), silhouette: member.gender === 'female' ? 'female' : 'male',
    detail: [member.title, member.status === 'dead' ? 'Verstorben' : ''].filter(Boolean).join(' · ') };
}
function cleanParagraph(text) {
  return text.replace(/\bGreal\b/g, 'Grael').replace(/\bAvalon\b/g, 'Avallorn')
    .replaceAll('Dame des Sees', 'Dame der See').replace(/\s+([,.;:!?])/g, '$1')
    .replaceAll('disen', 'diesen').replaceAll('unter amderen', 'unter anderem')
    .replaceAll('mti dem', 'mit dem').replaceAll('einer adeligen', 'einer Adligen')
    .replaceAll('benachbartem Fürstentum', 'benachbarten Fürstentum')
    .replaceAll('In einer Zeit als ein späterer Prinz des Königshauses starb', 'Als ein Prinz des Königshauses starb')
    .replaceAll('Geist des verstorbenen', 'Geist des Verstorbenen')
    .replaceAll('diesen mit seinem Leben beschützte und unter anderem seinen rechten Arm für diesen opferte', 'diesen unter Einsatz seines Lebens beschützte und dabei seinen rechten Arm verlor')
    .replace(/„\s+/g, '„').replace(/\s+“/g, '“').trim();
}
function section(source, number, fallback) {
  const paragraphs = source?.sections[number]?.map(cleanParagraph).filter(Boolean) || [];
  return paragraphs.length ? paragraphs : fallback;
}

const audit = [];
for (const record of records) {
  const id = record.id;
  const source = legacy.find(source => source.id === id);
  const original = originals.find(source => source.id === id);
  const profile = record.houseProfile;
  const commoner = profile.rankId === 'commoner';
  const ancient = id === 'haus-fiachraoin';
  const type = ancient ? 'Clan' : commoner ? 'Bürgerliches Haus' : profile.rankId === 'royal' ? 'Königshaus' : profile.rankId === 'barony' ? 'Baronenhaus' : 'Ritterhaus';
  const prepared = !HOUSE_EDITORIAL[id] || ancient;
  const unknownSummary = {
    overview: `${record.title} ist als ${commoner ? 'Bürgerhaus' : 'niederes Ritterhaus'} in Mathragon, Tanwens Flamme, verzeichnet. Die Familie gehört zu Vortigerns Ruh; ihre bestehende Zuordnung nennt Haus Pendrag als Lehnsherrn.`,
    history: 'Ein Gründungsjahr, eine ausgearbeitete Hauschronik und namentlich bekannte frühe Oberhäupter sind bisher nicht überliefert.',
    character: commoner
      ? 'Ein bestimmter Familienberuf, ein eigener Betrieb und besondere Hausbräuche sind bislang nicht festgelegt. Das vorhandene Familienzeichen verbindet einen goldenen Hirsch mit einem Krug auf Grün.'
      : 'Das Hauswappen und der Ritterstand sind belegt. Besondere Taten, eigene Hausbräuche und ein verbindlicher Leitspruch sind bisher nicht ausgearbeitet.',
    relations: 'Weitere familiäre Verbindungen, Bündnisse und Fehden sind noch nicht beschrieben.'
  };
  const summary = HOUSE_EDITORIAL[id] || unknownSummary;
  const headPeople = courtHeads[id] ? courtHeads[id].map(id => person(record, id)) : record.family.persons.filter(person => person.lineageRole === 'head');
  const heads = headPeople.map(member => card(record, member, rankLabels[profile.rankId]));
  const heirs = (heirIds[id] || []).map(id => card(record, person(record, id)));
  const founders = (founderIds[id] || []).map(id => person(record, id));
  const current = headPeople.filter(person => person.status === 'alive');
  const currentHead = current.map(person => person.name).join(' und ') || (ancient ? '' : 'Nicht sicher überliefert');
  const image = original?.image || `${paths[id]}/assets/hausdarstellung-2026-10-24.png`;
  const sections = {
    overview: section(source, 1, summary.overview), history: section(source, 2, summary.history),
    traditions: section(source, 3, summary.customs || 'Besondere Hausbräuche sind bislang nicht überliefert.'),
    knighthood: section(source, 4, commoner ? 'Die Familie gehört zum bürgerlichen Stand. Ein bestimmtes Familienhandwerk ist bislang nicht belegt.' : 'Das Haus ist dem cenyrischen Ritterstand zugeordnet. Eine eigene ausgearbeitete Rüstungstradition ist bislang nicht überliefert.'),
    holdings: section(source, 5, summary.holdings || 'Eigene Ländereien und Betriebe sind bislang nicht näher beschrieben.'),
    cultureReligion: section(source, 6, summary.culture || 'Eine besondere religiöse Überlieferung der Familie ist bisher nicht ausgearbeitet.'),
    conflictsAlliances: section(source, 7, summary.relations || 'Konkrete Fehden oder weitere Bündnisse sind bislang nicht beschrieben.'),
    values: section(source, 8, summary.character),
    succession: id === 'haus-marwolaeth'
      ? 'Peredur Geoffrey wurde legitimiert; seine Stellung in der Nachfolge ist umstritten. Eine abschließende Entscheidung ist nicht überliefert.'
      : ancient ? 'Der Clan ist erloschen. Eine frühere namentliche Erbfolge ist nicht überliefert.'
      : heirs.length ? 'Die überlieferte Erbfolge ist im Hofbereich mit den vorhandenen Personen verknüpft. Sie ersetzt keine noch unbekannte Amtsübergabe.'
      : 'Eine namentlich gesicherte künftige Nachfolge ist bislang nicht überliefert.',
    court: heads.length ? 'Die folgenden Persönlichkeiten gehören zur überlieferten Amts- und Familiengeschichte. Unbekannte Amtszeiten bleiben offen.' : 'Namentliche Oberhäupter und eine ausgearbeitete Amtsfolge sind bisher nicht überliefert.',
    familyTree: 'Die vorhandene Familienakte ist hier eingebettet. Das Hauswappen im Stammbaum öffnet die Hausbiografie.',
    historicalFigures: founders.length ? 'Diese Persönlichkeiten prägten die überlieferte Geschichte des Hauses.' : 'Historische Persönlichkeiten sind bisher nicht namentlich ausgearbeitet.'
  };
  // Retain house-specific content while removing copied theology and misleading certainty.
  if (id === 'haus-marwolaeth') {
    sections.conflictsAlliances = [
      'Morwenna, Griffiths älteste Tochter, erlitt während des Großen Krieges ein Verbrechen. Ihr daraus geborener Sohn Peredur Geoffrey wurde nachträglich legitimiert. Innerhalb des Hauses bleibt umstritten, ob er die Nachfolge antreten soll.',
      'Die Auseinandersetzung berührt den eigenen Anspruch der Marwolaeth auf Mitgefühl und Barmherzigkeit. Gegner seiner Nachfolge berufen sich auf Herkunft und traditionelle Erwartungen, während Befürworter seine Legitimierung anerkennen. Eine abschließende Regelung ist nicht überliefert. Morwennas fehlende Ehe wird nicht als Verfehlung behandelt.'
    ];
    sections.cultureReligion = [summary.culture, 'In der Hausfrömmigkeit steht der Hüter für den würdigen Umgang mit Sterblichkeit, Verlust und Trauer. Die besondere Deutung der Dame der See gehört zur Überlieferung der Familie.'];
    sections.knighthood = [
      'Die Ritter der Marwolaeth verstehen ihren Dienst als Schutz der Schwachen und als Ausdruck ihres Glaubens. Erdige Stoffe, gedämpfte Metalltöne und eine zurückhaltende Erscheinung entsprechen ihrem Ideal der Demut.',
      'Das Zeichen des Hüters erinnert an Uryens geistlichen Dienst. Auch gerüstet soll ein Marwolaeth Demut, Bescheidenheit und den Schutz anderer verkörpern.'
    ];
  }
  if (id === 'haus-grael') {
    sections.history = section(source, 2, summary.history).map(text => text.replace('aktuell nur drei Sprösslinge', 'eine begrenzte Zahl an Nachkommen'));
    sections.knighthood = section(source, 4, '').map(text => text.replace('Die Mehrheit der Grael-Ritter hingegen sind reguläre Ritter und Knechte, die auf herkömmliche Weise ausgebildet werden und die traditionellen Werte des Hauses in Kampf und Anstand widerspiegeln.', 'Zum Gefolge gehören auch nichtmagische Ritter und Knechte. Ihre Ausbildung folgt den traditionellen Kampf- und Verhaltensidealen des Hauses.'));
  }
  if (id === 'haus-dyngwn') sections.court += ' Morgan ist trotz unbekannten Todesjahrs als verstorben belegt; ein späteres amtierendes Oberhaupt ist offen.';
  if (id === 'haus-penderyn') sections.court += ' Dadweirs Amtsende ist widersprüchlich überliefert. Sein belegtes Todesjahr 1678 wird nicht durch die alte Angabe 1681 ersetzt.';
  if (id === 'haus-cath') sections.court += ' Die heutige Leiterin des geheimen Nachrichtennetzes ist nicht namentlich benannt.';
  if (ancient) {
    sections.overview = summary.overview; sections.history = summary.history;
    sections.knighthood = [summary.culture, 'Der überlieferte Tiarnatum-Abschnitt ordnet den Clan in die albenzeitliche Kriegerkultur ein. Allgemeine Aussagen über Kriege und Heeresorganisation sind keine eigene, namentlich belegte Clanchronik.'];
    sections.court = 'Der Clan ist erloschen. Gründer, frühere Oberhäupter und ein Zeitpunkt des Erlöschens sind nicht namentlich beziehungsweise zeitlich überliefert.';
  }
  const content = {
    id, name: record.title, type, page: prepared || id === 'haus-pengair' ? 'kleinehaeuser.html' : 'haus.html',
    county: 'Vortigerns Ruh', liege: profile.liegeHouseName || '', territoryId: 'vortigerns-ruh', territoryName: 'Vortigerns Ruh',
    territoryHref: '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Vortigerns Ruh/Grafschaft Vortigerns Ruh.html',
    parentHouseId: id === 'haus-grael' ? 'haus-pendrag' : '', extinct: ancient,
    showMotto: !!record.family.document.motto, registerPage: true, prepared,
    contentVersion: version, biographySourceRevision: previous[id].sourceRevision + 1,
    biographyPreviousDefaultFingerprints: [previous[id].fingerprint].filter(Boolean),
    biographyIntroTitle: ancient ? 'Über den Clan' : 'Über das Haus', biographyHistoryTitle: ancient ? 'Historische Überlieferung' : 'Geschichte des Hauses', biographySummary: summary,
    placeholders: { male: '../Stammbäume/assets/images/placeholders/male.png', female: '../Stammbäume/assets/images/placeholders/female.png' },
    allies: [], hierarchy: [{ type: 'Sammlung', name: feature, slug: 'familien-hauser-und-clans' },
      ...record.folderPath.map((name, index) => ({ type: ['Königreich', 'Grafschaft', 'Region', 'Sitz'][index], name, slug: slug(name) })),
      { type: ancient ? 'Clan' : 'Haus', name: record.title, slug: id }],
    profile: {
      highestTitle: rankLabels[profile.rankId], rank: rankLabels[profile.rankId], houseType: type,
      motto: record.family.document.motto || '', quoteAuthor: '', seat: profile.seat, affiliation: 'Vortigerns Ruh', liege: profile.liegeHouseName || '',
      troopStrength: '', tiarna: '', kerns: '', fleet: '', founding: '',
      milestoneOne: '', milestoneTwo: '', patron: '', knightingPatron: '',
      people: ancient ? 'Crannath-Alben' : source ? 'Cenyri' : '', wealth: '', religion: '', patronDeities: '',
      origin: id === 'haus-grael' ? 'Haus Pendrag' : '', cadetBranches: '', allies: '', enemies: ''
    },
    omitMilitaryProfile: true, sections,
    images: { crest: imageFromTree(record.family.document.emblem), scene: relativeImage(image),
      sceneAlt: `${original ? 'Überlieferte' : commoner ? 'Bürgerliche' : 'Ritterliche'} Hausdarstellung · ${record.title}`,
      banner: '../Stammbäume/assets/images/regions/vortigerns-ruh.png' },
    illustrationCategory: commoner ? 'Bürgerliche Hausdarstellung' : ancient ? 'Antike Kriegerdarstellung' : 'Hausdarstellung',
    cadets: [], founder: founders[0] ? card(record, founders[0], 'Gründer') : null, heads, heirs, offices: [],
    figuresTitle: ancient ? 'Historische Figuren des Clans' : 'Historische Persönlichkeiten des Hauses',
    figures: founders.map(member => ({ ...card(record, member), description: member.notes || member.title || 'Begründer des Hauses.' })),
    trivia: id === 'haus-ceirwyn' ? ['Macht in der Stimme, Stärke im Schwert, Ehre im Herzen.'] : [],
    currentHead, firstHeir: id === 'haus-marwolaeth' ? 'Peredur Geoffrey Marwolaeth · umstritten' : heirs[0]?.name || ''
  };
  if (id === 'haus-marwolaeth') Object.assign(content.profile, { religion: 'Alerische Kirche', patronDeities: 'Der Hüter; Dame der See' });
  if (id === 'haus-ceirwyn') Object.assign(content.profile, { religion: 'Alerische Kirche', patronDeities: 'Die Maid; Dame der See' });
  if (id === 'haus-grael') content.allies.push({ name: 'Haus Pendrag', detail: 'Königliches Ursprungshaus', image: imageFromTree(records.find(record => record.id === 'haus-pendrag').family.document.emblem), imageFormat: 'square' });
  if (id === 'haus-grael') content.figures.push({ name: 'Ysgithyrwyn', role: 'Magier der Hausüberlieferung', silhouette: 'male', description: 'Als Nachkomme Trystans und bedeutender Magier in der Hausgeschichte genannt. Seine Fähigkeiten und sein Wissen trugen zum weitreichenden Ruf der Grael bei. Eine eindeutige Personenakte ist bisher nicht zugeordnet.' });
  if (id === 'haus-pendrag') content.cadets.push({ id: 'haus-grael', name: 'Haus Grael O’Mathragon', image: imageFromTree(records.find(record => record.id === 'haus-grael').family.document.emblem) });
  if (commoner) { content.headsTitle = 'Familie und Haushalt'; content.officesTitle = 'Angehörige und Aufgaben'; }
  mkdirSync(`${paths[id]}/assets`, { recursive: true });
  const file = `${paths[id]}/haus.content.mjs`;
  writeFileSync(file, '// Redaktionelle Quelle für Hausseite und Stammbaum-Bio.\n// Quellenabgleich: diagnostics/vortigerns-house-refresh-2026-10-24/README.md.\nexport const HOUSE_CONTENT = ' + JSON.stringify(content, null, 2) + ';\n');
  audit.push({ id, file, prepared, sourceRevision: content.biographySourceRevision, originalImage: !!original, image });
}
writeFileSync(`${work}/refresh-audit.json`, JSON.stringify(audit, null, 2) + '\n');
console.log(`${audit.length} Hausquellen vorbereitet; ${audit.filter(record => record.originalImage).length} Originaldarstellungen übernommen.`);
