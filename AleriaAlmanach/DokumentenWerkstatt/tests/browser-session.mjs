import { fileURLToPath } from 'node:url';
import { join, resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';
export const base = process.env.WORKSHOP_BASE_URL || 'http://127.0.0.1:4187';
export const workspace = fileURLToPath(new URL('../../../', import.meta.url));
export const artifacts = resolve(workspace, '.codex-temp', 'document-workshop');
await mkdir(artifacts, { recursive: true });
export const artifact = name => join(artifacts, name);
import { writeFile } from 'node:fs/promises';
const targets = await (await fetch(`http://127.0.0.1:${process.env.WORKSHOP_BROWSER_PORT || 9337}/json/list`)).json();
const target = targets.find(page => page.type === 'page' && page.url.startsWith(base + '/')) || targets.find(page => page.type === 'page' && page.url === 'about:blank');
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
let next = 0;
const pending = new Map();
export const errors = [];
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.id) { const waiter = pending.get(message.id); pending.delete(message.id); if (message.error) waiter?.reject(new Error(message.error.message)); else waiter?.resolve(message.result); }
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
});
export function command(method, params = {}) {
  const id = ++next; socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}
export async function evaluate(expression) {
  const result = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
export async function navigate(url) {
  await command('Page.navigate', { url });
  await new Promise(resolve => setTimeout(resolve, 600));
  for (let tries = 0; tries < 80; tries++) {
    await new Promise(resolve => setTimeout(resolve, 100));
    if (await evaluate('document.readyState === "complete" && !!document.querySelector(".paper-shell")')) return;
  }
}
export async function screenshot(path) { const shot = await command('Page.captureScreenshot', { format: 'png' }); await writeFile(path, Buffer.from(shot.data, 'base64')); }
export const close = () => socket.close();
await command('Page.enable'); await command('Runtime.enable');
await command('Network.enable'); await command('Network.setCacheDisabled', { cacheDisabled: true });
