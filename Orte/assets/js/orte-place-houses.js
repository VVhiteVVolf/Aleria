(function () {
  "use strict";

  const page = document.querySelector("[data-orte-static-template]");
  const table = page?.querySelector("[data-orte-houses]");
  if (!page || !table) return;

  document.addEventListener("aleria:orte:data-ready", (event) => {
    renderHouseGroups(event.detail?.data || window.ORT_DATA);
  });

  if (window.ORT_DATA) {
    renderHouseGroups(window.ORT_DATA);
  }

  function renderHouseGroups(data) {
    if (!Array.isArray(data?.houses)) return;

    const groups = data.houses
      .map(normalizeGroup)
      .filter((group) => group.items.length > 0);
    const body = table.tBodies[0] || table.createTBody();
    body.replaceChildren(createHeaderRow());

    groups.forEach((group) => {
      body.append(createGroupRow(group.title));
      group.items.forEach((house) => body.append(createHouseRow(house)));
    });

    table.classList.add("orte-house-table");
    table.closest("tr").hidden = groups.length === 0;
  }

  function normalizeGroup(group) {
    return {
      title: String(group?.title || "Häuser"),
      items: Array.isArray(group?.items) ? group.items.filter(Boolean) : []
    };
  }

  function createHeaderRow() {
    const row = document.createElement("tr");
    ["Wappen", "Haus", "Rang", "Sitz", "Lehnsherr"].forEach((label) => {
      const cell = document.createElement("th");
      cell.scope = "col";
      cell.textContent = label;
      row.append(cell);
    });
    return row;
  }

  function createGroupRow(title) {
    const row = document.createElement("tr");
    row.className = "orte-house-group";
    const cell = document.createElement("th");
    cell.colSpan = 5;
    cell.scope = "colgroup";
    cell.textContent = title;
    row.append(cell);
    return row;
  }

  function createHouseRow(house) {
    const row = document.createElement("tr");
    row.className = "orte-house-entry";

    row.append(
      createEmblemCell(house),
      createTextCell(house.name, "Haus", houseHref(house)),
      createTextCell(house.rank, "Rang"),
      createTextCell(house.seat, "Sitz"),
      createTextCell(house.liege, "Lehnsherr")
    );
    return row;
  }

  function createEmblemCell(house) {
    const cell = document.createElement("td");
    cell.className = "orte-house-emblem";
    cell.dataset.label = "Wappen";
    const href = houseHref(house);

    if (!house.emblem) {
      cell.textContent = "…";
      return cell;
    }

    const image = document.createElement("img");
    image.src = String(house.emblem);
    image.alt = `Wappen ${house.name || "des Hauses"}`;
    image.loading = "lazy";
    image.decoding = "async";

    if (!href) {
      cell.append(image);
      return cell;
    }

    const link = document.createElement("a");
    link.href = href;
    link.setAttribute("aria-label", `${house.name} im Stammbaum öffnen`);
    link.append(image);
    cell.append(link);
    return cell;
  }

  function createTextCell(value, label, href = "") {
    const cell = document.createElement("td");
    cell.dataset.label = label;
    const text = String(value || "…");

    if (!href) {
      cell.textContent = text;
      return cell;
    }

    const link = document.createElement("a");
    link.href = href;
    link.textContent = text;
    cell.append(link);
    return cell;
  }

  function houseHref(house) {
    if (house.href) return String(house.href);
    if (!house.familyId) return "";
    return `/Stammbäume/Stammbaum.html?family=${encodeURIComponent(house.familyId)}&mode=view`;
  }
})();
