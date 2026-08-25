// === UNIFIED CORE - V62.5 AUTHORITATIVE CALCULATION ===
(function(){
  'use strict';

  function safeParseFirstNumber(value){
    if(value===null||value===undefined||value==='')return 0;
    const s=String(value).trim().split('(')[0];
    const match=s.match(/-?(?:\d[\d,]*)(?:\.\d+)?/);
    if(!match)return 0;
    const n=Number(match[0].replace(/,/g,''));
    return Number.isFinite(n)?n:0;
  }
  window.MSI_SAFE_PARSE_FIRST_NUMBER=safeParseFirstNumber;

  function read(id){
    const el=document.getElementById(id);
    return safeParseFirstNumber(el?.value!==undefined?el.value:el?.textContent);
  }
  function money(v){return '₱'+Math.round(Number(v)||0).toLocaleString('en-PH');}
  function set(id,value){const el=document.getElementById(id);if(el)el.textContent=value;}

  function baseRevenue(srp,opdp,bdp,dir){
    return srp*(1-bdp/100)*(1+dir/100)+opdp;
  }
  function calculateMirror(n){
    const srp=read(`c${n}_srp`);
    const opdp=read(`c${n}_opdp`);
    const bdp=read(`c${n}_bdp`);
    const dir=read(`c${n}_dir`);
    const months=Number(document.getElementById(`c${n}_term`)?.value)||60;
    const tr=read(`c${n}_tr`);
    if(!(srp>0)||months<=0)return null;

    const rb=baseRevenue(srp,opdp,bdp,dir);
    let dp;
    if(n===1){
      dp=read('c1_dp');
    }else if(n===2){
      dp=opdp+(1+dir/100)*srp*(read('c2_pct')/100-bdp/100);
    }else{
      const target=read('c3_monthly');
      dp=Math.ceil(rb-target*months*(1+dir/100)/(1+tr/100)-1e-10);
    }

    // Authoritative accounting:
    // Amount Financed = adjusted principal.
    // Client Discount = SRP - Desired DP - Amount Financed.
    // Total DP Deductible = Desired DP + Client Discount.
    // Client Net DP = Desired DP + White Pearl cashout.
    const financed=Math.max(0,(rb-dp)/(1+dir/100));
    const discount=srp-dp-financed;
    const total=dp+discount;
    const white=read(`c${n}_white`);
    const net=dp+white;
    const monthly=Math.ceil(financed*(1+tr/100)/months-1e-10);

    return {srp,opdp,bdp,dir,months,tr,dp,financed,discount,total,white,net,monthly};
  }

  window.MSI_V625_CALCULATE_MIRROR=calculateMirror;

  function sync(n){
    const v=calculateMirror(n);
    if(!v)return;
    set(`c${n}r_dp`,money(v.dp));
    set(`c${n}r_srp`,money(v.srp));
    set(`c${n}r_white`,money(v.white));
    set(`c${n}r_netdp`,money(v.net));
    set(`c${n}r_discount`,money(v.discount));
    set(`c${n}r_totaldp`,money(v.total));
    set(`c${n}r_financed`,money(v.financed));
    set(`c${n}r_monthly`,money(v.monthly));
    set(`c${n}r_term`,({84:'7 Years',72:'6 Years',60:'5 Years',48:'4 Years',36:'3 Years',24:'2 Years'})[v.months]||`${v.months} Months`);
    set(`c${n}r_tr`,`${v.tr}%`);
  }
  window.MSI_V625_SYNC=sync;

  // V62.8 BDP-ONLY RESTORE: Promo DP Percentage (%) was present in the
  // template/authority but is hidden or absent in the live deployment.
  // Restore only c1_bdp / c2_bdp / c3_bdp; do not modify TR inputs.
  function ensureBDPInputs(){
    [1,2,3].forEach(n=>{
      const prefix=`c${n}`;
      const dir=document.getElementById(`${prefix}_dir`);
      if(!dir)return;

      let bdp=document.getElementById(`${prefix}_bdp`);
      if(!bdp){
        const wrap=document.createElement('div');
        const label=document.createElement('label');
        label.htmlFor=`${prefix}_bdp`;
        label.textContent='Promo DP Percentage (%)';
        bdp=document.createElement('input');
        bdp.id=`${prefix}_bdp`;
        bdp.type='number';
        bdp.step='0.01';
        bdp.min='15';
        bdp.max='60';
        bdp.value='20';
        wrap.append(label,bdp);
        dir.parentNode.insertBefore(wrap,dir);
      }

      const label=document.querySelector(`label[for="${prefix}_bdp"]`);
      const holder=bdp.parentElement;
      if(holder)holder.style.removeProperty('display');
      if(label){label.textContent='Promo DP Percentage (%)';label.style.removeProperty('display');label.removeAttribute('aria-hidden');}
      bdp.removeAttribute('aria-hidden');
      bdp.tabIndex=0;
      bdp.type='number';
      bdp.step='0.01';
      bdp.min='15';
      bdp.max='60';
      if(bdp.value===''||bdp.value===null)bdp.value='20';

      if(!bdp.dataset.msiV628BDPValidation){
        const validate=()=>{
          const value=Number(bdp.value);
          bdp.setCustomValidity(Number.isFinite(value)&&value>=15&&value<=60?'':'Promo DP Percentage must be between 15% and 60%.');
        };
        bdp.addEventListener('input',validate);
        bdp.addEventListener('change',validate);
        bdp.dataset.msiV628BDPValidation='1';
        validate();
      }
    });
  }

  function install(){
    ensureBDPInputs();
    [1,2,3].forEach(n=>{
      const name=`calculate${n}`;
      const original=window[name];
      if(typeof original!=='function'||original.__msiV625Core)return;
      const wrapped=function(){
        const result=original.apply(this,arguments);
        try{sync(n)}catch(e){console.log('V62.5 core sync fallback',e)}
        return result;
      };
      wrapped.__msiV625Core=true;
      window[name]=wrapped;
    });
  }

  install();
  setTimeout(install,50);
  setTimeout(install,250);
  setTimeout(install,750);
})();
