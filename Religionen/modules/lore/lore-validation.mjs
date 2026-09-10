function text(value, context) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Überlieferungstext fehlt: ${context}`);
}

export function validateLoreBlocks(blocks, context) {
  if (!Array.isArray(blocks)) throw new Error(`Textblöcke fehlen: ${context}`);
  for (const block of blocks) {
    if (block.type === 'list') {
      if (!Array.isArray(block.items) || !block.items.length) throw new Error(`Leere Liste: ${context}`);
      block.items.forEach(item => text(item, context));
    } else if (['paragraph', 'heading'].includes(block.type)) text(block.text, context);
    else throw new Error(`Unbekannter Textblock: ${context}.${block.type}`);
  }
}

export function validateEntryLore(entry, sharedLore = {}) {
  if (entry.epithet !== undefined) text(entry.epithet, entry.id);
  for (const list of [entry.facts || [], entry.names || []]) {
    const labels = new Set();
    for (const fact of list) {
      text(fact.label, entry.id);
      text(fact.value, entry.id);
      if (labels.has(fact.label)) throw new Error(`Doppelte Angabe: ${entry.id}.${fact.label}`);
      labels.add(fact.label);
    }
  }
  for (const section of entry.sections) {
    if (section.blocks !== undefined) {
      if (section.paragraphs !== undefined) throw new Error(`Doppelte Textquelle: ${entry.id}.${section.id}`);
      validateLoreBlocks(section.blocks, `${entry.id}.${section.id}`);
    } else {
      if (!Array.isArray(section.paragraphs)) throw new Error(`Absätze fehlen: ${entry.id}.${section.id}`);
      section.paragraphs.forEach(paragraph => text(paragraph, `${entry.id}.${section.id}`));
    }
    if (section.sharedLore && !Object.hasOwn(sharedLore, section.sharedLore)) {
      throw new Error(`Gemeinsame Lehre fehlt: ${entry.id}.${section.sharedLore}`);
    }
  }
}
