const page = document.querySelector("[data-orte-static-template]");
const entries = Array.from(page?.querySelectorAll("[data-orte-military-entry]") || []);

if (page && entries.length) {
  document.addEventListener("aleria:orte:data-ready", (event) => {
    applyMilitaryEntry(event.detail?.data || window.ORT_DATA);
  });

  if (window.ORT_DATA) applyMilitaryEntry(window.ORT_DATA);
}

function applyMilitaryEntry(data) {
  const placeId = String(data?.meta?.id || "").trim();
  const placeName = String(data?.name || data?.meta?.title || "diesem Ort").trim();
  const enabled = Boolean(placeId)
    && data?.features?.militaryView !== false
    && data?.militaryView?.enabled !== false;

  entries.forEach((entry) => {
    const link = entry.querySelector("[data-orte-military-link]");
    if (!link) return;

    entry.classList.toggle("is-disabled", !enabled);
    link.hidden = !enabled;
    if (!enabled) {
      link.removeAttribute("href");
      return;
    }

    const href = data?.militaryView?.href
      || `/Orte/militaer.html?id=${encodeURIComponent(placeId)}`;
    link.href = href;
    link.setAttribute("aria-label", `Militäransicht von ${placeName} öffnen`);
  });
}
