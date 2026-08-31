/* MSI V2 — Editable Interest Rate Controller */
(function(){
  'use strict';
  const DEFAULT_RATES={84:78,72:67,60:57,48:49,36:39,24:23};
  const TERMS={84:'7 Years (84 Months)',72:'6 Years (72 Months)',60:'5 Years (60 Months)',48:'4 Years (48 Months)',36:'3 Years (36 Months)',24:'2 Years (24 Months)'};
  const ORDER=[84,72,60,48,36,24];
  window.MSI_INTEREST_RATES=Object.assign({},DEFAULT_RATES,window.MSI_INTEREST_RATES||{});
  window.MSI_GET_INTEREST_RATE=function(months){const value=Number(window.MSI_INTEREST_RATES[Number(months)]);return Number.isFinite(value)?value:DEFAULT_RATES[Number(months)];};
  const COPY_RESULT_FOOTER=window.MSI_COPY_RESULT_FOOTER||'Estimated computation only. Subject to change without prior notice.\n\n🦾 Powered by MSI Framework™ 🚀\nJUDE DANTE PINEDA';
  function withCopyFooter(lines){return lines.concat(['',COPY_RESULT_FOOTER]).join('\n')}
  function rate(months){return window.MSI_GET_INTEREST_RATE(months)}
  function read(id){const el=document.getElementById(id);const raw=String(el?.value??'').replace(/,/g,'').trim();const n=Number(raw);return Number.isFinite(n)?n:0}
  function peso(v){return '₱'+Math.round(v).toLocaleString('en-PH')}
  function variant(n){return(document.getElementById(`c${n}_variant`)?.value||'Vehicle').trim()||'Vehicle'}
  function baseRevenue(srp,opdp,bdp,dir){return srp*(1-bdp/100)*(1+dir/100)+opdp}
  function monthly(adjusted,months){return Math.ceil(adjusted*(1+rate(months)/100)/months-1e-10)}
  function syncSelected(n){const term=Number(document.getElementById(`c${n}_term`)?.value),tr=document.getElementById(`c${n}_tr`);if(tr&&TERMS[term])tr.value=rate(term)}
  function buildBanner(){
    const old=document.getElementById('msi-interest-banner');if(old)old.remove();
    const footer=document.querySelector('footer');if(!footer)return;
    if(!document.getElementById('msi-interest-controller-style')){
      const style=document.createElement('style');style.id='msi-interest-controller-style';style.textContent=`
      #msi-interest-banner{width:100%;max-width:760px;margin:8px auto 12px;padding:0;background:#fff45c;border:2px solid #4b5563;border-radius:8px;overflow:hidden;color:#111827;font-weight:900;text-align:center;box-shadow:0 3px 10px rgba(0,0,0,.12)}
      #msi-interest-banner .msi-interest-title{padding:9px 8px 7px;font-size:18px;line-height:1.2;border-bottom:2px solid #4b5563;background:#fff45c}
      #msi-interest-banner .msi-interest-row{display:grid;grid-template-columns:repeat(6,minmax(0,1fr))}
      #msi-interest-banner .msi-interest-cell{min-width:0;padding:7px 3px;border-right:2px solid #4b5563;font-size:15px;line-height:1.15}
      #msi-interest-banner .msi-interest-cell:last-child{border-right:0}
      #msi-interest-banner .msi-interest-values{background:#fffde8;border-top:2px solid #4b5563}
      #msi-interest-banner .msi-interest-input{display:block;width:100%;min-width:0;margin:0;padding:3px 1px;border:0;border-radius:0;background:transparent;color:#111827;text-align:center;font:inherit;font-size:15px;line-height:1.15;outline:none}
      #msi-interest-banner .msi-interest-input:focus{background:#fff9a8;box-shadow:inset 0 0 0 2px #111827}
      @media(max-width:600px){#msi-interest-banner{margin:8px 0 12px;border-radius:7px}#msi-interest-banner .msi-interest-title{font-size:15px;padding:7px 5px}#msi-interest-banner .msi-interest-cell{font-size:11px;padding:6px 1px}#msi-interest-banner .msi-interest-input{font-size:11px;padding:3px 0}}
      @media(max-width:360px){#msi-interest-banner .msi-interest-title{font-size:14px}#msi-interest-banner .msi-interest-cell,#msi-interest-banner .msi-interest-input{font-size:10px}}
      `;document.head.appendChild(style)
    }
    const banner=document.createElement('div');banner.id='msi-interest-banner';banner.setAttribute('role','group');banner.setAttribute('aria-label','Editable Bank Interest Rates');banner.innerHTML='<div class="msi-interest-title">Bank Interest Rate (%)</div>';
    const years=document.createElement('div');years.className='msi-interest-row';const values=document.createElement('div');values.className='msi-interest-row msi-interest-values';
    ORDER.forEach(months=>{
      const year=document.createElement('div');year.className='msi-interest-cell';year.textContent=TERMS[months].split(' (')[0];years.appendChild(year);
      const cell=document.createElement('div');cell.className='msi-interest-cell';const input=document.createElement('input');input.className='msi-interest-input';input.type='number';input.inputMode='decimal';input.min='0';input.max='100';input.step='0.01';input.value=rate(months);input.setAttribute('aria-label',`${TERMS[months]} interest rate`);input.dataset.msiInterestTerm=String(months);cell.appendChild(input);values.appendChild(cell);
      input.addEventListener('input',function(){let value=Number(this.value);if(!Number.isFinite(value))return;value=Math.max(0,Math.min(100,value));window.MSI_INTEREST_RATES[months]=value;this.value=String(value);[1,2,3].forEach(syncSelected);refreshVisibleResults()});
      input.addEventListener('blur',function(){this.value=String(rate(months))})
    });
    banner.appendChild(years);banner.appendChild(values);footer.parentNode.insertBefore(banner,footer)
  }
  function overrideLoadTR(){window.loadTR=function(n){syncSelected(n)}}
  function wrapCalculator(name,n){const original=window[name];if(typeof original!=='function'||original.__msiInterestWrapped)return;const wrapped=function(){syncSelected(n);return original.apply(this,arguments)};wrapped.__msiInterestWrapped=true;window[name]=wrapped}
  function detailedCopy(n){
    const v=variant(n),srp=read(`c${n}_srp`);let lines=[];
    if(n===1){const dp=read('c1_dp'),x={srp,opdp:read('c1_opdp'),bdp:read('c1_bdp'),dir:read('c1_dir')},rb=baseRevenue(x.srp,x.opdp,x.bdp,x.dir),adjusted=(rb-dp)/(1+x.dir/100);lines=[`Unit: ${v}`,`Desired DP: ${peso(dp)}`,`Unit SRP: ${peso(srp)}`,'','Monthly Amortization:',...ORDER.map(m=>`${TERMS[m]} ${peso(monthly(adjusted,m))}`)]}
    else if(n===2){const pct=read('c2_pct'),x={srp,opdp:read('c2_opdp'),bdp:read('c2_bdp'),dir:read('c2_dir')},dp=x.opdp+(1+x.dir/100)*x.srp*(pct/100-x.bdp/100),rb=baseRevenue(x.srp,x.opdp,x.bdp,x.dir),adjusted=(rb-dp)/(1+x.dir/100);lines=[`Unit: ${v}`,`Desired DP: ${pct.toFixed(2).replace(/\.00$/,'')}%`,`DP Amount: ${peso(dp)}`,`SRP: ${peso(srp)}`,'','Monthly Amortization:',...ORDER.map(m=>`${TERMS[m]} ${peso(monthly(adjusted,m))}`)]}
    else {const target=read('c3_monthly'),months=Number(document.getElementById('c3_term')?.value),x={srp,opdp:read('c3_opdp'),bdp:read('c3_bdp'),dir:read('c3_dir')},rb=baseRevenue(x.srp,x.opdp,x.bdp,x.dir),dp=Math.ceil(rb-target*months*(1+x.dir/100)/(1+rate(months)/100)-1e-10);lines=[`Unit Model: ${v}`,`Loan Term: ${TERMS[months]||''}`,`Target Monthly: ${peso(target)}`,`Required DP: ${peso(dp)}`,`Unit SRP: ${peso(srp)}`]}
    return withCopyFooter(lines)
  }
  function simpleText(n){
    const x={srp:read(`c${n}_srp`),opdp:read(`c${n}_opdp`),bdp:read(`c${n}_bdp`),dir:read(`c${n}_dir`)},v=variant(n);
    if(n===1){const dp=read('c1_dp'),rb=baseRevenue(x.srp,x.opdp,x.bdp,x.dir),adjusted=(rb-dp)/(1+x.dir/100);return `<div class="simple-line"><strong>Unit:</strong> ${escapeHtml(v)}</div><div class="simple-line"><strong>Desired DP:</strong> ${peso(dp)}</div><div class="simple-line"><strong>Unit SRP:</strong> ${peso(x.srp)}</div><div class="simple-heading">Monthly Amortization:</div><div class="simple-monthly">${ORDER.map(m=>`${TERMS[m]} ${peso(monthly(adjusted,m))}`).join('<br>')}</div>`}
    if(n===2){const pct=read('c2_pct'),dp=x.opdp+(1+x.dir/100)*x.srp*(pct/100-x.bdp/100),rb=baseRevenue(x.srp,x.opdp,x.bdp,x.dir),adjusted=(rb-dp)/(1+x.dir/100);return `<div class="simple-line"><strong>Unit:</strong> ${escapeHtml(v)}</div><div class="simple-line"><strong>Desired DP:</strong> ${pct.toFixed(2).replace(/\.00$/,'')}%</div><div class="simple-line"><strong>DP Amount:</strong> ${peso(dp)}</div><div class="simple-line"><strong>SRP:</strong> ${peso(x.srp)}</div><div class="simple-heading">Monthly Amortization:</div><div class="simple-monthly">${ORDER.map(m=>`${TERMS[m]} ${peso(monthly(adjusted,m))}`).join('<br>')}</div>`}
    const target=read('c3_monthly'),months=Number(document.getElementById('c3_term')?.value),x={srp:read('c3_srp'),opdp:read('c3_opdp'),bdp:read('c3_bdp'),dir:read('c3_dir')},rb=baseRevenue(x.srp,x.opdp,x.bdp,x.dir),dp=Math.ceil(rb-target*months*(1+x.dir/100)/(1+rate(months)/100)-1e-10);return `<div class="simple-line"><strong>Unit Model:</strong> ${escapeHtml(v)}</div><div class="simple-line"><strong>Loan Term:</strong> ${escapeHtml(TERMS[months]||'')}</div><div class="simple-line"><strong>Target Monthly:</strong> ${peso(target)}</div><div class="simple-line"><strong>Required DP:</strong> ${peso(dp)}</div><div class="simple-line"><strong>Unit SRP:</strong> ${peso(x.srp)}</div>`
  }
  function simpleCopyText(n){
    const x={srp:read(`c${n}_srp`),opdp:read(`c${n}_opdp`),bdp:read(`c${n}_bdp`),dir:read(`c${n}_dir`)},v=variant(n);
    if(n===1){const dp=read('c1_dp'),rb=baseRevenue(x.srp,x.opdp,x.bdp,x.dir),adjusted=(rb-dp)/(1+x.dir/100);return [`Unit: ${v}`,`Desired DP: ${peso(dp)}`,`Unit SRP: ${peso(x.srp)}`,'','Monthly Amortization:',...ORDER.map(m=>`${TERMS[m]} ${peso(monthly(adjusted,m))}`), '', COPY_RESULT_FOOTER].join('\n')}
    if(n===2){const pct=read('c2_pct'),dp=x.opdp+(1+x.dir/100)*x.srp*(pct/100-x.bdp/100),rb=baseRevenue(x.srp,x.opdp,x.bdp,x.dir),adjusted=(rb-dp)/(1+x.dir/100);return [`Unit: ${v}`,`Desired DP: ${pct.toFixed(2).replace(/\.00$/,'')}%`,`DP Amount: ${peso(dp)}`,`SRP: ${peso(x.srp)}`,'','Monthly Amortization:',...ORDER.map(m=>`${TERMS[m]} ${peso(monthly(adjusted,m))}`), '', COPY_RESULT_FOOTER].join('\n')}
    const months=Number(document.getElementById('c3_term')?.value),target=read('c3_monthly'),rb=baseRevenue(x.srp,x.opdp,x.bdp,x.dir),dp=Math.ceil(rb-target*months*(1+x.dir/100)/(1+rate(months)/100)-1e-10);return [`Unit Model: ${v}`,`Loan Term: ${TERMS[months]||''}`,`Target Monthly: ${peso(target)}`,`Required DP: ${peso(dp)}`,`Unit SRP: ${peso(x.srp)}`, '', COPY_RESULT_FOOTER].join('\n')
  }
  function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
  function renderSimple(n){const simple=document.getElementById(`c${n}_simple_results`);if(!simple||!simple.classList.contains('show'))return;const content=simple.querySelector('.simple-content');if(content)content.innerHTML=simpleText(n)}
  function refreshVisibleResults(){[1,2,3].forEach(syncSelected);[1,2,3].forEach(n=>{const results=document.getElementById(`c${n}_results`);if(results?.classList.contains('show')){const fn=window[`calculate${n}`];if(typeof fn==='function')fn()}renderSimple(n)})}
  function interceptSimpleButtons(){document.addEventListener('click',function(event){
    const button=event.target.closest('.simple-generate');
    if(button){const card=button.closest('.calculator-card'),className=card?[...card.classList].find(c=>/^calculator-[123]$/.test(c)):'',n=className?Number(className.split('-')[1]):0;if(!n)return;event.preventDefault();event.stopImmediatePropagation();const simple=document.getElementById(`c${n}_simple_results`);if(!simple)return;const content=simple.querySelector('.simple-content');if(content)content.innerHTML=simpleText(n);simple.classList.add('show');simple.scrollIntoView({behavior:'smooth',block:'nearest'});return}
    const copy=event.target.closest('.simple-copy');
    if(copy){const simple=copy.closest('.simple-results'),m=simple?.id?.match(/^c([123])_simple_results$/);if(!m)return;event.preventDefault();event.stopImmediatePropagation();window.writePlainClipboard(simpleCopyText(Number(m[1])),'Simple computation copied.')}
  },true)}
  function writeClipboard(text,msg){if(window.writePlainClipboard)return window.writePlainClipboard(text,msg);if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(text).then(()=>showToast(msg)).catch(()=>fallbackCopy(text,msg));fallbackCopy(text,msg);}
  function fallbackCopy(text,msg){const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.left='-1000px';ta.style.top='-1000px';document.body.appendChild(ta);ta.focus();ta.select();try{document.execCommand('copy');showToast(msg)}catch(e){showToast('Copy failed. Please try again.')}ta.remove()}
  function showToast(msg){const t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}
  function init(){buildBanner();overrideLoadTR();[1,2,3].forEach(syncSelected);[1,2,3].forEach(n=>wrapCalculator(`calculate${n}`,n));setTimeout(()=>[1,2,3].forEach(n=>wrapCalculator(`calculate${n}`,n)),100);setTimeout(()=>[1,2,3].forEach(n=>wrapCalculator(`calculate${n}`,n)),500);interceptSimpleButtons();window.copyResult=function(n){writeClipboard(detailedCopy(n),'Detailed computation copied.')}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
