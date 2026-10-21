import source from './kingdom.source.json' with { type:'json' };
import { familyReference,personReference } from './royal-references.mjs';

export const kingdom={...source,
  councilGroups:source.councilGroups.map(group=>({...group,members:group.members.map(member=>{
    const url=new URL(member.href,'https://aleria.local');
    const person=personReference(url.searchParams.get('family'),url.searchParams.get('person'));
    return {...member,name:person.personName,imageSrc:person.portrait,href:person.href};
  })})),
  clans:source.clans.map(clan=>{
    const document=familyReference(clan.id).document;
    return {...clan,name:document.title,imageSrc:'/Stammbäume/'+document.emblem,seat:document.houseProfile.seat,banner:'/Stammbäume/'+document.houseProfile.regionEmblems.county};
  }),
};
