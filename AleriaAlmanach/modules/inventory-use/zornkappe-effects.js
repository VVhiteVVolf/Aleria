export function isZornkappe(item = {}) {
  return /^(zornkappe|berserkerpilz|berserker-pilz)$/i.test(String(item.name || '').trim())
    || String(item.id || '') === 'zornkappe';
}

export function applyZornkappeUse(conditions = [], use = {}) {
  if (use.mode !== 'consume' || !isZornkappe(use.item)) return { changed: false, conditions };
  const previous = conditions.find(condition => condition.active !== false && condition.sourceConditionId === 'zornkappe-rausch');
  const stacks = (Number(previous?.zornkappeStacks) || 0) + Math.max(1, Math.trunc(Number(use.quantity) || 1));
  if (stacks > 3) throw new Error('Die Zornkappe ist auf drei Pilze pro aktivem Rausch begrenzt.');
  const bonus = 2 ** stacks;
  const condition = {
    id: `zornkappe-rausch-${use.actorId}`, sourceConditionId: 'zornkappe-rausch', sourceActorId: String(use.actorId || ''),
    name: `Zornkappenrausch · ${stacks} ${stacks === 1 ? 'Pilz' : 'Pilze'}`, active: true,
    source: 'Zornkappe (Berserkerpilz)', icon: 'https://i.imgur.com/NJInJ9x.png',
    description: `+${bonus} Schaden, −${bonus} RK. Keine Änderung am Trefferwurf; kein Kraftbonus und keine Rettung bei 0 LP.`,
    mechanics: { damage: bonus, damageScope: 'all-effects', armorClass: -bonus },
    zornkappeStacks: stacks, duration: 'Bis Kampfende', durationModel: { kind: 'combat' }
  };
  return { changed: true, conditions: [...conditions.filter(entry => entry !== previous), condition], condition };
}

// Draft-only projection; the server repeats consumption against the real inventory.
export function previewZornkappeSegment(segment, character, state = {}) {
  const item = (state.inventory || character.inventory)?.items?.find(entry => String(entry.id) === String(segment.inventoryItemId || segment.inventoryUse?.item?.id));
  if (!item || !isZornkappe(item) || segment.inventoryUseMode === 'use') return state;
  const quantity = Number.parseInt(String(item.quantity ?? 1), 10);
  if (quantity < 1) return state;
  const result = applyZornkappeUse(state.temporaryConditions || [], { item, actorId: character.id, mode: 'consume', quantity: 1 });
  const inventory = structuredClone(state.inventory || character.inventory);
  inventory.items = inventory.items.map(entry => entry.id === item.id ? { ...entry, quantity: String(quantity - 1) } : entry);
  return { ...state, temporaryConditions: result.conditions, inventory };
}
