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
  const COPY_RESULT_FOOTER='Estimated computation only. Subject to change without prior notice.\n\n🦾 Powered by MSI Framework™ 🚀\nJUDE DANTE PINEDA';
  window.MSI_COPY_RESULT_FOOTER=COPY_RESULT_FOOTER;
  function buildDetailedCopy(n){
    const v=variant(n),x=getCommon(n);
    const pct=(amount,decimals=2)=>{
      const srp=Number(x.srp)||0;
      return srp>0?((Number(amount)||0)/srp*100).toFixed(decimals):Number(0).toFixed(decimals);
    };
    const termName=(n,months)=>{
      const raw=(document.getElementById(`c${n}r_term`)?.textContent||'').trim();
      return raw||({84:'7 Years',72:'6 Years',60:'5 Years',48:'4 Years',36:'3 Years',24:'2 Years'}[months]||`${months} Months`);
    };
    if(n===1){
      const dp=inputNumber('c1_dp');
      const discount=moneyFromText(document.getElementById('c1r_discount')?.textContent);
      const total=moneyFromText(document.getElementById('c1r_totaldp')?.textContent);
      const financed=moneyFromText(document.getElementById('c1r_financed')?.textContent);
      const monthly=moneyFromText(document.getElementById('c1r_monthly')?.textContent);
      const months=Number(document.getElementById('c1_term').value);
      const tr=inputNumber('c1_tr'),term=termName(1,months),net=dp+x.white;
      return [
        line('Client Desired DP Amount',`${peso(dp)} (${pct(dp)}%)`),
        line('Unit',v),
        line('Color','White Pearl'),
        line('Unit SRP',`${peso(x.srp)} (100%)`),
        line('Official Promo DP',peso(x.opdp)),
        line('Additional Cashout for White Pearl Color',peso(x.white)),
        line('Client Net DP (Actual Client Cashout)',`${peso(net)} (${pct(net)}%)`),
        line('Client Discount',`${peso(discount)} (${pct(discount)}%)`),
        line('Total DP Deductible to Unit SRP',`${peso(total)} (${pct(total,4)}%)`),
        line('Amount Financed',`${peso(financed)} (${pct(financed)}%)`),
        line(`Monthly (${term})`,peso(monthly)),
        line('Bank Interest Rate',tr+'%'),
        '',
        COPY_RESULT_FOOTER
      ].join('\n');
    }
    if(n===2){
      const dp=moneyFromText(document.getElementById('c2r_dp')?.textContent);
      const discount=moneyFromText(document.getElementById('c2r_discount')?.textContent);
      const total=moneyFromText(document.getElementById('c2r_totaldp')?.textContent);
      const financed=moneyFromText(document.getElementById('c2r_financed')?.textContent);
      const monthly=moneyFromText(document.getElementById('c2r_monthly')?.textContent);
      const months=Number(document.getElementById('c2_term').value);
      const tr=inputNumber('c2_tr'),term=termName(2,months),net=dp+x.white;
      return [
        line('Client Desired DP (Percentage)',pct(total,4)+'%'),
        line('Unit',v),
        line('Color','White Pearl'),
        line('Unit SRP',`${peso(x.srp)} (100%)`),
        line('Official Promo DP',peso(x.opdp)),
        line('Additional Cashout for White Pearl Color',peso(x.white)),
        line('Client Net DP (Actual Client Cashout)',`${peso(net)} (${pct(net)}%)`),
        line('Client Discount',`${peso(discount)} (${pct(discount)}%)`),
        line('Total DP Deductible to Unit SRP',`${peso(total)} (${pct(total,4)}%)`),
        line('Amount Financed',`${peso(financed)} (${pct(financed)}%)`),
        line(`Monthly (${term})`,peso(monthly)),
        line('Bank Interest Rate',tr+'%'),
        '',
        COPY_RESULT_FOOTER
      ].join('\n');
    }
    const target=moneyFromText(document.getElementById('c3r_monthly')?.textContent);
    const dp=moneyFromText(document.getElementById('c3r_dp')?.textContent);
    const discount=moneyFromText(document.getElementById('c3r_discount')?.textContent);
    const total=moneyFromText(document.getElementById('c3r_totaldp')?.textContent);
    const financed=moneyFromText(document.getElementById('c3r_financed')?.textContent);
    const months=Number(document.getElementById('c3_term').value);
    const tr=inputNumber('c3_tr'),term=termName(3,months),net=dp+x.white;
    return [
      line(`Client Desired Monthly (${term})`,peso(target)),
      line('Unit',v),
      line('Color','White Pearl'),
      line('Unit SRP',`${peso(x.srp)} (100%)`),
      line('Official Promo DP',peso(x.opdp)),
      line('Client Required DP Amount',`${peso(dp)} (${pct(dp)}%)`),
      line('Additional Cashout for White Pearl Color',peso(x.white)),
      line('Client Net DP (Actual Client Cashout)',`${peso(net)} (${pct(net)}%)`),
      line('Client Discount',`${peso(discount)} (${pct(discount)}%)`),
      line('Total DP Deductible to Unit SRP',`${peso(total)} (${pct(total,4)}%)`),
      line('Amount Financed',`${peso(financed)} (${pct(financed)}%)`),
      line(`Monthly (${term})`,peso(target)),
      line('Bank Interest Rate',tr+'%'),
      '',
      COPY_RESULT_FOOTER
    ].join('\n');
  }

  function plainText(text){
    const s=String(text||'');
    return s.replace(/\r\n/g,'\n').replace(/\r/g,'\n');
  }
  function cleanClipboardText(text){
    return plainText(text)
      .replace(/[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g,' ')
      .replace(/[\u200B\u200C\u200D\uFEFF]/g,'');
  }
  async function writePlainClipboard(text,msg){
    const clean=cleanClipboardText(text);
    /* ClipboardItem path disabled for V62.21; use writeText + textarea fallback only. */
    try{if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(clean);showToast(msg);return true}}catch(e){}
    const ta=document.createElement('textarea');ta.value=clean;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.top='-1000px';ta.style.left='-1000px';ta.style.opacity='0';ta.style.fontSize='16px';document.body.appendChild(ta);ta.focus();ta.select();ta.setSelectionRange(0,ta.value.length);let copied=false;try{copied=document.execCommand('copy')}catch(e){}ta.remove();if(copied){showToast(msg);return true}showToast('Copy failed. Please try again.');return false;
  }
  function refreshCopy(n){if(typeof copyStore==='undefined')return;copyStore[n]=buildDetailedCopy(n)}

  const SIMPLE_TERMS=[84,72,60,48,36,24];
  const SIMPLE_NAMES={84:'7 Years (84 Months)',72:'6 Years (72 Months)',60:'5 Years (60 Months)',48:'4 Years (48 Months)',36:'3 Years (36 Months)',24:'2 Years (24 Months)'};
  const SIMPLE_TR={84:78,72:68,60:57,48:49,36:42,24:23};
  function calcMonthly(adjusted,months){
    const liveRate = window.MSI_GET_INTEREST_RATE? window.MSI_GET_INTEREST_RATE(months) : (window.MSI_INTEREST_RATES?.[months]?? SIMPLE_TR[months]);
    return Math.ceil(
      adjusted*(1+liveRate/100)/months-1e-10
    )
  }
  function baseRevenueLocal(srp,opdp,bdp,dir){return srp*(1-bdp/100)*(1+dir/100)+opdp}
  function validSimple(x){if(x.srp<=0)return'Enter a valid Unit SRP.';if(x.opdp<0||x.opdp>=x.srp)return'Official Promo DP must be ≥ 0 and below SRP.';if(x.bdp<0||x.bdp>=100)return'BDP % must be between 0% and 100%.';if(x.dir<=-100)return'DIR % must be greater than -100%.';return''}
  function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
  function purgeLegacySimpleViews(){
    document.querySelectorAll('.msi-simple-results,.msi-simple-result,.legacy-simple-results').forEach(el=>el.remove());
    [1,2,3].forEach(n=>{
      const all=[...document.querySelectorAll(`#c${n}_simple_results`)];
      all.slice(1).forEach(el=>el.remove());
    });
  }
  function ensureSimpleView(n){const detailed=document.getElementById(`c${n}_results`);if(!detailed||document.getElementById(`c${n}_simple_results`))return;const simple=document.createElement('div');simple.id=`c${n}_simple_results`;simple.className=`results simple-results calculator-${n}-simple`;simple.innerHTML=`<div class="simple-content"></div><div class="actions simple-actions"><button class="secondary simple-copy" type="button">COPY RESULT</button><button class="secondary simple-reset" type="button">RESET</button></div>`;detailed.insertAdjacentElement('afterend',simple);{
      const copyBtn=simple.querySelector('.simple-copy');
      copyBtn.dataset.msiCopyOwner='simple';
      copyBtn.onclick=function(event){
        event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
        return window.MSI_COPY_SIMPLE(n);
      };
    }simple.querySelector('.simple-reset').addEventListener('click',()=>resetSimple(n))}
  function simpleText(n){const x=getCommon(n),v=variant(n);if(n===1){const dp=inputNumber('c1_dp'),err=validSimple(x);if(err||dp<=x.opdp||dp>=x.srp)return err||'The desired DP must be above Official Promo DP and below SRP.';const rb=baseRevenueLocal(x.srp,x.opdp,x.bdp,x.dir),adjusted=(rb-dp)/(1+x.dir/100),rows=SIMPLE_TERMS.map(m=>`${SIMPLE_NAMES[m]} ${peso(calcMonthly(adjusted,m))}`).join('<br>');return `<div class="simple-line"><strong>Unit:</strong> ${escapeHtml(v)}</div><div class="simple-line"><strong>Desired DP:</strong> ${peso(dp)}</div><div class="simple-line"><strong>Unit SRP:</strong> ${peso(x.srp)}</div><div class="simple-heading">Monthly Amortization:</div><div class="simple-monthly">${rows}</div>`}if(n===2){const pct=inputNumber('c2_pct'),err=validSimple(x);if(err||pct<=x.bdp||pct>=100)return err||'The desired DP percentage must be above BDP % and below 100%.';const dp=x.opdp+(1+x.dir/100)*x.srp*(pct/100-x.bdp/100);if(dp<=x.opdp||dp>=x.srp)return'The calculated DP must be above Official Promo DP and below SRP.';const rb=baseRevenueLocal(x.srp,x.opdp,x.bdp,x.dir),adjusted=(rb-dp)/(1+x.dir/100),rows=SIMPLE_TERMS.map(m=>`${SIMPLE_NAMES[m]} ${peso(calcMonthly(adjusted,m))}`).join('<br>');return `<div class="simple-line"><strong>Unit:</strong> ${escapeHtml(v)}</div><div class="simple-line"><strong>Desired DP:</strong> ${pct.toFixed(2).replace(/\.00$/,'')}%</div><div class="simple-line"><strong>DP Amount:</strong> ${peso(dp)}</div><div class="simple-line"><strong>SRP:</strong> ${peso(x.srp)}</div><div class="simple-heading">Monthly Amortization:</div><div class="simple-monthly">${rows}</div>`}const target=inputNumber('c3_monthly'),months=Number(document.getElementById('c3_term').value),tr=inputNumber('c3_tr'),err=validSimple(x);if(err||target<=0)return err||'Enter a valid desired monthly amortization.';const rb=baseRevenueLocal(x.srp,x.opdp,x.bdp,x.dir),dp=Math.ceil(rb-target*months*(1+x.dir/100)/(1+tr/100)-1e-10),term=(document.getElementById('c3_term')?.selectedOptions?.[0]?.textContent||'')+` (${months} Months)`;return `<div class="simple-line"><strong>Unit Model:</strong> ${escapeHtml(v)}</div><div class="simple-line"><strong>Loan Term:</strong> ${escapeHtml(term)}</div><div class="simple-line"><strong>Target Monthly:</strong> ${peso(target)}</div><div class="simple-line"><strong>Required DP:</strong> ${peso(dp)}</div><div class="simple-line"><strong>Unit SRP:</strong> ${peso(x.srp)}</div>`}
  function simpleCopyText(n){const x=getCommon(n),v=variant(n);if(n===1){const dp=inputNumber('c1_dp'),rb=baseRevenueLocal(x.srp,x.opdp,x.bdp,x.dir),adjusted=(rb-dp)/(1+x.dir/100);return `Unit: ${v}\nDesired DP: ${peso(dp)}\nUnit SRP: ${peso(x.srp)}\n\nMonthly Amortization:\n${SIMPLE_TERMS.map(m=>`${SIMPLE_NAMES[m]} ${peso(calcMonthly(adjusted,m))}`).join('\n')}\n\n${COPY_RESULT_FOOTER}`}if(n===2){const pct=inputNumber('c2_pct'),dp=x.opdp+(1+x.dir/100)*x.srp*(pct/100-x.bdp/100),rb=baseRevenueLocal(x.srp,x.opdp,x.bdp,x.dir),adjusted=(rb-dp)/(1+x.dir/100);return `Unit: ${v}\nDesired DP: ${pct.toFixed(2).replace(/\.00$/,'')}%\nDP Amount: ${peso(dp)}\nSRP: ${peso(x.srp)}\n\nMonthly Amortization:\n${SIMPLE_TERMS.map(m=>`${SIMPLE_NAMES[m]} ${peso(calcMonthly(adjusted,m))}`).join('\n')}\n\n${COPY_RESULT_FOOTER}`}const months=Number(document.getElementById('c3_term').value),target=inputNumber('c3_monthly'),tr=inputNumber('c3_tr'),rb=baseRevenueLocal(x.srp,x.opdp,x.bdp,x.dir),dp=Math.ceil(rb-target*months*(1+x.dir/100)/(1+tr/100)-1e-10),term=(document.getElementById('c3_term')?.selectedOptions?.[0]?.textContent||'')+` (${months} Months)`;return `Unit Model: ${v}\nLoan Term: ${term}\nTarget Monthly: ${peso(target)}\nRequired DP: ${peso(dp)}\nUnit SRP: ${peso(x.srp)}\n\n${COPY_RESULT_FOOTER}`}
  window.writePlainClipboard=writePlainClipboard;
  async function copySimple(n){
    const text=simpleCopyText(n);
    return writePlainClipboard(text,'Simple computation copied.');
  }
  window.MSI_COPY_SIMPLE=function(n){return copySimple(Number(n));}
  function showToast(msg){const t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}
  function resetSimple(n){const el=document.getElementById(`c${n}_simple_results`);if(el)el.classList.remove('show')}
  function generateSimple(n){purgeLegacySimpleViews();ensureSimpleView(n);const simple=document.getElementById(`c${n}_simple_results`),content=simple.querySelector('.simple-content'),html=simpleText(n);if(!html||!html.includes('simple-line')){content.innerHTML=`<div class="simple-error">${escapeHtml(html||'Unable to generate simple computation.')}</div>`;simple.classList.add('show');return}content.innerHTML=html;simple.classList.add('show');simple.scrollIntoView({behavior:'smooth',block:'nearest'})}
  function addSimpleButtons(){document.querySelectorAll('.calculator-card').forEach((card,i)=>{const n=i+1;if(n>3)return;const primary=card.querySelector('button.primary');if(!primary||primary.dataset.msiSimpleReady==='1')return;primary.textContent='CLICK TO GENERATE DETAILED COMPUTATION';primary.setAttribute('aria-label','Click to generate detailed computation');const simple=document.createElement('button');simple.type='button';simple.className='primary simple-generate';simple.textContent='CLICK TO GENERATE SIMPLE COMPUTATION';simple.setAttribute('aria-label','Click to generate simple computation');simple.addEventListener('click',()=>generateSimple(n));primary.insertAdjacentElement('afterend',simple);primary.dataset.msiSimpleReady='1';ensureSimpleView(n)})}
  function wrapCalculators(){if(typeof calculate1==='function'&&!calculate1.__msiResultWrapped){const original=calculate1,wrapped=function(){normalizeNumericInputs(1);original();formatNumericInputs(1);const dp=inputNumber('c1_dp');updateMiddleMenu(1,dp);refreshCopy(1)};wrapped.__msiResultWrapped=true;window.calculate1=wrapped}if(typeof calculate2==='function'&&!calculate2.__msiResultWrapped){const original=calculate2,wrapped=function(){normalizeNumericInputs(2);original();formatNumericInputs(2);const dp=moneyFromText(document.getElementById('c2r_dp')?.textContent);updateMiddleMenu(2,dp);refreshCopy(2)};wrapped.__msiResultWrapped=true;window.calculate2=wrapped}if(typeof calculate3==='function'&&!calculate3.__msiResultWrapped){const original=calculate3,wrapped=function(){normalizeNumericInputs(3);original();formatNumericInputs(3);const dp=moneyFromText(document.getElementById('c3r_dp')?.textContent);updateMiddleMenu(3,dp);refreshCopy(3)};wrapped.__msiResultWrapped=true;window.calculate3=wrapped}}
  function normalizeNumericInputs(n){document.querySelectorAll(`.calculator-${n} input.numeric-input`).forEach(input=>{input.value=String(input.value||'').replace(/,/g,'')})}
  function formatNumericInputs(n){document.querySelectorAll(`.calculator-${n} input.numeric-input`).forEach(input=>{const raw=String(input.value||'').replace(/,/g,'').trim();if(raw===''||raw==='-'||raw==='.')return;const match=raw.match(/^(-?)(\d*)(\.\d*)?$/);if(!match)return;const sign=match[1]||'',integer=match[2]||'0',decimal=match[3]||'';input.value=sign+integer.replace(/^0+(?=\d)/,'').replace(/\B(?=(\d{3})+(?!\d))/g,',')+decimal})}
  function wrapCopyResult(){window.copyResult=function(n){if(typeof copyStore==='undefined')return;const text=buildDetailedCopy(n);copyStore[n]=text;writePlainClipboard(text,'Detailed computation copied.')}}
  function init(){purgeLegacySimpleViews();wrapCalculators();addSimpleButtons();wrapCopyResult();[1,2,3].forEach(n=>{addOfficialPromoRow(n);setResultLabel(n,"Client's Desired DP",'Client Down Payment Amount');setResultLabel(n,'Derived DP Amount','Client Down Payment Amount');setResultLabel(n,'Client Net Down Payment','Client Net Down Payment Amount');setResultLabel(n,'Additional White Cashout','Additional Cashout for White Pearl');setResultLabel(n,'TR','Bank Interest Rate')});setTimeout(()=>{purgeLegacySimpleViews();wrapCalculators();addSimpleButtons();wrapCopyResult()},50);setTimeout(()=>{purgeLegacySimpleViews();wrapCalculators();addSimpleButtons();wrapCopyResult()},500)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
