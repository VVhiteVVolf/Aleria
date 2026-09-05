import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import {
  getActionPresentation,
  renderActionDetails,
  renderActionOptions,
  renderCombatValueStrip,
  renderMagicValueStrip,
  renderWeaponLoadout
} from '../modules/combat/ui/combat-action-card.js';

function weaponActor() {
  return {
    activeWeaponId: 'sword',
    weapons: [
      { id: 'unarmed', name: 'Waffenlos', weaponType: 'unarmed' },
      {
        id: 'sword', name: 'Drachenzahn <Draig> & "Erbe"', weaponType: 'sword', equipped: true,
        image: 'https://i.imgur.com/38Na5EY.png'
      },
      { id: 'dagger', name: 'Draig Dolch', weaponType: 'dagger', image: 'javascript:alert(1)' }
    ],
    actions: [
      { id: 'weapon:sword', sourceId: 'sword', name: 'Drachenzahn', kind: 'weapon', compatible: true },
      { id: 'weapon:dagger', sourceId: 'dagger', name: 'Draig Dolch', kind: 'weapon', compatible: false },
      { id: 'equip:sword', equipmentSwitchTargetId: 'sword', kind: 'equipment-switch', compatible: false },
      { id: 'equip:dagger', equipmentSwitchTargetId: 'dagger', kind: 'equipment-switch', compatible: true },
      { id: 'equip:unarmed', equipmentSwitchTargetId: 'unarmed', kind: 'equipment-switch', compatible: true }
    ],
    selectedAction: { id: 'weapon:sword', sourceId: 'sword', kind: 'weapon', compatible: true }
  };
}

function weaponButton(markup, id) {
  return [...markup.matchAll(/<button\b[^>]*>[\s\S]*?<\/button>/g)]
    .map(match => match[0])
    .find(button => button.includes(`data-weapon-id="${id}"`));
}

async function gawainAction(actionId = 'technique:combat-style-drachentanz-jungdrache-02-drachenbiss') {
  const exported = JSON.parse(await readFile(new URL('../../Charakter%20Archiv%20Exporte/gawain-draig.json', import.meta.url), 'utf8'));
  return resolveCombatProfile(exported.character, { actionId, segmentKind: 'combataction' });
}

test('die Waffenleiste zeigt die aktive Waffe zuerst und erhält vollständige, sicher maskierte Namen', () => {
  const markup = renderWeaponLoadout(weaponActor());
  const slots = [...markup.matchAll(/data-weapon-id="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(slots, ['sword', 'unarmed', 'dagger']);
  assert.match(weaponButton(markup, 'sword'), /Drachenzahn &lt;Draig&gt; &amp; &quot;Erbe&quot;/);
  assert.match(weaponButton(markup, 'sword'), /aria-pressed="true"/);
  assert.match(weaponButton(markup, 'sword'), /src="https:\/\/i\.imgur\.com\/38Na5EY\.png"/);
  assert.match(weaponButton(markup, 'dagger'), /data-combat-action-id="equip:dagger"/);
  assert.doesNotMatch(markup, /javascript:|<Draig>/);
});

test('ein vorgemerkter Waffenwechsel lässt sich am Zielslot und an der aktiven Waffe aufheben', () => {
  const actor = weaponActor();
  actor.selectedAction = actor.actions.find(action => action.id === 'equip:dagger');
  const markup = renderWeaponLoadout(actor);

  for (const id of ['sword', 'dagger']) {
    const button = weaponButton(markup, id);
    assert.ok(button, `Waffenslot ${id} fehlt`);
    assert.match(button, /data-combat-controller-action="select-weapon"/);
    assert.match(button, /data-combat-action-id="weapon:sword"/);
    assert.doesNotMatch(button.match(/^<button[^>]*>/)[0], /\sdisabled(?:[\s=>])/);
  }
  assert.match(weaponButton(markup, 'dagger'), /data-state="pending"/);
  assert.match(markup, /Wechsel aufheben/);
  assert.match(weaponButton(markup, 'unarmed'), /data-combat-action-id="equip:unarmed"/);
});

test('mehrere natürliche Angriffe erhalten keine irreführende Waffenwechsel-Leiste', () => {
  assert.equal(renderWeaponLoadout({
    weapons: [{ id: 'bite', name: 'Biss', weaponType: 'natural' }],
    actions: [{ id: 'weapon:bite', sourceId: 'bite', kind: 'weapon' }]
  }), '');
});

test('Gawains Attacken werden aus ihren Quelldaten nach der erlernten Form gruppiert', async () => {
  const actor = await gawainAction();
  const presentation = getActionPresentation(actor);
  assert.equal(presentation.entry.id, actor.selectedAction.sourceId);
  assert.match(presentation.group, /Tanz des Jungdrachens/);
  assert.equal(presentation.minimumLevel, 2);

  const options = renderActionOptions(actor, actor.selectedAction.id);
  assert.match(options, /<optgroup\b[^>]*label="[^"]*Tanz des Jungdrachens[^"]*"/);
  const biteOption = options.match(/<option\b[^>]*value="technique:combat-style-drachentanz-jungdrache-02-drachenbiss"[^>]*>[\s\S]*?<\/option>/)?.[0];
  assert.ok(biteOption);
  assert.match(biteOption, /\sselected(?:[\s=>])/);
  assert.match(biteOption, />Biss des Jungdrachens<\/option>/);
  assert.doesNotMatch(options, /1[dDwW]10\+1[dDwW]6/);
});

test('eine ausdrücklich benannte Kampfform bleibt auch ohne trainingForm in den Metadaten sichtbar', () => {
  const technique = { id: 'rapier-dance', name: 'Trällernde Spitze', combatStyleFormName: 'Tanz des trällernden Drachens', minimumLevel: 7 };
  const actor = {
    techniques: [technique],
    selectedAction: { id: 'technique:rapier-dance', sourceId: technique.id, kind: 'technique', name: technique.name }
  };
  assert.match(getActionPresentation(actor).group, /Tanz des trällernden Drachens/);
});

test('Gawains Technikbeschreibung, Wirkung und Voraussetzungen erscheinen jeweils nur einmal', async () => {
  const actor = await gawainAction();
  const { entry } = getActionPresentation(actor);
  const markup = renderActionDetails(actor);
  for (const field of ['description', 'effect', 'requirements']) {
    assert.equal(markup.split(entry[field]).length - 1, 1, `${field} darf nicht erneut als Waffenhinweis erscheinen`);
  }
});

test('magische und waffenbasierte Fähigkeiten behalten ihre eigenen Quelldaten', () => {
  const ability = { id: 'inspiration', name: 'Ritterliche Inspiration', description: 'Ein Lied stärkt den Mut.', requirements: 'Die Verbündeten müssen den Gesang hören.' };
  for (const kind of ['spell', 'prayer', 'song', 'weapon']) {
    const actor = {
      abilities: [ability], weapons: [], magic: { spells: [] },
      selectedAction: { id: 'ability:inspiration', sourceId: ability.id, kind, name: ability.name }
    };
    assert.equal(getActionPresentation(actor).entry.id, ability.id, `Quelldaten für ${kind}`);
    const markup = renderActionDetails(actor);
    assert.ok(markup.includes(ability.description));
    assert.ok(markup.includes(ability.requirements));
  }
});

test('ein Profil ohne verfügbare Handlung lässt sich ohne Darstellungsfehler öffnen', () => {
  const actor = { selectedAction: null, actions: [], magic: { spells: [] } };
  assert.doesNotThrow(() => getActionPresentation(actor));
  assert.equal(renderActionOptions(actor, ''), '');
  assert.equal(renderActionDetails(actor), '');
});

test('gesperrte Optionen zeigen den tatsächlichen Grund, auch bei fehlender Stufe oder Zauberkonfiguration', () => {
  const actor = {
    actions: [
      { id: 'technique:late', name: 'Meisterhieb', kind: 'technique', sourceId: 'late', compatible: false, disabledReason: 'Wird ab Stufe 9 freigeschaltet.' },
      { id: 'spell:ember', name: 'Glutlanze', kind: 'spell', compatible: false, disabledReason: 'Es fehlt ein Zauberplatz für Grad 2.' }
    ],
    techniques: [{ id: 'late', name: 'Meisterhieb', minimumLevel: 9, combatStyleFormName: 'Tanz des Schwertdrachen' }]
  };
  const markup = renderActionOptions(actor, 'technique:late');
  for (const action of actor.actions) {
    const option = [...markup.matchAll(/<option\b[^>]*>[\s\S]*?<\/option>/g)]
      .map(match => match[0]).find(value => value.includes(`value="${action.id}"`));
    assert.ok(option);
    assert.match(option.match(/^<option[^>]*>/)[0], /\sdisabled(?:[\s=>])/);
    assert.ok(option.includes(action.disabledReason));
  }
  assert.doesNotMatch(markup, /nicht mit aktiver Waffe möglich/);
});

test('aufklappbare Attackendetails behalten Wirkung und Voraussetzungen und maskieren sämtliche Freitexte', () => {
  const technique = {
    id: 'custom', name: 'Klingenwirbel', minimumLevel: 4,
    description: 'Ein <img src=x onerror=alert(1)> täuscht den Feind.',
    effect: 'Schaden & Entwaffnen', requirements: 'Stangenwaffe <oder> Speer',
    combatStyleFormName: 'Tanz <der> Klingen'
  };
  const actor = {
    techniques: [technique],
    selectedAction: { id: 'technique:custom', sourceId: 'custom', kind: 'technique', name: technique.name }
  };
  const closed = renderActionDetails(actor);
  const opened = renderActionDetails(actor, { open: true });
  assert.match(closed, /<details\b/);
  assert.doesNotMatch(closed.match(/<details\b[^>]*>/)?.[0] || '', /\sopen(?:[\s=>])/);
  assert.match(opened.match(/<details\b[^>]*>/)?.[0] || '', /\sopen(?:[\s=>])/);
  assert.match(closed, /Ein &lt;img src=x onerror=alert\(1\)&gt; täuscht den Feind\./);
  assert.match(closed, /Schaden &amp; Entwaffnen/);
  assert.match(closed, /Stangenwaffe &lt;oder&gt; Speer/);
  assert.doesNotMatch(closed, /<[^>]+\son(?:error|click|change|input)\s*=/i);
});

test('ein Waffenwechsel zeigt keine erfundenen Treffer- oder Schadenswerte', async () => {
  const actor = await gawainAction('equip:gawain-draig-dagger');
  assert.equal(actor.selectedAction.kind, 'equipment-switch');
  const markup = renderCombatValueStrip(actor);
  assert.doesNotMatch(markup, /Treffermodifikator|>\s*\+0\s*</);
  assert.doesNotMatch(markup, /1[WD]4|1[WD]8|1[WD]10/i);
});

test('kompakte Kampfwerte behalten die ausgewerteten Treffer- und Schadensmodifikatoren', async () => {
  const actor = await gawainAction();
  const markup = renderCombatValueStrip(actor);
  assert.match(markup, />\s*\+5\s*</);
  assert.match(markup, /1W8\s*\+\s*1W4\s*\+2/);
  assert.match(markup, /Hieb/);
});

test('Zauberwerte behalten Zauber-SG, Trefferbonus und Auflösungsart', () => {
  const markup = renderMagicValueStrip({
    actionResolutionMode: 'saving-throw',
    actionSpellSaveDc: 15,
    spellAttackModifier: 7,
    selectedAction: { kind: 'spell', spellLevel: 2 }
  });
  assert.match(markup, /Zauber-SG/);
  assert.match(markup, />\s*15\s*</);
  assert.match(markup, />\s*\+7\s*</);
  assert.match(markup, /Rettungswurf/);
});
