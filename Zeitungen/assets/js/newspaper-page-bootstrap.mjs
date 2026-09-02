const root = document.querySelector("[data-newspaper-page]");
const config = document.querySelector("script[data-newspaper-page-module]");

startPage();

async function startPage() {
  if (!root || !config?.dataset.newspaperPageModule) return;

  try {
    await import(config.dataset.newspaperPageModule);
  } catch (error) {
    console.error("Das Zeitungsmodul konnte nicht gestartet werden.", error);
    renderStartupError();
  }
}

function renderStartupError() {
  const panel = document.createElement("section");
  panel.className = "newspaper-error";

  const title = document.createElement("h1");
  title.textContent = "Die Druckerpresse ist ins Stocken geraten";

  const message = document.createElement("p");
  message.textContent = "Die Seitendaten konnten nicht vollständig geladen werden. Ein erneutes Laden fordert alle Bestandteile frisch an.";

  const retry = document.createElement("button");
  retry.className = "newspaper-error-retry";
  retry.type = "button";
  retry.textContent = "Druckerpresse neu starten";
  retry.addEventListener("click", () => window.location.reload());

  panel.append(title, message, retry);
  root.replaceChildren(panel);
}
