(function () {
  const page = document.querySelector('[data-page-type="kingdom"], [data-page-type="county"]');
  if (!page) return;

  page.querySelectorAll('table').forEach((table) => {
    if (table.parentElement && table.parentElement.classList.contains('kingdom-table-scroll')) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'kingdom-table-scroll';
    if (table.classList.contains('kingdom-toc')) {
      wrapper.classList.add('kingdom-toc-scroll');
    }
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });

  const countyCardViews = new WeakMap();
  const countyObservers = new WeakMap();
  const familyCardViews = new WeakMap();
  const familyObservers = new WeakMap();
  let geographySourceIndex = 0;
  let familySourceIndex = 0;

  enhanceCountyGeographyTables();
  enhanceCountyFamilyTables();
  enhanceCountyCouncilPortraits();
  window.addEventListener('aleria:kontinente:content-ready', scheduleCountyViewsRefresh);
  window.addEventListener('aleria:kontinente:data-ready', scheduleCountyViewsRefresh);

  const sectionMap = [
    { id: 'einfuehrung', pattern: /^1\.\)\s*Einführung/i },
    { id: 'uebersicht', pattern: /^1\.\)\s*Übersicht/i },
    { id: 'geschichte', pattern: /^2\.\)\s*Geschichte/i },
    { id: 'kultur', pattern: /^3\.\)\s*Kultur/i },
    { id: 'religion', pattern: /^4\.\)\s*Religion/i },
    { id: 'politik', pattern: /^[45]\.\)\s*Politik/i },
    { id: 'verwaltung', pattern: /^[56]\.\)\s*Verwaltung/i },
    { id: 'familien', pattern: /^6\.\)\s*Familien/i },
    { id: 'gesetze', pattern: /^7\.\)\s*Gesetze/i },
    { id: 'geographie', pattern: /^[78]\.\)\s*Geographie/i },
    { id: 'institutionen', pattern: /^9\.\)\s*Institutionen/i },
    { id: 'flora-fauna', pattern: /^(8|10)\.\)\s*Flora/i },
    { id: 'ahnengalerie', pattern: /^11\.\)\s*Ahneng/i },
    { id: 'trivia', pattern: /^(9|12)\.\)\s*Trivia/i },
  ];

  const headingCandidates = page.querySelectorAll('p');
  sectionMap.forEach(({ id, pattern }) => {
    if (document.getElementById(id)) return;
    const heading = Array.from(headingCandidates).find((element) => {
      const text = element.textContent.replace(/\s+/g, ' ').trim();
      return pattern.test(text);
    });
    if (!heading) return;
    heading.id = id;
    heading.classList.add('kingdom-section-heading');
  });

  if (window.location.hash) {
    [50, 350, 900, 1500, 2500, 4000].forEach((delay) => window.setTimeout(scrollToCurrentHash, delay));
    window.addEventListener('load', () => window.setTimeout(scrollToCurrentHash, 120), { once: true });
  }
  window.addEventListener('hashchange', () => window.setTimeout(scrollToCurrentHash, 40));

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'kingdom-back-top';
  button.setAttribute('aria-label', 'Zum Seitenanfang');
  button.textContent = '↑';
  document.body.appendChild(button);

  const toggleButton = () => {
    button.classList.toggle('is-visible', window.scrollY > 500);
  };

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', toggleButton, { passive: true });
  toggleButton();

  function scrollToCurrentHash() {
    const id = decodeURIComponent(window.location.hash.slice(1) || '');
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - 12;
    window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
  }

  function enhanceCountyGeographyTables() {
    page.querySelectorAll('.kingdom-county-geography-table').forEach((table) => {
      renderCountyGeographyView(table);
      observeCountyGeographyTable(table);
    });
    syncCountyViewMode();
  }

  let countyViewsRefreshTimer = 0;
  function scheduleCountyViewsRefresh() {
    window.clearTimeout(countyViewsRefreshTimer);
    countyViewsRefreshTimer = window.setTimeout(() => {
      enhanceCountyGeographyTables();
      enhanceCountyFamilyTables();
      enhanceCountyCouncilPortraits();
    }, 40);
  }

  function observeCountyGeographyTable(table) {
    if (countyObservers.has(table) || !table.tBodies[0]) return;

    let timer = 0;
    const observer = new MutationObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        renderCountyGeographyView(table);
        syncCountyViewMode();
      }, 80);
    });
    observer.observe(table.tBodies[0], { childList: true, subtree: true, characterData: true });
    countyObservers.set(table, observer);
  }

  function ensureGeographySourceId(table) {
    if (!table) return '';
    if (!table.dataset.kingdomGeographySourceId) {
      geographySourceIndex += 1;
      table.dataset.kingdomGeographySourceId = `geography-source-${geographySourceIndex}`;
    }
    return table.dataset.kingdomGeographySourceId;
  }

  function renderCountyGeographyView(table) {
    const existing = countyCardViews.get(table);
    if (existing) existing.remove();

    const view = buildCountyGeographyView(table);
    if (!view) return;

    const wrapper = table.parentElement && table.parentElement.classList.contains('kingdom-table-scroll')
      ? table.parentElement
      : null;
    const anchor = wrapper || table;

    table.classList.add('is-county-card-source');
    ensureGeographySourceId(table);
    if (wrapper) wrapper.classList.add('is-county-card-source-wrapper');
    anchor.insertAdjacentElement('beforebegin', view);
    countyCardViews.set(table, view);
    if (window.location.hash) window.setTimeout(scrollToCurrentHash, 40);
  }

  function syncCountyViewMode() {
    page.querySelectorAll('.kingdom-county-geography-table.is-county-card-source').forEach((table) => {
      table.setAttribute('aria-hidden', 'true');
    });
    page.querySelectorAll('.kingdom-county-family-table.is-family-card-source').forEach((table) => {
      table.setAttribute('aria-hidden', 'true');
    });
  }

  function buildCountyGeographyView(table) {
    const rows = Array.from(table.tBodies[0]?.rows || []);
    if (!rows.length) return null;

    const columnCount = getTableColumnCount(table);
    ensureGeographySourceId(table);

    const data = { title: '', titleSource: null, mapCell: null, mapSource: null, domains: [] };
    let currentDomain = null;
    let currentGroupLabel = '';

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      const text = getCleanText(row);

      if (isEmptyRow(row)) continue;

      if (isFullImageRow(row, columnCount)) {
        const imageCell = row.cells[0];
        const isCountyMap = isMapCell(imageCell) || (!data.mapCell && !currentDomain);
        imageCell.classList.toggle('kingdom-county-map-cell', isCountyMap);

        if (isCountyMap) {
          data.mapCell = imageCell;
          data.mapSource = createGeographySource(table, 'map-image', index, 0);
        } else if (currentDomain) {
          if (currentDomain.center && !currentDomain.centerCell && !currentDomain.expectsCenter) {
            currentDomain.centerCell = imageCell;
            currentDomain.centerImageSource = createGeographySource(table, 'center-image', index, 0);
          } else {
            currentDomain.crestCell = imageCell;
            currentDomain.crestSource = createGeographySource(table, 'domain-crest', index, 0);
            currentDomain.expectsCenter = true;
          }
        }
        continue;
      }

      if (isFullTextRow(row, columnCount)) {
        if (!data.title) {
          data.title = text;
          data.titleSource = createGeographySource(table, 'map-title', index, 0);
          continue;
        }

        if (currentDomain?.expectsCenter && isCenterLabelRow(row)) {
          currentDomain.center = text;
          currentDomain.centerSource = createGeographySource(table, 'domain-center', index, 0);
          currentDomain.expectsCenter = false;
          continue;
        }

        if (isPlaceGroupLabel(text)) {
          currentGroupLabel = text;
          if (currentDomain) appendPlaceSeparator(currentDomain, text);
          continue;
        }

        if (currentDomain && isPlaceSeparatorRow(row, text)) {
          currentGroupLabel = text;
          appendPlaceSeparator(currentDomain, text);
          continue;
        }

        currentDomain = {
          title: text,
          center: '',
          crestCell: null,
          centerCell: null,
          titleSource: createGeographySource(table, 'domain-title', index, 0),
          crestSource: null,
          centerSource: null,
          centerImageSource: null,
          places: [],
          expectsCenter: false,
        };
        data.domains.push(currentDomain);
        currentGroupLabel = '';
        continue;
      }

      const hasImageContent = rowHasImages(row);
      if (!currentDomain || !hasImageContent) continue;

      const previousRow = rows[index - 1];
      const nextRow = rows[index + 1];
      const typeRow = previousRow && isPlaceTypeRow(previousRow, columnCount) ? previousRow : null;
      const nameRow = nextRow && isPlaceNameRow(nextRow, columnCount) ? nextRow : null;
      if (!nameRow) continue;

      currentDomain.places.push(...extractPlaceCards(table, typeRow, row, nameRow, currentGroupLabel, {
        typeRowIndex: typeRow ? rows.indexOf(typeRow) : -1,
        imageRowIndex: index,
        nameRowIndex: index + 1
      }));
      index += 1;
    }

    const view = document.createElement('div');
    view.className = 'kingdom-county-card-view';

    if (data.mapCell) {
      const mapPanel = document.createElement('section');
      mapPanel.className = 'kingdom-county-map-panel';
      const title = document.createElement('h3');
      title.textContent = data.title || 'Karte der Grafschaft';
      mapPanel.append(title);
      const mapImage = cloneLinkedImage(data.mapCell);
      if (mapImage) mapPanel.append(mapImage);
      view.append(mapPanel);
    }

    data.domains
      .filter((domain) => domain.title || domain.crestCell || domain.center || domain.places.length)
      .forEach((domain) => view.append(renderDomainCard(domain)));

    return view.children.length ? view : null;
  }

  function enhanceCountyFamilyTables() {
    page.querySelectorAll('.kingdom-county-family-table').forEach((table) => {
      renderCountyFamilyView(table);
      observeCountyFamilyTable(table);
    });
    syncCountyViewMode();
  }

  function observeCountyFamilyTable(table) {
    if (familyObservers.has(table) || !table.tBodies[0]) return;

    let timer = 0;
    const observer = new MutationObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        renderCountyFamilyView(table);
        syncCountyViewMode();
      }, 80);
    });
    observer.observe(table.tBodies[0], { childList: true, subtree: true, characterData: true });
    familyObservers.set(table, observer);
  }

  function ensureFamilySourceId(table) {
    if (!table) return '';
    if (!table.dataset.kingdomFamilySourceId) {
      familySourceIndex += 1;
      table.dataset.kingdomFamilySourceId = `family-source-${familySourceIndex}`;
    }
    return table.dataset.kingdomFamilySourceId;
  }

  function renderCountyFamilyView(table) {
    const existing = familyCardViews.get(table);
    if (existing) existing.remove();

    const view = buildCountyFamilyView(table);
    if (!view) return;

    const wrapper = table.parentElement && table.parentElement.classList.contains('kingdom-table-scroll')
      ? table.parentElement
      : null;
    const anchor = wrapper || table;

    table.classList.add('is-family-card-source');
    if (wrapper) wrapper.classList.add('is-family-card-source-wrapper');
    anchor.insertAdjacentElement('beforebegin', view);
    familyCardViews.set(table, view);
  }

  function buildCountyFamilyView(table) {
    const configuredSections = getConfiguredFamilySections();
    if (configuredSections.length) return buildConfiguredFamilyView(configuredSections);

    const rows = Array.from(table.tBodies[0]?.rows || []);
    if (!rows.length) return null;

    const columnCount = getTableColumnCount(table);
    const sections = [];
    let currentSection = null;
    let pendingLiegeCells = null;
    let pendingLiegeRowIndex = -1;

    ensureFamilySourceId(table);

    const ensureSection = (title = 'Adelshaeuser', titleRowIndex = -1) => {
      if (currentSection) return currentSection;
      currentSection = { title, titleRowIndex, table, cards: [] };
      sections.push(currentSection);
      return currentSection;
    };

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      const text = getCleanText(row);
      if (isEmptyRow(row)) continue;

      if (isFullTextRow(row, columnCount)) {
        if (isFamilySingleCardStart(row, rows[index + 1], rows[index + 2], columnCount)) {
          const section = ensureSection();
          section.cards.push({
            featured: true,
            liege: '',
            seat: text,
            image: cloneImage(rows[index + 1]?.cells?.[0]),
            href: getImageHref(rows[index + 1]?.cells?.[0]),
            name: getCleanText(rows[index + 2]),
            source: {
              table,
              kind: 'single',
              cellIndex: 0,
              seatRowIndex: index,
              imageRowIndex: index + 1,
              nameRowIndex: index + 2,
              liegeRowIndex: -1,
              titleRowIndex: section.titleRowIndex
            }
          });
          index += 2;
          continue;
        }

        if (isFamilySectionTitle(row, text)) {
          currentSection = { title: text, titleRowIndex: index, table, cards: [] };
          sections.push(currentSection);
          pendingLiegeCells = null;
          pendingLiegeRowIndex = -1;
        }
        continue;
      }

      if (isFamilyLiegeRow(row)) {
        pendingLiegeCells = Array.from(row.cells || []);
        pendingLiegeRowIndex = index;
        continue;
      }

      if (!isFamilySeatRow(row)) continue;

      const imageRow = rows[index + 1];
      const nameRow = rows[index + 2];
      if (!imageRow || !nameRow || !isPlaceNameRow(nameRow, columnCount)) continue;

      const section = ensureSection();
      const seatCells = Array.from(row.cells || []);
      const imageCells = Array.from(imageRow.cells || []);
      const nameCells = Array.from(nameRow.cells || []);

      imageCells.forEach((cell, cellIndex) => {
        if (
          isFamilyDeletedCell(cell)
          || isFamilyDeletedCell(seatCells[cellIndex])
          || isFamilyDeletedCell(nameCells[cellIndex])
          || isFamilyDeletedCell(pendingLiegeCells?.[cellIndex])
        ) {
          return;
        }

        const image = cloneImage(cell);
        const name = getCleanText(nameCells[cellIndex]);
        const seat = getCleanText(seatCells[cellIndex]);
        const liege = getCleanText(pendingLiegeCells?.[cellIndex]);
        if (!image && !name && !seat && !liege) return;

        section.cards.push({
          liege,
          seat,
          image,
          href: getImageHref(cell),
          name,
          source: {
            table,
            kind: 'grid',
            cellIndex,
            seatRowIndex: index,
            imageRowIndex: index + 1,
            nameRowIndex: index + 2,
            liegeRowIndex: pendingLiegeRowIndex,
            titleRowIndex: section.titleRowIndex
          }
        });
      });

      pendingLiegeCells = null;
      pendingLiegeRowIndex = -1;
      index += 2;
    }

    const filledSections = sections
      .map((section) => ({ ...section, cards: section.cards.filter((card) => card.image || card.name || card.seat || card.liege) }))
      .filter((section) => section.cards.length);
    if (!filledSections.length) return null;

    const view = document.createElement('div');
    view.className = 'kingdom-family-card-view';
    filledSections.forEach((section) => view.append(renderFamilySection(section)));
    return view;
  }

  function getConfiguredFamilySections() {
    const sections = window.KONTINENTE_DATA?.view?.familySections;
    return Array.isArray(sections) ? sections.filter((section) => Array.isArray(section?.cards)) : [];
  }

  function buildConfiguredFamilyView(sections) {
    const view = document.createElement('div');
    view.className = 'kingdom-family-card-view is-structured-family-view';

    sections.forEach((section) => {
      const cards = section.cards.map((card) => ({
        ...card,
        image: createConfiguredImage(card.imageSrc, card.imageAlt || `Wappen Haus ${card.name || ''}`),
      }));
      if (!cards.length) return;
      view.append(renderFamilySection({ ...section, cards }));
    });

    return view.children.length ? view : null;
  }

  function createConfiguredImage(source, alt) {
    if (!source) return null;
    const image = document.createElement('img');
    image.src = source;
    image.alt = alt || '';
    image.loading = 'lazy';
    image.decoding = 'async';
    return image;
  }

  function renderFamilySection(section) {
    const block = document.createElement('section');
    block.className = 'kingdom-family-section';
    if (section.variant) block.dataset.familyVariant = section.variant;

    const title = document.createElement('h3');
    const titleText = document.createElement('span');
    titleText.textContent = section.title || 'Adelshäuser';
    const count = document.createElement('span');
    count.className = 'kingdom-family-count';
    count.textContent = String(section.cards.length);
    count.setAttribute('aria-label', `${section.cards.length} Häuser`);
    title.append(titleText, count);
    block.append(title);

    const grid = document.createElement('div');
    grid.className = 'kingdom-family-grid';
    const featuredCards = section.cards.filter((card) => card.featured);
    const regularCards = section.cards.filter((card) => !card.featured);

    if (featuredCards.length) {
      const featuredGrid = document.createElement('div');
      featuredGrid.className = 'kingdom-family-featured';
      featuredCards.forEach((card) => featuredGrid.append(renderFamilyCard(card, true)));
      block.append(featuredGrid);
    }

    regularCards.forEach((card) => grid.append(renderFamilyCard(card)));
    block.append(grid);
    return block;
  }

  function renderFamilyCard(card, featured = false) {
    const element = document.createElement('article');
    element.className = `kingdom-family-card${featured ? ' is-family-featured' : ''}`;
    const meta = document.createElement('div');
    meta.className = 'kingdom-family-meta';
    if (card.liege) meta.append(renderFamilyMetaItem('Lehenstreue', card.liege));
    if (card.seat) meta.append(renderFamilyMetaItem('Sitz', card.seat));
    element.append(meta);

    const crest = document.createElement('div');
    crest.className = 'kingdom-family-crest';
    const hasRealImage = card.image && !card.image.classList?.contains('kingdom-card-image-placeholder');
    if (hasRealImage && card.href) {
      const link = document.createElement('a');
      link.href = card.href;
      link.append(card.image);
      crest.append(link);
    } else if (hasRealImage) {
      crest.append(card.image);
    } else {
      crest.append(renderFamilyCrestPlaceholder(card.source));
    }
    element.append(crest);

    const name = document.createElement('strong');
    name.className = 'kingdom-family-name';
    if (card.href) {
      const link = document.createElement('a');
      link.className = 'kingdom-family-name-link';
      link.href = card.href;
      link.textContent = card.name || 'Unbenanntes Haus';
      name.append(link);
    } else {
      name.textContent = card.name || 'Unbenanntes Haus';
    }
    element.append(name);
    return element;
  }

  function enhanceCountyCouncilPortraits() {
    const view = window.KONTINENTE_DATA?.view;
    const familyIds = view?.portraitFamilyIds;
    const familyTreePage = view?.familyTreePage;
    if (!familyTreePage || !familyIds || typeof familyIds !== 'object') return;

    page.querySelectorAll('.kingdom-council-table').forEach((table) => {
      const rows = Array.from(table.tBodies[0]?.rows || []);
      rows.forEach((row, rowIndex) => {
        if (!row.querySelector('img[src]')) return;
        const nameRow = rows[rowIndex + 1];
        if (!nameRow) return;

        Array.from(row.cells || []).forEach((cell, cellIndex) => {
          const image = cell.querySelector('img[src]');
          const name = getCleanText(nameRow.cells?.[cellIndex]);
          if (!image || !name) return;

          const replacementImage = view.portraitImages?.[name];
          if (replacementImage) {
            image.src = replacementImage;
            image.alt = name === 'Name unklar (Haus Draig)'
              ? 'Männliche Silhouette für den unbesetzten Ritterfürsten'
              : `Porträt von ${name}`;
          }

          const familyId = resolvePortraitFamilyId(name, familyIds);
          if (!familyId) return;
          const href = `${familyTreePage}?family=${encodeURIComponent(familyId)}&mode=view`;
          const existingLink = image.closest('a');
          if (existingLink) {
            existingLink.href = href;
            existingLink.removeAttribute('target');
            existingLink.removeAttribute('rel');
            return;
          }

          const link = document.createElement('a');
          link.href = href;
          link.className = 'kingdom-portrait-link';
          image.replaceWith(link);
          link.append(image);
        });
      });
    });
  }

  function resolvePortraitFamilyId(personName, familyIds) {
    const entry = Object.entries(familyIds).find(([houseName]) => (
      personName.endsWith(` ${houseName}`) || personName.includes(`(Haus ${houseName})`)
    ));
    return entry?.[1] || '';
  }

  function renderFamilyCrestPlaceholder(source) {
    const placeholder = document.createElement('span');
    placeholder.className = 'kingdom-family-crest-placeholder';
    placeholder.textContent = '...';
    return placeholder;
  }

  function renderFamilyMetaItem(label, value) {
    const item = document.createElement('span');
    item.className = `kingdom-family-meta-item kingdom-family-meta-${label === 'Lehenstreue' ? 'liege' : 'seat'}`;
    item.setAttribute('aria-label', `${label}: ${value}`);
    item.innerHTML = `<strong>${escapeHtml(value)}</strong>`;
    return item;
  }

  function renderDomainCard(domain) {
    const placeCount = domain.places.filter((place) => place.kind !== 'separator').length;
    const domainHref = getImageHref(domain.crestCell);
    const section = document.createElement('section');
    section.className = `kingdom-domain-card${placeCount === 1 ? ' kingdom-domain-card-compact' : ''}`;

    const header = document.createElement('header');
    header.className = 'kingdom-domain-header';

    const crest = cloneLinkedImage(domain.crestCell);
    if (crest) {
      const crestWrap = document.createElement('div');
      crestWrap.className = 'kingdom-domain-crest';
      crestWrap.append(crest);
      header.append(crestWrap);
    }

    const titleWrap = document.createElement('div');
    titleWrap.className = 'kingdom-domain-title';
    const title = document.createElement('h3');
    if (domainHref) {
      const link = document.createElement('a');
      link.href = domainHref;
      link.textContent = domain.title || 'Herrschaft';
      title.append(link);
    } else {
      title.textContent = domain.title || 'Herrschaft';
    }
    titleWrap.append(title);
    if (domain.center && domain.places.length) {
      const center = document.createElement('p');
      center.append(document.createTextNode('Zentrum: '));
      const centerValue = document.createElement('strong');
      centerValue.textContent = domain.center;
      center.append(centerValue);
      titleWrap.append(center);
    }
    header.append(titleWrap);
    section.append(header);

    if (domain.places.length) {
      const grid = document.createElement('div');
      grid.className = 'kingdom-place-grid';
      domain.places.forEach((place) => grid.append(renderPlaceCard(place)));
      section.append(grid);
    } else if (domain.center) {
      const centerPanel = document.createElement('div');
      centerPanel.className = 'kingdom-domain-center-panel';
      const centerImage = cloneImage(domain.centerCell);
      centerPanel.classList.toggle('has-center-icon', !!centerImage);
      if (centerImage) {
        const imageFrame = document.createElement('span');
        imageFrame.className = 'kingdom-domain-center-icon';
        imageFrame.append(centerImage);
        centerPanel.append(imageFrame);
      }
      const label = document.createElement('span');
      label.className = 'kingdom-domain-center-label';
      label.textContent = 'Zentrum';
      const value = document.createElement('strong');
      value.className = 'kingdom-domain-center-name';
      value.textContent = domain.center;
      centerPanel.append(label, value);
      section.append(centerPanel);
    }

    return section;
  }

  function renderPlaceCard(place) {
    if (place.kind === 'separator') {
      const separator = document.createElement('div');
      separator.className = 'kingdom-place-separator';
      separator.textContent = place.title || 'Abschnitt';
      return separator;
    }

    const card = document.createElement('article');
    card.className = 'kingdom-place-card';

    const iconFrame = document.createElement('span');
    iconFrame.className = 'kingdom-place-icon-frame';
    if (place.image && place.href) {
      const link = document.createElement('a');
      link.href = place.href;
      link.rel = 'noopener noreferrer';
      link.target = '_blank';
      link.append(place.image);
      iconFrame.append(link);
    } else if (place.image) {
      iconFrame.append(place.image);
    }
    card.append(iconFrame);

      const type = document.createElement('span');
      type.className = 'kingdom-place-type';
      type.textContent = place.type || 'Ort';
      card.append(type);

    const name = document.createElement('strong');
      name.className = 'kingdom-place-name';
      name.textContent = place.name || 'Unbenannter Ort';
      card.append(name);

    return card;
  }

  function extractPlaceCards(table, typeRow, imageRow, nameRow, groupLabel, rowSource) {
    const typeCells = typeRow ? Array.from(typeRow.cells || []) : [];
    const imageCells = Array.from(imageRow.cells || []);
    const nameCells = Array.from(nameRow.cells || []);
    const fallbackType = normalizePlaceGroupLabel(groupLabel);

    return imageCells.map((cell, index) => {
      const source = createGeographySource(table, 'place-image', rowSource.imageRowIndex, index);
      const image = cloneImage(cell);
      const name = getCleanText(nameCells[index]);
      const type = getCleanText(typeCells[index]) || fallbackType;
      const href = getImageHref(cell);
      return {
        image,
        name,
        type,
        href,
        source,
        typeSource: typeCells[index]
          ? createGeographySource(table, 'place-type', rowSource.typeRowIndex, index)
          : null,
        nameSource: nameCells[index]
          ? createGeographySource(table, 'place-name', rowSource.nameRowIndex, index)
          : null
      };
    }).filter((place) => place.image || place.name);
  }

  function createGeographySource(table, kind, rowIndex, cellIndex) {
    if (!table || rowIndex < 0 || cellIndex < 0) return null;
    return {
      table,
      kind,
      rowIndex,
      cellIndex
    };
  }

  function getImageHref(cell) {
    const imageLink = cell?.querySelector?.('img')?.closest('a[href]')?.getAttribute('href');
    if (imageLink) return imageLink;

    const slotImage = getInlineSlotImage(cell?.querySelector?.('.orte-image-slot[data-orte-image-key]'));
    return slotImage?.href || '';
  }

  function appendPlaceSeparator(domain, title) {
    const normalizedTitle = getCleanText({ textContent: title });
    if (!normalizedTitle || !domain?.places) return;
    const last = domain.places[domain.places.length - 1];
    if (last?.kind === 'separator' && last.title === normalizedTitle) return;
    domain.places.push({ kind: 'separator', title: normalizedTitle });
  }

  function cloneLinkedImage(cell) {
    if (!cell) return null;
    const image = cloneImage(cell);
    if (!image) return null;

    const link = cell.querySelector('img')?.closest('a[href]');
    if (!link) return image;

    const anchor = document.createElement('a');
    anchor.href = link.getAttribute('href');
    if (link.hasAttribute('rel')) anchor.rel = link.getAttribute('rel');
    if (link.hasAttribute('target')) anchor.target = link.getAttribute('target');
    anchor.append(image);
    return anchor;
  }

  function cloneImage(cell) {
    const source = cell?.querySelector?.('img[src]');
    const slot = cell?.querySelector?.('.orte-image-slot[data-orte-image-key]');
    const slotImage = !source ? getInlineSlotImage(slot) : null;
    const src = source?.getAttribute('src') || slotImage?.src || '';
    if (!src) {
      const slot = cell?.querySelector?.('.orte-image-slot, .orte-image-placeholder');
      const label = slot?.getAttribute?.('aria-label') || getCleanText(slot);
      if (!label) return null;

      const placeholder = document.createElement('span');
      placeholder.className = 'kingdom-card-image-placeholder';
      placeholder.textContent = label;
      return placeholder;
    }

    const image = document.createElement('img');
    image.src = src;
    image.alt = source?.getAttribute('alt') || slotImage?.alt || '';
    image.loading = 'lazy';
    image.decoding = 'async';
    return image;
  }

  function getInlineSlotImage(slot) {
    if (!slot) return null;

    const runtimeSrc = slot.dataset?.orteRenderedImageSrc || '';
    if (runtimeSrc) {
      return {
        src: runtimeSrc,
        href: slot.dataset.orteRenderedImageHref || '',
        alt: slot.dataset.orteRenderedImageAlt || slot.getAttribute('aria-label') || ''
      };
    }

    const fallbackSrc = slot.dataset?.orteTemplateImageSrc || '';
    if (!fallbackSrc) return null;
    return {
      src: fallbackSrc,
      href: slot.dataset.orteTemplateImageHref || '',
      alt: slot.dataset.orteTemplateImageAlt || slot.getAttribute('aria-label') || ''
    };
  }

  function getTableColumnCount(table) {
    return Math.max(1, ...Array.from(table.rows || []).map((row) => (
      Array.from(row.cells || []).reduce((sum, cell) => sum + (Number(cell.colSpan) || 1), 0)
    )));
  }

  function isFullTextRow(row, columnCount) {
    return row?.cells?.length === 1
      && Number(row.cells[0].colSpan || 1) >= columnCount
      && !rowHasImages(row)
      && !!getCleanText(row);
  }

  function isFullImageRow(row, columnCount) {
    return row?.cells?.length === 1
      && Number(row.cells[0].colSpan || 1) >= columnCount
      && rowHasImages(row);
  }

  function isPlaceTypeRow(row, columnCount) {
    return row
      && !isFullTextRow(row, columnCount)
      && !rowHasImages(row)
      && Array.from(row.cells || []).some((cell) => getCleanText(cell));
  }

  function isPlaceNameRow(row, columnCount) {
    return isPlaceTypeRow(row, columnCount);
  }

  function rowHasImages(row) {
    return !!row?.querySelector?.('img[src], .orte-image-slot, .orte-image-placeholder');
  }

  function isFamilyDeletedCell(cell) {
    return cell?.dataset?.kingdomFamilyDeleted === '1';
  }

  function isEmptyRow(row) {
    return !rowHasImages(row) && !getCleanText(row);
  }

  function isMapCell(cell) {
    const image = cell?.querySelector?.('img');
    if (!image && cell?.querySelector?.('.orte-image-slot, .orte-image-placeholder')) {
      const label = getImageSlotLabel(cell).toLowerCase();
      return label.includes('karte') || label.includes('map');
    }
    if (!image) return false;
    const width = parseCssPixels(image.style.width || image.getAttribute('width'));
    const height = parseCssPixels(image.style.height || image.getAttribute('height'));
    const alt = `${image.getAttribute('alt') || ''} ${image.src || ''}`.toLowerCase();
    return width >= 500 || height >= 300 || alt.includes('karte') || alt.includes('map');
  }

  function isCenterLabelRow(row) {
    const text = getCleanText(row);
    if (!text || isPlaceGroupLabel(text)) return false;
    const cell = row.cells[0];
    const style = cell?.getAttribute('style') || '';
    return style.includes('153,0,0')
      || style.includes('153, 0, 0')
      || style.includes('51,51,51')
      || style.includes('51, 51, 51');
  }

  function isPlaceSeparatorRow(row, text) {
    if (!row || !text || isDomainTitle(text)) return false;
    const cell = row.cells?.[0];
    const style = cell?.getAttribute('style') || '';
    return style.includes('102,102,102')
      || style.includes('102, 102, 102')
      || style.includes('153,153,153')
      || style.includes('153, 153, 153');
  }

  function isDomainTitle(text) {
    return /^(herrschaft|baronie|gr[aä]fische\s+baronie|region)\b/i.test(text);
  }

  function isFamilySingleCardStart(row, imageRow, nameRow, columnCount) {
    const text = getCleanText(row);
    return !!text
      && !isFamilySectionTitle(row, text)
      && isFamilySeatLabelRow(row)
      && isFullImageRow(imageRow, columnCount)
      && isFullTextRow(nameRow, columnCount);
  }

  function isFamilySectionTitle(row, text) {
    if (!text) return false;
    return /h[aä]user|ritterh[aä]user|adel/i.test(text) && hasRowColor(row, ['0,0,0', '0, 0, 0', '51,51,51', '51, 51, 51']);
  }

  function isFamilyLiegeRow(row) {
    return row?.cells?.length > 1
      && hasRowText(row)
      && hasRowColor(row, ['102,102,102', '102, 102, 102']);
  }

  function isFamilySeatRow(row) {
    return row?.cells?.length >= 1
      && hasRowText(row)
      && hasRowColor(row, ['153,153,153', '153, 153, 153']);
  }

  function isFamilySeatLabelRow(row) {
    return hasRowText(row)
      && hasRowColor(row, ['153,153,153', '153, 153, 153']);
  }

  function hasRowText(row) {
    return Array.from(row?.cells || []).some((cell) => getCleanText(cell));
  }

  function hasRowColor(row, tokens) {
    const values = Array.from(row?.cells || []).map((cell) => cell.getAttribute('style') || '');
    return values.some((style) => tokens.some((token) => style.includes(token)));
  }

  function isPlaceGroupLabel(text) {
    return /siedlungen?\s*\/\s*orte/i.test(text)
      || /nicht\s+zugeteilte\s+orte/i.test(text)
      || /zentraler\s+ort/i.test(text);
  }

  function normalizePlaceGroupLabel(text) {
    if (/nicht\s+zugeteilte\s+orte/i.test(text)) return 'Nicht zugeteilt';
    if (/zentraler\s+ort/i.test(text)) return 'Zentrum';
    if (/siedlungen?\s*\/\s*orte/i.test(text)) return 'Siedlung/Ort';
    return getCleanText({ textContent: text }) || 'Ort';
  }

  function parseCssPixels(value) {
    const number = Number.parseFloat(String(value || '').replace(',', '.'));
    return Number.isFinite(number) ? number : 0;
  }

  function getCleanText(node) {
    const clone = node?.cloneNode?.(true);
    const source = clone || node;
    clone?.querySelectorAll?.([
      '.orte-image-slot',
      '.orte-image-placeholder',
      '.orte-image-placeholder-media'
    ].join(',')).forEach((item) => item.remove());

    return String(source?.textContent || '')
      .replace(/\u00c2/g, '')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getImageSlotLabel(cell) {
    const slot = cell?.querySelector?.('.orte-image-slot, .orte-image-placeholder');
    return slot?.dataset?.orteImageLabel
      || slot?.getAttribute?.('aria-label')
      || slot?.textContent
      || '';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

})();
