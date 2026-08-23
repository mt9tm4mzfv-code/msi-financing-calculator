/* MSI V2 — White Pearl Net Down Payment guard. */
(function(){
  'use strict';

  function money(v){return '₱'+Math.round(Number(v)||0).toLocaleString('en-PH')}
  function num(id){const el=document.getElementById(id);const v=Number(el?String(el.value).replace(/,/g,''):0);return Number.isFinite(v)?v:0}
  function text(id){return (document.getElementById(id)?.textContent||'').trim()}
  function apply(n){
    const dpId=`c${n}r_dp`, whiteId=`c${n}_white`, netId=`c${n}r_netdp`;
    const dpText=text(dpId);if(!dpText)return;
    const dp=Number(dpText.replace(/[^0-9.-]/g,''))||0;
    const white=num(whiteId);
    const net=dp+white;
    const netEl=document.getElementById(netId);
    if(netEl&&netEl.textContent!==money(net))netEl.textContent=money(net);

    if(typeof copyStore!=='undefined'){
      const vehicle=text(`c${n}r_vehicle`),discount=text(`c${n}r_discount`),total=text(`c${n}r_totaldp`),financed=text(`c${n}r_financed`),srp=text(`c${n}r_srp`),term=text(`c${n}r_term`),tr=text(`c${n}r_tr`),monthly=text(`c${n}r_monthly`),pct=text(`c${n}r_pct`),target=text(`c${n}r_monthly`);
      const lines=[];
      if(n===1){lines.push(`Unit Model: ${vehicle}`,`Client's Desired Down Payment: ${money(dp)}`)}
      else if(n===2){lines.push(`Unit Model: ${vehicle}`,`Client's Desired Down Payment Percentage: ${pct}`,`Client Down Payment Amount: ${money(dp)}`)}
      else{lines.push(`Unit Model: ${vehicle}`,`Desired Monthly Amortization: ${target}`,`Required Down Payment: ${money(dp)}`)}
      lines.push(`Official Promo DP: ${text(`c${n}r_opdp`)||money(num(`c${n}_opdp`))}`,`Unit SRP: ${srp}`,`Client Net Down Payment: ${money(net)}`,`Client Discount: ${discount}`,`Total DP Deductible to SRP: ${total}`,`Amount Financed: ${financed}`,`Additional Cashout for White Pearl: ${money(white)}`);
      if(n!==3)lines.push(`Estimated Monthly Amortization: ${monthly}`);
      lines.push(`Loan Term: ${term} (${num(`c${n}_term`)} Months)`,`Bank Interest Rate: ${tr}`,'','🦾 Powered by MSI Framework™ 🚀','JUDE DANTE PINEDA');
      copyStore[n]=lines.join('\n');
    }
  }

  function install(){
    [1,2,3].forEach(n=>{
      const results=document.getElementById(`c${n}_results`);
      if(!results)return;
      if(!results.dataset.whitePearlGuard){
        new MutationObserver(()=>{if(results.classList.contains('show'))apply(n)}).observe(results,{subtree:true,childList:true,characterData:true});
        results.dataset.whitePearlGuard='1';
      }
      if(results.classList.contains('show'))apply(n);
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  setTimeout(install,100);setTimeout(install,500);setTimeout(install,1200);
})();
