// Editorial seed modules. Shared assembly is confined to this feature; existing
// newspaper publications, local staff and remote data remain their owners' data.
function buildNewspaperGuildModule(data) {
  const assetRoot = './public/assets/newspaper-guilds';
  const emblem = data.images?.emblem || `${assetRoot}/${data.asset}-emblem.png`;
  const iconRoot = '../IconOrdner/Organisationsicons';
  const paragraphs = items => items.map(text => `<p>${text}</p>`).join('');
  const role = ([title, text, icon = 'Administration']) => ({ title, text, subtitle: '', portrait: `${iconRoot}/${icon}.png` });
  const story = (title, scene, copy) => ({
    pageTitle: data.pageTitles?.[scene] || title,
    image: data.images?.[scene] || `${assetRoot}/${data.asset}-${scene}-v2.png?v=20260909-young-guilds-v3`,
    imageWidth: 38, imageFit: 'cover', imagePosition: 'top',
    description: paragraphs(copy), commentSequence: [], enableComments: true
  });
  return {
    id: `zeitungsgilde-${data.id}`, title: data.name,
    subtitle: `${data.reach} · ${data.tagline}`,
    type: 'Nachrichten- und Schreibergilde', category: `Gilden & Zünfte · ${data.reach}`,
    image: emblem, icon: '✒', stamp: 'NACHRICHTEN & SCHREIBER',
    multipage: true, appendCommentsPage: false, enablePageComments: false,
    pages: [
      story('I. — Stimme & Selbstverständnis', 'story', data.story),
      {
        pageTitle: 'II. — Die Gilde', guildPage: true, image: emblem,
        imageWidth: 28, imageSquare: true, imageFit: 'contain', imagePosition: 'center',
        stats: [['Wirkungsgebiet', data.reach], ['Hauptsitz', data.seat], ['Trägerschaft', data.patron],
          ['Publikationsform', data.publicationModel], ['Sprache', 'Gemeine Zunge'], ['Belegter Verkaufspreis', data.price]].filter(([, value]) => value),
        guild: {
          crestImage: emblem, portraitFormat: 'square', sideWidth: 100,
          biographyTitle: 'Auftrag & Selbstverständnis', biographyText: paragraphs(data.overview),
          abilitiesTitle: 'Mittel & Handschrift',
          abilities: data.traits.map(([title, detail, icon]) => ({ title, detail, icon: `${iconRoot}/${icon}.png` })),
          extraSections: [], historyTitle: 'Überlieferung & Entwicklung', historyText: paragraphs(data.history),
          worksTitle: 'Publikationen & Themen', works: data.topics,
          triviaTitle: 'Eigenheiten', trivia: data.trivia,
          connectionsTitle: 'Träger & Umfeld', connections: data.connections || [],
          contractsTitle: 'Verbindungen & Verpflichtungen', contracts: data.obligations.map(([title, text]) => ({ title, text, icon: '../IconOrdner/Brief.PNG', link: '' })),
          documentsTitle: 'Häuser & Arbeitsmittel', documents: data.property.map(([title, text]) => ({ title, text, icon: '../IconOrdner/ZunftsWappen/Schreiber.png', link: '' })),
          footer: data.tagline
        },
        commentSequence: []
      },
      {
        pageTitle: 'III. — Die Hauptleitung', hierarchyPage: true,
        hierarchy: {
          layoutMode: 'vertical', treeDisplayMode: 'tabs', cardFontScale: 100,
          portraitScale: 85, chartScale: 80, eyebrow: 'Gildenverfassung',
          subtitle: 'Ämter der übergeordneten Hauptleitung', centerLabel: data.name,
          emblem, sideImage: emblem, organizationTitle: data.name, motto: data.tagline,
          description: paragraphs(data.governance), detailsTitle: 'Zuständigkeit',
          details: [{ icon: '⌂', label: 'Hauptsitz', value: data.seat }, { icon: '✒', label: 'Auftrag', value: data.governanceRemit }],
          quoteLabel: '', quote: '', chartTitle: 'Hauptleitung & Meisterämter',
          chartIntro: 'Die Ämter sind nach ihrer Verantwortung von oben nach unten geordnet; gleichrangige Meisterämter stehen nebeneinander.',
          levels: [
            { label: 'Oberstes Amt', nodes: [role(data.head)] },
            { label: 'Gemeinsame Führung', nodes: [role(data.council)] },
            { label: 'Meisterämter der Hauptleitung', nodes: data.offices.map(role) }
          ],
          footerNote: data.governanceFooter
        }
      },
      {
        pageTitle: 'IV. — Häuser & Wege', organizationNetworkPage: true,
        organizationNetwork: {
          title: 'Häuser, Niederlassungen & Verbreitung', introduction: paragraphs(data.networkIntro),
          reach: data.reach, model: data.networkModel, note: data.networkNote,
          footer: data.networkFooter || 'Niederlassungen verbinden die Gilde mit dem Alltag ihrer Leser.',
          sites: data.sites.map(site => ({ ...site, image: site.image || emblem }))
        }
      },
      story('V. — Handwerk & Zunftleben', 'work', data.work)
    ]
  };
}

function registerNewspaperGuild(data) {
  const entry = buildNewspaperGuildModule(data);
  if (SECTIONS.some(section => section.entries?.some(existing => existing.id === entry.id))) return;
  const tab = 'Gilden & Zünfte';
  const category = 'Nachrichten und Schreibergilden';
  let section = SECTIONS.find(section => section.tab === tab && section.path?.length === 1 && section.path[0] === category);
  if (!section) {
    section = { key: category, tab, path: [category],
      iconUrl: '../IconOrdner/ReiterIcons/Weltpfade/gilden-zuenfte.png?v=20260909-pergament-v3',
      desc: 'Zeitungshäuser, Schreiberschulen und die Wege ihrer Nachrichten.', entries: [] };
    SECTIONS.push(section);
  }
  section.entries.push(entry);
}
