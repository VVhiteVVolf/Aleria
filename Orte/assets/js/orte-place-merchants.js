(function () {
  "use strict";

  const page = document.querySelector("[data-orte-static-template]");
  const table = page?.querySelector("[data-orte-merchants]");
  if (!page || !table) return;

  document.addEventListener("aleria:orte:data-ready", (event) => {
    renderMerchants(event.detail?.data || window.ORT_DATA);
  });

  if (window.ORT_DATA) {
    renderMerchants(window.ORT_DATA);
  }

  function renderMerchants(data) {
    const merchants = Array.isArray(data?.merchants) ? data.merchants : [];

    table.classList.add("orte-merchants-table");
    const body = table.tBodies[0] || table.createTBody();
    body.replaceChildren(createHeaderRow());

    if (merchants.length === 0) {
      body.append(createEmptyRow());
      return;
    }

    merchants.forEach((merchant) => body.append(createMerchantRow(merchant)));
  }

  function createHeaderRow() {
    const row = document.createElement("tr");
    row.className = "orte-merchants-table__header";
    ["Symbol", "Name", "Besitzer", "Gewerbe", "Wohlstand", "Ruf", "Einfluss", "Beschreibung"]
      .forEach((label) => {
        const cell = document.createElement("th");
        cell.scope = "col";
        cell.textContent = label;
        row.append(cell);
      });
    return row;
  }

  function createEmptyRow() {
    const row = document.createElement("tr");
    row.className = "orte-merchants-table__empty";
    const cell = document.createElement("td");
    cell.colSpan = 8;
    cell.textContent = "…";
    row.append(cell);
    return row;
  }

  function createMerchantRow(merchant) {
    const row = document.createElement("tr");
    row.append(createSymbolCell(merchant));
    [
      merchant?.name,
      merchant?.owner || merchant?.besitzer,
      merchant?.trade || merchant?.gewerbe || merchant?.type,
      merchant?.wealth || merchant?.wohlstand,
      merchant?.reputation || merchant?.ruf,
      merchant?.influence || merchant?.einfluss,
      merchant?.description || merchant?.beschreibung
    ].forEach((value) => row.append(createTextCell(value)));
    return row;
  }

  function createSymbolCell(merchant) {
    const cell = document.createElement("td");
    cell.className = "orte-merchants-table__symbol";
    const source = merchant?.icon || merchant?.image || "";

    if (source) {
      const image = document.createElement("img");
      image.src = String(source);
      image.alt = merchant?.symbolAlt || `Symbol ${merchant?.name || "des Eintrags"}`;
      image.loading = "lazy";
      image.decoding = "async";
      cell.append(image);
    } else {
      cell.textContent = String(merchant?.symbol || "—");
    }

    return cell;
  }

  function createTextCell(value) {
    const cell = document.createElement("td");
    cell.textContent = String(value || "—");
    return cell;
  }
})();
