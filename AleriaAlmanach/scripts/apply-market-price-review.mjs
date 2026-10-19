import { readFile, writeFile } from 'node:fs/promises';
import vm from 'node:vm';
import { MARKET_PRICE_REVIEW, VENUE_PRICE_REVIEW } from '../modules/economy-pricing/price-review-rules.mjs';
const root = new URL('../../', import.meta.url), check = process.argv.includes('--check');
const sources = { Taverne: ['Markt/Taverne/data/tavern-data.js', 'TAVERN_DATA'],
  'Gemischtwarenhändler': ['Markt/Gemischtwarenhändler/data/goods-data.js', 'GOODS_DATA'],
  'Waffen & Rüstungen': ['Markt/WaffenRüstungen/data/shop-data.js', 'ARMORY_DATA'] };
for (const [market, [path, name]] of Object.entries(sources)) {
  const url = new URL(path, root); let source = await readFile(url, 'utf8');
  for (const rule of MARKET_PRICE_REVIEW[market]) {
    if (market === 'Gemischtwarenhändler') {
      const lines = source.split('\n'), index = lines.findIndex(line => line.trimStart().startsWith(`['${rule.id}',`) || line.trimStart().startsWith(`["${rule.id}",`));
      if (index < 0) throw Error(`Missing market row ${market}/${rule.id}`);
      const line = lines[index], row = vm.runInNewContext(`(${line.trim().replace(/,$/, '')})`), old = Array.isArray(row[5]) ? [...row[5]] : [row[5], row[5]];
      if (JSON.stringify(old) !== JSON.stringify(rule.before) && JSON.stringify(old) !== JSON.stringify(rule.after)) throw Error(`Unexpected authored price ${rule.id}`);
      row[5] = rule.after[0] === rule.after[1] ? rule.after[0] : rule.after;
      lines[index] = line.match(/^\s*/)[0] + JSON.stringify(row) + (line.trim().endsWith(',') ? ',' : ''); source = lines.join('\n');
    } else {
      const pattern = new RegExp(`(id:\\s*'${rule.id}'[\\s\\S]*?price:\\s*)\\{[^}]*\\}`);
      if (!pattern.test(source)) throw Error(`Missing market object ${market}/${rule.id}`);
      source = source.replace(pattern, `$1{ min: ${rule.after[0]}, max: ${rule.after[1]}, unit: 'K' }`);
    }
  }
  const context = vm.createContext({ window: {} }); vm.runInContext(source, context);
  for (const rule of MARKET_PRICE_REVIEW[market]) {
    const row = context.window[name].items.find(item => item.id === rule.id);
    if (!row || row.price.min !== rule.after[0] || row.price.max !== rule.after[1]) throw Error(`Market rewrite failed: ${rule.id}`);
  }
  if (check) { if (source !== await readFile(url, 'utf8')) throw Error(`Price review not applied: ${path}`); }
  else await writeFile(url, source);
}
console.log(`Market price review ${check ? 'checked' : 'applied'}: ${Object.values(MARKET_PRICE_REVIEW).reduce((sum, rules) => sum + rules.length, 0)} prices.`);
for (const [moduleId, path, factory] of [
  ['goettliche-eleganz', 'AleriaAlmanach/modules/goettliche-eleganz/eleganz-collection.mjs', 'model'],
  ['zum-dritten-funken', 'AleriaAlmanach/modules/gofrann-schmiede/gofrann-weapons.mjs', 'weapon']
]) {
  const url = new URL(path, root); let source = await readFile(url, 'utf8');
  for (const rule of VENUE_PRICE_REVIEW[moduleId]) {
    const id = rule.id.split(':').at(-1), pattern = new RegExp(`(${factory}\\('${id}','[^']*',${factory === 'weapon' ? "'[^']*'," : ''})([\\d.]+),`);
    const match = source.match(pattern);
    if (!match || ![rule.before[0], rule.after[0]].includes(Number(match[2]))) throw Error(`Unexpected authored venue price ${moduleId}/${id}`);
    source = source.replace(pattern, `$1${rule.after[0]},`);
  }
  if (check) { if (source !== await readFile(url, 'utf8')) throw Error(`Venue price review not applied: ${path}`); }
  else await writeFile(url, source);
}
