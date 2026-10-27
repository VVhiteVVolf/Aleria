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
    {"id":"haus-ard-conbhron","slug":"haus-ard-conbhron","aliases":[],"name":"Haus Ard Conbhrón","status":"active","type":"clan","page":"haus.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Antike_Crannath_Clans/Haus_Ard_Conbhron/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Antike Crannath Clans","slug":"antike-crannath-clans"},{"type":"Sitz","name":"Lycath","slug":"lycath"},{"type":"Haus","name":"Haus Ard Conbhrón","slug":"haus-ard-conbhron"}],"tags":["Celtigerns Wacht","Clan"],"prepared":false},
    {"id":"haus-ui-talamh","slug":"haus-ui-talamh","aliases":[],"name":"Haus Ui Talamh","status":"active","type":"clan","page":"haus.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Antike_Crannath_Clans/Haus_Ui_Talamh/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Antike Crannath Clans","slug":"antike-crannath-clans"},{"type":"Sitz","name":"Antikes Gwynthor","slug":"antikes-gwynthor"},{"type":"Haus","name":"Haus Ui Talamh","slug":"haus-ui-talamh"}],"tags":["Celtigerns Wacht","Clan"],"prepared":false},
    {"id":"haus-almarch","slug":"haus-almarch","aliases":[],"name":"Haus Almarch","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Almarch/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Artus Streben","slug":"artus-streben"},{"type":"Sitz","name":"Rhosmere","slug":"rhosmere"},{"type":"Haus","name":"Haus Almarch","slug":"haus-almarch"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":true},
    {"id":"haus-althin","slug":"haus-althin","aliases":[],"name":"Haus Althin","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Althin/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Artus Streben","slug":"artus-streben"},{"type":"Sitz","name":"Rhosmere","slug":"rhosmere"},{"type":"Haus","name":"Haus Althin","slug":"haus-althin"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":true},
    {"id":"haus-bekab","slug":"haus-bekab","aliases":[],"name":"Haus Bekab","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Bekab/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Artus Streben","slug":"artus-streben"},{"type":"Sitz","name":"Rhosmere","slug":"rhosmere"},{"type":"Haus","name":"Haus Bekab","slug":"haus-bekab"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":true},
    {"id":"haus-brinmarch","slug":"haus-brinmarch","aliases":[],"name":"Haus Brinmarch","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Brinmarch/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Artus Streben","slug":"artus-streben"},{"type":"Sitz","name":"Rhosmere","slug":"rhosmere"},{"type":"Haus","name":"Haus Brinmarch","slug":"haus-brinmarch"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":true},
    {"id":"haus-coedvarn","slug":"haus-coedvarn","aliases":[],"name":"Haus Coedvarn","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Coedvarn/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Artus Streben","slug":"artus-streben"},{"type":"Sitz","name":"Rhosmere","slug":"rhosmere"},{"type":"Haus","name":"Haus Coedvarn","slug":"haus-coedvarn"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":true},
    {"id":"haus-eirfael","slug":"haus-eirfael","aliases":[],"name":"Haus Eirfael","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Eirfael/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Artus Streben","slug":"artus-streben"},{"type":"Sitz","name":"Rhosmere","slug":"rhosmere"},{"type":"Haus","name":"Haus Eirfael","slug":"haus-eirfael"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":true},
    {"id":"haus-ghorswyn","slug":"haus-ghorswyn","aliases":[],"name":"Haus Ghorswyn","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Ghorswyn/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Artus Streben","slug":"artus-streben"},{"type":"Sitz","name":"Rhosmere","slug":"rhosmere"},{"type":"Haus","name":"Haus Ghorswyn","slug":"haus-ghorswyn"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":true},
    {"id":"haus-gwardin","slug":"haus-gwardin","aliases":[],"name":"Haus Gwardin","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Gwardin/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Artus Streben","slug":"artus-streben"},{"type":"Sitz","name":"Rhosmere","slug":"rhosmere"},{"type":"Haus","name":"Haus Gwardin","slug":"haus-gwardin"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":true},
    {"id":"haus-gwynrhos","slug":"haus-gwynrhos","aliases":[],"name":"Haus Gwynrhos","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Gwynrhos/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Artus Streben","slug":"artus-streben"},{"type":"Sitz","name":"Rhosmere","slug":"rhosmere"},{"type":"Haus","name":"Haus Gwynrhos","slug":"haus-gwynrhos"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":true},
    {"id":"haus-iorwen","slug":"haus-iorwen","aliases":[],"name":"Haus Iorwen","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Iorwen/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Artus Streben","slug":"artus-streben"},{"type":"Sitz","name":"Rhosmere","slug":"rhosmere"},{"type":"Haus","name":"Haus Iorwen","slug":"haus-iorwen"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":true},
    {"id":"haus-maethan","slug":"haus-maethan","aliases":[],"name":"Haus Maethan","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Maethan/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Artus Streben","slug":"artus-streben"},{"type":"Sitz","name":"Rhosmere","slug":"rhosmere"},{"type":"Haus","name":"Haus Maethan","slug":"haus-maethan"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":true},
    {"id":"haus-rhen","slug":"haus-rhen","aliases":[],"name":"Haus Rhen","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Rhen/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Artus Streben","slug":"artus-streben"},{"type":"Sitz","name":"Rhosmere","slug":"rhosmere"},{"type":"Haus","name":"Haus Rhen","slug":"haus-rhen"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":true},
    {"id":"haus-talmeirch","slug":"haus-talmeirch","aliases":[],"name":"Haus Talmeirch","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Talmeirch/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Artus Streben","slug":"artus-streben"},{"type":"Sitz","name":"Rhosmere","slug":"rhosmere"},{"type":"Haus","name":"Haus Talmeirch","slug":"haus-talmeirch"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":true},
    {"id":"haus-tirwyn","slug":"haus-tirwyn","aliases":[],"name":"Haus Tirwyn","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Tirwyn/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Artus Streben","slug":"artus-streben"},{"type":"Sitz","name":"Rhosmere","slug":"rhosmere"},{"type":"Haus","name":"Haus Tirwyn","slug":"haus-tirwyn"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":true},
    {"id":"haus-garrael","slug":"haus-garrael","aliases":[],"name":"Haus Garrael","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Camruisge/Haus_Garrael/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Camruisge","slug":"camruisge"},{"type":"Sitz","name":"Aberllan","slug":"aberllan"},{"type":"Haus","name":"Haus Garrael","slug":"haus-garrael"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-annwyl","slug":"haus-annwyl","aliases":[],"name":"Haus Annwyl","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Annwyl/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Gwendolyns Ufer","slug":"gwendolyns-ufer"},{"type":"Sitz","name":"Côr Mynyddfaen","slug":"cor-mynyddfaen"},{"type":"Haus","name":"Haus Annwyl","slug":"haus-annwyl"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-barus","slug":"haus-barus","aliases":[],"name":"Haus Barus","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Barus/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Gwendolyns Ufer","slug":"gwendolyns-ufer"},{"type":"Sitz","name":"Abergwint","slug":"abergwint"},{"type":"Haus","name":"Haus Barus","slug":"haus-barus"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-caerlaen","slug":"haus-caerlaen","aliases":[],"name":"Haus Caerlaen","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Caerlaen/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Gwendolyns Ufer","slug":"gwendolyns-ufer"},{"type":"Sitz","name":"Abergwint","slug":"abergwint"},{"type":"Haus","name":"Haus Caerlaen","slug":"haus-caerlaen"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":false},
    {"id":"haus-caerthwyn","slug":"haus-caerthwyn","aliases":[],"name":"Haus Caerthwyn","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Caerthwyn/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Gwendolyns Ufer","slug":"gwendolyns-ufer"},{"type":"Sitz","name":"Abergwint","slug":"abergwint"},{"type":"Haus","name":"Haus Caerthwyn","slug":"haus-caerthwyn"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":false},
    {"id":"haus-cenfig","slug":"haus-cenfig","aliases":[],"name":"Haus Cenfig","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Cenfig/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Gwendolyns Ufer","slug":"gwendolyns-ufer"},{"type":"Sitz","name":"Abergwint","slug":"abergwint"},{"type":"Haus","name":"Haus Cenfig","slug":"haus-cenfig"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-cysgodion","slug":"haus-cysgodion","aliases":[],"name":"Haus Cysgodion","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Cysgodion/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Gwendolyns Ufer","slug":"gwendolyns-ufer"},{"type":"Sitz","name":"Abergwint","slug":"abergwint"},{"type":"Haus","name":"Haus Cysgodion","slug":"haus-cysgodion"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-daran","slug":"haus-daran","aliases":[],"name":"Haus Daran","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Daran/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Gwendolyns Ufer","slug":"gwendolyns-ufer"},{"type":"Sitz","name":"Garwfaen","slug":"garwfaen"},{"type":"Haus","name":"Haus Daran","slug":"haus-daran"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-edmy","slug":"haus-edmy","aliases":[],"name":"Haus Edmy","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Edmy/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Gwendolyns Ufer","slug":"gwendolyns-ufer"},{"type":"Sitz","name":"Abergwint","slug":"abergwint"},{"type":"Haus","name":"Haus Edmy","slug":"haus-edmy"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-gwyntog","slug":"haus-gwyntog","aliases":[],"name":"Haus Gwyntog","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Gwyntog/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Gwendolyns Ufer","slug":"gwendolyns-ufer"},{"type":"Sitz","name":"Abergwint","slug":"abergwint"},{"type":"Haus","name":"Haus Gwyntog","slug":"haus-gwyntog"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-penwyn","slug":"haus-penwyn","aliases":[],"name":"Haus Penwyn","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Penwyn/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Gwendolyns Ufer","slug":"gwendolyns-ufer"},{"type":"Sitz","name":"Morddyn","slug":"morddyn"},{"type":"Haus","name":"Haus Penwyn","slug":"haus-penwyn"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-rhuddgar","slug":"haus-rhuddgar","aliases":[],"name":"Haus Rhuddgar","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Rhuddgar/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Gwendolyns Ufer","slug":"gwendolyns-ufer"},{"type":"Sitz","name":"Abergwint","slug":"abergwint"},{"type":"Haus","name":"Haus Rhuddgar","slug":"haus-rhuddgar"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-seldryn","slug":"haus-seldryn","aliases":[],"name":"Haus Seldryn","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Seldryn/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Gwendolyns Ufer","slug":"gwendolyns-ufer"},{"type":"Sitz","name":"Abergwint","slug":"abergwint"},{"type":"Haus","name":"Haus Seldryn","slug":"haus-seldryn"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-selog","slug":"haus-selog","aliases":[],"name":"Haus Selog","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Selog/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Gwendolyns Ufer","slug":"gwendolyns-ufer"},{"type":"Sitz","name":"Abergwint","slug":"abergwint"},{"type":"Haus","name":"Haus Selog","slug":"haus-selog"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-taranvyr","slug":"haus-taranvyr","aliases":[],"name":"Haus Taranvyr","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Taranvyr/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Gwendolyns Ufer","slug":"gwendolyns-ufer"},{"type":"Sitz","name":"Abergwint","slug":"abergwint"},{"type":"Haus","name":"Haus Taranvyr","slug":"haus-taranvyr"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-tawelgar","slug":"haus-tawelgar","aliases":[],"name":"Haus Tawelgar","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Tawelgar/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Gwendolyns Ufer","slug":"gwendolyns-ufer"},{"type":"Sitz","name":"Abergwint","slug":"abergwint"},{"type":"Haus","name":"Haus Tawelgar","slug":"haus-tawelgar"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-trydar","slug":"haus-trydar","aliases":[],"name":"Haus Trydar","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Trydar/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Gwendolyns Ufer","slug":"gwendolyns-ufer"},{"type":"Sitz","name":"Abergwint","slug":"abergwint"},{"type":"Haus","name":"Haus Trydar","slug":"haus-trydar"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-ymladd","slug":"haus-ymladd","aliases":[],"name":"Haus Ymladd","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Ymladd/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Gwendolyns Ufer","slug":"gwendolyns-ufer"},{"type":"Sitz","name":"Abergwint","slug":"abergwint"},{"type":"Haus","name":"Haus Ymladd","slug":"haus-ymladd"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-aelmor","slug":"haus-aelmor","aliases":[],"name":"Haus Aelmor","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Aelmor/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Aelmor","slug":"haus-aelmor"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":false},
    {"id":"haus-argall","slug":"haus-argall","aliases":[],"name":"Haus Argall","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Argall/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Llysfaen","slug":"llysfaen"},{"type":"Haus","name":"Haus Argall","slug":"haus-argall"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":false},
    {"id":"haus-awenor","slug":"haus-awenor","aliases":[],"name":"Haus Awenor","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Awenor/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Awenor","slug":"haus-awenor"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-awenydd","slug":"haus-awenydd","aliases":[],"name":"Haus Awenydd","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Awenydd/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Awenydd","slug":"haus-awenydd"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-balchder","slug":"haus-balchder","aliases":[],"name":"Haus Balchder","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Balchder/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Balchder","slug":"haus-balchder"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-bleiddorn","slug":"haus-bleiddorn","aliases":[],"name":"Haus Bleiddorn","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Bleiddorn/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Bleiddorn","slug":"haus-bleiddorn"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-bradrhith","slug":"haus-bradrhith","aliases":[],"name":"Haus Bradrhith","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Bradrhith/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Bradrhith","slug":"haus-bradrhith"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":false},
    {"id":"haus-braglas","slug":"haus-braglas","aliases":[],"name":"Haus Braglas","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Braglas/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Braglas","slug":"haus-braglas"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":false},
    {"id":"haus-celynfor","slug":"haus-celynfor","aliases":[],"name":"Familie Celynfor","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Celynfor/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Familie Celynfor","slug":"haus-celynfor"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":false},
    {"id":"haus-chwedlonol","slug":"haus-chwedlonol","aliases":[],"name":"Haus Chwedonol","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Chwedonol/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Chwedonol","slug":"haus-chwedlonol"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-cludwyr","slug":"haus-cludwyr","aliases":[],"name":"Haus Cludwyr","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Cludwyr/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Cludwyr","slug":"haus-cludwyr"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-coeddu","slug":"haus-coeddu","aliases":[],"name":"Haus Coeddu","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Coeddu/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Coeddu","slug":"haus-coeddu"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":false},
    {"id":"craigddu","slug":"craigddu","aliases":[],"name":"Haus Craigddu","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Craigddu/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Craigddu","slug":"craigddu"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":false},
    {"id":"haus-cymrath-o-traethlan","slug":"haus-cymrath-o-traethlan","aliases":[],"name":"Haus Cymrath O'Traethlan","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Cymrath_OTraethlan/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Tŵr Traethlan","slug":"twr-traethlan"},{"type":"Haus","name":"Haus Cymrath O'Traethlan","slug":"haus-cymrath-o-traethlan"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-draenmelyn","slug":"haus-draenmelyn","aliases":[],"name":"Haus Draenmelyn","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Draenmelyn/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Draenmelyn","slug":"haus-draenmelyn"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":false},
    {"id":"haus-dubhan-gwynthor","slug":"haus-dubhan-gwynthor","aliases":[],"name":"Haus Dubhan","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Dubhan/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Dubhan","slug":"haus-dubhan-gwynthor"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-dubhdarach","slug":"haus-dubhdarach","aliases":[],"name":"Haus Dubhdarach","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Dubhdarach/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Dubhdarach","slug":"haus-dubhdarach"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":false},
    {"id":"haus-eneiniog","slug":"haus-eneiniog","aliases":[],"name":"Haus Eneiniog","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Eneiniog/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Eneiniog","slug":"haus-eneiniog"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-falchdyn","slug":"haus-falchdyn","aliases":[],"name":"Haus Falchdyn","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Falchdyn/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Falchdyn","slug":"haus-falchdyn"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":true},
    {"id":"haus-fearnan","slug":"haus-fearnan","aliases":[],"name":"Familie Fearnan","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Fearnan/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Familie Fearnan","slug":"haus-fearnan"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":false},
    {"id":"haus-fontani","slug":"haus-fontani","aliases":[],"name":"Haus Fontani","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Fontani/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Fontani","slug":"haus-fontani"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":false},
    {"id":"haus-gelyn","slug":"haus-gelyn","aliases":[],"name":"Haus Gelyn","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Gelyn/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Gelyn","slug":"haus-gelyn"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-gofrann","slug":"haus-gofrann","aliases":[],"name":"Haus Gofrann","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Gofrann/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Gofrann","slug":"haus-gofrann"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":false},
    {"id":"haus-gostyn","slug":"haus-gostyn","aliases":[],"name":"Haus Gostyn","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Gostyn/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Gostyn","slug":"haus-gostyn"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-gwregysdu","slug":"haus-gwregysdu","aliases":[],"name":"Haus Gwregysdu","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Gwregysdu/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Gwregysdu","slug":"haus-gwregysdu"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":false},
    {"id":"haus-gwyllach","slug":"haus-gwyllach","aliases":[],"name":"Haus Gwyllach","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Gwyllach/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Gwyllach","slug":"haus-gwyllach"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":false},
    {"id":"haus-loer","slug":"haus-loer","aliases":[],"name":"Haus Loer","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Loer/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Loer","slug":"haus-loer"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-maerllys","slug":"haus-maerllys","aliases":[],"name":"Haus Maerllys","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Maerllys/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Maerllys","slug":"haus-maerllys"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":false},
    {"id":"haus-pendrwn","slug":"haus-pendrwn","aliases":[],"name":"Haus Pendrwn","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Pendrwn/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Pendrwn","slug":"haus-pendrwn"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":false},
    {"id":"haus-penrudd","slug":"haus-penrudd","aliases":[],"name":"Haus Penrudd","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Penrudd/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Bannkreis Gwynthor","slug":"bannkreis-gwynthor"},{"type":"Haus","name":"Haus Penrudd","slug":"haus-penrudd"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":false},
    {"id":"haus-raves","slug":"haus-raves","aliases":[],"name":"Haus Raves","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Raves/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Raves","slug":"haus-raves"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":false},
    {"id":"haus-rhwyd","slug":"haus-rhwyd","aliases":[],"name":"Haus Rhwyd","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Rhwyd/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Rhwyd","slug":"haus-rhwyd"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":false},
    {"id":"haus-rhyddid","slug":"haus-rhyddid","aliases":[],"name":"Haus Rhyddid","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Rhyddid/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Rhyddid","slug":"haus-rhyddid"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-sgrechiwr","slug":"haus-sgrechiwr","aliases":[],"name":"Haus Sgrechiwr","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Sgrechiwr/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Lynthor","slug":"lynthor"},{"type":"Haus","name":"Haus Sgrechiwr","slug":"haus-sgrechiwr"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":false},
    {"id":"haus-svathamar","slug":"haus-svathamar","aliases":[],"name":"Haus Svathamar","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Svathamar/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Svathamar","slug":"haus-svathamar"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":false},
    {"id":"haus-swyll","slug":"haus-swyll","aliases":[],"name":"Haus Swyll","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Swyll/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Swyll","slug":"haus-swyll"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":false},
    {"id":"haus-tlawd","slug":"haus-tlawd","aliases":[],"name":"Haus Tlawd","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Tlawd/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Tlawd","slug":"haus-tlawd"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-tonnarth","slug":"haus-tonnarth","aliases":[],"name":"Haus Tonnarth","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Tonnarth/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Tonnarth","slug":"haus-tonnarth"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":false},
    {"id":"haus-torvik","slug":"haus-torvik","aliases":[],"name":"Familie Torvik","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Torvik/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Familie Torvik","slug":"haus-torvik"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":false},
    {"id":"haus-trevoryn","slug":"haus-trevoryn","aliases":[],"name":"Haus Trevoryn","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Trevoryn/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Trevoryn","slug":"haus-trevoryn"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":false},
    {"id":"haus-valerus","slug":"haus-valerus","aliases":[],"name":"Haus Valerus","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Valerus/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Bürgerliche","slug":"burgerliche"},{"type":"Ort","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Valerus","slug":"haus-valerus"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":false},
    {"id":"haus-vann","slug":"haus-vann","aliases":[],"name":"Haus Vann","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Vann/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Vann","slug":"haus-vann"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":false},
    {"id":"haus-ysgrif","slug":"haus-ysgrif","aliases":[],"name":"Haus Ysgrif","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Ysgrif/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Llamreis Ankunft","slug":"llamreis-ankunft"},{"type":"Sitz","name":"Gwynthor","slug":"gwynthor"},{"type":"Haus","name":"Haus Ysgrif","slug":"haus-ysgrif"}],"tags":["Celtigerns Wacht","Bürgerliches Haus"],"prepared":false},
    {"id":"haus-gwared","slug":"haus-gwared","aliases":[],"name":"Haus Gwared","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Rhonwens_Traenen/Haus_Gwared/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Rhonwens Tränen","slug":"rhonwens-tranen"},{"type":"Sitz","name":"Castellbryn","slug":"castellbryn"},{"type":"Haus","name":"Haus Gwared","slug":"haus-gwared"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-madryn","slug":"haus-madryn","aliases":[],"name":"Haus Madryn","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Rhonwens_Traenen/Haus_Madryn/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Rhonwens Tränen","slug":"rhonwens-tranen"},{"type":"Haus","name":"Haus Madryn","slug":"haus-madryn"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":true},
    {"id":"haus-merek","slug":"haus-merek","aliases":[],"name":"Haus Merek","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Rhonwens_Traenen/Haus_Merek/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Rhonwens Tränen","slug":"rhonwens-tranen"},{"type":"Haus","name":"Haus Merek","slug":"haus-merek"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":true},
    {"id":"haus-morveth","slug":"haus-morveth","aliases":[],"name":"Haus Morveth","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Rhonwens_Traenen/Haus_Morveth/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Rhonwens Tränen","slug":"rhonwens-tranen"},{"type":"Haus","name":"Haus Morveth","slug":"haus-morveth"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":true},
    {"id":"haus-rhenna","slug":"haus-rhenna","aliases":[],"name":"Haus Rhenna","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Rhonwens_Traenen/Haus_Rhenna/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Rhonwens Tränen","slug":"rhonwens-tranen"},{"type":"Haus","name":"Haus Rhenna","slug":"haus-rhenna"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":true},
    {"id":"haus-skellor","slug":"haus-skellor","aliases":[],"name":"Haus Skellor","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Rhonwens_Traenen/Haus_Skellor/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Rhonwens Tränen","slug":"rhonwens-tranen"},{"type":"Haus","name":"Haus Skellor","slug":"haus-skellor"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":false},
    {"id":"haus-talinvyr","slug":"haus-talinvyr","aliases":[],"name":"Haus Talinvyr","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Celtigerns_Wacht/Rhonwens_Traenen/Haus_Talinvyr/haus.data.js?v=20261024-housebio-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Celtigerns Wacht","slug":"celtigerns-wacht"},{"type":"Region","name":"Rhonwens Tränen","slug":"rhonwens-tranen"},{"type":"Haus","name":"Haus Talinvyr","slug":"haus-talinvyr"}],"tags":["Celtigerns Wacht","Ritterhaus"],"prepared":true},
    {"id":"haus-fiachraoin","slug":"haus-fiachraoin","aliases":[],"name":"Clan Fiachraoin","status":"active","type":"clan","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Vortigerns_Ruh/Antike_Haeuser/Haus_Fiachraoin/haus.data.js?v=20261024-vortigerns-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Vortigerns Ruh","slug":"vortigerns-ruh"},{"type":"Region","name":"Antike Häuser","slug":"antike-hauser"},{"type":"Sitz","name":"Antikes Calon","slug":"antikes-calon"},{"type":"Clan","name":"Clan Fiachraoin","slug":"haus-fiachraoin"}],"tags":["Vortigerns Ruh","Clan"],"prepared":true},
    {"id":"haus-cath","slug":"haus-cath","aliases":[],"name":"Haus Cath O'Mathragon","status":"active","type":"house","page":"haus.html","data":"Estryll/Cenyr/Vortigerns_Ruh/Tanwens_Flamme/Haus_Cath/haus.data.js?v=20261024-vortigerns-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Vortigerns Ruh","slug":"vortigerns-ruh"},{"type":"Region","name":"Tanwens Flamme","slug":"tanwens-flamme"},{"type":"Sitz","name":"Mathragon","slug":"mathragon"},{"type":"Haus","name":"Haus Cath O'Mathragon","slug":"haus-cath"}],"tags":["Vortigerns Ruh","Ritterhaus"],"prepared":false},
    {"id":"haus-cyfrif","slug":"haus-cyfrif","aliases":[],"name":"Haus Cyfrif","status":"active","type":"family","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Vortigerns_Ruh/Tanwens_Flamme/Haus_Cyfrif/haus.data.js?v=20261024-vortigerns-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Vortigerns Ruh","slug":"vortigerns-ruh"},{"type":"Region","name":"Tanwens Flamme","slug":"tanwens-flamme"},{"type":"Sitz","name":"Mathragon","slug":"mathragon"},{"type":"Haus","name":"Haus Cyfrif","slug":"haus-cyfrif"}],"tags":["Vortigerns Ruh","Bürgerliches Haus"],"prepared":true},
    {"id":"haus-dienyddiwr","slug":"haus-dienyddiwr","aliases":[],"name":"Haus Dienyddiwr O'Mathragon","status":"active","type":"house","page":"haus.html","data":"Estryll/Cenyr/Vortigerns_Ruh/Tanwens_Flamme/Haus_Dienyddiwr/haus.data.js?v=20261024-vortigerns-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Vortigerns Ruh","slug":"vortigerns-ruh"},{"type":"Region","name":"Tanwens Flamme","slug":"tanwens-flamme"},{"type":"Sitz","name":"Mathragon","slug":"mathragon"},{"type":"Haus","name":"Haus Dienyddiwr O'Mathragon","slug":"haus-dienyddiwr"}],"tags":["Vortigerns Ruh","Ritterhaus"],"prepared":false},
    {"id":"haus-dyngwn","slug":"haus-dyngwn","aliases":[],"name":"Haus Dyngwn O'Mathragon","status":"active","type":"house","page":"haus.html","data":"Estryll/Cenyr/Vortigerns_Ruh/Tanwens_Flamme/Haus_Dyngwn/haus.data.js?v=20261024-vortigerns-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Vortigerns Ruh","slug":"vortigerns-ruh"},{"type":"Region","name":"Tanwens Flamme","slug":"tanwens-flamme"},{"type":"Sitz","name":"Mathragon","slug":"mathragon"},{"type":"Haus","name":"Haus Dyngwn O'Mathragon","slug":"haus-dyngwn"}],"tags":["Vortigerns Ruh","Ritterhaus"],"prepared":false},
    {"id":"haus-grael","slug":"haus-grael","aliases":[],"name":"Haus Grael O'Mathragon","status":"active","type":"house","page":"haus.html","data":"Estryll/Cenyr/Vortigerns_Ruh/Tanwens_Flamme/Haus_Grael/haus.data.js?v=20261024-vortigerns-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Vortigerns Ruh","slug":"vortigerns-ruh"},{"type":"Region","name":"Tanwens Flamme","slug":"tanwens-flamme"},{"type":"Sitz","name":"Mathragon","slug":"mathragon"},{"type":"Haus","name":"Haus Grael O'Mathragon","slug":"haus-grael"}],"tags":["Vortigerns Ruh","Ritterhaus"],"prepared":false},
    {"id":"haus-iwrell","slug":"haus-iwrell","aliases":[],"name":"Haus Iwrell","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Vortigerns_Ruh/Tanwens_Flamme/Haus_Iwrell/haus.data.js?v=20261024-vortigerns-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Vortigerns Ruh","slug":"vortigerns-ruh"},{"type":"Region","name":"Tanwens Flamme","slug":"tanwens-flamme"},{"type":"Sitz","name":"Mathragon","slug":"mathragon"},{"type":"Haus","name":"Haus Iwrell","slug":"haus-iwrell"}],"tags":["Vortigerns Ruh","Ritterhaus"],"prepared":true},
    {"id":"haus-marwolaeth","slug":"haus-marwolaeth","aliases":[],"name":"Haus Marwolaeth O'Mathragon","status":"active","type":"house","page":"haus.html","data":"Estryll/Cenyr/Vortigerns_Ruh/Tanwens_Flamme/Haus_Marwolaeth/haus.data.js?v=20261024-vortigerns-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Vortigerns Ruh","slug":"vortigerns-ruh"},{"type":"Region","name":"Tanwens Flamme","slug":"tanwens-flamme"},{"type":"Sitz","name":"Mathragon","slug":"mathragon"},{"type":"Haus","name":"Haus Marwolaeth O'Mathragon","slug":"haus-marwolaeth"}],"tags":["Vortigerns Ruh","Ritterhaus"],"prepared":false},
    {"id":"haus-morwyn","slug":"haus-morwyn","aliases":[],"name":"Haus Morwyn","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Vortigerns_Ruh/Tanwens_Flamme/Haus_Morwyn/haus.data.js?v=20261024-vortigerns-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Vortigerns Ruh","slug":"vortigerns-ruh"},{"type":"Region","name":"Tanwens Flamme","slug":"tanwens-flamme"},{"type":"Sitz","name":"Mathragon","slug":"mathragon"},{"type":"Haus","name":"Haus Morwyn","slug":"haus-morwyn"}],"tags":["Vortigerns Ruh","Ritterhaus"],"prepared":true},
    {"id":"haus-oenfyr","slug":"haus-oenfyr","aliases":[],"name":"Haus Oenfyr","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Vortigerns_Ruh/Tanwens_Flamme/Haus_Oenfyr/haus.data.js?v=20261024-vortigerns-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Vortigerns Ruh","slug":"vortigerns-ruh"},{"type":"Region","name":"Tanwens Flamme","slug":"tanwens-flamme"},{"type":"Sitz","name":"Mathragon","slug":"mathragon"},{"type":"Haus","name":"Haus Oenfyr","slug":"haus-oenfyr"}],"tags":["Vortigerns Ruh","Ritterhaus"],"prepared":true},
    {"id":"haus-penderyn","slug":"haus-penderyn","aliases":[],"name":"Haus Penderyn O'Mathragon","status":"active","type":"house","page":"haus.html","data":"Estryll/Cenyr/Vortigerns_Ruh/Tanwens_Flamme/Haus_Penderyn/haus.data.js?v=20261024-vortigerns-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Vortigerns Ruh","slug":"vortigerns-ruh"},{"type":"Region","name":"Tanwens Flamme","slug":"tanwens-flamme"},{"type":"Sitz","name":"Mathragon","slug":"mathragon"},{"type":"Haus","name":"Haus Penderyn O'Mathragon","slug":"haus-penderyn"}],"tags":["Vortigerns Ruh","Ritterhaus"],"prepared":false},
    {"id":"haus-pendrag","slug":"haus-pendrag","aliases":[],"name":"Haus Pendrag","status":"active","type":"house","page":"haus.html","data":"Estryll/Cenyr/Vortigerns_Ruh/Tanwens_Flamme/Haus_Pendrag/haus.data.js?v=20261024-vortigerns-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Vortigerns Ruh","slug":"vortigerns-ruh"},{"type":"Region","name":"Tanwens Flamme","slug":"tanwens-flamme"},{"type":"Sitz","name":"Mathragon","slug":"mathragon"},{"type":"Haus","name":"Haus Pendrag","slug":"haus-pendrag"}],"tags":["Vortigerns Ruh","Königshaus"],"prepared":false},
    {"id":"haus-pengair","slug":"haus-pengair","aliases":[],"name":"Haus Pengair","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Vortigerns_Ruh/Tanwens_Flamme/Haus_Pengair/haus.data.js?v=20261024-vortigerns-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Vortigerns Ruh","slug":"vortigerns-ruh"},{"type":"Region","name":"Tanwens Flamme","slug":"tanwens-flamme"},{"type":"Sitz","name":"Mathragon","slug":"mathragon"},{"type":"Haus","name":"Haus Pengair","slug":"haus-pengair"}],"tags":["Vortigerns Ruh","Ritterhaus"],"prepared":false},
    {"id":"haus-rhavaen","slug":"haus-rhavaen","aliases":[],"name":"Haus Rhavaen","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Vortigerns_Ruh/Tanwens_Flamme/Haus_Rhavaen/haus.data.js?v=20261024-vortigerns-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Vortigerns Ruh","slug":"vortigerns-ruh"},{"type":"Region","name":"Tanwens Flamme","slug":"tanwens-flamme"},{"type":"Sitz","name":"Mathragon","slug":"mathragon"},{"type":"Haus","name":"Haus Rhavaen","slug":"haus-rhavaen"}],"tags":["Vortigerns Ruh","Ritterhaus"],"prepared":true},
    {"id":"haus-saivor","slug":"haus-saivor","aliases":[],"name":"Haus Saivor","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Vortigerns_Ruh/Tanwens_Flamme/Haus_Saivor/haus.data.js?v=20261024-vortigerns-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Vortigerns Ruh","slug":"vortigerns-ruh"},{"type":"Region","name":"Tanwens Flamme","slug":"tanwens-flamme"},{"type":"Sitz","name":"Mathragon","slug":"mathragon"},{"type":"Haus","name":"Haus Saivor","slug":"haus-saivor"}],"tags":["Vortigerns Ruh","Ritterhaus"],"prepared":true},
    {"id":"haus-ynllym","slug":"haus-ynllym","aliases":[],"name":"Haus Ynllym","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Cenyr/Vortigerns_Ruh/Tanwens_Flamme/Haus_Ynllym/haus.data.js?v=20261024-vortigerns-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Vortigerns Ruh","slug":"vortigerns-ruh"},{"type":"Region","name":"Tanwens Flamme","slug":"tanwens-flamme"},{"type":"Sitz","name":"Mathragon","slug":"mathragon"},{"type":"Haus","name":"Haus Ynllym","slug":"haus-ynllym"}],"tags":["Vortigerns Ruh","Ritterhaus"],"prepared":true},
    {"id":"haus-ceirwyn","slug":"haus-ceirwyn","aliases":[],"name":"Haus Ceirwyn O'Calon","status":"active","type":"house","page":"haus.html","data":"Estryll/Cenyr/Vortigerns_Ruh/Uthers_Aufstieg/Haus_Ceirwyn/haus.data.js?v=20261024-vortigerns-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Königreich","name":"Cenyr","slug":"cenyr"},{"type":"Grafschaft","name":"Vortigerns Ruh","slug":"vortigerns-ruh"},{"type":"Region","name":"Uthers Aufstieg","slug":"uthers-aufstieg"},{"type":"Sitz","name":"Calon","slug":"calon"},{"type":"Haus","name":"Haus Ceirwyn O'Calon","slug":"haus-ceirwyn"}],"tags":["Vortigerns Ruh","Baronenhaus"],"prepared":false},
    {"id":"haus-von-hochreuth","slug":"haus-von-hochreuth","aliases":[],"name":"Haus von Hochreuth","status":"active","type":"house","page":"kleinehaeuser.html","data":"Estryll/Goldmund/Unsortiert/Unsortiert/Haus_von_Hochreuth/haus.data.js?v=gwendolyn-20260911h","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Königreich","name":"Goldmund","slug":"goldmund"},{"type":"Haus","name":"Haus von Hochreuth","slug":"haus-von-hochreuth"}],"tags":["","Ritterhaus"],"prepared":true},
    {"id":"haus-arbhair","slug":"haus-arbhair","aliases":[],"name":"Clan Dâl Arbhair","status":"active","type":"clan","page":"kleinehaeuser.html","data":"Estryll/Uathneach/Clan_arbhair/haus.data.js?v=20261027-uathneach-warriors-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Fürstentum","name":"Fürstentum Uathneach","slug":"fuerstentum-uathneach"},{"type":"Fürstliche Domäne","name":"Tir na Dála","slug":"uathneach-tir-na-laimhe"},{"type":"Herrschaft","name":"Herrschaft der Dâl Arbhair","slug":"uathneach-herrschaft-arbhair"},{"type":"Sitz","name":"Dunnean","slug":"dunnean"},{"type":"Clan","name":"Clan Dâl Arbhair","slug":"haus-arbhair"}],"tags":["Tir na Dála","Clan"],"prepared":true},
    {"id":"haus-briccne","slug":"haus-briccne","aliases":[],"name":"Clan Na Briccne","status":"active","type":"clan","page":"kleinehaeuser.html","data":"Estryll/Uathneach/Clan_briccne/haus.data.js?v=20261027-uathneach-warriors-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Fürstentum","name":"Fürstentum Uathneach","slug":"fuerstentum-uathneach"},{"type":"Fürstliche Domäne","name":"Tir na Dála","slug":"uathneach-tir-na-laimhe"},{"type":"Herrschaft","name":"Herrschaft der Na Briccne","slug":"uathneach-herrschaft-briccne"},{"type":"Sitz","name":"Dunnean","slug":"dunnean"},{"type":"Clan","name":"Clan Na Briccne","slug":"haus-briccne"}],"tags":["Tir na Dála","Clan"],"prepared":true},
    {"id":"haus-cadhla","slug":"haus-cadhla","aliases":[],"name":"Clan An Cadhla","status":"active","type":"clan","page":"kleinehaeuser.html","data":"Estryll/Uathneach/Clan_cadhla/haus.data.js?v=20261027-uathneach-warriors-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Fürstentum","name":"Fürstentum Uathneach","slug":"fuerstentum-uathneach"},{"type":"Oberherrschaft","name":"Tir na Machairí","slug":"uathneach-tir-na-dtorc"},{"type":"Herrschaft","name":"Tir na Líonta","slug":"uathneach-herrschaft-cadhla"},{"type":"Sitz","name":"Broch an Cuan","slug":"cuan"},{"type":"Clan","name":"Clan An Cadhla","slug":"haus-cadhla"}],"tags":["Tir na Machairí","Clan"],"prepared":true},
    {"id":"haus-cairbre","slug":"haus-cairbre","aliases":[],"name":"Clan Ua Cairbre","status":"active","type":"clan","page":"kleinehaeuser.html","data":"Estryll/Uathneach/Clan_cairbre/haus.data.js?v=20261027-uathneach-warriors-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Fürstentum","name":"Fürstentum Uathneach","slug":"fuerstentum-uathneach"},{"type":"Oberherrschaft","name":"Tir na Seolta","slug":"uathneach-tir-na-taoide"},{"type":"Herrschaft","name":"Herrschaft der Ua Cairbre","slug":"uathneach-herrschaft-cairbre"},{"type":"Sitz","name":"Orglen","slug":"orglen"},{"type":"Clan","name":"Clan Ua Cairbre","slug":"haus-cairbre"}],"tags":["Tir na Seolta","Clan"],"prepared":true},
    {"id":"haus-cairge","slug":"haus-cairge","aliases":[],"name":"Clan Ua Cairge","status":"active","type":"clan","page":"kleinehaeuser.html","data":"Estryll/Uathneach/Clan_cairge/haus.data.js?v=20261027-uathneach-warriors-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Fürstentum","name":"Fürstentum Uathneach","slug":"fuerstentum-uathneach"},{"type":"Oberherrschaft","name":"Tir na Seolta","slug":"uathneach-tir-na-taoide"},{"type":"Herrschaft","name":"Tir na bPortán","slug":"uathneach-herrschaft-cairge"},{"type":"Sitz","name":"Broch an Mhor","slug":"mhor"},{"type":"Clan","name":"Clan Ua Cairge","slug":"haus-cairge"}],"tags":["Tir na Seolta","Clan"],"prepared":true},
    {"id":"haus-clannmhar","slug":"haus-clannmhar","aliases":[],"name":"Clan Tir an Clannmhar","status":"active","type":"clan","page":"kleinehaeuser.html","data":"Estryll/Uathneach/Clan_clannmhar/haus.data.js?v=20261027-uathneach-warriors-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Fürstentum","name":"Fürstentum Uathneach","slug":"fuerstentum-uathneach"},{"type":"Oberherrschaft","name":"Tir na gClog","slug":"uathneach-tir-na-cloiche"},{"type":"Herrschaft","name":"Tir na Snaidhme","slug":"uathneach-herrschaft-clannmhar"},{"type":"Sitz","name":"Rioghain","slug":"rioghain"},{"type":"Clan","name":"Clan Tir an Clannmhar","slug":"haus-clannmhar"}],"tags":["Tir na gClog","Clan"],"prepared":true},
    {"id":"haus-conchobhair","slug":"haus-conchobhair","aliases":[],"name":"Clan Ard Conchobhair","status":"active","type":"clan","page":"kleinehaeuser.html","data":"Estryll/Uathneach/Clan_conchobhair/haus.data.js?v=20261027-uathneach-warriors-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Fürstentum","name":"Fürstentum Uathneach","slug":"fuerstentum-uathneach"},{"type":"Oberherrschaft","name":"Tir na Gairme","slug":"uathneach-tir-na-gcoillte"},{"type":"Sitz","name":"Cathair","slug":"cathair"},{"type":"Clan","name":"Clan Ard Conchobhair","slug":"haus-conchobhair"}],"tags":["Tir na Gairme","Clan"],"prepared":true},
    {"id":"haus-creagan","slug":"haus-creagan","aliases":[],"name":"Clan Tir An Creagán","status":"active","type":"clan","page":"kleinehaeuser.html","data":"Estryll/Uathneach/Clan_creagan/haus.data.js?v=20261027-uathneach-warriors-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Fürstentum","name":"Fürstentum Uathneach","slug":"fuerstentum-uathneach"},{"type":"Oberherrschaft","name":"Tir na Faire","slug":"uathneach-tir-na-conaire"},{"type":"Herrschaft","name":"Tir na bhFeochadán","slug":"uathneach-herrschaft-creagan"},{"type":"Sitz","name":"Ceithirn","slug":"ceithirn"},{"type":"Clan","name":"Clan Tir An Creagán","slug":"haus-creagan"}],"tags":["Tir na Faire","Clan"],"prepared":true},
    {"id":"haus-cuilen","slug":"haus-cuilen","aliases":[],"name":"Clan Ua Cuilen","status":"active","type":"clan","page":"kleinehaeuser.html","data":"Estryll/Uathneach/Clan_cuilen/haus.data.js?v=20261027-uathneach-warriors-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Fürstentum","name":"Fürstentum Uathneach","slug":"fuerstentum-uathneach"},{"type":"Oberherrschaft","name":"Tir na Machairí","slug":"uathneach-tir-na-dtorc"},{"type":"Herrschaft","name":"Herrschaft der Ua Cuilen","slug":"uathneach-herrschaft-cuilen"},{"type":"Sitz","name":"Rinnmara","slug":"rinnmara"},{"type":"Clan","name":"Clan Ua Cuilen","slug":"haus-cuilen"}],"tags":["Tir na Machairí","Clan"],"prepared":true},
    {"id":"haus-siubhran","slug":"haus-siubhran","aliases":[],"name":"Clan Dál Siubhrán","status":"active","type":"clan","page":"kleinehaeuser.html","data":"Estryll/Uathneach/Clan_einsiedlerkrebs/haus.data.js?v=20261027-uathneach-warriors-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Fürstentum","name":"Fürstentum Uathneach","slug":"fuerstentum-uathneach"},{"type":"Fürstliche Domäne","name":"Tir na Dála","slug":"uathneach-tir-na-laimhe"},{"type":"Herrschaft","name":"Tir na Fánaíochta","slug":"uathneach-herrschaft-einsiedlerkrebs"},{"type":"Sitz","name":"Féthlinn","slug":"fethlinn"},{"type":"Clan","name":"Clan Dál Siubhrán","slug":"haus-siubhran"}],"tags":["Tir na Dála","Clan"],"prepared":true},
    {"id":"haus-fastaigh","slug":"haus-fastaigh","aliases":[],"name":"Clan Dál Fastaigh","status":"active","type":"clan","page":"kleinehaeuser.html","data":"Estryll/Uathneach/Clan_fastaigh/haus.data.js?v=20261027-uathneach-warriors-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Fürstentum","name":"Fürstentum Uathneach","slug":"fuerstentum-uathneach"},{"type":"Fürstliche Domäne","name":"Tir na Dála","slug":"uathneach-tir-na-laimhe"},{"type":"Herrschaft","name":"Tir na hAille","slug":"uathneach-herrschaft-fastaigh"},{"type":"Sitz","name":"Bronnan","slug":"bronnan"},{"type":"Clan","name":"Clan Dál Fastaigh","slug":"haus-fastaigh"}],"tags":["Tir na Dála","Clan"],"prepared":true},
    {"id":"haus-fiodhran","slug":"haus-fiodhran","aliases":[],"name":"Clan Na Fiodhrán","status":"active","type":"clan","page":"kleinehaeuser.html","data":"Estryll/Uathneach/Clan_fiodhran/haus.data.js?v=20261027-uathneach-warriors-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Fürstentum","name":"Fürstentum Uathneach","slug":"fuerstentum-uathneach"},{"type":"Oberherrschaft","name":"Tir na Gairme","slug":"uathneach-tir-na-gcoillte"},{"type":"Herrschaft","name":"Tir na gCurach","slug":"uathneach-herrschaft-fiodhran"},{"type":"Sitz","name":"Dathuil","slug":"dathuil"},{"type":"Clan","name":"Clan Na Fiodhrán","slug":"haus-fiodhran"}],"tags":["Tir na Gairme","Clan"],"prepared":true},
    {"id":"haus-gealan","slug":"haus-gealan","aliases":[],"name":"Clan An Gealân","status":"active","type":"clan","page":"kleinehaeuser.html","data":"Estryll/Uathneach/Clan_gealan/haus.data.js?v=20261027-uathneach-warriors-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Fürstentum","name":"Fürstentum Uathneach","slug":"fuerstentum-uathneach"},{"type":"Oberherrschaft","name":"Tir na nGleannta","slug":"uathneach-tir-na-sruthan"},{"type":"Sitz","name":"Moineal","slug":"moineal"},{"type":"Clan","name":"Clan An Gealân","slug":"haus-gealan"}],"tags":["Tir na nGleannta","Clan"],"prepared":true},
    {"id":"haus-giolla","slug":"haus-giolla","aliases":[],"name":"Clan Ruin Giolla","status":"active","type":"clan","page":"kleinehaeuser.html","data":"Estryll/Uathneach/Clan_giolla/haus.data.js?v=20261027-uathneach-warriors-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Fürstentum","name":"Fürstentum Uathneach","slug":"fuerstentum-uathneach"},{"type":"Oberherrschaft","name":"Tir na gClog","slug":"uathneach-tir-na-cloiche"},{"type":"Herrschaft","name":"Herrschaft der Ruin Giolla","slug":"uathneach-herrschaft-giolla"},{"type":"Sitz","name":"Kharanor","slug":"kharanor"},{"type":"Clan","name":"Clan Ruin Giolla","slug":"haus-giolla"}],"tags":["Tir na gClog","Clan"],"prepared":true},
    {"id":"haus-laga","slug":"haus-laga","aliases":[],"name":"Clan Mac Ard’Lága","status":"active","type":"clan","page":"kleinehaeuser.html","data":"Estryll/Uathneach/Clan_laga/haus.data.js?v=20261027-uathneach-warriors-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Fürstentum","name":"Fürstentum Uathneach","slug":"fuerstentum-uathneach"},{"type":"Fürstliche Domäne","name":"Tir na Dála","slug":"uathneach-tir-na-laimhe"},{"type":"Sitz","name":"Dunnean","slug":"dunnean"},{"type":"Clan","name":"Clan Mac Ard’Lága","slug":"haus-laga"}],"tags":["Tir na Dála","Clan"],"prepared":true},
    {"id":"haus-lasgair","slug":"haus-lasgair","aliases":[],"name":"Clan Ua Lasgair","status":"active","type":"clan","page":"kleinehaeuser.html","data":"Estryll/Uathneach/Clan_lasgair/haus.data.js?v=20261027-uathneach-warriors-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Fürstentum","name":"Fürstentum Uathneach","slug":"fuerstentum-uathneach"},{"type":"Oberherrschaft","name":"Tir na gClog","slug":"uathneach-tir-na-cloiche"},{"type":"Herrschaft","name":"Tir na nEití","slug":"uathneach-herrschaft-lasgair"},{"type":"Sitz","name":"Mhorcha","slug":"mhorcha"},{"type":"Clan","name":"Clan Ua Lasgair","slug":"haus-lasgair"}],"tags":["Tir na gClog","Clan"],"prepared":true},
    {"id":"haus-luachra","slug":"haus-luachra","aliases":[],"name":"Clan Nic Luachra","status":"active","type":"clan","page":"kleinehaeuser.html","data":"Estryll/Uathneach/Clan_luachra/haus.data.js?v=20261027-uathneach-warriors-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Fürstentum","name":"Fürstentum Uathneach","slug":"fuerstentum-uathneach"},{"type":"Oberherrschaft","name":"Tir na nGleannta","slug":"uathneach-tir-na-sruthan"},{"type":"Herrschaft","name":"Tir na Raithní","slug":"uathneach-herrschaft-luachra"},{"type":"Sitz","name":"Treabhair","slug":"treabhair"},{"type":"Clan","name":"Clan Nic Luachra","slug":"haus-luachra"}],"tags":["Tir na nGleannta","Clan"],"prepared":true},
    {"id":"haus-luga","slug":"haus-luga","aliases":[],"name":"Clan Ua’Luga","status":"active","type":"clan","page":"kleinehaeuser.html","data":"Estryll/Uathneach/Clan_luga/haus.data.js?v=20261027-uathneach-warriors-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Fürstentum","name":"Fürstentum Uathneach","slug":"fuerstentum-uathneach"},{"type":"Oberherrschaft","name":"Tir na gClog","slug":"uathneach-tir-na-cloiche"},{"type":"Sitz","name":"Kharanor","slug":"kharanor"},{"type":"Clan","name":"Clan Ua’Luga","slug":"haus-luga"}],"tags":["Tir na gClog","Clan"],"prepared":true},
    {"id":"haus-marcaigh","slug":"haus-marcaigh","aliases":[],"name":"Clan Ruin Marcaigh","status":"active","type":"clan","page":"kleinehaeuser.html","data":"Estryll/Uathneach/Clan_marcaigh/haus.data.js?v=20261027-uathneach-warriors-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Fürstentum","name":"Fürstentum Uathneach","slug":"fuerstentum-uathneach"},{"type":"Oberherrschaft","name":"Tir na gClog","slug":"uathneach-tir-na-cloiche"},{"type":"Herrschaft","name":"Herrschaft der Ruin Marcaigh","slug":"uathneach-herrschaft-marcaigh"},{"type":"Sitz","name":"Kharanor","slug":"kharanor"},{"type":"Clan","name":"Clan Ruin Marcaigh","slug":"haus-marcaigh"}],"tags":["Tir na gClog","Clan"],"prepared":true},
    {"id":"haus-mata","slug":"haus-mata","aliases":[],"name":"Clan Tir an Máta","status":"active","type":"clan","page":"kleinehaeuser.html","data":"Estryll/Uathneach/Clan_mata/haus.data.js?v=20261027-uathneach-warriors-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Fürstentum","name":"Fürstentum Uathneach","slug":"fuerstentum-uathneach"},{"type":"Oberherrschaft","name":"Tir na Faire","slug":"uathneach-tir-na-conaire"},{"type":"Sitz","name":"Temair","slug":"temair"},{"type":"Clan","name":"Clan Tir an Máta","slug":"haus-mata"}],"tags":["Tir na Faire","Clan"],"prepared":true},
    {"id":"haus-midgna","slug":"haus-midgna","aliases":[],"name":"Clan Mac Midgna","status":"active","type":"clan","page":"kleinehaeuser.html","data":"Estryll/Uathneach/Clan_midgna/haus.data.js?v=20261027-uathneach-warriors-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Fürstentum","name":"Fürstentum Uathneach","slug":"fuerstentum-uathneach"},{"type":"Oberherrschaft","name":"Tir na Machairí","slug":"uathneach-tir-na-dtorc"},{"type":"Sitz","name":"Rinnmara","slug":"rinnmara"},{"type":"Clan","name":"Clan Mac Midgna","slug":"haus-midgna"}],"tags":["Tir na Machairí","Clan"],"prepared":true},
    {"id":"haus-muirin","slug":"haus-muirin","aliases":[],"name":"Clan Ua Muirin","status":"active","type":"clan","page":"kleinehaeuser.html","data":"Estryll/Uathneach/Clan_muirin/haus.data.js?v=20261027-uathneach-warriors-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Fürstentum","name":"Fürstentum Uathneach","slug":"fuerstentum-uathneach"},{"type":"Fürstliche Domäne","name":"Tir na Dála","slug":"uathneach-tir-na-laimhe"},{"type":"Herrschaft","name":"Tir na nGliomach","slug":"uathneach-herrschaft-muirin"},{"type":"Sitz","name":"Broch an Reithe","slug":"reithe"},{"type":"Clan","name":"Clan Ua Muirin","slug":"haus-muirin"}],"tags":["Tir na Dála","Clan"],"prepared":true},
    {"id":"haus-reannachain","slug":"haus-reannachain","aliases":[],"name":"Clan Ua Reannachain","status":"active","type":"clan","page":"kleinehaeuser.html","data":"Estryll/Uathneach/Clan_reannachain/haus.data.js?v=20261027-uathneach-warriors-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Fürstentum","name":"Fürstentum Uathneach","slug":"fuerstentum-uathneach"},{"type":"Oberherrschaft","name":"Tir na Seolta","slug":"uathneach-tir-na-taoide"},{"type":"Herrschaft","name":"Herrschaft der Ua Reannachain","slug":"uathneach-herrschaft-reannachain"},{"type":"Sitz","name":"Orglen","slug":"orglen"},{"type":"Clan","name":"Clan Ua Reannachain","slug":"haus-reannachain"}],"tags":["Tir na Seolta","Clan"],"prepared":true},
    {"id":"haus-roich","slug":"haus-roich","aliases":[],"name":"Clan Mac Roich","status":"active","type":"clan","page":"kleinehaeuser.html","data":"Estryll/Uathneach/Clan_roich/haus.data.js?v=20261027-uathneach-warriors-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Fürstentum","name":"Fürstentum Uathneach","slug":"fuerstentum-uathneach"},{"type":"Oberherrschaft","name":"Tir na Seolta","slug":"uathneach-tir-na-taoide"},{"type":"Sitz","name":"Orglen","slug":"orglen"},{"type":"Clan","name":"Clan Mac Roich","slug":"haus-roich"}],"tags":["Tir na Seolta","Clan"],"prepared":true},
    {"id":"haus-scathain","slug":"haus-scathain","aliases":[],"name":"Clan An Scatháin","status":"active","type":"clan","page":"kleinehaeuser.html","data":"Estryll/Uathneach/Clan_scathain/haus.data.js?v=20261027-uathneach-warriors-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Fürstentum","name":"Fürstentum Uathneach","slug":"fuerstentum-uathneach"},{"type":"Fürstliche Domäne","name":"Tir na Dála","slug":"uathneach-tir-na-laimhe"},{"type":"Herrschaft","name":"Herrschaft der An Scatháin","slug":"uathneach-herrschaft-scathain"},{"type":"Sitz","name":"Dunnean","slug":"dunnean"},{"type":"Clan","name":"Clan An Scatháin","slug":"haus-scathain"}],"tags":["Tir na Dála","Clan"],"prepared":true},
    {"id":"haus-suilgeach","slug":"haus-suilgeach","aliases":[],"name":"Clan Na Suilgeach","status":"active","type":"clan","page":"kleinehaeuser.html","data":"Estryll/Uathneach/Clan_suilgeach/haus.data.js?v=20261027-uathneach-warriors-v1","hierarchy":[{"type":"Sammlung","name":"Familien Häuser und Clans","slug":"familien-hauser-und-clans"},{"type":"Kontinent","name":"Estryll","slug":"estryll"},{"type":"Fürstentum","name":"Fürstentum Uathneach","slug":"fuerstentum-uathneach"},{"type":"Oberherrschaft","name":"Tir na Faire","slug":"uathneach-tir-na-conaire"},{"type":"Herrschaft","name":"Tir na Réalta","slug":"uathneach-herrschaft-suilgeach"},{"type":"Sitz","name":"Caorthann","slug":"caorthann"},{"type":"Clan","name":"Clan Na Suilgeach","slug":"haus-suilgeach"}],"tags":["Tir na Faire","Clan"],"prepared":true},
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
      data: "Estryll/Cenyr/Celtigerns_Wacht/Haus_Draig/haus.data.js?v=draig-krieger-20260930b",
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
