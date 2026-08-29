/* MSI V2 — V62.5 NUCLEAR MIRROR AUTHORITY */
(function(){
  'use strict';
  window.__MSI_V625_AUTHORITY=true;
  const TERMS={84:'7 Years',72:'6 Years',60:'5 Years',48:'4 Years',36:'3 Years',24:'2 Years'};
  const DEFAULT_RATES={84:78,72:67,60:57,48:49,36:39,24:23};

  function safeParseFirstNumber(value){
    if(value===null||value===undefined||value==='')return 0;
    const s=String(value).trim().split('(')[0];
    const match=s.match(/-?(?:\d[\d,]*)(?:\.\d+)?/);
    if(!match)return 0;
    const n=Number(match[0].replace(/,/g,''));
    return Number.isFinite(n)?n:0;
  }
  window.MSI_SAFE_PARSE_FIRST_NUMBER=safeParseFirstNumber;
  function read(id){const el=document.getElementById(id);return safeParseFirstNumber(el?.value!==undefined?el.value:el?.textContent)}
  function money(v){return '₱'+Math.round(Number(v)||0).toLocaleString('en-PH')}
  function pct(v,d){return (Number(v)||0).toFixed(d)+'%'}
  function set(id,value){const el=document.getElementById(id);if(el)el.textContent=value}
  function rate(months){const configured=Number(window.MSI_INTEREST_RATES?.[Number(months)]);return Number.isFinite(configured)?configured:(DEFAULT_RATES[Number(months)]||0)}
  function baseRevenue(srp,opdp,bdp,dir){return srp*(1-bdp/100)*(1+dir/100)+opdp}
  function desiredDP(n,srp,opdp,bdp,dir,tr,months){
    if(n===1)return read('c1_dp');
    if(n===2)return opdp+(1+dir/100)*srp*(read('c2_pct')/100-bdp/100);
    const target=read('c3_monthly');
    return Math.ceil(baseRevenue(srp,opdp,bdp,dir)-target*months*(1+dir/100)/(1+tr/100)-1e-10)
  }
  function mirrorValues(n){
    const srp=read(`c${n}_srp`),opdp=read(`c${n}_opdp`),white=read(`c${n}_white`),bdp=read(`c${n}_bdp`),dir=read(`c${n}_dir`),months=Number(document.getElementById(`c${n}_term`)?.value)||60,tr=read(`c${n}_tr`)||rate(months);
    const dp=desiredDP(n,srp,opdp,bdp,dir,tr,months),rb=baseRevenue(srp,opdp,bdp,dir);
    const financed=Math.max(0,(rb-dp)/(1+dir/100));
    const discount=srp-dp-financed,total=dp+discount,net=dp+white,monthly=Math.ceil(financed*(1+tr/100)/months-1e-10);
    return {srp,opdp,white,bdp,dir,months,tr,dp,financed,discount,total,net,monthly}
  }
  window.MSI_V625_MIRROR_VALUES=mirrorValues;
  function variant(n){return String(document.getElementById(`c${n}_variant`)?.value||'Vehicle').trim()||'Vehicle'}
  function color(n,white){for(const id of [`c${n}_color`,`c${n}_colorway`,`c${n}_colour`,`c${n}_color_name`]){const v=String(document.getElementById(id)?.value||'').trim();if(v)return v}return white>0?'White Pearl':'—'}
  function ensureRow(n,key,label){const existing=document.getElementById(`c${n}r_${key}`);if(existing)return existing.closest('.result');const results=document.getElementById(`c${n}_results`);if(!results)return null;const row=document.createElement('div');row.className='result';const l=document.createElement('span'),v=document.createElement('span');v.className='money';v.id=`c${n}r_${key}`;l.textContent=label;row.append(l,v);results.appendChild(row);return row}
  function rowValue(row,label,value){if(!row)return;const spans=row.querySelectorAll('span');if(spans[0])spans[0].textContent=label;if(spans[1])spans[1].textContent=value}

  function render(n){
    const results=document.getElementById(`c${n}_results`);if(!results||!results.classList.contains('show'))return;
    const v=mirrorValues(n),unit=variant(n),clr=color(n,v.white),term=TERMS[v.months]||`${v.months} Months`;
    const specs=[
      ['dp','Client Desired DP Amount',`${money(v.dp)} (${pct(v.dp/v.srp*100,2)})`],
      ['vehicle','Unit',unit],['color','Color',clr],['srp','Unit SRP',`${money(v.srp)} (100%)`],['opdp','Official Promo DP',money(v.opdp)],
      ['white','Additional Cashout for White Pearl Color',money(v.white)],['netdp','Client Net DP (Actual Client Cashout)',`${money(v.net)} (${pct(v.net/v.srp*100,2)})`],
      ['discount','Client Discount',`${money(v.discount)} (${pct(v.discount/v.srp*100,2)})`],['totaldp','Total DP Deductible to Unit SRP',`${money(v.total)} (${pct(v.total/v.srp*100,4)})`],
      ['financed','Amount Financed',`${money(v.financed)} (${pct(v.financed/v.srp*100,2)})`],['monthly',`Monthly (${term})`,money(v.monthly)],['term','Loan Term',term],['tr','Bank Interest Rate',`${v.tr}%`]
    ];
    const rows=specs.map(x=>ensureRow(n,x[0],x[1]));rows.forEach((r,i)=>rowValue(r,specs[i][1],specs[i][2]));rows.filter(Boolean).forEach(r=>results.appendChild(r));
    const status=results.querySelector(`#c${n}_status`),actions=results.querySelector('.actions');if(status)results.appendChild(status);if(actions)results.appendChild(actions);
    set(`c${n}r_dp`,money(v.dp));set(`c${n}r_srp`,money(v.srp));set(`c${n}r_white`,money(v.white));set(`c${n}r_netdp`,money(v.net));set(`c${n}r_discount`,money(v.discount));set(`c${n}r_totaldp`,money(v.total));set(`c${n}r_financed`,money(v.financed));set(`c${n}r_monthly`,money(v.monthly));set(`c${n}r_term`,term);set(`c${n}r_tr`,`${v.tr}%`);
  }
  window.MSI_V625_RENDER=render;

  function buildCopy(n){
    const v=mirrorValues(n),unit=variant(n),clr=color(n,v.white),term=TERMS[v.months]||`${v.months} Months`;
    return [
      `Client Desired DP Amount: ${money(v.dp)} (${pct(v.dp/v.srp*100,2)})`,`Unit: ${unit}`,`Color: ${clr}`,`Unit SRP: ${money(v.srp)} (100%)`,`Official Promo DP: ${money(v.opdp)}`,
      `Additional Cashout for White Pearl Color: ${money(v.white)}`,`Client Net DP (Actual Client Cashout): ${money(v.net)} (${pct(v.net/v.srp*100,2)})`,`Client Discount: ${money(v.discount)} (${pct(v.discount/v.srp*100,2)})`,
      `Total DP Deductible to Unit SRP: ${money(v.total)} (${pct(v.total/v.srp*100,4)})`,`Amount Financed: ${money(v.financed)} (${pct(v.financed/v.srp*100,2)})`,`Monthly (${term}): ${money(v.monthly)}`,`Bank Interest Rate: ${v.tr}%`
    ].join('\n')
  }
  window.MSI_V625_COPY=buildCopy;
  // Detailed COPY RESULT is intentionally not owned here.
  // ui-result-enhancements.js is the single authority for detailed clipboard output.


  function installCalculatorWrappers(){[1,2,3].forEach(n=>{const name=`calculate${n}`,original=window[name];if(typeof original!=='function'||original.__msiV625Authority)return;const wrapped=function(){const result=original.apply(this,arguments);try{render(n)}catch(e){}startNuclearRepair(n);return result};wrapped.__msiV625Authority=true;window[name]=wrapped})}
  function startNuclearRepair(n){let attempts=0;const timer=setInterval(()=>{attempts++;try{render(n)}catch(e){}if(attempts>=50)clearInterval(timer)},100)}
  function install(){installCalculatorWrappers();[1,2,3].forEach(n=>{if(document.getElementById(`c${n}_results`)?.classList.contains('show'))render(n)})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  setTimeout(install,50);setTimeout(install,250);setTimeout(install,750);
})();
