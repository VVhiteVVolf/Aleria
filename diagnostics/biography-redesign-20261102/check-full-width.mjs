import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openVenueBrowserPreview } from '../../AleriaAlmanach/tests/support/venue-browser-preview.mjs';
const snapshot=JSON.parse(await readFile(new URL('../../CharakterDatenbank/generated/characters.snapshot.json',import.meta.url),'utf8'));
const character=snapshot.characters.find(c=>c.name==='Gais Wyrm');
const preview=await openVenueBrowserPreview('biography-full-width-20261102');
const {page}=preview,measurements=[];
async function check(label,selector){
 await page.evaluate(()=>new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done))));
 const result=await page.locator(selector).first().evaluate(async copy=>{
  await document.fonts.ready;
  const parent=copy.parentElement,style=getComputedStyle(parent),main=copy.closest('.biography-main');
  const layoutParentContentWidth=parent.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight);
  const scale=parent.getBoundingClientRect().width/parent.offsetWidth;
  return {width:copy.getBoundingClientRect().width,layoutWidth:copy.clientWidth,parentContentWidth:layoutParentContentWidth*scale,layoutParentContentWidth,mainWidth:main.getBoundingClientRect().width,maxWidth:getComputedStyle(copy).maxWidth};
 });
 assert.equal(result.maxWidth,'none',label);
 assert.ok(Math.abs(result.width-result.parentContentWidth)<=2,`${label}: ${JSON.stringify(result)}`);
 measurements.push({label,...result});
}
try{
 await page.setViewportSize({width:1920,height:1080});
 await page.evaluate(character=>{
  openCharProfile(null);switchCharTab('biography');
  document.getElementById('cp-name').value=character.name;
  document.getElementById('cp-portrait-img').src=character.portrait;
  document.getElementById('cp-portrait-img').style.display='';
  initCharacterBiographyTab(character);
 },character);
 await check('character-wide','#cp-biography-editor .biography-main .biography-copy');
 await page.locator('#cp-biography-editor .biography-page').screenshot({path:resolve(preview.output,'character-wide.png')});
 await page.setViewportSize({width:390,height:844});
 await check('character-phone-390','#cp-biography-editor .biography-main .biography-copy');
 await page.locator('#cp-biography-editor .biography-main').scrollIntoViewIfNeeded();await preview.capture('character-phone-390');
 await page.evaluate(()=>closeCharProfile({skipUnsavedCheck:true}));
 const entry={id:'biography-width-qa',title:'Gais Wyrm',multipage:true,image:character.portrait,pages:[{biographyPage:true,...character.biography}]};
 await page.setViewportSize({width:1920,height:1080});await preview.openPage(entry,0);
 await check('module-wide','#modal-overlay .biography-main .biography-copy');
 await page.locator('#modal-overlay .biography-page').screenshot({path:resolve(preview.output,'module-wide.png')});
 await page.setViewportSize({width:390,height:844});
 await check('module-phone-390','#modal-overlay .biography-main .biography-copy');
 await page.locator('#modal-overlay .biography-main').scrollIntoViewIfNeeded();await preview.capture('module-phone-390');
 const treeHtml=await readFile(new URL('../../Stammbäume/Stammbaum.html',import.meta.url),'utf8');
 const head=treeHtml.match(/<head>([\s\S]*?)<\/head>/)[1];
 const url=preview.origin+'/Stammb%C3%A4ume/biography-width-qa.html';
 await page.route(url,route=>route.fulfill({contentType:'text/html',body:`<!doctype html><html lang="de"><head>${head}</head><body><dialog class="dialog person-biography-dialog" id="person-biography-dialog"></dialog></body></html>`}));
 await page.goto(url);
 await page.evaluate(async character=>{
  const {createPersonBiographyDialog}=await import('./assets/js/modules/person-biography/person-biography-dialog.js');
  const dialog=createPersonBiographyDialog({});
  dialog.open({id:'gais-wyrm',name:character.name,portrait:character.portrait,extensions:{biographyModule:character.biography}},{editable:false});
 },character);
 await check('tree-phone-390','#person-biography-dialog .biography-main .biography-copy');
 await page.locator('#person-biography-dialog .biography-main').scrollIntoViewIfNeeded();
 await preview.capture('tree-phone-390');
 await page.setViewportSize({width:1920,height:1080});
 await check('tree-wide','#person-biography-dialog .biography-main .biography-copy');
 await page.locator('#person-biography-dialog .biography-page').screenshot({path:resolve(preview.output,'tree-wide.png')});
 assert.deepEqual(preview.errors,[]);
 const report={passed:true,measurements,errors:preview.errors,output:preview.output,externalWritesBlocked:true};
 await writeFile(new URL('full-width-verification.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report));
}finally{await preview.close();}
