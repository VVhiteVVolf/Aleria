import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const output = resolve(root, 'diagnostics/scene-transition-20261104');
await mkdir(output, { recursive: true });
const css = (await Promise.all(['comments', 'scene-transition'].map(name =>
  readFile(new URL(`../styles/${name}.css`, import.meta.url), 'utf8')))).join('\n');
const scripts = await Promise.all(['state', 'ui'].map(name =>
  readFile(new URL(`../modules/scene-transition/scene-transition-${name}.js`, import.meta.url), 'utf8')));
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
try {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  await context.route('**/*', route => route.abort());
  const page = await context.newPage();
  await page.setContent(`<style>:root { --ink:#382611; --gold:#9b711c; --gold-dark:#70470d; --ink-faded:#735e45; }
    * { box-sizing:border-box; } body { margin:0; background:#f6efdd; }
    .fixture { display:flex; height:500px; } ${css}</style><div class="fixture"><div class="comments-scroll"></div></div>`);
  await page.addScriptTag({ content: `
    const escapeHtml = value => String(value ?? '').replace(/[&<>\"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));
    const sanitizeImageSrc = () => '';
    const parseCommentMarkup = escapeHtml;
    const getInitialChar = value => String(value)[0];
    const getCurrentCommentThreadId = () => 'castell::session:hall';
  ` });
  for (const script of scripts) await page.addScriptTag({ content: script });
  const measurements = [];
  let regressionBefore;
  for (const width of [1140, 390]) {
    await page.setViewportSize({ width, height: 640 });
    for (const count of [44, 75]) {
      for (const direction of ['departure', 'arrival']) {
        const measurement = await page.evaluate(({ count, direction }) => {
          const transition = {
            source: { threadId: 'castell::session:hall', entryId: 'castell', entryTitle: 'Castell Draig', pageTitle: 'Thronsaal' },
            target: { threadId: 'castell::session:room', entryId: 'castell', entryTitle: 'Castell Draig', pageTitle: 'Gawains Gemach' },
            flavourText: 'Die beiden verlassen den Thronsaal und gehen zu Gawains Gemach.',
            characters: [{ id: 'gawain', name: 'Gawain' }]
          };
          const scroll = document.querySelector('.comments-scroll');
          scroll.innerHTML = Array.from({ length: count - 1 }, (_, index) =>
            `<div class="comment-unit"><div class="comment-narrator"><div class="comment-narrator-text">Beitrag ${index + 1}: Die Unterhaltung geht weiter.</div></div></div>`).join('')
            + `<div class="comment-unit"><div class="scene-comment-time">Tag 2 · Seite ${count}</div>`
            + renderSceneTransitionBlock(transition, { threadId: transition[direction === 'arrival' ? 'target' : 'source'].threadId }) + '</div>';
          const card = scroll.querySelector('.scene-transition');
          scroll.scrollTop = scroll.scrollHeight;
          const cardRect = card.getBoundingClientRect();
          const text = card.querySelector('.scene-transition-copy').getBoundingClientRect();
          const route = card.querySelector('.scene-transition-route').getBoundingClientRect();
          const target = card.querySelector('.scene-transition-open');
          return { count, direction, height: cardRect.height, scrollHeight: card.scrollHeight,
            narrationVisible: text.top >= cardRect.top && text.bottom <= cardRect.bottom,
            routeVisible: route.top >= cardRect.top && route.bottom <= cardRect.bottom,
            linkTarget: target.dataset.transitionThreadId, targetTag: target.tagName,
            horizontalOverflow: scroll.scrollWidth > scroll.clientWidth + 2 };
        }, { count, direction });
        assert.ok(measurement.height + 1 >= measurement.scrollHeight, `${width}px, ${count} comments: transition clips its ${measurement.scrollHeight}px content at ${measurement.height}px`);
        assert.ok(measurement.narrationVisible, 'Narration must fit within the unclipped card');
        assert.ok(measurement.routeVisible, 'Source and target must fit within the unclipped card');
        assert.equal(measurement.linkTarget, direction === 'arrival' ? 'castell::session:hall' : 'castell::session:room');
        assert.equal(measurement.targetTag, 'BUTTON', 'A saved transition keeps its scene-navigation button');
        assert.equal(measurement.horizontalOverflow, false);
        measurements.push({ width, ...measurement });
        if (width === 1140 && count === 44 && direction === 'departure') {
          regressionBefore = await page.evaluate(() => {
            const style = document.createElement('style');
            style.textContent = '.scene-transition { flex: 0 1 auto; }';
            document.head.appendChild(style);
            const card = document.querySelector('.scene-transition');
            const result = { height: card.getBoundingClientRect().height, contentHeight: card.scrollHeight };
            style.remove();
            return result;
          });
          assert.ok(regressionBefore.height < 5, 'The previous flex behavior must reproduce the collapsed card');
          assert.ok(regressionBefore.contentHeight > 40, 'The saved content remains present beneath the clipped frame');
        }
      }
    }
    await page.screenshot({ path: resolve(output, `transition-long-thread-${width}.png`) });
  }
  await writeFile(resolve(output, 'layout-report.json'), `${JSON.stringify({ passed: true, networkBlocked: true, regressionBefore, measurements }, null, 2)}\n`);
  console.log(JSON.stringify({ passed: true, output, cases: measurements.length }));
} finally {
  await browser.close();
}
