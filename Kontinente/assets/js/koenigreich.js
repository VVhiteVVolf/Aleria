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
  window.addEventListener('aleria-inline-images-rendered', scheduleCountyViewsRefresh);
  document.addEventListener('click', handleCountyGeographyAction);
  document.addEventListener('focusout', handleCountyGeographyTextCommit);
  document.addEventListener('click', handleCountyFamilyAction);

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

  let countyViewsRefreshTimer = 0;
  function scheduleCountyViewsRefresh() {
    window.clearTimeout(countyViewsRefreshTimer);
    countyViewsRefreshTimer = window.setTimeout(() => {
      enhanceCountyGeographyTables();
      enhanceCountyFamilyTables();
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
    const editing = document.body.classList.contains('orte-inline-editing');
    page.querySelectorAll('.kingdom-county-geography-table.is-county-card-source').forEach((table) => {
      table.setAttribute('aria-hidden', 'true');
    });
    page.querySelectorAll('.kingdom-county-family-table.is-family-card-source').forEach((table) => {
      table.setAttribute('aria-hidden', editing ? 'false' : 'true');
    });
    page.querySelectorAll('[data-kingdom-geography-edit]').forEach((node) => {
      node.contentEditable = String(editing);
      node.spellcheck = true;
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
    ensureGeographySourceId(table);

    const data = { title: '', titleSource: null, mapCell: null, mapSource: null, domains: [] };
    let currentDomain = null;
    let currentGroupLabel = '';
    let repairedImageCells = false;

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

      const hasImageContent = rowHasImages(row) || rowHasImageFallbacks(table, row, index);
      if (!currentDomain || !hasImageContent) continue;

      const previousRow = rows[index - 1];
      const nextRow = rows[index + 1];
      const typeRow = previousRow && isPlaceTypeRow(previousRow, columnCount) ? previousRow : null;
      const nameRow = nextRow && isPlaceNameRow(nextRow, columnCount) ? nextRow : null;
      if (!nameRow) continue;

      repairedImageCells = repairGeographyImageRow(table, row, index) || repairedImageCells;
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
      applyGeographySourceDataset(mapPanel, data.mapSource);
      mapPanel.append(renderGeographyControls(data.mapSource, [{ action: 'edit-image', label: 'Bild' }]));
      const title = document.createElement('h3');
      title.textContent = data.title || 'Karte der Grafschaft';
      applyGeographySourceDataset(title, data.titleSource);
      title.dataset.kingdomGeographyEdit = 'text';
      mapPanel.append(title);
      const mapImage = cloneLinkedImage(data.mapCell);
      if (mapImage) mapPanel.append(mapImage);
      view.append(mapPanel);
    }

    data.domains
      .filter((domain) => domain.title || domain.crestCell || domain.center || domain.places.length)
      .forEach((domain) => view.append(renderDomainCard(domain)));

    if (repairedImageCells) {
      window.AleriaInlineEditor?.syncTableState?.(table);
    }

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
      if (!imageRow || !nameRow || !rowHasImages(imageRow) || !isPlaceNameRow(nameRow, columnCount)) continue;

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

  function renderFamilySection(section) {
    const block = document.createElement('section');
    block.className = 'kingdom-family-section';

    const title = document.createElement('h3');
    title.textContent = section.title || 'Adelshaeuser';
    block.append(title);

    block.append(renderFamilySectionControls(section));

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
    const element = document.createElement('article');
    element.className = `kingdom-family-card${featured ? ' is-family-featured' : ''}`;
    applyFamilySourceDataset(element, card.source);

    element.append(renderFamilyCardControls(card.source));

    const meta = document.createElement('div');
    meta.className = 'kingdom-family-meta';
    if (card.liege) meta.append(renderFamilyMetaItem('Lehenstreue', card.liege));
    if (card.seat) meta.append(renderFamilyMetaItem('Sitz', card.seat));
    element.append(meta);

    const crest = document.createElement('div');
    crest.className = 'kingdom-family-crest';
    if (card.image && card.href) {
      const link = document.createElement('a');
      link.href = card.href;
      link.rel = 'noopener noreferrer';
      link.target = '_blank';
      link.append(card.image);
      crest.append(link);
    } else if (card.image) {
      crest.append(card.image);
    }
    element.append(crest);

    const name = document.createElement('strong');
    name.className = 'kingdom-family-name';
    name.textContent = card.name || 'Unbenanntes Haus';
    element.append(name);
    return element;
  }

  function renderFamilySectionControls(section) {
    const controls = document.createElement('div');
    controls.className = 'kingdom-family-section-controls';
    controls.dataset.kingdomFamilySourceId = section.table?.dataset?.kingdomFamilySourceId || '';
    controls.dataset.kingdomFamilyTitleRow = String(section.titleRowIndex);
    controls.innerHTML = `
      <button type="button" data-kingdom-family-action="add-row">+ Reihe</button>
      <button type="button" data-kingdom-family-action="add-card">+ Haus</button>
    `;
    return controls;
  }

  function renderFamilyCardControls(source) {
    const controls = document.createElement('div');
    controls.className = 'kingdom-family-card-controls';
    applyFamilySourceDataset(controls, source);
    if (source?.kind === 'single') {
      controls.innerHTML = '<button type="button" data-kingdom-family-action="edit-image" title="Bild bearbeiten">Bild</button>';
      return controls;
    }

    controls.innerHTML = `
      <button type="button" data-kingdom-family-action="edit-image" title="Bild bearbeiten">Bild</button>
      <button type="button" data-kingdom-family-action="add-after" title="Haus danach einfuegen">+</button>
      <button type="button" data-kingdom-family-action="move-left" title="Nach links verschieben">&larr;</button>
      <button type="button" data-kingdom-family-action="move-right" title="Nach rechts verschieben">&rarr;</button>
      <button type="button" data-kingdom-family-action="remove" title="Haus entfernen">-</button>
    `;
    return controls;
  }

  function applyFamilySourceDataset(element, source) {
    if (!element || !source?.table) return;
    element.dataset.kingdomFamilySourceId = source.table.dataset.kingdomFamilySourceId || '';
    element.dataset.kingdomFamilyKind = source.kind || 'grid';
    element.dataset.kingdomFamilyCell = String(source.cellIndex ?? 0);
    element.dataset.kingdomFamilySeatRow = String(source.seatRowIndex ?? -1);
    element.dataset.kingdomFamilyImageRow = String(source.imageRowIndex ?? -1);
    element.dataset.kingdomFamilyNameRow = String(source.nameRowIndex ?? -1);
    element.dataset.kingdomFamilyLiegeRow = String(source.liegeRowIndex ?? -1);
    element.dataset.kingdomFamilyTitleRow = String(source.titleRowIndex ?? -1);
  }

  function handleCountyFamilyAction(event) {
    const button = event.target.closest('[data-kingdom-family-action]');
    if (!button || !page.contains(button) || !document.body.classList.contains('orte-inline-editing')) return;

    const action = button.dataset.kingdomFamilyAction;
    const sourceElement = button.closest('[data-kingdom-family-source-id]') || button;
    const source = getFamilyActionSource(sourceElement);
    if (!source.table) return;

    event.preventDefault();
    event.stopPropagation();

    if (action === 'edit-image') editFamilyCardImage(source);
    if (action === 'add-after') addFamilyCardAfter(source);
    if (action === 'remove') removeFamilyCard(source);
    if (action === 'move-left') moveFamilyCard(source, -1);
    if (action === 'move-right') moveFamilyCard(source, 1);
    if (action === 'add-row') addFamilyRowToSection(source);
    if (action === 'add-card') addFamilyCardToSection(source);

    notifyFamilyTableChanged(source.table);
  }

  function getFamilyActionSource(element) {
    const sourceId = element?.dataset?.kingdomFamilySourceId || '';
    const table = sourceId ? page.querySelector(`table[data-kingdom-family-source-id="${cssEscape(sourceId)}"]`) : null;
    return {
      table,
      kind: element?.dataset?.kingdomFamilyKind || 'grid',
      cellIndex: Number(element?.dataset?.kingdomFamilyCell) || 0,
      titleRowIndex: Number(element?.dataset?.kingdomFamilyTitleRow),
      seatRowIndex: Number(element?.dataset?.kingdomFamilySeatRow),
      imageRowIndex: Number(element?.dataset?.kingdomFamilyImageRow),
      nameRowIndex: Number(element?.dataset?.kingdomFamilyNameRow),
      liegeRowIndex: Number(element?.dataset?.kingdomFamilyLiegeRow)
    };
  }

  function editFamilyCardImage(source) {
    const cell = getFamilySourceCell(source.table, source.imageRowIndex, source.cellIndex);
    const slot = cell?.querySelector?.('.orte-image-slot[data-orte-image-key]');
    if (slot) {
      window.AleriaInlineEditor?.editImageSlot?.(slot);
      return;
    }

    if (cell) {
      cell.innerHTML = '<span class="orte-image-slot" data-orte-image-label="Bildplatzhalter" aria-label="Bildplatzhalter"></span>';
      window.AleriaInlineEditor?.notifyTableChanged?.(source.table);
      const nextSlot = cell.querySelector('.orte-image-slot[data-orte-image-key], .orte-image-slot');
      window.setTimeout(() => window.AleriaInlineEditor?.editImageSlot?.(nextSlot), 60);
    }
  }

  function addFamilyCardAfter(source) {
    const sourceRows = getFamilySourceRows(source);
    const currentColumnCount = Math.max(0, ...sourceRows.map(({ row }) => row?.cells?.length || 0));
    if (currentColumnCount >= getFamilyColumnLimit(source.table)) {
      addFamilyRowToSection(source, 1);
      return;
    }

    const nextIndex = Math.max(0, source.cellIndex + 1);
    sourceRows.forEach(({ row, role }) => {
      if (!row) return;
      const reference = row.cells[Math.min(source.cellIndex, row.cells.length - 1)] || row.cells[row.cells.length - 1];
      const cell = cloneFamilyCell(reference, role);
      row.insertBefore(cell, row.cells[nextIndex] || null);
    });
  }

  function addFamilyCardToSection(source) {
    const rowSet = getLastFamilyGridRowSet(source.table, source.titleRowIndex);
    if (!rowSet?.seatRow || !rowSet?.imageRow || !rowSet?.nameRow) {
      addFamilyRowToSection(source);
      return;
    }

    const nextIndex = rowSet.seatRow.cells.length;
    if (nextIndex >= getFamilyColumnLimit(source.table)) {
      addFamilyRowToSection(source, 1);
      return;
    }

    [
      { row: rowSet.liegeRow, role: 'liege' },
      { row: rowSet.seatRow, role: 'seat' },
      { row: rowSet.imageRow, role: 'image' },
      { row: rowSet.nameRow, role: 'name' }
    ].forEach(({ row, role }) => {
      if (!row) return;
      const reference = row.cells[row.cells.length - 1];
      const cell = cloneFamilyCell(reference, role);
      row.insertBefore(cell, row.cells[nextIndex] || null);
    });
  }

  function addFamilyRowToSection(source, requestedColumnCount = 0) {
    const table = source.table;
    const rows = Array.from(table?.tBodies[0]?.rows || []);
    if (!table || !rows.length) return;

    const insertBefore = getNextFamilySectionRow(table, source.titleRowIndex);
    const columnCount = requestedColumnCount > 0 ? requestedColumnCount : getFamilyColumnLimit(table);
    const rowSet = getLastFamilyGridRowSet(table, source.titleRowIndex);
    const seatRow = createFamilyTableRow(rowSet?.seatRow, 'seat', columnCount);
    const imageRow = createFamilyTableRow(rowSet?.imageRow, 'image', columnCount);
    const nameRow = createFamilyTableRow(rowSet?.nameRow, 'name', columnCount);
    const tbody = table.tBodies[0];

    tbody.insertBefore(seatRow, insertBefore);
    tbody.insertBefore(imageRow, insertBefore);
    tbody.insertBefore(nameRow, insertBefore);
  }

  function removeFamilyCard(source) {
    if (source.kind === 'grid') {
      getFamilySourceRows(source).forEach(({ row, role }) => {
        const cell = row?.cells?.[source.cellIndex];
        if (!cell) return;
        resetFamilyCell(cell, role);
        cell.dataset.kingdomFamilyDeleted = '1';
      });
      return;
    }

    getFamilySourceRows(source).forEach(({ row, role }) => {
      const cell = row?.cells?.[source.cellIndex];
      if (!cell) return;
      resetFamilyCell(cell, role);
    });
  }

  function moveFamilyCard(source, direction) {
    const targetIndex = source.cellIndex + direction;
    if (targetIndex < 0) return;

    getFamilySourceRows(source).forEach(({ row }) => {
      const cells = row?.cells || [];
      if (!cells[source.cellIndex] || !cells[targetIndex]) return;
      swapFamilyCells(cells[source.cellIndex], cells[targetIndex]);
    });
  }

  function getFamilySourceRows(source) {
    return [
      { row: getFamilySourceRow(source.table, source.liegeRowIndex), role: 'liege' },
      { row: getFamilySourceRow(source.table, source.seatRowIndex), role: 'seat' },
      { row: getFamilySourceRow(source.table, source.imageRowIndex), role: 'image' },
      { row: getFamilySourceRow(source.table, source.nameRowIndex), role: 'name' }
    ].filter((item) => item.row);
  }

  function getFamilySourceRow(table, rowIndex) {
    const rows = Array.from(table?.tBodies[0]?.rows || []);
    return rowIndex >= 0 ? rows[rowIndex] || null : null;
  }

  function getFamilySourceCell(table, rowIndex, cellIndex) {
    return getFamilySourceRow(table, rowIndex)?.cells?.[cellIndex] || null;
  }

  function getFamilyColumnLimit(table) {
    return Math.max(1, getTableColumnCount(table));
  }

  function cloneFamilyCell(reference, role) {
    const cell = reference ? reference.cloneNode(false) : document.createElement('td');
    cell.colSpan = 1;
    resetFamilyCell(cell, role);
    return cell;
  }

  function resetFamilyCell(cell, role) {
    if (!cell) return;
    cell.removeAttribute('data-orte-inline-text');
    delete cell.dataset.kingdomFamilyDeleted;
    cell.removeAttribute('contenteditable');
    if (role === 'image') {
      cell.innerHTML = '<span class="orte-image-slot" data-orte-image-label="Bildplatzhalter" aria-label="Bildplatzhalter"></span>';
      return;
    }
    cell.innerHTML = role === 'name' || role === 'seat' ? '<b>...</b>' : '&nbsp;';
  }

  function swapFamilyCells(first, second) {
    const firstHtml = first.innerHTML;
    first.innerHTML = second.innerHTML;
    second.innerHTML = firstHtml;
  }

  function createFamilyTableRow(templateRow, role, columnCount) {
    const row = templateRow ? templateRow.cloneNode(false) : document.createElement('tr');
    row.innerHTML = '';
    for (let index = 0; index < columnCount; index += 1) {
      row.append(cloneFamilyCell(templateRow?.cells?.[Math.min(index, templateRow.cells.length - 1)], role));
    }
    return row;
  }

  function getLastFamilyGridRowSet(table, titleRowIndex) {
    const rows = Array.from(table?.tBodies[0]?.rows || []);
    let last = null;
    const start = Number.isFinite(titleRowIndex) && titleRowIndex >= 0 ? titleRowIndex + 1 : 0;

    for (let index = start; index < rows.length - 2; index += 1) {
      const text = getCleanText(rows[index]);
      if (index > start && isFamilySectionTitle(rows[index], text)) break;
      if (!isFamilySeatRow(rows[index])) continue;

      const imageRow = rows[index + 1];
      const nameRow = rows[index + 2];
      if (!imageRow || !nameRow || !rowHasImages(imageRow) || !isPlaceNameRow(nameRow, getTableColumnCount(table))) continue;
      last = {
        liegeRow: isFamilyLiegeRow(rows[index - 1]) ? rows[index - 1] : null,
        seatRow: rows[index],
        imageRow,
        nameRow
      };
    }
    return last;
  }

  function getNextFamilySectionRow(table, titleRowIndex) {
    const rows = Array.from(table?.tBodies[0]?.rows || []);
    const start = Number.isFinite(titleRowIndex) && titleRowIndex >= 0 ? titleRowIndex + 1 : 0;
    for (let index = start; index < rows.length; index += 1) {
      const text = getCleanText(rows[index]);
      if (index > start && isFamilySectionTitle(rows[index], text)) return rows[index];
    }
    return null;
  }

  function notifyFamilyTableChanged(table) {
    window.AleriaInlineEditor?.notifyTableChanged?.(table, { rebuild: false });
    renderCountyFamilyView(table);
    syncCountyViewMode();
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
    applyGeographySourceDataset(section, domain.titleSource);

    const header = document.createElement('header');
    header.className = 'kingdom-domain-header';

    const crest = cloneLinkedImage(domain.crestCell, getGeographyTableImage(domain.crestSource));
    if (crest) {
      const crestWrap = document.createElement('div');
      crestWrap.className = 'kingdom-domain-crest';
      applyGeographySourceDataset(crestWrap, domain.crestSource);
      crestWrap.append(renderGeographyControls(domain.crestSource, [{ action: 'edit-image', label: 'Bild' }]));
      crestWrap.append(crest);
      header.append(crestWrap);
    }

    const titleWrap = document.createElement('div');
    titleWrap.className = 'kingdom-domain-title';
    const title = document.createElement('h3');
    title.textContent = domain.title || 'Herrschaft';
    applyGeographySourceDataset(title, domain.titleSource);
    title.dataset.kingdomGeographyEdit = 'text';
    titleWrap.append(title);
    if (domain.center && domain.places.length) {
      const center = document.createElement('p');
      center.append(document.createTextNode('Zentrum: '));
      const centerValue = document.createElement('strong');
      centerValue.textContent = domain.center;
      applyGeographySourceDataset(centerValue, domain.centerSource);
      centerValue.dataset.kingdomGeographyEdit = 'text';
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
      const centerImage = cloneImage(domain.centerCell, getGeographyTableImage(domain.centerImageSource));
      centerPanel.classList.toggle('has-center-icon', !!centerImage);
      if (centerImage) {
        const imageFrame = document.createElement('span');
        imageFrame.className = 'kingdom-domain-center-icon';
        applyGeographySourceDataset(imageFrame, domain.centerImageSource);
        imageFrame.append(renderGeographyControls(domain.centerImageSource, [{ action: 'edit-image', label: 'Bild' }]));
        imageFrame.append(centerImage);
        centerPanel.append(imageFrame);
      }
      const label = document.createElement('span');
      label.className = 'kingdom-domain-center-label';
      label.textContent = 'Zentrum';
      const value = document.createElement('strong');
      value.className = 'kingdom-domain-center-name';
      value.textContent = domain.center;
      applyGeographySourceDataset(value, domain.centerSource);
      value.dataset.kingdomGeographyEdit = 'text';
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
    applyGeographySourceDataset(card, place.source);
    card.append(renderGeographyControls(place.source, [{ action: 'edit-image', label: 'Bild' }]));

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
      applyGeographySourceDataset(type, place.typeSource);
      if (place.typeSource) type.dataset.kingdomGeographyEdit = 'text';
      card.append(type);

    const name = document.createElement('strong');
      name.className = 'kingdom-place-name';
      name.textContent = place.name || 'Unbenannter Ort';
      applyGeographySourceDataset(name, place.nameSource);
      if (place.nameSource) name.dataset.kingdomGeographyEdit = 'text';
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
      const fallbackImage = isInlineImageCleared(cell) ? null : getGeographyTableImage(source);
      const image = cloneImage(cell, fallbackImage);
      const name = getCleanText(nameCells[index]);
      const type = getCleanText(typeCells[index]) || fallbackType;
      const href = getImageHref(cell) || fallbackImage?.href || '';
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

  function rowHasImageFallbacks(table, row, rowIndex) {
    return Array.from(row?.cells || []).some((cell, cellIndex) => (
      !!getGeographyTableImage(createGeographySource(table, 'place-image', rowIndex, cellIndex))?.src
    ));
  }

  function repairGeographyImageRow(table, row, rowIndex) {
    let repaired = false;
    Array.from(row?.cells || []).forEach((cell, cellIndex) => {
      const image = getGeographyTableImage(createGeographySource(table, 'place-image', rowIndex, cellIndex));
      if (!image?.src) return;

      const existingSlot = cell.querySelector('.orte-image-slot[data-orte-image-key], .orte-image-slot');
      if (existingSlot) {
        if (shouldRepairLegacyGeographySlot(existingSlot, image)) {
          applyGeographyFallbackSlot(table, existingSlot, image, rowIndex, cellIndex);
          repaired = true;
        }
        return;
      }

      if (cell.querySelector('img[src]')) return;

      const slot = document.createElement('span');
      slot.className = 'orte-image-slot has-image';
      applyGeographyFallbackSlot(table, slot, image, rowIndex, cellIndex);
      cell.append(slot);
      repaired = true;
    });
    return repaired;
  }

  function shouldRepairLegacyGeographySlot(slot, fallbackImage) {
    if (!slot || !fallbackImage?.src || isInlineSlotCleared(slot)) return false;
    const key = slot.dataset?.orteImageKey || '';
    if (key.startsWith('geography-')) return false;

    const currentSrc = slot.dataset?.orteRenderedImageSrc
      || slot.querySelector?.('img[src]')?.getAttribute('src')
      || (key ? window.AleriaInlineImages?.getImage?.(key)?.src : '')
      || '';
    if (!currentSrc || currentSrc === fallbackImage.src) return false;

    return key.startsWith('bild-') || !key;
  }

  function applyGeographyFallbackSlot(table, slot, image, rowIndex, cellIndex) {
    slot.dataset.orteImageKey = createGeographyRepairImageKey(table, rowIndex, cellIndex);
    slot.dataset.orteImageLabel = image.alt || getImageFileName(image.src) || 'Bildplatzhalter';
    slot.dataset.orteTemplateImageSrc = image.src;
    slot.dataset.orteTemplateImageHref = image.href || '';
    slot.dataset.orteTemplateImageAlt = image.alt || '';
    slot.setAttribute('aria-label', image.alt || 'Bildplatzhalter');
    delete slot.dataset.orteRenderedImageSrc;
    delete slot.dataset.orteRenderedImageHref;
    delete slot.dataset.orteRenderedImageAlt;
    slot.innerHTML = '';
  }

  function getGeographyTableImage(source) {
    if (!source?.table) return null;
    const tableId = source.table.dataset.orteTableId || '';
    return window.AleriaInlineImages?.getTableImage?.(tableId, source.rowIndex, source.cellIndex, 0) || null;
  }

  function createGeographyRepairImageKey(table, rowIndex, cellIndex) {
    const tableId = String(table?.dataset?.orteTableId || 'table')
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-|-$/g, '') || 'table';
    return `geography-${tableId}-r${rowIndex}-c${cellIndex}`;
  }

  function getImageFileName(src) {
    try {
      return new URL(src, document.baseURI).pathname.split('/').pop() || '';
    } catch (error) {
      return String(src || '').split('/').pop() || '';
    }
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

  function applyGeographySourceDataset(element, source) {
    if (!element || !source?.table) return;
    element.dataset.kingdomGeographySourceId = source.table.dataset.kingdomGeographySourceId || '';
    element.dataset.kingdomGeographyKind = source.kind || '';
    element.dataset.kingdomGeographyRow = String(source.rowIndex ?? -1);
    element.dataset.kingdomGeographyCell = String(source.cellIndex ?? -1);
  }

  function renderGeographyControls(source, actions) {
    const controls = document.createElement('div');
    controls.className = 'kingdom-geography-controls';
    applyGeographySourceDataset(controls, source);
    controls.innerHTML = (actions || [])
      .map((item) => `<button type="button" data-kingdom-geography-action="${escapeHtml(item.action)}">${escapeHtml(item.label)}</button>`)
      .join('');
    return controls;
  }

  function handleCountyGeographyAction(event) {
    const button = event.target.closest('[data-kingdom-geography-action]');
    if (!button || !page.contains(button) || !document.body.classList.contains('orte-inline-editing')) return;

    const sourceElement = button.closest('[data-kingdom-geography-source-id]') || button;
    const source = getGeographyActionSource(sourceElement);
    if (!source.table) return;

    event.preventDefault();
    event.stopPropagation();

    if (button.dataset.kingdomGeographyAction === 'edit-image') {
      editGeographyImage(source);
    }
  }

  function handleCountyGeographyTextCommit(event) {
    const editable = event.target.closest('[data-kingdom-geography-edit]');
    if (!editable || !page.contains(editable) || !document.body.classList.contains('orte-inline-editing')) return;

    const source = getGeographyActionSource(editable);
    const cell = getGeographySourceCell(source);
    if (!cell) return;

    const value = getCleanText(editable) || '...';
    cell.innerHTML = `<b>${escapeHtml(value)}</b>`;
    notifyGeographyTableChanged(source.table);
  }

  function getGeographyActionSource(element) {
    const sourceId = element?.dataset?.kingdomGeographySourceId || '';
    const table = sourceId ? page.querySelector(`table[data-kingdom-geography-source-id="${cssEscape(sourceId)}"]`) : null;
    return {
      table,
      kind: element?.dataset?.kingdomGeographyKind || '',
      rowIndex: Number(element?.dataset?.kingdomGeographyRow),
      cellIndex: Number(element?.dataset?.kingdomGeographyCell)
    };
  }

  function getGeographySourceCell(source) {
    const rows = Array.from(source?.table?.tBodies?.[0]?.rows || []);
    return source?.rowIndex >= 0 ? rows[source.rowIndex]?.cells?.[source.cellIndex] || null : null;
  }

  function editGeographyImage(source) {
    const cell = getGeographySourceCell(source);
    const slot = cell?.querySelector?.('.orte-image-slot[data-orte-image-key], .orte-image-slot');
    if (slot?.dataset?.orteImageKey) {
      window.AleriaInlineEditor?.editImageSlot?.(slot);
      return;
    }

    if (slot) {
      window.AleriaInlineEditor?.notifyTableChanged?.(source.table);
      window.setTimeout(() => {
        const normalizedSlot = cell.querySelector('.orte-image-slot[data-orte-image-key]');
        window.AleriaInlineEditor?.editImageSlot?.(normalizedSlot || slot);
      }, 60);
      return;
    }

    if (cell) {
      cell.innerHTML = '<span class="orte-image-slot" data-orte-image-label="Bildplatzhalter" aria-label="Bildplatzhalter"></span>';
      window.AleriaInlineEditor?.notifyTableChanged?.(source.table);
      const nextSlot = cell.querySelector('.orte-image-slot[data-orte-image-key], .orte-image-slot');
      window.setTimeout(() => window.AleriaInlineEditor?.editImageSlot?.(nextSlot), 60);
    }
  }

  function notifyGeographyTableChanged(table) {
    window.AleriaInlineEditor?.notifyTableChanged?.(table, { rebuild: false });
    renderCountyGeographyView(table);
    syncCountyViewMode();
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

  function cloneLinkedImage(cell, fallbackImage = null) {
    if (!cell) return null;
    const image = cloneImage(cell, fallbackImage);
    if (!image) return null;

    const link = cell.querySelector('img')?.closest('a[href]');
    if (!link && !fallbackImage?.href) return image;

    const anchor = document.createElement('a');
    anchor.href = link?.getAttribute('href') || fallbackImage.href;
    anchor.rel = link?.getAttribute('rel') || 'noopener noreferrer';
    anchor.target = link?.getAttribute('target') || '_blank';
    anchor.append(image);
    return anchor;
  }

  function cloneImage(cell, fallbackImage = null) {
    const source = cell?.querySelector?.('img[src]');
    const slot = cell?.querySelector?.('.orte-image-slot[data-orte-image-key]');
    const isCleared = isInlineSlotCleared(slot);
    const slotImage = !source && !isCleared ? getInlineSlotImage(slot) : null;
    const src = source?.getAttribute('src') || slotImage?.src || (!isCleared ? fallbackImage?.src : '') || '';
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
    image.alt = source?.getAttribute('alt') || slotImage?.alt || fallbackImage?.alt || '';
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

    const key = slot.dataset?.orteImageKey || '';
    const image = window.AleriaInlineImages?.getImage?.(key);
    if (image?.src) return image;
    if (image?.clearedAtClient) return null;

    const fallbackSrc = slot.dataset?.orteTemplateImageSrc || '';
    if (!fallbackSrc) return null;
    return {
      src: fallbackSrc,
      href: slot.dataset.orteTemplateImageHref || '',
      alt: slot.dataset.orteTemplateImageAlt || slot.getAttribute('aria-label') || ''
    };
  }

  function isInlineImageCleared(cell) {
    return isInlineSlotCleared(cell?.querySelector?.('.orte-image-slot[data-orte-image-key]'));
  }

  function isInlineSlotCleared(slot) {
    const key = slot?.dataset?.orteImageKey || '';
    if (!key) return false;
    return !!window.AleriaInlineImages?.getImage?.(key)?.clearedAtClient;
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

  function cssEscape(value) {
    if (window.CSS?.escape) return window.CSS.escape(String(value || ''));
    return String(value || '').replace(/["\\]/g, '\\$&');
  }
})();
