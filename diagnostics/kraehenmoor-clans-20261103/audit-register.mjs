import fs from 'node:fs/promises';
import vm from 'node:vm';
import crypto from 'node:crypto';

const root = new URL('../../', import.meta.url);
const at = relative => new URL(relative, root);
const read = async relative => JSON.parse(await fs.readFile(at(relative), 'utf8'));
const exists = async relative => fs.access(at(relative)).then(() => true, () => false);
const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const diag = 'diagnostics/kraehenmoor-clans-20261103/';
const baseline = await read(`${diag}baseline.json`);
const attachments = await read(`${diag}attachments.json`);
const reviewed = await read(`${diag}source-content.json`);
const sourceById = new Map(reviewed.houses.map(source => [source.id, source]));
const gallery = await read('Gallerien/krieger/data/catalog.json');
const context = vm.createContext({ window: {} });
vm.runInContext(await fs.readFile(at('Familien H\u00e4user und Clans/haeuser.registry.js'), 'utf8'), context);
const pages = context.window.HAEUSER_REGISTRY;
const safe = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '');
const isExtinct = record => record.folderPath.includes('Ausgestorbene Clans');
const searchIds = baseline.filter(record => !sourceById.has(record.id)).map(record => record.id);
const imagePattern = new RegExp(searchIds.map(id => id.replace(/^haus-/, '')).concat('brandstolz').join('|'), 'i');
const localCandidates = [];
async function imagesIn(relative) {
  for (const entry of await fs.readdir(at(relative), { withFileTypes: true }).catch(() => [])) {
    const target = `${relative}/${entry.name}`;
    if (entry.isDirectory()) await imagesIn(target);
    else if (/\.(png|jpe?g|webp|gif)$/i.test(entry.name) && imagePattern.test(target)) localCandidates.push(target);
  }
}
for (const directory of ['Stammb\u00e4ume/assets/images', 'Familien H\u00e4user und Clans/Estryll',
  'Gallerien', 'AleriaAlmanach/AvatarWerkstatt']) await imagesIn(directory);

const motifNotes = {
  schwarzstolz: 'Dunkles Meergruen und Schwarz, zurueckhaltendes Krakenmotiv. Anonymer Huskarl aus der Kuestenregion; Sindres Narbe und Augenklappe sind keine allgemeinen Clanmerkmale.',
  goldschwur: 'Schwarz, Weiss und Gold; dekorativer goldener Spiralknoten. Schlichte Huskarlruestung, keine aus dem Motiv abgeleitete Berufsgeschichte.',
  goldhand: 'Dunkles Gruen und Gold; kleines kreuzfoermiges Beschlagmotiv. Huskarl bei Varangr in Moortal.',
  guldskar: 'Schwarz und Gold; geometrische Waagenornamentik nur als Wappenmotiv. Kein unbelegtes Richteramt.',
  aurangr: 'Dunkles Petrol und Gold; dezentes Hirschmotiv. Keine unbelegte Jagdtradition.',
  fenngrim: 'Sumpfgruen, Gold und Braun; funktionale Huskarlkleidung fuer das feuchte Nebelmoor. Keine aus dem Bild abgeleitete Heiler- oder Todestradition.',
  brackwasser: 'Sumpfgruen und Gold; praktische Stiefel und wetterfester Umhang fuer Nebelmoor. Keine unbelegte Faehrmann- oder Fischerrolle.',
  sumpfgeborener: 'Dunkles Gruen und mattes Gold; kleine Knochen-/Pfeilbeschlaege. Kein aus der Heraldik abgeleiteter Beruf.',
  helmyr: 'Moosgruen, Braun und Gold; dezente Baumornamentik und wetterfeste Kleidung. Keine unbelegte Wald- oder Totenkultgeschichte.',
  taufwolf: 'Dunkles Gruen und Gold; zurueckhaltendes Wolfsprofil als Motiv. Keine erfundene Tierverbindung.',
  myrskarn: 'Dunkles Pflaumenviolett und Gold; kleine Schneckenornamente. Huskarl in Moortal, kein erfundener Schneckenhandel.',
  goldzunge: 'Aktuelles Wappen ist ein schmuckloses rundes Holzfeld. Schlichte buergerliche Alltagskleidung aus Moortal; keine erfundene Berufsrolle, keine Adelsinsignien.'
};
const records = [];
for (const previous of baseline) {
  const source = sourceById.get(previous.id);
  const single = `Stammb\u00e4ume/assets/js/data/house-${previous.id.slice(5)}-family.js`;
  const sourceModules = [await exists(single) ? single : 'Stammb\u00e4ume/assets/js/data/kraehenmoor-house-families.js',
    'Stammb\u00e4ume/assets/js/data/kraehenmoor-house-profiles.js'];
  if (previous.id === 'haus-varangr') sourceModules.push('Stammb\u00e4ume/assets/js/data/aldrimar-house-profiles.js');
  const suppliedOriginal = !!source && previous.id !== 'haus-jaernblod';
  const needsNewIllustration = !suppliedOriginal;
  const ref = `Stammb\u00e4ume/assets/images/references/${previous.id}/krieger.png`;
  const crest = `Stammb\u00e4ume/${previous.graph.houses[0]?.emblem || ''}`;
  const portraitPaths = [...new Set(previous.graph.persons.map(person => person.portrait).filter(Boolean))];
  const missingPortraits = [];
  for (const portrait of portraitPaths) if (!(await exists(`Stammb\u00e4ume/${portrait}`))) missingPortraits.push(portrait);
  const idPattern = new RegExp(`${previous.id.slice(5)}|${previous.id === 'haus-schwarzstolz' ? 'brandstolz' : previous.id.slice(5)}`, 'i');
  const page = pages.find(entry => entry.id === previous.id) || null;
  const house = gallery.houses.find(entry => entry.id === previous.id);
  const originalExists = await exists(ref);
  const explicitHeirs = previous.graph.persons.filter(person => /^(?:Erster|Zweiter|Dritter) Erbe\b/.test(person.title || ''));
  const explicitCurrentHeads = previous.graph.persons.filter(person => /\bseit\s+\d{4}/.test(person.title || '')
    && /Jarl|Thane|Hesir/.test(person.title || '') && person.status !== 'dead');
  records.push({
    id: previous.id, title: previous.title, rankId: previous.profile.rankId,
    seat: previous.profile.seat, secondarySeats: previous.profile.secondarySeats || [],
    folderPath: previous.folderPath, profile: previous.profile, description: previous.description,
    sourceRevision: previous.sourceRevision, extinct: isExtinct(previous), sourceModules,
    attachment: source ? { slug: source.slug, attachmentId: source.source.attachmentId,
      sourceArchive: source.source.archive, sha256: source.source.sha256 } : null,
    houseBiography: { present: !!previous.biography, image: previous.biography?.image || '' },
    housePage: { registered: !!page, entry: page,
      plannedContentPath: `Familien H\u00e4user und Clans/Estryll/Aldrimar/Kraehenmoor/${previous.folderPath.slice(2).map(safe).join('/')}/${safe(previous.title)}/haus.content.mjs` },
    images: { crest, crestExists: await exists(crest), expectedOriginalPath: suppliedOriginal ? ref : null,
      localOriginalExists: originalExists, localOriginalSha256: originalExists ? digest(await fs.readFile(at(ref))) : null,
      portraitCount: portraitPaths.length, localPortraitCount: portraitPaths.length - missingPortraits.length,
      missingPortraits, candidateFiles: localCandidates.filter(file => idPattern.test(file)),
      needsNewIllustration,
      illustrationRecommendation: needsNewIllustration ? (motifNotes[previous.id.slice(5)]
        || 'Historischer Norrnaigh-Thane. Aktuelles J\u00e4rnblod-Wappen als Motivgrundlage; keine vorhandene Originalfigur in der gelieferten Vorlage.') : null },
    gallery: { registered: !!house, illustrationIds: house?.illustrationIds || [] },
    explicitLeadershipEvidence: { headsWithCurrentTitle: explicitCurrentHeads.map(({ id, name, title }) => ({ id, name, title })),
      rankedHeirs: explicitHeirs.map(({ id, name, title }) => ({ id, name, title })),
      note: 'Nur explizite Titel und redaktionell belegte Quellen verwenden; Personenreihenfolge, Alter und lineageRole=head allein begruenden kein amtierendes Oberhaupt.' },
    safeguards: [
      ...(isExtinct(previous) ? ['Kulturordner sind keine Sitze; heutiges Oberhaupt und aktuelle Erben bleiben leer.'] : []),
      ...(['haus-hjerte', 'haus-jaernblod'].includes(previous.id) ? ['Historischer Thane-Rang bleibt erhalten.'] : []),
      ...(previous.id === 'haus-schwarzstolz' ? ['Sindre Brandstolz ist der bekannte Bastard und Bootsmann; kein Clanoberhaupt. Sein Personportrait ist keine freigestellte Ganzkoerper-Clandarstellung.', 'Aeltere Notizen nennen Rang offen; aktueller Hausprofilrang huskarl hat Vorrang. Lehnsherr bleibt unbekannt.', 'Sindre Schwarzblut ist eine andere Person. Keine unbenannten Eltern oder Halbbrueder anlegen.'] : []),
      ...(previous.id === 'haus-goldzunge' ? ['Buergerlicher Clan; kein Huskarlrang und kein aus dem Namen abgeleiteter Beruf.'] : []),
      ...(!source && previous.id !== 'haus-schwarzstolz' ? ['Platzhaltergruender mit Namen ??? sind keine ausformulierten historischen Personen und erhalten keine Personenkarte.'] : [])
    ]
  });
}
const rankCounts = Object.fromEntries([...new Set(records.map(record => record.rankId))].map(rank => [rank, records.filter(record => record.rankId === rank).length]));
const audit = {
  schema: 'aleria.kraehenmoor-registry-house-audit', schemaVersion: 1,
  reviewedAt: new Date().toISOString(), publicOnly: true,
  scope: { kingdom: 'Aldrimar', county: 'Kr\u00e4henmoor', mainSeat: 'Moortal', baseline: `${diag}baseline.json` },
  summary: { families: records.length, activeFamilies: records.filter(record => !record.extinct).length,
    extinctClans: records.filter(record => record.extinct).length, rankCounts,
    suppliedAttachments: attachments.length, suppliedOriginalIllustrations: 13,
    additionalFamiliesWithoutTemplate: records.filter(record => !record.attachment).length,
    newIllustrationsRequired: records.filter(record => record.images.needsNewIllustration).length,
    initialHousePages: records.filter(record => record.housePage.registered).length,
    initialHouseBiographies: records.filter(record => record.houseBiography.present).length,
    initialFamiliesWithGalleryIllustration: records.filter(record => record.gallery.illustrationIds.length).length },
  findings: [
    'Vollstaendiger oeffentlicher Ortsbestand: 26 Akten, darunter Schwarzstolz, zehn weitere Huskarle und der buergerliche Clan Goldzunge.',
    'Vierzehn gelieferte Vorlagen decken die neun grossen lebenden und fuenf historischen Clans ab; darin liegen dreizehn Originalfiguren. J\u00e4rnblod hat kein mitgeliefertes Originalbild. Zusammen mit den zwoelf zusaetzlichen Familien sind dreizehn echte Bildluecken zu ergaenzen.',
    'Lokale Bildsuche in Stammbauembildern, fachlichen Hausordnern, Galerie und AvatarWerkstatt ergab fuer die zwoelf Zusatzhaeuser nur Wappen und Personenportraits beziehungsweise Reaktionsavatare, keine vorhandenen passenden Ganzkoerperdarstellungen.',
    'Sindres Originalportrait wurde visuell angesehen: Animefigur mit Schiffshintergrund, Ausschnitt bis zum Oberschenkel. Als Personenportrait erhalten, nicht als freigestellte Clankriegerfigur einstufen.',
    'Kraehenmoor bleibt von Schwarzfenn/Wolfsklamm getrennt. Kummerherz ist nur Hjerte-Nachfolger in Schwarzfenn, kein weiterer Kraehenmoor-Clan.',
    'Jarnblod/Morfhia/Corcaigh sind Vorlagenslugs; technische IDs bleiben haus-jaernblod, haus-mac-morfhia und haus-mac-corcaigh.',
    'Keine alten Stammbaumtabellen, Truppenstatistiken oder privaten Dossiers wurden fuer diesen Audit ausgewertet.'
  ],
  imageSearch: { searchedPublicDirectories: ['Stammb\u00e4ume/assets/images', 'Familien H\u00e4user und Clans/Estryll', 'Gallerien', 'AleriaAlmanach/AvatarWerkstatt'],
    additionalCrestContactSheet: `${diag}additional-crests.jpg`,
    visuallyInspectedPersonPortrait: 'Stammb\u00e4ume/assets/images/portraits/haus-schwarzstolz/sindre-brandstolz.png' },
  missingIllustrations: records.filter(record => record.images.needsNewIllustration).map(record => ({ id: record.id,
    title: record.title, rankId: record.rankId, seat: record.seat, crest: record.images.crest,
    recommendation: record.images.illustrationRecommendation })), records
};
await fs.writeFile(at(`${diag}registry-audit.json`), JSON.stringify(audit, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify(audit.summary));
