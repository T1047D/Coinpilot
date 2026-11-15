import {all} from './database.js';import {calculateFIFO} from './pnl-calculator.js';
export async function portfolio(price=0){const tx=await all('transactions');return {transactions:tx,metrics:calculateFIFO(tx,price)};}
