import assert from "node:assert/strict";

const devtoolsPort = Number(process.argv[2] || 9228);
const targetUrl = process.argv[3]
  || "http://127.0.0.1:8765/Zeitungen/zeitung.html?zeitung=schwarzbote-gwynthor";

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
    const details = message.params.exceptionDetails;
    browserErrors.push(details.exception?.description || details.text || "Unbekannte Laufzeitausnahme");
  }
  if (message.method === "Log.entryAdded" && message.params.entry.level === "error") {
    const entry = message.params.entry;
    browserErrors.push([entry.text, entry.url].filter(Boolean).join(" — "));
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
  return new Promise((resolve) => {
    eventWaiters.set(method, [...(eventWaiters.get(method) || []), resolve]);
  });
}

async function evaluate(expression) {
  const result = await command("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  }
  return result.result.value;
}

await command("Page.enable");
await command("Runtime.enable");
await command("Log.enable");
const loaded = waitForEvent("Page.loadEventFired");
await command("Page.navigate", { url: targetUrl });
await loaded;
await new Promise((resolve) => setTimeout(resolve, 1500));

const state = await evaluate(`(() => ({
  title: document.title,
  loadingText: document.querySelector('.newspaper-loading')?.textContent || '',
  sheetCount: document.querySelectorAll('.newspaper-sheet').length,
  archiveOptions: document.querySelectorAll('.newspaper-archive-select option').length,
  pageText: document.querySelector('[data-newspaper-page]')?.textContent?.trim().slice(0, 180) || ''
}))()`);

assert.equal(state.loadingText, "", `Ladehinweis blieb sichtbar: ${state.pageText}`);
assert.equal(state.sheetCount, 1, `Zeitung wurde nicht gerendert: ${state.pageText}`);
assert.ok(state.archiveOptions >= 1, "Das Ausgabenarchiv wurde nicht gerendert.");
assert.deepEqual(browserErrors, [], `Browserfehler: ${browserErrors.join("\n")}`);

socket.close();
console.log(JSON.stringify(state, null, 2));
