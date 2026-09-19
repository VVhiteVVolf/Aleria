(function () {
  "use strict";

  const page = document.querySelector("[data-orte-static-template]");
  const table = page?.querySelector("[data-orte-personalities]");
  if (!table) return;

  document.addEventListener("aleria:orte:data-ready", (event) => {
    renderPersonalities(event.detail?.data || window.ORT_DATA);
  });
  if (window.ORT_DATA) renderPersonalities(window.ORT_DATA);

  function renderPersonalities(data) {
    if (!Array.isArray(data?.personalities)) return;
    const body = table.tBodies[0] || table.createTBody();
    const fragment = document.createDocumentFragment();
    const header = document.createElement("tr");
    header.className = "sub-header pt-s-0070";
    ["Name & Titel", "Beschreibung"].forEach((text, index) => {
      const cell = document.createElement("th");
      cell.scope = "col";
      cell.colSpan = index === 0 ? 1 : 3;
      cell.textContent = text;
      header.append(cell);
    });
    fragment.append(header);
    data.personalities.forEach((group) => appendGroup(fragment, group));
    body.replaceChildren(fragment);
  }

  function appendGroup(fragment, group) {
    const heading = document.createElement("tr");
    const title = document.createElement("th");
    title.className = "pt-s-0074";
    title.scope = "colgroup";
    title.colSpan = 4;
    title.textContent = String(group.title || "");
    heading.dataset.personalityGroup = String(group.id || "");
    heading.append(title);
    fragment.append(heading);

    const people = Array.isArray(group.items) ? group.items.filter((person) => person?.name) : [];
    if (people.length === 0) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 4;
      cell.textContent = "…";
      row.append(cell);
      fragment.append(row);
      return;
    }
    people.forEach((person, index) => appendPerson(fragment, person, index));
  }

  function appendPerson(fragment, person, index) {
    const roleRow = document.createElement("tr");
    const portraitRow = document.createElement("tr");
    const nameRow = document.createElement("tr");
    [roleRow, portraitRow, nameRow].forEach((row) => {
      row.dataset.personalityTone = ["sage", "ochre", "slate"][index % 3];
    });
    roleRow.className = "orte-personality-start";
    const role = createCell("portrait-cell pt-s-0076", person.role || "…");
    const description = createCell("desc-cell pt-s-0077");
    description.colSpan = 3;
    description.rowSpan = 3;
    const prose = document.createElement("div");
    prose.className = "orte-cell-editable orte-place-prose";
    prose.tabIndex = 0;
    prose.setAttribute("role", "region");
    prose.setAttribute("aria-label", `Beschreibung von ${person.name}`);
    const paragraphs = Array.isArray(person.description) && person.description.length ? person.description : ["…"];
    paragraphs.forEach((text) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = String(text);
      prose.append(paragraph);
    });
    description.append(prose);
    roleRow.append(role, description);

    const portrait = createCell("portrait-cell pt-s-0078");
    if (person.portrait) {
      const image = document.createElement("img");
      image.className = "pt-s-0079";
      image.src = String(person.portrait);
      image.alt = String(person.name);
      image.loading = "lazy";
      image.decoding = "async";
      portrait.append(image);
    } else {
      portrait.textContent = "…";
    }
    portraitRow.append(portrait);
    nameRow.append(createCell("portrait-cell pt-s-0080", person.name));
    const spacer = document.createElement("tr");
    spacer.className = "orte-personality-spacer";
    spacer.setAttribute("aria-hidden", "true");
    const spacerCell = document.createElement("td");
    spacerCell.colSpan = 4;
    spacer.append(spacerCell);
    fragment.append(roleRow, portraitRow, nameRow, spacer);
  }

  function createCell(className, text = "") {
    const cell = document.createElement("td");
    cell.className = className;
    cell.textContent = String(text);
    return cell;
  }
})();
