import {parsePrice} from '../item-register/item-register-money.js';
export function fixedTradePrice(value) {
  const price=parsePrice(value);
  if(!price || price.minCopper!==price.maxCopper) throw new Error(`Ungültiger Ausschankpreis: ${value}`);
  return {priceMin:price.minCopper.toLocaleString('de-DE',{maximumFractionDigits:2}),priceMax:'',currencyCode:'KT',currencyLabel:'Kupfertaler',currencyIcon:'◈'};
}
/** Preserve canonical identity, units, ranges and artwork when a venue lists standard goods. */
export function standardItemToTradeItem(item, { defaults = {}, idPrefix }) {
  return { ...defaults, ...fixedTradePrice(`${item.priceRange.minCopper.toLocaleString('de-DE')} Kupfertaler`),
    priceMax: item.priceRange.maxCopper !== item.priceRange.minCopper ? item.priceRange.maxCopper.toLocaleString('de-DE') : '',
    id: `${idPrefix}-${item.id.split(':').at(-1)}`, canonicalKey: item.canonicalKey, category: item.category,
    title: item.title, subtitle: item.type, unit: item.hiddenMeta.unit, image: item.image,
    attributes: structuredClone(item.attributes), tags: [...item.tags], features: [item.hiddenMeta.unit], description: `<p>${item.description}</p>` };
}
export function convertStandardGoods(page,{defaults,origin,descriptionForRow,conditionsForRow,foodBadge='Aus der Hausküche',drinkBadge='Am Tresen'}) {
  if(!page.goodsTable) return structuredClone(page.tradeCatalog.items.filter(item=>item.id.startsWith('standard-')));
  return page.goodsTable.tables.flatMap(table=>table.rows).filter(row=>['speisen','getranke'].includes(row.category)).map((row,index)=>{
    const value=row.values,food=row.category==='speisen';
    return {...defaults,...fixedTradePrice(value.price),id:`standard-${String(index+1).padStart(2,'0')}`,category:row.category,
      title:value.name,subtitle:value.kind,unit:value.portion,image:row.image,imageFormat:row.imageFormat,
      badge:food?foodBadge:drinkBadge,tags:[food?'Standardküche':'Standardausschank'],
      description:descriptionForRow(row),origin,usageTags:[value.portion],priceNote:'',conditions:conditionsForRow(row)};
  });
}
