(() => {
  "use strict";

  const HOUSE_STATUS = Object.freeze({
    TEMPLATE: "template",
    DRAFT: "draft",
    ACTIVE: "active",
    ARCHIVED: "archived",
  });

  const HOUSE_TYPES = Object.freeze({
    HOUSE: "house",
    FAMILY: "family",
    CLAN: "clan",
    DYNASTY: "dynasty",
    CADET_BRANCH: "cadet-branch",
  });

  const HOUSES = [
    // BEGIN GENERATED HOUSE PAGES
    {"id":"haus-ard-conbhron","slug":"haus-ard-conbhron","aliases":[],"name":"Haus Ard Conbhrón","status":"active","type":"clan","page":"haus.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Antike_Crannath_Clans/Haus_Ard_Conbhron/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Antike Crannath Clans","slug":"antike-crannath-clans"},{"type":"Sitz","name":"Lycath","slug":"lycath"},{"type":"Haus","name":"Haus Ard Conbhrón","slug":"haus-ard-conbhron"}],"tags":["Celtigerns Wacht","Clan"],"prepared":false},
    {"id":"haus-ui-talamh","slug":"haus-ui-talamh","aliases":[],"name":"Haus Ui Talamh","status":"active","type":"clan","page":"haus.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Antike_Crannath_Clans/Haus_Ui_Talamh/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Antike Crannath Clans","slug":"antike-crannath-clans"},{"type":"Sitz","name":"Antikes Gwynthor","slug":"antikes-gwynthor"},{"type":"Haus","name":"Haus Ui Talamh","slug":"haus-ui-talamh"}],"tags":["Celtigerns Wacht","Clan"],"prepared":false},
    {"id":"haus-almarch","slug":"haus-almarch","aliases":[],"name":"Haus Almarch","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Almarch/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Artus Streben","slug":"artus-streben"},{"type":"Sitz","name":"Rhosmere","slug":"rhosmere"},{"type":"Haus","name":"Haus Almarch","slug":"haus-almarch"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":true},
    {"id":"haus-althin","slug":"haus-althin","aliases":[],"name":"Haus Althin","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Althin/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Artus Streben","slug":"artus-streben"},{"type":"Sitz","name":"Rhosmere","slug":"rhosmere"},{"type":"Haus","name":"Haus Althin","slug":"haus-althin"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":true},
    {"id":"haus-bekab","slug":"haus-bekab","aliases":[],"name":"Haus Bekab","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Bekab/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Artus Streben","slug":"artus-streben"},{"type":"Sitz","name":"Rhosmere","slug":"rhosmere"},{"type":"Haus","name":"Haus Bekab","slug":"haus-bekab"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":true},
    {"id":"haus-brinmarch","slug":"haus-brinmarch","aliases":[],"name":"Haus Brinmarch","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Brinmarch/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Artus Streben","slug":"artus-streben"},{"type":"Sitz","name":"Rhosmere","slug":"rhosmere"},{"type":"Haus","name":"Haus Brinmarch","slug":"haus-brinmarch"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":true},
    {"id":"haus-coedvarn","slug":"haus-coedvarn","aliases":[],"name":"Haus Coedvarn","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Coedvarn/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Artus Streben","slug":"artus-streben"},{"type":"Sitz","name":"Rhosmere","slug":"rhosmere"},{"type":"Haus","name":"Haus Coedvarn","slug":"haus-coedvarn"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":true},
    {"id":"haus-eirfael","slug":"haus-eirfael","aliases":[],"name":"Haus Eirfael","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Eirfael/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Artus Streben","slug":"artus-streben"},{"type":"Sitz","name":"Rhosmere","slug":"rhosmere"},{"type":"Haus","name":"Haus Eirfael","slug":"haus-eirfael"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":true},
    {"id":"haus-ghorswyn","slug":"haus-ghorswyn","aliases":[],"name":"Haus Ghorswyn","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Ghorswyn/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Artus Streben","slug":"artus-streben"},{"type":"Sitz","name":"Rhosmere","slug":"rhosmere"},{"type":"Haus","name":"Haus Ghorswyn","slug":"haus-ghorswyn"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":true},
    {"id":"haus-gwardin","slug":"haus-gwardin","aliases":[],"name":"Haus Gwardin","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Gwardin/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Artus Streben","slug":"artus-streben"},{"type":"Sitz","name":"Rhosmere","slug":"rhosmere"},{"type":"Haus","name":"Haus Gwardin","slug":"haus-gwardin"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":true},
    {"id":"haus-gwynrhos","slug":"haus-gwynrhos","aliases":[],"name":"Haus Gwynrhos","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Gwynrhos/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Artus Streben","slug":"artus-streben"},{"type":"Sitz","name":"Rhosmere","slug":"rhosmere"},{"type":"Haus","name":"Haus Gwynrhos","slug":"haus-gwynrhos"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":true},
    {"id":"haus-iorwen","slug":"haus-iorwen","aliases":[],"name":"Haus Iorwen","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Iorwen/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Artus Streben","slug":"artus-streben"},{"type":"Sitz","name":"Rhosmere","slug":"rhosmere"},{"type":"Haus","name":"Haus Iorwen","slug":"haus-iorwen"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":true},
    {"id":"haus-maethan","slug":"haus-maethan","aliases":[],"name":"Haus Maethan","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Maethan/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Artus Streben","slug":"artus-streben"},{"type":"Sitz","name":"Rhosmere","slug":"rhosmere"},{"type":"Haus","name":"Haus Maethan","slug":"haus-maethan"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":true},
    {"id":"haus-rhen","slug":"haus-rhen","aliases":[],"name":"Haus Rhen","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Rhen/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Artus Streben","slug":"artus-streben"},{"type":"Sitz","name":"Rhosmere","slug":"rhosmere"},{"type":"Haus","name":"Haus Rhen","slug":"haus-rhen"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":true},
    {"id":"haus-talmeirch","slug":"haus-talmeirch","aliases":[],"name":"Haus Talmeirch","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Talmeirch/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Artus Streben","slug":"artus-streben"},{"type":"Sitz","name":"Rhosmere","slug":"rhosmere"},{"type":"Haus","name":"Haus Talmeirch","slug":"haus-talmeirch"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":true},
    {"id":"haus-tirwyn","slug":"haus-tirwyn","aliases":[],"name":"Haus Tirwyn","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Tirwyn/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Artus Streben","slug":"artus-streben"},{"type":"Sitz","name":"Rhosmere","slug":"rhosmere"},{"type":"Haus","name":"Haus Tirwyn","slug":"haus-tirwyn"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":true},
    {"id":"haus-garrael","slug":"haus-garrael","aliases":[],"name":"Haus Garrael","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Camruisge/Haus_Garrael/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Camruisge","slug":"camruisge"},{"type":"Sitz","name":"Aberllan","slug":"aberllan"},{"type":"Haus","name":"Haus Garrael","slug":"haus-garrael"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-annwyl","slug":"haus-annwyl","aliases":[],"name":"Haus Annwyl","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Annwyl/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Gwendolyns Ufer","slug":"gwendolyns-ufer"},{"type":"Sitz","name":"Côr Mynyddfaen","slug":"cor-mynyddfaen"},{"type":"Haus","name":"Haus Annwyl","slug":"haus-annwyl"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-barus","slug":"haus-barus","aliases":[],"name":"Haus Barus","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Barus/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Gwendolyns Ufer","slug":"gwendolyns-ufer"},{"type":"Sitz","name":"Abergwint","slug":"abergwint"},{"type":"Haus","name":"Haus Barus","slug":"haus-barus"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-caerlaen","slug":"haus-caerlaen","aliases":[],"name":"Haus Caerlaen","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Caerlaen/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Gwendolyns Ufer","slug":"gwendolyns-ufer"},{"type":"Sitz","name":"Abergwint","slug":"abergwint"},{"type":"Haus","name":"Haus Caerlaen","slug":"haus-caerlaen"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":false},
    {"id":"haus-caerthwyn","slug":"haus-caerthwyn","aliases":[],"name":"Haus Caerthwyn","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Caerthwyn/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Gwendolyns Ufer","slug":"gwendolyns-ufer"},{"type":"Sitz","name":"Abergwint","slug":"abergwint"},{"type":"Haus","name":"Haus Caerthwyn","slug":"haus-caerthwyn"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":false},
    {"id":"haus-cenfig","slug":"haus-cenfig","aliases":[],"name":"Haus Cenfig","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Cenfig/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Gwendolyns Ufer","slug":"gwendolyns-ufer"},{"type":"Sitz","name":"Abergwint","slug":"abergwint"},{"type":"Haus","name":"Haus Cenfig","slug":"haus-cenfig"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-cysgodion","slug":"haus-cysgodion","aliases":[],"name":"Haus Cysgodion","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Cysgodion/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Gwendolyns Ufer","slug":"gwendolyns-ufer"},{"type":"Sitz","name":"Abergwint","slug":"abergwint"},{"type":"Haus","name":"Haus Cysgodion","slug":"haus-cysgodion"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-daran","slug":"haus-daran","aliases":[],"name":"Haus Daran","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Daran/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Gwendolyns Ufer","slug":"gwendolyns-ufer"},{"type":"Sitz","name":"Garwfaen","slug":"garwfaen"},{"type":"Haus","name":"Haus Daran","slug":"haus-daran"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-edmy","slug":"haus-edmy","aliases":[],"name":"Haus Edmy","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Edmy/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Gwendolyns Ufer","slug":"gwendolyns-ufer"},{"type":"Sitz","name":"Abergwint","slug":"abergwint"},{"type":"Haus","name":"Haus Edmy","slug":"haus-edmy"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-gwyntog","slug":"haus-gwyntog","aliases":[],"name":"Haus Gwyntog","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Gwyntog/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Gwendolyns Ufer","slug":"gwendolyns-ufer"},{"type":"Sitz","name":"Abergwint","slug":"abergwint"},{"type":"Haus","name":"Haus Gwyntog","slug":"haus-gwyntog"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-penwyn","slug":"haus-penwyn","aliases":[],"name":"Haus Penwyn","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Penwyn/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Gwendolyns Ufer","slug":"gwendolyns-ufer"},{"type":"Sitz","name":"Morddyn","slug":"morddyn"},{"type":"Haus","name":"Haus Penwyn","slug":"haus-penwyn"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-rhuddgar","slug":"haus-rhuddgar","aliases":[],"name":"Haus Rhuddgar","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Rhuddgar/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Gwendolyns Ufer","slug":"gwendolyns-ufer"},{"type":"Sitz","name":"Abergwint","slug":"abergwint"},{"type":"Haus","name":"Haus Rhuddgar","slug":"haus-rhuddgar"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-seldryn","slug":"haus-seldryn","aliases":[],"name":"Haus Seldryn","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Seldryn/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Gwendolyns Ufer","slug":"gwendolyns-ufer"},{"type":"Sitz","name":"Abergwint","slug":"abergwint"},{"type":"Haus","name":"Haus Seldryn","slug":"haus-seldryn"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-selog","slug":"haus-selog","aliases":[],"name":"Haus Selog","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Selog/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Gwendolyns Ufer","slug":"gwendolyns-ufer"},{"type":"Sitz","name":"Abergwint","slug":"abergwint"},{"type":"Haus","name":"Haus Selog","slug":"haus-selog"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-taranvyr","slug":"haus-taranvyr","aliases":[],"name":"Haus Taranvyr","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Taranvyr/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Gwendolyns Ufer","slug":"gwendolyns-ufer"},{"type":"Sitz","name":"Abergwint","slug":"abergwint"},{"type":"Haus","name":"Haus Taranvyr","slug":"haus-taranvyr"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-tawelgar","slug":"haus-tawelgar","aliases":[],"name":"Haus Tawelgar","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Tawelgar/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Gwendolyns Ufer","slug":"gwendolyns-ufer"},{"type":"Sitz","name":"Abergwint","slug":"abergwint"},{"type":"Haus","name":"Haus Tawelgar","slug":"haus-tawelgar"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-trydar","slug":"haus-trydar","aliases":[],"name":"Haus Trydar","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Trydar/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Gwendolyns Ufer","slug":"gwendolyns-ufer"},{"type":"Sitz","name":"Abergwint","slug":"abergwint"},{"type":"Haus","name":"Haus Trydar","slug":"haus-trydar"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-ymladd","slug":"haus-ymladd","aliases":[],"name":"Haus Ymladd","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Ymladd/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Gwendolyns Ufer","slug":"gwendolyns-ufer"},{"type":"Sitz","name":"Abergwint","slug":"abergwint"},{"type":"Haus","name":"Haus Ymladd","slug":"haus-ymladd"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-aelmor","slug":"haus-aelmor","aliases":[],"name":"Haus Aelmor","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Aelmor/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Aelmor","slug":"haus-aelmor"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":true},
    {"id":"haus-argall","slug":"haus-argall","aliases":[],"name":"Haus Argall","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Argall/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Llysfaen","slug":"llysfaen"},{"type":"Haus","name":"Haus Argall","slug":"haus-argall"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":true},
    {"id":"haus-awenor","slug":"haus-awenor","aliases":[],"name":"Haus Awenor","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Awenor/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Awenor","slug":"haus-awenor"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-awenydd","slug":"haus-awenydd","aliases":[],"name":"Haus Awenydd","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Awenydd/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Awenydd","slug":"haus-awenydd"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-balchder","slug":"haus-balchder","aliases":[],"name":"Haus Balchder","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Balchder/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Balchder","slug":"haus-balchder"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-bleiddorn","slug":"haus-bleiddorn","aliases":[],"name":"Haus Bleiddorn","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Bleiddorn/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Bleiddorn","slug":"haus-bleiddorn"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":true},
    {"id":"haus-bradrhith","slug":"haus-bradrhith","aliases":[],"name":"Haus Bradrhith","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Bradrhith/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Bradrhith","slug":"haus-bradrhith"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":true},
    {"id":"haus-braglas","slug":"haus-braglas","aliases":[],"name":"Haus Braglas","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Braglas/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Braglas","slug":"haus-braglas"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":true},
    {"id":"haus-chwedlonol","slug":"haus-chwedlonol","aliases":[],"name":"Haus Chwedonol","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Chwedonol/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Chwedonol","slug":"haus-chwedlonol"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-cludwyr","slug":"haus-cludwyr","aliases":[],"name":"Haus Cludwyr","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Cludwyr/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Cludwyr","slug":"haus-cludwyr"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-cymrath-o-traethlan","slug":"haus-cymrath-o-traethlan","aliases":[],"name":"Haus Cymrath O'Traethlan","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Cymrath_OTraethlan/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Tŵr Traethlan","slug":"twr-traethlan"},{"type":"Haus","name":"Haus Cymrath O'Traethlan","slug":"haus-cymrath-o-traethlan"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":true},
    {"id":"haus-draenmelyn","slug":"haus-draenmelyn","aliases":[],"name":"Haus Draenmelyn","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Draenmelyn/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Draenmelyn","slug":"haus-draenmelyn"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":true},
    {"id":"haus-dubhan-gwynthor","slug":"haus-dubhan-gwynthor","aliases":[],"name":"Haus Dubhan","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Dubhan/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Dubhan","slug":"haus-dubhan-gwynthor"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":true},
    {"id":"haus-eneiniog","slug":"haus-eneiniog","aliases":[],"name":"Haus Eneiniog","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Eneiniog/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Eneiniog","slug":"haus-eneiniog"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-falchdyn","slug":"haus-falchdyn","aliases":[],"name":"Haus Falchdyn","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Falchdyn/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Falchdyn","slug":"haus-falchdyn"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":true},
    {"id":"haus-gelyn","slug":"haus-gelyn","aliases":[],"name":"Haus Gelyn","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Gelyn/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Gelyn","slug":"haus-gelyn"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-gostyn","slug":"haus-gostyn","aliases":[],"name":"Haus Gostyn","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Gostyn/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Gostyn","slug":"haus-gostyn"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-gwyllach","slug":"haus-gwyllach","aliases":[],"name":"Haus Gwyllach","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Gwyllach/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Gwyllach","slug":"haus-gwyllach"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":false},
    {"id":"haus-loer","slug":"haus-loer","aliases":[],"name":"Haus Loer","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Loer/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Loer","slug":"haus-loer"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-maerllys","slug":"haus-maerllys","aliases":[],"name":"Haus Maerllys","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Maerllys/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Maerllys","slug":"haus-maerllys"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":true},
    {"id":"haus-pendrwn","slug":"haus-pendrwn","aliases":[],"name":"Haus Pendrwn","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Pendrwn/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Pendrwn","slug":"haus-pendrwn"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":true},
    {"id":"haus-rhyddid","slug":"haus-rhyddid","aliases":[],"name":"Haus Rhyddid","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Rhyddid/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Rhyddid","slug":"haus-rhyddid"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-sgrechiwr","slug":"haus-sgrechiwr","aliases":[],"name":"Haus Sgrechiwr","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Sgrechiwr/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Lynthor","slug":"lynthor"},{"type":"Haus","name":"Haus Sgrechiwr","slug":"haus-sgrechiwr"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":false},
    {"id":"haus-swyll","slug":"haus-swyll","aliases":[],"name":"Haus Swyll","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Swyll/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Swyll","slug":"haus-swyll"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":true},
    {"id":"haus-tlawd","slug":"haus-tlawd","aliases":[],"name":"Haus Tlawd","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Tlawd/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Tlawd","slug":"haus-tlawd"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-tonnarth","slug":"haus-tonnarth","aliases":[],"name":"Haus Tonnarth","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Tonnarth/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Tonnarth","slug":"haus-tonnarth"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":true},
    {"id":"haus-ysgrif","slug":"haus-ysgrif","aliases":[],"name":"Haus Ysgrif","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Ysgrif/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Ysgrif","slug":"haus-ysgrif"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":true},
    {"id":"haus-gwared","slug":"haus-gwared","aliases":[],"name":"Haus Gwared","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Rhonwens_Traenen/Haus_Gwared/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Rhonwens Tränen","slug":"rhonwens-tranen"},{"type":"Sitz","name":"Castellbryn","slug":"castellbryn"},{"type":"Haus","name":"Haus Gwared","slug":"haus-gwared"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":true},
    {"id":"haus-madryn","slug":"haus-madryn","aliases":[],"name":"Haus Madryn","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Rhonwens_Traenen/Haus_Madryn/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Rhonwens Tränen","slug":"rhonwens-tranen"},{"type":"Haus","name":"Haus Madryn","slug":"haus-madryn"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":true},
    {"id":"haus-merek","slug":"haus-merek","aliases":[],"name":"Haus Merek","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Rhonwens_Traenen/Haus_Merek/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Rhonwens Tränen","slug":"rhonwens-tranen"},{"type":"Haus","name":"Haus Merek","slug":"haus-merek"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":true},
    {"id":"haus-morveth","slug":"haus-morveth","aliases":[],"name":"Haus Morveth","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Rhonwens_Traenen/Haus_Morveth/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Rhonwens Tränen","slug":"rhonwens-tranen"},{"type":"Haus","name":"Haus Morveth","slug":"haus-morveth"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":true},
    {"id":"haus-rhenna","slug":"haus-rhenna","aliases":[],"name":"Haus Rhenna","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Rhonwens_Traenen/Haus_Rhenna/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Rhonwens Tränen","slug":"rhonwens-tranen"},{"type":"Haus","name":"Haus Rhenna","slug":"haus-rhenna"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":true},
    {"id":"haus-skellor","slug":"haus-skellor","aliases":[],"name":"Haus Skellor","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Rhonwens_Traenen/Haus_Skellor/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Rhonwens Tränen","slug":"rhonwens-tranen"},{"type":"Haus","name":"Haus Skellor","slug":"haus-skellor"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":true},
    {"id":"haus-talinvyr","slug":"haus-talinvyr","aliases":[],"name":"Haus Talinvyr","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Rhonwens_Traenen/Haus_Talinvyr/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Rhonwens Tränen","slug":"rhonwens-tranen"},{"type":"Haus","name":"Haus Talinvyr","slug":"haus-talinvyr"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":true},
    {"id":"haus-von-hochreuth","slug":"haus-von-hochreuth","aliases":[],"name":"Haus von Hochreuth","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Goldmund/Unsortiert/Unsortiert/Haus_von_Hochreuth/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Goldmund","slug":"goldmund"},{"type":"Haus","name":"Haus von Hochreuth","slug":"haus-von-hochreuth"}],"tags":["","Ritterhaus"],"prepared":true},
    // END GENERATED HOUSE PAGES
{
  "id": "haus-illysywen",
  "slug": "haus-illysywen",
  "aliases": [
    "illysywen",
    "haus-illysywen-o-castellbryn"
  ],
  "name": "Haus Illysywen O'Castellbryn",
  "status": "active",
  "type": "house",
  "data": "Estryll/Cenyr/Celtigerns_Wacht/Rhonwens_Traenen/Haus_Illysywen/haus.data.js?v=20260911c",
  "hierarchy": [
    {
      "type": "Sammlung",
      "name": "Familien Häuser und Clans",
      "slug": "familien-hauser-und-clans"
    },
    {
      "type": "Kontinent",
      "name": "Estryll",
      "slug": "estryll"
    },
    {
      "type": "Königreich",
      "name": "Cenyr",
      "slug": "cenyr"
    },
    {
      "type": "Grafschaft",
      "name": "Celtigerns Wacht",
      "slug": "celtigerns-wacht"
    },
    {
      "type": "Region",
      "name": "Rhonwens Tränen",
      "slug": "rhonwens-tranen"
    },
    {
      "type": "Sitz",
      "name": "Castellbryn",
      "slug": "castellbryn"
    },
    {
      "type": "Haus",
      "name": "Haus Illysywen",
      "slug": "haus-illysywen"
    }
  ],
  "tags": [
    "illysywen",
    "cenyr",
    "celtigerns-wacht",
    "castellbryn"
  ]
},
{
  "id": "haus-gafyr",
  "slug": "haus-gafyr",
  "aliases": [
    "gafyr",
    "haus-gafyr-o-gwynthor"
  ],
  "name": "Haus Gafyr O'Gwynthor",
  "status": "active",
  "type": "house",
  "data": "Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Gafyr/haus.data.js?v=20260911c",
  "hierarchy": [
    {
      "type": "Sammlung",
      "name": "Familien Häuser und Clans",
      "slug": "familien-hauser-und-clans"
    },
    {
      "type": "Kontinent",
      "name": "Estryll",
      "slug": "estryll"
    },
    {
      "type": "Königreich",
      "name": "Cenyr",
      "slug": "cenyr"
    },
    {
      "type": "Grafschaft",
      "name": "Celtigerns Wacht",
      "slug": "celtigerns-wacht"
    },
    {
      "type": "Region",
      "name": "Llamreis Ankunft",
      "slug": "llamreis-ankunft"
    },
    {
      "type": "Sitz",
      "name": "Gwynthor",
      "slug": "gwynthor"
    },
    {
      "type": "Haus",
      "name": "Haus Gafyr",
      "slug": "haus-gafyr"
    }
  ],
  "tags": [
    "gafyr",
    "cenyr",
    "celtigerns-wacht",
    "gwynthor"
  ]
},
{
  "id": "haus-wyrm",
  "slug": "haus-wyrm",
  "aliases": [
    "wyrm",
    "haus-wyrm-o-gwynthor"
  ],
  "name": "Haus Wyrm O'Gwynthor",
  "status": "active",
  "type": "cadet-branch",
  "data": "Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Wyrm/haus.data.js?v=20260911c",
  "hierarchy": [
    {
      "type": "Sammlung",
      "name": "Familien Häuser und Clans",
      "slug": "familien-hauser-und-clans"
    },
    {
      "type": "Kontinent",
      "name": "Estryll",
      "slug": "estryll"
    },
    {
      "type": "Königreich",
      "name": "Cenyr",
      "slug": "cenyr"
    },
    {
      "type": "Grafschaft",
      "name": "Celtigerns Wacht",
      "slug": "celtigerns-wacht"
    },
    {
      "type": "Region",
      "name": "Llamreis Ankunft",
      "slug": "llamreis-ankunft"
    },
    {
      "type": "Sitz",
      "name": "Gwynthor",
      "slug": "gwynthor"
    },
    {
      "type": "Haus",
      "name": "Haus Wyrm",
      "slug": "haus-wyrm"
    }
  ],
  "tags": [
    "wyrm",
    "cenyr",
    "celtigerns-wacht",
    "gwynthor"
  ]
},
{
  "id": "haus-saethwyr",
  "slug": "haus-saethwyr",
  "aliases": [
    "saethwyr",
    "haus-saethwyr-o-gwynthor"
  ],
  "name": "Haus Saethwyr O'Gwynthor",
  "status": "active",
  "type": "cadet-branch",
  "data": "Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Saethwyr/haus.data.js?v=20260911c",
  "hierarchy": [
    {
      "type": "Sammlung",
      "name": "Familien Häuser und Clans",
      "slug": "familien-hauser-und-clans"
    },
    {
      "type": "Kontinent",
      "name": "Estryll",
      "slug": "estryll"
    },
    {
      "type": "Königreich",
      "name": "Cenyr",
      "slug": "cenyr"
    },
    {
      "type": "Grafschaft",
      "name": "Celtigerns Wacht",
      "slug": "celtigerns-wacht"
    },
    {
      "type": "Region",
      "name": "Llamreis Ankunft",
      "slug": "llamreis-ankunft"
    },
    {
      "type": "Sitz",
      "name": "Gwynthor",
      "slug": "gwynthor"
    },
    {
      "type": "Haus",
      "name": "Haus Saethwyr",
      "slug": "haus-saethwyr"
    }
  ],
  "tags": [
    "saethwyr",
    "cenyr",
    "celtigerns-wacht",
    "gwynthor"
  ]
},
{
  "id": "haus-gwefrydd",
  "slug": "haus-gwefrydd",
  "aliases": [
    "gwefrydd",
    "haus-gwefrydd-o-rhosmere"
  ],
  "name": "Haus Gwefrydd O'Rhosmere",
  "status": "active",
  "type": "house",
  "data": "Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Gwefrydd/haus.data.js?v=20260911c",
  "hierarchy": [
    {
      "type": "Sammlung",
      "name": "Familien Häuser und Clans",
      "slug": "familien-hauser-und-clans"
    },
    {
      "type": "Kontinent",
      "name": "Estryll",
      "slug": "estryll"
    },
    {
      "type": "Königreich",
      "name": "Cenyr",
      "slug": "cenyr"
    },
    {
      "type": "Grafschaft",
      "name": "Celtigerns Wacht",
      "slug": "celtigerns-wacht"
    },
    {
      "type": "Region",
      "name": "Artus Streben",
      "slug": "artus-streben"
    },
    {
      "type": "Sitz",
      "name": "Rhosmere",
      "slug": "rhosmere"
    },
    {
      "type": "Haus",
      "name": "Haus Gwefrydd",
      "slug": "haus-gwefrydd"
    }
  ],
  "tags": [
    "gwefrydd",
    "cenyr",
    "celtigerns-wacht",
    "rhosmere"
  ]
},
{
  "id": "haus-gwyvern",
  "slug": "haus-gwyvern",
  "aliases": [
    "gwyvern",
    "haus-gwyvern-o-abergwint"
  ],
  "name": "Haus Gwyvern O'Abergwint",
  "status": "active",
  "type": "cadet-branch",
  "data": "Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Gwyvern/haus.data.js?v=20260911c",
  "hierarchy": [
    {
      "type": "Sammlung",
      "name": "Familien Häuser und Clans",
      "slug": "familien-hauser-und-clans"
    },
    {
      "type": "Kontinent",
      "name": "Estryll",
      "slug": "estryll"
    },
    {
      "type": "Königreich",
      "name": "Cenyr",
      "slug": "cenyr"
    },
    {
      "type": "Grafschaft",
      "name": "Celtigerns Wacht",
      "slug": "celtigerns-wacht"
    },
    {
      "type": "Region",
      "name": "Gwendolyns Ufer",
      "slug": "gwendolyns-ufer"
    },
    {
      "type": "Sitz",
      "name": "Abergwint",
      "slug": "abergwint"
    },
    {
      "type": "Haus",
      "name": "Haus Gwyvern",
      "slug": "haus-gwyvern"
    }
  ],
  "tags": [
    "gwyvern",
    "cenyr",
    "celtigerns-wacht",
    "abergwint"
  ]
},
    {
      id: "haus-draig",
      slug: "haus-draig",
      aliases: ["draig", "haus-draig-o-gwynthor", "draig-o-gwynthor"],
      name: "Haus Draig O'Gwynthor",
      status: HOUSE_STATUS.ACTIVE,
      type: HOUSE_TYPES.HOUSE,
      data: "Estryll/Cenyr/Celtigerns_Wacht/Haus_Draig/haus.data.js?v=20260911b",
      hierarchy: [
        { type: "Sammlung", name: "Familien Häuser und Clans", slug: "familien-haeuser-und-clans" },
        { type: "Kontinent", name: "Estryll", slug: "estryll" },
        { type: "Königreich", name: "Cenyr", slug: "cenyr" },
        { type: "Grafschaft", name: "Celtigerns Wacht", slug: "celtigerns-wacht" },
        { type: "Sitz", name: "Gwynthor", slug: "gwynthor" },
        { type: "Haus", name: "Haus Draig", slug: "haus-draig" },
      ],
      tags: ["draig", "cenyr", "gwynthor", "celtigerns-wacht", "grafenhaus"],
    },
    {
      id: "haeuser-vorlage",
      slug: "haeuser-vorlage",
      aliases: [
        "familien-haeuser-clans-vorlage",
        "haeuser-clans-vorlage",
        "haus-vorlage",
        "familien-vorlage",
      ],
      name: "Häuser-Vorlage",
      status: HOUSE_STATUS.TEMPLATE,
      type: HOUSE_TYPES.HOUSE,
      data: "data/haeuser-vorlage.data.js",
      hierarchy: [
        { type: "Sammlung", name: "Familien Häuser und Clans", slug: "familien-haeuser-und-clans" },
        { type: "Vorlage", name: "Häuser / Familien / Clans", slug: "haeuser-vorlage" },
      ],
      tags: ["haeuser", "familien", "clans", "adel", "vorlage"],
    },
    {
      id: "kleinehaeuser-vorlage",
      slug: "kleinehaeuser-vorlage",
      aliases: [
        "kleinehauser-vorlage",
        "kleine-haeuser-vorlage",
        "kleine-hauser-vorlage",
        "kleinehaeuser",
        "kleinehauser",
        "kleine-haeuser",
        "kleine-hauser",
        "kleine-clans-vorlage",
        "kleine-haeuser-clans-vorlage",
      ],
      name: "Kleineh\u00e4user-Vorlage",
      status: HOUSE_STATUS.TEMPLATE,
      type: HOUSE_TYPES.HOUSE,
      page: "kleinehaeuser.html",
      data: "data/kleinehaeuser-vorlage.data.js",
      hierarchy: [
        { type: "Sammlung", name: "Familien H\u00e4user und Clans", slug: "familien-haeuser-und-clans" },
        { type: "Vorlage", name: "Kleine H\u00e4user / kleinere Clans", slug: "kleinehaeuser-vorlage" },
      ],
      tags: ["kleine-haeuser", "kleine-clans", "familien", "nebenlinien", "vorlage"],
    },
    {
      id: "haus-arwydd",
      slug: "haus-arwydd",
      aliases: [
        "arwydd",
        "haus-arwydd-o-castellbryn",
        "arwydd-o-castellbryn",
      ],
      name: "Haus Arwydd O'Castellbryn",
      status: HOUSE_STATUS.ACTIVE,
      type: HOUSE_TYPES.HOUSE,
      data: "Estryll/Cenyr/Celtigerns_Wacht/Rhonwens_Traenen/Haus_Arwydd/haus.data.js?v=20260911c",
      hierarchy: [
        { type: "Sammlung", name: "Familien Häuser und Clans", slug: "familien-haeuser-und-clans" },
        { type: "Königreich", name: "Cenyr", slug: "cenyr" },
        { type: "Grafschaft", name: "Celtigerns Wacht", slug: "celtigerns-wacht" },
        { type: "Herrschaft", name: "Rhonwens Tränen", slug: "rhonwens-traenen" },
        { type: "Sitz", name: "Castellbryn", slug: "castellbryn" },
      ],
      tags: ["arwydd", "castellbryn", "cenyr", "ritterfuerst", "haus"],
    },
    {
      id: "haus-chwedonl",
      slug: "haus-chwedonl",
      aliases: [
        "chwedonl",
        "haus_chwedonl",
        "haus-chwedonl",
      ],
      name: "Haus Chwedonl",
      status: HOUSE_STATUS.ACTIVE,
      type: HOUSE_TYPES.HOUSE,
      data: "data/haus-chwedonl.data.js",
      hierarchy: [
        { type: "Sammlung", name: "Familien Häuser und Clans", slug: "familien-haeuser-und-clans" },
      ],
      tags: ["chwedonl", "haus"],
    },
    {
      id: "haus-suedstahl",
      slug: "haus-suedstahl",
      aliases: [
        "suedstahl",
        "südstahl",
        "clan-suedstahl",
        "clan-südstahl",
      ],
      name: "Clan Südstahl",
      status: HOUSE_STATUS.ACTIVE,
      type: HOUSE_TYPES.CLAN,
      data: "data/haus-suedstahl.data.js",
      hierarchy: [
        { type: "Sammlung", name: "Familien Häuser und Clans", slug: "familien-haeuser-und-clans" },
        { type: "Königreich", name: "Aldrimar", slug: "aldrimar" },
        { type: "Jarltum", name: "Kronental", slug: "kronental" },
        { type: "Herrschaft", name: "Tal der Helden", slug: "tal-der-helden" },
        { type: "Sitz", name: "Heldenwacht", slug: "heldenwacht" },
        { type: "Clan", name: "Clan Südstahl", slug: "haus-suedstahl" },
      ],
      tags: ["suedstahl", "clan", "huskarl", "aldrimar", "kronental", "heldenwacht", "vaeren"],
    },
    {
      id: "haus-albholz",
      slug: "haus-albholz",
      aliases: [
        "albholz",
        "clan-albholz",
      ],
      name: "Clan Albholz",
      status: HOUSE_STATUS.ACTIVE,
      type: HOUSE_TYPES.CLAN,
      data: "data/haus-albholz.data.js",
      hierarchy: [
        { type: "Sammlung", name: "Familien Häuser und Clans", slug: "familien-haeuser-und-clans" },
        { type: "Königreich", name: "Aldrimar", slug: "aldrimar" },
        { type: "Jarltum", name: "Kronental", slug: "kronental" },
        { type: "Herrschaft", name: "Tal der Helden", slug: "tal-der-helden" },
        { type: "Sitz", name: "Heldenwacht", slug: "heldenwacht" },
        { type: "Clan", name: "Clan Albholz", slug: "haus-albholz" },
      ],
      tags: ["albholz", "clan", "huskarl", "aldrimar", "kronental", "heldenwacht", "vaeren", "druidenhain"],
    },
  ].map(Object.freeze);

  function all() {
    return HOUSES;
  }

  function byId(id) {
    const normalizedId = normalizeId(id);
    return HOUSES.find((house) => {
      const aliases = [house.id, house.slug, ...(house.aliases || [])].map(normalizeId);
      return aliases.includes(normalizedId);
    }) || null;
  }

  function byStatus(status) {
    return HOUSES.filter((house) => house.status === status);
  }

  function linkFor(id) {
    const house = byId(id);
    return house ? `${house.page || "haus.html"}?haus=${encodeURIComponent(house.id)}` : `haus.html?haus=${encodeURIComponent(id)}`;
  }

  function normalizeId(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  window.HAEUSER_REGISTRY = Object.freeze(HOUSES);
  window.HaeuserRegistry = Object.freeze({
    statuses: HOUSE_STATUS,
    types: HOUSE_TYPES,
    all,
    byId,
    byStatus,
    linkFor,
  });
})();
