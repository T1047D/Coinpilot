// All BTC quantities are converted to integer satoshis. Cash amounts use integer cents.
const SAT=100000000, CENT=100;
const sat=n=>Math.round(Number(n)*SAT), cents=n=>Math.round(Number(n)*CENT), usd=n=>n/CENT, btc=n=>n/SAT;
export function calculateFIFO(transactions,marketPrice=0){
 const sorted=[...transactions].sort((a,b)=>new Date(a.date)-new Date(b.date)||a.createdAt-b.createdAt);
 let lots=[],sold=0,bought=0,fees=0,grossBuy=0,netSell=0,realizedCents=0;
 for(const t of sorted){const q=sat(t.quantity),priceC=cents(t.price),feeC=cents(t.fee||0);fees+=feeC;
  if(t.type==='BUY'){const totalCost=priceC*q/SAT+feeC;const cost=Math.round(totalCost);lots.push({qty:q,cost});bought+=q;grossBuy+=priceC*q/SAT+feeC;}
  else if(t.type==='SELL'){let remaining=q,costBasis=0;if(q>lots.reduce((s,l)=>s+l.qty,0))throw new Error(`Sale on ${t.date} exceeds available BTC.`);while(remaining>0){const lot=lots[0],take=Math.min(remaining,lot.qty);const allocated=Math.round(lot.cost*take/lot.qty);costBasis+=allocated;lot.qty-=take;lot.cost-=allocated;remaining-=take;if(!lot.qty)lots.shift();}const proceeds=priceC*q/SAT-feeC;realizedCents+=Math.round(proceeds)-costBasis;sold+=q;netSell+=proceeds;}
 }
 const remainingQty=lots.reduce((s,l)=>s+l.qty,0),remainingCost=lots.reduce((s,l)=>s+l.cost,0),valueC=cents(marketPrice)*remainingQty/SAT,unrealizedC=valueC-remainingCost;
 const netContributed=grossBuy-netSell, totalPNL=realizedCents+unrealizedC;
 return {bought:btc(bought),sold:btc(sold),holdings:btc(remainingQty),grossInvestment:usd(grossBuy),remainingCostBasis:usd(remainingCost),averageBuyPrice:bought?usd(grossBuy*SAT/bought):0,realizedPNL:usd(realizedCents),unrealizedPNL:usd(unrealizedC),totalPNL:usd(totalPNL),portfolioValue:usd(valueC),fees:usd(fees),netContributed:usd(netContributed),roi:netContributed?totalPNL/netContributed*100:0};
}
export const availableBTC=transactions=>{let sats=0;for(const t of [...transactions].sort((a,b)=>new Date(a.date)-new Date(b.date)||a.createdAt-b.createdAt)){sats+=(t.type==='BUY'?1:-1)*sat(t.quantity);if(sats<0)throw new Error(`Sale on ${t.date} exceeds the BTC balance available at that time.`);}return btc(sats);}
