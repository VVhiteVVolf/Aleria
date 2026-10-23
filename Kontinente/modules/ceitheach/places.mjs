import markers from '../../../Karten/Ceitheach/markers.source.json' with {type:'json'};
import {describePlace} from '../../../Karten/Ceitheach/places.mjs';
import {createPlaceRegister} from '../../../Karten/modules/territory-places/place-catalog.mjs';
const byId=new Map(markers.markers.map(m=>[m.id,m]));
export const placesById=new Map([...createPlaceRegister(markers.markers,describePlace)].map(([id,p])=>[id,Object.freeze({...p,href:'/Karten/karte.html?map='+encodeURIComponent(byId.get(id).mapId)+'&pin='+encodeURIComponent(id)})]));
