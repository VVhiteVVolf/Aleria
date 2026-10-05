import { HOUSE_CAERDYN_PORTRAITS } from './house-caerdyn-portraits.js';
import { HOUSE_DREWI_PORTRAITS } from './house-drewi-portraits.js';
import { HOUSE_GWANRHYD_PORTRAITS } from './house-gwanrhyd-portraits.js';
import { HOUSE_BOCHDEW_PORTRAITS } from './house-bochdew-portraits.js';
import { HOUSE_UDGORN_PORTRAITS } from './house-udgorn-portraits.js';
import { HOUSE_BALAURIC_PORTRAITS } from './house-balauric-portraits.js';
import { HOUSE_MORGRYN_PORTRAITS } from './house-morgryn-portraits.js';
import { HOUSE_GWENYEN_PORTRAITS } from './house-gwenyen-portraits.js';
import { HOUSE_CRWYNOG_PORTRAITS } from './house-crwynog-portraits.js';
import { HOUSE_TODBRAND_PORTRAITS } from './house-todbrand-portraits.js';
import { HOUSE_DIANC_PORTRAITS } from './house-dianc-portraits.js';
import { HOUSE_ARFORDIR_PORTRAITS } from './house-arfordir-portraits.js';
import { HOUSE_ILLYGODEN_PORTRAITS } from './house-illygoden-portraits.js';
import { HOUSE_WALWRS_PORTRAITS } from './house-walwrs-portraits.js';
import { HOUSE_DIAFOL_PORTRAITS } from './house-diafol-portraits.js';
import { HOUSE_DYFRGI_PORTRAITS } from './house-dyfrgi-portraits.js';
import { HOUSE_GWAEDLYD_PORTRAITS } from './house-gwaedlyd-portraits.js';
import { HOUSE_WIVERN_PORTRAITS } from './house-wivern-portraits.js';
import { HOUSE_BLODYN_PORTRAITS } from './house-blodyn-portraits.js';
import { HOUSE_BRITHYLL_PORTRAITS } from './house-brithyll-portraits.js';
import { HOUSE_LYFANT_PORTRAITS } from './house-lyfant-portraits.js';
import { HOUSE_MOCHDAER_PORTRAITS } from './house-mochdaer-portraits.js';
import { HOUSE_TRACHWYLL_PORTRAITS } from './house-trachwyll-portraits.js';
import { HOUSE_MORLAIS_PORTRAITS } from './house-morlais-portraits.js';
import { HOUSE_BLODEUWEDD_PORTRAITS } from './house-blodeuwedd-portraits.js';
import { HOUSE_GWIALEN_PORTRAITS } from './house-gwialen-portraits.js';
import { HOUSE_BLAIDD_PORTRAITS } from './house-blaidd-portraits.js';
import { HOUSE_SERENOC_PORTRAITS } from './house-serenoc-portraits.js';
import { HOUSE_MORGANT_PORTRAITS } from './house-morgant-portraits.js';
import { HOUSE_BOYD_PORTRAITS } from './house-boyd-portraits.js';

// Die Sammlung verbindet reine Bildmodule, ohne Familienakten gegenseitig zu importieren.
export const VENNYR_REMAINING_PORTRAITS = Object.freeze({
  ...HOUSE_CAERDYN_PORTRAITS,
  ...HOUSE_DREWI_PORTRAITS,
  ...HOUSE_GWANRHYD_PORTRAITS,
  ...HOUSE_BOCHDEW_PORTRAITS,
  ...HOUSE_UDGORN_PORTRAITS,
  ...HOUSE_BALAURIC_PORTRAITS,
  ...HOUSE_MORGRYN_PORTRAITS,
  ...HOUSE_GWENYEN_PORTRAITS,
  ...HOUSE_CRWYNOG_PORTRAITS,
  'gwindor-1625-bochdew': HOUSE_TODBRAND_PORTRAITS['gwindor-1625-bochdew'],
  'mawr-bochdew': HOUSE_DIANC_PORTRAITS['mawr-bochdew'],
  'dalvin-bochdew': HOUSE_ARFORDIR_PORTRAITS['dalvin-bochdew'],
  'emrys-bochdew': HOUSE_ILLYGODEN_PORTRAITS['emrys-bochdew'],
  'valmai-bochdew': HOUSE_ILLYGODEN_PORTRAITS['valmai-bochdew'],
  'gwindor-bochdew': HOUSE_WALWRS_PORTRAITS['gwindor-bochdew'],
  'meuric-bochdew': HOUSE_DIAFOL_PORTRAITS['meuric-bochdew'],
  'megan-bochdew': HOUSE_ILLYGODEN_PORTRAITS['megan-bochdew'],
  'afanen-bochdew': HOUSE_ILLYGODEN_PORTRAITS['afanen-bochdew'],
  'prys-bochdew': HOUSE_DIANC_PORTRAITS['prys-bochdew'],
  'bronwen-bochdew': HOUSE_DYFRGI_PORTRAITS['bronwen-bochdew'],
  'maldwyn-morgryn': HOUSE_ARFORDIR_PORTRAITS['maldwyn-morgryn'],
  'gwenifer-morgryn': HOUSE_GWAEDLYD_PORTRAITS['gwenifer-morgryn'],
  'isotta-morgryn': HOUSE_WIVERN_PORTRAITS['isotta-morgryn'],
  'colwin-gwenyen': HOUSE_BLODYN_PORTRAITS['colwin-gwenyen'],
  'yvain-gwenyen-ogwych': HOUSE_TODBRAND_PORTRAITS['yvain-gwenyen-ogwych'],
  'heveydd-gwenyen': HOUSE_BRITHYLL_PORTRAITS['heveydd-gwenyen'],
  'owain-gwenyen': HOUSE_LYFANT_PORTRAITS['owain-gwenyen'],
  'blodeuyn-gwenyen': HOUSE_GWAEDLYD_PORTRAITS['blodeuyn-gwenyen'],
  'kimball-gwenyen': HOUSE_MOCHDAER_PORTRAITS['kimball-gwenyen'],
  'yvaine-gwenyen': HOUSE_TRACHWYLL_PORTRAITS['yvaine-gwenyen'],
  'ehangwen-crwynog': HOUSE_DIANC_PORTRAITS['ehangwen-crwynog'],
  'wynfor-crwynog': HOUSE_LYFANT_PORTRAITS['wynfor-crwynog'],
  'cadi-crwynog': HOUSE_WALWRS_PORTRAITS['cadi-crwynog'],
  'blaun-crwynog': HOUSE_WIVERN_PORTRAITS['blaun-crwynog'],
  'ercwlff-diafol': HOUSE_DIAFOL_PORTRAITS['ercwlff-diafol'],
  'tarawg-diafol': HOUSE_DIAFOL_PORTRAITS['tarawg-diafol'],
  'breandan-trachwyll': HOUSE_TRACHWYLL_PORTRAITS['breandan-trachwyll'],
  'griff-diafol': HOUSE_DIAFOL_PORTRAITS['griff-diafol'],
  'merwin-mochdaer': HOUSE_MOCHDAER_PORTRAITS['merwin-mochdaer'],
  'talfryn-trachwyll': HOUSE_TRACHWYLL_PORTRAITS['talfryn-trachwyll'],
  'drwst-diafol': HOUSE_DIAFOL_PORTRAITS['drwst-diafol'],
  'meredydd-illygoden': HOUSE_ILLYGODEN_PORTRAITS['meredydd-illygoden'],
  'tomos-lyfant': HOUSE_LYFANT_PORTRAITS['tomos-lyfant'],
  'traharyan-diafol': HOUSE_DIAFOL_PORTRAITS['traharyan-diafol'],
  'gwenifer-morlais': HOUSE_MORLAIS_PORTRAITS['gwenifer-morlais'],
  'rhydian-blodeuwedd': HOUSE_BLODEUWEDD_PORTRAITS['rhydian-blodeuwedd'],
  'merlion-trachwyll': HOUSE_TRACHWYLL_PORTRAITS['merlion-trachwyll'],
  'bleddyn-illygoden': HOUSE_GWIALEN_PORTRAITS['bleddyn-illygoden'],
  'pedrawd-blaidd': HOUSE_BLAIDD_PORTRAITS['pedrawd-blaidd'],
  'bedros-gwaedlyd': HOUSE_GWAEDLYD_PORTRAITS['bedros-gwaedlyd'],
  'taredd-illygoden': HOUSE_ILLYGODEN_PORTRAITS['taredd-illygoden'],
  'gryn-illygoden': HOUSE_ILLYGODEN_PORTRAITS['gryn-illygoden'],
  'werbenec-dianc': HOUSE_DIANC_PORTRAITS['werbenec-dianc'],
  'oth-dyfrgi': HOUSE_DYFRGI_PORTRAITS['oth-dyfrgi'],
  'mawr-dyfrgi': HOUSE_DYFRGI_PORTRAITS['mawr-dyfrgi'],
  'gwal-morlais': HOUSE_MORLAIS_PORTRAITS['gwal-morlais'],
  'syvwlch-diafol': HOUSE_DIAFOL_PORTRAITS['syvwlch-diafol'],
  'ynyr-dyfrgi': HOUSE_DYFRGI_PORTRAITS['ynyr-dyfrgi'],
  'gwayne-dyfrgi': HOUSE_DYFRGI_PORTRAITS['gwayne-dyfrgi'],
  'dyngannon-serenoc': HOUSE_SERENOC_PORTRAITS['dyngannon-serenoc'],
  'cawrdaf-gwaedlyd': HOUSE_GWAEDLYD_PORTRAITS['cawrdaf-gwaedlyd'],
  'owain-1655-walwrs': HOUSE_WALWRS_PORTRAITS['owain-1655-walwrs'],
  'jinelle-morlais': HOUSE_MORLAIS_PORTRAITS['jinelle-morlais'],
  'cerrin-morgant': HOUSE_MORGANT_PORTRAITS['cerrin-morgant'],
  'malltwyn-arfordir': HOUSE_ARFORDIR_PORTRAITS['malltwyn-arfordir'],
  'iltud-gwaedlyd': HOUSE_GWAEDLYD_PORTRAITS['iltud-gwaedlyd'],
  'arglwydd-arfordir': HOUSE_ARFORDIR_PORTRAITS['arglwydd-arfordir'],
  'griflet-illygoden': HOUSE_ILLYGODEN_PORTRAITS['griflet-illygoden'],
  'dadweir-serenoc': HOUSE_SERENOC_PORTRAITS['dadweir-serenoc'],
  'godwyn-trachwyll': HOUSE_TRACHWYLL_PORTRAITS['godwyn-trachwyll'],
  'cadwgawn-gwaedlyd': HOUSE_GWAEDLYD_PORTRAITS['cadwgawn-gwaedlyd'],
  'rheidwn-walwrs': HOUSE_WALWRS_PORTRAITS['rheidwn-walwrs'],
  'ysgonan-blaidd': HOUSE_BLAIDD_PORTRAITS['ysgonan-blaidd'],
  'garselid-morgant': HOUSE_MORGANT_PORTRAITS['garselid-morgant'],
  'ceridwen-mochdaer': HOUSE_MOCHDAER_PORTRAITS['ceridwen-mochdaer'],
  'charlton-trachwyll': HOUSE_TRACHWYLL_PORTRAITS['charlton-trachwyll'],
  'mallt-serenoc': HOUSE_SERENOC_PORTRAITS['mallt-serenoc'],
  'hopcyn-walwrs': HOUSE_WALWRS_PORTRAITS['hopcyn-walwrs'],
  'meical-blodeuwedd': HOUSE_BLODEUWEDD_PORTRAITS['meical-blodeuwedd'],
  'boudwin-wivern': HOUSE_WIVERN_PORTRAITS['boudwin-wivern'],
  'sulwen-blaidd': HOUSE_BLAIDD_PORTRAITS['sulwen-blaidd'],
  'dubhan-boyd': HOUSE_BOYD_PORTRAITS['dubhan-boyd'],
});
