import assert from 'node:assert/strict';
import test from 'node:test';
import { registerDisplayText } from '../modules/item-register/item-register-text.js';
import { detail } from '../modules/item-register/item-register-view.js';

test('register descriptions project rich text with paragraphs, line breaks and list boundaries', () => {
  assert.equal(registerDisplayText('<p>Erster <strong>Absatz</strong>.</p><p>Zweiter<br>Zeile.</p><ul><li>Eins</li><li>Zwei</li></ul>'),
    'Erster Absatz.\n\nZweiter\nZeile.\n\n• Eins\n• Zwei');
  assert.equal(registerDisplayText('Zwei Absätze.\n\nZweiter. 2 < 3 & 4 > 2'), 'Zwei Absätze.\n\nZweiter. 2 < 3 & 4 > 2');
});

test('register text decodes saved HTML entities and discards non-content without executing markup', () => {
  assert.equal(registerDisplayText('&lt;p&gt;F&uuml;r 5&nbsp;&euro; &amp; &#x1f40e;&lt;/p&gt;'), 'Für 5 € & 🐎');
  assert.equal(registerDisplayText('<p>Ware</p><script>alert(1)</script><style>body{display:none}</style><img src=x onerror=alert(2)>'), 'Ware');
});

test('register detail renders safe text, keeps paragraph spacing and never rewrites the original item', () => {
  const item = { id: 'test', title: 'Ware', section: 'offer', category: 'sonstiges', description: '<p>Erster &amp; zweiter.</p><p>Weiter.</p>',
    details: '<p>2 &lt; 3</p><img src=x onerror=alert(1)>', infoRows: [{ label: 'Hinweis', value: '<p>Gut verpackt</p>' }] };
  const before = structuredClone(item);
  const html = detail(item, { characters: [], owned: [], items: [], standards: [] }, { canEditSharedContent: false });
  assert.match(html, /Erster &amp; zweiter\.\n\nWeiter\.\n\n2 &lt; 3/);
  assert.match(html, /<dd>Gut verpackt<\/dd>/);
  assert.doesNotMatch(html, /&lt;\/?p&gt;|onerror|alert\(/);
  assert.deepEqual(item, before);
});
