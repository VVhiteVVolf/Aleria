(function () {
  const searchInput = document.getElementById("guest-search");
  const groupFilter = document.getElementById("guest-filter");
  const giftFilter = document.getElementById("gift-filter");
  const countNode = document.getElementById("guest-count");
  const toggleButton = document.getElementById("toggle-sections");
  const printButton = document.getElementById("print-page");
  const resetButton = document.getElementById("reset-filters");
  const copyButton = document.getElementById("copy-summary");
  const spotlightButton = document.getElementById("spotlight-couple");
  const sidebarToggle = document.getElementById("toggle-sidebar");
  const editToggle = document.getElementById("toggle-edit-mode");
  const editStatus = document.getElementById("edit-status");
  const pageShell = document.querySelector(".page-shell");
  const guestTable = document.querySelector(".guest-table");
  const guestTableBody = guestTable?.querySelector("tbody");
  const guestForm = document.getElementById("guest-form");
  const guestCancelButton = document.getElementById("guest-cancel");
  const firebaseStatus = document.getElementById("firebase-status");
  const taskInputs = Array.from(document.querySelectorAll("[data-task]"));
  const statTotal = document.getElementById("stat-total");
  const statGifts = document.getElementById("stat-gifts");
  const statOpen = document.getElementById("stat-open");
  const statTasks = document.getElementById("stat-tasks");
  const pageStorageKey = `hochzeit-event-${location.pathname}`;
  const taskStorageKey = `${pageStorageKey}-tasks`;
  const sidebarStorageKey = `${pageStorageKey}-sidebar`;
  const guestStorageKey = `${pageStorageKey}-guests`;
  const contentStorageKey = `${pageStorageKey}-content`;
  const eventId = location.pathname.replace(/^\//, "").replace(/[^a-z0-9_-]+/gi, "-").replace(/^-|-$/g, "") || "hochzeit";

  if (!guestTable || !guestTableBody) return;

  const firebaseAppUrl = "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
  const firebaseStoreUrl = "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
  const sectionNames = {
    "ZEREMONIE": "zeremonie",
    "HAUS 1": "haus-1",
    "HAUS 2": "haus-2",
    "HAUS DRAIG": "haus-draig",
    "HAUS PENDERYN": "haus-penderyn",
    "INDIVIDUELLE": "individuelle-gaeste",
    "KOLLEKTIV": "kollektiv-gaeste"
  };
  const orderedSectionNames = Object.values(sectionNames);
  const guestFields = {
    id: document.getElementById("guest-id"),
    section: document.getElementById("guest-section-input"),
    name: document.getElementById("guest-name-input"),
    role: document.getElementById("guest-role-input"),
    house: document.getElementById("guest-house-input"),
    title: document.getElementById("guest-title-input"),
    task: document.getElementById("guest-task-input"),
    gift: document.getElementById("guest-gift-input")
  };

  let rows = [];
  let collapsed = false;
  let editableGuests = [];
  let firebaseApi = null;
  let guestCollection = null;
  let contentDocRef = null;
  let usingFirebase = false;
  let editMode = false;
  let editableNodes = [];
  let imageNodes = [];
  let saveContentTimer = 0;
  let applyingRemoteContent = false;

  function normalized(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setSidebarCollapsed(isCollapsed) {
    if (!pageShell) return;

    pageShell.classList.toggle("sidebar-collapsed", isCollapsed);

    if (sidebarToggle) {
      sidebarToggle.setAttribute("aria-expanded", String(!isCollapsed));
      sidebarToggle.textContent = isCollapsed ? "\u2039" : "\u203a";
      sidebarToggle.title = isCollapsed ? "Sidebar \u00f6ffnen" : "Sidebar einklappen";
      sidebarToggle.setAttribute("aria-label", sidebarToggle.title);
    }

    localStorage.setItem(sidebarStorageKey, isCollapsed ? "closed" : "open");
  }

  function setFirebaseStatus(text, mode) {
    if (!firebaseStatus) return;
    firebaseStatus.textContent = text;
    firebaseStatus.classList.remove("is-online", "is-local", "is-error");
    if (mode) firebaseStatus.classList.add(`is-${mode}`);
  }

  function setEditStatus(text, mode) {
    if (!editStatus) return;
    editStatus.textContent = text;
    editStatus.classList.remove("is-online", "is-local", "is-error");
    if (mode) editStatus.classList.add(`is-${mode}`);
  }

  function debounceSaveContent() {
    window.clearTimeout(saveContentTimer);
    saveContentTimer = window.setTimeout(saveEditableContent, 450);
  }

  function readLocalContent() {
    try {
      return JSON.parse(localStorage.getItem(contentStorageKey) || "{}");
    } catch (error) {
      return {};
    }
  }

  function writeLocalContent(content) {
    localStorage.setItem(contentStorageKey, JSON.stringify(content));
  }

  function getEditableSelector() {
    return [
      ".event-hero .title-kicker",
      ".event-hero h1",
      ".event-quote",
      ".hero-pills span",
      ".main-text-cell h2",
      ".main-text-cell p",
      ".image-title-cell span",
      ".info-table td:not(.label-cell):not(.box-heading)",
      ".schedule-table td",
      ".guest-table tr:not(.section-row):not(.guest-head):not(.generated-guest-row) td:not(.crest-row):not(.group-subtitle):not(.blessing)"
    ].join(",");
  }

  function refreshEditableNodes() {
    editableNodes = Array.from(document.querySelectorAll(getEditableSelector()))
      .filter((node) => !node.closest(".page-sidebar"))
      .filter((node) => !node.closest(".inline-add-row, .inline-guest-row"))
      .filter((node) => !node.querySelector("img"));

    editableNodes.forEach((node, index) => {
      if (!node.dataset.editKey) node.dataset.editKey = `text-field-${index}`;
      node.setAttribute("spellcheck", "true");
    });
  }

  function refreshImageNodes() {
    imageNodes = Array.from(document.querySelectorAll(".image-cell, .crest-row"))
      .filter((node) => !node.closest(".page-sidebar"));

    imageNodes.forEach((node, index) => {
      if (!node.dataset.editKey) node.dataset.editKey = `image-field-${index}`;
    });
  }

  function cleanNodeHtml(node) {
    const clone = node.cloneNode(true);
    clone.querySelectorAll(".image-edit-control").forEach((item) => item.remove());
    return clone.innerHTML;
  }

  function collectEditableContent() {
    refreshEditableNodes();
    refreshImageNodes();
    const content = editableNodes.reduce((values, node) => {
      values[node.dataset.editKey] = node.innerHTML;
      return values;
    }, {});

    imageNodes.forEach((node) => {
      content[node.dataset.editKey] = cleanNodeHtml(node);
    });

    return content;
  }

  function applyNodeContent(nodes, content) {
    nodes.forEach((node) => {
      if (Object.prototype.hasOwnProperty.call(content, node.dataset.editKey)) {
        node.innerHTML = content[node.dataset.editKey];
      }
    });
  }

  function removeImageControls() {
    document.querySelectorAll(".image-edit-control").forEach((control) => control.remove());
  }

  function renderImageControls() {
    removeImageControls();
    if (!editMode) return;

    refreshImageNodes();
    imageNodes.forEach((node) => {
      const button = document.createElement("button");
      button.className = "image-edit-control";
      button.type = "button";
      button.dataset.imageEdit = "true";
      button.textContent = node.querySelector("img") ? "Bild-URL \u00e4ndern" : "Imgur-Bild setzen";
      node.appendChild(button);
    });
  }

  function removeInlineAddRows() {
    guestTable.querySelectorAll(".inline-add-row, .inline-guest-row").forEach((row) => row.remove());
  }

  function createInlineAddRow(section) {
    const row = document.createElement("tr");
    row.className = "inline-add-row";
    row.dataset.section = section;
    row.dataset.insertAfter = "header";
    row.innerHTML = `
      <td colspan="6">
        <button class="inline-add-button" type="button" data-inline-add="${section}">+ Zeile in dieser Gruppe hinzuf\u00fcgen</button>
      </td>
    `;
    return row;
  }

  function createInlineInsertRow(section, afterId) {
    const row = createInlineAddRow(section);
    row.classList.add("inline-insert-row");
    row.dataset.insertAfter = afterId;
    row.querySelector(".inline-add-button").textContent = "+ Zeile hier einf\u00fcgen";
    return row;
  }

  function createInlineGuestRow(section) {
    const row = document.createElement("tr");
    row.className = "inline-guest-row";
    row.dataset.section = section;
    row.innerHTML = `
      <td><input data-inline-field="name" type="text" placeholder="Name" required></td>
      <td><input data-inline-field="role" type="text" placeholder="Rolle"></td>
      <td><input data-inline-field="house" type="text" placeholder="Haus"></td>
      <td><input data-inline-field="title" type="text" placeholder="Titel / Rang"></td>
      <td><input data-inline-field="task" type="text" placeholder="Aufgabe"></td>
      <td>
        <input data-inline-field="gift" type="text" placeholder="Geschenk">
        <div class="row-actions">
          <button class="row-action-button" type="button" data-inline-save>Speichern</button>
          <button class="row-action-button" type="button" data-inline-cancel>Abbrechen</button>
        </div>
      </td>
    `;
    return row;
  }

  function renderInlineAddRows() {
    removeInlineAddRows();
    if (!editMode) return;

    indexRows();
    Array.from(guestTable.querySelectorAll(".guest-head")).forEach((headRow) => {
      const section = headRow.dataset.section;
      if (!section) return;
      headRow.insertAdjacentElement("afterend", createInlineAddRow(section));
    });

    Array.from(guestTable.querySelectorAll("tr")).forEach((row) => {
      if (!isCountable(row) || row.classList.contains("placeholder-row")) return;
      const section = row.dataset.section;
      if (!section) return;
      const afterId = row.dataset.guestId || "";
      if (!afterId) return;
      row.insertAdjacentElement("afterend", createInlineInsertRow(section, afterId));
    });
  }

  function readInlineGuestRow(row) {
    const value = (field) => row.querySelector(`[data-inline-field="${field}"]`)?.value.trim() || "";
    return {
      id: "",
      section: row.dataset.section || "individuelle-gaeste",
      insertAfter: row.dataset.insertAfter || "",
      name: value("name"),
      role: value("role"),
      house: value("house"),
      title: value("title"),
      task: value("task"),
      gift: value("gift")
    };
  }

  function clearInlineGuestRow(row) {
    row.querySelectorAll("input").forEach((input) => {
      input.value = "";
    });
  }

  function setImageUrl(target, url) {
    const trimmed = String(url || "").trim();

    if (!/^https?:\/\//i.test(trimmed) || !/imgur\.com/i.test(trimmed)) {
      window.alert("Bitte eine direkte Imgur-Bild-URL eintragen.");
      return false;
    }

    const existingImage = target.querySelector("img");
    if (existingImage) {
      existingImage.src = trimmed;
      return true;
    }

    if (target.classList.contains("image-cell")) {
      target.innerHTML = `<p><img alt="Hochzeitsbild" src="${trimmed}"></p>`;
      return true;
    }

    target.innerHTML = `<img alt="Wappen" src="${trimmed}">`;
    return true;
  }

  function applyEditableContent(content) {
    if (!content) return;
    applyingRemoteContent = true;
    refreshEditableNodes();
    refreshImageNodes();
    applyNodeContent(editableNodes, content);
    applyNodeContent(imageNodes, content);
    editableNodes.forEach((node) => {
      node.setAttribute("contenteditable", editMode ? "true" : "false");
    });
    applyingRemoteContent = false;
    renderImageControls();
    applyFilters();
  }

  async function saveEditableContent() {
    if (applyingRemoteContent) return;
    const content = collectEditableContent();

    writeLocalContent(content);

    if (usingFirebase && firebaseApi && contentDocRef) {
      await firebaseApi.setDoc(contentDocRef, {
        fields: content,
        updatedAt: firebaseApi.serverTimestamp()
      }, { merge: true });
      setEditStatus("Textfelder gespeichert.", "online");
      applyFilters();
      return;
    }

    setEditStatus("Textfelder lokal gespeichert.", "local");
    applyFilters();
  }

  function setEditMode(active) {
    editMode = active;
    document.body.classList.toggle("edit-mode-active", editMode);
    refreshEditableNodes();

    editableNodes.forEach((node) => {
      node.setAttribute("contenteditable", editMode ? "true" : "false");
    });
    renderImageControls();
    renderInlineAddRows();

    if (editToggle) editToggle.textContent = editMode ? "Bearbeiten beenden" : "Bearbeiten starten";
    setEditStatus(
      editMode ? "Textfelder und Tabellenzellen sind direkt editierbar." : "Textfelder sind gesperrt.",
      editMode ? (usingFirebase ? "online" : "local") : ""
    );
    applyFilters();
  }

  function hasFirebaseConfig(config) {
    return Boolean(config && config.apiKey && config.projectId && config.appId);
  }

  function readLocalGuests() {
    try {
      return JSON.parse(localStorage.getItem(guestStorageKey) || "[]");
    } catch (error) {
      return [];
    }
  }

  function writeLocalGuests(guests) {
    localStorage.setItem(guestStorageKey, JSON.stringify(guests));
  }

  function isUtilityRow(row) {
    return row.classList.contains("section-row")
      || row.classList.contains("guest-head")
      || row.classList.contains("placeholder-row")
      || row.classList.contains("inline-add-row")
      || row.classList.contains("inline-guest-row")
      || row.querySelector(".crest-row")
      || row.querySelector(".group-subtitle")
      || row.querySelector(".blessing");
  }

  function isCountable(row) {
    return Boolean(row.dataset.section) && !isUtilityRow(row);
  }

  function getGiftCell(row) {
    return row.cells && row.cells.length ? row.cells[row.cells.length - 1] : null;
  }

  function getGiftText(row) {
    const generatedGift = row.querySelector(".gift-text");
    const giftCell = getGiftCell(row);
    return generatedGift ? generatedGift.textContent : giftCell?.textContent;
  }

  function getGiftStatus(row) {
    const gift = normalized(getGiftText(row));

    if (!isCountable(row)) return "none";
    if (!gift || gift === "..." || gift === "-" || gift === "\u2014") return "open";
    if (gift.includes("nachgereicht") || gift.includes("unbekannt") || gift.includes("??")) return "unknown";
    return "present";
  }

  function indexRows() {
    let currentSection = "";
    rows = Array.from(guestTable.querySelectorAll("tr"));

    rows.forEach((row) => {
      row.classList.remove("gift-present", "gift-open", "gift-unknown");
      const titleCell = row.querySelector(".group-title");

      if (titleCell) {
        const text = titleCell.textContent.toUpperCase();
        const match = Object.entries(sectionNames).find(([key]) => text.includes(key));
        currentSection = match ? match[1] : "";
        row.dataset.section = currentSection;
        row.classList.add("section-row");
        titleCell.title = "Klicken, um diese Gruppe zu filtern";
        return;
      }

      if (currentSection) row.dataset.section = currentSection;
    });

    rows.forEach((row) => {
      const status = getGiftStatus(row);
      if (status === "none") return;
      row.dataset.giftStatus = status;
      row.classList.add(`gift-${status}`);
    });
  }

  function findSectionAnchor(section) {
    let insideSection = false;

    for (const row of Array.from(guestTableBody.querySelectorAll("tr"))) {
      if (row.classList.contains("section-row")) {
        if (insideSection) return row;
        insideSection = row.dataset.section === section;
        continue;
      }

      if (insideSection && row.querySelector(".blessing")) return row;
    }

    return null;
  }

  function makeCell(text, className) {
    const cell = document.createElement("td");
    if (className) cell.className = className;
    cell.textContent = text || "";
    return cell;
  }

  function createGeneratedRow(guest) {
    const row = document.createElement("tr");
    const giftText = guest.gift || "\u2014";
    row.className = "generated-guest-row";
    row.dataset.guestId = guest.id;
    row.dataset.section = guest.section;

    const nameCell = document.createElement("td");
    const nameNode = document.createElement("b");
    nameNode.textContent = guest.name || "...";
    nameCell.appendChild(nameNode);
    row.appendChild(nameCell);
    row.appendChild(makeCell(guest.role || ""));
    row.appendChild(makeCell(guest.house || "", "house"));
    row.appendChild(makeCell(guest.title || ""));
    row.appendChild(makeCell(guest.task || ""));

    const giftCell = document.createElement("td");
    const giftNode = document.createElement("span");
    const actions = document.createElement("div");
    const editButton = document.createElement("button");
    const deleteButton = document.createElement("button");

    giftNode.className = "gift-text";
    giftNode.textContent = giftText;
    actions.className = "row-actions";
    editButton.className = "row-action-button";
    editButton.type = "button";
    editButton.dataset.guestAction = "edit";
    editButton.dataset.guestId = guest.id;
    editButton.textContent = "Bearbeiten";
    deleteButton.className = "row-action-button";
    deleteButton.type = "button";
    deleteButton.dataset.guestAction = "delete";
    deleteButton.dataset.guestId = guest.id;
    deleteButton.textContent = "L\u00f6schen";
    actions.append(editButton, deleteButton);
    giftCell.append(giftNode, actions);
    row.appendChild(giftCell);

    return row;
  }

  function renderEditableGuests(guests) {
    guestTable.querySelectorAll(".generated-guest-row").forEach((row) => row.remove());
    removeInlineAddRows();
    indexRows();

    guests
      .slice()
      .sort((a, b) => getGuestSortValue(a) - getGuestSortValue(b))
      .forEach((guest) => {
        const row = createGeneratedRow(guest);
        const anchor = findSectionAnchor(guest.section);
        guestTableBody.insertBefore(row, anchor);
      });

    indexRows();
    renderInlineAddRows();
    applyFilters();
  }

  function updateTaskStat() {
    if (!statTasks) return;
    const done = taskInputs.filter((input) => input.checked).length;
    statTasks.textContent = `${done}/${taskInputs.length}`;
  }

  function loadTasks() {
    let saved = {};

    try {
      saved = JSON.parse(localStorage.getItem(taskStorageKey) || "{}");
    } catch (error) {
      saved = {};
    }

    taskInputs.forEach((input) => {
      input.checked = Boolean(saved[input.dataset.task]);
    });

    updateTaskStat();
  }

  function saveTasks() {
    const saved = {};

    taskInputs.forEach((input) => {
      saved[input.dataset.task] = input.checked;
    });

    localStorage.setItem(taskStorageKey, JSON.stringify(saved));
    updateTaskStat();
  }

  function updateStats(visibleRows) {
    const visibleCountable = visibleRows.filter(isCountable);
    const visibleGifts = visibleCountable.filter((row) => row.dataset.giftStatus === "present");
    const visibleOpen = visibleCountable.filter((row) => row.dataset.giftStatus === "open");

    if (statTotal) statTotal.textContent = String(visibleCountable.length);
    if (statGifts) statGifts.textContent = String(visibleGifts.length);
    if (statOpen) statOpen.textContent = String(visibleOpen.length);
    if (countNode) {
      countNode.textContent = visibleCountable.length === 1
        ? "1 Eintrag"
        : `${visibleCountable.length} Eintr\u00e4ge`;
    }
  }

  function applyFilters() {
    const query = normalized(searchInput ? searchInput.value : "");
    const selectedGroup = groupFilter ? groupFilter.value : "all";
    const selectedGift = giftFilter ? giftFilter.value : "all";
    const visibleRows = [];

    indexRows();

    rows.forEach((row) => {
      row.classList.remove("search-match");
      row.classList.remove("zebra-even", "zebra-odd");

      const section = row.dataset.section || "";
      const inGroup = selectedGroup === "all" || section === selectedGroup;
      const isSectionRow = row.classList.contains("section-row");
      const isHeaderRow = row.classList.contains("guest-head");
      const isBridalRow = row.classList.contains("bridal-row");
      const status = row.dataset.giftStatus || "none";
      const giftMatches = selectedGift === "all" || status === selectedGift || status === "none";
      const textMatches = !query || normalized(row.textContent).includes(query);

      if (isSectionRow) {
        row.hidden = !inGroup;
      } else if (isHeaderRow) {
        row.hidden = !inGroup || collapsed;
      } else {
        row.hidden = !inGroup || !textMatches || !giftMatches || (collapsed && !isBridalRow);
      }

      if (!row.hidden) {
        visibleRows.push(row);
        if (query && isCountable(row)) row.classList.add("search-match");
      }
    });

    orderedSectionNames.forEach((section) => {
      let zebraIndex = 0;
      rows.forEach((row) => {
        if (row.hidden || row.dataset.section !== section || !isCountable(row)) return;
        row.classList.add(zebraIndex % 2 === 0 ? "zebra-odd" : "zebra-even");
        zebraIndex += 1;
      });
    });

    updateStats(visibleRows);
  }

  function resetFilters() {
    if (searchInput) searchInput.value = "";
    if (groupFilter) groupFilter.value = "all";
    if (giftFilter) giftFilter.value = "all";
    collapsed = false;
    if (toggleButton) toggleButton.textContent = "Gruppen zuklappen";
    applyFilters();
  }

  function readGuestForm() {
    return {
      id: guestFields.id?.value || "",
      section: guestFields.section?.value || "individuelle-gaeste",
      name: guestFields.name?.value.trim() || "",
      role: guestFields.role?.value.trim() || "",
      house: guestFields.house?.value.trim() || "",
      title: guestFields.title?.value.trim() || "",
      task: guestFields.task?.value.trim() || "",
      gift: guestFields.gift?.value.trim() || ""
    };
  }

  function resetGuestForm() {
    guestForm?.reset();
    if (guestFields.id) guestFields.id.value = "";
    if (guestCancelButton) guestCancelButton.hidden = true;
  }

  function fillGuestForm(guest) {
    if (!guestForm) return;
    guestFields.id.value = guest.id;
    guestFields.section.value = guest.section;
    guestFields.name.value = guest.name || "";
    guestFields.role.value = guest.role || "";
    guestFields.house.value = guest.house || "";
    guestFields.title.value = guest.title || "";
    guestFields.task.value = guest.task || "";
    guestFields.gift.value = guest.gift || "";
    if (guestCancelButton) guestCancelButton.hidden = false;
    guestFields.name?.focus();
  }

  function getGuestSortValue(guest) {
    if (Number.isFinite(guest.sortOrder)) return guest.sortOrder;
    return guest.createdAtMs || guest.createdAt || 0;
  }

  function assignSortOrder(guest) {
    if (guest.id || Number.isFinite(guest.sortOrder)) return guest;

    const sectionGuests = editableGuests
      .filter((item) => item.section === guest.section)
      .sort((a, b) => getGuestSortValue(a) - getGuestSortValue(b));
    const insertAfter = guest.insertAfter || "";
    let sortOrder = Date.now();

    if (insertAfter && insertAfter !== "header") {
      const index = sectionGuests.findIndex((item) => item.id === insertAfter);
      const previous = sectionGuests[index];
      const next = sectionGuests[index + 1];
      const previousOrder = previous ? getGuestSortValue(previous) : Date.now();
      const nextOrder = next ? getGuestSortValue(next) : previousOrder + 1000;
      sortOrder = previousOrder + ((nextOrder - previousOrder) / 2);
    } else if (insertAfter === "header" && sectionGuests.length) {
      sortOrder = getGuestSortValue(sectionGuests[0]) - 1000;
    } else if (sectionGuests.length) {
      sortOrder = getGuestSortValue(sectionGuests[sectionGuests.length - 1]) + 1000;
    }

    return { ...guest, sortOrder };
  }

  async function saveGuest(guest) {
    const now = Date.now();
    const orderedGuest = assignSortOrder(guest);

    if (usingFirebase && firebaseApi && guestCollection) {
      if (orderedGuest.id) {
        await firebaseApi.updateDoc(firebaseApi.doc(guestCollection, orderedGuest.id), {
          section: orderedGuest.section,
          name: orderedGuest.name,
          role: orderedGuest.role,
          house: orderedGuest.house,
          title: orderedGuest.title,
          task: orderedGuest.task,
          gift: orderedGuest.gift,
          sortOrder: orderedGuest.sortOrder || now,
          updatedAt: firebaseApi.serverTimestamp()
        });
      } else {
        await firebaseApi.addDoc(guestCollection, {
          section: orderedGuest.section,
          name: orderedGuest.name,
          role: orderedGuest.role,
          house: orderedGuest.house,
          title: orderedGuest.title,
          task: orderedGuest.task,
          gift: orderedGuest.gift,
          sortOrder: orderedGuest.sortOrder,
          createdAt: firebaseApi.serverTimestamp(),
          createdAtMs: now,
          updatedAt: firebaseApi.serverTimestamp()
        });
      }
      return;
    }

    if (orderedGuest.id) {
      editableGuests = editableGuests.map((item) => item.id === orderedGuest.id ? { ...item, ...orderedGuest, updatedAt: now } : item);
    } else {
      editableGuests.push({ ...orderedGuest, id: `local-${now}`, createdAt: now, createdAtMs: now, updatedAt: now });
    }

    writeLocalGuests(editableGuests);
    renderEditableGuests(editableGuests);
  }

  async function deleteGuest(id) {
    if (usingFirebase && firebaseApi && guestCollection) {
      await firebaseApi.deleteDoc(firebaseApi.doc(guestCollection, id));
      return;
    }

    editableGuests = editableGuests.filter((guest) => guest.id !== id);
    writeLocalGuests(editableGuests);
    renderEditableGuests(editableGuests);
  }

  async function copySummary() {
    const countableRows = rows.filter(isCountable);
    const gifts = countableRows.filter((row) => row.dataset.giftStatus === "present").length;
    const open = countableRows.filter((row) => row.dataset.giftStatus === "open").length;
    const unknown = countableRows.filter((row) => row.dataset.giftStatus === "unknown").length;
    const doneTasks = taskInputs.filter((input) => input.checked).length;
    const pageTitle = document.querySelector(".event-hero h1")?.textContent.trim() || document.title;
    const heroPills = Array.from(document.querySelectorAll(".hero-pills span")).map((node) => node.textContent.trim());
    const text = [
      pageTitle,
      `Eckdaten: ${heroPills.join(" | ")}`,
      `Teilnehmer: ${countableRows.length}`,
      `Geschenke notiert: ${gifts}`,
      `Geschenke offen: ${open}`,
      `Geschenke unklar: ${unknown}`,
      `Planung: ${doneTasks}/${taskInputs.length} erledigt`
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      const fallback = document.createElement("textarea");
      fallback.value = text;
      fallback.setAttribute("readonly", "");
      fallback.style.position = "fixed";
      fallback.style.left = "-9999px";
      document.body.appendChild(fallback);
      fallback.select();
      document.execCommand("copy");
      fallback.remove();
    }

    if (!copyButton) return;
    copyButton.classList.add("tool-copy-ok");
    copyButton.textContent = "Kopiert";
    window.setTimeout(() => {
      copyButton.classList.remove("tool-copy-ok");
      copyButton.textContent = "Kurzinfo kopieren";
    }, 1400);
  }

  async function initGuestStorage() {
    const firebaseConfig = window.HOCHZEIT_FIREBASE_CONFIG;

    if (!hasFirebaseConfig(firebaseConfig)) {
      editableGuests = readLocalGuests();
      applyEditableContent(readLocalContent());
      setFirebaseStatus("Lokaler Modus: Firebase-Konfig fehlt.", "local");
      renderEditableGuests(editableGuests);
      return;
    }

    try {
      const [{ initializeApp }, firestoreModule] = await Promise.all([
        import(firebaseAppUrl),
        import(firebaseStoreUrl)
      ]);
      const app = initializeApp(firebaseConfig);
      const db = firestoreModule.getFirestore(app);

      firebaseApi = firestoreModule;
      guestCollection = firestoreModule.collection(db, "hochzeitEvents", eventId, "guests");
      contentDocRef = firestoreModule.doc(db, "hochzeitEvents", eventId, "page", "content");
      usingFirebase = true;
      setFirebaseStatus("Firebase verbunden.", "online");

      firestoreModule.onSnapshot(
        contentDocRef,
        (snapshot) => {
          const fields = snapshot.exists() ? snapshot.data().fields : null;
          if (fields) {
            writeLocalContent(fields);
            applyEditableContent(fields);
            setEditStatus(editMode ? "Textfelder mit Firebase synchronisiert." : "Textfelder sind gesperrt.", "online");
          } else {
            applyEditableContent(readLocalContent());
          }
        },
        () => {
          applyEditableContent(readLocalContent());
          setEditStatus("Textfelder lokal geladen.", "local");
        }
      );

      firestoreModule.onSnapshot(
        firestoreModule.query(guestCollection, firestoreModule.orderBy("sortOrder", "asc")),
        (snapshot) => {
          editableGuests = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
          renderEditableGuests(editableGuests);
        },
        () => {
          usingFirebase = false;
          editableGuests = readLocalGuests();
          applyEditableContent(readLocalContent());
          setFirebaseStatus("Firebase nicht erreichbar. Lokaler Modus.", "error");
          renderEditableGuests(editableGuests);
        }
      );
    } catch (error) {
      usingFirebase = false;
      editableGuests = readLocalGuests();
      applyEditableContent(readLocalContent());
      setFirebaseStatus("Firebase konnte nicht geladen werden. Lokaler Modus.", "error");
      renderEditableGuests(editableGuests);
    }
  }

  searchInput?.addEventListener("input", applyFilters);
  groupFilter?.addEventListener("change", applyFilters);
  giftFilter?.addEventListener("change", applyFilters);
  resetButton?.addEventListener("click", resetFilters);
  copyButton?.addEventListener("click", copySummary);
  sidebarToggle?.addEventListener("click", () => {
    setSidebarCollapsed(!pageShell?.classList.contains("sidebar-collapsed"));
  });
  editToggle?.addEventListener("click", () => {
    setEditMode(!editMode);
  });
  document.addEventListener("input", (event) => {
    if (!editMode) return;
    if (!event.target.closest("[data-edit-key]")) return;
    debounceSaveContent();
  });

  document.addEventListener("blur", (event) => {
    if (!editMode) return;
    if (!event.target.closest("[data-edit-key]")) return;
    debounceSaveContent();
  }, true);

  document.addEventListener("click", (event) => {
    const imageButton = event.target.closest("[data-image-edit]");
    if (!imageButton) return;

    const target = imageButton.closest(".image-cell, .crest-row");
    const current = target?.querySelector("img")?.src || "";
    const nextUrl = window.prompt("Imgur-Bild-URL eintragen:", current);

    if (!target || !nextUrl) return;
    if (setImageUrl(target, nextUrl)) {
      renderImageControls();
      debounceSaveContent();
    }
  });

  spotlightButton?.addEventListener("click", () => {
    resetFilters();
    if (searchInput) searchInput.value = "heiratet";
    document.getElementById("gaeste")?.scrollIntoView({ behavior: "smooth", block: "start" });
    applyFilters();
  });

  guestTable.addEventListener("click", async (event) => {
    const actionButton = event.target.closest("[data-guest-action]");
    const inlineAddButton = event.target.closest("[data-inline-add]");
    const inlineSaveButton = event.target.closest("[data-inline-save]");
    const inlineCancelButton = event.target.closest("[data-inline-cancel]");
    const sectionRow = event.target.closest(".section-row");

    if (inlineAddButton) {
      const addRow = inlineAddButton.closest(".inline-add-row");
      const section = inlineAddButton.dataset.inlineAdd;
      addRow.insertAdjacentElement("afterend", createInlineGuestRow(section));
      addRow.nextElementSibling?.querySelector("[data-inline-field='name']")?.focus();
      return;
    }

    if (inlineSaveButton) {
      const row = inlineSaveButton.closest(".inline-guest-row");
      const guest = readInlineGuestRow(row);
      const nameInput = row.querySelector("[data-inline-field='name']");

      if (!guest.name) {
        nameInput?.focus();
        return;
      }

      await saveGuest(guest);
      clearInlineGuestRow(row);
      return;
    }

    if (inlineCancelButton) {
      inlineCancelButton.closest(".inline-guest-row")?.remove();
      return;
    }

    if (actionButton) {
      const id = actionButton.dataset.guestId;
      const guest = editableGuests.find((item) => item.id === id);

      if (actionButton.dataset.guestAction === "edit" && guest) fillGuestForm(guest);
      if (actionButton.dataset.guestAction === "delete" && guest) {
        await deleteGuest(id);
        resetGuestForm();
      }
      return;
    }

    if (!sectionRow || !groupFilter || !sectionRow.dataset.section) return;
    groupFilter.value = groupFilter.value === sectionRow.dataset.section ? "all" : sectionRow.dataset.section;
    applyFilters();
  });

  guestForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const guest = readGuestForm();

    if (!guest.name) return;
    await saveGuest(guest);
    resetGuestForm();
  });

  guestCancelButton?.addEventListener("click", resetGuestForm);

  toggleButton?.addEventListener("click", () => {
    collapsed = !collapsed;
    toggleButton.textContent = collapsed ? "Gruppen ausklappen" : "Gruppen zuklappen";
    applyFilters();
  });

  printButton?.addEventListener("click", () => window.print());
  taskInputs.forEach((input) => input.addEventListener("change", saveTasks));

  setSidebarCollapsed(localStorage.getItem(sidebarStorageKey) === "closed");
  loadTasks();
  indexRows();
  refreshEditableNodes();
  applyEditableContent(readLocalContent());
  setEditMode(false);
  applyFilters();
  initGuestStorage();
})();
