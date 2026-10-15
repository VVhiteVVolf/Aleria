import assert from 'node:assert/strict';
import test from 'node:test';
import { CHALLENGE_IMAGE_FORMATS, normalizeChallengeImageUrl, normalizeChallengeSceneImage, validateChallengeSceneImage } from '../modules/herausforderung/herausforderung-scene-image-model.js';
import { normalizeHerausforderungEvent, getHerausforderungValidationIssues } from '../modules/herausforderung/herausforderung-model.js';
import { createHerausforderungAiTemplate, createHerausforderungExport, parseHerausforderungImport } from '../modules/herausforderung/herausforderung-exchange.js';
import { renderHerausforderungComment } from '../modules/herausforderung/herausforderung-ui.js';

const draft = () => ({ title:'Die Torwache', publicDescription:'Die Wache wartet.', approaches:[{approachId:'gate',label:'Verhandeln',preferredSkills:['persuasion'],difficulty:14,insight:'Die Losung.'}] });
const image = {url:'https://i.imgur.com/example.webp',alt:'Tor und Wache',caption:'Im letzten Abendlicht.',format:'16:9',fit:'contain'};

test('ältere Herausforderungen bleiben ohne Bild und ohne leeren Bildrahmen', () => {
  assert.equal(normalizeHerausforderungEvent(draft()).sceneImage,null);
  assert.ok(!renderHerausforderungComment({herausforderung:draft()}).includes('<figure'));
  assert.equal(normalizeChallengeSceneImage({...image,url:''}),null);
});
test('alle acht Bildformate bleiben im KI-Austausch einschließlich Alttext und Zuschnitt erhalten', () => {
  for(const [format] of CHALLENGE_IMAGE_FORMATS) {
    const source={...draft(),sceneImage:{...image,format,fit:'cover'}};
    const result=parseHerausforderungImport(JSON.stringify(createHerausforderungExport(source)));
    assert.deepEqual(result.event.sceneImage,source.sceneImage);assert.deepEqual(result.issues,[]);
  }
  const ai=createHerausforderungAiTemplate();
  assert.equal(ai.challenge.sceneImage.url,'');assert.equal(ai.challenge.sceneImage.format,'original');
  assert.equal(ai.catalog.imageFormats.length,8);assert.ok(ai.instructions.syntax.sceneImage.optional.includes('Keine Bildlinks erfinden'));
});
test('gemeinsame Bildbibliothek erlaubt Weblinks und Projektpfade und normalisiert Imgur-Einzelbilder', () => {
  assert.equal(normalizeChallengeImageUrl(' https://imgur.com/AbC123 '),'https://i.imgur.com/AbC123.jpg');
  assert.equal(normalizeChallengeImageUrl('https://imgur.com/AbC123.png'),'https://i.imgur.com/AbC123.png');
  for(const url of ['https://cdn.example.org/image?id=12','../Szenen/Bild mit Leerzeichen.webp','/AleriaAlmanach/scene.png']) assert.equal(normalizeChallengeImageUrl(url),url);
});
test('ungültige Quellen und Bildobjekte werden vor Normalisierung und Import abgewiesen', () => {
  for(const url of ['javascript:alert(1)','data:image/png;base64,AAAA','blob:https://example.org/id','file:///C:/scene.png','C:\\scene.png','//example.org/image.png','/\\example.org/a.png','https://user:password@example.org/a.png','https://example.org/\na.png','https://example.org/'+ 'a'.repeat(2048)]) {
    const source={...draft(),sceneImage:{...image,url}};
    assert.equal(normalizeChallengeImageUrl(url),'');
    assert.ok(getHerausforderungValidationIssues(source).some(issue=>issue.field==='sceneImage'));
    assert.throws(()=>parseHerausforderungImport(JSON.stringify(source)),/Szenenbild/);
  }
  for(const value of [[],true,'image.png',{url:42},{...image,format:'invented'},{...image,fit:'stretch'},{...image,caption:'x'.repeat(501)}]) assert.ok(validateChallengeSceneImage(value));
});
test('öffentliches Bild und Unterschrift bleiben HTML-sicher; verdeckte Lösung erscheint nicht', () => {
  const html=renderHerausforderungComment({herausforderung:{...draft(),sceneImage:{...image,alt:'" onerror="alert(1)',caption:'<script>alert(1)</script>'}}});
  assert.ok(html.includes('data-ha-image-format="16:9"'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!html.includes('<script>'));assert.ok(!html.includes('Die Losung.'));
  assert.ok(html.includes('rel="noopener noreferrer"'));
});
