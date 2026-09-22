import { createDrachentanzTechnique, temporaryCondition } from './drachentanz-technique-factory.js';
import { DRACHENTANZ_FORM_IDS } from '../drachentanz-ids.js';

const variants = {
  cantref: { weapons: ['spear','polearm'], profiles: ['spear','lance','partisan','trident','halberd'],
    names: ['Geschlossene Speerwacht','Stoß an der Schaftlinie','Schritt hinter der Spitze','Durchbruch des Grenzwächters'] },
  uchelwyr: { weapons: ['sword','spear'], profiles: ['sword','lance'],
    names: ['Hut des Wappenträgers','Schnitt über die Flanke','Schritt neben dem Ross','Entschlossener Wappenhieb'] },
  arthwyr: { weapons: ['sword','axe','mace'], profiles: ['greatsword','axe','battleaxe','club','mace'],
    names: ['Geschlossene Bärenhut','Kurzer Prankenhieb','Schritt des Seebären','Brechende Bärenklaue'] }
};
export function getFoundationSupplements(classId) {
  const config = variants[classId];
  if (!config) return [];
  const specs = [
    { slug:'wacht',minimumLevel:2,costs:['reaction'],noPrimaryDamage:true,target:'Selbst',
      description:'Die Waffe deckt die eigene Mitte, bevor der nächste Gegner angreift.',effect:'+1 RK für einen eigenen Beitrag; kein Angriff.',mechanics:{armorClass:1} },
    { slug:'linie',minimumLevel:3,costs:['action'],attackBonus:1,
      description:'Ein kurzer, kontrollierter Einzelangriff nutzt die freie Waffenlinie.',effect:'Technikschaden mit +1 auf den Angriffswurf.' },
    { slug:'schritt',minimumLevel:4,costs:['bonus-action','reaction'],noPrimaryDamage:true,target:'Selbst',
      description:'Die Figur ordnet ihren Stand und hält einen Weg zur Seite offen.',effect:'+2 m Bewegungsbudget für einen eigenen Beitrag; keine freie Bewegung oder automatische Loslösung.',mechanics:{movement:2} },
    { slug:'durchbruch',minimumLevel:5,costs:['action','special-action'],
      description:'Die ganze Waffenführung bündelt sich in einem entschlossenen Einzelangriff.',effect:'Verstärkter Technikschaden aus der gemeinsamen Schadensstaffel; kein kostenloser Folgeangriff.' }
  ];
  return specs.map((spec,index)=>{
    const id=`${classId}-grund-${spec.slug}`;
    return createDrachentanzTechnique({ ...spec, slug:id,name:config.names[index],formId:DRACHENTANZ_FORM_IDS.jungdrache,
      slotBands:['foundation'],tier:'Grundform',allowedClassIds:[classId],classWeaponProfiles:{[classId]:config.profiles},weaponTypes:config.weapons,
      effects:spec.mechanics?[temporaryCondition(id,config.names[index],spec.effect,spec.mechanics,{target:'self',on:'always'})]:[] });
  });
}
