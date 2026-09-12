import test from 'node:test';
import assert from 'node:assert/strict';
import {readReligionCatalog,relatedEntries} from '../modules/content/content-repository.mjs';
import {ALL_SIGNS} from '../../Astrologie/modules/zodiac/zodiac-data.mjs';
import {MAGIC_DOMAIN_ASSIGNMENTS} from '../../Magie/modules/domains/magic-domain-assignments.mjs';

const catalog=readReligionCatalog();
const get=id=>catalog.entries.find(e=>e.id===id);
const lore=id=>get(id).sections.flatMap(s=>s.blocks.flatMap(b=>b.items||b.text)).join(' ');
const pairs={syressa:'rhea',nhaera:'tethyra',nymhra:'aelthar',maelach:'zephyr'};

test('the four lesser gods retain imagery and domains with the requested editorial omissions',()=>{
  for(const [id,adversary] of Object.entries(pairs)){
    const entry=get(id);
    assert(entry && entry.page && !entry.pending && !entry.recordOnly,id);
    assert.deepEqual(entry.sections.map(s=>s.id),['einfuehrung','wesenheit','aspekte','macht','domaene',...(id==='syressa'?['mythen']:[]),'kult','pakte-gunst']);
    assert(entry.sections.every(s=>s.blocks.length>0));
    assert.deepEqual(entry.sections.find(s=>s.id==='aspekte').blocks,[{type:'paragraph',text:'Folgt …'}]);
    assert.equal(entry.symbol,`assets/infernal-icons/${id}.png`);
    assert.equal(entry.portrait.src,`assets/infernal-art/${id}.png`);
    assert(MAGIC_DOMAIN_ASSIGNMENTS[id]);
    assert.equal(ALL_SIGNS.find(s=>s.shadowId===id)?.id,adversary);
    assert(relatedEntries(catalog,get(adversary)).some(e=>e.id===id));
    assert(entry.links.every(l=>!l.href.includes('/umkreise/')));
  }
});

test('approved genealogy and the essential myths remain intact',()=>{
  assert(get('syressa').facts.some(f=>f.label==='Infernaler Obergott'&&f.value==='Keiner'));
  assert.match(lore('syressa'),/celestiale Göttin der Berge und Riesen/);
  assert.match(lore('syressa'),/Morgorn/);
  assert.match(lore('syressa'),/unter die Berge/);
  assert.match(lore('syressa'),/erste Gorgone/);
  assert.match(lore('syressa'),/Schuld lag bei dem Schänder/);
  assert(get('nhaera').relations.includes('sylvana'));
  assert(!get('nhaera').relations.includes('dagon'));
  assert.match(lore('nhaera'),/Zwillingsschwester/);
  assert.match(lore('nhaera'),/Heimkehr/);
  assert(get('nymhra').relations.includes('nyxara'));
  assert(get('maelach').relations.includes('amon')&&get('maelach').relations.includes('nyxara'));
  assert.match(lore('maelach'),/Affäre/);
  assert.match(lore('maelach'),/keinen echten Wind beherrschen/);
});

test('the final appearance follows the additional image direction',()=>{
  assert.match(lore('maelach'),/roter, tieflingartiger Elf/);
  assert.match(lore('maelach'),/schelmischen Lächeln/);
  assert.match(lore('nymhra'),/blasse Vampirelfin/);
  assert.match(lore('nymhra'),/vollständig weiß, ohne Iris und Pupille/);
  assert.match(lore('nymhra'),/abgebrochenen Widderhörnern/);
  assert.match(lore('nymhra'),/außerirdisch/);
});
