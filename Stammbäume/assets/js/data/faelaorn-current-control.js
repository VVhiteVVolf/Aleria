// Aktuelle Kontrolle aus den gelieferten Karten vom 22.10.2026.
// Historische Familienprofile und ihre Lehensbindungen werden nicht umgehängt.
export const FAELAORN_CURRENT_CONTROL = Object.freeze({
  'tir-na-rann': {status:'Albische Herrschaft',occupied:false,note:'Fürstliche Kernregion um Piobarach.'},
  'tir-na-mathgham': {status:'Albische Herrschaft',occupied:false,note:'Die belegten Asylaufenthalte in Balgavrie und Caisteal Gorm bleiben von den alten Lehen getrennt.'},
  'tir-na-braigh': {status:'Albische Herrschaft',occupied:false,note:'Culloch mit den Lehen Borthwicks und Erskines; Grannd dient Erskine.'},
  'tir-na-faerna': {status:'Von Skjaerheim besetzt',occupied:true,jarltums:['bjerk'],note:'Das ehemalige Land der Herden bildet das Jarltum der Bjerk.'},
  'tir-na-brann': {status:'Von Skjaerheim besetzt',occupied:true,jarltums:['hrothgar'],note:'Das ehemalige Land der Wälle bildet das fürstliche Jarltum der Hrothgar.'},
  'tir-na-damh': {status:'Überwiegend besetzt · südliche Kriegszone',occupied:true,jarltums:['knything','stanleagh'],note:'Knything und Stanleagh teilen das besetzte Land der Haine. Der frühere Forsyth-Bereich im Süden ist als Niemandsland und Kriegszone markiert; daraus folgt keine nordische Clanzuweisung.'}
});
