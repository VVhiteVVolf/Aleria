import { STANDARD_ITEMS } from '../item-register/item-register-standard.js';

const art = '/AleriaAlmanach/assets/gwynthor-troetzli/items';
function variant(id, fields) {
  const template = STANDARD_ITEMS.find(item => item.id === id);
  if (!template) throw Error(`Registervorlage für Cynddelws Belohnung fehlt: ${id}`);
  return Object.freeze({ ...template, ...fields });
}

// These are described reward pieces of real goods-register templates. They do
// not create a new vendor, stock, price, enchantment or automatic inventory grant.
export const TROETZLI_REWARD_ITEMS = Object.freeze([
  variant('standard:gemischtwarenhandler:notizbuch', {
    title: 'Schickes Notizbuch', image: `${art}/schickes-notizbuch-v1.png`,
    description: 'Ein kleines, sorgfältig gebundenes Notizbuch mit dunkelgrünem Ledereinband, schlichter Flechtprägung, Messingecken und einem kleinen Verschluss. Zwanzig unbeschriebene Seiten aus handgeschöpftem Papier warten auf eigene Notizen oder Zeichnungen.',
    details: 'Ein einzelnes unbenutztes Notizbuch aus Cynddelws Vorrat. Enthält keine fremden Aufzeichnungen; unverzaubert. Persönliche Ausführung der vorhandenen Güterregistervorlage „Notizbuch (klein)“.',
  }),
  variant('standard:gemischtwarenhandler:feder-tinte', {
    title: 'Schreibutensilien', image: `${art}/schreibutensilien-v1.png`,
    description: 'Eine sauber zugeschnittene Schreibfeder und ein verschlossenes Tintenfläschchen mit Ruß- und Galläpfeltinte, zusammen mit einer schlichten braunen Lederhülle für unterwegs.',
    details: 'Ein vollständiges Set aus einer Feder, einem Tintenfläschchen und der Lederhülle. Gewöhnliches, unverzaubertes Schreibzeug auf Grundlage des Registereintrags „Feder & Tinte“.',
  }),
]);
