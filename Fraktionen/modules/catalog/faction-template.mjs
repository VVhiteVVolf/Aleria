import { buildFactionHierarchy } from './faction-hierarchy.mjs';

const h = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const categoryIcon = category => `assets/categories/${category.id}.webp`;
const entryAnchor = (entry, label = entry.name) => `<a href="#fraktion-${h(entry.id)}" data-action="show-faction" data-entry-target="${h(entry.id)}">${h(label)}</a>`;

function renderAffiliations(entry, byId) {
  return (entry.affiliations || []).map(relation => {
    if (relation.entryId) return `<p class="faction-affiliation">${entryAnchor(byId.get(relation.entryId), relation.label)}</p>`;
    return `<p class="faction-affiliation">${h(relation.label)} <span aria-hidden="true">·</span> ${relation.entryIds.filter(id => id !== entry.id).map(id => entryAnchor(byId.get(id))).join(' · ')}</p>`;
  }).join('');
}

function entrySearch(entry, category, group, byId) {
  const names = [];
  for (let parent = byId.get(entry.parentId); parent; parent = byId.get(parent.parentId)) names.push(parent.name);
  return [entry.name, entry.kind, entry.summary, category.label, category.authority, group.title, group.family,
    group.deity?.name, group.deity?.epithet, group.deity?.summary, ...names, ...(entry.aliases || []),
    ...(entry.affiliations || []).map(relation => relation.label), entry.status === 'struck' ? 'Gestrichen' : '',
  ].filter(Boolean).join(' ');
}

function renderCard(node, category, group, byId, headingLevel) {
  const { entry, directChildCount } = node;
  const heading = `h${Math.min(headingLevel, 6)}`;
  const wide = directChildCount > 0 || group.nodes.length === 1;
  const action = entry.source.kind === 'user-directed-addition' ? 'Gottheit & Kult' : 'Zum Religionscodex';
  const parent = byId.get(entry.parentId);
  const showKind = entry.kind && !(entry.affiliations || []).some(relation => relation.label === entry.kind);
  const badge = entry.status === 'struck' ? '<span class="faction-status">Gestrichen überliefert</span>' : entry.status === 'unnamed' ? '<span class="faction-status">Unbenanntes Wappen</span>' : '';
  return `<article class="faction-card${directChildCount ? ' faction-card--leader' : ''}${wide ? ' faction-card--wide' : ''}" id="fraktion-${h(entry.id)}" tabindex="-1" data-faction-id="${h(entry.id)}" data-category-id="${category.id}" data-parent-id="${h(entry.parentId)}" data-search="${h(entrySearch(entry, category, group, byId))}">
    <div class="faction-emblem"><img src="${h(entry.symbol)}" alt="" width="120" height="120" loading="lazy" decoding="async"></div>
    <div class="faction-copy"><span class="context-label" data-role="context-label" hidden>Übergeordneter Verband</span>${badge}<${heading} class="faction-name" id="name-${h(entry.id)}">${h(entry.name)}</${heading}>
      ${showKind ? `<p class="faction-kind">${h(entry.kind)}</p>` : ''}
      ${entry.summary ? `<p class="faction-summary">${h(entry.summary)}</p>` : ''}
      ${parent && group.parentId !== parent.id && group.ownerId !== parent.id ? `<p class="faction-affiliation">Unter ${entryAnchor(parent)}</p>` : ''}
      ${renderAffiliations(entry, byId)}
      ${directChildCount ? `<p class="faction-branches">${directChildCount} angeschlossene ${directChildCount === 1 ? 'Fraktion' : 'Fraktionen'}</p>` : ''}
      ${entry.href ? `<a class="faction-source" href="${h(entry.href)}">${action} <span class="visually-hidden">zu ${h(entry.name)}</span><span aria-hidden="true">↗</span></a>` : ''}
    </div>
  </article>`;
}

function renderNode(node, category, group, byId, headingLevel) {
  const card = renderCard(node, category, group, byId, headingLevel);
  if (!node.groups.length) return card;
  const authority = node.entry.id === category.authorityId;
  return `<div class="faction-bundle${authority ? ' faction-bundle--authority' : ''}" data-faction-bundle="${h(node.entry.id)}" role="group" aria-labelledby="name-${h(node.entry.id)}">
    ${card}
    <div class="faction-bundle-content" data-role="bundle-content">${node.groups.map(childGroup => renderGroup(childGroup, category, byId, headingLevel + 1)).join('\n')}</div>
  </div>`;
}

function renderGroup(group, category, byId, headingLevel = 3) {
  const heading = `h${Math.min(headingLevel, 6)}`;
  const titleId = `gruppe-${category.id}-${group.id}${group.ownerId ? `-unter-${group.ownerId}` : ''}`;
  const parent = byId.get(group.parentId);
  // Full-width bundles precede the ordinary cards, so individual cards form unbroken rows.
  const nodes = [...group.nodes.filter(node => node.groups.length), ...group.nodes.filter(node => !node.groups.length)];
  return `<section class="faction-group${group.deity ? ' faction-group--cult' : ''}" data-faction-group data-group-id="${h(group.id)}" aria-labelledby="${h(titleId)}">
    <header class="group-heading">
      ${group.deity ? `<a class="deity-symbol" href="${h(group.deity.href)}" aria-label="${h(group.deity.name)} im Religionscodex"><img src="${h(group.deity.symbol)}" alt="" width="76" height="76" loading="lazy" decoding="async"></a>` : '<span class="branch-mark" aria-hidden="true">◇</span>'}
      <div>${group.family ? `<p class="eyebrow">${h(group.family)}</p>` : ''}${parent && !group.ownerId ? `<p class="group-lineage">${entryAnchor(parent)} <span aria-hidden="true">/</span> Unterverbände</p>` : ''}
      <${heading} class="group-title" id="${h(titleId)}">${group.deity ? `${h(group.deity.name)} <span>· ${h(group.deity.epithet)}</span>` : h(group.title)}</${heading}>
      ${group.deity ? '<p class="group-note">Eigenständige Kulte dieser Gottheit</p>' : group.note ? `<p class="group-note">${h(group.note)}</p>` : ''}</div>
      <span class="group-count" data-role="group-count">${group.size}</span>
    </header>
    <div class="faction-grid${group.ownerId && group.ownerId !== category.authorityId ? ' faction-grid--siblings' : ''}">${nodes.map(node => renderNode(node, category, group, byId, headingLevel + 1)).join('\n')}</div>
  </section>`;
}

function renderChapter(category, byId) {
  const authority = byId.get(category.authorityId);
  const groups = buildFactionHierarchy(category);
  return `<section class="faction-chapter" id="${category.id}" data-faction-chapter="${category.id}" aria-labelledby="kapitel-${category.id}">
    <header class="chapter-heading"><img src="${categoryIcon(category)}" alt="" width="88" height="88" loading="lazy" decoding="async"><div><p class="eyebrow">Kapitel ${category.number} <span aria-hidden="true">/</span> ${h(category.short)}</p><h2 id="kapitel-${category.id}">${category.label}</h2></div><span class="chapter-total">${String(category.entries.length).padStart(2, '0')}</span></header>
    <div class="chapter-intro"><h3>${h(category.title)}</h3><p>${h(category.intro)}</p></div>
    <div class="authority-note"><span class="authority-glyph" aria-hidden="true">${authority ? '⚑' : '◇'}</span><div><span class="eyebrow">${h(category.structure)}</span><p>${authority && category.id !== 'orden' ? entryAnchor(authority, category.authority) : h(category.authority)}</p></div>${category.id === 'orden' ? '<a href="../Religionen/religionen/alerische-kirche/index.html">Die Alerische Kirche ↗</a>' : ''}</div>
    ${groups.map(group => group.nodes.length === 1 && group.nodes[0].entry.id === category.authorityId
      ? renderNode(group.nodes[0], category, group, byId, 3)
      : renderGroup(group, category, byId)).join('\n')}
  </section>`;
}

function renderCategoryLink(category, { tile = false } = {}) {
  return `<a class="${tile ? 'category-tile' : 'register-link'}" href="#${category.id}" data-action="select-category" data-category="${category.id}"><img src="${categoryIcon(category)}" alt="" width="${tile ? 64 : 34}" height="${tile ? 64 : 34}" ${tile ? '' : 'loading="lazy"'} decoding="async"><span>${tile ? `<small>${category.number} <span aria-hidden="true">/</span> ${category.entries.length} Einträge</small>` : ''}<strong>${category.label}</strong></span>${tile ? '<span class="tile-arrow" aria-hidden="true">↗</span>' : `<small>${category.entries.length}</small>`}</a>`;
}

export function renderFactionPage(catalog) {
  const entries = catalog.flatMap(category => category.entries);
  const byId = new Map(entries.map(entry => [entry.id, entry]));
  const standard = (id, title, position) => `<div class="heraldic-standard heraldic-standard--${position}"><span class="standard-pin" aria-hidden="true"></span><img src="${h(byId.get(id).symbol)}" alt="Wappen: ${h(title)}" width="160" height="160"><span>${h(title)}</span><span class="standard-star" aria-hidden="true">✧</span></div>`;
  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#492e32">
  <meta name="description" content="Die Fraktionen Alerias: Gilden, Orden, Organisationen, dunkle Gilden und Kulte. Ein Wappenregister ihrer Zugehörigkeiten und Hierarchien.">
  <title>Fraktionen von Aleria · Bünde & Banner</title>
  <link rel="icon" href="../IconOrdner/ReiterIcons/Fraktionen.svg?v=20260913-pergament-v1" type="image/svg+xml">
  <link rel="stylesheet" href="modules/book-shell/faction-shell.css">
  <link rel="stylesheet" href="modules/book-shell/faction-cover.css">
  <link rel="stylesheet" href="modules/catalog/faction-catalog.css">
  <script type="module" src="modules/catalog/faction-controller.mjs"></script>
</head>
<body class="factions-page" data-faction-catalog>
  <a class="skip-link" href="#verzeichnis">Zum Fraktionsverzeichnis</a>
  <header class="site-header" id="anfang"><div class="header-inner"><a class="site-brand" href="../AleriaAlmanach/AleriaAlmanach.html">← <span>Aleria <span class="brand-divider">/</span> Almanach</span></a><nav aria-label="Weitere Sammlungen"><a href="../Religionen/index.html">Religionen</a><a href="../Klassenordner/Klassenseite.html">Klassen</a><a href="../Bestiarium/index.html">Bestiarium</a></nav></div></header>
  <main class="faction-book">
    <section class="faction-cover" aria-labelledby="page-title">
      <div class="cover-copy"><p class="eyebrow cover-kicker">Alerias Gesellschaften <span aria-hidden="true">/</span> Das Fraktionsregister</p><p class="cover-pretitle">Bünde, Banner & verborgene Mächte</p><h1 id="page-title">Fraktionen<em>von Aleria</em></h1><p class="cover-intro">Wem gilt Euer Schwur?<br>Entdeckt die Gemeinschaften, die Aleria prägen – ihre Zeichen, ihre Zugehörigkeiten und die Mächte, unter denen sie stehen.</p><a class="ink-button" href="#verzeichnis">Das Register aufschlagen <span aria-hidden="true">↗</span></a><p class="cover-colophon">Fünf Wege der Zugehörigkeit <span aria-hidden="true">·</span> ${entries.length} Einträge</p></div>
      <div class="cover-heraldry"><div class="heraldry-heading"><span aria-hidden="true">✧</span><span>Die Zeichen der Bünde</span><span aria-hidden="true">✧</span></div><div class="heraldic-standards">${standard('die-alerische-kirche', 'Die Kirche', 'left')}${standard('wolken-der-daemmerung', 'Wolken der Dämmerung', 'center')}${standard('loge-der-daemmerung', 'Die dunkle Loge', 'right')}</div><p class="heraldry-caption">Ein Zeichen erzählt, wohin man gehört.</p></div>
    </section>
    <nav class="category-tiles" aria-label="Die fünf Fraktionsbereiche">${catalog.map(category => renderCategoryLink(category, { tile: true })).join('')}</nav>
    <div class="book-layout" id="verzeichnis">
      <aside class="chapter-register" aria-label="Fraktionsregister"><div class="register-sticky"><p class="eyebrow">In diesem Band</p><h2>Bünde & Banner</h2><nav aria-label="Fraktionsbereiche"><a class="register-link register-all" href="#verzeichnis" data-action="select-category" data-category="all" aria-current="true"><span class="all-mark" aria-hidden="true">✧</span><strong>Alle Fraktionen</strong><small>${entries.length}</small></a>${catalog.map(category => renderCategoryLink(category)).join('')}</nav><div class="register-note"><span aria-hidden="true">❧</span><p>Ein Wappen.<br>Ein Schwur.<br>Eine Zugehörigkeit.</p><small>Verbände und Unterverbände bleiben verbunden. Gemeinsamer Glaube bedeutet keine gemeinsame Führung.</small></div><a class="back-to-top" href="#anfang">Zur Titelseite ↑</a></div></aside>
      <div class="book-content"><header class="catalog-heading"><p class="eyebrow">Das Wappenverzeichnis</p><h2>Findet Eure Zugehörigkeit.</h2><p>Folgt einem Namen, einem Banner oder einem der fünf Wege.</p></header>
        <div class="catalog-tools" data-role="catalog-tools" hidden><label class="catalog-search"><span aria-hidden="true">⌕</span><span class="visually-hidden">Fraktionen durchsuchen</span><input type="search" data-role="search" placeholder="Fraktion, Gottheit oder Verband suchen …" maxlength="200" autocomplete="off" aria-controls="fraktionskapitel"></label><div class="catalog-results"><p data-role="result-count" role="status" aria-live="polite" aria-atomic="true">${entries.length} Einträge in fünf Bereichen</p><button class="text-button" type="button" data-action="reset-catalog" hidden>Alle Fraktionen anzeigen ↺</button></div></div>
        <noscript><p class="reading-note">Alle fünf Bereiche und ihre Einträge sind unten aufgeführt. Die Suche steht mit JavaScript zur Verfügung.</p></noscript>
        <div class="catalog-empty" data-role="empty" hidden><span aria-hidden="true">◇</span><h3>Unter diesem Namen ist kein Banner verzeichnet.</h3><p>Versucht einen anderen Namen oder öffnet wieder das gesamte Register.</p><button class="ink-button" type="button" data-action="reset-catalog">Alle Fraktionen anzeigen</button></div>
        <div id="fraktionskapitel">${catalog.map(category => renderChapter(category, byId)).join('\n')}</div>
      </div>
    </div>
    <footer class="faction-footer"><img src="../IconOrdner/ReiterIcons/Fraktionen.svg?v=20260913-pergament-v1" alt="" width="44" height="44" loading="lazy"><p>Das Fraktionsregister Alerias<small>Bünde & Banner · Bewahrt im Almanach</small></p><a href="../AleriaAlmanach/AleriaAlmanach.html">Zurück zum Almanach ↗</a></footer>
  </main>
</body>
</html>
`;
}
