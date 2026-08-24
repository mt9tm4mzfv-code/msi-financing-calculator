// === UNIFIED CORE - FIX FOR 30-60 DIFF ===
function getBaseRevenue(S, BDP, DIR, OPDP) {
  // RB = S*(1-BDP)*(1+DIR) + OPDP - SAME SA TANAN
  return S * (1 - BDP) * (1 + DIR) + OPDP;
}

function computeMonthlyFromDP(D, S, BDP, DIR, OPDP, TR, M) {
  const RB = getBaseRevenue(S, BDP, DIR, OPDP);
  const monthly_raw = (RB - D) * (1 + TR) / ((1 + DIR) * M);
  return {
    raw: monthly_raw,
    ceiled: Math.ceil(monthly_raw) // display lang
  };
}

function computeDPFromMonthly(MT, S, BDP, DIR, OPDP, TR, M) {
  const RB = getBaseRevenue(S, BDP, DIR, OPDP);
  const D_raw = RB - MT * M * (1 + DIR) / (1 + TR);
  return {
    raw: D_raw,
    ceiled: Math.ceil(D_raw), // display - higher DP = lower monthly (customer-safe)
    proof_monthly_raw: (RB - Math.ceil(D_raw)) * (1 + DIR) / ((1 + TR) * M)
  };
}
// === END UNIFIED CORE ===

/* === MSI V2 CALCULATION FUNCTION OVERRIDES ===
   Calculation logic only. No UI markup/CSS changes.
*/
(function(){
  'use strict';

  function readNumber(id){
    const el=document.getElementById(id);
    const n=Number(String(el?.value??'').replace(/,/g,''));
    return Number.isFinite(n)?n:0;
  }

  function money(v){
    return '₱'+Math.round(v).toLocaleString('en-PH');
  }

  function set(id,value){
    const el=document.getElementById(id);
    if(el) el.textContent=value;
  }

  function applyCore(n){
    const S=readNumber(`c${n}_srp`);
    const OPDP=readNumber(`c${n}_opdp`);
    const BDP=readNumber(`c${n}_bdp`)/100;
    const DIR=readNumber(`c${n}_dir`)/100;
    const TR=readNumber(`c${n}_tr`)/100;
    const M=Number(document.getElementById(`c${n}_term`)?.value);

    if(!Number.isFinite(S)||!Number.isFinite(OPDP)||!Number.isFinite(BDP)||
       !Number.isFinite(DIR)||!Number.isFinite(TR)||!Number.isFinite(M)||M<=0) return;

    const RB=getBaseRevenue(S,BDP,DIR,OPDP);

    if(n===1){
      const D=readNumber('c1_dp');
      const result=computeMonthlyFromDP(D,S,BDP,DIR,OPDP,TR,M);
      set('c1r_monthly',money(result.ceiled));
      set('c1r_financed',money(RB-D));
      set('c1r_totaldp',money(D));
      return;
    }

    if(n===2){
      const pct=readNumber('c2_pct')/100;
      const D=OPDP+(1+DIR)*S*(pct-BDP);
      const result=computeMonthlyFromDP(D,S,BDP,DIR,OPDP,TR,M);
      set('c2r_dp',money(D));
      set('c2r_monthly',money(result.ceiled));
      set('c2r_financed',money(RB-D));
      set('c2r_totaldp',money(D));
      return;
    }

    const MT=readNumber('c3_monthly');
    const result=computeDPFromMonthly(MT,S,BDP,DIR,OPDP,TR,M);
    const D=result.ceiled;
    set('c3r_dp',money(D));
    set('c3r_financed',money(RB-D));
    set('c3r_totaldp',money(D));
  }

  function install(){
    [1,2,3].forEach(n=>{
      const name=`calculate${n}`;
      const original=window[name];
      if(typeof original!=='function' || original.__msiUnifiedCore)return;

      const wrapped=function(){
        const result=original.apply(this,arguments);
        try{applyCore(n)}catch(e){}
        return result;
      };

      wrapped.__msiUnifiedCore=true;
      window[name]=wrapped;
    });
  }

  install();
  setTimeout(install,50);
  setTimeout(install,250);
  setTimeout(install,750);
})();
