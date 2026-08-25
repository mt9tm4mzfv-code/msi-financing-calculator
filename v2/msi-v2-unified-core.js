// === UNIFIED CORE - FIX FOR 30-60 DIFF ===
function getBaseRevenue(S, BDP, DIR, OPDP) {
  return S * (1 - BDP) * (1 + DIR) + OPDP;
}

function computeMonthlyFromDP(D, S, BDP, DIR, OPDP, TR, M) {
  const RB = getBaseRevenue(S, BDP, DIR, OPDP);
  const monthly_raw = (RB - D) * (1 + TR) / ((1 + DIR) * M);
  return { raw: monthly_raw, ceiled: Math.ceil(monthly_raw) };
}

function computeDPFromMonthly(MT, S, BDP, DIR, OPDP, TR, M) {
  const RB = getBaseRevenue(S, BDP, DIR, OPDP);
  const D_raw = RB - MT * M * (1 + DIR) / (1 + TR);
  return {
    raw: D_raw,
    ceiled: Math.ceil(D_raw),
    proof_monthly_raw: (RB - Math.ceil(D_raw)) * (1 + DIR) / ((1 + TR) * M)
  };
}

(function(){
  'use strict';

  // V62.2 SAFE PARSER: never consume the appended percentage as part of the amount.
  function safeParseFirstNumber(str){
    try{
      if(str===null||str===undefined||str==='') return 0;
      const beforeParen=String(str).split('(')[0];
      const cleaned=beforeParen.replace(/[^0-9.-]/g,'');
      const n=parseFloat(cleaned);
      return Number.isFinite(n)?n:0;
    }catch(e){console.log('Mirror fallback to V61 display',e);return 0;}
  }

  function readNumber(id){
    try{
      const el=document.getElementById(id);
      const raw=el?.value!==undefined?el.value:el?.textContent;
      return safeParseFirstNumber(raw);
    }catch(e){console.log('Mirror fallback to V61 display',e);return 0;}
  }

  function money(v){return '₱'+Math.round(Number(v)||0).toLocaleString('en-PH');}
  function set(id,value){const el=document.getElementById(id);if(el)el.textContent=value;}
  function resultNumber(id){try{const el=document.getElementById(id);const m=String(el?.textContent??el?.value??'').replace(/,/g,'').match(/-?\d+(?:\.\d+)?/);const n=m?Number(m[0]):0;return Number.isFinite(n)?n:0}catch(e){console.log('Mirror fallback to V61 display',e);return 0;}}
  function mirror(id,value,srp,decimals){try{if(srp>0){const el=document.getElementById(id);if(el)el.textContent=`${money(value)} (${(value/srp*100).toFixed(decimals)}%)`;}}catch(e){console.log('Mirror fallback to V61 display',e);}}

  // V62.3: repair ONLY the Client Net DP dark-card field after any later UI script
  // has had an opportunity to rewrite it. Source values are parsed independently.
  function repairClientNetDP(n){
    try{
      const srp=readNumber(`c${n}_srp`);
      if(!(srp>0))return;
      const desiredDP=safeParseFirstNumber(document.getElementById(`c${n}_dp`)?.value);
      const whitePearl=safeParseFirstNumber(document.getElementById(`c${n}_white`)?.value);
      const clientNet=desiredDP+whitePearl;
      const el=document.getElementById(`c${n}r_netdp`);
      if(el)el.textContent=`${money(clientNet)} (${(clientNet/srp*100).toFixed(2)}%)`;
    }catch(e){console.log('Client Net DP mirror fallback to V62.2',e);}
  }

  function repairClientNetDPDelayed(n){
    try{
      repairClientNetDP(n);
      setTimeout(()=>{try{repairClientNetDP(n)}catch(e){}},0);
      setTimeout(()=>{try{repairClientNetDP(n)}catch(e){}},50);
      setTimeout(()=>{try{repairClientNetDP(n)}catch(e){}},250);
      setTimeout(()=>{try{repairClientNetDP(n)}catch(e){}},750);
    }catch(e){console.log('Client Net DP mirror fallback to V62.2',e);}
  }

  function applyCore(n){
    const S=readNumber(`c${n}_srp`),OPDP=readNumber(`c${n}_opdp`),BDP=readNumber(`c${n}_bdp`)/100,DIR=readNumber(`c${n}_dir`)/100,TR=readNumber(`c${n}_tr`)/100,M=Number(document.getElementById(`c${n}_term`)?.value);
    if(!Number.isFinite(S)||!Number.isFinite(OPDP)||!Number.isFinite(BDP)||!Number.isFinite(DIR)||!Number.isFinite(TR)||!Number.isFinite(M)||M<=0)return;

    if(n===1){
      const D=readNumber('c1_dp'),result=computeMonthlyFromDP(D,S,BDP,DIR,OPDP,TR,M),disc=resultNumber('c1r_discount'),total=D+disc,financed=S-total,net=D+readNumber('c1_white');
      set('c1r_monthly',money(result.ceiled)); mirror('c1r_dp',D,S,2); mirror('c1r_netdp',net,S,2); mirror('c1r_discount',disc,S,2); mirror('c1r_totaldp',total,S,4); mirror('c1r_financed',financed,S,2);
      repairClientNetDPDelayed(1); return;
    }

    if(n===2){
      const pct=readNumber('c2_pct')/100,D=OPDP+(1+DIR)*S*(pct-BDP),result=computeMonthlyFromDP(D,S,BDP,DIR,OPDP,TR,M),disc=resultNumber('c2r_discount'),total=D+disc,financed=S-total,net=D+readNumber('c2_white');
      set('c2r_dp',money(D)); set('c2r_monthly',money(result.ceiled)); mirror('c2r_pct',total,S,4); mirror('c2r_dp',D,S,2); mirror('c2r_netdp',net,S,2); mirror('c2r_discount',disc,S,2); mirror('c2r_totaldp',total,S,4); mirror('c2r_financed',financed,S,2);
      repairClientNetDPDelayed(2); return;
    }

    const MT=readNumber('c3_monthly'),result=computeDPFromMonthly(MT,S,BDP,DIR,OPDP,TR,M),D=result.ceiled,disc=resultNumber('c3r_discount'),total=D+disc,financed=S-total,net=D+readNumber('c3_white');
    set('c3r_dp',money(D)); set('c3r_financed',money(financed)); set('c3r_totaldp',money(total)); mirror('c3r_dp',D,S,2); mirror('c3r_netdp',net,S,2); mirror('c3r_discount',disc,S,2); mirror('c3r_totaldp',total,S,4); mirror('c3r_financed',financed,S,2);
    repairClientNetDPDelayed(3);
  }

  // Preserve V62.2 COPY RESULT behavior.
  function patchCopyResult(){
    try{
      if(typeof window.copyResult!=='function'||window.copyResult.__msiV622)return;
      const original=window.copyResult;
      const wrapped=function(n){
        const ids=[`c${n}r_dp`,`c${n}r_discount`,`c${n}r_netdp`,`c${n}r_totaldp`,`c${n}r_financed`],saved=[];
        try{ids.forEach(id=>{const el=document.getElementById(id);if(!el)return;saved.push([el,el.textContent]);el.textContent=String(el.textContent).split('(')[0].trim();});return original.apply(this,arguments)}catch(e){console.log('COPY RESULT mirror fallback',e);try{return original.apply(this,arguments)}catch(ignore){}}finally{saved.forEach(([el,text])=>{try{el.textContent=text}catch(ignore){}})}
      };
      wrapped.__msiV622=true; window.copyResult=wrapped;
    }catch(e){console.log('COPY RESULT mirror fallback',e);}
  }

  function install(){
    [1,2,3].forEach(n=>{
      const name=`calculate${n}`,original=window[name];
      if(typeof original!=='function'||original.__msiUnifiedCore)return;
      const wrapped=function(){const result=original.apply(this,arguments);try{applyCore(n)}catch(e){console.log('Mirror fallback to V61 display',e)}try{patchCopyResult()}catch(e){console.log('COPY RESULT mirror fallback',e)}return result;};
      wrapped.__msiUnifiedCore=true;window[name]=wrapped;
    });
    patchCopyResult();
  }
  install(); setTimeout(install,50); setTimeout(install,250); setTimeout(install,750);
})();
