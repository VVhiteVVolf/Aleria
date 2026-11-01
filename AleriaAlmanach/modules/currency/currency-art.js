// Presentation only; the shared money model continues to own denominations.
// All four denominations use original Aleria artwork. The new gold/silver
// originals remain PNG; their transparent WebP derivatives are used on screen.
// An older generic/DND mapping must never fill missing artwork references.
export const ALERIA_CURRENCY_DISPLAY = Object.freeze([
  { id:'gold',label:'Goldtaler',short:'GT',icon:'/AleriaAlmanach/assets/currency/aleria-goldtaler-v1.webp' },
  { id:'silver',label:'Silbertaler',short:'ST',icon:'/AleriaAlmanach/assets/currency/aleria-silbertaler-v1.webp' },
  { id:'copper',label:'Kupfertaler',short:'KT',icon:'/AleriaAlmanach/assets/gwynthor-troetzli/items/copper-coin-v1.png' },
  { id:'pfennig',label:'Eisenpfennig',short:'Pf',icon:'/AleriaAlmanach/public/assets/inventory/coins/eisenpfennig.png' }
].map(Object.freeze));

export function currencyArt(id) {
  return ALERIA_CURRENCY_DISPLAY.find(currency=>currency.id===id)?.icon || '';
}
