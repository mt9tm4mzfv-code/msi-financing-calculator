/* MSI V2 — DATA OUTPUT / FORMATTED INPUT COMPATIBILITY FIX
   Fixes calculations when numeric inputs are displayed with thousands separators.
   Calculation formulas are unchanged; this only normalizes numeric reads and synchronizes output fields.
*/
(function(){
  'use strict';

  function readNumber(id){
    const el=document.getElementById(id);
    const raw=String(el?.value ?? '').replace(/,/g,'').trim();
    if(raw==='' || raw==='-' || raw==='+') return 0;
    const n=Number(raw);
    return Number.isFinite(n)?n:0;
  }

  // The original calculator uses num(id). Override the reader so formatted
  // values such as "1,731,000" remain valid numeric inputs.
  window.num=function(id){ return readNumber(id); };

  function moneyText(v){
    return '₱'+Math.round(v).toLocaleString('en-PH');
  }

  function set(id,value){
    const el=document.getElementById(id);
    if(el) el.textContent=value;
  }

  function syncOutput(n){
    const variant=(document.getElementById(`c${n}_variant`)?.value||'Vehicle').trim()||'Vehicle';
    const srp=readNumber(`c${n}_srp`);
    const opdp=readNumber(`c${n}_opdp`);
    const white=readNumber(`c${n}_white`);

    set(`c${n}r_vehicle`,variant);
    set(`c${n}r_srp`,moneyText(srp));
    set(`c${n}r_white`,moneyText(white));

    if(n===1){
      const dp=readNumber('c1_dp');
      set('c1r_dp',moneyText(dp));
      set('c1r_netdp',moneyText(dp));
    }else if(n===2){
      const pct=readNumber('c2_pct');
      const dpText=document.getElementById('c2r_dp')?.textContent||'';
      const dp=Number(dpText.replace(/[^0-9.-]/g,''))||0;
      set('c2r_pct',pct.toFixed(2).replace(/\.00$/,'')+'%');
      set('c2r_dp',moneyText(dp));
      set('c2r_netdp',moneyText(dp));
    }else{
      const dpText=document.getElementById('c3r_dp')?.textContent||'';
      const dp=Number(dpText.replace(/[^0-9.-]/g,''))||0;
      const target=readNumber('c3_monthly');
      set('c3r_monthly',moneyText(target));
      set('c3r_dp',moneyText(dp));
      set('c3r_netdp',moneyText(dp));
    }

    const opdpEl=document.getElementById(`c${n}r_opdp`);
    if(opdpEl)opdpEl.textContent=moneyText(opdp);
  }

  function wrap(name,n){
    const original=window[name];
    if(typeof original!=='function' || original.__msiDataFixWrapped)return;
    const wrapped=function(){
      const result=original.apply(this,arguments);
      syncOutput(n);
      if(typeof refreshCopy==='function') refreshCopy(n);
      return result;
    };
    wrapped.__msiDataFixWrapped=true;
    window[name]=wrapped;
  }

  function init(){
    setTimeout(()=>{wrap('calculate1',1);wrap('calculate2',2);wrap('calculate3',3)},0);
    setTimeout(()=>{wrap('calculate1',1);wrap('calculate2',2);wrap('calculate3',3)},100);
    setTimeout(()=>{wrap('calculate1',1);wrap('calculate2',2);wrap('calculate3',3)},500);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
