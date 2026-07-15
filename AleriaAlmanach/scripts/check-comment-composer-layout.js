#!/usr/bin/env node

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const almanachRoot = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(almanachRoot, 'styles/comment-composer.css'), 'utf8');
const html = fs.readFileSync(path.join(almanachRoot, 'AleriaAlmanach.html'), 'utf8');

function ruleFor(selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`, 'u'));
  assert.ok(match, `CSS-Regel fehlt: ${selector}`);
  return match[1];
}

[
  '#comment-form-overlay .cf-char-picker',
  '#comment-form-overlay .cf-emote-picker',
  '#comment-form-overlay .comment-segment-avatar-row'
].forEach(selector => {
  const rule = ruleFor(selector);
  assert.match(rule, /display:\s*grid;/u, `${selector} muss als Grid umbrechen.`);
  assert.match(rule, /grid-template-columns:\s*repeat\(auto-fill,/u, `${selector} braucht automatisch umbrechende Spalten.`);
  assert.match(rule, /overflow-x:\s*hidden;/u, `${selector} darf die Seite nicht horizontal verbreitern.`);
  assert.match(rule, /overflow-y:\s*auto;/u, `${selector} muss bei vielen Bildern vertikal scrollbar bleiben.`);
});

assert.match(ruleFor('#comment-form-overlay .comment-compose-layout'), /overflow:\s*hidden;/u);
assert.match(ruleFor('#comment-form-overlay .comment-compose-editor'), /min-width:\s*0;/u);
assert.match(html, /comment-composer\.css\?v=20260715-comment-wrap-v1/u, 'Der Cache-Buster für das korrigierte Stylesheet fehlt.');

console.log('Kommentar-Composer OK: Bildauswahlen umbrechen, Container bleiben begrenzt und der CSS-Cache wird erneuert.');
