"""Reviewed connections traced from the seven Damh diagrams.

An absent continuation means marriage into the shown counterpart house, not an
invented missing generation. Dotted connectors are explicit transmission gaps.
"""
PLANS = {
 'eoghainn': {
  'pairs': [
   ('0.0','0.1','10.0 10.1',{'gap':'founders'}),
   ('10.0','11.0','20.0 20.1',{'gap':'muiredach'}),('10.1','11.1',''),
   ('20.0','21.0','',{'cadet':'haus-agnew','cadetHouseId':'house-agnew'}),('20.1','21.1','30.0 30.1',{'gap':'kadhghan'}),
   ('30.0','31.0','40.0 40.1 40.2 40.3 40.4',{'gap':'ronan'}),('30.1','31.1','',{'cadet':'haus-elid','cadetHouseId':'house-elid'}),
   ('40.0','41.0','50.0 50.1 50.2'),('40.1','41.1',''),('40.2','41.2',''),('40.3','41.3','50.3 50.4'),('40.4','41.4',''),
   ('50.0','51.0','60.0 60.1'),('50.1','51.1',''),('50.2','51.2','60.2'),('50.3','51.3',''),('50.4','51.4','60.3 60.4'),
   ('60.0','61.0','70.0 70.1'),('60.1','61.1',''),('60.2','61.2','70.2 70.3'),('60.3','61.3','70.4 70.5'),('60.4','61.4',''),
   ('70.0','71.0','80.0 80.1'),('70.1','71.1',''),('70.2','71.2','80.2 80.3'),('70.4','71.3',''),('70.5','71.4','80.4 80.5 80.6'),
   ('80.0','81.0',''),('80.1','81.1','90.0 90.1 90.2'),('80.2','81.2','90.3'),('80.3','81.3',''),('80.4','81.4','90.4 90.5 90.6'),('80.5','81.5',''),('80.6','81.6','90.7 90.8'),
   ('90.0','91.0','100.0'),('90.1','91.1',''),('90.2','91.2','',{'type':'forced'}),('90.3','91.3',''),('90.4','91.4','100.1 100.2 100.3'),('90.6','91.5','100.4 100.5'),('90.8','91.6','100.6 100.7')
  ],'heads':'','wards':[('100.3','haus-laga','house-laga'),('100.7','haus-ceallaigh','house-ceallaigh')],
  'note':'Vier serielle Überlieferungslücken. Agnew und Elid gehen in den Grafiken aus Eoghainn-Verbindungen hervor; dies ändert keine territoriale Lehensordnung. Cailte–Ealar ist laut Nutzer erzwungen. Zwei unbenannte Kinder und zwei fortgegebene Mündel bleiben erkennbar.'
 },
 'agnew': {
  'pairs': [
   ('0.0','0.1','10.0 10.1',{'gap':'founders'}),('10.0','11.0','20.0 20.1'),('10.1','11.1',''),
   ('20.0','21.0',''),('20.1','21.1','30.0 30.1 30.2'),
   ('30.0','31.0','40.0 40.1'),('30.1','31.1',''),('30.2','31.2','40.2 40.3'),
   ('40.0','41.0','50.0 50.1'),('40.1','41.1','50.2 50.3'),('40.3','41.2','50.4'),
   ('50.0','51.0',''),('50.1','51.1','60.0 60.1'),('50.2','51.2','60.2'),('50.3','51.3',''),('50.4','51.4','60.3 60.4'),
   ('60.0','61.0','70.0',{'type':'affair'}),('60.0','61.1','70.1'),('60.2','61.2','70.2 70.3 70.4'),('60.3','61.3','')
  ],'heads':'','wards':[('70.2','haus-luthsach','house-luthsach'),('70.3','haus-kerlaouen','house-kerlaouen'),('70.4','haus-marcaigh','house-marcaigh')],
  'note':'Eine Überlieferungslücke. Die dritte Generation stammt nach den gezeichneten Linien von Loinneog und Zachair ab. Die drei jüngsten Geburtsjahre wurden vom Nutzer auf 1723, 1728 und 1730 berichtigt; Eanbharr Eoghainn wurde 1653 geboren. Kester stammt aus Quíghleanns Affäre mit Earc, Pádraig aus der Ehe mit Beacan.'
 },
 'dianaomh': {
  'pairs': [
   ('0.0','0.1','10.0 10.1',{'gap':'founders'}),('10.0','11.0','20.0 20.1 20.2'),('10.1','11.1',''),
   ('20.0','21.0','30.0 30.1'),('20.1','21.1',''),('20.2','21.2','30.2'),
   ('30.0','31.0','40.0 40.1'),('30.1','31.1',''),('30.2','31.2','40.2 40.3'),
   ('40.0','41.0',''),('40.1','41.1','50.0 50.1 50.2'),('40.2','41.2',''),('40.3','41.3','50.3'),
   ('50.0','51.0','60.0 60.1 60.2 60.3'),('50.1','51.1',''),('50.2','51.2','60.4'),
   ('60.0','61.0','70.0'),('60.1','61.1',''),('60.2','61.2',''),('60.4','61.3','')
  ],'heads':'','note':'Eine Überlieferungslücke. Todeskreuze werden ohne erfundene Todesjahre übernommen. Ailis (*1680) und Ailís (*1698) sind zwei verschiedene Personen. Die Herkunft Vathnas bleibt offen.'
 },
 'dobhar': {
  'pairs': [
   ('0.0','0.1','10.0 10.1 10.2',{'gap':'founders'}),('10.0','11.0','20.0 20.1'),('10.1','11.1',''),('10.2','11.2','20.2'),
   ('20.0','21.0','30.0 30.1 30.2'),('20.1','21.1',''),('20.2','21.2','30.3',{'type':'affair'}),('20.2','21.3','30.4'),
   ('30.0','31.0','40.0 40.1'),('30.1','31.1',''),('30.2','31.2','40.2'),('30.4','31.3',''),
   ('40.0','41.0','50.0 50.1'),('40.1','41.1',''),('40.2','41.2','50.2 50.3'),
   ('50.0','51.0','60.0 60.1'),('50.1','51.1',''),('50.2','51.2','60.2 60.3'),('50.3','51.3',''),
   ('60.0','61.0','70.0 70.1'),('60.1','61.1',''),('60.2','61.2','70.2'),('60.3','61.3','')
  ],'heads':'','note':'Eine Überlieferungslücke. Steinar ist Kind der Affäre Janneth–Ingebörg; Pallaigh stammt aus Janneths Ehe mit Íosag. Die unbenannten Herkunftshäuser von Ingebörg, Íosag und Ealar bleiben offen. Todeskreuze allein belegen kein Aussterben des Hauses.'
 },
 'forsyth': {
  'pairs': [
   ('0.0','0.1','10.0 10.1',{'gap':'founders'}),('10.0','11.0','20.0 20.1 20.2'),('10.1','11.1',''),
   ('20.0','21.0','30.0 30.1'),('20.1','21.1',''),('20.2','21.2','30.2'),
   ('30.0','31.0','40.0 40.1'),('30.1','31.1',''),('30.2','31.2','40.2 40.3'),
   ('40.0','41.0','50.0 50.1 50.2'),('40.1','41.1',''),('40.2','41.2',''),('40.3','41.3','50.3 50.4'),
   ('50.0','51.0','60.0 60.1 60.2 60.3 60.4 60.5 60.6 60.7 60.8'),('50.1','51.1',''),('50.2','51.2',''),('50.3','51.3',''),('50.4','51.4','60.9 60.10'),
   ('60.0','61.0','70.0 70.1 70.2'),('60.2','61.1',''),('60.3','61.2','70.3 70.4'),('60.5','61.3','70.5 70.6'),('60.6','61.4','70.7',{'type':'forced'}),('60.8','61.5','70.8 70.9'),('60.9','61.6','70.10')
  ],'heads':'','wards':[(c,'haus-dyfrgi','house-dyfrgi') for c in ['70.2','70.4','70.6','70.8','70.9']],
  'note':'Eine Überlieferungslücke. Die nun vorliegende Forsyth-Grafik ersetzt die bisherige offene Vorbereitung. Iarbhine wurde laut Nutzer 1665 geboren. Vadria–Bjørn ist eine erzwungene Verbindung; Poilín ihr uneheliches Kind. Conaings Eheperson und Argyles jüngstes Geburtsjahr bleiben offen. Fünf Kinder sind als Mündel an Dwrgi gegeben.'
 },
 'elid': {
  'pairs': [
   ('0.0','0.1','10.0 10.1',{'gap':'founders'}),('10.0','11.0','20.0 20.1'),('10.1','11.1',''),
   ('20.0','21.0','30.0 30.1 30.2'),('20.1','21.1',''),
   ('30.0','31.0','40.0 40.1'),('30.1','31.1',''),('30.2','31.2','40.2'),('30.2','31.3','40.3',{'type':'affair'}),
   ('40.0','41.0',''),('40.1','41.1','50.0 50.1'),('40.2','41.2','50.2'),('40.3','41.3','50.3'),
   ('50.0','51.0','60.0 60.1 60.2'),('50.1','51.1',''),('50.2','51.2',''),('50.3','51.3','60.3 60.4'),
   ('60.0','61.0','70.0'),('60.1','61.1',''),('60.3','61.2','70.2 70.3 70.4'),('60.4','61.3','')
  ],'heads':'','foster':[('70.1','60.0'),('70.1','61.0')],
  'note':'Eine Überlieferungslücke. Vardán (*1716) und Mündel Uisigh Avernax (*1717) sind laut Nutzer korrigiert. Uisighs Pflegebeziehung begründet keine biologische Elternschaft. Wrayne stammt aus Xubhnáns Affäre mit Quaira. Die graue Nebenlinie wird über die sichtbaren Elternpaare weitergeführt; ihre unbenannten Ehepersonen bleiben Platzhalter.'
 },
 'oglivy': {
  'pairs': [
   ('0.0','0.1','10.0 10.1',{'gap':'founders'}),('10.0','11.0','20.0 20.1',{'gap':'eadbhard'}),('10.1','11.1',''),
   ('20.0','21.0','30.0 30.1 30.2'),('20.1','21.1',''),
   ('30.0','31.0','40.0 40.1'),('30.1','31.1',''),('30.2','31.2','40.2'),
   ('40.0','41.0','50.0 50.1'),('40.1','41.1',''),('40.2','41.2','50.2 50.3'),
   ('50.0','51.0','60.0 60.1'),('50.1','51.1',''),('50.2','51.2','60.2 60.3'),('50.3','51.3',''),
   ('60.0','61.0','70.0 70.1'),('60.1','61.1',''),('60.2','61.2','70.2 70.3'),('60.3','61.3',''),
   ('70.0','71.0','80.0 80.1 80.2'),('70.1','71.1',''),('70.2','71.2','80.3 80.4'),('70.3','71.3',''),
   ('80.0','81.0','90.0 90.1'),('80.1','81.1',''),('80.2','81.2','90.2',{'type':'forced'}),('80.3','81.3','90.3'),('80.3','81.4','90.4',{'type':'affair'}),('80.4','81.5','')
  ],'heads':'','wards':[('90.1','haus-tauwind','house-tauwind')],
  'note':'Zwei serielle Überlieferungslücken. Heulyn–Kjartan ist laut Nutzer erzwungen; Skjell stammt aus dieser Verbindung. Jowans Ehe mit Pallaigh und Affäre mit Inga bleiben getrennt. Hedda ist als Mündel an Tauwind gegeben. Herkunft unbekannter Partner und nicht angegebene Jahre werden nicht erfunden.'
 }
}
