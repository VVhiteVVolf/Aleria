import {
  findDefaultNewspaperEntryForPlace,
  getNewspaperEntriesForPlace
} from "/Zeitungen/assets/js/newspaper-registry.mjs?v=20260903b";
import {
  buildIssueHref,
  getLatestIssueEntry
} from "/Zeitungen/assets/js/newspaper-archive.mjs?v=20260903a";
import { formatPublicationDate } from "/Zeitungen/assets/js/newspaper-aleria-date.mjs?v=20260903a";

const page = document.querySelector("[data-orte-static-template]");
const switcher = page?.querySelector("[data-orte-press-switcher]");
const fallback = page?.querySelector("[data-orte-press-fallback]");

if (page && switcher) {
  const state = {
    entries: [],
    index: 0,
    placeId: ""
  };

  switcher.addEventListener("click", handleSwitcherClick);
  document.addEventListener("aleria:orte:data-ready", (event) => {
    applyPlacePress(event.detail?.data || window.ORT_DATA);
  });

  if (window.ORT_DATA) applyPlacePress(window.ORT_DATA);

  function applyPlacePress(data) {
    const placeId = String(data?.meta?.id || "").trim();
    if (!placeId || (placeId === state.placeId && state.entries.length)) return;

    const entries = getNewspaperEntriesForPlace(placeId);
    if (!entries.length) {
      state.entries = [];
      state.index = 0;
      state.placeId = placeId;
      switcher.hidden = true;
      if (fallback) fallback.hidden = false;
      return;
    }

    const defaultEntry = findDefaultNewspaperEntryForPlace(placeId);
    state.entries = entries;
    state.index = Math.max(0, entries.findIndex((entry) => entry.id === defaultEntry?.id));
    state.placeId = placeId;
    switcher.hidden = false;
    switcher.classList.toggle("is-single-publication", entries.length === 1);
    if (fallback) fallback.hidden = true;
    renderSelection();
  }

  function handleSwitcherClick(event) {
    const control = event.target.closest("[data-action]");
    if (!control || !switcher.contains(control)) return;

    const direction = control.dataset.action === "previous-newspaper" ? -1
      : control.dataset.action === "next-newspaper" ? 1
        : 0;
    if (!direction || state.entries.length < 2) return;

    state.index = (state.index + direction + state.entries.length) % state.entries.length;
    renderSelection();
  }

  function renderSelection() {
    const entry = state.entries[state.index];
    const issue = getLatestIssueEntry(entry);
    if (!entry || !issue) return;

    const href = buildIssueHref(entry.id, issue.id);
    const image = document.createElement("img");
    image.src = entry.cover;
    image.alt = `${entry.name} – Ausgabe ${entry.edition}`;
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => {
      switcher.classList.add("is-cover-missing");
      image.remove();
    }, { once: true });

    const coverLink = document.createElement("a");
    coverLink.className = "orte-press-cover";
    coverLink.href = href;
    coverLink.setAttribute("aria-label", `${entry.name}, aktuelle Ausgabe aus ${entry.edition} öffnen`);
    coverLink.append(image, createElement("span", "orte-press-cover-fallback", entry.name));

    const previous = createButton("previous-newspaper", "‹", "Vorherige Zeitung");
    const next = createButton("next-newspaper", "›", "Nächste Zeitung");
    previous.disabled = state.entries.length < 2;
    next.disabled = state.entries.length < 2;

    switcher.replaceChildren(
      createElement("div", "orte-press-navigation", "", [
        previous,
        createElement("div", "orte-press-title", "", [
          createElement("small", "", `Blatt ${state.index + 1} von ${state.entries.length}`),
          createElement("strong", "", entry.name),
          createElement("span", "", `Ausgabe ${entry.edition}`)
        ]),
        next
      ]),
      coverLink,
      createElement("div", "orte-press-current-issue", "", [
        createElement("span", "", "Neueste Ausgabe"),
        createElement("strong", "", formatPublicationDate(issue.publicationDate)),
        createLink("Aktuelle Ausgabe lesen", href, "orte-press-open")
      ])
    );
    switcher.classList.remove("is-cover-missing");
    switcher.dataset.newspaperTheme = entry.themeId || "default";
  }
}

function createButton(action, text, label) {
  const button = createElement("button", "orte-press-arrow", text);
  button.type = "button";
  button.dataset.action = action;
  button.setAttribute("aria-label", label);
  return button;
}

function createLink(text, href, className) {
  const link = createElement("a", className, text);
  link.href = href;
  return link;
}

function createElement(tagName, className = "", text = "", children = []) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text) element.textContent = text;
  element.append(...children);
  return element;
}
