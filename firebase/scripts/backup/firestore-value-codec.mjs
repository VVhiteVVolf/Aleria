// Convert exported REST values for the existing scene JSON format. The private
// project archive always keeps the untouched REST representation instead.
export function decodeFirestoreValue(value) {
  if ('nullValue' in value) return null;
  if ('stringValue' in value) return value.stringValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) {
    const number = Number(value.integerValue);
    return Number.isSafeInteger(number) ? number : value.integerValue;
  }
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('timestampValue' in value) {
    const match = value.timestampValue.match(/\.(\d+)Z$/);
    return { seconds: Math.floor(Date.parse(value.timestampValue) / 1000), nanoseconds: Number((match?.[1] || '').padEnd(9, '0')) };
  }
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decodeFirestoreValue);
  if ('mapValue' in value) return decodeFirestoreFields(value.mapValue.fields || {});
  if ('referenceValue' in value) return value.referenceValue;
  if ('bytesValue' in value) return value.bytesValue;
  if ('geoPointValue' in value) return value.geoPointValue;
  throw new Error('Unbekannter Firestore-Wert im Szenenexport.');
}
export function decodeFirestoreFields(fields) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decodeFirestoreValue(value)]));
}

// New authored JSON only. Existing REST fields must never pass through this
// encoder: timestamps, references and byte values keep their original types.
export function encodeFirestoreValue(input) {
  if(input===null) return {nullValue:null};
  if(Array.isArray(input)) return {arrayValue:{values:input.map(encodeFirestoreValue)}};
  if(typeof input==='object') return {mapValue:{fields:encodeFirestoreFields(input)}};
  if(typeof input==='boolean') return {booleanValue:input};
  if(typeof input==='string') return {stringValue:input};
  if(typeof input==='number' && Number.isFinite(input)) return Number.isInteger(input)?{integerValue:String(input)}:{doubleValue:input};
  throw new Error('Nicht unterstützter neuer Firestore-Wert.');
}
export function encodeFirestoreFields(input) {
  return Object.fromEntries(Object.entries(input).map(([key,value])=>[key,encodeFirestoreValue(value)]));
}
