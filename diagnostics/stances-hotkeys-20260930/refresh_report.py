import json,pathlib,os,re,configparser,csv,yaml
out=pathlib.Path(__file__).parent;w=json.loads((out/'winners.json').read_text());rows=[]
dx={1:'Esc',14:'Backspace',15:'Tab',28:'Enter',29:'Strg links',39:'Ö',40:'Ä',41:'^ (Taste links neben 1)',42:'Shift links',43:'#',51:',',52:'.',53:'-',54:'Shift rechts',55:'Num *',56:'Alt links',57:'Leertaste',58:'Feststelltaste',69:'Num Lock',70:'Rollen',71:'Num 7',72:'Num 8',73:'Num 9',74:'Num -',75:'Num 4',76:'Num 5',77:'Num 6',78:'Num +',79:'Num 1',80:'Num 2',81:'Num 3',82:'Num 0',83:'Num Entf',86:'<',87:'F11',88:'F12',100:'F13',101:'F14',102:'F15',156:'Num Enter',157:'Strg rechts',181:'Num /',183:'Druck',184:'Alt rechts',197:'Pause',199:'Pos1',200:'Pfeil hoch',201:'Bild hoch',203:'Pfeil links',205:'Pfeil rechts',207:'Ende',208:'Pfeil runter',209:'Bild runter',210:'Einfg',211:'Entf',256:'Maus links',257:'Maus rechts',258:'Maus Mitte',259:'Maus 4',260:'Maus 5',264:'Mausrad hoch',265:'Mausrad runter',26:'Ü',27:'+'}
for i,c in enumerate('1234567890',2):dx[i]=c
for start,letters in [(16,'QWERTZUIOP'),(30,'ASDFGHJKL'),(44,'YXCVBNM')]:
 for i,c in enumerate(letters,start):dx[i]=c
for i in range(10):dx[59+i]='F'+str(i+1)
def key(n):
 try:n=int(n,0) if isinstance(n,str) else int(n)
 except:return str(n)
 return 'Nicht belegt' if n in [-1,0,255,888,1000000] else dx.get(n,f'Code {n}')
def vk(n):
 if n==-1 or n==0:return 'Nicht belegt'
 if 112<=n<=135:return 'F'+str(n-111)
 if 48<=n<=90:return chr(n)
 if 96<=n<=105:return 'Num '+str(n-96)
 return {13:'Enter',16:'Shift',36:'Pos1',44:'Druck',46:'Entf',106:'Num *',187:'OEM_PLUS (+ bei DE)'}.get(n,f'VK {n}')
def read(rel):return pathlib.Path(w[rel][1]).read_text(encoding='utf-8-sig',errors='replace')
def add(group,k,action,mod,rel,status='Dateikonfiguration',note='',code=''):
 rows.append(dict(Bereich=group,Taste=k,Funktion=action,Mod=mod,Status=status,Hinweis=note,Quelle=w[rel][1] if rel in w else rel,Code=str(code)))
def ini(rel):
 c=configparser.ConfigParser(interpolation=None,strict=False);c.optionxform=str;c.read_string(read(rel));return c
# Explicit native hotkeys, with file-winner provenance.
for rel,section,fields,mod in [
 ('skse/plugins/tk dodge re.ini','Main',{'DodgeHotkey':'Ausweichen'},'TK Dodge RE'),
 ('skse/plugins/dualwieldparryingskse.ini','DualWieldParrying',{'ParryKey':'Blocken / Parieren'},'Dual Wield Parrying'),
 ('skse/plugins/equipmentdurability/equipmentdurability.ini','Widget',{'ToggleKeyCode':'Haltbarkeitsanzeige umschalten'},'Equipment Durability'),
 ('skse/plugins/dmenu/dmenu.ini','UI',{'key_toggle_dmenu':'dMenu öffnen'},'dMenu'),
 ('skse/plugins/playerrotation.ini','Main',{'KeyCode':'Figur im RaceMenu drehen (mit Mausbewegung)'},'Player Rotation'),
 ('skse/plugins/accurate-penetration.json','',{},'Penetration Physics')]:
 if not fields:continue
 c=ini(rel)
 for field,desc in fields.items():
  val=c.get(section,field);add('Mods',key(val),desc,mod,rel,code=val)
rel='skse/plugins/dtrykeyutil/config/custom/stances.ini';c=ini(rel)
for field,desc in [('stance_neutral','Neutral'),('stance_high','High'),('stance_mid','Mid'),('stance_low','Low')]:
 val=c.get('KeyTrace_EventID_Keyboard',field).split('|')[0];add('Stances',key(val),'Stance '+desc,'Stances / Nolvus',rel,note='High/Mid/Low benötigen passende Waffen-Perks.',code=val)
rel='skse/plugins/skyrimnet/config/hotkey.yaml'
labels={'toggleGlobalAI':'Gesamte KI umschalten','toggleGameMaster':'GameMaster umschalten','recordSpeech':'Spracheingabe / Aufnahme','textInput':'Texteingabe öffnen','voiceThought':'Gedanken per Sprache','voiceDialogueTransform':'Sprachdialog umformen','toggleContinuousMode':'Kontinuierlichen Modus umschalten','toggleWorldEventReactions':'Reaktionen auf Weltereignisse umschalten','voiceDirectInput':'Direkte Spracheingabe','continueNarration':'Erzählung fortsetzen','wheelMenu':'SkyrimNet-Radialmenü','toggleWhisperMode':'Flüstermodus','toggleOpenMic':'Offenes Mikrofon','captureCrosshair':'Ziel im Fadenkreuz erfassen','generateDiaryBio':'Tagebuch/Biografie erzeugen','interruptDialogue':'Dialog unterbrechen','toggleDashboard':'Dashboard öffnen','dialogueChoice':'Dialogauswahl'}
for field,n in yaml.safe_load(read(rel)).items():add('SkyrimNet',vk(n),labels.get(field,field),'SkyrimNet',rel,note='Windows-VK-Codes; gilt für native Hotkeys. Separater Papyrus/MCM-Modus kann abweichen.',code=n)
rel='skse/plugins/accurate-penetration.json';d=json.loads(read(rel))
for f,desc in [('PauseKey','Physik pausieren'),('ReloadKey','Einstellungen neu laden'),('SelectActorKey','Akteur auswählen')]:add('Mods',key(d[f]),desc,'Penetration Physics',rel,note='HotkeyInConsoleOnly=false; Zuordnung als SKSE-Scancode. Laufzeit nicht getestet.',code=d[f])
# MCM Helper merges defaults and settings per section/key.
mcmlabels={'iPresetKey':'OBody-Presetauswahl','icheckCumKey':'Statusanzeige','iHorse_hotkey':'Pferde-Hotkey','iAdditionalattackhotkey':'Zusatzangriff','iAltBlockKey':'Alternatives Blocken','iExecutionKey':'Execution-Hotkey','iKeycode':'Angriffstaste','iModifierKey':'Zusatztaste','uTargetLockKey':'Ziel fixieren','uSwitchTargetLeftKey':'Ziel nach links wechseln','uSwitchTargetRightKey':'Ziel nach rechts wechseln','itkQL_SetKey':'Licht umschalten','iVigSceneSkipKey':'Szene überspringen','iHotkey':'Aktivierungs-/Menütaste','iRoleSwapHotkey':'Rollenwechsel','iObjectCycleModifierKey':'Zusatztaste für Objektauswahl','iCycleUpKey':'Objektauswahl vorwärts','iCycleDownKey':'Objektauswahl rückwärts','ihcomToggleKey':'Kompass umschalten','iSearchKey':'Suche im Inventar','iSwitchTabKey':'Reiter wechseln','iEquipModeKey':'Ausrüstungsmodus','iFavoriteGroupAddKey':'Zu Favoritengruppe hinzufügen','iFavoriteGroupUseKey':'Favoritengruppe verwenden','iFavoriteSetIconKey':'Favoriten-Symbol ändern','iFavoriteEquipStateKey':'Ausrüstungszustand speichern','iFavoriteToggleFocusKey':'Favoriten-Fokus wechseln','uToggleKey':'Mod umschalten','uReloadSettingsKey':'Einstellungen neu laden','iHotkeytoToggleVisibility':'Widget ein-/ausblenden'}
for rel in sorted(w):
 if not re.match(r'mcm/config/[^/]+/settings.ini$',rel):continue
 try:base=ini(rel)
 except:continue
 name=rel.split('/')[2];override='mcm/settings/'+name+'.ini';ov=ini(override) if override in w else None
 for sec in base.sections():
  for field,v in base.items(sec):
   if not (field in mcmlabels or re.match('iFavoriteGroupUseHotkey[1-8]$',field)):continue
   source=override if ov and ov.has_option(sec,field) else rel
   if source==override:v=ov.get(sec,field)
   try:n=int(v.strip())
   except:continue
   desc=mcmlabels.get(field,'Favoritengruppe '+field[-1])
   if name=='ocpa' and field=='iKeycode':desc='Power Attack' if sec=='General' else 'Dual Attack'
   note=f'{sec}: {field}. MCM/Spielstand kann abweichen.'
   if name=='ostimfurnitureswitch' and field=='iModifierKey':note+=' Modifier derzeit deaktiviert.'
   add('MCM',key(n),desc,name,source,'MCM-Dateiwert (Spielstand offen)',note,n)
rel='skse/plugins/wheeler/controls.ini';c=ini(rel)
wl={'toggleWheel':'Rad öffnen/schließen','nextWheel':'Nächstes Rad','prevWheel':'Vorheriges Rad','nextItem':'Nächster Eintrag','prevItem':'Vorheriger Eintrag','activatePrimary':'Primär verwenden','activateSecondary':'Sekundär verwenden','addWheel':'Rad hinzufügen','addEmptyEntry':'Leeren Eintrag hinzufügen','moveEntryForward':'Eintrag vorwärts verschieben','moveEntryBack':'Eintrag rückwärts verschieben','moveWheelForward':'Rad vorwärts verschieben','moveWheelBack':'Rad rückwärts verschieben'}
for f,n in c.items('InputBindings.MKB'):add('Wheeler',key(n),wl.get(f,f),'Wheeler',rel,note='Außer Öffnen nur bei geöffnetem Rad / im passenden Bearbeitungsmodus.',code=n)
for rel,k,desc,mod,note in [
 ('skse/plugins/openanimationreplacer.ini','Shift links + O','Animationsübersicht öffnen','OAR','uToggleUIKey=24, Shift=1'),
 ('skse/plugins/immersiveequipmentdisplays.ini','F7','Ausrüstungsanzeige konfigurieren','IED','ToggleKeys=0x41; OverrideToggleKeys=false: gespeicherte UI-Einstellung hat Vorrang.'),
 ('skse/plugins/ostimprism.ini','Alt links','UI-Fokus umschalten','OStim Prism','Nur im passenden UI-Kontext.'),
 ('skse/plugins/extendedhotkeysystem.ini','Strg links + gewünschte Taste','Favoriten-Hotkey zuweisen','Extended Hotkey System','Im Favoritenmenü; konkrete Zuweisungen im Spielstand.'),
 ('skse/plugins/po3_consoleplusplus.ini','Strg links + V','In Konsole einfügen','Console++','Nur Konsole.'),
 ('skse/plugins/ssedisplaytweaks.ini','Shift links + Einfg','OSD umschalten','SSE Display Tweaks','OSD ComboKey=1, ToggleKey=0xD2'),
 ('skse/plugins/amot/usersettings.json','F11','Uhr-/Datumsanzeigen umschalten','A Matter of Time','Sechs Anzeigen verwenden denselben Hotkey; gespeicherte Einstellungen können abweichen.'),
 ('skse/plugins/nff/nff_settings.json','+ (DE; US: ])','NFF: key_togbox','Nether\'s Follower Framework','Exportierter Wert 27; andere 21 NFF-Hotkeys nicht belegt.'),
 ('source/scripts/severactions_hotkeys.psc','Shift links + 8','Konfigurationsmenü öffnen','SeverActions','Skriptvorgabe; MCM-/Spielstandwert nicht ausgelesen.'),
 ('skse/plugins/skyparkourng.ini','Spielsteuerung (Preset 0)','Parkour','Sky Parkour','bUsePresetKey=true; keine separate Taste gesetzt. Zuordnung im MCM prüfen.')]:add('Weitere Mods',k,desc,mod,rel,'Skriptvorgabe' if 'source/' in rel else 'Dateikonfiguration',note)
rel='skse/plugins/npcsnamesdistributor.ini';c=ini(rel)
for f,v in c.items('Hotkeys'):add('NPC-Namen',v,f,'NPC Names Distributor',rel,note='RCtrl=Strg rechts, RShift=Shift rechts.')
rel='skse/plugins/po3_dialoguehistory.ini'
for r in w:
 if 'dialoguehistory' in r and r.endswith('.ini'):
  c=ini(r)
  if c.has_section('Controls'):
   for f in ['iLocalHistoryKey','iGlobalHistoryKey']:
    if c.has_option('Controls',f):add('Dialog',key(c.get('Controls',f))+' + '+key(c.get('Controls',f+'Modifier')),f,'Dialogue History',r,note='Dialogverlauf; Kontextabhängig.')
# QuickLoot and additional source-defined bindings.
rel='skse/plugins/quicklootie/defaultconfig.json';d=json.loads(read(rel))
for f,desc in [('KeybindingTake','Einzelnen Gegenstand nehmen'),('KeybindingTakeAll','Alles nehmen'),('KeybindingTransfer','Inventar/Transfer ?ffnen')]:add('QuickLoot',key(d[f]),desc,'QuickLoot IE',rel,'Dateivorgabe (Spielstand offen)','Nur bei sichtbarem QuickLoot-Fenster.',d[f])
for rel,k,desc,mod in [('scripts/source/oedgemcm.psc',80,'Zusatzaktion 1 (cumKeyCode)','OEdge'),('scripts/source/oedgemcm.psc',81,'Zusatzaktion 2 (edgeKeyCode)','OEdge'),('scripts/source/odrainmcmscript.psc',37,'Mod-Aktion ausl?sen','ODrain')]:add('Weitere Skriptvorgaben',key(k),desc,mod,rel,'Skriptvorgabe (Spielstand offen)','Kann durch MCM oder JSON ?berschrieben sein.',k)
# OStim controls only: no content descriptions.
rel='interface/ostim/defaultostimmcmsettings.json';d=json.loads(read(rel))
for f,desc in [('SetControlToggle','Automatik/Steuerung umschalten'),('SetFreecamToggleKey','Freie Kamera'),('SetKeyDown','Tempo verringern'),('SetKeymap','Start-/Haupt-Hotkey'),('SetKeyUp','Tempo erhöhen'),('SetPullOut','Positionsaktion')]:add('OStim',key(d[f]),desc,'OStim',rel,'Vorgabe (Spielstand offen)','Gilt im passenden Mod-Kontext; exportierte Vorgabe.',d[f])
for k,desc in [(156,'Hauptmenü'),(72,'Menü hoch'),(76,'Menü runter'),(75,'Menü links'),(77,'Menü rechts'),(73,'Menü umschalten'),(71,'Bestätigen'),(83,'Beenden')]:add('OStim',key(k),desc,'OStim','scripts/source/osexintegrationmcm.psc','Skriptvorgabe (Spielstand offen)',code=k)
# Vanilla gameplay and every remaining menu mapping, retained separately.
rel='interface/controls/pc/controlmap.txt';context='';controls=[]
for i,line in enumerate(read(rel).splitlines(),1):
 if line.startswith('// ') and not any(s in line for s in ['field','See ','Blank','Menu",','8th','so they']):context=line[3:].strip()
 if not line.strip() or line.lstrip().startswith('//'):continue
 m=re.match(r'^(.*?)\s+(0x\S+|!\S+)\s+(\S+)\s+(\S+)\s+',line)
 if not m:continue
 action,k,mouse,pad=m.groups();kstr=key(k) if re.fullmatch('0x[0-9a-fA-F]+',k) else k
 if k=='0xff' and mouse!='0xff':
  try:kstr=key(256+int(mouse,16))
  except:pass
 if action=='Look':kstr='Mausbewegung'
 if action=='Console':kstr='^ (Taste links neben 1) / alternative Layout-Taste'
 if action=='Multi-Screenshot':kstr='Strg + Druck'
 controls.append(dict(Kontext=context,Funktion=action,Taste=kstr,Tastencode=k,Mauscode=mouse,Controllercode=pad,Quelle=w[rel][1],Zeile=i))
 if context=='Main Gameplay':add('Skyrim-Grundsteuerung',kstr,action,'Skyrim / Controlmap',rel,'Grundbelegung (Custom-Remap offen)','ControlMap_Custom.txt vorhanden; individuelle Remaps nicht dekodiert.',k)
# Graphics overlay uses VK, not SKSE scan codes.
stock=pathlib.Path(r'E:\Nolvus\Instances\Nolvus Awakening\STOCK GAME')
for filename in ['enblocal.ini','ReShade.ini']:
 c=configparser.ConfigParser(interpolation=None,strict=False);c.optionxform=str;c.read(stock/filename,encoding='utf-8-sig')
 for f,v in c.items('INPUT'):
  if not f.startswith('Key') or f=='KeyCombination':continue
  try:n=int(v.split(',')[0])
  except:continue
  if n==0:continue
  combo=vk(n)
  if filename=='enblocal.ini':combo='Shift + '+combo
  add('Grafik',combo,f,'ENB' if filename=='enblocal.ini' else 'ReShade',str(stock/filename),note='Windows-VK; ENB verwendet KeyCombination=16 (Shift).',code=n)
# Translate ordinary game/graphics functions without changing evidence.
translations={'Forward':'Vorw?rts','Back':'R?ckw?rts','Strafe Left':'Links bewegen','Strafe Right':'Rechts bewegen','Move':'Bewegung (Controller)','Look':'Umsehen','Left Attack/Block':'Linke Hand / Blocken','Right Attack/Block':'Rechte Hand / Angriff','Activate':'Aktivieren / Benutzen','Ready Weapon':'Waffe ziehen / wegstecken','Tween Menu':'Hauptauswahl ?ffnen','Toggle POV':'Perspektive wechseln','Zoom Out':'Herauszoomen','Zoom In':'Hineinzoomen','Jump':'Springen','Sprint':'Sprinten','Shout':'Schrei / Kraft','Sneak':'Schleichen','Run':'Gehen / Laufen','Toggle Always Run':'Dauerhaftes Laufen umschalten','Auto-Move':'Automatisch vorw?rts','Favorites':'Favoriten','Quicksave':'Schnellspeichern','Quickload':'Schnellladen','Wait':'Warten','Journal':'Tagebuch','Pause':'Pausemen?','Screenshot':'Screenshot','Multi-Screenshot':'Mehrfach-Screenshot','Console':'Konsole','CameraPath':'CameraPath (Controlmap-Eintrag)','Quick Inventory':'Inventar','Quick Magic':'Magie','Quick Stats':'Fertigkeiten','Quick Map':'Karte','KeyUseEffect':'ENB-Effekte umschalten','KeyFPSLimit':'FPS-Begrenzung umschalten','KeyShowFPS':'FPS anzeigen','KeyScreenshot':'Screenshot','KeyEditor':'ENB-Editor ?ffnen','KeyDof':'Tiefenunsch?rfe umschalten','KeyShowWireframe':'Drahtgitteransicht','KeyEffects':'ReShade-Effekte umschalten','KeyOverlay':'ReShade-Oberfl?che'}
for r in rows:r['Funktion']=translations.get(r['Funktion'],r['Funktion'])
# Produce machine-readable audit and readable tables.
(out/'bindings.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
for filename,data in [('Hotkeys.csv',rows),('Spiel-und-Menue-Steuerung.csv',controls)]:
 with (out/filename).open('w',encoding='utf-8-sig',newline='') as f:
  cw=csv.DictWriter(f,fieldnames=list(data[0]),delimiter=';');cw.writeheader();cw.writerows(data)
