import { HOUSE_WYLAN_PORTRAITS } from './house-wylan-portraits.js';

// Die Ui-Trisceil-Quelle verwendet ausschließlich alte Portraitfassungen.
// Sie werden bewusst nicht übernommen. Nur die vier bereits in der
// ausgearbeiteten Wylan-Gegenakte vorhandenen Weltpersonen behalten dort ihre
// kanonischen, neueren lokalen Bilder; alle übrigen Karten nutzen Platzhalter.
export const HOUSE_UI_TRISCEIL_LOCAL_PORTRAIT_IDS = Object.freeze([]);

export const HOUSE_UI_TRISCEIL_PORTRAITS = Object.freeze({
  'melwas-wylan': HOUSE_WYLAN_PORTRAITS['melwas-wylan'],
  'sadbbh-trisceil': HOUSE_WYLAN_PORTRAITS['sadbbh-trisceil'],
  'merlion-wylan': HOUSE_WYLAN_PORTRAITS['merlion-wylan'],
  'tadhgin-trisceil': HOUSE_WYLAN_PORTRAITS['tadhgin-trisceil']
});
