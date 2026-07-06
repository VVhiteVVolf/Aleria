(function () {
  "use strict";

  const TOOLBAR_ACTIONS = new Set([
    "focus-cell",
    "insert-row-before",
    "insert-row-after",
    "remove-row",
    "insert-column-before",
    "insert-column-after",
    "remove-column",
    "clear-cell",
    "merge-selected-cells",
  ]);

  class AleriaTableEditor {
    constructor(options = {}) {
      this.root = options.root || document;
      this.getEditMode = typeof options.getEditMode === "function" ? options.getEditMode : () => false;
      this.onTableChanged = typeof options.onTableChanged === "function" ? options.onTableChanged : () => {};
      this.onCellInput = typeof options.onCellInput === "function" ? options.onCellInput : () => {};
      this.isIgnoredSurface = typeof options.isIgnoredSurface === "function" ? options.isIgnoredSurface : () => false;
      this.activeCell = null;
      this.selectedCells = new Set();
      this.selectionAnchorCell = null;
      this.toolbar = null;
      this.resizeTimer = 0;

      this.handleDocumentClick = this.handleDocumentClick.bind(this);
      this.handleDocumentInput = this.handleDocumentInput.bind(this);
      this.handleDocumentKeydown = this.handleDocumentKeydown.bind(this);
      this.handleWindowResize = this.handleWindowResize.bind(this);

      document.addEventListener("click", this.handleDocumentClick);
      document.addEventListener("input", this.handleDocumentInput);
      document.addEventListener("keydown", this.handleDocumentKeydown, true);
      window.addEventListener("resize", this.handleWindowResize, { passive: true });
    }

    destroy() {
      document.removeEventListener("click", this.handleDocumentClick);
      document.removeEventListener("input", this.handleDocumentInput);
      document.removeEventListener("keydown", this.handleDocumentKeydown, true);
      window.removeEventListener("resize", this.handleWindowResize);
      this.clearSelection();
      this.removeToolbar();
    }

    refresh() {
      if (!this.activeCell || !document.contains(this.activeCell)) {
        this.clearSelection();
        return;
      }

      if (!this.getEditMode()) {
        this.clearSelection();
        return;
      }

      this.placeToolbar();
    }

    setEditMode(enabled) {
      if (!enabled) {
        this.clearSelection();
        this.removeToolbar();
        return;
      }

      this.refresh();
    }

    handleDocumentClick(event) {
      const actionButton = event.target.closest("[data-table-editor-action]");
      if (actionButton && this.toolbar?.contains(actionButton)) {
        this.handleToolbarAction(actionButton, event);
        return;
      }

      if (!this.getEditMode()) return;
      const cell = event.target.closest("td, th");
      if (!cell || !this.root.contains(cell) || this.isIgnoredSurface(cell)) return;
      const table = this.getEditableTable(cell);
      if (!table) return;
      if (event.target.closest("[data-orte-image-key], [data-orte-rating-key], button, input, select, textarea, a")) return;

      if (event.shiftKey && this.selectionAnchorCell) {
        event.preventDefault();
        this.selectCellRange(this.selectionAnchorCell, cell);
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        this.toggleSelectedCell(cell);
        return;
      }

      this.selectCell(cell);
      this.focusCell(cell);
    }

    handleDocumentInput(event) {
      const editable = event.target.closest("[data-table-editor-cell]");
      if (!editable || !this.root.contains(editable)) return;
      const cell = editable.closest("td, th");
      const table = this.getEditableTable(cell);
      if (!table) return;
      this.onCellInput({ table, cell, editable });
    }

    handleDocumentKeydown(event) {
      if (!this.getEditMode()) return;
      const cell = event.target.closest?.("td, th") || this.activeCell;
      const table = this.getEditableTable(cell);
      if (!table) return;

      if (event.key === "Tab") {
        event.preventDefault();
        this.moveFocus(table, cell, event.shiftKey ? -1 : 1);
        return;
      }

      if (event.key === "Escape") {
        this.clearSelection();
        event.target.blur?.();
        return;
      }

      if (event.key === "Enter" && event.ctrlKey) {
        event.preventDefault();
        this.insertRow(cell.closest("tr"), "after");
      }
    }

    handleWindowResize() {
      window.clearTimeout(this.resizeTimer);
      this.resizeTimer = window.setTimeout(() => this.placeToolbar(), 80);
    }

    handleToolbarAction(button, event) {
      const action = button.dataset.tableEditorAction;
      if (!TOOLBAR_ACTIONS.has(action)) return;
      event.preventDefault();
      event.stopPropagation();

      const cell = this.activeCell;
      const table = this.getEditableTable(cell);
      if (!cell || !table) return;

      if (action === "focus-cell") this.focusCell(cell);
      if (action === "insert-row-before") this.insertRow(cell.closest("tr"), "before");
      if (action === "insert-row-after") this.insertRow(cell.closest("tr"), "after");
      if (action === "remove-row") this.removeRow(cell.closest("tr"));
      if (action === "insert-column-before") this.insertColumn(table, this.getCellColumnIndex(cell), "before");
      if (action === "insert-column-after") this.insertColumn(table, this.getCellColumnIndex(cell), "after");
      if (action === "remove-column") this.removeColumn(table, this.getCellColumnIndex(cell));
      if (action === "clear-cell") this.clearCell(cell);
      if (action === "merge-selected-cells") this.mergeSelectedCells();
    }

    getEditableTable(node) {
      const table = node?.closest?.("table[data-orte-table-id]");
      if (!table || !this.root.contains(table) || table.querySelector("table")) return null;
      return table;
    }

    selectCell(cell, options = {}) {
      if (this.activeCell === cell) {
        if (!options.keepSelection && this.selectedCells.size > 1) {
          this.clearSelection();
          this.activeCell = cell;
          this.selectionAnchorCell = cell;
          cell.classList.add("table-editor-active-cell");
          this.addSelectedCell(cell);
          cell.closest("table")?.classList.add("table-editor-active-table");
        }
        if (!this.selectedCells.has(cell)) this.addSelectedCell(cell);
        this.placeToolbar();
        return;
      }

      if (!options.keepSelection) this.clearSelection();
      this.activeCell = cell;
      this.selectionAnchorCell = cell;
      cell.classList.add("table-editor-active-cell");
      this.addSelectedCell(cell);
      cell.closest("table")?.classList.add("table-editor-active-table");
      this.renderToolbar();
      this.placeToolbar();
    }

    clearSelection() {
      this.root.querySelectorAll(".table-editor-active-cell").forEach((node) => {
        node.classList.remove("table-editor-active-cell");
      });
      this.root.querySelectorAll(".table-editor-selected-cell").forEach((node) => {
        node.classList.remove("table-editor-selected-cell");
      });
      this.root.querySelectorAll(".table-editor-active-table").forEach((node) => {
        node.classList.remove("table-editor-active-table");
      });
      this.activeCell = null;
      this.selectedCells.clear();
      this.selectionAnchorCell = null;
    }

    addSelectedCell(cell) {
      if (!cell) return;
      this.selectedCells.add(cell);
      cell.classList.add("table-editor-selected-cell");
    }

    removeSelectedCell(cell) {
      if (!cell) return;
      this.selectedCells.delete(cell);
      cell.classList.remove("table-editor-selected-cell");
      if (this.activeCell === cell) this.activeCell = this.getSelectedCells()[0] || null;
      if (this.selectionAnchorCell === cell) this.selectionAnchorCell = this.activeCell;
    }

    toggleSelectedCell(cell) {
      const table = this.getEditableTable(cell);
      const activeTable = this.getEditableTable(this.activeCell);
      if (!activeTable || activeTable !== table) {
        this.selectCell(cell);
        return;
      }

      if (this.selectedCells.has(cell) && this.selectedCells.size > 1) {
        this.removeSelectedCell(cell);
      } else {
        this.root.querySelectorAll(".table-editor-active-cell").forEach((node) => {
          node.classList.remove("table-editor-active-cell");
        });
        this.activeCell = cell;
        this.selectionAnchorCell = this.selectionAnchorCell || cell;
        cell.classList.add("table-editor-active-cell");
        this.addSelectedCell(cell);
      }

      cell.closest("table")?.classList.add("table-editor-active-table");
      this.renderToolbar();
      this.placeToolbar();
    }

    selectCellRange(startCell, endCell) {
      const table = this.getEditableTable(endCell);
      if (!table || this.getEditableTable(startCell) !== table || startCell.parentElement !== endCell.parentElement) {
        this.selectCell(endCell);
        return;
      }

      this.clearSelection();
      const cells = Array.from(endCell.parentElement.cells || []);
      const startIndex = cells.indexOf(startCell);
      const endIndex = cells.indexOf(endCell);
      if (startIndex < 0 || endIndex < 0) {
        this.selectCell(endCell);
        return;
      }

      const [from, to] = startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];
      cells.slice(from, to + 1).forEach((cell) => this.addSelectedCell(cell));
      this.activeCell = endCell;
      this.selectionAnchorCell = startCell;
      endCell.classList.add("table-editor-active-cell");
      table.classList.add("table-editor-active-table");
      this.renderToolbar();
      this.placeToolbar();
    }

    getSelectedCells() {
      const cells = Array.from(this.selectedCells);
      cells.forEach((cell) => {
        if (document.contains(cell)) return;
        this.selectedCells.delete(cell);
      });
      return cells.filter((cell) => document.contains(cell));
    }

    focusCell(cell) {
      if (!cell || this.cellContainsLockedWidget(cell)) return;
      this.selectCell(cell);
      const editable = this.ensureCellEditable(cell);
      if (!editable) return;
      editable.focus({ preventScroll: true });
      this.placeCaretAtEnd(editable);
    }

    ensureCellEditable(cell) {
      let editable = cell.querySelector(":scope > .orte-cell-editable, :scope > [data-table-editor-cell]");
      if (!editable) {
        editable = document.createElement("span");
        editable.className = "orte-cell-editable";
        while (cell.firstChild) editable.appendChild(cell.firstChild);
        cell.appendChild(editable);
      }

      editable.dataset.tableEditorCell = "";
      editable.dataset.orteInlineText = editable.dataset.orteInlineText || this.makeCellInlineId(cell);
      editable.contentEditable = "true";
      editable.spellcheck = true;
      return editable;
    }

    makeCellInlineId(cell) {
      const tableId = cell.closest("[data-orte-table-id]")?.dataset.orteTableId || "table";
      const rowIndex = cell.parentElement ? Array.from(cell.parentElement.parentElement?.children || []).indexOf(cell.parentElement) : 0;
      const cellIndex = Array.from(cell.parentElement?.cells || []).indexOf(cell);
      return `table-editor-${tableId}-${Math.max(0, rowIndex)}-${Math.max(0, cellIndex)}`;
    }

    placeCaretAtEnd(element) {
      const range = document.createRange();
      range.selectNodeContents(element);
      range.collapse(false);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }

    moveFocus(table, currentCell, direction) {
      const cells = this.getFocusableCells(table);
      if (!cells.length) return;
      const currentIndex = Math.max(0, cells.indexOf(currentCell));
      const nextIndex = (currentIndex + direction + cells.length) % cells.length;
      this.focusCell(cells[nextIndex]);
    }

    getFocusableCells(table) {
      return Array.from(table.tBodies[0]?.querySelectorAll("td, th") || [])
        .filter((cell) => !cell.matches(".orte-portrait-layout-spacer"))
        .filter((cell) => !cell.querySelector("[data-orte-image-key], [data-orte-rating-key]"));
    }

    insertRow(referenceRow, position) {
      if (!referenceRow) return;
      const table = this.getEditableTable(referenceRow);
      const clone = referenceRow.cloneNode(true);
      this.resetRow(clone);
      referenceRow.insertAdjacentElement(position === "before" ? "beforebegin" : "afterend", clone);
      this.notifyTableChanged(table, { rebuild: true });
      const firstCell = clone.querySelector("td, th");
      if (firstCell) window.setTimeout(() => this.focusCell(firstCell), 0);
    }

    removeRow(row) {
      const table = this.getEditableTable(row);
      if (!row || !table || this.isProtectedTable(table)) return;
      const rows = Array.from(table.tBodies[0]?.rows || []);
      if (rows.length <= 1) return;
      const nextRow = row.nextElementSibling || row.previousElementSibling;
      row.remove();
      this.notifyTableChanged(table, { rebuild: true });
      const nextCell = nextRow?.querySelector("td, th");
      if (nextCell) window.setTimeout(() => this.focusCell(nextCell), 0);
    }

    insertColumn(table, referenceIndex, position) {
      if (!this.canUseColumnCommands(table)) return;
      const targetIndex = position === "after" ? referenceIndex + 1 : referenceIndex;
      Array.from(table.tBodies[0]?.rows || []).forEach((row) => {
        const sourceCell = row.cells[Math.max(0, Math.min(referenceIndex, row.cells.length - 1))];
        const cell = sourceCell ? sourceCell.cloneNode(true) : document.createElement("td");
        this.resetCell(cell);
        const insertBefore = row.cells[targetIndex] || null;
        row.insertBefore(cell, insertBefore);
      });
      this.notifyTableChanged(table, { rebuild: true });
      const row = this.activeCell?.parentElement;
      const nextCell = row?.cells[targetIndex];
      if (nextCell) window.setTimeout(() => this.focusCell(nextCell), 0);
    }

    removeColumn(table, columnIndex) {
      if (!this.canUseColumnCommands(table)) return;
      const rows = Array.from(table.tBodies[0]?.rows || []);
      if (!rows.length || Math.max(...rows.map((row) => row.cells.length)) <= 1) return;
      rows.forEach((row) => row.cells[columnIndex]?.remove());
      this.notifyTableChanged(table, { rebuild: true });
      const nextCell = rows[0]?.cells[Math.max(0, columnIndex - 1)];
      if (nextCell) window.setTimeout(() => this.focusCell(nextCell), 0);
    }

    clearCell(cell) {
      if (!cell || this.cellContainsLockedWidget(cell)) return;
      cell.innerHTML = "&nbsp;";
      this.notifyTableChanged(this.getEditableTable(cell), { rebuild: true });
      window.setTimeout(() => this.focusCell(cell), 0);
    }

    resetRow(row) {
      row.querySelectorAll(".orte-table-row-controls, .table-editor-toolbar").forEach((node) => node.remove());
      row.querySelectorAll("[contenteditable], [data-orte-inline-text], [data-table-editor-cell]").forEach((node) => {
        node.removeAttribute("contenteditable");
        node.removeAttribute("data-orte-inline-text");
        node.removeAttribute("data-table-editor-cell");
      });
      row.querySelectorAll(".orte-cell-editable").forEach((node) => this.unwrap(node));
      Array.from(row.cells || []).forEach((cell) => this.resetCell(cell));
    }

    resetCell(cell) {
      cell.classList.remove("table-editor-active-cell");
      cell.classList.remove("table-editor-selected-cell");
      if (this.cellContainsLockedWidget(cell)) {
        cell.querySelectorAll("[data-orte-image-key]").forEach((slot) => {
          slot.removeAttribute("data-orte-image-key");
          slot.removeAttribute("data-orte-image-label");
          slot.innerHTML = "";
        });
        cell.querySelectorAll("[data-orte-rating-key], [data-orte-rating-kind]").forEach((node) => {
          node.removeAttribute("data-orte-rating-key");
          node.removeAttribute("data-orte-rating-kind");
          node.textContent = "...";
        });
        cell.querySelectorAll("img").forEach((image) => {
          image.removeAttribute("data-orte-inline-image-key");
          image.setAttribute("src", "");
          image.setAttribute("alt", "Bildplatzhalter");
        });
        return;
      }

      cell.innerHTML = "&nbsp;";
    }

    unwrap(node) {
      const parent = node?.parentNode;
      if (!parent) return;
      while (node.firstChild) parent.insertBefore(node.firstChild, node);
      node.remove();
    }

    cellContainsLockedWidget(cell) {
      return !!cell?.querySelector("[data-orte-image-key], [data-orte-rating-key], input, select, textarea, button");
    }

    getCellColumnIndex(cell) {
      return Array.from(cell?.parentElement?.cells || []).indexOf(cell);
    }

    canUseColumnCommands(table) {
      if (!table || this.isProtectedTable(table)) return false;
      const rows = Array.from(table.tBodies[0]?.rows || []);
      if (!rows.length) return false;
      return rows.every((row) => Array.from(row.cells || []).every((cell) => (
        Number(cell.colSpan || 1) === 1 && Number(cell.rowSpan || 1) === 1
      )));
    }

    canMergeSelectedCells() {
      const cells = this.getSelectedCells();
      if (cells.length < 2) return false;

      const table = this.getEditableTable(cells[0]);
      const row = cells[0].parentElement;
      if (!table || this.isProtectedTable(table)) return false;
      if (!cells.every((cell) => this.getEditableTable(cell) === table && cell.parentElement === row)) return false;
      if (cells.some((cell) => this.cellContainsLockedWidget(cell) || Number(cell.rowSpan || 1) !== 1)) return false;

      const rowCells = Array.from(row.cells || []);
      const indexes = cells.map((cell) => rowCells.indexOf(cell)).sort((a, b) => a - b);
      if (indexes.some((index) => index < 0)) return false;
      return indexes.every((index, offset) => offset === 0 || index === indexes[offset - 1] + 1);
    }

    mergeSelectedCells() {
      if (!this.canMergeSelectedCells()) return;

      const cells = this.getSelectedCells();
      const rowCells = Array.from(cells[0].parentElement.cells || []);
      const orderedCells = cells.sort((a, b) => rowCells.indexOf(a) - rowCells.indexOf(b));
      const target = orderedCells[0];
      const mergedColSpan = orderedCells.reduce((sum, cell) => sum + Number(cell.colSpan || 1), 0);
      const fragments = orderedCells
        .map((cell) => this.getMergeableCellHtml(cell))
        .filter(Boolean);

      target.colSpan = mergedColSpan;
      target.innerHTML = fragments.length ? fragments.join("<br>") : "&nbsp;";
      orderedCells.slice(1).forEach((cell) => cell.remove());

      const table = this.getEditableTable(target);
      this.clearSelection();
      this.selectCell(target);
      this.notifyTableChanged(table, { rebuild: true });
      window.setTimeout(() => this.focusCell(target), 0);
    }

    getMergeableCellHtml(cell) {
      const clone = cell.cloneNode(true);
      clone.querySelectorAll(".orte-table-row-controls, .table-editor-toolbar").forEach((node) => node.remove());
      clone.querySelectorAll("[contenteditable], [data-orte-inline-text], [data-table-editor-cell]").forEach((node) => {
        node.removeAttribute("contenteditable");
        node.removeAttribute("data-orte-inline-text");
        node.removeAttribute("data-table-editor-cell");
      });
      clone.querySelectorAll(".orte-cell-editable").forEach((node) => this.unwrap(node));
      clone.classList.remove("table-editor-active-cell", "table-editor-selected-cell");
      const html = clone.innerHTML.trim();
      return html === "&nbsp;" ? "" : html;
    }

    isProtectedTable(table) {
      return table?.dataset?.ortePortraitLayout
        || table?.classList?.contains("pt-s-0067")
        || table?.classList?.contains("haeuser-court-table")
        || table?.classList?.contains("haeuser-genealogy-table");
    }

    notifyTableChanged(table, detail = {}) {
      if (!table) return;
      this.onTableChanged({ table, ...detail });
      this.placeToolbar();
    }

    renderToolbar() {
      if (this.toolbar) return;
      const toolbar = document.createElement("div");
      toolbar.className = "table-editor-toolbar";
      toolbar.dataset.tableEditorToolbar = "";
      toolbar.innerHTML = `
        <button type="button" data-table-editor-action="focus-cell" title="Zelle bearbeiten">Zelle</button>
        <button type="button" data-table-editor-action="insert-row-before" title="Zeile oberhalb einfuegen">+ davor</button>
        <button type="button" data-table-editor-action="insert-row-after" title="Zeile unterhalb einfuegen">+ danach</button>
        <button type="button" data-table-editor-action="remove-row" title="Zeile entfernen">Zeile -</button>
        <button type="button" data-table-editor-action="insert-column-before" title="Spalte links einfuegen">+ links</button>
        <button type="button" data-table-editor-action="insert-column-after" title="Spalte rechts einfuegen">+ rechts</button>
        <button type="button" data-table-editor-action="remove-column" title="Spalte entfernen">Spalte -</button>
        <button type="button" data-table-editor-action="merge-selected-cells" title="Ausgewaehlte benachbarte Zellen verbinden">Verbinden</button>
        <button type="button" data-table-editor-action="clear-cell" title="Zelle leeren">Leeren</button>
        <span class="table-editor-hint">Strg/Shift-Klick: Auswahl</span>
      `;
      document.body.append(toolbar);
      this.toolbar = toolbar;
    }

    placeToolbar() {
      if (!this.toolbar || !this.activeCell || !document.contains(this.activeCell)) return;
      const table = this.getEditableTable(this.activeCell);
      if (!table) return;

      const canUseColumnCommands = this.canUseColumnCommands(table);
      this.toolbar.querySelectorAll('[data-table-editor-action*="column"], [data-table-editor-action="remove-column"]').forEach((button) => {
        button.disabled = !canUseColumnCommands;
      });
      this.toolbar.querySelector('[data-table-editor-action="remove-row"]').disabled = this.isProtectedTable(table) || (table.tBodies[0]?.rows.length || 0) <= 1;
      this.toolbar.querySelector('[data-table-editor-action="merge-selected-cells"]').disabled = !this.canMergeSelectedCells();

      if (window.innerWidth <= 720) {
        this.toolbar.style.top = "";
        this.toolbar.style.left = "";
        this.toolbar.hidden = false;
        return;
      }

      const rect = this.activeCell.getBoundingClientRect();
      const top = Math.max(8, rect.top + window.scrollY - this.toolbar.offsetHeight - 8);
      const left = Math.max(8, Math.min(window.scrollX + rect.left, window.scrollX + document.documentElement.clientWidth - this.toolbar.offsetWidth - 8));
      this.toolbar.style.top = `${top}px`;
      this.toolbar.style.left = `${left}px`;
      this.toolbar.hidden = false;
    }

    removeToolbar() {
      this.toolbar?.remove();
      this.toolbar = null;
    }
  }

  window.AleriaTableEditor = {
    mount(options) {
      return new AleriaTableEditor(options);
    }
  };
})();
