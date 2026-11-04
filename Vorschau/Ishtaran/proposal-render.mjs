import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { renderPlacementArea } from './map-view.mjs';
import { renderEmblemWarriorButton } from './emblem-warrior-view.mjs';

const list = value => Array.isArray(value) ? value.join(' · ') : value ?? '';
const articles = entries => entries.map(item => `<article${item.id ? ` id="${e(item.id)}"` : ''}><h3>${e(item.title)}</h3><p>${e(item.text)}</p></article>`).join('');
const artButton = (item, kind, label) => `<button class="ishtaran-art-button" data-action="show-art" data-art-kind="${e(kind)}" data-art-id="${e(item.id)}" aria-label="${e(label)} vergrößern"><img src="${e(item.image)}" width="360" height="360" alt="${e(label)}" loading="lazy"><span>Großansicht ↗</span></button>`;
const markButton = (kind, id, selected) => `<button class="shortlist-button" data-action="toggle-shortlist" data-shortlist-kind="${kind}" data-proposal-id="${e(id)}" aria-pressed="${selected}">${selected ? 'Vorgemerkt ✓' : 'Vormerken'}</button>`;

function renderRanks(ranks) {
  return ranks.map(item => {
    const titleOpen = !item.title || item.title === 'Noch offen';
    const label = titleOpen ? item.rank : item.title;
    const detail = titleOpen ? 'Ishtaranischer Titel noch offen' : item.rank;
    return `<div><dt>${e(label)}</dt><dd>${detail ? `<strong>${e(detail)}</strong>` : ''}<span class="rank-status">${e(item.status)}</span>${item.note ? `<p>${e(item.note)}</p>` : ''}</dd></div>`;
  }).join('');
}

export function renderProposalNames(entries, kind, selected = []) {
  const groups = [...new Set(entries.map(item => item.group || 'Weitere Vorschläge'))];
  return groups.map((group, index) => {
    const items = entries.filter(item => (item.group || 'Weitere Vorschläge') === group);
    return `<details class="name-group"${index === 0 ? ' open' : ''}><summary>${e(group)} <span>${items.length} Vorschläge</span></summary><div class="name-proposals">${items.map(item => `<article class="name-proposal"><div><h4>${e(item.name)}</h4><p>${e(item.note)}</p></div>${markButton(kind, item.id, selected.includes(item.id))}</article>`).join('')}</div></details>`;
  }).join('');
}

export function renderEmblems(entries, selected = [], emblemWarriors = [], houses = []) {
  return entries.map(item => {
    const warrior = emblemWarriors.find(artwork => artwork.emblemId === item.id);
    const house = houses.find(house => house.emblemId === item.id);
    const title = house ? `Haus ${house.name}` : item.name;
    return `<article class="emblem-card">${warrior ? renderEmblemWarriorButton(item, warrior, title) : artButton(item, 'emblem', title)}<div class="emblem-copy"><p class="eyebrow">${house ? `${e(house.rank)} · Hausvorschlag` : 'Historisches Wappen'}</p><h3>${e(title)}</h3>${house ? `<p class="house-gallery-note">Wappenmotiv: ${e(item.name)}</p>` : ''}${warrior ? `<p class="emblem-warrior-label">${e(warrior.className)} · ${warrior.historical ? 'historischer Bildentwurf' : 'Kriegerentwurf'}</p>` : ''}<p>${e(item.motif)}</p><p class="emblem-colors">${e(list(item.colors))}</p>${house?.note || house?.namingNote ? `<p class="subtle">${e(house.note || house.namingNote)}</p>` : !house && item.note ? `<p class="subtle">${e(item.note)}</p>` : ''}</div>${markButton('emblems', item.id, selected.includes(item.id))}</article>`;
  }).join('');
}

function renderWarriors(warriors, statusNote) {
  return `<p class="section-intro">${e(statusNote)}</p>${warriors.length ? `<div class="ishtaran-warriors">${warriors.map(item => `<article class="warrior-card">${item.image ? artButton(item, 'warrior', item.name) : ''}<h3>${e(item.name)}</h3>${item.role ? `<p class="eyebrow">${e(item.role)}</p>` : ''}<p>${e(item.description)}</p>${item.equipment ? `<p class="warrior-equipment">${e(list(item.equipment))}</p>` : ''}${item.href ? `<a href="${e(item.href)}">Grundklasse ansehen ↗</a>` : ''}${item.mount?.href ? `<p><a href="${e(item.mount.href)}">${e(item.mount.name)} im Bestiarium ↗</a></p>` : ''}</article>`).join('')}</div>` : '<div class="workshop-placeholder"><strong>Kriegerklassen noch offen</strong><p>Die Figuren folgen den belegten Klassen. Die Bildrichtung verbindet seldschukische, osmanische und kumanische Ausrüstung mit Janitscharen- und Derwischmotiven, ohne Musketen.</p></div>'}`;
}

export function renderIshtaranPage({ context: c, cityNames, houseNames, emblems, warriors, houses = [], emblemWarriors = [], warriorStatusNote }) {
  const realmEmblem = emblems.find(item => item.group === 'realm');
  const ancient = emblems.filter(item => item.group === 'ancient');
  const pool = emblems.filter(item => item.group === 'pool');
  const providedPool = pool.filter(item => item.status === 'source');
  const additionalPool = pool.filter(item => item.status === 'proposal');
  const cityPlan = c.settlementPlan;
  const realmWarrior = realmEmblem && emblemWarriors.find(item => item.emblemId === realmEmblem.id);
  const realmHouse = realmEmblem && houses.find(house => house.emblemId === realmEmblem.id);
  return `<a class="skip-link" href="#anfang">Zum Inhalt</a>
  <header class="toolbar"><a class="wordmark" href="#anfang">ALERIA <span>Werkstatt</span></a><span class="draft-label">Ishtaran · Vorbereitung</span><nav aria-label="Seitenbereiche"><a href="#geschichte">Geschichte</a><a href="#ordnung">Ordnung</a><a href="#karte">Karte</a><a href="#wappen">Wappen</a><a href="#namen">Namen</a><a href="#krieger">Krieger</a><a href="#entwurf">Merkliste</a></nav></header>
  <main><section class="hero" id="anfang"><div><p class="eyebrow">Vorbereitungs- und Besprechungsseite</p><h1>${e(c.title)}</h1><p class="hero-line">${e(c.subtitle)}</p><p class="lead">${e(c.summary)}</p><dl class="hero-stats">${cityPlan ? `<div><dt>Feste Städte</dt><dd>${e(cityPlan.fixedCities)}<small>${e(cityPlan.largeCities)} große · ${e(cityPlan.capitalCities)} Hauptstadt + ${e(cityPlan.countTierCities)} Paschastädte</small><small>${e(cityPlan.baronKnightPrinceTierCities)} kleine · Tarkan-Sitze</small></dd></div>` : ''}<div><dt>Häuser im Entwurf</dt><dd>${houses.length}<small>${e(cityPlan?.additionalEmblems ?? additionalPool.length)} neue Wappen · Maghneach separat</small></dd></div><div><dt>Staatsämter</dt><dd>${c.offices.length}</dd></div></dl></div>${realmEmblem ? `<figure class="realm-crest">${realmWarrior ? renderEmblemWarriorButton(realmEmblem, realmWarrior, realmHouse ? `Haus ${realmHouse.name}` : realmEmblem.name) : artButton(realmEmblem, 'emblem', realmEmblem.name)}<figcaption>${realmHouse ? `Haus ${e(realmHouse.name)} · ${e(realmHouse.rank)} · dynastischer Wappenvorschlag` : 'Geliefertes Landeswappen'}</figcaption></figure>` : '<aside class="hero-status"><p class="eyebrow">Ausarbeitung</p><p>Alte Steppentradition.<br>Eine eigene Ordnung.</p></aside>'}</section>
  <aside class="draft-note"><strong>Vorläufiger Zuordnungsentwurf.</strong> Hausnamen, Ränge und Stadtnamen bilden einen bearbeitbaren Vorschlag. Sitzwechsel werden separat von der Merkliste gespeichert; Kartenoriginale und kanonische Register bleiben unverändert.</aside>
  <section class="section" id="geschichte"><p class="eyebrow">01 · Herkunft und Selbstverständnis</p><h2>Die festgelegte Vorgeschichte.</h2><div class="history-grid">${articles(c.history)}</div>${ancient.length ? `<div class="ancient-emblems">${renderEmblems(ancient, [], emblemWarriors)}</div>` : ''}<div class="theme-grid">${articles(c.culture)}</div></section>
  <section class="section" id="ordnung"><p class="eyebrow">02 · Staatsordnung</p><h2>Ämter und Rangbegriffe.</h2><div class="government-layout"><article><h3>Die hohen Staatsämter</h3><div class="office-table-wrap"><table class="office-table"><thead><tr><th scope="col">Staatsamt</th><th scope="col">Ishtaranischer Titel</th></tr></thead><tbody>${c.offices.map(item => `<tr><th scope="row">${e(item.role)}</th><td><strong>${e(item.title)}</strong>${item.note ? `<small>${e(item.note)}</small>` : ''}</td></tr>`).join('')}</tbody></table></div></article><article><h3>Rangstatus</h3><dl class="rank-list">${renderRanks(c.ranks)}</dl><p class="subtle">Eine Nennung in der Namenssammlung vergibt keinen Rang und benennt keinen Amtsinhaber.</p></article></div></section>
  ${renderPlacementArea()}
  <section class="section" id="wappen"><p class="eyebrow">03 · Häuser und Heraldik</p><h2>${houses.length} Häuser. Eigene Wappen und Krieger.</h2><p class="section-intro">Die ${additionalPool.length} neuen Wappen ergänzen die ${providedPool.length} gelieferten Motive und das dynastisch vorgeschlagene Landeswappen. Die Hausfenster zeigen Rang und aktuellen Sitz im lokalen Entwurf. Maghneachs antikes Paar bleibt bei der Vorgeschichte.</p><div data-role="emblem-pool"><section class="emblem-collection"><h3>Häuser mit gelieferten Wappen <span>${providedPool.length} Motive</span></h3><div class="emblem-grid">${renderEmblems(providedPool, [], emblemWarriors, houses)}</div></section><section class="emblem-collection"><h3>Weitere Hausvorschläge <span>${additionalPool.length} neue Motive</span></h3><div class="emblem-grid">${renderEmblems(additionalPool, [], emblemWarriors, houses)}</div></section></div></section>
  <section class="section" id="namen"><p class="eyebrow">04 · Namenswerkstatt</p><h2>Weitere Namen vergleichen.</h2><p class="section-intro">Die ursprüngliche Sammlung bleibt als Auswahlhilfe erhalten. Vormerkungen ändern weder den Sitzentwurf noch Registereinträge.</p><div class="name-collections"><section class="name-collection" aria-labelledby="city-names-title"><h3 class="collection-title" id="city-names-title">Stadtnamen <span>${cityNames.length} Vorschläge</span></h3><div data-role="city-names">${renderProposalNames(cityNames, 'cityNames')}</div></section><section class="name-collection" aria-labelledby="house-names-title"><h3 class="collection-title" id="house-names-title">Adelsnamen <span>${houseNames.length} Vorschläge</span></h3><div data-role="house-names">${renderProposalNames(houseNames, 'houseNames')}</div></section></div></section>
  <section class="section" id="krieger"><p class="eyebrow">05 · Klassen und Kriegskultur</p><h2>Die acht Klassen im Überblick.</h2>${renderWarriors(warriors, warriorStatusNote)}<div class="horse-profiles">${c.horses.map(item => `<article>${item.image ? `<a href="${e(item.href)}"><img src="${e(item.image)}" alt="${e(item.name)}" loading="lazy"></a>` : ''}<div><h3>${e(item.name)}</h3><p>${e(item.text)}</p>${item.href ? `<a href="${e(item.href)}">Zuchtprofil im Bestiarium ↗</a>` : ''}</div></article>`).join('')}</div></section>
  ${c.openQuestions.length ? `<section class="section" id="offene-punkte"><p class="eyebrow">06 · Nächste Ausarbeitung</p><h2>Was noch festzulegen ist.</h2><ul class="open-questions">${c.openQuestions.map(text => `<li>${e(text)}</li>`).join('')}</ul></section>` : ''}
  <section class="section draft-tools" id="entwurf"><p class="eyebrow">Lokale Merkliste</p><h2>Deine Auswahl für die Besprechung.</h2><p>Vorgemerkte Namen, Wappen und Notizen bleiben in diesem Browser. Ein Export nimmt sie gemeinsam mit; die Quelldaten bleiben unverändert.</p><div class="shortlist-summary" data-role="shortlist-summary"></div><label class="draft-notes-label" for="draft-notes">Eigene Notizen</label><textarea id="draft-notes" data-role="draft-notes" rows="6" maxlength="10000" placeholder="Gedanken zu Namen, Motiven und der weiteren Ausarbeitung …"></textarea><div class="action-row"><button data-action="undo" disabled>Letzte Änderung zurück</button><button data-action="export">Merkliste herunterladen</button><button data-action="import">Merkliste laden</button><button data-action="reset">Merkliste leeren</button><button data-action="print">Drucken</button></div><input type="file" accept="application/json,.json" data-role="import-file" hidden><p class="storage-note" data-role="storage-note">Lokale Speicherung ist bereit.</p></section>
  <footer><span>Ishtaran · Vorläufige Vorbereitung</span><nav aria-label="Verwandte Seiten"><a href="../Aldingen/">Aldingen ↗</a><a href="../Venalys/">Venalys ↗</a><a href="../../Bestiarium/">Bestiarium ↗</a></nav></footer></main>
  <dialog class="proposal-dialog art-dialog house-dialog ishtaran-art-dialog" data-role="art-dialog" aria-labelledby="art-title"><div class="dialog-top"><span>Ishtaran · Haus- und Bildansicht</span><button data-action="close-art" aria-label="Bildansicht schließen">✕</button></div><div class="art-dialog-content" data-role="art-details"></div></dialog><div class="notice" data-role="status" role="status" aria-live="polite" hidden></div>`;
}

export function renderShortlistSummary(draft, { cityNames, houseNames, emblems }) {
  return [['cityNames', 'Stadtnamen', cityNames], ['houseNames', 'Adelsnamen', houseNames], ['emblems', 'Wappen', emblems]].map(([kind, title, items]) => {
    const chosen = items.filter(item => draft.favorites[kind].includes(item.id));
    return `<section><h3>${title} <span>${chosen.length}</span></h3>${chosen.length ? `<ul>${chosen.map(item => `<li><span>${e(item.name)}</span><button data-action="toggle-shortlist" data-shortlist-kind="${kind}" data-proposal-id="${e(item.id)}" aria-label="${e(item.name)} aus der Merkliste entfernen">Entfernen</button></li>`).join('')}</ul>` : '<p>Noch nichts vorgemerkt.</p>'}</section>`;
  }).join('');
}
