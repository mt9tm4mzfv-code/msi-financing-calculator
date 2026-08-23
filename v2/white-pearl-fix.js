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
    const netEl=document.getElementById(netId);if(netEl)netEl.textContent=money(net);

    if(typeof copyStore!=='undefined'){
      const vehicle=text(`c${n}r_vehicle`);
      const discount=text(`c${n}r_discount`);
      const total=text(`c${n}r_totaldp`);
      const financed=text(`c${n}r_financed`);
      const srp=text(`c${n}r_srp`);
      const term=text(`c${n}r_term`);
      const tr=text(`c${n}r_tr`);
      const monthly=text(`c${n}r_monthly`);
      const pct=text(`c${n}r_pct`);
      const target=text(`c${n}r_monthly`);
      const lines=[];
      if(n===1){
        lines.push(`Unit Model: ${vehicle}`);
        lines.push(`Client's Desired Down Payment: ${money(dp)}`);
      }else if(n===2){
        lines.push(`Unit Model: ${vehicle}`);
        lines.push(`Client's Desired Down Payment Percentage: ${pct}`);
        lines.push(`Client Down Payment Amount: ${money(dp)}`);
      }else{
        lines.push(`Unit Model: ${vehicle}`);
        lines.push(`Desired Monthly Amortization: ${target}`);
        lines.push(`Required Down Payment: ${money(dp)}`);
      }
      lines.push(`Official Promo DP: ${text(`c${n}r_opdp`)||money(num(`c${n}_opdp`))}`);
      lines.push(`Unit SRP: ${srp}`);
      lines.push(`Client Net Down Payment: ${money(net)}`);
      lines.push(`Client Discount: ${discount}`);
      lines.push(`Total DP Deductible to SRP: ${total}`);
      lines.push(`Amount Financed: ${financed}`);
      lines.push(`Additional Cashout for White Pearl: ${money(white)}`);
      if(n!==3)lines.push(`Estimated Monthly Amortization: ${monthly}`);
      lines.push(`Loan Term: ${term} (${num(`c${n}_term`)} Months)`);
      lines.push(`Bank Interest Rate: ${tr}`);
      lines.push('','🦾 Powered by MSI Framework™ 🚀','JUDE DANTE PINEDA');
      copyStore[n]=lines.join('\n');
    }
  }

  function install(){
    [1,2,3].forEach(n=>{
      const btn=document.querySelector(`.calculator-${n} button.primary`)||document.querySelectorAll('.calculator-card')[n-1]?.querySelector('button.primary');
      if(btn&&!btn.dataset.whitePearlGuard){
        btn.addEventListener('click',()=>setTimeout(()=>apply(n),0));
        btn.dataset.whitePearlGuard='1';
      }
      const results=document.getElementById(`c${n}_results`);
      if(results&&!results.dataset.whitePearlGuard){
        new MutationObserver(()=>{if(results.classList.contains('show'))apply(n)}).observe(results,{subtree:true,childList:true,characterData:true});
        results.dataset.whitePearlGuard='1';
      }
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  setTimeout(install,100);setTimeout(install,500);setTimeout(install,1200);
})();
