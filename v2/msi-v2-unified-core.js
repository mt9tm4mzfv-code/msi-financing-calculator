// === UNIFIED CORE - V62.4 SAFE MIRROR ===
function getBaseRevenue(S, BDP, DIR, OPDP) {
  return S * (1 - BDP) * (1 + DIR) + OPDP;
}
function computeMonthlyFromDP(D, S, BDP, DIR, OPDP, TR, M) {
  const RB=getBaseRevenue(S,BDP,DIR,OPDP);
  const monthly_raw=(RB-D)*(1+TR)/((1+DIR)*M);
  return {raw:monthly_raw,ceiled:Math.ceil(monthly_raw)};
}
function computeDPFromMonthly(MT,S,BDP,DIR,OPDP,TR,M) {
  const RB=getBaseRevenue(S,BDP,DIR,OPDP);
  const D_raw=RB-MT*M*(1+DIR)/(1+TR);
  return {raw:D_raw,ceiled:Math.ceil(D_raw),proof_monthly_raw:(RB-Math.ceil(D_raw))*(1+DIR)/((1+TR)*M)};
}

(function(){
  'use strict';

  // ONE parser for every numeric value. It deliberately stops before any appended percentage.
  function safeParseFirstNumber(str){
    try{
      if(str===null||str===undefined||str==='')return 0;
      const beforeParen=String(str).split('(')[0];
      const cleaned=beforeParen.replace(/[^0-9.-]/g,'');
      const n=parseFloat(cleaned);
      return Number.isFinite(n)?n:0;
    }catch(e){console.log('V62.4 safe parser fallback',e);return 0;}
  }

  function readNumber(id){
    try{
      const el=document.getElementById(id);
      return safeParseFirstNumber(el?.value!==undefined?el.value:el?.textContent);
    }catch(e){console.log('V62.4 read fallback',e);return 0;}
  }
  function money(v){return '₱'+Math.round(Number(v)||0).toLocaleString('en-PH');}
  function set(id,value){try{const el=document.getElementById(id);if(el)el.textContent=value;}catch(e){}}
  function resultNumber(id){try{const el=document.getElementById(id);return safeParseFirstNumber(el?.textContent??el?.value);}catch(e){return 0;}}

  // COPY RESULT is the single presentation source of truth for V62.4.
  function copySource(n){
    try{
      if(typeof window.simpleCopyText==='function'){
        const text=String(window.simpleCopyText(n)||'');
        if(text.trim())return text;
      }
    }catch(e){console.log('V62.4 copy-source fallback',e)}
    return '';
  }
  function copyMap(n){
    const map={};
    try{
      copySource(n).split(/\r?\n/).forEach(line=>{
        const i=line.indexOf(':');
        if(i>0)map[line.slice(0,i).trim()]=line.slice(i+1).trim();
      });
    }catch(e){}
    return map;
  }
  function firstMap(map,keys){for(const k of keys)if(map[k]!==undefined&&String(map[k]).trim()!=='')return map[k];return ''}

  function makeRow(n,key,label){
    let el=document.getElementById(`c${n}r_${key}`);
    if(el)return el.closest('.result');
    const results=document.getElementById(`c${n}_results`);
    if(!results)return null;
    const row=document.createElement('div');
    row.className='result';
    const l=document.createElement('span');
    const v=document.createElement('span');
    v.className='money';
    v.id=`c${n}r_${key}`;
    l.textContent=label;
    row.appendChild(l);row.appendChild(v);results.appendChild(row);
    return row;
  }
  function setRow(row,label,value){
    try{
      if(!row)return;
      const spans=row.querySelectorAll('span');
      if(spans[0])spans[0].textContent=label;
      if(spans[1])spans[1].textContent=value;
    }catch(e){}
  }

  function renderMirror(n){
    try{
      const results=document.getElementById(`c${n}_results`);
      if(!results)return;

      // V62.4 permanently disables the legacy presentation normalizer for this result card.
      // It is the source of the 238M corruption because it parses formatted amounts by stripping punctuation.
      results.dataset.msiNormalizing='1';

      const map=copyMap(n);
      const srp=readNumber(`c${n}_srp`);
      const white=readNumber(`c${n}_white`);
      const opdp=readNumber(`c${n}_opdp`);
      const variant=(document.getElementById(`c${n}_variant`)?.value||'Vehicle').trim()||'Vehicle';

      let desired='',unit='',color='',srpText='',promo='',whiteText='',net='',discount='',total='',financed='',monthly='',interest='',term='';
      if(n===1){
        desired=firstMap(map,['Client Desired DP Amount']);
        unit=firstMap(map,['Unit'])||variant;
        color=firstMap(map,['Color'])||(white>0?'White Pearl':'—');
        srpText=firstMap(map,['Unit SRP'])||`${money(srp)} (100%)`;
        promo=firstMap(map,['Official Promo DP'])||money(opdp);
        whiteText=firstMap(map,['Additional Cashout for White Pearl Color'])||money(white);
        net=firstMap(map,['Client Net DP (Actual Client Cashout)']);
        discount=firstMap(map,['Client Discount']);
        total=firstMap(map,['Total DP Deductible to Unit SRP']);
        financed=firstMap(map,['Amount Financed']);
        monthly=firstMap(map,['Monthly (7 Years)','Monthly (6 Years)','Monthly (5 Years)','Monthly (4 Years)','Monthly (3 Years)','Monthly (2 Years)']);
        interest=firstMap(map,['Bank Interest Rate']);
      }else if(n===2){
        desired=firstMap(map,['Client Desired DP (Percentage)']);
        unit=firstMap(map,['Unit'])||variant;color=firstMap(map,['Color'])||(white>0?'White Pearl':'—');
        srpText=firstMap(map,['Unit SRP'])||`${money(srp)} (100%)`;promo=firstMap(map,['Official Promo DP'])||money(opdp);
        whiteText=firstMap(map,['Additional Cashout for White Pearl Color'])||money(white);net=firstMap(map,['Client Net DP (Actual Client Cashout)']);discount=firstMap(map,['Client Discount']);
        total=firstMap(map,['Total DP Deductible to Unit SRP']);financed=firstMap(map,['Amount Financed']);monthly=firstMap(map,['Monthly (7 Years)','Monthly (6 Years)','Monthly (5 Years)','Monthly (4 Years)','Monthly (3 Years)','Monthly (2 Years)']);interest=firstMap(map,['Bank Interest Rate']);
      }else{
        desired=firstMap(map,['Client Desired Monthly (7 Years)','Client Desired Monthly (6 Years)','Client Desired Monthly (5 Years)','Client Desired Monthly (4 Years)','Client Desired Monthly (3 Years)','Client Desired Monthly (2 Years)']);
        unit=firstMap(map,['Unit'])||variant;color=firstMap(map,['Color'])||(white>0?'White Pearl':'—');
        srpText=firstMap(map,['Unit SRP'])||`${money(srp)} (100%)`;promo=firstMap(map,['Official Promo DP'])||money(opdp);
        const req=firstMap(map,['Client Required DP Amount']);
        whiteText=firstMap(map,['Additional Cashout for White Pearl Color'])||money(white);net=firstMap(map,['Client Net DP (Actual Client Cashout)']);discount=firstMap(map,['Client Discount']);total=firstMap(map,['Total DP Deductible to Unit SRP']);financed=firstMap(map,['Amount Financed']);monthly=firstMap(map,['Monthly (7 Years)','Monthly (6 Years)','Monthly (5 Years)','Monthly (4 Years)','Monthly (3 Years)','Monthly (2 Years)']);interest=firstMap(map,['Bank Interest Rate']);
        if(req){
          const row=makeRow(n,'dp','Client Required DP Amount');
          setRow(row,'Client Required DP Amount',req);
        }
      }

      // If the copy builder is temporarily unavailable, construct the critical values safely from existing fields.
      const desiredNum=n===1?readNumber(`c${n}_dp`):resultNumber(`c${n}r_dp`);
      if(!net)net=`${money(desiredNum+white)} (${srp>0?((desiredNum+white)/srp*100).toFixed(2):'0.00'}%)`;
      if(!discount)discount=`${money(resultNumber(`c${n}r_discount`))} (${srp>0?(resultNumber(`c${n}r_discount`)/srp*100).toFixed(2):'0.00'}%)`;
      if(!total)total=`${money(desiredNum+resultNumber(`c${n}r_discount`))} (${srp>0?((desiredNum+resultNumber(`c${n}r_discount`))/srp*100).toFixed(4):'0.0000'}%)`;
      if(!financed)financed=`${money(srp-(desiredNum+resultNumber(`c${n}r_discount`)))} (${srp>0?((srp-(desiredNum+resultNumber(`c${n}r_discount`)))/srp*100).toFixed(2):'0.00'}%)`;
      if(!desired)desired=n===2?`${srp>0?(desiredNum/srp*100).toFixed(2):'0.00'}%`:n===3?`${money(readNumber(`c${n}_monthly`))}`:`${money(desiredNum)} (${srp>0?(desiredNum/srp*100).toFixed(2):'0.00'}%)`;
      if(!monthly)monthly=money(resultNumber(`c${n}r_monthly`));
      if(!interest)interest=`${readNumber(`c${n}_tr`)}%`;

      const vehicle=makeRow(n,'vehicle','Unit');
      const dpRow=makeRow(n,'dp',n===2?'Client Desired DP (Percentage)':n===3?'Client Required DP Amount':'Client Desired DP Amount');
      const colorRow=makeRow(n,'color','Color');
      const srpRow=makeRow(n,'srp','Unit SRP');
      const promoRow=makeRow(n,'opdp','Official Promo DP');
      const whiteRow=makeRow(n,'white','Additional Cashout for White Pearl Color');
      const netRow=makeRow(n,'netdp','Client Net DP (Actual Client Cashout)');
      const discountRow=makeRow(n,'discount','Client Discount');
      const totalRow=makeRow(n,'totaldp','Total DP Deductible to Unit SRP');
      const financedRow=makeRow(n,'financed','Amount Financed');
      const monthlyRow=makeRow(n,'monthly','Monthly');
      const termRow=makeRow(n,'term','Loan Term');
      const interestRow=makeRow(n,'tr','Bank Interest Rate');

      setRow(vehicle,'Unit',unit);setRow(dpRow,n===2?'Client Desired DP (Percentage)':n===3?'Client Required DP Amount':'Client Desired DP Amount',desired);
      setRow(colorRow,'Color',color);setRow(srpRow,'Unit SRP',srpText);setRow(promoRow,'Official Promo DP',promo);setRow(whiteRow,'Additional Cashout for White Pearl Color',whiteText);
      setRow(netRow,'Client Net DP (Actual Client Cashout)',net);setRow(discountRow,'Client Discount',discount);setRow(totalRow,'Total DP Deductible to Unit SRP',total);setRow(financedRow,'Amount Financed',financed);
      const monthlyLabel=monthlyRow?.querySelector('span:first-child');if(monthlyLabel)monthlyLabel.textContent=monthly.match(/^₱/)?'Monthly':`Monthly (${term||''})`.replace(/ \(\)$/,'');
      if(monthlyRow?.querySelector('span:last-child'))monthlyRow.querySelector('span:last-child').textContent=monthly;
      setRow(termRow,'Loan Term',term||({84:'7 Years',72:'6 Years',60:'5 Years',48:'4 Years',36:'3 Years',24:'2 Years'}[Number(document.getElementById(`c${n}_term`)?.value)]||'—'));
      setRow(interestRow,'Bank Interest Rate',interest);

      const order=[dpRow,vehicle,colorRow,srpRow,promoRow,whiteRow,netRow,discountRow,totalRow,financedRow,monthlyRow,termRow,interestRow];
      order.filter(Boolean).forEach(row=>results.appendChild(row));
      const status=results.querySelector(`#c${n}_status`);const actions=results.querySelector('.actions');if(status)results.appendChild(status);if(actions)results.appendChild(actions);
    }catch(e){console.log('V62.4 mirror fallback to existing V62.3 display',e)}
  }

  // Preserve the V62.2 COPY RESULT compatibility layer.
  function patchCopyResult(){
    try{
      if(typeof window.copyResult!=='function'||window.copyResult.__msiV622)return;
      const original=window.copyResult;
      const wrapped=function(n){
        const ids=[`c${n}r_dp`,`c${n}r_discount`,`c${n}r_netdp`,`c${n}r_totaldp`,`c${n}r_financed`],saved=[];
        try{ids.forEach(id=>{const el=document.getElementById(id);if(!el)return;saved.push([el,el.textContent]);el.textContent=String(el.textContent).split('(')[0].trim();});return original.apply(this,arguments)}catch(e){console.log('COPY RESULT mirror fallback',e);try{return original.apply(this,arguments)}catch(ignore){}}finally{saved.forEach(([el,text])=>{try{el.textContent=text}catch(ignore){}})}
      };
      wrapped.__msiV622=true;window.copyResult=wrapped;
    }catch(e){console.log('COPY RESULT mirror fallback',e)}
  }

  function applyCore(n){
    try{
      const S=readNumber(`c${n}_srp`),OPDP=readNumber(`c${n}_opdp`),BDP=readNumber(`c${n}_bdp`)/100,DIR=readNumber(`c${n}_dir`)/100,TR=readNumber(`c${n}_tr`)/100,M=Number(document.getElementById(`c${n}_term`)?.value);
      if(!(S>0)||!Number.isFinite(M)||M<=0)return;
      if(n===1){const D=readNumber('c1_dp');const r=computeMonthlyFromDP(D,S,BDP,DIR,OPDP,TR,M);set('c1r_monthly',money(r.ceiled));}
      else if(n===2){const pct=readNumber('c2_pct')/100;const D=OPDP+(1+DIR)*S*(pct-BDP);const r=computeMonthlyFromDP(D,S,BDP,DIR,OPDP,TR,M);set('c2r_dp',money(D));set('c2r_monthly',money(r.ceiled));}
      else{const MT=readNumber('c3_monthly');const r=computeDPFromMonthly(MT,S,BDP,DIR,OPDP,TR,M);set('c3r_dp',money(r.ceiled));set('c3r_monthly',money(MT));}
      renderMirror(n);
    }catch(e){console.log('V62.4 calculation/display fallback',e)}
  }

  function install(){
    [1,2,3].forEach(n=>{
      const name=`calculate${n}`,original=window[name];
      if(typeof original!=='function'||original.__msiUnifiedCore)return;
      const wrapped=function(){const result=original.apply(this,arguments);try{applyCore(n)}catch(e){console.log('V62.4 mirror fallback',e)}try{patchCopyResult()}catch(e){}return result;};
      wrapped.__msiUnifiedCore=true;window[name]=wrapped;
    });
    patchCopyResult();
  }
  install();setTimeout(install,50);setTimeout(install,250);setTimeout(install,750);
})();
