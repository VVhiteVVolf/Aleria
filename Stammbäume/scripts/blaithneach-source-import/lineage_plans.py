"""Reviewed table row.column coordinates, cross-checked against all nine graphics.

Punctuation gaps represent unrecorded generations, never invented direct parents.
Blue cards with a foreign crest are outgoing wards; incoming wards are separate.
"""

PLANS = {
 'ronain': {
  'pairs': [
   ('89.0','94.0','101.0 101.1',{'gap':'founders'}),
   ('101.0','106.0','113.0 113.1 113.2',{'gap':'artair'}),('101.1','106.1',''),
   ('113.0','118.0',''),('113.1','118.1','125.0 125.1 125.2',{'gap':'cailte'}),('113.2','118.2','',{'cadet':'haus-suiste'}),
   ('125.0','130.0',''),('125.1','130.1','137.0 137.1',{'gap':'fergusin'}),('125.2','130.2','',{'cadet':'haus-eala'}),
   ('137.0','142.0','147.0'),('137.1','142.1','147.1',{'type':'engagement','legitimacy':'illegitimate'}),
   ('147.0','152.0','159.0 159.1',{'gap':'caiden'}),('147.1','152.1','',{'cadet':'haus-gairner'}),
   ('159.0','164.0',''),('159.1','164.1','169.0 169.1 169.2 169.3'),
   ('169.0','174.0','179.0'),('169.1','174.1',''),('169.2','174.2','179.1'),('169.3','174.3',''),
   ('179.0','184.0','189.0 189.1'),('179.1','184.1','189.2 189.3'),
   ('189.0','194.0','199.0 199.1 199.2'),('189.1','194.1',''),('189.2','194.2',''),('189.3','194.3','199.3 199.4'),
   ('199.0','204.0','209.0 209.1 209.2'),('199.1','204.1',''),('199.2','204.2',''),('199.3','204.3','213.0 213.1 213.2 213.3'),('199.4','204.4',''),
   ('209.0','218.0','227.0 227.1 227.2'),('209.1','218.1','227.3 227.4'),('209.2','218.2','231.0 231.1'),
   ('213.0','222.0',''),('213.1','222.1','231.3 231.4'),('213.3','222.2','235.0 235.1'),('213.3','222.3','235.2',{'type':'affair'})
  ],
  'foster':[('231.2','209.2')], 'wards':[('227.4','haus-laga','house-laga')],
  'heads':'89.0 101.0 113.1 125.1 137.0 147.0 159.1 169.0 179.0 189.0 199.0 209.1 209.2',
  'note':'Fünf serielle Überlieferungslücken. Suiste und Eala stammen von Diarmadas und Lùcasach ab. Gáirnér wurde durch Goraidhs unehelichen Sohn Sìmag gegründet; Goraidh und Moiraith waren verlobt. Artair (1721) wurde nach dem Tod seines Vaters Caiden geboren und ist Mündel bei Laga. Ròislaith Cétchathach ist Caíltes aufgenommenes Mündel.'
 },
 'nessa': {
  'pairs': [
   ('86.0','91.0','98.0 98.1',{'gap':'founders'}),('98.0','103.0','110.0 110.1 110.2',{'gap':'kadhghan'}),('98.1','103.1','',{'cadet':'haus-goidin'}),
   ('110.0','115.0','120.0 120.1'),('110.1','115.1',''),('110.2','115.2','120.2 120.3'),
   ('120.0','125.0',''),('120.1','125.1','130.0 130.1 130.2'),('120.2','125.2',''),('120.3','125.3','130.3'),
   ('130.0','135.0','140.0 140.1'),('130.1','135.1',''),('130.2','135.2','',{'type':'engagement'}),('130.3','135.3','140.2 140.3'),
   ('140.0','145.0','150.0 150.1 150.2 150.3'),('140.1','145.1',''),('140.2','145.2',''),('140.3','145.3','154.0 154.1'),
   ('150.0','159.0','164.0 164.1 164.2 164.3 164.4'),('150.1','159.1',''),('150.3','159.2','168.0 168.1'),('154.0','159.3',''),('154.1','159.4','168.2 168.3 168.4'),
   ('164.0','173.0','182.0 182.1 182.2 182.3 182.4'),('164.2','173.1',''),('164.3','173.2','186.1 186.2 186.3'),('164.4','173.3',''),
   ('168.0','177.0','',{'type':'engagement'}),('168.1','177.1','190.0 190.1',{'type':'forced'}),('168.2','177.2','190.2 190.3'),('168.4','177.3','')
  ],
  'foster':[('186.0','164.0'),('186.4','164.3')], 'wards':[('182.4','haus-ceallaigh','house-ceallaigh'),('186.3','haus-airgid','house-airgid')],
  'heads':'86.0 98.0 110.0 120.1 130.0 140.0 150.0',
  'note':'Zwei serielle Überlieferungslücken. Goidin ist Bairrfhionns Kadettenhaus. Jathán und Rabhla sind an Ceallaigh und Airgid vermittelte Mündel. Ainean Durthacht und Cailean Conchobhair sind aufgenommene Mündel. Aingeals Zwillinge stammen aus der ausdrücklich erzwungenen Verbindung mit Koarnach; keine Affäre. Murchadhs Todesjahr folgt seiner Herkunftstabelle (1671 statt 1644 in Cléirigh).'
 },
 'magach': {
  'pairs': [
   ('86.0','91.0','97.0 97.1 97.2',{'gap':'founders'}),('97.0','102.0',''),('97.1','102.1','109.0 109.1',{'gap':'iainbheag'}),('97.2','102.2',''),
   ('109.0','114.0','119.0 119.1 119.2 119.3 119.4'),('109.1','114.1',''),
   ('119.0','124.0','129.0 129.1 129.2'),('119.2','124.1',''),('119.4','124.2','129.3 129.4'),
   ('129.0','134.0','139.0 139.1'),('129.1','134.1',''),('129.2','134.2','139.2 139.3'),('129.3','134.3',''),('129.4','134.4','143.0 143.1'),
   ('139.0','148.0','153.0 153.1'),('139.1','148.1',''),('139.2','148.2','153.2 153.3'),('143.0','148.3',''),('143.1','148.4','157.0 157.1'),
   ('153.0','162.0','171.0 171.1 171.2'),('153.1','162.1',''),('153.2','162.2','171.3 171.4'),('153.3','162.3',''),
   ('157.0','166.0','175.0 175.1 175.2 175.3'),('157.1','166.1',''),
   ('171.0','180.0','189.0 189.1 189.2 189.3'),('171.1','180.1',''),('171.3','180.2',''),
   ('171.4','180.3','193.0',{'type':'engagement','legitimacy':'illegitimate'}),('171.4','184.0','',{'type':'forced'}),
   ('175.0','184.1','193.1 193.2 193.3 193.4'),('175.1','184.2',''),('175.3','184.3',''),('193.1','198.2','',{'type':'engagement'})
  ],
  'foster':[('189.4','171.0')], 'wards':[('193.3','haus-luga','house-luga')],
  'heads':'86.0 97.1 109.0 119.0 129.0 139.0',
  'note':'Zwei serielle Überlieferungslücken. Dympna ist laut Grafik und Biografie Samthanns und Fergus Nessas uneheliches Kind. Ionnrachtaighs erzwungene Verbindung ist davon getrennt und begründet keine Elternschaft. Ráithín Gaelach ist Ninnidhs Mündel; Máirín ist an Luga vermittelt. Für Aindí Ailella ist bislang nur die abgebende Akte belegt; kein bestimmter Magach-Vormund wird erfunden.'
 },
 'suiste': {
  'pairs': [
   ('86.0','91.0','98.0 98.1',{'gap':'founders'}),('98.0','103.0','110.0 110.1',{'gap':'fachtna'}),('98.1','103.1',''),
   ('110.0','115.0',''),('110.1','115.1','120.0 120.1 120.2'),
   ('120.0','125.0','130.0 130.1 130.2'),('120.1','125.1',''),('120.2','125.2','130.3'),
   ('130.0','135.0',''),('130.1','135.1','140.0 140.1 140.2'),('130.2','135.2',''),
   ('140.0','145.0','150.0 150.1'),('140.1','145.1',''),('140.2','145.2','150.2 150.3'),
   ('150.0','155.0','160.0 160.1 160.2 160.3'),('150.1','155.1',''),('150.2','155.2','160.4'),('150.3','155.3',''),
   ('160.0','165.0','170.0 170.1'),('160.1','165.1',''),('160.3','165.2','170.3 170.4'),('160.4','165.3','174.0 174.1')
  ],
  'foster':[('170.2','160.0')],
  'heads':'86.0 98.0 110.1 120.0 130.1 140.0 150.0',
  'note':'Diarmadas Ronain begründet Suiste. Zwei serielle Überlieferungslücken. Oiric ist laut vier Spalten breiter Elternüberschrift und Grafik Maoldònaichs und Sileachs Kind; Simeon ist Quinnans und Bridachachs Kind. Tòmas Gaisgh ist Slaugháns Mündel.'
 },
 'gairner': {
  'pairs': [
   ('86.0','91.0','96.0',{'type':'engagement','legitimacy':'illegitimate'}),('96.0','101.0','108.0 108.1 108.2',{'gap':'founders'}),
   ('108.1','113.0','118.0 118.1'),('108.2','113.1',''),
   ('118.0','123.0','128.0 128.1'),('118.1','123.1',''),('128.0','133.0','138.0 138.1 138.2'),('128.1','133.1',''),
   ('138.0','143.0','148.0 148.1'),('138.1','143.1',''),('138.2','143.2','148.2 148.3'),
   ('148.0','153.0','158.0 158.1 158.2'),('148.1','153.1',''),('148.2','153.2',''),('148.3','153.3','158.3 158.4'),
   ('158.0','163.0','168.0 168.1'),('158.2','163.1','168.2 168.3'),('158.3','163.2',''),('158.4','163.3','')
  ],
  'heads':'96.0 108.1 118.0 128.0 138.0 148.0',
  'note':'Der Hausgründer ist Sìmag, nicht sein zuvor verstorbener Vater Goraidh Ronain. Die Verlobung Goraidhs und Moiraiths und Sìmags uneheliche Abstammung folgen beiden Grafiken und Ronains Biografie. Eine serielle Überlieferungslücke nach dem Gründerpaar.'
 },
 'goidin': {
  'pairs': [
   ('83.0','88.0','95.0 95.1 95.2',{'gap':'founders'}),('95.0','100.0','105.0'),('95.1','100.1',''),('95.2','100.2','105.1 105.2'),
   ('105.1','110.0',''),('105.2','110.1','115.0 115.1 115.2'),('115.0','120.0','125.0 125.1'),('115.2','120.1','125.2 125.3'),
   ('125.0','130.0','135.0 135.1 135.2 135.3 135.4'),('125.1','130.1',''),('125.3','130.2',''),
   ('135.0','140.0','145.0 145.1 145.2'),('135.1','140.1',''),('135.3','140.2',''),('135.4','140.3','145.3 145.4')
  ],
  'heads':'83.0 95.2 105.2 115.0 125.0',
  'note':'Bairrfhionn Nessa begründet Goidin. Eine serielle Überlieferungslücke. Die Druiden bestimmen die Nachfolge; Meabh ist die benannte Erbin. Kopierte Elternüberschriften werden nach Grafik berichtigt: Fearghal–Caoimheas und Amlaibh–Eideard. Súlach (1696) ist in der Tabelle lebend, in der Grafik mit Todeszeichen; das Datum bleibt ungeklärt und die tabellarische Lebensangabe erhalten.'
 },
 'eala': {
  'pairs': [
   ('83.0','88.0','95.0 95.1 95.2',{'gap':'founders'}),('95.0','100.0','105.0 105.1'),('95.1','100.1',''),('95.2','100.2','105.2 105.3'),
   ('105.1','110.0','115.0 115.1 115.2'),('105.2','110.1',''),('105.3','110.2','115.3'),
   ('115.0','120.0','125.0 125.1'),('115.1','120.1',''),('115.2','120.2','125.2 125.3'),('115.3','120.3',''),
   ('125.0','130.0','135.0 135.1 135.2'),('125.1','130.1',''),('125.2','130.2',''),('125.3','130.3','135.3'),
   ('135.0','140.0','145.0 145.1 145.2'),('135.1','140.1',''),('135.2','140.2','145.3 145.4'),('135.3','140.3','149.0 149.1'),('135.3','140.4','149.2',{'type':'affair'})
  ],
  'wards':[('145.1','haus-ruin-ua-laoch','house-laoch')],
  'heads':'83.0 95.0 105.1 115.0 125.0',
  'note':'Lùcasach Ronain begründet Eala. Eine serielle Überlieferungslücke. Cathalag gehört laut Elternspalten und Grafik zu Fionnlagh–Aingeal; Peigas zu Raghnallóg–Maighread. Mórag ist als Mündel an Laoch vermittelt. Ottilde ist eine Bardin aus Mathringen; daraus wird kein Herkunftshaus abgeleitet.'
 },
 'haeghra': {
  'pairs': [
   ('86.0','91.0','98.0 98.1',{'gap':'founders'}),('98.0','103.0','110.0 110.1',{'gap':'muiredach'}),('98.1','103.1',''),
   ('110.0','115.0',''),('110.1','115.1','120.0 120.1 120.2'),
   ('120.0','125.0','130.0 130.1'),('120.1','125.1',''),('120.2','125.2','130.2 130.3'),
   ('130.0','135.0','140.0 140.1 140.2 140.3'),('130.1','135.1',''),('130.2','135.2',''),('130.3','135.3','144.0 144.1'),
   ('140.0','149.0','154.0 154.1'),('140.1','149.1',''),('140.3','149.2','154.2 154.3'),('144.0','149.3',''),('144.1','149.4','158.0 158.1'),
   ('154.0','163.0','172.0 172.2'),('154.1','163.1','',{'type':'engagement'}),('154.1','163.2',''),('154.2','163.3','172.3 172.4'),('154.3','163.4',''),
   ('158.0','167.0','176.0 176.1'),('158.0','167.1','176.2',{'type':'affair'}),('158.1','167.2',''),
   ('172.0','181.0',''),('172.2','181.2','',{'type':'engagement'})
  ],
  'foster':[('172.1','154.0')],
  'heads':'86.0 98.0 110.1 120.0 130.0 140.0',
  'note':'Zwei serielle Überlieferungslücken. Heaghra ist eine belegte Schreibvariante von Haeghra; vorhandene Personen- und Welt-IDs bleiben erhalten. Liúsaidh war vor ihrer Ehe mit Goirtín mit dem 1720 verstorbenen Jarlaith Roth verlobt. Ideas Tiran Treathai ist Déagláns Mündel; Seamus und Sionna Luga sind verlobt.'
 },
 'cleirigh': {
  'pairs': [
   ('83.0','88.0','95.0 95.1',{'gap':'founders'}),('95.0','100.0','105.0 105.1 105.2 105.3 105.4'),('95.1','100.1',''),
   ('105.0','110.0','115.0 115.1 115.2'),('105.1','110.1',''),('105.3','110.2',''),('105.4','110.3','115.3 115.4'),
   ('115.0','120.0','125.0 125.1'),('115.1','120.1',''),('115.2','120.2','125.2'),('115.3','120.3',''),('115.4','120.4','125.3 125.4'),
   ('125.0','130.0','135.0 135.1'),('125.1','130.1',''),('125.2','130.2','135.2 135.3'),('125.3','130.3','139.0 139.1'),('125.4','130.4',''),
   ('135.0','144.0',''),('135.1','144.1','153.0 153.1'),('135.2','144.2',''),('135.3','144.3',''),
   ('139.0','148.0','153.2 153.3 153.4'),('139.1','148.1',''),
   ('153.0','158.0','163.0 163.1'),('153.1','158.1',''),('153.2','158.2','163.3 163.4'),('153.3','158.3',''),('153.4','158.4','167.0 167.1'),
   ('163.0','172.0','',{'type':'engagement','reusePairId':'marriage-gaothaire-cleirigh--grian-1700-rochraide'}),('163.1','172.1','',{'type':'engagement','reusePairId':'marriage-onuist-cleirigh--ziocha-1703-eldath'}),('163.3','172.2','',{'type':'engagement','reusePairId':'marriage-doileag-1699-ceinselaig--pailtear-cleirigh'}),('163.4','172.3','',{'type':'engagement','reusePairId':'engagement-grian-cleirigh--peathgho-1700-tordarroch'}),
   ('167.0','176.0','',{'type':'engagement','reusePairId':'engagement-padraig-cleirigh--quibhna-1698-holloran'}),('167.1','176.1','',{'type':'engagement','reusePairId':'engagement-cuilinn-cleirigh--saoirseas-1702-mochoe'})
  ],
  'heads':'83.0 95.0 105.0 125.0 105.2',
  'note':'Eine serielle Überlieferungslücke. Cléirigh bleibt nach Nutzerfestlegung ausgestoßen, nicht ausgestorben. Xorán und Caoimheas sind laut Tabelle und Grafik Kinder Uilleams und Nigheans. Caoimheas’ Partner heißt in Tabelle und Goidin-Akte Fearghal, nicht Amlaibh wie in der Cléirigh-Grafik. Xorán wird laut Biografie nur für tot gehalten; das tabellarische Todesjahr 1720 ist keine Gewissheit über seinen Verbleib. Pailtéar und Morrigan werden weiterhin lebend geführt.'
 }
}
