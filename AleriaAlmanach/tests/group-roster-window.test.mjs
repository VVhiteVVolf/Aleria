import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { selectGroupRosterWindow, mountGroupRosterWindow } from '../modules/landing/group-roster-window.js';
import { renderGroupRoster, renderGroupRosterResults } from '../modules/landing/group-landing-view.js';
import { projectGroupReadiness } from '../modules/landing/group-landing-combat.js';

const { parseFragment } = createRequire(new URL('../../firebase/package.json', import.meta.url))('parse5');
const attr = (node, name) => node.attrs?.find(attribute => attribute.name === name)?.value;
const nodes = root => (root.childNodes || []).flatMap(node => [node, ...nodes(node)]);
const cards = markup => nodes(parseFragment(markup)).filter(node => node.tagName === 'article' && attr(node, 'data-member-id') != null);
const crew = count => Array.from({ length: count }, (_, index) => ({ id: `crew-${index}`, kind: 'character', characterId: `person-${index}`,
  name: `Mannschaft ${String(index).padStart(4, '0')}`, role: index % 2 ? 'Matrose' : 'Schütze', assignment: index % 2 ? 'reserve' : 'active',
  source: 'hierarchy', readiness: projectGroupReadiness({}, null) }));

test('2000 members and a 50-plus crew render one bounded compact DOM page with correct final-page navigation', () => {
  for (const count of [51, 2000]) {
    const members = crew(count), first = renderGroupRoster(members), page = selectGroupRosterWindow(members, { page: 9999 });
    assert.equal(cards(first).length, 20);
    assert.match(first, /group-roster-list/);
    assert.equal(first.includes(`data-member-id="crew-${count - 1}"`), false);
    assert.equal(page.pages, Math.ceil(count / 20));
    assert.equal(page.page, page.pages - 1);
    assert.equal(page.last, count);
    assert.equal(page.members.at(-1).id, `crew-${count - 1}`);
    const final = renderGroupRosterResults(page);
    assert.ok(cards(final).length <= 20);
    const next = nodes(parseFragment(final)).find(node => attr(node, 'data-group-roster-page') === 'next');
    assert.ok(next.attrs.some(attribute => attribute.name === 'disabled'));
  }
  assert.match(renderGroupRoster(crew(4)), /group-roster-portraits/);
  assert.match(renderGroupRoster(crew(5)), /group-roster-list/);
});

test('name, accent-insensitive role and assignment filters reset and clamp pages without losing members', () => {
  const members = crew(2000);
  assert.equal(selectGroupRosterWindow(members, { search: 'schutze', assignment: 'active' }).filtered, 1000);
  assert.deepEqual(selectGroupRosterWindow(members, { search: 'Mannschaft 1999' }).members.map(member => member.id), ['crew-1999']);
  const reduced = selectGroupRosterWindow(members.slice(0, 7), { page: 99 });
  assert.deepEqual([reduced.page, reduced.pages, reduced.first, reduced.last], [0, 1, 1, 7]);
  const empty = selectGroupRosterWindow(members, { search: 'Niemand vorhanden', page: 99 });
  assert.deepEqual([empty.page, empty.pages, empty.filtered, empty.first, empty.last], [0, 1, 0, 0, 0]);
  assert.equal(selectGroupRosterWindow(members, { page: -4 }).page, 0);
});

class RosterRoot extends EventTarget {
  constructor() {
    super(); this.document = { activeElement: null }; this.writes = 0;
    this.search = { value: '', selectionStart: 0, selectionEnd: 0, matches: selector => selector === '[data-group-roster-search]' };
    this.assignment = { value: 'all', matches: selector => selector === '[data-group-roster-assignment]' };
    this.count = { textContent: '' };
    this.results = {};
    Object.defineProperty(this.results, 'innerHTML', { get: () => this.markup || '', set: value => { this.markup = value; this.writes++; } });
  }
  set innerHTML(_value) { assert.fail('Live updates must not replace the controls or their focused input.'); }
  querySelector(selector) { return selector === '[data-group-roster-results]' ? this.results : selector === '[data-group-roster-count]' ? this.count : null; }
  contains(target) { return target?.owner === this; }
  emit(type, target) { const event = new Event(type); Object.defineProperty(event, 'target', { value: target }); this.dispatchEvent(event); }
  page(direction) {
    const node = nodes(parseFragment(this.markup)).find(node => attr(node, 'data-group-roster-page') === direction);
    assert.ok(node, `Page control ${direction} exists`);
    const button = { owner: this, dataset: { groupRosterPage: direction }, disabled: node.attrs.some(attribute => attribute.name === 'disabled') };
    this.emit('click', { closest: () => button });
  }
}

test('live roster pushes preserve focused search, selection and current page; shrinking results clamp; destroy releases listeners', () => {
  const root = new RosterRoot(), members = crew(2000), mounted = mountGroupRosterWindow(root, renderGroupRosterResults);
  mounted.update(members);
  root.search.value = 'Mannschaft'; root.emit('input', root.search);
  root.page('next'); root.page('next');
  assert.equal(cards(root.markup)[0].attrs.find(attribute => attribute.name === 'data-member-id').value, 'crew-40');
  const input = root.search;
  root.document.activeElement = input; input.selectionStart = 2; input.selectionEnd = 6;
  mounted.update(members.map(member => ({ ...member, note: 'Aktueller Stand' })));
  assert.equal(root.search, input);
  assert.equal(root.document.activeElement, input);
  assert.deepEqual([input.value, input.selectionStart, input.selectionEnd], ['Mannschaft', 2, 6]);
  assert.equal(root.count.textContent, '41–60 von 2000 Gefährten');
  root.assignment.value = 'active'; root.emit('change', root.assignment);
  assert.equal(root.count.textContent, '1–20 von 1000 Gefährten');
  root.page('next'); mounted.update(members.slice(0, 7));
  assert.equal(root.count.textContent, '1–4 von 4 Gefährten');
  assert.equal(cards(root.markup).length, 4);
  assert.equal(root.document.activeElement, input);
  const before = root.writes;
  mounted.destroy(); mounted.update(members); root.emit('input', input); root.emit('change', root.assignment);
  assert.equal(root.writes, before);
});
