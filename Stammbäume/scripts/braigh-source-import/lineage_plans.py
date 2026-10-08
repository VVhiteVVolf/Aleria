"""Reviewed row.column links from the four supplied Braigh genealogy tables."""
PLANS = {
 'culloch': {
  'pairs': [
   ('93.0','98.0','105.0 105.1 105.2',{'gap':'founders'}),
   ('105.0','110.0','117.0 117.1 117.2 117.3',{'gap':'darragh'}),('105.1','110.1',''),
   ('105.2','110.2','',{'cadet':'sept-dubhair','cadetHouseId':'house-sept-dubhair'}),
   ('117.0','122.0','127.0 127.1'),('117.1','122.1',''),
   ('117.2','122.2','',{'cadet':'sept-grein','cadetHouseId':'house-sept-grein'}),('117.3','122.3','127.2 127.3'),
   ('127.0','132.0','137.0 137.1 137.2 137.3'),('127.1','132.1',''),('127.2','132.2',''),('127.3','132.3','141.0 141.1'),
   ('137.0','146.0','155.0 155.1'),('137.1','146.1',''),('137.2','146.2',''),('137.3','146.3','155.2 155.3'),
   ('141.0','150.0','',{'cadet':'sept-gaesa','cadetHouseId':'house-sept-gaesa'}),('141.1','150.1','159.0 159.1'),
   ('155.0','164.0','173.0 173.1 173.2 173.3'),('155.1','164.1',''),('155.2','164.2','177.0'),('155.3','164.3',''),
   ('159.0','168.0','177.1 177.2'),('159.1','168.1',''),
   ('173.0','182.0','191.0 191.1'),('173.1','182.1',''),('173.2','182.2','191.2 191.3'),
   ('173.3','182.3','',{'cadet':'sept-malairt','cadetHouseId':'house-sept-malairt'}),
   ('177.0','186.0','195.0 195.1 195.2'),('177.1','186.1','195.3'),('177.2','186.2',''),
   ('191.0','200.0','209.0 209.1'),('191.1','200.1',''),('191.2','200.2','209.3 209.4'),('191.3','200.3',''),
   ('195.0','204.0','213.0 213.1'),('195.1','204.1',''),('195.3','204.2','213.3 213.4'),
   ('195.3','204.3','217.0 217.1',{'type':'affair'}),('209.3','222.2','',{'type':'engagement'})
  ], 'foster':[('209.2','191.0'),('213.2','195.0')],
  'heads':'93.0 105.0 117.0 127.0 137.0 155.0 173.0',
  'note':'Zwei serielle Überlieferungslücken. Dubhair, Gréin, Gaesa und Malairt werden als belegte Sept-Gründungen verlinkt; ihre unbenannten Ehepersonen bleiben unbekannt. Rónnat Lockart und Gobaith Haig sind Mündel. Die frühere ausdrückliche Nutzerkorrektur gilt weiter: Gráinne ist mit Rúairc Diuid verbunden, nicht Ronan. Wraynes Affäre und Nairns Verlobung sind eigene Beziehungstypen.'
 },
 'borthwick': {
  'pairs': [
   ('86.0','91.0','98.0 98.1',{'gap':'founders'}),('98.0','103.0','108.0 108.1 108.2'),('98.1','103.1',''),
   ('108.0','113.0','118.0 118.1'),('108.1','113.1',''),('108.2','113.2','118.2'),
   ('118.0','123.0','128.0 128.1'),('118.1','123.1',''),('118.2','123.2','128.2 128.3'),
   ('128.0','133.0','138.0 138.1 138.2'),('128.1','133.1',''),('128.2','133.2','138.3 138.4'),('128.3','133.3',''),
   ('138.0','143.0','148.0 148.1 148.2'),('138.1','143.1',''),('138.2','143.2','148.3'),('138.4','143.4','152.0 152.1'),
   ('148.0','157.0','166.0 166.1'),('148.2','157.1',''),('148.3','157.2','166.3 166.4'),('148.3','157.3','170.0 170.1',{'type':'affair'}),
   ('152.0','161.0','170.2 170.3 170.4'),('152.1','161.1','')
  ], 'foster':[('166.2','148.0')], 'heads':'86.0 98.0 108.0 108.2 118.0 118.2 128.0',
  'note':'Eine serielle Überlieferungslücke. Die unbeschriftete zweite Kinderüberschrift gehört zur fortgeführten Donnacha/Dechtire-Linie; die Gegenakte belegt Eilidhs Ehe bei Culloch. Keilons unbenannte Partnerkarte bleibt offen. Fiadh Haig ist Donnachas Mündel. Nechtans Affäre mit Kunigunde Falkert und deren Kinder bleiben von seiner Ehe getrennt. Amtszeiten werden nicht als Geburtsdaten verwendet.'
 },
 'erskine': {
  'pairs': [
   ('83.0','88.0','95.0 95.1',{'gap':'founders'}),('95.0','100.0','105.0 105.1 105.2'),('95.1','100.1',''),
   ('105.0','110.0','115.0 115.1'),('105.1','110.1',''),('105.2','110.2','115.2'),
   ('115.0','120.0','125.0 125.1 125.2'),('115.1','120.1',''),('115.2','120.2','125.3 125.4'),
   ('125.0','130.0','135.0 135.1'),('125.1','130.1',''),('125.2','130.2','135.2 135.3'),('125.3','130.3','135.4'),('125.4','130.4',''),
   ('135.0','140.0','145.0 145.1 145.2'),('135.1','140.1',''),('135.2','140.2','145.3 145.4'),('135.3','140.3',''),('135.4','140.4','149.0 149.1'),
   ('145.0','154.0','163.0 163.1'),('145.2','154.1','163.3 163.4'),('145.4','154.2','167.0 167.1 167.2'),('149.0','158.0','167.3'),('149.1','158.1','')
  ], 'foster':[('163.2','145.0')], 'heads':'83.0 95.0 115.0 135.0',
  'note':'Eine serielle Überlieferungslücke. Íosán Cadhla ist Laisréns Mündel. Eindeutige Gegenehen verbinden Culloch, Borthwick und Grannd; zusätzliche Elternschaften werden aus den wegverheirateten Partnerzeilen nicht erfunden. Die Amtsliste nennt nicht jede biologische Generation als Oberhaupt.'
 },
 'grannd': {
  'pairs': [
   ('86.0','91.0','98.0 98.1 98.2',{'gap':'founders'}),('98.0','103.0','108.0 108.1'),('98.1','103.1',''),('98.2','103.2','108.2'),
   ('108.0','113.0','118.0 118.1'),('108.1','113.1',''),('108.2','113.2','118.2 118.3'),
   ('118.0','123.0','128.0 128.1'),('118.1','123.1',''),('118.2','123.2','128.2'),('118.3','123.3',''),
   ('128.0','133.0','138.0 138.1'),('128.1','133.1',''),('128.2','133.2','138.2 138.3'),
   ('138.0','143.0','148.0 148.1 148.2'),('138.1','143.1',''),('138.2','143.2','148.3'),('138.3','143.3',''),
   ('148.0','153.0','158.0 158.1 158.2'),('148.1','153.1',''),('148.3','153.2','158.3 158.4'),
   ('148.3','153.3','162.0 162.1 162.2 162.3 162.4',{'type':'affair'})
  ], 'heads':'86.0 98.0 108.0 118.0 128.0 138.0',
  'note':'Eine serielle Überlieferungslücke. Bearnárd und Seonaid sind trotz der gegen seinen Willen arrangierten Ehe ein Ehepaar; deren Kinder sind ehelich. Svanhilds fünf Kinder gehören zur Affäre. Seonaids frühere Rolle als Mündel des damaligen Oberhauptes bleibt als Quellenhinweis erhalten; die unbenannte frühere Vormundsperson wird nicht geraten.'
 }
}
