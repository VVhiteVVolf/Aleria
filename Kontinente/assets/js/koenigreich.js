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

  enhanceCountyGeographyTables();
  enhanceCountyFamilyTables();

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
    const offset = document.querySelector('.orte-inline-toolbar')?.offsetHeight || 0;
    const top = target.getBoundingClientRect().top + window.scrollY - offset - 12;
    window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
  }

  function enhanceCountyGeographyTables() {
    page.querySelectorAll('.kingdom-county-geography-table').forEach((table) => {
      renderCountyGeographyView(table);
      observeCountyGeographyTable(table);
    });
    syncCountyViewMode();
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
    if (wrapper) wrapper.classList.add('is-county-card-source-wrapper');
    anchor.insertAdjacentElement('afterend', view);
    countyCardViews.set(table, view);
    if (window.location.hash) window.setTimeout(scrollToCurrentHash, 40);
  }

  function syncCountyViewMode() {
    const editing = document.body.classList.contains('orte-inline-editing');
    page.querySelectorAll('.kingdom-county-geography-table.is-county-card-source').forEach((table) => {
      table.setAttribute('aria-hidden', editing ? 'false' : 'true');
    });
    page.querySelectorAll('.kingdom-county-family-table.is-family-card-source').forEach((table) => {
      table.setAttribute('aria-hidden', editing ? 'false' : 'true');
    });
  }

  new MutationObserver(syncCountyViewMode).observe(document.body, {
    attributes: true,
    attributeFilter: ['class'],
  });

  function buildCountyGeographyView(table) {
    const rows = Array.from(table.tBodies[0]?.rows || []);
    if (!rows.length) return null;

    const columnCount = getTableColumnCount(table);
    const data = { title: '', mapCell: null, domains: [] };
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
        } else if (currentDomain) {
          if (currentDomain.center && !currentDomain.centerCell && !currentDomain.expectsCenter) {
            currentDomain.centerCell = imageCell;
          } else {
            currentDomain.crestCell = imageCell;
            currentDomain.expectsCenter = true;
          }
        }
        continue;
      }

      if (isFullTextRow(row, columnCount)) {
        if (!data.title) {
          data.title = text;
          continue;
        }

        if (currentDomain?.expectsCenter && isCenterLabelRow(row)) {
          currentDomain.center = text;
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
          places: [],
          expectsCenter: false,
        };
        data.domains.push(currentDomain);
        currentGroupLabel = '';
        continue;
      }

      if (!currentDomain || !rowHasImages(row)) continue;

      const previousRow = rows[index - 1];
      const nextRow = rows[index + 1];
      const typeRow = previousRow && isPlaceTypeRow(previousRow, columnCount) ? previousRow : null;
      const nameRow = nextRow && isPlaceNameRow(nextRow, columnCount) ? nextRow : null;
      if (!nameRow) continue;

      currentDomain.places.push(...extractPlaceCards(typeRow, row, nameRow, currentGroupLabel));
      index += 1;
    }

    const view = document.createElement('div');
    view.className = 'kingdom-county-card-view';

    if (data.mapCell) {
      const mapPanel = document.createElement('section');
      mapPanel.className = 'kingdom-county-map-panel';
      mapPanel.innerHTML = `<h3>${escapeHtml(data.title || 'Karte der Grafschaft')}</h3>`;
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
    anchor.insertAdjacentElement('afterend', view);
    familyCardViews.set(table, view);
  }

  function buildCountyFamilyView(table) {
    const rows = Array.from(table.tBodies[0]?.rows || []);
    if (!rows.length) return null;

    const columnCount = getTableColumnCount(table);
    const sections = [];
    let currentSection = null;
    let pendingLiegeCells = null;

    const ensureSection = (title = 'Adelshaeuser') => {
      if (currentSection) return currentSection;
      currentSection = { title, cards: [] };
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
            name: getCleanText(rows[index + 2])
          });
          index += 2;
          continue;
        }

        if (isFamilySectionTitle(row, text)) {
          currentSection = { title: text, cards: [] };
          sections.push(currentSection);
          pendingLiegeCells = null;
        }
        continue;
      }

      if (isFamilyLiegeRow(row)) {
        pendingLiegeCells = Array.from(row.cells || []);
        continue;
      }

      if (!isFamilySeatRow(row)) continue;

      const imageRow = rows[index + 1];
      const nameRow = rows[index + 2];
      if (!imageRow || !nameRow || !rowHasImages(imageRow) || !isPlaceNameRow(nameRow, columnCount)) continue;

      const section = ensureSection();
      const seatCells = Array.from(row.cells || []);
      const imageCells = Array.from(imageRow.cells || []);
      const nameCells = Array.from(nameRow.cells || []);

      imageCells.forEach((cell, cellIndex) => {
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
          name
        });
      });

      pendingLiegeCells = null;
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

  function renderFamilySection(section) {
    const block = document.createElement('section');
    block.className = 'kingdom-family-section';

    const title = document.createElement('h3');
    title.textContent = section.title || 'Adelshaeuser';
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
    if (regularCards.length) block.append(grid);
    return block;
  }

  function renderFamilyCard(card, featured = false) {
    const element = document.createElement(card.href ? 'a' : 'article');
    element.className = `kingdom-family-card${featured ? ' is-family-featured' : ''}`;
    if (card.href) {
      element.href = card.href;
      element.rel = 'noopener noreferrer';
      element.target = '_blank';
    }

    const meta = document.createElement('div');
    meta.className = 'kingdom-family-meta';
    if (card.liege) meta.append(renderFamilyMetaItem('Lehenstreue', card.liege));
    if (card.seat) meta.append(renderFamilyMetaItem('Sitz', card.seat));
    element.append(meta);

    const crest = document.createElement('div');
    crest.className = 'kingdom-family-crest';
    if (card.image) crest.append(card.image);
    element.append(crest);

    const name = document.createElement('strong');
    name.className = 'kingdom-family-name';
    name.textContent = card.name || 'Unbenanntes Haus';
    element.append(name);
    return element;
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
    titleWrap.innerHTML = `<h3>${escapeHtml(domain.title || 'Herrschaft')}</h3>`;
    if (domain.center && domain.places.length) {
      const center = document.createElement('p');
      center.textContent = `Zentrum: ${domain.center}`;
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

    const card = document.createElement(place.href ? 'a' : 'div');
    card.className = 'kingdom-place-card';
    if (place.href) {
      card.href = place.href;
      card.rel = 'noopener noreferrer';
      card.target = '_blank';
    }

    const iconFrame = document.createElement('span');
    iconFrame.className = 'kingdom-place-icon-frame';
    if (place.image) iconFrame.append(place.image);
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

  function extractPlaceCards(typeRow, imageRow, nameRow, groupLabel) {
    const typeCells = typeRow ? Array.from(typeRow.cells || []) : [];
    const imageCells = Array.from(imageRow.cells || []);
    const nameCells = Array.from(nameRow.cells || []);
    const fallbackType = normalizePlaceGroupLabel(groupLabel);

    return imageCells.map((cell, index) => {
      const image = cloneImage(cell);
      const name = getCleanText(nameCells[index]);
      const type = getCleanText(typeCells[index]) || fallbackType;
      const href = getImageHref(cell);
      return { image, name, type, href };
    }).filter((place) => place.image || place.name);
  }

  function getImageHref(cell) {
    return cell?.querySelector?.('img')?.closest('a[href]')?.getAttribute('href') || '';
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
    anchor.rel = link.getAttribute('rel') || 'noopener noreferrer';
    anchor.target = link.getAttribute('target') || '_blank';
    anchor.append(image);
    return anchor;
  }

  function cloneImage(cell) {
    const source = cell?.querySelector?.('img[src]');
    const src = source?.getAttribute('src') || '';
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
    image.alt = source.getAttribute('alt') || '';
    image.loading = 'lazy';
    image.decoding = 'async';
    return image;
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
    return row?.cells?.length > 1
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
      '.orte-table-add-control',
      '.orte-table-row-controls',
      '.orte-cell-image-insert',
      '.table-editor-toolbar',
      '.orte-inline-image-hint',
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
