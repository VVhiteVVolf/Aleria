(function(){
  'use strict';

  const TRAVEL_MODES = [
    {id:'foot_e', l:'🚶 Zu Fuß (gemächlich)', kmh:3.5},
    {id:'foot_f', l:'🚶 Zu Fuß (eilig)', kmh:5},
    {id:'hrs_e', l:'🐴 Zu Pferd (gemächlich)', kmh:7},
    {id:'hrs_f', l:'🐴 Zu Pferd (eilig)', kmh:14},
    {id:'carr', l:'🪵 Kutsche', kmh:6},
    {id:'cart', l:'🛖 Karren', kmh:4},
    {id:'sail', l:'⛵ Segelschiff', kmh:15},
    {id:'row', l:'🚣 Ruderboot', kmh:6},
  ];

  const ICONS = ['📍','⚔️','🛡️','🧙','🏹','🗡️','🐉','👑','🧝','🐺','🦅','⛵','🏰','🔥','💀','🌿','📜','🎭','🧭','👣'];
  const COLORS = ['#e85c5c','#e8a040','#c49a20','#60e860','#40c4e8','#7c5ce8','#e860b4','#a0e860','#508080','#b03030'];
  const CUSTOM_SLOTS = 12;

  const EVENT_TYPES = [
    {type:'none', ic:'📍', lb:'Nur Punkt'},
    {type:'stop', ic:'🏨', lb:'Stop'},
    {type:'camp', ic:'⛺', lb:'Lager'},
    {type:'horse', ic:'🐴', lb:'Reittier'},
    {type:'injury', ic:'🩹', lb:'Verletzung'},
    {type:'encounter', ic:'⚔️', lb:'Begegnung'},
    {type:'obstacle', ic:'🪨', lb:'Hindernis'},
    {type:'travelchange', ic:'🔄', lb:'Reisemodus'},
    {type:'custom', ic:'📜', lb:'Frei'},
  ];

  const EVENT_INFO = {
    none:{ic:'📍', col:'var(--gold)', label:''},
    stop:{ic:'🏨', col:'#c49a20', label:'Stop'},
    camp:{ic:'⛺', col:'#3a8a3a', label:'Lager'},
    horse:{ic:'🐴', col:'#2a7aaa', label:'Reittier'},
    injury:{ic:'🩹', col:'#b03030', label:'Verletzung'},
    encounter:{ic:'⚔️', col:'#9050b0', label:'Begegnung'},
    obstacle:{ic:'🪨', col:'#7a6040', label:'Hindernis'},
    travelchange:{ic:'🔄', col:'#508080', label:'Reisemodus'},
    custom:{ic:'📜', col:'#c49a20', label:'Ereignis'},
  };

  window.TafelLsbConfig = {
    TRAVEL_MODES,
    ICONS,
    COLORS,
    EVENT_TYPES,
    EVENT_INFO,
    CUSTOM_SLOTS,
    getTravelMode(id){
      return TRAVEL_MODES.find(mode => mode.id === id) || TRAVEL_MODES[0];
    }
  };
})();
