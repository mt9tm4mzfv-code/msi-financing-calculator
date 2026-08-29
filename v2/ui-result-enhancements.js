/* MSI V2 result/output enhancements + simple computation view. */
(function(){
  'use strict';

  function moneyFromText(text){
    // Result rows may contain both a peso amount and a percentage, e.g.
    // "₱177,350 (17.74%)". Extract only the first numeric token.
    const clean=String(text||'').replace(/[\u2066\u200B\u200C\u200D\uFEFF]/g,'');
    const match=clean.match(/-?\d[\d,]*(?:\.\d+)?/);
    if(!match)return 0;
    const n=Number(match[0].replace(/,/g,''));
    return Number.isFinite(n)?n:0;
  }
  function inputNumber(id){const el=document.getElementById(id);return moneyFromText(el?el.value:'')}
  function variant(n){return (document.getElementById(`c${n}_variant`)?.value||'Vehicle').trim()||'Vehicle'}
  function setResultLabel(n,oldLabel,newLabel){const results=document.getElementById(`c${n}_results`);if(!results)return;results.querySelectorAll('.result span:first-child').forEach(el=>{if(el.textContent.trim()===oldLabel)el.textContent=newLabel})}
  function addOfficialPromoRow(n){const results=document.getElementById(`c${n}_results`);if(!results)return;const rows=[...results.querySelectorAll('.msi-official-promo-row')];rows.slice(1).forEach(row=>row.remove());if(rows.length)return;const srpRow=Array.from(results.querySelectorAll('.result')).find(row=>{const label=row.querySelector('span:first-child');return label&&label.textContent.trim()==='Unit SRP'});if(!srpRow)return;const row=document.createElement('div');row.className='result msi-official-promo-row';row.innerHTML=`<span>Official Promo DP</span><span id="c${n}r_opdp" class="money">—</span>`;srpRow.insertAdjacentElement('afterend',row)}
  function updateMiddleMenu(n,dpAmount){addOfficialPromoRow(n);setResultLabel(n,"Client's Desired DP",'Client Down Payment Amount');setResultLabel(n,'Derived DP Amount','Client Down Payment Amount');setResultLabel(n,'Client Net Down Payment','Client Net Down Payment Amount');setResultLabel(n,'Additional White Cashout','Additional Cashout for White Pearl');setResultLabel(n,'TR','Bank Interest Rate');const opdp=inputNumber(`c${n}_opdp`);const opdpEl=document.getElementById(`c${n}r_opdp`);if(opdpEl)opdpEl.textContent=peso(opdp);const white=inputNumber(`c${n}_white`);const net=dpAmount+white;const netEl=document.getElementById(`c${n}r_netdp`);if(netEl)netEl.textContent=peso(net)}

  function getCommon(n){return{srp:inputNumber(`c${n}_srp`),opdp:inputNumber(`c${n}_opdp`),white:inputNumber(`c${n}_white`),bdp:inputNumber(`c${n}_bdp`),dir:inputNumber(`c${n}_dir`)}}
  function line(label,value){return `${label}: ${value}`}
  function buildDetailedCopy(n){
    const v=variant(n),x=getCommon(n);
    if(n===1){
      const dp=inputNumber('c1_dp'),discount=moneyFromText(document.getElementById('c1r_discount')?.textContent),total=moneyFromText(document.getElementById('c1r_totaldp')?.textContent),financed=moneyFromText(document.getElementById('c1r_financed')?.textContent),monthly=moneyFromText(document.getElementById('c1r_monthly')?.textContent),months=Number(document.getElementById('c1_term').value),tr=inputNumber('c1_tr');
      const term=(document.getElementById('c1r_term')?.textContent||'')+` (${months} Months)`;
      return [line('Unit Model',v),line("Client's Desired Down Payment",peso(dp)),line('Official Promo DP',peso(x.opdp)),line('Unit SRP',peso(x.srp)),line('Client Net Down Payment',peso(dp+x.white)),line('Client Discount',peso(discount)),line('Total DP Deductible to SRP',peso(total)),line('Amount Financed',peso(financed)),line('Additional Cashout for White Pearl',peso(x.white)),line('Estimated Monthly Amortization',peso(monthly)),line('Loan Term',term),line('Bank Interest Rate',tr+'%'),'','🦾 Powered by MSI Framework™ 🚀','JUDE DANTE PINEDA'].join('\n');
    }
    if(n===2){
      const pct=inputNumber('c2_pct'),dp=moneyFromText(document.getElementById('c2r_dp')?.textContent),discount=moneyFromText(document.getElementById('c2r_discount')?.textContent),total=moneyFromText(document.getElementById('c2r_totaldp')?.textContent),financed=moneyFromText(document.getElementById('c2r_financed')?.textContent),monthly=moneyFromText(document.getElementById('c2r_monthly')?.textContent),months=Number(document.getElementById('c2_term').value),tr=inputNumber('c2_tr');
      const term=(document.getElementById('c2r_term')?.textContent||'')+` (${months} Months)`;
      return [line('Unit Model',v),line("Client's Desired Down Payment Percentage",pct+'%'),line('Client Down Payment Amount',peso(dp)),line('Official Promo DP',peso(x.opdp)),line('Unit SRP',peso(x.srp)),line('Client Net Down Payment',peso(dp+x.white)),line('Client Discount',peso(discount)),line('Total DP Deductible to SRP',peso(total)),line('Amount Financed',peso(financed)),line('Additional Cashout for White Pearl',peso(x.white)),line('Estimated Monthly Amortization',peso(monthly)),line('Loan Term',term),line('Bank Interest Rate',tr+'%'),'','🦾 Powered by MSI Framework™ 🚀','JUDE DANTE PINEDA'].join('\n');
    }
    const target=moneyFromText(document.getElementById('c3r_monthly')?.textContent),dp=moneyFromText(document.getElementById('c3r_dp')?.textContent),discount=moneyFromText(document.getElementById('c3r_discount')?.textContent),total=moneyFromText(document.getElementById('c3r_totaldp')?.textContent),financed=moneyFromText(document.getElementById('c3r_financed')?.textContent),months=Number(document.getElementById('c3_term').value),tr=inputNumber('c3_tr');
    const term=(document.getElementById('c3r_term')?.textContent||'')+` (${months} Months)`;
    return [line('Unit Model',v),line('Desired Monthly Amortization',peso(target)),line('Required Down Payment',peso(dp)),line('Official Promo DP',peso(x.opdp)),line('Unit SRP',peso(x.srp)),line('Client Net Down Payment',peso(dp+x.white)),line('Client Discount',peso(discount)),line('Total DP Deductible to SRP',peso(total)),line('Amount Financed',peso(financed)),line('Additional Cashout for White Pearl',peso(x.white)),line('Loan Term',term),line('Bank Interest Rate',tr+'%'),'','🦾 Powered by MSI Framework™ 🚀','JUDE DANTE PINEDA'].join('\n');
  }

  function plainText(text){
    const s=String(text||'');
    return s.replace(/\r\n/g,'\n').replace(/\r/g,'\n');
  }
  function cleanClipboardText(text){
  return plainText(text)
    .replace(/[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g,' ')
    .replace(/[\u200B\u200C\u200D\uFEFF]/g,'');
})();
