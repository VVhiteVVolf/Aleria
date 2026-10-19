// Build-time adapters: use the published module sources, never duplicate menus.
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { buildKleinerDurst } from '../kleiner-durst/durst-module.mjs';
import { withKanneServices } from '../krumme-kanne/krumme-kanne-services.mjs';
import { applyVenuePriceReview } from '../economy-pricing/price-review-model.mjs';
import { projectGwynthorSections } from '../gwynthor-geography/gwynthor-section-layout.mjs';

export async function readEconomyVenues() {
  const kanne = JSON.parse(await readFile(new URL('../krumme-kanne/source/module-before-services.json', import.meta.url), 'utf8'));
  const context = vm.createContext({ SECTIONS: [], structuredClone });
  vm.runInContext(await readFile(new URL('../letzte-rast/rast-data.js', import.meta.url), 'utf8'), context);
  return [buildKleinerDurst(), withKanneServices(kanne.entry), ...structuredClone(context.SECTIONS.flatMap(section => section.entries))].map(applyVenuePriceReview);
}

export async function readEconomyModuleSources() {
  const root = new URL('../../', import.meta.url), html = await readFile(new URL('AleriaAlmanach.html', root), 'utf8');
  const context = vm.createContext({ SECTIONS: [], structuredClone });
  const files = [...html.matchAll(/<script\s+src="\.\/(modules\/[^"?]+-data\.js)(?:\?[^" ]*)?"/g)].map(match => match[1]);
  for (const path of files) {
    const source = await readFile(new URL(path, root), 'utf8');
    if (!source.includes('SECTIONS') || !/"(?:tradeCatalogPage|guildServicesPage|goodsTablePage)": true/.test(source)) continue;
    vm.runInContext(source, context, { filename: path });
  }
  const sections = structuredClone(context.SECTIONS);
  const legacy = JSON.parse(await readFile(new URL('./sources/public-shop-modules-2026-10-19.json', import.meta.url), 'utf8'));
  const ids = new Set(sections.flatMap(section => section.entries || []).map(entry => entry.id));
  for (const { section, entry } of legacy.records) if (!ids.has(entry.id)) {
    sections.push({ ...section, entries: [entry] }); ids.add(entry.id);
  }
  return projectGwynthorSections(sections).map(section => ({ ...section, entries: (section.entries || []).map(applyVenuePriceReview) }));
}

export async function readEconomyCalendar() {
  const context = vm.createContext({});
  vm.runInContext(await readFile(new URL('../core/aleria-calendar.js', import.meta.url), 'utf8'), context);
  return Object.fromEntries(['daysPerWeek', 'daysPerMonth', 'daysPerYear', 'monthsPerYear'].map(key => [key, context.AleriaCalendar[key]]));
}
