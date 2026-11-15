import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateFIFO, availableBTC } from '../js/pnl-calculator.js';

test('FIFO: multiple buys and partial sell consume oldest lot first', () => {
  const tx = [
    {id:'b1',type:'BUY',date:'2025-01-01T00:00:00.000Z',createdAt:1,quantity:1,price:10000,fee:10},
    {id:'b2',type:'BUY',date:'2025-02-01T00:00:00.000Z',createdAt:2,quantity:1,price:20000,fee:20},
    {id:'s1',type:'SELL',date:'2025-03-01T00:00:00.000Z',createdAt:3,quantity:1.5,price:30000,fee:30}
  ];
  const m = calculateFIFO(tx, 25000);
  assert.equal(m.bought, 2);
  assert.equal(m.sold, 1.5);
  assert.equal(m.holdings, 0.5);
  assert.equal(m.remainingCostBasis, 10010);
  assert.equal(m.realizedPNL, 24950);
  assert.equal(m.unrealizedPNL, 2490);
  assert.equal(m.fees, 60);
});
test('available BTC replays buys and sells chronologically', () => {
  const tx = [
    {type:'BUY',date:'2025-01-01',createdAt:1,quantity:0.25},
    {type:'SELL',date:'2025-01-02',createdAt:2,quantity:0.1},
    {type:'BUY',date:'2025-01-03',createdAt:3,quantity:0.05}
  ];
  assert.ok(Math.abs(availableBTC(tx)-0.2)<1e-12);
});
test('FIFO rejects an oversell', () => {
  const tx = [{type:'SELL',date:'2025-01-01',createdAt:1,quantity:0.1,price:10000,fee:0}];
  assert.throws(() => calculateFIFO(tx, 10000), /exceeds available BTC/);
});
test('fees reduce buy basis and sell proceeds', () => {
  const tx = [
    {type:'BUY',date:'2025-01-01',createdAt:1,quantity:0.01,price:10000,fee:1},
    {type:'SELL',date:'2025-01-02',createdAt:2,quantity:0.01,price:11000,fee:2}
  ];
  const m = calculateFIFO(tx, 11000);
  assert.equal(m.realizedPNL, 7);
  assert.equal(m.holdings, 0);
  assert.equal(m.remainingCostBasis, 0);
});
