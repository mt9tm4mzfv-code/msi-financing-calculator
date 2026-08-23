/* MSI V2 — output presentation repair. UI/output formatting only. */
(function(){
  'use strict';

  function moneyFromText(text){
    const n=Number(String(text??'').replace(/,/g,'').replace(/[^0-9.-]/g,''));
    return Number.isFinite(n)?n:0;
  }
  function inputNumber(id){
    const el=document.getElementById(id);
    return moneyFromText(el?.value);
  }
  function pesoLocal(v){return '₱'+Math.round(v).toLocaleString('en-PH')}

  function rowByLabel(results,label){
    return [...results.querySelectorAll('.result')].find(row=>row.querySelector('span:first-child')?.textContent.trim()===label);
  }
  function ensurePromoRow(n,results){
    let row=results.querySelector('.msi-official-promo-row');
    if(!row){
      row=document.createElement('div');
      row.className='result msi-official-promo-row';
      row.innerHTML=`<span>Official Promo DP</span><span id="c${n}r_opdp" class="money">—</span>`;
    }
    row.querySelector('span:first-child').textContent='Official Promo DP';
    const value=row.querySelector('.money');
    if(value)value.textContent=pesoLocal(inputNumber(`c${n}_opdp`));
    return row;
  }

  function normalize(n){
    const results=document.getElementById(`c${n}_results`);
    if(!results)return;

    /*
      IMPORTANT: Do not format/reorder a result panel until the underlying
      calculator has actually produced a result. The base calculator shows
      the result container before validation, so an invalid input can leave
      the original rows as "—" while this presentation layer was previously
      injecting Official Promo DP / Net DP values. That created a misleading
      partial result. This is presentation-only protection; no computation
      formula or validation rule is changed.
    */
    const vehicleValue=results.querySelector(`#c${n}r_vehicle`)?.textContent.trim()||'';
    if(!vehicleValue || vehicleValue==='—')return;

    const find=(labels)=>{
      for(const label of labels){
        const row=rowByLabel(results,label);
        if(row)return row;
      }
      return null;
    };

    const vehicle=find(['Vehicle','Unit Model']);
    const desired=find(n===1?["Client's Desired DP","Client Down Payment Amount"]:n===2?["Desired DP %","Client's Desired Down Payment Percentage"]:['Target Monthly','Desired Monthly Amortization']);
    const dp=n===2?find(['Derived DP Amount','Client Down Payment Amount']):find(n===1?["Client's Desired DP","Client Down Payment Amount"]:['Required DP','Required Down Payment']);
    const srp=find(['Unit SRP']);
    const white=find(['Additional White Cashout','Additional Cashout for White Pearl']);
    const net=find(['Client Net Down Payment','Client Net Down Payment Amount']);
    const discount=find(['Client Discount']);
    const total=find(['Total DP Deductible to SRP']);
    const financed=find(['Amount Financed']);
    const monthly=find(['Estimated Monthly Amortization']);
    const term=find(['Loan Term']);
    const interest=find(['TR','Bank Interest Rate']);
    const promo=ensurePromoRow(n,results);

    if(vehicle)vehicle.querySelector('span:first-child').textContent='Unit Model';
    if(n===1 && desired)desired.querySelector('span:first-child').textContent="Client's Desired Down Payment";
    if(n===2 && desired)desired.querySelector('span:first-child').textContent="Client's Desired Down Payment Percentage";
    if(n===3 && desired)desired.querySelector('span:first-child').textContent='Desired Monthly Amortization';
    if(n===2 && dp)dp.querySelector('span:first-child').textContent='Client Down Payment Amount';
    if(n===3 && dp)dp.querySelector('span:first-child').textContent='Required Down Payment';
    if(net)net.querySelector('span:first-child').textContent='Client Net Down Payment';
    if(white)white.querySelector('span:first-child').textContent='Additional Cashout for White Pearl';
    if(interest)interest.querySelector('span:first-child').textContent='Bank Interest Rate';

    const dpValue=dp?.querySelector('.money') ? moneyFromText(dp.querySelector('.money').textContent) : 0;
    const whiteValue=inputNumber(`c${n}_white`);
    if(net?.querySelector('.money'))net.querySelector('.money').textContent=pesoLocal(dpValue+whiteValue);

    const ordered=n===1
      ? [vehicle,desired,promo,srp,net,discount,total,financed,white,monthly,term,interest]
      : n===2
      ? [vehicle,desired,dp,promo,srp,net,discount,total,financed,white,monthly,term,interest]
      : [vehicle,desired,dp,promo,srp,net,discount,total,financed,white,term,interest];

    ordered.filter(Boolean).forEach(row=>results.appendChild(row));

    const signature=ordered.filter(Boolean).map(row=>row.querySelector('.money')?.textContent||'').join('|')+'|'+inputNumber(`c${n}_white`)+'|'+inputNumber(`c${n}_opdp`);
    if(results.dataset.msiPresentationSignature!==signature){
      results.dataset.msiPresentationSignature=signature;
      if(typeof copyStore!=='undefined'){
        const v=(document.getElementById(`c${n}_variant`)?.value||'Vehicle').trim()||'Vehicle';
        const opdp=inputNumber(`c${n}_opdp`),srp=inputNumber(`c${n}_srp`),white=inputNumber(`c${n}_white`),tr=inputNumber(`c${n}_tr`);
        const dpNow=dp?.querySelector('.money')?moneyFromText(dp.querySelector('.money').textContent):0;
        const discountNow=discount?.querySelector('.money')?moneyFromText(discount.querySelector('.money').textContent):0;
        const totalNow=total?.querySelector('.money')?moneyFromText(total.querySelector('.money').textContent):0;
        const financedNow=financed?.querySelector('.money')?moneyFromText(financed.querySelector('.money').textContent):0;
        const monthlyNow=monthly?.querySelector('.money')?moneyFromText(monthly.querySelector('.money').textContent):0;
        const termText=term?.querySelector('.money')?.textContent||'';
        let lines=[];
        if(n===1){
          const desiredNow=inputNumber('c1_dp');
          lines=[`Unit Model: ${v}`,`Client's Desired Down Payment: ${pesoLocal(desiredNow)}`,`Official Promo DP: ${pesoLocal(opdp)}`,`Unit SRP: ${pesoLocal(srp)}`,`Client Net Down Payment: ${pesoLocal(desiredNow+white)}`,`Client Discount: ${pesoLocal(discountNow)}`,`Total DP Deductible to SRP: ${pesoLocal(totalNow)}`,`Amount Financed: ${pesoLocal(financedNow)}`,`Additional Cashout for White Pearl: ${pesoLocal(white)}`,`Estimated Monthly Amortization: ${pesoLocal(monthlyNow)}`,`Loan Term: ${termText} (${inputNumber('c1_term')} Months)`,`Bank Interest Rate: ${tr}%`];
        }else if(n===2){
          const pct=inputNumber('c2_pct');
          lines=[`Unit Model: ${v}`,`Client's Desired Down Payment Percentage: ${pct}%`,`Client Down Payment Amount: ${pesoLocal(dpNow)}`,`Official Promo DP: ${pesoLocal(opdp)}`,`Unit SRP: ${pesoLocal(srp)}`,`Client Net Down Payment: ${pesoLocal(dpNow+white)}`,`Client Discount: ${pesoLocal(discountNow)}`,`Total DP Deductible to SRP: ${pesoLocal(totalNow)}`,`Amount Financed: ${pesoLocal(financedNow)}`,`Additional Cashout for White Pearl: ${pesoLocal(white)}`,`Estimated Monthly Amortization: ${pesoLocal(monthlyNow)}`,`Loan Term: ${termText} (${inputNumber('c2_term')} Months)`,`Bank Interest Rate: ${tr}%`];
        }else{
          const target=inputNumber('c3_monthly');
          lines=[`Unit Model: ${v}`,`Desired Monthly Amortization: ${pesoLocal(target)}`,`Required Down Payment: ${pesoLocal(dpNow)}`,`Official Promo DP: ${pesoLocal(opdp)}`,`Unit SRP: ${pesoLocal(srp)}`,`Client Net Down Payment: ${pesoLocal(dpNow+white)}`,`Client Discount: ${pesoLocal(discountNow)}`,`Total DP Deductible to SRP: ${pesoLocal(totalNow)}`,`Amount Financed: ${pesoLocal(financedNow)}`,`Additional Cashout for White Pearl: ${pesoLocal(white)}`,`Loan Term: ${termText} (${inputNumber('c3_term')} Months)`,`Bank Interest Rate: ${tr}%`];
        }
        copyStore[n]=lines.join('\n')+'\n\n🦾 Powered by MSI Framework™ 🚀\nJUDE DANTE PINEDA';
      }
    }
  }

  function schedule(n){requestAnimationFrame(()=>normalize(n));}
  function init(){
    [1,2,3].forEach(n=>{
      const results=document.getElementById(`c${n}_results`);
      if(!results)return;
      const observer=new MutationObserver(()=>schedule(n));
      observer.observe(results,{childList:true,subtree:true,characterData:true});
      schedule(n);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();