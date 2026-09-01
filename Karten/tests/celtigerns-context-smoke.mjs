import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";

const devtoolsPort = Number(process.argv[2] || 9224);
const baseUrl = process.argv[3] || "http://127.0.0.1:4173";
const screenshotPath = process.argv[4] || "";
const targets = await (await fetch(`http://127.0.0.1:${devtoolsPort}/json/list`)).json();
const page = targets.find((target) => target.type === "page" && target.url === "about:blank")
  || targets.find((target) => target.type === "page");
assert.ok(page?.webSocketDebuggerUrl, "Keine steuerbare Browserseite gefunden.");

const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let sequence = 0;
const pending = new Map();
const eventWaiters = new Map();
const browserErrors = [];

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const waiter = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) waiter?.reject(new Error(message.error.message));
    else waiter?.resolve(message.result);
    return;
  }
  if (message.method === "Runtime.exceptionThrown") {
    browserErrors.push(message.params.exceptionDetails.text || "Unbekannte Laufzeitausnahme");
  }
  const waiters = eventWaiters.get(message.method) || [];
  eventWaiters.delete(message.method);
  waiters.forEach((resolve) => resolve(message.params));
});

function command(method, params = {}) {
  const id = ++sequence;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

function waitForEvent(method) {
  return new Promise((resolve) => eventWaiters.set(method, [...(eventWaiters.get(method) || []), resolve]));
}

async function evaluate(expression) {
  const result = await command("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || "Auswertung im Browser fehlgeschlagen.");
  return result.result.value;
}

async function navigate(path, waitMs = 900) {
  const loaded = waitForEvent("Page.loadEventFired");
  await command("Page.navigate", { url: `${baseUrl}${path}` });
  await loaded;
  await new Promise((resolve) => setTimeout(resolve, waitMs));
}

await command("Page.enable");
await command("Runtime.enable");
await command("Emulation.setDeviceMetricsOverride", {
  width: 1720,
  height: 1100,
  deviceScaleFactor: 1,
  mobile: false
});

await navigate("/Orte/grossstadt.html?ort=gwynthor", 1200);
const placeResult = await evaluate(`(() => ({
  title: document.querySelector('.pt-s-0004')?.textContent,
  cultureHeadings: [...document.querySelectorAll('.grossstadt-template-frame h2')].filter((heading) => heading.textContent.trim() === 'Kultur').length,
  builtEnvironment: document.getElementById('stadtbild-architektur')?.textContent.trim(),
  tocBuiltEnvironment: document.querySelector('[data-toc-link="stadtbild-architektur"]')?.textContent.trim(),
  supporterImages: document.querySelectorAll('.orte-heraldic-supporter.has-image img').length,
  supporterWidths: [...document.querySelectorAll('.orte-heraldic-supporter.has-image img')].map((image) => image.naturalWidth),
  leftTransform: getComputedStyle(document.querySelector('.orte-heraldic-supporter--left img')).transform
}))()`);
assert.equal(placeResult.title, "Gwynthor");
assert.equal(placeResult.cultureHeadings, 1);
assert.equal(placeResult.builtEnvironment, "Stadtbild & Architektur");
assert.equal(placeResult.tocBuiltEnvironment, "Stadtbild & Architektur");
assert.equal(placeResult.supporterImages, 2);
assert.ok(placeResult.supporterWidths.every((width) => width > 0), "Beide Wappenhalter müssen geladen sein.");
assert.match(placeResult.leftTransform, /^matrix\(-1,/);

if (screenshotPath) {
  const screenshot = await command("Page.captureScreenshot", { format: "png", fromSurface: true });
  await writeFile(screenshotPath, Buffer.from(screenshot.data, "base64"));
}

await navigate("/Kontinente/Estryll/K%C3%B6nigreich%20Cenyr/Grafschaft%20Celtigerns%20Wacht/Herrschaft%20der%20Wyrm/Herrschaft%20der%20Wyrm.html", 1600);
const wyrmAdministration = await evaluate(`(async () => {
  const card = document.querySelector('[data-herrschaft-administration] [data-administration-key="militaer"]');
  card?.click();
  await new Promise((resolve) => setTimeout(resolve, 200));
  return {
    scope: card?.dataset.administrationScope,
    kicker: document.querySelector('.administration-dialog-kicker')?.textContent.trim(),
    title: document.querySelector('#administration-dialog-title')?.textContent.trim(),
    empty: Boolean(document.querySelector('.administration-dialog-section.is-empty')),
  };
})()`);
assert.deepEqual(wyrmAdministration, {
  scope: "herrschaft-wyrm",
  kicker: "Herrschaft der Wyrm · Verwaltungsstruktur",
  title: "Militär",
  empty: true,
});

await navigate("/Kontinente/Estryll/K%C3%B6nigreich%20Cenyr/Grafschaft%20Celtigerns%20Wacht/Grafschaft%20Celtigerns%20Wacht.html", 3400);
const countyAdministration = await evaluate(`(async () => {
  const card = document.querySelector('[data-administration-key="militaer"]');
  card?.click();
  const deadline = Date.now() + 4000;
  while (Date.now() < deadline) {
    const body = document.querySelector('[data-role="administration-dialog-body"]');
    if (body && !body.textContent.includes('Inhalte werden geladen')) break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return {
    scope: card?.dataset.administrationScope,
    empty: Boolean(document.querySelector('.administration-dialog-section.is-empty')),
    contentLength: document.querySelector('[data-role="administration-dialog-body"]')?.textContent.trim().length || 0,
  };
})()`);
assert.equal(countyAdministration.scope, "grafschaft-celtigerns-wacht");
assert.equal(countyAdministration.empty, false);
assert.ok(countyAdministration.contentLength > 100, "Celtigerns Wacht muss seine Verwaltungsstruktur behalten.");

await navigate("/Karten/karte.html?map=cenyr-celtigerns-wacht", 1300);
const countyResult = await evaluate(`(() => {
  const dominions = KartoRuntime.state().dominions;
  const byId = (id) => dominions.find((entry) => entry.id === id);
  return {
    count: dominions.length,
    normalActive: document.getElementById('lb-normal').classList.contains('on'),
    gafyrParent: byId('msa3c53vomlanj')?.parentId,
    wyrmParent: byId('msa3c53viyll7z')?.parentId,
    saethwyrParent: byId('msa3c53vz3k80p')?.parentId,
    loerParent: byId('cw-haus-loer')?.parentId,
    gwaredParent: byId('cw-haus-gwared')?.parentId
  };
})()`);
assert.equal(countyResult.count, 54);
assert.equal(countyResult.normalActive, true);
assert.equal(countyResult.gafyrParent, "msa3c53vo1h89v");
assert.equal(countyResult.wyrmParent, "msa3c53vo1h89v");
assert.equal(countyResult.saethwyrParent, "msa3c53vo1h89v");
assert.equal(countyResult.loerParent, "msa3c53viyll7z");
assert.equal(countyResult.gwaredParent, "msa3c53vulpw53");

await navigate("/Karten/Cenyr/celtigerns-wacht/CeltigernsWachtKarte.html", 1500);
const legacyMapResult = await evaluate(`(() => ({
  normalWidth: document.getElementById('ln')?.naturalWidth || 0,
  imageSource: document.getElementById('ln')?.currentSrc || '',
  errorVisible: document.getElementById('toast')?.classList.contains('on')
    && document.getElementById('toast')?.textContent.includes('Kartenbilder nicht gefunden')
}))()`);
assert.ok(legacyMapResult.normalWidth > 0, "Auch der alte Kartenlink muss das Kartenbild laden.");
assert.equal(legacyMapResult.errorVisible, false);

await navigate("/Karten/karte.html?map=cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-bannkreis", 1300);
const regionalResult = await evaluate(`(() => ({
  count: KartoRuntime.state().dominions.length,
  ids: KartoRuntime.state().dominions.map((entry) => entry.id),
  normalActive: document.getElementById('lb-normal').classList.contains('on')
}))()`);
assert.equal(regionalResult.count, 17);
assert.equal(regionalResult.normalActive, true);
assert.ok(regionalResult.ids.includes("cw-haus-tlawd"));
assert.ok(!regionalResult.ids.includes("cw-haus-von-hochreuth"));
assert.ok(!regionalResult.ids.includes("cw-haus-cymrath-o-traethlan"));

await navigate("/Karten/karte.html?map=cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-llysfaen-stadtkarte", 900);
const localResult = await evaluate(`(() => ({
  count: KartoRuntime.state().dominions.length,
  name: KartoRuntime.state().dominions[0]?.name
}))()`);
assert.deepEqual(localResult, { count: 1, name: "Herrschaft der Wyrm" });
assert.deepEqual(browserErrors, [], `Browserfehler: ${browserErrors.join("; ")}`);

socket.close();
console.log(JSON.stringify({
  placeResult,
  wyrmAdministration,
  countyAdministration,
  countyResult,
  legacyMapResult,
  regionalResult,
  localResult,
}, null, 2));
