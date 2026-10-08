"""Connections traced from the four Brann diagrams; gaps remain explicit."""
PLANS = {
 'wemyss': {'pairs':[
  ('0.0','0.1','10.0 10.1',{'gap':'founders'}),('10.0','11.0','20.0 20.1 20.2'),('10.1','11.1',''),
  ('20.0','21.0','30.0 30.1'),('20.1','21.1',''),('20.2','21.2','30.2'),
  ('30.0','31.0','40.0 40.1'),('30.1','31.1',''),('30.2','31.2','40.2 40.3'),
  ('40.0','41.0','50.0 50.1'),('40.1','41.1',''),('40.2','41.2','50.2 50.3'),('40.3','41.3',''),
  ('50.0','51.0','60.0 60.1 60.2'),('50.1','51.1',''),('50.2','51.2','60.3 60.4'),('50.3','51.3',''),
  ('60.0','61.0','70.0'),('60.1','61.1',''),('60.3','61.2',''),('60.4','61.3','70.1 70.2',{'type':'affair'}),('60.4','61.4','70.3 70.4',{'type':'forced'})
 ],'heads':'','note':'Eine Überlieferungslücke. Kenneths vier unbenannte Kinder bleiben eigenständige Platzhalter; zwei stammen aus der violett markierten Affäre, zwei aus der orange markierten erzwungenen Verbindung mit Lagertha Grimr.'},
 'dubglais': {'pairs':[
  ('0.0','0.1','10.0 10.1',{'gap':'founders'}),('10.0','11.0','20.0 20.1',{'gap':'mael'}),('10.1','11.1',''),
  ('20.0','21.0','30.0 30.1 30.2',{'gap':'balor'}),('20.1','21.1','',{'cadet':'haus-airdmhor','cadetHouseId':'house-airdmhor'}),
  ('30.0','31.0','40.0 40.1'),('30.1','31.1',''),('30.2','31.2','40.2'),
  ('40.0','41.0','50.0 50.1'),('40.1','41.1',''),('40.2','41.2','50.2 50.3'),
  ('50.0','51.0','60.0 60.1'),('50.1','51.1',''),('50.2','51.2','60.2 60.3'),('50.3','51.3',''),
  ('60.0','61.0','70.0 70.1'),('60.1','61.1',''),('60.2','61.2',''),('60.3','61.3','70.2 70.3'),
  ('70.0','71.0','80.0 80.1 80.2'),('70.1','71.1',''),('70.2','71.2','80.3 80.4'),('70.3','71.3',''),
  ('80.0','81.0','90.0 90.1 90.2'),('80.0','81.1','90.3 90.4 90.5'),('80.1','81.2',''),('80.2','81.3',''),('80.3','81.4',''),('80.4','81.5','90.6 90.7'),
  ('90.0','91.0','100.0 100.1 100.2'),('90.1','91.1','100.3 100.4'),('90.2','91.2',''),('90.3','91.3',''),
  ('90.4','91.4','100.5 100.6',{'type':'affair'}),('90.4','91.5','100.7',{'type':'affair'}),('90.4','91.6','100.8 100.9',{'type':'affair'}),('90.4','91.7','100.10',{'type':'forced'}),('90.6','91.8','')
 ],'heads':'','note':'Drei Überlieferungslücken; Airdmhor entspringt Faolán und Catania. Rorys drei Affären und die erzwungene Verbindung mit Lagertha Grimr wurden vom Nutzer bestätigt. Sechs fehlende Kinderjahre sind mit Zustimmung redaktionell ergänzt (Alter 6–25 im Jahr 1740). Unbenannte Personen bleiben Platzhalter. Die eigenständige Dubhan-Akte wird nicht umgedeutet.'},
 'airdmhor': {'pairs':[
  ('0.0','0.1','10.0 10.1',{'gap':'founders'}),('10.0','11.0','20.0 20.1',{'gap':'noghan'}),('10.1','11.1',''),
  ('20.0','21.0','30.0 30.1 30.2'),('20.1','21.1',''),
  ('30.0','31.0','40.0 40.1'),('30.1','31.1',''),('30.2','31.2','40.2'),
  ('40.0','41.0','50.0 50.1'),('40.1','41.1',''),('40.2','41.2','50.2 50.3'),
  ('50.0','51.0','60.0 60.1'),('50.1','51.1',''),('50.2','51.2','60.2'),('50.3','51.3',''),
  ('60.0','61.0',''),('60.1','61.1','70.0 70.1 70.2'),('60.2','61.2','70.3 70.4'),
  ('70.0','71.0','80.0'),('70.1','71.1','80.1 80.2',{'type':'affair'}),('70.3','71.2',''),('70.4','71.3','')
 ],'heads':'','note':'Zwei Überlieferungslücken; die Daten 1118–1125 liegen vor der langen Lücke und werden nicht zu unmittelbarer Elternschaft im 16. Jahrhundert umgedeutet. Tavish und Rory teilen dieselben beiden Kinder wie die Dubglais-Akte. Rothniams Lebensstatus bleibt mangels Todesmarkierung offen.'},
 'cerneige': {'pairs':[
  ('0.0','0.1','10.0 10.1',{'gap':'founders'}),('10.0','11.0','20.0 20.1 20.2 20.3'),('10.1','11.1',''),
  ('20.0','21.0','30.0 30.1'),('20.1','21.1',''),('20.2','21.2',''),('20.3','21.3','30.2 30.3'),
  ('30.0','31.0',''),('30.1','31.1','40.0 40.1'),('30.2','31.2','40.2 40.3'),('30.3','31.3',''),
  ('40.0','41.0','50.0 50.1 50.2'),('40.1','41.1',''),('40.2','41.2','50.3'),('40.3','41.3',''),
  ('50.0','51.0','60.0 60.1 60.2'),('50.1','51.1',''),('50.2','51.2',''),('50.3','51.3','60.3 60.4 60.5'),
  ('60.0','61.0','70.0'),('60.1','61.1',''),('60.3','61.2','70.1 70.2'),('60.4','61.3',''),('60.5','61.4','70.3 70.4')
 ],'heads':'','note':'Eine Überlieferungslücke. Carnegie ist die Schreibweise der neuen Grafik und der angeheirateten Personen; die vorbereitete Akten-ID Cerneige bleibt als stabile Identität erhalten. Cathbads Geburtsjahr ist laut Nutzer 1702, nicht 1672.'}
}
