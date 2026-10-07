import assert from 'node:assert/strict';
import test from 'node:test';
import { renderTradeMoney } from '../modules/trade-catalog/trade-catalog-money.js';

test('all trade prices use copper and iron coins without promoting large amounts to silver or gold', () => {
  const whole = renderTradeMoney('10.000', 'Kupfertaler');
  assert.match(whole, />10\.000<img[^>]+kupfertaler\.png/);
  assert.doesNotMatch(whole, /KT|goldtaler|silbertaler|eisenpfennig/);
  const small = renderTradeMoney('0,5');
  assert.match(small, />50<img[^>]+eisenpfennig\.png/);
  assert.doesNotMatch(small, /kupfertaler\.png/);
  const mixed = renderTradeMoney('87,5');
  assert.match(mixed, />87<img[^>]+kupfertaler\.png/);
  assert.match(mixed, />50<img[^>]+eisenpfennig\.png/);
  assert.equal(renderTradeMoney('1 KT 50 Pfennig'), renderTradeMoney('1,5'));
  assert.equal(renderTradeMoney('100', 'Pf'), renderTradeMoney('1'));
  assert.match(renderTradeMoney('0'), />0<img[^>]+kupfertaler\.png/);
});

test('ranges retain both bounds and unknown prices remain literal instead of becoming zero', () => {
  assert.match(renderTradeMoney('0,5 - 1,5', 'Kupferstueck'), /trade-money-separator/);
  for (const value of ['', 'Preis auf Anfrage', 'ab 5', '<img src=x>', '-1', 'NaN', '1,2,3']) assert.equal(renderTradeMoney(value), null);
});
