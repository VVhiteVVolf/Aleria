// Pure adapters: house lore is authored once, each existing UI keeps its own schema.
const paragraphs = value => Array.isArray(value) ? value.join('\n\n') : String(value || '');
const treeLink = (familyId, personId = '') => `../Stammb%C3%A4ume/Stammbaum.html?family=${encodeURIComponent(familyId)}&mode=view${personId ? `&person=${encodeURIComponent(personId)}` : ''}`;
const memberLink = entry => entry.id && entry.familyId ? treeLink(entry.familyId, entry.id) : '';
const pageLink = content => `../Familien%20H%C3%A4user%20und%20Clans/${content.page || 'haus.html'}?haus=${encodeURIComponent(content.id)}`;
const biographyImage = source => !source ? '' : source.startsWith('../') ? source : `../Familien Häuser und Clans/${source}`;

export function createHousePageData(content) {
  const images = {
    'haus-wappen': { src: content.images.crest, alt: `Wappen von ${content.name}`, format: 'square' },
    'haus-hauptbild': { src: content.images.scene, alt: content.images.sceneAlt || `Ritter von ${content.name}`, format: 'portrait', maxHeight: 580, ...(!content.images.scene ? { emptyLabel: 'Illustration folgt …' } : {}) },
    'haus-banner': { src: content.images.banner, href: content.territoryHref || '', alt: `Herrschaftsbanner von ${content.territoryName || content.county || content.profile.seat}`, format: 'square' },
  };
  const card = (entry, key) => {
    const href = memberLink(entry);
    const src = entry.image || content.placeholders?.[entry.silhouette];
    if (src) images[key] = { src, href, alt: entry.name || `Silhouette · ${entry.role} nicht benannt`, format: 'portrait' };
    return { name: entry.name || 'Nicht benannt', role: entry.role || '', detail: entry.detail || '', href, imageKey: src ? key : '' };
  };
  const groups = [
    { id: 'founder', title: content.founderTitle || 'Gründer', entries: [Object.hasOwn(content, 'founder') ? content.founder : content.heads[0]].filter(Boolean) },
    { id: 'heads', title: `Oberhauptfolge · ${content.name}`, note: content.headsNote || 'Überlieferte Amtszeiten; unbekannte Zeiträume bleiben offen.', entries: content.heads },
    { id: 'heirs', title: content.extinct ? 'Ehemalige Erbfolge · Haus ausgestorben' : 'Erbfolge', entries: content.heirs },
    { id: 'offices', title: content.extinct ? 'Historische Hofämter' : 'Hofämter', entries: content.offices },
  ].filter(group => group.entries.length).map(group => ({ ...group, entries: group.entries.map((entry, i) => card(entry, `hof-${group.id}-${i + 1}`)) }));
  const cadets = content.cadets.map(entry => {
    const imageKey = `kadetten-${entry.id}`;
    images[imageKey] = { src: entry.image, alt: `Wappen von ${entry.name}`, format: 'square', href: treeLink(entry.id) };
    return { name: entry.name, href: treeLink(entry.id), imageKey };
  });
  const figures = content.figures.map((entry, i) => {
    const imageKey = `haus-figur-${i + 1}`;
    card(entry, imageKey);
    return { group: content.figuresTitle, role: entry.role, name: entry.name, description: entry.description, imageKey };
  });
  return {
    meta: { id: content.id, title: `${content.name} – Aleria`, type: content.type, status: 'Active', template: content.page === 'kleinehaeuser.html' ? 'kleinehaeuser' : 'haus', storage: { document: content.id } },
    name: content.name, hierarchy: content.hierarchy, layout: 'responsive',
    classification: { category: 'Familien Häuser und Clans', houseType: content.type, scale: content.profile.houseType, parentHouseId: content.parentHouseId || '', rootHouseId: content.parentHouseId || content.id, territoryId: content.territoryId },
    profile: content.profile,
    profileLabels: { tiarna: 'Ritter', kerns: 'Knechte' },
    showMotto: content.showMotto,
    sections: Object.fromEntries(Object.entries(content.sections).map(([key, value]) => [key, paragraphs(value)])),
    sectionTitles: { knighthood: content.type === 'Clan' ? '4. Tiarnatum' : '4. Rittertum' },
    ...(content.scenes?.length ? { scenes: content.scenes } : {}),
    images, court: { groups, cadets },
    figures: { heading: content.page === 'kleinehaeuser.html' ? '11. Historische Figuren' : '12. Historische Figuren', tableTitle: content.figuresTitle, entries: figures },
    familyTreeEmbed: { src: treeLink(content.id), title: `Stammbaum von ${content.name}` },
    trivia: content.trivia,
  };
}

export function createHouseBiography(content) {
  const profile = content.profile;
  const summary = content.biographySummary;
  return {
    schema: 'aleria.house-module', schemaVersion: 1,
    pageTitle: content.name, housePage: true,
    image: biographyImage(content.images.scene), imageWidth: 30, imageSquare: true,
    description: summary.overview, quote: content.showMotto ? profile.motto : '', quoteBy: '', commentSequence: [],
    stats: [
      ['Voller Name', content.name], ['Rang', profile.highestTitle], ['Stammsitz', profile.seat],
      ['Grafschaft', content.county], [content.extinct ? 'Letztes Oberhaupt' : 'Oberhaupt', content.currentHead ?? content.heads.at(-1)?.name ?? ''],
      ...(content.extinct ? [['Status', content.extinctionText || 'Ausgestorben · Zeitpunkt offen']] : [['Erbe', content.firstHeir ?? content.heirs[0]?.name ?? '']]), ['Lehnsherr', content.liege],
      ['Ursprung', profile.origin], ['Schutzpatronin', profile.patronDeities],
    ],
    house: {
      crestImage: biographyImage(content.images.crest), sideWidth: 100,
      connectionPortraitHeight: 80, connectionTextOffset: 0,
      biographyTitle: content.biographyIntroTitle, biographyText: summary.overview,
      abilitiesTitle: 'Einfluss und Aufgaben',
      abilities: [],
      historyTitle: content.biographyHistoryTitle, historyText: summary.history,
      worksTitle: 'Hausgeschichte', works: [],
      extraSections: [
        { position: 'afterWorks', mode: 'text', title: 'Werte und Stellung', text: summary.character },
      ],
      triviaTitle: 'Besonderheiten', trivia: [],
      quotesTitle: 'Hausmotto', quotes: [],
      connectionsTitle: 'Verbündete und Kadettenhäuser',
      connections: [
        ...content.allies.map(entry => ({ ...entry, image: biographyImage(entry.image) })),
        ...content.cadets.map(entry => ({ name: entry.name, detail: `Kadettenhaus von ${content.name}`, image: biographyImage(entry.image), imageFormat: 'square' })),
      ],
      documentsTitle: 'Mehr über das Haus',
      documents: [
        { icon: biographyImage(content.images.crest), title: `${content.name} · vollständige Hausseite`, text: content.prepared ? 'Wappen und bisher bekannte Angaben. Weitere Inhalte folgen.' : 'Chronik, Besitz, Wappen und Hof mit verlinkten Portraits.', link: pageLink(content) },
      ],
      footer: '',
    },
  };
}
