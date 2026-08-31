/* MSI V2 — V62.6 PERCENTAGE PRESENTATION PATCH */
(function(){
  'use strict';
  window.__MSI_V626_PERCENTAGE_PATCH=true;

  function pct(value,srp,decimals){
    const n=Number(value)||0, s=Number(srp)||0;
    return s>0 ? (n/s*100).toFixed(decimals)+'%' : '0.00%';
  }
  function money(value){return '₱'+Math.round(Number(value)||0).toLocaleString('en-PH');}
  function read(id){
    const el=document.getElementById(id); if(!el)return 0;
    const s=String(el.value!==undefined?el.value:el.textContent).trim().split('(')[0];
    const m=s.match(/-?(?:\d[\d,]*)(?:\.\d+)?/); return m?Number(m[0].replace(/,/g,'')):0;
  }
  function render(n){
    const results=document.getElementById(`c${n}_results`); if(!results)return;
    const srp=read(`c${n}_srp`); if(!(srp>0))return;
    const authority=window.MSI_V625_MIRROR_VALUES;
    const v=typeof authority==='function'?authority(n):null;
    if(!v)return;

    const values={
      dp:`${money(v.dp)} (${pct(v.dp,srp,2)})`,
      srp:`${money(v.srp)} (100%)`,
      netdp:`${money(v.net)} (${pct(v.net,srp,2)})`,
      discount:`${money(v.discount)} (${pct(v.discount,srp,2)})`,
      totaldp:`${money(v.total)} (${pct(v.total,srp,4)})`,
      financed:`${money(v.financed)} (${pct(v.financed,srp,2)})`
    };
    Object.keys(values).forEach(key=>{
      const el=document.getElementById(`c${n}r_${key}`);
      if(el)el.textContent=values[key];
    });

    // Also repair the visible result rows, because legacy/older renderers may retain
    // the numeric-only text in a different span/node than the canonical result IDs.
    const labels={
      'Client Desired DP Amount':'dp',
      'Unit SRP':'srp',
      'Client Net DP (Actual Client Cashout)':'netdp',
      'Client Discount':'discount',
      'Total DP Deductible to Unit SRP':'totaldp',
      'Amount Financed':'financed'
    };
    results.querySelectorAll('.result').forEach(row=>{
      const spans=row.querySelectorAll('span'); if(spans.length<2)return;
      const label=spans[0].textContent.trim();
      const key=labels[label]; if(key)spans[1].textContent=values[key];
    });
  }
  window.MSI_V626_RENDER_PERCENTAGES=render;

  function repair(n){requestAnimationFrame(()=>{try{render(n)}catch(e){}})}
  function install(){
    [1,2,3].forEach(n=>{
      const name=`calculate${n}`, original=window[name];
      if(typeof original!=='function'||original.__msiV626Percentage)return;
      const wrapped=function(){
        const result=original.apply(this,arguments);
        setTimeout(()=>{try{render(n)}catch(e){}},0);
        repair(n);
        return result;
      };
      wrapped.__msiV626Percentage=true;
      window[name]=wrapped;
    });
    [1,2,3].forEach(n=>{if(document.getElementById(`c${n}_results`))render(n)});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
  setTimeout(install,50);setTimeout(install,250);setTimeout(install,750);
})();
